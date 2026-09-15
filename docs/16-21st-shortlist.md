# 16 — 21st.dev Component Shortlist

**Date:** 2026-09-11. **Branch surveyed:** `redesign/field-ceremony`.
**Scope:** research only. Nothing was installed, no source file was modified, no dependency was added.
**Inputs:** `docs/04-design-system.md` (binding), `docs/10-ui-component-research.md`, `src/app/globals.css`, `package.json`, `scripts/check-bundle-budget.mjs`.

**Method.** Every component below was judged on its **source**, not its manifest. For each one I fetched the registry JSON, read `dependencies`, `registryDependencies`, `cssVars`, `css`, and the literal `files[].content`, and extracted the real `import … from` list from the TSX. Where manifest and source disagree, both are reported and the discrepancy is called out. Byte counts are the raw unminified TSX in the registry `content` field, measured, not estimated.

---

## 0. The finding that changes the install plan

**21st.dev's registry is now behind authentication, and its component source is not publicly readable.**

Every registry URL shape returns HTTP **403**:

```
GET https://21st.dev/r/magicui/shine-border          → 403 {"error":"Authentication required","reason":"authentication_required", …}
GET https://21st.dev/r/dillionverma/shine-border     → 403  (same)
GET https://21st.dev/api/r/magicui/dot-pattern       → 403  (same)
GET https://21st.dev/r/magicui/dot-pattern.json      → 403  (same)
```

Tested against 14 components across 6 authors — no exceptions. The 403 body still returns **public metadata** (`name`, `title`, `description`, `author`, canonical path), which is enough to verify that a URL is real and to recover the author handle, but not a single line of code.

The code itself is in a private bucket. A component page's embedded payload contains:

```
"code":"r2://components-code-private/originui/button/code.1788802214446-fe4ca077-f024-4c54-9a7a-c66eb83a1f0f.tsx"
```

**Consequence:** `npx shadcn@latest add "https://21st.dev/r/…"` cannot succeed from an unauthenticated machine, `components.json` or no `components.json`. This is not a repo problem; it is a 21st.dev product change. See §3 for the safe path.

**Second finding:** 21st.dev's index **lags** the libraries it mirrors. I pulled its full sitemap — **10,534 URLs, 7,507 of them component pages** — and checked each shortlist candidate against it. Four of the best components below (`noise-texture`, `backlight`, `glare-hover`, `striped-pattern`) are live in Magic UI's own registry and **absent from 21st.dev entirely**. 21st.dev is a good *discovery* surface and a bad *acquisition* surface.

Throughout this document each entry gives **both** URLs: the 21st.dev one where it exists (marked ✅ verified present in the sitemap, 403-gated), and the upstream registry URL, which is public, unauthenticated, and the actual source 21st mirrors.

---

## 1. Ranked shortlist

### 1 — Shine Border · `dillionverma` (Magic UI)

| | |
|---|---|
| **21st.dev** | `npx shadcn@latest add "https://21st.dev/r/dillionverma/shine-border"` ✅ present, 403-gated |
| **Upstream (use this)** | `npx shadcn@latest add "https://magicui.design/r/shine-border.json"` — public |
| **Manifest** | `dependencies`: *absent*. `registryDependencies`: *absent*. Ships `cssVars.theme.animate-shine` + `css["@keyframes shine"]`. |
| **Source** | 1,649 B TSX. Imports: `react`, `@/lib/utils`. **Nothing else.** |
| **Runtime** | **None.** No state, no effect, no listener, no ref. One `<div>` with an inline `style` object. |

**What it does.** Paints a radial gradient into a **1px ring** by masking the element's own box: `mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)` with `maskComposite: exclude` and `padding: var(--border-width)`. That is precisely the mechanic `docs/04` §3.7 describes for the light-source border system, written as a portable component with `borderWidth`, `duration` and `shineColor` as props.

**Adaptation.** `shineColor` defaults to `#000000` — pass `var(--accent)` or a `color-mix()` of it. `duration` defaults to 14s — bind to a token. The registry's `cssVars`/`css` blocks are what the shadcn CLI would merge into your CSS; since you will not run the CLI, hand-copy `@keyframes shine` into `globals.css` and add `--animate-shine` to the existing `@theme` block. No `tailwind.config.js` is referenced anywhere in the source — it is v4-clean.

**Accessibility.** It already carries **`motion-safe:animate-shine`** — the only component in this entire survey that handles `prefers-reduced-motion` correctly out of the box. `pointer-events-none`, purely decorative; add `aria-hidden="true"` on adoption. No contrast impact (it is a border, not a fill).

