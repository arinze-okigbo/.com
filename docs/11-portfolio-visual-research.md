# 11 — Portfolio Visual Research

**Scope:** the other half of the design space from `docs/01`. Visually ambitious sites that remain credible to engineers.
**Target:** arinzeokigbo.com. Audience: technical recruiters and engineering hiring managers, under 90 seconds.
**Date of capture:** 2026-09-11.

## Why this document exists

`docs/01-design-research.md` studied Apple, Linear, Stripe, Vercel, rauno.me, leerob.com and paco.me and concluded that strong personal sites are text-dense and visually restrained. That conclusion is correct about its corpus and it produced a build that scores 100/100/100/100, passes WCAG 2.2 AA, and ships 114 KB of JS. The site owner's verdict on the result: *"This is terrible visually."*

The corpus was the problem, not the analysis. Every site in `docs/01` is either (a) a company marketing page whose restraint is a brand-safety constraint, or (b) a personal site belonging to someone who is already famous enough that restraint reads as confidence rather than absence. Arinze is neither. A site that says nothing loudly is a site that gets closed.

**This document does not re-derive the restraint argument.** It documents the mechanics of sites that are visually loud and still respected.

### Two corrections received mid-research (site owner, 2026-09-11)

1. **"Fire theme" means "make it stunning," not a flame palette.** The literal ember direction is withdrawn. **The gold identity stays** — `#D1A954` dark / `#7C5E1D` light — and is the thing to build from. Warm-palette research is retained only where it explains how to make *gold* feel expensive. §5 is written to that narrowed brief.
2. **The performance budget is relaxed.** Spend freely provided Lighthouse stays above 90. Directions below are proposed at their ambitious size, with build cost stated separately rather than pre-trimmed.
3. **Accessibility stays non-negotiable at AA.** Keyboard, visible focus, `prefers-reduced-motion`, and core content working with JS disabled. §8 states the degradation path for each direction.

---

## Method and source honesty

| Tag | Meaning | Confidence |
|---|---|---|
| **[CSS]** | Fetched the live site's stylesheets with `curl` (desktop UA), concatenated, grepped. Verbatim shipped values. | High |
| **[HTML]** | Read from server-rendered markup (inline `<style>`, inline SVG filters, script `src` attributes). | High for what is in the HTML; blind to client-rendered content. |
| **[PKG]** | Read from the published package on a CDN (Radix Colors v3.0.0 via jsDelivr). | High — these are the canonical values. |
| **[PUB]** | Published writeup, docs page, or jury commentary. | Medium — secondhand. |
| **[OBS]** | My reading of a site's structure from its markup and asset list, not a measured value. | Low-medium — flagged every time. |
| **[MEAS]** | Computed by me (WCAG contrast, HSL conversion) from a hex I sourced above. | High — arithmetic. |

**Stated gaps, up front:**

- **Scroll choreography numbers live in JS, not CSS.** I can tell you *which* library a site loads **[HTML]** and what its easing curves are **[CSS]**, and I can infer pinning from markup **[OBS]**. I cannot give you trigger offsets or parallax ratios without running the sites, and I did not run them. Every scroll claim below is tagged accordingly.
- **Distinct-hex counts are a relative signal, not a palette size.** They include icon fills, syntax-highlight themes, and dead rules. `raycast 101` vs `minhpham 11` is meaningful; `raycast 101` is not "Raycast has 101 colours."
- Two sites resisted collection: `uncommonstudio.com.au` returned 229 bytes of CSS (the rest is client-injected), and `stripe.com/press` renders almost everything from JS. Both contribute **[OBS]** only.
- `ramp.com` returned a 14 KB shell with zero linked stylesheets. Dropped.
- `godly.website` did not resolve from this network. Dropped as a source; its curation is well known but I will not cite what I did not fetch.

**Corpus: 23 sites + 1 template library, in two deliberately opposed groups.** The whole point of the sample is that "expensive" is reached by two different roads.

---

# Part 1 — Per-site breakdown

## 1.1 The measurement that organised everything

I ran the same grep across every stylesheet. The result split the corpus cleanly in two, and the split is the most useful finding in this document.

| Site | distinct hex | gradients (radial/conic) | `mask-image` | `blur()` | `backdrop-filter` | `box-shadow` | `cubic-bezier` | `@keyframes` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Raycast** | 101 | **328** (98/3) | **172** | 125 | 96 | 171 | 61 | 58 |
| **Aceternity UI** (template lib) | 131 | **454** (134/8) | **174** | 31 | 22 | 177 | 9 | 22 |
| motion.dev | 147 | 110 (8/0) | 8 | 16 | 20 | 15 | 39 | 13 |
| Cursor | 204 | 46 (6/2) | 6 | 17 | 15 | 52 | 10 | 22 |
| mattgperry.com | 37 | 41 (8/2) | 18 | 24 | 26 | 75 | **218** | 61 |
| Firecrawl | 56 | 16 (3/0) | 8 | 17 | 23 | 97 | 10 | 13 |
| Linear | — * | 55 (16/0) | 19 | 10 | 10 | 28 | 6 | 12 |
| Mercury | — | 42 | 14 | 12 | — | 23 | 55 | — |
| claude.com | 83 | 17 (3/1) | 19 | 0 | 0 | 83 | 20 | 20 |
| Increase | — | 24 | 2 | 5 | — | 31 | 13 | — |
| ped.ro (Pedro Duarte) | 717 † | 54 (0/0) | 0 | 7 | 0 | 147 | 8 | 17 |
| joshwcomeau.com | 115 | 9 (0/0) | 2 | 3 | 2 | 11 | 24 | 55 |
| — | | | | | | | | |
| **Minh Pham** (SOTD) | **11** | 2 (0/0) | 2 | 0 | 0 | 4 | **60 (all one curve)** | 1 |
| **by-kin** (SOTD, Dev Award) | **11** | 10 (0/2) | 0 | 1 | 4 | 7 | 8 | 7 |
| **Iventions** (SOTD) | **18** | 2 (2/0) | 8 | 0 | 0 | 0 | 7 | 2 |
| **Mat Voyce** (SOTD) | **12** | 5 (0/0) | 4 | 0 | 4 | 7 | 4 | 4 |
| Dennis Snellenberg (Dev Award) | **12** | 5 (0/0) | 0 | 0 | 0 | 39 | 32 | 8 |
| basement.studio | **11** | 14 (0/4) | 4 | 1 | 2 | 22 | 15 | 12 |
| Bruno Simon | **12** | 16 (14/0) | 0 | 0 | 0 | 2 | 4 | 1 |
| Olivier Larose | **3** | 0 | 0 | 0 | 0 | 0 | 2 | 1 |
| Caferati | **5** | 0 | 0 | 0 | 0 | 0 | 11 | 4 |
| henry.codes | 18 | 6 (0/0) | 0 | 6 | 0 | 1 | 11 | 1 |
| antfu.me | 35 | 0 | 3 | 14 | 22 | 11 | 11 | 2 |
| shud.in | 27 | 2 | 0 | 6 | 2 | 4 | 2 | 2 |
| nan.fyi | 24 | 9 | 0 | 2 | 4 | 23 | 8 | 1 |
| brittanychiang.com | 2–6 ‡ | 2 (2/0) | 0 | 2 | 10 | 9 | 7 | 3 |

All rows **[CSS]**.
\* Linear ships almost no raw hex — its tokens are hashed CSS custom properties (`--sx-1eapsa9`), so the hex count is meaningless there, not low.
† ped.ro's 717 is the entire Radix Colors package shipped inline — twelve steps × ~30 scales × light/dark/alpha/P3. It is a token library, not a palette.
‡ Brittany Chiang is Tailwind; her colours live in class names, not stylesheet hex.

**The split.** Column 2 divides the corpus almost perfectly along the axis of *who the site belongs to*:

- **School A — Material.** Product/SaaS sites and design-engineer sites. 50–200 distinct hex, 40–450 gradients, 8–174 masks, 20–170 shadows. Richness is manufactured in CSS: light, layering, tinted glass, faded edges.
- **School B — Motion.** Awwwards Site-of-the-Day creative portfolios. **9–18 distinct hex, near-zero gradients, near-zero shadows**, and one or two easing curves used obsessively. Richness is manufactured in time and scale: scroll choreography, WebGL, and type sized as architecture.

Neither school is "more designed." They are two complete, internally consistent answers. **The template look is what you get when you take three moves from School A and two from School B and commit to neither.** That is §3's thesis and it is the single most actionable thing in this document.

---

## 1.2 School B — the motion school (Awwwards-tier creative portfolios)

These are the sites people screenshot. Their CSS is nearly empty. That is not an accident, it is the strategy: with almost no colour and no decoration, every bit of visual attention goes to type size, timing, and the one accent.

### Minh Pham — minhpham.design
Awwwards SOTD, developer score 7.77 **[PUB]**. The cleanest specimen of School B in the set.

**Entire palette [CSS]** — eleven hexes, and the usage counts tell you the hierarchy:

