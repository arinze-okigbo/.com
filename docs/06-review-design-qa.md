# 06 — Design QA Review

**Phase:** 5 (review). **Enforces:** `docs/04-design-system.md` (the closed token set), `docs/05-information-architecture.md` (section order, headings chain, copy).
**Method:** exhaustive static analysis of `src/**` and the compiled stylesheet `.next/static/css/a3a6c85bdca7efd8.css`, plus computed-style inspection via Playwright against `next start` on port 3103 at 390×844, 800×900 and 1440×900, in light mode, dark mode, `prefers-reduced-motion: reduce`, and with JavaScript disabled.
**Date:** 2026-09-11. **Verdict: BLOCK** — two CRITICAL defects, both of which mean a headline clause of `docs/04` does not ship.

---

## 0. Headline

| Metric | Result |
|---|---|
| Strictly untraceable rendered values | **5 occurrences / 4 distinct** (D9, D10, D11, D12) |
| Token values duplicated as literals rather than referenced | **~24 occurrences** (D8) — trace by value, brittle by construction |
| Defects: CRITICAL / HIGH / MEDIUM / LOW | **2 / 1 / 5 / 12** |
| Copy shipped verbatim against `docs/05` | **YES — 44/44 strings matched exactly** |
| Placeholder strings in rendered output | **ZERO** |
| Cyera present in rendered output | **NO** — correctly cut, no orphaned reference |
| `--color-accent-foreground` inversion | **CORRECT in both modes** |
| Page height at 1440×900 | 5.28 viewports (budget 6) ✅ |

The token *discipline* in this codebase is unusually good — there is not a single raw hex, `rgb()`, `hsl()`, or magic `px` in any component, and no smuggled Tailwind arbitrary value: every `max-w-[…]` / `mt-[…]` / `pt-[calc(…)]` in the tree resolves to a `var(--token)`. The two CRITICAL defects are not token-discipline failures. They are **plumbing failures that silently disconnect correctly-authored tokens from the rendered page**, which is exactly the class of defect that survives five self-declared-compliant agents.

---

## 1. Defect list

### D1 — CRITICAL — The site does not render in Space Grotesk. The entire type system falls back to the system sans stack.

**File / line:** `src/app/layout.tsx:101`
**Offending value:** `<body className={spaceGrotesk.variable}>`
**Token it should have used:** `--font-sans` (docs/04 §1.1, §10 `@theme`)
**Measured:** computed `font-family` on `<html>`, `<body>`, `h1`, `h2`, `h3`, `.meta-line`, `.section-heading-intro` and every text node is `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", …`. `getComputedStyle(document.documentElement).getPropertyValue('--font-sans')` returns **the empty string**. `document.fonts` reports `Space Grotesk — unloaded` ×3.

**Mechanism.** `next/font` emits `--font-space-grotesk` inside the class `.__variable_dd5b2f`, which is applied to `<body>`. The compiled Tailwind theme layer declares, at `:root`:

```css
@layer theme{:host,:root{--font-sans:var(--font-space-grotesk),"Space Grotesk Fallback",…}}
```

At `:root`, `--font-space-grotesk` is undefined, so `--font-sans` is **invalid at computed-value time** and computes to the guaranteed-invalid value. `body { font-family: var(--font-sans) }` (globals.css:351) therefore resolves to nothing and inherits the Tailwind preflight fallback. The variable being defined further down the tree on `<body>` does not help: `--font-sans` was already invalidated where it was declared.

**Consequence beyond the family itself.** Every `ch`-based measure token (`--measure-lead` 30ch, `--measure-intro` 42ch, `--measure-display` 14ch, `--measure-h1/h2/h3`, `--measure-caption`, `--measure-mono`) is computed against the wrong font's `0` advance width, so seven of the nine measures in docs/04 §1.5 are rendering at the wrong pixel value. The 22,320-byte webfont that docs/04 §1.1 spends forty lines justifying is preloaded, fetched, and never painted — the byte budget is spent for nothing. Optical tracking (§1.3) was hand-tuned for Space Grotesk's wider set and is now applied to SF/Segoe.

**Fix:** move the variable class to the element where `--font-sans` is declared:
```tsx
<html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
…
<body>
```
(Alternatively add `--font-sans` to the non-`@theme` `:root` block, but the `<html>` move is one token and fixes `--default-font-family` too.)

---

### D2 — CRITICAL — The `672px` measure column does not exist. Tailwind's own `.container` utility overrides `.container--prose` / `--wide` / `--shell`, so every column renders at 1024px.

**File / line:** `src/components/ui/Container.tsx:34` (emits the literal class `container`); collision surface `src/app/globals.css:445–458`
**Offending value:** the class name `container`
**Token it should have used:** `--container-prose` (42rem), `--container-wide` (48rem), `--container-shell` (64rem) — docs/04 §1.5

**Mechanism.** Tailwind 4 generates a `.container` utility. The compiled stylesheet contains both:

```css
@layer components{.container{padding-inline:var(--gutter);inline-size:100%;margin-inline:auto}
                  .container--prose{max-inline-size:calc(var(--container-prose) + var(--gutter)*2)} …}
…
@layer utilities{ .container{width:100%}
                  @media (min-width:48rem){.container{max-width:48rem}}
                  @media (min-width:64rem){.container{max-width:64rem}} }
```