**Serves.** Selected Work panels, the Ceremony panel, the Attestation frame. **Hard rule on adoption:** it must stay a ring. Widening `borderWidth` until the radial reads as a panel fill is exactly the A8 violation the design system forbids.

---

### 2 — Glow Card Grid · `ncdai` (Chánh Đại)

| | |
|---|---|
| **21st.dev** | `npx shadcn@latest add "https://21st.dev/r/ncdai/glow-card-grid"` ✅ present, 403-gated |
| **Upstream (use this)** | `npx shadcn@latest add "https://chanhdai.com/r/glow-card-grid.json"` — public |
| **Manifest** | `dependencies`: *absent*. `registryDependencies`: *absent*. No `css`, no `cssVars`. |
| **Source** | 4,962 B TSX. Imports: `react`, `@/lib/utils`. |
| **Runtime** | One document-level `pointermove` listener that writes `--pointer-x` / `--pointer-y` onto each `[data-slot='glow-card']`. **No `setState`, so no React re-render; no rAF loop.** ~30 lines of JS. |

**What it does — and why it is the most on-brief thing I found.** The border is not a colour. It is a `backdrop-filter` stack (`blur` / `brightness` / `contrast` / `saturate`) confined to the border box by `mask-composite: exclude` with `mask-origin: border-box, padding-box`. **The ring therefore derives its colour from whatever is rendered behind the panel.** With the attestation field behind the document, a panel adopting this is literally lit by the field rather than painted to match it. That is the site's core visual claim, implemented rather than simulated.

**Adaptation.** Discard the exported `GlowCard` entirely — it is an avatar/name/handle profile card and none of that is wanted. Take `GlowCardGrid` (the wrapper + the pointer listener) and the final ring `<div>`. The source is already **Tailwind 4-native**: `border-(length:--card-border-width)`, `rounded-(--card-radius)`, `backdrop-blur-(--card-border-blur)`, `@container-size`. No `tailwind.config.js` assumption anywhere. All eleven tuning knobs are already CSS custom properties set from props, so re-tokenising is a one-line map (`cardRadius` → `--radius-lg`, etc.) rather than a rewrite.

**Accessibility.** Two gaps, both fixable:
- **Pointer-only.** There is no keyboard path — a panel focused via Tab shows nothing. Add a `:focus-within` rule that pins `--pointer-x/--pointer-y` to a fixed value so the ring lights on focus.
- **No reduced-motion guard.** Nothing animates without pointer input, so SC 2.3.3 is not violated as such, but add `@media (prefers-reduced-motion: reduce)` pinning the pointer vars anyway, so the ring becomes static rather than tracking.
- The listener should be registered `{ passive: true }`; it is not, in the shipped source.

**Perf caution.** `backdrop-filter` on N panels, each compositing over a live WebGL canvas. This is the one item that must be measured on a real mobile device before it is kept. It is ranked 2 on merit and would drop off the list entirely if it costs more than ~2 Lighthouse points.

**Serves.** Selected Work (Splita / Queralt / Snorkel), the Ceremony panel, Projects.

---

### 3 — Noise Texture · `dillionverma` (Magic UI)

| | |
|---|---|
| **21st.dev** | ❌ **not indexed** — no `/components/noise-texture` URL in 21st's 10,534-entry sitemap. |
| **Upstream (only path)** | `npx shadcn@latest add "https://magicui.design/r/noise-texture.json"` — public |
| **Manifest** | `dependencies`: *absent*. `registryDependencies`: *absent*. |
| **Source** | 1,785 B TSX. Imports: `react` (`useId` only), `@/lib/utils`. |
| **Runtime** | **Effectively none.** `<svg><filter><feTurbulence type="fractalNoise"> → <feColorMatrix saturate 0> → <feComponentTransfer>` then a `<rect>` filled with it. No effect, no state, no listener. |

**What it does.** SVG-filter film grain with four exposed knobs (`frequency`, `octaves`, `slope`, `noiseOpacity`). On a `#0A0908` ground this is the cheapest possible defence against the flat-black-void look, and it costs **zero dependencies** — which is the entire argument for taking it over any of the shader-based grain components on 21st (see rejects, §4).

**Adaptation — three edits.**
1. Replace `useId()` with a module-level constant id. That removes the only hook, which lets you **delete `"use client"`** and render it as a Server Component: **0 bytes of client JS.**
2. `opacity-50 dark:opacity-[0.75]` is hardcoded and uses the `dark:` variant — see the `dark:` hazard in §3.4. Replace with a token-driven opacity.
3. Add the missing `aria-hidden="true"` (the `<svg>` has none).

