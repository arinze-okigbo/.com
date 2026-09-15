# 15 — Porting Direction C ("Field") into the shipping site

**Status:** plan, ready to execute. No application code is changed by this document.
**Chosen direction:** `docs/11` Part 8, **Direction C — "Field"**. Directions A and B are not being built. The Windows 95 concept (`docs/13`, `docs/14`) is rejected and is not referenced again here.
**Source of truth for the target look:** `scratchpad/proto-c-field.html` — the working prototype. 15,088 points, one instanced draw call, 0.21 ms/frame of draw submission, body contrast **9.3:1** over the live field verified by `gl.readPixels` on real composited pixels.
**What this port is not:** a content rewrite. Every string in `docs/05` stays, in its current order, verbatim. `src/content/content.test.ts` asserts 44/44 strings and must still pass.

---

## 0. The problem being solved, in one paragraph

arinzeokigbo.com is technically excellent — Lighthouse 100/100/100/100 on production, WCAG 2.2 AA, 114 kB first-load JS, CLS 0 — and the owner's verdict on its appearance was "terrible visually." `docs/11` diagnosed why: the page has **no light source**. Flat fills, black shadows that are invisible on a near-black ground, hard edges where masks belong, and a hue-41 gold sitting on a perfectly neutral greyscale, so the accent reads as a highlighter stroke rather than an identity. The one ambitious element — a real ECDSA P-256 lattice seeded by WebCrypto — shipped at **1.44:1**, which is to say it shipped invisible, because the design system's own accent rules forced it to a grey foreground token. This document ports the prototype's staging onto the real files and, critically, **amends the rules that produced the 1.44:1 result** so the next QA pass does not undo the work.

---

## 1. Token amendments to `docs/04-design-system.md`

Three numbered deviations, continuing the existing DEV series (DEV-1 … DEV-12, plus DEV-6a), and one new subsection **F** appended to the §12.1 amendment log. `docs/04` §12.1 already establishes the rule that amendments append rather than edit history; follow it.

**Only the `design-system` lane writes `docs/04`.** See §6.

### 1.1 DEV-13 — the attestation field is an emissive surface, and gold is permitted in it

**This is the amendment the port depends on. It must land before any code in `src/components/three/` changes.**

#### The new allowlist row

Append to `docs/04` §3.5 ALLOWED, after A7:

| # | Use | Form | Component |
|---|---|---|---|
| **A8** | **The attestation field** — the single full-bleed generative surface behind the document, and the `AttestationPoster` still that stands in for it | **Emitted light only**, over an unbounded pixel area, subject to A8.1–A8.6 below. There is exactly one such surface on the site; a second is a defect. | `AttestationField`, `FieldStage`, `runtime/scene.ts`, `AttestationPoster` |

#### A8.1 — emitted, never filled

Every accent-coloured pixel in the field must arrive from an **additively blended emitter** — `gl.blendFunc(gl.ONE, gl.ONE)` on a point sprite with its own core-plus-halo falloff — or, on the poster path, from a `<radialGradient>` whose **outermost stop is `#D1A95400`**. No flat region of `--color-accent` may exist in the field at any frame. A uniform fill, a solid polygon, a `background`, a `stroke` at constant alpha, or a gradient with a non-zero outer stop is still an F4 defect **inside** the field. A8 licenses a light source; it does not license paint.

#### A8.2 — dark stage in both themes

The field's ground is `--field-ink` `#0A0908` in light mode and dark mode alike. The field never inherits `--color-background`. `#D1A954` measures **2.15:1 on `#FCFCFC`** and cannot carry emissive weight on a near-white page, and `#7C5E1D` does not glow at all. The answer is structural, not a contrast compromise: the field is a lit dark stage that the light-mode page enters and leaves, which is what a theatre does. `docs/12` §5.2 M2 states this and this amendment adopts it verbatim.

**Consequence, stated rather than discovered later:** in light mode the field is therefore **sectioned, not continuous**. It runs at full energy behind `#hero`, `#attestation` and `#ceremony`, and masks out to `--color-background` behind `#work`, `#projects`, `#about` and `#contact`. In dark mode it runs the full document height uninterrupted. This costs the "one continuous surface" reading that `docs/11` Direction C describes, in light mode only. See §7 R3 — the cleaner alternative (this page is dark-only) is an owner decision, not a build agent's.

#### A8.3 — the scrim is part of the field, not a CSS overlay

Every text block composited over the field declares `data-scrim="padX,padY,amount"`. Those live rects are packed into the composite pass as a rounded-box SDF and **carve darkness out of the field itself**, feathered, so the field stays bright right up to the edge of the type column. This is not a flat `rgba()` sheet over the canvas, and the difference matters: the pixels sampled for the contrast check **are** the pixels behind the type.

#### A8.4 — the measured floor

**≥4.5:1** for every body-size string over the field and **≥3:1** for every large-text string (`--text-h3` and above), measured per A8.3 on composited pixels at the field's **brightest authored frame** — not against `--field-ink`, and not at a resting frame chosen for being dim. The prototype measured **9.3:1** for `--field-fg-secondary` `#B9B4A9`. **Ship target: ≥7:1.** A build that measures below 4.5:1 is a defect in the scrim, not a licence to dim the field.

#### A8.5 — the field is the ground, not a group

F9 counts **marker, underline and glyph groups**. The field is none of those: it carries no information, it is `aria-hidden="true"`, nothing in it is focusable or interactive, and it is the surface that the routers sit **on top of**. It is therefore **excluded from F9's per-viewport count** — a third named exception alongside A3 (the focus ring) and A4 (the primary CTA), and a narrower one: A3 and A4 are excluded because each is capped at one occurrence; the field is excluded because it is the page's substrate and there is exactly one of it. No other accent-bearing recipe gains anything from this exclusion. What F9 still forbids is unchanged: a second underline group, a second marker set, an accent eyebrow, accent icons, an accent rule.

#### A8.6 — poster and canvas change together

`docs/04` §8.4's existing rule stands and now binds harder. `AttestationPoster.tsx` and the GL scene are **one artifact on two surfaces**. A change to the ramp, the point size, the camera, the density or the band count in one that is not made in the other is a defect, and the cross-fade will show it as a visible hue or scale shift.

#### F4's exception list becomes three

Amend the F4 scale-rule table in §3.5:

> **Forbidden**, with exactly **three** exceptions: `--color-accent-tint` as `::selection` (A6); the `primary` Button fill (A4, capped at one per viewport by its own allowlist row); **and the attestation field (A8), under the six conditions A8.1–A8.6.**

#### R-GOLD-2 is amended

Current text: *"Accent text (A7, the readout marker) may sit only on `--color-background` or `--color-surface`. It may never sit over the hero poster image, whose local luminance is indeterminate."*

Amended: accent text may **also** sit over the field, and **only** where a `data-scrim` block carves it, with the A8.4 measurement as the evidence. The field's local luminance is no longer indeterminate — it is measured. The HUD readout is the one such element; it is **A7 re-sited, not a new allowlist row**.

#### §2.6 (elevation) is amended

§2.6 currently forbids content shadows (DEV-3: "No content shadows; one `--shadow-overlay` for the nav sheet"). Direction C's panels are lit objects and need both halves of a light source. Add:

> **Panels composited over the field** (`.panel`, the readout, the work entries while the field is behind them) may carry `--shadow-panel: 0 40px 100px -50px #000` **together with** `--edge-lit: inset 0 1px 0 #FFFFFF1F` and a `::before` hairline gradient. The two are a pair and neither ships alone: a drop shadow with no lit edge is the black-shadow-on-near-black failure `docs/11` §3 move 3 names. Panels **not** over the field keep the DEV-3 rule and carry no shadow.

