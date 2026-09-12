# 17 — Fixing the three visible defects in the field/ceremony redesign

**Status:** done. Three defects fixed, one root cause found underneath two of them, one new class of gate added.
**Method:** production build (`next build`), served at `:3210`, driven with Playwright. Screenshots at seven scroll positions × two themes × two viewports (1440×900 and 390×844), looked at, iterated on. Composited contrast read back with `gl.readPixels` through the development-only probe; `readPixels` reaches no production chunk.

All figures below are measured, not asserted. Where a number contradicts an earlier document, the measurement is given with the instrument that produced it.

---

## 1. HIGH — the HUD readout collided with body text

**Status: fixed.**

### Before

`FieldHud` was `position: fixed` at the bottom-left gutter, mounted in `src/app/layout.tsx` after `SiteFooter`, at `--z-hud: 2`. At 1440×900 the reading column starts at x=384 and the readout is ~580px wide, so it reached into the column at **every scroll position**:

| scroll position | what the readout painted across |
|---|---|
| `top` | "Three entries, ordered by how hard the work is to fake" |
| `#work` | "Splita — group payments collected up front" |
| `#attestation` | the honesty paragraph |
| `#ceremony` | "Signature verification will run locally." |
| `#projects` | "TechBuzz, AI training, and a Nigerian tech incubator…" |
| `#about` | "arinze@splita.co — direct email, plus GitHub, LinkedIn…" |
| `#contact` | "© 2026 Arinze Okigbo" |

That table is not from reading the code — it is the failure output of the new gate in §4.3, produced by temporarily restoring `position: fixed` to confirm the gate has teeth.

No existing check could see it. `gl.readPixels` reads the field's framebuffer, which contains no DOM at all, so two strings drawn over each other composite to a perfect score.

### The fix, and why not a z-index

There is no fixed placement that works. The site is one scrolling column with no reserved band: at 1440 the gutter is 384px against a 580px readout; at 390 there is no gutter. A fixed layer over a scrolling document either overlaps text or hides it, and a stacking-order token cannot separate two layers that occupy the same pixels.

So the readout participates in layout. It is now the hero's closing block — inside the `.stage` scope, inside the reading column, under the actions row.

| file | change |
|---|---|
| `src/components/three/FieldHud.tsx` | rewritten: `position: fixed` → in flow; the 14-rule `data-field-ground` stylesheet deleted (colour is inherited from `.stage` now); width reserved on the three patched values |
| `src/components/sections/primitives/Hero.tsx:19-33, 118-124` | new optional `readout` slot, rendered last |
| `src/components/sections/HeroSection.tsx:7, 53-58` | passes `<FieldHud />`; imported from its own module, **not** the `@/components/three` barrel |
| `src/app/layout.tsx:13, 213-224` | `<FieldHud />` and its import removed, with a note saying why nothing fixed goes here |
| `src/app/globals.css:373-381` | `--z-hud` deleted — the step existed only for the fixed layer |
| `src/app/globals.css:1132-1146` | the footer's `--space-16` block-end is no longer WCAG 2.4.11 clearance; comment corrected, value kept |

Two things fell out of the move and were paid:

- **First Load JS went 108 kB → 112 kB.** Importing `FieldHud` from the `@/components/three` barrel dragged `FieldStage`'s `"use client"` boundary into the page chunk as well as the layout's. Importing the module directly put it back to **108 kB**.
- **CLS went 0 → 0.0003 on a mobile sweep.** The deferred chunk rewrites `ms` (`0.1` → whatever the browser measured) and `pts` (`15,088` → `6,944` on the mid tier), and in flow that is a real shift. The fixed HUD contributed nothing because it was out of flow; moving it in flow put it on the page's account. Each patched span now reserves its width in `ch` plus tracking. **CLS is 0 again.**

### After

0 collisions across 7 scroll positions × 2 viewports, asserted in CI (§4.3). Screenshot evidence: `d-dark-top`, `d-dark-ceremony`, `d-dark-contact` at 1440×900 and `m-dark-top` at 390×844 — the readout sits under the CTA row on its own hairline, and the footer links at the foot of the document have nothing over them.

---

## 2. HIGH — an eyebrow sat unreadable on the bright lattice

