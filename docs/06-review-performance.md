# 06 — Performance Review

**Phase:** 5 (review), performance lane
**Date:** 2026-09-11
**Reviewer:** review-performance agent
**Build under test:** branch `claude/wizardly-feynman-octebb`, working tree as of this review
**Verdict:** 2 requirements fail, 6 pass. No CRITICAL defects. 1 HIGH, 4 MEDIUM, 5 LOW.

---

## 0. Scorecard

| Hard requirement (BUILD-PLAN §"Hard requirements") | Target | Measured | Result |
|---|---|---|---|
| Lighthouse Performance, mobile | ≥ 95 | **98** | ✅ |
| Lighthouse Accessibility, mobile | ≥ 95 | **100** | ✅ |
| Lighthouse Best Practices, mobile | ≥ 95 | **96** | ✅ (see D-4 — it is 100 on Vercel) |
| Lighthouse SEO, mobile | ≥ 95 | **100** | ✅ |
| LCP, 4G throttling | < 2.0 s | **2.317 s** simulated / **0.540 s** applied | ⚠️ **FAILS the lab metric** — D-1 |
| CLS, 4G throttling | < 0.05 | **0.000**, zero shift entries | ✅ |
| Initial JS, gzipped | < 200 KB | **145,376 B (142.0 KiB)** | ✅ — but Next under-reports it by 37.5 KB, D-2 |
| 3D + heavy motion dynamically imported | not in initial bundle | **18,764 B gz, confirmed absent** from the initial document | ✅ |
| 60 fps scroll on M1 | no dropped frames | **p99 16.80 ms, 0 dropped / 275 frames** | ✅ |
| No jank on mid-tier Android (4× CPU + slow 4G proxy) | — | **p99 16.80 ms, 0 dropped frames**, 1 long task (67 ms, hydration) | ✅ |

Lighthouse figures are the **median of 3 runs** against the production build (`next build` + `next start`), mobile form factor, default simulated Slow 4G + 4× CPU. Per-run values are in §8.

---

## 1. Method, and why the numbers can be trusted

Three other review agents were running concurrently and repeatedly wiped `.next` mid-measurement. Everything below was therefore measured against an **isolated working copy** of the tree (`rsync` of the repo, `node_modules` symlinked, built and served on a dedicated port 3101). The isolated copy reproduced the orchestrator's build table exactly, so it is the same artifact:

```
Route (app)                    Size   First Load JS
┌ ○ /                        1.8 kB          108 kB     ← orchestrator reported 1.81 kB / 107 kB
```

- **Bundles:** `gzip -9` applied directly to the emitted chunk files, cross-checked against CDP `Network.loadingFinished` encoded byte counts from a real page load. Not read off the build table.
- **Vitals:** `PerformanceObserver` (`largest-contentful-paint`, `layout-shift`, `longtask`) installed via `addInitScript` before any page script, under Playwright with CDP `Network.emulateNetworkConditions` + `Emulation.setCPUThrottlingRate`.
- **3D gate:** `WebGL2RenderingContext.prototype.drawArrays*` patched before navigation to count actual GPU draw calls. Not inferred from source reading.
- **Causal claims:** proven with built-and-measured counterfactual variants (§6), not asserted.
- Per the brief, `claude-in-chrome` was not used. Playwright + `npx lighthouse@12` only.

---

## 2. CONFIRMED PASSES

Stated explicitly, with the number that proves each one.

**P-1 — CLS is exactly zero.** `clsAfterScroll = 0`, **zero** `layout-shift` entries recorded across a full-page scroll under slow-4G + 4× CPU, and `cumulative-layout-shift: 0` in all three Lighthouse runs. There are no shifting elements to name because nothing shifts. The `aspect-ratio: 16 / 9` reservation at `src/components/three/AttestationLive.tsx:44` and the metric-matched font fallback (P-4) are both doing their jobs.

**P-2 — The deferred 3D chunk genuinely adds zero bytes to the initial load.** Verified against the network waterfall, not the build table. The initial document requests 9 scripts; neither 3D chunk is among them. They appear only after `IntersectionObserver` fires:

| chunk | gz | contents | in initial document? |
|---|---:|---|---|
| `85.8b23a904177cceeb.js` | 13,686 B | `ogl` | **no** |
| `228.6554eed49de42841.js` | 5,078 B | GLSL (`gl_Position`), WebCrypto ECDSA, lattice | **no** |
| **total deferred** | **18,764 B** | | |

