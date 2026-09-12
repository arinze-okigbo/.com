import { DEPTH_GLSL, PARALLAX_GLSL } from "./point.shader";

/**
 * The r ‖ s traces — docs/15 §2.8, act III.
 *
 * Bytes 0–31 (`r`) and 32–63 (`s`) each become a 32-vertex polyline whose row
 * index is the byte value, snapped to real lattice points so the traces lie on
 * the resolved surface. A second, tiny draw call: raw `gl.LINES`, additive,
 * revealed over the last 34% of progress. OGL's `extras/Polyline.js` is
 * deliberately not imported — it is larger than the geometry it would build.
 */

export const TRACE_VERTEX = /* glsl */ `
attribute vec3 position;
attribute float aT;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec2 uPointer;
uniform float uScrollParallax;

varying float vT;
varying float vDepth;

${DEPTH_GLSL}
${PARALLAX_GLSL}

void main(){
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = depth01(viewPosition.z);
  viewPosition.xy += parallaxOffset(uPointer, uScrollParallax, depth);
  vT = aT;
  vDepth = depth;
  gl_Position = projectionMatrix * viewPosition;
}
`;

export const TRACE_FRAGMENT = /* glsl */ `
precision highp float;

varying float vT;
varying float vDepth;

uniform vec3  uHot, uCore;
uniform float uReveal;
uniform float uEnergy;

void main(){
  float on = smoothstep(vT, vT + 0.14, uReveal);
  float fade = smoothstep(0.0, 0.14, vDepth) * mix(1.0, 0.55, vDepth);
  vec3 c = mix(uHot, uCore, 0.35) * on * fade * 0.42 * uEnergy;
  if (dot(c, vec3(1.0)) < 0.002) discard;
  gl_FragColor = vec4(c, 1.0);
}
`;
