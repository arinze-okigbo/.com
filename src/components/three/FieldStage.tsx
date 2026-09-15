"use client";

import { useEffect, useRef, type CSSProperties, type ReactElement, type ReactNode } from "react";

import { APPROACH_ROOT_MARGIN, IDLE_TIMEOUT_MS } from "./constants";
import { createBleedMask } from "./field/bleed";
import { isFieldScopeDeclared } from "./field/palette";
import {
  canRunScene,
  isForcedColorsActive,
  isReducedMotionPreferred,
  watchReducedMotion,
  whenIdle,
} from "./runtime/capability";
import { reportSceneFailure } from "./runtime/report";
import { patchFieldHud } from "./field/hud-patch";

/**
 * The client boundary for the attestation field.
 *
 * Everything it renders is server-rendered HTML: the fixed host and the poster
 * inside it. The WebGL scene is not a child at all — it is imported and mounted
 * imperatively, behind eight gates, so the 3D contributes nothing to First Load
 * JS and nothing loads before the visitor is anywhere near it.
 *
 * Renamed from `AttestationLive.tsx`. `FRAME_STYLE` — the 16/9 aspect box, the
 * radius, the border, the 768px constraint — is gone: the field is the page's
 * ground now, not a figure inside a section (docs/15 §2.2, A8.5).
 */

export interface FieldStageProps {
  /** The server-rendered poster, which is also the fallback for every gate. */
  readonly poster: ReactNode;
  /** The section Acts II and III scrub against. */
  readonly anchorSelector?: string;
}

/**
 * The host fills `.field-backdrop` — the fixed, isolated, `aria-hidden`,
 * `pointer-events: none` stacking context `globals.css` §8b establishes and
 * `layout.tsx` mounts this inside. It is `absolute`, not `fixed`, precisely so
 * that backdrop stays the one element that owns the field's position and
 * z-index; two fixed layers fighting over `--z-field` is how a stacking order
 * stops being reviewable.
 */
const HOST_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  // A8.2: the stage is dark in both themes, and it is opaque. The canvas is an
  // opaque surface too — additive blending over a transparent canvas on a light
  // page turns to white paste.
  //
  // `--field-stage-ground` rather than `--field-ink` directly, so the poster's
  // own forced-colours rule can neutralise the host's ground at the same time
  // as its own: an author-dark ground under a forced palette is exactly what
  // `forced-colors` exists to remove.
  background: "var(--field-stage-ground, var(--field-ink, #0a0908))",
  overflow: "hidden",
  // No `size` containment: this element takes its size from `inset: 0`.
  contain: "layout paint style",
};

export function FieldStage({ poster, anchorSelector }: FieldStageProps): ReactElement {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // GATE 0 — the field token group. Until `globals.css` carries docs/04 §3.7
    // and the `.stage` scope that re-declares the foreground tokens from
    // `--field-fg*`, a dark full-bleed stage behind a light-mode page would put
    // `#1A1A1A` body copy on `#0A0908`: 1.14:1, worse than the failure this
    // work exists to correct. Declining is the only safe reading.
    if (!isFieldScopeDeclared()) return;

    // A8.2's light-mode sectioning, and it belongs HERE rather than in the
    // scene, because it is a DOM measurement and not a GL feature.
    //
    // It used to live in `runtime/scene.ts`, which meant it only ran when the
    // composite ran. That left light mode broken in every JS-on path where the
    // field is gated out — reduced motion, forced colours, no WebGL, Save-Data,
    // a device below the floor — because `.stage` unconditionally forces
    // `--field-fg` `#EDE9E1` and, with nothing painting the stage ground
    // beneath it, that is `#EDE9E1` on `#FDFDFC`: **1.07:1**. Reduced motion
    // plus light mode is not a rare configuration, and it is precisely the
    // combination the poster exists to serve.
    //
    // Running it above every other gate means the poster is sectioned
    // correctly in every path that has script at all, whether or not a single
    // WebGL call is ever made.
    const bleed = createBleedMask(host);
    let bleedFrame = 0;
    const scheduleBleed = (): void => {
      if (bleedFrame !== 0) return;
      bleedFrame = window.requestAnimationFrame(() => {
        bleedFrame = 0;
        bleed.update();
      });
    };
    // The mask only changes when the stage rects move, so scroll and resize are
    // the complete set of triggers — no polling, and no loop of its own.
    bleed.update();
    window.addEventListener("scroll", scheduleBleed, { passive: true });
    window.addEventListener("resize", scheduleBleed, { passive: true });
    const disposeBleed = (): void => {
      window.removeEventListener("scroll", scheduleBleed);
      window.removeEventListener("resize", scheduleBleed);
      if (bleedFrame !== 0) window.cancelAnimationFrame(bleedFrame);
      bleedFrame = 0;
      bleed.dispose();
    };

    // GATE 1 — reduced motion. First, so these visitors download 0 KB of it.
    if (isReducedMotionPreferred()) return disposeBleed;
    // GATE 2 — forced colours. Beside reduced motion, and for the same reason:
    // the poster is the surface the system palette can actually re-colour, and
    // a WebGL canvas is not. Also 0 KB.
    if (isForcedColorsActive()) return disposeBleed;
    // GATES 3-5 — Save-Data / 2g, device floor, WebGL2 probe.
    if (!canRunScene()) return disposeBleed;

    let handle: { dispose: () => void } | null = null;
    let cancelIdle: (() => void) | null = null;
    let isCancelled = false;

    const load = async (): Promise<void> => {
      try {
        const { mountField } = await import("./runtime/mount");
        if (isCancelled) return;
        handle = mountField({
          host,
          anchorSelector,
          onAttestation: (attestation, points) => {
            if (isCancelled) return;
            // Patched imperatively into the server-rendered HUD — no React
            // state, no re-render, zero additional client JS.
            patchFieldHud(attestation, points);
          },
          onFirstFrame: () => {
            host.dataset.fieldLive = "true";
            document.documentElement.dataset.fieldLive = "true";
          },
          onUnavailable: () => {
            // Unmount the dead canvas; the poster underneath becomes the
            // permanent visual again.
            handle?.dispose();
            handle = null;
            delete host.dataset.fieldLive;
            delete document.documentElement.dataset.fieldLive;
          },
        });
      } catch (cause) {
        // The chunk failed to load. The poster is already on screen.
        reportSceneFailure("the scene chunk could not be loaded", cause);
      }
    };

    // GATE 6 — approach. Nothing downloads until the visitor is within one
    // rootMargin of the stage.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        // GATE 7 — idle, so the import never competes with LCP.
        cancelIdle = whenIdle(() => void load(), IDLE_TIMEOUT_MS);
      },
      { rootMargin: APPROACH_ROOT_MARGIN, threshold: 0 },
    );
    observer.observe(host);

    // GATE 8 — the preference turned on after mount. Dispose and fall back to
    // the poster rather than keep a running context a visitor has asked against.
    const unwatchReducedMotion = watchReducedMotion(() => {
      observer.disconnect();
      cancelIdle?.();
      cancelIdle = null;
      isCancelled = true;
      handle?.dispose();
      handle = null;
      delete host.dataset.fieldLive;
      delete document.documentElement.dataset.fieldLive;
    });

    return () => {
      isCancelled = true;
      observer.disconnect();
      cancelIdle?.();
      unwatchReducedMotion();
      handle?.dispose();
      handle = null;
      delete document.documentElement.dataset.fieldLive;
      disposeBleed();
    };
  }, [anchorSelector]);

  return (
    <div ref={hostRef} style={HOST_STYLE} data-attestation-field="">
      {poster}
    </div>
  );
}
