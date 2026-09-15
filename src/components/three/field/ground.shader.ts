import { noiseChunk } from "./noise.glsl";

/**
 * The ground pass — docs/15 §2.5.
 *
 * Half of what makes the field read as *systems* rather than as a point cloud:
 * a domain-warped fbm flow, ridged into filaments, with a focus lobe that
 * follows the section in view and a horizon lift where the lattice plane
 * recedes. Drawn first, opaque, as one fullscreen triangle, so the additive
 * emitters on top of it have a stage to add to (A8.1 / A8.2).
 *
 * Every colour is a uniform fed from `field/palette.ts`; nothing here is a
 * literal. This is the fillrate-heaviest pass on the page, which is why its
 * octave count is a tier parameter.
 */

export const GROUND_VERTEX = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export function groundFragment(octaves: number): string {
  return /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2  uAspect;
uniform vec3  uInk, uGold, uSlate;
uniform vec2  uFocus;
uniform float uFocusEnergy;
uniform float uFlow;
uniform float uHorizon;

${noiseChunk(octaves)}

void main(){
  vec2 p = (vUv - 0.5) * uAspect;
  float t = uTime;

  // Domain-warped flow: current through a mesh, not decorative noise.
  vec2 q = vec2(fbm(p * 1.35 + vec2(0.0, t * 0.014)),
                fbm(p * 1.35 + vec2(5.2, 1.3) - t * 0.011));
  vec2 r = vec2(fbm(p * 1.35 + 1.85 * q + vec2(1.7, 9.2) + t * 0.009),
                fbm(p * 1.35 + 1.85 * q + vec2(8.3, 2.8) - t * 0.007));
  float f = fbm(p * 1.35 + 1.7 * r);

  float filament = pow(1.0 - abs(f * 2.0 - 1.0), 7.0);   // ridged -> filaments
  float sheet    = smoothstep(0.42, 0.92, f);

  // Attention: the field concentrates under whatever section is in view.
  vec2 d = (vUv - uFocus) * uAspect;
  float focus = exp(-dot(d, d) * 1.25);

  // Horizon lift: light gathers where the lattice plane recedes.
  float horizon = exp(-pow((vUv.y - uHorizon) * 5.2, 2.0));

  float energy = (0.34 + 0.66 * focus) * uFocusEnergy;

  vec3 col = uInk;
  col += uSlate * (sheet * 0.038 + filament * 0.034) * energy;
  col += uGold  * filament * (0.075 + 0.30 * focus) * uFlow * energy;
  col += uGold  * horizon * (0.020 + 0.055 * focus) * energy;
  col += uGold  * focus * 0.030 * energy;

  // Vertical settle, so the top of the frame stays genuinely black.
  col *= mix(0.70, 1.0, smoothstep(0.99, 0.20, vUv.y));
  col += uInk * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`;
}
