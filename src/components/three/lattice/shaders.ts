import { CAMERA_DISTANCE, EASE_GLIDE } from "../constants";

/**
 * GLSL for the attestation lattice. One program, one draw call.
 *
 * Written as GLSL ES 1.00 (`attribute` / `varying`), which a WebGL2 context
 * accepts, so no `#version` directive is needed and OGL's default precision
 * prefix applies.
 */

/** How much of the scroll range is spent staggering points in. */
const STAGGER_SPAN = 0.45;

/** World-space amplitude of the pre-resolve drift. Damps to zero as it orders. */
const DRIFT_AMPLITUDE = 0.075;

/** World-space depth band used for the distance fade, shared with `project.ts`. */
const DEPTH_RANGE = 2.4;
const DEPTH_NEAR = CAMERA_DISTANCE - DEPTH_RANGE / 2;

/** Point size responds to its own seed, so the field is not mechanically even. */
export const SIZE_JITTER_BASE = 0.62;
export const SIZE_JITTER_SPAN = 0.76;

/** Opacity floor applied to the far edge of the field. */
export const DEPTH_FADE_FLOOR = 0.3;

const [EASE_X1, EASE_Y1, EASE_X2, EASE_Y2] = EASE_GLIDE;

export const LATTICE_VERTEX = /* glsl */ `
attribute vec2 position;
attribute vec3 aNoise;
attribute vec3 aLattice;
attribute vec2 aSeed;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uProgress;
uniform float uTime;
uniform float uSize;

varying vec2 vQuad;
varying float vFade;

const float TAU = 6.283185307179586;
const float STAGGER_SPAN = ${STAGGER_SPAN.toFixed(4)};
const float DRIFT_AMPLITUDE = ${DRIFT_AMPLITUDE.toFixed(4)};
const float DEPTH_NEAR = ${DEPTH_NEAR.toFixed(4)};
const float DEPTH_RANGE = ${DEPTH_RANGE.toFixed(4)};
const float DEPTH_FADE_FLOOR = ${DEPTH_FADE_FLOOR.toFixed(4)};
const float SIZE_JITTER_BASE = ${SIZE_JITTER_BASE.toFixed(4)};
const float SIZE_JITTER_SPAN = ${SIZE_JITTER_SPAN.toFixed(4)};

// --ease-glide, cubic-bezier(${EASE_X1}, ${EASE_Y1}, ${EASE_X2}, ${EASE_Y2}) — docs/04 §4.
const float EASE_X1 = ${EASE_X1.toFixed(4)};
const float EASE_Y1 = ${EASE_Y1.toFixed(4)};
const float EASE_X2 = ${EASE_X2.toFixed(4)};
const float EASE_Y2 = ${EASE_Y2.toFixed(4)};

float bezierAxis(float t, float a1, float a2) {
  return (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t;
}

float bezierSlope(float t, float a1, float a2) {
  return (3.0 * (1.0 - 3.0 * a2 + 3.0 * a1) * t + 2.0 * (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1;
}

// Newton-solves x(t) = x for t, then evaluates y(t). Five iterations is exact
// to well under a pixel for this curve.
float easeGlide(float x) {
  float t = x;
  for (int i = 0; i < 5; i++) {
    float slope = bezierSlope(t, EASE_X1, EASE_X2);
    if (abs(slope) < 0.00001) break;
    t -= (bezierAxis(t, EASE_X1, EASE_X2) - x) / slope;
  }
  return bezierAxis(clamp(t, 0.0, 1.0), EASE_Y1, EASE_Y2);
}

void main() {
  float staggered = clamp((uProgress - aSeed.x * STAGGER_SPAN) / (1.0 - STAGGER_SPAN), 0.0, 1.0);
  float resolve = easeGlide(staggered);
  float chaos = 1.0 - resolve;

  vec3 drift = vec3(
    sin(uTime * 0.61 + aSeed.x * TAU),
    cos(uTime * 0.47 + aSeed.y * TAU),
    sin(uTime * 0.39 + (aSeed.x + aSeed.y) * TAU)
  ) * DRIFT_AMPLITUDE * chaos;

  vec3 worldPosition = mix(aNoise, aLattice, resolve) + drift;
  worldPosition.z += sin(worldPosition.x * 1.7 + uTime * 0.33) * 0.018 * resolve;

  vec4 viewPosition = modelViewMatrix * vec4(worldPosition, 1.0);

  float depth = clamp((-viewPosition.z - DEPTH_NEAR) / DEPTH_RANGE, 0.0, 1.0);
  vFade = mix(1.0, DEPTH_FADE_FLOOR, depth) * mix(0.55, 1.0, resolve);

  float size = uSize * (SIZE_JITTER_BASE + SIZE_JITTER_SPAN * aSeed.y) * mix(0.72, 1.0, resolve);
  viewPosition.xy += position * size;

  vQuad = position;
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const LATTICE_FRAGMENT = /* glsl */ `
precision mediump float;

uniform vec3 uColor;
uniform float uOpacity;

varying vec2 vQuad;
varying float vFade;

void main() {
  float alpha = smoothstep(1.0, 0.35, length(vQuad)) * vFade * uOpacity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(uColor, alpha);
}
`;