| Hex | Uses | Role |
|---|---:|---|
| `#0D0D0D` | 25 | Ground. Near-black, not black. |
| `#FFFFFF` | 19 | Display type and pure highlight only. |
| **`#B7AB98`** | **17** | **Body text.** A warm sand/taupe — *not* a grey. |
| `#EB5939` | 10 | The single hot accent. |
| `#C59B64` | 1 | A gold, used once. |
| `#0C0C0C`, `#2A2A2A`, `#4D4D4D`, `#000`, `#F8F8F8`, `#6C757D` | 1–7 | Structure. |

**The mechanic that matters most:** the second-most-used colour on the page is a **warm taupe body text**, not a grey. The ground is neutral-black; the text is warm. That single decision makes the entire page read as lit rather than printed, before any accent is applied. This is directly portable to a gold site and it costs nothing.

**Easing [CSS]:** `cubic-bezier(.165, .84, .44, 1)` — **60 uses. It is the only curve on the site.** (easeOutQuart.) Compare Raycast, which ships ten different curves. One curve applied to everything is why a School B site feels like a single object rather than a collection of components.

**Scroll [HTML]:** loads **Lenis**. No GSAP. So the choreography is scroll-position-driven CSS/JS on top of native scroll, not a pinned timeline. Trigger offsets not measured **[OBS]**.

**Type [CSS]:** fluid via `calc(1.375rem + 1.5vw)` style locks, plus a `.9259259259vw` unit — i.e. `10/1080 × 100vw`, a design-file-derived unit. Design is authored at a fixed canvas and expressed in `vw`.

### by-kin — by-kin.com
Awwwards SOTD **and** the Developer Award. Jury note: *"confident editorial typography, weighted smooth scroll"* transitions that create continuity; *"Next.js + GSAP restraint"* **[PUB]**.

**Palette [CSS]** — eleven hexes: `#242527` (ground), **`#F4F2ED`** (paper — a warm off-white, not `#FFF`), `#111214`, `#222325`, `#B84930` (rust), `#FF6542` (coral), `#8499CA`, `#4F4A3B`, `#999896`, `#fff`, `#000`.

Two warm neutrals (`#F4F2ED`, `#4F4A3B`) plus two warm accents at different temperatures (`#B84930` deep, `#FF6542` hot). The pattern: **one hue family, two saturations, used as a near/far pair.**

**Type [CSS]** — fluid type via explicit CSS locks, not `clamp()`:
```
font-size: calc(9.4rem + .6 * (100vw - 102.4rem) / 89.6);
font-size: calc(1.3rem + 6.7 * (100vw - 76.8rem) / 35.1);
```
This is linear interpolation between two breakpoints, hand-authored per step. It gives finer control than `clamp()` because the slope is explicit. Ratio of display to body at the same viewport is roughly **9.4rem : 1.3rem ≈ 7.2×** — far past the 4.7× Apple uses **[01 Part 1]**.

**`mix-blend-mode`: 8 uses [CSS]** — the highest in School B apart from Iventions. Blend modes over imagery are how School B gets colour interaction without adding colours.

**Easing [CSS]:** `cubic-bezier(.76, 0, .24, 1)` — a strong symmetric in-out. This exact curve also appears on Iventions and Mat Voyce. It is effectively the house curve of the 2026 Awwwards cohort.

### Iventions — iventions.com
Awwwards SOTD. Jury: *"a Three.js scene treats each project like a spotlit installation"* — WebGL used for **atmosphere over spectacle** **[PUB]**.

**Palette [CSS]** — 18 hexes: ground `#1E1E1E` / `#141414`, paper `#F3EFEB` and `#F3EFE9` (warm off-whites again), and then a set of desaturated pastels used as per-project identity: `#9C93E8`, `#FFDDC4`, `#F7FFDC`, `#D1F3F5`, `#DDD9FF`. Zero shadows, zero blur, **8 `mask-image`**, 3 `mix-blend-mode`, 7 `perspective`/`translate3d` **[CSS]**.

**The transferable idea is the lighting metaphor, not the tech.** Each project is treated as an object under a spotlight — one directional source, a dark room, and the work is the only lit thing. You can execute that metaphor in pure CSS; it does not require Three.js.

### Mat Voyce — matvoyce.tv
GSAP Site of the Year nomination. Kinetic typography: *"letters that stretch, snap, and recombine on scroll"* **[PUB]**.

**Type as architecture [CSS]** — the reason to include it:
```
font-size: 40vw;
font-size: 40.3645833333vw;
font-size: clamp(15rem, 28.6458333333vw, 55rem);
font-size: 13.0208333333vw;
```
**40vw.** Type occupying 40% of viewport width is not typography, it is a shape that happens to be legible. Twelve hexes total. `#000`, `#fff`, `#533D4A`, `#062835`, `#00D4FF`, `#FFFEF8`, `#FFF6E3`, `#DFFF6B`, `#BCF3FF`.

Note `#FFFEF8` and `#FFF6E3` — even the "whites" are warm.

### Dennis Snellenberg — dennissnellenberg.com
Awwwards Developer Award. The most conventional-looking site here and the most instructive about *pairing*.

**Palette [CSS]** — 12 hexes, tokenised and named: `--color-dark: #1C1D20`, `--color-dark-dark: #141517`, `--color-light: #FFFFFF`, `--color-lightgray: #E9EAEB`, `--color-gray: #999D9E`, `--color-blue: #455CE9`, `--color-blue-dark: #334BD3`, borders as **alpha over neutral** — `rgba(28,29,32,.175)` / `rgba(255,255,255,.2)`.

**Easing — matched in/out pair [CSS]:**
```
cubic-bezier(0.34, 1, 0.64, 1)   /* 9 uses — the OUT curve  */
cubic-bezier(0.36, 0, 0.66, 0)   /* 8 uses — the IN curve   */
```
These are mirror images (`easeOutQuad` / `easeInQuad` from easings.net). Entrances decelerate, exits accelerate. Nine and eight uses means it is systematic, not per-component improvisation. **This is the correct pattern and the current site almost certainly does not have it.**

**Type [CSS]:** `font-size: 17.5vw` and `10vw` for display; body via `calc(clamp(1.75em, 2.3vw, 2.5em) * 1.125)` — a clamp multiplied by a ratio, so the whole scale moves from one lock.

**Shadow idiom [CSS]:** `box-shadow: inset .1em 0 0 .08em var(--color-white)` — inset shadows used as *drawn strokes* on text, not as depth. And `0 5px 0 5px var(--color-dark)` — a hard offset shadow with no blur, which reads as printing/registration rather than elevation.

**Scroll stack [HTML]:** GSAP + ScrollTrigger + Locomotive Scroll + Barba.js. This is the full 2021-era creative stack, still shipping in an award-winning 2025 site. Barba means real page transitions, not client-side route fades.

### basement.studio
Studio, not a personal site, but engineer-run and its CSS is a School B specimen with School A flourishes.

**[CSS]:** 11 distinct hex, `#E6E6E6` as the dominant light, `#000` ground, and `rgb(255 77 0)` — a hot orange — as ring colour. **4 conic-gradients** used for animated borders:
```
conic-gradient(from 0deg at bottom var(--b) left var(--b), var(--_g)) 0 100% / var(--_p), ...
```
This is the four-corner conic technique: four conic gradients pinned to the four corners, each sized by a `--_p` percentage variable, so animating one variable draws a border stroke around the box. Pure CSS, one animated custom property.

**Named keyframes [CSS]** tell you the vocabulary: `machine-reveal`, `diagonalPatternAnimation`, `marquee-translate`, `subtle-pulse`, `actionable-blink`. Note `actionable-blink` — a blink reserved for things you can act on. Motion is assigned a *job*.

### Bruno Simon — bruno-simon.com
The canonical "developer portfolio as a playable object" — a drivable 3D car on a physics world **[PUB]**.

**[CSS]:** 12 hexes, **14 radial-gradients**, zero shadows, zero masks, one keyframe. Loads Three.js **[HTML]**. Almost all of the site's visual content is in WebGL; the CSS exists only to get out of the way. One warm accent, `#FFC67B`.

**Why it is in this document as a warning as much as an example:** it is the most-cited developer portfolio of the last five years and it works *because Bruno's job is creative WebGL development*. The site is a work sample. For a security/payments engineer, the same site would be a non-sequitur. Ambition has to be ambition *about the right thing* — see §6.

### Olivier Larose, Caferati, henry.codes, antfu.me, shud.in, nan.fyi, brittanychiang.com — the engineer baseline
Included to calibrate where the current site sits.

- **olivierlarose.com [CSS]:** **3 hexes** (`#fff`, `#000`, `#121212`), `font-size: 6.5vw` / `3.8vw`, Locomotive Scroll, one curve `cubic-bezier(.3,.2,.2,.8)`. Nearly nothing, and it still reads as designed because the type is huge and the motion is consistent.
- **caferati.me [CSS]:** 5 hexes, `#E74F35` hot orange + `#951E0A` deep, 10 `perspective`/`translate3d`, three easing curves including `cubic-bezier(.8,1,.75,1.5)` — an **overshoot** curve (final control point > 1). One deliberate bounce.
- **henry.codes [CSS]:** the most relevant single site in the corpus for a gold build. Its dark mode is a **warm neutral at gold hue**:
  ```
  --color-background: #2a2722;   /* hsl(38, 11%, 15%)  [MEAS] */
  --color-echo:       #3e3b36;
  --color-border-light: hsl(38deg 11% 35%);
  --color-border-mid:   hsl(38deg 11% 25%);
  --callout-color:    #ebcb8b;   /* hsl(40, 71%, 73%)  [MEAS] */
  --color-text:       #fafafa;
  ```
  Hue 38–40 across the *entire neutral ladder*, at 11% saturation, with the accent at the same hue and 71% saturation. This is the "warm-tinted neutral" mechanic in its purest published form, at almost exactly the site's existing gold hue (41). Uses `Splitting.js` for per-character type effects **[HTML]**.
