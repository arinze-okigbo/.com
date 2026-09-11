# 06 — Accessibility Review

**Phase:** 5 (adversarial review). **Standard:** WCAG 2.2 Level AA.
**Date:** 2026-09-11. **Reviewer:** `review-accessibility`.
**Build under test:** `next build` (exit 0) → `PORT=3102 npm run start`, commit `c347819` + working tree.
**Tooling:** Playwright 1.51 (Chromium 134 headless) + `axe-core` 4.11.1 injected from `node_modules` via `page.addScriptTag`. No new dependency was added; no `claude-in-chrome` tool was used. Every number below is measured against the rendered page, not read from `docs/04`.

**Coverage:** 4 routes (`/`, `/writing`, `/writing/<missing>`, `/<missing>`) × 2 themes × 2 viewports = 16 axe scans, plus dedicated probes for keyboard traversal, focus appearance, contrast, semantics, no-JS, reduced motion, target size, forced colours and reflow at 1440×900 / 390×844 / 320×640 / 720×450.

---

## 0. Headline

| Metric | Result |
|---|---|
| axe violation instances reported | **8** across 16 scans |
| …reproducible on re-test | **4** (all one rule: `document-title`) |
| …non-reproducible (hydration race, 0/3 and 0/5 re-tests) | 4 |
| CONFIRMED defects | **8** (1 CRITICAL · 2 HIGH · 5 MEDIUM) |
| LOW / informational | **5** |
| SUSPECTED | **2** |
| Explicit passes recorded | 21 |

**Most serious problem:** defect 1 — the only résumé affordance on the site renders at **1.83:1** (light) / **2.23:1** (dark). It is the single thing a recruiter is most likely to look for, it appears three times, and `docs/04 §3.6` explicitly forbids the token that produces it.

---

## CONFIRMED DEFECTS

### 1. CRITICAL — `--color-foreground-faint` carries information-bearing text at 1.83:1

- **SC violated:** 1.4.3 Contrast (Minimum), AA. Also breaks `docs/04 §3.2/§3.3` ("`--color-foreground-faint` … **Never information-bearing text**") and `docs/04 §3.6`.
- **Files / lines:**
  - `src/components/sections/primitives/ResumeAffordance.tsx:23` — `<span aria-disabled="true" className="text-body text-foreground-faint">`
  - `src/components/layout/Nav.tsx:153` — `<span className="nav-pending" aria-disabled="true">`
  - `src/app/globals.css:751` — `.nav-pending { color: var(--color-foreground-faint) }`
- **Measured evidence** (computed style, production build, 1440×900):

  | Theme | Rendered colour | Rendered background | Ratio | Bar (16 px / 400) |
  |---|---|---|---:|---:|
  | light | `rgb(189,189,189)` `#BDBDBD` | `rgb(252,252,252)` | **1.83:1** | 4.5:1 |
  | dark | `rgb(74,74,74)` `#4A4A4A` | `rgb(10,10,10)` | **2.23:1** | 4.5:1 |

  Three occurrences per page render: header nav slot, hero secondary action, contact block list item. Text: `"Résumé (PDF) — not yet published"`.
- **Why the 1.4.3 exception does not apply.** 1.4.3 exempts "text … that is part of an inactive user interface component." These are bare `<span>` elements with no role. `aria-disabled` on an element whose computed role is `generic` is **not supported by ARIA** and is discarded — the string is exposed to AT as ordinary static text, not as a disabled control. `docs/04 §3.6` anticipated exactly this: the faint token is licensed only for a control that "**must** also carry `aria-disabled="true"` and a non-colour cue". A `<span>` is not a control.
- **Fix:** change the colour, not the markup. Render the pending slot at `--color-foreground-muted` (`#696969` → 5.35:1 light; `#8A8A8A` → 5.73:1 dark), which is the token `docs/04` names for metadata. Delete `color: var(--color-foreground-faint)` from `.nav-pending` (`globals.css:751`) and swap `text-foreground-faint` → `text-foreground-muted` in `ResumeAffordance.tsx:23`. Drop the inert `aria-disabled` from both spans (it does nothing on a generic element); the words "not yet published" already carry the non-colour cue R24 asks for.