**Perf caution.** `feTurbulence` stretched to `absolute inset-0 size-full` over a full viewport is a well-known mobile paint cost, and it is on top of a live WebGL canvas here. Render it at a small fixed tile and repeat, or confine it to section-sized surfaces. Measure Lighthouse before and after; this is the kind of thing that silently costs 3–4 points on mobile.

**Serves.** The stage itself, and any panel that currently reads as a flat dark rectangle.

---

### 4 — Backlight · `dillionverma` (Magic UI)

| | |
|---|---|
| **21st.dev** | ❌ **not indexed.** |
| **Upstream (only path)** | `npx shadcn@latest add "https://magicui.design/r/backlight.json"` — public |
| **Manifest** | `dependencies: []` (explicitly empty). `registryDependencies`: *absent*. |
| **Source** | **867 B** — the smallest thing on this list. Imports: `react` (`useId`) only. **No `"use client"` directive**, no `cn`. |
| **Runtime** | None. An off-screen `<svg width="0" height="0" aria-hidden>` defining `feGaussianBlur → feColorMatrix saturate → feComposite over`, applied to a wrapper via `filter: url(#id)`. |

**What it does.** Makes an element **emit** light instead of sitting on a fill: its own pixels are blurred, saturated, and composited back underneath itself. This is design-system allowlist row **A8** — gold as emitted light, never as flat fill — expressed as a five-line filter. For the one or two places where gold must *glow* (the verdict glyph, the attestation indicator), this is the correct mechanism and it is free.

**Adaptation.** `saturate` is hardcoded at `4`, which will push `#D1A954` visibly toward orange. Retune to roughly 1.5–2.0 and re-run the `docs/04` §3.6 contrast check on whatever sits next to it. Wrap **only small emitters** — the filter softens glyph edges, so it must never wrap body copy or a heading you need to read.

**Accessibility.** The filter-definition SVG is already `aria-hidden="true"` and zero-sized — correct. Nothing animates, so it is reduced-motion-safe by construction. The one risk is legibility: verify any text inside a backlit wrapper still clears 4.5:1 (§3.6), because a Gaussian blur composited under text reduces effective edge contrast.

**Serves.** Ceremony verdict, Attestation indicator, the hero's single gold accent.

---

### 5 — Underline To Background · `danielpetho` (Fancy)

| | |
|---|---|
| **21st.dev** | `npx shadcn@latest add "https://21st.dev/r/danielpetho/underline-to-background"` ✅ present, 403-gated |
| **Upstream** | `npx shadcn@latest add "https://www.fancycomponents.dev/r/underline-to-background.json"` — public |
| **Manifest** | `dependencies: ["motion"]` |
| **Source** | 3,380 B. Imports: `react`, **`motion/react`**, `@/lib/utils`. |
| **Verdict** | **Manifest is honest. Do not install. Port the idea in CSS.** |

**Why not install.** The source genuinely uses `motion.create(as ?? "span")`, a spring `ValueAnimationTransition`, and a `useEffect` that reads `getComputedStyle(el).fontSize` to convert two ratio props into pixel custom properties. That is 29.5 kB of runtime plus a layout read on mount, to animate two values.

**Why it is on the list anyway — the animation is trivially portable, and here is the port.** The effect is: an underline pinned to the baseline grows from ~0.1em tall to the full height of the text on hover, while the text colour flips to read against it. In CSS that is an `::after` at `bottom: 0; height: 0.1em; width: 100%`, transitioning `height` to `100%` and the parent's `color` alongside it, both on `--ease-glide` and a duration token. **The `useEffect` is unnecessary entirely** — `em` units already scale with font size, which is the only thing that effect computes.

- **JS cost of the port: 0.** CSS cost: roughly 12 lines.
- The port must key on **`:hover` *and* `:focus-visible`** — the original is hover-only.
- **A8 constraint:** the grown state must not be `--accent`. A gold block the full height of a work-entry title is a large flat gold fill, which the allowlist forbids. Use `--surface-raised`, or a low-alpha accent tint, and verify the flipped text colour clears 4.5:1 against it (§3.6).
- Wrap the transition in `motion-safe:` / a `prefers-reduced-motion` guard; the hover state should still be *visible*, just instant.

**Serves.** Selected Work entry titles; inline links in About and Contact.

---

### 6 — skiper40 `Link001`–`Link005` · Skiper UI — **the manifest that lies**