**Status: fixed. And the mechanism underneath it was worse than the symptom.**

### Before

`WHAT THIS BROWSER CAN DO, AND WHICH AUTHENTICATOR TO USE` rendered in `--color-accent` `#D1A954` directly on the lattice. Measured on composited pixels: **1.81:1** at 1440×900 (gold on `rgb(142,126,85)`), against a floor of 4.5.

An audit of every text element inside `.stage` / `.over-field`, with every deferred chunk mounted and every disclosure open, found **three uncarved elements at 1440×900 and two at 390×844** — not one:

| element | file | ink |
|---|---|---|
| `<summary>` "What this browser can do, and which authenticator to use" | `src/components/ceremony/CeremonyPanel.tsx:253` | `--color-accent` |
| `<summary>` "A captured ceremony, decoded field by field" | `src/components/sections/CeremonySection.tsx:161` | `--color-accent` |
| `<p>` holding the load affordance and its hint | `src/components/ceremony/CeremonyMount.tsx:108` | `--color-foreground-secondary` |

They were invisible to the harness for a structural reason: **the probe enumerated `[data-scrim]` blocks**, so a string with no carve got no carve *and* no measurement, and the two absences covered for each other. The reported A8.4 number stayed healthy because it came only from the blocks that had remembered to declare one.

### The mechanism underneath

Raising carve amounts made the numbers better but never good, and the arithmetic did not work: a composited pixel of `rgb(102,91,64)` behind a block carved at 0.94 is impossible if 0.94 means "6% of the light survives" — 6% of a fully-blown pixel is 15/255.

It was not slot loss. The composite was carving the **HDR** buffer and tonemapping the result:

```glsl
col = mix(col, uInk * 0.34, carve);   // HDR in, HDR out
col = 1.0 - exp(-col * 1.18);         // then lifted back up
```

`tScene + tBloom * uBloom` runs 5–8 on the ignited ridges, not 1. So 6% of 8 is 0.48, and the tonemap lifted that to 102/255. **The brighter the field got, the less the scrim did** — exactly backwards from what a contrast floor needs, and invisible until the hero was re-staged bright enough to expose it (§3).

The order is now reversed (`src/components/three/field/post.shader.ts:78-105`): tonemap first, carve second. `col` is 0..1 when the carve is applied, so the authored amount really is the fraction of light that survives, and the worst case at 0.94 is 16/255 instead of 102/255. Dim regions are unchanged to within a quantisation step — the two orders agree to 3/255 at a scene value of 0.1 — so nothing about the field's look moves except where the defect lived.

**One trap cost twenty minutes and is worth recording:** the shader is a JS template literal, and the explanatory comment originally contained backticks (`` `tScene` ``). The module still parsed, the GLSL arrived truncated, the fragment shader failed to compile, and OGL threw `Cannot read properties of undefined (reading 'forEach')` once per frame while the page merely looked dark. That file now says, in the shader source, that it takes no backticks.

### Fixes

| file | change |
|---|---|
| `src/components/ceremony/CeremonyPanel.tsx:252-270` | `data-scrim={HEADING_SCRIM}` on the `<summary>` (on the summary, never on the `<details>` — that would be the container-shaped rect A8.3 forbids, and `isLeafScrim` would then skip both) |
| `src/components/sections/CeremonySection.tsx:156-172` | same, for the disclosure summary |
| `src/components/ceremony/CeremonyMount.tsx:12, 103-108` | `data-scrim={BLOCK_SCRIM}` on the resting-state block |
| `src/components/ceremony/scrims.ts` | **new** — the two carve constants on their own, so the first-load client chunk does not pull the whole ceremony token sheet in for one string; `tokens.ts` re-exports them |
| `src/components/three/field/post.shader.ts:78-105` | tonemap before carve |
| `src/components/three/constants.ts:116-137` | `SCRIM_SLOTS` 6 → 8 |
| `src/components/three/field/contrast.ts` | the probe walks **text**, not carves (§4.1) |
| `src/components/three/field/bleed.ts` | the light-mode mask feathers outward, not inward (§2.1) |