---

### 2. HIGH — `/writing/<missing>` serves a 404 with an empty `<title>`

- **SC violated:** 2.4.2 Page Titled, **Level A**. axe rule `document-title`, impact **serious** — the only reproducible axe violation in the run (4/4 scans, then 5/5 on dedicated re-test).
- **File / line:** `src/app/writing/[slug]/page.tsx:37` — `if (post === null) return { robots: { index: false, follow: false } };`
- **Measured evidence:**

  | Route | HTTP | `document.title` | `<h1>` |
  |---|---:|---|---|
  | `/definitely-missing-page` | 404 | `"Page not found — Arinze Okigbo"` | "No page at this address." |
  | `/writing/does-not-exist` | 404 | **`""`** (empty) | "No page at this address." |

  Reproduced 5/5 at 390×844 and 4/4 across the theme × viewport matrix. `not-found.tsx` renders correctly; only the title is lost.
- **Cause:** `generateMetadata` returns a metadata object with no `title` for the not-found branch. Next.js uses that returned object for the segment, and because it declares `title: undefined` explicitly the layout's `title.default` template is not applied — the document ends up with an empty title element.
- **Fix:** return the 404 title from the same content module `not-found.tsx` uses:
  ```ts
  if (post === null) return { title: NOT_FOUND.metadata.title, robots: { index: false, follow: false } };
  ```

---

### 3. HIGH — `border-radius: inherit` in the focus rule overrides every component radius on focus

- **SC violated:** none directly at AA (the ring stays visible and passes contrast), but it breaks `docs/04 §2.5` (radius token scope) and `docs/04 §7.2` (the focus block is specified to set `outline` and `outline-offset` only), and it is a visible shape change on every keyboard focus on a site whose argument is craft. Filed HIGH on that basis.
- **File / line:** `src/app/globals.css:384-388`
  ```css
  :where(a, button, input, textarea, select, summary, [tabindex]):focus-visible {
    outline: var(--focus-ring-width) var(--focus-ring-style) var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: inherit;          /* ← line 387 */
  }
  ```
- **Measured evidence** (computed `border-radius`, before vs. during keyboard focus):

  | Element | Unfocused | Focused | Declared in |
  |---|---|---|---|
  | `.skip-link` | `9999px` | **`0px`** | `globals.css:666` (`--radius-full`) |
  | `.btn--primary` | `8px` | **`0px`** | `globals.css:587` (`--radius-md`) |
  | `.theme-toggle` | `8px` | **`0px`** | `globals.css:773` (`--radius-md`) |

- **Cause — a cascade-layer inversion, not a specificity one.** Every component radius is declared inside `@layer components` (`globals.css:443`). The focus block at line 384 is **unlayered**. In CSS cascade order, unlayered declarations beat *all* layered declarations regardless of specificity, so the zero-specificity `:where(...)` rule still wins over `.btn { border-radius: 8px }`. `inherit` then resolves to the parent's radius, which is `0px` everywhere. The skip-link pill becomes a rectangle the moment it is revealed.
- **Fix:** delete line 387. The declaration is not in the `docs/04 §7.2` spec and serves no purpose — `outline` already follows the element's own `border-radius` in every current engine.

---

### 4. MEDIUM — visually-hidden "(opens in a new tab)" leaks into 4 heading texts and 4 `<article>` accessible names

- **SC violated:** 2.4.6 Heading and Label Descriptive (AA) — marginal; 1.3.1 (the `aria-labelledby` name is inaccurate). Also degrades the `docs/03 R9` headings-only chain, which is the highest-priority check in `docs/03 §463`.
- **Files / lines:** `src/components/ui/InlineLink.tsx:32` (`VisuallyHidden` appended inside the anchor) consumed by `src/components/sections/primitives/WorkEntry.tsx:76-78` and `ProjectEntry.tsx:39-41`, whose `<article aria-labelledby={headingId}>` (`WorkEntry.tsx:71-74`, `ProjectEntry.tsx:34-37`) names the region from that heading.
- **Measured evidence** — computed accessible names:
  ```
  ARTICLE#splita     "Splita — group payments collected up front (opens in a new tab)"
  ARTICLE#queralt    "Browser-native authentication — FIDO2, PKI, and Microsoft Entra ID (opens in a new tab)"
  ARTICLE#snorkel-ai "LLM output evaluation inside production AI pipelines (opens in a new tab)"
  ARTICLE#skyview    "SkyView — browser-based 3D globe on Google Photorealistic 3D Tiles (opens in a new tab)"
  ```
  A screen-reader user browsing by heading hears the new-tab warning four times as part of the heading itself, and again as the article's region name — where it is simply false, since the article does not open anything.
