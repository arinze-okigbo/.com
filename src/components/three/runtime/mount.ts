import { createAttestation } from "../attestation/crypto";
import type { Attestation } from "../attestation/types";
import { reportSceneFailure } from "./report";
import { createScrollTracker } from "./scroll";
import { createScene, type SceneHandle } from "./scene";
import type { ContrastReport } from "../field/contrast";

/**
 * The entry point of the deferred chunk — the only module that reaches `ogl`
 * and WebCrypto.
 *
 * It mounts imperatively rather than as a React component. docs/02 §8.2
 * specifies `next/dynamic` with `ssr: false`; a bare `import()` was measured to
 * be strictly cheaper here (it keeps `next/dynamic`'s loadable runtime out of
 * the shared chunk, and React out of the deferred one) while satisfying the
 * same constraint more completely — this module is never evaluated on the
 * server at all, not merely skipped during SSR.
 */

export interface LatticeMountOptions {
  /** The fixed, full-viewport host the canvas fills. */
  readonly host: HTMLElement;
  /** The section Acts II and III scrub against, e.g. `#attestation`. */
  readonly anchorSelector?: string;
  /** Receives the live attestation so the HUD can print real values. */
  readonly onAttestation: (attestation: Attestation, points: number) => void;
  /** Called when the scene cannot start, or the GPU drops the context. */
  readonly onUnavailable: () => void;
  /** Called once the first frame is on screen, to cross-fade the poster out. */
  readonly onFirstFrame: () => void;
}

export interface LatticeMountHandle {
  /** Tears down the GPU resources and removes the canvas. Idempotent. */
  readonly dispose: () => void;
}

const CANVAS_CSS = [
  "display:block",
  "width:100%",
  "height:100%",
  "opacity:0",
  // Compositor-only, so the swap from poster to canvas contributes no layout shift.
  "transition:opacity var(--duration-reveal, 280ms) var(--ease-entrance, cubic-bezier(0, 0, 0.2, 1))",
].join(";");

/** Marks the server-rendered poster inside the host, so it can be cross-faded. */
const POSTER_SELECTOR = "[data-attestation-poster]";

/**
 * Creates the canvas synchronously and starts the attestation asynchronously,
 * so the returned handle can always tear down cleanly regardless of timing.
 */
export function mountField(options: LatticeMountOptions): LatticeMountHandle {
  const { host, anchorSelector, onAttestation, onUnavailable, onFirstFrame } = options;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = CANVAS_CSS;
  canvas.tabIndex = -1;
  // The poster carries the accessible name. The canvas is a decorative
  // duplicate of it, hidden from assistive tech and unreachable by keyboard.
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const poster = host.querySelector<HTMLElement>(POSTER_SELECTOR);
  const scroll = createScrollTracker({ anchorSelector });

  let scene: SceneHandle | null = null;
  let isDisposed = false;

  const fail = (stage: string, cause?: unknown): void => {
    if (isDisposed) return;
    if (cause !== undefined) reportSceneFailure(stage, cause);
    onUnavailable();
  };

  const start = async (): Promise<void> => {
    let attestation: Attestation;
    try {
      attestation = await createAttestation();
    } catch (cause) {
      // Without real signature bytes there is nothing to seed. The poster,
      // which never left the DOM, stays.
      fail("the attestation could not be produced", cause);
      return;
    }
    if (isDisposed) return;

    try {
      scene = createScene({
        canvas,
        host,
        signature: attestation.signature,
        anchorSelector,
        readProgress: () => scroll.read(),
        onFirstFrame: (points) => {
          onAttestation(attestation, points);
          canvas.style.opacity = "1";
          // Cross-fade, not a hide: the poster stays in the DOM and comes back
          // if the context is ever lost.
          if (poster) poster.style.opacity = "0";
          onFirstFrame();
        },
        onContextLost: () => fail("the WebGL context was lost"),
      });
    } catch (cause) {
      fail("the scene could not be initialised", cause);
      return;
    }

    if (isDisposed) {
      scene.dispose();
      scene = null;
      return;
    }

    exposeContrastProbe(scene);
  };

  void start();

  return {
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      scene?.dispose();
      scene = null;
      scroll.dispose();
      canvas.remove();
      if (poster) poster.style.opacity = "";
      removeContrastProbe();
    },
  };
}

/**
 * The A8.4 harness handle.
 *
 * Development builds only — `process.env.NODE_ENV` is inlined by the bundler,
 * so this whole block is dead code eliminated from production and costs zero
 * shipped bytes. `readPixels` never runs in the production render loop, which
 * `docs/15` names as a performance blower; this is an on-demand probe used by
 * `tests/e2e/field-contrast.spec.ts` and by hand while art-directing.
 */
interface FieldProbeWindow extends Window {
  __fieldContrast?: () => Promise<ContrastReport>;
  __fieldScrimDrops?: () => string;
}

function exposeContrastProbe(scene: SceneHandle): void {
  if (process.env.NODE_ENV === "production") return;
  const probeWindow = window as FieldProbeWindow;
  probeWindow.__fieldContrast = () => scene.measureContrast();
  probeWindow.__fieldScrimDrops = () => scene.sampleScrimDrops();
}

function removeContrastProbe(): void {
  if (process.env.NODE_ENV === "production") return;
  const probeWindow = window as FieldProbeWindow;
  delete probeWindow.__fieldContrast;
  delete probeWindow.__fieldScrimDrops;
}
