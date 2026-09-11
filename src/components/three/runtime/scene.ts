import { Camera, Geometry, Mesh, Program, Renderer } from "ogl";

import { CAMERA_DISTANCE, CAMERA_FOV_DEGREES, DPR_MAX, POINT_SIZE } from "../constants";
import { buildLattice, resolveGrid } from "../lattice/seed";
import { LATTICE_FRAGMENT, LATTICE_VERTEX } from "../lattice/shaders";
import { readFigureColor, watchFigureColor, type Rgb } from "./color";
import { createScrollProgress } from "./scroll";

/**
 * The imperative half of the attestation lattice: one instanced geometry, one
 * program, one draw call, and a render loop that stops dead whenever the canvas
 * is not on screen.
 *
 * This module owns every GPU resource it creates and releases all of them in
 * {@link SceneHandle.dispose}.
 */

export interface SceneOptions {
  readonly canvas: HTMLCanvasElement;
  /** The sized box the canvas fills. Drives resize and scroll progress. */
  readonly host: HTMLElement;
  /** The signature bytes that seed the geometry. */
  readonly signature: Uint8Array;
  /** Called once, after the first frame has actually been drawn. */
  readonly onFirstFrame: () => void;
  /** Called if the GPU drops the context. The scene is dead after this. */
  readonly onContextLost: () => void;
}

export interface SceneHandle {
  readonly dispose: () => void;
}

/** Two triangles, corners at ±1, so `position` doubles as the fragment's uv. */
const QUAD_CORNERS = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

/** Raised when WebGL cannot be initialised. The caller reveals the poster. */
export class SceneUnavailableError extends Error {
  constructor(reason: string, options?: { cause?: unknown }) {
    super(`Lattice scene unavailable: ${reason}`, options);
    this.name = "SceneUnavailableError";
  }
}

function resolveDpr(): number {
  return Math.min(window.devicePixelRatio || 1, DPR_MAX);
}

export function createScene(options: SceneOptions): SceneHandle {
  const { canvas, host, signature, onFirstFrame, onContextLost } = options;

  const geometryData = buildLattice(signature, resolveGrid(navigator.hardwareConcurrency));

  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      dpr: resolveDpr(),
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: false,
      autoClear: true,
    });
  } catch (cause) {
    throw new SceneUnavailableError("the renderer could not be constructed", { cause });
  }

  const gl = renderer.gl;
  if (!gl) throw new SceneUnavailableError("no WebGL context was returned");
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: CAMERA_FOV_DEGREES, near: 0.1, far: 12 });
  camera.position.z = CAMERA_DISTANCE;

  const geometry = new Geometry(gl, {
    position: { size: 2, data: QUAD_CORNERS },
    aNoise: { size: 3, data: geometryData.noise, instanced: 1 },
    aLattice: { size: 3, data: geometryData.lattice, instanced: 1 },
    aSeed: { size: 2, data: geometryData.seeds, instanced: 1 },
  });

  const figureColor = readFigureColor();
  const program = new Program(gl, {
    vertex: LATTICE_VERTEX,
    fragment: LATTICE_FRAGMENT,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: POINT_SIZE },
      uOpacity: { value: 1 },
      uColor: { value: new Float32Array(figureColor) },
    },
    transparent: true,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
  });

  const mesh = new Mesh(gl, { geometry, program, frustumCulled: false });

  const scroll = createScrollProgress(host);

  const applySize = (): void => {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    renderer.dpr = resolveDpr();
    renderer.setSize(width, height);
    camera.perspective({ aspect: width / height });
    scroll.measure();
  };
  applySize();

  let rafId = 0;
  let lastTimestamp = 0;
  let elapsedSeconds = 0;
  let hasDrawnFirstFrame = false;
  let isOnScreen = false;
  let isDisposed = false;

  const renderFrame = (timestamp: number): void => {
    rafId = window.requestAnimationFrame(renderFrame);

    // Clamp the delta so a backgrounded tab cannot fast-forward the drift.
    const delta = lastTimestamp === 0 ? 0 : Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;
    elapsedSeconds += delta;

    program.uniforms.uTime.value = elapsedSeconds;
    program.uniforms.uProgress.value = scroll.read();
    renderer.render({ scene: mesh, camera, sort: false, frustumCull: false });

    if (!hasDrawnFirstFrame) {
      hasDrawnFirstFrame = true;
      onFirstFrame();
    }
  };

  const stopLoop = (): void => {
    if (rafId === 0) return;
    window.cancelAnimationFrame(rafId);
    rafId = 0;
    lastTimestamp = 0;
  };

  const syncLoop = (): void => {
    const shouldRun = isOnScreen && !document.hidden && !isDisposed;
    if (!shouldRun) {
      stopLoop();
      return;
    }
    if (rafId !== 0) return;
    rafId = window.requestAnimationFrame(renderFrame);
  };

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      isOnScreen = entries.some((entry) => entry.isIntersecting);
      syncLoop();
    },
    { threshold: 0 },
  );
  intersectionObserver.observe(host);

  const resizeObserver = new ResizeObserver(applySize);
  resizeObserver.observe(host);

  const onVisibilityChange = (): void => syncLoop();
  document.addEventListener("visibilitychange", onVisibilityChange);

  const unwatchFigureColor = watchFigureColor((next: Rgb) => {
    program.uniforms.uColor.value = new Float32Array(next);
  });

  // Deliberately not prevented: docs/02 §8.3 says fall back to the poster
  // rather than attempt a restore, so the context is allowed to stay lost.
  const onContextLostEvent = (): void => {
    stopLoop();
    onContextLost();
  };
  canvas.addEventListener("webglcontextlost", onContextLostEvent);

  const dispose = (): void => {
    if (isDisposed) return;
    isDisposed = true;
    stopLoop();
    canvas.removeEventListener("webglcontextlost", onContextLostEvent);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    intersectionObserver.disconnect();
    resizeObserver.disconnect();
    unwatchFigureColor();
    scroll.dispose();
    geometry.remove();
    program.remove();
    const loseContext = gl.getExtension("WEBGL_lose_context");
    loseContext?.loseContext();
  };

  return { dispose };
}