- **Fix:** keep the notice on the link but exclude it from the name computation chain. Either (a) give the `<h3>` its own `id`-bearing text node and point `aria-labelledby` at that instead of at the whole heading, or (b) move the new-tab notice out of the anchor's inner text and onto the anchor as `aria-description` / a `title`-free adjacent `<span aria-hidden>`+`aria-describedby` pair. Option (a) is the smaller change: wrap the artifact string in `<span id={headingId}>` inside the link and label the article from that span.

---

### 5. MEDIUM — theme toggle's `aria-pressed` contradicts its accessible name

- **SC violated:** 4.1.2 Name, Role, Value (Level A) — the state exposed does not coherently describe the control.
- **File / line:** `src/components/layout/ThemeToggle.tsx:65` — `<button type="button" className="theme-toggle" aria-pressed={isDark} …>`; names at lines 93-96.
- **Measured evidence** (keyboard-driven, Enter then Space):

  | Step | `data-theme` | `aria-pressed` | Accessible name | Announced as |
  |---|---|---|---|---|
  | initial | `light` | `false` | "Switch to dark theme" | "Switch to dark theme, toggle button, not pressed" |
  | after Enter | `dark` | `true` | "Switch to light theme" | **"Switch to light theme, toggle button, pressed"** |
  | after Space | `light` | `false` | "Switch to dark theme" | — |

  The name states an *action*; `aria-pressed` states that action is *on*. "Switch to light theme … pressed" is incoherent. Additionally, the server always emits `aria-pressed="false"` (verified in raw SSR HTML) while `ThemeScript` may already have set `data-theme="dark"` — so between first paint and hydration the state is wrong for every dark-preference visitor.
- **Confirmed working:** the toggle IS fully keyboard operable (Enter and Space both fire), the name flips correctly, and the choice persists to `localStorage`.
- **Fix:** pick one model. Simplest: drop `aria-pressed` entirely and keep the action-phrased name — this is the standard theme-switcher pattern and removes the SSR mismatch at the same time. If the toggle state must be exposed, change the names to state-phrased ("Dark theme" / "Light theme") and keep `aria-pressed`.

---

### 6. MEDIUM — skip link relies on a Chromium-only behaviour; `<main>` has no `tabindex="-1"`

- **SC at risk:** 2.4.1 Bypass Blocks (Level A) — passes in Chromium, will not move focus in WebKit.
- **Files / lines:** `src/app/layout.tsx:118` — `<main id="main">{children}</main>`; `src/components/layout/SkipLink.tsx:13` — `href="#main"`.
- **Measured evidence (Chromium 134):** pressing Tab then Enter on the skip link sets `location.hash = "#main"` but leaves `document.activeElement === document.body`. The next Tab lands on the first link inside `<main>` ("Splita"), because Chromium moves the *sequential focus navigation starting point* to the fragment target. `<main>` itself never receives focus.
- **Why this is a defect:** `<main>` is not a focusable element. WebKit does not move the sequential focus navigation starting point for a non-focusable fragment target, so in Safari the skip link changes the URL and nothing else — the next Tab returns to the header wordmark and the block is not bypassed. This was verified as a behaviour difference by inspection, not executed in Safari (see SUSPECTED note S1).
- **Fix:** `<main id="main" tabIndex={-1}>` in `src/app/layout.tsx:118`. `:focus:not(:focus-visible) { outline: none }` at `globals.css:389` already suppresses the ring for this programmatic focus, so it costs nothing visually.

---

