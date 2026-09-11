# 10 — UI Component & Effect Research

Research pass for the visual redesign of arinzeokigbo.com.
Audience for the site: technical recruiters and engineering hiring managers, < 90 seconds.
Subject: CS @ NYU, co-founder/CEO of Splita (commit-first group payments, $200K pre-seed in
commitments), browser-native auth R&D at Queralt (FIDO2, PKI, Entra ID), AI evaluation at Snorkel AI.

---

## 0. Brief as it now stands

The first build was correct and forgettable. Lighthouse 100/100/100/100, WCAG 2.2 AA,
114 KB JS — and the owner's verdict was "this is terrible visually." The near-monochrome
heavy-restraint direction produced a site that reads as *safe*, and the 3D centrepiece
renders at 1.44:1 against its background, which is to say it does not render at all.

Two corrections to the original research brief arrived mid-pass and are reflected throughout:

1. **"Fire theme" means "make it stunning," not a flame palette.** The ember/orange/red
   branch is dropped. The gold identity stays: `#D1A954` dark / `#7C5E1D` light. What
   changes is the *ambition of execution* — depth, glow, motion, shape, texture, layering.
   Everything below is aimed at making a gold-on-dark site feel expensive and engineered.
2. **The performance budget is relaxed.** Lighthouse must stay above 90. It is at 100 with
   114 KB JS against a 200 KB budget, so there is roughly **85 KB of JS headroom** and
   almost certainly more before Lighthouse moves off 100 on a site this small. An animation
   runtime is back on the table. Costs are still reported precisely for every entry — the
   tradeoff should be visible, not hidden.
3. **Accessibility is unchanged and non-negotiable.** Keyboard operation, visible focus,
   `prefers-reduced-motion`, and core content working with JS disabled are hard
   requirements. **An effect with no credible reduced-motion story is disqualified**, and
   each entry below states its story explicitly.

### What the repo already gives us for free

Worth knowing before spending anything, because it changes several recommendations:

| Already installed | Version | Cost already paid | What it unlocks |
| --- | --- | --- | --- |
| `ogl` | ^1.0.11 | ~7 KB gz (tree-shaken; core 8 KB / math 6 KB / extras 15 KB minzipped before shaking) | **Any fragment-shader background at near-zero marginal cost.** This is the single most underused asset in the repo. |
| `lenis` | ^1.1.20 | ~3–5 KB gz | Smooth scroll already wired via `SmoothScrollProvider`. Scroll-linked effects can read from it. |
| `clsx` + `tailwind-merge` | — | ~2 KB | shadcn-style `cn()` — every copy-paste registry component drops in without new deps. |
| Tailwind v4 | ^4 | 0 JS | `@theme`, `@custom-variant`, native cascade layers. Registry components targeting v4 install cleanly. |
| `src/components/motion/Reveal.tsx` | — | in-budget | An IntersectionObserver reveal primitive already exists and already respects reduced motion. Extend it rather than importing a scroll library. |

`ogl` being present and the 3D centrepiece being invisible is the defining fact of this
research. The expensive part of a shader background — the WebGL runtime — is already
in the bundle and already paid for. Adding a second shader surface costs a few hundred
bytes of GLSL string.

### Browserslist constraint that gates several effects

`chrome >= 111, edge >= 111, firefox >= 111, safari >= 16.4, ios_saf >= 16.4`

| Feature | Chrome | Safari | Firefox | Verdict for this project |
| --- | --- | --- | --- | --- |
| `@property` | 85 | 16.4 | **128** | Usable. Firefox 111–127 gets a static (un-animated) gradient — an intentional-looking fallback. |
| `animation-timeline` (scroll-driven) | 115 | **26.0** | **158** | ~87% global. **Progressive enhancement only** — wrap in `@supports (animation-timeline: view())` and make the un-enhanced state the visible, correct one. |
| `color-mix()` | 111 | 16.2 | 113 | Fully usable. Best tool for deriving gold glow tints from one token. |
| `mask` / `mask-image` (unprefixed) | 120 | 15.4 | 53 | Usable with `-webkit-mask` fallback. |
| `backdrop-filter` | 76 | 9 | 103 | Usable. |
| View Transitions (same-document) | 111 | 18 | 144 | Enhancement only. |

---

## 1. Source libraries

### 1.1 21st.dev — the named reference

**URL:** https://21st.dev · **Repo:** https://github.com/serafimcloud/21st

**What it actually is:** not a component library — a **registry and marketplace**. It is
"npm for design engineers": a community index of 12,000+ React + Tailwind + shadcn-compatible
components, blocks, hooks and themes, contributed by 700+ authors. Its top contributors are
the other libraries in this document — **Aceternity UI, Magic UI, shadcn/ui, Origin UI, Geist**
all publish into it. So 21st.dev is best understood as the *search interface over the whole
ecosystem*, not a competing library.

**Categories it organises by:**
- Marketing blocks — animated heroes, hero sections, gradients, CTAs, footers, pricing
- UI components — buttons, cards, navigation, sign-in forms, AI chat surfaces, inputs
- Advanced elements — galleries, 3D carousels, **shaders**, backgrounds
- Full templates and shadcn themes

**Installation — two paths, both copy-paste, neither a runtime dependency:**

1. **shadcn CLI against the registry URL:**
   `npx shadcn@latest add "https://21st.dev/r/<author>/<component>"`
   This writes the source files into your repo, pulls transitive registry deps, extends
   your Tailwind theme, and adds any required global styles. The code is *yours* after that.
2. **AI-ready prompt.** Each component ships a prompt you paste into Claude Code / Cursor /
   v0 and the agent reconstructs it in your codebase, adapted to your conventions. For this
   project that is the better path — it lets components land on *our* tokens
   (`--accent`, `--surface-raised`, `--border-subtle`) instead of importing a foreign palette.