| | |
|---|---|
| **21st.dev** | ❌ **not on 21st.dev at all** — zero `skiper` matches in the full sitemap. |
| **Upstream (only path)** | `npx shadcn@latest add "https://skiper-ui.com/r/skiper40.json"` — public |
| **Manifest** | `dependencies: ["framer-motion"]`, `registryDependencies: []` |
| **Source** | 8,554 B. Real imports: `next/link`, `react`, `@/lib/utils`. **The string `framer-motion` does not appear in the file.** |
| **Already in this repo** | `src/components/ui/skiper40.tsx` — verified: imports `next/link`, `react`, `cn`. Nothing else. |

**The discrepancy.** The manifest declares a 29.5 kB runtime dependency that the source does not use. Five link treatments — clip, translate and mask-based underline reveals — all of them pure CSS transitions on pseudo-elements. Installing this through the CLI would have installed `framer-motion` into a repo that deliberately removed it, for a component that renders without it.

**This is not isolated.** I checked the neighbours in the same registry:

| Component | Declares | Actually imports | Verdict |
|---|---|---|---|
| `skiper40` | `framer-motion` | `next/link`, `react`, `cn` | Manifest **over**-declares. Safe, free. |
| `skiper41` | `framer-motion` | `react` | Manifest **over**-declares. Safe. |
| `skiper31` | `framer-motion` | `framer-motion`, `lenis/react`, `react`, `cn` | Honest. Reject (needs the runtime). |
| `skiper39` | `framer-motion`, `canvas` | **`gsap`**, `react` | Manifest **both over- and under-**declares. Reject on principle — an undeclared `gsap` import would have failed the build after a "successful" install. |

**Action.** Nothing to install — it is already vendored. Delete the `Skiper40` demo wrapper (it hardcodes `hi@skiper-ui.com` five times and is `h-full snap-y overflow-y-scroll`, which is demo scaffolding), keep the **one** `LinkNNN` variant you actually want, re-tokenise its colours and durations, and drop the rest. Then check `:focus-visible` parity: these are hover-driven and need the same treatment on keyboard focus.

**Serves.** Every link on the site — Contact, About, external work links.

---

### 7 — Animated Shiny Text · `dillionverma` (Magic UI)

| | |
|---|---|
| **21st.dev** | `npx shadcn@latest add "https://21st.dev/r/dillionverma/animated-shiny-text"` ✅ present, 403-gated |
| **Upstream (use this)** | `npx shadcn@latest add "https://magicui.design/r/animated-shiny-text.json"` — public |
| **Manifest** | `dependencies`: *absent*. Ships `cssVars.theme.animate-shiny-text` + `css["@keyframes shiny-text"]`. |
| **Source** | **999 B.** Imports: `@/lib/utils` **only** — no `react` import, no hooks, no `"use client"`. |
| **Runtime** | **Zero.** Server-Component-safe as written. |

**What it does.** A narrow light band pans across text via `bg-clip-text` and a moving `background-position`. For the Ceremony section's transient states — "challenging…", "verifying…" — this is the right register: light crossing a readout, not a spinner.

**Three defects you must fix on adoption.**
1. **No reduced-motion guard.** It applies `animate-shiny-text` unconditionally — an 8s infinite loop. WCAG 2.2 **SC 2.2.2 (Pause, Stop, Hide)** applies to automatically-moving content lasting more than 5 seconds, so as shipped this is a straight AA failure. It must be `motion-safe:animate-shiny-text`. (Note that its sibling `shine-border` gets this right; the inconsistency is in the library, not in your reading of it.)
2. **Dead CSS.** The class list contains `[transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]`. `infinite` is not a valid `transition` component; the whole declaration is discarded by the parser. Drop it — the `@keyframes` is what actually runs.
3. **Hardcoded palette + `dark:` dependence.** `text-neutral-600/70 dark:text-neutral-400/70` and `via-black/80 dark:via-white/80`. All four become tokens, and the `dark:` variant is unreliable in this repo (§3.4).

**Scope discipline.** Use it on transient status text only. A shimmering headline or a shimmering "Introducing…" pill is the single most recognisable tell of the generated-portfolio stack — see §4.

**Serves.** Ceremony in-flight status line; the Attestation readout while the signature verifies.

---

### 8 — Grid Pattern · `dillionverma` (Magic UI)

| | |
|---|---|
| **21st.dev** | `npx shadcn@latest add "https://21st.dev/r/dillionverma/grid-pattern"` ✅ present, 403-gated (also mirrored at `@designali-in/grid-pattern`, identical code) |
| **Upstream (use this)** | `npx shadcn@latest add "https://magicui.design/r/grid-pattern.json"` — public |
| **Manifest** | `dependencies`: *absent*. `registryDependencies`: *absent*. |
| **Source** | 1,537 B. Imports: `react` (`useId`), `@/lib/utils`. No `"use client"`. Already carries `aria-hidden="true"`. |
| **Runtime** | None. A pure SVG `<pattern>` + `<rect>`. |

