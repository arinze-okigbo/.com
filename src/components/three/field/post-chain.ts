import {
  Mesh,
  Program,
  RenderTarget,
  Triangle,
  type OGLRenderingContext,
  type Renderer,
} from "ogl";

import {
  BLOOM_STRENGTH,
  BLOOM_TARGET_SCALE,
  BLOOM_THRESHOLD,
  BLUR_RADII,
  BLOOM_REFERENCE_DPR,
  SCRIM_FEATHER,
} from "../constants";
import { toUniform, type FieldPalette } from "./palette";
import { BLUR_FRAGMENT, BRIGHT_FRAGMENT, COMPOSITE_FRAGMENT, POST_VERTEX } from "./post.shader";
import type { ScrimUniforms } from "./scrim";

/**
 * The bright / blur / composite chain, hand-rolled on `core/RenderTarget.js`.
 *
 * docs/15 §2.6 rules out OGL's `extras/Post.js` explicitly and gives the
 * reason: the composite pass owns the scrim SDF, the tonemap, the vignette, the
 * grain and the ordered dither, with six `vec4` and six `float` array uniforms
 * rewritten per frame from live DOM rects. `Post.js`'s swap chain wants to own
 * the composite, and expressing this through it is more code than it replaces.
 * `RenderTarget.js` was already in `node_modules` and unused.
 *
 * Half-float targets are used where the context offers them. Additive plus
 * bloom is a different animal in HDR; RGBA8 is the fallback and gives the same
 * look with less headroom, not a different look.
 */

/** Blur iterations per tier. docs/15 §2.6: 6 desktop, 2 mid, 0 below the floor. */
export type BloomTier = "full" | "reduced" | "off";

export function blurIterations(tier: BloomTier): number {
  if (tier === "full") return BLUR_RADII.length;
  if (tier === "reduced") return 2;
  return 0;
}

/**
 * The blur ladder's radii are in TEXELS of the bloom target, and that target is
 * sized from the device pixel ratio — so an unscaled ladder makes the bloom's
 * on-screen width a function of the display, not of the art direction. It was:
 * at `devicePixelRatio` 1 the widest rung spanned 1.25% of the frame, and on a
 * retina panel (capped at `DPR_MAX_WITH_BLOOM`) 1.0%. The prototype, capped at
 * 1.6, spanned 0.78%. Same code, three different looks, and the retina one --
 * the one the site is actually judged on -- was the widest and softest of them.
 *
 * Scaling every radius by `dpr / BLOOM_REFERENCE_DPR` makes the band a fixed
 * FRACTION OF THE FRAME on every display, equal to the prototype's at the ratio
 * it was art-directed on. It costs nothing: same iteration count, same target
 * sizes, same fillrate. Only the tap offsets move.
 *
 * Clamped so a very low ratio cannot collapse the taps into a no-op, and so no
 * display can ever bloom wider than the reference.
 */
const MIN_RADIUS_SCALE = 0.5;
const MAX_RADIUS_SCALE = 1;

export function blurRadiusScale(devicePixelRatio: number): number {
  const scale = devicePixelRatio / BLOOM_REFERENCE_DPR;
  if (!Number.isFinite(scale) || scale <= 0) return MIN_RADIUS_SCALE;
  return Math.min(Math.max(scale, MIN_RADIUS_SCALE), MAX_RADIUS_SCALE);
}

interface UniformValue<T> {
  value: T;
}

interface TargetOptions {
  readonly depth: false;
  readonly type?: GLenum;
  readonly format?: GLenum;
  readonly internalFormat?: GLenum;
}

export interface PostChain {
  /** True when the chain allocated bloom targets and will run the ladder. */
  readonly hasBloom: boolean;
  /** Where the scene (ground + emitters) is drawn. */
  readonly sceneTarget: () => RenderTarget;
  readonly resize: (
    pixelWidth: number,
    pixelHeight: number,
    aspectX: number,
    devicePixelRatio: number,
  ) => void;
  /** Runs bright + blur + composite to the default framebuffer. */
  readonly render: (renderer: Renderer, elapsedSeconds: number) => void;
  readonly dispose: () => void;
}

export interface PostChainOptions {
  readonly gl: OGLRenderingContext;
  readonly isWebgl2: boolean;
  readonly tier: BloomTier;
  readonly palette: FieldPalette;
  readonly scrim: ScrimUniforms;
  readonly vignette: number;
}

function resolveTargetOptions(gl: OGLRenderingContext, isWebgl2: boolean): TargetOptions {
  const canFloat = isWebgl2 && gl.getExtension("EXT_color_buffer_float") !== null;
  if (!canFloat) return { depth: false };
  const gl2 = gl as WebGL2RenderingContext;
  return {
    depth: false,
    type: gl2.HALF_FLOAT,
    format: gl2.RGBA,
    internalFormat: gl2.RGBA16F,
  };
}

function releaseTarget(gl: OGLRenderingContext, target: RenderTarget | null): void {
  if (!target) return;
  for (const texture of target.textures ?? []) {
    if (texture?.texture) gl.deleteTexture(texture.texture);
  }
  if (target.buffer) gl.deleteFramebuffer(target.buffer);
}