**Dependencies:** whatever the individual component declares. Most assume Tailwind +
`cn()` (we have both). A large fraction of the animated ones assume `motion` — that is the
one real cost, and it is a single shared cost regardless of how many such components you take.

**Licensing:** browsing is free; **2 free component copies per day** on the free tier,
unlimited copies + premium templates on a paid membership. Individual components carry
their author's licence (Aceternity free components: MIT; Magic UI: MIT; shadcn/ui: MIT;
Cult UI: MIT). **The daily copy limit is a soft constraint only** — the prompt path and the
underlying open-source repos are both unmetered, so this is not a blocker.

**The specific 21st.dev components that suit this portfolio:**

| Component family | Why it fits | Cost |
| --- | --- | --- |
| Shader / gradient hero backgrounds | Directly solves the 1.44:1 invisible-centrepiece problem; we already ship `ogl` | GLSL + existing dep |
| Bento grid blocks | The right container for Splita / Queralt / Snorkel as three unequal tiles | CSS only |
| Animated / gradient borders (border beam, shine border) | Gold beam on a dark card reads as precision instrumentation | CSS `@property`, 0 JS |
| Spotlight & magic cards (cursor-follow glow) | Makes dark cards feel lit rather than flat | ~15 lines JS |
| Terminal / code-block components | On-brand for a security engineer; see §4 | CSS + small JS |
| Marquee / logo rails | NYU · Snorkel · Queralt · Splita as a credential band | CSS only |
| Number tickers | "$200K", "100/100", FIDO2 metrics | ~1 KB or 0 KB |
| Resizable / floating navbars | Header that condenses on scroll | small |

**Verdict:** use 21st.dev as the *discovery surface*, take components via the prompt path,
re-tokenise them onto the existing design system, and never let one add a runtime dependency
we have not separately decided to pay for.

---

### 1.2 Library-by-library comparison

| Library | URL | Genuinely good at | Distribution | Runtime dep | Licence |
| --- | --- | --- | --- | --- | --- |
| **shadcn/ui** | ui.shadcn.com | Correct, accessible primitives (Radix under the hood). Dialogs, popovers, tabs that actually handle focus. Not an effects library. | Copy-paste source via CLI | Radix per-component (~3–10 KB each) | MIT |
| **Aceternity UI** | ui.aceternity.com | The most *ambitious* free effects: Aurora Background, Background Beams, Sparkles, Vortex, Wavy Background, 3D Card Effect, Evervault Card, Glare Card, **Sticky Scroll Reveal**, Hero Parallax, Macbook Scroll, **Encrypted Text**, Text Generate Effect, Flip Words, Timeline. 200+ free components. | Copy-paste source | **`motion` on most**; `three.js` on Globe/3D Pin/3D Marquee | MIT (free components). Pro templates restrictively licensed — no resale/derivative products. |
| **Magic UI** | magicui.design · github.com/magicuidesign/magicui | The *cleanest* implementations of the mid-tier effects. Marquee, **Bento Grid**, **Border Beam**, **Shine Border**, **Animated Beam**, Magic Card, Meteors, Particles, Dock, **Number Ticker**, Animated Gradient Text, Aurora Text, Typing Animation, Flickering Grid, Dot Pattern, Terminal. | `pnpm dlx shadcn@latest add @magicui/<name>` — copy-paste source | Framer Motion / `motion` on the animated ones; several (Marquee, Bento, Dot Pattern) are **pure CSS** | MIT |
| **React Bits** | reactbits.dev · github.com/DavidHDev/react-bits | 110+ components, and the one library **without a mandatory Framer Motion dependency** — per-component you choose CSS, GSAP, `motion` or `three`. Strong text animations and WebGL backgrounds. Ships JS *and* TS, Tailwind *and* plain CSS variants. | Copy-paste source or `jsrepo` CLI | **Per-component** — this is its architectural advantage | **MIT + Commons Clause.** You may build sites and commercial products with it; you may not sell React Bits itself. Fine for this use. |
| **motion-primitives** | motion-primitives.com · github.com/ibelick/motion-primitives | Small, tasteful, restrained motion. Text effects, morphing dialogs, cursor, infinite slider, in-view. Much less "template-y" than Aceternity. Beta, 6.3k stars. | Copy-paste source | **`motion` required** — it is the whole premise | MIT |
| **Cult UI** | cult-ui.com · github.com/nolly-studio/cult-ui | Texture Card / Texture Button — subtle layered-border, tactile surfaces. Exactly the "expensive" register this redesign wants. Tailwind v4 native. | `pnpm dlx shadcn@latest add https://cult-ui.com/r/<name>.json` | `motion` on some; **CSS on the texture components** | MIT |
| **Origin UI** | originui.com | Huge set of *input and form* variants. Not effects. Useful only for the contact form. | Copy-paste | Minimal | MIT |
| **Codrops / Tympanus** | tympanus.net/codrops | Not a library — a demo archive. The single best source for *original* effects that will not read as template. Where you go to avoid looking like everyone else. | Read and port | Varies (often GSAP) | Per-demo, generally permissive for learning/adaptation — check each |

**The one structural insight:** every library in this table distributes **copy-paste source**,
not npm packages. The dependency question is therefore never "which library do I install" —
it is only **"do I install `motion`, GSAP, or neither."** That is the single decision that
determines bundle cost. Everything else is source files you own and can strip.

### 1.3 Animation runtimes — the actual cost decision