**What it does, and the non-obvious reason it beats its sibling.** A tiled grid — but the `squares?: Array<[x, y]>` prop lets you **light individual cells by coordinate**. That is a lattice you can address programmatically, which maps onto two things this site already has: the attestation field's point lattice (an SVG echo of it, cheaply, in the no-WebGL fallback path) and the WebAuthn **flag grid** (one cell per flag, lit cells = set flags). That second use is the highest-value idea in this document for the Ceremony section's structured data.

**Adaptation.** `fill-gray-400/30 stroke-gray-400/30` is hardcoded — swap for `--color-border-subtle`. Replace `useId()` with a constant so it stays a Server Component (0 client bytes).

**Serves.** Ceremony flag grid; the field's static fallback; panel backdrops.

---

### 9 — Glare Hover · `dillionverma` (Magic UI)

| | |
|---|---|
| **21st.dev** | ❌ **not indexed.** |
| **Upstream (only path)** | `npx shadcn@latest add "https://magicui.design/r/glare-hover.json"` — public |
| **Manifest** | `dependencies`: *absent*. |
| **Source** | 4,172 B. Imports: `react` (`useMemo` only), `@/lib/utils`. |
| **Runtime** | Negligible. **No listeners, no state, no effect.** The only JS is a `useMemo` parsing a `#rrggbb` prop into `rgba()`. The hover itself is a pure CSS transition over `--gh-angle` / `--gh-size` / `--gh-duration`. |

**What it does.** A diagonal specular sweep crosses a surface on hover — light moving across a machined panel rather than a colour changing. Good complement to Shine Border: one is a static lit edge, this is a transient highlight on interaction.

**Adaptation.** `background` and `color` are hex-string props; the `useMemo` hex parser can be deleted outright if you pass `color-mix(in oklch, var(--accent) 20%, transparent)` directly. `duration` (ms) → a duration token. Set `playOnce`.

**Accessibility.** **Hover-only with no focus path** — must gain `:focus-within` / `:focus-visible`. The sweep is not wrapped in `motion-safe:`; wrap it. It is triggered by user input rather than autoplaying, so SC 2.2.2 does not bite, but SC 2.3.3 (animation from interactions) does — reduced motion should skip straight to the end state.

**Serves.** Selected Work rows, Projects entries.

---

### 10 — Progressive Blur · `dillionverma` (Magic UI) — **conditional, read the caution**

| | |
|---|---|
| **21st.dev** | `npx shadcn@latest add "https://21st.dev/r/dillionverma/progressive-blur"` ✅ present, 403-gated (also `@ibelick/progressive-blur`, `@reuno-ui/progressive-blur`) |
| **Upstream (use this)** | `npx shadcn@latest add "https://magicui.design/r/progressive-blur.json"` — public |
| **Manifest** | `dependencies`: *absent*. |
| **Source** | 4,423 B. Imports: `react`, `@/lib/utils`. No state, no effect. |

**What it does.** A graduated blur at a section edge — content dissolves rather than being cut off. Attractive for the boundary where the attestation field meets a section.

**Why it is ranked last.** It stacks **eight** absolutely-positioned layers, each with its own `backdrop-filter: blur()` (0.5 → 64px) and its own `mask-image`. Over a live WebGL canvas that is eight extra full-width composited blur passes per frame. Against a ≥95 mobile Lighthouse target with the field already running, this is by a distance the riskiest item surveyed.

**Recommendation.** Try the cheap version first: a single `mask-image: linear-gradient(to bottom, black, transparent)` applied to the field canvas gives most of the same read for **zero** extra layers. Only reach for this component if that is not enough, and then cut `blurLevels` to three and confine it to a thin boundary band. Add `aria-hidden`; it is already `pointer-events-none`.

---

## 2. Install these three first

**1. Shine Border** (`magicui.design/r/shine-border.json`) — 1,649 B of source, zero dependencies, zero runtime, and it is the **only component in the survey that already respects `prefers-reduced-motion`**. It implements the exact mechanic the design system already specifies (a gold radial masked into a 1px ring), which means adoption is re-tokenisation rather than reinterpretation, and there is nothing to argue about at design QA.

**2. Glow Card Grid** (`chanhdai.com/r/glow-card-grid.json`) — zero dependencies, ~30 lines of pointer JS, no React re-render. It is the only component found whose border **takes its colour from what is rendered behind it**, which converts "a single light source in document space" from a thing the CSS asserts into a thing the browser computes against the actual field. Take it second rather than first only because the `backdrop-filter` stack needs a real mobile measurement before it is committed.

