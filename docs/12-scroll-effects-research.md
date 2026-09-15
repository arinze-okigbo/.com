# 12 — Scroll Effects, Generative Shapes and Shader Research

**Status:** research. No code in this repo has been changed.
**Scope:** scroll choreography, generative/shader backgrounds, structural geometry, and — the highest-value item — a concrete restaging proposal for the existing cryptographic attestation lattice.
**Date:** 2026-09-11.

---

## 0. Brief, as amended

Two mid-task corrections from the site owner are folded in:

1. **"Fire theme" is not literal.** It means "make it stunning". The gold identity stands: `#D1A954` dark / `#7C5E1D` light (`docs/04` §3.4, override **[DEV-6]**). The literal-flame research line (ember particles, heat distortion, flame noise) is **cut** — see §5 for the one salvageable idea, which is *emissive gold*, and which is now part of the lattice proposal rather than a theme of its own.
2. **The JS budget is relaxed.** Spend freely provided Lighthouse stays above 90. Current state is 100/100/100/100 at 114 kB of JS, so roughly 85 kB of headroom exists. GSAP + ScrollTrigger (~22–28 kB gz) is back on the table and is priced honestly in §8.
3. **Accessibility is not relaxed.** WCAG 2.2 AA stands. Every technique below carries a real `prefers-reduced-motion` story, and any technique that breaks keyboard use or JS-disabled content is disqualified regardless of how it looks.

### 0.1 What is already in the box

| Thing | State | Source |
| --- | --- | --- |
| Next 15.5 App Router, React 19, Tailwind 4 | shipped | `package.json` |
| Lenis 1.1 | shipped, smooth scroll | `package.json` |
| OGL 1.0.11 | shipped, **16.9 kB** — includes `extras/Post.js` and `core/RenderTarget.js`, currently unused | `node_modules/ogl/src` |
| Reveals | pure CSS + `IntersectionObserver`, 280ms / 8px / `--ease-entrance` | `docs/04` §5 |
| 3D chunk | 18.3 kB deferred, **0 bytes** on first load, behind seven gates | `AttestationLive.tsx` |
| Framer Motion | removed (29.5 kB, animated nothing) | `docs/02` |
| GSAP | rejected at 45.1 kB — **this decision is now reopened**, see §8 | `docs/02` |

**The important structural fact:** OGL already ships `Post` and `RenderTarget` in the installed package. Bloom is not a new dependency. It is tree-shaken-out code we have already paid to have on disk and have not yet imported.

---

## 1. Scroll choreography

### 1.1 Browser support for native scroll-driven animations — the deciding question

This is the load-bearing fact for everything in §1, so it gets its own answer before the catalogue.

| Engine | State as of Q3 2026 |
| --- | --- |
| **Chrome / Edge** | 115+, full, compositor-threaded |
| **Safari** | **Shipped in Safari 26 (Sept 2025).** Threaded scroll-driven animations landed in **26.4**; progress-accuracy and `animation-play-state` bugs were cleaned up in **26.5** (June 2026) |
| **Firefox** | Partial — still behind `layout.css.scroll-driven-animations.enabled` in the stable channel per current reporting, though some trackers list 132+ as supporting. **Treat Firefox as not-supported and enhance progressively.** |
| **Global** | ~84% mid-2026 |

**Verdict: yes, use it.** Safari — which was the blocker and the deciding factor — has had it for a year and has had a bug-fix cycle on it. The correct posture is: author the *resting* state so the page is complete and correct without the timeline, then attach `animation-timeline` inside `@supports (animation-timeline: view())`. Firefox and the ~16% tail get the static composition, which must be good on its own anyway.

Two caveats that matter here specifically:

- **Lenis is compatible.** Lenis drives the real document scroll position (it calls `scrollTo`, it does not transform a wrapper), so `scroll()` and `view()` timelines sample the interpolated position and follow it frame-for-frame. This is *not* true of transform-based smooth-scroll libraries. We are on the right one.
- **The `@property` trick is the unlock.** `@keyframes` cannot select another element. The workaround — and it is the technique that makes CSS-only choreography actually expressive — is to animate a registered custom property on a container and read it off the cascade in descendants:

```css
@property --resolve { syntax: "<number>"; inherits: true; initial-value: 0; }

section.stage {
  animation: scrub linear both;
  animation-timeline: view();
  animation-range: cover 0% cover 100%;
}
@keyframes scrub { from { --resolve: 0 } to { --resolve: 1 } }

.stage h2 { opacity: var(--resolve); transform: translateY(calc((1 - var(--resolve)) * 24px)) }
.stage .rule { scale: var(--resolve) 1 }
```

One timeline, arbitrarily many choreographed children, zero JS, compositor-threaded where the property feeds `transform`/`opacity`.

### 1.2 Catalogue

Cost column = additional gzipped JS. "Android risk" assumes a Moto G Power-class mid-tier device.

---

**C1 — Reveal-on-scroll with real staging**

*What it is.* What the site already does, but with the timidity removed. Today: 280ms, 8px travel, one curve, fires once. What impresses: travel of 24–40px, a blur or scale component, per-child stagger derived from index, and a **directional** relationship to scroll (elements entering from the bottom rise; elements leaving sink).

*Implementation without GSAP.* `animation-timeline: view(); animation-range: entry 0% cover 30%`. The stagger comes from `animation-delay` — which on a view timeline is expressed as a *range shift*, so use `animation-range-start: entry calc(0% + var(--i) * 4%)`. Falls back to the existing `IntersectionObserver` + CSS class for Firefox.

*Cost.* **0 kB** — it can actually *delete* the IntersectionObserver reveal controller on supporting browsers.
*Support.* Safari 26+, Chrome 115+. Fallback path already exists.
*Android risk.* None. Compositor.
*Reduced motion.* `@media (prefers-reduced-motion: reduce) { * { animation-timeline: none !important } }` plus the existing M1 rule that renders elements at final state in first paint. The existing substitution table (`docs/04` §6.1) already covers this correctly.

---

**C2 — Sticky stacking cards**

*What it is.* A vertical deck where each card sticks and the next slides up onto it. Reads as deliberate and expensive; costs almost nothing. Good candidate for the project/case-study list.

