# 08 — Cross-Browser and Mobile Review, Cycle 2

Re-audit after the Phase-5 fix pass. Verifies the six defects of
`docs/06-review-crossbrowser.md`, then goes after what cycle 1 did not reach:
variable-font rendering, the `.col` measure columns, **print**, older-engine
degradation, iOS specifics, Next 15.5 hydration, P3, and hard network failure.

**Method.** `npm run build` (exit 0) → `next start -p 3104 -H 127.0.0.1`, driven
by Playwright `1.63.0` against three real engines. `claude-in-chrome` was not
used. Another agent was concurrently on 3102; this run never touched it.

| Engine | Build reported by `browser.version()` | Proxy for |
| --- | --- | --- |
| Chromium | **153.0.8010.12** | Chrome, Edge, Android Chrome |
| Firefox | **155.0** | Firefox desktop + Android |
| WebKit | **26.6** | Safari 26, iOS Safari |

Note the engines are *newer* than cycle 1 (Chromium 1243 → 153, Firefox 135 →
155, WebKit 18.4 → 26.6): Playwright moved 1.51 → 1.63 with the `next` bump.
Where that changes a cycle-1 conclusion it is called out.

Artifacts — 62 screenshots, 4 PDFs, 7 raw JSON result sets — outside the repo at:

```
/private/tmp/claude-501/-Users-arinzeokigbo-arinzeokigbo/2fd2ae8f-82a7-43b7-b850-975a3ff341b1/scratchpad/xb2/
  shots/                 62 PNG + chromium_page.pdf + w3d_p{1..4}.pdf + nogl_p{1..4}.pdf
  p1-results.json        font / variable-axis / @font-face
  p2-results.json        7 widths x 3 engines columns + feature matrix + print
  p3-results.json        print with the 3D live
  p4-results.json        fallback metrics, network failure, iOS, SPA, reduced motion, prev-defect
  p5-results.json        text-size-adjust, @layer analysis, slow net, P3 profiles
  p6-results.json        DPR, mobile nav, dark theme, /writing + 404
  p7-results.json        backlog rule, scroll restore, transition timing
```

**Headline.** The six cycle-1 defects are all genuinely fixed, in all three
engines, by measurement rather than by reading the diff. The new font, the new
columns and the pure-CSS motion system are the *cleanest* parts of this build —
byte-for-byte identical geometry in all three engines at all seven widths, and a
real variable axis with no synthesis anywhere. The damage this cycle is
concentrated in exactly the one place nobody had looked: **print**. The
attestation figure — the single authored visual on the site — prints as an empty
rounded box for anyone whose browser loaded the WebGL canvas, which is everyone
not on reduced motion. Proven with Chromium's real print pipeline and a
counterfactual, not asserted.

**New defect count**

| Severity | Confirmed | Suspected |
| --- | --- | --- |
| CRITICAL | 0 | 0 |
| HIGH | 1 | 0 |
| MEDIUM | 4 | 0 |
| LOW | 4 | 0 |
| — | | 4 carried/unverifiable (S1–S4) |

By engine: **all-three-engines 8**, **Firefox-only 1**, **Chromium-only 0**,
**WebKit-only 0**.

---

## PART A — VERIFICATION OF THE SIX CYCLE-1 DEFECTS

Every row below was measured on the production build in each engine
independently. `p4-results.json` → `prev`, `p1-results.json`, `p6-results.json`.

### 1. CRITICAL — Space Grotesk never applies → **GENUINELY FIXED, all three engines**

| Measurement | chromium | firefox | webkit |
| --- | --- | --- | --- |
| `:root` `--font-sans` | `"Space Grotesk","Space Grotesk Fallback",-apple-system,Blink…` | same | same |
| `h1` computed family (first) | `"Space Grotesk"` | `"Space Grotesk"` | `Space Grotesk` |
| `document.fonts` loaded | `Space Grotesk` + `Space Grotesk Fallback` | `Space Grotesk` | `Space Grotesk` + `Space Grotesk Fallback` |
| `h1` rendered width @1440 | 656.86 | 656.83 | 656.86 |

`layout.tsx:120` now carries `spaceGrotesk.variable` on `<html>` and
`globals.css:198-200` gives the `var()` its belt-and-braces fallback. Both halves
of the recommended fix landed. The 0.005 % spread on `h1` width across engines is
the tightest this site has ever measured. **FIXED.**

### 2. HIGH — lattice renders salmon → **GENUINELY FIXED, all three engines, both themes**

Mean colour of drawn (non-background) pixels in the live canvas, sampled from an
element-clipped capture of the 768×432 frame:

| | chromium | firefox | webkit |
| --- | --- | --- | --- |
| light (cycle 1) | rgb(209,**188**,**184**) | rgb(210,189,185) | rgb(208,188,184) |
| **light (now)** | **rgb(196,196,196)** | **rgb(194,194,194)** | **rgb(193,193,193)** |
| **dark (now)** | **rgb(45,45,45)** | **rgb(44,44,44)** | **rgb(45,45,45)** |

Every channel equal — neutral, matching the poster's `rgb(92,92,92)` /
`rgb(168,168,168)` ink. The red bias is gone in all three engines in both themes.
Ink coverage 5.02–5.56 % (cycle 1: 4.96–5.04 %), i.e. the same field.
**FIXED.** See §B8 for a caveat about *why* it is now fixed.

### 3. HIGH — footer links 16 px tall → **FIXED for block size, all three engines**

Measured at 390×844, `hasTouch`, coarse pointer:

| Link | cycle 1 | chromium | firefox | webkit |
| --- | --- | --- | --- | --- |
| `arinze@splita.co` | 97.5 × **16** | 128 × **44** | 128 × **44** | 128 × **44** |
| `GitHub` | 41.6 × **16** | 51.8 × **44** | 51.8 × **44** | 51.8 × **44** |
| `LinkedIn` | 49.8 × **16** | 63.5 × **44** | 63.4 × **44** | 63.5 × **44** |
| `X` | 8.6 × **16** | **10.1** × 44 | **10.1** × 44 | **10.1** × 44 |

All four now carry `class="link link-standalone"`. **FIXED as specified** — the
fix report's claim was about *block size*, and it holds exactly. The residual
10.1 px inline size is filed as new defect **N9**.

### 4. MEDIUM — no `safe-area-inset`, no `viewport-fit=cover` → **FIXED (accept-and-document), all three engines**