**3. Noise Texture** (`magicui.design/r/noise-texture.json`) — 1,785 B, zero dependencies, and after replacing `useId` with a constant it becomes a Server Component costing **0 bytes of client JS**. Grain on a near-black ground is the highest ratio of perceived quality to bytes available anywhere in this document, and it is the piece that stops `#0A0908` reading as an empty void between sections. Ship it behind a Lighthouse measurement because `feTurbulence` is not free to paint.

All three are acquired by reading the upstream registry JSON and hand-writing the file — see §3. Combined added dependencies: **zero**. Combined added client JS after the Server Component conversions: **Shine Border and Noise Texture contribute 0; Glow Card Grid contributes one pointer listener.**

---

## 3. How adoption actually works here

### 3.1 The 21st.dev CLI path is closed

As established in §0, every 21st.dev registry URL returns 403 without credentials, and the source lives in a private bucket. `npx shadcn@latest add "https://21st.dev/r/…"` will fail before it reaches any repo concern. Restoring it needs a 21st.dev account and their API-key / Magic MCP login — an authenticated third-party CLI writing files into this repo, which is a larger decision than any component on this list is worth.

### 3.2 …and even if it were open, `init` is the real hazard

There is no `components.json` in this repo (deleted as dead scaffolding). `shadcn add` with no config runs `init` first, which will:

- write a `components.json` you did not author;
- detect the Tailwind setup and **write into `src/app/globals.css`** — `@theme` entries, `@layer base` blocks, and its own CSS variables;
- add `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` and a `src/lib/utils.ts`.

Of those, only one genuinely matters: **`globals.css` is the design system's single source of truth**, and `docs/04` §0 makes an untokenised rendered value a defect by definition. A CLI merging a foreign palette and a foreign `@theme` block into that file is the thing to prevent. (`clsx`, `tailwind-merge` and `src/lib/utils.ts` with `cn` are already present and already paid for, so those particular writes would be no-ops — verified.)

### 3.3 Recommended path — fetch, read, hand-write

Do not run `shadcn add` at all. For each component:

```bash
# 1. fetch the upstream registry item
curl -s https://magicui.design/r/shine-border.json -o /tmp/item.json

# 2. read what it really declares
python3 -c "import json;d=json.load(open('/tmp/item.json'));print(d.get('dependencies'),d.get('registryDependencies'))"

# 3. read what it really imports — this is the step that catches the liars
python3 -c "import json,re;d=json.load(open('/tmp/item.json'));c=''.join(f['content'] for f in d['files']);print(sorted(set(re.findall(r'from [\"\\'](.*?)[\"\\']',c))))"

# 4. print the source, read it, then hand-write it into src/components/ui/
python3 -c "import json;d=json.load(open('/tmp/item.json'));print(d['files'][0]['content'])"

# 5. the CSS the CLI would have injected, which you must place by hand
python3 -c "import json;d=json.load(open('/tmp/item.json'));print(json.dumps({'cssVars':d.get('cssVars'),'css':d.get('css')},indent=2))"
```

Step 5 matters for Tailwind 4: `shine-border`, `marquee`, `animated-shiny-text` and `animated-gradient-text` all carry `cssVars.theme` and `css["@keyframes …"]` payloads. In a v4 project the CLI translates those into the CSS file; doing it by hand means adding the `--animate-*` entry to the existing `@theme` block and the `@keyframes` alongside the other keyframes in `globals.css`, with a `docs/04` token reference in the comment like every other value in that file.

**Prefer the upstream registry over 21st.dev even when both exist.** Upstream is public, unauthenticated, versioned with the library, and — as §0 shows — ahead of 21st's index.

### 3.4 Two repo-specific adaptation rules that apply to every component here

**Tailwind 4 / no `tailwind.config.js`.** Good news, measured: **none** of the ten shortlisted sources references a config file, `theme.extend`, or a config-only utility. `glow-card-grid` is written in v4-native syntax throughout (`border-(length:--var)`, `rounded-(--var)`, `@container-size`). The only v3-era assumption anywhere is the `cssVars`/`css`/`tailwind` **manifest** keys, which are a CLI concern, not a source concern — handled by step 5 above.

**The `dark:` variant is a trap in this repo.** `globals.css` line 35 defines:

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