#### §2.7 (stacking) is amended

Add `--z-field: 0` and `--z-grid: 1`, declared in the non-utility `:root` block beside `--z-header: 2` and `--z-skip: 3`, so the field and the blueprint grid sit below the sticky header and below the skip link. Content is `--z-content: 1` — no, it is unstyled and sits in normal flow above `--z-grid` by document order; do not add a token for it. A bare numeric `z-index` remains a defect.

#### What this override reverses, and why the reversal is correct

`src/components/three/constants.ts` carries a nine-line comment explaining that the point field must be `--color-foreground-secondary` because A1–A7 is exhaustive, because `docs/05` §1056 restricts accent in the figure to the `verified` glyph, and because an 830×466 gold mass would make the figure the largest accent region on the page and defeat F9 and the R-GOLD-1 attention-router argument.

**That reasoning was correct for the composition it was written against, and it is wrong for this one.** Under the old composition the field was a boxed illustration on screenful 3, competing with the page's routers for a reader's attention. Under this one it is the page's ground, and there is nothing for it to compete with — the routers sit on top of it and are brighter than it is. The measured cost of the old rule is already on the record: the lattice shipped at **1.44:1** (`docs/12` §5.1), and the accessibility path inherited the same failure because the poster is frame ∞ of the same shader.

#### Instruction to `review-design-qa` and to any future fix pass — binding

> The gold field is **A8-compliant by design**. Filing it as an F4 or F9 defect, or "fixing" it by substituting `--color-foreground-secondary`, `FIGURE_FALLBACK_DARK` or `FIGURE_FALLBACK_LIGHT` into the field's ramp, **is itself the defect**. That substitution is what produced the 1.44:1 regression and it must not be made again.
>
> The Phase-5 accent enumeration must resolve the field to **A8** and then check the two things that can actually be wrong here: **A8.1** (is any pixel of the field a flat fill rather than an emitter?) and **A8.4** (does every string over the field clear its measured floor?).
>
> `FIGURE_FALLBACK_DARK` and `FIGURE_FALLBACK_LIGHT` are **deleted from `constants.ts` by this amendment**, in the same commit, so there is no grey value left in the module for a later pass to reach for.

Add one row to §13's Phase-5 checklist: *"The field resolves to A8. Substituting a foreground token into the field ramp is the defect, not the fix."*

### 1.2 DEV-14 — the warm neutral ladder replaces the neutral greyscale

`docs/11` §5.2's finding, adopted: *a warm accent on a cold ground reads as a highlighter mark; a warm accent on a warm ground reads as an identity.* Hue held at 41, saturation 6–8%, lightness matched so nothing about contrast compliance changes materially. Amends §3.2 and §3.3.

**Dark mode:**

| Token | From | To | Measured on new ground |
|---|---|---|---|
| `--background` | `#0A0A0A` | **`#0C0B0A`** | — |
| `--surface` | `#141414` | **`#161513`** | — |
| `--surface-raised` | `#1C1C1C` | **`#1F1E1C`** | — |
| `--overlay` *(new, 5th step)* | — | **`#2A2925`** | — |
| `--foreground-strong` | `#FCFCFC` | **`#F2EFE8`** | 17.13:1 |
| `--foreground` | `#EDEDED` | **`#EDE9E1`** | 16.25:1 |
| `--foreground-secondary` | `#A8A8A8` | **`#A8A29A`** | 7.78:1 |
| `--foreground-muted` | `#8A8A8A` | **`#8C877E`** | 5.51:1 on ground — **must be re-measured on `#1F1E1C`** |
| `--foreground-faint` | `#4A4A4A` | **`#423F38`** | non-text only, unchanged role |

**The `--foreground-muted` re-measurement is not optional.** `docs/11` §5.4 says so explicitly, and it is the same check that caught the real failures in DEV-5 — both `docs/01` muted values passed on the page background and failed on a raised surface. Predicted ≈4.75:1 on `#1F1E1C`. **If it lands under 4.5:1 the value moves (candidate: `#948F85`), the bar does not.**

**Light mode:** surfaces move to the Radix `gold` light ladder — `--background: #FDFDFC`, `--surface: #FAF9F2`, `--surface-raised: #F2F0E7`, `--overlay: #EAE6DB`. `--accent: #7C5E1D` is unchanged. **Every one of the four light text values and both accent values must be re-measured against all four new surfaces and the §3.6 matrix reprinted.** Any value that drops below its current figure moves; the 4.5:1 / 3:1 bars do not.

**New token group — `--field-*`, dark in both themes, field-scoped only:**

```
--field-ink:           #0A0908   /* the stage ground */
--field-cold:          #3A4655   /* entropy / low-energy emitters */
--field-hot:           #D1A954   /* = dark --accent. Referenced, never retyped. */
--field-core:          #FFF3D2   /* hot core, most-resolved points only */
--field-fg:            #EDE9E1   /* type over the field */
--field-fg-secondary:  #B9B4A9   /* body over the field — the 9.3:1 value */
--field-fg-muted:      #9C978C
--field-rule:          #FFFFFF14
--field-panel:         #FFFFFF05
```

These are **not** added to `@theme`. They are non-utility tokens in the `:root` block, so Tailwind generates no `field-*` utilities and nothing outside the `.stage` scope can reach them by accident.

### 1.3 DEV-15 — the light-source system

`docs/11` §3 move 1 (*give the page a light source, and make it a variable*), moves 3, 5 and 8. Amends §2.6 and adds a new §2.8.

```
--light-x: 50%;        /* the single light origin, on :root */
--light-y: -10%;       /* off-canvas above the fold */
--glow-near:  #D1A95433
--glow-mid:   #D1A9541F
--glow-far:   #D1A95400   /* every glow fades to THIS, never to `transparent` */
--edge-lit:   inset 0 1px 0 #FFFFFF1F
--shadow-panel: 0 40px 100px -50px #000
--grain-opacity: 0.20
```

Three binding rules:

1. **Every gold glow fades to `#D1A95400`, never to `transparent`.** `transparent` is `rgba(0,0,0,0)` and interpolates through grey, which is the visible dirty band on every gradient in the current build (`docs/11` §3 move 5).
2. **No shadow without a lit edge.** See the §2.6 amendment in 1.1.
3. **One light origin.** `--light-x` / `--light-y` live on `:root` and every lit edge on the page is a radial gradient anchored to them. Under `prefers-reduced-motion: reduce` they freeze at their default; with JS off they resolve to their declared default. Nothing on the page reads a second light position.

Grain: one layer, 20% opacity, under 60% contrast, on its own composited layer, over everything except the field (the field carries its own grain and ordered dither inside the composite pass, which is where it belongs — a CSS grain layer over an additive surface double-dithers and banding returns).

---

## 2. The lattice restaging — changes to real files under `src/components/three/`

The concept does not change. Real ECDSA P-256 via WebCrypto, seeding a point lattice in OGL, one instanced draw call. **Every change below is staging.** `docs/12` §5.1's finding stands: nothing in the failure list was a concept failure.

### 2.1 Module layout after the port

