# 02 — 3D & Motion Stack Research

**Phase:** Tech research (the only phase permitted to override the proposed stack)
**Date:** 2026-09-11
**Author:** tech-research agent
**Status:** Decided. Two overrides, both quantitative.

---

## 0. TL;DR

| | Brief proposed | Decision | Reason |
|---|---|---|---|
| 3D | React Three Fiber + drei | **OGL** (`ogl@1.0.11`) | **OVERRIDE.** R3F + three measures **239.5 KB gz**; +drei **245.7 KB gz**. OGL does the same hero in **16.9 KB gz**. 14.5× difference. |
| Scroll choreography | GSAP ScrollTrigger | **Framer Motion `useScroll`/`useTransform` + IntersectionObserver/CSS** | **OVERRIDE.** ScrollTrigger is **+45.1 KB gz** of new dependency against **~31 KB** of measured headroom. Framer Motion is already resident — marginal cost ≈ 0 KB. |
| Component transitions | Framer Motion | **Framer Motion, via `LazyMotion` + `m`** | Confirmed, with a change: `LazyMotion`+`domAnimation` measures **29.2 KB gz** vs **42.9 KB gz** for the `motion` component. Frees **13.7 KB**. |
| Smooth scroll | Lenis | **Lenis, kept** | 4.1 KB gz, already installed, and it does the mobile address-bar scroll normalization we'd otherwise want ScrollTrigger for. |

Everything below is measured, not quoted.

---

## 1. Methodology — how these numbers were produced

Bundlephobia was not trusted for any headline number. Bundlephobia measures a **barrel import** of the whole package, which for `@react-three/drei` is wildly unrepresentative (778.7 KB gz — see §3.1). Instead:

1. Installed the exact current versions into a scratch workspace.
2. Wrote realistic entry files — the actual import sets a hero scene would use, not `import * as X`.
3. Bundled each with `esbuild --bundle --minify --format=esm --target=es2020`, externalizing `react`/`react-dom` (already in the app) so each number is **marginal cost over the existing app**.
4. Measured `gzip -9` and `brotli -q 11` on the output.

Versions measured (latest as of 2026-09-11): `three@0.186.0`, `@react-three/fiber@9.7.0`, `@react-three/drei@10.7.8`, `gsap@3.15.0`, `ogl@1.0.11`, `twgl.js@7.0.0`, `framer-motion@12.38.0` (repo pin), `lenis@1.1.20`, `lucide-react@0.511.0`.

**Baseline:** `next build` was run against the repo as it stands (Next 15.2.8, React 19, Tailwind 4). Next reports First Load JS gzipped:

```
Route (app)                    Size     First Load JS
┌ ○ /                          65.4 kB  169 kB
└ ○ /_not-found                977 B    101 kB
+ First Load JS shared by all           101 kB
```

**This is the single most important number in this document. The site already ships 169 KB gz of first-load JS with zero 3D on the page.** Against a 200 KB budget that is ~31 KB of headroom. Any 3D stack that lands in the initial bundle fails before it renders a pixel.

---

## 2. The constraint to verify: is R3F + drei really 150–180 KB?

**No. It is worse.** The brief's figure is understated by 35–60%.

| Import set | raw min | **gzip** | brotli |
|---|---|---|---|
| `import * as THREE from 'three'` | 728.0 KB | **186.6 KB** | 152.8 KB |
| `three`, tree-shaken (renderer, scene, camera, mesh, plane, shader material, vectors) | 518.8 KB | **130.6 KB** | 107.9 KB |
| `three`, **`WebGLRenderer` alone** | 516.9 KB | **130.0 KB** | 107.9 KB |
| `@react-three/fiber` alone (three externalized) | 163.2 KB | **52.5 KB** | — |
| `@react-three/fiber` + `three` (realistic hero) | 892.7 KB | **239.5 KB** | 198.7 KB |
| `@react-three/fiber` + `three` + 5 drei helpers | 913.2 KB | **245.7 KB** | 203.8 KB |
| `import * as drei from '@react-three/drei'` (barrel) | 2588.3 KB | **778.7 KB** | 637.6 KB |

Three findings that matter:

1. **Three.js has a ~130 KB gz floor and tree-shaking cannot move it.** Importing *only* `WebGLRenderer` costs 130.0 KB gz; adding a scene, camera, mesh, geometry, material and math types costs 130.6 KB — **0.6 KB more**. The renderer transitively pulls in nearly the entire library (all material types, all the shader chunk registry, the full uniform/texture machinery). This is corroborated externally: a minimal renderer+camera+empty-scene ESM build benchmarks at ~121 KB gz. You do not get a "small three.js." You get three.js.
2. **R3F's own reconciler is a real 52.5 KB gz on top of that.** It is not a thin wrapper.
3. **drei is fine *if* tree-shaken and catastrophic if not.** `shaderMaterial` alone is 805 **bytes** gz. The barrel is 778.7 KB gz. Many drei entry points have module side effects, so this is an easy foot-gun for a build agent — one `import { X } from '@react-three/drei'` that the bundler can't prove side-effect-free and the chunk explodes. If R3F were chosen, `optimizePackageImports` and per-path imports would be mandatory, not optional.

**Verdict on the constraint as written:** "must be dynamically imported below the fold or the approach fails" is correct in direction but generous in degree. Even dynamically imported, 245.7 KB gz is a second payload larger than the entire rest of the site, and on a mid-tier Android it is ~0.6–1.0s of parse/compile on the main thread after download. The question is not whether to defer it. The question is whether to pay it at all.

---

## 3. 3D options, scored against every budget

Legend: ✅ meets · ⚠️ meets with work · ❌ fails