*Implementation.* `position: sticky` applied to the card's **inner content**, not the card, with a staggered `top`. The wrapping element carries `animation-timeline: view()` on the `entry-crossing` range and each card's content is assigned a slice of that range, so you get scale-down + dim on the outgoing card for depth.

```css
.card { position: sticky; top: calc(6rem + var(--i) * 1.25rem) }
.card-wrap { animation: settle linear both; animation-timeline: view(); animation-range: exit 0% exit 100% }
@keyframes settle { to { scale: .92; filter: brightness(.6) } }
```

*Cost.* **0 kB.**
*Support.* `position: sticky` universal; the settle animation degrades to "cards stack without dimming" in Firefox — perfectly acceptable.
*Android risk.* Low. `filter: brightness()` on a large card promotes a layer; keep the card count under ~6 and avoid `backdrop-filter`.
*Reduced motion.* Drop to a plain stacked list — remove the sticky positioning entirely so nothing moves relative to the viewport. Sticky *is* motion for a vestibular-sensitive reader.

---

**C3 — Pinned section with a scrubbed internal sequence**

*What it is.* The section holds the viewport for 200–300vh while its contents advance through discrete states. This is the shape the lattice wants (§5, M6).

*Implementation without GSAP.* A tall outer container with an inner `position: sticky; top: 0; height: 100svh`. The outer container carries the timeline. No pin-spacer arithmetic is needed because sticky *is* the pin.

```css
.pin-outer { height: 280svh }
.pin-inner { position: sticky; top: 0; height: 100svh; overflow: clip }
.pin-outer { animation: act linear both; animation-timeline: view(); animation-range: contain 0% contain 100% }
```

For a WebGL surface, don't use a CSS timeline at all — keep the existing pattern in `runtime/scroll.ts` (progress written to a ref, read inside the rAF loop). It is already correct, framework-free, and avoids a CSS→JS handoff.

*Cost.* **0 kB.**
*Support.* Universal for the pin; the scrub is `@supports`-gated or ref-driven.
*Android risk.* Low for DOM. The risk is what you render *inside* the pin — see §6.
*Reduced motion.* Un-pin. `height: auto` on the outer, `position: static` on the inner, and the contents render as a stacked static composition at their final state. This must be authored as a real layout, not a degraded one.

---

**C4 — Horizontal scroll passage**

*What it is.* A section where vertical scroll translates a wide track sideways. High impact, high annoyance risk, and the single worst technique for accessibility if done carelessly.

*Implementation.* Same sticky pin as C3, with the inner track translated by the timeline:

```css
.h-track { animation: pan linear both; animation-timeline: view(); animation-range: contain 0% contain 100% }
@keyframes pan { to { translate: calc(-100% + 100vw) 0 } }
```

*Cost.* **0 kB** natively. GSAP's `containerAnimation` is the one thing GSAP genuinely does better here — it lets *nested* ScrollTriggers fire against the horizontal position, which native CSS cannot express.

*Support.* Safari 26+/Chrome; needs a `@supports` fallback to a natively horizontally-scrollable region (`overflow-x: auto; scroll-snap-type: x mandatory`), which is arguably the better experience anyway.

*Android risk.* Moderate. Translating a very wide track forces a large layer; cap track width and use `content-visibility: auto` on off-screen panels.

*Reduced motion & keyboard — this is the disqualifier.* Hijacked horizontal scroll routinely strands keyboard users: tabbing to an item inside the track scrolls the *track's* scroll container, desyncing it from the pin. **Recommendation: do not ship a scroll-hijacked horizontal passage on this site.** If a horizontal register is wanted, ship a genuinely horizontally-scrollable, snap-aligned, keyboard-scrollable strip with visible affordances. It is 90% of the impression and none of the risk.

---

**C5 — Scroll-linked 3D camera moves**

*What it is.* Scroll drives camera position/rotation in the WebGL scene rather than driving DOM. The most "expensive-looking" technique per byte on this list, because the parallax is real rather than faked by layers.

*Implementation.* Already 90% built here. `createScrollProgress(host)` writes progress; the rAF loop reads it. Add camera authoring to that read:

```js
const p = scroll.read();                       // 0..1
camera.position.z = 3.4 - 0.75 * easeGlide(p); // dolly in
camera.position.y = 0.12 * p;
camera.rotation.y = (p - 0.5) * 0.14;          // ~8° sweep
```

Critically: a *dolly* (position change) produces real parallax between depth layers; a *zoom* (fov change) does not and looks flat. Dolly.

*Cost.* **0 kB.** A dozen lines in the existing loop.
*Support.* Wherever WebGL2 runs; already gated.
*Android risk.* None — it is a matrix update, not more fragments.
*Reduced motion.* Camera frozen at a chosen hero framing (recommend p = 0.82, structure legible, still some entropy at the edges). Under the existing Gate 1 the chunk is never downloaded at all, so this is really a statement about the poster's framing.

---

**C6 — Text that assembles on scroll**

*What it is.* A headline that resolves from disorder into type. On *this* site it is not a gimmick — it is the same idea as the lattice (entropy → structure) expressed in the typographic register, which is a rare instance of an effect that is actually *about* something.

*Implementation.* Split to spans at build time (or via `Intl.Segmenter` at runtime, ~0 kB, grapheme-safe), keep the full accessible string on the parent with the spans `aria-hidden`, and drive per-character offset from an index custom property:

```css
.assemble span {
  --d: calc(var(--i) / var(--n));
  opacity: var(--resolve);
  transform: translateY(calc((1 - var(--resolve)) * var(--jitter) * 1px));
  filter: blur(calc((1 - var(--resolve)) * 3px));
}
```
with `--resolve` scrubbed by C3's timeline and `--jitter` seeded per character from the *signature bytes* — which ties the headline to the same entropy source as the lattice. That is the detail that makes it feel authored rather than applied.