- **antfu.me [CSS]:** `--c-bg: #050505` dark, 22 `backdrop-filter`, 14 `blur()`. Almost all richness is frosted-glass over a near-black ground.
- **shud.in [CSS]:** ships a custom named neutral ramp, `--color-rurikon-50` → `--color-rurikon-800` (`#EBEDEF`, `#D8DBDF`, `#B3B9C1`, `#8C95A1`, `#697381`, `#4A515B`, `#3B4149`, `#2B3035`, `#1E2125`) — a **cool blue-tinted** grey ladder, named after a Japanese blue. Same mechanic as henry.codes, opposite temperature. Proof the technique is temperature-agnostic: what matters is that the neutrals have *a* temperature.
- **nan.fyi [CSS]:** Framer Motion, 24 hexes, one warm accent `#EBBC00`. Its ambition is entirely in interactive explanatory diagrams, not in surface treatment. Relevant to Direction B in §8.
- **brittanychiang.com [CSS/HTML]:** Tailwind, 10 `backdrop-filter`, 18 `drop-shadow`, and a mouse-tracked `radial-gradient` spotlight in the hero **[HTML]** — one radial gradient following the cursor over a navy ground. It is the most-cloned engineer portfolio in existence, which is the point: **the spotlight-follows-cursor move is now a tell, not a differentiator.** See §7.

---

## 1.3 School A — the material school (product sites and design-engineer sites)

These sites manufacture depth in CSS. If Direction A in §8 is chosen, this section is the implementation manual.

### Raycast — raycast.com
The richest CSS in the corpus and the best single teacher of dark-mode depth. 328 gradients, 172 masks, 125 blurs, 96 backdrop-filters **[CSS]**.

**The dark surface ladder [CSS]** — two parallel ramps, both with *very* tight steps at the bottom:
```
--grey-900: #07080A   --color-bg-100: #101111
--grey-800: #0C0D0F   --color-bg-200: #18191A
--grey-700: #111214   --color-bg-300: #313133
--grey-600: #1B1C1E   --color-bg-400: #494B4D
--grey-500: #2F3031
--grey-400: #434345
--grey-300: #6A6B6C
--grey-200: #9C9C9D
--grey-100: #CDCECE
--grey-50:  #E6E6E6
```
Steps 900→800→700 move by **5, 5** points of R. That is deliberately below the threshold of conscious perception — you do not see three greys, you see one surface that has thickness. The current site's dark ladder is `#0A0A0A → #141414 → #1C1C1C` (steps of 10 and 8), which is coarser and reads as three flat panels.

**Top-lighting — the highest-leverage single mechanic [CSS]:**
```
background: radial-gradient(100% 100% at 50% 0%, var(--grey-800) 0%, var(--grey-700) 100%);
background: radial-gradient(100% 100% at 50% 0%, var(--grey-700) 0%, var(--grey-600) 150%);
background: radial-gradient(100% 100% at 50% 0%, var(--grey-800) 0%, var(--grey-700) 150%);
```
Every surface is a **two-stop radial gradient anchored at `50% 0%`** — the top-centre — between two *adjacent* steps of the ladder. The `150%` end stop is the trick: the gradient never completes inside the box, so there is no visible terminus, just a continuous falloff. A flat `background: var(--grey-700)` and this gradient differ by about five points of luminance across the box, and the difference between "panel" and "object" is entirely in those five points.

**Hairlines are alpha-white, never grey [CSS]** — frequency counts across the stylesheet:
| Value | Uses | Typical role |
|---|---:|---|
| `#ffffff1a` (10%) | 139 | Default border |
| `#ffffff0f` (6%) | 57 | Subtle border inside a surface |
| `#ffffff0d` (5%) | 37 | Faintest divider |
| `#ffffff08` (3%) | 16 | Gradient tint stop |
| `#ffffff26` (15%) | 14 | Inset top highlight |
| `#ffffff4d` (30%) | 15 | Inset top highlight, strong |

The current site already does alpha borders (`#FFFFFF1F` / `#FFFFFF14`) — `docs/04` §3.3. What it does not have is the **inset top highlight**, which is the other half:

**The "physical object" shadow recipe [CSS]** — verbatim, three of them:
```css
/* a key / button */
box-shadow: 0 0 #0000, 0 0 .5px 1px #000, inset 0 2px 1px 1px #00000040,
            inset 0 1px 1px #ffffff26, inset 0 0 #0000;

/* a floating panel */
box-shadow: 0 0 #ffffff05, 0 0 #ffffff08, inset 0 .5px #ffffff4d,
            0 0 0 .5px #000c, 0 4px 40px 8px #0006;

/* same, in display-p3 */
box-shadow: 0 0 0 .5px color(display-p3 0 0 0/.8),
            0 4px 40px 8px color(display-p3 0 0 0/.4);
```
Read the second one. Four layers: a 0.5px white inset at the **top edge only** (`inset 0 .5px #ffffff4d`) simulating a lit bevel; a 0.5px black ring at 80% (`0 0 0 .5px #000c`) separating the object from anything behind it; a large soft ambient (`0 4px 40px 8px #0006`); and two near-invisible white haloes. **In dark mode, elevation is a lit top edge plus a dark contact ring — not a drop shadow.** Drop shadows are invisible on `#0A0A0A`.

**Masking as the anti-hard-edge tool [CSS]** — 172 uses. Representative:
```
mask-image: linear-gradient(#000 0% 45%, #0000 100%);
mask-image: linear-gradient(#0000, #000 24px calc(100% - 24px), #0000);
mask-image: linear-gradient(#0000 0% 70%, #000 80%, #0000 96%);
mask-image: linear-gradient(#000 0% 55%, #0000001a 65%, #0000 80%);
```
The second is the important one: a scroll container faded in at both ends by exactly `24px`. **Nothing on an expensive site has a hard edge where it meets the background.** Glows, gradients, grids, scrolling lists, image bleeds — all terminate in a mask, never a boundary. This is the property with the strongest correlation to "looks expensive" in my whole dataset: Raycast 172, Aceternity 174, and every School-B-only site 0–8.

**Glow construction [CSS]:**
```
radial-gradient(#ffffff0a 0%, #0000 70%)
radial-gradient(49.41% 64.58% at 49.4% 0, #ffffff08 0%, #fff0 100%)
radial-gradient(50% 132.92% at 0 100%, #2bafff33 0%, #2bafff00 100%), #ffffff0d
radial-gradient(44.65% 31.1% at 75.43%, #f5306b1f 0%, #ff67a700 100%)
```
Glows are **3–20% alpha**, elliptical (separate width/height percentages), anchored off-centre or off-edge (`at 49.4% 0`, `at 0 100%`), and **fade to the transparent version of their own hue** (`#2bafff33 → #2bafff00`, not `→ transparent`). Fading to `transparent` in sRGB passes through grey and produces a dirty halo; fading to `#RRGGBB00` does not.

**Easing [CSS]:** ten distinct curves, top three `cubic-bezier(.23,1,.32,1)` ×21 (easeOutQuint), `cubic-bezier(.4,0,.22,.96)` ×10, `cubic-bezier(.16,1,.3,1)` ×8 (easeOutExpo). Plus `cubic-bezier(.34,1.56,.64,1)` ×2 — an overshoot, used twice, deliberately.

### Linear — linear.app
Linear's marketing CSS is token-hashed so hex extraction is useless, but it ships a **named, documented lighting system** that no one else in the corpus has, and it is the best idea in School A.

**The edge-glow system [CSS]** — verbatim custom properties and the rules that consume them:
```css
--edge-glow-tint: var(--edge-glow-color, #ffffff08);
--edge-glow-width: 50%;  --edge-glow-height: 35.71%;
--edge-highlight-x: 0;   --edge-highlight-y: 0;
--edge-highlight-width: 17.18%; --edge-highlight-height: 28.57%;
--edge-highlight-radius: var(--card-radius);
--shine-beam-length: 200px;
```
```css
/* the glow itself, painted into the card's border box */
radial-gradient(ellipse var(--edge-glow-width,50%) var(--edge-glow-height,50%)
  at var(--edge-highlight-x,0) var(--edge-highlight-y,0),
  var(--edge-glow-tint) 0%, color-mix(in srgb, var(--edge-glow-…

/* a mask that restricts the highlight to a plateau near the light point */
radial-gradient(ellipse var(--edge-highlight-width,17.18%) var(--edge-highlight-height,28.57%)
  at var(--edge-highlight-x,0) var(--edge-highlight-y,0),
  #000 0%, #000 var(--edge-highlight-plateau,0%) …

/* a travelling specular beam */
radial-gradient(ellipse var(--shine-beam-length) var(--shine-beam-length)
  at var(--mask-x) var(--mask-y),
  #000 0%, #0009 30%, #0003 50%, #0000 70%)
```
What this is: **a card's border is not a colour, it is a lit surface.** A radial ellipse is painted into the border box at a point `(--edge-highlight-x, --edge-highlight-y)`, so the hairline is brighter where the light falls and dimmer elsewhere. A second radial acts as a mask restricting the bright "plateau." A third — the shine beam — is a specular highlight whose position (`--mask-x`, `--mask-y`) is driven from JS.