```
src/components/three/
  AttestationField.tsx      NEW   server wrapper, mounted once in layout.tsx
  FieldStage.tsx            REN   from AttestationLive.tsx — the client gate + fixed host
  FieldHud.tsx              NEW   the mono readout, server-rendered, patched imperatively
  AttestationPoster.tsx     REWR  a still of the NEW staging
  AttestationReadout.tsx    KEEP  still used as prose inside #attestation
  AttestationFigure.tsx     DEL   the boxed figure is gone
  constants.ts              EDIT  geometry, density, camera, palette
  index.ts                  EDIT  public surface
  field/                    NEW
    ground.shader.ts              BG_VERT / BG_FRAG — fbm, domain warp, focus, horizon
    point.shader.ts               moved from lattice/shaders.ts, rewritten
    trace.shader.ts               the r/s polylines
    post.shader.ts                bright / blur / composite + scrim SDF + tonemap + grain
    post-chain.ts                 RenderTarget allocation, HDR probe, blur ladder
    scrim.ts                      [data-scrim] rects -> 6 uniform slots
    attention.ts                  SECTION_STATE + IntersectionObserver
    palette.ts                    --field-* tokens as linear float triples
  lattice/
    seed.ts                 EDIT  + flare attribute, + buildSignatureTraces
    project.ts              EDIT  Act III camera, 5 bands, gradient ids
    shaders.ts              DEL   contents move to field/point.shader.ts
  runtime/
    scene.ts                REWR  4-pass composition
    mount.ts                EDIT  fixed full-viewport host, not the figure frame
    scroll.ts               EDIT  progress measured against the document, not a box
    capability.ts           EDIT  + bloom tier, + LCP gate
    color.ts                EDIT  retargeted to --field-*; P3 hardening kept verbatim
    color.test.ts           EDIT  same cases, new token names
```

### 2.2 M1 — full-bleed, not boxed

- `FieldStage.tsx`: delete `FRAME_STYLE` entirely — `aspectRatio`, `borderRadius`, `border`, the 768px constraint. The host becomes `position: fixed; inset: 0; z-index: var(--z-field); pointer-events: none`.
- `mount.ts`: `HOST_CSS` becomes the fixed full-viewport rule; the canvas fills it at `width:100%;height:100%`.
- `AttestationField.tsx` mounts **once**, in `src/app/layout.tsx`, before `{children}`. It is not a child of any section. This is what makes it the page's ground rather than a figure inside one.
- `scroll.ts`: `createScrollProgress(host)` currently measures against the figure's own box, which gave the whole entropy→structure story one element's passage of runway. It measures against `document.documentElement` now, normalised to the `#attestation` section's own passage for Acts II and III.
- The canvas stays `aria-hidden="true"`, unfocusable, `tabIndex = -1`. Every word of content stays in server-rendered DOM above it.

### 2.3 M2 — the cold-slate → gold → hot-core ramp

`field/point.shader.ts`, replacing the single `uColor`:

```glsl
// vertex
float twinkle = 0.88 + 0.12 * sin(uTime * 0.8 + aSeed.x * TAU * 3.0);
vHeat  = placed * (0.46 + 0.54 * aSeed.y) * mix(0.72, 1.35, aFlare) * twinkle;
vFlare = aFlare;

// fragment
float h   = clamp(vHeat, 0.0, 1.35);
vec3  tint = mix(uCold, uHot, smoothstep(0.02, 0.80, h));
tint = mix(tint, uCore, pow(clamp(h, 0.0, 1.0), 5.0) * (0.45 + 0.55 * vFlare));
```