*Cost.* **0 kB** if split at build time; **~0.4 kB** for a runtime `Intl.Segmenter` splitter.
*Support.* Universal for the CSS; timeline `@supports`-gated.
*Android risk.* Low-moderate — per-character `filter: blur()` on a long headline is the expensive part. Cap it to the hero headline only, ≤60 characters, and drop blur below the capability floor.
*Reduced motion.* Text renders complete, in place, at first paint. **Never** ship this such that the text is invisible without the animation — the spans must be `opacity: 1` by default and the animation must only be able to *remove* opacity on browsers that will also restore it.

---

**C7 — Scroll-linked depth parallax on static layers**

*What it is.* Background, midground, foreground translate at different rates. Cheap, and it is what sells "there is space here".

*Implementation.* `animation-timeline: scroll(root)` with different `translate` end values per layer. Never use `background-attachment: fixed` — it is a known repaint disaster on mobile Safari.

*Cost.* **0 kB.**
*Android risk.* Low, if layers are `transform`-only and count ≤ 3.
*Reduced motion.* All layers static. Composition must read without the offset.

---

**C8 — Scroll progress and state indicators**

*What it is.* A hairline progress rule, or a nav item that marks itself current as its section passes. Small, but it is the thing that makes a long page feel engineered.

*Implementation.* `animation-timeline: scroll(root block)` scaling a 1px bar. For "current section", `scroll-state(contain)` / `container-type: scroll-state` where available; `IntersectionObserver` otherwise (already in the codebase).

*Cost.* **0 kB.**
*Reduced motion.* The bar's *position* is information, not decoration — keep it. It is not an animation; it is a continuous mapping of state. Do not suppress it.

---

## 2. Generative and shader-based backgrounds

Ordered by ratio of impact to risk for this specific site.

---

**G1 — Ordered-dither / Bayer gradient (recommended)**

*Why it suits this site.* A dithered gradient is a *quantised* gradient. It reads as a print process, an early graphics mode, a signal being sampled — it is visually adjacent to cryptography and data in a way that an aurora blob is not. It is also the single cheapest good-looking background on this list.

*GLSL approach.* A 4×4 or 8×8 Bayer threshold matrix quantising a smooth gradient:

```glsl
float bayer4(vec2 p) {
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  // 4x4 ordered dither matrix / 16.0
  float m[16];
  m[0]=0.;m[1]=8.;m[2]=2.;m[3]=10.;
  m[4]=12.;m[5]=4.;m[6]=14.;m[7]=6.;
  m[8]=3.;m[9]=11.;m[10]=1.;m[11]=9.;
  m[12]=15.;m[13]=7.;m[14]=13.;m[15]=5.;
  return m[y*4+x] / 16.0;
}

void main() {
  float g = smoothstep(0.0, 1.0, vUv.y + 0.2 * sin(vUv.x * 3.0 + uTime * 0.1));
  float t = bayer4(gl_FragCoord.xy);
  float steps = 6.0;
  float q = floor(g * steps + t) / steps;      // dithered quantise
  gl_FragColor = vec4(mix(uDark, uGold, q), 1.0);
}
```

*CSS-only equivalent.* `repeating-conic-gradient` at 2px with a `mask-image: linear-gradient(...)` gets a surprisingly close 2-tone dither for free, no canvas.

*Cost.* **0 kB** in CSS; **~0 kB marginal** in GLSL if it shares the existing OGL context as a fullscreen triangle behind the lattice.
*Android risk.* Very low — one fullscreen pass, no texture fetch, no loop.
*Reduced motion.* Freeze `uTime`. A static dithered gradient is still the whole effect; the animation is the least of it.

---

**G2 — Grainy gradient (CSS, no canvas)**

The `feTurbulence` technique: generate fractal noise in an inline SVG filter, layer it under a gradient, then crush it with `contrast`/`brightness` so mid-tones dither toward black and white.

```html
<svg><filter id="grain">
  <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
</filter></svg>
```
```css
.grain { background: linear-gradient(to right, var(--gold), transparent), url(#grain);
         filter: contrast(170%) brightness(1000%) }
```

*Practical caution.* `filter: contrast()/brightness()` at those magnitudes over a large area is a real paint cost. The safe production form is to **rasterise the turbulence once** to a small tiling PNG/WebP (128×128, ~3 kB) and `background-repeat` it with `mix-blend-mode: overlay` at 4–7% opacity. Same look, no live filter.

*Cost.* ~3 kB image, 0 kB JS.
*Android risk.* Low with the rasterised form; **moderate-to-high** with the live filter. Use the raster.
*Reduced motion.* Static grain is static — no concern. Animated grain (re-seeding per frame) **must** be disabled; flickering luminance is a photosensitivity risk and there is no argument for keeping it.

---

**G3 — Mesh gradient**

Multiple overlapping `radial-gradient`s at different positions blended into a liquid field. Animate by moving the stop positions via registered `@property` custom properties (positions are not interpolable otherwise).

*Cost.* 0 kB.
*Android risk.* Moderate if animated — a full-viewport repaint of 4–6 stacked radial gradients every frame is not free. Mitigate by animating a `translate` on a pseudo-element larger than the viewport instead of animating the gradient stops.
*Honest assessment for this site.* Mesh gradients are the single most over-used background of the last three years and read as "AI startup landing page". Skip, or use only as a very low-opacity underlay beneath the dither.

---

**G4 — Flow field / curl-noise particle drift**

Particles advected by a divergence-free curl-noise vector field. Divergence-free is the point: the field has no sinks, so particles never pool.

```glsl
vec3 curl(vec3 p) {
  const float e = 0.01;
  float x = snoise(p + vec3(0,e,0)).x - snoise(p - vec3(0,e,0)).x;
  float y = snoise(p + vec3(0,0,e)).x - snoise(p - vec3(0,0,e)).x;
  float z = snoise(p + vec3(e,0,0)).x - snoise(p - vec3(e,0,0)).x;
  return normalize(vec3(x, y, z)) / (2.0 * e);
}
```

*Relevance here.* Do **not** ship this as a separate background. Ship it as **Act I of the lattice** (§5, M6) — the entropy state. It is the same particles, the same draw call, a different force. That is free impact.

*Cost.* +~0.9 kB for a simplex noise implementation in the shader source (it is shader text, not JS, so it lands in the deferred chunk).
*Android risk.* Low — curl noise is ALU work on a vertex shader running over a few thousand instances, which mobile GPUs handle fine. Fillrate, not ALU, is the mobile constraint.
*Reduced motion.* Chunk never loads (existing Gate 1).