| Runtime | Cost (gzip) | Buys you | Verdict |
| --- | --- | --- | --- |
| **Native CSS + IntersectionObserver** | **0 KB** (Reveal.tsx already exists) | Reveals, transitions, keyframes, `@property` interpolation, scroll-driven animation where supported | **Default. Covers ~70% of this catalogue.** |
| **`motion` with `LazyMotion` + `m` + `domAnimation`** | **~4.6–6 KB initial**, ~15 KB feature chunk loaded async | Spring physics, layout animations, gesture-driven variants, orchestrated staggers, `AnimatePresence` exit animations | **Justified if — and only if — we take layout animations or exit animations.** Those two are genuinely painful in raw CSS. Nothing else here needs it. |
| **`motion` full (`motion/react`)** | ~30–34 KB gz | Everything above, eagerly | **No.** Framer Motion was already removed once for costing 29.5 KB and animating nothing. Do not reintroduce it in the form that got it deleted. |
| **Motion One** (`motion` vanilla, no React bindings) | ~3.8 KB gz | WAAPI wrapper, timelines, scroll() | Reasonable middle ground if we want a timeline but not React-component motion. |
| **GSAP core** | ~23–25 KB gz | Best-in-class timelines, precise sequencing | Only if we take SplitText. |
| **GSAP ScrollTrigger** | ~11 KB gz | Pinned sections, scrubbed scroll timelines | Overlaps heavily with CSS scroll-driven animations. Skip unless pinning. |
| **GSAP SplitText** | ~5 KB gz (rewritten 2025, 50% smaller) | Per-character/word/line text splitting that handles wrapping, i18n and re-measure correctly | **The one genuinely hard-to-hand-roll thing.** Free for commercial use since April 2025 (Webflow acquisition made the entire Club GreenSock plugin set free). |
| **`ogl`** | ~7 KB gz — **already paid** | Fragment shaders, full-viewport WebGL | **Free money. Use it.** |
| **three.js / react-three-fiber / drei** | 150 KB+ gz | A full 3D scene graph | **No.** Would consume the entire headroom for capabilities `ogl` already provides. |

**Recommended runtime budget:** `ogl` (paid) + **at most one** of {`motion` via LazyMotion
≈ 6 KB, GSAP core + SplitText ≈ 30 KB}. Total new JS target: **under 35 KB**, leaving
~50 KB of the relaxed headroom unspent. Ambition here comes from GLSL and CSS, not from
kilobytes of animation runtime — and a site that is visually ambitious *at* 125 KB is a
better artefact for this audience than one that is ambitious at 199 KB.

---

## 2. Effect catalogue

Cost column = **additional** gzipped JS beyond what is already installed.
RM = `prefers-reduced-motion` story.

### 2.1 Backgrounds, gradients and atmosphere

#### Animated mesh / aurora gradient — CSS
- **What:** two or three large, heavily-blurred radial gradients in gold and near-black,
  drifting on long slow keyframes behind the hero. Creates depth without a single image.
- **Where:** Aceternity *Aurora Background* (ui.aceternity.com/components/aurora-background);
  the pure-CSS form is standard practice — animate `background-position` on a layered
  `radial-gradient`, or translate absolutely-positioned blurred blobs.
- **Implementation:** `filter: blur(80px)` on 2–3 positioned divs, `@keyframes` translating
  them over 20–40s, `mix-blend-mode: screen` on dark. Derive tints with
  `color-mix(in oklab, var(--accent) 30%, transparent)` so it tracks the token.
- **Cost:** **0 KB JS.** Watch the paint cost: large blurred surfaces are the expensive part,
  not the animation. Promote with `will-change: transform` and animate *transform only*,
  never `filter` or gradient stops per frame.
- **A11y:** decorative, `aria-hidden`. Must not reduce text contrast — cap opacity and
  re-verify AA against every text colour that sits over it.
- **RM:** yes — freeze at a composed still frame. The static frame should be the good one.

#### Fragment-shader background — `ogl`
- **What:** a full-bleed GLSL surface. Flowing gold caustics, a slowly-rotating noise field,
  a dark plasma with gold highlights. This is the highest-ceiling effect available and the
  one with the best cost ratio here.
- **Where:** React Bits backgrounds (reactbits.dev — Iridescence, Aurora, Threads, Silk,
  DarkVeil, Liquid Chrome) are largely `ogl`-based; 21st.dev has a shaders category;
  `paper-design/shaders` is another source.
- **Implementation:** one `<canvas>`, one `Triangle` covering clip space, one fragment
  shader, `uTime` + `uResolution` + `uColor` uniforms fed from the CSS token. `ogl` is
  already a dependency — the marginal cost is the shader string.
- **Cost:** **~0 KB new JS** (`ogl` already installed); ~0.5–2 KB for the shader + wrapper.
  GPU cost is the real budget: render at `dpr = min(devicePixelRatio, 1.5)`, pause via
  IntersectionObserver when off-screen, and stop the RAF loop on `visibilitychange`.
- **A11y:** decorative, `aria-hidden`, `pointer-events: none`. **Must** sit behind an
  opacity/contrast scrim so text over it clears AA — this is precisely the failure mode
  that produced the 1.44:1 centrepiece.
- **RM:** yes — render exactly one frame and stop the loop. A still shader frame is
  often more beautiful than the animation, which makes this a cheap win rather than a penalty.
- **Note:** also the right fix for the existing `AttestationFigure`. The problem there was
  contrast, not concept.

#### Noise / film grain overlay
- **What:** a fixed full-viewport grain layer at 3–6% opacity. Does more for "expensive"
  than almost anything else on this list — it kills the plasticky flatness of pure CSS
  gradients and makes gold read as metal rather than as `#D1A954`.
- **Where:** `<feTurbulence type="fractalNoise">` inlined as a data URI
  (Codrops: tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/;
  Frontend Masters "Grainy Gradients"; generator at fffuel.co/gggrain).
- **Implementation:** inline SVG data URI on `background-image` of a `position: fixed`
  pseudo-element, `pointer-events: none`, `opacity: .04`, `mix-blend-mode: overlay`.
  Keep `numOctaves` at 3 or below — beyond 4 the visual gain does not justify the CPU.
  Alternative: a 128×128 tiling PNG as base64 (base64 adds ~33% to file size but is
  cheaper to rasterise on low-end devices).