`uCold = --field-cold #3A4655`, `uHot = --field-hot #D1A954`, `uCore = --field-core #FFF3D2`. Read through `runtime/color.ts`, which keeps its P3 parse hardening and its unit tests unchanged in substance — the `(?<![\w.])` boundary guard and the `fn(` + colour-space-keyword strip are both load-bearing and both stay. That defect (the lattice rendering **salmon** because `display-p3`'s `3` parsed as the red channel) will recur the moment either defence is dropped.

**Delete `FIGURE_FALLBACK_DARK` and `FIGURE_FALLBACK_LIGHT`** and their nine-line comment, replacing the comment with a pointer to DEV-13/A8. Per §1.1, this is deliberate: leaving a grey value in the module is leaving the regression loaded.

### 2.4 M3 — additive blending, opaque renderer

The single highest-leverage change.

```js
pointProgram.setBlendFunc(gl.ONE, gl.ONE);
traceProgram.setBlendFunc(gl.ONE, gl.ONE);
```

Required companion, non-optional: the renderer becomes **opaque**.

```js
new Renderer({ canvas, dpr, alpha: false, antialias: false,
               depth: false, premultipliedAlpha: false, autoClear: false })
gl.clearColor(INK[0], INK[1], INK[2], 1);
```

Additive over a transparent canvas composited onto a light page turns to white paste. The ground (2.5) is drawn first, as a fullscreen triangle, in the same context and the same frame. Density becomes brightness: as the lattice resolves, rows and columns align and their halos overlap, so **the structure lights up as it orders itself** — the drama is produced by the physics of the effect rather than animated on top of it.

### 2.5 The ground pass — `field/ground.shader.ts`

New, and it is half of what makes the field read as *systems* rather than as a point cloud: a domain-warped fbm flow, ridged into filaments, with a focus lobe that follows the section in view and a horizon lift where the lattice plane recedes.

```glsl
vec2 q = vec2(fbm(p*1.35 + vec2(0.0, t*0.014)), fbm(p*1.35 + vec2(5.2,1.3) - t*0.011));
vec2 r = vec2(fbm(p*1.35 + 1.85*q + vec2(1.7,9.2) + t*0.009),
              fbm(p*1.35 + 1.85*q + vec2(8.3,2.8) - t*0.007));
float f        = fbm(p*1.35 + 1.7*r);
float filament = pow(1.0 - abs(f*2.0 - 1.0), 7.0);
float sheet    = smoothstep(0.42, 0.92, f);
```

5-octave fbm, so this is the fillrate-heaviest pass on the page and the first thing to cut on the low tier (drop to 3 octaves). Composited: `uInk + uSlate*(sheet*0.038 + filament*0.034)*energy + uGold*filament*(0.075 + 0.30*focus)*uFlow*energy + horizon and focus terms`, then a vertical settle so the top of the frame stays genuinely black.

### 2.6 M4 — two-lobe core+halo sprites, and bloom

**Tier A, always on, zero extra passes.** Three extra ALU ops for ~80% of the bloom look:

```glsl
float soft     = 1.0 - vDepth;                 // 1 = near = optically defocused
float coreEdge = mix(0.42, 0.09, vDepth);
float core     = smoothstep(coreEdge, 0.0, d);
float halo     = smoothstep(1.0, 0.0, d); halo = halo*halo*halo;
float coreAmp  = mix(2.15, 0.62, soft);        // near: less core, more halo
float haloAmp  = mix(0.15, 0.44, soft);
vec3  emit     = tint * (core*coreAmp + halo*haloAmp) * vFade * uEnergy;
if (dot(emit, vec3(1.0)) < 0.002) discard;
```

**Tier B, true bloom, device-gated.** `docs/12` §5.2 M4 proposed OGL's `extras/Post.js`. **Recommendation: use `core/RenderTarget.js` and hand-roll the chain, and do not import `Post.js`.** Reason, so nobody re-derives it: the composite pass carries the scrim SDF, the tonemap, the vignette, the grain and the ordered dither, and it needs six `vec4` + six `float` array uniforms updated per frame from live DOM rects. `Post.js`'s swap-chain wants to own the composite and expressing this through it is more code than the 40 lines it replaces. `RenderTarget.js` is already in `node_modules`, currently unused, and tree-shakes in cleanly. The prototype proves the hand-rolled chain at 0.21 ms.

Pipeline, per frame, in `runtime/scene.ts`:

1. ground → `rtScene` (`clear: true`)
2. lattice + traces → `rtScene` (`clear: false, sort: false, frustumCull: false`)
3. bright pass, `threshold 0.30`, → `rtA` at 0.5 DPR
4. separable blur, ping-pong `rtA`↔`rtB`, radii `[1.0, 1.9, 3.1, 4.6, 6.5, 9.0]`, alternating H/V
5. composite → screen: `tScene + tBloom*uBloom` → scrim carve → `1 - exp(-col*1.18)` tonemap → vignette → grain → ordered dither

Use **half-float render targets where available** — `isWebgl2 && gl.getExtension("EXT_color_buffer_float")` → `{ type: gl.HALF_FLOAT, format: gl.RGBA, internalFormat: gl.RGBA16F }`. Additive plus bloom is a different animal in HDR; RGBA8 is the fallback and gives the same look with less headroom, not a different look.

Blur iteration count by tier: **6 on desktop, 2 at 0.4 DPR on mid, 0 below the floor** (Tier A alone carries it).

### 2.7 M5 — depth-varied size, and 4–7× density

```glsl
float depth01 = clamp((-viewPosition.z - DEPTH_NEAR) / DEPTH_RANGE, 0.0, 1.0);
float size    = uSize * mix(2.10, 0.50, depth01) * (0.60 + 0.80*aSeed.y) * mix(0.80, 1.0, placed);
```

Near points are large soft bokeh; far points are sharp pinpricks. Coupled with the depth-biased core/halo mix in 2.6, that is optical defocus, and it is what makes a point field feel like a volume rather than a flat picture.

`constants.ts` changes:

| Constant | From | To | Why |
|---|---|---|---|
| `LATTICE_HALF_WIDTH` | 1.95 | **2.85** | the plane is tilted into depth and must bleed past all four edges of 1440×900 |
| `LATTICE_HALF_HEIGHT` | 1.22 | **2.05** | " |
| `NOISE_HALF_WIDTH` | 2.6 | **3.20** | |
| `NOISE_HALF_HEIGHT` | 1.7 | **2.30** | |
| `NOISE_HALF_DEPTH` | 1.15 | **1.35** | |
| `POINT_SIZE` | 0.0135 | **0.0168** | and now depth-scaled 2.1× → 0.5× |
| `GRID_*_HIGH` | 48 × 28 = 1,344 | **164 × 92 = 15,088** | 11× — one draw call either way |
| `GRID_*_MID` *(new)* | — | **112 × 62 = 6,944** | |
| `GRID_*_LOW` | 32 × 19 = 608 | **72 × 40 = 2,880** | |
| `POSTER_SAMPLE_STRIDE` | 2 | **5** | holds the poster near ~630 drawn circles at the new density |
| `DPR_MAX` | 1.5 | **1.5**, and **1.25 when bloom is enabled** | blur passes are fillrate-quadratic in DPR |

**Remove the alpha floor.** `DEPTH_FADE_FLOOR = 0.3` and the `mix(0.55, 1.0, resolve)` multiplier exist to keep a grey field subtle. Under an emissive treatment they are the enemy. Entropy points become genuinely dim but *coloured*; resolved points reach full emission. `vFade` becomes a near-haze plus far-settle shaping term, not a floor:

```glsl
vFade  = smoothstep(0.010, 0.22, depth01) * mix(1.0, 0.60, smoothstep(0.52, 1.0, depth01));
vFade *= mix(0.30, 1.0, placed) * mix(1.0, 0.70, hold);
```

**Vertex tiering is by capability, not by viewport:** `cores >= 8 && mem >= 8` → HIGH, `cores >= 4` → MID, else LOW. Fillrate is the only real constraint, so **trade halo radius against count, never count against quality.**

### 2.8 M6 — spatial wave, the held entropy fraction, and the r/s traces

Three small changes that matter disproportionately:

```glsl
// spatial wave: a visible FRONT of order sweeps the field, instead of points popping in at random
float wave  = length(aLattice.xy * vec2(0.42, 1.0)) / 2.35;
float phase = mix(wave, aSeed.x, 0.34);
float staggered = clamp((uProgress - phase*STAGGER_SPAN) / (1.0 - STAGGER_SPAN), 0.0, 1.0);

// a deterministic ~6.6% of points STAY in the entropy cloud, cold and drifting,
// so the space above the resolved plane is a volume rather than a void
float hold   = step(0.934, aSeed.x*0.45 + aSeed.y*0.55);
float placed = mix(resolve, resolve*0.06, hold);
```

**`aFlare`, a new instanced attribute in `seed.ts`.** A heat bias read straight out of the signature — `flare[i] = 0.30 + 0.70 * (signature[(col*7 + row*13) % 64] / 255)` — so the field has a deterministic, signature-specific pattern of hotter and colder regions. Different signature, different field. This is what makes "every point has a coordinate that came out of that signature" visibly true rather than merely asserted.

**`buildSignatureTraces(geo, signature)`**, also in `seed.ts`. Bytes 0–31 (`r`) and 32–63 (`s`) each become a 32-vertex polyline whose row index is the byte value, snapped to real lattice points so the traces lie on the resolved surface. Points a trace passes through are flared to 1.0 and their 4-neighbourhoods to 0.9, so a trace reads as a lit seam and not a hairline. Rendered as a **second tiny draw call**, `mode: gl.LINES`, additive, revealed over the last 34% of progress. `docs/12` budgeted OGL's `extras/Polyline.js` for this; a raw `LINES` geometry is smaller and the prototype uses it — **do not import `Polyline.js`.**

### 2.9 M7 — parallax inside the field

```glsl
viewPosition.xy += uPointer * (0.04 + 0.22 * depth01);
viewPosition.y  += uScrollParallax * (0.02 + 0.11 * depth01);
```

`uPointer` lerped in JS toward the normalised cursor at `1 - pow(0.02, delta)`. Zero measurable cost, and it is the difference between a picture and a place. **Disabled entirely under reduced motion and on `(pointer: coarse)`** — the listener is not attached at all, not attached-and-ignored.

### 2.10 M8.1 — the radial scrim that carves darkness where type sits

`field/scrim.ts` + the composite fragment. Six slots, filled each frame by the six `[data-scrim]` blocks nearest the viewport centre:

```glsl
uniform vec4  uScrim[6];     // xy = centre (uv), zw = half-size (uv)
uniform float uScrimAmt[6];
// rounded-box SDF per slot, feathered asymmetrically so the field stays bright
// right up to the edge of the column:
float dist = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
carve = max(carve, uScrimAmt[i] * (1.0 - smoothstep(-uFeather*0.30, uFeather, dist)));
col   = mix(col, uInk * 0.34, carve);
```

**Implementation trap, found in the prototype and worth 20 minutes to whoever hits it:** the `uScrim` / `uScrimAmt` uniform values must be plain `Array`s, **not** `Float32Array`. OGL's uniform walker only recognises array uniforms (`uScrim[0]`…) when `value` passes `Array.isArray`, and silently drops typed-array values with a console warning.

`data-scrim` is authored as `"padX,padY,amount"` on each block — e.g. the hero `h1` is `"26,2,0.62"` (tight, light carve — the headline wants to be backlit), the body copy `"30,18,0.94"` (generous, near-opaque — it wants to be legible).

### 2.11 M8.2–M8.5 — the rest of the composition

- **Blueprint grid**, CSS not GL: a fixed layer at `--z-grid` with 96px lines at `#FFFFFF09` / `#FFFFFF07`, radially masked so it never ends at a hard edge, plus a column rule inset by `--gutter`. This is the move that frames the lattice as something being *measured* and ties the cryptography to the layout system.
- **The readout becomes a HUD** — `FieldHud.tsx`, fixed bottom-left, `--font-mono`, printing `P-256 · ECDSA · sig 3f9a…c1d2 · verified 0.41 ms · pts 15,088`. Server-rendered from `BUILD_ATTESTATION` so it is correct with JS off, then patched imperatively by the deferred chunk with the live values — **zero additional client JS**, the same trick `AttestationReadout` already uses. `mix-blend-mode: screen` is in the prototype; test it on Safari before shipping it (§7 R8).
- **The honesty caption stays prose.** `docs/05` §3.3's second paragraph — *"The signature seeds a shape. It encrypts nothing and secures nothing."* — is non-optional and moves into `#attestation` as body copy. It does not become a HUD line.
- **Bleed out, don't stop.** The field's bottom edge masks into the next section; in light mode, the mask is what performs the A8.2 hand-off back to `--color-background`.
- **Give it silence.** `#attestation` carries the headline, the readout panel and nothing else.

### 2.12 M9 — the poster, re-authored as a still of the *new* staging

`AttestationPoster.tsx` currently renders 248 `<circle>` elements with `fill="currentColor"` at `--color-foreground-secondary`. **It is frame ∞ of a near-invisible shader, so it is also near-invisible** — the accessibility path inherits the exact failure being fixed. Re-author:

- Framed at the **Act III camera** (`camY 0.86`, `tilt -1.41`, `progress 1.0`), via `lattice/project.ts` updated to mirror the new vertex transform.
- `POSTER_DEPTH_BANDS = 5` maps cleanly onto **five `<radialGradient>` definitions**, one per band, each a core-plus-halo two-stop on the cold→gold→core ramp with its **outer stop at `#D1A95400`** (A8.1). Emissive look, static SVG, zero runtime cost.
- The two r/s traces as `<polyline>`s.
- A baked radial scrim `<rect>` and a baked grid, so the still composes the way the live frame does.
- Alt text **unchanged and verbatim** from `docs/05` §3.3: *"A lattice of points resolving from scattered noise into an ordered surface."*
- **Two groups, for forced colours:** `<g data-field-glow>` (the gradient-filled emissive field) and `<g data-field-line>` (a `currentColor` hairline reduction, hidden by default). Under `@media (forced-colors: active)`, `[data-field-glow] { display: none }` and `[data-field-line] { display: initial }` with `color: CanvasText`. This is deterministic in a way that re-colouring gradients is not.
- **Size cap: ≤9 kB gz of HTML.** It is in the initial document, so it is a first-load cost and must be **measured, not assumed**. If it exceeds the cap, raise `POSTER_SAMPLE_STRIDE` — cut point count before cutting bands.

A reduced-motion visitor should get a genuinely striking still and lose only the resolve, not the idea.

---

## 3. Page composition

The content structure is working and stays. Section order, headings, copy and the `R13` evidence hierarchy are unchanged. What changes is that the boxed figure inside `#work` is promoted out into the page's ground, its own section is created for the moment it was trying to be, and the WebAuthn ceremony is placed next to it.

| # | Section | `id` | What the field does under it | Copy |
|---|---|---|---|---|
| 1 | **Hero** | — | Full energy (1.30). Focus `[0.62, 0.50]`, horizon 0.560, camY 0.30, tilt −1.24, yaw −0.14. The field brightens directly behind the letterforms, so the name is **backlit rather than painted** — `text-shadow` in gold at 0.20/0.15/0.10 alpha over three radii, plus one black 2px offset for the ground. Scrim carves under `h1` (light, `0.62`), lede and credential sentence (heavy, `0.94`). | `docs/05` §3.1, verbatim |
| 2 | **Selected work** | `#work` | Cools to 0.88, flow 0.86. Horizon drops to 0.700, camY 0.08, tilt −1.14 — the plane recedes and the section reads as *above* the field looking down at it. Entries become lit panels (`--field-panel` + `--edge-lit` + `--shadow-panel`). In light mode this is where the field masks out. | `docs/05` §3.2, verbatim, entry order unchanged (Splita → Queralt → Snorkel AI, Cyera still ship-gated out) |
| 3 | **The attestation** | `#attestation` | **NEW section, and the field's own moment.** Energy 1.30, flow 1.18, camY 0.86, tilt −1.41, horizon 0.430, dolly 0.30 — the camera rises and the lattice reveals itself as a plane in space. Acts II and III scrub against this section's passage: the resolve wave sweeps, then the r/s traces draw in over the last 34%. Permanently dark in both themes (A8.2). | `docs/05` §3.3, verbatim — the two prose paragraphs *including* the honesty paragraph, plus the readout panel. The figure's `alt` survives on the poster. This section contributes **no heading**, preserving the `R9` chain — it is titled by its eyebrow, as the prototype does. |
| 4 | **The ceremony** | `#ceremony` | **NEW — the WebAuthn demonstration.** Energy drops to **0.55** and the field goes nearly still for the duration of the ceremony. This is M8.5 (*give it silence*) applied to the one section where the visitor has something to do. On a **successful verify**, one authored moment: the demo dispatches `document.dispatchEvent(new CustomEvent("field:flare", { detail: { amount: 1.6, ms: 900 } }))` and the field pulses once and decays. Nothing else on the site does this. | owned by `webauthn-demo` |
| 5 | Projects | `#projects` | Energy 0.80. Scattered, low flow. Masks out in light mode. | `docs/05` §3.4, verbatim |
| 6 | Writing | `#writing` | renders `null` at launch | `docs/05` §6 |
| 7 | About | `#about` | Energy 0.70, horizon rising. | `docs/05` §3.5, verbatim |
| 8 | Contact | `#contact` | Energy 0.40, the field settling out. Bottom bleed-out mask. | `docs/05` §3.6, verbatim |

### 3.1 Why the ceremony sits at position 4

It is the live proof of the entry at position 2. The two new sections read as a deliberate pair and the order is the argument:

> `#attestation` — *this shape came out of a real signature, and it secures nothing.*
> `#ceremony` — *this, by contrast, is the real thing: your authenticator, a real credential, a real challenge, verified in your browser.*

That adjacency is also the strongest answer to `docs/11` §6's failure mode 2 (*spectacle unrelated to the domain*). The field stops being atmosphere the moment the section after it fires the visitor's Touch ID. Putting the demo after Projects would separate the claim from its proof by a screenful and waste the setup.

**The honesty copy needs one bridging sentence** so the adjacency does not read as walking the `#attestation` disclaimer back, or as overclaiming by association. That is a `content` decision, not a build agent's. Flagged in §7 R7.

### 3.2 Page height — this needs a decision, not a guess

`docs/03` R14 caps the page at 6 viewports; `docs/04` §12.1 E records **D17**: the page already measures **6.10 at 390×844**. Two sections are being added and a boxed figure (768×432 plus caption, ≈600px) removed.

| Change | Δ at 390×844 |
|---|---|
| − the boxed attestation figure + its caption | −0.71 vp |
| + `#attestation` | +1.00 vp |
| + `#ceremony`, **at its resting height** | +0.60 vp |
| D17's named cut — `credentialsDetailLine`, `src/content/about.ts:51` | −0.14 vp |
| **net** | **≈ +0.75 vp → ≈ 6.85 vp** |

**This exceeds R14 and no build agent may resolve it unilaterally.** Three levers, in the order they should be considered:

1. **`#ceremony` ships collapsed by default** — a heading, two lines, one `<button>`, and a result panel that expands only after the ceremony runs. Progressive disclosure is also the right interaction design here; a pre-expanded panel of empty COSE fields is worse. This is already assumed in the 0.60 vp figure above.
2. **Take D17's cut.** It is already named and already owned by `content` / `information-architecture`.
3. **Amend R14.** `docs/03` R14 is a content budget written for a page with no interactive section. A page that contains a live authentication ceremony is arguably a different object. That is the owner's call.

Route this to `information-architecture` before Lane C lands `page.tsx`.

### 3.3 What happens to the existing components

- `AttestationFigure.tsx` is **deleted**. `SelectedWorkSection.tsx` drops its import and its `FIGURE_AFTER_ENTRY_ID` logic.
- `AttestationReadout.tsx` **stays** and is reused inside `#attestation` as the readout panel's row renderer. Its A7 `verified` glyph is unchanged.
- Every section gains `data-scrim` on its text blocks and a `.over-field` class where it composites over the stage. `src/components/ui/Section.tsx` gains a `data-scrim` passthrough so sections do not each hand-roll it.
- **The type colours over the field come from a `.stage` CSS scope, not from JS.** This is the JS-disabled correctness requirement and it is easy to get wrong: if the stage is dark in both themes but the type over it is coloured by `--color-foreground`, a light-mode visitor with JS off gets `#1A1A19` body copy on `#0A0908`. `.stage` redeclares `--color-foreground*` from `--field-fg*` for its subtree, in CSS, unconditionally.

---

## 4. Performance budget

### 4.1 Target, stated

| Metric | Current | Target after the port | Hard gate |
|---|---|---|---|
| Lighthouse Performance | 100 | **≥95**, owner accepted ≥90 | 90 |
| Lighthouse A11y / BP / SEO | 100 / 100 / 100 | **100 / 100 / 100**, unchanged | 100 |
| First-load JS (route `/`) | 114 kB gz | **114 kB gz — unchanged, ±0** | 180 KiB (`scripts/check-bundle-budget.mjs`) |
| Deferred field chunk | 18.3 kB gz | **≈30 kB gz** | 40 kB gz (`docs/04` §8.4) |
| CLS | 0 | **0, unchanged** | 0.1 |
| LCP (lab) | 2,003 ms | **≤2,050 ms** | 2,500 ms |
| TBT | — | **≤200 ms** | 200 ms |

**The expectation is that first-load JS does not rise at all.** The field lives entirely in the deferred chunk, behind eight gates. The HUD and the poster are server-rendered and patched imperatively, so they contribute zero client JS. This is the prototype's most useful finding after the 9.3:1 contrast: the whole visual transformation is free at first load.

### 4.2 Per-item cost

**First load (the only numbers that touch the Lighthouse score directly):**

| Item | Δ first-load JS gz | Δ CSS gz | Δ HTML gz |
|---|---:|---:|---:|
| `FieldStage.tsx` — shape change to the existing client gate | +0.3 kB | — | — |
| `AttestationField.tsx` — server wrapper | 0 | — | +0.1 kB |
| `FieldHud.tsx` — server-rendered, imperatively patched | **0** | +0.2 kB | +0.3 kB |
| `AttestationFigure.tsx` deleted | −0.2 kB | — | — |
| `--field-*` tokens, `.stage`, `.over-field`, `.panel`, lit-edge recipes | — | +0.6 kB | — |
| Blueprint grid layer | — | +0.3 kB | — |
| Warm ladder (DEV-14) — a value swap, not an addition | — | **0** | — |
| Re-authored poster — 5 gradients, ~630 circles, 2 polylines, 2 groups | — | — | **+2.4 kB** |
| `#attestation` + `#ceremony` section markup and copy | 0 | — | +1.1 kB |
| **Total** | **+0.1 kB** | **+1.1 kB** | **+3.9 kB** |
| **WebAuthn demo client island — reserved, not spent here** | **≤6 kB** | — | — |

The demo's ceremony logic must be **dynamically imported on first interaction**, not at load. That number belongs to `webauthn-demo` and is called out so it is not discovered late.

**Deferred chunk (gated; never in First Load JS):**

| Item | Δ gz |
|---|---:|
| ground shader — 5-octave fbm + domain warp | +1.3 kB |
| colour ramp / heat varying | +0.2 kB |
| additive + opaque renderer | +0.1 kB |
| two-lobe sprite (Tier A) | +0.2 kB |
| density / size tiers | +0.3 kB |
| spatial wave + held entropy fraction | +0.3 kB |
| `aFlare` + r/s traces (raw `LINES`, not `Polyline.js`) | +1.4 kB |
| pointer + scroll parallax | +0.3 kB |
| scrim measurement + uniform packing | +0.9 kB |
| section attention state machine | +0.8 kB |
| post chain — `RenderTarget` + bright/blur/composite + ping-pong (Tier B) | +4.6 kB |
| `Transform` import (the tilted root node) | +0.9 kB |
| **Total** | **18.3 → ≈29.6 kB gz** — **74% of the 40 kB cap** |

### 4.3 Runtime cost

- **Draw submission:** ≤0.35 ms/frame on desktop. Prototype measured **0.21 ms** at 15,088 points.
- **GPU frame budget:** ≤4 ms on discrete/Apple-silicon, ≤8 ms on integrated, against a 16.7 ms frame. Bloom is the fillrate cost, not the geometry: 15,088 instances is a rounding error in vertex work.
- **Boot, one-off, post-LCP and post-idle:** P-256 keygen + sign + verify ≈2–4 ms; `buildLattice` at 164×92 allocates four `Float32Array`s totalling ≈543 kB and runs 15,088 iterations ≈3–6 ms; five shader compiles and links ≈8–20 ms. **Total ≈15–30 ms of TBT**, comfortably inside a 200 ms bar.
- **CLS stays exactly 0.** The canvas is `position: fixed`, out of flow — it reserves nothing and shifts nothing. The poster moves into the same fixed layer rather than into an aspect box, so the aspect-ratio CLS defence is not needed and is not missed.

### 4.4 What would blow it — stated plainly, in order of likelihood

1. **Mounting before LCP.** The canvas is now above the fold, so **gate 6 (viewport approach) no longer defers anything.** This is the single change in the whole port that can genuinely move LCP. **Add gate 8:** a `PerformanceObserver` on `largest-contentful-paint`, mounting on the entry, with a 3,000 ms fallback timer. Without it the port trades a visual win for a Core Web Vitals loss.
2. **`gl.readPixels` in the render loop.** The prototype's contrast probe is invaluable and is a **synchronous pipeline stall** — it forces a flush every time it runs. It ships **dev-only**, behind `process.env.NODE_ENV !== "production"`, and as a Playwright assertion. Never in the production frame loop.
3. **`backdrop-filter: blur()` on the entry panels.** The prototype puts `blur(6px) saturate(.9)` on every `.entry` and on the readout. Each is a separate full-rect backdrop sample recomposited on every scroll frame; on integrated graphics at 1440p this is the most likely source of scroll jank in this design, and it is invisible in a Lighthouse run that does not scroll. **Cap: at most two backdrop-filtered surfaces in any one viewport, and none below the mid tier.**
4. **DPR above 1.5 with bloom on.** Blur passes are fillrate-quadratic in DPR; 1.5 → 2.0 is 1.78× the fill across six passes. `DPR_MAX` stays 1.5 and drops to 1.25 when bloom is enabled.
5. **Cutting point count instead of halo radius** when the mid tier runs hot. Wrong lever — the field is fillrate-bound, not vertex-bound, and cutting count is the change that makes it look cheap.
6. **A 30 fps cap applied globally.** Use it on the low tier only. The field's motion is slow enough that 30 fps is invisible there, but under desktop pointer parallax it reads as stutter.

---

## 5. Accessibility plan

### 5.1 Contrast over a live field

The mechanism is A8.3 — the scrim carves the composite, so the pixels measured are the pixels behind the type. The verification is an artifact, not a promise:

**`e2e/field-contrast.spec.ts`** (new, Playwright). Drives the page at the field's **brightest authored frame** — progress locked to 1.0 and the attention state pinned to `hero` — then, via the dev-only probe, samples an 6×3 grid across every `[data-scrim]` block in view with `gl.readPixels`, converts to relative luminance, and asserts:

- **≥4.5:1** for every body-size string (`--field-fg-secondary #B9B4A9` is the dimmest, and is the value the prototype measured at 9.3:1)
- **≥3:1** for every `--text-h3`-and-above string
- and fails with the offending selector and the measured ratio, not a boolean

This spec is what stops the field regressing quietly. `docs/06-review-accessibility` §12's lesson applies: measure in the gamut that renders, and treat the sRGB restatement as the floor, not the claim.

### 5.2 Reduced motion

- **Gate 1 stays first**, before the `import()`. Reduced-motion visitors download **0 kB** of the field. This is unchanged and non-negotiable.
- The poster shows instead — and per §2.12 it is now a still worth looking at.
- **New:** a `matchMedia("(prefers-reduced-motion: reduce)")` `change` listener disposes the live scene and cross-fades back to the poster if the preference is enabled *after* the field mounts. The current code has no such listener; a visitor who toggles the OS setting mid-session keeps the animation.
- `--light-x` / `--light-y` freeze at their defaults. No specular sweep. No pointer parallax. No field flare on the ceremony's success — the demo's success signal must be text and live-region, with the flare purely decorative on top (§5.5).

### 5.3 Forced colours

Gate 2 stays: `forced-colors: active` declines to mount, for the reason `docs/08-review-accessibility-c2` N3 established — a WebGL surface is not subject to the forced palette at all, so the live scene in HCM is author-coloured points on a system-coloured page. The poster is the surface the system palette can re-colour, and §2.12's two-group structure (`data-field-glow` / `data-field-line`) makes that deterministic rather than dependent on how a UA treats a gradient fill.

### 5.4 JavaScript disabled

- Every word of content is server-rendered and sits in normal document flow. Nothing depends on the canvas.
- The poster is server-rendered inline SVG in the fixed layer behind it. `data-scrim` attributes are inert.
- The HUD renders the build-time attestation values and is correct as written.
- **The one thing that can break here:** the stage's type colours. `.stage` redeclares `--color-foreground*` from `--field-fg*` **in CSS, unconditionally** (§3.3). If any of it is applied by JS, a light-mode no-JS visitor gets near-black body copy on the near-black stage. Add a `e2e` case with JS disabled that asserts computed colour on `#attestation` body copy.
- `docs/11` §6.1's evidence is the reason this matters: *"I got a completely blank page running Firefox + uMatrix with no scripts running"* is the most consistent criticism this audience makes of personal sites.

### 5.5 The ceremony section

Not designed here, but three constraints the field imposes on it:

- The field's success flare is **decorative and additive only**. It may never be the only signal that the ceremony succeeded; that is a `role="status"` live region and visible text.
- The flare must be suppressed under `prefers-reduced-motion`. Simplest correct implementation: the field's `field:flare` listener checks the preference, and the field is not mounted under reduced motion anyway, so the `CustomEvent` is a no-op by construction.
- The ceremony's own controls sit **inside a `data-scrim` block**, so their focus rings and borders are measured against the same carved composite as the type. `--color-border-interactive` over the field must clear 3:1 in the A8.4 harness alongside the text.

---

## 6. File-by-file work breakdown

Five lanes. Lanes **T** and **F** are sequential at the start — T's `docs/04` amendment is a hard blocker on F's first commit (§7 R1). Everything else parallelises.

### Lane T — tokens and CSS (owner: `design-system`)

| File | Change | Shared? |
|---|---|---|
| `docs/04-design-system.md` | §2.6, §2.7, §3.2, §3.3, §3.5 (A8, F4, F9, R-GOLD-2), §3.6 (matrix reprinted), §8.4, §12 (DEV-13/14/15), §12.1 F, §13 | **EXCLUSIVE — no other lane writes this file** |
| `src/app/globals.css` | §1 warm ladder, §2, §4 `--field-*` + `--z-field` + `--z-grid` + light-source tokens, §5 `.stage`/`.over-field`, §8 `.panel` + lit edge + grid layer, §9 reduced motion, §10 | **SHARED — highest collision risk. Only Lane T writes it; other lanes file requests.** |

**Deliverable that unblocks everyone: the DEV-13 amendment, committed, before Lane F's first commit.**

### Lane F — field runtime (owner: `three-d`)

| File | Change |
|---|---|
| `src/components/three/constants.ts` | geometry, density tiers, camera, palette; **delete `FIGURE_FALLBACK_*`** — **SHARED, Lane F owns, Lane P reads** |
| `src/components/three/field/palette.ts` | NEW |
| `src/components/three/field/ground.shader.ts` | NEW |
| `src/components/three/field/point.shader.ts` | NEW (replaces `lattice/shaders.ts`) |
| `src/components/three/field/trace.shader.ts` | NEW |
| `src/components/three/field/post.shader.ts` | NEW |
| `src/components/three/field/post-chain.ts` | NEW |
| `src/components/three/field/scrim.ts` | NEW |
| `src/components/three/field/attention.ts` | NEW — includes the `field:flare` `CustomEvent` listener |
| `src/components/three/lattice/seed.ts` | + `flare`, + `buildSignatureTraces` — **SHARED, Lane F owns, Lane P imports** |
| `src/components/three/lattice/shaders.ts` | DELETE |
| `src/components/three/runtime/scene.ts` | rewrite — 4-pass composition |
| `src/components/three/runtime/mount.ts` | fixed full-viewport host |
| `src/components/three/runtime/scroll.ts` | document-scoped progress |
| `src/components/three/runtime/capability.ts` | + bloom tier, + gate 8 (LCP observer), + reduced-motion change listener |
| `src/components/three/runtime/color.ts` + `color.test.ts` | retarget to `--field-*`; **P3 hardening kept verbatim** |

### Lane P — the poster (owner: `motion`, or a dedicated agent)

| File | Change |
|---|---|
| `src/components/three/AttestationPoster.tsx` | rewrite per §2.12 — 5 `<radialGradient>` bands, 2 polylines, 2 groups, baked scrim + grid |
| `src/components/three/lattice/project.ts` | Act III camera, new `DEPTH_RANGE`, band/gradient ids |

Lane P depends on Lane F's `constants.ts` and `seed.ts` landing first. It reads them; it does not write them. **A8.6 binds this lane to Lane F's ramp — if the two diverge, the cross-fade shows it.**

### Lane C — composition (owner: `frontend-core`)

| File | Change | Shared? |
|---|---|---|
| `src/app/layout.tsx` | mount `<AttestationField/>` once, before `{children}` | **SHARED with `webauthn-demo`** |
| `src/app/page.tsx` | insert `<AttestationSection/>` and `<CeremonySection/>` | **SHARED — the main collision** |
| `src/components/three/AttestationField.tsx` | NEW, server |
| `src/components/three/FieldStage.tsx` | renamed from `AttestationLive.tsx`; `FRAME_STYLE` → fixed host |
| `src/components/three/FieldHud.tsx` | NEW |
| `src/components/three/AttestationFigure.tsx` | DELETE |
| `src/components/three/index.ts` | public surface |
| `src/components/sections/AttestationSection.tsx` | NEW — `docs/05` §3.3 copy |
| `src/components/sections/SelectedWorkSection.tsx` | remove the figure; add `data-scrim` |
| `src/components/sections/{Hero,Projects,About,Contact}Section.tsx` | `data-scrim` + `.over-field` |
| `src/components/ui/Section.tsx` | `data-scrim` passthrough |
| `src/content/attestation.ts` | add section eyebrow/label strings — **SHARED with `content`; copy is verbatim-locked by `content.test.ts` (44/44). Adding strings is fine; changing one breaks the test.** |

### Lane W — the WebAuthn ceremony (owner: `webauthn-demo`, already running)

Owns `src/components/sections/CeremonySection.tsx` and everything beneath it. **Does not touch** the field, `globals.css`, `docs/04`, or any file under `src/components/three/`.

Consumes exactly three things from this port, and they are the whole interface:

1. The `.stage` / `.over-field` CSS scope (Lane T).
2. The `data-scrim="padX,padY,amount"` contract on its text and control blocks (Lane F reads them; Lane W authors them).
3. `document.dispatchEvent(new CustomEvent("field:flare", { detail: { amount: 1.6, ms: 900 } }))` on a successful verify. **A `CustomEvent`, deliberately, not a `window.__field` global** — it is a no-op when the field is not mounted (reduced motion, forced colours, no WebGL, JS-gated-out), it needs no shared type surface, and neither lane has to import the other.

### Collision rules

| File | Wanted by | Rule |
|---|---|---|
| `src/app/globals.css` | T, C, W | **Only T writes it.** Others file a request describing the rule they need. |
| `src/app/page.tsx` | C, W | **C lands first** — adds `<AttestationSection/>` plus an empty `<CeremonySection/>` stub. W fills the stub. |
| `src/app/layout.tsx` | C, W | **C lands first.** W adds nothing here if it can avoid it. |
| `src/components/three/constants.ts` | F, P | **F owns. P reads.** |
| `src/components/three/lattice/seed.ts` | F, P | **F owns. P imports.** |
| `docs/04-design-system.md` | T | **T exclusively.** Every other lane routes findings to T. |
| `src/content/attestation.ts` | C, `content` | Additive only. `content.test.ts` guards it. |

### Sequencing

```
T (docs/04 DEV-13)  ──blocks──>  F  ──blocks──>  P
                    └──parallel──>  C  ──stub──>  W
T (globals.css)     ──parallel with F, C, W
```

---

## 7. Risks

### R1 — TOP RISK. The design system's own rules revert the lattice to grey, again

**This has already happened once and the mechanism is documented in the repository.** `src/components/three/constants.ts` carries a nine-line comment explaining that the point field must be `--color-foreground-secondary` because §3.5's A1–A7 allowlist is exhaustive, because `docs/05` §1056 restricts accent in the figure to the `verified` glyph, and because a large gold mass would make the figure the largest accent region on the page and defeat F9 and the R-GOLD-1 router argument. That comment is not a stray opinion — **it is a correct reading of the written contract**, and the lattice shipped at **1.44:1** as a direct result.

If DEV-13/A8 does not land in `docs/04` **before** the first design-QA pass, Phase 5's accent enumeration will resolve the gold field to *"no matching allowlist row, aggregate mass far above 2,000 px²"*, file it at **HIGH**, and a fix agent doing its job correctly will substitute the grey value back. The whole port reverts to an invisible field and a beautiful-looking design-QA report.

**Mitigation is sequencing plus deletion, not a paragraph of hope:**

1. Lane T's `docs/04` amendment is a **hard blocker** on Lane F's first commit.
2. `FIGURE_FALLBACK_DARK` and `FIGURE_FALLBACK_LIGHT` are **deleted in the same commit as the ramp change**, so there is no grey value left in the module for a later pass to reach for.
3. `docs/04` §13's Phase-5 checklist gains a row naming the substitution as the defect.
4. The A8.4 Playwright spec (§5.1) makes a 1.44:1 field a **failing test**, not a judgement call.

### R2 — LCP regression

The canvas is above the fold now, so gate 6 defers nothing. Mitigation: gate 8 (§4.4 item 1). Measure before and after; a 50 ms regression is acceptable, 200 ms is not.

### R3 — light mode incoherence, and the question the owner should answer

A dark stage behind a light page is a legitimate editorial move. A dark stage under the *whole document* in light mode is not — it is dark mode with a theme toggle that lies. §1.1 A8.2 adopts `docs/12` M2's answer (sectioned field in light mode, continuous in dark), which is defensible but costs the "one continuous surface" reading that `docs/11` Direction C describes.

**The cleaner alternative is that this page is dark-only**, and it is worth putting to the owner rather than absorbing as a compromise. Direction C's own palette spec is *"near-black, bone, and gold as emitted light only — two colours and a light source."* That is a dark-only design. Light mode currently costs 15 tokens, a full second contrast matrix, the `--accent-foreground` inversion trap, and now a sectioned field. **Not a build agent's call.**

### R4 — the field reads as a screensaver rather than as systems

`docs/11` §6 failure mode 2, and Direction C's own stated risk: *"If it looks like a screensaver, it fails; if it looks like a payment network under load, it is the most memorable site in the candidate pool."*

Three things carry the systems reading, and they are the last things to cut, not the first: the **r/s traces** (the signature drawn as a figure in its own field), the **HUD printing real signature bytes**, and the **blueprint grid** that frames the lattice as something being measured. Cut density, cut bloom, cut parallax — keep those three.

### R5 — fillrate on integrated graphics and mid-tier Android

Mitigated by the capability tiers, the bloom ladder, and the backdrop-filter cap (§4.4 item 3). **Test on real hardware, not on a throttled desktop** — the `backdrop-filter` cost in particular does not show up in a Lighthouse run that never scrolls.

### R6 — page height against R14

§3.2. Needs `information-architecture` before Lane C lands `page.tsx`.

### R7 — the honesty copy next to a real ceremony

`#attestation` says the signature *"encrypts nothing and secures nothing"*; `#ceremony`, one section later, is a real credential ceremony that does. The adjacency could read either as walking the disclaimer back or as overclaiming by association. One bridging sentence resolves it. **`content` owns this**, and `docs/05` §3.3's constraint stands: no copy anywhere may describe the attestation figure as encryption, as a security guarantee, or as a demo of the Queralt work — which, notably, the ceremony section *is* permitted to be, because it actually is one.

### R8 — `mix-blend-mode: screen` on the HUD

The prototype combines `backdrop-filter` and `mix-blend-mode: screen` on fixed elements. Blend modes force a stacking context and a compositor readback. Verify on Safari and on Firefox before shipping; the fallback is a plain `--field-hot` colour with no blend, which loses very little.

---

## 8. Definition of done

- [ ] `docs/04` carries DEV-13/14/15 and §12.1 F; §3.6's contrast matrix is reprinted against the warm ladder; §13 names the grey-substitution as the defect
- [ ] `FIGURE_FALLBACK_DARK` / `FIGURE_FALLBACK_LIGHT` do not exist anywhere in the tree
- [ ] `e2e/field-contrast.spec.ts` passes at ≥4.5:1 body / ≥3:1 large, at the brightest authored frame
- [ ] JS-disabled e2e case asserts `#attestation` body copy resolves to `--field-fg-secondary` in **both** themes
- [ ] `npm run check:bundle` reports route `/` unchanged at ≈114 kB gz
- [ ] deferred chunk ≤40 kB gz
- [ ] Lighthouse ≥95 / 100 / 100 / 100 on production, CLS 0
- [ ] `npm test` green — including `content.test.ts` at 44/44 strings and `color.test.ts`'s full P3 case list
- [ ] the poster, viewed alone with the canvas suppressed, is a still someone would choose to look at
