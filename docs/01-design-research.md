# 01 — Design Research

**Scope:** 13 reference sites in the Apple-minimalist / award-winning-portfolio space.
**Target:** arinzeokigbo.com rebuild. Audience: technical recruiters and engineering hiring managers, <90s on page.
**Date of capture:** 2026-09-11.

## Method and source honesty

Three source classes are used throughout, and every data point is tagged:

| Tag | Meaning | Confidence |
|---|---|---|
| **[CSS]** | Pulled from the site's own stylesheets, fetched live via `curl` and grepped. Verbatim values. | High — these are the real shipped numbers. |
| **[HTML]** | Counted from the site's server-rendered HTML (hero/first-section DOM). | Medium — static markup only; client-rendered content is invisible. |
| **[PUB]** | Published case study, design-engineering writeup, or documented convention. | Medium — secondhand. |

**Known gaps, stated up front:**
- Linear's marketing hero is client-rendered. Its *app* design tokens came back in full **[CSS]**; its *marketing* display type did not. Marketing type for Linear is **[PUB]** or absent.
- **Scroll choreography numbers are the weakest part of this dataset.** Trigger positions, parallax ratios, and stagger delays live in JS, not CSS. Where I have a CSS `transition-delay` or keyframe distance I report it **[CSS]**; where I do not, I say so rather than inventing a number. Several parallax ratios below are explicitly marked as *not measured*.
- `family.co` failed to return stylesheets (bot-blocked) and was dropped. `brianlovin.com` returned CSS but a near-empty server-rendered hero, so it contributes color/measure data only.
- Distinct-hex counts include colors inside icons, illustrations, and dead rules. They are a **relative** signal (rauno 9 vs. vercel 299), not an exact palette size.

---

## Part 1 — Per-site findings

### 1. Apple — MacBook Pro product page

The single best-documented type system in the set. Apple ships a named typography class per size with hand-tuned letter-spacing at each step.

**Type scale [CSS]** — exact values from `.typography-*` classes:

| Class | Size | Line-height | Weight | Letter-spacing | Family |
|---|---|---|---|---|---|
| `headline-super` | 80px | 1.05 | 600 | −0.015em | SF Pro **Display** |
| `headline-super` (md) | 64px | 1.0625 | 600 | −0.009em | Display |
| `headline-super` (sm) | 48px | 1.0835 | 600 | −0.003em | Display |
| `headline-elevated` | 64 / 48 / 40px | 1.0625 / 1.0835 / 1.1 | 600 | −0.009 / −0.003 / 0em | Display |
| `headline` | 48 / 40 / 32px | 1.0835 / 1.1 / 1.125 | 600 | −0.003 / 0 / +0.004em | Display |
| `eyebrow` | 24 / 21px | 1.1667 / 1.1905 | 600 | +0.009 / +0.011em | Display |
| `body` | **17px** | **1.4706** | 400 | **−0.022em** | SF Pro **Text** |
| `body-reduced` | 14px | 1.4286 | 400 | −0.016em | Text |
| `caption-footnote` | 12px | 1.3334 | 400 | −0.01em | Text |

The mechanic that matters: **letter-spacing crosses zero at ~32px.** Below it, tracking is negative (−0.022em at 17px); above it, negative again but for a different reason (−0.015em at 80px); in the 21–32px band it goes *positive* (+0.004 to +0.011em). Apple is manually reproducing optical sizing, because SF Pro Text and SF Pro Display are two different cuts and the web only gets one. **[CSS]**, corroborated **[PUB]**.

Ratio: not a strict modular scale. Step-to-step ratios run **1.143 → 1.25**, tight in the mid-range (32→40 is 1.25, but 24→28 is 1.167 and 56→64 is 1.143). Display-to-body contrast: **80 / 17 = 4.7×**.

**Spacing [CSS]** — `--global-section-padding` resolves at four breakpoints:
`112px / 120px / 144px / 180px`. A second token `--global-section-aap-padding` runs `100 / 120 / 160 / 196 / 206 / 216px`.
`--global-section-padding-top-reduced`: `56px / 80px / 120px`.
Nav height `--r-globalnav-height`: **44px** (48px at one breakpoint).

Base unit: **4px**, with optical exceptions. Of 425 pixel `padding` declarations, **270 (64%) are multiples of 4** and 161 (38%) are multiples of 8. **[CSS]** — so the 4px grid is real but Apple breaks it freely (values like 5px, 34px, 54px appear).

**Breakpoints [CSS]**, by frequency: **734px (524 rules), 1068px (326), 833/834px (157+21), 1441px (34), 480px (37)**. Apple's real layout boundaries are 734 and 1068.

**Easing [CSS]** — dominated by two curves:
- `cubic-bezier(0.4, 0, 0.6, 1)` — **312 uses** (234 longhand + 78 minified). Apple's house ease-in-out. Symmetric, gentle, no overshoot.
- `cubic-bezier(0, 0, 0.2, 1)` — **95 uses**. Decelerate-only; used for entrances.
- `cubic-bezier(0.42, 0, 0.58, 1)` (21), `cubic-bezier(0.25, 0.1, 0.3, 1)` (13), `cubic-bezier(0.28, 0.11, 0.32, 1)` (8).

**Durations [CSS]**, transition properties only, ≤1200ms, by frequency:
**240ms (132) · 320ms (96) · 400ms (85) · 500ms (68) · 300ms (57) · 250ms (52) · 80ms (43) · 200ms (38) · 190ms (35) · 380ms (33) · 50ms (31) · 100ms (27)**.
Two clear modes: a **micro band at 50–100ms** and a **transition band at 240–320ms**.

**Scroll choreography [CSS + PUB]:** only **11 `position: sticky`** rules in ~1.6MB of CSS — Apple pins far less than its reputation suggests. Reveal distances in keyframes are small: `translateY` values cluster at **4px (22 uses) and 8px (19)**, with 20px (6) for larger blocks. **Apple's scroll reveals move 4–8px, not 40px.** Technique per **[PUB]**: `ViewTimeline` with `range: contain` paired with a `position: sticky; top: 0` element, so the element reaches `contain 100%` exactly as it becomes stuck. Parallax ratios: *not measured.*

**Restraint [HTML]:** with nav/header/footer stripped, the MacBook Pro first section contains **1 `<p>`, 2 `<a>`, 1 `<input>` — 3 distinct text runs**. The entire hero copy is a promo line plus "Shop". Everything else in the first viewport is product imagery and the 44px nav.

**Color [CSS]:** 95 distinct hex values across all sheets, but the structural tokens are few: `--global-section-background-color-alt: rgb(245,245,247)` (light) and `rgb(29,29,31)` (dark). Near-monochrome; Apple's "accent" is the product photograph, not a hue.