so `dark:` fires only when `ThemeScript` has written the attribute — while the **tokens** flip via `@media (prefers-color-scheme: dark)` with no attribute required. With JS disabled (a stated requirement) the tokens go dark and every `dark:` utility stays light. `noise-texture` (`dark:opacity-[0.75]`) and `animated-shiny-text` (`dark:via-white/80`, `dark:text-neutral-400/70`) both ship `dark:` utilities. **Rule: re-express every `dark:` utility from an adopted component as a token reference, never as a `dark:` variant.** This is a silent correctness bug, not a style preference.

**Budget context.** `scripts/check-bundle-budget.mjs` gates at **180 kB gzipped from the build manifests**, and its header documents that Next's own "First Load JS: 108 kB" figure undercounted the served document by 37,501 B. Judge every adoption against `node scripts/check-bundle-budget.mjs`, not against the build table.

---

## 4. Rejects

### 4.1 The generated-portfolio stack — rejected on sight

Per the brief, and named explicitly because each of these **did** surface in the survey:

| Candidate found | 21st.dev path | Why rejected |
|---|---|---|
| **Aurora Background** | `@pulkitxm/aurora-background`, `@unlumen/aurora-blur`, `@bevelui/aurora-hero`, `@componentry/silk-aurora` | The single most recognisable default-coloured AI-portfolio background. On a site whose entire argument is a hand-built attestation field, importing a stock aurora would undercut the centrepiece by association. |
| **Spotlight** | `@pulkitxm/cursor-spotlight` | Cursor-follow radial glow; the second-most recognisable tell. `glow-card-grid` achieves a lit surface by a different and defensible mechanism (backdrop-derived, not a painted radial following a cursor). |
| **Text Generate Effect** | Aceternity family, indexed on 21st | Word-by-word typewriter reveal of a headline. An engineering audience reads it as "an LLM wrote this page." Also splits the claim sentence into per-word DOM nodes, which breaks selection and copy. |
| **Floating Navbar** | `@…/animated-navbar` family (14 indexed) | Pill-shaped floating nav is the fourth member of the set. The existing `SiteHeader` is correct and accessible. |

The brief's judgement holds and the survey reinforces it: this combination now reads as *generated* to the exact audience this site is for, and a larger budget makes it worse, not better — a more elaborate aurora is a more confident signal of the same template.

### 4.2 Manifests that lie in the dangerous direction (declared clean, actually need a runtime)

| Component | Declares | Actually imports | Notes |
|---|---|---|---|
| **Magic UI `terminal`** | *no `dependencies` key* | **`motion/react`** | 7,716 B, and it builds a whole `motionElements` map — `motion.article`, `motion.div`, `motion.h1`…`motion.h5`. A manifest reading "no dependencies" that would have pulled 29.5 kB. **Reject.** The tempting one, since a terminal surface is on-brand for a security engineer. |
| **Magic UI `dot-pattern`** | *no `dependencies` key* | **`motion/react`** + `useEffect` | Same lie, smaller. Take `grid-pattern` instead, which is genuinely clean and strictly more useful (addressable `squares`). **Reject.** |
| **Skiper UI `skiper39`** | `framer-motion`, `canvas` | **`gsap`** | Declares two things it does not use and omits the one it does. An install would have "succeeded" and then failed at build on an unresolved `gsap`. **Reject.** |

### 4.3 Honest manifests, real runtime — rejected on cost or on design

| Component | Cost, inspected | Why rejected |
|---|---|---|
| **Magic UI `border-beam`** | `dependencies: ["motion"]`, imports `motion/react`. 2,462 B. | Rejected twice over: needs the banned runtime, **and** a beam travelling around a border directly contradicts a single fixed light source in document space. It would make the site's central premise look like decoration. |
| **Magic UI `magic-card`** | `["motion", "next-themes"]` | `next-themes` would duplicate the existing `ThemeScript` and fight it. Plus it is Spotlight by another name. |
| **Magic UI `animated-gradient-text`** | No deps, 871 B, genuinely zero-runtime | Rejected on the **design system**, not on cost: hardcoded `#ffaa40` → `#9c40ff`, and re-tokenising it to gold produces `--accent` as a large flat fill across every glyph. Forbidden by allowlist row **A8**. |
| **Magic UI `retro-grid`** | No deps, but **23,431 B** across 866 lines, canvas + rAF | Largest source in the survey, a second animation loop beside the OGL field, and a synthwave aesthetic that belongs to a different site. |
| **Magic UI `flickering-grid`**, **`particles`** | No deps; `getContext('2d')` + rAF | A second continuously-running render loop alongside the attestation field, for texture that `noise-texture` provides for free and statically. |
| **Magic UI `file-tree`** | No `dependencies` declared, but imports `@radix-ui/react-accordion`, `lucide-react`, `@/components/ui/button`, `@/components/ui/scroll-area` | Manifest omits a Radix package and an icon library, and `registryDependencies` would drag in two more shadcn primitives this repo does not have. |
| **Magic UI `code-comparison`** | `["shiki", "next-themes"]` | Syntax highlighting at that price, for a site with no code samples in the critical path. |
| **Kibo UI `code-block`** (`@haydenbleasel`) | `["@radix-ui/react-use-controllable-state", "@shikijs/transformers", "lucide-react", "react-icons", "shiki"]`, `registryDependencies: ["button","select"]`, **16,435 B** across 2 files | The best code-display component found, and completely out of budget: five npm packages including Shiki's grammar/theme machinery, plus two shadcn primitives. |
| **Fancy text family** — `scramble-hover`, `letter-swap-*`, `vertical-cut-reveal`, `text-highlighter`, `variable-font-hover-by-letter` | All declare **and use** `motion/react` (verified: 3,380–6,439 B each) | Honest manifests, real runtime. Separately: they split text into per-letter `<span>`s, which breaks text selection and copy — actively hostile to a recruiter trying to copy a company name. |
| **Aceternity `text-hover-effect`** (`@manuarora700`) | `["motion"]`, genuinely imports `motion/react` | Honest, and also an SVG-gradient-filled outline headline — the "elegance where evidence should go" failure mode the design system calls AP6. |