---

**G5 — Ray-marched SDF shapes**

Beautiful, and the wrong tool here. A ray-march is a per-pixel loop — 32–128 iterations *per fragment*, full-screen. On a mid-tier Android at 1.5 DPR that is the one technique on this document that will reliably drop frames and drain battery. It also has no conceptual connection to the site's subject.

*Verdict: do not ship.* If a volumetric look is wanted, fake it with additive point sprites (which is exactly what §5 proposes) at a fraction of the cost.

---

**G6 — Animated film grain over WebGL**

A hash-based per-pixel noise added in the composite pass, `~0.02` amplitude, re-seeded per frame. It does one genuinely useful job: it **breaks up banding** in the dark gradient, which is exactly the failure mode a near-black stage suffers on 8-bit panels.

```glsl
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
color += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.02;
```

*Cost.* 3 lines.
*Reduced motion.* **Freeze the seed** (drop `+ uTime`). Static grain still kills the banding and does not flicker.

---

## 3. Shapes and geometry as structural design

---

**S1 — Blueprint / technical grid (strongly recommended)**

The dominant "serious technical product" motif of the current cycle — a barely-there grid of lines or dots behind hero and feature regions, at **10–20% opacity**, that you sense before you see. For a cryptography and payments engineer this is not decoration, it is register: it says *measured, specified, accountable*.

```css
.blueprint {
  background-image:
    linear-gradient(to right, color-mix(in oklab, var(--color-border) 55%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--color-border) 55%, transparent) 1px, transparent 1px);
  background-size: 32px 32px;                       /* lock to the 8px baseline */
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%);
}
```

The `mask-image` is what separates a good implementation from a cheap one: the grid must **fade out**, never meet the viewport edge as a hard ruled sheet.

*Upgrades that cost nothing.* Corner crosshairs (`+` glyphs at grid intersections via a second `background-image` of a tiny inline SVG); coordinate ticks in the mono face down the left gutter; section numbers as `§01 / 04`. These read as an instrument surrounding the content.

*Cost.* ~0.6 kB CSS. 0 kB JS.
*Support.* Universal. `mask-image` needs no prefix in any current engine.
*Android risk.* None — one repeating background.
*Reduced motion.* Static; nothing to suppress.

---

**S2 — Gradient-edge bordered panels**

A 1px border whose colour runs along a gradient — gold at one corner decaying to nothing. The clean implementation is a `::before` with `padding: 1px`, the gradient as its background, and a mask composite that punches out the interior:

```css
.edge::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
  background: linear-gradient(135deg, var(--color-accent), transparent 45%);
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}
```

*Cost.* 0 kB. *Android risk.* None. *Reduced motion.* Static.
*Note.* This is the correct replacement for the attestation figure's current flat `1px solid var(--color-border-interactive)` frame — if the figure stays framed at all, which §5 argues it should not.

---

**S3 — Diagonal section transitions**

`clip-path: polygon(...)` on section boundaries. Cheap, and effective at exactly one thing: signalling a change of register between two areas of the page.
*Caution.* Diagonal edges eat into the text safe area and can clip focus rings at the boundary. Apply the clip to a background *layer*, never to the content container.
*Cost.* 0 kB. *Reduced motion.* Static.

---

**S4 — Glow orbs**

Large blurred radial gradients behind content. Ubiquitous, and the reason they look cheap is that they are usually pure hue with no structure. The version that works: **very** low opacity (4–8%), placed to explain the composition rather than to fill it, and always with grain or dither over the top (G1/G2) so the edge quantises instead of smearing.
*Cost.* 0 kB. *Android risk.* Moderate if animated — a `filter: blur(120px)` on a large element is genuinely expensive to repaint. Pre-blur into the gradient stops instead of using `filter`.
*Reduced motion.* Static.

---

**S5 — Blob / organic shapes**

*Verdict: do not ship.* Organic blob language belongs to consumer wellness and no-code marketing. It is at odds with a cryptography and payments practice and would actively weaken the positioning. The geometric register (S1, S2, S3) is the correct one for this site, and the lattice itself is already the organic-to-ordered story.

---

## 4. Fire and ember effects — cut

Per the owner's clarification, "fire theme" means "make it excellent". The literal line of research is closed.

The one idea worth carrying forward: **emissive** treatment — additive blending, a cold-to-hot colour ramp, and a bright core with a soft halo. That is the physics of a glowing point, not the iconography of a flame. It is what makes the lattice legible and dramatic, and it is folded into §5 as M3/M4. No flames, no embers, no heat-shimmer distortion — those read as 2008 and would read worse next to this site's typography.

---

## 5. Restaging the cryptographic lattice — the proposal

> This is the highest-value section in the document. It is written to be implementable from the description.

### 5.1 Why it fails today — measured, not guessed

Read against `src/components/three/`:

| Cause | Evidence |
| --- | --- |
| **Wrong colour.** Ink is `--color-foreground-secondary` (`#A8A8A8` dark / `#5C5C5C` light), explicitly *not* accent | `constants.ts` `FIGURE_FALLBACK_*`, `runtime/color.ts` |
| **Crushed alpha.** `alpha = smoothstep(1.0, 0.35, len(vQuad)) * vFade * uOpacity`, and `vFade = mix(1, 0.3, depth) * mix(0.55, 1, resolve)`. At `uProgress = 0`, a far point renders at **0.165 alpha** | `lattice/shaders.ts` L97, L117 |
| **Too small.** `POINT_SIZE = 0.0135` world units. At `CAMERA_DISTANCE 3.4` / `FOV 32°` the visible height is `2 · 3.4 · tan(16°) ≈ 1.95` world units, so a point is **0.69% of frame height** — in a 432px-tall frame, a ~6px sprite whose solid core, after the `smoothstep(1.0, 0.35)` falloff, is about **2px** | `constants.ts`, `shaders.ts` |
| **No emission.** Standard source-alpha blending. Overlapping points do not reinforce. There is no bloom, no halo, no core | `runtime/scene.ts` — no blend func set beyond OGL's `transparent: true` |
| **Boxed.** 16:9 frame, `--container-wide` 768px, `border-radius: var(--radius-lg)`, `1px solid` border. It presents as a figure to be looked *at* | `AttestationLive.tsx` `FRAME_STYLE` |
| **Too short a runway.** Scroll progress is measured against the figure's own box, so the entire entropy→structure story plays out over roughly one element's passage | `runtime/scroll.ts`, `createScrollProgress(host)` |