### 7. MEDIUM — code blocks are horizontally scrollable but not keyboard focusable

- **SC violated:** 2.1.1 Keyboard (Level A). axe rule `scrollable-region-focusable`.
- **Files / lines:** `src/app/globals.css:926-936` — `.prose pre { overflow-x: auto; … }`; emitted by `src/content/writing/render.tsx:165-167` — `<pre key={key}><code>{block.lines.join("\n")}</code></pre>` with no `tabIndex`.
- **Evidence:** static — `content/writing/` contains only `.gitkeep`, so zero posts exist and the route could not be exercised at runtime. The CSS/JSX pair is unambiguous: a `<pre>` whose content exceeds `--measure-mono` (72ch) scrolls with a mouse wheel or trackpad and cannot be reached or scrolled with a keyboard alone.
- **Fix:** `<pre key={key} tabIndex={0}>` in `render.tsx:165`. A focusable scroll container also needs a name for some AT; adding `role="region" aria-label="Code sample"` is the conventional completion.
- **Related dead code:** `.prose table` / `.prose-table-scroll` (`globals.css:946-964`) has no producer — `render.tsx` emits paragraphs, lists, fenced code, blockquotes and rules only. If tables are ever added, the same `tabIndex={0}` requirement applies to `.prose-table-scroll`.

---

### 8. MEDIUM — entry separators sit at 1.19:1, and are the only visual boundary between work entries

- **SC at risk:** 1.4.11 Non-text Contrast (AA).
- **Files / lines:** `src/components/sections/primitives/WorkEntry.tsx:74` and `ProjectEntry.tsx:37` — `className="border-t border-border-subtle …"`; token at `globals.css:49` / `:104`.
- **Measured evidence** — alpha token composited over each surface, then measured:

  | Token | over `background` | over `surface` | over `surface-raised` |
  |---|---:|---:|---:|
  | light `--color-border-subtle` `#00000014` | **1.19:1** | 1.19:1 | 1.19:1 |
  | dark `--color-border-subtle` `#FFFFFF14` | **1.18:1** | 1.22:1 | 1.25:1 |
  | light `--color-border` `#0000001F` | 1.32:1 | 1.32:1 | 1.31:1 |
  | dark `--color-border` `#FFFFFF1F` | 1.34:1 | 1.41:1 | 1.44:1 |

- **Assessment:** these are *not* control boundaries, so 1.4.11 does not bite directly, and entry structure is additionally conveyed by a 25 px 500-weight heading and 32 px of whitespace — so the page does not fail. But `docs/04 §8.2` describes the rule as the entry separator, and at 1.19:1 it is invisible to a low-vision user: the separator is decorative in practice, not in intent. Filed MEDIUM because the design document's own §3.6 prints these numbers and treats them as acceptable without recording that the rule therefore carries no information.
- **Fix:** either promote the entry rule to `--color-border` (still only 1.32:1 — insufficient) or, better, accept the rule as decorative and confirm in `docs/04 §8.2` that entry separation is carried by heading + rhythm. No code change is required for AA conformance; the documentation claim should be corrected.

---

## LOW / INFORMATIONAL

### 9. LOW — skip link reveals on `:focus-visible` only
`src/app/globals.css:676` — `.skip-link:focus-visible { opacity: 1 }`. The unfocused state is `opacity: 0; pointer-events: none` (`:673-674`). Programmatic focus (`element.focus()` from a script, or some AT focus modes) does not always satisfy `:focus-visible`, and the link would then be focused, in the accessibility tree, and invisible. **Fix:** `.skip-link:focus, .skip-link:focus-visible { … }`. Not an AA failure in Chromium — verified the link is revealed (`opacity: 1`, `transform: none`) and paints above the header on Tab.

### 10. LOW — the `X` footer link is 8.6 × 16 CSS px and passes 2.5.8 only by the spacing exception
`src/components/layout/SiteFooter.tsx:29` uses `InlineLink` (16 px tall) rather than `StandaloneLink` (24 px / 44 px coarse) for four list items that are navigation, not prose. Hand-evaluated against SC 2.5.8's spacing exception at 390, 320 and 1440 px: every undersized target's 24 px circle clears every neighbouring target, so all four **pass**. But `X` at 8.6 px wide has no margin, and the row only fits at 320 px by 2.5 px (269.5 px of content in 272 px of inner width). **Fix (defensive):** swap `InlineLink` → `StandaloneLink` in `SiteFooter.tsx:29`, or set `.footer-links .link { min-block-size: var(--space-6) }`.

