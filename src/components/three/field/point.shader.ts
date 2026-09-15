import {
  DEPTH_NEAR,
  DEPTH_RANGE,
  DRIFT_AMPLITUDE,
  EASE_GLIDE,
  HOLD_THRESHOLD,
  POINT_SIZE_FAR_SCALE,
  POINT_SIZE_NEAR_SCALE,
  SIZE_JITTER_BASE,
  SIZE_JITTER_SPAN,
  STAGGER_SPAN,
} from "../constants";

/**
 * The lattice program. One instanced geometry, one draw call, up to 15,088
 * points. Replaces `lattice/shaders.ts`, which is deleted.
 *
 * Written as GLSL ES 1.00 (`attribute` / `varying`), which a WebGL2 context
 * accepts, so no `#version` directive is needed and OGL's default precision
 * prefix applies.
 *
 * What changed, and why (docs/15 §2.3, §2.6, §2.7, §2.8, §2.9):
 *
 * - The single `uColor` is replaced by a **cold → gold → core ramp** driven by
 *   per-point resolve, so structure is hot and entropy is cold (A8.1: emitted
 *   light, never a fill).
 * - The sprite is **two lobes** — a tight core plus a cubed halo — mixed by
 *   depth, which is optical defocus rather than a uniform disc.
 * - `DEPTH_FADE_FLOOR` and the `mix(0.55, 1.0, resolve)` alpha floor are
 *   **removed**. They existed to keep a grey field subtle; under an emissive
 *   treatment they are the enemy.
 * - The stagger is a **spatial wave**, so a visible front of order sweeps the
 *   field instead of points popping in at random.
 *
 * The program is blended `gl.ONE, gl.ONE` by the scene. That is what makes
 * density read as brightness: as rows and columns align their halos overlap and
 * reinforce, so the structure ignites by the physics of the effect rather than
 * by an animation laid on top of it. It is also cheaper than the alpha blend it
 * replaces — no source-alpha multiply, no blend-equation state change per draw.
 */

const [EASE_X1, EASE_Y1, EASE_X2, EASE_Y2] = EASE_GLIDE;

/** `--ease-glide` solved in GLSL. Shared by the point and trace programs. */
export const EASE_GLIDE_GLSL = /* glsl */ `
const float EASE_X1 = ${EASE_X1.toFixed(4)};
const float EASE_Y1 = ${EASE_Y1.toFixed(4)};
const float EASE_X2 = ${EASE_X2.toFixed(4)};
const float EASE_Y2 = ${EASE_Y2.toFixed(4)};

float bezierAxis(float t, float a1, float a2){
  return (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t;
}
float bezierSlope(float t, float a1, float a2){
  return (3.0 * (1.0 - 3.0 * a2 + 3.0 * a1) * t + 2.0 * (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1;
}

// Newton-solves x(t) = x for t, then evaluates y(t). Five iterations is exact
// to well under a pixel for this curve.
float easeGlide(float x){
  float t = x;
  for (int i = 0; i < 5; i++){
    float s = bezierSlope(t, EASE_X1, EASE_X2);
    if (abs(s) < 0.00001) break;
    t -= (bezierAxis(t, EASE_X1, EASE_X2) - x) / s;
  }
  return bezierAxis(clamp(t, 0.0, 1.0), EASE_Y1, EASE_Y2);
}
`;

/** Depth normalisation shared by the point and trace programs, and by the poster. */
export const DEPTH_GLSL = /* glsl */ `
const float DEPTH_NEAR  = ${DEPTH_NEAR.toFixed(4)};
const float DEPTH_RANGE = ${DEPTH_RANGE.toFixed(4)};

float depth01(float viewZ){
  return clamp((-viewZ - DEPTH_NEAR) / DEPTH_RANGE, 0.0, 1.0);
}
`;

/** Pointer and scroll parallax, identical in both programs so they cannot shear. */
export const PARALLAX_GLSL = /* glsl */ `
vec2 parallaxOffset(vec2 pointer, float scrollParallax, float depth){
  return vec2(pointer.x * (0.04 + 0.22 * depth),
              pointer.y * (0.04 + 0.22 * depth) + scrollParallax * (0.02 + 0.11 * depth));
}
`;