Net: **~2px dots at ~16% opacity of `#A8A8A8` on `#0A0A0A`**, inside a bordered box. 1.44:1. The rendering is faithful to the brief it was given; the brief was wrong.

Nothing in that list is a concept failure. Every line is a staging decision, and every one is reversible.

### 5.2 The proposal — "The Attestation Field", in nine moves

---

**M1 — Full-bleed stage, not a boxed figure.**

Delete `FRAME_STYLE`'s `aspectRatio`, `border`, `borderRadius` and the 768px constraint. The canvas becomes `position: sticky; top: 0; inset-inline: 0; height: 100svh` inside a `280svh` outer container (C3), spanning the full viewport width, with the hero copy and the readout composited **on top of it**. It stops being an illustration of the idea and becomes the environment the page opens in.

The canvas should be `aria-hidden="true"` and purely decorative; every word of content stays in server-rendered DOM above it, so JS-disabled and keyboard use are untouched.

---

**M2 — Emissive gold, on a stage that is dark in both themes.**

Replace the single `uColor` with a two-point ramp driven by a per-point *heat* varying:

```glsl
// vertex
vHeat = resolve * (0.55 + 0.45 * aSeed.y);   // structure is hot, entropy is cold
// fragment
vec3 tint = mix(uCold, uHot, vHeat);         // uCold ≈ #3A4655 slate, uHot ≈ #D1A954 gold
tint = mix(tint, uCore, pow(vHeat, 6.0));    // uCore ≈ #FFF3D2, only the most resolved
```

**The light-mode problem and its answer.** `#D1A954` is 2.15:1 on `#FCFCFC` — it cannot carry emissive weight on a near-white page, and `#7C5E1D` does not glow. The answer is not to fight this: **make the attestation section a permanently dark stage in both themes.** A dark band that the light-mode page enters and exits is a completely legitimate editorial move (it is what a theatre does), it resolves the contrast problem structurally rather than by compromise, and it gives the section the gravity it is asking for. The rest of the site keeps its light/dark behaviour untouched.

**Governance flag — this needs an explicit override, not a quiet edit.** `constants.ts` documents a real constraint: `docs/04` §3.5's A1–A7 accent allowlist is exhaustive, a gold point field is not on it, `docs/05` §1056 restricts accent in this figure to the `verified` glyph, and the F9 / R-GOLD-1 attention-router argument says the figure must not become the largest accent mass on the page. That reasoning was sound under the old composition. Under the new one the field **is** the page's focal moment, which is a different argument — but it must be reopened in `docs/04` §12 as a numbered override with the reasoning recorded, in the same form as [DEV-6]. Do not let a build agent silently change a constant that carries a nine-line comment explaining why it is what it is.

---

**M3 — Additive blending. This is the single highest-leverage change.**

Switch from source-alpha to additive (`gl.ONE, gl.ONE`, or `SRC_ALPHA, ONE`). Three consequences, all good:

1. **Density becomes brightness.** As the lattice resolves, points align into rows and columns and their halos overlap — so the structure *literally lights up as it orders itself*. The drama is produced by the physics of the effect rather than being animated on top of it. This is the thing that will make it memorable.
2. **It is cheaper than alpha blending on mobile GPUs**, not more expensive. Additive requires no depth sort and is a lighter ROP operation.
3. It matches what the object is: a field of emitters.

**Required companion change:** additive over a transparent canvas composited onto a light page turns to white paste. So render **opaque**: `alpha: false` on the `Renderer`, with the stage's dark dithered gradient (G1) drawn as a fullscreen triangle first, in the same context, in the same frame. This also removes `premultipliedAlpha` complications and is measurably faster to composite.

---

**M4 — Glow: a two-lobe sprite always, real bloom when the device can afford it.**

*Tier A — always on, zero extra passes.* A tight core plus a wide halo in the point fragment. This is ~80% of the bloom look for three extra ALU ops:

```glsl
float d = length(vQuad);
float core = smoothstep(0.30, 0.0, d);
float halo = smoothstep(1.00, 0.0, d); halo *= halo * halo;   // steep, cheap falloff
vec3 emit = tint * (core * 1.6 + halo * 0.28) * vFade;
gl_FragColor = vec4(emit, 1.0);                                // additive: rgb is the signal
```

*Tier B — true bloom, gated.* OGL already ships `extras/Post.js` and `core/RenderTarget.js`; the library's own `post-bloom` example is the exact pipeline:

1. Render the scene to a `Post` composite target with the composite pass disabled.
2. Run a second `Post` at **0.5 DPR** with `targetOnly: true`: bright pass `tex * step(uThreshold, length(tex.rgb) / 1.73205)` at threshold ~0.8, then alternating horizontal/vertical `blur5` passes.
3. Re-enable the composite and blend: `gl_FragColor = texture2D(tMap, vUv) + texture2D(tBloom, vUv) * uBloomStrength;`

Tier B costs roughly **+4 kB** in the deferred chunk and, more importantly, fillrate: each blur iteration is a full half-res pass. Ship **6 iterations on desktop, 2 at 0.4 DPR on mid-tier, 0 below the capability floor** (where Tier A alone carries it).

---

**M5 — Scale, density, and depth-varied size.**

- Point size up substantially, and — the part that actually creates depth — **varied by depth**: near points render as large soft bokeh, far points as sharp pinpricks. A uniform sprite size reads as a flat picture no matter how good the colour is.

```glsl
float depth01 = clamp((-viewPosition.z - DEPTH_NEAR) / DEPTH_RANGE, 0.0, 1.0);
float size = uSize * mix(2.4, 0.55, depth01) * (SIZE_JITTER_BASE + SIZE_JITTER_SPAN * aSeed.y);
```
  Simultaneously bias the halo/core mix by depth so near points are *softer* as well as larger — that is optical defocus, and it is what makes a point field feel like a volume.