The orchestrator's claim of 18,698 B is confirmed within 0.4 %. `ogl`, GLSL source, and WebCrypto/ECDSA strings are absent from every one of the 9 initial chunks (fixed-string grep for `gl_Position`, `precision highp`, `attribute vec`, `WebGLRenderer`, `ECDSA`, `P-256`, `subtle.generateKey` → no match). The only 3D-adjacent code in the initial bundle is the capability probe (`WEBGL_lose_context` appears once in `app/page-*.js`, from `src/components/three/runtime/capability.ts:47`), which is correct — the gate must be eager for the gate to work.

**P-3 — Framer Motion is imported correctly.** `grep` over `src/` finds exactly three `framer-motion` imports: `LazyMotion, domAnimation` (`MotionProvider.tsx:3`), `m` (`PageTransition.tsx:3`), and `type Transition, Variants` (`lib/motion/specs.ts:11`). **The full `motion` import appears nowhere.** (It is, however, 29.5 KB of dead weight — see D-3.)

**P-4 — Font loading is correct on all three counts, and costs zero CLS.**
- Exactly **one** preload: `<link rel="preload" href="/_next/static/media/36966cca54120369-s.p.woff2" as="font" crossorigin type="font/woff2">`, 22,620 B.
- `font-display: swap` on all three `@font-face` subsets.
- Metric-matched fallback present: `@font-face { font-family: Space Grotesk Fallback; src: local("Arial"); ascent-override: 89.71%; descent-override: 26.62%; line-gap-override: 0.00%; size-adjust: 109.69% }`, generated by `adjustFontFallback: true` at `src/app/layout.tsx:42`.
- **CLS attributable to font swap: 0.000.** Zero shift entries at any point in the load. Lighthouse `font-display` audit scores 1.

**P-5 — No oversized image is served. No image is served at all.** Lighthouse `resource-summary` reports `image: requestCount 0, transferSize 0`. There is no `next/image` import and no `<img>` tag anywhere in `src/`. `public/profile.jpg` (5,131,528 B) and `public/profile-576.jpg` (46,109 B) are confirmed unreferenced by live code — the only matches are prose in code comments and docs. Explicit dimensions: the canvas carries `width="830" height="466"`; the poster is inline SVG with a `viewBox` inside a fixed `aspect-ratio` box. Both are dimensioned before paint, which is why P-1 holds. (The 5 MB file is still a deploy-artifact problem — D-5.)

**P-6 — The 3D gate does everything the three-d agent claimed.** Measured by counting real `drawArrays*` calls:

| condition | measured |
|---|---|
| before approach (page loaded, figure off-screen) | **0 draws, no `<canvas>` in DOM, 0 of the 2 chunks requested**; LCP had already fired at 60 ms |
| figure scrolled into view | chunks `228` then `85` requested, canvas mounts, **60 draws/sec** |
| scrolled back to top (off-screen) | **0 draws in 1.2 s** |
| back on-screen | 48 draws in 0.8 s (60 fps) |
| `document.hidden = true` + `visibilitychange` | **0 draws in 1.2 s** |

Loads only after LCP ✅, only on approach via `IntersectionObserver` ✅ (`AttestationLive.tsx:108-117`, `rootMargin: 200px`), pauses off-screen ✅ and on tab-hide ✅ (`runtime/scene.ts:152-169`).

**P-7 — `prefers-reduced-motion` downloads ZERO bytes of 3D.** With `reducedMotion: "reduce"`, the initial script set is byte-identical to the default run (149,358 B over the wire, 9 scripts) and **neither `85.*.js` nor `228.*.js` is ever requested**, through a full-page scroll. Gate 1 at `AttestationLive.tsx:71` is checked before anything else, exactly as docs/02 §8.2 specifies. This is a clean pass.

**P-8 — Animations touch only compositor-safe properties.** Every `transition` declaration in the emitted stylesheet was enumerated. **No transition or animation names a layout-triggering property** (`width`, `height`, `top`, `left`, `margin`, `padding`, `font-size`, or `all`) — grep returns nothing. The single `@keyframes` block is `reveal { opacity, transform }`. Three hover transitions additionally animate `color` / `background-color` / `border-color`, which are paint-only, not layout — see D-9.

**P-9 — Static asset caching is correct.**

| resource | `Cache-Control` |
|---|---|
| `/_next/static/chunks/*.js` | `public, max-age=31536000, immutable` ✅ |
| `/_next/static/css/*.css` | `public, max-age=31536000, immutable` ✅ |
| `/_next/static/media/*.woff2` | `public, max-age=31536000, immutable` ✅ |
| `/opengraph-image` | `public, immutable, no-transform, max-age=31536000` ✅ |
| `/twitter-image` | `public, immutable, no-transform, max-age=31536000` ✅ |
| `/` (document) | `s-maxage=31536000`, `x-nextjs-cache: HIT`, `x-nextjs-prerender: 1` ✅ |

