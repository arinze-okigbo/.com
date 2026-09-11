# 06 — Cross-Browser and Mobile Review

Adversarial review of the rebuild outside desktop Chrome.

**Method.** `npm run build` (exit 0) + `npm run start -- -p 3104`, driven by Playwright
`1.51.0` against three real engines:

| Engine | Build | Proxy for |
| --- | --- | --- |
| Chromium | 1243 | Chrome, Edge, Android Chrome |
| Firefox | 135.0 (pw v1475) | Firefox desktop + Android |
| WebKit | **18.4** (pw v2140) | Safari 18.4, iOS Safari |

Firefox and WebKit were not installed; `npx playwright install firefox webkit` was run
first. The `claude-in-chrome` MCP tools were deliberately not used.

Routes exercised: `/`, `/writing`, `/zzz` (404). Widths: 320, 375, 390, 414, 768, 1280.
Artifacts (113 screenshots + raw logs) are outside the repo at:

```
/private/tmp/claude-501/-Users-arinzeokigbo-arinzeokigbo/2fd2ae8f-82a7-43b7-b850-975a3ff341b1/scratchpad/xbrowser-rev/
  shots/            113 PNGs
  probe-results.json  overflow / style / touch sweep, 54 runs
  deep.log deep-webkit.log deep2.log perf.log
```

**Headline.** The 3D layer is the *cleanest* part of this build cross-engine — it works
identically in all three, including WebKit. The two worst defects are engine-independent
and were missed by everyone precisely because they look plausible in Chrome: the site's
typeface never loads, and the WebGL lattice draws in the wrong colour.

**Defect count**

| Severity | Confirmed | Suspected |
| --- | --- | --- |
| CRITICAL | 1 | 0 |
| HIGH | 2 | 0 |
| MEDIUM | 1 | 1 |
| LOW | 2 | 2 |

By engine: **all-three-engines 5**, **WebKit/iOS-only 1**, **Chromium-only 0**,
**Firefox-only 0**, untestable-in-harness 2.

---

## CONFIRMED DEFECTS

### 1. CRITICAL — Space Grotesk never applies to any text. All three engines.

**File.** `src/app/globals.css:179-181`, with `src/app/layout.tsx:101`.

```css
/* globals.css:179 — inside @theme inline, i.e. emitted on :root */
--font-sans:
  var(--font-space-grotesk), "Space Grotesk Fallback", -apple-system, BlinkMacSystemFont,
  "Segoe UI", system-ui, sans-serif;
```

```tsx
// layout.tsx:101 — the variable class is on <body>, not <html>
<body className={spaceGrotesk.variable}>
```

**Mechanism.** `next/font` emits `.__variable_dd5b2f { --font-space-grotesk: "Space Grotesk","Space Grotesk Fallback" }`
and that class is on `<body>`. `--font-sans` is declared on `:root` (`<html>`), where
`--font-space-grotesk` is **unset**. A bare `var()` with no fallback that references an
unset property makes the *whole* declaration the guaranteed-invalid value, so `--font-sans`
computes to the empty string on `:root` and `<body>` inherits that emptiness.
`body { font-family: var(--font-sans) }` is then invalid at computed-value time, and
`font-family` falls back to its inherited value — Tailwind Preflight's default stack on
`<html>`.

**Reproduction.** Load `/` in any engine → `getComputedStyle(document.documentElement).getPropertyValue("--font-sans")`.

**Evidence (measured, identical in all three engines):**

```
rootVarFontSans:          ""                          <- empty
bodyVarSpaceGrotesk:      "Space Grotesk","Space Grotesk Fallback"
bodyComputedFontFamily:   ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", …
h1ComputedFontFamily:     ui-sans-serif, system-ui, sans-serif, …
document.fonts:           Space Grotesk:unloaded  (x3)
                          Space Grotesk Fallback:unloaded
font resource 36966cca54120369-s.p.woff2: 22,620 bytes downloaded  <- and never used
```

Proof by counterfactual — setting the property on `:root` at runtime immediately fixes it:

```
chromium  BEFORE: ff="ui-sans-serif, system-ui, …"                 h1 width 572.05
          AFTER : ff="Space Grotesk", …  fonts: Space Grotesk:loaded   h1 width 591.91
webkit    BEFORE: ff="ui-sans-serif, system-ui, …"                 h1 width 574.73
          AFTER : ff="Space Grotesk", …  fonts: Space Grotesk:loaded   h1 width 591.91
```

`/private/.../xbrowser-rev/shots/{chromium,webkit}_fontfixed.png`

**Why this is cross-browser and not merely cosmetic.** With the declared family gone, the
typeface becomes whatever `ui-sans-serif`/`system-ui` resolves to *on the visitor's
platform*: SF Pro on macOS/iOS, Segoe UI Variable on Windows, Roboto on Android. Every
`--text-*` size, `letter-spacing` and `measure` token in docs/04 was tuned against Space
Grotesk metrics and is now applied to three different typefaces. The whole design system's
typographic layer is unenforced.

**Fix.** Move the variable class to the element that declares the token:

```tsx
// src/app/layout.tsx:97,101
<html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
  …
  <body>
```

Belt-and-braces, give the `var()` a fallback so a future move cannot silently
re-break it — `globals.css:180`:

```css
--font-sans:
  var(--font-space-grotesk, "Space Grotesk"), "Space Grotesk Fallback", -apple-system, …;
```

(Whichever is chosen, drop the now-duplicated `"Space Grotesk Fallback"` — after the fix
the computed stack contains it twice, because `--font-space-grotesk` already ends with it.)

---

### 2. HIGH — The live WebGL lattice renders salmon-pink, not the gold accent. All three engines.

**File.** `src/components/three/runtime/color.ts:16` and `:46-57`.

```ts
const FLOAT_PATTERN = /-?\d*\.?\d+(?:e[+-]?\d+)?/gi;   // :16
…
const matches = value.match(FLOAT_PATTERN);            // :47
const components = matches.slice(0, 3).map(Number);    // :49
```

**Mechanism.** `--color-accent` resolves to `color(display-p3 .47 .37 .1)` — verified
byte-identical in Chromium, Firefox and WebKit. `FLOAT_PATTERN` has no word boundary, so
it matches the literal **`3` in `display-p3`** as the first number. `slice(0, 3)` therefore
takes `["3", ".47", ".37"]`, and `clamp01` pins the red channel to `1.0`. The blue channel
is silently discarded.

**Reproduction.** Load `/`, scroll to the attestation figure, wait for the canvas cross-fade.

**Evidence.** Parser, isolated:

```
color(display-p3 .47 .37 .1)   matches=["3",".47",".37",".1"] -> rgb(255,120,94)   (light; should be #7C5E1D = 124,94,29)
color(display-p3 .81 .66 .3)   matches=["3",".81",".66",".3"] -> rgb(255,207,168)  (dark;  should be #D1A954 = 209,169,84)
color(srgb .47 .37 .1)         matches=[".47",".37",".1"]     -> rgb(120,94,26)    (would be correct)
```

Rendered frame, mean colour of drawn pixels (my measurement, `color.mjs`):

| Surface | chromium | firefox | webkit |
| --- | --- | --- | --- |
| live canvas | rgb(209,188,184) | rgb(210,189,185) | rgb(208,188,184) |
| SVG poster | rgb(177,164,127) | rgb(175,162,124) | rgb(175,162,124) |

The poster (`currentColor` → correct gold) and the canvas it cross-fades into are visibly
different hues. This is the exact poster/canvas divergence `AttestationPoster.tsx:28-30`
claims to have eliminated. Screenshots: `{chromium,firefox,webkit}_frame_live.png` vs
`{…}_frame_noWebGL.png`.

**Note on priority.** Identical in all three engines, so this is not an engine-specific
bug — but it is a rendering-fidelity failure of the one authored moment on the site, and it
is invisible unless you compare the two surfaces, which is why five agents shipped it.