`SCRIM_SLOTS` rose because the measurement finally said so, which is the condition the spec itself put on that remedy: at scrollY 0 there were nine candidate blocks for six slots, `#work`'s h2 lost its slot entirely, and measured **1.77:1** against a large-text floor of 3 on a composited pixel of `rgb(186,182,170)` — not a weak carve, no carve at all. Cost is two more rounded-box SDFs per pixel.

Two carve amounts were briefly raised 0.94 → 0.97 across the four `.over-field` sections and then **reverted**, because they were treating the HDR symptom. With the tonemap order corrected, 0.94 means 0.94. The reverted value carries a note saying so, so the wrong fix is not made again.

### 2.1 A related defect the move exposed

The light-mode bleed mask feathered **inward** by 0.14 of the viewport — 118px at 390×844 — so the last 118px of every stage section faded out *underneath its own content*. The hero's closing line sat in it: before this pass the résumé affordance, after it the readout, at roughly **1.3:1** on a ground halfway between `#0A0908` and `#FDFDFC`. The probe could not see it either, because `isPaintedAt` treats the band edges as where the field stops, so those samples were skipped as unpainted.

The fade now runs **outside** the section, across the `--section-gap` the next section's `padding-block-start` leaves empty, capped at 75% of that gap so it always reaches zero before the next section's first line. The cap binds at every breakpoint on this page (72px gap → 54px of fade; 144px → 108px). Both constraints — no text in the fade, no lit pixel under the next section — now hold at once.

### After — measured contrast on composited pixels

28 measurement positions (7 scroll positions × 2 themes × 2 viewports), 3,300+ pixel readbacks, every text element over the field scored against **its own** computed ink:

| ink | where | measured |
|---|---|---|
| `--color-accent` `#D1A954` | the two ceremony `<summary>` eyebrows | **8.61 – 8.97:1** (was 1.81:1) |
| `--field-fg-secondary` `#B9B4A9` | body copy on the stage | 7.3 – 9.9:1 |
| `--field-fg-muted` `#9C978C` | the readout, `#attestation`'s eyebrow | 6.72 – 7.05:1 |
| `--color-foreground-muted` `#8C877E` | metadata over `.over-field` sections | **5.48 – 5.77:1** |

**Worst overall: 5.48:1 at 1440×900 dark, `#work`. Floor 4.5. Zero failures at any position.**

The 7:1 ship target is met by every string on the field ladder and is **unreachable** for the four `.over-field` metadata lines: `#8C877E` tops out at **5.88:1 on pure black**, so no carve of any amount can get there. That is a token ceiling, not a scrim defect, and the carve is now within 0.4:1 of it. Raising it would need a different ink, which is `docs/04` §3.2's decision and not this pass's.

---

## 3. MEDIUM — the hero field was weaker than the approved prototype

**Status: fixed.**

### Before

In the hero the field read as a soft, diffuse warm nebula. The ceremony section rendered a crisp lattice from the same shader, which is what said the staging was wrong rather than the shader.

`runtime/scroll.ts` scrubs the resolve against `#attestation` — the **third** section on the page. `anchoredProgress` is therefore 0 for the whole of the hero and the whole of `#work`, so the two screenfuls a first-time visitor actually looks at rendered the lattice at `resolve = 0`: every point still in the entropy cloud, no rows or columns aligned, no halos overlapping. Density is brightness in an additive field, so nothing ignited.

`scratchpad/proto-c-field.html` settles what the approved look is. Its default mode is `"hold"`, which lerps progress to **1.0**; the comment on the state object reads *"resting state = fully resolved (spectacular as a still)"*, and the file's closing lines say scroll-driven mode is opt-in via `?mode=scroll` because "default is the resolved hold, which is the still the art direction is meant to be judged on". The prototype's hero is a resolved lattice.

### Fix

`src/components/three/runtime/scroll.ts:51-78, 153-155` — the resolve is remapped onto `[RESOLVE_FLOOR, 1]` instead of `[0, 1]`, with `RESOLVE_FLOOR = 0.90`. Nothing about the three acts moves; only their starting frame does, and `#attestation` still owns the last of the resolve and the whole of the trace lock-in.