Served meta is `width=device-width, initial-scale=1` — no `viewport-fit`.
Runtime stylesheet scan for `safe-area-inset` / `env(` → **false** in all three
engines, on both the root document and the iPhone 14 Pro context.
`grep -rn "env(" src/` returns nothing. The pair is internally consistent, which
is precisely the state cycle 1 asked for, and `layout.tsx:91-104` records the
reasoning and names the exact `env()` padding that must land with any future
`viewport-fit: cover`. **FIXED as the option the reviewer offered.** The
landscape-letterboxing cost is unchanged and accepted.

### 5. LOW — dead unprefixed `backdrop-filter` → **GENUINELY FIXED, all three engines**

| | chromium | firefox | webkit |
| --- | --- | --- | --- |
| `.site-header` `backdrop-filter` | `none` | `none` | `none` |
| `.site-header` `-webkit-backdrop-filter` | (not exposed) | (not exposed) | **`none`** |
| `.site-header` background | `rgb(252,252,252)` | same | same |

The declaration is gone from the compiled stylesheet in every engine, and the
in-file comment records the two-part condition for ever bringing it back.
**FIXED.** (Aside: WebKit 26.6 now reports `CSS.supports("backdrop-filter", …)`
= **true**, where WebKit 18.4 reported false in cycle 1. That cycle-1 observation
is now stale; it changes nothing, because the declaration no longer exists.)

### 6. LOW — 22,620 B of font preloaded and never used → **GENUINELY FIXED, all three engines**

Exactly **one** `.woff2` request per load —
`36966cca54120369-s.p.woff2`, HTTP 200, the `U+0-FF` Latin subset — and
`document.fonts` reports that face **`loaded`** in all three engines, with the
glyphs actually painting (§B1). The other two subsets (`U+100-2BA`,
Vietnamese) stay `unloaded` and are never fetched. The bytes now buy something.
**FIXED.**

### Cycle-1 suspected items

- **S1 (device floor gate)** — still stands, and re-confirmed:
  `navigator.deviceMemory` is `null` in **both Firefox 155 and WebKit 26.6** and
  `16` in Chromium. `capability.ts:34-35` correctly treats `undefined` as a pass,
  so on non-Chromium the memory gate does not exist. `hardwareConcurrency` was 8
  in all three. Unchanged from cycle 1; see S1 below.
- **S2 (iOS URL-bar resize)** — still unverifiable. Measured in the iPhone 14 Pro
  context: `100vh`, `100svh`, `100dvh`, `100lvh` all resolve to **660 px** in all
  three engines, because the harness has no dynamic toolbar. `100svh` remains the
  only viewport unit in the file (`globals.css:403`) and `100vh` appears nowhere,
  which is the configuration that makes the classic bug impossible. Expect a pass.

**All six hold fixed, in all three engines. No regressions of the six.**

---

## PART B — NEW CONFIRMED DEFECTS

### N1. HIGH — The attestation figure prints as an empty box once the 3D has loaded. All engines (CONFIRMED in Chromium's real print pipeline).

**Files.** `src/components/three/runtime/mount.ts:96-101` and `:37-44`;
`src/components/three/runtime/scene.ts:57-64`; `src/app/globals.css:1179-1203`.

```ts
// mount.ts:96-101 — on the first drawn frame
onFirstFrame: () => {
  canvas.style.opacity = "1";
  if (poster) poster.style.opacity = "0";   // <- inline, survives @media print
},
```

```ts
// scene.ts:57-64 — OGL Renderer options. No `preserveDrawingBuffer`.
renderer = new Renderer({ canvas, dpr: resolveDpr(), alpha: true,
  antialias: true, depth: false, premultipliedAlpha: false, autoClear: true });
```

**Mechanism.** Once the cross-fade runs, the server-rendered SVG poster — the
only vector representation of the figure — is pinned to `opacity: 0` by an
**inline style**, which no `@media print` rule in `globals.css §10` overrides.
The visual is then carried entirely by a WebGL canvas created with OGL's default
`preserveDrawingBuffer: false`, so the drawing buffer is undefined after
compositing. The print rasteriser re-snapshots the page and gets nothing.

**Reproduction.** Load `/`, scroll the figure into view, wait for the cross-fade,
print (or Save as PDF).

**Evidence — measured, then proven by counterfactual.**

State at print time, identical in all three engines (`p3-results.json`):

```
chromium  canvasOpacity "1"  posterOpacity "0"  (inline "0")
firefox   canvasOpacity "1"  posterOpacity "0"  (inline "0")
webkit    canvasOpacity "1"  posterOpacity "0"  (inline "0")
```

The canvas has no readable backing store in any engine — `drawImage(canvas)` into
a 2D context then `getImageData` returns **zero non-transparent pixels** in
chromium, firefox and webkit (`p3-results.json` → `sampled: {empty:true}`), while
the same frame is plainly visible on screen.

Chromium `page.pdf()`, A4, `printBackground: true`, two runs of the same page —
one with WebGL live, one with `getContext("webgl"|"webgl2")` stubbed to `null`:

```
page 2 (the page carrying the figure)
  WebGL live      77,254 B   ->  shots/w3d_p2.pdf   figure frame is EMPTY
  WebGL blocked  155,269 B   ->  shots/nogl_p2.pdf  248 poster circles render
pages 1, 3, 4 are byte-identical between the two runs (119,876 / 83,425 / 112,467)
```

Rendered: `ql2/w3d_p2.pdf.png` shows the bordered 768×432 frame containing
nothing at all; `ql2/nogl_p2.pdf.png` shows the full lattice. The 78 KB delta is
exactly the vector poster.