- Density up. 48×28 = 1,344 instances is small for a full-bleed field. Tier the grid: **128×72 (9,216)** desktop / **96×54 (5,184)** mid / **64×36 (2,304)** low. All are one draw call; the vertex cost is negligible. **Fillrate is the only real constraint**, so trade halo radius against count, not count against quality.

- Remove the alpha floor. `DEPTH_FADE_FLOOR 0.3` and the `mix(0.55, 1.0, resolve)` multiplier exist to keep the grey field subtle. Under an emissive treatment they are the enemy. Let entropy-state points be genuinely dim but *coloured*, and let resolved points reach full emission.

---

**M6 — Three acts over ~280svh of pinned scroll.**

Keep the existing scrub mechanism — progress written to a ref in `runtime/scroll.ts`, read inside the rAF loop. It is already the right architecture; it just needs a longer runway (measured against the pin container, not the figure box) and real authorship inside it.

| Act | Progress | What happens |
| --- | --- | --- |
| **I — Entropy** | 0 → 0.35 | Points drift through a curl-noise field (G4), cold slate, wide defocus, near-points large and soft. Camera at z = 3.4. The readout scrambles hex. It should look like *noise with structure hiding in it*. |
| **II — Resolution** | 0.35 → 0.78 | The `easeGlide` stagger runs — but re-seeded as a **spatial wave** rather than by `aSeed.x` alone, so a visible front of order sweeps across the field instead of points popping in at random. Heat ramps with per-point resolve; additive overlap makes the lattice rows ignite as they align. Camera dollies 3.4 → 2.75 and sweeps ~8° on Y, so the lattice reveals itself as a *plane in space*. |
| **III — Attestation** | 0.78 → 1.0 | Fully ordered. A deterministic subset of points — selected by a predicate over the signature bytes — brightens to the hot core, and thin additive lines trace between them, drawing the `r` and `s` components as a figure in the field. The readout locks to the real base64url signature and the `verified` glyph. |

The spatial-wave change to Act II is small and matters a lot:

```glsl
// was: float staggered = clamp((uProgress - aSeed.x * STAGGER_SPAN) / (1.0 - STAGGER_SPAN), 0., 1.);
float wave = length(aLattice.xy * vec2(0.55, 1.0)) / 2.1;        // centre-out; or aLattice.x for L→R
float phase = mix(wave, aSeed.x, 0.35);                          // keep some seed jitter so it isn't mechanical
float staggered = clamp((uProgress - phase * STAGGER_SPAN) / (1.0 - STAGGER_SPAN), 0.0, 1.0);
```

Act III's connecting lines are a second, tiny draw call — a `Polyline` or a `LINES` geometry over a few dozen selected indices, additively blended, fading in over the last 22% of progress. OGL ships `extras/Polyline.js`. Budget ~1.5 kB.

---

**M7 — Parallax within the field (pointer + scroll).**

Two lines of shader, one damped value in JS, and it is the difference between a picture and a place:

```glsl
vec2 par = uPointer * (0.05 + 0.20 * depth01)
         + vec2(0.0, uScrollParallax * (0.02 + 0.10 * depth01));
viewPosition.xy += par;
```
with `uPointer` lerped in JS at ~0.06 per frame toward the normalised cursor. Zero measurable cost. Disabled entirely under reduced motion and on coarse pointers.

---

**M8 — The surrounding composition.**

The field must not be wallpaper behind a text block. Five specifics:

1. **Carve darkness for the type, don't dim the field.** Place a radial scrim exactly where the headline sits — `radial-gradient(ellipse 70% 55% at 28% 42%, rgb(10 10 10 / .93), transparent 68%)` — as a layer between canvas and copy. This is the technique that lets the field be genuinely bright and still hold 4.5:1 under the text. Verify the contrast against the *scrimmed* composite, at the field's brightest frame, not against the base background.
2. **Blueprint grid over the top (S1)** at ~8%, locked to the same 8px baseline the type uses, with corner crosshairs and coordinate ticks. It frames the lattice as something being *measured*. This is the move that ties cryptography to the layout system.
3. **The readout becomes a HUD.** Move `AttestationReadout` out of the `<figcaption>` and into a fixed bottom-left mono block in `--color-accent`, updating live: `P-256 · sig 3f9a…c1d2 · resolve 0.62 · 41ms`. Keep the honesty caption as prose — it is required by `docs/05` §3.3 and must not be lost — but it belongs after the stage, not under a box.
4. **Bleed out, don't stop.** Mask the field's bottom edge into the next section rather than ending it at a hard boundary.
5. **Give it silence.** The stage should carry the headline, the readout, and nothing else. The effect's impact is inversely proportional to how much else is competing in that viewport.

---

**M9 — The reduced-motion path must be beautiful, not merely present.**

Gate 1 stays: reduced-motion visitors never download the chunk, and pay 0 kB. But **today's poster is frame ∞ of a near-invisible shader, so it is also near-invisible** — the accessibility path currently inherits the exact failure we are fixing. That is not acceptable and it is part of this proposal, not a follow-up.

Re-author `AttestationPoster.tsx` as a *still of the new staging*: the dark stage, the gold ramp, the blueprint grid, and baked glow. The poster already groups points into `POSTER_DEPTH_BANDS = 5` depth bands with hoisted `<g>` attributes, which maps cleanly onto five `<radialGradient>` definitions — one per band, core-plus-halo — so the emissive look is reproducible in static SVG at no runtime cost. Frame it at the Act III camera. A reduced-motion visitor should get a genuinely striking still image and lose only the resolve, not the idea.

Unchanged and non-negotiable: the `forced-colors` gate stays (a WebGL surface cannot honour a forced palette); all content remains server-rendered above the canvas; nothing in the field is focusable; and the field is `aria-hidden` with the poster carrying the accessible name.

### 5.3 Cost of the full proposal