Lighthouse `uses-long-cache-ttl` scores 1 with "0 resources found". The generated OG image is a valid **PNG, 1200×630, 26,927 B**, produced in 70 ms. All correct.

**P-10 — Scroll is 60 fps with no jank, on both profiles.** Full-page programmatic scroll (5,160 px, 90 steps), frame deltas sampled via `requestAnimationFrame`:

| profile | frames | p50 | p95 | p99 | max | dropped (>25 ms) | >50 ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| M1, unthrottled | 275 | 16.70 ms | 16.80 ms | 16.80 ms | 16.80 ms | **0** | **0** |
| 4× CPU + slow 4G (mid-tier Android proxy) | 269 | 16.70 ms | 16.80 ms | 16.80 ms | 16.80 ms | **0** | **0** |

Zero long tasks during scroll on either profile. No layout thrash: zero `layout-shift` entries and no layout-triggering animated properties (P-8). Total Blocking Time is 13 ms (median), well inside the 200 ms "good" threshold.

---

## 3. CONFIRMED DEFECTS

### D-1 — LCP is 2.317 s under Lighthouse mobile, against a 2.0 s requirement
**Severity: HIGH**
**Lives in:** `src/app/layout.tsx:106` (`<MotionProvider>`), `src/app/layout.tsx:122-123` (`<Analytics /> <SpeedInsights />`), and the render-blocking stylesheet emitted for `src/app/globals.css`.

**Measured:**

| | median of 3 |
|---|---:|
| Lighthouse mobile LCP (simulated Slow 4G + 4× CPU) | **2,317 ms** ❌ |
| Playwright, *applied* Slow 4G + 4× CPU throttling | **540 ms** ✅ |
| Lighthouse `observedLargestContentfulPaint` (unthrottled) | **81 ms** |

**LCP element:** `main#main > div > section.container > p.mt-[var(--rhythm-paragraph)]` — the credentials sentence ("Co-founder and CEO of Splita…"), rendered by `src/components/sections/primitives/CredentialsLine.tsx` inside the hero. It is **text, not an image**.

**Phase breakdown (which phase is responsible):**

| phase | timing | % of LCP |
|---|---:|---:|
| TTFB | 454 ms | 20 % |
| Load Delay | **0 ms** | 0 % |
| Load Time | **0 ms** | 0 % |
| **Render Delay** | **1,858 ms** | **80 %** |

Load Delay and Load Time are zero because the LCP element is text with no resource to fetch. **Render Delay is 80 % of the metric and is the entire problem.**

**Root cause, proven by counterfactual (§6):** the LCP element is *not* being held back by CSS or hydration — it paints at 81 ms unthrottled, and `Reveal` already pins `opacity: 1` inline on the hero (`src/components/motion/Reveal.tsx:103-104`), which is why it is an LCP candidate at first paint at all. That guard works. The Render Delay is Lighthouse's **Lantern** simulator placing every initial script in the LCP element's dependency graph and charging the full 150,390 B of script transfer against it. Render Delay therefore scales almost linearly with initial JS: removing 29,393 B of script moved LCP to 2,158 ms; removing 38,051 B moved it to 2,006 ms.

**Requirement violated:** BUILD-PLAN, "LCP under 2.0 s, CLS under 0.05, 4G throttling."

**Honest framing for the fix agent — read this before acting.** Real-world LCP is excellent (540 ms under applied 4G throttling, 81 ms unthrottled), and field CWV would pass comfortably. Only the *simulated* lab metric fails. But the requirement as written is a lab metric and it does not pass, so this is filed as a defect rather than waved through.

**Recommended fix, in order of measured value per unit of risk:**
1. **Remove `<MotionProvider>` from `src/app/layout.tsx:106`** — see D-3. Measured: −29,393 B script, LCP 2,317 → **2,158 ms**, Performance 98 → 99. Zero visual change, because it currently animates nothing.
2. **Inline the critical CSS or drop the render-blocking stylesheet from the critical path.** Lighthouse `render-blocking-insight` measures the 8,196 B stylesheet at **154 ms** of blocking with "Est savings of 140 ms".
3. Together these project to ~1.87–1.95 s, i.e. just inside the target. Achieving comfortable margin additionally needs item 4.
4. **Tighten the browserslist target.** Lighthouse `legacy-javascript` measures **11,724 B** of unnecessary transpilation in chunk `337-*.js`.

Do **not** attempt to fix this by deferring the LCP text or by gaming the LCP candidate — the current markup is correct and the Reveal opacity guard should be left alone.

---