- **Cost:** **0 KB JS**, a few hundred bytes of CSS. The caveat is rasterisation cost —
  SVG filters are resolution-independent and weightless to download but can be CPU-heavy on
  large surfaces and old devices. Rasterise once on a fixed layer; never animate it.
- **A11y:** purely decorative; no contrast impact at ≤6% opacity, but re-measure.
- **RM:** static by construction — nothing to degrade. **Safest high-impact item in the catalogue.**

#### Dot grid / flickering grid / blueprint grid
- **What:** a faint dot or line lattice. Reads as engineering drawing, schematic, coordinate
  space. Strongly on-theme for this subject (§4).
- **Where:** Magic UI *Dot Pattern* and *Flickering Grid* (magicui.design/docs/components/dot-pattern).
- **Implementation:** `background-image: radial-gradient(circle, var(--border) 1px, transparent 1px)`
  with `background-size: 24px 24px`, plus a `mask-image: radial-gradient(...)` fade at the
  edges so it does not tile to the viewport boundary. Magic UI's *Flickering* variant uses
  canvas; the static version is one CSS declaration and is the better choice.
- **Cost:** static grid **0 KB**; flickering canvas version ~2 KB + a continuous RAF loop.
- **A11y:** decorative.
- **RM:** static version has nothing to reduce; flickering version must freeze.

#### Spotlight / radial reveal on hero
- **What:** a soft cone or radial of gold light falling across the hero, as if the section
  is lit from off-canvas.
- **Where:** Aceternity *Spotlight*; also achievable from scratch.
- **Implementation:** a rotated, blurred `linear-gradient` in a `<div>` with
  `mix-blend-mode: screen`, or an SVG ellipse with a Gaussian blur filter. Static.
- **Cost:** **0 KB JS.**
- **A11y / RM:** decorative, static.

---

### 2.2 Borders, glow and edges

#### Animated gradient border ("border beam" / conic sweep)
- **What:** a light travelling around a card's perimeter. On gold-on-dark this is the single
  most "expensive-looking" effect per byte in the whole catalogue.
- **Where:** Magic UI *Border Beam* and *Shine Border*
  (magicui.design/docs/components/border-beam); the pure-CSS technique is documented at
  codetv.dev/blog/animated-css-gradient-border and theosoti.com/blog/animated-gradient-borders/.
- **Implementation (CSS-only, no JS at all):**
  register an angle custom property with `@property --beam-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false }`,
  paint a `conic-gradient(from var(--beam-angle), transparent 0 70%, var(--accent) 85%, transparent 100%)`
  on a `::before`, clip it to the border ring with
  `mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude`,
  and animate `--beam-angle` 0→360deg. **Registering the property is what makes the angle
  interpolable** — the browser interpolates it natively, so there is no `requestAnimationFrame`
  loop and no runtime bookkeeping. Magic UI's version uses `motion`; the CSS version does not,
  and looks the same.
- **Cost:** **0 KB JS.** Compositor-only if you keep it to the pseudo-element.
- **Browser:** `@property` needs Firefox 128+. Firefox 111–127 shows a **static** gradient
  border at the initial angle — a graceful, intentional-looking fallback, not a broken one.
- **A11y:** purely decorative; do not let it replace a real focus ring.
- **RM:** yes — `animation: none`, static gradient remains. Trivially degradable.

#### Glow / ambient light on hover
- **What:** a card that gains a soft gold halo when hovered or focused.
- **Implementation:** `box-shadow: 0 0 0 1px color-mix(in oklab, var(--accent) 40%, transparent), 0 8px 40px -12px color-mix(in oklab, var(--accent) 30%, transparent)`
  with a `transition`. Optionally a blurred `::after` clone at low opacity.
- **Cost:** **0 KB JS.**
- **A11y:** **bind to `:focus-visible` as well as `:hover`** — otherwise keyboard users get a
  flatter site than mouse users, which is a real (if unflagged) AA-adjacent failure.
  Large blur radii on many simultaneous elements are a paint cost; keep to hover state only.
- **RM:** transition duration → 0. State change still occurs, which is correct — the
  information is preserved, only the tween is removed.

#### Animated beam between elements
- **What:** an SVG path connecting two DOM nodes with a travelling gradient along it.
  Excellent for diagramming an *architecture*: browser → authenticator → relying party.
- **Where:** Magic UI *Animated Beam* (magicui.design/docs/components/animated-beam).
- **Implementation:** measure both anchors, generate a curved `<path>`, animate
  `stroke-dashoffset` or a `<linearGradient>` offset along it. Magic UI's version uses
  `motion` + a ResizeObserver; a hand-rolled version needs only the ResizeObserver and
  a CSS keyframe on `stroke-dashoffset`.
- **Cost:** ~2–3 KB hand-rolled, 0 KB additional if `motion` is already taken.
- **A11y:** decorative SVG, `aria-hidden`; the relationship it depicts must also be in text.
- **RM:** yes — draw the static path.
- **See §4** — this is one of the strongest subject-specific effects available.

---

### 2.3 Layout and structure

#### Bento grid
- **What:** an asymmetric grid of unequal tiles. Currently the defining layout idiom of
  technical-product sites, and the right container for Splita / Queralt / Snorkel / NYU,
  because it lets you *size by importance*.
- **Where:** Magic UI *Bento Grid* (magicui.design/docs/components/bento-grid);
  every registry has one.
- **Implementation:** `display: grid; grid-template-columns: repeat(6, 1fr)` with explicit
  `grid-column: span N` per tile and a mobile collapse to one column. That is genuinely all it is.
- **Cost:** **0 KB JS.**
- **A11y:** **DOM order must equal reading order.** Do not reorder visually with
  `grid-auto-flow: dense` or negative `order` — that decouples tab order from visual order
  and is a real WCAG 1.3.2 / 2.4.3 failure. Each tile should be one landmark or heading-led block.
