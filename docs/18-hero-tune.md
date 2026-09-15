# 18 · Hero field tune — concentrating the crest

One tuning pass against `scratchpad/proto-c-field.html`, driven by screenshots
rather than by reasoning about parameters. Scope was `src/components/three/**`
and nothing else; four files changed.

## What the comparison actually found

The handover described the gap as focus-lobe and bloom tuning. Diffing the port
against the prototype line by line found the opposite of what that implies:
**the sprite falloff, the bright-pass threshold, the bloom strength, the blur
radii, the iteration count, the ground shader, the lattice maths, the grid
density and the camera are already byte-identical to the reference.** There was
nothing to close by re-tuning them, and moving them would have been divergence,
not convergence.

Two things were genuinely different, and one apparent difference was an
artefact of how the prototype works.

### The artefact: the crest is random, not authored

`proto-c-field.html` generates a fresh ECDSA keypair per load, and the resolved
surface is read straight out of the signature bytes. Three consecutive loads of
the reference give three different crests (`refvar-0/1/2` in the scratchpad).
The shipped site does the same. So "match the reference crest" is not a
well-formed target; the target is the *character* of the light, and every
before/after below is therefore measured on a **pinned** signature so the two
frames are the same surface.

### Finding 1 — the bloom band is wider here than in the prototype, but only on a retina display

The blur ladder's radii are in **texels of the bloom target**, and that target
is sized from the device pixel ratio. The prototype caps its renderer at
`DPR_MAX = 1.6`; this module caps a bloom-enabled device at
`DPR_MAX_WITH_BLOOM = 1.25`, because the ladder is fillrate-quadratic in DPR.
Identical texel radii therefore cover a **different fraction of the frame**:

| | backing store at 1440×900, `devicePixelRatio` 2 | widest rung, as % of frame width |
|---|---|---|
| prototype | 2304×1440 (dpr 1.6) | 0.78% |
| port, before | 1800×1125 (dpr 1.25) | 1.00% |

That is a 28% wider bloom on every retina panel — which is exactly the reported
"ours spreads light wider" — and it is **invisible at `devicePixelRatio` 1**,
where both clamp to 1. A screenshot at dpr 1 could never have found it, which is
the most likely reason the previous pass concluded everything matched.

### Finding 2 — the hero's focus lobe sits inside its own scrim

The hero attention state was ported verbatim from the prototype, `focus:
[0.62, 0.50]`. The prototype's hero is **left-aligned**: its type occupies uv x
0.06–0.42, so a lobe at 0.62 sits in clear air to the right of the column. This
hero is **centre-aligned** — the measured `[data-scrim]` blocks span uv x
0.246–0.754, y 0.177–0.718 at 1440×900 — so 0.62, 0.50 lands squarely *inside*
the carve. The ground was concentrating its energy under a 0.94 carve that then
threw it away, and what survived to the eye was the un-concentrated periphery.

## What changed

| File | Change |
|---|---|
| `constants.ts` | new `BLOOM_REFERENCE_DPR = 1.6` |
| `field/post-chain.ts` | `blurRadiusScale()`; radii scaled by `dpr / BLOOM_REFERENCE_DPR`, clamped to 0.5–1.0 |
| `runtime/scene.ts` | passes `dpr` into `post.resize()` (one line) |
| `field/attention.ts` | hero `focus` `[0.62, 0.50]` → `[0.86, 0.46]` |

The bloom band is now a **fixed fraction of the frame on every display**, equal
to the fraction the prototype was art-directed at. It costs nothing: same
iteration count, same target sizes, same fillrate, six extra float multiplies
per frame. The DPR cap itself is untouched, so no device renders one extra
pixel, and `blurIterations()` is still device-tiered (6 / 2 / 0).

### Levers deliberately not pulled, with the measurement that says why

- **Resolve staging at the hero.** `RESOLVE_FLOOR` 0.90 vs 0.97 vs 1.00 is
  *visually identical* — mean absolute pixel difference 1.05 against a
  same-parameter reload noise floor of 1.05, i.e. no signal at all. At
  `uProgress` 0.90 only the outermost rows are still short of placed. Left at
  0.90 so `#attestation` keeps its Act II runway. (`floor: 0.0` measures 17.04,
  so the lever was wired correctly — it simply does nothing in 0.9–1.0.)
- **Tightening the focus lobe** (`exp(-d² · 1.25)` → `· 3.0`). Raises
  concentration but robs the periphery: mean luminance over the *visible*
  hero field 72.6 → 66.0. The prototype's own lobe is 1.25 and, measured, the
  prototype is **not** more concentrated than we are. Reverted.
- **Raising `DPR_MAX_WITH_BLOOM` to 1.6.** Would sharpen the point cores at
  retina, but costs (1.6/1.25)² = 1.64× fillrate against the 60fps and
  mid-tier-Android limits. Not traded. This is the one piece of the gap left on
  the table, and it is named here rather than quietly skipped.

## Before / after

Controlled pair, same pinned signature, 1440×900 dark:

- before — `docs/images/hero-tune/before-1440-dark-pinned.png`
- after — `docs/images/hero-tune/after-1440-dark-pinned.png`

The bloom change on its own, 2× zoom into the crest:

- before — `docs/images/hero-tune/before-bloom-zoom.png`
- after — `docs/images/hero-tune/after-bloom-zoom.png`

Shipped build, live signature:

- `docs/images/hero-tune/after-1440-dark.png`
- `docs/images/hero-tune/after-1440-light.png`
- `docs/images/hero-tune/after-390-dark.png`
- `docs/images/hero-tune/after-1440-dark-dpr2.png`
- reference for comparison — `docs/images/hero-tune/reference-1440-dark.png`

Light distribution over the **uncarved** regions of the hero at 1440×900
(left strip, right strip, bottom band; pinned signature):

| | mean | p50 | p90 | p99 | top 5% of px | top 20% of px |
|---|---|---|---|---|---|---|
| before | 51.11 | 36.13 | 117.31 | 204.84 | 17.4% | 49.5% |
| bloom fix | 50.60 | 35.13 | 117.75 | 206.19 | 17.7% | 50.2% |
| **both** | **51.04** | **36.41** | **120.97** | **207.20** | **17.8%** | **50.7%** |

Mean holds while p90, p99 and both concentration measures rise: light moved out
of the haze and into the crest, which is the intended trade.

For scale, the same statistics on a field-only crop (x 1120–1430, y 80–860 —
pure field in both layouts) put the port at or above the prototype **before**
any of this: mean 72.6 vs 66.3–76.4, p90 142.8 vs 114.3–136.2, top 5% 12.2% vs
11.3–11.9%. The field itself was never dimmer or more diffuse than the
reference.

## Re-verified hard limits

| Limit | Result |
|---|---|
| A8.4 worst composited contrast, 28 scroll positions × 2 themes | **5.36:1**, zero failures (3 sweeps: 5.36 / 5.44 / 5.37) |
| — same harness, on the unmodified baseline | 5.41:1, zero failures — the change is inside run-to-run noise |
| Worst sample | dark, y=672, rgb(16,15,14) — background already near-black, so field-limited it is not |
| `tests/e2e/field-contrast.spec.ts` | **24/24 passed** |
| Deferred field chunk | **26.4 KiB gz** (410 + 690) ≤ 40 kB |
| First Load JS `/` | **108 kB** ≤ 110 kB |
| CLS | **0** |
| Frame cost, headless, same runner | site mean **0.558 ms** (dpr 1) / **0.643 ms** (dpr 2), p99 1.8 / 2.3 ms, max 2.9 ms — against the prototype's 0.797 / 0.955 ms on the same runner |
| Bloom iterations device-tiered | unchanged — `full` 6, `reduced` 2, `off` 0 |
| Zero 3D bytes under `prefers-reduced-motion` | confirmed — chunks 410 and 690 are never requested; poster renders, no canvas |
| Zero WebGL draws, tab hidden | confirmed — 1650 draws / 2.5 s visible, **0** hidden, 1650 on return |
| Poster for JS-off | confirmed — 1 poster, 0 canvas with JavaScript disabled |
| `readPixels` in a shipped chunk | **absent** from every production chunk |
| `FIGURE_FALLBACK_*` | still deleted |
| Scrim carves the composite *after* tonemapping | unchanged — `post.shader.ts` not touched |
| Additive emitters only, no flat gold fill | unchanged — `point.shader.ts` not touched |
| Typecheck / lint / unit tests | clean / clean / **338 passed** |

### A8.6 — the poster

The poster did **not** need re-authoring, and this is an argument rather than an
assertion. `lattice/project.ts` projects the **attestation** framing
(`CAMERA_HEIGHT` 0.86, `FIELD_TILT_X` −1.41), both unchanged; the hero focus
lobe does not appear in it; and the poster has no bloom pass at all (no
`feGaussianBlur`, no dependency on `BLUR_RADII`) — its halos are the five
`<radialGradient>` depth bands, which approximate the *sprite*, and the sprite
is untouched. Neither change alters the staging the poster is a still of.

## Honest judgement

The field now matches the reference on every measure I can take of it, and on a
retina panel it is materially closer than it was — the crest blooms in the
prototype's narrower band instead of a 28% wider one, and the hero's focus lobe
no longer spends its energy under the scrim.

The remaining difference between the two full frames is **not in the field**.
The prototype's hero is left-aligned, so its type occupies the left third and
the crest has the right two-thirds to itself. This hero is centre-aligned, so
the scrim carves the middle ~51% of the frame's width and the field reads as two
lit wings around a dark column. That is a composition property of the hero
layout, not of `src/components/three/**`, and no amount of focus-lobe or bloom
tuning reaches it — the measurements above show the field is already at or above
the reference's light level and concentration in the regions where it is
visible at all. If the site owner wants the prototype's single unobstructed
crest, the change is to the hero's text alignment, and it belongs to whoever
owns that component.