**Fix.** Anchor the pattern so it cannot match a digit glued to a letter:

```ts
const FLOAT_PATTERN = /(?<![\w.])-?\d*\.?\d+(?:e[+-]?\d+)?/gi;
```

Lookbehind is supported in all three engines targeted here (Safari 16.4+). If a wider
floor is wanted, strip the colour-space keyword before matching instead:

```ts
const body = value.slice(value.indexOf("(") + 1).replace(/^\s*[a-z][\w-]*\s+/i, "");
```

Add a unit test covering `color(display-p3 …)`, `color(srgb …)` and `rgb()` — there is no
test for `parseCssColor` today.

---

### 3. HIGH — Footer links are 16 px tall; the "X" link is 8.6 × 16 CSS px. All three engines, worst on touch.

**File.** `src/components/layout/SiteFooter.tsx:29`.

```tsx
<InlineLink href={link.href}>{link.label}</InlineLink>
```

**Mechanism.** The design system already solves this: `.link-standalone`
(`globals.css:556-575`) sets `min-block-size: 24px`, rising to `44px` under
`@media (pointer: coarse)`. `SiteFooter` imports `InlineLink` directly and so gets none of
it, even though each link is alone in its own `<li>` — a standalone navigational
affordance by any reading, not a link inside a sentence, so the WCAG 2.5.8 inline
exception does not apply.

**Reproduction.** 390 × 664, `hasTouch: true`, `isMobile: true`; measure every
interactive element's bounding box.

**Evidence.** Measured at 390 px with a coarse pointer, identical across engines:

```
A.link "arinze@splita.co"            97.5 x 16
A.link "GitHub (opens in a new tab)"  41.6 x 16
A.link "LinkedIn (opens in a new tab)" 49.8 x 16
A.link "X (opens in a new tab)"        8.6 x 16   <- 8.6 px wide
```

The other three sub-24px targets in the sweep (`Splita`, `Queralt Inc.`, `Snorkel AI`,
all `display: inline`, 18 px tall) are genuinely inline in the hero sentence and are a
legitimate WCAG 2.5.8 pass. The four footer links are not.

**Fix.** Use the primitive that exists —

```tsx
import { StandaloneLink } from "@/components/ui/StandaloneLink";
…
<StandaloneLink href={link.href}>{link.label}</StandaloneLink>
```

This is also what `ContactBlock.tsx:33` already does, which is why the in-page contact
links measure 44 px and the footer's do not.

---

### 4. MEDIUM — No `safe-area-inset` handling anywhere, and no `viewport-fit=cover`. WebKit / iOS only.

**File.** `src/app/globals.css` (absent throughout — `grep -rn "safe-area\|env(" src/` returns
nothing), and `src/app/layout.tsx:88-90`:

```tsx
export const viewport: Viewport = {
  colorScheme: "light dark",
};
```

**Evidence.** Served meta is `width=device-width, initial-scale=1`. Runtime stylesheet
scan for any rule containing `safe-area-inset` → `usesSafeArea: false` in all three engines.
`.site-header` `padding-block-start: 0`; `.site-footer` `padding-block-end: 32px` flat.

**Assessment — and why this is MEDIUM, not HIGH.** Because `viewport-fit=cover` is absent,
iOS keeps the page inside the safe area automatically and every `env(safe-area-inset-*)`
resolves to `0`. So nothing is currently *clipped* by the notch or the home indicator. The
cost is the opposite: on a notched device in landscape the page is letterboxed inside the
safe area, so the sticky header's background stops short of the screen edge and there are
inert bars either side. It is a polish defect today and a latent CRITICAL the moment
anyone adds `viewport-fit: "cover"` without the paired `env()` padding.

**Fix.** Either accept the current letterboxing and add a comment saying so, or opt in
properly — both halves, never one:

```tsx
// src/app/layout.tsx
export const viewport: Viewport = {
  colorScheme: "light dark",
  viewportFit: "cover",
};
```