`utilities` is declared after `components` in Tailwind 4's layer order, so `.container{max-width:64rem}` wins over `.container--prose{max-inline-size:768px}` at every breakpoint ≥768px.

**Measured at 1440×900:**

| Element | Rendered | docs/04 §1.5 requires |
|---|---:|---:|
| `.container--prose` `max-width` | **1024px** | 768px (672 + 2×48 gutter) |
| `.container--wide` `max-width` | **1024px** | 864px (768 + 2×48) |
| `#work` container box | 1024px, `left: 208` | 768px, `left: 336` |
| attestation `<figure>` | **832 × 468** | 768 × 432 |
| hero `<h1>` left edge | **256px** | 384px |

**Visible consequence.** Body copy still measures 672px because every paragraph carries its own `max-w-[var(--measure-prose)]` — but that column is now *left-aligned inside a 1024px box*, not centred. At 1440px the page has ~256px of margin on the left and ~512px of dead space on the right. docs/04 §1.5's binding mechanic — "One column, one measure… the eye never has to choose a path" — is not what renders. The 3D frame is 8% oversized against `--container-wide`.

**Fix:** rename the base class so it cannot collide (e.g. `col` / `shell`), or add `@utility container { }` / scope the component rules into `@layer utilities` after Tailwind's. Renaming is the safer of the two.

---

### D3 — HIGH — The attestation poster paints a 830×466px field in `--color-accent`. That use appears on neither the A1–A7 allowlist nor as a sanctioned F4 exception.

**File / line:** `src/components/three/AttestationPoster.tsx:107` (`color: "var(--color-accent)"`, consumed by `fill="currentColor"` at :128)
**Offending value:** `--color-accent` applied to 248 `<circle>` elements across 3 `<g>` bands
**Token it should have used:** `--color-foreground` or `--color-foreground-secondary`, with the accent reserved for the readout marker (A7)

docs/04 §3.5 is explicit: *"ALLOWED — exhaustive. Anything not on this list is a defect."* A1–A7 name proof-noun underlines, entry-heading underlines, the focus ring, the primary CTA fill, the active-nav marker, `::selection`, and **one glyph** in the readout. A gold point-field is none of these. F4 forbids "any background region taller than 24px, except `--color-accent-tint` as `::selection` and the `primary` Button fill"; F5 forbids icon fills by default. `docs/05 §1056` independently states, for this exact figure, that "the `verified` glyph is **the only** accent (**A7**)".

This is also the largest single accent mass on the page, which directly undercuts F9 (one accent-bearing element group per viewport) and the AP5 attention-router argument that R-GOLD-1 exists to protect.

**Fix:** `color: "var(--color-foreground-secondary)"` in `POSTER_STYLE`, and the matching change in `runtime/color.ts` / `runtime/scene.ts` so the live canvas does not diverge from the poster. One line each; the poster-from-the-same-lattice-function property (adjudication c) makes this cheap.

---

### D4 — MEDIUM — Allowlist A1 is not implemented. Hero proof-noun underlines are `--color-border-interactive` at rest and only become accent on hover.

**File / line:** `src/app/globals.css:526–550`; `src/components/ui/InlineLink.tsx` (no variant prop)
**Offending value:** `.link { text-decoration-color: var(--color-border-interactive); text-decoration-thickness: 1px }` at rest for *all* links
**Token it should have used:** a 2px `--color-accent` underline at rest for the hero credential-sentence links

docs/04 §3.5 draws a deliberate distinction that the build collapsed:

- **A1** — *"Proof-noun links in the hero credential sentence … **2px** underline in `--color-accent` (R-GOLD-1), text stays `--color-foreground`"* — no hover qualifier.
- **A2** — *"The artifact heading link … 2px underline in `--color-accent` **on hover/focus**; `--color-border-interactive` at rest"* — hover qualifier present.

`docs/05 §1028` confirms the reading: `InlineLink ×3 | Splita, Queralt Inc., Snorkel AI — accent underlines, allowlist A1, one accent group F9` — against `§1042`'s `A2 — border-interactive at rest, accent on hover`.

**Measured:** `getComputedStyle(a.link).textDecorationColor` = `rgba(0,0,0,0.435)` light / `rgba(255,255,255,0.435)` dark; `::after` (the 2px accent bar) is at `matrix(0,0,0,1,0,0)` — `scaleX(0)` — at rest in both modes.

**Consequence.** At scroll 0 in light mode the only accent on the entire first viewport is the primary CTA fill. The R3 proof nouns — the three names the hero exists to carry — have no accent router until the mouse touches them, which is the exact peripheral-vision failure R-GOLD-1 was written to prevent.

**Note on the contract:** docs/04 §8.3's `InlineLink` table says "Rest: 1px underline in `--color-border-interactive`", contradicting its own §3.5 A1. The build followed §8.3. `docs/04` should be amended to give `InlineLink` an `emphasis: "proof" | "default"` prop, and the hero should pass `"proof"`.

**Fix:** add the variant; `.link--proof::after { transform: none }` with `background: var(--color-accent)` at rest.

---

### D5 — MEDIUM — Four components specified in docs/04 §8.4 do not exist; two unspecified components replace them.