| Move | JS delta | Where |
| --- | --- | --- |
| M1 full-bleed staging | 0 kB | layout/CSS |
| M2 colour ramp | ~0.2 kB | deferred chunk (shader text) |
| M3 additive + opaque renderer | ~0.1 kB | deferred chunk |
| M4 Tier A two-lobe sprite | ~0.2 kB | deferred chunk |
| M4 Tier B OGL `Post` bloom | **~4 kB** | deferred chunk, device-gated |
| M5 density/size tiers | ~0.3 kB | deferred chunk |
| M6 three acts + spatial wave | ~0.6 kB | deferred chunk |
| M6 Act III `Polyline` | ~1.5 kB | deferred chunk |
| M7 parallax | ~0.3 kB | deferred chunk |
| M8 composition (grid, scrim, HUD) | ~0.8 kB CSS | first load |
| M9 poster re-author | 0 kB | server-rendered SVG (+~1.5 kB HTML) |
| **Total** | **first load +~0.8 kB; deferred chunk 18.3 kB → ~26 kB** | |

**First-load JS stays at ~114 kB.** The entire proposal lives in a chunk that is still gated behind reduced motion, forced colours, save-data, core count, device memory, WebGL2 availability and viewport approach.

---

## 6. Performance discipline

### 6.1 The real Lighthouse risk is not transfer size

At 114 kB with 100/100/100/100, transfer size is not what will cost points. Adding 28 kB gz of GSAP is roughly +90 kB parsed, which is on the order of **15–25 ms of TBT** on a Moto G Power-class device — nowhere near a grade change.

**The actual risk is a full-bleed additive WebGL surface starting before LCP settles.** Mitigations, all of which the codebase already has patterns for:

- Keep every existing gate in `runtime/capability.ts`.
- Keep `whenIdle(..., IDLE_TIMEOUT_MS)`. Additionally, **do not mount above the fold until LCP has fired** — subscribe a `PerformanceObserver` to `largest-contentful-paint` and mount on the entry. Moving the canvas above the fold is the one change in this document that could genuinely move the LCP number, and this is the defence.
- Keep the `IntersectionObserver` rAF halt and the `visibilitychange` halt. They are correct.
- Keep `DPR_MAX = 1.5`. Consider 1.25 when bloom is enabled — bloom passes are fillrate-quadratic in DPR.
- Budget assertion for Phase 5: **first-load JS ≤ 125 kB; deferred 3D chunk ≤ 30 kB; Lighthouse ≥ 95 on all four.**

### 6.2 Per-technique risk on a mid-tier Android

| Technique | Frame cost | Android risk | Capability gate? | Reduced motion |
| --- | --- | --- | --- | --- |
| C1 reveals (`view()`) | compositor | none | no | final state at first paint (M1 exists) |
| C2 sticky stacking | layer promote ×N | low | no | un-stick, plain list |
| C3 pinned scrub | sticky only | low | no | un-pin, static composition |
| C4 horizontal pin | wide layer | moderate | no | **disqualified** — ship a snap strip instead |
| C5 scroll camera | matrix only | none | inherits 3D gate | chunk not loaded |
| C6 text assemble | per-char blur | low–moderate | drop blur below floor | full text at first paint |
| C7 layer parallax | transform | low | no | static |
| C8 progress rule | compositor | none | no | **keep** — it is state, not decoration |
| G1 dither | 1 fullscreen pass | very low | no | freeze `uTime` |
| G2 grain (raster) | 1 composite | low | no | static; never re-seed per frame |
| G2 grain (live filter) | large `filter` repaint | **high** | yes | use raster instead |
| G3 mesh gradient | N radial repaints | moderate | yes if animated | static |
| G4 curl-noise drift | vertex ALU | low | inherits 3D gate | chunk not loaded |
| G5 ray-march | per-pixel loop | **high** | **do not ship** | — |
| G6 film grain | 3 ALU ops | none | no | freeze seed |
| S1 blueprint grid | 1 repeating bg | none | no | static |
| S2 gradient edge | mask composite | none | no | static |
| S4 glow orbs (`filter: blur`) | large repaint | moderate | pre-blur into stops | static |
| M3 additive points | ROP, cheaper than alpha | low | inherits 3D gate | chunk not loaded |
| M4B `Post` bloom | 2 targets + 2N blur passes | **moderate–high** | **yes** — 6/2/0 iterations by tier | chunk not loaded |
| M5 density tiers | fillrate ∝ halo² × count | moderate | **yes** — 128×72 / 96×54 / 64×36 | chunk not loaded |
| M7 parallax | 2 ALU ops | none | coarse-pointer gate | disabled |

**One rule that covers most of it:** on mobile GPUs the binding constraint is **fillrate and overdraw**, not instance count or ALU. Ten thousand small additive sprites are cheap; two thousand large ones are not. Tune halo radius first, count second.

---

## 7. Ranked shortlist — what would most transform this site

| # | Technique | Why it wins | Cost |
| --- | --- | --- | --- |
| **1** | **Lattice restaging M1–M5** — full-bleed, gold emissive ramp, additive blending, two-lobe halo sprite, depth-varied size and density | Converts the site's one genuinely unique asset from an empty rectangle into its centrepiece. Nothing else on this list is *about* the owner's work. Additive blending alone does most of the heavy lifting and is *cheaper* than what ships today. | ~+1 kB deferred, 0 kB first load |
| **2** | **Pinned three-act scrub M6 + composition M8** — 280svh runway, spatial resolve wave, camera dolly, scrim, blueprint grid, mono HUD | Gives the effect time to be a narrative instead of a fade, and gives the type a way to live inside it while staying AA. This is what makes it feel authored. | ~+1 kB deferred, ~0.8 kB CSS |
| **3** | **OGL `Post` bloom M4B, device-gated** | The difference between "glowing points" and "this looks like a film title sequence". Uses code already on disk. Must be gated. | ~+4 kB deferred |
| **4** | **Blueprint grid + crosshairs + coordinate ticks (S1)** | Highest impact-per-byte on the page. Sets a technical, measured register that suits a cryptography and payments engineer and ties the lattice to the layout system. | ~0.6 kB CSS |
| **5** | **Native scroll-driven reveals with `@property` (C1 + C6)** | Replaces the timid 280ms/8px reveals with real staging, and on supporting browsers can *delete* JS rather than add it. C6's assembling headline is conceptually the same idea as the lattice, in type. | 0 kB — potentially negative |