- **RM:** static layout; nothing to reduce.
- **Risk:** see traps (§5) — bento is *correct* here but must not be the only idea.

#### Sticky-scroll reveal
- **What:** a pinned left column whose content swaps as a right column scrolls (or vice versa).
  Ideal for the three-role narrative: pin the role title, scroll the detail.
- **Where:** Aceternity *Sticky Scroll Reveal* (ui.aceternity.com/components/sticky-scroll-reveal).
- **Implementation:** `position: sticky; top: 20vh` on the pinned column, plus an
  IntersectionObserver with a narrow `rootMargin` band to swap active content — **the
  existing `Reveal.tsx` observer pattern already covers most of this.**
  A pure-CSS variant using `animation-timeline: view()` works in Chrome 115+/Safari 26+ but
  must be `@supports`-gated with a fully readable non-animated fallback.
- **Cost:** **0 KB** reusing the existing observer.
- **A11y:** all content must be present and readable without the scroll interaction —
  never gate text behind scroll position. Sticky elements must not cover focused elements;
  verify keyboard tabbing through the section does not scroll focus under the pinned column.
- **RM:** yes — drop to a plain stacked layout. This is the effect most likely to be
  implemented as reduced-motion-hostile, so build the stacked version *first*.

#### Marquee / infinite credential rail
- **What:** a slow horizontal band: NYU · Splita · Queralt · Snorkel AI · FIDO2 · PKI · Entra ID.
  Compresses the credential list into one scannable gesture — directly serves the 90-second brief.
- **Where:** Magic UI *Marquee* (magicui.design/docs/components/marquee) — pure CSS, no `motion`.
- **Implementation:** duplicate the track, `animation: scroll 40s linear infinite` on
  `translateX(-50%)`, `overflow: hidden` on the parent, edge `mask-image` fade.
- **Cost:** **0 KB JS.** Duplicated DOM only.
- **A11y:** mark the duplicate copy `aria-hidden="true"` so screen readers read the list once.
  **WCAG 2.2 SC 2.2.2 (Pause, Stop, Hide) applies to any motion lasting over 5 seconds** —
  an infinite marquee does. Either pause on hover *and* on focus-within, or provide a control.
  Safest: pause on hover/focus **and** honour reduced motion.
- **RM:** yes — become a static wrapped flex list. Mandatory, not optional.

#### Floating / condensing navbar
- **What:** header that shrinks, gains a backdrop blur, or detaches into a floating pill on scroll.
- **Where:** Aceternity *Floating Navbar*, *Resizable Navbar*; Magic UI *Dock*.
- **Implementation:** one scroll listener (throttled via `requestAnimationFrame`) toggling a
  class, plus CSS transitions. Or a sentinel + IntersectionObserver, which is cheaper.
- **Cost:** ~0.5 KB.
- **A11y:** must remain reachable and operable at every scroll position; skip-link must still
  land correctly (`SkipLink.tsx` already exists — re-test against the floating variant).
- **RM:** yes — snap between states instead of transitioning.

---

### 2.4 Text effects

#### Scramble / decrypt text
- **What:** characters cycle through random glyphs before resolving to the real string.
  **The single most on-theme effect for this specific person** (§4) — it is literally a
  decryption animation on a cryptography engineer's site.
- **Where:** Aceternity *Encrypted Text*; React Bits *Decrypted Text*; countless Codrops
  variants. The canonical implementation is ~40 lines of vanilla JS.
- **Implementation:** hold the final string in the DOM as real text. On reveal, run a RAF
  loop that renders a progressively-resolving scrambled version into an `aria-hidden`
  span layered over it, then remove the overlay. **Do not mutate the accessible text node.**
- **Cost:** **~1 KB hand-rolled, 0 new deps.** Do not import a library for this.
- **A11y:** the real string must be the DOM text from first paint, so screen readers and
  no-JS users see the correct content. The scramble is a decorative overlay. Never scramble
  a heading that is also the accessible name of a landmark.
- **RM:** yes — skip the animation, render the final string. One `if` statement.
- **Verdict: take this one.** High identity, near-zero cost, trivially accessible.

#### Per-character / per-line stagger reveal
- **What:** headline lines or characters rising and fading in sequence.
- **Where:** GSAP *SplitText* (gsap.com — free for commercial use since April 2025);
  motion-primitives *TextEffect*; Aceternity *Text Generate Effect*.
- **Implementation:** the hard part is splitting text correctly — line-splitting that
  survives resize, wrapping and non-Latin scripts is genuinely difficult, which is what
  SplitText sells. A word-level split is easy to hand-roll; a **line**-level split is not.
- **Cost:** hand-rolled word split **0 KB**; GSAP core + SplitText **~30 KB**;
  `motion` + a stagger variant **~6 KB via LazyMotion**.
- **A11y:** splitting a heading into per-character spans **destroys it for screen readers**
  unless you either (a) keep the original text in an `aria-label`/visually-hidden copy and
  mark the split spans `aria-hidden`, or (b) use `SplitText`'s `aria: 'auto'` handling.
  This is the most commonly botched accessibility detail in the entire animated-UI ecosystem.
- **RM:** yes — render the text plainly.
- **Verdict:** do a word-level stagger by hand for 0 KB. Only buy GSAP if a line-level
  split on a specific headline proves visibly necessary.

#### Animated gradient text
- **What:** a gold gradient sweeping through a headline.
- **Where:** Magic UI *Animated Gradient Text*, *Aurora Text*.
- **Implementation:** `background: linear-gradient(...); background-clip: text; color: transparent`
  with an animated `background-position`, or `@property`-driven angle.
- **Cost:** **0 KB JS.**
- **A11y:** **contrast must be measured at the lightest point of the gradient**, not the
  darkest. This is where gradient text usually fails AA. Also ensure a `color` fallback is
  declared before `transparent` for any engine that drops `background-clip: text`.
  Forced-colors mode: supply a `@media (forced-colors: active)` override restoring flat colour.
