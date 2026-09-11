import { createAttestation } from "../attestation/crypto";
import type { Attestation } from "../attestation/types";
import { reportSceneFailure } from "./report";
import { createScene, type SceneHandle } from "./scene";

/**
 * The entry point of the deferred chunk — the only module that reaches `ogl`
 * and WebCrypto.
 *
 * It mounts imperatively rather than as a React component. docs/02 §8.2
 * specifies `next/dynamic` with `ssr: false`; a bare `import()` was measured to
 * be strictly cheaper here (it keeps `next/dynamic`'s loadable runtime out of
 * the shared chunk, and React out of the deferred one) while satisfying the same
 * constraint more completely — this module is never evaluated on the server at
 * all, not merely skipped during SSR.
 */

export interface LatticeMountOptions {
  /** The framed, aspect-locked box the canvas fills. Also the scroll target. */
  readonly frame: HTMLElement;
  /** Receives the live attestation so the readout can print real values. */
  readonly onAttestation: (attestation: Attestation) => void;
  /** Called when the scene cannot start, or the GPU drops the context. */
  readonly onUnavailable: () => void;
}

export interface LatticeMountHandle {
  /** Tears down the GPU resources and removes the canvas. Idempotent. */
  readonly dispose: () => void;
}

const HOST_CSS = "position:absolute;inset:0";

/** Marks the server-rendered poster inside the frame, so it can be cross-faded. */
const POSTER_SELECTOR = "[data-attestation-poster]";

const CANVAS_CSS = [
  "display:block",
  "width:100%",
  "height:100%",
  "opacity:0",
  // Compositor-only, so the swap from poster to canvas contributes no layout shift.
  "transition:opacity var(--duration-reveal, 280ms) var(--ease-entrance, cubic-bezier(0, 0, 0.2, 1))",
].join(";");

/**
 * Creates the canvas synchronously and starts the attestation asynchronously,
 * so the returned handle can always tear down cleanly regardless of timing.
 */
export function mountLattice(options: LatticeMountOptions): LatticeMountHandle {
  const { frame, onAttestation, onUnavailable } = options;

  const host = document.createElement("div");
  host.style.cssText = HOST_CSS;
  // The poster carries the accessible name. The canvas is a decorative
  // duplicate of it, hidden from assistive tech and unreachable by keyboard.
  host.setAttribute("aria-hidden", "true");

  const canvas = document.createElement("canvas");
  canvas.style.cssText = CANVAS_CSS;
  canvas.tabIndex = -1;

  host.appendChild(canvas);
  frame.appendChild(host);

  const poster = frame.querySelector<HTMLElement>(POSTER_SELECTOR);

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

    onAttestation(attestation);

    try {
      scene = createScene({
        canvas,
        host,
        signature: attestation.signature,
        onFirstFrame: () => {
          canvas.style.opacity = "1";
          // Cross-fade, not a hide: the poster stays in the DOM and comes back
          // if the context is ever lost.
          if (poster) poster.style.opacity = "0";
        },
        onContextLost: () => fail("the WebGL context was lost"),
      });
    } catch (cause) {
      fail("the scene could not be initialised", cause);
      return;
    }
    if (isDisposed) scene.dispose();
  };

  void start();

  return {
    dispose: () => {
      if (isDisposed) return;
      isDisposed = true;
      scene?.dispose();
      scene = null;
      host.remove();
      if (poster) poster.style.opacity = "";
    },
  };
}