### 11. LOW — no `forced-colors` handling
`globals.css` contains no `@media (forced-colors: active)` block. Under emulated forced colours the focus ring and `.btn--primary` are correctly re-coloured by the UA, but the attestation poster's `color` stayed at the author value `color(display-p3 0.47 0.37 0.1)` — the figure may render at an arbitrary contrast against a forced background. Not an AA requirement (1.4.3/1.4.11 are measured in the default rendering). **Fix:** add `@media (forced-colors: active) { [data-attestation-poster] { color: CanvasText } }`.

### 12. LOW — `docs/04 §3.4`'s "guaranteed floor" claim about the P3 accent is not quite true
The P3 upgrade at `globals.css:115-131` **is** the value that renders (confirmed: every focus ring computes to `color(display-p3 …)`, never the sRGB hex). Converting P3 → CIE Y and re-measuring:

| | sRGB claim in `docs/04` | P3 as rendered |
|---|---:|---:|
| light ring on `#FCFCFC` | 5.89 | **5.96** |
| light ring on `#EDEDED` (worst light) | 5.16 | **5.22** |
| dark ring on `#0A0A0A` | 8.97 | **8.86** |
| dark ring on `#1C1C1C` (worst dark) | 7.72 | **7.63** |
| light `#FFFFFF` on accent fill | 6.04 | **6.11** |
| dark `#0A0A0A` on accent fill | 8.97 | **8.86** |

Dark-mode P3 renders *marginally below* the sRGB figure, so the document's "the sRGB values are the guaranteed floor" is false in dark mode by ~0.11. Immaterial to conformance (everything clears 3:1 by >2.5×) but the sentence should be corrected.

### 13. INFO — the contact form does not exist; review item 10 could not be executed
`document.querySelectorAll("form,input,textarea,select").length === 0` on every route, in every theme. `src/components/sections/primitives/ContactBlock.tsx:14-15` states this is deliberate ("[R26] never a form alone: no form ships"). Consequently `src/app/api/contact/route.ts`, `src/lib/contact/validation.ts`, `src/lib/contact/rate-limit.ts`, `src/lib/contact/delivery.ts` and the timing-challenge honeypot in `src/lib/contact/challenge.ts` are unreachable from the UI. **No label association, error announcement, required-field marking or honeypot-hiding technique exists to test.** Note for whoever ships the form later: `challenge.ts` uses a *server-signed timestamp*, not a hidden input, so there is no honeypot field to hide from AT — which is the right answer to review item 10, but it is unbuilt, not built-correctly. Flagging as scope drift for `main` rather than as an accessibility defect.

---

## SUSPECTED

### S1. Skip link in WebKit — not executed
Defect 6 is confirmed as *code shape* (`<main>` lacks `tabindex="-1"`) and confirmed as *Chromium behaviour* (focus stays on `body`; the starting point moves). The WebKit consequence is inferred from the spec difference, not measured — only Chromium was driven, per the instruction to avoid a shared browser session. Recommend a one-off `webkit` Playwright project to confirm before closing.

### S2. Four axe violations that did not reproduce
The first matrix run reported, on the **`light` / 390×844** pass only: `target-size` (11 nodes), `html-has-lang`, `landmark-one-main` and `page-has-heading-one` (the latter three all on `#__next_error__`). Re-tested with the identical browser-context config: `target-size` **0/3 runs**, `#__next_error__` **0/5 runs** (`/writing/does-not-exist` rendered `not-found.tsx` correctly with `lang="en"`, one `<main>` and one `<h1>` every time). Conclusion: an axe scan that landed inside the hydration window, when `.nav-sheet` had not yet resolved to `visibility: hidden` and `.nav-toggle` measured 0×0. Recorded as a tool artifact, **not** as a site defect — the independent hand-evaluation in §10 is the authoritative 2.5.8 result. Worth one more CI run to be certain the pre-hydration window is genuinely benign.