Honourable mention: **G1 dithered gradient** as the stage background (0 kB, very low risk, thematically exact), and **C2 sticky stacking** for the project list.

Explicitly **not** recommended: C4 scroll-hijacked horizontal (accessibility), G3 mesh gradients (over-used), G5 ray-marching (cost), S5 blobs (wrong register), and anything from §4.

---

## 8. Budget tiers — what each one buys

Baseline: **114 kB first-load JS**, 18.3 kB deferred 3D chunk, 100/100/100/100.

| Tier | Added | New first-load | What it buys | Verdict |
| --- | --- | --- | --- | --- |
| **T0 — CSS only** | ~1.5 kB CSS | 114 kB | Blueprint grid, scrim, gradient edges, dither-by-CSS, native scroll-driven reveals and staging, sticky stacking, pinned sections. No new dependency, no new risk. | **Ship regardless.** Roughly 50–60% of the total transformation. |
| **T1 — Shader rewrite** | +~8 kB **deferred only** | 114 kB | All of T0, plus lattice M1–M3, M5–M7: full-bleed, gold emissive ramp, additive, two-lobe halo, depth-varied size, density tiers, three acts, spatial resolve wave, camera dolly, pointer parallax, re-authored poster. **No new package.** | **This is the recommended floor.** Best value in the document by a wide margin. |
| **T2 — Bloom + lines** | +~5.5 kB deferred | 114 kB | T1 plus OGL `Post` bloom (gated) and the Act III signature polyline. Deferred chunk lands ~26 kB. | **Recommended.** Uses installed code; the gate contains the risk. |
| **T3 — Second GL surface** | +~3 kB deferred | 114 kB | A shared-context dithered/flow-field backdrop for a lower section, reusing the existing renderer. | Optional. Only if a second section genuinely needs it — a site with two WebGL moments has neither. |
| **T4 — GSAP + ScrollTrigger** | **+22–28 kB gz first load** | ~138 kB | Robust `pin: true` with pin-spacing, scroll snapping, scrub smoothing, `containerAnimation` for nested horizontal triggers, `matchMedia` breakpoint choreography, and **Firefox parity today**. Free under Webflow's 2025 relicensing (custom GreenSock licence, not MIT). | **Do not take it for what is proposed here.** Everything in §5 is delivered by `position: sticky` plus the ref-driven rAF scrub that already exists. GSAP earns its 28 kB only if you commit to a nested horizontal pinned passage (which §1 recommends against) or decide Firefox parity is required now rather than progressively. Revisit if either becomes true. |
| **T5 — Three.js + postprocessing** | +200 kB+ | ~320 kB | Nothing that OGL cannot do for this scene. | **No.** `docs/02`'s measurement (16.9 kB vs 245.7 kB) still holds and nothing here changes it. |

**Recommended package: T0 + T1 + T2.** First-load JS unchanged at ~114 kB, deferred chunk 18.3 → ~26 kB, no new dependency, Lighthouse headroom almost entirely intact — and a site that looks completely different.

---

## 9. Open questions for the owner

1. **Accent override.** The gold point field contradicts `docs/04` §3.5's A1–A7 allowlist and `docs/05` §1056. This needs a numbered override in `docs/04` §12 with reasoning, in the [DEV-6] form. Confirm before a build agent touches `constants.ts`.
2. **Permanently dark stage.** §5 M2 proposes that the attestation section is dark in *both* themes, which structurally resolves the light-mode gold contrast problem. Confirm this is an acceptable editorial move.
3. **`--duration-ceiling` exemption.** `docs/04` §5.1 asserts nothing animates longer than 320ms, exempting the attestation because it is scroll-scrubbed and durationless. The three-act scrub keeps that exemption valid, but C1's staged reveals and C6's assembling headline are also scrubbed rather than timed — worth recording so the Phase-5 assertion is written against the right rule.
4. **The honesty caption.** `docs/05` §3.3 requires it and forbids describing the figure as encryption or as a security guarantee. Moving the readout to a HUD must not displace the caption. Confirm placement.

---

## Sources

- [A guide to Scroll-driven Animations with just CSS — WebKit](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)
- [CSS scroll-driven animations — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [CSS Scroll-Driven Animations: Scroll Timelines Guide (2026) — CSSAWWWARDS](https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026)
- [Scroll-Driven… Sections — Frontend Masters](https://blog.master.dev/scroll-driven-sections/)
- [On-Scroll Animation Ideas for Sticky Sections — Codrops](https://tympanus.net/codrops/2024/01/31/on-scroll-animation-ideas-for-sticky-sections/)
- [Scroll-driven Animations: Stacking Cards (CSS)](https://scroll-driven-animations.style/demos/stacking-cards/css/)
- [Lenis — darkroomengineering](https://github.com/darkroomengineering/lenis)
- [OGL WebGL Library — examples (Post Bloom, Frame Buffer, MRT)](https://oframe.github.io/ogl/examples/)
- [LearnOpenGL — Bloom](https://learnopengl.com/Advanced-Lighting/Bloom)
- [Grainy Gradients — CSS-Tricks](https://css-tricks.com/grainy-gradients/)
- [Compute Shaders: Fire particles (curl noise vector fields) — Johan Svensson](https://medium.com/dotcrossdot/compute-shader-fire-particles-81fd253a5a0d)
- [Reduce overdraw — Android Developers](https://developer.android.com/topic/performance/rendering/overdraw)
- [High-Speed, Off-Screen Particles — GPU Gems 3, NVIDIA](https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-23-high-speed-screen-particles)
- [Building Particle Systems with Three.js & WebGL Shaders — Suboor Khan](https://www.suboorkhan.com/blogs/particle-systems-threejs-webgl-shaders)
- [Vercel aesthetic: a complete guide to Blueprint Grid design — Setproduct](https://www.setproduct.com/blog/complete-guide-to-blueprint-grid-design)
- [gsap — npm](https://www.npmjs.com/package/gsap)
- [Web Animation in 2026: CSS vs GSAP, When to Use Each](https://artofstyleframe.com/blog/web-animation-css-vs-gsap-2026/)