**Files:** `src/components/three/`
**docs/04 §8.4 specifies:** `CanvasFrame` (props `poster`, `alt`, `attestation`, `children`), `CanvasPoster` (props `src`, `alt`), `HeroCanvasGate` (no props), `HeroCanvas`, `AttestationReadout`, `VisuallyHidden`.
**Shipped:** `AttestationFigure` (props `alt`, `caption`), `AttestationLive` (props `poster`, `fallbackReadout`, `caption`), `AttestationPoster` (props `alt`), `AttestationReadout` ✅, `runtime/mount.ts`.

`CanvasFrame`'s frame contract is honoured (768px column intent, `aspect-ratio: 16/9`, `--radius-lg`, 1px `--color-border-interactive` — all verified in `AttestationLive.tsx:41–49`) and `HeroCanvasGate`'s six gates are honoured in `AttestationLive.tsx:66–126` in the specified order, with `null` loading UI. So the *behaviour* is compliant and the naming is arguably better (the figure is no longer in the hero). But docs/04 §8 opens with "Nothing outside this list may be built without amending this document," and the document was not amended.

**Fix:** amend docs/04 §8.4 to the shipped names and prop contracts, or rename. This is a documentation-drift defect, not a rendering one.

---

### D6 — MEDIUM — Four components exist that docs/04 §8 does not specify.

| Component | File | Assessment |
|---|---|---|
| `PostRow` | `src/components/sections/PostRow.tsx` | A `ProjectEntry`-shaped row for `/writing`. Sanctioned by `docs/05 §6`, absent from docs/04 §8. |
| `RichText` | `src/components/sections/primitives/RichText.tsx` | Renders `TextSegment[]` into text + `InlineLink`. A composition helper, no styling of its own. |
| `ResumeAffordance` | `src/components/sections/primitives/ResumeAffordance.tsx` | The R24 pending slot. docs/04 §8.1 puts this behaviour inside `Nav`; extracting it is why it can also appear in the hero and contact block. |
| `PageTransition` | `src/components/motion/PageTransition.tsx` | Not in docs/04 at all. **Deliberately not mounted** and tree-shaken — confirmed absent from all shipped chunks. |

None is on the §8.5 forbidden list, and none introduces an untraceable value. **Fix:** add the first three to docs/04 §8.2/§8.3; either delete `PageTransition` or record it in §8 with its not-mounted status.

---

### D7 — MEDIUM — `WorkEntry`'s prop contract has drifted from docs/04 §8.2.

**File / line:** `src/components/sections/primitives/WorkEntry.tsx:26–46`

| Prop | docs/04 §8.2 | Shipped |
|---|---|---|
| `id` | — | added (anchor target) |
| `domain` | — | added (4th metadata item, e.g. `splita.co`) |
| `role` | `string` | `string \| null` |
| `period` | `string` | `string \| null` |
| `outcome` | `string?` | `string \| null` |

`domain` and the nullable `role`/`period` are required by `docs/05 §3.2` (the Snorkel AI entry ships `Snorkel AI · snorkel.ai` because §11 Q7/Q8 are unresolved), so the drift is content-driven and correct. `docs/04` §8.2, which claims to be "the single most constrained contract in this system", is simply out of date. **Fix:** amend docs/04 §8.2.

---

### D8 — MEDIUM — ~24 type-token values are retyped as literals instead of referenced, in `@layer components` and in three inline `CSSProperties` objects.

**Files / lines:**
`src/app/globals.css` — 477–478, 483–484, 490–491, 515–516, 590–591, 855, 887–888, 896–897, 915–916, 935
`src/components/three/AttestationFigure.tsx:39–40` (`lineHeight: 1.55`, `letterSpacing: "-0.011em"`)
`src/components/three/AttestationReadout.tsx:25–26` (`lineHeight: 1.5`, `letterSpacing: "0em"`)
`src/components/three/AttestationLive.tsx` — none (clean)

**Offending values:** `line-height: 1.2 / 1.3 / 1.4 / 1.45 / 1.5 / 1.55`, `letter-spacing: -0.01em / -0.011em / -0.13px / 0em`
**Token they should have used:** `--text-h2--line-height`, `--text-h3--letter-spacing`, etc.

Every one of these **matches docs/04 §1.2 exactly** — I verified all 24 against the scale table and found zero wrong numbers, so no rendered value is currently incorrect. They are filed because docs/04 §0 says "Every value a later agent renders must be one of the tokens below, **referenced by name**", and because a future edit to `--text-h2--line-height` in `@theme` will silently not reach `.section-heading--2`.

**Root cause, worth recording:** Tailwind's `--text-*--line-height` companion properties are only applied by the `text-*` *utility*. Hand-written CSS that does `font-size: var(--text-h2)` gets no line-height. There is no `--text-h2-line-height` token in docs/04 §10 to reference.
**Fix:** either use the `text-h2` utility on the element and drop the bespoke rule, or add standalone `--leading-*` / `--tracking-*` tokens to docs/04 §10.

---

### D9 — LOW — OG border colour is `#2A2A2A`; docs/04 §3.6 computes the composite as `#282828`.

**File / line:** `src/lib/seo/og-tokens.ts:29`
**Offending value:** `border: "#2A2A2A"`
**Token it should have used:** docs/04 §3.6, dark `--color-border` `#FFFFFF1F` over `--color-background` `#0A0A0A` = **`#282828`**
**Fix:** `"#282828"`. (The comment on the line claims it is that composite, so this is a transcription slip, not a decision.)

---

### D10 — LOW — Untokenised `maxWidth: 900` in the OG card.