**Why this matters more than any other single technique here:** it makes the light source *an explicit variable*. Once `--edge-highlight-x/y` exists, every bordered element on the page can be lit from the same point, and moving that point — on pointer, on scroll, once on load — relights the entire page coherently. That is what "designed" looks like, and it is three custom properties and one `radial-gradient`.

Linear also ships the **directional fade mask** as a system **[CSS]**:
```css
mask-image:
  linear-gradient(to right, var(--mask-invisible) 0px, var(--mask-visible) var(--fade-left)),
  linear-gradient(to left,  var(--mask-invisible) 0px, var(--mask-visible) var(--fade-right)), …
```
Composable per-edge fades with named `--fade-left` / `--fade-right` distances. That is the productised version of Raycast's 172 ad-hoc masks.

### Cursor — cursor.com
204 distinct hex **[CSS]**. Included for one thing: a properly constructed **single-hue heat ramp**, held at hue 19° across eight steps:

| Hex | Hue | Sat | Lum | **[MEAS]** |
|---|---:|---:|---:|---|
| `#772600` | 19 | 100% | 23% | darkest, fully saturated |
| `#803A1A` | 19 | 66% | 30% | **saturation drops** |
| `#A33900` | 21 | 100% | 32% | |
| `#ED4C00` | 19 | 100% | 46% | |
| `#F54E00` | 19 | 100% | 48% | the solid |
| `#FF7433` | 19 | 100% | 60% | hover |
| `#F6A57F` | 19 | 87% | 73% | text-on-dark |
| `#FFB999` | 19 | 100% | 80% | |
| `#DFA88F` | 19 | 56% | 72% | **saturation drops again** |

Hue is nailed to 19° for the whole ramp; only lightness moves. And at both *ends* saturation is pulled back (66% at L30, 56% at L72). That is the difference between a ramp that looks like a brand and one that looks like a `hsl()` loop.

Cursor also carries a second, gold ramp in the 29–51° band: `#493019`, `#916031`, `#946B2D`, `#C08532`, `#E9B872`, `#FFC164`, `#D29922`, `#FEBC2E`, `#BF8700`, `#D4A72C`, `#A88D02`, `#D3C680`, `#EEE8CC`, `#544701`. **`#D29922` is hue 41, saturation 72%, lightness 48% [MEAS] — the same hue as the site's `#D1A954` (41°/58%/57%), one step darker and more saturated.** A ready-made neighbour value.

### Firecrawl — firecrawl.dev
Included for two shadow recipes that are directly reusable with gold substituted for orange.

**Tinted shadow ladder [CSS]** — verbatim:
```css
box-shadow:
  inset 0 -6px 12px #f003,          /* inset bottom glow, accent at 20% */
  0 2px 4px  #ff4d001f,             /* 12% */
  0 1px 1px  #ff4d001f,             /* 12% */
  0 .5px .5px #ff4d0029,            /* 16% */
  0 .25px .25px #ff4d0033;          /* 20% */
```
**Every shadow is in the accent hue, not black.** Five layers, sub-pixel at the tight end (`.25px`), and an inset glow rising from the *bottom* edge as if the object is emitting. Shipped with a `color(display-p3 …)` twin for wide-gamut displays.

**The tiny-alpha card shadow [CSS]:**
```css
box-shadow:
  0 24px 32px -12px #00000008,   /* 3% */
  0 16px 24px -8px  #00000008,
  0 8px 16px -4px   #00000008,
  0 0 0 1px         #00000008,   /* hairline ring */
  0 0 0 12px        #f9f9f9;     /* 12px solid "matte frame" */
```
Four shadows at **3% alpha each** — individually invisible, collectively a soft realistic falloff — plus a hairline ring, plus a 12px solid spread that acts as a picture-frame mat. Compare a single `0 4px 12px rgba(0,0,0,.1)`, which is what the current site is likely doing and which reads as Bootstrap.

### claude.com
The best published example of **warm-tinted neutrals**, and the most directly applicable site in the corpus to a gold identity.

**Neutral ramp [CSS]** — note that every value has R > G > B:
```
--color-gray-000 #FFFFFF   --color-gray-400 #B0AEA5
--color-gray-050 #FAF9F5   --color-gray-450 #9C9A92
--color-gray-100 #F5F4ED   --color-gray-500 #87867F
--color-gray-150 #F0EEE6   --color-gray-550 #73726C
--color-gray-200 #E8E6DC   --color-gray-600 #5E5D59
--color-gray-250 #DEDCD1   --color-gray-650 #4D4C48
--color-gray-300 #D1CFC5   --color-gray-700 #3D3D3A
--color-gray-350 #C2C0B6
```
**Dark surfaces [CSS]:** `--a-bg #1A1A19`, `--a-side #212120`, `--a-seg #282826`, `--a-bd #2E2D2B`, `--a-fg #F0EFED`, `--a-mut #7A786F`.

**Accents [CSS]:** `--color-clay #D97757` (the identity), `--color-clay-dark #C46849`, `--color-clay-hover #C6613F`, plus a named natural set — `--color-oat #E3DACC`, `--color-cactus #BCD1CA`, `--color-olive #788C5D`, `--color-fig #C46686`, `--color-coral #EBCECE`, `--color-heather #CBCADB`, `--color-sky #6A9BCC`.

**The lesson, stated plainly:** `#D97757` is a *moderate* colour — 63% saturation, 60% lightness **[MEAS]**, only 3.04:1 on white. It reads as expensive not because it is a good orange but because **the greys around it are already warm.** The neutrals carry the temperature; the accent only has to confirm it. 83 `box-shadow` and 19 `mask-image`, but **zero `blur()` and zero `backdrop-filter`** — no glass at all. Warmth alone is doing the work.

### mattgperry.com and motion.dev — Matt Perry (author of Motion)
**mattgperry.com [CSS]:** **218 `cubic-bezier`**, 61 `@keyframes`, 58 `perspective`/`translate3d`, 26 `backdrop-filter`, 75 `box-shadow`, 37 hexes. The motion library author's own site has 218 distinct easing declarations and *thirty-seven colours*. A useful corrective: motion sophistication and palette sophistication are independent axes.

**motion.dev [CSS]** — the single most interesting texture in the corpus for this brief, the **hatch pattern**:
```css
linear-gradient(119deg, color-mix(in srgb, var(--foreground) 10%, transparent) 0 1px,
                        transparent 1px 6px)
linear-gradient(119deg, color-mix(in srgb, var(--accent) 28%, transparent) 0px,
                        color-mix(in srgb, var(--accent) 28%, transparent) 1px,
                        transparent 1px, transparent 6px)
linear-gradient(119deg, color-mix(in srgb, var(--foreground) 5%, transparent) 0 4px,
                        transparent 4px 12px)
```
A repeating 1px line at **119°**, spaced 5–12px, built entirely from `color-mix()` against the theme's own `--foreground` and `--accent` tokens at 5–30%. Six density variants. This is **drafting hatch** — it reads as engineering drawing, not decoration, it is theme-agnostic by construction, it costs nothing, and it is the texture idea most appropriate to a security/payments engineer in the entire dataset. It is the seed of Direction B.

### Mercury and Increase — the fintech register
Included because the subject's work is payments, and payments has a visual register that hiring managers in that space recognise.

**Mercury [CSS]** ships a **beige base ramp**: `--color-beige-base-50 #FCFCFA`, `-100 #F6F5F2`, `-150 #EFEEE9`, `-200 #E0DED7`, `-300 #C8C4B8`. And its yellow is `--color-avatar-yellow #A38131` — a *muted* gold, with a 24%-alpha twin `#D59B4C`. 55 `cubic-bezier`, 42 gradients, 14 masks. Same warm-neutral mechanic as claude.com, in a banking context.

**Increase [CSS]:** `#1A2B3B` (deep navy ground), `#EDF0F2` / `#F5F6F7` / `#E1E5E9` (cool paper), **`#FF5F33`** (hot orange, 11 uses) and `#31F2BF` (mint, 9 uses). Payments infrastructure with two saturated accents on a navy ground, 31 shadows, only 2 masks. Proof that the "credible fintech" look tolerates genuine heat — it just keeps it to two colours and a lot of structure.

### ped.ro — Pedro Duarte (Radix maintainer)
Included for one thing: **the complete, verbatim grain recipe**, which is the cheapest high-value texture in this whole document.