---

### 2. Linear

**App type tokens [CSS]** — complete `--text-*` set:

| Token | Size | Line-height | Letter-spacing |
|---|---|---|---|
| `tiny` | 0.625rem / 10px | 1.5 | −0.015em |
| `micro` | 0.75rem / 12px | 1.4 | 0 |
| `mini` | 0.8125rem / 13px | 1.5 | −0.01em |
| `small` | 0.875rem / 14px | `calc(21/14)` = 1.5 | −0.013em |
| `regular` | **0.9375rem / 15px** | **1.6** | −0.011em |
| `large` | 1.0625rem / 17px | 1.6 | 0 |

Plus a title ladder **[CSS]**: `--font-size-title1: 2.25rem (36px)`, `title2: 1.5rem (24px)`, `title3: 1.25rem (20px)`.

Note the same crossing-zero pattern as Apple: tracking is most negative at 10–14px and reaches **0 at 17px**. Body line-height is **1.6** — looser than Apple's 1.47, because Linear's body size is smaller (15px vs 17px).

**Layout [CSS]:** `--page-max-width: 1024px`. `--header-height: 57 / 64 / 65 / 72px` across contexts. Measure tokens `max-width: 28ch` and `38ch` exist for constrained UI text.

**Spacing [CSS]:** 4px grid. 181/270 (**67%**) of pixel paddings are multiples of 4. Observed step values: 4, 5, 6, 8, 10, 12, 14, 16, 32, 56px. Radius **[PUB]**: xs 1, sm 4, md 7, lg 16, xl 20.

**Color [CSS]** — the cleanest dual-theme token set in the corpus:

| Role | Dark | Light |
|---|---|---|
| `--color-bg-level-0` | `#08090a` | `#fff` |
| `--color-bg-level-1` | `#0f1011` | `#f8f8f8` |
| `--color-bg-level-2` | `#141516` | `#f4f4f4` |
| `--color-bg-level-3` | `#191a1b` | `#f0f0f0` |
| `--color-bg-marketing` | `#010102` | — |
| `--color-accent` | `#7170ff` | `#7170ff` |
| `--color-accent-hover` | `#828fff` | `#8989f0` |
| `--color-accent-tint` | `#18182f` | `#f1f1ff` |
| `--border-thin` | `#24282c` | — |
| `--border-solid` | `#2a2e33` | — |

The accent (`#7170ff`) ships in exactly **three** variants: base, hover, and a 5%-ish tint for backgrounds. That is the whole accent system. Borders are near-invisible: `#24282c` on `#0f1011` is roughly a 5% luminance step. 96 distinct hex values total, but that includes product-UI semantic states.

**Easing [CSS]:** signature curve is **`cubic-bezier(0.32, 0.72, 0, 1)` — 7 uses**, the most-copied curve of the last few years (it also appears in Vercel ×4 and Resend ×4). It is a hard decelerate: fast launch, long glide, zero overshoot. Also `cubic-bezier(0.45, 1.45, 0.8, 1)` ×2 (a spring with overshoot, reserved for small delight moments) and `cubic-bezier(0.43, 0.07, 0.59, 0.94)` ×2.

**Durations [CSS]:** **160ms is Linear's house duration — 30 uses**, more than double any other. Then 150ms (5), 250ms (4), 100ms (4), 120ms (4), 400ms (3), 500ms (3). Linear is the fastest site in the set. **[PUB]:** 150+ CSS animations; active states scale to `0.97`.

**Reveal distance [CSS]:** `translateY(1px)` appears — Linear's press states move **one pixel**.

---

### 3. Vercel

**Type [CSS]** — Geist scale, a clean 1.2/1.25 hybrid:
`--text-xs: .75rem` · `sm: .875rem` · `base: 1rem` · `lg: 1.125rem` · `xl: 1.25rem` · `2xl: 1.5rem` · `3xl: 1.875rem` · `5xl: 3rem` · `7xl: 4.5rem` · `8xl: 6rem (96px)`.
Display-to-body contrast: **96 / 16 = 6×**.

**Fluid type [CSS]** — Vercel uses a distinctive pattern: `clamp()` with a *variable* middle term rather than a raw `vw`:
- `font-size: clamp(12px, var(--computed-font-size), 32px)`
- `clamp(16px, var(--computed-font-size), 48px)`
- `clamp(24px, var(--computed-font-size), 64px)`
- `clamp(24px, var(--computed-font-size), 72px)`
- `clamp(24px, 3.75vw, 48px)` (the one literal instance)

This lets a single JS-computed value drive every fluid step in lockstep. The min values are **12/16/24px** and the max values **32/48/64/72px** — so no fluid heading ever drops below 12px or exceeds 72px.

**Color [CSS]:** `--accents-1` through `--accents-8` invert cleanly between themes — light `#fafafa → #eaeaea → #999 → #888 → #888 → #999 → #eaeaea → #fafafa`, dark `#111 → #333 → #444 → #666 → #666 → #444 → #333 → #111`. **This is an eight-step monochrome ramp with no hue at all.** Brand accent is applied on top, not baked into the ramp. 299 distinct hex values overall (Vercel carries a full Tailwind palette for docs/dashboard surfaces).

**Spacing [CSS/HTML]:** 121/212 (**57%**) of pixel paddings are multiples of 4. Section padding via utilities **[HTML]**: `py-14` (56px) ×23 and `py-16` (64px) ×8 are the dominant section rhythms — notably tighter than Apple's 144px.

**Easing [CSS]:** `cubic-bezier(0.4, 0, 0.2, 1)` ×8 (the standard-ease workhorse), `cubic-bezier(0.455, 0.03, 0.515, 0.955)` ×4, `cubic-bezier(0.4, 0.04, 0.04, 1)` ×4, `cubic-bezier(0.32, 0.72, 0, 1)` ×4, `cubic-bezier(0.16, 1, 0.3, 1)` ×3 (easeOutExpo), `cubic-bezier(0.5, 0, 0.1, 1.2)` ×2 (overshoot).

**Durations [CSS]:** 150ms (28), 200ms (27), 300ms (8), 500ms (7), 250ms (7), 100ms (7).

**Stagger [CSS]:** `transition-delay` values of **200ms, 250ms, 50ms, and 190.392ms / 40.3922ms** — those last two are computed per-index stagger values, evidence of a **~40ms per-item stagger** on a 5-item sequence.

**Restraint [HTML]:** nav-stripped hero = **2 `<a>`, 1 `<p>`, 2 `<img>` — 5 text runs**, of which two are "Skip to content" and "Loading". Real hero copy is a banner line, "Get your ticket", and "Drop to deploy".

