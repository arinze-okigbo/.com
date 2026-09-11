# 08 — Accessibility Re-Review (Cycle 2)

**Phase:** 5 (adversarial re-review). **Standard:** WCAG 2.2 Level AA.
**Date:** 2026-09-11. **Reviewer:** `review-accessibility` (cycle 2).
**Inputs read first:** `docs/06-review-accessibility.md`, `docs/07-fix-report.md`, `docs/04-design-system.md`, `docs/05-information-architecture.md`, `docs/03-recruiter-research.md` (R9).
**Build under test:** `npm run build` (exit 0, next 15.5.25) → `next start -p 3102`. A stale `next-server v15.2.8` was found squatting on 3102 and was killed before binding; every number below came from the 15.5.25 build.
**Tooling:** Playwright 1.51 driving Chromium (plus Firefox and WebKit for the accname cross-check), CDP `Accessibility.getFullAXTree` / `getPartialAXTree` for the real accessibility tree, `axe-core` 4.11.1 injected from `node_modules`. No `claude-in-chrome` tool was used.

**Method note.** This cycle deliberately did not repeat the cycle-1 matrix. axe was run only as a *sanity* control (5 scans, including one state cycle 1 never scanned). The effort went into the eight areas the brief named, all of which are invisible to axe.

---

## 0. Headline