**[HTML]** — the filter, inline in the document:
```html
<svg id="texture">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="4" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
</svg>
```
**[CSS]** — the layer that consumes it:
```css
#texture {
  position: fixed; inset: 0; z-index: 9999;
  width: 100vw; min-height: 100vh;
  opacity: .2;
  pointer-events: none;
  transform: translateY(0);
  filter: contrast(60%) brightness(100%);
}
```
Every number matters: `baseFrequency .8` (fine grain, not blobs), `numOctaves 4` (enough variation to avoid visible tiling), `stitchTiles="stitch"` (no seams), `feColorMatrix saturate 0` (monochrome — coloured noise looks like JPEG artefacts), `opacity .2` combined with `filter: contrast(60%)` (so the effective opacity is far below 20%), `pointer-events: none`, `z-index: 9999` (**above everything, including modals**), and `transform: translateY(0)` to force it onto its own compositor layer so it never repaints during scroll.

Pedro also ships the full **Radix Colors** token set inline (717 hexes), which is why his site's amber is literally `--amber-9: #FFC53D`, and his accent is `--accent: #FF4921`.

### Aceternity UI — ui.aceternity.com (the template library)
Not a site to emulate. Included as the **inventory of moves that have been commoditised**, because a technical audience in 2026 recognises every one of them on sight.

**[CSS]:** 454 gradients (134 radial, 8 conic), 174 masks, 177 shadows, 154 drop-shadows, 73 text-shadows.

**[HTML] — the published component list**, which is the actual deliverable of this subsection:

> `aurora-background` · `background-beams` · `lamp-effect` · `sparkles` · `wavy-background` · `text-generate-effect` · `hero-section-with-mesh-gradient` · `hero-section-with-mousemove` · `hero-parallax` · `macbook-scroll` · `3d-card-effect` · `3d-pin` · `3d-globe` · `github-globe` · `moving-border` · `tracing-beam` · `infinite-moving-cards` · `bento-grid` · `card-hover-effect` · `floating-dock` · `animated-tooltip` · `parallax-scroll` · `timeline`

**Every one of these is now a tell.** They are free, they are in every AI-generated portfolio shipped since 2024, and an engineering hiring manager has seen them forty times this quarter. See §7.

But note the underlying *primitives* Aceternity uses, which are not tells and are worth stealing:
```css
background-image: radial-gradient(#404040 1px, #0000 0);              /* dot grid */
background-image: radial-gradient(circle at .5px .5px, #ffffff4d .5px, #0000 0);  /* sub-pixel dot grid */
background-image: radial-gradient(164.75% 100% at 50% 0, #334155 0, #0f172a 48.73%);  /* top-lit */
background-image: radial-gradient(88% 100% at top, #ffffff80, #fff0);  /* top sheen */
background-image: radial-gradient(80% 50% at 50% -20%, #7877c61f, #0000); /* off-canvas glow */
```
`at 50% -20%` — the glow's origin is **outside the element**, above it. That is how you get a light source rather than a blob.

---

# Part 2 — Portfolio templates: what recurs in the ones that look expensive

Sourced from the Aceternity component inventory **[HTML]**, Vercel's template listing **[HTML]**, and the Awwwards jury commentary **[PUB]**. I fetched Vercel's portfolio template index; it returned only Astro entries (`astrowind`, `astrozen`, `professional-card-astro`, `content-wind`, `og/gallery`) — a thin listing, and I will not over-claim from it.

**Structural patterns that recur in expensive-looking templates:**

1. **A hero that is one idea, not four.** One sentence, one object, one accent. The cheap templates put a headline, a subhead, two buttons, a badge, an avatar, and a gradient blob in the same viewport.
2. **A second-screen "proof strip"** immediately after the hero — logos, numbers, or a one-line credential row — before any narrative. Increase, Mercury, Linear all do this **[OBS]**.
3. **Asymmetry as a rhythm.** Expensive layouts alternate 1-column / 2-column / full-bleed. Templates repeat a 3-up card grid down the whole page.
4. **Content-shaped modules.** Every School B site treats each project as a *different shape*. Template sites give every project the same card.
5. **An explicit "end."** A closing section with a different ground colour or a full-bleed statement. Templates just stop.

**Visual patterns:**

6. **Warm or cool tinted neutrals** — claude.com, Mercury, henry.codes, shud.in, by-kin, Iventions, Minh Pham. Pure `#808080`-family greys appear in *none* of the sites I rated as expensive.
7. **Off-white, never `#FFF`; near-black, never `#000`** — `#F4F2ED`, `#F3EFEB`, `#FFFEF8`, `#FAF9F5`, `#0D0D0D`, `#0C0B0A`, `#07080A`. (The current site already does this — `docs/04` §3.2. It is one of the few things it gets right.)
8. **Type range past 6×.** by-kin runs ~7.2×; Mat Voyce runs 40vw. Templates run 2.5–3×.
9. **One or two easing curves, applied everywhere.** Minh Pham: one curve, 60 uses. Dennis: a matched in/out pair, 9 and 8 uses.
10. **No hard edges.** Masks, not borders, wherever content meets ground.

---

# Part 3 — The 8 moves that separate "expensive" from "template"

Ranked by leverage-per-unit-of-effort for this specific site.

### 1. Give the page a light source, and make it a variable
Linear's `--edge-highlight-x/y` **[CSS]**, Raycast's `radial-gradient(… at 50% 0%, …)` on every surface **[CSS]**, Aceternity's `at 50% -20%` off-canvas origin **[CSS]**, Iventions' spotlight metaphor **[PUB]**. One declared direction of illumination, consumed by every surface, every hairline, every shadow. This is the difference between panels and objects, and it is the mechanic the current site most conspicuously lacks.

### 2. Tint the neutrals toward the accent hue
claude.com's entire grey ramp at R>G>B **[CSS]**; henry.codes at `hsl(38, 11%, …)` across the whole ladder **[CSS]**; Mercury's beige base **[CSS]**; shud.in doing the same thing in blue **[CSS]**; Minh Pham's body text `#B7AB98` **[CSS]**. **This is why gold currently reads as a sticker on the site: it is the only warm thing in a pure-neutral system.** Warm the neutrals at 4–8% saturation and the gold stops being a decoration and becomes the temperature of the page.

### 3. Shadows in the accent hue and lit from the top, never black-and-below
Firecrawl's five-layer `#ff4d00` shadow ladder with an inset bottom glow **[CSS]**; Raycast's `inset 0 .5px #ffffff4d` lit bevel plus `0 0 0 .5px #000c` contact ring **[CSS]**; Firecrawl's four-shadow 3%-alpha stack **[CSS]**. In dark mode a black drop shadow is invisible; the *only* elevation cues that work are a lit top edge, a dark contact ring, and an ambient in the accent hue.

### 4. Never let anything end at a hard edge — mask it
172 masks on Raycast, 174 on Aceternity, a named `--fade-left`/`--fade-right` system on Linear, 0–8 on every site that does not look expensive **[CSS]**. Every glow, grid, gradient, scroller, and image bleed terminates in `mask-image: linear-gradient(…)`. Strongest single correlation in the dataset.

### 5. Fade to the transparent version of the hue, not to `transparent`
`#2bafff33 → #2bafff00`, `#f5306b1f → #ff67a700`, `#d9d9d9 → #d9d9d900` **[CSS, Raycast]**. sRGB interpolation to `transparent` passes through grey and produces a dirty halo. This is a two-character fix with a disproportionate effect on perceived quality.

### 6. Pick one easing curve and use it sixty times
Minh Pham: `cubic-bezier(.165,.84,.44,1)`, 60 uses, only curve on the site **[CSS]**. Dennis: a mirrored pair, `(0.34,1,0.64,1)` out / `(0.36,0,0.66,0)` in, 9 and 8 uses **[CSS]**. by-kin / Iventions / Mat Voyce all share `cubic-bezier(.76,0,.24,1)` **[CSS]**. A site with one motion signature feels authored; a site with ten feels assembled.

### 7. Let type be a shape
Mat Voyce `font-size: 40vw` **[CSS]**; Dennis `17.5vw` **[CSS]**; by-kin's hand-authored fluid locks reaching ~7.2× the body size **[CSS]**; Olivier Larose achieving a designed feel with **three colours** and `6.5vw` type **[CSS]**. Scale is the cheapest possible ambition and it degrades perfectly — huge type is still text, still selectable, still readable by a screen reader, still works with JS off.

### 8. Add grain, at 20% opacity, under 60% contrast, on its own layer
ped.ro's complete recipe **[HTML + CSS]**, reproduced verbatim in §1.3. Fixes dark-mode gradient banding, unifies disparate surfaces, adds perceived material cost, is about 400 bytes, and has zero layout or accessibility impact.

**The ninth, unranked, and the real thesis:** *commit to one school.* School A (material) and School B (motion) are both complete answers. Taking `aurora-background` from A and `text-generate-effect` from B and a bento grid from a template is exactly what produces the look everyone recognises as generated. Pick a school, then execute its whole vocabulary.

---

# Part 4 — Dark-mode-first visual richness

Consolidated from Raycast, Linear, antfu.me, Aceternity, Minh Pham **[CSS]** and dark-theme practice **[PUB]**.

**4.1 The ladder must be finer than you think.** Raycast: `#07080A → #0C0D0F → #111214 → #1B1C1E → #2F3031` — steps of 5, 5, 10, 20 points of R. Sub-perceptual at the bottom, widening as you rise. The current site's `#0A0A0A → #141414 → #1C1C1C` is a coarser, three-panel ladder. Rule of thumb from the corpus: **five or six levels, each a two-stop gradient between adjacent levels, never a flat fill.**