0.86, 0.90 and 0.94 were each built and screenshotted against the prototype's own hero at 1440×900. Below ~0.86 the hero still reads diffuse; at 0.94 there is almost no resolve left for `#attestation` to show. 0.90 gives a crisp lattice with black in the upper left and an ignited ridge on the right — the prototype's composition — while leaving a visible Act II.

### After

Screenshot evidence: `shots/ship/d-dark-top.png` against `shots/proto-hero.png`. Same character: resolved rows and columns, bright ignited ridges where halos reinforce, the signature traces drawn as lit seams, black where the plane recedes.

### Honest judgement

**It is close, and it is not identical.** What matches: the lattice resolution, the ridge ignition, the depth falloff, the trace seams, the black upper-left, the camera. What does not: the prototype concentrates a single very bright crest just right of the headline, and the shipping hero spreads a similar amount of light across a wider band, so the prototype reads slightly more dramatic and the shipping page slightly more even. That difference is in the ground pass's focus lobe and the bloom staging, not in the resolve — and closing it means re-tuning `hero.focus` and the bloom threshold against a contrast floor that is now measured at 28 positions. That is an art-direction pass with a measurement loop attached, not a defect fix, and I have not done it. The gap is visible in a side-by-side and would not be noticed by a visitor who has not seen the prototype.

---

## 4. The gate that would have caught defect 2 — `tests/e2e/field-contrast.spec.ts`

Extended from 12 tests to 24 (both projects). The file's own header now states the six things it fails on.

### 4.1 The probe enumerates text, not carves

`src/components/three/field/contrast.ts` walks every element inside `.stage` / `.over-field` that has a text node of its own, whether or not it declares `data-scrim`. Each is scored against its **own** computed ink and its **own** A8.4 floor (4.5, or 3 for WCAG large text computed from font-size and weight). The report returns a per-element `failures` list rather than a single aggregate, because an aggregate cannot name the three strings that failed behind the worst one.

Two exclusions, both counted rather than silent:

- **Inactive controls** — WCAG 1.4.3 sets no floor for a disabled control's label.
- **Text on an opaque CSS fill** — `readPixels` reads the field's framebuffer, so for the primary CTA's label (`#0A0908` on opaque gold) it read the field *behind the button* and reported **1.01:1** for a perfectly legible string. Reported as `shielded`, never dropped quietly. A form the alpha parser cannot read resolves to **opaque**, because the first draft returned "transparent" for Chrome's wide-gamut serialisation `color(display-p3 0.81 0.66 0.3)` — the same class of bug that once rendered this lattice salmon.

### 4.2 Two tests where there was one

- **`no string over the field fails its floor at <viewport>`** — sweeps all seven scroll positions at 1440×900 and 390×844, with every deferred chunk mounted and every `<details>` open, and asserts `failures` is empty. Verified to have teeth: with the two summary scrims removed it reports `#ceremony: 1.81:1 against a floor of 4.5 … data-scrim="(none)"`.
- **`no text element inside .stage or .over-field is left uncarved`** — the structural half, read from the DOM with no GPU and no field, so it holds on a production build, on a machine with no WebGL, and under every gate that makes the measurement skip.

### 4.3 A gate for defect 1's class

**`no fixed layer overlaps text at <viewport>`** — at each of the seven scroll positions, intersects every `fixed`/`sticky` element's rect against every text-bearing element in `main` and `footer`. The sticky header is excluded by name (the document is padded for it and it is opaque); `.field-backdrop` is excluded because it is behind the content. Verified to have teeth: restoring `position: fixed` to the HUD reproduces the original defect as seven named collisions.

### 4.4 Flake

The sweep flaked under four parallel workers on one software GPU — the camera and energy lerp and the scrim slots had not settled when the readback fired. Settle raised to 1500 ms and the probe takes three passes instead of two (arm, settle, measure). Two consecutive full-suite runs clean afterwards. A flaky gate is a gate someone deletes, and deleting this one restores the failure it exists to catch.

---

## 5. Non-regression — re-verified after the last change