- **RM:** yes — freeze the gradient position.

#### Number ticker
- **What:** "$200K", "100", "4" counting up on reveal.
- **Where:** Magic UI *Number Ticker*; the pure-CSS odometer technique
  (frontendmasters.com/blog/the-odometer-effect-in-css/).
- **Implementation, two options:**
  - **JS (recommended):** the real value is in the DOM; a RAF loop with an eased
    interpolation writes to an `aria-hidden` visual layer; the accessible value never changes.
    ~0.5 KB.
  - **Pure CSS via `@property --num` + `counter-reset` + `content: counter(num)`:** 0 KB JS,
    but the value lives in **generated content**, which is not reliably exposed to assistive
    tech, is not selectable, and is not copyable. Use only with a visually-hidden real value
    alongside. Also weakest browser support of the CSS tricks here.
- **Cost:** ~0.5 KB JS, or 0 KB with the accessibility caveat above.
- **A11y:** the final value must be real, selectable DOM text. Never announce intermediate
  values — `aria-live` on a ticker is an accessibility disaster.
- **RM:** yes — render the final number immediately.

---

### 2.5 Interaction and cursor

#### Spotlight / cursor-follow card glow
- **What:** a radial gold highlight tracking the pointer across a card surface, as if the
  cursor carries a light. Turns flat dark cards into lit objects. Very high perceived quality.
- **Where:** Aceternity *Card Spotlight*; Magic UI *Magic Card*; 21st.dev has several.
- **Implementation:** one `pointermove` listener per card (or one delegated listener on the
  grid) writing `--mx` / `--my` as CSS custom properties; a `::before` paints
  `radial-gradient(400px circle at var(--mx) var(--my), color-mix(in oklab, var(--accent) 12%, transparent), transparent 60%)`
  and fades in on hover. **Write the vars with `el.style.setProperty` inside a RAF — never
  per-event** — and never trigger layout from the handler.
- **Cost:** **~15 lines of JS, <0.5 KB.** No library. Magic UI's `motion`-based version buys
  nothing over this.
- **A11y:** pointer-only, therefore invisible to keyboard users — **pair it with a
  `:focus-visible` glow** so the keyboard path is equally lit. Purely decorative otherwise.
- **RM:** the glow position is a direct response to input, not an animation, so it is
  defensible under reduced motion; still, drop the fade transition and consider disabling
  entirely. Cheap either way.
- **Verdict: take this one.** Best quality-per-byte interaction effect available.

#### 3D card tilt
- **What:** cards rotating in perspective toward the pointer.
- **Where:** Aceternity *3D Card Effect*.
- **Implementation:** `perspective` on the container, `rotateX/rotateY` from pointer
  position, again via CSS vars.
- **Cost:** ~1 KB hand-rolled.
- **A11y:** can induce discomfort; must be disabled under reduced motion. Keep rotation
  under ~8deg — larger values read as a gimmick and tip into the trap category (§5).
- **RM:** yes — no transform.
- **Verdict:** borderline. Cheap, but widely used and easy to overdo. If taken, keep it
  *barely perceptible*.

#### Custom cursor
- **Cost:** ~1–2 KB. **Recommendation: do not.** See traps (§5).

#### Magnetic buttons
- **What:** buttons that drift slightly toward the cursor on approach.
- **Cost:** ~0.5 KB.
- **A11y:** the hit target moves away from where the user aimed — a Fitts's-law regression and
  a genuine motor-accessibility problem. If used at all, cap displacement at ~4px and never
  apply it to the primary contact CTA.
- **RM:** yes — disable entirely.
- **Verdict:** skip. Low payoff, real cost to usability.

---

### 2.6 Surface and material

#### Texture cards (Cult UI)
- **What:** multi-layer nested borders and subtle inner highlights producing a machined,
  tactile surface — closer to hardware industrial design than to web cards.
- **Where:** cult-ui.com/docs/components/texture-card.
- **Implementation:** nested divs with staged `border-radius` and `border-color`, plus an
  inner `box-shadow: inset 0 1px 0 rgb(255 255 255 / .06)` top highlight. Pure CSS.
- **Cost:** **0 KB JS.**
- **A11y / RM:** static; nothing to reduce.
- **Verdict:** strong fit for the "expensive and engineered" mandate, and free.

#### Layered glass / backdrop blur
- **What:** `backdrop-filter: blur(12px) saturate(1.2)` on the header and any floating panel.
- **Cost:** 0 KB JS. GPU cost is real on large surfaces; keep to small fixed elements.
- **A11y:** contrast over a blurred backdrop is variable by definition — set a semi-opaque
  background colour underneath so the worst case still clears AA. Provide a
  `@supports not (backdrop-filter: blur(1px))` opaque fallback.
- **RM:** static.

#### Inner top-edge highlight ("light from above")
- **What:** a 1px `rgb(255 255 255 / .07)` inset highlight on the top edge of every raised
  surface. Almost invisible individually; collectively it is most of what makes a dark UI
  look professionally lit rather than flat-grey.
- **Cost:** **0 KB.** One line in the design system.
- **Verdict:** free, systemic, and the highest-leverage single change for a dark theme.

---

## 3. Shortlist — ranked for this site

Ranked by *(impact on the "expensive and engineered" verdict) ÷ (cost + accessibility risk)*.
Cumulative new JS if all twelve are taken: **≈ 4 KB**, or **≈ 10 KB** including the shader
wrapper. That leaves the relaxed budget almost entirely unspent — which is the point.