| | **1. R3F + drei** | **2. three.js direct** | **3. OGL / twgl** | **4. CSS 3D / 2D canvas** | **5. Scrubbed image sequence** |
|---|---|---|---|---|---|
| **Measured gz cost** | **245.7 KB** | **130.6 KB** | **OGL 16.9 KB** (scene+post) / 14.3 (scene) / 12.7 (shader quad); twgl 24.8 KB | **0 KB** | **0 KB JS**, but 60–180 **images** |
| Source of number | esbuild + gzip -9, this repo's toolchain | same | same | n/a | n/a |
| **Initial JS < 200 KB** | ❌ 245.7 alone exceeds the whole budget; deferred it is a 2nd payload > the site | ⚠️ deferred only; still 130 KB second payload | ✅ deferred chunk ~23 KB total | ✅ | ✅ JS-wise |
| **LCP < 2.0s (4G)** | ⚠️ only if strictly post-LCP and poster-first | ⚠️ same | ✅ chunk is smaller than one hero photo | ✅ | ❌ **primary risk** — 4–15 MB of frames on 4G; needs aggressive preload or LCP collapses |
| **CLS < 0.05** | ✅ with reserved aspect box | ✅ same | ✅ same | ✅ | ⚠️ poster→frame swap must be pixel-identical |
| **60fps M1** | ✅ | ✅ | ✅ | ✅ | ⚠️ decode-bound, not GPU-bound; scrub jank on fast flicks |
| **Mid-tier Android** | ⚠️ parse/compile cost before first frame; drei defaults (shadows, tone mapping) are heavy | ⚠️ same, minus drei | ✅ thin abstraction, one program, one draw call; DPR cap trivially enforced | ✅ CSS 3D is compositor-only; 2D canvas is CPU-bound and the weaker of the two | ❌ memory pressure from decoded frames is the classic mid-Android failure mode |
| **SSR / App Router** | ❌ hard fail on server (`window`/`WebGLRenderingContext`); requires `ssr:false` inside a Client Component | ❌ same | ❌ same (but it's 12 lines in a `useEffect`, trivially guarded) | ✅ renders server-side | ✅ renders server-side |
| **JS disabled** | ❌ nothing renders | ❌ nothing | ❌ nothing | ✅ CSS 3D works with JS off; 2D canvas does not | ✅ first frame is an `<img>` |
| **prefers-reduced-motion** | ✅ skip mount | ✅ skip mount | ✅ skip mount — and because the module is dynamic, reduced-motion users download **0 KB** of it | ✅ | ✅ pin to frame 0 |
| **License** | MIT | MIT | **OGL: Unlicense (public domain)** · twgl: MIT | n/a | n/a |
| **Maintenance risk** | Low — pmndrs, published 2026-09-08 | Low — published 2026-09-08 | **Medium** — OGL last published 2025-01-27 (~20mo). Mitigated: zero deps, ~4k LOC, pinnable, vendorable | None | None |
| **"Looks deliberate and expensive"** | ✅ | ✅ | ✅ — the visual ceiling is set by the shader, not the library | ⚠️ CSS 3D reads as a card flip, not as engineering | ✅ highest polish ceiling, lowest engineering signal |
| **Proves engineering capability** | ⚠️ R3F is the default answer; recruiters have seen it | ✅ | ✅ hand-written GLSL is the strongest signal here | ❌ | ❌ **it's a video.** For an audience judging engineering, a scrubbed sprite sequence proves art direction, not capability |

### Notes per option

**1. R3F + drei.** The right call for an app with many scenes, loaded glTF assets, PBR lighting, orbit controls, physics. This site has *one* scene with *one* draw call. We'd pay 245.7 KB for a reconciler and an ecosystem we would use ~2% of. Rejected on cost/benefit, not on quality.

**2. three.js direct.** Halves the cost to 130.6 KB and keeps glTF/PBR reachable. Still a 130 KB second payload for a fullscreen quad. Rejected — but this is the **designated escape hatch**: if design later demands a lit, textured, loaded 3D model, migrate to bare three.js, not to R3F.

**3. OGL.** 16.9 KB gz for a scene with camera, transforms, geometry, instancing, render targets and post-processing. 12.7 KB for a fullscreen shader quad. Zero dependencies, ES modules, WebGL2. The API is deliberately three-shaped (`Renderer`/`Camera`/`Transform`/`Mesh`/`Program`/`Geometry`), so the mental model and most three tutorials port over. **Unlicense** — public domain, the cleanest license in the comparison. twgl (24.8 KB, MIT, published 2025-07) is the runner-up and a drop-in-ish escape if OGL goes fully unmaintained; it's a lower-level helper layer rather than a scene graph.

**4. CSS 3D / 2D canvas.** Genuinely the best score on every performance and resilience budget. Rejected on the brief's actual requirement: the hero must prove engineering capability in under 90 seconds. A CSS `rotate3d` card does not. Kept in the stack for a *different* job — see §7, these are what the non-hero motion is built from.

**5. Scrubbed image sequence.** The Apple AirPods technique. Highest visual ceiling, and the only option that's fully JS-disabled-native. Two disqualifiers: (a) the payload is 4–15 MB of frames, which is a far worse budget violation than 245 KB of JS and directly attacks the LCP/4G budget the whole exercise is scored on; (b) **for this specific audience it inverts the signal** — a hiring manager who recognizes the technique concludes "he rendered this in Blender," not "he can build this." Rejected. Note that its core idea survives: our fallback poster is exactly frame 0 of this approach.

---

## 4. Scroll motion options, scored

| | **1. GSAP ScrollTrigger** | **2. Framer Motion `useScroll`** | **3. CSS `animation-timeline`** | **4. IntersectionObserver + CSS** |
|---|---|---|---|---|
| **Measured gz** | core 27.6 + ScrollTrigger 18.2 = **45.1 KB** | **~0 KB marginal** (9.0 KB standalone, already resident inside the 42.9 KB of `framer-motion` the site ships today) | **0 KB** | **0 KB** |
| **Fits 31 KB headroom** | ❌ | ✅ | ✅ | ✅ |
| SSR / App Router | ⚠️ client-only, needs `useLayoutEffect` guard + `gsap.registerPlugin` in an effect | ✅ designed for it; hooks are client-only but the markup SSRs | ✅ pure CSS, SSRs perfectly | ✅ |
| JS disabled | ❌ elements stay in their initial (often hidden) state | ❌ same | ✅ **animations still run** | ⚠️ needs a `no-js` CSS guard so content isn't left at `opacity:0` |
| Mobile GPU | ✅ excellent; best-in-class scroll normalization | ✅ good; `useTransform` on transform/opacity stays on the compositor | ✅ **best** — runs off the main thread (Safari 26.4+ threaded) | ✅ |
| reduced-motion | ⚠️ manual — you must branch yourself | ✅ `useReducedMotion()` built in | ✅ plain `@media` query | ✅ plain `@media` query |
| Browser support | universal | universal | **87.2% global.** Chrome/Edge 115+, Safari 26.0+, **Firefox 158+**. Needs `@supports (animation-timeline: scroll())` | universal |
| License | Free for commercial use incl. all plugins (see below) | MIT | n/a | n/a |
| Maintenance | Webflow-owned, published 2026-04-13 | active | web standard | web standard |

### GSAP licensing — confirmed current terms

Webflow acquired GreenSock in late 2024 and made the **entire** toolset free in April 2025. Confirmed against `gsap.com/standard-license`:

- Commercial use: **free**, no fee, no club tier.
- **ScrollTrigger, SplitText, MorphSVG, DrawSVG and every formerly members-only plugin are included at no charge.** There is no Business Green tier anymore.
- The one restriction: you may not use GSAP inside a product that lets *end users* build visual animations without code (i.e. a Webflow competitor). Irrelevant to a personal site.
- npm reports the license field as the custom "Standard 'no charge' license" string rather than an SPDX identifier. Worth knowing if a future employer's license-scanner flags it, but it is not a blocker.

**So GSAP is not rejected on license. It is rejected on 45.1 KB.**

### Why override GSAP specifically

The measured headroom is ~31 KB. ScrollTrigger is 45.1 KB. The two ways out both fail:

- Put GSAP in the initial bundle → 214 KB first-load, budget blown, Lighthouse performance drops before a single animation runs.
- Defer GSAP → but the choreography it's for is section reveals that start **above** the fold, so a deferred ScrollTrigger either fires late (visible pop-in, and a CLS risk) or we gate content on a 45 KB download. Deferring the thing that animates the top of the page defeats the point of having it.

Against that, `useScroll`/`useTransform` cost **nothing marginal** — the site already ships the Framer Motion runtime and already imports `useScroll`/`useTransform` in `HeroSection.tsx`, `timeline.tsx` and `ExperienceTimeline.tsx`. The capability is paid for.

**What we give up by dropping ScrollTrigger** (stated plainly):
- The pin/scrub/snap engine. We hand-roll pinning with `position: sticky` and derive progress from `useScroll({ offset: [...] })`. This is genuinely more code and more edge cases.
- `SplitText`, `MorphSVG`, `DrawSVG`, `Flip`. If a later phase wants per-character text reveals, that's `SplitText`'s job and we'll be re-implementing a worse version with `Intl.Segmenter` + spans.
- ScrollTrigger's very good cross-browser scroll-position normalization, especially iOS address-bar resize. **Partially recovered for free:** Lenis 1.1 is already installed and already normalizes scroll; it was doing this job before GSAP was proposed.

If a future phase hits a wall on pinning, the correct response is to reopen this decision with a measurement — not to add GSAP quietly.

---

## 5. THE CHOSEN STACK

```
3D            OGL 1.0.11          — hand-written GLSL, one program, one draw call
Scroll        Framer Motion useScroll/useTransform  (already resident)
              + IntersectionObserver → CSS transitions for reveals
              + CSS animation-timeline as progressive enhancement behind @supports
Transitions   Framer Motion via LazyMotion + `m`   (not the `motion` component)
Smooth scroll Lenis 1.1.20        (kept, disabled under prefers-reduced-motion)
NOT adopted   @react-three/fiber, @react-three/drei, three, gsap
```

One new production dependency: `ogl`. That is the entire delta.

### Tradeoffs — what we are giving up

| Given up | Consequence | Mitigation / escape hatch |
|---|---|---|
| R3F's declarative scene graph | The hero is imperative WebGL inside a `useEffect`. Manual `dispose()`, manual resize observer, manual rAF teardown. More care required. | It is ~150 lines for one scene. Codify the teardown once in `useOGLScene()` so build agents can't leak a context. |
| drei's ecosystem (`useGLTF`, `Environment`, `OrbitControls`, postprocessing) | We cannot cheaply load a lit glTF model or drop in a bloom pass. | The hero concept (§6) is deliberately chosen to need none of it. If design demands a loaded model later: migrate to **bare three.js (130.6 KB)**, not R3F. |
| A large copy-paste corpus | Fewer Stack Overflow answers for OGL than for R3F. | OGL's API is three-shaped; three concepts translate. OGL ships ~40 examples. |
| OGL's maintenance cadence | Last publish 2025-01-27, ~20 months stale. | Pin exact version. Zero dependencies means nothing can rot underneath it. ~4k LOC, Unlicense (public domain) — it can be vendored into `src/lib/gl/` outright with no attribution obligation if it's ever abandoned. twgl.js (MIT, 24.8 KB, published 2025-07) is the documented fallback. |
| GSAP ScrollTrigger's pin/scrub/snap and text plugins | See §4. | Lenis + `useScroll` + `position: sticky`. |
| Framer Motion's `motion` component (moving to `m`) | Every `<motion.div>` must become `<m.div>` inside a `<LazyMotion features={domAnimation}>` boundary, and layout animations (`layout`, `layoutId`) need `domMax` instead. | Mechanical refactor, 8 files. Worth 13.7 KB. |

---

## 6. The hero 3D moment

### Concept: **The Attestation**

> On load, the page generates a real ECDSA P-256 keypair in the browser via WebCrypto — the same curve WebAuthn passkeys use — signs a nonce, and uses the resulting 64-byte signature as the seed for the geometry you're looking at.

The visual: a point-field / lattice suspended in perspective. It begins as **unstructured entropy** — points scattered, drifting, incoherent, faintly noisy. As the visitor scrolls through the hero, the field **resolves**: points snap onto a coherent ordered surface, drift damps out, the structure locks. Underneath, a single monospace line of real data:

```
ES256 · sig 3045…a91c · verified 0.4ms
```

The bytes in that line are the bytes driving the vertex positions. It is not a decorative caption; it is a readout.

**Why this and not something decorative:**

- **It is literally his domain.** Browser-native auth R&D at Queralt is WebAuthn/passkey work. Cyera is security. Splita is payments — trust established between parties who haven't met. The hero is a live, in-browser cryptographic attestation. It is the one animation on the site that only *this* engineer would have made.
- **It reads in under 5 seconds** without being explained. Noise → order, with a signature underneath, is legible as "verification" to a technical audience instantly.
- **Every visitor sees a different structure**, because the nonce is fresh per load. A hiring manager who reloads discovers that — and that discovery is the proof. Nobody reloads a Blender render twice.
- **WebCrypto is a native browser API: 0 KB.** The entire cryptographic half of the concept is free.
- **It needs nothing from drei.** No loaded models, no PBR, no HDRI environment, no shadow maps. One instanced geometry, one shader program, one draw call — which is exactly why OGL's 16.9 KB is sufficient and 245.7 KB is not.
- **GPU cost is trivially bounded.** Instanced points with a vertex shader doing the noise→lattice lerp. Cap DPR at 1.5, cap instance count by `navigator.hardwareConcurrency`, one draw call per frame. No fragment-shader raymarching, which is where mid-tier Android GPUs actually die.

**Honesty check on the claim:** the signature seeds the geometry — it does not "encrypt" anything, and the copy must not imply it does. Overclaiming crypto to a security audience is the one way this backfires. Keep the readout factual: algorithm, truncated signature, verify time.

### The secondary 3D use

**Hold it.** The brief permits one, and the cheapest correct answer is to spend zero. If a later phase insists, the only sanctioned option is **reusing the already-loaded OGL module** for a low-intensity effect (e.g. a displacement ripple on project-card hover), which costs **0 additional KB** because the chunk is already in memory. A second *independent* WebGL context is forbidden — two live contexts is the reliable way to get context-loss on mid-tier Android.

### Fallback — one path, not three

There is exactly **one** fallback surface, and every failure mode lands on it:

**A static poster image, server-rendered, that is the hero's LCP element.**

- Generated at build time from a **fixed** signature (committed seed, so it's deterministic and reviewable), exported as AVIF with WebP fallback, ~25–40 KB.
- Rendered by the Server Component as `next/image` with `priority`, explicit `width`/`height`, inside a fixed `aspect-ratio` container.
- The `<figcaption>` readout renders server-side too, with the build-time signature. So the *concept* survives even when the animation doesn't.

It catches all four failure modes with one artifact:

| Failure mode | Result |
|---|---|
| **JavaScript disabled** | Poster + caption render. The page is complete and readable. |
| **WebGL unavailable / context creation fails / context lost** | Canvas never mounts (or unmounts on `webglcontextlost`); poster stays. |
| **`prefers-reduced-motion: reduce`** | Canvas chunk is **never downloaded**. Poster stays. Zero KB, zero motion. |
| **Save-Data / low-memory device** | Same gate, same poster. |

This is also the right call for Core Web Vitals: the **poster is the LCP element**, not the canvas. LCP is an image request, cacheable at the CDN edge, unaffected by whether WebGL ever initializes. The canvas fades in over it afterwards with `opacity` only — a compositor-only property, so **CLS contribution is exactly 0**.

> ⚠️ **Flag for the build phase — a real tension in the brief.** The brief says all 3D must be "dynamically imported, below the fold." The hero is by definition *above* the fold, so "below the fold" cannot literally apply to it. The enforceable version of that requirement is **"not in the critical path, and not before LCP."** We satisfy it by making the poster the LCP element and loading the WebGL chunk on idle *after* LCP settles. Build agents should treat "post-LCP, idle-gated" as the rule for the hero, and literal IntersectionObserver gating as the rule for anything else.

---

## 7. Bundle budget

All figures gzipped. "Initial" = counted in Next's First Load JS for `/`.

### Initial bundle

| Item | gz | Basis | Bucket |
|---|---:|---|---|
| Next 15.2.8 + React 19 shared runtime | 101.0 KB | **measured** (`next build`, `/_not-found` floor) | initial |
| Framer Motion — `LazyMotion` + `domAnimation` + `m` | 29.2 KB | **measured** | initial |
| Lenis 1.1.20 | 4.1 KB | **measured** | initial |
| lucide-react (4–6 icons, tree-shaken) | 1.5 KB | **measured** (4 icons) | initial |
| clsx + tailwind-merge + cva | ~3.0 KB | estimate | initial |
| Application code — sections, content, layout, hooks | ~16 KB | derived: current page chunk is 65.4 KB, of which 42.9 is `motion` + 4.1 Lenis + 1.5 icons | initial |
| **Projected initial total** | **≈ 155 KB** | | |
| **Headroom to 200 KB** | **≈ 45 KB** | | |

Current measured initial is **169 KB**. The `motion` → `LazyMotion`/`m` swap alone recovers **13.7 KB** (42.9 → 29.2), which is where the 45 KB of headroom comes from. Without that swap headroom is ~31 KB, which is still survivable but leaves nothing for the content and project work in later phases.

### Deferred chunk — never counted against the 200 KB

| Item | gz | Basis |
|---|---:|---|
| OGL — Renderer, Camera, Transform, Geometry, Program, Mesh, Post, RenderTarget, math | 16.9 KB | **measured** |
| Hero scene code + GLSL (vertex/fragment sources inline) | ~5 KB | estimate |
| WebCrypto attestation logic | 0 KB | native browser API |
| **Deferred total** | **≈ 22 KB** | |

For contrast, the same chunk built on the proposed stack: **245.7 KB** (R3F + three + drei). The chosen stack's deferred payload is **~9% of that** — and smaller than the poster image it replaces.

### Non-JS assets

| Item | size | Notes |
|---|---:|---|
| Hero poster (AVIF, WebP fallback) | 25–40 KB | LCP element. `priority`, explicit dimensions. |

### Budget guardrails for the build phase

- Fail CI if First Load JS for `/` exceeds **180 KB** (20 KB under budget, so regressions are caught before they're violations).
- Fail CI if the deferred hero chunk exceeds **40 KB**.
- Add `@next/bundle-analyzer` behind an `ANALYZE=true` env flag.
- Add `three`, `@react-three/fiber`, `@react-three/drei` and `gsap` to an ESLint `no-restricted-imports` rule with a message pointing at this document. This decision must be reversed deliberately, not drifted past.

---

## 8. Dynamic-import strategy — exact patterns for build agents

### Rule 0 — `ssr: false` cannot live in a Server Component

Confirmed against current Next.js docs: *"`ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component."* This is the single most common way this build goes wrong.

The shape is therefore always **three** files, not two:

```
HeroSection.tsx        Server Component — renders poster + caption + <slot>
  └─ HeroCanvasGate.tsx   'use client' — the gates, and the next/dynamic call
       └─ HeroCanvas.tsx  'use client' — imports ogl, owns the WebGL context
```

### 1. Server Component — the poster is the real hero

```tsx
// src/components/sections/HeroSection.tsx   (NO 'use client')
import Image from "next/image";
import HeroCanvasGate from "./HeroCanvasGate";
import poster from "@/assets/hero-attestation.avif";
import { BUILD_ATTESTATION } from "@/content/attestation";

export default function HeroSection() {
  return (
    <section className="relative">
      {/* Fixed aspect box: reserves layout before anything loads → CLS 0 */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={poster}
          alt="A lattice of points resolving from scattered noise into an ordered surface."
          priority
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Canvas paints over the poster, absolutely positioned, same box */}
        <HeroCanvasGate />
      </div>
      <figcaption className="font-mono text-xs">
        {BUILD_ATTESTATION.alg} · sig {BUILD_ATTESTATION.short} · verified{" "}
        {BUILD_ATTESTATION.ms}ms
      </figcaption>
      {/* Hero copy: plain server-rendered HTML. Works with JS off. */}
    </section>
  );
}
```

### 2. Client gate — every budget is enforced here, before the import fires

```tsx
// src/components/sections/HeroCanvasGate.tsx
"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), {
  ssr: false,      // legal here: this is a Client Component
  loading: () => null,   // never a spinner — the poster IS the loading state
});

const MIN_CORES = 4;
const MIN_MEMORY_GB = 4;

export default function HeroCanvasGate() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // GATE 1 — reduced motion. Checked first: these users download 0 KB of OGL.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    // GATE 2 — Save-Data / slow connection
    const conn = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /2g/.test(conn.effectiveType)) return;

    // GATE 3 — device floor (mid-tier Android protection)
    if ((navigator.hardwareConcurrency ?? MIN_CORES) < MIN_CORES) return;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (mem !== undefined && mem < MIN_MEMORY_GB) return;

    // GATE 4 — WebGL2 actually works. Probe on a throwaway canvas, then release it.
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    if (!gl) return;
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    // GATE 5 — post-LCP only. requestIdleCallback yields until the main thread
    // is free, which is after LCP has settled on every realistic connection.
    const ric = window.requestIdleCallback ?? ((cb: IdleRequestCallback) =>
      window.setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 }), 200));
    const handle = ric(() => setShouldRender(true), { timeout: 2500 });

    return () => window.cancelIdleCallback?.(handle as number);
  }, []);

  if (!shouldRender) return null;
  return <HeroCanvas />;
}
```

Gate ordering is deliberate: **reduced-motion is checked before anything else**, so those users never trigger the chunk download at all. That is the difference between "we respect the preference" and "we respect the preference after making you pay 22 KB for it."

### 3. The canvas component — the only file that imports `ogl`

```tsx
// src/components/sections/HeroCanvas.tsx
"use client";
import { useEffect, useRef } from "react";
// Static import is correct HERE: this whole module is already a dynamic chunk.
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from "ogl";
```

Rules for this file:
- **Named imports only.** Never `import * as OGL from 'ogl'` — the barrel is 39.0 KB gz vs 14.3 KB for the named set.
- Own the full teardown in the effect's cleanup: `cancelAnimationFrame`, `ResizeObserver.disconnect()`, `geometry.remove()`, `program.remove()`, and `gl.getExtension('WEBGL_lose_context')?.loseContext()`. React 19 Strict Mode double-invokes effects in dev; a leaked context will surface as a second canvas or a lost context on the second mount.
- Listen for `webglcontextlost` → unmount and reveal the poster. Do not attempt restore.
- Cap `renderer.dpr` at `Math.min(devicePixelRatio, 1.5)`.
- Pause the rAF loop when the hero leaves the viewport (`IntersectionObserver`) and on `document.visibilitychange`. A hero animating at 60fps while the user reads the footer is pure battery burn and will show up in the Lighthouse trace.

### 4. Below-the-fold components — IntersectionObserver gating

For anything that isn't the hero, the literal rule applies. Use a shared hook:

```tsx
// src/hooks/useInViewOnce.ts   — 0 dependencies
export function useInViewOnce(rootMargin = "200px") { /* IO, unobserve on first hit */ }
```

Then gate the dynamic import on it, same three-file shape. `rootMargin: "200px"` starts the download just before the element is needed so the swap isn't visible.

### 5. Framer Motion — the LazyMotion boundary

```tsx
// src/components/providers/MotionProvider.tsx
"use client";
import { LazyMotion, domAnimation } from "framer-motion";
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation} strict>{children}</LazyMotion>;
}
```

- Mount once in `layout.tsx`.
- `strict` makes any surviving `<motion.div>` throw at dev time, so the refactor can't be half-done.
- All 8 files currently importing `motion` migrate to `m`.
- **If layout animations (`layout` / `layoutId`) are needed**, that requires `domMax`, which is larger — measure before adopting, and prefer FLIP-by-hand or a CSS view transition.

### 6. Scroll choreography patterns

**Hero scrub (the noise→lattice resolve):** `useScroll({ target, offset: ["start start", "end start"] })` → write `scrollYProgress` into a ref, read that ref inside the OGL rAF loop as a uniform. **Do not** drive the uniform from a React state setter — that's a re-render per frame and it will cost the 60fps budget.

**Section reveals:** IntersectionObserver toggling a `data-revealed` attribute, with the transition in CSS. Zero JS animation cost, and it degrades correctly.

**No-JS guard (mandatory):** reveal styles must not leave content at `opacity: 0` when JS never runs.

```css
.js [data-reveal] { opacity: 0; transform: translateY(12px); }
.js [data-reveal][data-revealed] { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { opacity: 1 !important; transform: none !important; transition: none !important; }
}
```
The `.js` class is set on `<html>` by a tiny inline script in `<head>`. With JS disabled the class never appears and everything is visible by default. **This is the pattern that satisfies "core content works with JavaScript disabled" — it must be applied to every reveal on the site, not just the hero.**

**Progressive enhancement with native scroll timelines:** where a reveal is purely decorative, prefer the zero-JS path behind a feature query.

```css
@supports (animation-timeline: view()) {
  .js [data-reveal] { animation: reveal linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; }
}
```
At 87.2% global support (Chrome/Edge 115+, Safari 26+, Firefox 158+) this covers most traffic off the main thread, with the IntersectionObserver path as the universal floor. Safari 26.4+ runs these on the compositor thread, which is strictly better than anything JS can do.

**Lenis:** keep, but `lenis.destroy()` under `prefers-reduced-motion` — hijacked scrolling is itself a motion-sensitivity trigger, and the current `SmoothScrollProvider.tsx` already imports `useReducedMotion`, so verify it actually branches.

---

## 9. Open risks

| Risk | Severity | Mitigation |
|---|---|---|
| OGL unmaintained (last publish 2025-01-27) | Medium | Pin exact version. Zero deps. Unlicense → vendorable into `src/lib/gl/` with no attribution obligation. twgl.js is the documented migration target. |
| Hand-written GLSL is the highest-skill item in the build | Medium | It is also the point — this is the artifact that proves capability. Budget real time for it; do not let it become a generic noise shader. |
| "Every visitor sees a different lattice" makes visual QA non-deterministic | Low | Expose a `?seed=` query param for deterministic screenshots; Playwright visual tests pin the seed. |
| Poster and canvas diverge visually → a visible pop on swap | Low | Generate the poster **from the same shader** via a headless render at the committed seed, not by hand in a design tool. |
| Crypto copy overclaims | Medium (reputational, with this audience) | Caption states algorithm, truncated signature, verify time. Nothing about encryption or security guarantees. |
| Framer Motion 13.2.0 is out; repo pins 12.38.0 | Low | Out of scope here. Do not bump during the 3D work — one variable at a time. |

---

## 10. Decision record

| # | Decision | Type | Quantitative basis |
|---|---|---|---|
| 1 | Use **OGL**, not React Three Fiber + drei | **OVERRIDE** | 16.9 KB vs 245.7 KB gz, both measured. Three.js has a hard ~130 KB gz floor that tree-shaking cannot reduce (130.0 KB for `WebGLRenderer` alone). |
| 2 | Use **Framer Motion `useScroll`**, not GSAP ScrollTrigger | **OVERRIDE** | +45.1 KB gz against ~31 KB measured headroom. Framer Motion already resident; marginal cost ≈ 0. Not a licensing objection — GSAP is confirmed free for commercial use including all plugins. |
| 3 | Migrate Framer Motion to `LazyMotion` + `m` | Refinement | 42.9 → 29.2 KB gz. Recovers 13.7 KB. |
| 4 | Keep Lenis | Confirmed | 4.1 KB gz, and it covers the scroll normalization we'd otherwise have wanted ScrollTrigger for. |
| 5 | Hero = live WebCrypto ECDSA attestation seeding the geometry | New | WebCrypto is 0 KB; needs no drei feature; conceptually exact for security + payments + browser-auth. |
| 6 | Single fallback = server-rendered poster, which is also the LCP element | New | Collapses JS-off, WebGL-failure, reduced-motion and low-end into one tested path. Canvas fades in with `opacity` only → CLS contribution 0. |
| 7 | Hero gating rule is "post-LCP, idle-gated", not "below the fold" | Clarification | The hero is above the fold; the brief's literal wording is unsatisfiable there. |
| 8 | Reject the scrubbed image sequence | Confirmed rejection | 4–15 MB of frames attacks the LCP/4G budget harder than any JS option, and signals art direction rather than engineering to this audience. |

---

### Sources

- [GSAP standard license](https://gsap.com/standard-license/) — commercial use free, all plugins included
- [Webflow makes GSAP 100% free](https://webflow.com/updates/gsap-becomes-free)
- [Next.js — lazy loading in the App Router](https://nextjs.org/docs/app/guides/lazy-loading) — `ssr: false` is not permitted in Server Components
- [caniuse — `animation-timeline: scroll()`](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) — 87.22% global; Chrome/Edge 115+, Firefox 158+, Safari 26.0+
- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [three.js forum — state of tree-shaking](https://discourse.threejs.org/t/what-is-the-state-of-tree-shaking/33168) — independent corroboration of the ~121–130 KB gz renderer floor
- [oframe/ogl](https://github.com/oframe/ogl) — Unlicense, zero dependencies
- All bundle figures: measured locally with esbuild + `gzip -9` against the versions listed in §1. `next build` output from this repo at commit `c347819`.