**Severity.** HIGH, not MEDIUM: the figure is the site's one authored moment and
the thing the honesty caption underneath it describes ("seeded the geometry
above"), so the printed page carries a caption pointing at a blank rectangle. A
recruiter PDF-ing this page is the stated audience for the print sheet.

**Engine scope.** CONFIRMED in Chromium, which is the print path for Chrome and
Edge. For Firefox and Safari I can state the two necessary conditions hold
identically (inline `opacity: 0` on the poster; empty readback from the canvas)
but Playwright cannot produce real print output for those engines — see S3.

**Fix.** One rule in `globals.css §10`, which also makes the figure
engine-independent in print:

```css
@media print {
  /* The poster is the printable artifact. The canvas has no persistent
     drawing buffer (scene.ts uses OGL's default preserveDrawingBuffer:false),
     so it rasterises to nothing. `!important` is required: mount.ts sets the
     poster's opacity INLINE on first frame. */
  [data-attestation-poster] { opacity: 1 !important; }
  canvas { display: none !important; }
}
```

---

### N2. MEDIUM — The print URL-expansion rule is inert on every link on the page. All three engines.

**File.** `src/app/globals.css:1194-1198`, defeated by `:619-629`.

```css
/* :619 — inside @layer components */
.link::after {
  content: ""; position: absolute; inset-inline: 0; inset-block-end: -0.2em;
  block-size: 2px; background: var(--color-accent); transform: scaleX(0);
}
/* :1194 — unlayered, so it wins `content` and nothing else */
a[href^="https://"]::after { content: " (" attr(href) ")"; font-size: 11px; }
```

**Mechanism.** `.link::after` is already claimed as the 2 px accent underline
bar. The print rule replaces only `content`; `position: absolute`,
`block-size: 2px` and `transform: scaleX(0)` all survive from the component
layer, so the URL text is laid out inside a 2 px-tall box scaled to zero width.
It is never painted.

**Reproduction.** Print `/`, or `page.emulateMedia({media:"print"})` and read
`getComputedStyle(a, "::after")`.

**Evidence.** All 16 `https://` anchors, identical in all three engines
(`p2-results.json` → `print.links`):

```
Splita          content=" (https://splita.co)"   position=absolute
                block-size=2px   transform=matrix(0, 0, 0, 1, 0, 0)   <- scaleX(0)
Queralt Inc.    content=" (https://www.queraltinc.com)"   … same geometry
… 14 more, every one identical
```

Visual confirmation in the rendered PDF: `ql3/nogl_p1.pdf.png` shows "Splita",
"Queralt Inc." and "Snorkel AI" underlined with **no URL appended**, and
`ql3/nogl_p4.pdf.png` shows the footer's `GitHub` / `LinkedIn` / `X` with no
destinations.

**Honest scoping.** MEDIUM rather than HIGH because the printed page is not
information-lossy: the contact section prints the handles as literal visible
text ("GitHub — github.com/arinze-okigbo"). What is lost is the footer's three
links, the résumé affordance, and R29's stated guarantee. The rule is dead code
that reads as working.

**Fix.** Use a pseudo-element the component layer has not claimed:

```css
a[href^="https://"]::before { content: none; }  /* no-op, documents intent */
a[href^="https://"]::after {
  content: " (" attr(href) ")"; font-size: 11px;
  position: static; block-size: auto; transform: none; background: none;
}
```
Expand `mailto:` too, or drop the rule and state that the visible text carries
the destination.

---

### N3. MEDIUM — The only CTA on the page prints as undifferentiated body text. All three engines.

**File.** `src/app/globals.css:1183-1189`, against `:662-694`.

```css
@media print {
  *, *::before, *::after { background: #fff !important; color: #000 !important; box-shadow: none !important; }
}
```

`.btn` declares `border: 1px solid transparent` (`:669`) and `.btn--primary`
carries its identity entirely in `background: var(--color-accent)` (`:691-694`).
The print reset removes the fill and leaves the border transparent, so nothing
remains.

**Evidence.** Both `.btn--primary` instances (hero and contact), identical in all
three engines:

```
text "Email arinze@splita.co"   bg rgb(255,255,255)   color rgb(0,0,0)   border rgba(0,0,0,0)
```

Visible in `ql3/nogl_p1.pdf.png`: "Email arinze@splita.co" and
"Résumé (PDF) — not yet published" print as two indistinguishable runs of text,
though one is the page's only call to action and the other is inert copy.

**Fix.** Give the printed button an outline instead of a fill:

```css
@media print { .btn--primary { border-color: #000 !important; } }
```

---

### N4. MEDIUM — No pagination control anywhere. Zero break/orphan/widow/@page rules. All three engines.

**File.** `src/app/globals.css` — absent throughout §10.

**Evidence.** The full compiled stylesheet was walked recursively (including
inside `@layer` and `@media`) for `break-inside`, `break-after`, `break-before`,
`orphans`, `widows` and `@page`. **0 matches** in all three engines
(`p2-results.json` → `print.breakRules`).

**Consequence, observed in the 4-page PDF.** Entries split at arbitrary points:
the Splita work entry begins near the foot of page 1 and its meta line is the
last line on that sheet; the Queralt entry's heading opens page 2 and the figure
that belongs to it is 500 px lower. Nothing guarantees a heading stays with its
first paragraph, or that the 768×432 figure is not cut in half by a sheet break.

**Fix.** Three rules in `§10`:

```css
@media print {
  h1, h2, h3 { break-after: avoid; }
  article, figure, .meta-line { break-inside: avoid; }
  p { orphans: 3; widows: 3; }
}
```

---

### N5. MEDIUM — The metric-matched font fallback only exists on platforms that ship Arial. All three engines; the exposure is Android and Linux.

**File.** `src/app/layout.tsx:37-43` (`adjustFontFallback: true`), which emits:

```css
@font-face {
  font-family: "Space Grotesk Fallback";
  src: local("Arial");          /* <- a single local() source, no alternative */
  ascent-override: 89.71%; descent-override: 26.62%;
  line-gap-override: 0%; size-adjust: 109.69%;
}
```

Verified byte-identical in the compiled stylesheet in all three engines
(`p1-results.json` → `fontFaceRules`).

**Mechanism.** `local("Arial")` resolves on Windows, macOS and iOS. It does
**not** resolve on Android (Roboto/Noto) or on most Linux. Where it fails the
`@font-face` never matches, the metric overrides and `size-adjust` do not exist,
and `--font-sans` falls through *unadjusted* to
`-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif`. This is
the very swap that cycle 1's Pass 10 said must be re-measured once the font
actually loaded — and it was re-measured only on a host that has Arial.

**Evidence.** Same document at 390 px, body family forced to each of the three
candidate stacks, identical in all three engines (`p4-results.json` → `fallback`):

| Stack in use | document height | lede paragraph height | `h1` width |
| --- | ---: | ---: | ---: |
| Space Grotesk (final) | 5255 | **87** | 342.0 |
| `"Space Grotesk Fallback"` (Arial + `size-adjust`) | 5314 (+1.1 %) | **87** | 333.1–333.2 |
| bare system stack (**no Arial**) | 5051 (−3.9 %) | **58** | 340.1–342.0 |

The lede goes from 87 px to 58 px — **one whole line fewer** — when the adjusted
face is unavailable. So on a device with Arial the swap costs ~1 % of document
height and no line-break changes (which is what the fix report measured as
CLS 0.000, correctly). Without Arial the pre-swap render wraps differently and
the swap re-flows the paragraph, which is a real layout shift the moment the
webfont arrives.

**Status.** The mechanism and the measurement are CONFIRMED; the field CLS on a
real Android handset is not, because Arial cannot be uninstalled from this host.
That is S4.

**Fix.** Add a second, hand-authored fallback face after the `next/font` one, so
the overrides survive on Android and Linux:

```css
@font-face {
  font-family: "Space Grotesk Fallback";
  src: local("Roboto"), local("Helvetica Neue"), local("Liberation Sans"), local("Arial");
  ascent-override: 89.71%; descent-override: 26.62%;
  line-gap-override: 0%; size-adjust: 109.69%;
}
```
(The override percentages are Arial-derived; Roboto and Liberation Sans are close
enough that the residual is far smaller than the un-adjusted fall-through.
Re-measure on a real handset before claiming CLS 0 on Android.)

---

### N6. LOW — `-webkit-text-size-adjust: 100%` is rejected outright by Firefox. Firefox only.

**File.** `src/app/globals.css:362`.

**Evidence** (`p5-results.json` → `textSizeAdjust`):

```
chromium  CSS.supports("-webkit-text-size-adjust","100%") = true
          computed -webkit-text-size-adjust = "100%"   computed text-size-adjust = "100%"
firefox   CSS.supports(...) = false   inline set is REJECTED (returns "")
          computed -webkit-text-size-adjust = "auto"   computed -moz-text-size-adjust = "auto"
webkit    property not exposed via getComputedStyle in this build — see S5
```

The authored `100%` does not reach Firefox at all; Firefox exposes
`-moz-text-size-adjust` (and, recently, unprefixed `text-size-adjust`), neither
of which the stylesheet sets.

**Honest scoping.** LOW, and close to harmless: Firefox for Android suppresses
its font-inflation heuristic when the document declares
`width=device-width, initial-scale=1`, which this one does
(`p2-results.json` → `tokens.viewportMeta`). So the practical consequence is a
declaration that buys nothing in one of the three target engines, not a visible
defect. Cycle 1's Pass 16 credited this declaration with preventing iOS text
inflation; that credit is correct for WebKit and wrong for Firefox.

**Fix.** `text-size-adjust: 100%; -webkit-text-size-adjust: 100%;` — the
unprefixed property first, prefixed second.

---

### N7. LOW — The scroll-driven-animation block is unreachable dead code, and it is the one place the three engines actually diverge. All three engines.

**File.** `src/app/globals.css:493-501`, against `src/components/motion/Reveal.tsx:49`.

```css
@supports (animation-timeline: view()) {
  .js [data-reveal="decorative"] { animation: reveal linear both; animation-timeline: view(); … }
}
```
```ts
export type RevealDistance = "default" | "lg";   // Reveal.tsx:49 — no "decorative"
```

**Evidence.** `grep -rn "decorative" src/` finds the CSS rule, this comment, and
two unrelated prose comments — no component ever emits
`data-reveal="decorative"`. Every `[data-reveal]` on every route carries
`default` or `lg` (`p3-results.json` → `printWith3d.reveals`, 7 elements,
variants `lg` ×1 and `default` ×6).

Meanwhile `CSS.supports("animation-timeline", "view()")` is **true in Chromium
153 and WebKit 26.6, false in Firefox 155** — the only genuine three-way engine
split in the entire feature matrix (§C). It is currently harmless *only* because
nothing uses it. The moment a component starts emitting `decorative`, Firefox
silently gets no reveal at all while the other two get a scroll-driven one.

**Fix.** Delete `globals.css:493-501` and `@keyframes reveal` (`:502-511`) with
it, or add `"decorative"` to `RevealDistance` **and** a
`@supports not (animation-timeline: view())` fallback. Do not leave it as-is.

---

### N8. LOW — The corrected P3 colour parser is no longer on any runtime path. All three engines.

**Files.** `src/components/three/runtime/color.ts:28,36` and
`src/components/three/AttestationPoster.tsx:113`.

The cycle-1 fix to `FLOAT_PATTERN` is correct and unit-tested. But the *other*
fix in the same pass moved the lattice's ink from `--color-accent` to
`--color-foreground-secondary`, and that token is a plain hex:

```
chromium  --color-foreground-secondary = "#5c5c5c"  (light) / "#a8a8a8" (dark)
firefox   same          webkit  same
chromium  --color-accent = "color(display-p3 .47 .37 .1)"  <- never reaches parseCssColor
```

So `parseFunctional` — the path with the `display-p3` bug — is now reached by
**nothing at runtime**. `readFigureColor` takes `parseHex` on every load in every
engine. The regex and `componentList()` are belt-and-braces for a future token
change only.

**This is not a defect.** It is recorded because it would be easy for the next
agent to read "the display-p3 regex is fixed and the lattice is now the right
colour" as cause and effect, and it is not: the colour is right because the
token changed, and the parser is right independently. If the figure ever goes
back to an accent-derived colour, the P3 path becomes live again and needs
re-measuring on a wide-gamut display.

---

### N9. LOW — The footer "X" link is a 10.1 × 44 CSS px touch target on a coarse pointer. All three engines.

**File.** `src/app/globals.css:639-659`.

```css
.link-standalone { min-block-size: var(--space-6); /* 24px */ … }
@media (pointer: coarse) { .link-standalone { min-block-size: calc(var(--space-8) + var(--space-3)); /* 44px */ } }
```

Only `min-block-size` is set; there is no `min-inline-size`. Cycle-1 defect 3 is
fixed exactly as specified (16 → 44 px block size, verified above), but the "X"
link's inline size is unchanged from cycle 1's 8.6 px — now 10.1 px, the
difference being Space Grotesk's metrics rather than any fix.

**Evidence.** 390×844, coarse pointer, `p4-results.json` → `prev.d3_footerLinks`:
`X` measures **10.1 × 44** in chromium, firefox and webkit.

**Conformance assessment — this is NOT a WCAG failure.** SC 2.5.8 is satisfied
through the spacing exception: `.footer-links` uses `gap: var(--space-6)` = 24 px,
so the centre-to-centre distance from "X" to "LinkedIn" is
`10.1/2 + 24 + 63.5/2` = **60.6 px**, comfortably past the 24 px the exception
requires. Filed as a touch-ergonomics finding, not a conformance one: a 10 px-wide
tap target on a phone is hard to hit regardless of what the spec permits.

**Fix (optional).** `padding-inline: var(--space-2)` on `.link-standalone` inside
the coarse-pointer block, which widens the target without moving the text.

---

## PART C — OLDER-ENGINE DEGRADATION (asked for explicitly)

Feature support measured live in all three engines (`p2-results.json` →
`features.feats`); the "what breaks" column is the static analysis of what the
stylesheet actually does with each.

| Feature | Used? | Where | Ch153 | FF155 | WK26.6 | If unsupported |
| --- | --- | --- | :-: | :-: | :-: | --- |
| **`@layer`** | **yes** | `globals.css:517-1063` | ✔ | ✔ | ✔ | **Catastrophic.** An engine that does not recognise `@layer` discards the whole at-rule block. Measured: **196 rules live inside `@layer`, of which 81 are this site's own component selectors** (`.col`, `.col--prose/wide/shell`, `.section`, `.section-heading*`, `.btn*`, `.link*`, `.site-header`, `.nav-*`, `.skip-link`, `.theme-toggle`, `.prose*`, `.meta-line`, `.visually-hidden`). The page renders as unstyled flow content with working colours and type but **no columns, no buttons, no header, no nav, and `.visually-hidden` text visible in the flow**. Floor: Safari **15.4**, Chrome 99, Firefox 97. |
| `svh` | yes | `globals.css:403` (`body{min-height:100svh}`) | ✔ | ✔ | ✔ | Declaration dropped; `body` loses its minimum height. Cosmetic on a 4800 px page. Floor: Safari 15.4, Chrome 108, Firefox 101. |
| `:where()` | yes | `globals.css:420,438,1159` (focus ring, scroll-margin) | ✔ | ✔ | ✔ | **The entire selector list is invalid**, so `:focus-visible` gets no outline and `scroll-margin-block-start` is not applied — the sticky header can then obscure a focus target. Floor: Safari 14, Chrome 88, Firefox 78. Well below the `@layer` floor, so `@layer` fails first. |
| `color(display-p3 …)` | yes | `globals.css:128-144` | ✔ | ✔ | ✔ | **Correctly guarded** by `@supports (color: color(display-p3 1 1 1))`. Unsupported engines keep the sRGB `#7C5E1D` / `#D1A954`, which are the basis of every contrast claim. **No degradation.** |
| `animation-timeline: view()` | **no** (dead — see N7) | `globals.css:493-501` | ✔ | **✘** | ✔ | Guarded by `@supports`. Moot: nothing emits `data-reveal="decorative"`. |
| `clip-path: inset(50%)` | yes | `globals.css:590` (`.visually-hidden`) | ✔ | ✔ | ✔ | SR-only text becomes visible. Inside `@layer`, so it dies with the layer anyway. |
| `aspect-ratio` | yes | `AttestationLive.tsx:44` (inline style) | ✔ | ✔ | ✔ | Figure frame collapses to 0 height; the poster is `position:absolute; inset:0` inside it. Floor: Safari 15, Chrome 88, Firefox 89. |
| `font-synthesis-weight` | yes | `globals.css:399-400` | ✔ | ✔ | ✔ | Faux-bold could return on a UA that synthesises. Benign here — the variable font ships real 400 and 500 (§D1). |
| `size-adjust` / `ascent-override` | yes | `next/font` fallback face | n/a¹ | n/a¹ | n/a¹ | The fallback face loses its metric match; same failure mode as N5. |
| **`:has()`** | **NOT used** | — | ✔ | ✔ | ✔ | n/a |
| **container queries** | **NOT used** | — | ✔ | ✔ | ✔ | n/a |
| **`dvh` / `lvh`** | **NOT used** | — | ✔ | ✔ | ✔ | n/a — `svh` only, deliberately |
| **`color-mix()`** | **NOT used** | — | ✔ | ✔ | ✔ | n/a |
| **`env(safe-area-inset-*)`** | **NOT used** | — | ✔ | ✔ | ✔ | n/a — see verification 4 |
| `oklch()` | NOT used | — | ✔ | ✔ | ✔ | n/a |
| regex lookbehind | yes | `color.ts:28` | ✔ | ✔ | ✔ | A **parse-time SyntaxError**, not a runtime one — the whole module fails to evaluate and the scene chunk never mounts. The poster stays (graceful). Floor: Safari 16.4 — exactly the `browserslist` floor. |
| `requestIdleCallback` | yes | `capability.ts:68-73` | ✔ | ✔ | **✘** | **Already handled**: WebKit 26.6 still has no `requestIdleCallback`, and `whenIdle` falls back to `setTimeout(min(2500, 200))`. Measured working — the scene mounts in WebKit in every test. |
| `navigator.deviceMemory` | yes | `capability.ts:34-35` | 16 | **null** | **null** | Gate silently absent outside Chromium — S1. |
| `navigator.connection` | yes | `capability.ts:26-29` | `{saveData:false, effectiveType:"4g"}` | **null** | **null** | Save-Data / 2g gate silently absent outside Chromium. Fails open, which is the safe direction. |

¹ Supported in all three engines in practice (the face resolves and applies); the
`CSS.supports("size-adjust", …)` probe returns false in every engine because
`size-adjust` is a descriptor, not a property, so the probe is not diagnostic.

**Bottom line on older engines.** There is exactly one cliff, and it is `@layer`.
Everything else degrades to cosmetic loss or is `@supports`-guarded. The cliff
sits at **Safari 15.4 / Chrome 99 / Firefox 97**, which is comfortably below the
declared `browserslist` floor (`safari >= 16.4`, `chrome >= 111`,
`firefox >= 111`), so this is a stated-support-boundary observation rather than a
defect. It is worth writing down because the consequence is not graceful
degradation — it is 81 component rules vanishing at once.

---

## PART D — DEEP PASSES (results in detail)

### D1. Variable font rendering — the axis genuinely applies; nothing is synthesised. All three engines. **PASS.**

The whole point of this cycle. Canvas text metrics for
`"Hamburgefonstiv 0123"` at 100 px, per weight, `"Space Grotesk"`:

| weight | chromium | firefox | webkit |
| ---: | ---: | ---: | ---: |
| 300 | 1082.400 | 1082.400 | 1082.400 |
| 400 | 1084.807 | 1084.867 | 1084.807 |
| **500** | **1087.795** | **1087.917** | **1087.795** |
| 600 | 1089.248 | 1089.100 | 1089.248 |
| 700 | 1090.700 | 1090.700 | 1090.700 |

Monotonic and continuous — 600 is a genuine interpolated instance, not a snap to
400 or 700 — and `actualBoundingBoxAscent` is constant at 71.4 (71.391 in WebKit)
across *every* weight, which is what a single variable outline set does and what
synthetic emboldening does not. Chromium and WebKit agree to 3 decimal places;
Firefox differs by ≤ 0.12 px in 1085 (0.011 %).

Synthesis is off and confirmed off: computed `font-synthesis-weight: none` and
`font-synthesis-style: none` on `body` in all three engines. The shipped face is
`font-weight: 300 700` (one variable file, three unicode-range subsets), and
`document.fonts.check()` returns true at 300/400/500/600/700 in all three.

`h1` (weight 500) renders 656.86 / 656.83 / 656.86 px at 1440 — a 0.03 px spread
across three engines. Cycle 1's "WebKit is ~1 % shorter" variance is **gone**:
document height is now **4833 px in all three engines** at 1440, exactly as cycle
1 predicted would happen once the same typeface rendered everywhere.

### D2. The `.col` measure columns at 7 widths × 3 engines. **PASS — byte-identical.**

`.col--prose` / `.col--wide` / `.col--shell` computed `max-inline-size`, and the
resulting content box, at 320 / 375 / 390 / 414 / 768 / 1024 / 1440 —
**identical in chromium, firefox and webkit at every single width**:

| viewport | gutter | prose max / content | wide max / content | shell max / content | `h1` left | figure |
| ---: | ---: | --- | --- | --- | ---: | --- |
| 320 | 24 | 720 / 272 | 816 / 272 | 1072 / 272 | 24 | 272 × 153 |
| 375 | 24 | 720 / 327 | 816 / 327 | 1072 / 327 | 24 | 327 × 184 |
| 390 | 24 | 720 / 342 | 816 / 342 | 1072 / 342 | 24 | 342 × 192 |
| 414 | 24 | 720 / 366 | 816 / 366 | 1072 / 366 | 24 | 366 × 206 |
| 768 | 32 | **736 / 672** | 832 / 704 | 1088 / 704 | 48 | 704 × 396 |
| 1024 | 48 | **768 / 672** | **864 / 768** | 1120 / 928 | 176 | **768 × 432** |
| 1440 | 48 | **768 / 672** | **864 / 768** | **1120 / 1024** | 384 | **768 × 432** |

Matches `docs/04 §1.5` exactly at every breakpoint: prose 672, wide 768, shell
1024 content, with the gutter added to the outer clamp. `.col` count = 7 on `/`
and 3 on `/writing` and the 404; **`.container` count = 0 on every route at
every width** — the Tailwind layer-inversion is structurally gone, not merely
overridden.

No horizontal overflow anywhere: `scrollWidth − clientWidth = 0` in
7 widths × 3 engines × 3 routes = 63 runs. The one element whose rect exceeds the
viewport at ≤ 1024 px is the `<span class="theme-toggle-dark">` label *inside*
`.visually-hidden` (`white-space: nowrap` inside a 1 px box) — clipped by
`clip-path: inset(50%)`, unpainted, and it does not scroll. **Not a defect.**

Document height at 375 px differs by 30 px in Firefox (5405 vs 5375) — 0.6 %,
line-box rounding, no layout consequence.

### D3. Print. **4 new defects: N1 (HIGH), N2, N3, N4 (MEDIUM).**

What *does* work, verified: `header` is hidden (`display: none`, all three
engines); `footer` prints; the skip link is at `opacity: 0`; all 7
`[data-reveal]` elements compute `opacity: 1` in all three engines (an earlier
0-vs-2 reading was my own 300 ms sample landing mid-transition — at 1500 ms it is
7/7 in every engine, so the print block's `!important` reveal reset **is** doing
its job); Space Grotesk renders in the PDF; the page paginates to 4 A4 sheets
with legible type and no clipped columns. See N1–N4 for what does not.

### D4. iOS Safari specifics, re-checked after the layout change. **PASS, with S2 unchanged.**

iPhone 14 Pro descriptor (393 × 660 CSS, DPR 3, `hasTouch`), all three engines:

- `100vh` = `100svh` = `100dvh` = `100lvh` = **660 px**, `body.min-height` =
  660 px. The harness has no dynamic toolbar so this cannot falsify anything;
  `100svh` is the only viewport unit in the file and `100vh` appears nowhere,
  which is the correct construction. **S2 carried forward.**
- Safe area: `viewport-fit` absent, `env(safe-area-inset-*)` absent from the
  compiled stylesheet. Consistent pair — verification 4.
- Sticky header at `scrollY = 1600`: `{position: sticky, top: 0, height: 65}` in
  chromium, firefox **and** webkit.
- Input zoom: **0 form controls on the site** (`input`/`select`/`textarea` count
  = 0). The sub-16px-input zoom trap cannot fire.
- Coarse pointer: `matchMedia("(pointer: coarse)")` true in all three;
  `.link-standalone` `min-block-size` resolves to **44 px** in all three.
- Momentum / overscroll: `overscroll-behavior: auto` on `body` — native
  rubber-band retained, and `overscroll-behavior: contain` is scoped to
  `[data-lenis-prevent]` only, which no element carries. No interception.
- Mobile nav disclosure: toggle present, `aria-expanded` flips to `"true"`,
  sheet renders **286 × 345 px with four 44 px targets and zero overflow —
  identical in all three engines**.
- DPR cap: `devicePixelRatio` 3, canvas backing store **514 × 288** against a
  343 × 192 CSS box = **exactly 1.5×** in all three engines. `DPR_MAX` holds.

### D5. Hydration and prefetch under `next@15.5.25`. **PASS — zero warnings, all three engines.**

Across every load in this review (7 probe passes × 3 engines, ~60 navigations):

- **0 page errors** in chromium, firefox and webkit.
- **0 messages matching** `hydrat|did not match|Minified React error #(418|421|422|423|425)` in any engine.
- The theme script's pre-hydration writes survive React hydration intact:
  `<html class="__variable_dd5b2f js lenis" data-theme="…">` in all three, i.e.
  the `next/font` variable class React rendered **and** the `js` class the
  blocking script added are both present after hydration. `suppressHydrationWarning`
  on `<html>` (`layout.tsx:120`) is doing its job and React is not reverting the
  className.
- Toggling the theme to `dark` and then re-rendering leaves `data-theme="dark"`,
  the class list intact and `font-family` still `"Space Grotesk"` in all three.
- **Caveat, stated rather than glossed:** a client-side *route* transition could
  not be exercised from `/`, because the homepage contains exactly **one**
  internal link — the wordmark, `href="/"` (`spa.internalLinks` = `["/"]` in all
  three engines). Nav items are all in-page hashes. `/writing` and the 404 were
  therefore tested by direct navigation: both return the right status (200 / 404),
  the right `<title>`, 3 `.col` / 0 `.container`, Space Grotesk, and zero
  overflow at 320 / 768 / 1440 in all three engines. There is no App-Router
  prefetch surface on `/` to regress.

### D6. P3 wide-gamut vs sRGB. **PASS.**

Chromium launched twice, `--force-color-profile=srgb` and `=display-p3`:

```
                     srgb profile                       display-p3 profile
--color-accent       color(display-p3 .47 .37 .1)       color(display-p3 .47 .37 .1)
.btn--primary bg     color(display-p3 0.47 0.37 0.1)    color(display-p3 0.47 0.37 0.1)
readout ✓ glyph      color(display-p3 0.47 0.37 0.1)    color(display-p3 0.47 0.37 0.1)
--color-foreground-secondary   #5c5c5c                  #5c5c5c
CTA mean pixel       rgb(131,100,11)                    rgb(131,100,11)
figure mean pixel    rgb(198,198,198)                   rgb(195,195,195)
```

The token resolves to the same P3 value and the same rendered pixels under both
profiles. All three engines report the identical `--color-accent` string
(`p2-results.json` → `tokens.accent`), so the `@supports` gate opens the same way
everywhere. The rendered CTA fill maps to sRGB (131,100,11) against the
documented sRGB token #7C5E1D = (124,94,29): contrast against white is 5.54:1 vs
6.05:1 — both clear 4.5:1, so the chroma extension does not cost the claim. The
figure is neutral grey in both profiles.

Honest limit: Playwright captures in sRGB, so this proves the **parsing and
cascade** path is profile-independent, not what a real P3 panel emits. Firefox
and WebKit have no equivalent profile switch; their token strings are identical
to Chromium's, which is the part that could have diverged.

### D7. Motion after Framer Motion removal — CSS + IntersectionObserver. **PASS, all three engines.**

- **Transition timing.** Declared `0.28s, 0.28s` / `cubic-bezier(0, 0, 0.2, 1)` /
  `opacity, transform` — identical string in all three. Observed settle to
  `opacity: 1`: **chromium 305 ms, firefox 316 ms, webkit 295 ms** (spec 280 ms
  + one frame of scheduling). Mid-flight samples are *identical* between Firefox
  and WebKit (0.711611, 0.952555) and within 0.07 of Chromium at the same phase.
  No engine divergence.
- **IntersectionObserver threshold 0 + `rootMargin "0px 0px -15% 0px"`.** Deep
  link to `/#contact` (browser scrolls to `scrollY 3925` before any observer
  runs): **7/7 reveals released, 5 via the backlog `instant` path, 0 stuck at
  opacity 0** — identical counts in chromium, firefox and webkit. The backlog
  rule (`reveal-observer.ts:61-67`, `entry.boundingClientRect.bottom <= 0` on the
  first callback) behaves the same in all three, which is the classic place they
  differ.
- **Scroll restoration.** Scroll to 3000, reload: position restored to 3000 and
  **0** in-viewport reveals stuck at `opacity: 0`, all three engines.
- **Approach observer** (`rootMargin: "200px"`, `AttestationLive.tsx:115`) and the
  render-loop observer (`scene.ts:156-161`) both fire in all three; the canvas
  mounts and cross-fades in every engine, every run.
- **Reduced motion.** `canvas` count **0**, `[data-reveal]` count **0**,
  `html.lenis` absent, poster at `opacity: 1`, **0** elements stuck hidden — all
  three engines, after scrolling the figure fully into view and waiting 3 s. M11
  and M12 both hold as byte guarantees.

### D8. Slow and flaky network. **PASS — nothing gets stuck, all three engines.**

| Scenario | chromium | firefox | webkit |
| --- | --- | --- | --- |
| **Every `.woff2` aborted** | h1 visible, 4559 chars of text, `Space Grotesk:error` + `Space Grotesk Fallback:loaded`, **0 page errors** | same | same |
| **Scene chunk stalled 25 s** | poster `opacity: 1`, no canvas, readout prints the committed attestation | same | same |
| **Scene chunk 404** | poster `opacity: 1`, no canvas, **0 page errors** (only the browser's own network 404 lines) | same, and Firefox logs nothing at all | same |
| **350 ms added to every request** (DCL 9.4 s) | h1 painted before the font arrives; poster present; after 9 s canvas `opacity: 1`, poster `opacity: 0`, **0 errors** | same | same |

The poster→canvas cross-fade either completes or never starts; there is no state
where both are transparent. `mount.ts:120` restores the poster's inline opacity
on `dispose()`, which is what makes the 404 and context-loss paths recover rather
than leave a hole. **This is the failure-handling done properly** — with the one
exception that print (N1) is a fifth path nobody wired into it.

### D9. Console. **Clean in all three engines.**

Across ~60 loads the only messages were the two known local-environment 404s
(`/_vercel/insights/script.js`, `/_vercel/speed-insights/script.js`, which exist
only on Vercel) and the Firefox `WebGL context was lost` **warning**, which is
`capability.ts:47-48` deliberately calling `WEBGL_lose_context.loseContext()` on
the probe context. **Zero uncaught exceptions, zero CSS parse errors, zero React
warnings, in chromium, firefox and webkit.** Unchanged from cycle 1.

---

## PART E — SUSPECTED

### S1. MEDIUM — The device-floor gate still has no teeth outside Chromium. (Carried from cycle 1, re-confirmed.)

`constants.ts:80-81`, consumed at `capability.ts:32-36`. Re-measured on the newer
engines: `navigator.deviceMemory` is **`null` in Firefox 155 and WebKit 26.6**,
`16` in Chromium 153; `navigator.connection` is **`null` in both non-Chromium
engines**. `capability.ts:35` correctly treats `undefined` as a pass, so on
Safari and Firefox neither the memory gate nor the Save-Data/2g gate exists at
all — the WebGL2 probe is the only gate with teeth. `hardwareConcurrency < 4` is
near-vacuous on Android where 8-core silicon is standard at every tier. Still
unfalsifiable in this harness (Playwright's CPU throttling does not alter
`hardwareConcurrency`). Cycle 1's suggested fix — a first-N-frames timing bail-out
using the timing `scene.ts` already has — remains the right one.

### S2. LOW — iOS URL-bar dynamic resize. (Carried, still unverifiable, still expected to pass.)

See D4. `100svh` is the only viewport unit; `100vh` appears nowhere. One pass on a
real handset.

### S3. MEDIUM — N1 in the Firefox and Safari print pipelines.

Both necessary conditions are measured true in Firefox 155 and WebKit 26.6
(poster pinned to inline `opacity: 0`; canvas readback empty), but Playwright's
`page.pdf()` is Chromium-only, so I cannot produce real print output for them.
The fix for N1 is engine-independent and costs nothing, so this does not need
resolving before fixing.

### S4. MEDIUM — Field CLS from N5 on a device without Arial.

The mechanism and the layout delta are measured (a full line-break change on the
lede); the resulting CLS on a real Android handset is not, because Arial cannot
be removed from this host. Measure once on real hardware after the N5 fix, and
do not carry the "CLS 0.000" claim to Android until then.

### S5. LOW — `-webkit-text-size-adjust` in WebKit.

WebKit 26.6 exposes neither `-webkit-text-size-adjust` nor `text-size-adjust`
through `getComputedStyle`, and `CSS.supports` returns false for both, which is
almost certainly a Playwright/WebKit introspection gap rather than the property
being unsupported — this is the engine the prefix exists for. N6 is filed against
Firefox only for that reason.

---

## PART F — EXPLICIT PASSES

Each of the following was executed in Chromium 153, Firefox 155 **and** WebKit
26.6, and each passed in all three.

1. **Variable-font axis applies; zero synthesis.** Continuous, monotonic width at
   300/400/500/600/700 with constant ascent/descent; `font-synthesis-weight: none`
   computed. D1.
2. **Identical typographic rendering across engines.** `h1` 656.86 / 656.83 /
   656.86 px; document height 4833 px in all three at 1440. Cycle 1's 1 %
   WebKit shortfall is gone.
3. **`.col` measure columns exact at 7 widths in 3 engines.** 768 / 864 / 1120
   outer, 672 / 768 / 1024 content, per `docs/04 §1.5`. D2.
4. **`.container` is structurally gone.** 0 elements on 3 routes × 7 widths ×
   3 engines.
5. **No horizontal overflow.** 63 runs, `scrollWidth − clientWidth = 0` in every
   one.
6. **Figure geometry exact.** 768 × 432 at ≥ 1024 px in all three engines.
7. **DPR cap honoured.** 514 × 288 backing store for a 343 × 192 box at DPR 3 =
   1.5× in all three.
8. **Mobile nav disclosure.** 286 × 345 sheet, four 44 px targets, no overflow,
   identical in all three.
9. **Sticky header.** `{sticky, top 0, height 65}` at `scrollY 1600` on an iPhone
   viewport in all three.
10. **No form controls anywhere** → the iOS input-zoom trap cannot fire.
11. **Reveal transition timing matches across engines.** 295–316 ms observed
    against a 280 ms spec; identical easing and identical mid-flight values.
12. **IntersectionObserver backlog rule identical across engines.** Deep link to
    `/#contact`: 7/7 released, 5 instant, 0 stuck, in all three.
13. **Scroll restoration leaves nothing hidden.** 0 stuck reveals after reload at
    `scrollY 3000`, all three.
14. **Reduced motion: zero 3D bytes, zero reveal attributes, no Lenis, nothing
    hidden.** All three.
15. **Font request is minimal and used.** Exactly one `.woff2`, HTTP 200, face
    `loaded` and painting, all three.
16. **Font failure is graceful.** All `.woff2` aborted → text renders, 0 page
    errors, all three.
17. **Scene chunk stall (25 s) and outright 404 both degrade to the poster** with
    0 page errors, all three.
18. **Hard network throttle (350 ms/request, DCL 9.4 s)**: text paints first,
    poster present, cross-fade still completes, 0 errors, all three.
19. **Zero hydration warnings and zero page errors under `next@15.5.25`**, ~60
    navigations × 3 engines. The pre-hydration theme script's `data-theme` and
    `js` class both survive hydration alongside the `next/font` variable class.
20. **P3 accent resolves identically in all three engines and under both forced
    colour profiles.** D6.
21. **Lattice colour is neutral in both themes in all three engines.** Light
    ≈ rgb(195,195,195), dark ≈ rgb(45,45,45), all channels equal.
22. **Print does not leave reveals hidden.** 7/7 at `opacity: 1` in all three
    (the print block's `!important` reset works).
23. **`header` is hidden in print** in all three; `footer` prints.
24. **`/writing` (200) and an unknown path (404)** render correctly with the right
    `<title>`, 3 `.col`, 0 `.container`, Space Grotesk and no overflow at
    320 / 768 / 1440 in all three.
25. **Console clean** — the only output is two local-only Vercel 404s and one
    deliberate Firefox WebGL-probe warning.
26. **`@supports` guards are correct** for both P3 and `animation-timeline`; the
    only feature that would fail hard (`@layer`) is supported by every engine in
    the declared `browserslist` range.

---

## Recommended order of work

1. **N1** (`globals.css §10`, four lines) — the figure is blank on every printed
   copy of this page. Cheapest high-value fix in the file.
2. **N5** (a second `@font-face` fallback) — the only finding with a real field
   metric attached, and the one that invalidates a claim currently in
   `docs/07 §1` for Android visitors.
3. **N2 / N3 / N4** — finish the print sheet in one pass while §10 is open.
4. **N7** — delete the dead `animation-timeline` block, or make it real. It is
   the only live three-way engine split in the codebase.
5. **N6, N9** — one-liners.
6. **N8** — no action; record it so the P3 parser's status is not mis-read.
7. **S1** — still the right open question from cycle 1: replace the core count
   with a frame-time bail-out.