| # | Effect | New JS | Why it wins here | RM story |
| --- | --- | --- | --- | --- |
| **1** | **Fix the `ogl` shader centrepiece + add a shader/aurora hero background** | **~0 KB** (`ogl` installed) | Directly fixes the 1.44:1 invisible-centrepiece defect *and* supplies the single most striking surface on the site. The runtime is already paid for. Highest ceiling, lowest marginal cost. | Render one frame, stop the loop |
| **2** | **Grain / noise overlay, sitewide** | **0 KB** | Converts flat CSS gradients into material. The largest perceptual jump per byte in this document. Nothing to break. | Static by construction |
| **3** | **Inner top-edge highlight + refined elevation on every raised surface** | **0 KB** | Systemic. Fixes "flat" at the token layer rather than per-component. | N/A |
| **4** | **CSS `@property` animated gold border beam on the primary cards** | **0 KB** | Reads as instrumentation, not decoration. Gold on near-black is exactly the palette it flatters. Firefox <128 degrades to a static gradient. | `animation: none` |
| **5** | **Cursor-follow spotlight on cards (+ matching `:focus-visible` glow)** | **<0.5 KB** | Makes dark surfaces feel lit and responsive. Highest interaction quality per byte. | Drop the transition |
| **6** | **Bento grid for Splita / Queralt / Snorkel / NYU** | **0 KB** | Lets you size tiles by importance — serves the 90-second scan directly. | Static layout |
| **7** | **Text scramble/decrypt on the hero headline** | **~1 KB** | The most identity-specific effect available to a cryptography engineer. See §4. | Render final string |
| **8** | **Animated beam architecture diagram (browser → authenticator → RP)** | **~2 KB** | Turns "FIDO2, PKI, Entra ID" from a keyword list into a thing you can *see him having built*. | Static path |
| 9 | Sticky-scroll reveal for the three-role narrative | 0 KB (reuse `Reveal.tsx` observer) | Gives the CV section a spine | Stacked layout |
| 10 | Credential marquee (NYU · Snorkel · Queralt · FIDO2 · PKI) | 0 KB | Compresses credentials into one gesture | Static wrapped list |
| 11 | Cult UI texture cards / machined surfaces | 0 KB | "Expensive" in the literal material sense | Static |
| 12 | Word-level stagger on section headings (hand-rolled, not SplitText) | ~0.5 KB | Cheap polish; avoid the 30 KB GSAP path unless line-splitting proves necessary | Plain text |

**If a runtime is bought anyway**, buy `motion` via `LazyMotion` + `m` + `domAnimation`
(~6 KB initial) and spend it on **exit animations and shared-layout transitions** — the two
things CSS genuinely cannot do. Do not buy it for staggers, fades, or hover states; those are
all in the free tier above. GSAP is only worth ~30 KB if line-level `SplitText` becomes a
hard requirement.

---

## 4. Effects that suit a security / cryptography / payments engineer

The site should feel like it was *engineered*, not *decorated*. The distinction a hiring
manager registers in the first three seconds is whether the visual language is **arbitrary
prettiness** or **a representation of something real**. Every item here is a visual that
encodes actual subject matter:

- **Scramble / decrypt text.** A literal decryption animation on the site of someone who does
  browser-native authentication R&D. Cheap (~1 KB), trivially accessible, and *earned* —
  it is the one place where a common effect is not a cliché because the subject matter
  justifies it. Use it once, on the hero. Using it everywhere destroys the point.
- **Animated beam / connection diagram.** Draw the FIDO2 ceremony: browser → authenticator →
  relying party, with a token travelling the path. This is the highest-value single visual on
  the site for a hiring manager, because it demonstrates that he can *explain* the protocol,
  not just name it. ~2 KB.
- **Dot-grid / blueprint background.** Schematic, coordinate space, engineering drawing.
  0 KB. Signals "systems" without saying it.
- **Monospace as a structural voice, not an ornament.** Metadata, key fragments, hashes,
  commit SHAs, timestamps, protocol names set in mono against a serif/sans headline. Free,
  and it is what actually separates engineer-portfolios from designer-portfolios.
- **Terminal / code-block component with a typed sequence.** Magic UI *Terminal*. Justified
  *only* if it shows something real — an actual WebAuthn `navigator.credentials.create()`
  call, a real attestation object, a real Splita ledger entry. A fake terminal typing
  marketing copy is the worst thing on this list.
- **Border beam as instrumentation.** Reframe the gold sweep as a status indicator on a
  card rather than as decoration — it then reads as an active system, which is the register
  you want.
- **Number ticker on `$200K` / verified metrics.** Concrete, checkable numbers. The animation
  is only worth it because the numbers are worth reading.
- **Ledger / transaction-strip motif for Splita.** A monospace row of commitments settling —
  "commit-first group payments" made legible as an image. Bespoke, 0 KB, and no other
  portfolio will have it.

**The principle:** on this site, an effect earns its place by being *about something*.
A gold beam that means "active" is engineering. A gold beam that means "ooh, shiny" is a
template. The same 40 lines of CSS; entirely different impression on the person reading it.

---

## 5. Traps — what to avoid, and why it matters more now

The relaxed budget **increases** this risk rather than decreasing it. The failure mode of a
constrained build is flatness; the failure mode of an unconstrained build is a site that
looks like every other AI-assisted Aceternity landing page. A hiring manager who has reviewed
forty portfolios this month recognises the second failure instantly, and it reads worse than
the first, because it signals *taste* rather than *resources*.

