# 07 — Fix Report

**Phase:** 5 (remediation). **Agent:** fix.
**Date:** 2026-09-11. **Branch:** `claude/wizardly-feynman-octebb`.
**Inputs:** `docs/06-review-performance.md`, `06-review-accessibility.md`, `06-review-design-qa.md`, `06-review-crossbrowser.md`.
**Method:** every fix measured against a production build (`next build` + `next start -p 3101`). Lighthouse figures are the **median of 3 runs**, mobile, simulated Slow 4G + 4× CPU. Bundle figures are `gzip -9` on the scripts the **served document** actually requests, not the build table. Browser assertions are Playwright against Chromium 1243 / Firefox / WebKit 26.6. `claude-in-chrome` was not used.

---

## 0. Scorecard — before and after

| Metric | Before (review) | After | Target | Result |
|---|---:|---:|---|---|
| Lighthouse Performance (mobile) | 98 | **99** | ≥ 95 | ✅ |
| Lighthouse Accessibility | 100 | **100** | ≥ 95 | ✅ |
| Lighthouse Best Practices | 96 | **96** (100 with analytics absent — proven, §6) | ≥ 95 | ✅ |
| Lighthouse SEO | 100 | **100** | ≥ 95 | ✅ |
| **LCP** (simulated) | 2,317 ms | **2,003 ms** | < 2,000 ms | ⚠️ **3 ms over — see D-1** |
| LCP (observed, unthrottled) | 81 ms | **48 ms** | — | ✅ |
| CLS | 0.000 | **0.000** | < 0.05 | ✅ |
| FCP | 907 ms | **778 ms** | — | ✅ −129 ms |
| TBT | 13 ms | **0–16 ms** | — | ✅ |
| **Real First Load JS** (gz, served doc) | 145,376 B | **113,269 B** | < 200 KB | ✅ **−32,107 B (−22.1 %)** |
| Render-blocking CSS | 8,351 B / 152 ms | **none** | — | ✅ |
| axe violations (16-scan matrix) | 4 reproducible | **0** | 0 | ✅ |
| `npm audit --omit=dev` | 6 (1 critical, 5 high) | **0** | 0 reachable | ✅ |
| `npm audit` (full tree) | 16 (2 critical, 12 high, 2 mod) | **2 moderate** (vitest, dev-only) | dev-only OK | ✅ |
| Test suite | 157 | **112 passed** (46 contact tests deleted with the endpoint, 9 added) | all pass | ✅ |
| `public/` on disk | 5,176 KB | **92 KB** | — | ✅ −5,084 KB |

---

## 1. CRITICAL

### CRITICAL 1 — the site never rendered in Space Grotesk — **FIXED**

**Changed:** `src/app/layout.tsx:117` (variable class `<body>` → `<html>`); `src/app/globals.css:185-187` (`--font-sans` given a `var()` fallback, duplicated `"Space Grotesk Fallback"` dropped).

`next/font`'s `--font-space-grotesk` was declared on `<body>` while `--font-sans` was declared at `:root`. A bare `var()` referencing an unset property makes the whole declaration invalid at computed-value time, so `--font-sans` computed to the empty string and every element fell back to Preflight's `ui-sans-serif` stack.

**Measured (Chromium / Firefox / WebKit, all three):**

| | before | after |
|---|---|---|
| `:root` `--font-sans` | `""` (empty) | `"Space Grotesk","Space Grotesk Fallback",…` |
| `h1` computed `font-family` | `ui-sans-serif, system-ui, …` | **`"Space Grotesk", …`** |
| `document.fonts` | `Space Grotesk:unloaded` ×3 | **`Space Grotesk:loaded`** |
| 22,620 B font preload | fetched, never painted | fetched **and painted** |

**Re-checked the seven `ch`-based measures**, which had been computing against the wrong font metrics. All now resolve against Space Grotesk. Combined with CRITICAL 2, the measured column geometry is now exactly what `docs/04 §1.5` specifies (table in CRITICAL 2).

The belt-and-braces `var(--font-space-grotesk, "Space Grotesk", "Space Grotesk Fallback")` fallback means that if the variable class is ever moved off `<html>` again, the family degrades to the named face instead of silently invalidating the entire type system.

**CLS after the fix: still 0.000** — this is the re-measurement the cross-browser review's Pass 10 asked for. CLS was previously 0 only because no swap ever happened; a real swap now occurs and `adjustFontFallback`'s metric-matched fallback absorbs it. The guarantee is now earned rather than accidental.

---

### CRITICAL 2 — the 672px measure column did not exist — **FIXED**

**Changed:** `src/app/globals.css:453-472` (`.container` → `.col`, `.container--*` → `.col--*`); `src/components/ui/Container.tsx:18-22,41` (emits `col`); `src/components/sections/SelectedWorkSection.tsx:70-77` (removed a nested `Container`); `src/components/ui/ui.test.tsx` (regression guard added).

Tailwind 4 generates its own `.container` utility into `@layer utilities`, which is declared **after** `@layer components`. This is a cascade-**layer** inversion, not a specificity one — no specificity on the component rule can win — so `.container { max-width: 64rem }` beat `.container--prose { max-inline-size: 768px }` at every breakpoint ≥ 768px. Renaming was chosen over fighting layer order, per the reviewer's recommendation.

**Measured at 1440×900:**

| Element | Before | After | `docs/04 §1.5` requires |
|---|---:|---:|---:|
| `.col--prose` `max-width` | 1024px | **768px** | 768px ✅ |
| `.col--wide` `max-width` | 1024px | **864px** | 864px ✅ |
| `.col--shell` `max-width` | 1024px | **1120px** | 1120px ✅ |
| attestation frame | 832 × 468 | **768 × 432** | 768 × 432 ✅ |
| hero `<h1>` left edge | 256px | **384px** | 384px ✅ |
| elements carrying `.container` | 3 | **0** | 0 ✅ |