```css
/* globals.css — .site-header, near :688 */
padding-inline: env(safe-area-inset-left) env(safe-area-inset-right);
/* .site-footer, near :846 */
padding-block-end: calc(var(--space-8) + env(safe-area-inset-bottom));
```

---

### 5. LOW — `backdrop-filter: blur(8px)` on the sticky header is dead code, and unprefixed. All three engines.

**File.** `src/app/globals.css:684-689`.

```css
.site-header {
  background: var(--color-background);   /* fully opaque #fcfcfc / #0a0a0a */
  backdrop-filter: blur(8px);            /* nothing can show through to blur */
}
```

**Evidence.** Computed `background-color: rgb(252, 252, 252)` — alpha 1.0 — in all three
engines. A backdrop filter behind an opaque background paints nothing anywhere. Separately,
WebKit 18.4 reports `CSS.supports("backdrop-filter", "blur(8px)") === false` while still
applying the declaration as `-webkit-backdrop-filter: blur(8px)`; Safari below 18 supports
only the prefixed property and would drop it outright. Both facts are moot while the
background is opaque.

**Fix.** Delete line 688. If the frosted effect is actually wanted, give the header a
translucent background (e.g. `color-mix(in srgb, var(--color-background) 80%, transparent)`)
and add `-webkit-backdrop-filter` alongside for Safari < 18.

---

### 6. LOW — 22,620 bytes of font are preloaded and downloaded on every page load and never used. All three engines.

Direct consequence of Defect 1, but listed separately because it has its own measurement
and its own regression risk. `<link rel="preload" as="font">` is emitted in `<head>`, the
file is fetched (`36966cca54120369-s.p.woff2`, 22,620 B, 1–13 ms), and `document.fonts`
reports every face `unloaded` in all three engines. Fixing Defect 1 resolves this; the
byte cost is the thing to re-measure afterwards, because CLS is currently 0 *only* because
no swap ever happens (see Pass 10).

---

## SUSPECTED

### S1. MEDIUM — The device-floor gate does not filter a mid-tier Android.

**File.** `src/components/three/constants.ts:73`, consumed at
`src/components/three/runtime/capability.ts:32-36`.

```ts
export const MIN_CORES = 4;
export const MIN_MEMORY_GB = 4;
```

`hardwareConcurrency < 4` is close to a no-op on Android: 8-core big.LITTLE silicon is
standard at *every* tier, budget included, so a weak GPU on a Snapdragon 4-series reports
8 and sails through. `deviceMemory` is Chromium-only — it is `undefined` in both Firefox
and WebKit, and `capability.ts:35` correctly treats `undefined` as "pass", so on
Safari and Firefox the memory gate does not exist at all. The net effect is that the only
gate with teeth on non-Chromium mobile is the WebGL2 probe.

**Marked suspected** because I could not falsify it in this harness: Playwright's CPU
throttling does not alter `navigator.hardwareConcurrency`, which reported the host's
`8` cores and `8` GB at every throttling rate. The gate itself is untested by my run.

**Mitigating measurement.** Under 4× and 6× CPU throttling at 390 px the scene was
nonetheless jank-free (Pass 12), so even if the gate lets a mid-tier device through, the
scene appears to cope. Treat S1 as a correctness concern about the gate, not evidence of
observed jank.

**Suggested fix.** Raise `MIN_CORES` to 6 and pair it with a real signal — e.g. bail if the
first N frames average worse than ~22 ms, which `scene.ts` already has the timing to
measure.

### S2. LOW — iOS URL-bar dynamic resize is untested.

`min-height: 100svh` at `globals.css:360` is the only viewport unit on the site, and it is
the correct choice — `svh` is the stable small viewport and does not move when the URL bar
retracts. `100vh` appears nowhere. Playwright cannot reproduce the URL-bar animation, so
this is unverified rather than failed, but the code is written the way that makes the
classic bug impossible. Confirm once on a real handset; I expect a pass.

---

## EXPLICIT PASSES