**File / line:** `src/lib/seo/render-og-image.tsx:153`
**Offending value:** `maxWidth: 900`
**Token it should have used:** none exists. Every measure in docs/04 §1.5 is `ch`/`rem`-based and Satori resolves neither against a 1200×630 canvas.
**Fix:** add an `OG_MEASURE` entry to `og-tokens.ts` derived from a docs/04 measure (e.g. `--measure-h2` 28ch at 31px ≈ 490px, or `--measure-prose` 672px), and escalate to docs/04 §10 if neither fits. Do not leave a bare 900.

---

### D11 — LOW — Untokenised scroll-spy threshold `-60%`.

**File / line:** `src/components/layout/Nav.tsx:37`
**Offending value:** `const ACTIVE_BOTTOM_MARGIN = "-60%"`
**Token it should have used:** none exists. docs/04 §5.3 tokenises the *reveal* trigger (`rootMargin: "0px 0px -15% 0px"`, exported as `REVEAL_ROOT_MARGIN`) but says nothing about the active-nav observer.
**Fix:** escalate to docs/04 §5.3 for a `--nav-spy-margin` equivalent, or reuse the declared trigger. `HEADER_OFFSET_PX = 64` on line 34 is acceptable — it is documented as mirroring `--header-height` and JS cannot cheaply read the custom property inside an observer config.

---

### D12 — LOW — Untokenised `z-index` values.

**File / line:** `src/app/globals.css:660` (`.skip-link { z-index: 3 }`), `:684` (`.site-header { z-index: 2 }`)
**Offending value:** `3`, `2`
**Token it should have used:** none exists — docs/04 declares no stacking scale.
**Fix:** escalate a three-step `--z-header / --z-overlay / --z-skip` set into docs/04 §2. The ordering itself is correct (skip link above the sticky header).

---

### D13 — LOW — The hero adds a closing pad, so the hero→work gap is 208px, not 144px.

**File / line:** `src/components/sections/primitives/Hero.tsx:40`
**Offending value:** `pb-[var(--space-16)]` (64px) on top of `#work`'s `padding-block-start: var(--section-gap)` (144px)
**Token it should have used:** none — docs/04 §8.2 gives `Hero` `padding-block-start` only, and §2.3 makes the section rule "applied as a gap, not as symmetric padding" precisely so gaps cannot compound.
**Measured:** hero `padding-block-end: 64px`, `#work` `padding-block-start: 144px`.
**Fix:** drop `pb-[var(--space-16)]`; `#work`'s gap already separates them. (The same class is on `not-found.tsx:26` and `writing/page.tsx:30`, where nothing follows, so it is harmless there.)

---

### D14 — LOW — `Section`'s `isLast` prop and the `.section--last` rule are dead code.

**File / line:** `src/components/ui/Section.tsx:17`, `src/app/globals.css:466–468`
**Measured:** `#contact` computes `padding-block-end: 0px`; no call site passes `isLast`.
The closing gap is instead supplied by `.site-footer { margin-block-start: var(--section-gap) }` (globals.css:850), which measures 144px/96px/72px correctly at all three breakpoints — so the rendered result is right and is not double-counted. But docs/04 §2.3 names the section as the owner of that gap.
**Fix:** pass `isLast` on `ContactSection` and drop the footer margin, or delete `isLast` / `.section--last` and amend docs/04 §2.3.

---

### D15 — LOW — `ease-in` ships in the stylesheet as both a custom property and a utility class.

**File:** compiled `.next/static/css/a3a6c85bdca7efd8.css`
**Offending values:** `--ease-in: cubic-bezier(.4,0,1,1)` in `@layer theme{:root}`; `.ease-in{transition-timing-function:var(--ease-in)}`; also `.ease-in-out`, `.ease-out`.
**Token it should have used:** docs/04 §4 — three easings, and *"`ease-in` is forbidden in any form — CSS keyword, bezier, or Framer Motion string."*
**Assessment:** these are Tailwind defaults that `@theme` did not remove, and the utility classes were emitted because Tailwind's scanner matched the strings `ease-in` / `ease-out` inside *comments* in `globals.css` and `tokens.ts`. **No element on the page uses any of them** — verified by enumerating `transitionTimingFunction` on every node in both modes: only `cubic-bezier(0.4, 0, 0.2, 1)` and `cubic-bezier(0, 0, 0.2, 1)` appear. Dead CSS, but docs/04 §2.2 sets the precedent of nulling unwanted Tailwind defaults.
**Fix:** add `--ease-in: initial; --ease-out: initial; --ease-in-out: initial;` to the `@theme` block, exactly as the breakpoints are nulled.

---

### D16 — LOW — Dead Tailwind utilities emitted from comment text, including a `box-shadow` rule.

**File:** compiled CSS.
**Offending values:** `.shadow{--tw-shadow:0 1px 3px 0 #0000001a,…}`, `.ring{…}`, `.h-64`, `.h-72`, `.py-12/14/16/24/36`, `.px-2/4`, `.p-4`, `.blur`, `.invert`, `.font-serif`, `.text-xs`, `.truncate`, `.uppercase`, `.italic`, `.accent-foreground{accent-color:…}`.
**Token they should have used:** n/a — none of these classes appears in any rendered element. `#0000001a` is not a docs/04 value.
**Assessment:** docs/04 §2.6 says "Any other `box-shadow` in the codebase is a defect." I read that as scoped to *rendered* shadows — **verified zero `box-shadow` on any element in the rendered page at any breakpoint**, and the only authored one is `--shadow-overlay` on `.js .nav-sheet` below 768px, which is correct. Filed as LOW for the dead bytes and because a future agent grepping the stylesheet will find a shadow rule.
**Fix:** narrow the Tailwind `@source` globs, or accept ~1 kB of dead CSS.

