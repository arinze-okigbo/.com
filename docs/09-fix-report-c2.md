# 09 — Fix Report, Cycle 2

**Phase:** 5 (remediation, second pass). **Agent:** `fix-agent-c2`.
**Date:** 2026-09-11. **Branch:** `claude/wizardly-feynman-octebb`.
**Inputs:** `docs/08-review-accessibility-c2.md`, `docs/08-review-crossbrowser-c2.md`, `docs/04-design-system.md` (reconciled, authoritative), `docs/07-fix-report.md`.

**Method.** Every figure below is measured against a production build
(`next build` → `next start -p 3101 -H 127.0.0.1`). Lighthouse is the **median
of 3** runs, mobile, simulated throttling. Browser assertions are Playwright
1.55 against Chromium 153 / Firefox 155 / WebKit 26.6. Print is proved with
Chromium's real `page.pdf()` pipeline and a WebGL-blocked counterfactual, not by
reading computed styles. `claude-in-chrome` was not used.

---

## 0. Scorecard

| Metric                                                    | Cycle 1 (docs/07) |                         Cycle 2 (this pass) | Result                           |
| --------------------------------------------------------- | ----------------: | ------------------------------------------: | -------------------------------- |
| Lighthouse Performance (mobile, median of 3)              |                99 |                                      **99** | ✅ held                          |
| Lighthouse Accessibility                                  |               100 |                                     **100** | ✅ held                          |
| Lighthouse Best Practices                                 |                96 |                                      **96** | ✅ held                          |
| Lighthouse SEO                                            |               100 |                                     **100** | ✅ held                          |
| LCP (simulated)                                           |          2,003 ms |                                **2,003 ms** | ✅ held                          |
| CLS                                                       |             0.000 |                                   **0.000** | ✅ held                          |
| FCP                                                       |            778 ms |                                  **782 ms** | ✅ held                          |
| TBT                                                       |           0–16 ms |                                    **0 ms** | ✅ held                          |
| Real First Load JS (gzip −9, document-referenced scripts) |         113,269 B |                               **114,241 B** | ⚠️ **+972 B (+0.86 %)** — see §7 |
| axe violations                                            |      0 / 16 scans | **0 / 8 scans** (incl. 2 sheet-open states) | ✅ held                          |
| `npm audit --omit=dev`                                    |                 0 |                                       **0** | ✅ held                          |
| Test suite                                                |        112 passed |                        **147 passed** (+35) | ✅                               |
| Print: figure PDF delta, WebGL live vs blocked            | 77,986 B (29.7 %) |                          **69 B (0.023 %)** | ✅ **FIXED**                     |
| Reduced motion: 3D bytes                                  |                 0 |                                       **0** | ✅ held                          |
| Render loop: frames off-screen / tab-hidden               |             0 / 0 |                                   **0 / 0** | ✅ held                          |
| `.container` elements                                     |                 0 |                                       **0** | ✅ held                          |
| Framer Motion                                             |            absent |                                  **absent** | ✅ held                          |

**Defects fixed:** 3 HIGH, 4 MEDIUM, 5 LOW, plus the one filed code defect in
`docs/04 §12.1 E`. **Not fixed:** 1 (cross-browser S1, with reason). **Suspected
items investigated and closed or documented:** 7.

---

## 1. HIGH

### HIGH 1 — a11y N1. An open mobile nav sheet entirely hides the focused element — **FIXED**

**SC 2.4.11 Focus Not Obscured (Minimum), Level AA.** Also 2.4.12 (AAA) below 768 px.

**Changed**

- `src/lib/a11y/focusable.ts` — **new.** `getFocusableElements`, pure, no layout read.
- `src/lib/a11y/use-focus-trap.ts` — **new.** The trap.
- `src/lib/a11y/focusable.test.ts`, `src/components/layout/Nav.test.tsx`,
  `tests/e2e/nav-focus-trap.spec.ts` — **new.**
- `src/components/layout/Nav.tsx:45-72` (the comment that cited 2.4.11 as the
  justification for the defect), `:76-165` (refs, `isDisclosure`, dismissal,
  trap wiring), `:200` (`ref` on `<nav>`), `:202` (`ref` on the toggle),
  `:224` (`ref` on the sheet).
- `src/app/globals.css:545-568` — `section[tabindex="-1"]:focus-visible { outline: none }`.

**The comment was the defect's alibi.** `Nav.tsx:95-96` read _"Nothing traps
focus: the sheet is a non-modal disclosure, not a dialog (docs/04 §7.3, SC
2.4.11)."_ 2.4.11 does not ask whether a thing is a dialog; it asks whether the
_focused element_ is obscured by author content. The comment cited, by number,
the exact criterion the decision broke. It is rewritten in full at
`Nav.tsx:45-72` so the next reader inherits the correction rather than the
alibi.

**The fix is a real trap, not the reviewer's `focusout`-close.** The review
offered closing the sheet when focus leaves `<nav>`. That closes the keyboard
hole but not the pointer one: a mouse click on a page link behind the sheet
leaves the sheet painted with focus underneath it. The trap has three
mechanisms — Tab/Shift+Tab driven around the ring, `focusin` outside dismisses,
`pointerdown` outside dismisses — and is inert when `isActive` is false.