---

## EXPLICIT PASSES

**Keyboard (2.1.1, 2.1.2, 2.4.3, 2.4.7)**
1. **No keyboard trap.** 45 sequential Tabs from load traverse all 27 focusable elements, reach the browser chrome, and cycle cleanly. No element repeated back-to-back; Shift+Tab reverses correctly.
2. **Logical tab order.** skip link → wordmark → 4 nav links → theme toggle → hero proof-nouns → hero artifacts → hero CTA → work/project entry links → contact CTA → contact profile links → footer links. Matches DOM and visual order exactly.
3. **Skip link works and is visible on focus.** First focusable element; on Tab it renders at `157.75 × 48.8` (≥ 44×44), `opacity: 1`, `transform: none`, `z-index: 3` against the header's `2`, and `document.elementFromPoint` at its centre returns the skip link itself — it is **not** obscured. At 320 px it still fits (`left=24 right=182`, client width 320).
4. **Theme toggle is fully keyboard operable.** Enter and Space both toggle; `data-theme`, body background, accessible name and `localStorage` all update. (See defect 5 for the `aria-pressed` semantics.)
5. **Mobile nav disclosure is keyboard operable and non-modal.** At 390 px: `.nav-toggle` is 44×44, Enter opens the sheet (`data-open=true`, `visibility: visible`), all 4 links are tabbable at 44 px block size, Escape closes it, and nothing traps focus.

**2.4.11 Focus Not Obscured (Minimum) — PASS**
6. Every one of the 27 focusable elements was measured against the sticky header's rect at the moment it received focus. The header's bottom edge is 65 px; no focused element outside the header ever landed above it. `scroll-margin-block-start: 80px` (`globals.css:373-379`, `:464`) does the work, and Lenis does not interfere with focus-driven scrolling.

**2.4.13 Focus Appearance (AAA — specified in `docs/04 §7`, tested anyway) — PASS**
7. The ring renders on **every** focusable element in **both** themes: `outline: 2px solid var(--accent); outline-offset: 2px`, uniformly, with no exceptions and no `outline: none` anywhere in the codebase without a replacement.
8. Indicator area exceeds a 2 px perimeter of the unfocused component (the 2 px offset adds area).
9. Contrast of the indicator against every surface it lands on, measured on the **rendered** P3 values: **5.22 – 5.96:1 light**, **7.63 – 8.86:1 dark**, against a 3:1 bar. Worst case 5.22:1. (Defect 3 is the only focus-state flaw, and it is shape, not contrast.)

**Contrast (1.4.3, 1.4.11)**
10. **Full text sweep, both themes, every visible text node on `/`:** the only failures are the three `--color-foreground-faint` spans of defect 1. Everything else clears its bar — `foreground` 16.96/16.91, `foreground-secondary` 6.52/8.33, `foreground-muted` `rgb(105,105,105)` = 5.35 light and `rgb(138,138,138)` = 5.73 dark (both darkened values verified as rendered, not merely specified).
11. **`--color-accent-foreground` inverts correctly — the mistake the brief predicted was not made.** Measured on the rendered primary CTA: light `color: rgb(255,255,255)` on the gold fill; dark `color: rgb(10,10,10)` on the gold fill. Ratios 6.11:1 and 8.86:1 (P3-rendered). No literal colour is hard-coded on either accent surface (F11 holds).
12. **`--color-border-interactive` clears 3:1 on every surface:** light 3.12–3.18:1, dark 4.25–4.31:1, composited and measured. This carries the resting link underline and the 3D figure frame.
13. **Link underline at rest.** `.link` renders `text-decoration-color: rgba(0,0,0,0.435)` / `rgba(255,255,255,0.435)` at rest — links in prose are identifiable without hover and without relying on colour (1.4.1).