| Trap | Why it's a trap |
| --- | --- |
| **Aceternity hero stack, unmodified** | Aurora Background + Spotlight + Text Generate Effect + Floating Navbar, in their default colours, is *the* recognisable AI-portfolio signature of this era. Every one of those components is fine in isolation. Taken together, in defaults, they say "generated." **Take the technique, not the file. Re-tokenise everything to gold.** |
| **Framer Motion / `motion` at full weight** | Already removed once from this repo for costing 29.5 KB and animating nothing. Re-adding the full import to get a fade-in is the same mistake with a bigger budget. If taken, `LazyMotion` + `m` only. |
| **three.js / react-three-fiber** | 150 KB+ for capabilities `ogl` (already installed, 7 KB) provides. Would consume the entire headroom and jeopardise the >90 Lighthouse floor. |
| **Custom cursor** | Breaks the OS cursor contract, hides text-selection and pointer affordances, is meaningless on touch, invisible to keyboard users, and is the single loudest "portfolio template" signal available. High perceived-effort, negative perceived-competence with this audience. **Skip.** |
| **Infinite marquee with no pause** | WCAG 2.2 SC 2.2.2 requires a pause/stop/hide mechanism for motion running over 5 seconds. An un-pausable marquee is an outright AA failure — not a judgement call. |
| **Per-character text splitting without an accessible copy** | Splitting a heading into `<span>` per character can make screen readers announce it letter by letter, or announce nothing coherent. The most commonly shipped accessibility bug in the entire animated-component ecosystem. |
| **Gradient text measured at its darkest point** | Contrast must clear AA at the *lightest* stop. Gold gradient text on dark is exactly where this fails silently. |
| **Sparkles / meteors / confetti / particle fields** | Expensive (continuous RAF), semantically empty, and strongly associated with template landing pages. They say "marketing site." This is a résumé. |
| **Scroll-jacking and pinned full-viewport sections** | Breaks find-in-page, breaks keyboard scrolling, breaks the back button's scroll restoration, and costs the reader time — fatal against a 90-second budget. `lenis` smoothing is already at the acceptable edge of this; do not go further. |
| **Scroll-driven CSS as a hard dependency** | `animation-timeline` needs Safari 26 / Firefox 158. ~13% of users get nothing. Fine as enhancement; fatal if content visibility depends on it. Always `@supports`-gate with a readable default. |
| **Bento grid as the only idea** | Bento is correct for this content, but a page that is *exclusively* bento reads as 2024 template. Use it for one section, not as the page's whole structure. |
| **Animating `filter`, `box-shadow` or gradient stops per frame** | These trigger paint on every frame. A large blurred surface animated this way will cost Lighthouse points on mid-tier hardware even though it looks free on a dev machine. Animate `transform` and `opacity`; animate registered `@property` angles, which the compositor handles. |
| **Reduced motion as an afterthought** | Every item in §3 has a one-line degradation path. Build the reduced state *first* and layer motion on top — the inverse order is how sites end up with a `prefers-reduced-motion` block that silently misses half the animations. |
| **Overusing the one good idea** | Scramble text on the hero is memorable. Scramble text on every heading is a gimmick. Applies equally to the beam, the spotlight and the shader. **Pick one signature effect and let it be singular.** |

---

## 6. Recommended implementation order

1. **Token layer first, 0 KB.** Inner top-edge highlights, refined elevation, gold glow
   tokens derived with `color-mix()`, grain overlay. This alone will move the site a long
   way off "flat" before a single component changes.
2. **Fix the shader centrepiece.** Contrast was the defect, not the concept. Same `ogl`
   dependency, visible output, plus a scrim that guarantees AA for anything layered over it.
3. **Structure.** Bento section for the three roles; sticky-scroll spine reusing the existing
   `Reveal.tsx` observer.
4. **Signature effect, exactly one.** Scramble hero headline *or* the FIDO2 beam diagram.
   Both if they occupy different sections and neither repeats.
5. **Surface polish.** Border beam, cursor spotlight with matching focus glow, texture cards.
6. **Only then** consider whether anything still unbuilt genuinely needs `motion` or GSAP.
   The honest answer is likely "no," and the site being ambitious at ~125 KB rather than
   ~199 KB is itself a credential with this audience.

**Accessibility gate before each step ships:** keyboard path equals pointer path (every
hover effect has a `:focus-visible` twin); reduced-motion state built before the motion
state; contrast re-measured against every new background layer; core content readable with
JS disabled; no motion over 5s without a pause affordance.

---

## Sources

- [21st.dev](https://21st.dev) · [serafimcloud/21st](https://github.com/serafimcloud/21st)
- [shadcn/ui CLI](https://ui.shadcn.com/docs/cli) · [Registry directory](https://ui.shadcn.com/docs/directory)
- [Aceternity UI components](https://ui.aceternity.com/components) · [licence](https://ui.aceternity.com/licence)
- [Magic UI](https://magicui.design/docs/components/marquee) · [magicuidesign/magicui](https://github.com/magicuidesign/magicui)
- [React Bits](https://reactbits.dev) · [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) · [licence discussion](https://www.pkgpulse.com/guides/react-bits-animated-components-2026)
- [motion-primitives](https://github.com/ibelick/motion-primitives)
- [Cult UI](https://www.cult-ui.com/docs/installation) · [nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui)
- [Motion — LazyMotion](https://motion.dev/docs/react-lazy-motion) · [reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size)
- [Webflow: GSAP becomes free](https://webflow.com/blog/gsap-becomes-free) · [CSS-Tricks: GSAP is now completely free](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/) · [GSAP 3.13 release](https://gsap.com/blog/3-13/)
- [oframe/ogl](https://github.com/oframe/ogl)
- [MDN: CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) · [caniuse: animation-timeline](https://caniuse.com/mdn-css_properties_animation-timeline)
- [Animated CSS gradient borders](https://codetv.dev/blog/animated-css-gradient-border) · [theosoti.com](https://theosoti.com/blog/animated-gradient-borders/)
- [Codrops: feTurbulence texture](https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/) · [Frontend Masters: Grainy gradients](https://frontendmasters.com/blog/grainy-gradients/) · [gggrain generator](https://www.fffuel.co/gggrain/)
- [Frontend Masters: The odometer effect without JavaScript](https://frontendmasters.com/blog/the-odometer-effect-in-css/) · [CSS-Tricks: Animating number counters](https://css-tricks.com/animating-number-counters/)
- [Josh Comeau: Scroll-driven animations](https://www.joshwcomeau.com/animation/scroll-driven-animations/)