### D-2 — Next under-reports First Load JS for `/` by 37,501 B; the CI budget guardrail would measure the wrong number
**Severity: MEDIUM**
**Lives in:** reporting/accounting, not a source line. The chunks concerned are emitted for `src/app/layout.tsx:106` and `:107`.

**Measured.** Next's build table says `/` ships **108 kB** First Load JS. The actual initial document requests **9** scripts, gzip -9:

| chunk | gz | in Next's First Load JS figure? |
|---|---:|---|
| `webpack-902dc0549c9c6612.js` | 1,786 | yes |
| `526d7668-c3924e639bde1cdf.js` | 53,291 | yes |
| `337-231e9f4634e36905.js` | 46,081 | yes |
| `main-app-5ac5d5a357f1fe82.js` | 241 | yes |
| `67-1ce13865f339db8e.js` | 3,033 | yes |
| `218-a8c37b758b04ad2b.js` | 1,802 | yes |
| `app/page-17106939a3f9aebb.js` | 1,823 | yes |
| **`883-c1f224d1e4bc937e.js`** (framer-motion + lenis) | **35,225** | **NO** |
| **`app/layout-7a37e72381628238.js`** | **2,094** | **NO** |
| **actual total** | **145,376 B (142.0 KiB)** | |
| Next's reported figure | 107,875 B | |
| **undercount** | **37,501 B** | |

Cross-check: CDP wire transfer for the same 9 scripts is 149,358 B; Lighthouse `resource-summary` reports `script: 150,390 B` across 11 requests (the two extra are the Vercel analytics stubs, D-4).

**The budget itself passes** — 142.0 KiB is comfortably under 200 KB, and the `/` route also passes docs/02 §7's stricter 180 KB CI gate. The defect is that the *number the gate would read* is wrong by 37.5 KB, so a future regression of up to 37 KB inside a layout-level client chunk would be invisible to it. My counterfactual demonstrates the blindness directly: removing 38,051 B of real script changed Next's reported figure from 108 kB to **107 kB**.

**Requirement violated:** docs/02 §7, "Fail CI if First Load JS for `/` exceeds 180 KB" — unenforceable as specified.

**Recommended fix:** make the guardrail measure the served document, not the build table. Sum the `<script src>` entries in the rendered HTML for `/` and gzip them, or add `@next/bundle-analyzer` behind `ANALYZE=true` as docs/02 §7 already requires (it is not currently installed — `package.json` has no `@next/bundle-analyzer`).

