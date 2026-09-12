# 04 — Design System

**Phase:** 2 (serial, hard gate). **Blocks:** Phase 3 (IA/copy), Phase 4 (all five build agents), Phase 5 (`review-design-qa`).
**Inputs:** `docs/00-content-inventory.md`, `docs/01-design-research.md`, `docs/02-tech-research.md`, `docs/03-recruiter-research.md`, `docs/BUILD-PLAN.md`, `src/app/globals.css`.
**Date:** 2026-09-11.
**Amended:** 2026-09-11, Phase 5 reconciliation against shipped code (`docs/06-review-*`, `docs/07-fix-report.md`). Every amendment is logged in **§12.1** with the section it changed. Section numbering is unchanged; §2.7 and §12.1 are new and additive.
**Amended again:** 2026-09-11, the **attestation-field amendment** (`docs/15-field-port-plan.md` §1). Adds **DEV-13** (allowlist row **A8**, the field as an emissive surface), **DEV-14** (the warm neutral ladder), **DEV-15** (the light-source system), logged in **§12.1 F**. Sections changed: §2.6, §2.7, §3.2, §3.3, §3.4, §3.5, §3.6, §8.4, §10, §11, §12, §13. **Section numbering is unchanged. §2.8 and §3.7 are new and additive — they are appended after the last existing subsection of their part, so no existing number moves and no external citation breaks.** Every contrast figure in this amendment was recomputed, not carried over; §3.6 is reprinted in full.

---

## 0. How to read this document

This is a **closed token set**. Every value a later agent renders must be one of the tokens below, referenced by name. There are no unnamed values in this document and there must be none in the codebase.

**Traceability tags used throughout:**

| Tag | Meaning |
|---|---|
| **[01]** | Value taken directly from `docs/01-design-research.md`, with the section cited. |
| **[01→]** | Value inside a range `docs/01` measured, but a different point in that range than `docs/01` recommended. Reason given. |
| **[DEV]** | **Deviation.** Contradicts a specific `docs/01` recommendation. Reason given, and every one of these is listed together in §12. |
| **[02]** | Constraint from `docs/02-tech-research.md` (stack / budget). |
| **[03]** | Constraint from `docs/03-recruiter-research.md` (a numbered rule R1–R35 or an anti-pattern AP1–AP6). |
| **[MEAS]** | Measured in this repository during Phase 2. Method stated. |
| **[WCAG]** | Required by WCAG 2.2 at level AA. Success criterion number given. |
| **[RAT]** | Stated rationale, no external source. |

**Contrast method [MEAS].** Every ratio in §3 and §7 was computed with the WCAG 2.x relative-luminance formula (sRGB, threshold `0.04045`, gamma `2.4`) against the exact hex values printed here. Alpha border tokens were composited over each surface before measurement. Numbers are rounded down to 2dp. Nothing in this document is estimated.

**Hard rule for Phase 4 and Phase 5.** A rendered value that is not one of these tokens is a defect, even if it looks correct. A token used outside its declared scope is a defect. If a token you need does not exist, that is a gap in this document — escalate it, do not invent a value.

---

## 1. Typography

### 1.1 Font decision — one variable family, one system family, 22,320 bytes

**Decision: keep Space Grotesk (variable), drop Instrument Serif, add no monospace webfont.**

**Measured today [MEAS]** — `next build` output in `.next/static/media/`, byte-exact via `stat -f%z`, cross-referenced against the `@font-face` `src` URLs emitted into `.next/static/css/`:

| File | Bytes | Identified as | Preloaded? |
|---|---:|---|---|
| `36966cca54120369-s.p.woff2` | **22,320** | Space Grotesk **variable** (`HVAR`/`STAT` tables present), `latin` subset | yes |
| `e6099e249fd938cc-s.p.woff2` | **15,040** | Instrument Serif 400, static, `latin` subset | yes |
| `b7387a63dd068245-s.woff2` | 18,924 | Space Grotesk variable, `latin-ext` | no |
| `e1aab0933260df4d-s.woff2` | 6,772 | Instrument Serif 400, `latin-ext` | no |
| `35f3de0ebb1cfc70-s.woff2` | 7,828 | Instrument Serif, secondary subset | no |

**Current first-paint webfont cost: 37,360 bytes (36.5 KB) across two families, two preload links, two independent load timelines.**
**Specified cost: 22,320 bytes (21.8 KB), one family, one preload link.**
**Saving: 15,040 bytes, −40.3%.**

**Why keep Space Grotesk rather than replace it:**

1. **A variable font is cheaper here than static cuts.** `docs/01` §5.1 mandates weights 400 and 500 only. Two static `latin` cuts of Space Grotesk would be two files; the comparable single-weight static `latin` file measured in this repo (Instrument Serif 400) is 15,040 bytes, so two statics land near 30–34 KB against the variable file's measured **22,320 bytes**. The variable file is the cheaper way to ship two weights, and it ships them in one request. **[MEAS] [RAT]**
2. **Replacing it costs bytes and buys nothing measurable.** `docs/01` names no family. Every alternative carries an unmeasured payload against a 45 KB JS headroom **[02 §7]** and a ≤1.0s time-to-first-meaningful-text rule **[03 R4]**. Space Grotesk is already subset, already preloaded, already metric-matched by `next/font`.
3. **It is not the default.** `docs/01` anti-pattern 1 is about shipping copied systems. Geist reads as Vercel's, Inter reads as every SaaS product; Space Grotesk reads as a choice. For an audience evaluating judgment **[03 A6]** that is worth more than a marginal reading-comfort delta at 16px.

**Why drop Instrument Serif:**

1. **15,040 bytes for a decorative register.** It is used only on `.section-title` and the hero `h1` (`docs/00` §11). Those are exactly the two places `docs/01` Mechanic 1 demands hand-tuned optical tracking, and running a second family there means running two tracking systems. **[01 §5.1]**
2. **A serif display face is the shape of failure mode AP6** — the aesthetic producing elegance where evidence should go **[03 AP6]**. The display line on this page is a claim sentence with proper nouns in it, not a masthead.
3. Hierarchy on this page comes from **size × weight**, not from a family switch. `docs/01` §5.1: "Hierarchy comes from size, not weight"; rauno.me ships one custom face at 400/500 and nothing else.

**Why no monospace webfont:** the only monospace surfaces are the attestation readout `ES256 · sig 3045…a91c · verified 0.4ms` **[02 §6]** and inline `<code>` in MDX. A system monospace stack costs **0 bytes** and every target platform ships a good one. **[RAT]**

#### Font stacks (tokens)

```
--font-sans: var(--font-space-grotesk, "Space Grotesk", "Space Grotesk Fallback"),
             -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;

--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
             "Liberation Mono", "Courier New", monospace;
```

`"Space Grotesk Fallback"` is the metric-adjusted `@font-face` that `next/font/google` synthesises automatically (`adjustFontFallback: true`, the default) using `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override`. It is what keeps the swap from moving layout. **Do not disable it.**

**Two binding rules, both learned by shipping the bug** (fix report CRITICAL 1) **[MEAS]**:

1. **`next/font`'s `variable` class must be on `<html>`, not `<body>`.** `--font-sans` is declared at `:root`. A bare `var()` naming a property that is not set *on or above* the referencing element is invalid at computed-value time, which discards the **whole declaration** — `--font-sans` computed to the empty string, every element fell back to Preflight's `ui-sans-serif` stack, the 22,320 B preload was fetched and never painted, and all seven `ch`-based measures resolved against the wrong metrics. The failure is silent: nothing errors, the page just is not in the specified typeface.
2. **The `var()` carries its own fallback list.** `var(--font-space-grotesk, "Space Grotesk", "Space Grotesk Fallback")` degrades to the named face rather than invalidating the type system if rule 1 is ever broken again. `--font-space-grotesk` already *ends* in `"Space Grotesk Fallback"`, so the stack must not repeat it outside the `var()`.

#### `font-display` strategy

```ts
// src/app/layout.tsx
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",        // required — see below
  preload: true,          // default when `subsets` is given; state it explicitly
  adjustFontFallback: true,
  // no `weight` key: this resolves to the variable file measured above
});
```

**`swap`, not `optional`, not `block`. [RAT] [03 R4]**

- `block` hides text for up to 3s. It would put a 22 KB font request in front of the claim sentence and directly violate **[03 R4]** (first meaningful text ≤ 1.0s at 4G).
- `optional` gives the font a ~100ms window and then abandons it for the whole page load. On a cold 4G visit the display line would render in the system fallback for the entire session. On a page whose argument is craft, that is the worse failure.
- `swap` renders the claim in the metric-matched fallback at first paint — so time-to-first-meaningful-text is bounded by HTML, not by the font — and upgrades when the font lands. Because `adjustFontFallback` supplies matched metrics, **the swap's CLS contribution is ~0**, which is the usual objection to `swap` and it does not apply here.

**Weight axis: exactly 400 and 500.** `docs/01` §5.1 / anti-pattern 7 (rauno.me: `h1,h2,h3 { font-weight: 500 }`, only 400 and 500 shipped). 600 and 700 are **forbidden**. `docs/01` permits 600 "only if the chosen typeface's 500 is optically too light at 76px" — Space Grotesk's 500 is not, so the exception is not taken.

```
--font-weight-normal: 400;   /* body, captions, metadata, lead */
--font-weight-medium: 500;   /* every heading, labels, button text, active nav */
```

Synthetic bold (`font-synthesis-weight`) is disabled globally so a stray `<strong>` cannot manufacture a third weight:
`body { font-synthesis-weight: none; font-synthesis-style: none; }`
`<strong>` and `<b>` render at **500**, not 700. `<em>` renders at the same weight with `font-style: italic` (Space Grotesk variable has no italic; the browser obliques it — acceptable, and `<em>` is rare in this copy).

### 1.2 Scale

**Ratio: 1.25 (major third). Base: 16px. Root: 16px (never overridden).** **[01 §5.1]**
Rationale carried from `docs/01`: 1.25 is the ratio Apple approaches at its display end (32→40, 64→80) and yields whole-pixel steps at a 16px base, which 1.333 and 1.5 do not.

Seven steps. Display-to-body contrast **76 / 16 = 4.75×**, in line with Apple's measured 4.7× and below Vercel's 6× **[01 §5.1]**.

| Token | px | rem | Fluid value | Line-height | Letter-spacing | Weight | Measure |
|---|---:|---|---|---:|---:|---:|---|
| `--text-caption` | 13 | `0.8125rem` | fixed | 1.4 | `-0.01em` | 400 | `--measure-caption` 48ch |
| `--text-label` | 13 | `0.8125rem` | fixed | 1.3 | **`+0.12em`** | 500 | n/a (single line) |
| `--text-mono` | 13 | `0.8125rem` | fixed | 1.5 | `0em` | 400 | `--measure-mono` 72ch |
| `--text-body` | 16 | `1rem` | fixed | **1.55** | **`-0.011em`** | 400 | `--measure-prose` 42rem / 672px / ~68ch |
| `--text-lead` | 20 | `1.25rem` | fixed | 1.45 | **`0em`** | 400 | `--measure-lead` 30ch (hero) · `--measure-intro` 42ch |
| `--text-h3` | 25 | `1.5625rem` | fixed | 1.3 | **`0em`** | 500 | `--measure-h3` 32ch |
| `--text-h2` | 25 → 31 | `1.5625rem` → `1.9375rem` | `clamp(1.5625rem, 1.5vw + 0.75rem, 1.9375rem)` | 1.2 | `-0.01em` | 500 | `--measure-h2` 28ch |
| `--text-h1` | 31 → 49 | `1.9375rem` → `3.0625rem` | `clamp(1.9375rem, 3vw + 0.5rem, 3.0625rem)` | 1.08 | `-0.02em` | 500 | `--measure-h1` 20ch |
| `--text-display` | 39 → 76 | `2.4375rem` → `4.75rem` | `clamp(2.4375rem, 4.5vw + 0.5rem, 4.75rem)` | **1.05** | **`-0.028em`** | 500 | `--measure-display` 14ch |

Sizes, line-heights and tracking are **[01 §5.1]** verbatim. The 39px step is present only as the `--text-display` clamp floor; it is **never used as a standalone step** (`docs/01` §5.1: "Skipped step: 39px … hold it in reserve"). **No page may use more than five of these steps** — `docs/01` §5.1.

#### Clamp arithmetic, verified