**Driving every Tab, not only the boundaries, is load-bearing.** A
boundary-only trap was implemented first and measured: in **WebKit 26.6**, with
Safari's default _"Press Tab to highlight each item"_ off, Tab from a link moves
focus to `BODY` rather than to the next link, so the traversal oscillated
`toggle → BODY → toggle` and never visited the sheet's own links. Handling the
whole ring makes the traversal identical in all three engines.

**Measured, before → after** (focus driven from the keyboard, 10 Tab presses per
viewport, `document.elementFromPoint` at the focused element's centre):

| Engine       | Viewport        | Focus escapes `<nav>`?        | Focused element covered by `.nav-sheet`? |
| ------------ | --------------- | ----------------------------- | ---------------------------------------- |
| Chromium 153 | 767×900         | before **yes** → after **no** | before **100 % covered** → after **no**  |
| Chromium 153 | 480×700         | before **yes** → after **no** | before **100 % covered** → after **no**  |
| Chromium 153 | 390×844         | before **yes** → after **no** | before 55.4 % → after **no**             |
| Firefox 155  | 767 / 480 / 390 | after **no**                  | after **no**                             |
| WebKit 26.6  | 767 / 480 / 390 | after **no**                  | after **no**                             |

Focus lands **inside the sheet on open** in all three engines (`focusedOnOpen:
true`, 9/9 engine × viewport combinations).

**It does not break anything else, measured rather than assumed:**

- **Closed sheet:** no listeners are attached; a Tab keydown is not
  default-prevented and `document.activeElement` is untouched
  (`Nav.test.tsx` — "does nothing at all while the sheet is closed").
- **Desktop:** `isDisclosure` is read from the toggle's own computed `display`,
  not from a breakpoint literal, so it asks the question the CSS answers. At
  1440 the toggle is hidden, the trap never activates, and the skip link still
  puts focus on `MAIN#main` on Tab → Enter (e2e: "desktop is untouched").
- **Resize while open:** `isDisclosure` re-syncs on `resize` and collapses
  `isOpen` with it, so a sheet cannot survive into the desktop row as a trap.
- **No JS:** the `.js` class is absent, the toggle stays `display: none`,
  `isDisclosure` is false, nothing runs. [03 R30] intact.

---

### HIGH 2 — a11y N2. Closing the sheet destroys keyboard focus — **FIXED**

**SC 2.4.3 Focus Order, Level A.**

**Changed** `src/components/layout/Nav.tsx:113-165` (`returnFocusToToggle`,
`handleDismiss`, `closeAndMoveFocus`), `:234` and `:256` (link handlers),
`src/app/globals.css:545-568`.

Dismissal now has a defined destination, and the destination depends on _how_
the sheet was dismissed — which is why `useFocusTrap` passes a
`FocusTrapDismissReason` rather than a bare callback:

| Dismissal                           | Before                       | After                                                                                |
| ----------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| Escape                              | `activeElement` = **`BODY`** | **`BUTTON.nav-toggle`**, verified in Chromium, Firefox and WebKit at 767 / 480 / 390 |
| Sheet link activated (`#work`)      | `activeElement` = **`BODY`** | **`SECTION#work`** (given `tabindex="-1"`, focused with `preventScroll`)             |
| Sheet link leaves the page (résumé) | `BODY`                       | toggle — the browser is navigating anyway                                            |
| Pointer / focus moved outside       | sheet stayed open            | sheet closes, **focus left where the user put it**                                   |

`preventScroll: true` leaves the scroll to the browser's own fragment handling
and to Lenis, so nothing fights over the scroll position.

**The one new CSS rule this needed, and why it is not a widening of a waiver.**
A `<section tabindex="-1">` focused by pressing Enter matches `:focus-visible`,
so the global `[tabindex]` focus rule would have drawn a 2 px accent outline
around a whole screenful — the same defect cycle 1 hit with `<main>` (6b).
`globals.css:545-568` suppresses the ring for `section[tabindex="-1"]` only, on
the identical argument already accepted for `main`: a reading-position target is
not a user interface component, it is not in the tab sequence, and the control
that sent focus there has its own visible focus state. Every real control keeps
its ring — the selector is `section[…]`, not a bare `[tabindex="-1"]`.

---

### HIGH 3 — cross-browser N1. The attestation figure prints as an empty box — **FIXED**

**Changed** `src/app/globals.css:1331-1450` (`@media print`).

Four lines, exactly as the review scoped it:

```css
[data-attestation-poster] {
  opacity: 1 !important;
}
canvas {
  display: none !important;
}
```

`!important` is required and is documented in place: `runtime/mount.ts:100`
pins the poster to `opacity: 0` in an **inline** style on the first drawn frame,
and an inline style outranks any stylesheet declaration without it.

**Proved through the real print pipeline, not by reasoning.** Chromium
`page.pdf()`, A4, `printBackground: true`, same page, twice — once with WebGL
live, once with `getContext("webgl*")` stubbed to `null`:

|            | WebGL live | WebGL blocked |                 Delta |
| ---------- | ---------: | ------------: | --------------------: |
| **Before** |  184,742 B |     262,728 B | **77,986 B (29.7 %)** |
| **After**  |  301,217 B |     301,148 B |    **69 B (0.023 %)** |

The 78 KB that used to go missing is the vector poster. Preconditions were
asserted on the live run so the test cannot pass by accident: `canvas` count 1,
poster inline style contains `opacity: 0`, and `drawImage(canvas)` →
`getImageData` returns **0 non-transparent pixels** (the empty drawing buffer
from OGL's default `preserveDrawingBuffer: false`).

Both after-figures are _larger_ than the before-blocked run because N2's URL
expansion now actually paints.

**Engine scope (closes part of cross-browser S3).** The computed print state was
re-measured under `emulateMedia({media:"print"})` in all three engines:
poster `opacity: 1` and canvas `display: none` in **Chromium, Firefox and
WebKit**. Playwright can only produce real print output for Chromium, so the
byte proof remains Chromium-only; the fix is engine-independent CSS and the
computed state confirms it applies everywhere.

**Regression guards:** `src/app/print-styles.test.ts` (runs in `npm test`, no
browser) and `tests/e2e/print.spec.ts` (the byte comparison).

---

## 2. MEDIUM

### MEDIUM 1 — cross-browser N5. CLS 0.000 does not transfer off Apple platforms — **FIXED**

**Changed** `src/app/globals.css:404-437` (new `§4b` `@font-face`),
`:191-211` (`--font-sans`).

`next/font`'s `adjustFontFallback` emits one fallback face whose only source is
`local("Arial")` — which resolves on Windows, macOS and iOS and nowhere else. On
Android and Linux the face never matches, the metric overrides do not exist, and
`--font-sans` falls through **unadjusted** to the system stack.

A second face, `"Space Grotesk Metric Fallback"`, carries the same
`ascent-override: 89.71%` / `descent-override: 26.62%` /
`line-gap-override: 0%` / `size-adjust: 109.69%` over
`local("Roboto"), local("Helvetica Neue"), local("Liberation Sans"), local("Arial")`,
and sits in `--font-sans` between the next/font face and the system stack.

**A separate family name, deliberately.** Two `@font-face` rules with the same
family and descriptors do not merge their `src` lists — the later definition
replaces the earlier outright — and `next/font` injects its stylesheet
independently of `globals.css`, so redeclaring `"Space Grotesk Fallback"` would
have been a cascade-order coin toss. Distinct names make them two entries tried
in order, which is deterministic. Verified present and correct in the compiled
stylesheet in all three engines.

**Measured, 390 px** (lede paragraph height — the line-break canary the review
used):

| Stack in use                                 |          Before |                       After |
| -------------------------------------------- | --------------: | --------------------------: |
| Space Grotesk (final)                        |           87 px |                       87 px |
| next/font fallback (Arial + `size-adjust`)   |           87 px |                       87 px |
| **`"Space Grotesk Metric Fallback"`**        | _did not exist_ |                   **87 px** |
| bare system stack (the Android fall-through) |       **58 px** | 58 px — no longer reachable |

**CLS re-measured with the Apple-local font unavailable.** The served document
was intercepted and next/font's `local("Arial")` rewritten to an unresolvable
family, which is what an Android handset sees, with the `.woff2` delayed 1,200 ms
so the swap is observable. Emulated Pixel-class viewport, 390×844, DPR 3:

| Condition                                             | `Space Grotesk Fallback` | `Space Grotesk Metric Fallback` |                           **CLS** |
| ----------------------------------------------------- | ------------------------ | ------------------------------- | --------------------------------: |
| Apple platform (control)                              | loaded                   | unloaded                        |                        **0.0146** |
| Android-like, **after** this fix                      | **error**                | **loaded**                      | **0.0146** — identical to control |
| Android-like, **before** this fix (both faces killed) | error                    | error                           |            **0.0235** — **+61 %** |

The fix removes the extra shift entirely: a host without Arial now shifts by
exactly as much as a host with it. (Those three numbers are a like-for-like
comparison under an artificial font delay, not the Lighthouse figure. Lighthouse
CLS on the shipped page is **0.000**, median of 3.)

**Still open:** field CLS on real Android hardware — cross-browser S4, §6.

### MEDIUM 2 — a11y N3. The cycle-1 forced-colours fix was inert — **FIXED**

**Changed** `src/components/three/AttestationPoster.tsx:102-125`
(`color` removed from `POSTER_STYLE`), `src/app/globals.css:1192-1209`
(`[data-attestation-poster] { color: var(--color-foreground-secondary) }` in the
component layer), `src/components/three/runtime/capability.ts:25-41`
(`isForcedColorsActive`), `src/components/three/AttestationLive.tsx:75-82` (GATE 2).

Both of the review's independent reasons are addressed, and the honest option
was taken for each:

1. **Cascade.** The declaration moved out of the inline `style` attribute and
   into the stylesheet, so the `@media (forced-colors: active)` rule in §11 wins
   by ordinary cascade. Not `!important` on the override — that would have
   worked and would have left the underlying inversion in place.
2. **Gating.** A forced-colours gate now sits beside the reduced-motion gate, so
   the canvas never mounts. A WebGL surface is not subject to the forced palette
   at all, so hiding behind it was the whole problem.

**Measured under `forcedColors: "active"`** (`matchMedia` confirmed true):

| Motion preference          | poster computed `color`       | computed `fill`  | poster `opacity` | `<canvas>` count |
| -------------------------- | ----------------------------- | ---------------- | ---------------: | ---------------: |
| no-preference — **before** | `rgb(92,92,92)`               | `rgb(92,92,92)`  |                0 |                1 |
| no-preference — **after**  | **`rgb(0,0,0)`** (CanvasText) | **`rgb(0,0,0)`** |            **1** |            **0** |
| reduce — **before**        | `rgb(92,92,92)`               | `rgb(92,92,92)`  |                1 |                0 |
| reduce — **after**         | **`rgb(0,0,0)`**              | **`rgb(0,0,0)`** |                1 |                0 |

Verified by running in forced-colours mode, not by inspecting the CSS. The
figure's ink token, the F4 reasoning and the `currentColor` mechanism are
unchanged; only the declaration's home moved. `runtime/color.ts` reads the
custom property directly, not the poster's computed `color`, so the live canvas
is unaffected and the two surfaces still cannot diverge.

### MEDIUM 3 — a11y N4. The theme toggle misstates its state when site data is blocked — **FIXED**

**SC 4.1.2 Name, Role, Value, Level A.**

**Changed** `src/components/layout/ThemeScript.tsx:18-33` (prose) and `:34`
(the script).

The OS preference is now resolved **outside** the `try`, so `data-theme` is
always written; a successful `localStorage` read overrides it. Same job, same
order of magnitude in bytes, and it removes the only state in which `.js` is
present and `[data-theme]` is absent.

**Measured with `localStorage` made to throw `SecurityError` on access:**

| OS preference |            | `data-theme` | body background    | accessible name             | 1st click                       |
| ------------- | ---------- | ------------ | ------------------ | --------------------------- | ------------------------------- |
| dark          | **before** | **(unset)**  | `rgb(10,10,10)`    | "Switch to **dark** theme"  | **no perceivable change**       |
| dark          | **after**  | **`dark`**   | `rgb(10,10,10)`    | **"Switch to light theme"** | **→ light, `rgb(252,252,252)`** |
| light         | after      | `light`      | `rgb(252,252,252)` | "Switch to dark theme"      | → dark, `rgb(10,10,10)`         |

### MEDIUM 4 — cross-browser N2. The print URL-expansion rule was inert — **FIXED**

**Changed** `src/app/globals.css:1385-1402`.

`.link::after` is already claimed by the component layer as the 2 px accent
underline bar, so replacing only `content` laid the URL text out inside a 2 px
box at `scaleX(0)`. Every geometric property the component layer set is now
given back, and `mailto:` is expanded too.

| Measured, print media | Before                           | After                              |
| --------------------- | -------------------------------- | ---------------------------------- |
| `content`             | `" (https://splita.co)"`         | `" (https://splita.co)"`           |
| `position`            | `absolute`                       | **`static`**                       |
| `block-size`          | `2px`                            | **`auto`**                         |
| `transform`           | `matrix(0,0,0,1,0,0)` (scaleX 0) | **`none`**                         |
| `mailto:` expansion   | absent                           | **`" (mailto:arinze@splita.co)"`** |

Identical in Chromium, Firefox and WebKit. [03 R29]'s guarantee is now real
rather than asserted.

### MEDIUM 5 — cross-browser N3. The only CTA printed as undifferentiated body text — **FIXED**

**Changed** `src/app/globals.css:1404-1415`.

```css
.btn--primary {
  border-color: currentColor !important;
}
```

`currentColor` rather than a literal: the print reset has already forced `color`
to black, so no new value is introduced. Measured border colour in print media:
`rgba(0,0,0,0)` → **`rgb(0,0,0)`**, in all three engines.

### MEDIUM 6 — cross-browser N4. No pagination control anywhere — **FIXED**

**Changed** `src/app/globals.css:1417-1440`; `--print-min-lines: 3` declared at
`:356-363`.

Measured in print media: `h2` `break-after: avoid`; `article`, `figure` and
`.meta-line` `break-inside: avoid`; `p` `orphans: 3` / `widows: 3`. Confirmed in
Chromium and WebKit; Firefox applies `break-after` and does not expose
`orphans`/`widows` through `getComputedStyle`.

**Token note.** `docs/04 §9.5`'s print block declares no break, orphan or widow
control at all, so `3` has no token upstream. Rather than leave a bare integer
inside `@media print`, it is declared as `--print-min-lines` in the non-utility
block with an **ESCALATE to `docs/04 §9.5`** comment — the same treatment
`--z-header` received for the same reason (§12.1 C, D12).

---

## 3. The filed code defect — `docs/04 §12.1 E` / D4

### `InlineLink` `emphasis` prop and `.link--proof` — **IMPLEMENTED**

**Changed**

- `src/components/ui/InlineLink.tsx:38-46` (`InlineLinkEmphasis`), `:48-63`
  (prop), `:65-92` (doc + class).
- `src/app/globals.css:735-758` (`.link--proof::after`).
- `src/components/sections/primitives/RichText.tsx` (`emphasis` pass-through).
- `src/components/sections/HeroSection.tsx:32-38` (`emphasis="proof"`).
- `src/components/ui/ui.test.tsx` (3 new tests).

Implemented to the letter of §8.3 and §3.5 A1: exactly the two declarations the
amendment names, `transform: none` and `background: var(--color-accent)`.

**Measured at 1440, both themes** — all three hero proof nouns:

|                               | Before                                          | After                                     |
| ----------------------------- | ----------------------------------------------- | ----------------------------------------- |
| `.link--proof` elements       | 0 (class did not exist)                         | **3** — Splita, Queralt Inc., Snorkel AI  |
| `::after` `transform` at rest | `matrix(0,0,0,1,0,0)` — scaleX(0)               | **`none`** — the bar is present           |
| `::after` `block-size`        | 2px                                             | **2px** (R-GOLD-1, never 1px — F10 holds) |
| `::after` `background`        | `color(display-p3 .47 .37 .1)`                  | same                                      |
| link text `color`             | `rgb(26,26,26)` light / `rgb(237,237,237)` dark | **unchanged** — never accent (F1)         |

Emphasis is orthogonal to routing and to the external-link description: the
`target="_blank"`, the `rel`, the accessible name `"Splita"` and the description
`"opens in a new tab"` are all asserted unchanged in `ui.test.tsx`, because four
heading texts and four `<article>` names depend on that.

**One observation routed to `docs/04`, not fixed unilaterally.** §8.3's
amendment specifies `.link--proof { ::after { transform: none; background:
var(--color-accent) } }` and nothing else, so the `default` variant's 1 px
`--color-border-interactive` text underline **remains underneath the 2 px accent
bar** on proof links. Rendered, that reads as a gold bar with a faint grey top
edge (screenshot captured). §3.5 A1's wording is "2px **underline** in
`--color-accent`", singular, which could be read as replacing the 1 px rule
rather than joining it. The shipped behaviour follows the document's explicit
rule text. **If §3.5 A1 means the 1 px underline should go, that is a one-line
addition (`text-decoration-color: transparent`) and `docs/04 §8.3` should say
so.** Filed rather than guessed.

---

## 4. LOW

| #           | Defect                                                                    | Status                   | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **a11y N5** | `/writing` with zero posts renders one word and no way onward             | **FIXED**                | `src/content/writing/copy.ts` gains `WRITING_INDEX.emptyState`; `src/app/writing/page.tsx:38-57` branches on `posts.length === 0`. `<main>` text before: `"Writing"` (0 links, 0 articles). After: `"Writing Nothing is published here yet. The work itself is on the home page: Splita, browser-native authentication at Queralt Inc., and SkyView. Arinze Okigbo — the home page"` — 1 information-bearing link [03 R12], and the sentence states a fact rather than promising a schedule [03 R34]. **Note:** the review routed the copy to the `content` agent because no such string existed. It is authored here because the route was a dead end and the fix is otherwise blocked; `content` should review the wording. |
| **a11y N6** | `<pre role="region">` mints a landmark per code block                     | **FIXED**                | `src/content/writing/render.tsx:166-190` → `role="group"`. Same name, same focusability, no landmark-rotor pollution. The unconditional `tabIndex={0}` is **kept and recorded as a decision** in the source: conditioning it on `scrollWidth > clientWidth` needs a client measurement this Server Component cannot make, and an extra tab stop is the cheaper error than an unreachable scroll container. Still unexecuted — `content/writing/` holds only `.gitkeep`.                                                                                                                                                                                                                                                       |
| **xb N6**   | `-webkit-text-size-adjust` rejected by Gecko                              | **FIXED**                | `src/app/globals.css:424-445`. Unprefixed first, prefixed second; Lightning CSS expands the pair to all three spellings against the browserslist range — the served document carries `html{-webkit-text-size-adjust:100%;-moz-text-size-adjust:100%;text-size-adjust:100%}`, verified in the response body. **Measured honesty:** on _desktop_ Firefox 155 and WebKit 26.6, `CSS.supports()` returns false for all three spellings, because font inflation is a mobile behaviour. The audience is Firefox for Android and iOS Safari. This closes cross-browser S5 as a measurement, below.                                                                                                                                   |
| **xb N7**   | Dead `animation-timeline: view()` block — the only three-way engine split | **FIXED by deletion**    | `src/app/globals.css:597-611` — the `@supports` block and `@keyframes reveal` (its only consumer) are gone, replaced by a comment naming the three things that must land together to bring it back. Served stylesheet now contains **0** occurrences of `animation-timeline` and **0** of `@keyframes reveal`. The M14 note in §9 is rewritten, since the block it out-cascaded no longer exists. This also closes the latent risk recorded in a11y S2's parenthetical.                                                                                                                                                                                                                                                       |
| **xb N8**   | The corrected P3 parser is on no runtime path                             | **NO ACTION — recorded** | Correct as filed and not a defect. `readFigureColor` reads `--color-foreground-secondary`, a plain hex, so `parseHex` is the runtime path and `parseFunctional` is belt-and-braces for a future token change. Unchanged by this pass: moving `color` out of `POSTER_STYLE` (MEDIUM 2) does not touch it, because `runtime/color.ts` reads the custom property directly rather than the poster's computed `color`. If the figure ever returns to an accent-derived colour, the P3 path goes live and needs re-measuring on a wide-gamut display.                                                                                                                                                                               |
| **xb N9**   | Footer "X" is a 10.1 px-wide touch target                                 | **FIXED**                | `src/app/globals.css:778-788` — `padding-inline: var(--space-2)` inside the coarse-pointer block. Measured at 390 and 320, `pointer: coarse`, `hasTouch`: `X` **10.1 × 44 → 26.1 × 44**; `GitHub` 51.8 → 67.8; `LinkedIn` 63.5 → 79.5; `arinze@splita.co` 128 → 144. At 26.1 × 44 the link **clears 2.5.8's 24 × 24 minimum outright** and no longer depends on the spacing exception. Nearest centre-to-centre distance rose from 60.8 px to **90 px** (390) / **75.3 px** (320). No horizontal overflow at either width.                                                                                                                                                                                                    |

---

## 5. SUSPECTED items investigated

### a11y S1 — `aria-describedby` pointing at a `hidden` node, one engine only — **NOT RESOLVABLE IN THIS HARNESS**

Playwright exposes an accessibility tree for Chromium only; Gecko and WebKit
have no equivalent surface, and no screen reader is drivable from here. What
_can_ be stated: the DOM half is identical in all three engines (same
`aria-describedby`, same `hidden` node, clean link and heading text), Chromium's
real tree reports `description: "opens in a new tab"`, and
`src/components/ui/ui.test.tsx` asserts the same result through
`dom-accessibility-api`, a spec-faithful implementation independent of any
engine. **One VoiceOver + Safari pass and one NVDA + Firefox pass are still
required.** No code change: if the rule does not hold, the notice is silently
lost rather than misplaced, which is a regression on the description only and
not on the names — a worse fix would be to put it back in the name, which is
what cycle 1 removed.

### a11y S2 — Lenis is the one real vestibular surface, and it is AAA-only — **CONFIRMED NOT A DEFECT**

The reviewer's conclusion stands and is re-confirmed on this build: under
`prefers-reduced-motion: reduce`, `html.lenis` is **absent**, `[data-reveal]`
count is **0**, the scene chunk is **never requested**, the poster is at
`opacity: 1` and **0** elements hold text below full opacity. SC 2.3.3 is Level
AAA and Lenis is destroyed rather than paused, which is the complete AA answer.
**The parenthetical risk is now closed rather than carried:** the
`animation-timeline: view()` block that would have become the site's first
scroll-linked motion is deleted (xb N7), so there is no latent scroll-scrubbed
animation left in the file.

### xb S1 — the device-floor gate has no teeth outside Chromium — **NOT FIXED (deliberate, with reason)**

`navigator.deviceMemory` and `navigator.connection` are `null` in Firefox 155
and WebKit 26.6, so outside Chromium the WebGL2 probe is the only gate with
teeth. The suggested remedy — replace the core count with a first-N-frames
timing bail-out — is a behavioural change to the render loop that **cannot be
falsified in this harness**: Playwright's CPU throttling does not alter
`hardwareConcurrency`, and there is no way here to produce the slow-GPU
condition the bail-out exists to detect. Shipping an unverifiable change to the
one subsystem that carries the measured "0 frames off-screen, 0 frames
tab-hidden" guarantee is a worse trade than leaving it filed. **Carried to cycle
3, needing real low-end hardware.**

### xb S2 — iOS URL-bar dynamic resize — **STILL UNVERIFIABLE, CONSTRUCTION RE-CONFIRMED**

`grep -rn "100vh" src/` returns nothing; `100svh` at `globals.css:534` is the
only viewport unit in the file. That is the configuration in which the classic
bug cannot occur. One pass on a real handset would close it.

### xb S3 — N1 in the Firefox and Safari print pipelines — **PARTIALLY CLOSED**

The computed print state is now verified in all three engines (poster
`opacity: 1`, canvas `display: none`). Real print _output_ remains
Chromium-only, because `page.pdf()` is. The fix is engine-independent CSS.

### xb S4 — field CLS on a device without Arial — **MEASURED IN EMULATION, REAL HARDWARE STILL OPEN**

See MEDIUM 1. The Arial-absent condition was simulated by rewriting the served
`@font-face`, and CLS under that condition is now **identical to the
Apple-platform control** (0.0146 vs 0.0146, against 0.0235 before the fix).
**The "CLS 0.000" claim should still not be carried to Android** until one
measurement on real hardware.

### xb S5 — `-webkit-text-size-adjust` in WebKit — **MEASURED, RECLASSIFIED**

WebKit 26.6 returns `false` from `CSS.supports()` for `text-size-adjust`,
`-webkit-text-size-adjust` and `-moz-text-size-adjust`, and exposes none of them
through `getComputedStyle`. Firefox 155 desktop returns `false` for all three
and computes `-moz-text-size-adjust: auto`. This is not a Playwright
introspection gap: it is that desktop engines do not implement font inflation,
so the property has nothing to control. The declaration's audience is Firefox
for Android and iOS Safari, and the compiled stylesheet now carries all three
spellings for them.

---

## 6. Regression check — nothing from cycle 1 was undone

Each row re-measured on this build, not read from `docs/07`.

| Cycle-1 win                                          | Re-measured                                                                                                                                                                           | Verdict |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Lighthouse 99 / 100 / 96 / 100 (mobile, median of 3) | **99 / 100 / 96 / 100**                                                                                                                                                               | ✅      |
| CLS 0.000                                            | **0.000** in all three Lighthouse runs                                                                                                                                                | ✅      |
| LCP 2,003 ms                                         | **2,003 ms** (runs: 1,916 / 2,003 / 2,004)                                                                                                                                            | ✅      |
| Real First Load JS 113,269 B                         | **114,241 B** (+972 B)                                                                                                                                                                | ⚠️ §7   |
| 0 production npm vulnerabilities                     | `npm audit --omit=dev` → **0**                                                                                                                                                        | ✅      |
| 112/112 tests                                        | **147/147** (112 + 35 new)                                                                                                                                                            | ✅      |
| axe 0 violations                                     | **0** across 8 scans, including `/` at 390 **and** 767 with the sheet open                                                                                                            | ✅      |
| Zero 3D bytes under reduced motion                   | 0 scene-chunk requests, 0 `<canvas>`, 0 `[data-reveal]`, no `html.lenis`, poster at `opacity: 1`, 0 elements holding text below full opacity                                          | ✅      |
| Render loop draws 0 frames off-screen and tab-hidden | **120 draws / 2 s on-screen; 0 off-screen; 0 tab-hidden**, counting WebGL `drawArrays` calls (counting `requestAnimationFrame` measures Lenis's own loop and is the wrong instrument) | ✅      |
| `.col` naming, `.container` never restored           | `.col` count 7 on `/`, `.container` count **0**, identical in Chromium, Firefox and WebKit                                                                                            | ✅      |
| Framer Motion absent                                 | no dependency, no import, no `LazyMotion` boundary — only the comment recording its removal                                                                                           | ✅      |
| Space Grotesk paints in all three engines            | `h1` family `"Space Grotesk"`; width 656.86 / 656.83 / 656.86 px; document height **4,833 px in all three** — unchanged                                                               | ✅      |
| Skip link → `MAIN#main`                              | Tab → Enter at 1440 puts `activeElement` on `#main`                                                                                                                                   | ✅      |
| 0 page errors                                        | 0 in Chromium, Firefox and WebKit                                                                                                                                                     | ✅      |
| `typecheck` / `lint` / `build`                       | all clean                                                                                                                                                                             | ✅      |

---

## 7. The one number that moved: First Load JS

**113,269 B → 114,241 B, +972 B (+0.86 %).** Same method as cycle 1: `gzip -9`
on the scripts the **served document** references, excluding the `nomodule`
polyfill chunk that no modern browser fetches (confirmed absent from the network
waterfall). The over-the-wire total the browser actually transfers, including
the dynamically imported Lenis chunk, is 118,758 B.

The delta is the focus trap (`focusable.ts` + `use-focus-trap.ts` + the Nav
wiring), the `emphasis` prop and the rewritten theme script, and it lands
entirely in `app/layout-*.js` (5,316 → 5,311 B) and the shared chunk. It is
0.86 % of a budget whose ceiling is 200 KB, bought with an outright **Level AA
conformance failure** fixed. Lighthouse Performance, LCP, FCP and TBT are all
unchanged at the measured precision.

---

## 8. Tests added — 35

| File                                 | Tests | Guards                                                                                                                                                                                                                                                                                      |
| ------------------------------------ | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/a11y/focusable.test.ts`     |     7 | Tab-stop discovery; `tabindex="-1"` excluded; `visibility` **and** `display` hiding both caught (`display` is not inherited, so the ancestor chain has to be walked — one check does not cover both); frozen return                                                                         |
| `src/components/layout/Nav.test.tsx` |    11 | The trap's logic: focus into the sheet on open, every Tab driven around the ring, wrap in both directions, pull-back from outside, **complete inertness while closed**, dismissal on outside focus and outside pointer, Escape → toggle, link → destination section, off-page link → toggle |
| `src/app/print-styles.test.ts`       |    14 | The four print declarations by the exact property whose absence caused each defect; the poster ink living in the stylesheet not an inline style; the forced-colours rule; the metric fallback face and its position in `--font-sans`; the deleted scroll-driven block                       |
| `src/components/ui/ui.test.tsx`      |    +3 | `emphasis` defaults to A2; `"proof"` emits `.link--proof`; emphasis is orthogonal to routing and to the new-tab description                                                                                                                                                                 |
| `tests/e2e/nav-focus-trap.spec.ts`   |     7 | The geometric half of N1 — real layout, `elementFromPoint` at the focused element's centre, at 767×900, 480×700, 390×844 and 320×640 — plus Escape, link navigation, and desktop non-interference                                                                                           |
| `tests/e2e/print.spec.ts`            |     2 | The PDF byte counterfactual with preconditions asserted; the computed print state for all four print defects                                                                                                                                                                                |

`src/app/print-styles.test.ts` asserts on **source text**, which is a deliberate
and stated trade: jsdom evaluates no `@media print`, so the cheap guard that runs
on every `npm test` can only prove the rules are still there with the properties
that make them work. The e2e spec is what proves they work.

**Pre-existing, not mine to fix:** `tests/e2e/home.spec.ts` is stale — it asserts
against the _previous_ site (`"Founder"`, `#current-work`, a `"Connect"` link)
and fails. It was already failing before this pass. Flagged rather than deleted,
because it belongs to another agent's surface.

---

## 9. Summary of files changed

| File                                                          | Change                                                                                                                                                                                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/a11y/focusable.ts`                                   | **new** — focusable discovery, pure, no layout read                                                                                                                                                                            |
| `src/lib/a11y/use-focus-trap.ts`                              | **new** — the trap, with a typed dismissal reason                                                                                                                                                                              |
| `src/lib/a11y/focusable.test.ts`                              | **new**                                                                                                                                                                                                                        |
| `src/components/layout/Nav.tsx`                               | focus trap, dismissal destinations, `isDisclosure`, rewritten 2.4.11 comment                                                                                                                                                   |
| `src/components/layout/Nav.test.tsx`                          | **new**                                                                                                                                                                                                                        |
| `src/components/layout/ThemeScript.tsx`                       | OS preference resolved outside the `try`                                                                                                                                                                                       |
| `src/components/ui/InlineLink.tsx`                            | `emphasis: "proof" \| "default"`                                                                                                                                                                                               |
| `src/components/ui/ui.test.tsx`                               | +3 tests                                                                                                                                                                                                                       |
| `src/components/sections/primitives/RichText.tsx`             | `emphasis` pass-through                                                                                                                                                                                                        |
| `src/components/sections/HeroSection.tsx`                     | `emphasis="proof"` on the credential sentence                                                                                                                                                                                  |
| `src/components/three/AttestationPoster.tsx`                  | `color` removed from the inline style                                                                                                                                                                                          |
| `src/components/three/AttestationLive.tsx`                    | forced-colours gate (GATE 2); gate numbering                                                                                                                                                                                   |
| `src/components/three/runtime/capability.ts`                  | `isForcedColorsActive`                                                                                                                                                                                                         |
| `src/content/writing/copy.ts`                                 | `WRITING_INDEX.emptyState`                                                                                                                                                                                                     |
| `src/content/writing/render.tsx`                              | `role="region"` → `role="group"`; decision recorded                                                                                                                                                                            |
| `src/app/writing/page.tsx`                                    | empty-state branch                                                                                                                                                                                                             |
| `src/app/globals.css`                                         | §4b fallback face; `--font-sans`; `text-size-adjust`; `--print-min-lines`; `section[tabindex="-1"]` ring; deleted scroll-driven block; `.link--proof`; `.link-standalone` coarse padding; poster ink rule; §10 print rewritten |
| `src/app/print-styles.test.ts`                                | **new**                                                                                                                                                                                                                        |
| `tests/e2e/nav-focus-trap.spec.ts`, `tests/e2e/print.spec.ts` | **new**                                                                                                                                                                                                                        |

---

## 10. Open against the next pass

| #       | Item                                                                                                                                             | Owner                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| xb S1   | Device-floor gate has no teeth outside Chromium; the frame-time bail-out is unverifiable in this harness                                         | needs real low-end hardware |
| xb S4   | Field CLS on a real Android handset, after the N5 fix                                                                                            | needs real hardware         |
| xb S2   | iOS URL-bar dynamic resize                                                                                                                       | needs a real handset        |
| a11y S1 | One VoiceOver + Safari and one NVDA + Firefox pass over the external-link description                                                            | needs a real screen reader  |
| §8.3    | Does A1 replace the 1 px `--color-border-interactive` underline on proof links, or sit above it? Shipped per the document's literal rule; see §3 | `docs/04` owner             |
| §9.5    | `--print-min-lines` has no upstream token; `docs/04 §9.5` declares no pagination control at all                                                  | `docs/04` owner             |
| —       | `tests/e2e/home.spec.ts` asserts against the previous site and fails                                                                             | test owner                  |