Each of the following was tested in Chromium, Firefox **and** WebKit.

1. **No horizontal overflow, anywhere.** 3 routes × 6 widths (320/375/390/414/768/1280) ×
   3 engines = 54 runs. `documentElement.scrollWidth === clientWidth` in every one, zero
   offending elements. The body never scrolls horizontally. `probe-results.json`.

2. **Shaders compile and link clean in WebKit.** The shipped `LATTICE_VERTEX` /
   `LATTICE_FRAGMENT` source was extracted from
   `src/components/three/lattice/shaders.ts` with its template constants interpolated,
   prefixed exactly as OGL prefixes it, and compiled directly:

   ```
   chromium  vertOk:true fragOk:true linkOk:true  logs all ""
   firefox   vertOk:true fragOk:true linkOk:true  logs all ""
   webkit    vertOk:true fragOk:true linkOk:true  logs all ""
   ```

   No precision-qualifier or implicit-cast complaint from WebKit's stricter compiler. The
   vertex shader carries no explicit precision, which is correct — GLSL ES 1.00 defaults
   vertex `float` to `highp`, and OGL prefixes one regardless. `MAX_VARYING_VECTORS` is 30
   on WebKit vs 31/32 elsewhere; the shader uses 2, so the tightest engine has 15× headroom.

3. **WebGL2 initialises on all three.** `webgl2: true` everywhere;
   `ANGLE (Apple, Apple M3, OpenGL 4.1)` / `Apple M1, or similar` / `Apple GPU`. Instanced
   drawing available in all three.

4. **The 3D actually paints, identically, in all three.** Canvas mounts, buffer 830 × 466,
   `opacity: 1`, poster cross-faded to `0`, zero console errors or page errors. Ink coverage
   of the rendered frame: chromium 5.04 %, firefox 5.00 %, **webkit 4.96 %**. Visually
   indistinguishable between engines. `{engine}_frame_live.png`. (The *colour* is wrong in
   all three — Defect 2 — but the render path is sound.)

5. **WebCrypto ECDSA P-256 works in WebKit.** Keygen + sign + verify, all three engines:

   ```
   chromium {hasSubtle:true, secureContext:true, genMs:0, sigBytes:64, verified:true}
   firefox  {hasSubtle:true, secureContext:true, genMs:1, sigBytes:64, verified:true}
   webkit   {hasSubtle:true, secureContext:true, genMs:0, sigBytes:64, verified:true}
   ```

   The historic Safari quirks are gone in 18.4. The readout printed live values in every
   engine (`ES256 · sig 0373…3a69 · ✓ verified 0ms` in WebKit).

6. **Poster fallback with WebGL unavailable — correct in all three.** `getContext("webgl"|"webgl2")`
   stubbed to `null` before any script runs:

   ```
   {posterPresent:true, posterOpacity:"1", posterCircles:248, canvasPresent:false, pageerrors:[]}
   ```

   Identical in all three. The static inline SVG renders, the readout still prints the
   committed build attestation, and nothing throws. `{engine}_frame_noWebGL.png`.

7. **No flash of wrong theme in any engine — stress-tested.** Every `_next/static/chunks/**`
   request was delayed 1.5 s to widen any FOUC window, then `data-theme`, body background
   and `color-scheme` were sampled 10× from `readyState: "commit"` onward. Every sample in
   every engine, both schemes, was already correct — a single distinct value each:

   ```
   chromium sys=dark  ["interactive:dark/rgb(10, 10, 10)/dark"]
   firefox  sys=dark  ["interactive:dark/rgb(10, 10, 10)/dark"]
   webkit   sys=dark  ["interactive:dark/rgb(10, 10, 10)/dark"]
   (light equivalents: "light/rgb(252, 252, 252)/light")
   ```

   The blocking script in `ThemeScript.tsx:18` does its job in all three.