**Per-route breakdown** (Next's accounting; add `883` + `app/layout` = 37,319 B for the real figure, since both are layout-level and load on every route):

| route | Next-reported gz | real initial JS gz |
|---|---:|---:|
| `/` | 107,875 | **145,376** |
| `/writing` | 104,475 | 141,976 |
| `/writing/[slug]` | 104,475 | 141,976 |
| `/_not-found` | 101,443 | 138,944 |

---

### D-3 — Framer Motion ships on every page load and animates nothing: 29,525 B of dead weight, 71.8 % of its chunk unused
**Severity: MEDIUM** (would be HIGH if the budget were tight; it is the single largest available win)
**Lives in:** `src/app/layout.tsx:106` — `<MotionProvider>`; defined at `src/components/motion/MotionProvider.tsx:28`.

**Measured.**
- Lighthouse `unused-javascript`: **25,367 B of 35,330 B unused in `883-c1f224d1e4bc937e.js` — 71.8 %.**
- Counterfactual build removing only `<MotionProvider>`: initial JS **145,376 → 115,851 B gz, a measured saving of 29,525 B** (which matches docs/02 §7's 29.2 KB figure for `LazyMotion` + `domAnimation` almost exactly). LCP 2,317 → 2,158 ms. Performance 98 → 99.

**Why it is dead.** `LazyMotion features={domAnimation}` is mounted at the root, but nothing under it renders a motion component:
- The only consumer of `m` is `src/components/motion/PageTransition.tsx`, which is **deliberately not mounted** — its own docblock at `PageTransition.tsx:14` says "STATUS: deliberately NOT mounted. This is a closed decision." `grep` confirms it is imported nowhere but the barrel.
- `src/components/motion/Reveal.tsx:109` uses plain `createElement` plus a CSS transition. No Framer Motion.
- `grep -rn "useScroll\|useTransform\|useMotionValue\|useSpring" src/` → **no matches.** The `useScroll` choreography that docs/02 §4 justified the whole dependency on was never built.

So the site pays 29.5 KB on every load for a feature boundary around zero animated components. The `PageTransition.tsx:22` claim that "nothing imports it, it is tree-shaken out entirely and costs zero bytes" is true of `PageTransition` itself but does not apply to `MotionProvider`, which *is* imported and *is* mounted.

**Requirement violated:** BUILD-PLAN, "Reject anything decorative that costs weight"; docs/02 §7 bundle budget discipline.

**Recommended fix:** delete `<MotionProvider>` from `src/app/layout.tsx:106` and the import at `:7`. Keep the files — `MotionProvider` and `PageTransition` should be remounted together when `/writing` goes live and route transitions are actually wanted. Also consider dropping `framer-motion` and `motion-dom` from `package.json` dependencies at that point, not before.

---

### D-4 — Best Practices is 96, not 100, because of two 404s from the Vercel analytics scripts
**Severity: LOW** (measurement artifact — will self-resolve on deploy; listed because it is the only thing between the build and 100/100/100/100)
**Lives in:** `src/app/layout.tsx:122-123`.

**Measured.** Lighthouse `errors-in-console` scores **0.00** (weight 1), costing exactly the 4 points:

```
Failed to load resource: 404 — http://localhost:3101/_vercel/insights/script.js
Failed to load resource: 404 — http://localhost:3101/_vercel/speed-insights/script.js
```

These paths are served by Vercel's edge, not by `next start`, so they 404 on any non-Vercel host and resolve to 200 on a real deploy. My counterfactual with `<Analytics />` and `<SpeedInsights />` removed scored Best Practices **100/100/100**, confirming these two requests are the sole cause.

**Requirement violated:** none, on Vercel. The 95+ bar is met either way (96 ≥ 95).

**Recommended fix:** none to the code. **Re-run Lighthouse against the Vercel preview URL after deploy to confirm Best Practices is 100.** Do not remove the analytics components to chase a local score — mounting them was a Phase-4 deliverable (BUILD-PLAN, backend agent) and `src/lib/analytics/events.ts:103` depends on them.

---

### D-5 — `public/profile.jpg` is 5,131,528 B, unreferenced, still deployed, and served with `max-age=0`
**Severity: MEDIUM**
**Lives in:** `public/profile.jpg` (5,131,528 B), `public/profile-576.jpg` (46,109 B), `public/og-image.svg` (1,449 B).

**Measured.** Confirmed unreferenced by live code — the only matches in `src/` are prose inside comments (`src/app/layout.tsx:57`, `src/content/metadata.ts:10-11`, `src/lib/seo/render-og-image.tsx:5-6`) describing why they are *no longer* used. Zero image requests on the page (P-5). But the file is still shipped and still reachable:

```
$ curl -sI http://localhost:3101/profile.jpg
HTTP/1.1 200 OK
Cache-Control: public, max-age=0
Content-Length: 5131528
```

So: 5.0 MB of dead payload in every deployment, publicly addressable, and — because `next.config.ts` declares no `headers()` — served with `max-age=0`, meaning any accidental future reference would be revalidated on every single request.

This does **not** currently affect LCP or any measured metric. It is a deploy-artifact and hygiene defect, and it is the exact file BUILD-PLAN §"Defects found" line 33 opened with.

**Requirement violated:** BUILD-PLAN §"Defects found in the current site", item 1 — not closed.

**Recommended fix:** delete `public/profile.jpg`, `public/profile-576.jpg` and `public/og-image.svg`. All three are recoverable from git history and all three are superseded by the generated `/opengraph-image` (P-9). Separately, add a `headers()` entry in `next.config.ts` giving `public/` assets a real `max-age` so this class of problem cannot recur.

---

### D-6 — Render-blocking stylesheet costs a measured 154 ms
**Severity: MEDIUM**
**Lives in:** the single stylesheet emitted from `src/app/globals.css` (8,196 B transferred, 34,377 B raw).

**Measured.** Lighthouse `render-blocking-insight` scores **0.00**: `/_next/static/css/8ee43f50989d5ce5.css`, 8,196 B, **wastedMs 154**, "Est savings of 140 ms". It is the only entry. The network dependency chain is `document → stylesheet`, longest chain 18 ms unthrottled.

This is roughly half the gap between the measured 2.317 s LCP and the 2.0 s requirement, so it matters directly to D-1.

**Requirement violated:** contributes to the D-1 LCP failure.

**Recommended fix:** inline the above-the-fold subset of `globals.css` into `<head>` and load the remainder asynchronously. The file is 34 KB raw and covers the whole site; the hero needs a small fraction of it. This is the highest-value change after D-3 and it is independent of it.

---

### D-7 — 11,724 B of unnecessary legacy transpilation in the shared chunk
**Severity: LOW**
**Lives in:** build configuration — `next.config.ts` (currently empty apart from the type annotation) and the absent browserslist key in `package.json`.

**Measured.** Lighthouse `legacy-javascript` scores 0.50: **11,724 B** of wasted bytes in `337-231e9f4634e36905.js` (46,081 B gz). `legacy-javascript-insight` puts it at "Est savings of 12 KiB".

**Requirement violated:** none outright; contributes to D-1.

**Recommended fix:** add a modern `browserslist` to `package.json`. Low risk, but measure before and after — this chunk is React/Next framework code and the saving may not fully materialise.

---

### D-8 — `favicon.ico` is 15,406 B and fetched on every page load
**Severity: LOW**
**Lives in:** `src/app/favicon.ico` (15,406 B on disk, 15,760 B transferred).

**Measured.** Appears in the Lighthouse waterfall as a 15,760 B `Other` request. It is the 5th-largest resource on the page — larger than the CSS (8,196 B) and larger than five of the nine JS chunks.

**Requirement violated:** none. Noted because it is pure overhead on a page whose entire non-JS payload is 47.5 KB.

**Recommended fix:** regenerate as a 16×16 + 32×32 two-frame `.ico` (typically < 2 KB), or ship an SVG icon with an `.ico` fallback. Roughly 14 KB for a few minutes of work.

---

### D-9 — Three hover transitions animate paint properties rather than `transform`/`opacity` only
**Severity: LOW**
**Lives in:** `src/app/globals.css` — the rules emitting these declarations (around lines 534–564 and the button/link rules).

**Measured.** Enumerating every `transition` in the emitted stylesheet, three animate non-compositor properties:

```
transition: background-color var(--duration-base) var(--ease-standard), color …
transition: background-color var(--duration-fast) …, border-color …, color …, transform …
transition: color var(--duration-fast) var(--ease-standard)
```

**Requirement violated:** the review brief's "animations touch only `transform` and `opacity`", read literally. In practice these are **paint-only** (no layout, no reflow), they fire on discrete hover/focus rather than during scroll, and they produced **zero** dropped frames in either scroll profile (P-10). docs/04 §5.2 restricts *scroll* animation to transform and opacity, which is satisfied.

**Recommended fix:** none required. Recording it so the fix agent does not "discover" it later and treat it as unreviewed. If a mid-tier Android device later shows hover jank, the fix is to cross-fade a pseudo-element's opacity instead.

---

### D-10 — Two unused production dependencies
**Severity: LOW**
**Lives in:** `package.json` — `"lucide-react": "^0.511.0"`, `"motion-dom": "^12.5.0"`.

**Measured.** `grep -rn "lucide-react" src/` → no matches. `grep -rn "motion-dom" src/` → no matches. Neither appears in any emitted chunk, so the **shipped-bytes cost is zero** — tree-shaking is working. The cost is install weight, audit surface, and the risk that a future agent imports `lucide-react` barrel-style and silently adds weight (docs/02 §7 budgeted 1.5 KB for it; it is currently 0).

**Requirement violated:** none. Hygiene.

**Recommended fix:** remove both from `dependencies`. `motion-dom` is a transitive dependency of `framer-motion` and should not be declared directly; if D-3 is actioned, `framer-motion` goes too.

---

## 4. SUSPECTED — could not measure, flagged for whoever can

**S-1 — Real mid-tier Android behaviour.** Everything above used 4× CPU throttling on an M1 as the mid-tier Android proxy. That models CPU but **not** the GPU, the thermal envelope, or memory pressure — and the 3D scene is the part most sensitive to all three. The `DPR_MAX = 1.5` cap (`src/components/three/constants.ts:22`) and the `hardwareConcurrency`-based grid downgrade (`constants.ts:56-60`) are the right mitigations and are present in the source, but **I could not verify them on real silicon.** The cross-browser review agent owns real-device testing; this should be on its list.

**S-2 — Vercel edge headers.** All header assertions in P-9 were measured against `next start`, which matches Vercel's behaviour for `/_next/static/**` and for file-convention OG routes, but is not a substitute for the real deploy. `/opengraph-image` is a `ƒ` (dynamic, edge runtime) route, so the first request per edge region pays the ~70 ms generation cost before the year-long cache applies. **Re-verify against the preview deployment**, together with D-4.

**S-3 — LCP on a cold Vercel edge.** My TTFB was 2.6 ms (local). Lighthouse's simulated 454 ms TTFB is a model, not a measurement of the real origin. Since TTFB is 20 % of the D-1 LCP figure, the real-world number could move in either direction. Measure against the preview URL.

---

## 5. `npm audit` — security counts, and the performance verdict on `next@15.5.25`

### The counts are worse than the brief stated

| scope | total | critical | high | moderate |
|---|---:|---:|---:|---:|
| `npm audit --omit=dev` (production) | **6** | 1 | 5 | 0 |
| `npm audit` (full tree) | **16** | 2 | 12 | 2 |

The brief's "6 vulnerabilities (5 high, 1 critical)" is the production-only figure — confirmed exactly. The full tree is 16.

**Correction to the brief's framing, and it matters.** The brief describes the critical as being "in PostCSS and sharp, transitive through Next". That undersells it. `next@15.2.8`'s own advisory list is 30 entries and includes, among others: *Unauthenticated Remote Code Execution on Windows-hosted servers*, *Unauthenticated RCE in the Image Optimization API when AVIF files are used*, *SSRF in rewrites via attacker-controlled destination hostname*, *cache poisoning in React Server Component responses*, and *XSS in App Router applications using CSP nonces*. PostCSS and sharp are two entries in that list, not the substance of it. The security reviewer should see this; it is outside my lane to grade, but it changes the urgency of the upgrade.

### Performance verdict: the upgrade is safe. Measured, not estimated.

I installed `next@15.5.25` into a separate isolated tree and ran a full production build.

| | 15.2.8 | 15.5.25 | delta |
|---|---:|---:|---:|
| Build result | clean | **clean** | — |
| Next-reported First Load JS, `/` | 108 kB | 110 kB | +2 kB |
| **Actual initial JS, gzip -9** | **145,376 B** | **145,809 B** | **+433 B (+0.3 %)** |
| Deferred 3D chunks, gzip -9 | 18,764 B | **18,670 B** | **−94 B** |
| Route table shape | 10 routes | identical | — |
| Static/dynamic classification | unchanged | unchanged | — |
| 3D code splitting | 2 lazy chunks | **2 lazy chunks** | preserved |

**Conclusion: `next@15.5.25` is performance-neutral.** Initial JS grows by 433 bytes — 0.3 %, and 0.2 % of the 200 KB budget. The deferred 3D chunk gets 94 bytes *smaller*. Code splitting, the dynamic-import boundary, and the static/dynamic route classification all survive intact. There is **no performance reason to delay this upgrade**, and it does not interact with any defect in this report.

One caveat for the fix agent: this was a bundle-and-build-output comparison. I did not re-run the full Lighthouse suite against 15.5.25. Given a +433 B delta that is unlikely to move any score, but **re-run the three-run Lighthouse median after upgrading** to close the loop.

---

## 6. Counterfactuals — the evidence behind the causal claims in D-1 and D-3

Each variant was built and served from the isolated copy and measured with the same three-run Lighthouse median. The repository was never modified.

| variant | script transfer | initial JS gz | LCP (median) | Render Delay | Perf | BP |
|---|---:|---:|---:|---:|---:|---:|
| **baseline** (as shipped) | 150,390 B | 145,376 B | **2,317 ms** | 1,858 ms | 98 | 96 |
| **B** — `<MotionProvider>` removed only | 120,997 B | 115,851 B | **2,158 ms** | 1,625 ms | 99 | 96 |
| **A** — MotionProvider + Lenis + Analytics removed | 112,339 B | ~107,300 B | **2,006 ms** | 1,484 ms | 99 | **100** |

Three things follow, and all three are measurements rather than opinions:

1. **LCP Render Delay tracks initial script transfer**, at roughly **8 ms of LCP per KB of initial JS** across this range. This is what makes D-1's diagnosis specific rather than a guess.
2. **The Analytics 404s alone account for the entire Best Practices gap** (96 → 100 between B and A, the only difference being those two components). This is what makes D-4 a confirmed artifact rather than a real defect.
3. **Even variant A lands at 2,006 ms** — still fractionally over 2.0 s. Bundle trimming alone does not clear the bar; D-6 (render-blocking CSS, 154 ms measured) is required as well. Any fix plan that addresses only the JavaScript will miss the target.

---

## 7. Recommended fix order

Ordered by measured value per unit of risk. Items 1–3 together are projected to clear the D-1 LCP requirement.

| # | Action | Defect | Measured value | Risk |
|---|---|---|---|---|
| 1 | Remove `<MotionProvider>` from `layout.tsx:106` | D-3, D-1 | −29,525 B; LCP −159 ms; Perf +1 | **none** — animates nothing today |
| 2 | Inline critical CSS | D-6, D-1 | −154 ms blocking (LH est. 140 ms) | low |
| 3 | Upgrade to `next@15.5.25` | §5 | +433 B; closes 1 critical + 5 high | low — measured neutral |
| 4 | Delete `public/profile.jpg`, `profile-576.jpg`, `og-image.svg` | D-5 | −5.18 MB deploy payload | **none** — unreferenced |
| 5 | Fix the CI budget to measure the served document | D-2 | closes a 37.5 KB blind spot | none |
| 6 | Modern browserslist | D-7 | ≈ −11.7 KB | low — verify after |
| 7 | Shrink `favicon.ico` | D-8 | ≈ −14 KB | none |
| 8 | Drop `lucide-react`, `motion-dom` | D-10 | 0 shipped bytes; hygiene | none |
| 9 | Re-run Lighthouse against the Vercel preview | D-4, S-2, S-3 | confirms BP 100 and real TTFB | none |

---

## 8. Appendix — raw measurements

**Lighthouse, mobile, production build, 3 runs**

| category | run 1 | run 2 | run 3 | **median** |
|---|---:|---:|---:|---:|
| Performance | 98 | 98 | 98 | **98** |
| Accessibility | 100 | 100 | 100 | **100** |
| Best Practices | 96 | 96 | 96 | **96** |
| SEO | 100 | 100 | 100 | **100** |

| metric | run 1 | run 2 | run 3 | **median** |
|---|---:|---:|---:|---:|
| FCP | 908.1 | 907.2 | 905.2 | **907.2 ms** |
| LCP | 2,312.1 | 2,320.2 | 2,317.2 | **2,317.2 ms** |
| TBT | 21 | 13 | 12 | **13 ms** |
| CLS | 0 | 0 | 0 | **0** |
| Speed Index | 908.1 | 907.2 | 905.2 | **907.2 ms** |
| TTI | 2,371.8 | 2,320.2 | 2,317.2 | **2,320.2 ms** |
| Server response | 5.4 | 2.2 | 2.6 | **2.6 ms** |

Observed (unthrottled, run 1): `observedFirstContentfulPaint` 81 ms, `observedLargestContentfulPaint` 81 ms, `observedDomContentLoaded` 21 ms, `observedLoad` 59 ms.

**Every audit scoring below 1.00 (all four categories)**

| category | audit | score | weight | detail |
|---|---|---:|---:|---|
| perf | `largest-contentful-paint` | 0.93 | 25 | 2.3 s |
| perf | `unused-javascript` | 0.00 | 0 | 25,367 B in chunk 883 |
| perf | `render-blocking-insight` | 0.00 | 0 | 154 ms, the stylesheet |
| perf | `network-dependency-tree-insight` | 0.00 | 0 | longest chain 18 ms |
| perf | `legacy-javascript` | 0.50 | 0 | 11,724 B in chunk 337 |
| perf | `legacy-javascript-insight` | 0.50 | 0 | Est. 12 KiB |
| perf | `render-blocking-resources` | 0.50 | 0 | Est. 0 ms |
| perf | `interactive` | 0.99 | 0 | 2.4 s |
| perf | `max-potential-fid` | 0.98 | 0 | 80 ms |
| best | `errors-in-console` | 0.00 | 1 | 2 × Vercel 404 (D-4) |

Every other audit in all four categories scores 1.00. Notably passing: `font-display` 1.00, `uses-long-cache-ttl` 1.00 ("0 resources found"), `uses-text-compression` 1.00, `unminified-javascript` 1.00, `cumulative-layout-shift` 1.00.

**Full page payload (Lighthouse `resource-summary`)**

| type | requests | transfer |
|---|---:|---:|
| script | 11 | 150,390 B |
| font | 1 | 22,620 B |
| document | 1 | 16,702 B |
| stylesheet | 1 | 8,196 B |
| image | **0** | **0 B** |
| third-party | 0 | 0 B |
| **total** | **14** | **197,908 B (193 KiB)** |

Served HTML: 75,619 B raw, 16,126 B gzipped. Stylesheet: 34,377 B raw, 7,796 B gzipped.

**Playwright, applied throttling** (Pixel 7 emulation, 1.6 Mbps / 750 Kbps / 150 ms RTT / 4× CPU): TTFB 5.1 ms, FCP 540.0 ms, **LCP 540.0 ms**, DOMContentLoaded 425.7 ms, load 1,395.6 ms, **CLS 0.000 (0 shift entries)**, 1 long task of 67 ms at t=1,322 ms (hydration, before any scroll).

**Reduced-motion run** (same profile, `prefers-reduced-motion: reduce`): LCP 564.0 ms, CLS 0.000, 9 scripts totalling 149,358 B over the wire — byte-identical to the default run — and **zero requests for `85.*.js` or `228.*.js`** across a full-page scroll.

---

*All figures in this document were produced by running the build, not by reading it. Lighthouse figures are medians of three runs. Bundle figures are `gzip -9` on emitted files, cross-checked against CDP encoded transfer sizes. The repository was not modified; counterfactual variants were built in an isolated copy under the session scratchpad.*