---

### 4. Stripe

**Easing [CSS]** — the most *disciplined* easing set in the corpus:
**`cubic-bezier(0.25, 1, 0.5, 1)` — 41 uses**, vastly dominant. That is **easeOutQuart**: very fast start, very long settle. Then `cubic-bezier(0.4, 0, 0.2, 1)` ×8, `cubic-bezier(0.33, 1, 0.68, 1)` ×5 (easeOutCubic), `cubic-bezier(0.16, 1, 0.3, 1)` ×4 (easeOutExpo), `cubic-bezier(0.65, 0.05, 0.36, 1)` ×3.

Stripe's entire motion language is **one curve, used 41 times**. Everything else is a rounding error. This is the clearest single lesson in the dataset.

**Durations [CSS]:** 300ms (23), 500ms (9), 150ms (8), 400ms (6), 250ms (6), 200ms (5), 1000ms (4). Slower than Linear, faster than Apple's long tail.

**Type [CSS]:** heavily weighted to small sizes — 11px (55), 10px (54), 12px (46), 9px (37), 14px (21), 16px (9), 18px (6), 24px (3). The display sizes exist but are rare: 62px ×1, 3rem ×1, 2.125rem ×2. Stripe is a **dense-UI** site wearing a minimal hero; most of its CSS serves dashboard chrome.

**Reveal distance [CSS]:** `translateY` at 30px, 24px, 13px, 8px — larger movements than Apple.

**Restraint [HTML]:** nav-stripped hero = **2 `<h1>`, 1 `<img>`, 7 text runs** — and the h1/subhead pair is duplicated (an a11y/animation double-render). Effective content: **one headline, one subhead, two buttons.**

---

### 5. rauno.me (Rauno Freiberg — Vercel / Devouring Details)

The most restrained palette measured.

**Color [CSS]:** **9 distinct hex values in the entire site.** The root is `--root-background: var(--colors-gray1)` and a set of saturated accents is *declared but reserved*: `--red: rgb(244,40,0)`, `--green: rgb(0,175,63)`, `--blue: rgb(5,111,247)`, `--yellow: #FFFF02`, `--orange: #FF6100`, `--neon1: rgb(209,255,0)`, `--neon2: rgb(0,243,255)`, `--pink1: rgb(255,145,169)`.

The mechanic worth stealing: **every accent has a `display-p3` upgrade path** behind `@supports (color: color(display-p3 1 1 1))`, e.g. `--orange: color(display-p3 .99 .4 .02)`. On a P3 display the accent is measurably more saturated than sRGB can express; on sRGB it degrades silently. One accent, two gamuts.

Also: `--focus-ring: 2px solid var(--colors-focus)` — a single token for the entire focus system.

**Layout [CSS]:** `max-width: 960px` for the page, `400px` for text blocks. Grid gap `--gap: 8px`.

**Type [CSS]:** `h1,h2,h3 { font-weight: 500 }` — **no bold anywhere.** Custom font "X" at weights 400 and 500 only (both pointing at the same `dd.woff2`), plus JetBrains Mono 400. Emphasis (`em`, `i`) switches to **Georgia serif** — a typeface change instead of an italic synthesis.

**Easing [CSS]:** **zero `cubic-bezier` declarations.** All motion is JS-driven (this is a heavily interactive site) or uses CSS keywords.

**Restraint [HTML]:** hero = **1 `<h1>`, 9 `<a>`, 3 `<h3>`, 3 `<p>`, 27 text runs.** Note this is *denser* than Apple's 3 — see Part 4.

Scrollbar discipline **[CSS]**: `scrollbar-width: thin` with `scrollbar-color: var(--colors-gray9) transparent`; the index route hides the scrollbar entirely and sets `overscroll-behavior: none`.

---

### 6. paco.me (Paco Coursey — Linear)

**Color [CSS]:** 35 distinct hex values. Full Radix-style 12-step gray ramp plus alpha variants:
`--gray-1: #fcfcfc` · `2: #f9f9f9` · `3: #f0f0f0` · `4: #e8e8e8` · `5: #e0e0e0` · `6: #d9d9d9` · `7: #cecece` · `8: #bbb` · `9: #8d8d8d` · `10: #838383` · `11: #646464` · `12: #202020`.
Dark ramp starts `--gray1: #1a1a1a` … `--gray10: #7e7e7e`.
Alpha ramp: `--gray-a1: #00000003` through `--gray-a12: #000000df`.
`--bg: #fff` / `--fg: #000` (dark: `--fg: #f2f2f2`).

**Accent: `--ct-active-bg: #ff9f0a`** — a single orange, and the token name says it all: it exists only for the *active* state of one component. **The accent is scoped to a state, not to a brand surface.**

**Layout [CSS]:** `max-width: 688px` for content, `768px` container, `1024px` outer. The **688px measure** is the key number — at 16px body that is roughly **68–72 characters**.

**Spacing [CSS]:** 19/22 (**86%**) of pixel paddings are multiples of 4 — the strictest grid adherence measured.

**Easing [CSS]:** a full Penner easing library is declared (`cubic-bezier(0.95,0.05,0.795,0.035)`, `(0.6,0.04,0.98,0.335)`, `(0.77,0,0.175,1)`, `(0.645,0.045,0.355,1)`, etc.), each used **exactly once** — this is a copied utility set, largely dead code. Actual durations used: 50ms, 300ms, 400ms, 500ms, 2000ms.

**Restraint [HTML]:** hero = **1 `<h1>`, 13 `<p>`, 13 `<a>`, 5 `<h2>`, 37 text runs.** Paco front-loads his entire bio, current work, and project list above the fold.

---

### 7. emilkowal.ski (Emil Kowalski — Linear, author of Sonner/Vaul)

**Color [CSS]:** 130 distinct hex, but the structure is a 12-step Radix Sand ramp, dual-themed:
Light `--color-gray-100: #fdfdfc` → `200: #f9f9f8` → `300: #f1f0ef` → `400: #e9e9e7` → `500: #e2e1de` → `600: #dad9d6` → `700: #cfceca` → `800: #bcbbb5` → `900: #8d8d86` → `1000: #82827c` → `1100: #63635e` → `1200: #21201c`.
Dark `100: #111110` → `200: #191918` → `300: #222221` → `400: #2a2a28` → `500: #31312e` → `600: #3b3a37` → `700: #494844` → `800: #62605b` → `900: #6f6d66` → `1000: #7c7b74` → `1100: #b5b3ad` → `1200: #eeeeec`.
`--bg-fill: #f8f8f8` / `#252525`.
**`--brand: #fad657`** — one warm yellow, the only chromatic value in the system.
Alpha ramp `--color-gray-alpha-100: #00000003` upward.