8. **Theme precedence and persistence — works identically in all three engines.**

   | Case | chromium | firefox | webkit |
   | --- | --- | --- | --- |
   | system light | `light` / #fcfcfc | same | same |
   | system dark | `dark` / #0a0a0a, `aria-pressed=true` | same | same |
   | stored `dark`, system light | `dark` | same | same |
   | stored `light`, system dark | `light` | same | same |
   | toggle → reload | `dark`, `localStorage.theme="dark"` | same | same |

9. **JavaScript disabled — correct in all three.** `prefers-color-scheme` resolves the
   theme in pure CSS (`bg: rgb(252,252,252)` light / `rgb(10,10,10)` dark, `fg` correct),
   the theme toggle and the nav disclosure are both `display: none` so no dead control is
   shown, and **0 of 7** `[data-reveal]` elements are stuck at `opacity: 0`. No horizontal
   overflow. Full page content renders. `{engine}_nojs_{light,dark}.png`.

10. **Font loading has zero layout shift — for the wrong reason.** CLS is exactly `0` with
    an empty shift list in all three engines. That is not evidence the metric-matched
    fallback works; it is evidence no swap ever occurs (Defect 1). `adjustFontFallback`
    must be **re-measured after Defect 1 is fixed** — the `"Space Grotesk Fallback"`
    `@font-face` with its `size-adjust` is present in the compiled CSS and unexercised.

11. **`html { scroll-behavior: smooth }` is genuinely removed — verified, not assumed.**
    `globals.css:321` carries the removal comment, and computed
    `getComputedStyle(document.documentElement).scrollBehavior === "auto"` in all three
    engines. The only `scroll-behavior` declarations remaining are Lenis's own
    `.lenis.lenis-smooth { scroll-behavior: auto !important }` (`:336`) and the
    reduced-motion safety net (`:986`). The late hand-off landed correctly.

12. **Lenis behaves identically in all three and does not fight native scroll.**
    Wheel-driven easing ramp after a single `wheel(0, 600)`, sampled every 60 ms:

    ```
    chromium [197,330,419,466,510,539,559,570,579,586,591,593,595,597]
    firefox  [155,302,400,466,510,539,555,570,579,586,591,593,595,597]
    webkit   [196,300,398,466,510,539,559,570,579,586,590,593,595,596]
    ```

    Same curve, same settling point. `window.scrollBy({top:800})` lands at exactly 800 in
    Chromium and WebKit under touch emulation. `End` reaches
    `scrollY === scrollHeight - innerHeight` exactly in all three. Anchor clicks land on
    target. No double-scroll, no fight, no drift.

13. **Reduced motion — correct in all three.** With `reducedMotion: "reduce"`:
    `html.lenis` absent (the instance is never constructed, per `SmoothScrollProvider.tsx:32`),
    **no WebGL canvas and no OGL chunk fetched at all** (`oglChunkLoaded: false`) even after
    scrolling the figure into view and waiting 3 s, reveals render in their final state, and
    `scroll-behavior: auto`. Each engine exposes the media query differently in testing;
    all three responded. `{engine}_reducedmotion.png`.

14. **Mid-tier Android proxy — jank-free.** 390 × 664, DPR 3, CDP CPU throttling, measured
    over 4 s of `requestAnimationFrame` with the scene live on screen:

    | Rate | p50 | p95 | p99 | max | frames > 33 ms | long tasks |
    | --- | --- | --- | --- | --- | --- | --- |
    | 1× | 16.7 | 16.7 | 16.8 | 16.8 | 0 / 241 | none |
    | 4× | 16.7 | 16.8 | 16.8 | 16.8 | 0 / 241 | 57 ms |
    | 6× | 16.7 | 16.7 | 16.8 | 16.8 | 0 / 241 | 58, 78 ms |

    Locked 60 fps at 6× throttle. The one-off 78 ms long task is scene construction
    (WebCrypto keygen + lattice build), not steady-state rendering. `DPR_MAX = 1.5`
    (`constants.ts:22`) and the `resolveGrid` core-count branch are doing their job. **The
    scene should not be gated off on weak hardware** on this evidence — see S1 for the
    caveat about what throttling does and does not emulate.