**Semantics (1.3.1, 2.4.6, 4.1.2) and `docs/03 R9`**
14. **Exactly one `<h1>`, no skipped levels.** DOM order: `h1 → h2#work → h3 ×3 → h2#projects → h3 → h2#about → h2#contact`. Clean.
15. **R9 headings-only test PASSES.** Reading headings alone: *what he builds* — "Group payments at Splita. Browser authentication at Queralt Inc. Model evaluation at Snorkel AI."; *strongest evidence* — the three h3 artifacts plus "Open-source: SkyView layers live flight traffic on a photorealistic 3D globe."; *how to reach him* — "arinze@splita.co — direct email, plus GitHub, LinkedIn, X, and the résumé." All three clauses are satisfied by heading text alone. (Defect 4 is noise inside an otherwise passing chain. Note also that the `h1` is the bare name and contributes nothing to the argument — structurally legal, and the h2 immediately carries the claim.)
16. **Landmarks are correct and singular:** one `<header>`, one `<nav aria-label="Primary">`, one `<main id="main">`, one `<footer>`. Every content `<section>` carries `aria-labelledby` pointing at a real heading id; the hero `<section>` is unnamed and therefore correctly not exposed as a region.
17. **`<a>` vs `<button>` is used correctly throughout.** Navigation and the résumé/email CTAs are anchors; the theme toggle and the mobile disclosure are `<button type="button">`. No `div`-with-onClick, no `role="button"` on a link, no anchor without `href`.

**Alt text / the 3D figure (1.1.1)**
18. **Poster is correctly described.** `<svg role="img" aria-label="A lattice of points resolving from scattered noise into an ordered surface.">` (`AttestationPoster.tsx:123-132`), server-rendered with 248 `<circle>` elements. Zero `<img>` elements exist on the site, so there is no missing `alt` anywhere.
19. **The live canvas is correctly hidden and is not a keyboard trap.** After the WebGL chunk loads, `mount.ts:52-63` appends a host `<div aria-hidden="true">` containing `<canvas tabindex="-1">`. Verified at runtime: canvas is `830×466`, `tabIndex="-1"`, its host is `aria-hidden`, it never appears in the 45-Tab traversal, and the poster SVG stays in the DOM at `opacity: 0` — so it remains in the accessibility tree and keeps carrying the figure's name. `<figcaption>` carries the readout plus the two honesty paragraphs and is real selectable text. The readout's `✓` glyph is `aria-hidden="true"`, so AT reads "verified 0.1ms" cleanly.

**JavaScript disabled — PASS, both themes, all routes**
20. With `javaScriptEnabled: false`:
    - Home page body text measures **4,877 characters** — identical content to the JS-enabled render. Hero, all three work entries, the project entry, About (incl. "TechBuzz") and Contact (incl. `arinze@splita.co`) are all present.
    - **Zero elements** are stuck at `opacity: 0` or `visibility: hidden` while holding text (the `.js [data-reveal]` scoping at `globals.css:399` does its job — `<html>` has no `js` class and the reveal rules never match).
    - **The 3D poster renders as static inline SVG** — 248 circles, present in the HTML, with its `aria-label`. `<figcaption>` present with the build-time signature.
    - **Theme honours the OS preference in pure CSS.** `data-theme` is absent; body computes `rgb(252,252,252)` / `rgb(26,26,26)` under `prefers-color-scheme: light` and `rgb(10,10,10)` / `rgb(237,237,237)` under dark — the `@media` path at `globals.css:68-88` alone.
    - **The theme toggle is not exposed.** It is in the DOM but computes `display: none` (`globals.css:759-764`), which removes it from the accessibility tree — so there is no visible or announced control that cannot work.
    - The mobile disclosure degrades correctly: `.nav-toggle` is `display: none`, the sheet is `visibility: visible`, all 4 nav links are inline and reachable. 26 links on `/`, no horizontal scroll.