Note the ramp is **warm-neutral, not pure gray**: `#21201c` and `#eeeeec` both carry a yellow bias. Paired with a yellow accent, the whole page reads as one temperature.

**Measure [CSS]:** `max-width: 42rem` = **672px**.

**Easing [CSS]:** `cubic-bezier(0.4, 0, 0.2, 1)` ×8, `cubic-bezier(0.165, 0.84, 0.44, 1)` ×2 (easeOutQuart variant), `cubic-bezier(0, 0, 0.2, 1)` ×1.
**Durations [CSS]:** 150ms (8), 200ms (4), 120ms (2), 300ms, 350ms, 100ms. Everything at or under 350ms.

**Published guidance [PUB]** (his own writing, *Great animations* / *7 practical animation tips*):
- UI animations should be **shorter than 300ms**; 140–220ms for most controls.
- **`ease-out` for entrances** — "ease-in is not recommended for UI animations because it speeds up at the end."
- Animate **`transform` and `opacity` only**; never `top`/`left`/`width`/`height`.
- Target **60fps** or the rest is moot.

**Restraint [HTML]:** hero = **3 `<p>`, 17 `<a>`, 44 text runs** — bio, current role, previous role, then the project list immediately.

---

### 8. vaul.emilkowal.ski (Vaul component site)

The tightest hero measured, and a useful control case.

**Restraint [HTML]:** **1 `<h1>`, 2 `<p>`, 3 `<a>`, 2 `<button>` — 7 text runs**, two of which are a dismissible promo banner. Actual content: title ("Vaul"), one-line description ("Drawer component for React."), three actions.

**Easing [CSS]:** **exactly one curve in the whole site — `cubic-bezier(0.4, 0, 0.2, 1)` ×4.** A 30KB stylesheet with a single easing function.

---

### 9. resend.com

**Fluid type [CSS]** — real literal clamps, unlike Vercel's variable approach:
- `font-size: clamp(4rem, 10.26vw, 7.5rem)` → **64px → 120px**, crossover at 624px viewport
- `font-size: clamp(4rem, 15vw + 0.5rem, 5.25rem)` → **64px → 84px**
- `font-size: clamp(10px, 2.5vw, 18px)`
- `font-size: min(15.5vw, 75px)`

The `15vw + 0.5rem` form is the preferred idiom (adding a rem term keeps the text zoomable; a pure-`vw` clamp breaks browser zoom accessibility).

**Color [CSS]:** `--background: #fdfdfd` (light) / `#000` (dark) — note the light background is **`#fdfdfd`, not `#fff`**. `--bg-overlay: #fffffff2` / `#000000f2` (95% alpha). A neutral ramp `--color-light-gray-1: #f0f0f0` → `2: #eee` → `3: #d7d7d7` → `4: #bebebe` → `5: #989898` → `7: #656565` → `11: #0d0d0d` → `12: #191919`. 234 distinct hex total (carries a Tailwind palette).

**Section padding [HTML]:** `py-24` (**96px**) ×10 and `py-36` (**144px**) ×1 are the section rhythms; `py-12` (48px) ×9 for subsections.

**Easing [CSS]:** `cubic-bezier(0.4, 0, 0.2, 1)` ×67 combined — overwhelmingly dominant. Then `cubic-bezier(0.36, 0.66, 0.6, 1)` ×8, `cubic-bezier(0, 0, 0.2, 1)` ×9, `cubic-bezier(0.32, 0.72, 0, 1)` ×4, `cubic-bezier(0.42, 0, 0.58, 1.8)` ×4 (strong overshoot, used sparingly).

**Durations [CSS]:** 200ms (15), 300ms (13), 150ms (8), 500ms (4), 360ms (4), 100ms (4), 75ms (2), 50ms (2).

**Stagger [CSS]:** `transition-delay` at **50ms ×3 and 80ms ×2** — a 50–80ms per-item stagger.

**Reveal distance [CSS]:** `translateY` at **4px ×8** and **16px ×4**. Again: small.

**Restraint [HTML]:** nav-stripped hero = **1 `<h1>`, 1 `<p>`, 3 `<a>`, 1 `<video>`, 2 `<img>` — 6 text runs**: banner, "Email for / developers" (a two-part animated headline), one subhead sentence, two CTAs.

---

### 10. leerob.com (Lee Robinson — ex-Vercel VP of Product)

Closest structural analogue to the target site: an engineer's personal site aimed at a technical audience.

**Color [CSS]:** `--background: #fff` / `#0a0a0a` / `#0f0d0b`, with `lab()` equivalents shipped alongside every hex (`--background: lab(2.75381% 0 0)`) — a wide-gamut fallback strategy like rauno's P3 approach. 102 distinct hex (Tailwind palette present).

**Measure [CSS]:** `max-width: 30ch` for tight blocks, **`40rem` (640px)** and `48rem` (768px) for prose, `680px`, `1100px` for the shell.

**Easing [CSS]:** **two curves total — `cubic-bezier(0, 0, 0.2, 1)` ×1 and `cubic-bezier(0.4, 0, 0.2, 1)` ×1.** An engineer's personal site with essentially no custom motion. Worth noting: it is widely regarded as a strong technical portfolio and it has **almost no animation at all**.

---

### 11. antfu.me (Anthony Fu — Vue/Vite/Vitest core)

**Measure [CSS]:** **`max-width: 65ch`** — the only site in the set to use the classic typographic measure directly. Also `640px`, `768px`, `30rem`, `20rem`.

**Color [CSS]:** 45 distinct hex — low, for a site with a large blog surface.

**Easing [CSS]:** `cubic-bezier(0.4, 0, 0.2, 1)` ×9, `cubic-bezier(0, 0, 0.2, 1)` ×2. Two curves.

**Restraint [HTML]:** hero = **1 `<h1>`, 13 `<p>`, 36 `<a>`, 56 text runs.** The densest hero measured — name, one-line bio, employer, then an immediate list of every project he created. For his audience (OSS developers) the project list *is* the credential, so density is the point.

---

### 12. basement.studio (Awwwards-tier studio site)

**Color [CSS]:** **13 distinct hex values** — second only to rauno. An award-winning, heavily animated studio site running on a 13-color palette.

**Easing [CSS]:** `cubic-bezier(0.4, 0, 0.2, 1)` ×14 and `cubic-bezier(0.4, 0, 0.6, 1)` ×1. **Two curves, one of them used once.**

This is the counterintuitive finding: the *most* visually ambitious site in the set has the *most* constrained token system. Complexity lives in the WebGL/JS layer; the CSS design system stays boring.