**4.2 Elevation is light, not shadow.** On `#0A0A0A` a black shadow is a no-op. What works, in priority order:
1. A 0.5px white inset on the **top edge only** — `inset 0 .5px #ffffff4d` **[CSS, Raycast]**
2. A dark contact ring — `0 0 0 .5px #000c` **[CSS, Raycast]**
3. A wide low-alpha ambient — `0 4px 40px 8px #0006` **[CSS, Raycast]**
4. Surface lightness itself: the higher the element, the lighter its ground.

**4.3 Borders are alpha-white at 3–15%, and they are lit.** Raycast's frequency table in §1.3. Linear takes it further: the border is a *radial gradient* brighter at the light point. The current site has (1) and not (2).

**4.4 Glass is optional, warmth is not.** antfu.me: 22 `backdrop-filter`, 14 `blur()`, near-black `#050505` **[CSS]**. claude.com: **zero** blur, zero backdrop-filter, and it is the warmest site in the corpus **[CSS]**. Glass is one way to get depth; a tinted ladder is a better one, and cheaper to render.

**4.5 Grain fixes banding.** Any large dark gradient on an 8-bit display bands. The ped.ro grain layer is the standard fix and it is why expensive dark sites look like material rather than like a gradient.

**4.6 Off-canvas glow origins.** `radial-gradient(80% 50% at 50% -20%, …)` **[CSS, Aceternity]** and `at 49.4% 0` **[CSS, Raycast]** — the light originates above or outside the viewport. A glow whose centre is visible reads as a blob; a glow whose centre is off-screen reads as illumination.

---

# Part 5 — Making the existing gold feel expensive

The brief narrowed here: **the gold stays.** `#D1A954` dark / `#7C5E1D` light, `docs/04` §3.4. This section is about the system *around* that value.

## 5.1 Where the current gold actually sits

**[MEAS]**, computed from the tokens in `docs/04` §3.2–3.3:

| Value | Hue | Sat | Lum | on `#0A0A0A` | on `#FCFCFC` |
|---|---:|---:|---:|---:|---:|
| `#D1A954` (dark accent) | 41 | 58% | 57% | 8.97:1 | 2.15:1 |
| `#7C5E1D` (light accent) | 41 | 62% | 30% | 3.28:1 | 5.89:1 |

Both sit at hue 41. That is a genuinely good hue — the same band as Cursor's `#D29922` (41/72/48), henry.codes' `#EBCB8B` (40/71/73), Radix `amber-9 #FFC53D` (42/100/62), and Josh Comeau's `#EBAC47` (37/80/60) **[MEAS, from CSS]**. **The colour is not the problem.**

## 5.2 The problem, diagnosed

The current system pairs a hue-41 accent with a **perfectly neutral** greyscale: `#0A0A0A`, `#141414`, `#1C1C1C`, `#EDEDED`, `#A8A8A8`, `#8A8A8A`, `#4A4A4A`. Zero warm bias anywhere.

Every site in this corpus that feels expensive with a warm accent does the opposite. claude.com's whole ramp is warm. henry.codes' whole ramp is `hsl(38, 11%, …)`. Mercury's is beige. Minh Pham's *body text* is warm taupe. by-kin's paper is `#F4F2ED`. Mat Voyce's white is `#FFFEF8`.

**A warm accent on a cold ground reads as a highlighter mark. A warm accent on a warm ground reads as an identity.** That is the finding.

## 5.3 Reference ramps, with hex

**Radix `gold`, dark [PKG]** — the *muted metallic* reading of gold, and the single best reference for the surface half of a gold system:
```
1 #121211  2 #1B1A17  3 #24231F  4 #2D2B26  5 #38352E  6 #444039
7 #544F46  8 #696256  9 #978365  10 #A39073  11 #CBB99F  12 #E8E2D9
```
**Radix `gold`, light [PKG]:**
```
1 #FDFDFC  2 #FAF9F2  3 #F2F0E7  4 #EAE6DB  5 #E1DCCF  6 #D8D0BF
7 #CBC0AA  8 #B9A88D  9 #978365  10 #8C7A5E  11 #71624B  12 #3B352B
```
**Radix `amber`, dark [PKG]** — the *saturated* reading:
```
1 #16120C  2 #1D180F  3 #302008  4 #3F2700  5 #4D3000  6 #5C3D05
7 #714F19  8 #8F6424  9 #FFC53D  10 #FFD60A  11 #FFCA16  12 #FFE7B3
```
**Radix `bronze`, dark [PKG]** — warmer and pinker, a good alternative surface ladder:
```
1 #141110  2 #1C1917  3 #262220  4 #302A27  5 #3B3330  6 #493E3A
7 #5A4C47  8 #6F5F58  9 #A18072  10 #AE8C7E  11 #D4B3A5  12 #EDE0D9
```
**Radix `sand`, dark [PKG]** — the neutral-but-warm ladder, closest to a drop-in replacement for the current greys:
```
1 #111110  2 #191918  3 #222221  4 #2A2A28  5 #31312E  6 #3B3A37
7 #494844  8 #62605B  9 #6F6D66  10 #7C7B74  11 #B5B3AD  12 #EEEEEC
```

**Radix's documented step semantics [PUB]** — worth adopting wholesale because it removes an entire class of arguments:

| Step | Role |
|---|---|
| 1 | App background |
| 2 | Subtle background |
| 3 | UI element background (rest) |
| 4 | Hovered UI element background |
| 5 | Active / selected UI element background |
| 6 | Subtle borders and separators (non-interactive) |
| 7 | UI element border and focus rings |
| 8 | Hovered UI element border; stronger focus rings |
| 9 | **Solid backgrounds — highest chroma of all steps** |
| 10 | Hovered solid background |
| 11 | Low-contrast text |
| 12 | High-contrast text |

Notice that **step 9, the highest-chroma step, is `#978365` in `gold` and `#FFC53D` in `amber`.** The site's `#D1A954` sits between them. Both are legitimate; they are different *characters* of gold. `gold-9` is antique brass; `amber-9` is a lit filament. §8's three directions each pick one.

## 5.4 A warm-tinted ladder for this site

Proposed, not prescribed. Hue 41 held constant, saturation 6–8%, lightness matched to the existing steps so nothing about contrast compliance changes materially. **[MEAS]**, generated:

| Current (neutral) | Proposed (hue 41, S 6–8%) | Role |
|---|---|---|
| `#0A0A0A` | `#0C0B0A` | Page ground |
| `#141414` | `#161513` | Surface |
| `#1C1C1C` | `#1F1E1C` | Raised |
| — (new) | `#2A2925` | Overlay / popover — the ladder needs a 5th step |
| `#4A4A4A` | `#423F38` | Faint / non-text |
| `#EDEDED` | `#EDE9E1` | Foreground — **16.25:1 on `#0C0B0A`** |
| `#FCFCFC` | `#F2EFE8` | Foreground-strong — **17.13:1** |
| `#A8A8A8` | `#A8A29A` | Foreground-secondary — **7.78:1** |
| `#8A8A8A` | `#8C877E` | Foreground-muted — **5.51:1 on ground** |

All four text values clear AA on the new ground with headroom **[MEAS]**. The muted value will need re-checking against `#1F1E1C` the way `docs/04` §3.3 did — that check found the real failures last time and should be repeated, not assumed.

**What this buys, concretely:** at 6% saturation nobody will ever say "the background is brown." But the gold will stop looking like it was pasted on, and the entire page will read one or two degrees warmer than it does today. This is the cheapest single change in this document and probably the second-highest-impact after §3's move 1.

## 5.5 Making gold read as *light* rather than as *paint*

Gold has a property no other brand hue has: it is a material people expect to be **reflective**. A flat fill of `#D1A954` is the one treatment that squanders that. Every mechanic in §3 that involves light is therefore worth more on a gold site than it would be on a blue one:

