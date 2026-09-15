/**
 * The contract between page composition and the attestation field.
 *
 * Four attributes, no imports in either direction, and no shared runtime. The
 * field (`src/components/three/field/`) observes the DOM for these; the page
 * writes them. Neither side can break the other, and a page rendered with the
 * field absent — JS disabled, reduced motion, forced colours, no WebGL — is
 * indistinguishable from one rendered before the field mounts.
 *
 * This module exists so `Container` and `Section` express that contract the
 * same way. It is types and one lookup table; it ships no component.
 */

/**
 * How an element sits relative to the field — `docs/04 §3.5` A8.2, which is
 * the reason there are two values and not a boolean.
 *
 * - `"stage"` — over the field in **both** themes (`#hero`, `#attestation`,
 *   `#ceremony`). Takes the `.stage` token scope unconditionally, **in CSS**,
 *   which is the single highest-consequence detail in the field work: if that
 *   scope were applied by script, a light-mode visitor with JS disabled would
 *   get `#1a1a1a` body copy on `#0a0908` — 1.14:1, worse than the failure the
 *   port exists to correct.
 * - `"over"` — over the field in **dark mode only**. In light mode the field
 *   masks out behind these sections and they sit on `--color-background`,
 *   where `docs/04 §2.6`'s DEV-3 rule applies unchanged and no panel carries a
 *   shadow. The class is unconditional; the switch it sets is theme-scoped.
 */
export type SectionField = "stage" | "over";

/**
 * The energy state the field runs at under this block — `docs/15 §3`. Read by
 * `three/field/attention.ts`. An unrecognised value falls back to the
 * low-energy `work` state rather than throwing, so adding a section can never
 * break the field.
 */
export type SectionFieldState =
  | "hero"
  | "work"
  | "attestation"
  | "ceremony"
  | "projects"
  | "about"
  | "contact";

/**
 * Props every element that composites over the field accepts. Optional
 * throughout: an element that declares none of them is simply not part of the
 * composition, which is the correct default for a primitive.
 */