---

### 13. brianlovin.com

**Color [CSS]:** `--background-color-brand: #fc532a` (one orange). Border tokens use alpha on neutral, not a gray value: `--border-color-primary: #0000001f` (light) / `#ffffff1f` (dark); `--border-color-secondary: #00000017` / `#ffffff17`. `--background-color-quaternary: #ffffff08`.

**Alpha-over-hex for borders is the better pattern** — borders stay correct over any background level without a per-level token.

**Measure [CSS]:** `40rem (640px)` / `48rem` / `64rem` / `80rem` — a clean ×1.2/×1.33 container ladder.

**Easing [CSS]:** `cubic-bezier(0.87, 0, 0.13, 1)` ×2 (easeInOutExpo — dramatic), plus the standard three, once each.

---

## Part 2 — The five recurring mechanics

These are the mechanics that appear across the **strongest** examples, with the numeric range each falls in.

### Mechanic 1 — Optical letter-spacing that crosses zero

Every site with a serious type system tracks **negative at body size, toward zero or positive in the 21–32px band, then negative again at display size.**

| Source | 10–14px | 15–17px | 21–32px | 40–64px | 80px+ |
|---|---|---|---|---|---|
| Apple **[CSS]** | −0.016 to −0.01em | −0.022em | **+0.004 to +0.011em** | −0.009 to 0em | −0.015em |
| Linear **[CSS]** | −0.015 to −0.01em | −0.011em → **0** | — | — | — |

**Range to adopt: −0.022em at body (15–17px), 0em at 20–28px, −0.015em to −0.03em at 48px+.** Without this, large type looks loose and small type looks gappy. It is the cheapest single upgrade to perceived typographic quality.

### Mechanic 2 — Small reveal distances, not big ones

Scroll and state reveals move a **very** short distance. Measured `translateY` in keyframes **[CSS]**:

| Site | Dominant distances |
|---|---|
| Apple | **4px (22), 8px (19)**, 20px (6) |
| Resend | **4px (8), 16px (4)** |
| Vercel | 8px (2), 6px, 5px, 1px |
| Linear | **1px** (press states) |
| Stripe | 30px, 24px, 13px, 8px |

**Range to adopt: 4–16px for section reveals; 1–2px for press/active states.** Stripe is the outlier at 24–30px and is also the least "premium-feeling" of the set at scroll. The `translateY(40px)` fade-up that dominates template portfolios appears **nowhere** in this dataset.

### Mechanic 3 — One dominant easing curve, used everywhere

The strongest sites do not have an easing *library*. They have **one curve plus at most two exceptions.**

| Site | Dominant curve | Uses | Share |
|---|---|---|---|
| Apple | `cubic-bezier(0.4, 0, 0.6, 1)` | 312 | ~55% |
| Stripe | `cubic-bezier(0.25, 1, 0.5, 1)` | 41 | ~48% |
| Resend | `cubic-bezier(0.4, 0, 0.2, 1)` | 67 | ~60% |
| basement.studio | `cubic-bezier(0.4, 0, 0.2, 1)` | 14 | ~93% |
| Vaul | `cubic-bezier(0.4, 0, 0.2, 1)` | 4 | **100%** |
| Linear | `cubic-bezier(0.32, 0.72, 0, 1)` | 7 | ~28% |

The **corpus-wide** favourite is `cubic-bezier(0.4, 0, 0.2, 1)` (appearing in 9 of 13 sites). The corpus-wide *entrance* curve is `cubic-bezier(0, 0, 0.2, 1)` (Apple ×95, Resend ×9, Vercel ×3, antfu ×2, leerob ×1).

Counter-example: **paco.me declares 12 Penner curves and uses each exactly once** — a copied utility set that produces no coherent feel.

**Range to adopt: 1 primary curve + 1 entrance curve + 1 optional overshoot. Total easing tokens ≤ 4.**

### Mechanic 4 — Duration bands, with a hard ceiling around 320ms

Pooled `transition` durations across all 13 sites **[CSS]**, ≤1200ms, by frequency:

**300ms (146) · 150ms (141) · 240ms (137) · 500ms (109) · 400ms (109) · 200ms (107) · 320ms (97) · 250ms (74) · 160ms (64) · 100ms (62) · 80ms (47) · 50ms (40) · 190ms (35) · 380ms (33)**

Three clear bands:

| Class | Range | Cluster values |
|---|---|---|
| Micro-interaction (hover, focus, press) | **50–160ms** | 50, 80, 100, 150, **160** |
| Component / state change (menu, card, toggle) | **200–320ms** | 200, **240**, 250, **300**, 320 |
| Section reveal / page transition | **380–500ms** | 380, 400, 500 |

Corroborated **[PUB]** by Emil Kowalski: under 300ms generally, 140–220ms for most controls. Linear's house value of **160ms** and Apple's of **240ms** bracket the practical sweet spot.

### Mechanic 5 — A monochrome ramp plus one scoped accent

Distinct hex values per site **[CSS]** (relative signal):

| Site | Count | Character |
|---|---|---|
| rauno.me | **9** | personal, most restrained |
| basement.studio | **13** | award-winning, heavily animated |
| paco.me | 35 | personal |
| antfu.me | 45 | personal + blog |
| Apple | 95 | product marketing |
| Linear | 96 | full product UI |
| leerob.com | 102 | personal + Tailwind palette |
| emilkowal.ski | 130 | personal + Tailwind palette |
| resend.com | 234 | product + Tailwind palette |
| vercel.com | 299 | product + docs + dashboard |

**Personal sites that read as most refined sit at 9–45.** Everything above ~100 is a product surface carrying semantic UI states it actually needs.

The structural pattern is consistent: a **9–12 step neutral ramp** (Linear 4 bg levels + borders; paco 12 grays + 12 alphas; Emil 12 grays + alphas) plus **one accent shipped in 1–3 variants**:
- Linear: `#7170ff` + hover `#828fff` + tint `#18182f`/`#f1f1ff` — **3 variants, no more**
- Emil: `--brand: #fad657` — **1 variant**
- paco: `--ct-active-bg: #ff9f0a` — **1 variant, scoped by name to a single component state**
- brianlovin: `#fc532a` — **1 variant**
- Apple: no chromatic accent at all; the product photo is the color