| Metric | Result |
|---|---|
| Previous defects re-verified | 8 of 8 (+5 LOW/INFO) |
| …GENUINELY FIXED | **7 of 8** |
| …FIXED but ineffective in practice | **1** (LOW #11, forced colours — see N3) |
| …suppressed rather than fixed | **0** |
| New CONFIRMED defects | **6** — 2 HIGH · 2 MEDIUM · 2 LOW |
| New SUSPECTED | **2** |
| axe violations (5 sanity scans) | **0** |
| Explicit passes recorded | 18 |

**Most serious new problem:** N1 — with the mobile disclosure sheet open, Tab moves focus to page links *behind* the sheet, and between 480 px and 767 px the focused link is **100 % covered**. That is SC 2.4.11 Focus Not Obscured (Minimum), Level **AA**, failed outright. The source comment at `Nav.tsx:95-96` cites SC 2.4.11 by number as the reason the sheet deliberately does not trap focus — it is the exact criterion the decision breaks.

**Honest framing of the rest.** This build is genuinely clean in the areas cycle 1 covered and in most of what cycle 2 added. Reflow at 400 %, the 1.4.12 text-spacing overrides, the headings chain under R9, reading order vs. visual order, target size under the new Space Grotesk metrics, the three DOM states of the 3D figure, reduced motion, and no-JS all **pass on measurement**. Two of the six new findings are LOW and one of those is unreachable code. I am not padding the count.

---

## PART A — Verification of the 8 previous CONFIRMED defects

Each was re-measured against the rendered page, not read from `docs/07`.

| # | Cycle-1 defect | Verdict | Measured evidence (this build) |
|---|---|---|---|
| **1** | `--color-foreground-faint` at 1.83:1 on the résumé affordance | **GENUINELY FIXED** | All three occurrences (nav slot, hero, contact) now compute `rgb(105,105,105)` = **5.35:1** light and `rgb(138,138,138)` = **5.73:1** dark against a 4.5:1 bar. `aria-disabled` is gone (`null` on every span). Swept every `foreground-muted` / `foreground-faint` text node on `/`: **zero** nodes below 4.5:1 in either theme. No suppression — the colour changed, the markup did not gain a waiver. |
| **2** | `/writing/<missing>` empty `<title>` (2.4.2, **A**) | **GENUINELY FIXED** | `/writing/does-not-exist` → HTTP 404, `document.title = "Page not found — Arinze Okigbo"`, `<h1> = "No page at this address."`, `lang="en"`, one `<main>`. Identical to `/definitely-missing-page`. axe `document-title` 0/5 scans. |
| **3** | `border-radius: inherit` collapsing radii on focus | **GENUINELY FIXED** | Declaration deleted (`globals.css:438-441` now sets `outline` + `outline-offset` only). Focused: `.skip-link` **9999px**, `.btn--primary` **8px**, `.theme-toggle` **8px**. Ring still `color(display-p3 0.47 0.37 0.1) solid 2px`, offset 2px. |
| **4** | "(opens in a new tab)" leaking into 4 headings and 4 `<article>` names | **GENUINELY FIXED** | CDP accname, all 4 articles: `"Splita — group payments collected up front"`, `"Browser-native authentication — FIDO2, PKI, and Microsoft Entra ID"`, `"LLM output evaluation inside production AI pipelines"`, `"SkyView — browser-based 3D globe on Google Photorealistic 3D Tiles"` — **no new-tab string in any of them**. The notice survives as `description: "opens in a new tab"` on every external link. The shared `<span hidden>` is `display: none` and does **not** appear in linear reading order. See **S1** for the one engine caveat. |
| **5** | `aria-pressed` contradicting the toggle's name (4.1.2) | **GENUINELY FIXED** | The toggle's AX properties are now `invalid="false", focusable=true` — **no `pressed` property at all**. Name flips `"Switch to dark theme"` ↔ `"Switch to light theme"` in step with `data-theme` and body background, driven in CSS off `[data-theme]`, so SSR and hydration cannot disagree. Enter and Space both operate it. (But see **N4** for a state where the name is still wrong.) |
| **6 + S1** | `<main>` lacks `tabindex="-1"`; skip link Chromium-only | **GENUINELY FIXED** | `layout.tsx:153` → `<main id="main" tabIndex={-1}>`. Tab → Enter on the skip link puts `document.activeElement` on `MAIN#main` (was `BODY`). The next Tab lands on "Splita", the first link inside `<main>`. |
| **6b** | *(new in cycle 1's fix pass)* accent ring around all of `<main>` | **GENUINELY FIXED, and correctly scoped** | `main[tabindex="-1"]:focus-visible { outline: none }` (`globals.css:462-465`). Measured `outline-style: none` on `main` while focused, and `2px solid` accent still present on every real control in the same pass. This is a correct narrow suppression, not a blanket `outline: none`. |
| **7** | `<pre>` scrollable but not focusable (2.1.1, **A**) | **FIXED BY INSPECTION — STILL NEVER EXECUTED** | `render.tsx:172` emits `<pre tabIndex={0} role="region" aria-label={CODE_SAMPLE_LABEL}>`. `content/writing/` still holds only `.gitkeep`, so **zero posts exist** and the branch cannot be reached at runtime in this build either. The code is correct; see **N6** for two side-effects of the chosen shape. |
| **8** | Entry separators at 1.19:1 | **CORRECTLY NOT FIXED IN CODE** | Still `rgba(0,0,0,0.08)` / 1px on `article.border-t`. Cycle 1's own conclusion was that no code change is required for AA and that `docs/04 §8.2` should be amended instead. That routing stands. Under `forced-colors: active` the same rule computes `rgb(0,0,0)` — the separator is *more* visible in HCM than in the default rendering. |

### The five LOW/INFO items

| # | Cycle-1 item | Verdict |
|---|---|---|
| 9 | Skip link revealed on `:focus-visible` only | **FIXED** — `globals.css:763-764` is now `.skip-link:focus, .skip-link:focus-visible`. Measured `opacity: 1`, `165.6 × 48.8` on first Tab, and `elementFromPoint` at its centre returns the skip link itself, so it paints above the sticky header. |
| 10 | Footer `X` link 8.6 × 16 px | **FIXED** — now `10.1 × 24` (fine pointer) / `10.1 × 44` (coarse). Re-evaluated 2.5.8's spacing exception against the **new Space Grotesk metrics** at 1440 / 390 / 320: nearest centre-to-centre distance is **60.8 px** (X ↔ LinkedIn), versus the 24 px the exception requires. At 320 the row wraps to two lines and the vertical separation is 68 px. Exception holds with large margin. |
| 11 | No `forced-colors` handling | **CLAIMED FIXED — MEASURED INERT.** See **N3**. This is the one previous item that did not actually take effect. |
| 12 | `docs/04 §3.4` "guaranteed floor" claim false in dark | **NOT FIXED (documentation, correctly routed)** — unchanged, immaterial to conformance. |
| 13 | Contact endpoint unreachable | **FIXED by deletion** — `document.querySelectorAll("form,input,textarea,select").length === 0` on every route. No form-related SC is in scope (3.3.x, 1.3.5, 4.1.3-for-errors all N/A). |

**Nothing was suppressed to make axe pass.** I looked specifically for that: there is no `outline: none` without a replacement, no `aria-hidden` on content, no `role="presentation"` added to anything meaningful, no axe rule disabled anywhere in the tree, and no `.visually-hidden` used to bury a problem. The one suppression that exists (`main[tabindex="-1"]:focus-visible`) is argued correctly and scoped to a single non-component element.

---

## PART B — New CONFIRMED defects

### N1. HIGH — an open mobile nav sheet entirely hides the focused element

- **SC violated:** **2.4.11 Focus Not Obscured (Minimum), Level AA.** Also fails 2.4.12 (AAA) at every viewport below 768 px.
- **Files / lines:**
  - `src/components/layout/Nav.tsx:95-104` — the Escape-only effect, and the comment that names 2.4.11 as the justification for not managing focus.
  - `src/components/layout/Nav.tsx:116` — `onClick={() => setIsOpen((previous) => !previous)}`; nothing closes the sheet on `focusout`.
  - `src/app/globals.css:913-926` — `.js .nav-sheet { position: absolute; … box-shadow: var(--shadow-overlay) }`; the sheet is an opaque overlay over page content.
- **Measured evidence.** Open the sheet from the keyboard (`.nav-toggle` → Enter), then Tab. Focus leaves the sheet after the 4th link, passes the theme toggle, and lands on the first hero proof-noun link, which sits underneath the sheet. Coverage of the focused element **plus its 2 px ring at 2 px offset**:

  | Viewport | Focused element | Element rect | Sheet bottom | Ring area covered | Visible strip | 2.4.11 |
  |---|---|---|---:|---:|---:|---|
  | 767 × 900 | `a.link` "Splita" | 312.6 – 333.6 | 350.0 | **100 %** | **0 px** | **FAIL** |
  | 480 × 700 | `a.link` "Splita" | 308.9 – 329.9 | 350.0 | **100 %** | **0 px** | **FAIL** |
  | 390 × 844 | `a.link` "Splita" | 337.9 – 358.9 | 350.0 | 55.4 % | 12.9 px | pass (2.4.12 fail) |
  | 360 × 640 | `a.link` "Splita" | 337.9 – 358.9 | 350.0 | 55.4 % | 12.9 px | pass (2.4.12 fail) |
  | 320 × 640 | `a.link` "Splita" | 337.9 – 358.9 | 355.6 | 74.7 % | 7.3 px | pass (2.4.12 fail) |

  Independently corroborated at 390 and 320 by `document.elementFromPoint` at the focused link's centre, which returns `div.nav-sheet`, not the link.

  767 × 900 and 480 × 700 are not contrived: 767 px is the last pixel below the `48rem` breakpoint and is exactly what a 1534 px window at 200 % zoom produces; 480 px is a common split-screen and small-tablet width.
- **Why axe cannot see it.** axe evaluates a static DOM. This is a *focus-state* failure that only exists while the sheet is open and focus has moved past it. The sheet-open axe scan I ran returns **0 violations** and is still wrong about the page.
- **Root cause.** The sheet is a deliberate non-modal disclosure, which is a defensible choice — but a non-modal disclosure that overlays content must close when focus leaves it. This one does neither: it neither traps focus (correct) nor releases the overlay (missing).
- **Fix (smallest correct change, ARIA APG disclosure pattern):** in `Nav.tsx`, close the sheet when focus moves outside the `<nav>`. Add to the same effect that already owns Escape:
  ```ts
  function handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && navRef.current?.contains(next)) return;
    setIsOpen(false);
  }
  navRef.current?.addEventListener("focusout", handleFocusOut);
  ```
  with a `navRef` on the `<nav aria-label="Primary">` at `Nav.tsx:109`. This also removes the 2.4.12 near-misses at 320–390, because no focusable element outside the sheet is ever focused while the sheet is painted.

---

### N2. HIGH — closing the sheet destroys keyboard focus

- **SC violated:** **2.4.3 Focus Order, Level A.** (2.4.7 Focus Visible is also collaterally broken: there is no focused element to indicate.)
- **File / line:** `src/components/layout/Nav.tsx:100` — `if (event.key === "Escape") setIsOpen(false);`, and `Nav.tsx:63` — `const close = useCallback((): void => setIsOpen(false), []);` used as each sheet link's `onClick`.
- **Measured evidence.** Open the sheet, Tab once (focus on "Work", inside the sheet), press Escape:

  | | before Escape | after Escape |
  |---|---|---|
  | `document.activeElement` | `A.nav-link` "Work" | **`BODY`** |
  | `document.activeElement === document.body` | false | **true** |
  | `.nav-sheet[data-open]` | `true` | `false` |
  | `.nav-sheet` visibility | `visible` | `hidden` |
  | `.nav-toggle[aria-expanded]` | `true` | `false` |

  Reproduced identically at 390 × 844 and 320 × 640. The same thing happens on the normal success path: activating "Work" inside the sheet closes it and leaves `document.activeElement === BODY` with `location.hash === "#work"`.
- **Cause.** `data-open="false"` applies `visibility: hidden` (`globals.css:931-940`) to the element that currently holds focus. The browser has no choice but to blur it, and nothing puts focus anywhere. A screen-reader user's virtual cursor is reset to the top of the document; in Chromium the next Tab resumes near the removed element, but that behaviour is a starting-point heuristic, not a focus position, and it is not guaranteed across engines.
- **Fix:** return focus to the control that owns the disclosure, which is what `aria-expanded` promises. Give the toggle a ref and, in the Escape handler and in `close`, call `toggleRef.current?.focus()` after `setIsOpen(false)`. Two lines, and it also makes the sheet re-openable without Shift+Tabbing blind.

---

### N3. MEDIUM — the cycle-1 forced-colours fix is inert; the surface it targets is never the one painted

- **SC at risk:** none directly (forced colours is not a WCAG success criterion), but `docs/07 §3` records LOW #11 as **FIXED** and it is not. Filed MEDIUM because a fix report asserting a measured fix that does not take effect is worse than the original open item.
- **Files / lines:**
  - `src/app/globals.css:1216-1220` — `@media (forced-colors: active) { [data-attestation-poster] { color: CanvasText } }`
  - `src/components/three/AttestationPoster.tsx:102,113,136` — `POSTER_STYLE` sets `color: "var(--color-foreground-secondary)"` and is applied as `style={POSTER_STYLE}`, i.e. an **inline style attribute**.
- **Measured evidence** under `forcedColors: "active"` (`matchMedia("(forced-colors: active)").matches === true` confirmed):

  | Motion preference | poster inline `style.color` | **computed `color`** | computed `fill` | poster `opacity` | `<canvas>` count |
  |---|---|---|---|---:|---:|
  | no-preference | `var(--color-foreground-secondary)` | **`rgb(92,92,92)`** | `rgb(92,92,92)` | **0** | 1 |
  | reduce | `var(--color-foreground-secondary)` | **`rgb(92,92,92)`** | `rgb(92,92,92)` | 1 | 0 |

  `CanvasText` would compute to `rgb(0,0,0)` in Chromium's forced-colours emulation. It computes to `rgb(92,92,92)` in both states, so the rule never wins.
- **Two independent reasons it does nothing.**
  1. **Cascade.** An inline `style` attribute beats any stylesheet declaration without `!important`, media query or not. The rule at `globals.css:1218` has never applied to a single render.
  2. **Gating.** Even if it did apply, with normal motion the WebGL canvas mounts and cross-fades the poster to `opacity: 0` — the fix targets an invisible element. WebGL pixel output is not subject to the forced palette at all, so in Windows High Contrast Mode the figure is a canvas of author-coloured grey points on a system-coloured page, which is precisely the outcome the rule was written to prevent.
- **What *does* survive forced colours (measured, and it is most of the page):** focus ring `rgba(5,0,73,0.8) 2px solid` on the skip link and `.btn--primary`; link text `rgb(0,0,159)` (LinkText); `.btn--primary` forced to `rgb(255,255,255)` ground with `rgb(0,0,159)` border; header ground `rgb(255,255,255)` (Canvas); the readout `✓` glyph forced to `rgb(0,0,0)`; entry separators forced to `rgb(0,0,0)`. The `.nav-link[aria-current="true"]::after` accent marker disappears (becomes Canvas), but the active item also carries `font-weight: 500` and `aria-current="true"` (`globals.css` nav block; `Nav.tsx:141`), so the state survives in two non-colour channels — **not a 1.4.1 failure**.
- **Fix:** the declaration has to reach the element that actually paints.
  1. Move `color` off `POSTER_STYLE` and onto a class or a `[data-attestation-poster]` rule in `globals.css`, so the forced-colours override can win normally; or keep the inline style and add `!important` to the forced-colours rule (works, but the first option is the honest one).
  2. Add a seventh gate in `AttestationLive.tsx:76-81`, beside the reduced-motion and `canRunScene()` gates: `if (matchMedia("(forced-colors: active)").matches) return;`. A user in HCM gets the poster, which the system palette can then re-colour — the same bargain reduced motion already gets.

---

### N4. MEDIUM — the theme toggle misstates its own state when site data is blocked

- **SC violated:** **4.1.2 Name, Role, Value, Level A** — the exposed name does not describe what the control will do.
- **File / line:** `src/components/layout/ThemeScript.tsx:18` — the whole resolution sits inside one `try`:
  ```js
  try{var s=localStorage.getItem("theme");var d=s==="dark"||(!s&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}
  ```
  On a throw, `data-theme` is never written — but `classList.add("js")` is outside the `try`, so `.js .theme-toggle { display: inline-flex }` (`globals.css:858-860`) still reveals the control. The name and icon are selected by `[data-theme="dark"]` (`globals.css:892-899`), which cannot match.
- **Measured evidence.** `localStorage` made to throw `SecurityError` on access (Chromium's behaviour with site data blocked; also reproducible in Firefox with `dom.storage.enabled = false`), OS preference dark:

  | Step | `data-theme` | body background | visible icon | accessible name |
  |---|---|---|---|---|
  | initial | **`(unset)`** | `rgb(10,10,10)` (dark) | moon | **"Switch to dark theme"** |
  | after 1st click | `dark` | `rgb(10,10,10)` — **unchanged** | sun | "Switch to light theme" |
  | after 2nd click | `light` | `rgb(252,252,252)` | moon | "Switch to dark theme" |

  The page is already dark, the control announces "Switch to dark theme", and the first activation produces **no perceivable change at all** — it only re-labels the button.
- **Control:** with `localStorage` working and OS dark, `data-theme="dark"` and the name is correctly "Switch to light theme". The defect is confined to the throwing path.
- **Fix:** resolve the preference outside the `try`, so `data-theme` is always written:
  ```js
  var d=matchMedia("(prefers-color-scheme: dark)").matches;
  try{var s=localStorage.getItem("theme");if(s)d=s==="dark";}catch(e){}
  document.documentElement.dataset.theme=d?"dark":"light";
  document.documentElement.classList.add("js");
  ```
  Same byte count, and it removes the only state in which `[data-theme]` is absent while `.js` is present.

---

### N5. LOW — `/writing` with zero posts renders one word and no way onward

- **SC violated:** none. Recorded because the brief asks about routes' edge states, and this is the only route whose *success* path is empty.
- **File / line:** `src/app/writing/page.tsx:26-44` — `getPublishedSummaries()` returns `[]` and the `<div>` maps over nothing; there is no empty branch.
- **Measured evidence:** HTTP 200. `document.title = "Writing — Arinze Okigbo"`, `<h1> = "Writing"`, `main.innerText === "Writing"` exactly, **0 links and 0 articles inside `<main>`**, 177 body characters at 1440 and 116 at 390 (header and footer only). Heading-only navigation delivers "Writing" and then silence.
- **Mitigating:** the route is `noindex, nofollow`, absent from nav, footer, sitemap and feed, so it is reachable only by typing the URL. The 404 route by contrast is exemplary (see passes).
- **Fix:** render `WRITING_INDEX`'s empty-state copy when `posts.length === 0` — a sentence plus the same `StandaloneLink` home affordance `not-found.tsx:36` already uses. If no such string exists in `src/content/writing/copy.ts`, that is a `content` item, not a code one.

---

### N6. LOW — `<pre role="region">` mints a landmark per code block and a tab stop on blocks that do not scroll

- **SC violated:** none. 2.1.1 is satisfied by the fix. This is a quality note on the shape chosen, filed so it is not rediscovered.
- **File / line:** `src/content/writing/render.tsx:172` — `<pre key={key} tabIndex={0} role="region" aria-label={CODE_SAMPLE_LABEL}>`.
- **Two consequences, both by inspection only** — `content/writing/` still contains nothing but `.gitkeep`, so this branch has **never executed** in any build, in cycle 1 or cycle 2:
  1. `role="region"` with a name is a **landmark**. A post with six code blocks contributes six identically-named "Code sample" landmarks to the landmark rotor, ahead of `main`, `banner` and `contentinfo` in usefulness terms but not in count. `role="group"` gives the same name and focusability without polluting landmark navigation.
  2. `tabIndex={0}` is unconditional, so a two-line snippet that never overflows is still a tab stop that does nothing. The conventional shape is to apply it only when `scrollWidth > clientWidth`, which needs a client measurement this Server Component cannot make — so accepting the extra stop is reasonable; it should just be a recorded decision rather than an accident.
- **Fix:** `role="group"` instead of `role="region"`, or leave as-is and record the choice. Either way this stays untested until a post exists.

---

## PART C — SUSPECTED

### S1. `aria-describedby` pointing at a `hidden` node — confirmed in one engine only
Cycle-1 defect 4's fix depends on the accname spec's rule that a node *directly referenced* by `aria-describedby` contributes its text even while hidden. I confirmed in Chromium's real accessibility tree that every external link carries `description: "opens in a new tab"` while `#external-link-notice` computes `display: none` and is absent from linear reading order. In Firefox and WebKit I confirmed only the DOM half — same `aria-describedby`, same `hidden` node, same clean link text and heading text — because Playwright exposes no accessibility tree for those engines. Gecko and WebKit both implement the rule per spec, so I expect this to hold, but **it has not been heard by a real screen reader in any engine**. One VoiceOver + Safari and one NVDA + Firefox pass would close it. If it turns out not to hold, the notice is silently lost rather than misplaced — a regression to cycle 1's pre-fix state on the *description*, not on the names.

### S2. Lenis smooth scroll is the one real vestibular surface, and it is AAA-only
With `prefers-reduced-motion` unset, `<html>` carries the `lenis` class and Lenis is constructed with its own defaults (`SmoothScrollProvider.tsx`, no options object). Scroll therefore continues under inertia after the wheel or trackpad input stops. Everything the brief asked me to look for is **absent** — I swept every element on `/` and found **no** `animation-timeline` other than `auto`, no parallax, no scroll-scrubbed transform, no sticky-pinned scene, and no element whose transform tracks scroll position. The reveals are the only motion: `--duration-reveal: .28s`, `--reveal-distance: 8px`, `--reveal-distance-lg: 16px`, `--stagger-step: 50ms`, all IntersectionObserver-triggered CSS transitions that run once and stop. Sampled during a full-page scroll, the largest travel observed on any element was **8 px**. That is not a vestibular trigger. Lenis inertia arguably is, for a small number of people — but SC 2.3.3 Animation from Interactions is **Level AAA**, and Lenis is already destroyed (not paused) under reduced motion, which is the correct and complete AA answer. **No defect filed.** Recorded so the next cycle does not re-litigate it.

*(Latent, not a defect: `globals.css:493-501` defines `.js [data-reveal="decorative"]` as a genuine scroll-scrubbed `animation-timeline: view()` animation. `grep -rn "decorative" src/` shows no component emits that value, and no element on any route computes a non-`auto` `animation-timeline`. If a future component uses it, that is the first scroll-linked motion on the site and it needs re-testing — the reduced-motion block at `globals.css:1074` is authored after the `@supports` block and does neutralise it, which is correct.)*

---

## PART D — EXPLICIT PASSES

Stated plainly, because the brief asked for them and because several are the areas cycle 1 under-covered.

**Screen-reader semantics in practice (1.3.1, 1.3.2, 2.4.6)**
1. **Reading order matches visual order exactly.** Walked every text-bearing element under `<main>` in DOM order and recorded its document `top`: 65 → 177 → 269 → 343 → 425 → 591 → 735 → 863 → 977 → 1010 → … → 4307 → 4436. **Strictly monotonic increasing, 52 elements, zero inversions.** No CSS order/flex-reversal/grid-placement anywhere moves content away from its DOM position.
2. **The work entries announce coherently.** Each is `<article aria-labelledby>` named from its own `<h3>`, and the linear content under each is mechanism → contribution → (outcome) → metadata line, in that order. The metadata line reads as `"Co-Founder & CEO · Splita · Aug 2025 – Present · splita.co"` with the separator `aria-hidden`. Nothing is announced twice and no name is inaccurate.
3. **Landmarks are correct and singular:** one `banner`, one `main`, one `contentinfo`, one `navigation` named "Primary", and four `region`s each correctly named from its `h2`. The hero `<section>` is unnamed and is therefore correctly not exposed as a region.
4. **Exactly one `<h1>`, no skipped levels:** `h1 → h2#work → h3 ×3 → h2#projects → h3 → h2#about → h2#contact`.
5. **The `role="alert"` node in the tree is Next.js's own route announcer** (`<next-route-announcer>` → shadow root → `div#__next-route-announcer__[aria-live="assertive"][role="alert"]`), empty on load and populated from `document.title` on client navigation. It is correct and it is the reason client-side route changes are announced at all.

**`docs/03` R9 — headings-only navigation (highest-priority check) — PASS**
6. Extracted `h1`–`h3` in DOM order and read them as one text, which is the test as written:
   > *Arinze Okigbo. Group payments at Splita. Browser authentication at Queralt Inc. Model evaluation at Snorkel AI. Splita — group payments collected up front. Browser-native authentication — FIDO2, PKI, and Microsoft Entra ID. LLM output evaluation inside production AI pipelines. Open-source: SkyView layers live flight traffic on a photorealistic 3D globe. SkyView — browser-based 3D globe on Google Photorealistic 3D Tiles. TechBuzz, AI training, and a Nigerian tech incubator came before Splita. arinze@splita.co — direct email, plus GitHub, LinkedIn, X, and the résumé.*

   All three R9 clauses are carried by heading text alone: **what he builds** (h2#work), **the three strongest pieces of evidence** (the three h3s plus the SkyView pair), **how to contact him** (h2#contact, which is the address itself). Nine headings, zero filler, and — measurably better than cycle 1 — **zero contamination**: the new-tab notice that used to appear in four of them is gone.

**Focus management across the theme toggle (2.4.3, 4.1.2) — PASS**
7. **Focus is preserved.** Before: `document.activeElement` = `BUTTON.theme-toggle`. After Enter: still `BUTTON.theme-toggle`, with `focused=true` in the AX tree. After Space: unchanged. The component holds no React state and re-renders nothing, so there is no remount to lose focus through.
8. **The accessible name updates to reflect the new state**, driven by `[data-theme]` in CSS rather than by JS state: `"Switch to dark theme"` → `"Switch to light theme"` → `"Switch to dark theme"`, in lockstep with `data-theme` and `document.body` background (`rgb(252,252,252)` ↔ `rgb(10,10,10)`).
9. **The change is not announced, and that is correct.** There is no live region for the theme, and none is required: SC 4.1.3 Status Messages applies to messages conveying success, results or application state that the user must know about — a colour-scheme swap that a screen-reader user cannot perceive is not one. The control's own name carries the state, which is the standard theme-switcher pattern and is what 4.1.2 asks for. (N4 is the exception, and it is a state bug, not an announcement bug.)

**Zoom to 400 % and text spacing (1.4.10, 1.4.12) — PASS**
10. **1.4.10 Reflow at 400 %.** `scrollWidth − clientWidth === 0` and zero elements extending past the client width, on `/`, `/writing` and the 404, at **320 × 256** (400 % of 1280 × 1024), **400 × 300**, **320 × 800** and **720 × 450** (200 % of 1440 × 900). Twelve route × viewport combinations, no horizontal scrolling and no content loss in any of them; body text length is preserved at 4,498 characters at 320 px against 4,559 at 1440 px (the difference is the collapsed nav row, not lost prose).
11. **1.4.12 Text Spacing.** Applied the criterion's full override set — `line-height: 1.5`, `letter-spacing: 0.12em`, `word-spacing: 0.16em`, `margin-bottom: 2em` on paragraphs and headings, all `!important` — on `/`, `/writing` and the 404 at 1440, 390 and 320. **Zero clipping, zero overflow, zero content loss, `scrollWidth === clientWidth` in all nine.** Character counts are byte-identical before and after in every case (4,559 / 4,559 at 1440; 4,498 / 4,498 at 390 and 320). The only element reported by the geometric sweep is the theme toggle's `.visually-hidden` name span, whose unclipped `getBoundingClientRect` extends past the viewport while its parent's `overflow: hidden` + `clip-path: inset(50%)` clip it to 1 × 1 — a measurement artifact, and it contributes no scroll.

**The new `.col` measures (the renamed containers, rendering at their real widths for the first time) — PASS**
12. At 1440 (gutter 48): `.col--shell` **1120 px** outer, `.col--wide` **864 px**, `.col--prose` **768 px** — matching `docs/04 §1.5`'s stated outer boxes of 1120 / 864 / 768 and therefore content boxes of 1024 / 768 / 672. At 390 and 320 (gutter 24) the caps are 1072 / 816 / 720 and every column renders full-width, which is the same formula `calc(var(--container-X) + var(--gutter) * 2)` behaving correctly, not a regression. **Zero elements carry `.container`.** No nested-Container double-gutter survives.

**Target size under the new Space Grotesk metrics (2.5.8) — PASS**
13. Re-measured from scratch because the type metrics all changed. `pointer: coarse` confirmed active at 390 and 320. Every standalone control clears 24 × 24: nav links 44 px block, `.nav-toggle` 44 × 44, `.theme-toggle` 44 × 44, `.btn--primary` 220.3 × 44, `.link-standalone` 24 px fine / 44 px coarse. The only undersized targets are the three hero proof-noun links (43.4 / 85.4 / 73.2 × **21 px**), which take the **inline exception** legitimately — they are inline anchors inside a `<p>` — and the footer `X` (10.1 px wide), which takes the **spacing exception** with 60.8 px of centre separation against a 24 px requirement. All four confirmed at 1440, 390 and 320.

**The 3D figure across all three DOM states (1.1.1, 2.1.1, 4.1.2) — PASS**
14. **WebGL on, normal motion:** one `<canvas>`, `tabIndex = -1`, host `<div aria-hidden="true">`, canvas never appears in a 24-stop Tab traversal. The poster SVG stays in the DOM at `opacity: 0` and **remains in the accessibility tree** — CDP reports `image | "A lattice of points resolving from scattered noise into an ordered surface."` with the canvas mounted. The name is never lost during the cross-fade.
15. **WebGL off** (`getContext("webgl*")` stubbed to `null`): `canvas` count **0**, poster `opacity: 1`, readout intact. The failure path returns the poster as the permanent visual, exactly as `AttestationLive.tsx` documents.
16. **Reduced motion:** `canvas` count **0**, the OGL/scene chunks are never requested across a full-page scroll, poster `opacity: 1`, `[data-reveal]` node count **0**, zero text-bearing elements below full opacity, zero non-identity transforms, `<html>` carries `js` but **not** `lenis`, `scroll-behavior: auto`. The reduced-motion guarantee **survived the Framer Motion deletion intact** — it now rests on `globals.css §9` plus the JS gates, and both were measured, not assumed.
17. **Announced sequence is coherent, not noise.** Linear reading of the figure is: image *"A lattice of points resolving from scattered noise into an ordered surface."* → *"ES256 · sig 6526…90ab · verified 0.1ms"* (the `✓` is `aria-hidden`, so the glyph is not spoken) → the WebCrypto explanation → the honesty paragraph. It reads as a described image followed by a caption, which is what it is. The `<figure>` element itself has **no accessible name** (`role: figure, name: ""`; Chromium exposes only `aria-labelledby` / `aria-label` / `title` as name sources and does not derive one from `<figcaption>`), which is permitted — the name lives on the image inside — and it means an AT user encounters an unnamed figure between the Queralt and Snorkel entries. Not an SC failure, and I am not filing it; noting it because "is it noise?" was the question and the answer is no.

**Error and edge states (2.4.2, 2.4.6, 3.2.3) — PASS, except N5**
18. Both 404 paths are correct and identical: `/definitely-missing-page` and `/writing/does-not-exist` each return **HTTP 404** with `document.title = "Page not found — Arinze Okigbo"`, `<h1> = "No page at this address."`, `lang="en"`, exactly one `<main>`, and **two information-bearing ways back** — `"Arinze Okigbo — the home page"` and `"Email arinze@splita.co"` — neither of which is "go back" or "home" (R12 satisfied). Header and footer navigation are present on both. axe: 0 violations. The `#__next_error__` trio that cycle 1 saw once and could not reproduce did **not** appear in any scan this cycle, confirming cycle 1's hydration-window diagnosis. `/writing` is the one weak edge state — see N5.

**Also re-confirmed, briefly**
19. **No-JS, all three routes:** titles and `h1`s correct, 4,538 / 156 / 381 characters of body text, **zero** elements holding text below full opacity, `.theme-toggle` computes `display: none` so no inoperable control is exposed, `scrollWidth − clientWidth === 0`.
20. **Space Grotesk genuinely paints in all three engines:** `document.fonts` reports `Space Grotesk: loaded` in Chromium, Firefox and WebKit, and `h1` computes `"Space Grotesk", "Space Grotesk Fallback", …`. Every `ch`- and `rem`-based measure is now resolving against the real face.
21. **axe control, 5 scans, 0 violations:** `/` light 1440, `/` dark 390, `/writing/does-not-exist` light 390, `/writing` dark 1440, and — the state cycle 1 never scanned — `/` at 390 **with the nav sheet open**. The fix report's "0 across 16" claim is directionally confirmed. It is also, as N1 demonstrates, not the same thing as an accessible page.

---

## Verification checklist for the next fix pass

- [ ] `Nav.tsx` → close the sheet on `focusout` outside `<nav>`; re-measure the focused link's ring coverage at **767 × 900** and **480 × 700** and assert `entirelyHidden === false`. *(N1, 2.4.11 AA)*
- [ ] `Nav.tsx:63,100` → return focus to `.nav-toggle` after every close; assert `document.activeElement !== document.body` after Escape from inside the sheet, at 390 and 320. *(N2, 2.4.3 A)*
- [ ] `AttestationPoster.tsx:113` → move `color` out of the inline style, **and** add a forced-colours gate in `AttestationLive.tsx`; assert computed `color === "rgb(0,0,0)"` and `canvas` count `0` under `forcedColors: "active"`. *(N3)*
- [ ] `ThemeScript.tsx:18` → resolve `prefers-color-scheme` outside the `try`; assert `data-theme` is always set and the toggle's name is "Switch to light theme" with `localStorage` throwing and OS dark. *(N4)*
- [ ] `writing/page.tsx` → empty-state branch. *(N5)*
- [ ] `render.tsx:172` → `role="group"`, or record the landmark decision. *(N6)*
- [ ] One VoiceOver + Safari and one NVDA + Firefox pass over the external-link description. *(S1)*
- [ ] Re-run the axe matrix **plus** a focus-state sweep — axe found none of N1–N4.