Each middle term carries a **`rem`** component, not a bare `vw`, so browser text-size preference still moves the value. `docs/01` anti-pattern 5 (Resend's `15vw + 0.5rem` idiom) — a pure-`vw` clamp breaks zoom and would be an accessibility bug on a page arguing craft.

| Token | Hits min at | Hits max at |
|---|---|---|
| `--text-display` | ≤ 689px (`0.045V + 8 = 39`) | ≥ 1511px (`0.045V + 8 = 76`) |
| `--text-h1` | ≤ 767px (`0.03V + 8 = 31`) | ≥ 1367px (`0.03V + 8 = 49`) |
| `--text-h2` | ≤ 867px (`0.015V + 12 = 25`) | ≥ 1267px (`0.015V + 12 = 31`) |

`docs/01` §5.1 predicted display would reach 76px at "~1500px viewport" — 1511px confirms the clamp is transcribed correctly.

**Everything at or below `--text-lead` (20px) is fixed.** `docs/01` §5.1: "fluid body text is a net loss." `--text-h3` is **also fixed** at 25px — `docs/01` gave it no clamp, and fixing it keeps the heading/body ratio at a constant **1.5625×** at every viewport, which is what **[03 AP3]** requires (see §1.4).

#### `--text-label` is not a scale step

`--text-label` shares the 13px value of `--text-caption`; it is differentiated by case (uppercase), weight (500) and tracking (`+0.12em`). Positive tracking at a small size is a deliberate exception to Mechanic 1, justified because uppercase settings always require added tracking and Apple's own `eyebrow` class runs `+0.009em` to `+0.011em` **[01 §1]**. **[RAT]**

The current site's `.eyebrow` is accent-coloured (`docs/00` §11). **`--text-label` is `--color-foreground-muted`, never accent** — see the accent allowlist in §3.5. **[DEV-1]**

### 1.3 Letter-spacing crosses zero — Mechanic 1, non-optional

`docs/01` §5.1 calls this "non-optional" and Part 2 Mechanic 1 calls it "the cheapest single upgrade to perceived typographic quality." Reading the tracking column of §1.2 from the bottom up:

```
13px  −0.010em      negative
16px  −0.011em      negative  (most negative in the reading band)
20px   0.000em      ZERO CROSSING
25px   0.000em      ZERO CROSSING
31px  −0.010em      negative again
49px  −0.020em
76px  −0.028em      most negative
```

The crossing sits at **20–25px**, matching Apple (positive in the 21–32px band) and Linear (reaches 0 at 17px) **[01 Mechanic 1]**. We do not go positive in the band, we go to exactly zero — Space Grotesk is already wider-set than SF Pro Text, so the optical correction Apple makes with `+0.004em` is already in the face. **[01→] [RAT]**

### 1.4 The AP3 guard — headings must survive the blur test

**[03 AP3]** requires every heading to be differentiated from adjacent body text by **at least two** of: size ratio ≥1.5×, weight, case, colour, or a rule. Near-monochrome removes colour as a channel, so this system uses **size + weight** and requires both on every heading, at every viewport:

| Heading | Smallest size | Ratio vs `--text-body` (16px) | Weight vs body | Passes AP3 |
|---|---:|---:|---|---|
| `--text-h3` | 25px | **1.563×** | 500 vs 400 | ✅ two channels |
| `--text-h2` | 25px | **1.563×** | 500 vs 400 | ✅ two channels |
| `--text-h1` | 31px | **1.938×** | 500 vs 400 | ✅ two channels |
| `--text-display` | 39px | **2.438×** | 500 vs 400 | ✅ two channels |

This is why `--text-h3` and the `--text-h2` floor are both pinned at 25px rather than allowed to shrink toward 22px on mobile: at 22px the ratio is 1.375× and AP3 would fall to a single channel. **[03 AP3] [RAT]**

**Phase-5 check (from [03 AP3]):** blur the rendered page to illegibility at 1440×900 and at 390×844; the heading rhythm must still read as distinct bands.

### 1.5 Measure and container ladder

| Token | Value | Use |
|---|---|---|
| `--measure-prose` | `42rem` / **672px** / ~68ch | All body copy, every work and project entry, MDX prose. **[01 §5.1]** — matches emilkowal.ski exactly, inside the 640–690px convergence `docs/01` Part 4 measured across antfu (65ch), paco (688px), leerob (640px), brianlovin (640px). |
| `--measure-lead` | `30ch` | The hero claim sentence only. Forces a deliberate break. **[01 §5.1]** (leerob's tight-block value) |
| `--measure-intro` | `42ch` | Section intro paragraphs at `--text-lead`. **[RAT]** |
| `--measure-display` | `14ch` | `--text-display`. |
| `--measure-h1` | `20ch` | |
| `--measure-h2` | `28ch` | |
| `--measure-h3` | `32ch` | |
| `--measure-caption` | `48ch` | Metadata lines, captions. |
| `--measure-mono` | `72ch` | Attestation readout, code blocks. |
| `--container-prose` | `42rem` / 672px | Reading column. |
| `--container-wide` | `48rem` / 768px | Wide blocks (the 3D canvas frame). **[01 §5.1]** |
| `--container-shell` | `64rem` / 1024px | Page shell, header, footer. **[01 §5.1]** — matches Linear's `--page-max-width: 1024px`. |

#### ⚠️ The column classes are `.col`, `.col--prose/--wide/--shell` — **never `.container`**

**`container` is a reserved Tailwind utility name. Do not restore it.** Tailwind 4 generates its own `.container { max-width: 64rem }` into `@layer utilities`, which is declared **after** `@layer components`, where these column rules live. That is a cascade-**layer** inversion, not a specificity one: **no specificity on the component rule can win**, and `:where()`, `!important`-free bumping, longer selectors and `@layer` reordering all fail for the same reason. The build shipped with the old names and **every column on the site rendered at 1024px** — `--prose` 1024 instead of 768, `--wide` 1024 instead of 864, `--shell` 1024 instead of 1120, and the attestation frame at 832×468 instead of 768×432. Renaming the base class is the fix (fix report CRITICAL 2) **[MEAS]**.

A future agent who "tidies" `.col` back to `.container` reintroduces a CRITICAL defect that renders correctly in devtools' source view and wrongly on the page. `src/components/ui/ui.test.tsx` carries a regression guard asserting the emitted class is `col`.

**The token is the content width; the class adds the gutter outside it.** The classes are authored as `max-inline-size: calc(var(--container-X) + var(--gutter) * 2)` with `padding-inline: var(--gutter)`, so the *content box* is exactly the token value at every breakpoint and the outer box is wider. Measured at 1440×900 (gutter 48px): `.col--prose` 768px outer / 672px content, `.col--wide` 864 / 768, `.col--shell` 1120 / 1024. A naive `max-inline-size: var(--container-prose)` **plus** `padding-inline` would subtract the gutter from the measure and give a 576px reading column, which is not the specified measure.

**Containers do not nest.** A `Container` inside a `Container` applies `padding-inline: var(--gutter)` twice and narrows the inner column by `2 × --gutter`. This shipped once (`SelectedWorkSection`, a wide Container inside the Section's own wide Container) and produced a 672px frame where 768px was specified; it was invisible while both were clamped to 1024px. If a block needs the parent's width, use a plain `<div>`.

**One column, one measure, no cards, no grid.** `docs/01` Part 4: this is the single mechanic that makes a dense personal-site hero survivable — "the eye never has to choose a path — there is exactly one, running straight down." This constrains §8's component shapes and is the reason there is no `Card` component in this system.

---

## 2. Spacing

### 2.1 Base unit and ramp

**Base unit: 4px.** **[01 §5.2]** Target adherence ≥85% of all rendered pixel spacing (paco.me measures 86%, Linear 67%, Apple 64% **[01]**). Any off-grid value requires a comment naming the optical reason.

In Tailwind 4 this is one declaration — `--spacing: 0.25rem` in `@theme` generates the entire numeric utility scale (`p-4` = 16px, `gap-6` = 24px, …), so the grid is enforced by the framework rather than by discipline. **[RAT]**

Named steps, matching `docs/01` §5.2's scale `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 144 · 192`:

| Token | px | rem |
|---|---:|---|
| `--space-1` | 4 | `0.25rem` |
| `--space-2` | 8 | `0.5rem` |
| `--space-3` | 12 | `0.75rem` |
| `--space-4` | 16 | `1rem` |
| `--space-6` | 24 | `1.5rem` |
| `--space-8` | 32 | `2rem` |
| `--space-12` | 48 | `3rem` |
| `--space-16` | 64 | `4rem` |
| `--space-24` | 96 | `6rem` |
| `--space-36` | 144 | `9rem` |
| `--space-48` | 192 | `12rem` |

`--space-48` (192px) is declared because `docs/01` lists it, but nothing in this system uses it. It exists so a later agent that needs a larger step reaches for a token instead of typing a number.

### 2.2 Breakpoints

**Two, not five.** **[01 §5.2]**

| Token | Value | Note |
|---|---|---|
| `--breakpoint-md` | `48rem` / **768px** | Tailwind default; `docs/01` §5.2 chose 768/1024 over Apple's measured 734/1068 as "close enough and more conventional for a Next.js codebase." |
| `--breakpoint-lg` | `64rem` / **1024px** | |

Tailwind's `sm`, `xl` and `2xl` breakpoints are **removed** in `@theme` (`--breakpoint-sm: initial;` etc.) so a build agent cannot reach for one. **[RAT]**

Test viewports for Phase 5 are **390×844** and **1440×900**, per **[03 R1]**.

### 2.3 Section padding, exact per breakpoint

| Token | <768px | 768–1023px | ≥1024px | Source |
|---|---:|---:|---:|---|
| `--section-gap` | **72px** | **96px** | **144px** | **[01 §5.2]** — 144px = Apple's `--global-section-padding` and Resend's `py-36`; 96px = Resend's `py-24`; 72px = half of desktop, on the 4px grid |
| `--gutter` | **24px** | **32px** | **48px** | **[01 §5.2]** |
| `--header-height` | **64px** | **64px** | **64px** | **[01 §5.2]** — Linear ships 57/64/65/72; 64 sits on the grid |

**Applied as a gap, not as symmetric padding.** Each `<section>` takes `padding-block-start: var(--section-gap)` only. The final section before the footer additionally takes `padding-block-end: var(--section-gap)` — that is the `Section` component's `isLast` prop and the `.section--last` rule, and `ContactSection` passes it. **The section owns the closing gap; the footer must not carry a `margin-block-start`**, or the gap is declared in two places and one of them will drift. Routes that render a bare `Container` instead of a `Section` (`not-found`, `/writing`, `/writing/[slug]`) supply their own closing gap with `padding-block-end: var(--section-gap)` — not `--space-16`, which is a different number. This is a deliberate implementation rule, not a style preference: **[03 R14]** caps the page at 6 viewport heights, and symmetric `padding-block` would put 288px between every pair of sections at desktop. **[RAT]**

**R14 budget arithmetic [03 R14]:** at 1440×900 the budget is 5400px. Six inter-section gaps at 144px = **864px (0.96 viewports, 16% of budget)**. The hero's top offset is `calc(var(--header-height) + var(--space-12))` = 112px. Phase 3 and Phase 4 have ~4400px of content budget. If a section's content pushes the page past 6 viewports, **content is cut — the gap is not** (**[03 AP2]**: whitespace separates the argument's parts, it does not dilute them).

### 2.4 Intra-section rhythm

Fixed, from `docs/01` §5.2. These are not suggestions; they are the only vertical gaps inside a section.

| Token | px | Between |
|---|---:|---|
| `--rhythm-heading` | **48** | A section heading and its first content block |
| `--rhythm-entry` | **32** | Sibling entries in a list (work entries, project entries) |
| `--rhythm-title` | **16** | An entry title and its description |
| `--rhythm-meta` | **8** | A label and its value; a title and its metadata line |
| `--rhythm-paragraph` | **16** | Consecutive paragraphs inside prose |
| `--rhythm-inline` | **8** | Horizontal gap between inline metadata items |

### 2.5 Radius

The current site ships `--radius: 18px` (`docs/00` §11), which is off the 4px grid and sized for a card system this design does not have. **Replaced.** **[DEV-2]**

| Token | px | Use |
|---|---:|---|
| `--radius-sm` | 4 | Inline `<code>`, the focus ring on small targets |
| `--radius-md` | 8 | Buttons, input fields, the nav sheet |
| `--radius-lg` | 16 | The 3D canvas frame, code blocks |
| `--radius-full` | `9999px` | Nothing currently; declared for the skip link pill |

Reference basis: Linear's published radius set `xs 1 · sm 4 · md 7 · lg 16 · xl 20` **[01 §2 PUB]**; ours rounds 7→8 to stay on the 4px grid.

### 2.6 Elevation

**There are no shadow tokens for content.** Depth is expressed by `--color-surface` / `--color-surface-raised` plus a border. `docs/01` Part 4 finds the strongest personal sites use no cards at all; the current site's `.card` recipe (a gradient plus two shadows, `docs/00` §11) is removed. **[DEV-3]**

Exactly one shadow token exists, for the one element that floats over content:

```
--shadow-overlay: 0 8px 32px rgb(0 0 0 / 0.16);   /* light */
--shadow-overlay: 0 8px 32px rgb(0 0 0 / 0.48);   /* dark  */
```

Scope: the mobile nav sheet, and nothing else. Any other `box-shadow` **rendered on an element** is a defect. Dead `box-shadow` *rules* that Tailwind emits into the stylesheet but no element carries are a separate, lesser problem with its own fix — see §10's `source(none)` note.

#### Amended 2026-09-11 — panels over the attestation field **[DEV-15]**

Direction C's panels are lit objects, and a lit object needs **both halves** of a light source. One narrow exception is added to the DEV-3 rule, and it is narrow on purpose:

> **Panels composited over the attestation field** (`.panel`, the `FieldHud` readout, and the work entries while the field is behind them) may carry `--shadow-panel` **together with** `--edge-lit` and a `::before` hairline gradient. **The two are a pair and neither ships alone.** A drop shadow with no lit edge is the black-shadow-on-near-black failure `docs/11` §3 move 3 names: on `--field-ink` `#0A0908` a black shadow is invisible, so it costs a composite layer and buys nothing. Panels **not** over the field keep the DEV-3 rule and carry no shadow at all.

| Token | Value | Scope |
|---|---|---|
| `--shadow-panel` | `0 40px 100px -50px #000` | `.panel` / `.entry` / the HUD, **only while over the field**. Never on an element on `--color-background` |
| `--edge-lit` | `inset 0 1px 0 #FFFFFF1F` | the **mandatory** companion to `--shadow-panel`. Composites to `#282726` over `--field-ink`, **1.33:1 [MEAS]** — decorative only, and never a boundary that identifies a control (that is `--color-border-interactive`, **4.26:1** over `--field-ink`, §3.7) |

`--shadow-overlay` is unchanged and remains the only shadow permitted anywhere off the field. A `--shadow-panel` rendered without `--edge-lit` on the same element is a defect; so is either token on an element that is not over the field.

### 2.7 Stacking order

**Added in the Phase 5 amendment (design-QA D12).** Three steps, declared in the non-utility `:root` block of §10 — **not** in `@theme`, so the Tailwind token surface stays exactly as §10 prints it and no `z-*` utilities are generated.

| Token | Value | Use |
|---|---:|---|
| `--z-field` | **0** | `AttestationField` / `FieldStage` — the full-bleed generative surface, `position: fixed`, `pointer-events: none`, `aria-hidden`. It is the page's **ground**, so it takes the lowest declared step **[DEV-13]** |
| `--z-grid` | **1** | the blueprint grid layer — above the field, below content in document order, and below the header **[DEV-15]** |
| `--z-header` | **2** | `SiteHeader`, the only `position: sticky` element on the site (§5.3) |
| `--z-skip` | **3** | `SkipLink` — it must paint **above** the sticky header, or the first focusable element on the page is hidden behind the chrome it exists to skip |

**Added 2026-09-11 (DEV-13 / DEV-15):** `--z-field` and `--z-grid`. **There is deliberately no `--z-content` token.** Content is unstyled, sits in normal flow, and therefore paints above `--z-grid` by document order; adding a token for it would invite a `position` declaration that nothing needs. The ordering the page depends on is exactly: field → grid → content (flow) → header → skip link.

There is no `--z-overlay`. The mobile nav sheet is positioned inside the header and inherits its stacking context; it needs no z-index of its own. If a later phase adds an element that overlays content, it reopens this table rather than typing an integer. A bare numeric `z-index` anywhere in the codebase is a defect.

### 2.8 The light source

**New and additive, 2026-09-11. [DEV-15]** `docs/11` §3 move 1: *give the page a light source, and make it a variable.* The finding this implements is that the shipped page has no light source at all — flat fills, black shadows invisible on a near-black ground, hard edges where masks belong. Every lit edge, glow and specular on the page is anchored to **one** origin, declared once.

| Token | Value | Use |
|---|---|---|
| `--light-x` | `50%` | the single light origin, declared on `:root` |
| `--light-y` | `-10%` | off-canvas above the fold, so the page is lit from above |
| `--glow-near` | `#D1A95433` | the hot end of a glow ramp. Composites to `#322917` on `--field-ink` — **1.38:1 [MEAS]**, decorative |
| `--glow-mid` | `#D1A9541F` | the middle stop. Composites to `#221C11` — **1.17:1 [MEAS]**, decorative |
| `--glow-far` | `#D1A95400` | **the only permitted outer stop of a gold glow.** Composites to `#0A0908` — **1.00:1**, i.e. exactly the stage |
| `--grain-opacity` | `0.20` | one grain layer, 20%, under 60% contrast, on its own composited layer |

**Three binding rules.**

1. **Every gold glow fades to `--glow-far` `#D1A95400`, never to `transparent`.** `transparent` is `rgba(0,0,0,0)`; interpolating gold → transparent passes through grey and produces the visible dirty band that `docs/11` §3 move 5 measured on every gradient in the current build. A gradient whose outer stop is the keyword `transparent` is a defect, mechanically checkable.
2. **No shadow without a lit edge.** `--shadow-panel` and `--edge-lit` ship as a pair or not at all (§2.6).
3. **One light origin.** `--light-x` / `--light-y` live on `:root` and nothing on the page reads a second light position. Under `prefers-reduced-motion: reduce` they freeze at their declared defaults; with JS disabled they resolve to those same defaults, so the page is lit identically in all three cases.

**Grain scope.** The CSS grain layer sits over everything **except** the attestation field. The field carries its own grain and ordered dither inside its composite pass, which is where it belongs — a CSS grain layer over an additive surface double-dithers and the banding it was added to remove comes back.

**These are not `@theme` tokens.** They are declared in the non-utility `:root` block of §10, so Tailwind generates no `glow-*` or `light-*` utilities and the token surface stays exactly as §10 prints it.

**Relationship to F7.** §3.5 **F7** forbids gradients "of any kind". That prohibition was written against decorative background gradients used as ornament, and it stands for every surface off the field. A gold glow built from `--glow-near` → `--glow-mid` → `--glow-far` is **not** an exception to F7 at page level: it is permitted only inside the attestation field and on the lit edge of a panel over it, under **A8.1**, which requires the outer stop to be `#D1A95400`. Anywhere else, F7 is unchanged and a gradient is a defect.

---

## 3. Colour

### 3.1 Structure and count

Monochrome base plus **exactly one** accent, both modes fully specified. **[01 §5.3]**

**Per mode: 16 semantic tokens** — 5 neutral foregrounds, **4 surfaces**, 3 alpha borders, accent ×3 (base, hover, tint), accent-foreground ×1.
**Across both modes: 25 distinct hex values + 6 alpha tokens.**

**Amended 2026-09-11 [DEV-14].** The count rose from 15 to 16 per mode and from 20 to 25 distinct hex, for two reasons stated plainly rather than buried: the neutral ladder was **warmed** (every neutral is a new hex, and the light and dark ladders no longer share a single value), and a **fourth surface step, `--color-overlay`**, was added because `docs/11` §5.4's ladder needs a fifth rung between "raised" and the text ramp. A further **9 field-scoped tokens** are declared in **§3.7**; they contribute **5 new hex and 1 new alpha** and are reachable only inside the `.stage` scope, so they are counted separately and are not part of the semantic surface any component may reach for. Whole-system total: **30 distinct hex + 7 alpha**, plus the three glow alphas of §2.8, which are alpha forms of an existing hex rather than new colours.

`docs/01` §5.3 set a target of **≤14 distinct values**. That target is met per-mode but not across both, because the corpus counts it was drawn from (rauno 9, basement.studio 13) are largely single-theme pages. **[DEV-4]** Twenty distinct hex for a fully-specified dual-theme system sits inside `docs/01`'s own band for refined personal sites (9–45) and below paco.me's 35 — and paco.me is also dual-theme. Dropping light mode would put this system at 11.

**DEV-4, restated after the 2026-09-11 amendment.** The figure is now **25 semantic hex + 6 alpha across both modes**, and **30 + 7** counting §3.7's field group. That is still inside `docs/01`'s 9–45 band and still below paco.me's 35 on the semantic count, but the margin is materially thinner and the honest reading is that **light mode is what costs it**: dark-only, this system would be **17 hex + 4 alpha** including the field. `docs/15` §7 R3 puts "this page is dark-only" to the owner as an open question. It is not a build agent's call and it is not decided here.

### 3.2 Light mode

Fully specified and independently measured. Neither mode is a default (§9.2).

**Amended 2026-09-11 [DEV-14] — the four surfaces are warm.** They are Radix `gold` light steps 1–4 **[PKG, via `docs/11` §5.3]**, adopted verbatim. `docs/11` §5.2's finding: *a warm accent on a cold ground reads as a highlighter mark; a warm accent on a warm ground reads as an identity.* The four **text** values and both accent values are unchanged in hex and have been **re-measured against all four new surfaces** — every one of them measures **higher** than it did on the old neutral surfaces, because each new surface is fractionally lighter. The full reprint is §3.6.

| Token | Hex | Role |
|---|---|---|
| `--color-background` | **`#FDFDFC`** | Page background. Radix `gold-1`. **Not pure white** — paco's `--gray-1` is `#fcfcfc`, Resend's is `#fdfdfd`, Vercel's `#fafafa`; `docs/01` Part 2: "a 1–3 point step off white reduces glare and makes true white available as a highlight." Warmed from `#FCFCFC` |
| `--color-surface` | `#FAF9F2` | Radix `gold-2`. Recessed/raised block background: code blocks, the nav sheet, hover fills. Warmed from `#F6F6F6` |
| `--color-surface-raised` | `#F2F0E7` | Radix `gold-3`. Pressed states, chip fills. Warmed from `#EDEDED` |
| `--color-overlay` | **`#EAE6DB`** | **New fifth rung.** Radix `gold-4`. The surface a floating panel sits on. **Scope-restricted — see the binding note below this table** |
| `--color-foreground-strong` | `#0A0A0A` | `--text-display` and `--text-h1` only |
| `--color-foreground` | **`#1A1A1A`** | Primary text. **Not pure black** — `docs/01` §5.3 |
| `--color-foreground-secondary` | `#5C5C5C` | Secondary body copy, nav links at rest |
| `--color-foreground-muted` | **`#696969`** | Metadata, dates, captions, footer |
| `--color-foreground-faint` | `#BDBDBD` | Disabled controls, decorative rules. **Never information-bearing text.** |
| `--color-border` | `#0000001F` | Default divider |
| `--color-border-subtle` | `#00000014` | Hairline inside a surface |
| `--color-border-interactive` | **`#0000006F`** | Any boundary that identifies a control |
| `--color-accent` | **`#7C5E1D`** | Deep gold. See §3.4 |
| `--color-accent-hover` | `#5F4611` | |
| `--color-accent-tint` | `#F7F1DF` | `::selection` background only |
| `--color-accent-foreground` | **`#FFFFFF`** | Text on an accent fill — **white in light mode.** See the inversion warning in §3.4 |

> **Binding — `--color-overlay` is not a body-text surface.** **[MEAS, 2026-09-11]** `--color-foreground-muted` `#696969` measures **4.40:1** on `#EAE6DB` and **fails** WCAG 1.4.3, and `--color-foreground-faint` fails there as it fails everywhere. The permitted foregrounds on `--color-overlay` are `--color-foreground-strong` (15.87:1), `--color-foreground` (13.95:1), `--color-foreground-secondary` (5.36:1), `--color-accent` (4.84:1) and `--color-accent-hover` (7.10:1). **Muted metadata on `--color-overlay` is a defect.** This is the same class of failure DEV-5 caught and is resolved the same way — by measurement, not by assumption. A later pass that genuinely needs muted metadata on this surface must move the token, not lower the bar; **`#5F5F5F`-class values are not offered here because none has been measured** and this document does not print estimates.

`--color-foreground-muted` is **`#696969`, not `docs/01`'s `#8A8A8A`**. **[DEV-5]** `#8A8A8A` measures **3.36:1** on `#FCFCFC` — it fails WCAG 1.4.3 (4.5:1) for the 13–16px metadata it is named for. `#696969` measured 5.35:1 on the old background and, critically, **4.69:1 on the old `--color-surface-raised`**, so muted metadata is still legible inside a raised block. This is a correctness fix, not a taste change. **Re-measured on the warm ladder [DEV-14]: 5.39 / 5.20 / 4.80** on background / surface / surface-raised — every figure improved. It does **not** clear `--color-overlay` (4.40:1), which is why that surface is scope-restricted above.

### 3.3 Dark mode

**Amended 2026-09-11 [DEV-14] — the whole dark ladder is warmed.** Hue held at **41**, saturation **6–8%**, lightness matched to the old steps so nothing about contrast compliance changes materially. Values taken from **`docs/11` §5.4**, which generated and measured them; none is invented here. Nobody will say "the background is brown" at 6% saturation, and the gold stops looking pasted on. The accent hexes are **unchanged**.

| Token | Hex | Was | Role |
|---|---|---|---|
| `--color-background` | **`#0C0B0A`** | `#0A0A0A` | Page background |
| `--color-surface` | `#161513` | `#141414` | |
| `--color-surface-raised` | `#1F1E1C` | `#1C1C1C` | |
| `--color-overlay` | **`#2A2925`** | — | **New fifth rung.** The surface a floating panel sits on. **Scope-restricted — see the binding note below** |
| `--color-foreground-strong` | `#F2EFE8` | `#FCFCFC` | **17.12:1** on background |
| `--color-foreground` | **`#EDE9E1`** | `#EDEDED` | **16.24:1** |
| `--color-foreground-secondary` | `#A8A29A` | `#A8A8A8` | **7.77:1** |
| `--color-foreground-muted` | **`#8C877E`** | `#8A8A8A` | **5.50:1** on background; **4.66:1 on `--color-surface-raised`** — the mandated re-measurement, see below |
| `--color-foreground-faint` | `#423F38` | `#4A4A4A` | Non-text only |
| `--color-border` | `#FFFFFF1F` | unchanged | |
| `--color-border-subtle` | `#FFFFFF14` | unchanged | |
| `--color-border-interactive` | **`#FFFFFF6F`** | unchanged | |
| `--color-accent` | **`#D1A954`** | unchanged | Brand gold, **unchanged from the current site** (`docs/00` §11) |
| `--color-accent-hover` | `#DBBC7A` | unchanged | |
| `--color-accent-tint` | `#241C0B` | unchanged | |
| `--color-accent-foreground` | **`#0C0B0A`** | `#0A0A0A` | Text on an accent fill — **near-black in dark mode.** Follows `--color-background` onto the warm ladder so the closed token set gains no stray hex. **8.90:1** on `--color-accent`. See the inversion warning in §3.4 |

**Rounding convention, so a cross-check does not read as a disagreement.** `docs/11` §5.4 prints these four foreground figures as **17.13 / 16.25 / 7.78 / 5.51**, rounded to nearest. This document's stated method (§0) rounds **down** to 2dp, which gives **17.12 / 16.24 / 7.77 / 5.50**. Same measurement, same inputs, one convention apart. Where the two documents differ by 0.01, this document's figure is the conservative one and is the one to assert against.

> **The `--color-foreground-muted` re-measurement, performed rather than predicted.** `docs/11` §5.4 required this check explicitly and `docs/15` §1.2 predicted ≈4.75:1. **[MEAS]** `#8C877E` on `#1F1E1C` measures **4.66:1** — it **passes** 4.5:1, with less headroom than predicted. The token therefore does **not** move and the candidate `#948F85` is **not** adopted. For the record, if a later pass needs muted metadata on `--color-overlay`, `#948F85` measures **6.11 / 5.67 / 5.17 / 4.52** across the four dark surfaces and is the value to move to; `#8C877E` measures **4.07:1** there and fails.

> **Binding — `--color-overlay` is not a body-text surface, in either mode.** **[MEAS]** `--color-foreground-muted` `#8C877E` measures **4.07:1** on `#2A2925` and fails WCAG 1.4.3. Permitted foregrounds on dark `--color-overlay`: `--color-foreground-strong` (12.67:1), `--color-foreground` (12.02:1), `--color-foreground-secondary` (5.75:1), `--color-accent` (6.59:1), `--color-accent-hover` (7.96:1). Muted metadata on `--color-overlay` is a defect.

Dark `--color-foreground-muted` was **`#8A8A8A`, not `docs/01`'s `#7C7C7C`**. **[DEV-5]** `#7C7C7C` passes on `#0A0A0A` (4.74:1) but measures **4.41:1 on the old `--color-surface`** and 4.08:1 on the old `--color-surface-raised` — it fails the moment metadata sits inside a block. DEV-5's reasoning is unchanged by DEV-14; its value is superseded by `#8C877E`, which clears 4.5:1 on all three of the surfaces DEV-5 tested.

**Borders are alpha over neutral, never a gray value.** `docs/01` Part 2 / anti-pattern 10, brianlovin's `#0000001f` / `#ffffff1f` pattern: "borders stay correct over any background level without a per-level token." §3.6 proves this numerically — one `--color-border-interactive` token clears 3:1 on all three surfaces in both modes.

### 3.4 The accent — gold, in two values

**Decision (site owner, 2026-09-11): the gold identity is preserved. The accent is a two-value gold — `#7C5E1D` light / `#D1A954` dark.** This overrides both `docs/01`'s recommended `#F4622A` and this document's own earlier vermilion proposal; the override record is **[DEV-6]** in §12.

#### The problem the two values solve

| Pair | Ratio | Verdict |
|---|---:|---|
| `#D1A954` on `#0A0A0A` (the pre-DEV-14 dark ground) | **8.97:1** | ✅ excellent |
| `#D1A954` on `#FCFCFC` (the pre-DEV-14 light ground) | **2.15:1** | ⛔ fails 4.5:1 **and** fails 3:1 |
| `#D1A954` on `#0C0B0A` (**DEV-14 dark ground**) | **8.90:1** | ✅ excellent |
| `#D1A954` on `#FDFDFC` (**DEV-14 light ground**) | **2.16:1** | ⛔ still fails both bars |

*The warm ladder moves these figures by 0.07 and 0.01. The reason the accent needs two values is unchanged, and **A8.2 in §3.5 turns on the second row of this table**: `#D1A954` cannot carry emissive weight on a near-white page, so the field brings its own dark stage rather than compromising on contrast.*

`#D1A954` is a light colour (HSL lightness 57.5%). On a near-white page it cannot carry a focus ring **[WCAG 1.4.11]**, a link indicator, or accent text. The failure is confined to light mode — and a per-mode accent value is the normal solution, not an exception: Linear ships `--color-accent-hover` at `#828fff` dark and `#8989f0` light **[01 §2]**.

So the brand hue is kept and the **lightness** is moved per mode. `#D1A954` ships unchanged in dark mode; light mode gets the same hue rendered dark enough to pass on `#FCFCFC`.

#### Choosing the light-mode gold

The site owner proposed `#8A6D1F` (4.77:1 on `#FCFCFC`) and offered `#7D6216` and `#85681A` as alternatives with more headroom. **Measured against all three surfaces the accent can appear on [MEAS]. This is the Phase-2 selection record, taken on the pre-DEV-14 neutral surfaces `#FCFCFC` / `#F6F6F6` / `#EDEDED`; it is kept as written because it is the record of a decision, and the adopted value's figures on the current surfaces are in §3.6.**

| Candidate | on `#FCFCFC` | on `#F6F6F6` | on `#EDEDED` | Hue | Δ from brand |
|---|---:|---:|---:|---:|---:|
| `#8A6D1F` (proposed) | 4.77 ✅ | 4.53 ✅ | **4.18 ⛔** | 43.7° | +2.9° |
| `#85681A` | 5.13 ✅ | 4.87 ✅ | **4.49 ⛔** | 43.7° | +2.9° |
| `#7D6216` | 5.64 ✅ | 5.35 ✅ | 4.94 ✅ | 44.3° | +3.5° |
| **`#7C5E1D` — adopted** | **5.89 ✅** | **5.59 ✅** | **5.16 ✅** | **41.1°** | **+0.3°** |

Two findings drove the substitution, which the owner's message explicitly permits:

1. **`#8A6D1F` and `#85681A` fail on `--color-surface-raised`.** Both clear 4.5:1 on the page background but drop to 4.18:1 and 4.49:1 on `#EDEDED`. Accent text inside a raised block — a code sample, a chip, a pressed control — would fail AA. `--color-accent` must be safe on **every** surface it can land on, not only on the page background.
2. **`#7C5E1D` is the closest hue match to the brand gold of any candidate.** Brand `#D1A954` sits at **40.8°**; `#7C5E1D` sits at **41.1°**, a **0.3° delta**. The three proposed values sit at 43.7–44.3°, a 2.9–3.5° drift — and that drift is *toward yellow-green*, which is the direction the owner's constraint ("recognisably the same gold, not brown or olive") rules out. `#7C5E1D` is HSL(41.1°, 62.1%, 30.0%) against the brand's HSL(40.8°, 57.6%, 57.5%): **same hue, same saturation band, lightness moved.**

Hover values are hue-locked to the brand at **40.8° exactly**: light `#5F4611` (darker, more prominent on a light page), dark `#DBBC7A` (lighter, more prominent on a dark page).

#### ⚠️ `--color-accent-foreground` inverts between modes — read this before building a Button

**The text colour that sits on an accent fill is the opposite of what the mode suggests.** Because the light-mode gold is *dark* and the dark-mode gold is *light*, the foreground flips:

| Mode | Accent fill | ✅ Correct `--color-accent-foreground` | Ratio | ⛔ The intuitive-but-wrong choice | Ratio |
|---|---|---|---:|---|---:|
| **Light** | `#7C5E1D` | **`#FFFFFF`** (white) | **6.04:1** ✅ | `#0A0A0A` (near-black) | **3.28:1** ⛔ |
| **Dark** | `#D1A954` | **`#0C0B0A`** (near-black) | **8.90:1** ✅ | `#FFFFFF` (white) | **2.21:1** ⛔ |

Both accents are the same hue, so an agent eyeballing "gold" will reach for dark text in both modes and ship a **3.28:1** primary CTA in light mode. **Never hard-code the text colour on an accent surface. Always use `var(--color-accent-foreground)`,** which resolves correctly per mode. Hover fills follow the same rule: `#FFFFFF` on `#5F4611` = **8.85:1**; `#0C0B0A` on `#DBBC7A` = **10.75:1**. *(Both figures re-measured on the DEV-14 ladder; the dark near-black moved from `#0A0A0A` to `#0C0B0A`, costing 0.07 and 0.08 respectively against bars cleared by ~2×.)*

Phase-5 check: assert that no element whose background resolves to `--color-accent` or `--color-accent-hover` has a literal colour value — it must be `var(--color-accent-foreground)`.

#### Full accent matrix [MEAS] — reprinted 2026-09-11 against the DEV-14 ladder

| Accent token | Background | Surface | Surface-raised | **Overlay** | Accent-tint | **Field ink** | Text on it |
|---|---:|---:|---:|---:|---:|---:|---|
| light `--color-accent` `#7C5E1D` | 5.93:1 ✅ | 5.72:1 ✅ | 5.29:1 ✅ | 4.84:1 ✅ | 5.35:1 ✅ | — | `#FFFFFF` → **6.04:1** ✅ |
| light `--color-accent-hover` `#5F4611` | 8.70:1 ✅ | 8.39:1 ✅ | 7.75:1 ✅ | 7.10:1 ✅ | 7.84:1 ✅ | — | `#FFFFFF` → **8.85:1** ✅ |
| dark `--color-accent` `#D1A954` | 8.90:1 ✅ | 8.26:1 ✅ | 7.54:1 ✅ | 6.59:1 ✅ | 7.63:1 ✅ | **9.01:1** ✅ | `#0C0B0A` → **8.90:1** ✅ |
| dark `--color-accent-hover` `#DBBC7A` | 10.75:1 ✅ | 9.98:1 ✅ | 9.11:1 ✅ | 7.96:1 ✅ | 9.21:1 ✅ | — | `#0C0B0A` → **10.75:1** ✅ |

Every accent value clears **4.5:1 on every surface in its own mode**, so the accent is safe as body-size text anywhere it is permitted — not merely as a 3:1 indicator. **The weakest figure in the whole set is now `4.84:1`** — light `--color-accent` on the new `--color-overlay` step — down from 5.16:1, because the fourth surface is darker than the three that existed before. Against the three original surfaces every accent figure **improved**: light 5.89→**5.93** / 5.59→**5.72** / 5.16→**5.29**; dark moved by −0.07 / −0.09 / −0.18, the warm ground being a shade lighter than the neutral one. Nothing in the set is within **1.6×** of its bar. The gold decision still costs nothing in contrast, and DEV-14 costs 0.32 of headroom at the single worst pair while adding a surface that did not previously exist.

**The field ink column is not a licence.** It records that `--color-accent` on `--field-ink` measures 9.01:1 as a **static** pair, which is the ceiling, not the shipped condition — the field is an animated composite and its binding measurement is **A8.4** in §3.5, taken on composited pixels at the brightest authored frame. See §3.7.

#### What the darker light-mode gold does cost: the 2px rule

`#7C5E1D` has a relative luminance of **0.1238**, which sits between `--color-foreground-secondary` (0.1070) and `--color-foreground-muted` (0.1413). **In light mode the accent is nearly the same *value* as secondary body text.** *(Unchanged by DEV-14: all three of these are light-mode text values and none of them moved.)* It is distinguished by chroma, not by lightness — and chroma is the weaker channel for peripheral vision, which is what a skimmer uses. The bright vermilion this replaced was separated by value *and* chroma.

**[03 AP5]** depends on the accent working as an attention router, so this is a real cost and it gets a real mitigation, binding:

> **R-GOLD-1.** In light mode, every accent marker — the proof-noun underline (A1), the entry-heading underline (A2), the active-nav marker (A5) — renders at **`2px` minimum**, never `1px`. The accent is distinguished by mass and chroma, not by value.

This applies in dark mode too, for consistency, where the accent is separated by value anyway (luminance **0.4257** against `--color-foreground-secondary`'s **0.3650** — the warm `#A8A29A` is fractionally darker than the neutral `#A8A8A8` it replaced, so DEV-14 **widened** this gap from 0.034 to 0.061 and the dark-mode router is marginally stronger than it was). The 2px rule makes the router function robust in both modes. **[MEAS] [RAT]**

> **R-GOLD-2.** *(Original, superseded below.)* Accent text (A7, the readout marker) may sit only on `--color-background` or `--color-surface`. It may never sit over the hero poster image, whose local luminance is indeterminate.

> **R-GOLD-2, as amended 2026-09-11 [DEV-13].** Accent text (A7, the readout marker) may sit on `--color-background`, `--color-surface`, **or on the attestation field — and over the field only where a `data-scrim` block carves it**, with an **A8.4** measurement on composited pixels as the evidence. The field's local luminance is **no longer indeterminate; it is measured**, which is the whole difference between it and the hero poster image the original clause was written against. Everything else R-GOLD-2 forbade, it still forbids: accent text over `--color-surface-raised`, over `--color-overlay`, over an image, or over any surface whose luminance nobody has measured.
>
> **The HUD readout is A7 re-sited, not a new allowlist row.** `FieldHud` prints the same `verified` marker in the same colour in a new place. It does not add an accent group, and it does not need one.

#### Wide-gamut upgrade

`docs/01` Part 2 bonus mechanic, rauno's `@supports` pattern. Hue- and lightness-matched, chroma-extended:

```css
@supports (color: color(display-p3 1 1 1)) {
  :root                { --accent: color(display-p3 0.47 0.37 0.10);
                         --accent-hover: color(display-p3 0.36 0.27 0.06); }
  [data-theme="dark"]  { --accent: color(display-p3 0.81 0.66 0.30);
                         --accent-hover: color(display-p3 0.85 0.74 0.45); }
}
```

These P3 values are matched in **lightness** to their sRGB counterparts and differ only in chroma. **Contrast is measured on the sRGB hex values; the P3 values are never the basis of a conformance claim.** **[RAT]**

**Correction — the "guaranteed floor" claim, as originally written, was false in dark mode.** On a P3-capable display the P3 value is what renders (measured: every focus ring computes to `color(display-p3 …)`, never the sRGB hex), and converting the rendered P3 to CIE Y gives ratios that are *slightly higher* in light mode and *slightly lower* in dark **[MEAS — `docs/06-review-accessibility` §12]**:

| | sRGB figure quoted in this document | P3 as actually rendered | Δ |
|---|---:|---:|---:|
| light ring on `#FCFCFC` | 5.89 | **5.96** | +0.07 |
| light ring on `#EDEDED` (worst light) | 5.16 | **5.22** | +0.06 |
| dark ring on `#0A0A0A` | 8.97 | **8.86** | **−0.11** |
| dark ring on `#1C1C1C` (worst dark) | 7.72 | **7.63** | **−0.09** |
| light `#FFFFFF` on the accent fill | 6.04 | **6.11** | +0.07 |
| dark `#0A0A0A` on the accent fill | 8.97 | **8.86** | **−0.11** |

**Reprinted 2026-09-11 on the DEV-14 surfaces [MEAS].** Method: Display-P3 component values through the sRGB transfer curve, then the P3→XYZ D65 luminance row `[0.2289746, 0.6917385, 0.0792869]`; sRGB figures by §0's method. The character of the discrepancy is unchanged — light is a hair higher, dark a hair lower, every delta ≤0.11.

| | sRGB figure in §3.6 | P3 as actually rendered | Δ |
|---|---:|---:|---:|
| light ring on `#FDFDFC` | 5.93 | **6.00** | +0.07 |
| light ring on `#EAE6DB` (**new worst light**) | 4.84 | **4.90** | +0.06 |
| dark ring on `#0C0B0A` | 8.90 | **8.80** | **−0.10** |
| dark ring on `#2A2925` (**new worst dark**) | 6.59 | **6.51** | **−0.08** |
| dark ring on `--field-ink` `#0A0908` | 9.01 | **8.90** | **−0.11** |
| light `#FFFFFF` on the accent fill | 6.04 | **6.11** | +0.07 |
| dark `#0C0B0A` on the accent fill | 8.90 | **8.80** | **−0.10** |

The worst pair in the system is now **4.84:1 sRGB / 4.90:1 P3** (light accent on `--color-overlay`) against a 4.5:1 text bar and a 3:1 component bar. That is **1.07×** the text bar, which is thinner than anything this document previously carried and is the one place where §3.4's own instruction — *"any future accent whose margin is thinner must be measured in the gamut it renders in"* — is now live rather than hypothetical. It has been so measured, in both gamuts, and it passes in both.

**The accurate statement:** the sRGB figures are the floor in light mode and are within **0.11** of the rendered value in dark mode, where the bar is cleared by more than **2.5×** regardless. Nothing in this system is within 2.5 points of any threshold, so the discrepancy is immaterial to conformance — but the word *guaranteed* was wrong and is withdrawn. Any future accent whose margin is thinner must be measured **in the gamut it renders in**, not in the sRGB restatement.

### 3.5 Where the accent is ALLOWED and FORBIDDEN

`docs/01` §5.3 (accent ≤3 variants, named role) and **[03 AP5]** (the accent is the only attention-router a near-monochrome page has, so it must be a declared allowlist) point in slightly different directions: `docs/01` forbids accent on any heading, **[03 AP5]** wants accent on the top-three entry headings. **Reconciliation, binding:** the accent appears as an **underline or marker attached to** those elements, never as their text fill. The routing function is achieved; no heading is painted accent.

#### ALLOWED — exhaustive. Anything not on this list is a defect.

**Read the "Form" column as binding, including its rest/hover qualifier.** A1 has no hover qualifier and A2 does; that difference is deliberate and is the subject of the D4 resolution below.

| # | Use | Form | Component |
|---|---|---|---|
| A1 | Proof-noun links in the hero credential sentence (`Splita`, `Cyera`, `Queralt`, `Snorkel AI`, `NYU` — **[03 R3]**) | **2px** underline in `--color-accent` **at rest** (R-GOLD-1), text stays `--color-foreground`. Not hover-gated. | `InlineLink` with `emphasis="proof"` |
| A2 | The artifact heading link on each work entry and project entry | **2px** underline in `--color-accent` **on hover/focus only** (R-GOLD-1); `--color-border-interactive` at rest | `WorkEntry`, `ProjectEntry` (default `InlineLink`) |
| A3 | `:focus-visible` ring, site-wide | 2px solid ring | global |
| A4 | The single primary CTA per viewport (résumé download in nav; the contact block's primary action) | Accent **fill** with **`var(--color-accent-foreground)`** text — never a literal colour (§3.4 inversion). Measured footprint is a button, ~220×44 — see the F4 scale rule. | `Button` variant `primary` |
| A5 | The active nav item | **2px** bottom marker (R-GOLD-1) | `Nav` |
| A6 | `::selection` background | `--color-accent-tint` (never `--color-accent`) | global |
| A7 | The attestation readout's `verified` marker | **one glyph**, `--color-accent`, on `--color-background`, `--color-surface`, or over the field inside a `data-scrim` block (R-GOLD-2 as amended). Measured 8×15px. **A7 licenses one text glyph, not the figure it sits beside** — see F4. `FieldHud`'s marker is this glyph re-sited, not a new row | `AttestationReadout`, `FieldHud` |
| **A8** | **The attestation field** — the single full-bleed generative surface behind the document, and the `AttestationPoster` still that stands in for it | **Emitted light only**, over an unbounded pixel area, subject to **A8.1–A8.6** below. **There is exactly one such surface on the site; a second is a defect.** | `AttestationField`, `FieldStage`, `runtime/scene.ts`, `AttestationPoster` |

#### A8 — the attestation field, and its six binding conditions

**Added 2026-09-11. [DEV-13]** A8 is the only allowlist row that licenses an accent-coloured area larger than a control, and it is fenced by six conditions. **All six bind. A field that fails any one of them is a defect under that condition, not a defect under F4** — the distinction matters, because it tells a fix pass what to change.

##### A8.1 — emitted, never filled

Every accent-coloured pixel in the field must arrive from an **additively blended emitter** — `gl.blendFunc(gl.ONE, gl.ONE)` on a point sprite with its own core-plus-halo falloff — or, on the poster path, from a `<radialGradient>` whose **outermost stop is `#D1A95400`** (`--glow-far`, §2.8). **No flat region of `--color-accent` may exist in the field at any frame.** A uniform fill, a solid polygon, a `background`, a `stroke` at constant alpha, or a gradient with a non-zero outer stop is **still an F4 defect inside the field**. **A8 licenses a light source; it does not license paint.**

##### A8.2 — dark stage in both themes

The field's ground is **`--field-ink` `#0A0908` in light mode and dark mode alike** (§3.7). The field never inherits `--color-background`. The measurement that forces this is in §3.4: `#D1A954` is **2.16:1 on `#FDFDFC`** and cannot carry emissive weight on a near-white page, and `#7C5E1D` does not glow at all. The answer is **structural, not a contrast compromise** — the field is a lit dark stage that the light-mode page enters and leaves, which is what a theatre does.

**Consequence, stated here rather than discovered later:** in light mode the field is therefore **sectioned, not continuous**. It runs at full energy behind `#hero`, `#attestation` and `#ceremony`, and masks out to `--color-background` behind `#work`, `#projects`, `#about` and `#contact`. In dark mode it runs the full document height uninterrupted. This costs the "one continuous surface" reading, in light mode only. The cleaner alternative — that this page is dark-only — is an **owner decision, not a build agent's**; it is open as `docs/15` §7 R3 and recorded in §12.1 F.

##### A8.3 — the scrim carves the composite, not a CSS sheet laid over it

Every text block composited over the field declares **`data-scrim="padX,padY,amount"`**. Those live rects are packed into the composite pass as a rounded-box SDF and **carve darkness out of the field itself**, feathered. This is **not** a flat `rgba()` sheet over the canvas, and the difference is the entire basis of A8.4: **the pixels sampled for the contrast check are the pixels behind the type.** A CSS overlay would measure something other than what renders, which is how a field ships "compliant" and invisible.

##### A8.4 — the measured floor

**≥4.5:1** for every body-size string over the field and **≥3:1** for every large-text string (`--text-h3` and above), measured per A8.3 on **composited pixels at the field's brightest authored frame** — *not* against `--field-ink`, and *not* at a resting frame chosen for being dim. **Ship target: ≥7:1.** The prototype measured **9.3:1** for `--field-fg-secondary` `#B9B4A9` on live composited pixels via `gl.readPixels`; the static pair on `--field-ink` measures **9.62:1** (§3.7), and the composited figure sitting *below* the static one is the expected direction and a useful sanity check — a composited figure *above* it means the probe is sampling the wrong pixels.

**A build that measures below 4.5:1 is a defect in the scrim, not a licence to dim the field.** The remedies, in order: raise the `data-scrim` `amount`, widen its padding, or move the block. Lowering the field's energy is the last resort and dimming the ramp toward grey is not a remedy at all — see the binding instruction below.

##### A8.5 — the field is the ground, not a group

**F9 counts marker, underline and glyph groups.** The field is none of those: it carries no information, it is `aria-hidden="true"`, nothing in it is focusable or interactive, and it is the surface the routers sit **on top of**. It is therefore **excluded from F9's per-viewport count** — a third named exception alongside A3 (the focus ring) and A4 (the primary CTA), and a **narrower** one: A3 and A4 are excluded because each is capped at one occurrence, whereas the field is excluded because **it is the page's substrate and there is exactly one of it.** No other accent-bearing recipe gains anything from this exclusion.

##### A8.6 — poster and canvas change together

§8.4's existing rule stands and now binds harder. **`AttestationPoster.tsx` and the GL scene are one artifact on two surfaces.** A change to the ramp, the point size, the camera, the density or the band count in one that is not made in the other is a defect, and the cross-fade will show it as a visible hue or scale shift. This is the condition that keeps the reduced-motion and no-WebGL paths from inheriting a different design — which is exactly how the 1.44:1 failure reached the accessibility path.

#### ⚠️ Instruction to `review-design-qa` and to any future fix pass — binding

**Read this before filing anything against the field.**

> **The gold field is A8-compliant by design.** Filing it as an **F4** or **F9** defect — or "fixing" it by substituting **`--color-foreground-secondary`**, **`FIGURE_FALLBACK_DARK`** or **`FIGURE_FALLBACK_LIGHT`** into the field's ramp — **is itself the defect.**
>
> **This is not hypothetical. It has already happened, and it is on the record.** F4's original wording sent the point field to `--color-foreground-secondary`, and the lattice shipped at **1.44:1** — which is to say it shipped invisible — across both the live canvas and the poster, because the poster is frame ∞ of the same shader. The design-QA agent that filed it and the fix agent that resolved it both followed this document correctly. **The document was wrong.** A8 is the correction. Re-applying the old rule re-creates the old result.
>
> **What Phase 5's accent enumeration must do instead:** resolve the field to **A8**, then check the two things that can actually be wrong here — **A8.1** (is any pixel of the field a flat fill rather than an emitter?) and **A8.4** (does every string over the field clear its measured floor on composited pixels?).
>
> **`FIGURE_FALLBACK_DARK` and `FIGURE_FALLBACK_LIGHT` are deleted from `src/components/three/constants.ts` by this amendment**, in the same commit as the ramp change, so there is no grey value left in the module for a later pass to reach for. Their nine-line defending comment is deleted with them and replaced by a pointer to DEV-13/A8. **That comment was a correct reading of the pre-amendment document; it is a wrong reading of this one.** If you find it still in the tree, the port is incomplete — do not act on it.
>
> **A grey field is a regression, not compliance.**

#### D4 — resolution of the §3.5 / §8.3 contradiction

**Status: RESOLVED, 2026-09-11. §3.5 A1 is correct. §8.3's `InlineLink` table was wrong and has been amended.**

The contradiction: **A1** above required a 2px accent underline at rest on the hero proof nouns, while **§8.3**'s `InlineLink` state table said *"Rest: 1px underline in `--color-border-interactive`"* for every inline link with no proof variant. Both could not hold. The build followed §8.3, so the hero shipped with no accent router at rest (`docs/06-review-design-qa` D4, measured: `textDecorationColor` = `rgba(0,0,0,0.435)`, the accent bar at `scaleX(0)` in both modes). The fix agent correctly declined to guess and routed it here.

**§3.5 wins, for four reasons:**

1. **§3.5 is normative; §8.3 is derived.** The allowlist declares itself exhaustive and is the contract Phase 5 checks. A component state table that restates it is downstream of it. When a restatement contradicts its source, the restatement is the defect.
2. **The A1/A2 distinction is deliberate and load-bearing**, not an editing slip. A2 carries the words "on hover/focus" and A1 does not, in the same table, one row apart. The reconciliation paragraph immediately above the table exists precisely to satisfy **[03 AP5]**'s demand for accent on the evidence, and §3.4's **R-GOLD-1** names *"the proof-noun underline (A1)"* first among the markers it protects. **F9's own text** — "the hero's proof-noun underlines count as one group" — presupposes underlines that exist at rest; there is nothing to count otherwise.
3. **An independent document reads it the same way.** `docs/05 §1028` specifies the hero's three `InlineLink`s as *"accent underlines, allowlist A1, one accent group F9"*, against `§1042`'s *"A2 — border-interactive at rest, accent on hover"*. Two documents against one table.
4. **The failure §8.3 produced is exactly the one this system was designed to prevent.** At scroll 0 in light mode the R3 proof nouns — the three names the hero exists to carry — had no accent until the mouse touched them. That is the peripheral-vision failure **[03 AP5]** and R-GOLD-1 were written against, and a hover-gated router routes nothing for a reader who is skimming.

**What changed, and where:** §8.3's `InlineLink` now takes `emphasis: "proof" | "default"` (default `"default"`), with `"proof"` giving the 2px accent bar at rest. §8.2's `Hero` passes `"proof"` for the credential-sentence links. **[03 R34]** is satisfied in both variants — the link is identifiable at rest either way, one by a border-interactive underline and one by an accent bar.

**Consequence for F9, resolved here rather than left to the next agent.** Implementing A1 at rest puts two accent-bearing things in the first viewport: the proof-noun underline group *and* the hero's `primary` Button fill (A4). F9's exclusion list has therefore been widened from "the focus ring" to "the focus ring and the single A4 primary CTA fill" — see F9 below for the reasoning and the honest cost.

**This resolution requires a code change this document cannot make.** `InlineLink` has no `emphasis` prop and `globals.css` has no `.link--proof` rule. Until both land, A1 is specified-but-unimplemented and Phase 5's accent enumeration will fail on the hero. Filed for the next code pass.

#### FORBIDDEN — exhaustive, mechanically checkable.

| # | Forbidden |
|---|---|
| F1 | Any body-text fill |
| F2 | Any heading text fill (`h1`–`h6`, `--text-display`) — `docs/01` §5.3 |
| F3 | Borders and dividers — use `--color-border*`; `docs/01` anti-pattern 10 |
| F4 | **Any accent-coloured region larger than a glyph, except the three named exceptions.** See the scale rule below — this is the row that was misread, twice, in opposite directions. **Amended 2026-09-11 [DEV-13]:** the exception list is now **three**, the third being the attestation field (A8) under A8.1–A8.6. |
| F5 | Icon fills by default — `docs/01` §5.3 |
| F6 | `--text-label` / eyebrow text (the current site's `.eyebrow` is accent; it becomes `--color-foreground-muted`) — **[DEV-1]** |
| F7 | Gradients of any kind |
| F8 | Hover states on any element not listed in ALLOWED |
| F9 | **More than one accent-bearing element group per viewport, excluding (a) the focus ring (A3), (b) the single `primary` CTA fill (A4), and (c) the attestation field (A8, added 2026-09-11 — it is the page's ground, not a group; see A8.5).** The hero's proof-noun underlines count as one group. `docs/01` §5.3 says "more than one element per viewport"; this is the version that survives **[03 R3]**'s requirement for ≥3 proper nouns above the fold. **[01→]** |
| F10 | **A `1px` accent marker anywhere.** Violates R-GOLD-1 (§3.4) — the gold accent is separated from body text by chroma, not value, and a hairline loses the routing function. |
| F11 | **A literal colour on an accent fill.** Must be `var(--color-accent-foreground)`; the correct value inverts between modes (§3.4). |

##### F9, and why A4 is now excluded from the count

**Amended by the D4 resolution.** F9 originally excluded only the focus ring. With A1 implemented at rest, the first viewport carries the proof-noun underline group *and* the hero's `primary` CTA fill, which under the old wording is two groups and a defect.

The exclusion is widened rather than A1 abandoned, because **F9 exists to stop the accent becoming texture**, and neither excluded item can become texture:

- **A3, the focus ring**, is transient, keyboard-only, and exists on at most one element at a time.
- **A4, the primary CTA**, is capped at **one per viewport by its own allowlist row**. A rule that is already a hard cap of one does not need a second cap of one applied on top of it; all the original F9 wording achieved was to make A1 and A4 mutually exclusive in the hero, which is not a property anyone chose.

**Amended 2026-09-11 [DEV-13] — the third exclusion, A8.** The field is excluded for a **different reason** than A3 and A4, and the difference is what keeps the exclusion from becoming a loophole:

| Exclusion | Why it cannot become texture |
|---|---|
| **A3**, the focus ring | transient, keyboard-only, at most one element at a time |
| **A4**, the primary CTA | capped at **one per viewport** by its own allowlist row |
| **A8**, the attestation field | it is the page's **substrate**, not an element in the composition. It carries no information, is `aria-hidden="true"`, contains nothing focusable, and the routers sit **on top of** it and are brighter than it is. There is exactly **one** of it, mounted once in `layout.tsx`; **a second field is a defect** |

The old F9 argument against a large gold mass — that it would become the page's largest accent region and out-compete the routers — was written for a **boxed figure on screenful 3**, competing for attention inside the composition. Under this composition the field is the ground and there is nothing for it to compete with. **That is why the exclusion is safe here and would not be safe for anything else.**

**What F9 still forbids, and this is the part that matters:** a *second underline group*, a *second marker set*, an accent eyebrow, accent icons, an accent rule, or any new accent-bearing recipe appearing alongside the one group a viewport is allowed. F9 counts **marker, underline and glyph groups**. A3, A4 and A8 are named exceptions, not a general licence — a **fourth** exception requires reopening this section.

**The honest cost, stated rather than hidden.** The first viewport in light mode now shows three 2px gold underlines plus one gold button. That is more accent above the fold than the original F9 intended, and **[03 AP5]**'s router argument is weakened slightly by every additional accent mass. It is accepted because the alternative — the pre-fix state — had the CTA as the *only* accent in the viewport and the three names the hero exists to carry unrouted, which is the worse failure against the same rule. Phase 5 should verify AP5 empirically with the blur test (§1.4) rather than assume this trade came out right.

##### F4, restated unambiguously — large fills versus glyph-sized marks

**F4 as originally worded — "any background region taller than 24px" — was read as a licence and it produced a HIGH defect.** The 3D attestation poster filled an **830 × 466 px** field with `--color-accent` across 248 `<circle>` elements (`docs/06-review-design-qa` D3). The circles are individually tiny, the fill is a `color` inherited through `fill="currentColor"` rather than a `background`, and no single "region" was "taller than 24px" — so a literal reading of F4 let through the single largest accent mass on the page. That is not what F4 meant.

**The rule, in the form that cannot be misread:**

| Accent mass | Verdict |
|---|---|
| A **glyph-sized mark** — a text character, a 2px underline or marker bar, a single `::after` rule — whose accent-coloured area is on the order of a few hundred px² | **Allowed if and only if it maps to a row in A1–A8.** A7 is one `✓`, measured 8×15 px. A5 is a 2px bar. |
| A **large fill** — any accent-coloured area **exceeding ~2,000 px² in total**, whether it arrives as `background`, `color`, `fill`, `stroke`, a gradient stop, a canvas draw, a shader uniform, or an SVG whose children inherit `currentColor` | **Forbidden**, with exactly **three** exceptions: `--color-accent-tint` as `::selection` (**A6**); the `primary` Button fill (**A4**, ~220×44 = 9,680 px², capped at one per viewport by its own allowlist row); **and the attestation field (A8), under the six conditions A8.1–A8.6.** |

**Three clarifications that close the loopholes the poster used:**

1. **The property does not matter.** `background`, `color`, `fill`, `stroke` and anything a WebGL/Canvas surface paints all count. The question is how many accent-coloured pixels reach the screen, not which declaration put them there.
2. **Aggregate, do not itemise.** 248 gold circles are one 830×466 accent field, not 248 compliant marks. Count the accent mass of a figure, a canvas, or an SVG **as a whole**.
3. **A large accent surface breaks §7.4 as well as F4.** §7.4's proof that the focus ring is safe depends on no accent-coloured region ever surrounding a ring. An accent-filled panel invalidates it and reopens §7.

**~~The correct token for a large figure is a foreground token.~~ Superseded 2026-09-11 by A8 / DEV-13.** The original text of this paragraph read: *"The attestation poster and the live canvas now both read `--color-foreground-secondary` (light `#5C5C5C`, dark `#A8A8A8`; fallbacks `#5C5C5C` / `#A8A8A8`)."* **That instruction is withdrawn, and it is the instruction that produced the 1.44:1 field.** It was a reasonable rule for a boxed figure inside a section; it is the wrong rule for the page's own ground.

**The correct token for the attestation field is `--field-hot`, which references dark `--color-accent`, on the cold→gold→core ramp of §3.7, emitted under A8.1.** For **any other** large figure the original rule stands unchanged: a foreground token, never accent. A8 is a row for **one** surface, named in its Component column, and it does not generalise.

The poster and the canvas **must be changed together** — they are one artifact on two surfaces and must never diverge (**A8.6**). The `✓` in the readout keeps `--color-accent`; that is A7, and A7 is still not a licence for the field — **A8 is**.

**Phase-5 check [03 AP5 / B6], as amended 2026-09-11:** enumerate every element and pseudo-element in the rendered page whose computed `color`, `background-color`, `border-color`, `fill` or `stroke` resolves to `--color-accent`, `--color-accent-hover` or `--color-accent-tint`, in both themes. Each occurrence must map to **A1–A8**; each marker must measure ≥2px; and — **excluding the single A8 field** — the total accent-coloured area must contain no mass larger than the single `primary` CTA.

**The field is enumerated differently, and this is the step that must not be skipped.** It resolves to **A8**, and the checks that apply to it are **A8.1** (every accent pixel is emitted, not filled: no flat region of `--color-accent` at any frame, and every poster gradient's outer stop is `#D1A95400`) and **A8.4** (every string over it clears its floor on composited pixels at the brightest authored frame). **Aggregate px² is not a meaningful measure of a light source and must not be applied to it.** Substituting a foreground token into the field ramp to satisfy the px² rule is the defect — see the binding instruction above.

### 3.6 Full contrast matrix [MEAS] [WCAG 1.4.3 / 1.4.11]

Bar: **4.5:1** for text under 24px (or under 18.66px bold) · **3:1** for large text (≥24px at weight 400 — i.e. `--text-h3` and above) and for UI-component boundaries.

**Reprinted in full 2026-09-11 [DEV-14].** Every cell below was **recomputed** against the warm ladder by §0's method — none is carried over, and the fourth surface column is new. `#FCFCFC` / `#F6F6F6` / `#EDEDED` and `#0A0A0A` / `#141414` / `#1C1C1C` no longer exist as surfaces; the superseded matrix is not reprinted, because §12.1's append rule protects the **record of decisions**, not stale measurements of values that are gone.

#### Light mode

| Foreground | on `--color-background` `#FDFDFC` | on `--color-surface` `#FAF9F2` | on `--color-surface-raised` `#F2F0E7` | on `--color-overlay` `#EAE6DB` | on `--color-accent-tint` `#F7F1DF` |
|---|---:|---:|---:|---:|---:|
| `foreground-strong` `#0A0A0A` | 19.45 ✅ | 18.75 ✅ | 17.34 ✅ | 15.87 ✅ | 17.53 ✅ |
| `foreground` `#1A1A1A` | 17.09 ✅ | 16.49 ✅ | 15.24 ✅ | 13.95 ✅ | 15.41 ✅ |
| `foreground-secondary` `#5C5C5C` | 6.56 ✅ | 6.33 ✅ | 5.85 ✅ | 5.36 ✅ | 5.92 ✅ |
| `foreground-muted` `#696969` | 5.39 ✅ | 5.20 ✅ | 4.80 ✅ | **4.40 ⛔** | 4.86 ✅ |
| `foreground-faint` `#BDBDBD` | 1.84 ⛔ | 1.78 ⛔ | 1.64 ⛔ | 1.50 ⛔ | 1.66 ⛔ |
| `accent` `#7C5E1D` | 5.93 ✅ | 5.72 ✅ | 5.29 ✅ | **4.84 ✅** | 5.35 ✅ |
| `accent-hover` `#5F4611` | 8.70 ✅ | 8.39 ✅ | 7.75 ✅ | 7.10 ✅ | 7.84 ✅ |
| `accent-foreground` `#FFFFFF` on `accent` fill | **6.04** ✅ | — | — | — | — |

#### Dark mode

| Foreground | on `--color-background` `#0C0B0A` | on `--color-surface` `#161513` | on `--color-surface-raised` `#1F1E1C` | on `--color-overlay` `#2A2925` | on `--color-accent-tint` `#241C0B` |
|---|---:|---:|---:|---:|---:|
| `foreground-strong` `#F2EFE8` | 17.12 ✅ | 15.89 ✅ | 14.50 ✅ | 12.67 ✅ | 14.67 ✅ |
| `foreground` `#EDE9E1` | 16.24 ✅ | 15.07 ✅ | 13.75 ✅ | 12.02 ✅ | 13.92 ✅ |
| `foreground-secondary` `#A8A29A` | 7.77 ✅ | 7.21 ✅ | 6.58 ✅ | 5.75 ✅ | 6.66 ✅ |
| `foreground-muted` `#8C877E` | 5.50 ✅ | 5.11 ✅ | **4.66 ✅** | **4.07 ⛔** | 4.72 ✅ |
| `foreground-faint` `#423F38` | 1.87 ⛔ | 1.73 ⛔ | 1.58 ⛔ | 1.38 ⛔ | 1.60 ⛔ |
| `accent` `#D1A954` | 8.90 ✅ | 8.26 ✅ | 7.54 ✅ | 6.59 ✅ | 7.63 ✅ |
| `accent-hover` `#DBBC7A` | 10.75 ✅ | 9.98 ✅ | 9.11 ✅ | 7.96 ✅ | 9.21 ✅ |
| `accent-foreground` `#0C0B0A` on `accent` fill | **8.90** ✅ | — | — | — | — |

**What DEV-14 changed, stated as a ledger rather than a claim.** Light: every figure **rose** (the three warm surfaces are fractionally lighter than the neutrals they replace) — the worst light accent figure improved from 5.16 to **5.29**. Dark: every figure **fell** by 0.07–0.18 for the same reason in reverse, and the worst dark accent figure moved from 7.72 to **7.54**. Neither movement approaches a bar. **The one genuinely new result is `--color-overlay`**, a surface that did not exist before: it fails `--color-foreground-muted` in **both** modes (4.40 light, 4.07 dark) and is scope-restricted in §3.2 and §3.3 accordingly. **The two ⛔ muted cells are the only regressions in this amendment, and they are fenced rather than shipped.**

⛔ = **`--color-foreground-faint` fails 4.5:1 by design.** It is permitted only on (a) disabled controls, which **[WCAG 1.4.3]** exempts as "inactive user interface components," and (b) purely decorative rules that carry no information. A disabled control using it **must** also carry `aria-disabled="true"` and a non-colour cue (see `Button` state table, §8). Using it for any live text is a defect.

#### Borders, alpha-composited [MEAS] [WCAG 1.4.11]

**Recomposited 2026-09-11 against the DEV-14 surfaces and `--field-ink`.** The alpha border tokens themselves are unchanged; what they composite *to* is not.

| Token | over `background` | over `surface` | over `surface-raised` | over `overlay` | over `--field-ink` `#0A0908` |
|---|---|---|---|---|---|
| light `--color-border` `#0000001F` | `#DEDEDD` 1.32:1 | `#DCDBD5` 1.31:1 | `#D5D3CB` 1.31:1 | `#CECAC0` 1.31:1 | — |
| light `--color-border-subtle` `#00000014` | `#E9E9E8` 1.19:1 | `#E6E5DF` 1.19:1 | `#DFDDD5` 1.19:1 | `#D8D4CA` 1.18:1 | — |
| light `--color-border-interactive` `#0000006F` | `#8F8F8E` **3.18:1** ✅ | `#8D8D89` **3.15:1** ✅ | `#898882` **3.11:1** ✅ | `#84827C` **3.08:1** ✅ | — |
| dark `--color-border` `#FFFFFF1F` | `#2A2928` 1.35:1 | `#323130` 1.40:1 | `#3A3938` 1.44:1 | `#444340` 1.47:1 | `#282726` 1.33:1 |
| dark `--color-border-subtle` `#FFFFFF14` | `#1F1E1D` 1.18:1 | `#282726` 1.22:1 | `#31302E` 1.26:1 | `#3B3A36` 1.27:1 | `#1D1C1B` 1.16:1 |
| dark `--color-border-interactive` `#FFFFFF6F` | `#767575` **4.28:1** ✅ | `#7B7B7A` **4.30:1** ✅ | `#81807F` **4.22:1** ✅ | `#878684` **4.00:1** ✅ | `#757474` **4.26:1** ✅ |

**Binding rule.** `--color-border` and `--color-border-subtle` sit far below 3:1 and are permitted **only** on decorative dividers and separators, which **[WCAG 1.4.11]** does not cover. **Any boundary that is required to identify or locate a control — an input field, an outlined button, the nav sheet edge, a `.panel` edge over the field — must use `--color-border-interactive`.** This is the alpha-over-neutral pattern from `docs/01` anti-pattern 10 proved out: one token, ≥3:1 on **every** surface in both modes and on the field stage. The worst figure is **3.08:1** on light `--color-overlay`, which still clears 1.4.11.

**The field column is a floor, not the shipped measurement.** `--field-ink` is the darkest the composite ever gets, so a border composited over it measures at its **best** there. The ceremony's own controls sit inside a `data-scrim` block and their boundaries are measured with the type, under **A8.4**, on the live composite — not from this table. A `--color-border` or `--color-border-subtle` hairline used as a control boundary over the field is a defect twice over: 1.33:1 statically, and worse against a lit frame.

**`--edge-lit` is not a border.** `inset 0 1px 0 #FFFFFF1F` composites to the same `#282726` / 1.33:1 as `--color-border` over the stage. It is the lit half of the §2.6 shadow pair, decorative, and may never be the thing that identifies a control.

### 3.7 The field token group — `--field-*`

**New and additive, 2026-09-11. [DEV-13]** Nine tokens, **dark in both themes**, **field-scoped only**. They exist because A8.2 makes the field a stage rather than a surface of the page, and a stage cannot borrow the page's theme without borrowing the page's contrast problem with it.

| Token | Value | Role | on `--field-ink` **[MEAS]** |
|---|---|---|---:|
| `--field-ink` | `#0A0908` | **the stage ground.** Dark in light mode and dark mode alike (A8.2) | — |
| `--field-cold` | `#3A4655` | entropy / low-energy emitters — the cold end of the ramp | **2.07:1** — decorative emitter, **never text, never a boundary** |
| `--field-hot` | **`= dark `--color-accent`` `#D1A954`** | the gold end of the ramp. **Referenced, never retyped** | **9.01:1** |
| `--field-core` | `#FFF3D2` | the hot core, most-resolved points only | **18.00:1** |
| `--field-fg` | **`= dark `--color-foreground`` `#EDE9E1`** | headings and display type over the field | **16.43:1** |
| `--field-fg-secondary` | `#B9B4A9` | **body copy over the field** — the dimmest string the field must carry | **9.62:1** static; **9.3:1** measured on live composited pixels |
| `--field-fg-muted` | `#9C978C` | the HUD readout, metadata over the field | **6.83:1** |
| `--field-rule` | `#FFFFFF14` | hairlines in the blueprint grid and on panels. Composites to `#1D1C1B` | 1.16:1 — decorative only |
| `--field-panel` | `#FFFFFF05` | the `.panel` surface tint over the stage. Composites to `#0F0E0D` | 1.03:1 — a *lit region*, not a coloured one |

**Two of the nine are references, not new values.** `--field-hot` resolves to dark `--color-accent` and `--field-fg` to dark `--color-foreground`. Retyping either hex is a defect: it is how the poster and the canvas drift apart (**A8.6**), and it is how a future accent change silently stops reaching the field.

**Declaration site.** These are **not** added to `@theme`. They are non-utility tokens in the `:root` block of §10, so Tailwind generates no `field-*` utilities and nothing outside the `.stage` scope can reach them by accident.

**The `.stage` scope, and the failure it exists to prevent.** `.stage` redeclares `--color-foreground`, `--color-foreground-secondary` and `--color-foreground-muted` from `--field-fg*` **for its whole subtree, in CSS, unconditionally — never from JavaScript.** If any part of that is applied by script, a **light-mode visitor with JS disabled gets `#1A1A1A` body copy on `#0A0908`: 1.14:1**, which is worse than the 1.44:1 failure this amendment exists to correct. **[MEAS]** This is the single highest-consequence implementation detail in the field work and it is stated here rather than left to a build agent to infer.

**How these figures relate to A8.4.** Every ratio in the last column is a **static pair against `--field-ink`** — the darkest the composite ever reaches, and therefore the **ceiling**, not the shipped condition. The binding measurement is **A8.4**: composited pixels, brightest authored frame, `gl.readPixels`. The prototype's **9.3:1** for `--field-fg-secondary` sits just below the 9.62:1 static figure, which is the correct direction and the cheapest available sanity check on the probe. *(At full scrim carve the composite floor is `--field-ink` scaled to 34% of its linear value — `#030303` — where the same pair measures **9.98:1**; so the scrim only ever raises contrast, and the binding case is a lightly-carved block at peak energy, which is exactly what A8.4 names.)*

**`--field-cold` is the one token in this document that is below every bar by design and is still permitted.** It is emitted light in a decorative surface that is `aria-hidden` and carries no information — the same exemption class as `--color-foreground-faint`'s decorative rules, and it is bounded the same way: **never text, never a control boundary, never information-bearing.**

---

## 4. Easing

**Three tokens. No fourth.** `docs/01` Mechanic 3: the strongest sites have one curve plus at most two exceptions; paco.me declares 12 Penner curves and uses each exactly once, which `docs/01` anti-pattern 1 names as reading like a copied snippet to an engineer.

| Token | cubic-bezier | Role | Evidence |
|---|---|---|---|
| **`--ease-standard`** | **`cubic-bezier(0.4, 0, 0.2, 1)`** | **DOMINANT.** The default for everything: hover, focus, press, colour change, border change, nav sheet, theme toggle. | **[01 Mechanic 3]** — present in 9 of 13 sites; 100% of Vaul's stylesheet, ~93% of basement.studio's (14 of 15), ~60% of Resend's (67 uses), also Vercel ×8, emilkowal.ski ×8, antfu ×9 |
| `--ease-entrance` | `cubic-bezier(0, 0, 0.2, 1)` | Entrances only — anything appearing that was not there before (section reveals, the nav sheet's first paint). Decelerate-only. | **[01 §5.4]** — Apple ×95, Resend ×9, Vercel ×3, antfu ×2, leerob ×1 |
| `--ease-glide` | `cubic-bezier(0.32, 0.72, 0, 1)` | **One authored moment on the entire site**: the hero attestation's noise→lattice resolve **[02 §6]**. Hard decelerate, long glide, zero overshoot. | **[01 §5.4]** — Linear's signature ×7, also Vercel ×4 and Resend ×4 |

**`docs/01` §5.4 lists a fourth token, `--ease-spring: cubic-bezier(0.45, 1.45, 0.8, 1)`, marked "optional, ≤1 use on the entire site." It is not shipped. [DEV-7]** Reason: this site has no delight moment that needs overshoot, and shipping an unused curve is precisely the anti-pattern `docs/01` documents. If a later phase finds a genuine use, it must reopen this section and add the token — not inline a bezier.

**`ease-in` is forbidden in any form** — CSS keyword, bezier, or JS easing array. Emil Kowalski **[01 §7 PUB]**: "ease-in is not recommended for UI animations because it speeds up at the end." This includes `ease-in-out`; use `--ease-standard`.

**"In any form" includes Tailwind's own defaults, which must be nulled.** Tailwind 4 ships `--ease-in`, `--ease-out`, `--ease-in-out` and `--ease-linear` in its theme layer and emits `.ease-in` / `.ease-out` / `.ease-in-out` utilities the moment its scanner sees those strings anywhere — including inside a **comment** that says the curve is forbidden. The forbidden curve was one class name away from shipping (`docs/06-review-design-qa` D15). All four are set to `initial` in `@theme`, exactly as the unused breakpoints are (§2.2, §10). Nulling makes the ban structural rather than lucky.

**JS form.** The three curves also exist as arrays in **`src/lib/motion/tokens.ts` — the only place they exist in JS**, so the CSS and JS values cannot drift:

```ts
// src/lib/motion/tokens.ts
export const EASE_STANDARD = [0.4, 0, 0.2, 1] as const;
export const EASE_ENTRANCE = [0, 0, 0.2, 1] as const;
export const EASE_GLIDE    = [0.32, 0.72, 0, 1] as const;
```

**There is no JS animation runtime on this site — see §5.4.** These arrays are the token contract and the unit-test surface, not a Framer Motion configuration. Every animation that actually runs is a CSS transition or an `IntersectionObserver` attribute write.

---

## 5. Motion — durations, distances, stagger

### 5.1 Durations

| Token | Value | Applies to | Basis |
|---|---:|---|---|
| `--duration-fast` | **150ms** | Hover, focus ring, link underline, button press, colour/border change | **[01 §5.4]** — corpus mode 150ms ×141; Linear's house value 160ms |
| `--duration-base` | **240ms** | State changes: nav sheet open/close, theme toggle, disclosure | **[01 §5.4]** — Apple's house value ×132 |
| `--duration-reveal` | **280ms** | Section and entry reveals on scroll | **[01→] [03 AP4]** — see below |
| `--duration-ceiling` | **320ms** | **Not a usable token.** A declared hard ceiling for Phase-5 assertion. | **[01 Mechanic 4]** — "a practical ceiling near 320ms" |

**`--duration-reveal` is 280ms, not `docs/01` §5.4's 400ms. [DEV-8]** Two reasons, both sourced:

1. **[03 AP4]** is explicit: "Entrance animations … must complete within 300ms of the element entering the viewport." 400ms violates it.
2. **[03 AP4]** does the arithmetic: fifteen entrance animations at 400ms serialised down a scroll is 6 seconds — 7% of the 90-second budget spent watching opacity. At 280ms the same sequence costs 4.2s; combined with the stagger cap in §5.3 the real figure is far lower.

280ms sits inside `docs/01`'s measured 200–320ms component band (cluster values 200/240/250/300/320) and under Emil Kowalski's published <300ms rule **[01 §7 PUB]**. `docs/01`'s 400ms token is **removed from the system**, not merely unused, so no agent can reach for it.

**Nothing on this site animates longer than `--duration-ceiling` (320ms).** Phase-5 assertion: no computed `transition-duration` or `animation-duration` exceeds 0.32s. The hero attestation resolve is exempt because it is **scroll-scrubbed and has no duration at all** — its progress is `scrollYProgress` written into a ref and read inside the OGL rAF loop **[02 §8.6]**.

### 5.2 Reveal distances

`docs/01` Mechanic 2 measured the corpus: Apple `translateY` 4px ×22 and 8px ×19; Resend 4px ×8 and 16px ×4; Vercel 8px ×2; Linear 1px for press. **"The `translateY(40px)` fade-up that dominates template portfolios appears nowhere in this dataset."**

| Token | Value | Applies to |
|---|---:|---|
| `--reveal-distance` | **8px** | Every section and entry reveal |
| `--reveal-distance-lg` | **16px** | The hero block only (one use on the page) |
| `--press-translate` | **1px** | `:active` on buttons and standalone links |
| `--press-scale` | **0.98** | `:active` on the primary CTA |
| `--hover-lift` | **-2px** | Maximum hover translation anywhere on the site |

**`--reveal-distance` is 8px, not `docs/01` §5.4's 12px. [01→]** Both sit inside `docs/01`'s adopted 4–16px range and on the 4px grid; 8px is the corpus's second-most-frequent measured value (Apple ×19, Vercel ×2) where 12px appears in no site's measured keyframes. `docs/01` chose 12px as "mid-range"; the shorter travel reduces the time content spends mis-positioned, which is what **[03 R30 / AP4]** optimises for.

`--press-scale: 0.98` and `--press-translate: 1px` are `docs/01` §5.4 verbatim (Linear ships `scale(0.97)` **[PUB]** and `translateY(1px)` **[CSS]**).

**Animatable properties: `transform` and `opacity` only.** Never `top`, `left`, `width`, `height`, `margin`, or `box-shadow` **[01 §5.4 PUB]**. Colour and border-colour transitions are permitted at `--duration-fast` — they are paint-only, not layout, and they are how hover reads in a system with no elevation.

### 5.3 Stagger and trigger

| Token | Value | Basis |
|---|---:|---|
| `--stagger-step` | **50ms** | **[01 §5.4]** — Resend's measured `transition-delay` 50ms ×3 / 80ms ×2; Vercel's computed 40.39ms per-index values |
| `--stagger-max-items` | **5** (250ms total envelope) | **[01 §5.4]** — "Beyond 5 items the last one arrives after the reader has already moved on" |
| `--nav-spy-margin` | **`-60%`** | **Added in the Phase 5 amendment (design-QA D11).** See below. |

**Trigger:** reveal when the element's top crosses **85% of viewport height** — `IntersectionObserver` with `rootMargin: "0px 0px -15% 0px"`, `threshold: 0`. Fire **once**, `unobserve` immediately, never reverse. **[01 §5.4]** flags this threshold honestly as a reasoned default, not a measured value from the reference sites; it is adopted as-is. The value lives in JS as `REVEAL_ROOT_MARGIN` in `src/lib/motion/tokens.ts`.

**Two observers, two thresholds — `--nav-spy-margin` is not `--reveal-*`.** This document previously tokenised only the reveal trigger, so the active-nav scroll-spy observer had an untokenised `-60%` bottom margin (`Nav.tsx`, `ACTIVE_BOTTOM_MARGIN`). It is now a named token because they are genuinely different measurements answering different questions, and collapsing them would be a behavioural regression dressed as a cleanup:

| | `REVEAL_ROOT_MARGIN` (`-15%`) | `--nav-spy-margin` (`-60%`) |
|---|---|---|
| Question | "has this element *entered* far enough to be worth revealing?" | "is this section the one the reader is *currently in*?" |
| Fires | once, then `unobserve` | continuously, both directions |
| Semantics | a section stays active until its last 40% has scrolled past the top | |

**Do not reuse the reveal margin here.** At `-15%` a section would stop being "active" almost as soon as its top reached the viewport, and the nav marker would run ahead of the reader. `HEADER_OFFSET_PX = 64` in the same file mirrors `--header-height` and is acceptable as a JS constant: an `IntersectionObserver` config cannot cheaply read a custom property, and the constant carries a doc comment naming its source. The same licence applies to `--nav-spy-margin`; what is forbidden is a bare, unnamed, uncommented literal.

**Backlog rule [03 AP4], binding.** On the observer's first callback, any element already fully above the viewport must be set to its final state **with no transition and no delay**. A fast scroll must never queue a cascade of reveals the reader has already passed. Implementation: set `data-revealed` before the element's transition is registered (toggle a `data-reveal-instant` attribute that sets `transition: none`).

**No pinned sections, no parallax, no scroll-hijacking.** `docs/01` §5.4 — Apple ships only 11 `position: sticky` rules in ~1.6MB of CSS, and leerob.com, a widely respected technical portfolio, ships two easing curves and essentially no motion. **[03 R31]** makes this testable: a wheel gesture, a trackpad flick, `End`, `Cmd+↓` and spacebar must each move the page within one frame; no section may pin for more than 600ms of user time. The only sticky element on this site is `SiteHeader`, at `--z-header` (§2.7).

**Lenis** is kept **[02 §5]** but must be `destroy()`ed under `prefers-reduced-motion` **[02 §8.6]**, and `html { scroll-behavior: smooth }` must **not** be declared in `globals.css` — it fights Lenis (`docs/00` Defect 5). Two amendments to the shipped implementation: Lenis is now **dynamically imported behind the same reduced-motion gate as the 3D chunk**, so a reduced-motion visitor downloads **0 bytes** of it rather than downloading it and destroying it (−3,940 B on the critical path); and Lenis's required base rules (`html.lenis`, `.lenis-smooth`, `.lenis-stopped`) live in §10 block 5, scoped to the `lenis` class that is only added to `<html>` when an instance is actually constructed — so under reduced motion none of them match and native scroll is the whole mechanism (**M12**).

### 5.4 There is no JS animation runtime

**Framer Motion was removed, and it must not come back.** It was installed and mounted, and it animated **nothing**: its only `m` consumer was a component that was never mounted, the reveal system turned out to be pure CSS plus an `IntersectionObserver`, and Lighthouse measured **71.8% of the chunk as unused**. Deleting it and its dead dependencies removed **−29,525 B gzipped** from every page load — the single largest performance win of the fix pass — and changed nothing on screen (`docs/07-fix-report` §2).

**What was deleted:** the `framer-motion` dependency, `MotionProvider` (the `LazyMotion` + `domAnimation` + `strict` boundary), `PageTransition`, and the five Framer-typed specs (`routeTransitionSpec`, `hoverLiftSpec`, `pressSpec`, `pressPrimarySpec`, `navSheetSpec`) that existed only to *describe* CSS `globals.css` already authored. Also dropped: `motion-dom`, `lucide-react` and `class-variance-authority`, none of which had a single reference in `src/`.

**What survives, and is load-bearing — do not delete these while "cleaning up motion":**

| Survivor | Why it is load-bearing |
|---|---|
| The **CSS reveal system** (`.js [data-reveal]` + `data-revealed`, §10 block 7) | This is the actual reveal implementation. It always was. |
| The **`IntersectionObserver`** (`reveal-observer.ts`, `use-reveal.ts`) | Decides *when* the attribute lands. Zero animation cost. |
| **`defineMotionSpec` / `MotionSpec` / `useMotionSpec`** (`src/lib/motion/`) | The type machinery that makes the reduced-motion guarantee **structural**. A new animation cannot compile without a §6.1 row and a stated static end state, and `useMotionSpec` returning `null` is what stops the observer being constructed at all under `prefers-reduced-motion`. |
| **`src/lib/motion/tokens.ts`** | The §4/§5 token values in JS, unit-tested against this document. |

**Where the M4–M9 guarantees now live:** in the `@media (prefers-reduced-motion: reduce)` block of `globals.css` (§10 block 9), per-component, which is where they were always actually enforced — the deleted specs described them but never ran. `src/lib/motion/specs.ts` carries a scope note saying so, so a future agent does not read the shorter file as a gap and "restore" the library to fill it.

**If a future feature genuinely needs JS animation**, it must (a) name the component that will consume it, (b) declare its spec through `defineMotionSpec` with a §6.1 row, and (c) reopen this section. Adding an animation library before a consumer exists is what produced the 29.5 KB.

---

## 6. Reduced motion — substitution table

**This is the mechanically checkable artefact. Every motion token maps to a real static end state.**

`docs/01` §5.4 recommends "set all durations to `0.01ms` and remove all transforms." **That is rejected as the primary mechanism. [DEV-9]** A 0.01ms transition is still a transition: the element still starts at `opacity: 0`, still depends on JS to arrive, and still leaves content invisible if the observer never fires. **[03 R35]** requires "a real layout, not an animation with duration zero," and **[BUILD-PLAN]** requires the reduced-motion path to be a real static state. The blanket rule is retained only as a **safety net** (§6.2).

### 6.1 The table

| # | Motion token / behaviour | Normal behaviour | Reduced-motion **static end state** | Mechanism |
|---|---|---|---|---|
| M1 | Section/entry reveal (`--reveal-distance`, `--duration-reveal`, `--ease-entrance`) | `opacity 0→1` + `translateY(8px)→0` | Element renders at `opacity: 1; transform: none` **in the first paint**. The `data-reveal` attribute is never applied and the IntersectionObserver is never constructed. | CSS: `@media (prefers-reduced-motion: reduce) { [data-reveal] { opacity:1 !important; transform:none !important; transition:none !important } }`. JS: `useReveal()` → `useMotionSpec(revealSpec)` → **`null`** → the observer is never built. The `null` is the spec's declared `reduced` value, so the branch is **structural**, not an `if` someone can forget (§5.4). Measured after: `[data-reveal]` count **0**, zero elements below `opacity: 1`. |
| M2 | Hero block reveal (`--reveal-distance-lg`) | as M1 at 16px | Identical to M1 — hero renders at final state | same |
| M3 | Stagger (`--stagger-step` ×5) | delays 0/50/100/150/200ms | **All delays 0.** Every item at final state in the same paint. | `transition-delay: 0s !important` inside the reduced-motion block |
| M4 | Inline link underline (`scaleX(0)→scaleX(1)`, `--duration-fast`) | underline grows from left on hover/focus | **Underline is permanently present at rest** at `--color-border-interactive`, `scaleX(1)`. Hover/focus changes its **colour** to `--color-accent` with no transition. Information parity is preserved: the link is identifiable at rest either way. | `.link::after { transform: none; background: var(--color-border-interactive) }` |
| M5 | Button press (`--press-scale` 0.98, `--press-translate` 1px) | scales/translates on `:active` | **No transform.** `:active` swaps background to `--color-surface-raised` (secondary/ghost) or `--color-accent-hover` (primary), applied instantly. | reduced-motion block overrides `transform` |
| M6 | Hover lift (`--hover-lift` -2px) | element rises 2px | **No transform.** Hover = `--color-surface` background + `--color-border-interactive` border, applied instantly. | reduced-motion block |
| M7 | Nav sheet open/close (`--duration-base`) | slides + fades in | **Sheet appears at final position and full opacity instantly.** `hidden` attribute toggled; no transition. | `el.hidden` toggle, not opacity |
| M8 | Theme toggle crossfade (`--duration-base`) | colours crossfade | **Instant colour swap.** | reduced-motion block removes the `transition` on `color`/`background-color` |
| M9 | Active-nav marker slide | marker translates between items | **Marker appears under the active item instantly**; no translate. | reduced-motion block |
| M10 | Focus ring appearance (`--duration-fast`) | ring fades in | **Ring appears instantly at full opacity and full width.** Never suppressed, never delayed — **[WCAG 2.4.7]** applies regardless of motion preference. | `transition: none` on `outline` inside the reduced-motion block |
| M11 | Hero 3D attestation resolve (`--ease-glide`, scroll-scrubbed) | point field resolves noise→lattice on scroll | **The OGL chunk is never downloaded.** The server-rendered poster — which is frame ∞ of the same shader at the committed seed **[02 §6]** — is the permanent visual, and the readout renders server-side with the build-time signature. The concept survives without the animation. **Amended 2026-09-11 [DEV-13]: "frame ∞ of the same shader" is the reason A8.6 binds.** Under the pre-amendment rule the poster inherited the field's 1.44:1 failure exactly, so the reduced-motion path was the *worst*-served, not the best. On the §3.7 ramp the still is emissive in its own right — five `<radialGradient>` bands, outer stops at `#D1A95400` — and a reduced-motion visitor loses the resolve, not the idea. | `docs/02 §8.2` Gate 1: reduced-motion is checked **before** the dynamic import, so these users pay **0 KB**. A `matchMedia` `change` listener disposes a live scene and cross-fades back to the poster if the preference is enabled *after* mount |
| M12 | Lenis smooth scroll | eased scroll | **Lenis is never constructed — and, since the fix pass, never downloaded.** Native browser scroll. The `lenis` class is never added to `<html>`, so none of its base rules match. | `SmoothScrollProvider` branches on the reduced-motion preference **before the `import()`**, the same gate shape as M11, so these users pay **0 KB** rather than downloading a library to destroy it (§5.3) |
| M13 | Scroll-linked progress line (if any timeline UI ships) | line grows with scroll | **Line renders at 100% progress** (its completed state). Not 0%, not hidden. | static class |
| M14 | `@supports (animation-timeline: view())` progressive-enhancement reveals **[02 §8.6]** | CSS scroll-driven reveal | The `@media (prefers-reduced-motion: reduce)` block is authored **after** the `@supports` block so it wins the cascade; elements render final. | source order |
| M15 | Any decorative loop, marquee, cursor effect, tilt, or magnetic hover | — | **None exist.** Forbidden by this system (§8.5). The current repo's `ExperienceCard` 3D tilt and `magnetic-dock` are deleted (`docs/00` Defects 6, 7). | n/a |

**Every row's "static end state" is the element's *completed* state, never its starting state.** That is the property Phase 5 checks: render with `prefers-reduced-motion: reduce` and assert that the DOM is visually identical to the fully-animated page at rest, and that **[03 R1–R14]** still pass **[03 R35]**.

### 6.2 The safety net (secondary, not primary)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    animation-delay: 0ms !important;
    transition-duration: 1ms !important;
    transition-delay: 0ms !important;
    scroll-behavior: auto !important;
  }
}
```

This exists so an unaudited animation cannot run. **Shipping a component whose only reduced-motion behaviour is this net is a Phase-5 defect** — every component must additionally declare its M-row end state from §6.1. The distinction matters: the net makes a transition fast; the M-rows make the element *correct without one*.

---

## 7. Focus

### 7.1 Tokens

| Token | Value |
|---|---|
| `--focus-ring-width` | **`2px`** |
| `--focus-ring-offset` | **`2px`** |
| `--focus-ring-color` | **light `#7C5E1D` · dark `#D1A954`** (= `--color-accent`, so it tracks the mode automatically) |
| `--focus-ring-style` | `solid` |

One token set for the whole site, following rauno.me's `--focus-ring: 2px solid var(--colors-focus)` **[01 §5]**.

**This is the token the gold decision stressed hardest, and it came out stronger.** The ring must clear 3:1 against every surface it can appear over, in both modes. Measured **[MEAS]**:

**Re-measured 2026-09-11 against the DEV-14 ladder and the new fourth surface.**

| Mode | Ring colour | on `background` | on `surface` | on `surface-raised` | on `overlay` | Worst case vs the 3:1 bar |
|---|---|---:|---:|---:|---:|---|
| Light | `#7C5E1D` | **5.93:1** | **5.72:1** | **5.29:1** | **4.84:1** | **1.61×** the requirement |
| Dark | `#D1A954` | **8.90:1** | **8.26:1** | **7.54:1** | **6.59:1** | **2.19×** the requirement |

Against the three surfaces a control actually sits on today the worst cases are **5.29:1 light / 7.54:1 dark**; `--color-overlay` has no consumer yet (§12.1 F-2). **A ring over the attestation field is not covered by this table** — it is measured on composited pixels under **A8.4**, alongside the type. See §7.4.

For comparison, the vermilion this replaced bottomed out at 4.86:1, and `docs/01`'s recommended `#F4622A` bottoms out at **2.71:1 on `--color-surface-raised` — an outright fail of [WCAG 1.4.11]**. The two-value gold has more headroom than either. **The ring colour must never be hard-coded**; it resolves through `--color-accent` so the light/dark values can never be transposed.

### 7.2 Global rule

```css
/* `outline` and `outline-offset` ONLY. No `border-radius` — see below. */
:where(a, button, input, textarea, select, summary, [tabindex]):focus-visible {
  outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
:focus:not(:focus-visible) { outline: none; }

/* The one sanctioned suppression. See "The skip target" below. */
main[tabindex="-1"]:focus,
main[tabindex="-1"]:focus-visible { outline: none; }
```

`:focus-visible` only — a mouse click on a button must not paint a ring. **`outline: none` without a replacement indicator is forbidden anywhere in the codebase**, with exactly one exception, stated below.

**`border-radius: inherit` was in this rule and it was a defect. It is removed.** It collapsed every control's corner the instant the control was keyboard-focused: `.skip-link` went from a 9999px pill to a rectangle, `.btn--primary` and `.theme-toggle` from 8px to 0 (`docs/06-review-accessibility` §3, `docs/06-review-design-qa` D20 — measured `border-radius: 8px` at rest, **`0px` while `:focus-visible`**). The cause is a cascade-**layer** inversion, the same class of failure as the `.container` collision (§1.5): every component radius is authored inside `@layer components`, this rule is **unlayered**, and unlayered declarations beat all layered ones regardless of specificity — so even `:where()`'s zero specificity still won, and `inherit` resolved to the flex parent's `0px`. It also bought nothing: `outline` already follows the element's own border-box shape at the offset in every current engine. **Do not add it back.**

**The one sanctioned `outline: none` — `<main tabindex="-1">`.** `<main id="main" tabindex="-1">` exists so the skip link moves focus in every engine and not only Chromium (verified in Chromium, Firefox **and** WebKit; before the attribute, focus stayed on `body` in the other two). But `main` is reached by pressing **Enter**, which is keyboard-initiated, so `:focus-visible` **does** match it — measured `true` in all three engines — and the `[tabindex]` clause above then drew a 2px accent outline around the entire page content. `:focus:not(:focus-visible)` does **not** suppress this, contrary to the intuitive reading.

Suppressing it is correct rather than a waiver: **[WCAG 2.4.7]** governs user interface *components*, and a `tabindex="-1"` reading-position target is not one — it is not in the tab sequence, it cannot be reached except by activating the skip link, and the skip link has its own highly visible focus state (§7.5). The rule is specificity 0,1,1 and unlayered, so it wins without `!important` and cannot spread: it names `main` and the exact attribute value. **Any other `outline: none` is still a defect.**

### 7.3 Conformance

| Criterion | Level | How this spec meets it |
|---|---|---|
| **2.4.7 Focus Visible** | AA | Every interactive element receives the ring; `:focus-visible` fires for keyboard and for programmatic focus. M10 forbids suppressing or delaying it under reduced motion. |
| **1.4.11 Non-text Contrast** | AA | Ring vs the surface behind it, measured **[MEAS]**, re-measured 2026-09-11: light `#7C5E1D` → **5.93** / **5.72** / **5.29** / **4.84**. Dark `#D1A954` → **8.90** / **8.26** / **7.54** / **6.59**. Bar is 3:1; the smallest margin is **4.84:1, 1.61× the requirement** (4.90:1 as rendered in P3, §3.4). **Over the attestation field the ring is measured under A8.4** on composited pixels, not inferred from this row. |
| **2.4.11 Focus Not Obscured (Minimum)** | **AA (new in 2.2)** | `SiteHeader` is sticky at `--header-height: 64px`. Every focusable element and every in-page anchor target carries `scroll-margin-block-start: calc(var(--header-height) + var(--space-4))` = **80px**, so a focused element can never be fully hidden behind the header. The mobile nav sheet is a non-modal disclosure and does not overlay content when closed. |
| **2.4.13 Focus Appearance** | AAA — **specified anyway** | The indicator area is a 2px-thick perimeter at 2px offset, which is **≥ the area of a 2px perimeter of the unfocused component** (the offset adds area, it does not subtract). Contrast of the focus indicator area between its focused and unfocused states is the ring colour against whatever it replaces — the page background: **5.93:1 light / 8.90:1 dark**, against the 3:1 requirement. The worst case over a surface a control sits on, `--color-surface-raised`, is **5.29:1 light / 7.54:1 dark**; over the unused `--color-overlay` step it is **4.84:1 / 6.59:1**. |
| **2.5.8 Target Size (Minimum)** | **AA (new in 2.2)** | Every standalone interactive target is **≥24×24 CSS px**; touch targets are **≥44×44**. Inline links inside prose use the 2.5.8 "inline" exception. Enforced per-component in §8. |
| **3.2.6 Consistent Help** | AA (new in 2.2) | Contact affordances appear in the same order in the header and in `ContactBlock`. |

### 7.4 The accent-fill edge case

The only accent **background** on the page is the `primary` Button (A4). Its focus ring is also accent — but `outline-offset: 2px` places the ring outside the element, so the 2px gap between button and ring is painted by the **page background**, not by the button. The ring therefore measures against `--color-background` (**5.93:1 light / 8.90:1 dark**), not against itself.

This was safe **only because F4 forbade accent backgrounds larger than 24px**, so no accent-coloured region could ever surround a focus ring. §3.5's F4 restatement says so in terms: *"A large accent surface breaks §7.4 as well as F4."*

#### ⚠️ §7 is reopened by A8, as that clause requires — and here is the answer

**A8 (DEV-13) introduces exactly the thing this rule warned about: an accent-bearing surface of unbounded area, which controls can sit over.** The warning is honoured rather than waived, and the resolution has three parts:

1. **The field is never a uniform accent field.** **A8.1** forbids any flat region of `--color-accent` inside it at any frame: every accent pixel is additively emitted with a core-plus-halo falloff, over a `#0A0908` stage, with the bright mass concentrated in sub-pixel-to-few-pixel points. There is no accent-coloured *region* for a ring to be surrounded by, which is the specific geometry §7.4's argument depends on.
2. **Every control over the field sits inside a `data-scrim` block** (**A8.3**), so the pixels immediately around its ring are **carved** — darker than the stage, not brighter. At full carve the composite floor is `#030303` (§3.7), where `#D1A954` measures **9.34:1**.
3. **It is measured, not argued.** A ring over the field is asserted in the **A8.4** harness alongside the type — **≥3:1 on composited pixels at the brightest authored frame** — together with `--color-border-interactive` on the ceremony's controls. §3.6's table is not the evidence for anything over the field, and neither is the 9.01:1 static pair against `--field-ink`.

**What remains forbidden.** An accent-filled *panel* — a flat fill, a solid gradient, a constant-alpha stroke — still breaks §7.4 and is still an F4 defect, **including inside the field**, where A8.1 forbids it independently. A8 is not a precedent for a second accent surface: **A8.5 caps the field at one**, and a fourth F9 exclusion requires reopening §3.5.

### 7.5 Skip link

`SkipLink` is the first focusable element in the DOM. Hidden until focused by translate + `opacity: 0` + `pointer-events: none` (never `display: none` — it must remain focusable). On focus it pins to the top-left inside the gutter with `--color-surface` background, `--color-foreground` text (16.10:1 / 15.74:1), `--radius-full`, `--space-3` / `--space-6` padding, `--z-skip` (§2.7, above the sticky header), and the standard ring. Target: 44×44 minimum.

**It must reveal on `:focus` as well as `:focus-visible`.** `:focus-visible` alone is not sufficient here: programmatic focus — a script calling `.focus()`, or some AT focus modes — does not always satisfy `:focus-visible`, and the link would then be focused, present in the accessibility tree, and **invisible**. The rule is `.skip-link:focus, .skip-link:focus-visible { … }`. This is a deliberate exception to §7.2's `:focus-visible`-only rule and applies to the skip link only; it is safe because the skip link is never reachable by pointer.

---

## 8. Component inventory

Every component the site needs. Nothing outside this list may be built without amending this document.

**Conventions.** `Required` props are marked **bold**. Every component is a Server Component unless marked `'use client'`. States are `default / hover / focus-visible / active / disabled` — a dash means the state does not exist for that component.

### 8.1 Shell and chrome

#### `ThemeScript` — `'use client'`, inline, blocking

| | |
|---|---|
| Props | none |
| Renders | a `<script dangerouslySetInnerHTML>` in `<head>`, ~200 bytes, **synchronous and blocking** |
| Body | reads `localStorage.theme` → falls back to `matchMedia('(prefers-color-scheme: dark)')` → writes `document.documentElement.dataset.theme`; also adds `class="js"` to `<html>` |
| Used by | `RootLayout` only |
| Why | prevents flash-of-wrong-theme (§9) **and** supplies the `.js` hook `docs/02 §8.6` requires for the no-JS reveal guard. One script, two jobs. |

#### `RootLayout`

| | |
|---|---|
| Props | **`children`** |
| Composes | `ThemeScript` → `SmoothScrollProvider` → `ExternalLinkNotice` → `SkipLink` → `SiteHeader` → `<main id="main" tabIndex={-1}>` → `SiteFooter`. **There is no `MotionProvider`** — the `LazyMotion` boundary was deleted with Framer Motion (§5.4). `SmoothScrollProvider` is the only provider. |
| Landmarks | `<header>`, `<main>`, `<footer>`, `<nav aria-label="Primary">` |
| States | — |
| Rules | **[03 R4]** all copy server-rendered; **[WCAG 1.3.1]** landmarks; `tabIndex={-1}` on `<main>` is required for the skip link to move focus outside Chromium (§7.2), and carries the one sanctioned `outline: none` |
| Viewport | **No `viewport-fit=cover`, and therefore no `env(safe-area-inset-*)` anywhere.** These are **halves of one pair**: without `cover`, iOS keeps the page inside the safe area and every `env()` resolves to `0`, so nothing is clipped; the accepted cost is landscape letterboxing on a notched device. Shipping `cover` without the matching `env()` padding clips content behind the notch — a latent CRITICAL. `grep -rn "env(" src/` must return nothing while `cover` is absent, and both must land in the same change. |
| Head | `ExternalLinkNotice` renders exactly once here: a single `hidden` node that every external link points at with `aria-describedby` (§8.3). Never render it per link. |

#### `SkipLink`

| | |
|---|---|
| Props | `href` (default `"#main"`), `label` (default `"Skip to content"`) |
| Variants | — |
| States | default (visually hidden) / focus-visible (revealed, §7.5) |
| Used by | `RootLayout` |

#### `Container`

| | |
|---|---|
| Props | `width: "prose" \| "wide" \| "shell"` (default `"prose"`), **`children`**, `as` (default `"div"`, constrained to `div \| section \| article \| header \| footer \| main \| nav`) |
| Emits | **`col` + `col--{width}`. Never `container` — see §1.5.** A regression guard in `ui.test.tsx` asserts this. |
| Behaviour | `margin-inline: auto`, `inline-size: 100%`, `padding-inline: var(--gutter)`, `max-inline-size: calc(var(--container-{width}) + var(--gutter) * 2)` — so the **content box** is the token value (§1.5) |
| States | — |
| Rules | **Never nest a `Container` inside a `Container`** — the gutter applies twice and the inner column loses `2 × --gutter` (§1.5). Use a plain `<div>` when a block needs the parent's width. |

#### `Section`

| | |
|---|---|
| Props | **`id`**, **`children`**, `width` (passed to `Container`, default `"prose"`), `labelledBy`, `isLast` (default `false`) |
| Behaviour | `<section id aria-labelledby>` with `padding-block-start: var(--section-gap)`; `scroll-margin-block-start: calc(var(--header-height) + var(--space-4))`; `isLast` adds `.section--last` → `padding-block-end: var(--section-gap)` |
| States | — |
| Rules | **[03 R14]** — the gap-not-padding rule of §2.3 lives here; **[WCAG 2.4.11]** scroll-margin. `isLast` is **live, not decorative**: `ContactSection` passes it, and `SiteFooter` therefore carries no `margin-block-start` (§2.3). Declaring the closing gap in both places double-counts it. |

#### `SiteHeader` / `Nav` — `'use client'` (mobile disclosure + active state)

| | |
|---|---|
| Props | **`items: { label: string; href: string }[]`**, **`resumeHref: string \| null`**, `activeId` |
| Height | `--header-height` (64px), sticky at `--z-header` (§2.7), **fully opaque** `--color-background` and a `--color-border-subtle` bottom hairline |
| **No `backdrop-filter`** | The original spec called for `blur(8px)`. It was deleted (`docs/06-review-crossbrowser` §5): the header background is opaque (`#FCFCFC` / `#0A0A0A`, alpha 1.0), so the filter had nothing to blur and painted nothing in any engine — and it was unprefixed, which Safari below 18 drops outright. A frosted header needs a **translucent** background **and** `-webkit-backdrop-filter` alongside the standard property. Never ship one half of that pair. |
| Variants | `desktop` (inline row, ≥768px) · `mobile` (disclosure sheet, <768px) |
| States | link: default `--color-foreground-secondary` / hover `--color-foreground` / focus-visible ring / active — ; **active item**: `--color-foreground` + 2px `--color-accent` bottom marker (**allowlist A5**) |
| Targets | every nav target ≥44×44 **[WCAG 2.5.8]** |
| Motion | sheet open/close `--duration-base` `--ease-standard`; reduced-motion **M7** |
| Rules | **[03 R5]** contact **and** résumé affordances reachable at 0 scroll — both live here as visible links, not hover-revealed; **[03 R24]** if `resumeHref` is `null` the slot still renders as non-interactive text marking it pending — it is never silently omitted. **It is not styled or marked as a disabled control**: see `ResumeAffordance` (§8.3) for the two corrections this needed. **[03 R12]** link text is information-bearing |

#### `ThemeToggle` — `'use client'`

| | |
|---|---|
| Props | none |
| Renders | `<button type="button">` with an icon label and an `aria-label` naming the **target** mode ("Switch to dark theme") |
| **No `aria-pressed`** | It was specified and it was wrong (`docs/06-review-accessibility` §5, **[WCAG 4.1.2]**). An action-phrased name ("Switch to dark theme") plus `aria-pressed` contradict each other: the name says *do this*, the state says *this is on*. The standard theme-switcher pattern is an action-named button with no pressed state, and that is what ships. Removing it also removed an SSR mismatch — the server always emitted `false` while `ThemeScript` may already have resolved dark. |
| State | **None in React.** The icon and the accessible name are selected in CSS off `[data-theme]`, so the control is correct at first paint and cannot mismatch on hydration. The `useState`/`useEffect` pair that used to hold theme state rendered nothing and is gone. |
| States | default / hover `--color-surface` / focus-visible ring / active `--color-surface-raised` / — |
| Behaviour | writes `localStorage.theme` and `document.documentElement.dataset.theme`. A third "system" state is **not** offered — two states, one control. The persisted value **overrides** the system preference until the user toggles again (§9.2). |
| **JS disabled** | **The control is not rendered.** CSS: `.theme-toggle { display: none } .js .theme-toggle { display: inline-flex }`. The `.js` class is added by the same blocking script that sets `data-theme`, so the toggle is present before first paint when JS runs and absent when it does not — no layout shift, and no visible control that cannot function. The page still resolves the correct theme from `prefers-color-scheme` (§9.3). |
| Motion | `--duration-base`; reduced-motion **M8** |
| Target | 44×44 |

#### `SiteFooter`

| | |
|---|---|
| Props | **`contactLinks`**, **`year`** |
| Type | `--text-caption`, `--color-foreground-muted` (**5.39:1 / 5.50:1**, re-measured on the DEV-14 ladder) |
| Links | **`StandaloneLink`, not `InlineLink`.** Footer links are standalone navigational affordances, not links inside a sentence, so the 2.5.8 inline exception does **not** apply. As `InlineLink` they measured **8.6 × 16 px** (the `X` link) against a 24×24 bar; as `StandaloneLink` all four measure **24px**, and **44px** under `@media (pointer: coarse)` **[WCAG 2.5.8]**. |
| Spacing | `padding-block: var(--space-8)`, `border-block-start: 1px var(--color-border-subtle)`. **No `margin-block-start`** — the closing gap belongs to `Section`'s `isLast` (§2.3). |
| States | link states per `StandaloneLink` |
| Rules | **[03 R27]** every outbound profile link present and live; **[03 R26]** the footer is not the only contact surface |

### 8.2 Content components

#### `SectionHeading`

| | |
|---|---|
| Props | **`id`**, **`children`** (the claim — a sentence, not a category label), `level: 2 \| 3` (default `2`), `intro?: string` |
| Type | level 2 → `--text-h2` (25→31px, weight 500, `-0.01em`, `--measure-h2`); level 3 → `--text-h3` (25px, weight 500, `0em`, `--measure-h3`) |
| Colour | `--color-foreground-strong` |
| Spacing | `--rhythm-heading` (48px) below; `intro` at `--text-lead` / `--measure-intro` with `--rhythm-title` (16px) between |
| Accent | **forbidden** (F2) |
| States | — |
| Rules | **[03 R8]** front-loaded load-bearing noun in the first two words; **[03 R9]** the headings-only test; **[03 AP3]** guaranteed by §1.4's size+weight pair. The prop is named `children`, not `title`, and the doc comment on the component states the R8 constraint so a build agent writing `<SectionHeading>Projects</SectionHeading>` is writing something the API told them not to. |

#### `Lede` — the hero claim

| | |
|---|---|
| Props | **`children`** |
| Type | `--text-lead` (20px, 1.45, `0em`), `--measure-lead` (30ch) |
| Colour | `--color-foreground` |
| Rules | **[03 R1]** ≤25 words across the whole first viewport; **[03 R6]** no self-assessment adjectives; **[03 R2]** co-present with any 3D; **[03 R30]** server-rendered, never animation-gated |

#### `Hero`

| | |
|---|---|
| Props | **`name`**, **`claim`** (→ `Lede`), **`credentials`** (rich text containing `InlineLink` proof nouns), **`artifacts`**, **`primaryAction`**, **`secondaryAction`** |
| Type | name at `--text-display` (39→76px, weight 500, `-0.028em`, `--measure-display`), `--color-foreground-strong` |
| Layout | `Container width="prose"`; **`padding-block-start` ONLY** — `calc(var(--header-height) + var(--space-12))` = 112px. **No `padding-block-end`.** A 64px closing pad here stacked on `#work`'s 144px `--section-gap` and rendered a 208px hero→work gap that is not in the spec (design-QA D13). §2.3's gap-not-symmetric-padding rule exists precisely so gaps cannot compound; the hero is the place it is easiest to break. |
| Accent | proof-noun underlines (**A1**, `InlineLink emphasis="proof"`, 2px accent **at rest** — see the D4 resolution in §3.5). This is the hero's one accent *group*; the `primary` CTA below it is A4 and is excluded from the F9 count. |
| LCP | The `h1`, the claim and the credential sentence are **not** wrapped in a `Reveal`. This is the LCP element and no animation may delay the availability of any text **[03 R4, R30]**. `artifacts` and the action row sit below the claim block and may be revealed. |
| Motion | `--reveal-distance-lg` (16px) / `--duration-reveal` / `--ease-entrance`, **opacity+transform on already-present DOM only**; reduced-motion **M2** |
| Rules | **[03 R1, R2, R3, R5, R6, R7, R30]**. `credentials` is a **required** prop, so a hero cannot be built as name-plus-tagline (**[03 R2]**). There is no `tagline` prop and no `eyebrow` prop. |

#### `WorkEntry` — the shape that enforces [03 R21]

The single most constrained contract in this system. **[03 R21]** requires the artifact to be the heading and the role to be metadata; **[03 R11]** requires the mechanism in the first ≤12 words; **[03 R16]** requires an active first-person attribution clause. The prop contract is designed so that building it any other way is *harder* than building it correctly.

```ts
interface WorkEntryProps {
  /** In-page anchor target, e.g. `queralt`. Every entry is linkable. */
  id: string;
  /** R21: the ARTIFACT. Renders as the <h3>. A thing, never a job title.
   *  e.g. "Splita — commit-first group payments" */
  artifact: string;
  /** R19/R20: absolute https:// URL. Required — no entry without an external referent. */
  href: string;
  /** R11: the mechanism, ≤12 words. Renders as the FIRST line of body text,
   *  above the metadata line. What was built, with what, under what constraint. */
  mechanism: string;
  /** R16: active first-person clause naming what HE built. Renders second.
   *  Passive voice and bare "we" are content defects (Phase 5 checks this). */
  contribution: string;
  /** R21: metadata, rendered BELOW the heading and below `mechanism`.
   *  `null`, NOT optional — see the nullability note. */
  role: string | null;
  org: string;
  period: string | null;
  /** Bare domain, e.g. `splita.co`. Fourth metadata item. */
  domain: string;
  /** R15 slot 4. `null` where docs/00 has no sourceable outcome —
   *  the entry must not imply one. */
  outcome?: string | null;
  /** Nested detail, at --text-body inside --measure-prose. */
  children?: React.ReactNode;
}
```

**Amended 2026-09-11 (design-QA D7). `role` and `period` are `string | null`, not `string`; `id` and `domain` are new.** The original contract assumed every entry has a title and a date range. It does not: the Snorkel AI entry ships as `Snorkel AI · snorkel.ai` because `docs/05 §11 Q7/Q8` are unresolved, and the drift is **content-driven and correct**. `null` rather than `?:` is deliberate — an optional prop can be forgotten, a nullable one must be answered, and "we do not have this fact" is an answer the type system should force rather than allow by omission. **A missing fact is omitted from the rendered metadata line; it is never stubbed, never filled with a placeholder, and never invented.**

| | |
|---|---|
| Heading | `--text-h3` (25px, weight 500), `--color-foreground-strong`, wrapped in an `InlineLink` to `href` |
| Mechanism | `--text-body`, `--color-foreground`, `--measure-prose`, immediately under the heading at `--rhythm-title` |
| Contribution | `--text-body`, `--color-foreground`, `--rhythm-paragraph` below mechanism |
| Metadata line | `--text-caption`, `--color-foreground-muted` (**5.39:1 / 5.50:1**), items separated by ` · `, at `--rhythm-meta` |
| Layout | **No card, no border, no background, no icon, no logo.** A row in a single column. `docs/01` Part 4: "no cards, no grid, no icons." Entries separated by `--rhythm-entry` (32px), with a `--color-border-subtle` hairline as a **decorative** accompaniment — see the separator note. |
| Separation | **Carried by the heading and the rhythm, not by the rule.** Corrected 2026-09-11 (`docs/06-review-accessibility` §8). `--color-border-subtle` composites to **1.19:1** on every surface in both modes — it is invisible to a low-vision reader, so a document that calls it "the entry separator" is claiming information the pixel does not carry. What actually separates entries is a **25px / weight-500 `<h3>`** and **32px of whitespace**, which is two channels and satisfies **[03 AP3]** on its own. The hairline is ornament. Promoting it does not help: `--color-border` is only 1.32:1, and **[WCAG 1.4.11]** does not cover decorative separators, so **no code change is required for AA** — the false claim was the defect. Do not "fix" the contrast by inventing a darker separator token; that would put a heavier rule between every entry than the design intends. |
| Variants | none. There is deliberately no `featured` or `compact` variant — **[03 B4.4]** requires the Queralt entry to occupy ≥80% of Splita's vertical space, and a size variant is exactly how that requirement gets quietly broken. |
| States | heading link: default (`--color-border-interactive` underline) / hover (`--color-accent` underline, **A2**) / focus-visible (ring) / active (`--press-translate`) / — |
| Motion | `--reveal-distance` 8px, `--duration-reveal`, `--ease-entrance`, staggered at `--stagger-step` capped at `--stagger-max-items`; reduced-motion **M1/M3** |
| Used by | Selected Work (Splita, Cyera, Queralt, Snorkel AI — `BUILD-PLAN` decision 2) |
| Rules | **[03 R11, R13, R15, R16, R19, R20, R21]** |

**There is no `tags` prop.** **[03 R17]** — technologies appear only inside the entry prose where they were used, and **[03 B4]** names three unconnected tags as "the exact shape of a skill cloud." Protocol nouns (FIDO2, PKI, Entra ID) belong in `mechanism`, inside the first twelve words **[03 B4.1]**.

#### `ProjectEntry`

Same shape as `WorkEntry`, fewer required slots.

```ts
interface ProjectEntryProps {
  /** In-page anchor target. */
  id: string;
  /** The project name + what it is. Renders as <h3>. */
  artifact: string;
  /** Absolute https:// URL. R20. */
  href: string;
  /** ≤12 words, mechanism-first. R11. */
  mechanism: string;
  /** Optional external-standard or repo label rendered in the metadata line. */
  meta?: string;
  children?: React.ReactNode;
}
```

| | |
|---|---|
| Layout | **Row, not card.** The brief calls this a "project card"; it renders as a list row for the reason above. **[DEV-10]** |
| States | as `WorkEntry` |
| Used by | Projects (Splita, the Queralt authentication research, SkyView — `docs/00` §3) |

#### `PostRow`

**Added to this inventory 2026-09-11 (design-QA D6).** It shipped sanctioned by `docs/05 §6` but absent here, and §8 opens with "Nothing outside this list may be built without amending this document" — so the omission was this document's defect, not the build's.

| | |
|---|---|
| Props | **`post: PostSummary`** |
| Shape | A `ProjectEntry`-shaped row for the `/writing` index. No card, no excerpt block, no thumbnail. |
| Type | heading per `ProjectEntry`; metadata per `MetaLine` |
| Used by | `/writing` only |
| Rules | Introduces no token of its own. If it ever needs one, it reopens this section rather than inlining a value. |

#### `RichText`

**Added to this inventory 2026-09-11 (design-QA D6).**

| | |
|---|---|
| Props | **`segments: readonly TextSegment[]`** |
| Behaviour | Renders a `TextSegment[]` into plain text and `InlineLink`s. **A composition helper with no styling of its own** — it owns no token, emits no class, and inherits every type property from its container. |
| Why it exists | Content files describe a credential sentence as data (text + link segments) rather than as JSX, so `docs/05` can own wording while this document owns shape. This is how the hero's proof nouns reach `InlineLink`. |
| Rules | It must stay style-free. The moment it sets a colour, a size or a spacing value it has become a component and must be specified above. |

#### `MetaLine`

| | |
|---|---|
| Props | **`items: string[]`**, `separator` (default `" · "`) |
| Type | `--text-caption`, `--color-foreground-muted` |
| Used by | `WorkEntry`, `ProjectEntry`, `SiteFooter` |
| States | — |

#### `CredentialsLine`

| | |
|---|---|
| Props | **`items: string[]`** |
| Type | `--text-caption`, `--color-foreground-muted`, `--measure-caption` |
| Used by | the About/biography region, **once** |
| Rules | **[03 R22]** grant-shaped credentials (Tyree Fellowship, World Bank Youth Summit) must not appear in the first two screenfuls and must not have a section of their own — this component exists specifically so they have exactly one compact home and no `h2`. **[03 R23]** education is one line here, no GPA, no coursework. |

#### `ContactBlock`

| | |
|---|---|
| Props | **`email: string`** (rendered as selectable plain text), **`links: ContactLink[]`**, `primaryAction` |
| Layout | email as `--text-lead` selectable text **plus** a `mailto:` `InlineLink`; profile links below at `--text-body` |
| States | per `InlineLink` / `Button` |
| Rules | **[03 R25]** plain email as selectable DOM text, not script-obfuscated, surviving a JS-disabled render — so `email` is a plain string prop, not a decoded one; **[03 R26]** never a form alone; **[03 R5]** repeated from the header |

#### `Prose` — MDX styles

Wrapper applying the type system to server-rendered MDX (`BUILD-PLAN` decision 3: pipeline built, section hidden until two real posts exist).

| Element | Token set |
|---|---|
| `p` | `--text-body` / `--color-foreground` / `--measure-prose` / `--rhythm-paragraph` below |
| `h2` | `--text-h2` / weight 500 / `--color-foreground-strong` / `--space-12` above, `--rhythm-title` below |
| `h3` | `--text-h3` / weight 500 / `--color-foreground-strong` / `--space-8` above |
| `a` | `InlineLink` |
| `strong`, `b` | weight **500** (not 700 — `font-synthesis-weight: none`) |
| `em`, `i` | `font-style: italic`, same weight |
| `ul`, `ol` | `--text-body`, marker `--color-foreground-muted`, item gap `--space-2`, indent `--space-6` |
| `blockquote` | `--text-lead`, `--color-foreground-secondary`, `border-inline-start: 2px solid var(--color-border-interactive)`, padding-inline-start `--space-6` |
| `code` (inline) | `--font-mono` / `--text-mono` / `--color-surface` background / `--radius-sm` / `0.15em 0.35em` padding |
| `pre` | `--font-mono` / `--text-mono` / `--color-surface` / `--radius-lg` / `--space-6` padding / `--color-border-subtle` border / **`overflow-x: auto`** / **`tabIndex={0}` + `role="region"` + `aria-label="Code sample"`** |
| `hr` | 1px `--color-border`, `--space-12` block margin |
| `table` | `--text-caption`, `--color-border-subtle` row rules, wrapped in an `overflow-x: auto` container |
| `img` | `max-width: 100%`, explicit width/height, `--radius-lg` |

**A scrollable `<pre>` must be keyboard-reachable [WCAG 2.1.1, Level A].** `overflow-x: auto` alone creates a region a mouse user can scroll and a keyboard user cannot, so `tabIndex={0}` plus a `role`/`aria-label` pair is mandatory — the `tabindex` is what makes it focusable, and without the accessible name it becomes an unlabelled tab stop. Added 2026-09-11 (`docs/06-review-accessibility` §7). **Caveat, recorded rather than hidden:** `src/content/writing/` currently holds only `.gitkeep`, so no post exists to render a code block and this fix has never executed at runtime. It is correct by inspection and untested in fact. The first real post is the test.

**No syntax-highlighting colour palette is defined.** Code blocks render in `--color-foreground` on `--color-surface`, monochrome. Adding a highlighter would add 8–12 hues and break §3.1's count. If Phase 4 wants highlighting, it must reopen §3. **[RAT]**

### 8.3 Interactive primitives

#### `InlineLink`

For links inside a sentence. The 2.5.8 "inline" exception applies, so no minimum target size.

| | |
|---|---|
| Props | **`href`**, **`children`**, `external?: boolean` (default: inferred from `href`), **`emphasis?: "proof" \| "default"` (default `"default"`)** |
| Behaviour | `external` adds `target="_blank" rel="noopener noreferrer"` and `aria-describedby` pointing at the single document-level notice — see the accessible-name note below |
| Type | inherits size; colour `--color-foreground` (**never** accent — F1) |
| Rest — `default` | 1px underline in `--color-border-interactive` (3.19:1 / 4.30:1), `text-underline-offset: 0.2em`, `text-decoration-skip-ink: auto`. The accent bar is `scaleX(0)`. |
| Rest — `proof` | **2px `--color-accent` bar, present at rest** (allowlist **A1**, R-GOLD-1). Text stays `--color-foreground`. |
| Hover / focus | the 2px `--color-accent` bar reaches `scaleX(1)` at `--duration-fast` `--ease-standard` (**A2** for `default`; already present for `proof`); text colour unchanged |
| Focus-visible | standard ring |
| Active | `--press-translate` (1px) |
| Disabled | — |
| Reduced motion | **M4** |
| Rules | **[03 R12]** link text must be information-bearing — banned accessible names: `here`, `link`, `read more`, `click`, `learn more`, `view`, `→`. **[03 R20]** every external `href` matches `^https://`. **[03 R34]** the link is identifiable at rest in **both** variants, not only on hover. |

**`emphasis` was added 2026-09-11 by the D4 resolution (§3.5).** `"proof"` is for the hero credential sentence's proof nouns and nothing else — it is the implementation of allowlist A1, and F9 caps the page at one such group per viewport. `"default"` is A2 and is what every other inline link uses. **Not yet implemented in code**: `InlineLink` has no `emphasis` prop and `globals.css` has no `.link--proof { ::after { transform: none; background: var(--color-accent) } }` rule. Until both land, the hero renders A2 behaviour where A1 is specified.

**The "(opens in a new tab)" notice is a `aria-describedby` DESCRIPTION, not part of the link's name.** It used to be a `VisuallyHidden` span inside the anchor, which made it part of the accessible **name**. Four of these links are the entire content of an `<h3>`, and each `<article>` names itself from that heading via `aria-labelledby` — so the warning leaked into 4 heading texts and 4 region names, where it was simply false (the article opens nothing). It now lives in **one** node, rendered **once** in `RootLayout` (§8.1), that every external link points at:

- The node carries the **`hidden` attribute**, not `.visually-hidden`. The accname spec resolves an `aria-describedby` target even when it is hidden, so the description is still announced on the link — but the node stays out of linear reading **and** out of axe's `region` rule. A `.visually-hidden` span in `<body>` tripped `region` on **16/16** scans; this was caught by measurement, not by reading.
- Measured after: link name `"Splita (opens in a new tab)"` → **`"Splita"`**, description → **`"opens in a new tab"`**. All 4 article names and all 4 heading texts clean.
- **Do not render the notice per link.** One node, one id, `EXTERNAL_LINK_NOTICE_ID`.

#### `StandaloneLink`

A link on its own line acting as a navigational affordance.

| | |
|---|---|
| Props | **`href`**, **`children`**, `external?` |
| Type | `--text-body`, weight 500, `--color-foreground` |
| Target | ≥24×24, ≥44×44 on touch **[WCAG 2.5.8]** |
| States | as `InlineLink`, plus hover adds `--hover-lift` (-2px) |
| Reduced motion | **M4 + M6** |

#### `Button`

| | |
|---|---|
| Props | **`children`**, `variant: "primary" \| "secondary" \| "ghost"` (default `"secondary"`), `as: "button" \| "a"`, `href`, `type`, `disabled`, `size: "md" \| "sm"` (default `"md"`) |
| Sizes | `md`: 44px block size, `--space-6` inline padding, `--text-body`, weight 500, `--radius-md`. `sm`: 32px block, `--space-4` inline, `--text-caption` — **minimum rendered target is still 24×24 [WCAG 2.5.8]** and `sm` is forbidden on touch-primary surfaces |

| Variant | default | hover | focus-visible | active | disabled |
|---|---|---|---|---|---|
| `primary` (**A4** — max one per viewport) | `--color-accent` fill, **`var(--color-accent-foreground)`** text — white on light gold, near-black on dark gold (**6.04:1 / 8.90:1**) | `--color-accent-hover` fill, same variable (**8.85:1 / 10.75:1**) | ring (§7.4) | `--press-scale` 0.98 | `--color-surface-raised` fill, `--color-foreground-faint` text, `aria-disabled="true"`, `cursor: not-allowed` |
| `secondary` | transparent, 1px `--color-border-interactive`, `--color-foreground` text | `--color-surface` fill | ring | `--color-surface-raised` + `--press-translate` | as above |
| `ghost` | transparent, no border, `--color-foreground-secondary` text (**6.56:1 / 7.77:1**) | `--color-surface` fill, `--color-foreground` text | ring | `--color-surface-raised` | as above |

**The `primary` text colour is the single most likely build error in this system.** Both accents are gold, but the correct foreground inverts: white on the light-mode gold, near-black on the dark-mode gold (§3.4). Hard-coding either one ships a **3.28:1** or **2.21:1** CTA in the other mode. Use the variable; F11 makes a literal value a defect.

Disabled state uses `--color-foreground-faint`, which measures **1.84:1 / 1.87:1** on the DEV-14 ladder (was 1.83:1 / 2.23:1) — **permitted only here**, under the **[WCAG 1.4.3]** inactive-component exemption, and only with `aria-disabled="true"` present as the non-colour cue. A `disabled` control must never be the only path to information **[03 R34]**.
Motion: `--duration-fast` `--ease-standard`. Reduced motion **M5**.

**The faint-token licence is narrower than it reads — see `ResumeAffordance`.** It applies to a **real, focusable control** that is genuinely inactive and genuinely announces that fact. It does not extend to anything that merely *looks* disabled.

**Focus does not change the radius.** `.btn` keeps `--radius-md` while `:focus-visible`; §7.2's `border-radius: inherit` that collapsed it to `0px` is deleted.

#### `ResumeAffordance`

**Added to this inventory 2026-09-11 (design-QA D6).** §8.1 placed this behaviour inside `Nav`; extracting it is why the same slot can also appear in the hero and the contact block, which is what **[03 R5]**'s "reachable at 0 scroll" and **[03 R24]**'s "never silently omitted" together require. Three occurrences, one component, one source of truth.

| | |
|---|---|
| Props | none — reads `resumeHref` / `resumeLabel` / `resumePendingLabel` from `src/content/chrome.ts` |
| When `resumeHref !== null` | a `StandaloneLink` reading exactly "Résumé (PDF)" |
| When `resumeHref === null` | a **plain, non-interactive `<span>`** at `--text-body` / **`--color-foreground-muted`** carrying an adjudicated true sentence ("Résumé (PDF) — not yet published") |
| Used by | `Nav`, `Hero`, `ContactBlock` |
| Rules | **[03 R24]** the slot is never omitted. **[03 R34]** it is not a placeholder — the pending string states a fact, it does not stand in for one. Becoming live is a one-line change in `src/content/chrome.ts`; this component needs no edit. |

**Two corrections this slot needed, both worth stating so they are not undone** (`docs/07-fix-report` CRITICAL 3):

1. **`--color-foreground-muted`, never `--color-foreground-faint`.** At faint the string measured **1.83:1 light / 2.23:1 dark** against a 4.5:1 bar — an outright **[WCAG 1.4.3]** failure on the only résumé affordance on the site (**1.84:1 / 1.87:1** on the DEV-14 ladder — no better). Muted measures **5.39:1 / 5.50:1**. The faint token's §3.6 licence is for *inactive user interface components*; a sentence of live, information-bearing text is not one, and a résumé line the reader cannot see is the R24 defect wearing a colour.
2. **No `aria-disabled` on the `<span>`.** A `<span>`'s computed role is `generic`, where ARIA **discards** the attribute — so it exposed nothing to assistive technology while implying to a reviewer that the 1.4.3 inactive-component exemption applied. It claimed the exemption without being the thing the exemption is for. The words "not yet published" are the non-colour cue **[03 R24]** actually asks for.

#### `Reveal` — `'use client'`

The single reveal primitive. **No other component implements its own scroll animation.**

| | |
|---|---|
| Props | **`children`**, `distance: "default" \| "lg"` (default `"default"`), `index?: number` (for stagger), `as` |
| Behaviour | sets `data-reveal`; IntersectionObserver at `rootMargin: "0px 0px -15% 0px"`, `threshold: 0`, fires once, `unobserve`s immediately; sets `data-revealed` |
| Stagger | `transition-delay: calc(min(var(--index), 4) * var(--stagger-step))` — the `min(…, 4)` is the `--stagger-max-items` cap in CSS |
| Backlog | elements already scrolled past on first callback get `data-reveal-instant` → `transition: none` (§5.3) |
| No-JS | styles are scoped to `.js [data-reveal]`, so with JS disabled nothing is ever `opacity: 0` **[02 §8.6] [03 R30]** |
| Reduced motion | **M1/M2/M3** — `useReveal()` → `useMotionSpec(revealSpec)` returns `null`, so the observer is never constructed and `data-reveal` is never written (§5.4) |

### 8.4 The 3D moment

> **Amended 2026-09-11 [DEV-13] — read this before the table below.** This section still describes the **boxed figure**: a 768×432 `aspect-ratio: 16/9` frame inside `#work`, with a `--radius-lg` corner and a `--color-border-interactive` edge. Under `docs/15`, the figure is promoted out of the section and becomes the page's ground — a `position: fixed; inset: 0` host at `--z-field`, mounted once, `pointer-events: none`, `aria-hidden="true"`. **`AttestationFigure` is deleted; `AttestationLive` becomes `FieldStage`; `AttestationField` and `FieldHud` are new.** The contracts that survive unchanged are the ones that matter and they are the ones stated below: **the gate order, `null` as the loading UI, the poster as the fallback for all four failure modes, full teardown, the DPR cap, and the P3 parse hardening.** Two change: the CLS defence is no longer an aspect box (a fixed layer reserves nothing and shifts nothing, so CLS stays 0 by construction), and a **gate 8** is added — a `largest-contentful-paint` `PerformanceObserver` with a 3,000 ms fallback — because the canvas is now above the fold and gate 6 (viewport intersection) therefore defers nothing. **This document owns the tokens and the colour contract; `docs/15` §2 owns the module layout.** Where the two disagree about a component *name*, `docs/15` is current.

**Renamed to the shipped components 2026-09-11 (design-QA D5).** This section originally specified `CanvasFrame`, `CanvasPoster`, `HeroCanvasGate` and `HeroCanvas`. Those names never existed in the tree. Every **contract** they carried — the frame geometry, the gate order, the `null` loading UI, the poster-as-LCP rule — was honoured by components with different names, and the shipped names are better, because the figure is no longer in the hero and calling it `HeroCanvas` would now be a lie. The document was the thing out of date. The names below are the shipped ones and the contracts are unchanged.

| Was specified as | Ships as | Note |
|---|---|---|
| `CanvasFrame` | **`AttestationLive`** | also absorbs the gate |
| `CanvasPoster` | **`AttestationPoster`** | now inline SVG, not `next/image` — see below |
| `HeroCanvasGate` | *(folded into `AttestationLive`)* | all six gates, in the specified order |
| `HeroCanvas` | **`runtime/mount.ts`** + `runtime/scene.ts` | the dynamic OGL chunk |
| `AttestationReadout` | **`AttestationReadout`** | unchanged |
| — | **`AttestationFigure`** | the server-rendered `<figure>` wrapper; new |

#### `AttestationFigure` — Server Component

| | |
|---|---|
| Props | **`alt`**, **`caption: readonly string[]`** |
| Renders | the `<figure>` / `<figcaption>` shell, server-side, composing `AttestationLive` over `AttestationPoster` |
| Layout | **must not wrap itself in a `Container`.** Its call site already sits inside the section's wide column; a second `Container` applies `padding-inline: var(--gutter)` twice and narrows the frame by `2 × --gutter` (§1.5). This shipped, and the frame measured 672px where 768px was specified. |

#### `AttestationLive` — `'use client'` (the frame **and** the gate)

| | |
|---|---|
| Props | **`poster`** (a `ReactNode` — the server-rendered poster), **`fallbackReadout: AttestationReadoutValues`**, **`caption`** |
| Layout | the wide column (768px content box); fixed `aspect-ratio: 16/9`; `--radius-lg`; 1px `--color-border-interactive` (3.19:1 / 4.30:1 — the frame identifies a region, so it takes the interactive token per §3.6) |
| CLS | the aspect box reserves layout before anything loads; the canvas fades in over the poster with **opacity only** → CLS contribution 0 **[02 §6]** |
| Gates, in order | (1) `prefers-reduced-motion` → return, **0 KB downloaded**; (2) `saveData` / `2g`; (3) `hardwareConcurrency < 4` or `deviceMemory < 4`; (4) WebGL2 probe; (5) `requestIdleCallback` (post-LCP); (6) viewport intersection |
| Loading UI | **`null`** — never a spinner. The poster *is* the loading state. **[02 §8.2]** |
| Reduced motion | **M11** — gate 1 sits **before** the `import()`, so these users pay 0 KB |
| Rules | **[03 R32]** the poster is the LCP element, not the canvas; **[02 §6]** exactly one fallback surface for all four failure modes |

#### `AttestationPoster` — Server Component

| | |
|---|---|
| Props | **`alt`** |
| Renders | **inline SVG** — 248 `<circle>` elements in 3 `<g>` bands, carrying `data-attestation-poster`, with `fill="currentColor"` so one `color` declaration drives the whole field |
| Colour | **Amended 2026-09-11 [DEV-13]. Was: `--color-foreground-secondary`, with `FIGURE_FALLBACK_*` constants `#5C5C5C` light / `#A8A8A8` dark, "never `--color-accent`."** That instruction shipped the poster at **1.44:1** and is **withdrawn.** The poster now renders the **§3.7 field ramp** — `--field-cold` → `--field-hot` → `--field-core` — as five `<radialGradient>` bands, one per `POSTER_DEPTH_BANDS`, each a core-plus-halo two-stop **whose outer stop is `#D1A95400`** (**A8.1**). Dark in both themes (**A8.2**). **`FIGURE_FALLBACK_DARK` and `FIGURE_FALLBACK_LIGHT` are deleted from `constants.ts`**, so no grey value remains in the module for a later pass to reach for. **Substituting a foreground token back into this ramp is the defect** — see the binding instruction in §3.5. |
| Note | generated headlessly **from the same lattice function at a committed seed** — never authored by hand **[02 §9]** |
| Alt text | describes the resolved end state, e.g. "A lattice of points resolved from scattered noise into an ordered surface." **[02 §8.1]** |
| Forced colours | the one surface the UA cannot fix for itself, because its colour arrives as an author `color` on an `<svg>` whose circles inherit it. `@media (forced-colors: active) { [data-attestation-poster] { color: CanvasText } }` hands it back to the system palette. The focus ring and `.btn--primary` are already re-coloured correctly by the UA and are deliberately left alone. |

#### The OGL runtime — `runtime/mount.ts`, `runtime/scene.ts`, `runtime/color.ts`, dynamic chunk

The only modules that import `ogl`. Named imports only. Owns full teardown, DPR cap at 1.5, rAF pause on `IntersectionObserver` miss and on `visibilitychange`, `webglcontextlost` → unmount and reveal poster. **[02 §8.3]** Budget: deferred chunk ≤40 KB gz (measured target ~22 KB).

**The poster and the live canvas are one artifact on two surfaces and must be changed together — this is now binding as A8.6.** They read the same tokens through `runtime/color.ts`, **retargeted 2026-09-11 from `--color-foreground-secondary` to the `--field-*` group (§3.7)**. A change to the ramp, the point size, the camera, the density or the band count made in one and not the other is a defect, and the cross-fade shows it as a visible hue or scale shift. This is also the property that let the 1.44:1 failure reach the accessibility path unnoticed: the poster is frame ∞ of the same shader, so a near-invisible canvas produced a near-invisible reduced-motion still. A8.6 is the rule that keeps that coupling working *for* the design instead of against it.

**`parseCssColor` must survive every colour form the token can take.** `--color-foreground-secondary` resolves to `color(display-p3 …)` on a wide-gamut display and to a hex or `rgb()` elsewhere. A float-matching regex without a boundary guard matched the literal `3` inside `display-p3` as the first component — `color(display-p3 .47 .37 .1)` parsed as `[3, .47, .37]`, the red channel clamped to 1.0, the blue channel was discarded, and the lattice rendered **salmon** in all three engines. Two independent defences are required so a future colour form must defeat both: a `(?<![\w.])` boundary on the float pattern, **and** stripping `fn(` plus any leading colour-space keyword before the scan. Unit-tested (`color.test.ts`) against `color(display-p3 …)`, `color(srgb …)`, `rgb()`, `rgba()`, slash-alpha, both spellings of the leading dot, and both documented sRGB hexes.

#### `AttestationReadout` — Server Component

| | |
|---|---|
| Props | **`alg`**, **`short`**, **`ms`** (i.e. `AttestationReadoutValues`), `className?` |
| Type | `--font-mono` / `--text-mono` (13px, 1.5, `0em`) / `--color-foreground-muted` |
| Accent | **the `verified` marker glyph only (A7)** — one character, measured 8×15px. A7 licenses this glyph and nothing else *in the readout*. **Amended 2026-09-11:** the clause that followed — *"the point field is `--color-foreground-secondary`"* — is **withdrawn**; the field is licensed separately and in its own right by **A8** (§3.5), on the §3.7 ramp. A7 and A8 are independent rows and neither is evidence about the other. |
| Renders | server-side with the build-time signature, so the concept survives with JS off **[02 §6]** |
| Copy constraint | states algorithm, truncated signature and verify time only — **never** implies encryption or a security guarantee **[02 §9]** |

#### `VisuallyHidden`

| | |
|---|---|
| Props | **`children`**, `as` |
| Behaviour | clip-path technique, remains focusable and readable by AT; never `display: none` |

### 8.5 Components this system deliberately does NOT provide

Listed so a Phase-4 agent finds a refusal rather than a gap, and so Phase 5 can treat their appearance as a defect.

| Not provided | Why |
|---|---|
| `Tag` / `Chip` / `Badge` | **[03 R17]** — no skill clouds, no tag soup. Technologies live in `mechanism` prose. **[03 B4]** — three unconnected tags *is* a skill cloud. |
| `Card` | `docs/01` Part 4 — the personal sites that work use one column, no cards. Also removes the current site's gradient+shadow `.card` recipe (`docs/00` §11). |
| `SkillBar` / `ProficiencyRing` / `StatCounter` | **[03 R17, R18]** |
| `LogoGrid` | **[03 R17]** — a logo grid presented as an inventory. The ten logos in `public/logos/` (`docs/00` §7) are not used as a grid. |
| `GitHubActivity` / contribution graph | **[03 R28]** — GitHub is linked, never featured |
| `Marquee`, `CustomCursor`, `MagneticDock`, `TiltCard` | **[03 F5, R34]**; `docs/00` Defects 6 and 7 delete the existing `magnetic-dock.tsx` and the `ExperienceCard` tilt |
| `Modal` / `Dialog` | Nothing on this page needs one, and a modal is the fastest way to violate **[WCAG 2.4.11]** |
| `Accordion` / `Disclosure` for content | **[03 R11, B3/B4]** — nothing scrolls or expands to reveal a mechanism; the only disclosure on the site is the mobile nav |
| `Toast` / `Tooltip` | **[03 R34]** — no information may live only in a transient or hover-revealed surface |
| `PageTransition` / `MotionProvider` / any route-transition wrapper | **Built, never mounted, deleted 2026-09-11.** They existed to animate route changes on a site whose only route change is to `/writing`, and between them they carried a 29.5 KB animation library that animated nothing (§5.4). A route transition also delays first paint of the destination, which is the opposite of **[03 R4]**. |
| Any JS animation library | §5.4. A library may not be added before a named consumer exists, and the consumer must declare a `defineMotionSpec` with a §6.1 row. |
| An icon library | `lucide-react` was installed for four icons, referenced **zero** times in `src/`, and removed. Icons that ship are inline SVG. `class-variance-authority` went the same way. |

---

## 9. Theme switching — light and dark, neither imposed

### 9.1 Mechanism — attribute **and** media, attribute wins

```
1.  <html data-theme="light" | "dark">      ← ThemeScript, before first paint. An explicit user choice.
2.  @media (prefers-color-scheme: dark)     ← the OS preference. The ONLY path when JS is off.
      scoped to :root:not([data-theme="light"])
3.  :root                                   ← light values, as the cascade's base declaration only.
```

**`data-theme` on `<html>`, not a `.dark` class.** It expresses three states cleanly (`light`, `dark`, absent-because-no-JS) where a class expresses two, and it does not collide with the `.js` class the reveal system needs **[02 §8.6]**.

Tailwind 4 is told about it with a custom variant, not a JS config:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

Because every colour is a semantic CSS variable that already swaps at `:root`, the `dark:` variant is needed almost nowhere — it exists for the handful of cases (an SVG fill, a `mix-blend-mode`) where a variable cannot reach.

### 9.2 There is no default mode — the system preference decides

**Decision (site owner, 2026-09-11): neither mode is imposed. `prefers-color-scheme` decides on a first visit; a manual toggle overrides it and persists.** Both modes are first-class: each has a complete, independently verified palette (§3.2, §3.3), each has its own accent value and its own accent-foreground (§3.4), and every contrast ratio in §3.6 was measured per mode rather than derived from the other.

**What "no default" means mechanically.** CSS requires *some* declaration block to come first — a custom property cannot be undefined. `:root` therefore carries the light **value set** as the base declaration. That is a cascade requirement, not a preference: a visitor whose OS reports `prefers-color-scheme: dark` never sees those values, because both the attribute path and the media path override them before first paint. No user receives a mode their system did not ask for.

**Precedence, highest first:**

1. `[data-theme]` on `<html>` — written by `ThemeScript` from `localStorage.theme`. An explicit user choice.
2. `@media (prefers-color-scheme: dark)` scoped to `:root:not([data-theme="light"])` — the OS preference, and the only path when JS is unavailable.
3. `:root` light values — the cascade's base declaration.

Rule 2's `:not([data-theme="light"])` guard is what makes an explicit *light* choice stick on a dark-preferring machine. Without it the media query would beat the attribute on specificity and the toggle would appear broken in exactly one direction.

**Why this rather than picking a side:** **[03]**'s reader is a recruiter on an unknown machine at an unknown hour. Imposing either mode overrides a preference they already expressed at the OS level, and doing so on a page whose argument is craft is the wrong first impression. The current site is dark-only (`docs/00` §11), which is the version of this mistake that already exists.

**Print forces light regardless of mode** (§9.5), which is what **[03 R29]** requires.

### 9.3 No flash of wrong theme

`ThemeScript` is a **synchronous, blocking, inline** `<script>` in `<head>`, rendered before any stylesheet-dependent paint. It sets `data-theme` on `document.documentElement`, so the correct custom-property block is already matching when the first paint happens.

```js
(function(){try{var s=localStorage.getItem("theme");
var d=s==="dark"||(!s&&matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}
document.documentElement.classList.add("js");})()
```

- **Blocking is correct here.** It is ~200 bytes of parse; deferring it is exactly what causes the flash.
- `try/catch` covers `localStorage` throwing in a private window or under a blocked-site-data setting; on throw, `data-theme` is never written, the media path (precedence 2) takes over, and `.js` is still added outside the `try` so the reveal system and the theme toggle still work.
- `<meta name="color-scheme" content="light dark">` plus the `color-scheme` CSS property in each palette block makes native scrollbars, form controls and the browser's own canvas match, so there is no white flash behind a dark page during navigation.

**All five cases, stated explicitly.** Every one must produce the correct first paint with no flash:

| # | Situation | `data-theme` after the script | Rendered mode | Correct? |
|---|---|---|---|---|
| 1 | System **light**, no stored preference | `"light"` | light (`:root`) | ✅ |
| 2 | System **dark**, no stored preference | `"dark"` | dark (`[data-theme="dark"]`) | ✅ |
| 3 | System **light**, stored `"dark"` | `"dark"` | dark — the toggle overrides the OS | ✅ |
| 4 | System **dark**, stored `"light"` | `"light"` | light — the `:not([data-theme="light"])` guard (§9.2) stops the media query winning | ✅ |
| 5 | **JS disabled** | never set | **`prefers-color-scheme` decides, in pure CSS.** System dark → the `@media` block matches `:root:not([data-theme="light"])` → dark. System light → `:root` light values. | ✅ |

**JS-disabled behaviour, in full [03 R30].** The toggle cannot function without JS, so it is **not rendered** — it is hidden by default and revealed by the `.js` class the same blocking script adds (`ThemeToggle`, §8.1). The consequences, stated plainly:

- The site still honours the OS preference. A dark-preferring visitor with JS off gets the dark palette.
- A **stored** override cannot be read, so cases 3 and 4 fall back to the system preference. This is a genuine and unavoidable limitation — `localStorage` is a JS API. The page is fully correct and fully readable in whichever mode the OS reports; the user simply loses a preference they set on a previous visit.
- No broken affordance is ever shown: the visitor sees no toggle rather than a toggle that does nothing.
- Nothing is left at `opacity: 0`, because the reveal styles are scoped to `.js` **[02 §8.6]**.

### 9.4 Known duplication

The dark palette appears in two selector blocks — `[data-theme="dark"]` (authoritative) and the `@media` block (no-JS fallback). CSS has no mechanism to share one declaration set across two selectors with different specificity contexts without a preprocessor. **This duplication is intentional and must be kept in sync**; the block carries a comment saying so, and Phase 5 should diff the two.

### 9.5 Print

```css
@media print {
  :root { color-scheme: light; /* full light palette, forced */ }
  * { background: #fff !important; color: #000 !important; }
  a[href^="https://"]::after { content: " (" attr(href) ")"; font-size: 11px; }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  header, .no-print { display: none; }
  /* The field never prints (§3.7, DEV-13). It is a fixed full-viewport layer;
     left in, it either covers the page or wastes a sheet of gold ink. The
     .stage type-colour scope must go with it, or printed body copy resolves
     to --field-fg-secondary #B9B4A9 on white: 2.06:1. */
  .stage, [data-field], canvas, [data-attestation-poster] { display: none !important; }
  .stage { --color-foreground: initial; --color-foreground-secondary: initial;
           --color-foreground-muted: initial; }
}
```

**[03 R29]** — text-selectable, links not truncated, no content lost to a dark background or to an un-fired reveal.

**Amended 2026-09-11 [DEV-13].** The field and the poster are suppressed in print, and `.stage`'s foreground redeclarations are reset with them. **[MEAS]** `--field-fg-secondary` `#B9B4A9` on `#FFFFFF` measures **2.06:1** — printing the stage's type colours onto a forced-white sheet would lose the copy entirely, which is the same class of failure as the `.stage`-by-JavaScript trap in §3.7 and is caught here rather than at the printer.

---

## 10. Tailwind 4 implementation

CSS-first. **No JS config file.**

**Status, as of the 2026-09-11 amendment.** This section was written as a paste-ready replacement for `src/app/globals.css`. That file has since been built out with the full component layer (§8), so **`src/app/globals.css` is now the implementation of record and this block is the token contract**. The relationship is exact and checkable:

- **Blocks 1–4 below (colour, responsive scalars, `@theme`, non-utility tokens) must match the shipped file value-for-value.** Phase 5 diffs them. Nothing may be added to `@theme` that is not printed here.
- **Amended 2026-09-11 (DEV-13/14/15).** Block 1's neutral ladder is warmed in both modes and gains `--overlay`; `@theme inline` gains exactly one entry, `--color-overlay`; block 4 gains `--z-field` / `--z-grid` (§2.7), the light-source group (§2.8) and the `--field-*` group (§3.7). **Nothing else in `@theme` changed, and no `field-*`, `glow-*`, `light-*` or `z-*` utility is generated** — that is the whole reason those groups are declared in block 4 rather than in `@theme`.
- **`--field-hot` is written as a reference, not a hex.** The `var(--accent-dark, #d1a954)` form above is the contract: the field's gold must track dark `--color-accent`, and because the field is dark in *both* themes it cannot simply read `var(--accent)` (which resolves to the light gold on a light page). The implementing pass declares `--accent-dark: #d1a954` once, unconditionally, alongside these tokens. **Retyping `#d1a954` into the shader, the poster, or a second CSS rule is a defect under A8.6** — it is how the two surfaces drift apart.
- **Blocks 5–10 are the structural rules this document owns** (base, focus, reveal, reduced-motion, print, forced-colours). The shipped file adds the §8 component layer between blocks 7 and 9 and Lenis's required base rules inside block 5; those are implementations of §8 and §5.3, not new tokens.
- **Do not paste this over the shipped file.** It would delete the component layer.

Five notes before the code:

- **`@theme inline` is mandatory for the colour mappings.** Without `inline`, Tailwind resolves the variable at build time and bakes one theme's hex into every utility — dark mode silently stops working. With `inline`, the utility emits `var(--color-…)` and the `:root` / `[data-theme]` blocks do the switching at runtime. Keep it.
- **`--spacing: 0.25rem`** generates the whole numeric spacing scale from the 4px base unit (§2.1), so `p-4` = 16px, `gap-8` = 32px. The named `--space-*` tokens are declared alongside it for use in bespoke CSS.
- **`source(none)` plus an explicit `@source` glob is required, not optional.** Tailwind's automatic scan walks the **whole repository** and matches class-like strings in **prose** — the markdown under `docs/`, and the comments in `globals.css` itself. It emitted `.shadow` (a `box-shadow` §2.6 calls a defect), `.ring`, `.blur`, `.invert`, `.font-serif`, `.h-64`, `.py-12/14/16/24/36`, two garbage `.pt-[…]` rules scanned from **ellipses**, and three copies of the reserved `.container` utility scanned out of the string `--container-prose`. Scoping the scan to `src/**/*.{ts,tsx}` — the only files that can legitimately carry a class name — removed **2,621 B** of raw CSS and made the ban on stray shadows structural. Classes authored directly in this file are unaffected; Tailwind does not need to discover those.
- **Nulling a Tailwind default is how a ban is enforced.** `--breakpoint-sm/-xl/-2xl` and `--ease-in/-out/-in-out/-linear` are all set to `initial` for the same reason: a token Tailwind ships is a utility one comment away from existing (§2.2, §4).
- **Hand-written CSS gets no line-height or tracking from a `--text-*` token.** Tailwind applies the `--text-x--line-height` / `--letter-spacing` companion properties only through the `text-x` **utility**. A rule that sets `font-size: var(--text-h2)` and then retypes `line-height: 1.2` is correct today and silently stops following the token tomorrow. **The canonical reference form is `line-height: var(--text-h2--line-height, 1.2)`** — reference by name, keep the literal only as a `var()` fallback. This is the fix for the ~24 retyped literals design-QA found (D8); every one is now in this form, and the fallback is what makes it safe to reference a companion property that only exists because `@theme` emits it.

```css
/* ============================================================
   src/app/globals.css — arinzeokigbo.com
   Source of truth: docs/04-design-system.md
   Any value here that is not in that document is a defect.
   ============================================================ */

/* `source(none)` + explicit globs. The automatic scan walks the whole repo
   and emits utilities for class-like strings found in PROSE. See §10. */
@import "tailwindcss" source(none);
@source "../../src/**/*.{ts,tsx}";

/* Tailwind 4 dark variant, driven by the data-theme attribute (§9.1) */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* ------------------------------------------------------------
   1. SEMANTIC COLOUR (§3.2, §3.3)

   There is NO default mode (§9.2). prefers-color-scheme decides;
   the toggle overrides and persists. `:root` carries the light
   value set only because the cascade needs a base declaration —
   both paths below fully override it before first paint.

   Precedence:  [data-theme]  >  @media  >  :root
   ------------------------------------------------------------ */
:root,
[data-theme="light"] {
  color-scheme: light;

  /* Warm ladder (§3.2, DEV-14) — Radix `gold` light steps 1–4. */
  --background:            #fdfdfc;
  --surface:               #faf9f2;
  --surface-raised:        #f2f0e7;
  --overlay:               #eae6db;   /* NOT a body-text surface (§3.2) */

  --foreground-strong:     #0a0a0a;
  --foreground:            #1a1a1a;
  --foreground-secondary:  #5c5c5c;
  --foreground-muted:      #696969;
  --foreground-faint:      #bdbdbd;

  --border:                #0000001f;
  --border-subtle:         #00000014;
  --border-interactive:    #0000006f;

  /* Deep gold — same hue as the brand (41.1° vs 40.8°), lightness
     lowered so it clears 4.5:1 on every light surface. (§3.4) */
  --accent:                #7c5e1d;
  --accent-hover:          #5f4611;
  --accent-tint:           #f7f1df;
  /* ⚠ WHITE here, near-black in dark mode. The pair INVERTS (§3.4).
     Never hard-code this value on an accent fill. */
  --accent-foreground:     #ffffff;

  --shadow-overlay: 0 8px 32px rgb(0 0 0 / 0.16);
}

/* OS-preference path, and the ONLY path when JS is unavailable. (§9.3)
   The :not([data-theme="light"]) guard is what lets an explicit light
   choice beat a dark OS preference — do not remove it.
   KEEP IN SYNC with the [data-theme="dark"] block below — same values. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    /* Warm ladder (§3.3, DEV-14) — hue 41, S 6–8%. */
    --background:           #0c0b0a;
    --surface:              #161513;
    --surface-raised:       #1f1e1c;
    --overlay:              #2a2925;   /* NOT a body-text surface (§3.3) */
    --foreground-strong:    #f2efe8;
    --foreground:           #ede9e1;
    --foreground-secondary: #a8a29a;
    --foreground-muted:     #8c877e;
    --foreground-faint:     #423f38;
    --border:               #ffffff1f;
    --border-subtle:        #ffffff14;
    --border-interactive:   #ffffff6f;
    --accent:               #d1a954;   /* brand gold, unchanged */
    --accent-hover:         #dbbc7a;
    --accent-tint:          #241c0b;
    --accent-foreground:    #0c0b0a;   /* ⚠ near-black — inverts vs light */
    --shadow-overlay: 0 8px 32px rgb(0 0 0 / 0.48);
  }
}

/* Explicit user choice, written by ThemeScript before first paint.
   Highest precedence. (§9.3)
   KEEP IN SYNC with the @media block above — same values. */
[data-theme="dark"] {
  color-scheme: dark;
  /* Warm ladder (§3.3, DEV-14) — hue 41, S 6–8%. */
    --background:           #0c0b0a;
  --surface:              #161513;
  --surface-raised:       #1f1e1c;
  --overlay:              #2a2925;   /* NOT a body-text surface (§3.3) */
  --foreground-strong:    #f2efe8;
  --foreground:           #ede9e1;
  --foreground-secondary: #a8a29a;
  --foreground-muted:     #8c877e;
  --foreground-faint:     #423f38;
  --border:               #ffffff1f;
  --border-subtle:        #ffffff14;
  --border-interactive:   #ffffff6f;
  --accent:               #d1a954;   /* brand gold, unchanged */
  --accent-hover:         #dbbc7a;
  --accent-tint:          #241c0b;
  --accent-foreground:    #0c0b0a;   /* ⚠ near-black — inverts vs light */
  --shadow-overlay: 0 8px 32px rgb(0 0 0 / 0.48);
}

/* Wide-gamut accent upgrade (§3.4). Hue- and lightness-matched, chroma
   extended: the sRGB values above remain the basis of every contrast claim. */
@supports (color: color(display-p3 1 1 1)) {
  :root, [data-theme="light"] {
    --accent:       color(display-p3 0.47 0.37 0.10);
    --accent-hover: color(display-p3 0.36 0.27 0.06);
  }
  [data-theme="dark"] {
    --accent:       color(display-p3 0.81 0.66 0.30);
    --accent-hover: color(display-p3 0.85 0.74 0.45);
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --accent:       color(display-p3 0.81 0.66 0.30);
      --accent-hover: color(display-p3 0.85 0.74 0.45);
    }
  }
}

/* ------------------------------------------------------------
   2. RESPONSIVE SCALARS (§2.3)
   ------------------------------------------------------------ */
:root {
  --section-gap: 72px;
  --gutter: 24px;
  --header-height: 64px;
}
@media (min-width: 48rem) {  /* --breakpoint-md */
  :root { --section-gap: 96px; --gutter: 32px; }
}
@media (min-width: 64rem) {  /* --breakpoint-lg */
  :root { --section-gap: 144px; --gutter: 48px; }
}

/* ------------------------------------------------------------
   3. @theme — the token surface Tailwind generates utilities from
   ------------------------------------------------------------ */
@theme inline {
  /* --- Colour (§3). `inline` is REQUIRED: it makes utilities emit
         var(--…) so the runtime theme switch works. --- */
  --color-background:           var(--background);
  --color-surface:              var(--surface);
  --color-surface-raised:       var(--surface-raised);
  --color-overlay:              var(--overlay);
  --color-foreground-strong:    var(--foreground-strong);
  --color-foreground:           var(--foreground);
  --color-foreground-secondary: var(--foreground-secondary);
  --color-foreground-muted:     var(--foreground-muted);
  --color-foreground-faint:     var(--foreground-faint);
  --color-border:               var(--border);
  --color-border-subtle:        var(--border-subtle);
  --color-border-interactive:   var(--border-interactive);
  --color-accent:               var(--accent);
  --color-accent-hover:         var(--accent-hover);
  --color-accent-tint:          var(--accent-tint);
  --color-accent-foreground:    var(--accent-foreground);

  /* --- Typography (§1) ---
         `--font-space-grotesk` is emitted by next/font onto <html> (NOT <body>
         — see §1.1). It already ends in "Space Grotesk Fallback", so this stack
         does not repeat it. The var() fallback is belt-and-braces: if the
         variable class is ever moved off <html> again, the family degrades to
         the named face instead of invalidating the whole declaration and
         silently dropping the entire type system. --- */
  --font-sans: var(--font-space-grotesk, "Space Grotesk", "Space Grotesk Fallback"),
               -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
               "Liberation Mono", "Courier New", monospace;

  --font-weight-normal: 400;
  --font-weight-medium: 500;

  --text-caption: 0.8125rem;                 /* 13px */
  --text-caption--line-height: 1.4;
  --text-caption--letter-spacing: -0.01em;
  --text-caption--font-weight: 400;

  --text-label: 0.8125rem;                   /* 13px, uppercase */
  --text-label--line-height: 1.3;
  --text-label--letter-spacing: 0.12em;
  --text-label--font-weight: 500;

  --text-mono: 0.8125rem;                    /* 13px */
  --text-mono--line-height: 1.5;
  --text-mono--letter-spacing: 0em;
  --text-mono--font-weight: 400;

  --text-body: 1rem;                         /* 16px */
  --text-body--line-height: 1.55;
  --text-body--letter-spacing: -0.011em;
  --text-body--font-weight: 400;

  --text-lead: 1.25rem;                      /* 20px — zero crossing */
  --text-lead--line-height: 1.45;
  --text-lead--letter-spacing: 0em;
  --text-lead--font-weight: 400;

  --text-h3: 1.5625rem;                      /* 25px — zero crossing */
  --text-h3--line-height: 1.3;
  --text-h3--letter-spacing: 0em;
  --text-h3--font-weight: 500;

  --text-h2: clamp(1.5625rem, 1.5vw + 0.75rem, 1.9375rem);   /* 25 → 31px */
  --text-h2--line-height: 1.2;
  --text-h2--letter-spacing: -0.01em;
  --text-h2--font-weight: 500;

  --text-h1: clamp(1.9375rem, 3vw + 0.5rem, 3.0625rem);      /* 31 → 49px */
  --text-h1--line-height: 1.08;
  --text-h1--letter-spacing: -0.02em;
  --text-h1--font-weight: 500;

  --text-display: clamp(2.4375rem, 4.5vw + 0.5rem, 4.75rem); /* 39 → 76px */
  --text-display--line-height: 1.05;
  --text-display--letter-spacing: -0.028em;
  --text-display--font-weight: 500;

  /* --- Spacing (§2.1). `--spacing` generates the whole numeric scale
         from the 4px base unit: p-4 = 16px, gap-8 = 32px, … --- */
  --spacing: 0.25rem;

  /* --- Containers and measures (§1.5) --- */
  --container-prose: 42rem;   /* 672px */
  --container-wide:  48rem;   /* 768px */
  --container-shell: 64rem;   /* 1024px */

  /* --- Breakpoints (§2.2). Two, not five: the unused Tailwind
         defaults are removed so no agent can reach for them. --- */
  --breakpoint-sm:  initial;
  --breakpoint-md:  48rem;    /* 768px */
  --breakpoint-lg:  64rem;    /* 1024px */
  --breakpoint-xl:  initial;
  --breakpoint-2xl: initial;

  /* --- Radius (§2.5) --- */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   16px;
  --radius-full: 9999px;

  /* --- Easing (§4). Three. There is no fourth. --- */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-entrance: cubic-bezier(0, 0, 0.2, 1);
  --ease-glide:    cubic-bezier(0.32, 0.72, 0, 1);

  /* Tailwind's own easing defaults, nulled the same way the unused
     breakpoints are (§2.2). §4 forbids `ease-in` "in any form"; it shipped in
     the theme layer with .ease-in / .ease-out / .ease-in-out utilities emitted
     from COMMENT text, so the forbidden curve was one class name away. */
  --ease-in:      initial;
  --ease-out:     initial;
  --ease-in-out:  initial;
  --ease-linear:  initial;
}

/* ------------------------------------------------------------
   4. NON-UTILITY TOKENS (§2.4, §5, §7) — referenced from CSS,
      not turned into Tailwind utilities.
   ------------------------------------------------------------ */
:root {
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-6: 24px;  --space-8: 32px;  --space-12: 48px; --space-16: 64px;
  --space-24: 96px; --space-36: 144px; --space-48: 192px;

  --rhythm-heading: 48px;
  --rhythm-entry: 32px;
  --rhythm-title: 16px;
  --rhythm-meta: 8px;
  --rhythm-paragraph: 16px;
  --rhythm-inline: 8px;

  --measure-prose: 42rem;
  --measure-lead: 30ch;
  --measure-intro: 42ch;
  --measure-display: 14ch;
  --measure-h1: 20ch;
  --measure-h2: 28ch;
  --measure-h3: 32ch;
  --measure-caption: 48ch;
  --measure-mono: 72ch;

  --duration-fast: 150ms;
  --duration-base: 240ms;
  --duration-reveal: 280ms;
  --duration-ceiling: 320ms;   /* assertion bound, not a usable value */

  --reveal-distance: 8px;
  --reveal-distance-lg: 16px;
  --press-translate: 1px;
  --press-scale: 0.98;
  --hover-lift: -2px;

  --stagger-step: 50ms;
  --stagger-max-items: 5;

  /* Stacking order (§2.7). Declared here, NOT in @theme, so no z-* utilities
     are generated and the token surface above stays exactly as printed.
     Order: field -> grid -> content (normal flow) -> header -> skip link.
     The skip link must paint above the sticky header. */
  --z-field: 0;
  --z-grid: 1;
  --z-header: 2;
  --z-skip: 3;

  /* The light source (§2.8, DEV-15). ONE origin. Every lit edge on the page
     is a radial gradient anchored to it; nothing reads a second position.
     Frozen at these defaults under reduced motion and with JS disabled. */
  --light-x: 50%;
  --light-y: -10%;
  --glow-near:  #d1a95433;
  --glow-mid:   #d1a9541f;
  /* Every gold glow fades to THIS, never to `transparent` — `transparent` is
     rgba(0,0,0,0) and interpolates through grey (docs/11 §3 move 5). */
  --glow-far:   #d1a95400;
  --edge-lit:   inset 0 1px 0 #ffffff1f;
  --shadow-panel: 0 40px 100px -50px #000;
  --grain-opacity: 0.20;

  /* The attestation field (§3.7, DEV-13). DARK IN BOTH THEMES — the field is
     a stage the light-mode page enters and leaves (A8.2), so these are NOT
     redeclared per theme. Not in @theme: no field-* utilities are generated
     and nothing outside the .stage scope can reach them by accident. */
  --field-ink:          #0a0908;
  --field-cold:         #3a4655;
  --field-hot:          var(--accent-dark, #d1a954); /* = dark --accent (A8.6) */
  --field-core:         #fff3d2;
  --field-fg:           #ede9e1;                     /* = dark --foreground   */
  --field-fg-secondary: #b9b4a9;                     /* body over the field   */
  --field-fg-muted:     #9c978c;
  --field-rule:         #ffffff14;
  --field-panel:        #ffffff05;

  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-color: var(--accent);
  --focus-ring-style: solid;
}

/* ------------------------------------------------------------
   5. BASE
   ------------------------------------------------------------ */
html {
  /* scroll-behavior: smooth is REMOVED — it fights Lenis (docs/00 Defect 5) */
  -webkit-text-size-adjust: 100%;
}

/* Lenis' required base rules (§5.3). The `lenis` class lands on <html> only
   when an instance is constructed, so under prefers-reduced-motion — where
   none is constructed (M12) — none of these match and native scroll is the
   whole mechanism. */
html.lenis, html.lenis body            { height: auto; }
.lenis.lenis-smooth                    { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped                   { overflow: hidden; }
.lenis.lenis-smooth iframe             { pointer-events: none; }

body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  font-size: var(--text-body);
  /* Referenced by name, not retyped (§10 note 5). The literal is a fallback. */
  line-height:    var(--text-body--line-height, 1.55);
  letter-spacing: var(--text-body--letter-spacing, -0.011em);
  font-weight: var(--font-weight-normal);
  font-synthesis-weight: none;   /* 400/500 only — no faux bold (§1.1) */
  font-synthesis-style: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  min-height: 100svh;
}

strong, b { font-weight: var(--font-weight-medium); }

/* The theme toggle cannot function without JS, so it is not rendered
   without JS. `.js` is added by the same blocking script that sets
   data-theme, so there is no shift. (§8.1, §9.3) */
.theme-toggle { display: none; }
.js .theme-toggle { display: inline-flex; }

::selection {
  background: var(--color-accent-tint);       /* allowlist A6 */
  color: var(--color-foreground-strong);
}

/* Scroll offset so the sticky header can never obscure a focus target.
   WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum) — §7.3 */
:target,
[id],
:where(a, button, input, textarea, select, summary, [tabindex]) {
  scroll-margin-block-start: calc(var(--header-height) + var(--space-4));
}

/* ------------------------------------------------------------
   6. FOCUS (§7.2)

   `outline` and `outline-offset` ONLY. `border-radius: inherit` was here and
   collapsed every control's corner on keyboard focus (skip link 9999px -> 0,
   buttons 8px -> 0): these rules are UNLAYERED and every component radius is
   in @layer components, and unlayered beats layered regardless of specificity,
   so even :where()'s zero specificity won and `inherit` resolved to the flex
   parent's 0px. It also bought nothing — `outline` already follows the
   element's own border-box shape at the offset. Do not add it back.
   ------------------------------------------------------------ */
:where(a, button, input, textarea, select, summary, [tabindex]):focus-visible {
  outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
:focus:not(:focus-visible) { outline: none; }

/* The ONE sanctioned outline suppression (§7.2). <main tabindex="-1"> is the
   skip-link target; Enter-initiated focus DOES match :focus-visible (measured
   true in Chromium, Firefox and WebKit), and the [tabindex] clause above then
   outlined the entire page content in gold. WCAG 2.4.7 governs UI COMPONENTS;
   a reading-position target is not one. Specificity 0,1,1, unlayered. */
main[tabindex="-1"]:focus,
main[tabindex="-1"]:focus-visible { outline: none; }

/* ------------------------------------------------------------
   7. REVEAL (§5.3, §6). Scoped to .js so a JS-disabled render
      never leaves content at opacity: 0 (docs/02 §8.6, R30).
   ------------------------------------------------------------ */
.js [data-reveal] {
  opacity: 0;
  transform: translateY(var(--reveal-distance));
  transition:
    opacity var(--duration-reveal) var(--ease-entrance),
    transform var(--duration-reveal) var(--ease-entrance);
  transition-delay: calc(min(var(--reveal-index, 0), 4) * var(--stagger-step));
}
.js [data-reveal="lg"] { transform: translateY(var(--reveal-distance-lg)); }
.js [data-reveal][data-revealed] { opacity: 1; transform: none; }
.js [data-reveal][data-reveal-instant] { transition: none; transition-delay: 0s; }

@supports (animation-timeline: view()) {
  /* Decorative reveals only; compositor-threaded where available.
     docs/02 §8.6 */
  .js [data-reveal="decorative"] {
    animation: reveal linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
  }
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(var(--reveal-distance)); }
  to   { opacity: 1; transform: none; }
}

/* ------------------------------------------------------------
   8. REDUCED MOTION (§6)

   The blanket block is a SAFETY NET ONLY (§6.2). In the shipped file this
   block continues with a per-component rule for every row of the §6.1 table
   that CSS can express — M4 (.link underline permanently present at
   border-interactive, colour-only on hover), M5 (.btn no transform, instant
   background swap), M6 (.link-standalone no lift), M7 (nav sheet no travel,
   visibility still flips so the closed sheet stays out of the tab order),
   M8 (.theme-toggle/.nav-link instant swap), M9 (marker no slide) and
   M10 (focus ring instant, never suppressed, never delayed).
   M11/M12 are JS gates; M13-M15 have nothing to suppress.

   Shipping a component whose only reduced-motion behaviour is the net is a
   Phase-5 defect. Authored AFTER the @supports and component blocks so it
   wins the cascade (M14).
   ------------------------------------------------------------ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    animation-delay: 0ms !important;
    transition-duration: 1ms !important;
    transition-delay: 0ms !important;
    scroll-behavior: auto !important;
  }
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    transition-delay: 0s !important;
    animation: none !important;
  }
  /* … per-component M4–M10 rules; see §6.1 … */
}

/* ------------------------------------------------------------
   9. PRINT (§9.5) — R29
   ------------------------------------------------------------ */
@media print {
  :root { color-scheme: light; }
  *, *::before, *::after {
    background: #fff !important;
    color: #000 !important;
    box-shadow: none !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
  a[href^="https://"]::after { content: " (" attr(href) ")"; font-size: 11px; }
  header, .no-print { display: none !important; }
}

/* ------------------------------------------------------------
   11. FORCED COLOURS (Windows High Contrast and equivalents)

   Not a WCAG AA requirement — 1.4.3 / 1.4.11 are measured in the default
   rendering — but the attestation poster is the one surface the UA cannot fix
   for itself: its colour arrives as an author `color` on an <svg> whose
   circles are fill="currentColor", so it would paint at the author value
   against a forced background at an arbitrary contrast. Hand it back to the
   system palette. The focus ring and .btn--primary are already re-coloured
   correctly by the UA and are deliberately left alone. (§8.4)
   ------------------------------------------------------------ */
@media (forced-colors: active) {
  [data-attestation-poster] { color: CanvasText; }
}
```

---

## 11. Summary card

```
TYPE      Space Grotesk Variable, latin subset — 22,320 B measured (was 37,360 B, −40.3%)
          Instrument Serif dropped · system mono, 0 B · display:swap + metric fallback
          ratio 1.25 · base 16px · 13 / 16 / 20 / 25 / 31 / (39) / 49 / 76
          clamps: h2 25→31 · h1 31→49 · display 39→76, all with a rem term
          line-height 1.55 body → 1.05 display
          tracking −0.011em body → 0em at 20–25px → −0.028em display
          weights 400 / 500 ONLY · font-synthesis: none · measure 42rem (672px, ~68ch)

SPACE     base 4px (Tailwind --spacing: 0.25rem) · 4/8/12/16/24/32/48/64/96/144/192
          section GAP (not symmetric padding) 144px ≥1024 · 96px 768–1023 · 72px <768
          gutter 48 / 32 / 24 · header 64px · breakpoints 768 / 1024 only
          shell 1024 · wide 768 · prose 672 · radius 4/8/16
          shadows: --shadow-overlay (nav sheet) + --shadow-panel (over the field
            ONLY, and never without --edge-lit — they ship as a pair, §2.6)
          column classes are .col / .col--prose|wide|shell — NEVER .container
          (Tailwind reserves it; @layer utilities beats @layer components)
          z: --z-field 0 · --z-grid 1 · --z-header 2 · --z-skip 3
          LIGHT SOURCE (§2.8): one origin --light-x 50% / --light-y −10%
            every gold glow fades to --glow-far #D1A95400, NEVER to `transparent`
            no shadow without a lit edge · grain 20%, over everything but the field

COLOUR    16 semantic tokens per mode · 25 distinct hex + 6 alpha across both
            (+9 field-scoped tokens, §3.7 → 30 hex + 7 alpha whole-system)
          THE NEUTRALS ARE WARM (DEV-14): hue 41, S 6–8%, lightness matched
            light bg #FDFDFC / surface #FAF9F2 / raised #F2F0E7 / overlay #EAE6DB
            light fg #1A1A1A (text values unchanged; every figure ROSE)
            dark  bg #0C0B0A / #161513 / #1F1E1C / overlay #2A2925
            dark  fg #EDE9E1 16.24 · strong #F2EFE8 17.12 · sec #A8A29A 7.77
                  muted #8C877E 5.50 (4.66 on raised — re-measured, passes)
          ⚠ --color-overlay is NOT a body-text surface: fg-muted 4.40 light /
            4.07 dark. Permitted there: strong, fg, secondary, accent, hover.
          ACCENT IS GOLD, two values, one hue, BOTH HEXES UNCHANGED:
            dark  #D1A954  8.90 / 8.26 / 7.54 / 6.59 on the 4 surfaces
            light #7C5E1D  5.93 / 5.72 / 5.29 / 4.84  (worst pair in the system)
          ⚠ accent-foreground INVERTS: #FFFFFF on light gold (6.04:1),
            #0C0B0A on dark gold (8.90:1). Always var(), never a literal.
          R-GOLD-1: every accent marker ≥2px — the gold is separated from
            body text by chroma, not value
          R-GOLD-2 (amended): accent text on background, surface, OR over the
            field inside a data-scrim block. Nowhere unmeasured.
          borders are alpha-over-neutral; --border-interactive ≥3.08:1 everywhere
          accent ALLOWED on 8 named uses (A1–A8), FORBIDDEN on 11 (F1–F11)
          A1 = 2px accent underline AT REST on hero proof nouns (D4 resolution)
          F4 = no accent mass >~2000px² in ANY property (color/fill/stroke/
            background/canvas), except THREE: ::selection tint (A6), the one
            primary CTA (A4), and THE ATTESTATION FIELD (A8)
          A8 = the field is EMITTED LIGHT (gl.ONE,gl.ONE / gradients ending at
            #D1A95400) on a #0A0908 stage, dark in both themes, scrim carved
            into the composite, ≥4.5:1 body measured on COMPOSITED pixels at the
            brightest frame (ship ≥7:1), excluded from F9, poster == canvas.
          ⛔ SUBSTITUTING --color-foreground-secondary OR FIGURE_FALLBACK_* INTO
            THE FIELD RAMP IS THE DEFECT, NOT THE FIX. It shipped 1.44:1 once.
            A grey field is a regression. See §3.5's binding instruction.

MOTION    3 easings: 0.4,0,0.2,1 STANDARD (9/13 sites) · 0,0,0.2,1 entrance
                     0.32,0.72,0,1 glide (one authored moment). No spring. No ease-in
                     (Tailwind's --ease-in/out/in-out/linear nulled to `initial`).
          3 durations: 150 / 240 / 280ms — hard ceiling 320ms
          reveal translateY 8px (16px hero) · press 1px / scale .98 · hover lift −2px
          stagger 50ms × 5 max · trigger at 85% viewport, fire once, never reverse
          nav scroll-spy is a SEPARATE observer at --nav-spy-margin −60%
          transform + opacity only · no pinning, no parallax, no scroll-hijack
          15-row reduced-motion table, every row a REAL static end state
          NO JS ANIMATION RUNTIME. Framer Motion deleted (−29,525 B, animated
            nothing). CSS reveals + IntersectionObserver + defineMotionSpec
            survive and are load-bearing. Do not reintroduce a library.

FOCUS     2px solid accent @ 2px offset · :focus-visible only
          5.93 / 5.72 / 5.29 / 4.84 light · 8.90 / 8.26 / 7.54 / 6.59 dark
          (bar 3:1; worst 4.84 = 1.61× the 3:1 bar, 1.07× the 4.5:1 text bar —
           measured in P3 too, at 4.90, because that margin is now thin)
          scroll-margin 80px for WCAG 2.2 SC 2.4.11 · targets ≥24×24, touch ≥44×44

THEME     NO default mode. prefers-color-scheme decides; toggle overrides + persists
          precedence: [data-theme] > @media > :root · blocking inline script, no flash
          5 cases verified: system light, system dark, stored dark, stored light, JS off
          JS off → OS preference honoured in pure CSS; toggle not rendered
          print forces light
```

---

## 12. Deviations from `docs/01`, consolidated

Every conflict with a `docs/01` recommendation, in one place, for Phase 5.

| # | `docs/01` says | This system ships | Why |
|---|---|---|---|
| **DEV-1** | (current site) eyebrow/label text is accent-coloured | `--text-label` is `--color-foreground-muted`; accent forbidden on labels (F6) | `docs/01` §5.3's own allowlist does not include eyebrows; **[03 AP5]** requires the accent to be a scarce router, and an accent label above every section makes it texture |
| **DEV-2** | (current site) `--radius: 18px` | `4 / 8 / 16 / full` | 18px is off the 4px grid and sized for a card system this design removes |
| **DEV-3** | (current site) `.card` gradient + two shadows | No content shadows; one `--shadow-overlay` for the nav sheet | `docs/01` Part 4: the personal sites that work use one column, no cards |
| **DEV-4** | Palette target ≤14 distinct values | 15 semantic tokens **per mode**; 20 distinct hex + 6 alpha across both | `docs/01`'s corpus counts are largely single-theme. Dual-theme doubles the neutral ramp irreducibly. 20 sits inside `docs/01`'s own 9–45 band for refined personal sites, below paco.me's 35 |
| **DEV-5** | `--fg-muted`: `#8A8A8A` light / `#7C7C7C` dark | `#696969` light / `#8A8A8A` dark | **[MEAS]** `#8A8A8A` = 3.36:1 on `#FCFCFC` and `#7C7C7C` = 4.41:1 on `#141414`. Both fail WCAG 1.4.3 (4.5:1) for the 13–16px metadata they are named for. Correctness fix |
| **DEV-6** | Accent `#F4622A` (+ `#FF7A45` hover), one value for both modes | **Gold, two values: `#7C5E1D` light / `#D1A954` dark** | **Site-owner override, 2026-09-11 — see DEV-6a below.** `docs/01`'s `#F4622A` is rejected on measurement regardless: 3.09:1 on `#FCFCFC` and **2.71:1 on `#EDEDED`**, an outright **[WCAG 1.4.11]** fail for the colour carrying every focus ring. `docs/01` §5.3 explicitly invites substitution: "the discipline matters more than the value" |
| **DEV-7** | Four easing tokens, including `--ease-spring` "optional, ≤1 use" | Three. No spring token exists | `docs/01` anti-pattern 1: shipping a curve you do not use is the paco.me failure. Nothing on this site needs overshoot |
| **DEV-8** | `--dur-slow: 400ms` for section reveal, hard ceiling 400ms | `--duration-reveal: 280ms`, hard ceiling 320ms, 400ms token removed | **[03 AP4]** caps entrances at 300ms and does the arithmetic: 15 reveals × 400ms = 6s = 7% of the 90-second budget. 280ms sits in `docs/01`'s own 200–320ms band and under Emil Kowalski's published <300ms rule |
| **DEV-9** | Reduced motion: "set all durations to `0.01ms` and remove all transforms" | A 15-row substitution table (§6.1) mapping every motion token to a real static end state; the blanket rule demoted to a safety net | **[03 R35]** and `BUILD-PLAN` both require "a real layout, not an animation with duration zero." A 0.01ms transition still starts at `opacity: 0` and still depends on JS arriving |
| **DEV-10** | (brief) "project card" | `ProjectEntry` renders as a list row, not a bordered card | `docs/01` Part 4: "a single narrow column, one measure, no cards, no grid, no icons" — the mechanic that makes a dense personal-site page survivable |
| **DEV-11** | *(no `docs/01` position; this document's own earlier position was "light is the authored default")* | **No default mode.** `prefers-color-scheme` decides; the toggle overrides and persists | **Site-owner decision, 2026-09-11.** Both palettes are independently specified and independently measured; `:root` carries the light set only because the cascade requires a base declaration, and both the attribute path and the media path override it before first paint (§9.2). Five cases verified in §9.3, including JS-disabled |
| **DEV-12** | *(new rule, no `docs/01` position)* | **R-GOLD-1** — every accent marker ≥2px; **R-GOLD-2** — accent text only on `--color-background` / `--color-surface` *(amended by DEV-13 to add the field, inside a `data-scrim` block)* | Forced by DEV-6a. The light-mode gold (luminance 0.124) is close in value to `--color-foreground-secondary` (0.107), so it routes attention by chroma rather than value. A 1px hairline in that colour is not a router. **[MEAS] [03 AP5]** |
| **DEV-13** | `docs/01` §5.3 allows the accent on ≤3 named roles; this document's own F4 forbade any accent mass >~2,000 px² with two exceptions | **Allowlist row A8 — the attestation field is an emissive surface and gold is permitted in it**, over an unbounded pixel area, under six binding conditions A8.1–A8.6. F4's exception list becomes **three**; F9 gains a third exclusion; R-GOLD-2 is widened; §2.6 gains the `--shadow-panel` / `--edge-lit` pair; §2.7 gains `--z-field` / `--z-grid`; §3.7 declares the `--field-*` group | **Measurement, and an owner decision.** The pre-amendment rule sent the point field to `--color-foreground-secondary` and it shipped at **1.44:1** — invisible — on both the canvas and the poster. The old rule's reasoning (a large gold mass would out-compete the page's routers) was correct for a **boxed figure inside a section** and is wrong for the page's **ground**, which the routers sit on top of and are brighter than. A8 licenses **a light source, not paint**: A8.1 requires every accent pixel to be additively emitted, A8.4 requires ≥4.5:1 body / ≥3:1 large on **composited** pixels at the brightest authored frame. `docs/15` §1.1; `docs/11` Part 8 Direction C |
| **DEV-14** | (current site, and DEV-5's own values) a perfectly neutral greyscale — `#0A0A0A`, `#141414`, `#1C1C1C`, `#EDEDED`, `#A8A8A8`, `#8A8A8A`, `#4A4A4A` — under a hue-41 accent | **A warm neutral ladder in both modes.** Dark: hue 41, S 6–8%, lightness matched — `#0C0B0A` / `#161513` / `#1F1E1C` / **`#2A2925`** and `#F2EFE8` / `#EDE9E1` / `#A8A29A` / `#8C877E` / `#423F38`. Light: Radix `gold` steps 1–4 — `#FDFDFC` / `#FAF9F2` / `#F2F0E7` / **`#EAE6DB`**, text values unchanged. Both accent values unchanged | `docs/11` §5.2 **[MEAS]**: *a warm accent on a cold ground reads as a highlighter mark; a warm accent on a warm ground reads as an identity.* Every site in the corpus that reads as expensive with a warm accent warms its neutrals (claude.com, henry.codes `hsl(38,11%,…)`, Mercury, by-kin `#F4F2ED`). Values from `docs/11` §5.4, not invented here; **§3.6 reprinted in full and every figure recomputed.** At 6% saturation nobody reads the ground as brown. `docs/11` calls this the cheapest high-impact change in the document |
| **DEV-15** | `docs/01` has no position; DEV-3 forbade **all** content shadows | **A light-source system.** One origin (`--light-x` / `--light-y` on `:root`), a three-stop gold glow ramp ending at `--glow-far` `#D1A95400`, `--edge-lit` + `--shadow-panel` as an inseparable pair for panels **over the field only**, `--grain-opacity: 0.20` | `docs/11` §3 moves 1, 3, 5, 8. The diagnosis is that the page **has no light source**: flat fills, black shadows invisible on a near-black ground, and gradients that fade to `transparent` — which is `rgba(0,0,0,0)` and interpolates through grey, producing the dirty band `docs/11` measured on every gradient in the build. **DEV-3 is not reversed**: panels off the field still carry no shadow, and a `--shadow-panel` without `--edge-lit` is the exact black-shadow-on-near-black failure this exists to fix |

### DEV-6a — record of the accent override

**This document's own first recommendation was overruled, and the record should say so plainly.**

**What Phase 2 originally proposed:** replace the brand gold with a vermilion pair, `#B83C0A` light / `#FF7A45` dark. The measurement behind it was correct and is unchanged: `#D1A954` is **2.15:1 on `#FCFCFC`** and cannot be used in light mode.

**Where the reasoning was wrong:** the measurement proved the *value* fails in one mode; the conclusion discarded the *identity* in both. Those are different claims. Gold is the existing brand colour (`docs/00` §11) and works well in dark mode at **8.97:1** — a figure this document published while recommending its removal. A per-mode accent value is standard practice, not a workaround: Linear ships different accent-hover values per theme **[01 §2]**. The correct fix was to hold the hue and move the lightness, which is what §3.4 now does.

**What the site owner decided (2026-09-11):** keep the gold identity; ship `#D1A954` in dark mode unchanged and a darker gold in light mode. Proposed `#8A6D1F`, with `#7D6216` and `#85681A` offered as higher-headroom alternatives and explicit permission to substitute a better value.

**What Phase 2 substituted, and why:** **`#7C5E1D`**. The owner's `#8A6D1F` (**4.18:1**) and `#85681A` (**4.49:1**) both fail 4.5:1 on `--color-surface-raised`, so accent text inside a code block or chip would fail AA — the same class of error this document caught in `docs/01`'s own `--fg-muted` values (DEV-5). `#7D6216` passes at 4.94:1 but sits at hue 44.3°, a 3.5° drift toward yellow-green. `#7C5E1D` passes on all three surfaces at **5.89 / 5.59 / 5.16** *and* matches the brand hue to **0.3°** — the best result on both of the owner's stated criteria.

**What the decision cost, stated honestly:** the light-mode gold has a relative luminance of 0.124, very close to `--color-foreground-secondary` (0.107). It is separated from body text by chroma, not value, which makes it a weaker attention router than a bright vermilion would have been — a real cost against **[03 AP5]**. Mitigated by **R-GOLD-1** (§3.4): every accent marker renders at ≥2px, so the router works by mass and chroma. Phase 5 should verify AP5 empirically (the blur test) rather than assume the mitigation succeeded.

**What it did not cost:** contrast. The weakest accent figure in the system moved from 4.86:1 (vermilion) to **5.16:1** (gold), and the focus ring's worst case improved from 4.86:1 to **5.16:1 light / 7.72:1 dark**.

**Values tightened inside a `docs/01` range, not deviations [01→]:** `--reveal-distance` 8px rather than 12px (both inside the measured 4–16px range; 8px is the corpus's second-most-frequent value, 12px appears in no site's keyframes); zero tracking rather than `+0.004em` in the 20–25px band (Space Grotesk is already wider-set than SF Pro Text); accent cap of one element *group* per viewport rather than one element (**[03 R3]** requires ≥3 proper nouns above the fold).

### 12.1 Amendment log — Phase 5 reconciliation, 2026-09-11

**Nothing above this line was rewritten.** DEV-1 through DEV-12 and DEV-6a are the Phase 2 record and stand as written. This subsection is appended, and every later amendment appends here rather than editing history.

Four review passes and one fix pass produced findings whose agreed remedy was *amending this document*, not changing code — plus contradictions inside this document that only its owner could resolve. All of them are below, each naming the section it changed.

#### A. The contradiction resolved

| # | Contradiction | Resolution | Section changed |
|---|---|---|---|
| **D4** | §3.5 **A1** required a 2px accent underline **at rest** on the hero proof nouns; §8.3's `InlineLink` table required *"Rest: 1px underline in `--color-border-interactive`"* for every inline link. The build followed §8.3, so the hero shipped with no accent router at rest. | **§3.5 A1 is correct. §8.3 was wrong and is amended.** The allowlist is normative and the component table derived; the A1/A2 rest/hover split is deliberate and repeated in `docs/05`; F9's own wording presupposes underlines that exist at rest. `InlineLink` gains `emphasis: "proof" \| "default"`. **F9's exclusion list widened from A3 to A3 + A4** so the hero's own CTA does not make A1 a defect — reasoning and cost stated in §3.5. | **§8.3** (the loser, rewritten); §3.5 (resolution recorded, F9 amended); §8.2 `Hero` |

#### B. Drift corrected — this document was out of date

| # | Finding | Section changed |
|---|---|---|
| **D5** | §8.4 specified `CanvasFrame` / `CanvasPoster` / `HeroCanvasGate` / `HeroCanvas`. None exists. Every *contract* was honoured by `AttestationFigure` / `AttestationLive` / `AttestationPoster` / `runtime/mount.ts`, and the shipped names are better — the figure is not in the hero. | **§8.4**, rewritten to the shipped names with a was/ships mapping table |
| **D6** | `PostRow`, `RichText` and `ResumeAffordance` shipped, sanctioned by `docs/05`, absent from §8. `PageTransition` was in no document; it is now deleted. | **§8.2** (`PostRow`, `RichText`), **§8.3** (`ResumeAffordance`), **§8.5** (`PageTransition` and friends recorded as not-provided) |
| **D7** | `WorkEntry`'s "single most constrained contract" assumed every entry has a role and a period. Snorkel AI has neither. The drift is content-driven and correct. | **§8.2** — `id` and `domain` added, `role`/`period`/`outcome` typed `string \| null` |
| **a11y 8** | §8.2 called the `--color-border-subtle` hairline the entry separator. It composites to **1.19:1** and carries no information. No code change is required for AA; the claim was the defect. | **§8.2** — separation restated as heading + rhythm, hairline restated as ornament |
| **a11y 12** | §3.4 claimed the sRGB figures were "the guaranteed floor" for the P3 accent. In dark mode the rendered P3 measures **~0.11 below** the sRGB figure. Immaterial to conformance; the word was wrong. | **§3.4** — claim withdrawn, six measured pairs printed, correct statement given |

#### C. Escalations — a token that did not exist

| # | Finding | Resolution | Section changed |
|---|---|---|---|
| **D11** | The active-nav scroll-spy used an untokenised `-60%`. Reusing `REVEAL_ROOT_MARGIN` (`-15%`) would have changed *when a section becomes active* — a behavioural regression to fix a naming defect. | **`--nav-spy-margin: -60%` added**, with a table stating why the two observers are different measurements and must not be merged. | **§5.3** |
| **D12** | Bare `z-index: 2` / `3`. This document declared no stacking scale. | **§2.7 added** — `--z-header: 2`, `--z-skip: 3`, declared in the non-utility block so the `@theme` surface is unchanged and no `z-*` utilities are generated. No `--z-overlay`: nothing needs one yet. | **§2.7** (new), §10 |
| **D8** | ~24 type values retyped as literals — all numerically correct, none referenced by name, every one would silently stop following an edit to `@theme`. | **Fixed in code and documented here.** The canonical reference form is `line-height: var(--text-h2--line-height, 1.2)` — reference by name, literal as `var()` fallback only. **Verified: zero retyped literals remain** in `globals.css`, `AttestationFigure.tsx` or `AttestationReadout.tsx`. | **§10** note 5 |

#### D. Shipped reality this document described wrongly

| Finding | Section changed |
|---|---|
| `.container` → **`.col`**. Tailwind reserves `container`; its `@layer utilities` beats `@layer components` regardless of specificity, and every column rendered at 1024px. | **§1.5** (rename, the layer explanation, the do-not-restore warning, the `calc(token + 2×gutter)` geometry, the no-nesting rule), §8.1 `Container`, §11 |
| **Framer Motion deleted** — it animated nothing, 71.8% of its chunk was unused, −29,525 B. The CSS reveal system and `defineMotionSpec` survive and are load-bearing. | **§5.4** (new), §4 (JS easing form), §5.1, §8.1 `RootLayout`, §8.5, §11, §13 |
| **Accent on the poster** — an 830×466 field of `--color-accent`, let through by F4's "taller than 24px" wording. | **§3.5** — F4 restated as a **scale** rule with an aggregate px² threshold, property-independence, and a figure-level counting rule; §8.4 |
| `next/font`'s variable class must be on `<html>`; a bare `var()` to an unset property invalidates the whole declaration. | **§1.1** |
| `border-radius: inherit` on `:focus-visible` collapsed every focused control's corners. | **§7.2** (removed; the one sanctioned `outline: none` for `main[tabindex="-1"]` documented), §10 |
| Skip link must reveal on `:focus` as well as `:focus-visible`. | **§7.5** |
| `ThemeToggle` must **not** carry `aria-pressed` (4.1.2, and it caused an SSR mismatch). | **§8.1** |
| The "(opens in a new tab)" notice is one document-level `aria-describedby` target, `hidden`, never a per-link span in the name. | **§8.1**, §8.3 |
| Footer links are `StandaloneLink`, not `InlineLink` (they measured 8.6×16px). | **§8.1** |
| `SiteHeader` has **no** `backdrop-filter` — it was dead and unprefixed. | **§8.1** |
| `Section`'s `isLast` is live; `SiteFooter` carries no `margin-block-start`. | **§2.3**, §8.1 |
| `Hero` takes `padding-block-start` only; a closing pad compounds with `--section-gap`. | **§8.2** |
| `@media (forced-colors: active)` for the poster; scrollable `<pre>` needs `tabIndex={0}` + a name. | **§8.2**, §8.4, §10 |
| `source(none)` + explicit `@source`, and nulling Tailwind's `--ease-*` defaults. | **§4**, §10 |
| Lenis is dynamically imported behind the reduced-motion gate; its base rules are scoped to the `lenis` class. | **§5.3**, §10 |
| No `viewport-fit=cover`, therefore no `env(safe-area-inset-*)` — they are halves of one pair. | **§8.1** |

#### E. Open against this document — not resolved here

| # | Item | Why it is still open | Owner |
|---|---|---|---|
| **D4 (implementation)** | `InlineLink` has no `emphasis` prop and `globals.css` has no `.link--proof` rule. The contract now says A1 at rest; the code still renders A2 behaviour in the hero. | This document owns the contract, not the code. One prop + one CSS rule. | next code pass |
| **D17** | Page height is **6.10 viewports at 390×844** against **[03 R14]**'s cap of 6 (5.28 at 1440×900 — passes). | **Not a token defect and not this document's to fix.** R14 is a content budget, and §2.3 is explicit that when the page exceeds it **content is cut, the gap is not** (**[03 AP2]**). `docs/05 §3.5` names `credentialsDetailLine` (`src/content/about.ts:51`) as the first cut; it is ~120px on mobile and brings the page back under 6. Cutting copy would also break the verbatim-copy invariant (44/44 strings), so it needs the copy owner's decision, not a unilateral edit. **§13 now asserts R14 at both test viewports** so this stops being invisible. | `content` / `information-architecture` |
| **LCP** | 2,003 ms against a 2,000 ms lab requirement; 88.8% of initial JS is the React + Next app shell. | No token in this document moves it. An architecture decision. | `main` |
| **§2.6 dead-shadow wording** | §2.6 said "any other `box-shadow` in the codebase is a defect"; Tailwind emitted a `.shadow` rule from prose that no element carried. | Narrowed to *rendered* shadows, with the `source(none)` fix as the structural answer. Recorded rather than left ambiguous. | resolved, §2.6 |

#### F. The attestation-field amendment — 2026-09-11

**Nothing above this line was rewritten.** §12.1 A–E are the Phase-5 reconciliation record and stand as written. This subsection is appended per §12.1's own rule, and the next amendment appends after it.

**Input:** `docs/15-field-port-plan.md` §1, itself resting on `docs/11-portfolio-visual-research.md` Part 8 Direction C and §5.2/§5.4, and on `docs/12` §5.1–5.2. **Deviations produced: DEV-13, DEV-14, DEV-15** (§12). **Sections changed:** §2.6, §2.7, **§2.8 (new)**, §3.1, §3.2, §3.3, §3.4, §3.5, §3.6, **§3.7 (new)**, §8.4, §10, §11, §12, §13. **No existing section number moved**; §2.8 and §3.7 are appended after the last existing subsection of their part, so every external citation by number — `docs/05`, `docs/11`, `docs/12`, `docs/15` — still resolves.

##### F.1 The deviation, and the reason for it

The site shipped at Lighthouse 100/100/100/100 and looked flat. Its one ambitious element — a point lattice seeded by a real ECDSA P-256 signature — rendered at **1.44:1**, which is to say it rendered invisible, on both the live canvas and the poster.

**Nobody involved made a mistake.** `docs/06-review-design-qa` D3 correctly found an 830×466 field filled with `--color-accent` and correctly filed it against F4. The fix pass correctly resolved it to `--color-foreground-secondary`, because F4's remedy clause said in terms that *"the correct token for a large figure is a foreground token."* `src/components/three/constants.ts` still carries a nine-line comment defending that grey, and **that comment is a correct reading of the pre-amendment document.** Both agents followed the contract exactly. **The contract was wrong, and this is the amendment that fixes the root cause rather than the symptom.**

**What was wrong with it, precisely.** F4's remedy conflated two different objects under one word, "figure":

| | The object F4 was written against | The object A8 governs |
|---|---|---|
| Placement | a boxed 768×432 illustration inside `#work`, on screenful 3 | the page's **ground** — `position: fixed`, mounted once in `layout.tsx`, at `--z-field` |
| Relationship to the routers | **competes with them** for attention inside the composition | the routers sit **on top of it** and are brighter than it is |
| What the accent is doing | **paint** — a flat `fill` inherited through `currentColor` | **emitted light** — additive blending, core-plus-halo falloff, gradients ending at `#D1A95400` |
| The right measure | aggregate px² of accent mass | contrast of type over the **composited** result (A8.4) |

Aggregate px² is a sound test for paint and a meaningless one for a light source. **A8 is not a loosening of F4; it is F4 applied to the right object, with six conditions that are stricter than F4 was** — A8.1 forbids inside the field the very thing F4 was written to catch, and A8.4 imposes a measured floor F4 never had.

##### F.2 The previous recommendation, overridden

**Recorded plainly, in the manner of DEV-6a, because this document has now been overruled twice on the accent and the pattern is worth seeing.**

**What this document previously recommended:** that the attestation poster and the live canvas both read `--color-foreground-secondary` — light `#5C5C5C`, dark `#A8A8A8`, with `FIGURE_FALLBACK_DARK` / `FIGURE_FALLBACK_LIGHT` as constants — and *"never `--color-accent`."* (§3.5 F4 remedy clause; §8.4 `AttestationPoster` Colour row.)

**What overrode it:**

1. **Measurement.** The recommendation shipped and was measured at **1.44:1** (`docs/12` §5.1). The prototype `scratchpad/proto-c-field.html` restaged the same concept as an emissive field and measured **9.3:1** for body copy over it, on real composited pixels via `gl.readPixels` — not a restatement, not a static pair, the actual rendered result. **[MEAS]**
2. **Owner decision.** The owner's verdict on the shipped appearance was *"terrible visually"*, and Direction C was chosen from `docs/11` Part 8 on that basis. Direction C's palette specification is *"near-black, bone, and gold as emitted light only — two colours and a light source."* A grey field is not a cheaper version of that idea; it is a different idea, and it is the one that was already tried.

**What the override cost, stated honestly rather than hidden.** The accent now covers more of the page than any previous version of F9 contemplated — unboundedly more, in dark mode. **[03 AP5]**'s router argument depends on accent scarcity, and A8.5's answer (the field is substrate, not a group) is an argument, not a measurement. **Phase 5 should verify AP5 empirically with the blur test (§1.4) over the live field, in both themes, rather than assume the exclusion came out right** — the same instruction DEV-6a left, for the same reason, and it was not carried out last time.

**What the override did not cost:** contrast. The field's dimmest authored string measures **9.3:1** composited against a 4.5:1 bar, where the grey it replaces measured 1.44:1. **The version that satisfied the written rule was the version that failed the standard the rule exists to serve.**

##### F.3 What is bound to what — the sequencing this amendment assumes

This document is a hard gate and this amendment is the gate on the field work. **`docs/15` §6 Lane T names `docs/04-design-system.md` as exclusively owned; every other lane routes findings here rather than editing.** The dependency that matters: **this amendment must be committed before the first change to `src/components/three/`,** because a QA pass run against the pre-amendment document will file the gold field at HIGH and a fix pass doing its job correctly will substitute the grey back. The mitigations are sequencing, deletion (`FIGURE_FALLBACK_*` leaves the tree in the same commit as the ramp change), §3.5's binding instruction, and `e2e/field-contrast.spec.ts` making a 1.44:1 field a **failing test** rather than a judgement call.

##### F.4 Open against this amendment — not resolved here

| # | Item | Why it is still open | Owner |
|---|---|---|---|
| **F-1** | **Light mode is warm in its surfaces and cold in its text.** DEV-14 warms all four light surfaces but leaves `#0A0A0A` / `#1A1A1A` / `#5C5C5C` / `#696969` / `#BDBDBD` exactly as they were, because `docs/11` §5.4 generated and measured a warm ladder for **dark mode only** and this document does not print values nobody measured. The result is defensible — high-contrast text reads as near-black regardless of a 6% ground tint — but it is a **partial** application of `docs/11` §5.2's finding. | A warm light text ladder must be generated and measured against all four new surfaces before it can be adopted. That is a research output, not an editorial choice. | `design-research` / `portfolio-visual-research`, then back to this document |
| **F-2** | **`--color-overlay` has no consumer.** It was added because `docs/11` §5.4 called for a fifth rung, and it immediately produced the only two contrast regressions in this amendment (muted metadata, 4.40 light / 4.07 dark), which are fenced by scope restriction rather than by moving a token. | Nothing on the page currently sits on it — §8.5 provides no modal, popover, tooltip or toast. If it acquires a consumer that needs muted metadata, the muted token moves (dark candidate `#948F85`, measured **6.11 / 5.67 / 5.17 / 4.52**); if it acquires none, a later pass should consider deleting it rather than carrying an unused surface. | next token pass |
| **F-3** | **Dark-only.** `docs/15` §7 R3 puts it to the owner: Direction C's own palette spec describes a dark-only design, and light mode now costs 16 tokens, a full second contrast matrix, the `--accent-foreground` inversion trap, **and** a field that is sectioned rather than continuous (A8.2). Dark-only, this system would be 17 hex + 4 alpha instead of 30 + 7. | **Not a build agent's call**, and not this document's. A8.2 adopts the sectioned-field answer so that work is not blocked on the question. | site owner |
| **F-4** | **A8.4 has no artifact yet.** The floor is specified; `e2e/field-contrast.spec.ts` does not exist. Until it does, A8.4 is a promise rather than a gate, and A8 is exactly as strong as the pre-amendment F4 was — which is to say, strong enough to be followed into a wrong result. | The spec is `docs/15` §5.1's deliverable and belongs to the field lane. | `three-d` / `review-accessibility` |
| **F-5** | **The blur test over the live field has never been run.** See F.2. | `docs/15` does not schedule it. | `review-design-qa`, Phase 5 |

---

## 13. Phase-5 checklist for `review-design-qa`

Mechanical. Every item is pass/fail against a section of this document.

> **Before running the accent items, read §3.5's binding instruction.** The gold attestation field resolves to **A8** and is **compliant by design**. Filing it under F4 or F9, or "fixing" it by substituting `--color-foreground-secondary`, `FIGURE_FALLBACK_DARK` or `FIGURE_FALLBACK_LIGHT` into the field ramp, **is itself the defect** — that substitution is what produced the 1.44:1 field. **A grey field is a regression, not compliance.**

- [ ] Every rendered colour resolves to a `--color-*` token from §3.2/§3.3, or to a `--field-*` token from §3.7 **inside the `.stage` scope only**. No literal hex, `rgb()`, or `hsl()` outside `globals.css`.
- [ ] Every rendered font-size resolves to a `--text-*` token from §1.2. No literal `px`/`rem` font sizes.
- [ ] No `font-weight` other than 400 or 500 anywhere in the computed styles (§1.1).
- [ ] ≥85% of rendered pixel spacing values are multiples of 4 (§2.1); each exception carries a comment naming its optical reason.
- [ ] No `cubic-bezier` in the codebase other than the three in §4. No `ease-in` or `ease-in-out` in any form — **including Tailwind's own `--ease-in` / `--ease-out` / `--ease-in-out` / `--ease-linear`, which must be `initial` in `@theme`** (§4, §10).
- [ ] No computed `transition-duration` or `animation-duration` exceeds **320ms** (§5.1).
- [ ] No `translateY` reveal distance exceeds **16px** (§5.2).
- [ ] **No JS animation library is in `package.json` or in any chunk** (§5.4). `defineMotionSpec`, `use-reveal`, `reveal-observer` and `lib/motion/tokens.ts` are present and passing their tests — they are the reduced-motion guarantee, not leftovers.
- [ ] **Every column carries `col` / `col--*` and no element carries `container`** (§1.5). `.col--prose` measures **768px outer / 672px content** at 1440×900; `--wide` 864/768; `--shell` 1120/1024. No `Container` is nested inside another `Container`.
- [ ] Every accent occurrence maps to **A1–A8** (§3.5). Every F1–F11 forbidden use is absent.
- [ ] **No accent mass exceeds the single `primary` CTA — excluding the one A8 field** (§3.5 F4). Enumerate computed `color`, `background-color`, `border-color`, `fill` and `stroke` in **both** themes; aggregate per figure rather than per element. ~~The attestation poster field must be `--color-foreground-secondary`, never accent~~ — **withdrawn 2026-09-11 (DEV-13); that instruction is what produced the 1.44:1 regression.** The poster and the canvas render the §3.7 field ramp.
- [ ] **The field resolves to A8. Substituting a foreground token into the field ramp is the defect, not the fix.** `FIGURE_FALLBACK_DARK` and `FIGURE_FALLBACK_LIGHT` must **not exist anywhere in the tree** (`grep -r FIGURE_FALLBACK src/` returns nothing), and neither must the nine-line comment that defended them.
- [ ] **A8.1 — the field is emitted, not filled.** Every accent pixel arrives from an additive emitter (`gl.blendFunc(gl.ONE, gl.ONE)`) or a `<radialGradient>` whose outer stop is `#D1A95400`. **No flat region of `--color-accent` exists in the field at any frame**, and no gradient anywhere fades to the keyword `transparent` (§2.8). A flat fill inside the field is still an F4 defect.
- [ ] **A8.2 — the stage is `#0A0908` in both themes.** The field never inherits `--color-background`. In light mode it is sectioned (full energy behind `#hero`, `#attestation`, `#ceremony`; masked out elsewhere); in dark mode it is continuous.
- [ ] **A8.3 — the scrim carves the composite.** `[data-scrim="padX,padY,amount"]` rects are packed into the composite pass as a rounded-box SDF. **A flat `rgba()` CSS sheet over the canvas is a defect**, because the pixels sampled would not be the pixels behind the type.
- [ ] **A8.4 — the measured floor.** ≥4.5:1 body / ≥3:1 `--text-h3`-and-above, on **composited pixels at the brightest authored frame**, via `e2e/field-contrast.spec.ts`. Ship target ≥7:1. A figure below 4.5:1 is a defect in the scrim; **dimming the field or greying the ramp is not a remedy**. `--color-border-interactive` on the ceremony's controls is measured in the same harness at ≥3:1.
- [ ] **A8.5 — exactly one field exists**, mounted once in `layout.tsx`, `aria-hidden="true"`, nothing inside it focusable, `pointer-events: none`. A second field is a defect. The field is **excluded** from the F9 per-viewport count; A3, A4 and A8 are the only exclusions and a fourth requires reopening §3.5.
- [ ] **A8.6 — poster and canvas match.** Ramp, point size, camera, density and band count are identical between `AttestationPoster.tsx` and the GL scene; the cross-fade shows no hue or scale shift. `--field-hot` and `--field-fg` are **references**, not retyped hexes.
- [ ] **The `.stage` type colours are applied in CSS, unconditionally — never by JavaScript** (§3.7). With **JS disabled in light mode**, `#attestation` body copy computes to `--field-fg-secondary` `#B9B4A9`, not `#1A1A1A` (which would be **1.14:1** on the stage — worse than the failure this amendment corrects). Assert this in both themes.
- [ ] **`--color-overlay` carries no muted or faint text** in either mode (§3.2, §3.3) — 4.40:1 light / 4.07:1 dark, both below 4.5:1.
- [ ] **Every gold glow's outer stop is `#D1A95400`, never `transparent`** (§2.8). One light origin only: `--light-x` / `--light-y` on `:root`, read by every lit edge, with no second light position anywhere.
- [ ] **No `--shadow-panel` without `--edge-lit` on the same element, and neither on an element that is not over the field** (§2.6). `--shadow-overlay` remains the only shadow permitted off the field.
- [ ] **Every accent marker measures ≥2px** (R-GOLD-1, F10). No 1px accent hairline anywhere.
- [ ] **The hero's proof-noun underlines are 2px `--color-accent` AT REST**, not only on hover (§3.5 A1, D4 resolution). The `InlineLink` `emphasis="proof"` variant exists.
- [ ] **No element with an accent background carries a literal text colour** — it must be `var(--color-accent-foreground)` (F11). Verify the `primary` Button renders **white** text in light mode and **near-black** in dark mode; the inverse is a 3.28:1 / 2.21:1 failure (§3.4).
- [ ] Focus ring present on every interactive element; measured ≥3:1 against the surface behind it in both modes (§7.3). **Worst measured case, after DEV-14, is 4.84:1 light (on `--color-overlay`) / 6.59:1 dark** — 5.29:1 / 7.54:1 on `--color-surface-raised`, which is the worst surface a control actually sits on today. Anything below those means a token was hard-coded. A ring **over the field** is measured under A8.4, not from §3.6.
- [ ] Every standalone interactive target measures ≥24×24 CSS px (§7.3, WCAG 2.5.8).
- [ ] With `prefers-reduced-motion: reduce`: every §6.1 row's static end state is present, and the page is visually identical to the animated page at rest (§6.1).
- [ ] **All five theme cases in §9.3 produce the correct first paint with no flash:** system light · system dark · stored dark on a light system · stored light on a dark system · JS disabled.
- [ ] With JS disabled: the OS preference is honoured in pure CSS, the theme toggle is **not rendered**, no element sits at `opacity: 0`, all copy present (§9.3, **[03 R30]**).
- [ ] The `:root:not([data-theme="light"])` guard is intact in `globals.css` — without it an explicit light choice loses to a dark OS preference (§9.2).
- [ ] The `[data-theme="dark"]` block and the `@media (prefers-color-scheme: dark)` block declare **identical** values (§9.4).
- [ ] Blur test: heading rhythm visible as distinct bands at 1440×900 and 390×844 (§1.4, **[03 AP3]**).
- [ ] **Blur test for [03 AP5], over the live field, in both themes** — the accent routers must still read as the brightest marks in the blurred frame with the field behind them. This verifies A8.5's argument empirically instead of assuming it. It was left as an instruction by DEV-6a and not carried out; §12.1 F.2 and F-5 leave it again, deliberately, as a **required** item rather than a suggestion.
- [ ] `document.body.scrollHeight / window.innerHeight ≤ 6` at **both** 1440×900 **and 390×844** (§2.3, **[03 R14]**). **[03 R14]** is viewport-independent; asserting only the desktop figure hid a 6.10 at mobile (§12.1 E, D17).
- [ ] Exactly one webfont request on first paint; `Space Grotesk` variable only; measured ≤23 KB (§1.1). **`:root`'s computed `--font-sans` is non-empty and `h1`'s computed `font-family` starts with `"Space Grotesk"`** — an empty `--font-sans` is the silent failure mode of §1.1 rule 1.
- [ ] No `box-shadow` **rendered on any element** other than `--shadow-overlay` on the nav sheet (§2.6). `@import "tailwindcss" source(none)` with an explicit `@source` is present, so no utility is generated from prose (§10).
- [ ] No bare numeric `z-index` anywhere; every one resolves to `--z-field`, `--z-grid`, `--z-header` or `--z-skip` (§2.7). There is no `--z-content` and nothing needs one.
- [ ] **No type value is retyped as a literal.** Every hand-authored `line-height` / `letter-spacing` beside a `font-size: var(--text-*)` is written as `var(--text-*--line-height, <literal>)` (§10 note 5).
- [ ] `border-radius: inherit` is **absent** from the focus rule; a focused `.btn--primary` still computes `8px` and a focused `.skip-link` still computes `9999px` (§7.2).
- [ ] The only `outline: none` on a focusable element is `main[tabindex="-1"]` (§7.2). Skip-link focus lands on `main` in Chromium, Firefox **and** WebKit.
- [ ] None of the §8.5 forbidden components exist in the tree.
- [ ] Print-to-PDF at Letter: text-selectable, links expanded, nothing lost to a dark background (§9.5, **[03 R29]**).

---

## 14. What this document does not decide

Flagged so no downstream agent invents an answer.

1. **Copy.** Phase 3 owns every string. This document constrains shape (`mechanism` ≤12 words, headings as claims), never wording.
2. **Section order.** Phase 3, against **[03 R13]**'s six-tier evidence hierarchy.
3. **The GLSL.** `docs/02` §6 owns the shader. This document owns only the frame, the poster, the readout type, and the gates.
4. **Syntax-highlighting colours.** None defined (§8.2). Adding them requires reopening §3.
5. **Whether a résumé PDF exists.** `docs/00` §6 and **[03 R24]** — still blocking. The nav slot is specified either way (§8.1).
6. **Icon set.** ~~`lucide-react` is installed (1.5 KB for 4 icons, `docs/02` §7)~~ — **amended 2026-09-11: `lucide-react` was installed, referenced zero times in `src/`, and removed.** Icons that ship are inline SVG. The accent remains forbidden on icon fills (F5), and any icon is constrained by the 44×44 target rule and §8.5's ban on icon grids. **Do not reinstall an icon library for fewer than a handful of icons** — that is how the 29.5 KB of Framer Motion and three other unused dependencies got in.
7. **Whether the résumé, the `<pre>` code block, or a real MDX post ever render correctly in practice.** All three are specified and none has executed against real content (`src/content/writing/` holds only `.gitkeep`; `resumeHref` is `null`). Correct by inspection, untested in fact — recorded so a later agent does not read "specified" as "verified."