**Reduced motion — PASS**
21. With `prefers-reduced-motion: reduce`, after scrolling the full page:
    - **The 3D chunk downloads ZERO bytes.** 9 JS chunks requested, versus 11 under normal motion (`838.f823f9e14bca3be7.js` and `477.c46fa10be0806a26.js` are the OGL/scene chunks and are never requested). Gate 1 in `AttestationLive.tsx:71` fires before the dynamic import, as specified.
    - `document.querySelectorAll("canvas").length === 0`; the poster is at `opacity: 1`.
    - **Every reveal is a real static end state, not a fast animation.** `[data-reveal]` node count is **0** — `Reveal.tsx:85-87` renders the bare element with no attributes at all, so there is nothing to animate and nothing depending on an observer. Body text measures 4,898 characters and all 9 headings are present.
    - **No element is stuck mid-transition:** no element has a non-identity `transform`; no text-bearing element is below full opacity (only the unfocused `.skip-link`, which is correct).
    - **No `0.01ms` hack.** The `docs/04 §6.2` safety net computes to `transition-duration: 0.001s` (1 ms), which is the sanctioned net, and it is *not* the mechanism — every M-row has a real end state behind it.
    - **Lenis is destroyed, not paused:** `<html>` carries `js` but not `lenis`; `scroll-behavior` computes to `auto`.
    - **axe is clean under reduced motion:** 0 violations, both themes.
    - The site remains fully usable: the mobile disclosure still opens (`visibility: visible`, `opacity: 1`, `transform: none`, 4 links) and Escape still closes it.

**Target size (2.5.8) — PASS**
22. Hand-evaluated at 390×844, 320×640 and 1440×900 against the full success criterion including both exceptions. Standalone controls are all ≥ 24×24 (nav links 44 px, theme toggle 44×44, nav toggle 44×44, buttons 44 px block, `.link-standalone` 24 px fine / 44 px coarse — `pointer: coarse` confirmed active at 390 px). The three hero proof-noun links (18 px tall) take the **inline** exception legitimately — they are inline anchors inside a `<p>`. The four footer links take the **spacing** exception; their 24 px circles clear every neighbour at all three viewports. See defect 10 for the fragility note. *(axe agrees: 0 `target-size` violations in 3/3 deterministic re-runs at 390 px.)*

**Reflow and zoom (1.4.10) — PASS**
23. No horizontal scrolling and no content loss at **320×800**, **320×640**, **320×256** (≈400 % zoom of 1280×1024) or **720×450** (200 % zoom of 1440×900), on both `/` and `/writing`. `scrollWidth === clientWidth` in every case; zero `<p>/<h*>/<li>/<a>/<figcaption>` elements extend past the client width; body text length is preserved (4,837 chars at 320 px). The clamp middle terms all carry a `rem` component (`globals.css:219-232`), so text-size preference still moves type — `docs/01` anti-pattern 5 is genuinely avoided.

**Not applicable**
24. **2.5.7 Dragging Movements** — no drag, swipe, slider, reorder or path-based interaction exists. Lenis is constructed with defaults (`SmoothScrollProvider.tsx:34`), which leaves touch scrolling native; scrolling is not a dragging movement under this SC in any case.
25. **3.3.8 Accessible Authentication (Minimum)** and **3.3.7 Redundant Entry** — no authentication, no login, no cognitive function test, and no form of any kind on any route (see INFO 13).

---

## Verification checklist for the fix pass

- [ ] `ResumeAffordance.tsx:23` and `globals.css:751` → `--color-foreground-muted`; re-measure ≥ 4.5:1 in both themes. *(defect 1)*
- [ ] `writing/[slug]/page.tsx:37` → return a `title`; assert `document.title !== ""` on a 404 under that segment. *(defect 2)*
- [ ] `globals.css:387` → delete `border-radius: inherit`; assert `.skip-link` computes `9999px` while focused. *(defect 3)*
- [ ] `WorkEntry`/`ProjectEntry`/`PostRow` → article accessible names no longer contain "opens in a new tab". *(defect 4)*
- [ ] `ThemeToggle.tsx:65` → resolve the `aria-pressed` / name contradiction. *(defect 5)*
- [ ] `layout.tsx:118` → `<main id="main" tabIndex={-1}>`; re-test the skip link in WebKit. *(defect 6, S1)*
- [ ] `render.tsx:165` → `<pre tabIndex={0} role="region" aria-label="Code sample">`; re-test once a post exists. *(defect 7)*
- [ ] Re-run the full axe matrix and confirm **0** violations on all 16 scans.
