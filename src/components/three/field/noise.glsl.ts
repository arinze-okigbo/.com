/**
 * Value noise and fbm, shared by the ground pass and the composite's grain.
 *
 * Kept in one place so the two passes cannot drift into two different hashes,
 * which shows up as the grain beating against the flow at low frequencies.
 */

/** Octaves used by the desktop ground pass. */
export const FBM_OCTAVES_HIGH = 5;

/** Octaves on the low tier — docs/15 §2.5 names this as the first thing to cut. */
export const FBM_OCTAVES_LOW = 3;

export function noiseChunk(octaves: number): string {
  return /* glsl */ `
float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < ${octaves.toFixed(0)}; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return s;
}`;
}