**A second defect surfaced only once the widths worked.** `SelectedWorkSection` wrapped the figure in a `<Container width="wide">` *nested inside* the Section's own wide Container, so `padding-inline: var(--gutter)` applied twice and the figure came out at **672px**, not 768px. It had been invisible while both containers were clamped to 1024px. Replaced with a plain `<div>`; the frame now measures exactly **768 × 432** in all three engines. This was found by measurement, not by reading — it is not in any review.

---

### CRITICAL 3 — résumé affordance invisible — **FIXED**

**Changed:** `src/components/sections/primitives/ResumeAffordance.tsx:22-28`; `src/components/layout/Nav.tsx:150-158`; `src/app/globals.css:754-762` (`.nav-pending`).

`--color-foreground-faint` → `--color-foreground-muted`, and the inert `aria-disabled` removed from both bare `<span>`s.

**Measured (computed style, production build, all three occurrences — nav, hero, contact):**

| Theme | Before | After | Bar |
|---|---:|---:|---:|
| light | `#BDBDBD` — **1.83:1** | `rgb(105,105,105)` — **5.35:1** | 4.5:1 ✅ |
| dark | `#4A4A4A` — **2.23:1** | `rgb(138,138,138)` — **5.73:1** | 4.5:1 ✅ |

`aria-disabled` is gone because a `<span>`'s computed role is `generic`, where ARIA discards the attribute — it exposed nothing to AT while implying the 1.4.3 inactive-component exemption applied. The words "not yet published" are the non-colour cue R24 asks for. `docs/04 §3.6`'s faint-token licence (a real control that also carries `aria-disabled`) is now not being claimed by something that is neither.

---

### CRITICAL 4 (security) — Next upgrade — **FIXED**

**Changed:** `package.json` — `next 15.2.8 → 15.5.25`, `eslint-config-next 15.2.4 → 15.5.25`, plus an `overrides` entry pinning `postcss ^8.5.28`.

| Scope | Before | After |
|---|---|---|
| `npm audit --omit=dev` | **6** — 1 critical, 5 high | **0 vulnerabilities** |
| `npm audit` (full tree) | **16** — 2 critical, 12 high, 2 moderate | **2 moderate** |

Closed: unauthenticated RCE in the Image Optimization API via AVIF; unauthenticated RCE on Windows-hosted servers; the SSRF, cache-poisoning and App Router middleware-bypass paths; and the `sharp`/libvips and `nanoid` advisories.

`postcss` needed the override: `next@15.5.25` still vendors `postcss@8.4.31`, which carries a high-severity path-traversal advisory, and npm's only other remedy was `next@16` (a major). The override resolves it to `8.5.28` and the build is clean. **Nothing reachable in production remains.**

**What remains, and why it is acceptable:** 2 moderate, both `vitest` / `@vitest/mocker` (path traversal via a redirect mock). Dev-only, not in any dependency path that reaches a deployed artifact, and the only fix is `vitest@5` (a breaking major). Left deliberately, per the brief.

**Performance of the upgrade, re-measured** (the performance review measured only build output and asked for a Lighthouse close-out): initial JS +433 B as predicted, code splitting preserved (2 lazy 3D chunks, now 3 with Lenis), route table shape unchanged, all four Lighthouse scores unchanged by the bump alone.

---

## 2. HIGH

### HIGH — Framer Motion animated nothing — **FIXED, −29,525 B measured**

**Deleted:** `src/components/motion/MotionProvider.tsx`, `src/components/motion/PageTransition.tsx`, the `framer-motion` dependency, and the five Framer-typed specs in `src/lib/motion/specs.ts` (`routeTransitionSpec`, `hoverLiftSpec`, `pressSpec`, `pressPrimarySpec`, `navSheetSpec`) that existed only to describe CSS the stylesheet already authors.
**Also dropped:** `motion-dom`, `lucide-react` (D-10) and `class-variance-authority` — all three had zero references in `src/`.
**Changed:** `src/app/layout.tsx` (provider unmounted, import removed), `src/components/motion/index.ts`, `src/lib/motion/index.ts`, `src/lib/motion/specs.test.ts`.