15. **No hover-only affordances.** Every `:hover` rule in the compiled stylesheet was
    enumerated and filtered for ones that mutate `opacity`, `visibility`, `display`,
    `content` or `transform` to reveal information. **0 found** in all three engines. All
    hover states are colour/underline reinforcement of something already visible, and every
    one is paired with `:focus-visible` (e.g. `globals.css:547-548`). Nothing is lost on
    touch.

16. **No 300 ms tap delay and no input zoom.** `width=device-width` in the viewport meta
    disables the legacy double-tap delay on iOS. `-webkit-text-size-adjust: 100%`
    (`globals.css:324`) prevents iOS text inflation. **There are no form controls on the
    site at all** — `grep -rn "<form\|<input\|<textarea\|<select" src/` returns nothing, by
    design per `ContactBlock.tsx:14` [R26]; contact is a `mailto:` `Button` plus four real
    `<a>` elements. The sub-16px-input zoom trap therefore cannot fire, and *"contact form
    usable with a virtual keyboard"* is not applicable. The smallest font size anywhere on
    the page is 13 px, and none of it is in an editable control.

17. **`position: sticky` header works in all three.** At `scrollY = 1500`, 390 px:
    `{top: 0, height: 65}` in Chromium, Firefox and WebKit. The header never detaches and
    never overlaps a focus target — `scroll-margin-block-start: calc(var(--header-height) + var(--space-4))`
    at `globals.css:375-378` covers WCAG 2.4.11.

18. **Mobile nav disclosure works in all three.** At 390 px the `.nav-toggle` is present and
    `aria-expanded="false"`; clicking it flips to `"true"` and the sheet animates in at
    252 px tall with all five targets reachable. Closed state uses
    `visibility: hidden` + `opacity: 0` (`globals.css:838-847`), so collapsed items are not
    focusable. Identical behaviour and geometry in all three.
    `{engine}_m390_navopen.png`.

19. **Structural rendering is identical across engines.** Bounding boxes for `h1`, `#work`,
    `#projects`, `#about`, `#contact`, `figure`, `.site-header`, `.site-footer` and `main`
    at 320 px and 1280 px on all three routes: **x-offset and width match exactly in all
    three engines in every case.** The heading text chain is identical. Nothing is missing,
    reordered or misplaced.

20. **Accepted variance, no action: WebKit pages are ~1 % shorter.** Page height at 1280 px:
    chromium 4746, firefox 4746, **webkit 4702** (−0.9 %); at 320 px: 6014 / 5989 / 5923
    (−1.5 %). Cause is sub-pixel `line-height` rounding — WebKit reports `40.950001px`
    where Chromium reports `40.95px` — accumulated over ~60 text blocks. `h1` measures
    575 px wide in WebKit vs 572 px elsewhere: 0.5 % on a 572 px box. This is engine text
    metrics, not a layout defect, and it will change once Defect 1 is fixed and all three
    engines render the same typeface. No fix needed.

21. **Console is clean.** Across 54 page loads the only messages were local-environment
    noise: `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` 404 (those
    endpoints exist only on Vercel), and a Firefox `WebGL context was lost` *warning* which
    is `capability.ts:47-48` deliberately calling `WEBGL_lose_context.loseContext()` to
    release the probe context. Zero page errors, zero uncaught exceptions, zero CSS parse
    errors, in all three engines.

---

## Recommended order of work

1. **Defect 1** (`layout.tsx:97/101`) — one line; everything typographic in docs/04 depends on it.
2. **Defect 2** (`color.ts:16`) — one regex; add the missing `parseCssColor` test.
3. **Defect 3** (`SiteFooter.tsx:29`) — swap `InlineLink` for `StandaloneLink`.
4. **Defect 4 / 5** — decide on `viewport-fit`, delete the dead `backdrop-filter`.
5. Re-measure CLS and font-swap behaviour per engine once 1 lands (Pass 10 is void until then).
6. Revisit **S1** with a frame-time bail-out rather than a core count.