export const POINT_VERTEX = /* glsl */ `
attribute vec2 position;
attribute vec3 aNoise;
attribute vec3 aLattice;
attribute vec2 aSeed;
attribute float aFlare;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uProgress;
uniform float uTime;
uniform float uSize;
uniform vec2  uPointer;
uniform float uScrollParallax;
uniform float uFlare;

varying vec2  vQuad;
varying float vFade;
varying float vHeat;
varying float vDepth;
varying float vFlare;

const float TAU = 6.283185307179586;
const float STAGGER_SPAN    = ${STAGGER_SPAN.toFixed(4)};
const float DRIFT_AMPLITUDE = ${DRIFT_AMPLITUDE.toFixed(4)};
const float HOLD_THRESHOLD  = ${HOLD_THRESHOLD.toFixed(4)};
const float SIZE_NEAR       = ${POINT_SIZE_NEAR_SCALE.toFixed(4)};
const float SIZE_FAR        = ${POINT_SIZE_FAR_SCALE.toFixed(4)};
const float JITTER_BASE     = ${SIZE_JITTER_BASE.toFixed(4)};
const float JITTER_SPAN     = ${SIZE_JITTER_SPAN.toFixed(4)};

${EASE_GLIDE_GLSL}
${DEPTH_GLSL}
${PARALLAX_GLSL}

void main(){
  // A visible FRONT of order sweeps the field, instead of points popping in at
  // random: the stagger phase is mostly spatial, only a third per-point noise.
  float wave  = length(aLattice.xy * vec2(0.42, 1.0)) / 2.35;
  float phase = mix(wave, aSeed.x, 0.34);
  float staggered = clamp((uProgress - phase * STAGGER_SPAN) / (1.0 - STAGGER_SPAN), 0.0, 1.0);
  float resolve = easeGlide(staggered);
  float chaos = 1.0 - resolve;

  vec3 drift = vec3(
    sin(uTime * 0.61 + aSeed.x * TAU),
    cos(uTime * 0.47 + aSeed.y * TAU),
    sin(uTime * 0.39 + (aSeed.x + aSeed.y) * TAU)
  ) * DRIFT_AMPLITUDE * chaos;

  // A deterministic fraction of points stays in the entropy cloud, cold and
  // drifting, so the space above the resolved plane is a volume, not a void.
  float hold = step(HOLD_THRESHOLD, aSeed.x * 0.45 + aSeed.y * 0.55);
  float placed = mix(resolve, resolve * 0.06, hold);

  vec3 worldPosition = mix(aNoise, aLattice, placed) + drift * mix(1.0, 6.0, hold);
  worldPosition.z += sin(worldPosition.x * 1.7 + uTime * 0.33) * 0.030 * placed;
  worldPosition.z += cos(worldPosition.y * 2.1 - uTime * 0.21) * 0.020 * placed;

  vec4 viewPosition = modelViewMatrix * vec4(worldPosition, 1.0);
  float depth = depth01(viewPosition.z);

  viewPosition.xy += parallaxOffset(uPointer, uScrollParallax, depth);

  // Structure is hot, entropy is cold. No alpha floor.
  float twinkle = 0.88 + 0.12 * sin(uTime * 0.8 + aSeed.x * TAU * 3.0);
  float flare = clamp(aFlare * uFlare, 0.0, 1.0);
  vHeat  = placed * (0.46 + 0.54 * aSeed.y) * mix(0.72, 1.35, flare) * twinkle;
  vFlare = flare;
  vDepth = depth;

  // Near haze plus far settle, so neither edge of the volume blows out.
  vFade  = smoothstep(0.010, 0.22, depth) * mix(1.0, 0.60, smoothstep(0.52, 1.0, depth));
  vFade *= mix(0.30, 1.0, placed) * mix(1.0, 0.70, hold);

  // Depth-varied size: near points are large soft bokeh, far are pinpricks.
  float size = uSize * mix(SIZE_NEAR, SIZE_FAR, depth)
             * (JITTER_BASE + JITTER_SPAN * aSeed.y)
             * mix(0.80, 1.0, placed);
  viewPosition.xy += position * size;

  vQuad = position;
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const POINT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2  vQuad;
varying float vFade;
varying float vHeat;
varying float vDepth;
varying float vFlare;

uniform vec3  uCold, uHot, uCore;
uniform float uEnergy;

void main(){
  float d = length(vQuad);
  if (d > 1.0) discard;

  // Two lobes. Near points are optically defocused: less core, more halo.
  float soft = 1.0 - vDepth;
  float coreEdge = mix(0.42, 0.09, vDepth);
  float core = smoothstep(coreEdge, 0.0, d);
  float halo = smoothstep(1.0, 0.0, d);
  halo = halo * halo * halo;

  float h = clamp(vHeat, 0.0, 1.35);
  vec3 tint = mix(uCold, uHot, smoothstep(0.02, 0.80, h));
  tint = mix(tint, uCore, pow(clamp(h, 0.0, 1.0), 5.0) * (0.45 + 0.55 * vFlare));

  float coreAmp = mix(2.15, 0.62, soft);
  float haloAmp = mix(0.15, 0.44, soft);

  vec3 emit = tint * (core * coreAmp + halo * haloAmp) * vFade * uEnergy;
  if (dot(emit, vec3(1.0)) < 0.002) discard;

  // Additive: the alpha channel is unused by gl.ONE, gl.ONE and the canvas is
  // opaque, so 1.0 here is the honest value rather than a blend parameter.
  gl_FragColor = vec4(emit, 1.0);
}
`;