| gate | target | measured |
|---|---|---|
| `tsc --noEmit` | clean | clean |
| `next lint` | clean | `✔ No ESLint warnings or errors` |
| `vitest run` | 338 | **338 passed**, 26 files |
| `next build` | clean | clean |
| `/` First Load JS | ≤ 110 kB | **108 kB** (Next table); 116,766 B gz manifest-summed, 63.3% of the 180 KiB budget |
| deferred field chunk | ≤ 40 kB gz | **26.9 kB gz** (11.36 field + 15.57 `ogl`) |
| CLS, load + settle | 0 | **0** at 1440×900 and 390×844 |
| CLS, full-document sweep | 0 | **0** at both; 6/6 consecutive mobile sweeps |
| page height [R14] | ≤ 6.00 vp / ≤ 8.00 vp | **5.85 vp** desktop, **7.46 vp** mobile |
| 3D bytes under `prefers-reduced-motion` | 0 | 0 canvases, `data-field-live` absent, **0 chunks** carrying the shader |
| WebGL draws, tab hidden | 0 | **0** (drawing confirmed beforehand, so the check is not vacuous) |
| core content, JS disabled | readable | all six probe strings present, including `pts 15,088` |
| `.col` naming | never `.container` | `.col` intact; the only `container` strings are the comments explaining why |
| Framer Motion | absent | no dependency, no import |
| `FIGURE_FALLBACK_*` | deleted | still deleted; the asserting test passes |
| `tests/e2e/field-contrast.spec.ts` | passing | **24/24** |
| full E2E suite | passing | **54 passed, 2 skipped**, four runs of five |

The 2 skips are the two print tests on the `mobile-chrome` project, which skip themselves because print emulation is unavailable there. Pre-existing and unrelated.

One run of five saw `nav-focus-trap.spec.ts` fail at 767×900 under four parallel workers and pass in isolation. That file is untouched by this pass; it is recorded here rather than left out because a run that was not clean should be on the record even when the cause is elsewhere.

### One pre-existing shift, reported rather than claimed fixed

Early in this pass, 2 of 6 aggressive mobile scroll sweeps recorded a **0.27** layout shift attributed to `CeremonyPanel` replacing `CeremonyMount`'s resting-state block and pushing `#projects` and `#about` down. It is racy — it registers only when the panel's chunk lands while content below it is in view — and it is not caused by this pass: the only edits to those two files were `data-scrim` attributes and an import. It did not reproduce in the final 6 runs or in either `load + settle` measurement. Recording it because "we did not see it in the last six runs" is not the same as "it cannot happen", and the honest fix — reserving height for a block that grows from 80px to 4,000px — is a change to the ceremony's resting-state design that `docs/05 §3.3a` fixes and this pass should not make unilaterally.

---

## 6. Files changed

```
src/app/globals.css                             --z-hud removed; footer comment corrected
src/app/layout.tsx                              FieldHud unmounted from the fixed layer
src/components/sections/HeroSection.tsx         passes the readout; direct module import
src/components/sections/primitives/Hero.tsx     new `readout` slot
src/components/sections/SelectedWorkSection.tsx carve note (value unchanged at 0.94)
src/components/sections/ProjectsSection.tsx     "
src/components/sections/AboutSection.tsx        "
src/components/sections/ContactSection.tsx      "
src/components/sections/CeremonySection.tsx     data-scrim on the disclosure summary
src/components/ceremony/CeremonyPanel.tsx       data-scrim on the environment summary
src/components/ceremony/CeremonyMount.tsx       data-scrim on the resting-state block
src/components/ceremony/scrims.ts               NEW — carve constants, first-load safe
src/components/ceremony/tokens.ts               re-exports them
src/components/three/FieldHud.tsx               in flow; reserved widths; colour inherited
src/components/three/constants.ts               SCRIM_SLOTS 6 -> 8
src/components/three/field/bleed.ts             feather outward, capped to the section gap
src/components/three/field/contrast.ts          probe enumerates text, not carves
src/components/three/field/post.shader.ts       tonemap before carve
src/components/three/runtime/scene.ts           empty-report constant for the new shape
src/components/three/runtime/scroll.ts          RESOLVE_FLOOR
src/components/three/field/field.test.ts        two mask tests updated to the new rule
tests/e2e/field-contrast.spec.ts                text sweep, carve coverage, occlusion gate
```

No dependencies added. No file under `docs/` other than this one was touched.
