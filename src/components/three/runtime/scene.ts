import {
  Camera,
  Geometry,
  Mesh,
  Program,
  Renderer,
  Transform,
  type OGLRenderingContext,
} from "ogl";

import { CAMERA_DISTANCE, CAMERA_FOV_DEGREES, POINT_SIZE } from "../constants";
import { createFieldAttention, type FieldAttentionState } from "../field/attention";
import { createContrastProbe, type ContrastReport } from "../field/contrast";
import { GROUND_VERTEX, groundFragment } from "../field/ground.shader";
import { FBM_OCTAVES_HIGH, FBM_OCTAVES_LOW } from "../field/noise.glsl";
import { readFieldPalette, toUniform } from "../field/palette";
import { POINT_FRAGMENT, POINT_VERTEX } from "../field/point.shader";
import { createPostChain, type BloomTier } from "../field/post-chain";
import { createScrimTracker } from "../field/scrim";
import { TRACE_FRAGMENT, TRACE_VERTEX } from "../field/trace.shader";
import { buildLattice, buildSignatureTraces, resolveGrid } from "../lattice/seed";
import { isCoarsePointer, readDeviceProfile, resolveBloomTier, resolveDpr } from "./capability";

/**
 * The imperative half of the attestation field: a ground pass, one instanced
 * draw call for up to 15,088 additive emitters, one tiny `LINES` draw call for
 * the r ‖ s traces, and a post chain that carries the scrim carve.
 *
 * This module owns every GPU resource it creates and releases all of them in
 * {@link SceneHandle.dispose}. The loop stops dead whenever the field is not on
 * screen or the tab is hidden, so a backgrounded page issues **zero** draws.
 */

/** What the probe reports when it is absent — production, or after dispose. */
const EMPTY_CONTRAST_REPORT: ContrastReport = {
  worst: null,
  samples: 0,
  worstSample: null,
  failures: [],
  elements: 0,
  shielded: 0,
  luminanceSpread: 0,
};

export interface SceneOptions {
  readonly canvas: HTMLCanvasElement;
  /** The fixed, full-viewport host the canvas fills. */
  readonly host: HTMLElement;
  /** The signature bytes that seed the geometry. */
  readonly signature: Uint8Array;
  /** The section whose passage Acts II and III scrub against. */
  readonly anchorSelector?: string;
  /** Supplies the master resolve each frame, 0 → 1. */
  readonly readProgress: () => { resolve: number; traceReveal: number; documentProgress: number };
  /** Called once, after the first frame has actually been drawn. */
  readonly onFirstFrame: (points: number) => void;
  /** Called if the GPU drops the context. The scene is dead after this. */
  readonly onContextLost: () => void;
}

export interface SceneHandle {
  readonly dispose: () => void;
  /**
   * Runs the A8.4 probe on the next frame and resolves with the measurement.
   * Not called by the render loop — see `field/contrast.ts`.
   */
  readonly measureContrast: () => Promise<ContrastReport>;
  /**
   * Runs one scrim pass at the current scroll position and returns its
   * `count:maxVisiblePx` telemetry, without rendering a frame.
   *
   * The slot-contention gate sweeps the document at 40px, and driving that
   * through the render loop cost ~264ms a step — a full 15k-point composite per
   * sample, 39s for one pass, timing out the moment both Playwright projects
   * ran it at once. `scrollTo` settles layout synchronously, so the tracker has
   * everything it needs without a frame; this is the same tracker the composite
   * uses, called directly, and it turns the sweep into milliseconds.
   */
  readonly sampleScrimDrops: () => string;
  readonly pointCount: number;
}

/** Two triangles, corners at ±1, so `position` doubles as the fragment's uv. */
const QUAD_CORNERS = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

/** Raised when WebGL cannot be initialised. The caller reveals the poster. */
export class SceneUnavailableError extends Error {
  constructor(reason: string, options?: { cause?: unknown }) {
    super(`Field scene unavailable: ${reason}`, options);
    this.name = "SceneUnavailableError";
  }
}

/** Composite vignette. Deep enough to settle the corners, not to letterbox. */
const VIGNETTE = 0.46;

/** Frame-rate-independent lerp factors. Lower base = snappier. */
const ATTENTION_DAMPING = 0.06;
const POINTER_DAMPING = 0.02;