- **Gold hairlines that vary in brightness along their length** (Linear's edge-glow, §1.3) — a gold rule that is `#D1A954` at one end and `#D1A95400` at the other reads as a lit metal edge.
- **Shadows in gold at 12–20% alpha, plus an inset bottom glow** (Firecrawl's recipe, §1.3, with `#ff4d00` → `#D1A954`).
- **Gold glows that fade to `#D1A95400`, never to `transparent`** (§3 move 5).
- **Gold at very low alpha as a surface tint** — `#D1A95408` over a dark ground is a *lit region*, not a coloured region. Raycast uses `#ffffff08` for exactly this.
- **A single gold specular sweep across display type, once, on load**, then never again.

---

# Part 6 — The credibility line

This is the section the relaxed budget makes *more* important, not less. The question is not "how much can we spend" but "what kind of spending does an engineer read as competence rather than as performance."

## 6.1 What the evidence actually says

From the HN "great personal blogs/portfolios" thread **[PUB]**, which is the most direct sample of the target audience reacting to personal sites, the criticisms are remarkably consistent and **none of them are about ambition**:

- **Weight and speed.** One portfolio weighing "33MB" drew sustained criticism; another "took almost 50sec (16sec DOMContentLoaded) to be completely finished loading."
- **JS dependency.** *"I got a completely blank page running Firefox + uMatrix with no scripts running."*
- **Typography.** *"The font weight of the body text is almost painfully light."* *"The small font really annoys me, at least one size bigger would be better."*
- **Cognitive load.** Overly complex single-page designs criticised for overwhelming; heavy colour palettes called fatiguing.
- **Praise** went to authenticity, longevity, clear writing, and personality — including explicit praise for Flash-era playfulness, with the caveat that novelty must not cost function.

From Awwwards jury commentary **[PUB]**: the three-pillar test is **art direction, directed motion, performance.** Sites fail when *"animation hides weak art direction"* and when *"performance dies under load."* Note that "too much motion" is not on the list. **Undirected** motion is.

From the scroll-library literature **[PUB]**: the specific, concrete accessibility failure of the creative-web stack is *scroll-jacking* — faking a `position: fixed` container and translating it in JS, which breaks the scrollbar, arrow-key navigation, `position: sticky`, `scroll-snap`, in-page search, anchor links, and screen readers. Lenis's entire pitch is that it eases the **native** scroll position instead, so the scrollbar remains truthful and keyboard scrolling still works. Minh Pham ships Lenis; Dennis Snellenberg ships Locomotive **[HTML]**.

## 6.2 The line, stated

**Engineers do not discount a site for being beautiful. They discount it for three things:**

1. **Beauty that costs them something.** A 33MB page. A blank screen without JS. A scroll that fights the trackpad. A hijacked `Cmd+F`. Every one of these is a *tax the visitor pays for the author's aesthetics*, and that is the thing that reads as vanity.
2. **Beauty that is not about the work.** Bruno Simon's driving game is credible because he is a creative WebGL developer — the site *is* the portfolio. The same site under a FIDO2/PKI engineer's name would read as an unrelated hobby. **Ambition must be legible as ambition about the subject's actual domain.** A security engineer's site can absolutely be spectacular; it should be spectacular about systems, trust, protocol, or verification, not about particles.
3. **Beauty you can buy for free.** This is the sharp one. `aurora-background`, `lamp-effect`, `background-beams`, `sparkles`, `text-generate-effect`, `bento-grid`, a mouse-follow spotlight, a mesh-gradient hero — an engineering hiring manager has seen these on dozens of candidate sites because they are two npm installs away. **Using them does not read as "this person has taste," it reads as "this person has the same starter kit."** The expense signal comes from things that are visibly *specific to this person* and visibly *not from a library*.

## 6.3 The resolution

The tension in the brief — ambitious but not performing — resolves cleanly along one axis:

> **Spend on things a library cannot give you; refuse things a library will.**

A hand-drawn sequence diagram of Splita's commit-first payment flow is expensive, unmistakably specific, and impossible to have installed. A gold edge-lighting system derived from the actual brand hue is expensive and specific. A custom WebGL field authored for this site is expensive and specific. `aurora-background` is free and generic.

And the **three hard floors are non-negotiable regardless of direction**, because they are the only things the evidence shows engineers actually punish:
- Core content renders with JavaScript disabled.
- Native scroll is never hijacked — ease it (Lenis) or leave it alone.
- Lighthouse stays above 90, and the site is fast on a mid-range phone, not just on the developer's laptop.

A site that clears those three and is then as ambitious as it likes will be admired, not discounted. `docs/01` optimised for *not being punished*. That is why nothing happens when you look at it.

---

# Part 7 — Explicit AVOID list for a technical audience

**Instantly-recognised template signatures.** From the Aceternity inventory **[HTML]**, all now generic:
1. Aurora / mesh-gradient hero backgrounds.
2. "Background beams" and animated light rays.
3. The lamp / conic-spotlight hero.
4. Sparkles and particle fields.
5. Wavy or blob-morph backgrounds.
6. `text-generate-effect` — the word-by-word typing reveal on the hero headline.
7. A terminal/code-editor pastiche with a blinking cursor and fake `npm` output.
8. Mouse-follow radial spotlight (brittanychiang.com's move, cloned to death).
9. 3D tilt-on-hover cards.
10. Bento grids used as the default project layout.
11. Infinite horizontal marquees of skill logos. (The tech-logo wall in general: it signals junior.)
12. A rotating 3D globe.
13. Numeric "skill %" bars or radar charts.

**Behaviours that cost the visitor.**
14. Scroll-jacking — any implementation that stops the native scroll position from being the truth.
15. A preloader/percentage counter before content. On a personal site it is a self-imposed penalty.
16. Full-page pinned scroll sections that trap the wheel and make it impossible to reach the footer.
17. Custom cursors that replace or hide the system cursor.
18. Horizontal scroll as the primary reading axis.
19. Motion that continues indefinitely in the viewport — a permanently animating background is a permanent cognitive tax.
20. Anything that breaks `Cmd+F`, anchor links, back/forward, or text selection.

**Craft failures the HN sample called out by name [PUB].**
21. Body text below ~16px, or at a weight below 400.
22. Low-contrast "elegant" grey text. (`docs/04` §3.2 already caught this — `#8A8A8A` measured 3.36:1 and failed.)
23. Multi-megabyte pages and long DOMContentLoaded.
24. A blank page with JS disabled.

**Credibility failures specific to this subject.**
25. Spectacle unrelated to the domain. No particle systems, no driving games, no generative art for its own sake — unless the visual *is* about payments, trust, authentication, or systems.
26. Inflating the record visually. `$200K pre-seed in early commitments` is the honest phrase; a giant animated "$200K RAISED" counter converts a true fact into something a reader will want to check, which is the opposite of the intended effect.
27. Design-director vocabulary in the copy — "crafting digital experiences," "passionate about pixel-perfect." The visual ambition should be carried entirely by the visuals; the words should stay flat, factual, and technical.
28. More than two accent colours. Increase ships exactly two (`#FF5F33`, `#31F2BF`) on a navy ground. Minh Pham ships one.

---

# Part 8 — Three direction options

All three keep hue-41 gold. All three assume the §5.4 warm-tinted neutral ladder, the §3 light-source variable, the ped.ro grain layer, and a single easing signature. They differ in **what the site's ambition is about**, and they are deliberately not variations of one idea: A is about *material*, B is about *information*, C is about *atmosphere*.

---

## Direction A — "Machined"
**School A, executed completely. The site as a precision object under a lamp.**

**Palette.** Ground `#0C0B0A`, with a five-step warm ladder `#0C0B0A → #161513 → #1F1E1C → #2A2925 → #423F38` (§5.4). Every surface is a two-stop radial between adjacent steps anchored at `50% 0%`, per Raycast. Text `#F2EFE8` / `#EDE9E1` / `#A8A29A` / `#8C877E`. Hairlines alpha-white at `#ffffff1a` / `#ffffff0f`. Accent `#D1A954`, plus `#E8C87E` as a lit-highlight value and `#8F6424` (Radix `amber-8`) as a deep shadow value. Light mode is the Radix `gold` light ladder (`#FDFDFC → #FAF9F2 → #F2F0E7 → #EAE6DB`) with `#7C5E1D`. **Three colours total. The rest is light.**

**Hero.** The name set at roughly `clamp(4rem, 12vw, 11rem)`, weight 600, tight negative tracking, in `#F2EFE8` — sitting on a ground that is imperceptibly brighter directly behind and above the letterforms, from a single `radial-gradient(70% 45% at 50% -10%, #D1A95410, #D1A9540)` whose origin is **off-canvas above the fold**. Beneath it, one line: role, company, and the three institutions, in `#A8A29A` monospace at 14px. And a single hairline rule spanning the measure that is `#D1A954` at 40% alpha where the light falls and fades to `#D1A95400` at both ends. Once, on load, a narrow specular band sweeps left-to-right across the display type over ~900ms and never repeats.

**Signature motif — the lit edge.** Linear's `--edge-highlight-x / --edge-highlight-y` system (§1.3), adopted wholesale but driven by *scroll position* rather than the pointer. Every bordered element on the page — project cards, the nav bar, code blocks, the focus ring — draws its border as a radial gradient in gold that is brightest nearest the current light point. Because the light point is a single pair of custom properties on `:root`, the entire page is lit coherently from one source, and as you scroll, that source travels down the page. Buttons and the primary CTA use the Firecrawl shadow ladder with gold substituted: `inset 0 -6px 12px #D1A95433, 0 2px 4px #D1A9541f, 0 1px 1px #D1A9541f, 0 .5px .5px #D1A95429`. Grain at 20% / contrast 60% over the whole thing.

**Scroll feel.** Almost nothing moves. Sections do not fly in. What changes as you scroll is **the light**: edges brighten and dim, surfaces shift a few points of luminance, the gold in the hairlines travels. The sensation is tilting a machined metal object under a fixed lamp. Content transitions are a 320ms `cubic-bezier(.165,.84,.44,1)` opacity-and-8px-rise, used identically everywhere — Minh Pham's one-curve discipline.

**Build cost.** Low-to-moderate. Pure CSS custom properties plus one `requestAnimationFrame` loop writing two numbers to `:root`. No new dependency, negligible JS, no layout thrash if the light point only touches `background-image` on composited layers. Lighthouse impact ≈ 0. **This is the best ratio of visual return to risk in the three.**

**Reduced motion.** `prefers-reduced-motion: reduce` freezes `--edge-highlight-x/y` at a fixed top-centre position. Every edge is still lit, every surface still has its gradient, the grain is still there — the page loses only the travel. The specular sweep does not play. Nothing is lost but the animation, which is the correct degradation. Works fully with JS off (light point falls back to its static default via the `var(--edge-highlight-x, 0)` fallback pattern Linear already uses).

---

## Direction B — "Trust Chain"
**Information design as the aesthetic. The site that only a security and payments engineer could have made.**

**Palette.** Inverted emphasis: **light-first**, warm paper. Ground `#F5F4ED` / `#F0EEE6` (claude.com's `gray-100`/`gray-150`), ink `#1A1A19`, secondary `#5E5D59`, muted `#87867F`. Gold `#7C5E1D` is **annotation ink** — every callout, leader line, registration mark, measurement tick, and label is gold; nothing else is. One secondary, `#1A2B3B` deep navy (Increase's ground), reserved exclusively for the diagram strokes themselves. Dark mode inverts to `#161513` paper with `#D1A954` annotation.

**Hero.** The name is large but not the loudest thing. Behind and around it, drawn at hairline weight in `#1A2B3B` at 12% alpha, is an actual technical drawing — the WebAuthn/FIDO2 registration ceremony, four parties and six labelled messages, correctly ordered. Gold registration marks sit at the four corners of the measure. A monospace label in gold sits beside the drawing with a leader line pointing into it: `ceremony: navigator.credentials.create()`. The whole hero is on visible paper: motion.dev's 119° hatch (§1.3) at `color-mix(in srgb, var(--foreground) 5%, transparent)` fills the margins.

**Signature motif — everything is a diagram.** The projects are not cards. **Splita** is rendered as a real sequence diagram of the commit-first flow: participants, commitment, settlement, the failure branch. **Queralt** is a trust chain — root CA to intermediate to attestation to Entra ID — drawn as linked nodes with the actual certificate-chain shape. **Snorkel** is a labelled evaluation pipeline. These are hand-authored inline SVG, in the site's two colours, at hairline weight, with gold annotations calling out the part that was *his*. The type system is editorial: a serif or high-contrast display for the name, everything else in a single monospace, which is also the annotation face.

**Scroll feel.** The diagrams **draw themselves.** As each enters view, `stroke-dashoffset` animates the strokes on in sequence — message 1, then 2, then 3 — over ~1.2s, then locks and never replays. Gold annotation labels fade in 200ms behind their leader lines. Between sections, the hatch density in the margins shifts. The sensation is watching a competent engineer sketch the architecture on a whiteboard, fast, and get it right. It is the only one of the three directions where the *scroll reveals information* rather than mood.

**Build cost.** Runtime cost is near zero — inline SVG, `stroke-dashoffset`, an `IntersectionObserver`. The real cost is **design time**: four or five diagrams that are technically correct *and* beautiful is genuinely hard and cannot be generated. Budget this as illustration work, not engineering work. Lighthouse impact ≈ 0; it may actually be the *lightest* of the three.

**Reduced motion.** Trivially safe and the best-degrading of the three: under `prefers-reduced-motion`, and with JS disabled, every diagram renders **fully drawn** on first paint (the dash animation is opt-in, applied only when motion is allowed). Nothing is hidden behind an observer. The diagrams are also the only direction whose signature content is inherently describable — each SVG gets a real `<title>`/`<desc>` and a text alternative, so the site's most distinctive asset is available to a screen reader rather than being decorative.

**This is the direction with the highest credibility ceiling** and the one that most directly answers "make them feel he builds things most candidates cannot," because the visual *is* the evidence.

---

## Direction C — "Field"
**The ambitious one. A single generative surface the whole site floats on.**

**Palette.** Near-black `#0A0908`, bone `#EDE9E1`, and gold as **emitted light only** — `#D1A954` never appears as a flat fill anywhere on the site. Not on a button, not on a link underline. It exists solely as brightness in the field and as the colour of light spilling from it. The only other value is `#8F6424` in the field's low-energy regions. **Two colours and a light source.**

**Hero.** Full-bleed behind everything: a slow GPU shader field — a flow/caustic field in near-black, with gold filaments moving through it at very low frequency and very low contrast, like heat over dark metal or current through a mesh. It is not a hero video and it is not decorative noise; it runs the full height of the document at ~20% perceived intensity. The name sits at `clamp(5rem, 14vw, 14rem)` in bone, and **the field brightens directly behind the letterforms**, so the type appears backlit rather than painted. Below it, the credential line in monospace, unlit, quiet.

**Signature motif — the field responds to attention.** The field's energy concentrates under whatever section is in view and cools elsewhere. Splita's section warms it toward a denser, faster state; the Queralt section resolves it into something more lattice-like and ordered; Snorkel scatters it. The field is the page's single continuous element and it is the thing a viewer remembers — a coherent, quiet, expensive-feeling surface that is unmistakably custom. Content sits on masked panels at `#ffffff05` with lit top edges, so the material vocabulary of Direction A is still present, just subordinate.

**Scroll feel.** Long, slow, cinematic. Sections are separated by real distance and the field morphs continuously between states with no hard cuts. Type crossfades through a mask rather than sliding. Native scroll is **eased with Lenis, never hijacked** — the scrollbar stays truthful, arrow keys work, `position: sticky` works, `Cmd+F` works. No pinning that traps the wheel.

**Build cost.** Real, and it should be stated plainly. A hand-written GLSL/WGSL shader on **OGL** (~15–25 KB) rather than three.js (~150 KB+), a static pre-rendered fallback frame for no-WebGL and reduced-motion, frame-rate governance (cap at 30fps, pause when the tab is hidden, pause when off-screen), and careful testing on integrated graphics. Expect 40–80 KB added and real GPU work. **Lighthouse can stay above 90 if the shader is lazy-initialised after LCP and the fallback image is what paints first** — but this needs measuring, not assuming, and it is the only direction where the >90 floor is in genuine doubt.

**Reduced motion.** The field freezes to a single pre-rendered frame — chosen and art-directed so the static version is itself beautiful, not a degraded leftover. No morphing, no filament movement, no scroll-driven energy. Same image is served when WebGL is unavailable, when the tab is backgrounded, and when JS is off, so the static frame is the true baseline and the shader is strictly an enhancement on top. All content sits in normal document flow above it; nothing depends on the canvas.

**Risk.** Highest ceiling and highest chance of tipping into §6's failure mode 2 — *spectacle unrelated to the domain*. The field must read as **systems** — flow, current, trust propagating through a mesh — not as generic generative art. If it looks like a screensaver, it fails; if it looks like a payment network under load, it is the most memorable site in the candidate pool.

---

## Choosing between them

| | A — Machined | B — Trust Chain | C — Field |
|---|---|---|---|
| Ambition is about | material and light | information and systems | atmosphere |
| School | A (material) | B-adjacent (structural/editorial) | B (motion) + A surfaces |
| Build cost | low–moderate | low runtime, high design time | high |
| Lighthouse >90 | certain | certain | needs measurement |
| Degrades under reduced motion | perfectly | perfectly | to a static frame |
| Credibility with engineers | high | **highest** | high if the field reads as systems, low if it reads as art |
| Risk of "template" | very low | none | none |
| Risk of "trying too hard" | very low | very low | **real** |
| Memorability in 90s | good | high — because it is *about him* | highest |

**They are also combinable in one specific way worth flagging:** A is a surface system and B is a content system. A site could adopt A's lit-edge material vocabulary *and* B's diagrams — that is not a fourth direction so much as A executed with B's project treatment, and it would be the strongest single answer if the illustration budget exists. C cannot be combined with either without becoming the incoherent mixture §3 warns about.

---

## Appendix — full source list

Fetched live with `curl` on 2026-09-11, desktop Chrome UA. Stylesheets concatenated from `<link rel="stylesheet">` hrefs plus inline `<style>` blocks, capped at 8–12 files per site.

**School B / creative portfolios:** minhpham.design · by-kin.com · iventions.com · matvoyce.tv · dennissnellenberg.com · basement.studio · bruno-simon.com · olivierlarose.com · caferati.me · uncommonstudio.com.au (markup only)
**Engineer portfolios:** henry.codes · antfu.me · shud.in · nan.fyi · brittanychiang.com · ped.ro · joshwcomeau.com · mattgperry.com · cassie.codes (markup only)
**School A / product:** raycast.com · linear.app · cursor.com · claude.com · firecrawl.dev · motion.dev · mercury.com · increase.com · press.stripe.com (markup only)
**Template library:** ui.aceternity.com · vercel.com/templates/portfolio
**Token packages [PKG]:** `@radix-ui/colors@3.0.0` — `gold`, `gold-dark`, `amber-dark`, `bronze-dark`, `sand-dark`, `orange-dark`
**Published [PUB]:** hontran.dev Awwwards jury writeup (2026) · Radix Colors scale documentation · Vercel Geist colors documentation · HN thread 19114037 · Lenis / Locomotive scroll-jacking literature

**Not sourced, and therefore not claimed:** scroll trigger offsets, parallax ratios, stagger delays, and pin durations for any site in this document. Those live in JavaScript and would need the sites to be instrumented in a browser. Every scroll description above is either a library identification **[HTML]**, an easing curve **[CSS]**, or my reading of the markup **[OBS]**.
