import { SCRIM_SLOTS } from "../constants";
import { GROUND_VERTEX } from "./ground.shader";
import { noiseChunk } from "./noise.glsl";

/**
 * The post chain — bright pass, separable blur, composite.
 *
 * The composite is where A8.3 lives: the scrim is a rounded-box SDF evaluated
 * **in this shader**, carving darkness out of the field itself, feathered. It
 * is not a CSS sheet over the canvas, and that difference is the entire basis
 * of A8.4 — the pixels sampled for the contrast check are the pixels behind the
 * type. A CSS overlay would measure something other than what renders, which is
 * how a field ships "compliant" and invisible.
 *
 * docs/15 §2.6 is explicit that OGL's `extras/Post.js` is not used: this pass
 * carries the scrim SDF, the tonemap, the vignette, the grain and the ordered
 * dither, with array uniforms rewritten per frame from live DOM rects, and
 * expressing that through `Post.js`'s swap chain is more code than the chain it
 * would replace. `core/RenderTarget.js` is used directly instead.
 */

/** All three post programs draw one fullscreen triangle. */
export const POST_VERTEX = GROUND_VERTEX;

export const BRIGHT_FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tMap;
uniform float uThreshold;
void main(){
  vec3 c = texture2D(tMap, vUv).rgb;
  float l = length(c) / 1.73205;
  gl_FragColor = vec4(c * smoothstep(uThreshold, uThreshold + 0.22, l), 1.0);
}
`;

export const BLUR_FRAGMENT = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D tMap;
uniform vec2 uDirection;   // already in texel units
void main(){
  vec4 sum = texture2D(tMap, vUv) * 0.227027;
  vec2 o1 = uDirection * 1.3846153846;
  vec2 o2 = uDirection * 3.2307692308;
  sum += (texture2D(tMap, vUv + o1) + texture2D(tMap, vUv - o1)) * 0.3162162162;
  sum += (texture2D(tMap, vUv + o2) + texture2D(tMap, vUv - o2)) * 0.0702702703;
  gl_FragColor = sum;
}
`;

/**
 * `uScrim[i].xy` is the block's centre in uv, `.zw` its half-size in uv.
 * `uScrimAmt[i]` is the authored `amount` from `data-scrim="padX,padY,amount"`.
 *
 * Implementation trap, found in the prototype: these uniform values must be
 * plain `Array`s, never `Float32Array`. OGL's uniform walker only recognises
 * array uniforms (`uScrim[0]`…) when `value` passes `Array.isArray`, and
 * silently drops typed-array values with a console warning. `scrim.ts` owns
 * that and says so again there.
 */
export const COMPOSITE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D tScene, tBloom;
uniform float uBloom, uTime, uVignette;
uniform vec3  uInk;
uniform vec4  uScrim[${SCRIM_SLOTS}];
uniform float uScrimAmt[${SCRIM_SLOTS}];
uniform float uAspectX;
uniform float uFeather;

${noiseChunk(1)}

void main(){
  vec3 col = texture2D(tScene, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;

  // A8.3 — carve darkness exactly where the type sits. A rounded-box SDF over
  // the live rect of each text block, feathered asymmetrically so the field
  // stays bright right up to the edge of the column: the type is lit from
  // behind and around, never dimmed by a flat overlay.
  vec2 asp = vec2(uAspectX, 1.0);
  float carve = 0.0;
  for (int i = 0; i < ${SCRIM_SLOTS}; i++){
    if (uScrimAmt[i] <= 0.0) continue;
    vec2 d = (abs(vUv - uScrim[i].xy) - uScrim[i].zw) * asp;
    float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    carve = max(carve, uScrimAmt[i] * (1.0 - smoothstep(-uFeather * 0.30, uFeather, dist)));
  }

  // Exposure tonemap: gold rolls off, it never turns to white paste.
  //
  // THE TONEMAP COMES FIRST, AND THE ORDER IS THE WHOLE CONTRAST GUARANTEE.
  //
  // This used to carve the HDR value and tonemap the result, which quietly made
  // the authored amount mean nothing exactly where it mattered most. The scene
  // plus bloom is an HDR buffer -- on the ignited ridges it runs 5 to 8, not 1
  // -- so a carve of 0.94 left 6% of 8, which is 0.48, and the tonemap lifted
  // that back to 102/255. The carve looked applied, the amount looked authored,
  // and the string on top of it measured 3.24:1 against a floor of 4.5. The
  // brighter the field got, the less the scrim did, which is exactly backwards
  // from what a contrast floor needs.
  //
  // Carving AFTER the tonemap bounds the result by construction: col is now
  // 0..1, so the amount really is the fraction of light that survives. At 0.94
  // the worst case is 16/255 instead of 102/255. Dim regions are unchanged to
  // within a quantisation step -- the two orders agree to 3/255 at a scene
  // value of 0.1 -- so nothing about the field's look moves except in the one
  // place the defect lived.
  //
  // NO BACKTICKS IN THIS FILE BELOW THE OPENING DELIMITER. The shader is a JS
  // template literal, so a backtick in a GLSL comment closes it: the module
  // still parsed, the GLSL arrived truncated, the fragment shader failed to
  // compile, and OGL threw "Cannot read properties of undefined" once per frame
  // while the page looked merely dark. Em dashes are avoided here too, for the
  // same reason of keeping this string boringly ASCII.
  col = 1.0 - exp(-col * 1.18);
  col = mix(col, uInk * 0.34, carve);

  // Vignette, fine grain, ordered dither.
  vec2 v = (vUv - 0.5) * vec2(1.06, 1.0);
  col *= mix(1.0, 1.0 - uVignette, smoothstep(0.22, 0.95, length(v) * 1.42));
  col += (hash21(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * 0.0125;
  col += (hash21(gl_FragCoord.yx * 1.7) - 0.5) / 255.0;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`;