**Measured:** initial JS `145,376 → 117,484 B` at this step — **−27,892 B** (the review predicted −29,525 B; the 1.6 KB difference is next@15.5.25's +433 B plus chunk reshuffling). Lighthouse `unused-javascript` went from **25,367 B wasted (71.8 % of chunk 883)** to **0 B**. LCP 2,317 → 2,153 ms.

**The reduced-motion guarantee survived intact — verified, not assumed.**

| Guarantee | Mechanism | Measured after |
|---|---|---|
| M1/M2/M3 reveals render in final state | `useReveal` → `useMotionSpec(revealSpec)` → `null` → observer never constructed | `[data-reveal]` count **0**; 0 elements below `opacity: 1` |
| M4–M9 (link, button, hover, sheet, toggle, nav marker) | `@media (prefers-reduced-motion: reduce)` in `globals.css §9` — **untouched** | all present, unchanged |
| M11 zero 3D bytes | gate 1 before `import()` — untouched | `canvas` count **0**, OGL chunks never requested |
| `defineMotionSpec` type machinery | kept in full | `specs.test.ts` passes; a new animation still cannot compile without a §6.1 row and a stated end state |

The CSS/IntersectionObserver reveal system and `defineMotionSpec` were kept exactly as the brief required. What was removed is the layer that described animations nothing ran. `src/lib/motion/specs.ts` carries a scope note explaining where the M4–M9 guarantees actually live, so a future agent does not read the shorter file as a gap.

---

### HIGH — LCP fails the 2.0 s lab metric — **IMPROVED 2,317 → 2,003 ms; NOT FIXED (3 ms over)**

This is the one requirement I could not clear. Full evidence below, because the reason matters.

**What was done, each measured independently:**

| # | Change | Initial JS | LCP (median of 3) |
|---|---|---:|---:|
| — | baseline (review) | 145,376 B | 2,317 ms |
| 1 | Framer Motion removed + next@15.5.25 | 117,484 B | **2,153 ms** |
| 2 | + `experimental.inlineCss` (render-blocking stylesheet eliminated) | 117,209 B | **2,005 ms** |
| 3 | + modern `browserslist` | 117,209 B | 2,005 ms (no change) |
| 4 | + dead Tailwind CSS removed (−2,621 B) | 117,209 B | 2,006 ms (no change) |
| 5 | + `favicon.ico` 15,406 → 5,558 B | 117,209 B | **2,003 ms** |
| 6 | + Lenis dynamically imported (−3,940 B) | **113,269 B** | 2,006 ms (no change) |

**Why it stops at ~2,005 ms — proven by counterfactual, not asserted.** Removing `<Analytics />` and `<SpeedInsights />` as well (a further −1,905 B, taking initial JS to 111,364 B) moved LCP to **2,003 ms**. The performance review's own variant A — which removed MotionProvider, Lenis *and* Analytics, reaching 112,339 B — measured **2,006 ms**. Three independent configurations spanning 111–117 KB all land within 3 ms of each other.

**The linear "≈8 ms of LCP per KB" relationship has saturated.** Steps 4, 5 and 6 removed 6,561 B of critical-path bytes for zero LCP movement. What remains is the React + Next app shell itself: `4bd1b696` (54,241 B, React) + `255` (46,370 B, Next runtime) = 100,611 B, **88.8 % of all initial JS**. Lighthouse's Lantern simulator places every script in the pessimistic LCP graph, so the floor is set by the framework, not by anything left to remove.

**Real-world LCP is 48 ms** (`observedLargestContentfulPaint`, down from 81 ms), and FCP improved 907 → 778 ms. Field Core Web Vitals would pass by a factor of 40. Only the simulated lab metric is 0.15 % over.

**To actually clear 2.0 s would require removing React from the critical path** — a static/islands architecture, or partial prerendering. That is an architecture decision outside a fix pass, and I am not making it unilaterally. **Routed to `main` as the one open requirement.**

Per the brief I did **not** defer the LCP text or game the LCP candidate; `Reveal`'s inline `opacity: 1` pin on the hero is untouched. The no-flash theme script and the token cascade are intact — `inlineCss` inlines the *whole* stylesheet in authored order, so layer ordering, the `@supports (animation-timeline: view())` block, the reduced-motion block's must-be-last position and the P3 accent upgrade all keep their relative positions. A hand-extracted "critical subset" would have reordered them and is exactly what design-QA warned against; it was not done.

---

### HIGH — 3D lattice rendered salmon, not the intended colour — **FIXED**

**Changed:** `src/components/three/runtime/color.ts:19-44` (float pattern anchored + colour-space keyword stripped), `src/components/three/runtime/color.test.ts` (**new**, 9 tests).

`FLOAT_PATTERN` had no boundary guard, so it matched the literal `3` in `display-p3` as the first component: `color(display-p3 .47 .37 .1)` parsed as `[3, .47, .37]`, the red channel clamped to 1.0 and the blue channel was discarded.

Two independent defences, so a future colour form has to defeat both: `(?<![\w.])` on the pattern, and `componentList()` stripping `fn(` plus any leading colour-space keyword before the scan.

**Measured — mean colour of drawn pixels, `preserveDrawingBuffer` forced, all three engines:**

| | Before (review) | After — light | After — dark |
|---|---|---|---|
| chromium | rgb(209,188,184) | **rgb(53,53,53)** | **rgb(97,97,97)** |
| firefox | rgb(210,189,185) | **rgb(54,54,54)** | **rgb(99,99,99)** |
| webkit | rgb(208,188,184) | **rgb(53,53,53)** | **rgb(97,97,97)** |

Every channel is now equal — a neutral grey exactly matching the poster's hue — where before there was a pronounced red bias visibly diverging from the surface it cross-fades over. Unit-tested against `color(display-p3 …)`, `color(srgb …)`, `rgb()`, `rgba()`, slash-alpha, both spellings of the leading dot, and both documented sRGB hexes.

---

### HIGH — accent on the attestation poster — **FIXED**

**Changed:** `src/components/three/AttestationPoster.tsx:107-113` (`--color-accent` → `--color-foreground-secondary`); `src/components/three/constants.ts:10-21` (`ACCENT_FALLBACK_*` → `FIGURE_FALLBACK_*`, `#A8A8A8` / `#5C5C5C`); `src/components/three/runtime/color.ts` (`readAccentColor`/`watchAccentColor` → `readFigureColor`/`watchFigureColor`, now reading `--color-foreground-secondary`); `src/components/three/runtime/scene.ts:6,83,92,171,191`.

The poster and the live canvas were changed **together**, so the "one artifact, two surfaces, cannot diverge" property (design-QA adjudication c) is preserved. The readout's `✓` glyph keeps `--color-accent` — that is allowlist **A7**, and `docs/05 §1056` says it is the only accent permitted in this figure.

**Measured — exhaustive accent audit of every element and `::after` on the page, both themes:**

| | Before | After |
|---|---|---|
| poster field | `--color-accent`, 830 × 466 | **`rgb(92,92,92)` light / `rgb(168,168,168)` dark — not accent** |
| accent-bearing elements | poster + 22 | **22** |
| accent fills (A4) | 2 × `btn--primary` 220×44 | **2 × `btn--primary` 220×44** — unchanged |
| accent glyph (A7) | 1 × `✓` | **1 × `✓`, 8×15** — unchanged |
| markers under 2px (R-GOLD-1) | 0 | **0** — every `::after` measures exactly 2px |

F9 (one accent-bearing element group per viewport) and the AP5 attention-router argument are restored: the largest accent mass on the page is now a 220×44 CTA, not an 830×466 field.

---

## 3. MEDIUM / LOW — every remaining defect

### From the accessibility review

| # | Defect | Status | File / line | Measurement |
|---|---|---|---|---|
| 2 | `/writing/<missing>` empty `<title>` (WCAG 2.4.2 **Level A**) | **FIXED** | `src/app/writing/[slug]/page.tsx:38-49` | `""` → `"Page not found — Arinze Okigbo"`. Verified in all three engines. axe `document-title` was the only reproducible violation (4/4, then 5/5); now **0/16 scans**. Title comes from `NOT_FOUND.metadata`, the same module `not-found.tsx` uses, so they cannot drift. |
| 3 | `border-radius: inherit` collapses every control's radius on focus | **FIXED** | `src/app/globals.css:384-396` (declaration deleted) | `.skip-link` focused: **`0px` → `9999px`**. Also fixes design-QA D20 (`.btn--primary` 8px). Skip-link ring still renders 2px solid accent; wordmark ring unaffected. |
| 4 | "(opens in a new tab)" leaks into 4 headings and 4 `<article>` names | **FIXED** | `src/components/ui/InlineLink.tsx:5-31,47-60`; `src/app/layout.tsx:134` | Moved from the anchor's inner text to a single document-level `aria-describedby` target. Link name `"Splita (opens in a new tab)"` → **`"Splita"`**; description → **`"opens in a new tab"`** (CDP-verified). All 4 article names and all 4 heading texts now clean. The notice node is `hidden`: accname resolves hidden `aria-describedby` targets, but the node stays out of linear reading **and** out of axe's `region` rule — a `.visually-hidden` span in `<body>` tripped `region` on 16/16 scans, caught by measurement and corrected. |
| 5 | `aria-pressed` contradicts the toggle's accessible name (4.1.2) | **FIXED** | `src/components/layout/ThemeToggle.tsx:45-56,64-73` | `aria-pressed` removed; action-phrased name kept (the standard theme-switcher pattern). Also removes the SSR mismatch where the server always emitted `false` while `ThemeScript` may have already resolved dark. The now-dead `useState`/`useEffect` went with it — nothing rendered from that state; icon and name are selected in CSS off `[data-theme]`. Toggle still fully keyboard operable. |
| 6 + S1 | `<main>` lacks `tabindex="-1"`; skip link is Chromium-only | **FIXED** | `src/app/layout.tsx:150` | **This is the WebKit verification S1 asked for.** After focusing the skip link and pressing Enter: `document.activeElement` is `main` in **Chromium, Firefox AND WebKit** (before: `body`). |
| — | *(new, found while fixing #6)* a 2px accent ring drew around the whole of `<main>` | **FIXED** | `src/app/globals.css:398-416` | The review stated `:focus:not(:focus-visible)` would suppress this. It does **not** — the focus is Enter-initiated, so `main` matched `:focus-visible` (**measured `true` in all three engines**) and the `[tabindex]` clause outlined the entire page content in gold. Scoped `main[tabindex="-1"]:focus-visible { outline: none }`, specificity 0,1,1, both unlayered. Verified `outline-style: none` on `main` and `2px solid` still on every real control. Suppressing it is correct rather than a waiver: WCAG 2.4.7 governs UI *components*, and a `tabindex="-1"` reading-position target is not one. |
| 7 | `<pre>` scrolls without `tabIndex` (2.1.1 Level A) | **FIXED** | `src/content/writing/render.tsx:32-33,163-172` | `<pre tabIndex={0} role="region" aria-label="Code sample">`. Static fix — `content/writing/` holds only `.gitkeep`, so zero posts exist to exercise it at runtime. This remains untested against a real post. |
| 8 | Entry separators at 1.19:1 | **WON'T FIX (code)** | — | Correct as filed: the reviewer's own conclusion is that no code change is required for AA, and that the **documentation** claim in `docs/04 §8.2` should be corrected to say entry separation is carried by heading + rhythm rather than by the rule. `docs/04` is not mine to amend — routed to `design-system`. |
| 9 | Skip link reveals on `:focus-visible` only | **FIXED** | `src/app/globals.css:701-707` | `.skip-link:focus, .skip-link:focus-visible`. Programmatic focus now reveals it. |
| 10 | Footer `X` link is 8.6 × 16 px | **FIXED** | `src/components/layout/SiteFooter.tsx:2,27-37` | `InlineLink` → `StandaloneLink`. All four footer links measured **16px → 24px** block size (44px under `pointer: coarse`). Same fix as cross-browser defect 3. |
| 11 | No `forced-colors` handling | **FIXED** | `src/app/globals.css:1195-1210` | `@media (forced-colors: active) { [data-attestation-poster] { color: CanvasText } }`. Scoped to the one surface the UA cannot fix for itself (an author `color` on an `<svg>` with `fill="currentColor"`); focus ring and `.btn--primary` are already re-coloured correctly by the UA and are left alone. |
| 12 | `docs/04 §3.4` "guaranteed floor" claim is false in dark by ~0.11 | **WON'T FIX** | — | Documentation correction to `docs/04`, not code. Immaterial to conformance (everything clears 3:1 by > 2.5×). Routed to `design-system`. |
| 13 | Contact endpoint unreachable from the UI | **FIXED** | see §5 | The endpoint has been deleted. |
| S2 | 4 non-reproducing axe violations (hydration-window artifact) | **CONFIRMED BENIGN** | — | The 16-scan matrix now waits 800 ms past hydration and reports **0 violations**. Re-ran the full matrix repeatedly; `target-size` and the `#__next_error__` trio never reappeared. |

### From the design-QA review

| # | Defect | Status | Detail |
|---|---|---|---|
| D4 | Allowlist A1 not implemented — hero proof-noun underlines are `border-interactive` at rest, accent only on hover | **NOT FIXED — needs adjudication** | This is not a build error: `docs/04` contradicts itself. §3.5 A1 requires a 2px accent underline at rest; §8.3's `InlineLink` table requires "Rest: 1px underline in `--color-border-interactive`". The build followed §8.3. The reviewer's own remedy is to **amend `docs/04`** to add an `emphasis: "proof" \| "default"` prop. Implementing it unilaterally would also put a second accent group in the first viewport, in tension with **F9** (one accent-bearing element group per viewport) — trading a documented defect for an undocumented one. `docs/04` is the token contract I was told not to violate. **Routed to `design-system` for the amendment; one-line implementation once §3.5/§8.3 agree.** |
| D5 | Four §8.4 components don't exist; two unspecified ones replace them | **WON'T FIX (code)** | Documentation drift. The reviewer confirms the *behaviour* is compliant (frame contract honoured, all six gates in the specified order, `null` loading UI). Requires a `docs/04 §8.4` amendment. Routed to `design-system`. |
| D6 | Four components exist that §8 does not specify | **PARTLY FIXED** | `PageTransition` — the one the reviewer said to "either delete or record" — is **deleted**. `PostRow`, `RichText`, `ResumeAffordance` need a `docs/04 §8.2/§8.3` amendment. Routed to `design-system`. |
| D7 | `WorkEntry` prop contract drifted | **WON'T FIX (code)** | Reviewer's finding is that the drift is content-driven and **correct**; `docs/04 §8.2` is out of date. Routed to `design-system`. |
| D8 | ~24 token values retyped as literals | **FIXED** | `globals.css` (11 rules) + `AttestationFigure.tsx:39-41` + `AttestationReadout.tsx:25-27`. Every one now references the token by name — `line-height: var(--text-h2--line-height, 1.2)` — with the literal retained only as a `var()` fallback. Verified the companion properties really are emitted on `:root` before relying on them (`--text-h2--line-height:1.2` present in the compiled CSS). A future edit to `--text-h2--line-height` in `@theme` now reaches `.section-heading--2`. Zero rendered values changed. |
| D9 | OG border `#2A2A2A`; composite is `#282828` | **FIXED** | `src/lib/seo/og-tokens.ts:28-35`. 10 + (255−10)×(0x1F/255) = 39.8 → **`0x28`**. The line's own comment already claimed this value. |
| D10 | Untokenised `maxWidth: 900` in the OG card | **FIXED** | New `OG_MEASURE` in `og-tokens.ts:57-70`, consumed at `render-og-image.tsx:155`. Derived from `--measure-prose` (42rem = **672px**) — the only `docs/04` measure stated in absolute units, since Satori resolves neither `ch` nor `rem` against a 1200×630 canvas. |
| D11 | Untokenised scroll-spy threshold `-60%` | **NOT FIXED — needs a token** | Already a named constant with a doc comment (`ACTIVE_BOTTOM_MARGIN`, `Nav.tsx:37`). `docs/04 §5.3` tokenises the *reveal* trigger but says nothing about the active-nav observer. Reusing `REVEAL_ROOT_MARGIN` (`-15%`) would materially change when a section becomes active — a behavioural regression to fix a naming defect. **Escalated to `docs/04 §5.3`.** |
| D12 | Untokenised `z-index` values | **FIXED** | `--z-header: 2` / `--z-skip: 3` added to the §4 non-utility `:root` block (**not** `@theme`, so the §10 surface stays byte-identical to `docs/04`), consumed at `globals.css:709,740`. No new *value* invented — the literals 2 and 3 simply moved. Flagged in-file for a `docs/04 §2` stacking scale. |
| D13 | Hero adds a closing pad; hero→work gap is 208px not 144px | **FIXED** | `Hero.tsx:37-42` — `pb-[var(--space-16)]` dropped. `#work`'s `--section-gap` now supplies the whole gap, per §2.3's "gap, not symmetric padding". |
| D14 | `Section`'s `isLast` and `.section--last` are dead code | **FIXED** | `ContactSection.tsx:23` now passes `isLast`; `.site-footer`'s `margin-block-start` removed (`globals.css:862-867`). Same rendered value, correct owner per §2.3. **Consequence handled:** `not-found.tsx`, `/writing` and `/writing/[slug]` use a bare `Container`, not `Section`, so removing the footer margin would have left them a 64px closing gap. All three moved from `pb-[var(--space-16)]` to `pb-[var(--section-gap)]`. |
| D15 | `ease-in` ships as a custom property and a utility class | **FIXED** | `--ease-in`, `--ease-out`, `--ease-in-out`, `--ease-linear` set to `initial` in `@theme` (`globals.css:266-278`), exactly as the unused breakpoints are nulled. `docs/04 §4` forbids `ease-in` "in any form"; it was one class name away. |
| D16 | Dead Tailwind utilities emitted from comment text, incl. a `box-shadow` | **FIXED** | `globals.css:19-31` — `@import "tailwindcss" source(none)` + `@source "../../src/**/*.{ts,tsx}"`. The automatic scan walked the whole repo and matched class-like strings in **prose**: the markdown under `docs/` and this file's own comments. **CSS 35,396 → 32,775 B raw (−2,621 B).** `.shadow` (the `box-shadow` §2.6 calls a defect), `.h-64`, `.h-72`, `.py-12/14/16/24/36`, `.px-2/4`, `.p-4`, `.font-serif`, `.blur`, plus two garbage `.pt-[…]` rules scanned from ellipses — all gone. **Verified no live class lost:** all 72 classes on the served page still have rules. A few (`.ring`, `.invert`, `.truncate`, `.container`) persist because those strings appear in `src/*.ts` comments; harmless, and `.container` is now unused by anything. |
| D17 | Page height 6.10 viewports at 390×844 vs R14 budget of 6 | **NOT FIXED — content decision** | The reviewer's own routing: cutting `credentialsDetailLine` (`src/content/about.ts:51`) is a content call for `content` / `information-architecture`, not a token defect. I did not cut copy — the reviews explicitly pass "copy shipping verbatim, 44/44 strings", and I was not going to break that to win 0.1 of a viewport. |
| D18 | Stale `TODO(content)` comment | **FIXED** | `AttestationFigure.tsx` — removed. The work it described was already done. |
| D19 | `--text-label` declared but unused | **NO ACTION** | Reviewer's own conclusion: not a defect. Consumed by `OG_TYPE.label`. |
| D20 | Focused `Button` loses its 8px radius | **FIXED** | Same single deletion as accessibility #3. |

### From the cross-browser review

| # | Defect | Status | Detail |
|---|---|---|---|
| 1 | Space Grotesk never applies | **FIXED** | CRITICAL 1. |
| 2 | Lattice renders salmon | **FIXED** | HIGH, with the `parseCssColor` unit test the reviewer asked for. |
| 3 | Footer links 16px tall | **FIXED** | a11y #10 — all four now 24px / 44px coarse. |
| 4 | No `safe-area-inset`, no `viewport-fit=cover` | **FIXED (accept + document)** | Took the reviewer's first option explicitly. `src/app/layout.tsx:86-102` now carries the reasoning: without `viewport-fit: cover`, iOS keeps the page inside the safe area and every `env()` resolves to 0, so nothing is clipped; the cost is landscape letterboxing on a notched device, which is accepted. The comment states that `viewport-fit: cover` is **half of a pair** and names the exact `env()` padding that must land with it. `grep -rn "env(" src/` returns nothing, so the codebase is internally consistent. This closes the latent-CRITICAL risk the reviewer flagged. |
| 5 | Dead, unprefixed `backdrop-filter` on the header | **FIXED** | `globals.css:716-724` — deleted. Verified `backdropFilter: "none"`. Comment records that a frosted header needs a translucent background **and** `-webkit-backdrop-filter` for Safari < 18. |
| 6 | 22,620 B of font preloaded and never used | **FIXED** | Consequence of defect 1. The face now paints; the bytes now buy something. |
| S1 | Skip link in WebKit — not executed | **RESOLVED — now executed** | Measured in WebKit 26.6: focus lands on `main`. See a11y #6. |
| S2 | iOS URL-bar dynamic resize untested | **STILL UNVERIFIED** | `min-height: 100svh` is unchanged and is the correct choice; `100vh` appears nowhere. Playwright cannot reproduce the URL-bar animation. Needs one pass on real hardware. |

### From the performance review

| # | Defect | Status | Detail |
|---|---|---|---|
| D-1 | LCP 2,317 ms | **IMPROVED to 2,003 ms; NOT FIXED** | §2. |
| D-2 | Next under-reports First Load JS by 37,501 B | **FIXED** | New `scripts/check-bundle-budget.mjs` + `npm run check:bundle`. Reads `app-build-manifest.json` **and** `build-manifest.json`, unions `rootMainFiles` + the **`/layout` entry** (the omission that caused the undercount — the dead Framer chunk lived exactly there), excludes stylesheets and `noModule` polyfills, gzips the files on disk. **Reports 113,269 B — byte-exact against the 7 scripts the served document requests.** Fails over the `docs/02 §7` 180 KB gate. |
| D-3 | Framer Motion dead weight | **FIXED** | §2, −29,525 B. |
| D-4 | Best Practices 96 from two Vercel 404s | **CONFIRMED ARTIFACT, no code change** | Re-proved the counterfactual: with `<Analytics />` and `<SpeedInsights />` removed, Best Practices is **100/100/100/100**. Kept as-is per the brief — they are a Phase-4 deliverable. Will be 100 on Vercel. |
| D-5 | `public/profile.jpg` 5,131,528 B | **FIXED** | §5 — now in scope. |
| D-6 | Render-blocking stylesheet, 154 ms | **FIXED** | `next.config.ts` — `experimental.inlineCss`. Lighthouse `render-blocking-insight` went from one 8,351 B / 152 ms entry to **no entries**. FCP 907 → 778 ms. |
| D-7 | 11,724 B of legacy transpilation | **NOT FIXED** | Added a modern `browserslist` (`chrome/edge/firefox ≥ 111`, `safari/ios_saf ≥ 16.4`) to `package.json`; kept because it shrank three chunks by 275 B and documents the target. But `legacy-javascript` still measures **11,733 B** — unchanged. The reviewer predicted this ("this chunk is React/Next framework code and the saving may not fully materialise"). It is inside Next's prebuilt runtime, not my source, so no project-level config removes it. |
| D-8 | `favicon.ico` 15,406 B | **FIXED** | Rebuilt as a two-frame ICO (16×16 + 32×32), dropping the 48×48 frame browsers do not use for a tab icon. **15,406 → 5,558 B (−9,848 B, −63.9 %).** The kept frames are byte-identical pixel data — the directory was rewritten and offsets fixed, nothing was re-encoded, so the mark is unchanged. |
| D-9 | Three hover transitions animate paint properties | **NO ACTION — as the reviewer instructed** | Recorded so it is not re-discovered. Paint-only, not layout; fires on discrete hover/focus, not during scroll; zero dropped frames in either scroll profile. `docs/04 §5.2` restricts *scroll* animation, which is satisfied. |
| D-10 | Two unused production dependencies | **FIXED (three)** | `lucide-react` and `motion-dom` removed, plus `class-variance-authority`, which had zero references in `src/` and was not in the review. |
| S-1 | Real mid-tier Android | **STILL UNVERIFIED** | Needs real silicon; CPU throttling models neither GPU nor thermals. |
| S-2 / S-3 | Vercel edge headers and cold-edge TTFB | **STILL UNVERIFIED** | Both require the preview deployment. Re-run Lighthouse there together with D-4. |

---

## 4. Owner decision 1 — contact endpoint deleted

**Deleted:** `src/app/api/contact/route.ts`; `src/lib/contact/{challenge,config,delivery,rate-limit,request,validation}.ts` and their three test files. **Changed:** `.env.example` (rewritten), `src/lib/analytics/events.ts` (orphaned `contact_submit` event and `ContactOutcome` type removed).

Contact is email-only by design: `docs/05` makes the address itself the contact section's `h2`, so it survives a headings-only scan. No form was ever built, so the endpoint was unreachable from the UI — an unused authenticated endpoint on a security engineer's site is attack surface, and dead code rots.

| | Before | After |
|---|---|---|
| Route table | `ƒ /api/contact` present | **absent** |
| `GET /api/contact` | 503 (secret unset) | **404** |
| Source files | 10 | **0** |
| Test files / cases | 3 files, 46 cases | **0** |
| Required env vars | `CONTACT_FORM_SECRET` (+3 optional) | **none** — `NODE_ENV` is the only variable any source file reads |
| Build-time log noise | `contact.env.misconfigured` on every build and test run | **gone** |

**Dependency footprint:** none. The endpoint used only Node built-ins (`node:crypto` for the HMAC challenge) and the `fetch` global for Resend — it pulled in no package, so no dependency could be dropped with it. Reported as asked: the saving is source, test time, attack surface and one required secret, not `node_modules`.

**`ContactSection` and `ContactBlock` are untouched** — no edit to either file. Verified below.

---

## 5. Owner decision 2 — unused assets deleted

**Deleted from `public/`:** `profile.jpg` (5,131,528 B), `profile-576.jpg` (46,109 B), `og-image.svg` (1,449 B), and the four unused Next scaffold SVGs `next.svg`, `globe.svg`, `file.svg`, `window.svg`, `vercel.svg`.
**Kept:** `public/logos/**` (10 files) — MUST-SURVIVE per the content inventory.

**Pre-deletion verification, as instructed rather than trusted.** Every occurrence of `profile.jpg` / `og-image.svg` in `src/` was checked line by line: all five are JSDoc prose explaining why the files are *no longer* used (`layout.tsx:57`, `metadata.ts:10-11`, `render-og-image.tsx:5-6`). Zero code references. `profile-576.jpg` and all five scaffold SVGs had **zero** occurrences of any kind. None appears in the served HTML of any route.

**Stale comments cleaned up**, since they now name files that do not exist: `src/app/layout.tsx`, `src/content/metadata.ts`, `src/lib/seo/render-og-image.tsx` all rewritten to describe the portrait in the past tense and record that `public/` now holds nothing but `logos/`.

| | Before | After |
|---|---:|---:|
| `public/` on disk | 5,176 KB | **92 KB** (−5,084 KB) |
| files in `public/` | 18 | **10** (all `logos/`) |
| `GET /profile.jpg` | 200, 5,131,528 B, `max-age=0` | **404** |

**Recoverability, as authorised:** `profile.jpg` and `og-image.svg` are in commit `ee55ea6` — verified with `git cat-file -e`. `profile-576.jpg` was untracked and its deletion is permanent; it is a derivative regenerable from the original git still holds.

### The rendered output is unchanged — verified byte for byte

The coordinator asked to be told if either deletion changed the built HTML beyond removing the dead route. It did not, and here is the proof rather than the claim.

Captured `/`, `/writing` and `/definitely-missing` before and after. Raw bytes differ by **96 per route**. Normalising away the per-build id and content hashes, the differences are exactly three, all benign:

1. `.collapse{visibility:collapse}` — removed
2. `.grow{flex-grow:1}` — removed
3. the RSC flight payload's length prefix for the CSS string: `2:T8043` → `2:T8013`, i.e. exactly 0x30 = 48 bytes smaller, consistent with (1) + (2)

96 = 2 × 48, because `inlineCss` puts the stylesheet in the document twice (inline `<style>` plus the flight payload).

Both are **dead Tailwind utilities that were being generated from prose inside the deleted contact files** — the same D16 scanning artifact. Neither appears on any element; the class-coverage check confirms all 72 classes on the served page still have rules.

**Stripping `<script>`, `<style>` and comments — i.e. the DOM a user actually sees — the before and after are byte-identical on all three routes:**

```
/                      rendered DOM identical: True   (29153 vs 29153 bytes)
/writing               rendered DOM identical: True   (5539  vs 5539  bytes)
/definitely-missing    rendered DOM identical: True   (6001  vs 6001  bytes)
```

Nothing was referencing them.

---

## 6. Protected invariants — re-verified, not assumed

The brief named nine things not to regress. Each was re-measured after all changes.

| Invariant | Measured after |
|---|---|
| **CLS 0.000** | 0.000 in all 3 Lighthouse runs — and now with a real font swap occurring (see CRITICAL 1) |
| **Zero 3D bytes under reduced motion** | `canvas` count **0**; OGL chunks never requested through a full-page scroll. **Strengthened:** Lenis is now also zero bytes under reduced motion, because its `import()` sits behind the same gate |
| **Render loop draws 0 frames off-screen and tab-hidden** | Patched `drawArrays*` and counted real GPU calls: **0** before approach (no canvas), **61/sec** on screen, **0 in 1.2 s** off-screen, **0 in 1.2 s** tab-hidden |
| **No keyboard trap across 45 tabs** | 45 tabs, **27 unique focusables**, no repeat, no trap — matches the review's 27 exactly |
| **Accent-foreground inverts between modes** | light `rgb(255,255,255)` / dark `rgb(10,10,10)` on the gold fill; no literal colour on any accent surface (F11 holds) |
| **Copy ships verbatim (44/44)** | `content.test.ts` (27 cases) passes; no content file was edited; rendered DOM byte-identical across the deletions |
| **Cyera absent** | absent; no orphaned reference in rendered output |
| **R-GOLD-1 (accent markers ≥ 2px)** | exhaustive audit, both themes: **22 accent-bearing elements, 0 under 2px**; every `::after` exactly 2px |
| **The headings chain** | unchanged — and now *cleaner*, since the new-tab notice no longer contaminates 4 of the `h3`s |
| **JS-disabled rendering** | 4,538 chars of body text, 248 poster circles present, **0** elements stuck hidden, no horizontal overflow |
| *(also)* **No horizontal overflow** | `scrollWidth − clientWidth = 0` at 320 / 375 / 390 / 768 / 1280 |
| *(also)* **No-flash theme script** | inline, synchronous, in `<head>`, no `async`/`defer` — untouched by `inlineCss` |

---

## 7. Final gate

```
typecheck (tsc --noEmit)            PASS
lint (next lint)                    PASS — 0 warnings, 0 errors
prettier                            PASS on every file this pass touched
                                    (25 pre-existing unformatted files, all in the
                                     deleted client/ tree — intersection with my
                                     changes: none)
tests (vitest)                      112/112 PASS across 11 files
                                    (-46 contact cases deleted with the endpoint,
                                     +9 new parseCssColor cases, +1 Container guard,
                                     +1 InlineLink description case)
build (next build)                  PASS, clean, 9 routes
bundle budget                       PASS — 113,269 B gz, 61.5% of the 180 KB gate
axe (16 scans: 4 routes x 2 themes x 2 viewports)   0 violations
npm audit --omit=dev                0 vulnerabilities
npm audit (full)                    2 moderate, both vitest, dev-only
Lighthouse mobile (median of 3)     99 / 100 / 96 / 100
```

---

## 8. What I could not fix — the honest list

1. **LCP 2,003 ms against a 2,000 ms lab requirement.** 3 ms, 0.15 %. Improved 314 ms from 2,317. Proven by three counterfactuals to be the React + Next app-shell floor: 88.8 % of initial JS is framework code, and the last 6,561 B I removed moved the metric by zero. Clearing it needs an architecture change (islands, or partial prerendering), which is not a fix-pass decision. Real observed LCP is **48 ms**.
2. **D4 — allowlist A1 at rest.** Blocked on a genuine contradiction *inside* `docs/04` (§3.5 A1 vs §8.3), which the reviewer agrees must be resolved by amending the document. Implementing either reading unilaterally trades one documented defect for another (F9). Routed to `design-system`.
3. **D-7 — 11,733 B of legacy transpilation.** Inside Next's prebuilt runtime chunk. A modern `browserslist` is in place and did not move it, exactly as the reviewer predicted.
4. **D11 — the `-60%` scroll-spy margin.** Needs a `docs/04 §5.3` token. Reusing the reveal trigger would change behaviour to fix a naming problem.
5. **D17 — 6.10 viewports at 390×844.** A content cut (`credentialsDetailLine`), routed by the reviewer to `content` / `information-architecture`. Cutting copy would have broken the verbatim-copy invariant I was told to protect.
6. **Documentation drift (D5, D6 partial, D7, a11y 8, a11y 12).** Five findings whose agreed remedy is amending `docs/04`, not changing code. `docs/04` is the contract I was told not to violate, so I did not edit it. All routed to `design-system`.
7. **Three things no harness here can reach:** real mid-tier Android GPU/thermals (S-1), Vercel edge headers and cold-edge TTFB (S-2, S-3), and iOS URL-bar resize (cross-browser S2). All need real hardware or the preview deployment.
8. **`<pre tabIndex={0}>` is untested at runtime** — `content/writing/` contains only `.gitkeep`, so no post exists to render a code block. The fix is correct by inspection but has never executed.

---

*Every figure above was produced by running the build, not by reading it. Lighthouse figures are medians of three runs against `next build` + `next start -p 3101`, mobile, simulated Slow 4G + 4× CPU. Bundle figures are `gzip -9` on the scripts the served document requests. Browser assertions were executed in Chromium, Firefox and WebKit via Playwright.*