export interface FieldCompositeProps {
  /** See {@link SectionField}. Adds the `.stage` / `.over-field` scope. */
  readonly field?: SectionField;
  /** Emitted as `data-field-section`; drives the field's energy state. */
  readonly fieldState?: SectionFieldState;
  /**
   * `"padX,padY,amount"` — `docs/04 §3.5` A8.3. This element's live rect is
   * packed into the composite pass as a rounded-box SDF and **carves darkness
   * out of the field itself**, feathered.
   *
   * It is deliberately NOT a CSS sheet laid over the canvas, and the
   * difference is the entire basis of A8.4: the pixels sampled for the
   * contrast check are the pixels behind the type. A CSS overlay would measure
   * something other than what renders, which is how a field ships "compliant"
   * and invisible. **Never add one.**
   *
   * ## Put it on the TEXT BLOCK, never on the `<section>`
   *
   * A8.3 says "every **text block** composited over the field declares
   * `data-scrim`", and `docs/15 §2.10` fills the six slots from "the six
   * `[data-scrim]` **blocks** nearest the viewport centre". A section rect is
   * neither, and carving one extinguishes the field for the section's whole
   * length. This shipped before it was caught: the red channel across the
   * viewport behind `#work` peaked at **12/255**, against the hero's 15–84.
   * The receding plane `docs/15 §3` row 2 asks for was simply not there.
   *
   * ## The predicate is TEXT COVERAGE, not height
   *
   * This is the part that is easy to get wrong, and stating it as a height
   * rule — which an earlier version of this comment did — teaches the wrong
   * fix. `three/field/scrim.ts`'s `isCarvableScrim()` sums the line rects
   * `Range.getClientRects()` returns and divides by the box height: **prose
   * lands near 1, a container near 0**, and the floor is 0.5. A container-
   * shaped scrim is skipped rather than carved, so the failure degrades to
   * "no carve" instead of "a screenful of dead field".
   *
   * **A tall block is not the defect.** At 320px wide, five leaf scrims on
   * this page exceed the viewport and every one is genuine prose whose text
   * fills it; a 919px prose block is correct and a 400px container is not.
   * Shrinking or splitting a block that is mostly text fixes nothing and
   * costs a document its structure.
   *
   * ## The six-slot budget is the mechanism, not a limit to design around
   *
   * Only the blocks nearest the viewport centre are carved; the rest of the
   * field stays lit, which is the whole point. Splitting a block raises the
   * candidate count and costs nothing. Peak pressure is **9 candidates against
   * 6 slots, 3 dropped**.
   *
   * ## Do not restate this as a rule about geometry
   *
   * Three attempts were made to explain why dropping three blocks is safe, in
   * terms of where they sit. All three were confidently stated and two of them
   * are in this file's history:
   *
   * 1. *"the dropped block is below the fold"* — **false**, they are often on
   *    screen;
   * 2. *"a tall rect is the defect"* — **false**, see the coverage section;
   * 3. *"no dropped block has more than ~120px visible"* — asserted from a
   *    180px sweep, then "corrected" to 179px / 228px from a 40px sweep, then
   *    measured at **112px** / **129px** render-free. Every figure came from a
   *    different instrument and every instrument gave a different answer. A
   *    150px sweep reports 89px at one width and 258px at another — not merely
   *    coarse but **non-monotonic**, so a coarse figure is not even a bound.
   *    The 179/228 pair was worse than coarse: it read `data-scrim-dropped`
   *    off the DOM *after* a render, and at ~264ms a composited frame against
   *    a 40ms wait the attribute lags the scroll by several steps, so the
   *    maximum was taken over mismatched position/telemetry pairs. The
   *    original ~120px turned out to be about right, and was not earned.
   *
   * The reason it is safe is **not geometric and cannot be**: at the exact
   * scroll position where the largest block loses its slot, the composited
   * contrast still clears the A8.4 floor, because the field is already dark
   * where those blocks sit. That measurement has been stable across every
   * instrument tried — 9.40:1 desktop and 9.51:1 mobile render-free, 7.04:1
   * from the line-rect framebuffer probe, 11.27:1 dark and 16.52:1 light from
   * a screenshot at true gutter. **Four stories about geometry, three false
   * and one accidentally near-right; one measurement, stable throughout.**
   * A8.4's floor is the requirement; every geometric story about it has been a
   * proxy, and every proxy so far has been wrong.
   *
   * **If you need to check this, read the tracker's telemetry — do not
   * reimplement it.** `scrim.ts` publishes `data-scrim-dropped` as
   * `"<count>:<maxVisiblePx>"` from the real tracker, and there is a CI gate
   * that sweeps at 40px, finds peak pressure from that telemetry and asserts
   * the floor *there*. A second implementation of the selection logic is what
   * produced the `isLeafScrim` divergence in the first place.
   *
   * One trap if you sample a SCREENSHOT: taking "the ground" at a fixed
   * fraction of viewport width lands *inside* the text column at narrow
   * widths. At 1280 the work panel spans 304–976 and x=18% is a real gutter;
   * at 768 it spans 48–720 and x=18% is on the glyphs. That produced a phantom
   * 1.21:1 against pure white in dark mode, which is not a colour any dark
   * token holds — measure against the element's own line rects instead.
   *
   * This trap is specific to the instrument, which is the general lesson. A
   * screenshot has the type composited into it, so landing on a glyph reads
   * the glyph; a `gl.readPixels` framebuffer readback contains no DOM text at
   * all, so sampling *across* the line rects is exactly right there — it reads
   * the field pixel behind the glyph. The same sampling strategy is a bug in
   * one harness and the correct method in the other.
   *
   * Different blocks may want different carves — the hero's headline takes a
   * tight, light one because it wants to stay backlit, its prose a generous,
   * near-opaque one because it wants to be legible.
   *
   * ## A silent console is NOT evidence the rects are fine
   *
   * `three/field/scrim.ts` has a guard for this — `reportScrimMisuse` warns
   * when a scrim is container-shaped. **It is development-only**, and it is
   * stripped from every production chunk along with the contrast harness. So
   * it cannot fire in the build anyone actually profiles, screenshots or hands
   * to a reviewer. A CI sweep at 1440 / 1024 / 768 / 390 / 320 is the
   * enforcement; this comment is the reason.
   *
   * This is not hypothetical and it is not one lane's mistake. Both the page
   * and the ceremony shipped container-shaped rects under a silent production
   * console — three at once, none of which produced a single warning. They
   * were found by measuring the live page, not by reading a console.
   *
   * The same failure produced two other misses on the same day: a Playwright
   * matrix whose two configured widths were both clean while 320 was not, and
   * a scan of mine that stepped too coarsely and swept only one section. All
   * three were the same mistake — **the check ran somewhere the defect
   * wasn't** — and none of them announced itself.
   *
   * So: when you add or move a `data-scrim`, measure the rect. Do not infer
   * from quiet. The failure is silent by construction — the symptom of a
   * too-large carve is a dead field **and a better contrast number**, which is
   * the one combination that looks like success from every angle a check
   * normally looks from.
   */
  readonly scrim?: string;
  /**
   * Marks this element as a consumer of the single light source
   * (`docs/04 §2.8`). `LightSourceScript`'s one rAF loop writes `--lx` / `--ly`
   * onto it as percentages **of its own border box**, so it belongs on the
   * element that carries the lit edge — putting it on an ancestor and letting
   * the custom property inherit puts the specular in the wrong place on every
   * descendant that is not exactly the ancestor's size.
   *
   * With JS disabled every consumer falls back to `--light-x` / `--light-y`,
   * so the page is lit from a fixed top-centre lamp rather than not lit.
   */
  readonly lit?: boolean;
}

const FIELD_CLASS: Readonly<Record<SectionField, string>> = {
  stage: "stage",
  over: "over-field",
};

/** The class this element takes for its field relationship, if any. */
export function fieldClass(field: SectionField | undefined): string | undefined {
  return field === undefined ? undefined : FIELD_CLASS[field];
}

/** The attributes the field observes. Shape is fixed; values may be absent. */
export interface FieldDataAttributes {
  readonly "data-field-section"?: SectionFieldState;
  readonly "data-scrim"?: string;
  readonly "data-lit"?: string;
}

/**
 * Builds the attribute set. Returns a new object every call and reads nothing
 * outside its arguments — `undefined` values are omitted by React, so an
 * element that opts into none of this renders byte-identical markup.
 */
export function fieldAttributes({
  fieldState,
  scrim,
  lit,
}: FieldCompositeProps): FieldDataAttributes {
  return {
    "data-field-section": fieldState,
    "data-scrim": scrim,
    "data-lit": lit ? "" : undefined,
  };
}