**Where the accent is allowed [CSS-derived]:** link hover, focus ring, one primary CTA, active/selected state, a single inline marker. **Where it is forbidden:** body text, headings, borders (use alpha-on-neutral — brianlovin's `#0000001f` / `#ffffff1f`), backgrounds larger than a chip, icons by default, and more than one element per viewport.

**Two bonus mechanics worth noting** (they recur but sit below the top five):
- **Wide-gamut accent upgrade.** rauno ships `color(display-p3 …)` behind `@supports`; leerob ships `lab()` alongside every hex. The accent is more saturated on modern displays and degrades silently elsewhere.
- **The off-white background.** Resend uses `#fdfdfd`, paco `#fcfcfc` (gray-1), Vercel `#fafafa`. **Pure `#ffffff` is rare**; a 1–3 point step off white reduces glare and makes true white available as a highlight.

---

## Part 3 — Anti-patterns that cost credibility with a technical audience

Technical recruiters and engineering managers are a specific audience: they read code for a living, they have seen ten thousand portfolio templates, and they are evaluating *judgment* as much as taste. These are the failures visible in the weaker examples and in what the strong examples deliberately avoid.

**1. The easing library nobody uses.** paco.me declares 12 Penner curves (`cubic-bezier(0.95,0.05,0.795,0.035)`, `(0.6,0.04,0.98,0.335)`, …) and uses each **exactly once**. **[CSS]** To an engineer this reads as a copied snippet, not a decision. Shipping four easing tokens you actually use beats shipping forty you don't.

**2. Long reveal distances.** `translateY(40px)` → `0` over 800ms is the signature of a portfolio template. Nothing in this dataset does it: the measured range is **4–16px** (Apple, Resend, Vercel) with Stripe topping out at 30px. **[CSS]** A long travel distance means content is *missing* from the viewport while the reader is trying to read it — the opposite of clarifying hierarchy.

**3. Animation that gates content.** Emil's rule **[PUB]** — under 300ms, because anything longer is a tax the user pays on every visit. A 90-second reader who must wait 800ms per section for text to arrive will have spent a meaningful fraction of their visit watching opacity transitions. If the hero headline animates in, the recruiter's first impression is a loading state.

**4. Duplicated DOM for animation.** Stripe's hero ships the `<h1>` and subhead **twice** **[HTML]**. Anyone who opens devtools — and this audience does — sees it immediately. It also breaks copy-paste and screen readers.

**5. Pure-`vw` fluid type.** `font-size: clamp(1rem, 5vw, 4rem)` with no rem term in the middle breaks browser zoom: the text stops responding to the user's font-size preference. Resend's `clamp(4rem, 15vw + 0.5rem, 5.25rem)` **[CSS]** adds the rem term specifically to preserve zoom. A hiring manager who zooms and sees nothing move has found an accessibility bug on a page whose entire argument is craft.

**6. An accent used as decoration.** Every strong example scopes its accent to **one to three variants and a named role** — paco's token is literally `--ct-active-bg`, an active-state background for one component **[CSS]**. Accent-colored headings, accent borders, and accent-filled icon sets dissolve the signal: when everything is accented, the one CTA that matters is invisible.

**7. Bold weights doing the work of size.** rauno.me sets `h1, h2, h3 { font-weight: 500 }` and ships **only 400 and 500** **[CSS]**. Weak sites reach for 700/800 to create hierarchy; strong sites create it with size contrast (Apple 80/17 = 4.7×, Vercel 96/16 = 6×) and let weight stay near-uniform.

**8. Density without structure.** The nuance here matters — see Part 4. antfu.me has **56 text runs** in its first viewport **[HTML]** and it works, because the runs are a single scannable column of project names. The same 56 runs in a three-column grid of cards with icons and hover states would be noise. Density is not the anti-pattern; **unstructured** density is.

**9. Motion with no reduced-motion path.** Not measured in the CSS grep, but `prefers-reduced-motion` is table stakes for this audience; its absence is a concrete, checkable defect.

**10. Borders as gray values instead of alpha.** A `#e5e5e5` border token breaks the moment it sits on a card at a different elevation. brianlovin's `#0000001f` / `#ffffff1f` **[CSS]** works at every level. This is invisible to most viewers and obvious to anyone who has built a design system.

---

## Part 4 — How these sites handle the 90-second scan

This is where the dataset splits cleanly into two strategies, and the split is **not** minimal vs. maximal — it is **company** vs. **person**.

### Company sites defer aggressively

Nav-stripped first-section content **[HTML]**:

| Site | Elements | Text runs | Actual content |
|---|---|---|---|
| Apple (MacBook Pro) | 1 p, 2 a, 1 input | **3** | promo line + "Shop" |
| Vercel | 2 a, 1 p, 2 img | **5** | banner, "Drop to deploy", ticket CTA |
| Resend | 1 h1, 1 p, 3 a, 1 video | **6** | headline, one subhead, two CTAs |
| Vaul | 1 h1, 2 p, 3 a, 2 button | **7** | title, one-line description, three actions |
| Stripe | 2 h1 (duplicated), 1 img | **7** | headline, subhead, two CTAs |

**Company heroes carry 3–7 text runs.** They defer everything — product detail, proof, pricing — because the visitor has already decided to be there and the hero's only job is to name the category. The first viewport is mostly empty or mostly image.

### Personal sites front-load credentials

| Site | Elements | Text runs | Actual content |
|---|---|---|---|
| rauno.me | 1 h1, 9 a, 3 h3, 3 p | **27** | name, one-sentence bio with employer links, then work |
| paco.me | 1 h1, 13 p, 13 a, 5 h2 | **37** | name, bio, past employers, then Building/Craft/Projects |
| emilkowal.ski | 3 p, 17 a, 2 button | **44** | name, role, current employer, previous employer, projects |
| antfu.me | 1 h1, 13 p, 36 a | **56** | name, bio, employers, then every project he created |

**Personal sites carry 27–56 text runs in the first viewport — 5–10× the company sites.**

This is not a failure of restraint. It is the correct read of a different job. A recruiter arriving at a personal site has **no** prior context and is asking three questions: *who is this, what have they built, is it real?* Deferring the answer costs the visit. Every one of these four sites answers all three questions before the first scroll.

### The mechanic that makes density survivable

All four personal sites use the **same structure**: a single narrow column, one measure, no cards, no grid, no icons.

Measures **[CSS]**: antfu **65ch** · paco **688px** · emil **672px (42rem)** · leerob **640px (40rem)** · brianlovin **640px (40rem)** · rauno **400px** for text blocks within a 960px page.

**Convergence: 640–690px, or 65–72 characters.** At 16–17px body this is one comfortable reading column. The density is tolerable because the eye never has to choose a path — there is exactly one, running straight down.

The second shared mechanic: **link density as proof**. antfu's 36 `<a>` elements and emil's 17 are not navigation — they are project names, employer names, and artifact names. For a technical reader, a dense list of real, clickable, verifiable things *is* the credibility argument. Prose describing the same work would be weaker and longer.

### What this means for arinzeokigbo.com

The target audience (technical recruiters, <90s) maps to the **personal-site** pattern, not the Apple pattern. Copying Apple's 3-text-run hero onto a personal site produces a beautiful page that answers nothing, and a recruiter who scrolls once and leaves.

**Deliver in the first viewport (before any scroll):**
1. Name.
2. One sentence that carries all three credentials — NYU CS, co-founder/CEO of Splita, security at Cyera/Queralt — with the organization names as links.
3. The three or four things he built, by name, each one a link. Splita (commit-first group payments), the FIDO2/PKI/Entra ID browser-native auth R&D, the Cyera security work.
4. One contact action.

**Defer past the fold:** narrative case studies, metrics and depth on each project, the résumé, writing, and anything requiring reading rather than scanning.

The restraint mandate is satisfied by **near-monochrome palette, one measure, one column, near-uniform weight, and 4–16px of motion** — not by withholding the credentials. Restraint governs *how* the information looks, not *whether* it is present.

---

## Part 5 — Explicit recommendations for this site

Numbers a design-system agent can adopt directly.

### 5.1 Type scale

**Ratio: 1.25 (major third). Base: 16px.** Rationale: 1.25 is the ratio Apple approaches at its display end (32→40, 64→80) and Vercel's Geist uses at the top of its scale; at the base it yields whole-pixel steps, which 1.333 and 1.5 do not.

| Token | Size | Line-height | Letter-spacing | Weight | Use |
|---|---|---|---|---|---|
| `--text-caption` | **13px** | 1.4 | −0.01em | 400 | metadata, dates, footnotes |
| `--text-body` | **16px** | **1.55** | **−0.011em** | 400 | all body copy |
| `--text-lead` | **20px** | 1.45 | **0em** | 400 | hero subhead, section intros |
| `--text-h3` | **25px** | 1.3 | **0em** | 500 | project titles |
| `--text-h2` | **31px** | 1.2 | −0.01em | 500 | section headings |
| `--text-h1` | **49px** | 1.08 | −0.02em | 500 | page titles |
| `--text-display` | **76px** | **1.05** | **−0.028em** | 500 | name / hero only |

Skipped step: 39px. It exists in the scale (16 × 1.25⁴) — hold it in reserve; do not use more than **five** of these seven steps on any one page.

Display-to-body contrast: **76 / 16 = 4.75×** — directly in line with Apple's 4.7× and below Vercel's 6×.

**Letter-spacing crosses zero at 20–25px**, exactly as Apple and Linear do. This is Mechanic 1 and is non-optional.

**Weight: ship 400 and 500 only.** rauno.me does this (`h1,h2,h3 { font-weight: 500 }`). Hierarchy comes from size, not weight. Allow 600 only if the chosen typeface's 500 is optically too light at 76px.

**Fluid type** — three clamps, each with a rem term so browser zoom survives (Resend's idiom):
- `--text-display: clamp(39px, 4.5vw + 8px, 76px)` → hits 76px at ~1500px viewport, floors at 39px
- `--text-h1: clamp(31px, 3vw + 8px, 49px)`
- `--text-h2: clamp(25px, 1.5vw + 12px, 31px)`

Sizes at and below `--text-lead` (20px) stay **fixed** — fluid body text is a net loss.

**Measure: `max-width: 42rem` (672px)** for all prose, matching emilkowal.ski exactly and sitting inside the 640–690px convergence. Equivalent to **~68 characters** at 16px. For the hero one-liner, allow `max-width: 30ch` (leerob's tight-block value) to force a deliberate line break.

**Container ladder:** `672px` (prose) · `768px` (wide blocks) · `1024px` (page shell, matching Linear's `--page-max-width`).

### 5.2 Spacing

**Base unit: 4px.** Target ≥85% adherence — paco.me achieves 86%, Linear 67%, Apple 64%. Break the grid only for optical corrections and note why.

Scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 144 · 192px`

**Section padding (vertical):**

| Breakpoint | Padding | Source basis |
|---|---|---|
| ≥1024px | **144px** | Apple `--global-section-padding: 144px`; Resend `py-36` = 144px |
| 768–1023px | **96px** | Resend `py-24` = 96px |
| <768px | **72px** | half of desktop; sits on the 4px grid |

**Horizontal gutter:** 24px below 768px, 32px at 768–1023px, 48px at ≥1024px (content is centered at 672–1024px, so the gutter only matters on narrow screens).

**Intra-section rhythm:** 48px between a section heading and its content; 32px between sibling list items; 16px between a title and its description; 8px between a label and its value.

**Header height: 64px** (Linear ships 57/64/65/72; Apple 44px). 64px sits on the grid and gives a personal site enough presence without eating the hero.

**Breakpoints:** `768px` and `1024px`. Two, not five. (Apple runs 734/1068; Tailwind's 768/1024 are close enough and more conventional for a Next.js codebase.)

### 5.3 Palette

**Target: ≤14 distinct values** — between rauno's 9 and basement.studio's 13, well under paco's 35. Structure is a 9-step neutral ramp + 1 accent in 2 variants + 2 alpha border tokens.

**Neutral ramp** (light theme; invert for dark):

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | **`#fcfcfc`** | **`#0a0a0a`** | page background — **not pure white** (paco `#fcfcfc`, Resend `#fdfdfd`, leerob `#0a0a0a`) |
| `--bg-subtle` | `#f6f6f6` | `#141414` | raised surface, code blocks |
| `--bg-muted` | `#ededed` | `#1c1c1c` | hover fills, chips |
| `--fg-faint` | `#bdbdbd` | `#4a4a4a` | disabled, dividers-as-text |
| `--fg-muted` | `#8a8a8a` | `#7c7c7c` | metadata, captions, dates |
| `--fg-subtle` | `#5c5c5c` | `#a8a8a8` | secondary body copy |
| `--fg` | **`#1a1a1a`** | **`#ededed`** | primary text — **not pure black** |
| `--fg-strong` | `#0a0a0a` | `#fcfcfc` | display type only |

**Borders — alpha over neutral, never a gray value** (brianlovin's pattern):
- `--border: #0000001f` (light) / `#ffffff1f` (dark)
- `--border-subtle: #00000014` (light) / `#ffffff14` (dark)

**Accent — exactly one hue, two variants:**
- `--accent: #f4622a`
- `--accent-hover: #ff7a45`

Rationale for warm orange over Linear's indigo: indigo/violet is the default SaaS accent and reads as generic; warm orange (paco `#ff9f0a`, brianlovin `#fc532a`, rauno `#FF6100`) is the recurring choice among *personal* sites in this set, and it carries maximum contrast against a near-monochrome page. Substitute any single hue — the discipline matters more than the value.

**Wide-gamut upgrade** (rauno's mechanic) — behind `@supports (color: color(display-p3 1 1 1))`:
`--accent: color(display-p3 0.93 0.39 0.18)`

**Accent permitted on:** link hover/underline, focus ring, the single primary CTA, active nav item, one inline marker per viewport.
**Accent forbidden on:** body text, any heading, borders, backgrounds larger than a chip, default icon fills, and any second element within the same viewport.

**Focus ring** (rauno's single token): `--focus-ring: 2px solid var(--accent)` with `outline-offset: 2px`.

### 5.4 Easing and motion

**Four easing tokens. No more.**

| Token | Value | Use |
|---|---|---|
| `--ease-standard` | **`cubic-bezier(0.4, 0, 0.2, 1)`** | default for everything — present in 9 of 13 sites, 100% of Vaul, 93% of basement.studio |
| `--ease-out` | **`cubic-bezier(0, 0, 0.2, 1)`** | entrances only — Apple ×95 |
| `--ease-glide` | **`cubic-bezier(0.32, 0.72, 0, 1)`** | the one "authored" moment: hero reveal or page transition — Linear's signature, also Vercel and Resend |
| `--ease-spring` | `cubic-bezier(0.45, 1.45, 0.8, 1)` | **optional, ≤1 use on the entire site** — Linear ×2 |

**Never ship `ease-in`** for UI — Emil Kowalski **[PUB]**: it accelerates at the end, the opposite of responsive.

**Durations — three tokens:**

| Token | Value | Applies to |
|---|---|---|
| `--dur-fast` | **150ms** | hover, focus, link underline, button press (corpus mode: 150ms ×141; Linear's house value 160ms) |
| `--dur-base` | **240ms** | state changes, menu open, card elevation, theme toggle (Apple's house value, ×132) |
| `--dur-slow` | **400ms** | section reveal, page transition — **hard ceiling** |

Nothing on this site animates longer than **400ms**. Emil's rule is 300ms; 400ms is reserved for whole-section reveals only.

**Reveal distances:**
- Section reveal: `translateY(12px)` → `0` with `opacity 0 → 1`, **400ms**, `--ease-out`. (Corpus range 4–16px; 12px sits mid-range and lands on the 4px grid.)
- Press/active state: `scale(0.98)` or `translateY(1px)`, **150ms**, `--ease-standard`. (Linear ships `scale(0.97)` **[PUB]** and `translateY(1px)` **[CSS]**.)
- Hover lift: `translateY(-2px)` maximum.

**Stagger: 50ms per item, capped at 5 items (250ms total).** Corpus evidence: Resend `transition-delay` 50ms/80ms **[CSS]**; Vercel's computed 40.39ms per-index values **[CSS]**. Beyond 5 items the last one arrives after the reader has already moved on.

**Scroll trigger:** reveal when the element's top crosses **85% of viewport height** (i.e. IntersectionObserver `rootMargin: "0px 0px -15% 0px"`, `threshold: 0`), fire **once**, never reverse. Honest note: this threshold is a reasoned default, **not measured** from the reference sites — their trigger logic is in JS I did not instrument.

**Properties: `transform` and `opacity` only.** Never `top`, `left`, `width`, `height`, or `margin` **[PUB]**.

**No pinned sections, no parallax, no scroll-hijacking.** Apple ships only **11 `position: sticky` rules in ~1.6MB of CSS** **[CSS]**; leerob.com — a widely respected technical portfolio — ships **two easing curves and essentially no motion at all** **[CSS]**. For a <90s technical audience, motion that delays reading is a cost with no return.

**Reduced motion:** under `@media (prefers-reduced-motion: reduce)`, set all durations to `0.01ms` and remove all transforms, retaining opacity changes only.

### 5.5 Summary card

```
TYPE      ratio 1.25 · base 16px · 13/16/20/25/31/(39)/49/76
          line-height 1.55 body → 1.05 display
          tracking −0.011em body → 0em at 20–25px → −0.028em display
          weights 400/500 only · measure 42rem (672px, ~68ch)

SPACE     base 4px · 4/8/12/16/24/32/48/64/96/144/192
          section padding 144px ≥1024 · 96px 768–1023 · 72px <768
          header 64px · breakpoints 768 / 1024 · shell 1024px

COLOR     14 values: 8 neutrals + 2 alpha borders + accent ×2 + P3 upgrade
          bg #fcfcfc / #0a0a0a (never pure white or black)
          fg #1a1a1a / #ededed
          accent #f4622a — CTA, link hover, focus ring, active nav ONLY

MOTION    4 easings: 0.4,0,0.2,1 (standard) · 0,0,0.2,1 (entrance)
                     0.32,0.72,0,1 (one hero moment) · spring (optional, ≤1)
          3 durations: 150 / 240 / 400ms — hard ceiling 400ms
          reveal translateY(12px) · press scale(0.98) · stagger 50ms ×5 max
          trigger at 85% viewport, fire once, transform+opacity only
          no pinning · no parallax · no scroll-hijack
```

---

## Sources

**Live stylesheet capture (`curl` + grep), 2026-09-11** — [apple.com/macbook-pro](https://www.apple.com/macbook-pro/), [linear.app](https://linear.app), [vercel.com](https://vercel.com), [stripe.com](https://stripe.com), [resend.com](https://resend.com), [rauno.me](https://rauno.me), [emilkowal.ski](https://emilkowal.ski), [vaul.emilkowal.ski](https://vaul.emilkowal.ski), [paco.me](https://paco.me), [leerob.com](https://leerob.com), [antfu.me](https://antfu.me), [basement.studio](https://basement.studio), [brianlovin.com](https://brianlovin.com)

**Published writeups** — [Emil Kowalski, *Great animations*](https://emilkowal.ski/ui/great-animations) · [Emil Kowalski, *7 practical animation tips*](https://emilkowal.ski/ui/7-practical-animation-tips) · [Linear design tokens benchmark, DesignMD](https://designmd.cc/benchmarks/linear) · [Apple design system, Refero Styles](https://styles.refero.design/style/c9cabb96-32fa-4896-837a-f2497ce1c856) · [Why Most Scroll Animations Miss What Apple Gets Right](https://www.brad-holmes.co.uk/web-performance-ux/why-most-scroll-animations-miss-what-apple-gets-right/) · [Unleash the Power of Scroll-Driven Animations, CSS-Tricks](https://css-tricks.com/unleash-the-power-of-scroll-driven-animations/) · [CSS Scrollytelling with Position Sticky, Effect Labs](https://effect-labs.com/en/pages/blog/sticky-scroll-sections.html)