### 4.4 The entire Paper Design shader family — rejected as a class

`@paper-design/*` accounts for a large share of 21st's texture category (`grain-gradient-*`, `god-rays-*`, `halftone-*`, `neuro-noise-*`, `dot-orbit-*`, `voronoi-*`, `pulsing-border-*`). Every one requires `@paper-design/shaders-react` — **a second WebGL runtime sitting next to OGL**, which this repo already ships and already uses for the attestation field. For grain specifically, `noise-texture` delivers the same result with `feTurbulence` at zero dependencies. Reject all of them, including the genuinely beautiful ones.

### 4.5 Scroll reveals — nothing beats what is already here

21st indexes dozens (`@cnippet-dev/scroll-reveal`, `@badtzx0/blur-reveal`, `@tom_ui/blur-reveal`, `@ddoemonn/text-reveal`, `@waleedkibhen/reading-text-reveal`, …). The repo already has `src/components/motion/Reveal.tsx` — IntersectionObserver-based, reduced-motion-aware, and in budget. Adopting any of these adds a dependency **and** a second reveal idiom to maintain. **Recommendation: adopt none; extend `Reveal.tsx`.** The brief's "CSS-only or IntersectionObserver-based only" filter is already satisfied by code you own.

---

## 5. Summary table

| # | Component | Author | Acquire from | Declared deps | Real deps | Runtime | Section |
|---|---|---|---|---|---|---|---|
| 1 | Shine Border | `dillionverma` | `magicui.design/r/shine-border.json` | none | **none** | none | Work, Ceremony, Attestation |
| 2 | Glow Card Grid | `ncdai` | `chanhdai.com/r/glow-card-grid.json` | none | **none** | 1 pointer listener | Work, Ceremony, Projects |
| 3 | Noise Texture | `dillionverma` | `magicui.design/r/noise-texture.json` | none | **none** | none (→ Server Component) | Stage, panels |
| 4 | Backlight | `dillionverma` | `magicui.design/r/backlight.json` | `[]` | **none** | none | Ceremony verdict, Attestation |
| 5 | Underline To Background | `danielpetho` | *port in CSS, do not install* | `motion` | `motion` ✔ honest | 0 after port | Work titles, links |
| 6 | skiper40 `Link001–005` | Skiper UI | already vendored | `framer-motion` | **none** ✗ lie | none | All links |
| 7 | Animated Shiny Text | `dillionverma` | `magicui.design/r/animated-shiny-text.json` | none | **none** | none | Ceremony status |
| 8 | Grid Pattern | `dillionverma` | `magicui.design/r/grid-pattern.json` | none | **none** | none | Flag grid, field fallback |
| 9 | Glare Hover | `dillionverma` | `magicui.design/r/glare-hover.json` | none | **none** | `useMemo` only | Work, Projects |
| 10 | Progressive Blur ⚠ | `dillionverma` | `magicui.design/r/progressive-blur.json` | none | **none** | none (8 blur layers) | Section boundaries |

Manifest-vs-source discrepancies found: **5** — `skiper40`, `skiper41` (over-declare `framer-motion`, use none); `terminal`, `dot-pattern` (declare nothing, import `motion/react`); `skiper39` (declares `framer-motion`+`canvas`, imports `gsap`). Judge by the source.