---

### D17 — LOW — Page height is 6.10 viewports at 390×844, over the R14 budget of 6.

**Measured:** `document.body.scrollHeight / window.innerHeight` = **6.10** at 390×844; **5.28** at 1440×900.
docs/04 §13's checklist only asserts this at 1440×900, where it passes comfortably. Flagged because `[03 R14]` is viewport-independent and `docs/05 §3.5` names `credentialsDetailLine` (`src/content/about.ts:51`) as the first thing to cut if the budget is exceeded — that 260-word line is ~120px on mobile and would bring the page back under 6.
**Fix:** content decision, not a token defect. Route to `content` / `information-architecture`.

---

### D18 — LOW — Stale `TODO(content)` in a source comment.

**File / line:** `src/components/three/AttestationFigure.tsx:17`
**Offending value:** `TODO(content): wrap this in <Container width="wide"> at the call site`
**Assessment:** already done — `SelectedWorkSection.tsx:71` wraps it in `<Container width="wide">`. The TODO is in a JSDoc comment, never reaches the DOM, and does not violate the zero-placeholder rule (verified: no `[[`, `NEEDS-FACT`, `TBD`, `TODO`, "coming soon" or `Lorem` in rendered output). **Fix:** delete the line.

---

### D19 — LOW — `--text-label` is declared but rendered nowhere on the site.

**File:** `src/app/globals.css:194–197`
The token ships with its line-height, tracking and weight companions; no element uses `text-label`. Its only consumer is `OG_TYPE.label` in the social card. This is consistent with docs/04's own treatment of `--space-48` ("declared because `docs/01` lists it… nothing in this system uses it") and with F6 removing the accent eyebrow, so it is **not** a defect — recorded so the next reviewer does not re-derive it.

---

### D20 — LOW / informational — A focused `Button` loses its 8px radius.

