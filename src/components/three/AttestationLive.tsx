"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

import { AttestationReadout } from "./AttestationReadout";
import type { AttestationReadoutValues } from "./attestation/types";
import { APPROACH_ROOT_MARGIN, FRAME_ASPECT_RATIO, IDLE_TIMEOUT_MS } from "./constants";
import {
  canRunScene,
  isForcedColorsActive,
  isReducedMotionPreferred,
  whenIdle,
} from "./runtime/capability";
import { reportSceneFailure } from "./runtime/report";

/**
 * The client boundary for the attestation figure.
 *
 * Everything it renders is server-rendered HTML: the figure, the framed poster,
 * the readout and the caption. The WebGL scene is not a child at all — it is
 * imported and mounted imperatively, behind seven gates, so the 3D contributes
 * nothing to First Load JS and nothing loads before the visitor approaches it.
 */

export interface AttestationLiveProps {
  /** The server-rendered poster, which is also the fallback for all four cases. */
  readonly poster: ReactNode;
  /** Readout values from the committed seed, replaced by live ones if they arrive. */
  readonly fallbackReadout: AttestationReadoutValues;
  /** The honesty caption. Server-rendered prose. */
  readonly caption: ReactNode;
}

const FIGURE_STYLE: CSSProperties = {
  margin: 0,
  width: "100%",
};

const FRAME_STYLE: CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: FRAME_ASPECT_RATIO,
  overflow: "hidden",
  borderRadius: "var(--radius-lg, 16px)",
  // docs/04 §3.6: a boundary that identifies a region takes the interactive token.
  border: "1px solid var(--color-border-interactive)",
};

const CAPTION_STYLE: CSSProperties = {
  marginBlockStart: "var(--rhythm-title, 1rem)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--rhythm-meta, 0.5rem)",
};

export function AttestationLive({
  poster,
  fallbackReadout,
  caption,
}: AttestationLiveProps): ReactElement {
  const frameRef = useRef<HTMLDivElement>(null);
  const [readout, setReadout] = useState<AttestationReadoutValues>(fallbackReadout);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    // GATE 1 — reduced motion. First, so these visitors download 0 KB of it.
    if (isReducedMotionPreferred()) return;
    // GATE 2 — forced colours. Beside reduced motion, and for the same reason:
    // the poster is the surface the system palette can actually re-colour, and
    // a WebGL canvas is not. Also 0 KB.
    if (isForcedColorsActive()) return;
    // GATES 3-5 — Save-Data / 2g, device floor, WebGL2 probe.
    if (!canRunScene()) return;

    let handle: { dispose: () => void } | null = null;
    let cancelIdle: (() => void) | null = null;
    let isCancelled = false;

    const load = async (): Promise<void> => {
      try {
        const { mountLattice } = await import("./runtime/mount");
        if (isCancelled) return;
        handle = mountLattice({
          frame,
          onAttestation: (attestation) => {
            if (isCancelled) return;
            setReadout({
              alg: attestation.alg,
              short: attestation.short,
              ms: attestation.ms,
            });
          },
          onUnavailable: () => {
            // Unmount the dead canvas; the poster underneath becomes the
            // permanent visual again.
            handle?.dispose();
            handle = null;
          },
        });
      } catch (cause) {
        // The chunk failed to load. The poster is already on screen.
        reportSceneFailure("the scene chunk could not be loaded", cause);
      }
    };

    // GATE 6 — approach. The figure sits at screenful 3; nothing downloads
    // until the visitor is within one rootMargin of it.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        // GATE 7 — idle, so the import never competes with LCP.
        cancelIdle = whenIdle(() => void load(), IDLE_TIMEOUT_MS);
      },
      { rootMargin: APPROACH_ROOT_MARGIN, threshold: 0 },
    );
    observer.observe(frame);

    return () => {
      isCancelled = true;
      observer.disconnect();
      cancelIdle?.();
      handle?.dispose();
      handle = null;
    };
  }, []);

  return (
    <figure style={FIGURE_STYLE}>
      <div ref={frameRef} style={FRAME_STYLE}>
        {poster}
      </div>
      <figcaption style={CAPTION_STYLE}>
        <AttestationReadout alg={readout.alg} short={readout.short} ms={readout.ms} />
        {caption}
      </figcaption>
    </figure>
  );
}