/** Delta clamp, so a backgrounded tab cannot fast-forward the drift. */
const MAX_DELTA_SECONDS = 0.05;

interface UniformValue<T> {
  value: T;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function damping(base: number, delta: number): number {
  return 1 - Math.pow(base, delta);
}

export function createScene(options: SceneOptions): SceneHandle {
  const { canvas, host, signature, readProgress, onFirstFrame, onContextLost } = options;

  const profile = readDeviceProfile();
  const tier: BloomTier = resolveBloomTier(profile);
  const geometryData = buildLattice(signature, resolveGrid(profile));
  // Mutates `geometryData.flare` by contract — see `buildSignatureTraces`.
  const traceData = buildSignatureTraces(geometryData, signature);

  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      dpr: resolveDpr(tier !== "off"),
      // Opaque, non-negotiable companion of additive blending: additive over a
      // transparent canvas composited onto a light page turns to white paste.
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      autoClear: false,
    });
  } catch (cause) {
    throw new SceneUnavailableError("the renderer could not be constructed", { cause });
  }

  const gl: OGLRenderingContext = renderer.gl;
  if (!gl) throw new SceneUnavailableError("no WebGL context was returned");

  const palette = readFieldPalette();
  gl.clearColor(palette.ink[0], palette.ink[1], palette.ink[2], 1);

  const scrim = createScrimTracker(document, host);
  const attention = createFieldAttention();
  /**
   * The A8.4 harness exists only in development.
   *
   * `process.env.NODE_ENV` is inlined by the bundler, so production drops both
   * the construction and `field/contrast.ts` with it — verified: no `readPixels`
   * reaches a shipped chunk. That makes "the probe never runs in the render
   * loop" structural rather than a promise about call sites, which matters
   * because the failure mode of getting it wrong is a pipeline stall on every
   * frame and the symptom is indistinguishable from a slow GPU.
   */
  const contrastProbe =
    process.env.NODE_ENV === "production"
      ? null
      : createContrastProbe({ gl, host, textColor: palette.fgSecondary });

  /* ---- the ground ------------------------------------------------------- */
  const groundGeometry = new Geometry(gl, {
    position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
  });
  const groundProgram = new Program(gl, {
    vertex: GROUND_VERTEX,
    fragment: groundFragment(tier === "off" ? FBM_OCTAVES_LOW : FBM_OCTAVES_HIGH),
    depthTest: false,
    depthWrite: false,
    cullFace: false,
    uniforms: {
      uTime: { value: 0 },
      uAspect: { value: new Float32Array([1.6, 1]) },
      uInk: { value: toUniform(palette.ink) },
      uGold: { value: toUniform(palette.hot) },
      uSlate: { value: toUniform(palette.cold) },
      uFocus: { value: new Float32Array([0.52, 0.56]) },
      uFocusEnergy: { value: 1 },
      uFlow: { value: 1 },
      uHorizon: { value: 0.58 },
    },
  });
  const groundMesh = new Mesh(gl, { geometry: groundGeometry, program: groundProgram });

  /* ---- the lattice ------------------------------------------------------ */
  const pointGeometry = new Geometry(gl, {
    position: { size: 2, data: QUAD_CORNERS },
    aNoise: { size: 3, data: geometryData.noise, instanced: 1 },
    aLattice: { size: 3, data: geometryData.lattice, instanced: 1 },
    aSeed: { size: 2, data: geometryData.seeds, instanced: 1 },
    aFlare: { size: 1, data: geometryData.flare, instanced: 1 },
  });
  const pointProgram = new Program(gl, {
    vertex: POINT_VERTEX,
    fragment: POINT_FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: POINT_SIZE },
      uPointer: { value: new Float32Array([0, 0]) },
      uScrollParallax: { value: 0 },
      uFlare: { value: 1 },
      uCold: { value: toUniform(palette.cold) },
      uHot: { value: toUniform(palette.hot) },
      uCore: { value: toUniform(palette.core) },
      uEnergy: { value: 1 },
    },
  });
  // A8.1 — every accent pixel is emitted, never filled. This one line is what
  // makes density read as brightness, and it is cheaper than the alpha blend it
  // replaces.
  pointProgram.setBlendFunc(gl.ONE, gl.ONE);
  const pointMesh = new Mesh(gl, {
    geometry: pointGeometry,
    program: pointProgram,
    frustumCulled: false,
  });

  /* ---- the r/s traces --------------------------------------------------- */
  const traceGeometry = new Geometry(gl, {
    position: { size: 3, data: traceData.position },
    aT: { size: 1, data: traceData.progress },
  });
  const traceProgram = new Program(gl, {
    vertex: TRACE_VERTEX,
    fragment: TRACE_FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
    uniforms: {
      uHot: { value: toUniform(palette.hot) },
      uCore: { value: toUniform(palette.core) },
      uReveal: { value: 0 },
      uEnergy: { value: 1 },
      uPointer: { value: new Float32Array([0, 0]) },
      uScrollParallax: { value: 0 },
    },
  });
  traceProgram.setBlendFunc(gl.ONE, gl.ONE);
  const traceMesh = new Mesh(gl, {
    mode: gl.LINES,
    geometry: traceGeometry,
    program: traceProgram,
    frustumCulled: false,
  });

  /* ---- the plane in space ----------------------------------------------- */
  const root = new Transform();
  pointMesh.setParent(root);
  traceMesh.setParent(root);
  root.rotation.x = -1.24;

  const camera = new Camera(gl, { fov: CAMERA_FOV_DEGREES, near: 0.05, far: 24 });
  camera.position.set(0, 0.3, CAMERA_DISTANCE);
  camera.lookAt([0, 0.16, 0]);

  const post = createPostChain({
    gl,
    isWebgl2: renderer.isWebgl2,
    tier,
    palette,
    scrim: scrim.uniforms,
    vignette: VIGNETTE,
  });

  let width = 1;
  let height = 1;
  let dpr = 1;

  const applySize = (): void => {
    width = Math.max(host.clientWidth || window.innerWidth, 1);
    height = Math.max(host.clientHeight || window.innerHeight, 1);
    dpr = resolveDpr(post.hasBloom);
    renderer.dpr = dpr;
    renderer.setSize(width, height);
    camera.perspective({ aspect: width / height });

    const aspect = groundProgram.uniforms.uAspect as UniformValue<Float32Array>;
    aspect.value[0] = Math.max(1, width / height);
    aspect.value[1] = 1;

    post.resize(width * dpr, height * dpr, width / height);
    scrim.update(width, height);
  };
  applySize();

  /* ---- animated state --------------------------------------------------- */
  const state = {
    focusX: 0.52,
    focusY: 0.56,
    energy: 1,
    flow: 1,
    dolly: 0,
    yaw: 0,
    horizon: 0.58,
    cameraY: 0.3,
    tilt: -1.24,
    pointerX: 0,
    pointerY: 0,
    pointerTargetX: 0,
    pointerTargetY: 0,
  };

  let rafId = 0;
  let lastTimestamp = 0;
  let elapsedSeconds = 0;
  let hasDrawnFirstFrame = false;
  let isOnScreen = false;
  let isDisposed = false;
  let pendingProbe: ((report: ContrastReport) => void) | null = null;

  const applyAttention = (target: FieldAttentionState, delta: number): void => {
    const k = damping(ATTENTION_DAMPING, delta);
    state.focusX = lerp(state.focusX, target.focus[0], k);
    state.focusY = lerp(state.focusY, target.focus[1], k);
    state.energy = lerp(state.energy, target.energy, k);
    state.flow = lerp(state.flow, target.flow, k);
    state.dolly = lerp(state.dolly, target.dolly, k);
    state.yaw = lerp(state.yaw, target.yaw, k);
    state.horizon = lerp(state.horizon, target.horizon, k);
    state.cameraY = lerp(state.cameraY, target.cameraY, k);
    state.tilt = lerp(state.tilt, target.tilt, k);
  };

  const renderFrame = (timestamp: number): void => {
    rafId = window.requestAnimationFrame(renderFrame);

    const delta =
      lastTimestamp === 0 ? 0 : Math.min((timestamp - lastTimestamp) / 1000, MAX_DELTA_SECONDS);
    lastTimestamp = timestamp;
    elapsedSeconds += delta;

    const acts = readProgress();
    applyAttention(attention.current(), delta);

    const pointerK = damping(POINTER_DAMPING, delta);
    state.pointerX = lerp(state.pointerX, state.pointerTargetX, pointerK);
    state.pointerY = lerp(state.pointerY, state.pointerTargetY, pointerK);

    const flare = attention.flare(delta * 1000);
    const energy = state.energy * flare * (0.96 + 0.04 * Math.sin(elapsedSeconds * 0.31));

    camera.position.z = CAMERA_DISTANCE - state.dolly * 0.72;
    camera.position.y = state.cameraY;
    camera.lookAt([0, state.cameraY * 0.42, 0]);
    root.rotation.y = state.yaw + Math.sin(elapsedSeconds * 0.045) * 0.012;
    root.rotation.x = state.tilt;

    const groundFocus = groundProgram.uniforms.uFocus as UniformValue<Float32Array>;
    groundFocus.value[0] = state.focusX;
    groundFocus.value[1] = state.focusY;
    (groundProgram.uniforms.uTime as UniformValue<number>).value = elapsedSeconds;
    (groundProgram.uniforms.uFocusEnergy as UniformValue<number>).value = energy;
    (groundProgram.uniforms.uFlow as UniformValue<number>).value = state.flow;
    (groundProgram.uniforms.uHorizon as UniformValue<number>).value = state.horizon;

    const pointPointer = pointProgram.uniforms.uPointer as UniformValue<Float32Array>;
    pointPointer.value[0] = state.pointerX * 0.09;
    pointPointer.value[1] = state.pointerY * 0.06;
    (pointProgram.uniforms.uTime as UniformValue<number>).value = elapsedSeconds;
    (pointProgram.uniforms.uProgress as UniformValue<number>).value = acts.resolve;
    (pointProgram.uniforms.uEnergy as UniformValue<number>).value = energy;
    (pointProgram.uniforms.uFlare as UniformValue<number>).value = Math.min(flare, 1.35);
    (pointProgram.uniforms.uScrollParallax as UniformValue<number>).value = acts.documentProgress;

    const tracePointer = traceProgram.uniforms.uPointer as UniformValue<Float32Array>;
    tracePointer.value[0] = state.pointerX * 0.09;
    tracePointer.value[1] = state.pointerY * 0.06;
    (traceProgram.uniforms.uReveal as UniformValue<number>).value = acts.traceReveal;
    (traceProgram.uniforms.uEnergy as UniformValue<number>).value = energy;
    (traceProgram.uniforms.uScrollParallax as UniformValue<number>).value = acts.documentProgress;

    scrim.update(width, height);

    const target = post.sceneTarget();
    renderer.render({ scene: groundMesh, target, clear: true });
    renderer.render({ scene: root, camera, target, clear: false, sort: false, frustumCull: false });
    post.render(renderer, elapsedSeconds);

    if (pendingProbe) {
      const resolveProbe = pendingProbe;
      pendingProbe = null;
      resolveProbe(contrastProbe?.sample(width, height, dpr) ?? EMPTY_CONTRAST_REPORT);
    }

    if (!hasDrawnFirstFrame) {
      hasDrawnFirstFrame = true;
      onFirstFrame(geometryData.count);
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

  /* ---- parallax: not attached at all on a coarse pointer ----------------- */
  const onPointerMove = (event: PointerEvent): void => {
    state.pointerTargetX = (event.clientX / width - 0.5) * 2;
    state.pointerTargetY = -(event.clientY / height - 0.5) * 2;
  };
  const hasPointerParallax = !isCoarsePointer();
  if (hasPointerParallax) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
  }

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
    if (hasPointerParallax) window.removeEventListener("pointermove", onPointerMove);
    intersectionObserver.disconnect();
    resizeObserver.disconnect();
    scrim.dispose();
    attention.dispose();
    post.dispose();
    groundGeometry.remove();
    groundProgram.remove();
    pointGeometry.remove();
    pointProgram.remove();
    traceGeometry.remove();
    traceProgram.remove();
    pendingProbe = null;
    const loseContext = gl.getExtension("WEBGL_lose_context") as {
      loseContext?: () => void;
    } | null;
    loseContext?.loseContext?.();
  };

  const measureContrast = (): Promise<ContrastReport> =>
    new Promise((resolve) => {
      if (isDisposed) {
        resolve(EMPTY_CONTRAST_REPORT);
        return;
      }
      pendingProbe = resolve;
      syncLoop();
    });

  const sampleScrimDrops = (): string => {
    if (isDisposed) return "0:0";
    scrim.update(width, height);
    return host.dataset.scrimDropped ?? "0:0";
  };

  return { dispose, measureContrast, sampleScrimDrops, pointCount: geometryData.count };
}