export function createPostChain(options: PostChainOptions): PostChain {
  const { gl, isWebgl2, tier, palette, scrim, vignette } = options;

  const iterations = blurIterations(tier);
  const hasBloom = iterations > 0;
  const targetOptions = resolveTargetOptions(gl, isWebgl2);

  const geometry = new Triangle(gl);

  const brightProgram = new Program(gl, {
    vertex: POST_VERTEX,
    fragment: BRIGHT_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tMap: { value: null },
      uThreshold: { value: BLOOM_THRESHOLD },
    },
  });

  const blurProgram = new Program(gl, {
    vertex: POST_VERTEX,
    fragment: BLUR_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tMap: { value: null },
      uDirection: { value: new Float32Array([0, 0]) },
    },
  });

  const compositeProgram = new Program(gl, {
    vertex: POST_VERTEX,
    fragment: COMPOSITE_FRAGMENT,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tScene: { value: null },
      tBloom: { value: null },
      uBloom: { value: hasBloom ? BLOOM_STRENGTH : 0 },
      uTime: { value: 0 },
      uVignette: { value: vignette },
      uInk: { value: toUniform(palette.ink) },
      // Plain Arrays — see the note in `scrim.ts`. A Float32Array here is
      // silently dropped by OGL and the carve never reaches the GPU.
      uScrim: { value: scrim.vectors },
      uScrimAmt: { value: scrim.amounts },
      uAspectX: { value: 1.6 },
      uFeather: { value: SCRIM_FEATHER },
    },
  });

  const brightMesh = new Mesh(gl, { geometry, program: brightProgram });
  const blurMesh = new Mesh(gl, { geometry, program: blurProgram });
  const compositeMesh = new Mesh(gl, { geometry, program: compositeProgram });

  let scene: RenderTarget | null = null;
  let ping: RenderTarget | null = null;
  let pong: RenderTarget | null = null;

  let radiusScale = 1;

  const resize = (
    pixelWidth: number,
    pixelHeight: number,
    aspectX: number,
    devicePixelRatio: number,
  ): void => {
    radiusScale = blurRadiusScale(devicePixelRatio);
    releaseTarget(gl, scene);
    releaseTarget(gl, ping);
    releaseTarget(gl, pong);

    const width = Math.max(Math.round(pixelWidth), 2);
    const height = Math.max(Math.round(pixelHeight), 2);
    scene = new RenderTarget(gl, { width, height, ...targetOptions });

    if (hasBloom) {
      const bloomWidth = Math.max(Math.round(width * BLOOM_TARGET_SCALE), 2);
      const bloomHeight = Math.max(Math.round(height * BLOOM_TARGET_SCALE), 2);
      ping = new RenderTarget(gl, { width: bloomWidth, height: bloomHeight, ...targetOptions });
      pong = new RenderTarget(gl, { width: bloomWidth, height: bloomHeight, ...targetOptions });
    } else {
      ping = null;
      pong = null;
    }

    (compositeProgram.uniforms.uAspectX as UniformValue<number>).value = aspectX;
  };

  const sceneTarget = (): RenderTarget => {
    if (!scene) throw new Error("post chain used before resize()");
    return scene;
  };

  const render = (renderer: Renderer, elapsedSeconds: number): void => {
    const source = sceneTarget();
    let bloomTexture = source.texture;

    if (hasBloom && ping && pong) {
      (brightProgram.uniforms.tMap as UniformValue<unknown>).value = source.texture;
      renderer.render({ scene: brightMesh, target: ping, clear: true });

      const texelX = 1 / ping.width;
      const texelY = 1 / ping.height;
      let read = ping;
      let write = pong;

      for (let i = 0; i < iterations; i += 1) {
        const isHorizontal = i % 2 === 0;
        const radius = BLUR_RADII[i % BLUR_RADII.length] * radiusScale;
        const direction = blurProgram.uniforms.uDirection as UniformValue<Float32Array>;
        direction.value[0] = isHorizontal ? texelX * radius : 0;
        direction.value[1] = isHorizontal ? 0 : texelY * radius;
        (blurProgram.uniforms.tMap as UniformValue<unknown>).value = read.texture;
        renderer.render({ scene: blurMesh, target: write, clear: true });
        const swap = read;
        read = write;
        write = swap;
      }
      bloomTexture = read.texture;
    }

    (compositeProgram.uniforms.tScene as UniformValue<unknown>).value = source.texture;
    (compositeProgram.uniforms.tBloom as UniformValue<unknown>).value = bloomTexture;
    (compositeProgram.uniforms.uTime as UniformValue<number>).value = elapsedSeconds;
    renderer.render({ scene: compositeMesh, target: undefined, clear: true });
  };

  return {
    hasBloom,
    sceneTarget,
    resize,
    render,
    dispose: () => {
      releaseTarget(gl, scene);
      releaseTarget(gl, ping);
      releaseTarget(gl, pong);
      scene = null;
      ping = null;
      pong = null;
      geometry.remove();
      brightProgram.remove();
      blurProgram.remove();
      compositeProgram.remove();
    },
  };
}