**Measured:** `.btn--primary` computes `border-radius: 8px` at rest and **`0px` while `:focus-visible`**.
**Cause:** docs/04 §7.2's own global rule, shipped verbatim at `globals.css:387`: `border-radius: inherit` on `:focus-visible`. The button inherits `0px` from its flex-row parent.
**Assessment:** not a build defect — the implementation is byte-faithful to the spec. But the spec produces a square-cornered button the moment it is keyboard-focused. **Fix:** docs/04 §7.2 should scope `border-radius: inherit` away from elements that set their own radius, or drop it (the outline already follows the element's own border-box shape at a 2px offset).

---

## 2. Explicit passes

Each of these was checked against the rendered page, not against the source.

**Token compliance**
- ✅ Zero raw hex, `rgb()`, `hsl()` or `oklch()` literals anywhere in `src/**` outside `globals.css`'s palette blocks, `og-tokens.ts` (documented Satori restatement) and `three/constants.ts` (documented `--color-accent` fallbacks, both values exact).
- ✅ Zero Tailwind arbitrary values containing a magic number. Every one of the 24 `max-w-[…]`, `mt-[…]`, `gap-[…]`, `pt-[…]`, `pb-[…]` occurrences resolves to `var(--token)` or `calc(var(--token) + var(--token))`. This is the thing that most often goes wrong and it did not.
- ✅ No `px`/`rem` font-size literal in any component; every text element uses a `text-*` utility or `var(--text-*)`.
- ✅ Compiled CSS contains exactly three authored `cubic-bezier` values: `(.4,0,.2,1)`, `(0,0,.2,1)`, `(.32,.72,0,1)`. No fourth. No spring.

**`@theme` block vs docs/04 §10**
- ✅ Byte-for-byte match on all 15 colour mappings, both font stacks, both weights, all 9 type steps with their 4 companion properties each, `--spacing`, all 3 containers, all 5 breakpoint entries (including `sm`/`xl`/`2xl` → `initial`), all 4 radii, all 3 easings. Nothing added, nothing missing, nothing renamed.
- ✅ `@theme inline` retained (§10's mandatory note).

**Type scale — measured in the rendered CSS, not the token definitions**
- ✅ Tracking crosses zero exactly as §1.3 requires: caption `-0.01em` → body `-0.011em` → **lead `0em` → h3 `0em`** → h1 `-0.02em` → display `-0.028em`. Computed: `-0.13px` @13px, `-0.176px` @16px, **`normal` @20px and @25px**, `-0.31px` @31px, `-2.0384px` @72.8px.
- ✅ Line heights: 1.4 / 1.55 / 1.45 / 1.3 / 1.2 / 1.08 / 1.05, all exact.
- ✅ Clamps: display = 72.8px at 1440 (`4.5vw + 0.5rem`), h1 = 49px (max reached), h2 = 31px (max reached). Arithmetic matches §1.2's verification table.
- ✅ Font weights on the whole page: **only 400 and 500**. No 600, no 700. `font-synthesis-weight: none` applied.
- ⚠️ Measure column and `ch`-based measures are wrong in absolute pixels — see D1 and D2.

**Colour, both modes**
- ✅ Dark `--accent` = `#d1a954`; light `--accent` = `#7c5e1d`. Both exact.
- ✅ **`--color-accent-foreground` inverts correctly.** Measured on both `btn--primary` instances: light mode `background: color(display-p3 .47 .37 .1)` with `color: rgb(255,255,255)`; dark mode `background: color(display-p3 .81 .66 .3)` with `color: rgb(10,10,10)`. No literal colour on any accent fill. **F11 holds — this is the failure docs/04 §3.4/§8.3 predicted and it did not happen.**
- ✅ `[data-theme="dark"]` and the `@media (prefers-color-scheme: dark)` block declare identical values — diffed all 16 declarations, zero drift (§9.4).
- ✅ The `:root:not([data-theme="light"])` guard is intact (§9.2).
- ✅ P3 upgrade block present and correctly scoped to all three selectors.
- ✅ **R-GOLD-1 holds: every accent marker measures ≥2px.** `.link::after` = 2px (verified `height: 2px` on all 18 links in both modes); `.nav-link[aria-current]::after` = 2px; focus ring = 2px; OG accent rule = 4px. Zero 1px accent hairlines — **F10 holds**.
- ✅ F4: exactly two accent-filled regions on the page, both 44px `btn--primary` (A4), one per viewport.
- ✅ F2: no heading carries an accent fill. F6: no accent label/eyebrow exists. F7: no gradient anywhere.
- ✅ A6: `::selection` uses `--color-accent-tint`, never `--color-accent`.
- ✅ A7: readout `✓` marker is `--color-accent`, one glyph, `aria-hidden`, on `--color-background` (R-GOLD-2 satisfied).
- ❌ The poster field — D3.

**Spacing**
- ✅ `--section-gap` measured **72 / 96 / 144px** at 390 / 800 / 1440. `--gutter` measured **24 / 32 / 48px**. `--header-height` 64px at all three.
- ✅ Hero top offset = 112px = `calc(64 + 48)`, exactly §2.3's arithmetic.
- ✅ Footer top gap tracks `--section-gap` at all three breakpoints.
- ✅ Every rendered spacing value is a `--space-*` / `--rhythm-*` multiple of 4. The only sub-4px values in the codebase are `0.15em 0.35em` on inline `<code>` (docs/04 §8.2 verbatim) and `0.2em` underline offset (§8.3 verbatim), both carrying optical comments.
- ⚠️ `--measure-prose` renders at 672px on paragraphs ✅ but the *column* does not — D2.

**Motion**
- ✅ Reveal: `opacity 0→1` + `translateY(8px)`, `280ms`, `cubic-bezier(0, 0, 0.2, 1)`. **No 40px fade-up anywhere** — the `translateY` matrix is `matrix(1,0,0,1,0,8)`, i.e. exactly 8px.
- ✅ Hero reveal is the single `distance="lg"` (16px), with `opacity: 1` pinned inline so the LCP text paints on frame 1.
- ✅ Stagger measured at `0s / 0.05s / 0.1s`, capped by `min(var(--reveal-index), 4)`.
- ✅ Dominant easing is `cubic-bezier(0.4, 0, 0.2, 1)` — it is the timing function on every hover/press/colour transition (`.btn`, `.link`, `.nav-link`, `.link-standalone`, `.theme-toggle`). `--ease-entrance` appears only on reveals and the nav-sheet open.
- ✅ **No computed `transition-duration` or `animation-duration` anywhere exceeds 0.32s.** Enumerated across every node in both modes: only `0.15s`, `0.24s`, `0.28s`.
- ✅ `--ease-glide` is used exactly once, in `three/constants.ts`, for the shader resolve.
- ✅ Animated properties are `transform` and `opacity` only; colour/border transitions at `--duration-fast`.
- ✅ `html { scroll-behavior: smooth }` is gone; Lenis owns scroll.
- ✅ Framer Motion durations read from `lib/motion/tokens.ts`; no inline number in any spec.

**Reduced motion**
- ✅ With `prefers-reduced-motion: reduce`: **zero `data-reveal` attributes in the DOM** — `useReveal` returns before the observer is constructed, so M1/M2/M3 are real static end states, not 1ms transitions.
- ✅ M4 verified: `.link::after` is `transform: none`, `background: rgba(255,255,255,0.435)` (= `--color-border-interactive`), permanently visible at 2px; `text-decoration` removed so it does not double.
- ✅ M5/M6 verified: no transform on `.btn` or `.link-standalone` in any state.
- ✅ M10 verified: focus ring instant, full width, never suppressed.
- ✅ M11 verified: Gate 1 checks `isReducedMotionPreferred()` before any `import()`, so 0 KB of OGL downloads.
- ✅ M12 verified: `SmoothScrollProvider` never constructs Lenis; the `.lenis` class never lands, so none of its base rules match.
- ✅ Only elements below `opacity: 1` are `.skip-link` (by design) and the poster's decorative depth `<g>` bands.
- ✅ M15: no marquee, cursor effect, tilt, or magnetic dock exists in the tree.

**Focus**
- ✅ `outline: 2px solid` + `outline-offset: 2px` in `--color-accent`, measured on the primary button in both modes. `:focus-visible` only; `:focus:not(:focus-visible){outline:none}` present.
- ✅ `scroll-margin-block-start: calc(var(--header-height) + var(--space-4))` = 80px applied to `:target`, `[id]` and every focusable.
- ✅ Targets: `.btn` 44px, `.nav-link` 44px, `.theme-toggle`/`.nav-toggle` 44×44, `.skip-link` 44px, `.link-standalone` 24px (44px at `pointer: coarse`).

**Theme switching**
- ✅ `ThemeScript` renders inline in `<head>`, synchronous, no `async`/`defer`, `try/catch` around `localStorage`, `.js` added outside the `try`.
- ✅ JS disabled: `<html>` carries no `js` class, the theme toggle is in the DOM but `display: none`, the OS preference resolves in pure CSS, **no element sits at `opacity: 0`** (reveal CSS is `.js`-scoped), and all 4,877 characters of copy are present.
- ✅ `<meta name="color-scheme" content="light dark">` via the `viewport` export.

**Shadows / forbidden components**
- ✅ Zero `box-shadow` on any rendered element. The only authored shadow is `--shadow-overlay` on the mobile nav sheet.
- ✅ None of §8.5's forbidden components exists: no `Tag`/`Chip`/`Badge`, no `Card`, no `SkillBar`/`StatCounter`, no `LogoGrid`, no `GitHubActivity`, no `Marquee`/`CustomCursor`/`MagneticDock`/`TiltCard`, no `Modal`, no content `Accordion`, no `Toast`/`Tooltip`. `WorkEntry` and `ProjectEntry` render as rows with a `--color-border-subtle` hairline, no background, no icon, no logo, and carry no `tags` prop.

**Fidelity to docs/05**
- ✅ **Section order exact:** Hero → Selected work (carrying the attestation figure after `#queralt`) → Projects → Writing (renders `null`, 0 posts) → About → Contact. Matches `docs/05 §1`.
- ✅ **Headings chain exact**, matching `docs/05 §8`'s fallback chain (Cyera cut):
  `h1 Arinze Okigbo` → `h2 Group payments at Splita. Browser authentication at Queralt Inc. Model evaluation at Snorkel AI.` → `h3 Splita — group payments collected up front` → `h3 Browser-native authentication — FIDO2, PKI, and Microsoft Entra ID` → `h3 LLM output evaluation inside production AI pipelines` → `h2 Open-source: SkyView layers live flight traffic on a photorealistic 3D globe.` → `h3 SkyView — browser-based 3D globe on Google Photorealistic 3D Tiles` → `h2 TechBuzz, AI training, and a Nigerian tech incubator came before Splita.` → `h2 arinze@splita.co — direct email, plus GitHub, LinkedIn, X, and the résumé.`
- ✅ **Copy shipped verbatim.** I string-matched 44 authored strings — hero claim, credential sentence, all three artifact labels, both CTAs, the work `h2` and `intro`, all three entries' `artifact` / `mechanism` / every `contribution` clause / `outcome`, the project heading / intro / artifact / mechanism / body / meta, the about heading and all three paragraphs, the education line, both credentials lines, the contact heading, the poster `alt`, both attestation caption paragraphs, the résumé pending string, the footer copyright, and all four contact link labels — against a whitespace-normalised `docs/05`. **44/44 matched exactly. Nothing was silently reworded.**
- ✅ Zero placeholder strings in rendered output. `[[NEEDS-FACT`, `TBD`, `TODO`, "coming soon", `Lorem`, and bracketed stubs appear only in source comments and in `content.test.ts`'s guard list. `content.test.ts:64–89` enforces this at test time.
- ✅ **The Cyera entry is absent and no orphaned reference remains in rendered output.** `WORK_HEADING_WITH_CYERA` exists in `work.ts` as an unreachable alternate string (guarded by `workEntries.length === 4`), correctly documented as a data-change restoration path; it never reaches the DOM. The hero carries four proof nouns without it, satisfying R3.
- ✅ Missing facts are *omitted*, not stubbed: the Snorkel AI metadata line renders `Snorkel AI · snorkel.ai` with `role` and `period` dropped (§11 Q7/Q8); the Splita personal-contribution sentence and the Queralt constraint clause are absent rather than invented; `resumeHref === null` renders the adjudicated string `Résumé (PDF) — not yet published`, which states a true fact.

---

## 3. Adjudications of the four self-declared deviations

### (a) `globals.css` is 1,105 lines, over the project's 800-line file ceiling — **ACCEPTED**

The ceiling exists to force cohesion in modules that accrete logic. This file has none: it is a declarative token table (§1–§4, ~250 lines), a base/focus/reveal layer (~120 lines), a components layer (~490 lines), and two media blocks (~130 lines), fronted by a ten-entry index. docs/04 §10 prescribes it explicitly as "Paste-ready replacement for `src/app/globals.css`" and §0 makes it the one artefact every downstream agent reads; splitting the token surface would defeat that.

There is also a hard technical reason: §6 (reduced motion) and §9.5 (print) must be authored **last** to win the cascade over the `@supports (animation-timeline: view())` block — docs/04 §6.1 M14 says so in as many words. Splitting into `@import`ed files introduces an ordering dependency that is invisible at the call site and trivially broken by a future edit.

**Where the agent overstates its case:** the ~490-line `@layer components` block is *not* the token surface and is not cascade-order-sensitive relative to the token blocks. It could move to a `components.css` imported immediately after, leaving `globals.css` at ~615 lines and inside the ceiling, with no behaviour change. The deviation is defensible, but it was not forced. Accept as shipped; note the split as available if the ceiling is ever enforced mechanically.

### (b) `ThemeScript` is a Server Component where docs/04 §8.1 says `'use client'` — **ACCEPTED; docs/04 §8.1 should be corrected**

The component has no hooks, no event handlers, no state, and no browser API access at render time. It returns a `<script dangerouslySetInnerHTML>`. Adding `'use client'` would pull it into the client bundle and register it with React's client manifest in order to emit **byte-identical HTML**.

The behavioural contract lives in docs/04 §9.3, not §8.1, and §9.3 requires only that the script be synchronous, blocking, and inside `<head>`. Verified in the served HTML: the script tag is present in `<head>`, is inline, and carries neither `async` nor `defer`; the `try/catch` wraps only the `localStorage` read; `classList.add("js")` sits outside it. All five §9.3 theme cases were exercised (system light, system dark, stored dark on a light system, stored light on a dark system, JS off) and all five resolve correctly with no flash.

The `'use client'` in docs/04 §8.1's table is a transcription error — it is the only entry in that table where the directive would produce no observable difference. **Ruling: accept, and amend docs/04 §8.1 to drop the directive rather than leaving the codebase in permanent documented violation.**

### (c) Inline SVG poster instead of AVIF via `next/image` per docs/04 §8.4 — **ACCEPTED, with one consequence the agent did not flag**

Both stated reasons hold on inspection:

1. **The figure is no longer the LCP element.** It sits after the Queralt entry inside `#work`, at ~screenful 3 (measured `top` ≈ 2,300px at 1440×900). `[03 R32]`'s "poster is the LCP element, not the canvas" was written when the figure was in the hero; it no longer binds. The actual LCP element is the hero `h1`, which is plain server-rendered text.
2. **Divergence elimination is real and is the stronger argument.** `AttestationPoster` calls the same `buildLattice()` and the same `createProjector()` the vertex shader mirrors, at the same committed seed, and reads `SIZE_JITTER_BASE` / `SIZE_JITTER_SPAN` / `DEPTH_FADE_FLOOR` from `lattice/shaders.ts`. A hand-generated AVIF is a second artefact that can silently drift; `docs/02 §9` names that drift as a risk. This is a structurally better answer than the one docs/04 §8.4 specified.

Cost accounting the agent should have stated: the SVG is 248 `<circle>` elements in 3 `<g>` depth bands, inlined into the home route's HTML on every request, where an AVIF would be a separately immutable-cacheable asset. At the measured page weight (1.81 kB route + 101 kB shared JS) this is not material, and it removes one request and one `next/image` layout path. CLS is unaffected — the aspect box reserves layout and the poster cross-fades with `opacity` only.

**The consequence not flagged:** carrying the accent through `currentColor` is presented as a benefit ("one artifact is correct in both modes"), and it is — but the colour it carries is `--color-accent`, which puts an 830×466px gold field on the page outside the A1–A7 allowlist. See **D3**. The AVIF path would have had the same problem; the deviation did not cause it. **Ruling: accept the SVG, fix the fill.**

### (d) Bare `import()` instead of `next/dynamic` with `ssr: false` per docs/02 §8.2 — **ACCEPTED**

`next/dynamic` exists to render a lazily-loaded React *component* with a loading state. Neither applies here:

- docs/04 §8.4 specifies the gate's loading UI as **`null`** — "never a spinner. The poster *is* the loading state." There is nothing for `next/dynamic` to render while loading.
- The scene is not a child element. `AttestationLive` imports `mountLattice` and calls it imperatively against a `ref`; there is no component to lazily render.

So `next/dynamic` would buy nothing and cost the ~1 kB shared runtime the agent measured, plus React in the deferred chunk.

The `ssr: false` requirement is met *more strongly* than `next/dynamic` would meet it: the `import()` lives inside a `useEffect`, behind six sequential gates (reduced motion → Save-Data/2g → `hardwareConcurrency`/`deviceMemory` → WebGL2 probe → `IntersectionObserver` approach → `requestIdleCallback`), so it cannot execute on the server at all and cannot execute on a client that fails any gate.

**Verified empirically:** no WebGL primitives (`createProgram`, `drawArrays`, `WEBGL`) appear in either shared chunk; `/` reports 107 kB First Load JS; the OGL code sits in a separate on-demand chunk. Gate 1 (`isReducedMotionPreferred`) is checked before any other work, so reduced-motion visitors pay 0 KB, exactly as M11 requires. **Ruling: accept, and amend docs/02 §8.2 to permit a bare `import()` where the loading UI is `null` and the target is not a React component.**

---

## 4. Recommended order of work

1. **D1** — one-line move of `spaceGrotesk.variable` from `<body>` to `<html>`. Unblocks the entire type system.
2. **D2** — rename the `container` base class. Restores the 672px column and the 768px canvas frame.
3. **D3** — change the poster/scene fill off `--color-accent`.
4. Re-run this review's measurements after 1 and 2: every `ch`-based measure and every column width in §2 was taken against the wrong font and the wrong container width, so those figures must be re-taken before sign-off.
5. D4–D8, then the LOW items and the four docs/04 amendments the adjudications call for (§8.1 `ThemeScript`, §8.2 `WorkEntry`, §8.4 component names, §7.2 `border-radius: inherit`).
