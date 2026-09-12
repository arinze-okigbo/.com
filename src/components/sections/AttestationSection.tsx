import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { ATTESTATION } from "@/content/attestation";

/**
 * The attestation — `docs/15 §3` row 3, `docs/05 §3.3`. **New section**, and
 * the field's own moment.
 *
 * The boxed figure that used to sit inside `#work` is deleted; its copy is
 * promoted here and its geometry is promoted into the page's ground. The
 * section is the field's stage direction rather than its container: energy
 * 1.30, flow 1.18, the camera rises, and Acts II and III scrub against this
 * section's passage. All of that lives in `three/field/attention.ts` and is
 * addressed by nothing more than `data-field-section="attestation"`.
 *
 * ## What this section deliberately does NOT have
 *
 * **A heading.** `docs/15 §3` row 3 — it is titled by its eyebrow, which
 * preserves the [R9] headings chain: a reader who scans only the headings
 * gets the same argument as before the port. That is also why there is no
 * `aria-labelledby` here; a region named by nothing is worse than a plain
 * `<section>`, so it is not given a `region` role to begin with.
 *
 * **A readout row.** `docs/15 §2.11` re-sites the live readout as `FieldHud`,
 * a fixed server-rendered element mounted once in `layout.tsx` and patched in
 * place by the deferred chunk. Rendering `AttestationReadout` here as well
 * would put a second A7 `✓` glyph in the same viewport as the HUD's, which
 * `docs/04 §3.5` F9 counts as a second accent group. One readout, one glyph.
 *
 * **A CSS scrim.** The `data-scrim` values below are packed into the composite
 * pass as a rounded-box SDF and carve darkness out of the field itself
 * (`docs/04 §3.5` A8.3). Laying an `rgba()` sheet over the canvas instead
 * would mean the contrast check samples pixels that are not the pixels behind
 * the type, which is how a field ships "compliant" and invisible.
 *
 * ## Give it silence
 *
 * `docs/15 §2.11` M8.5: the headline, the honesty prose, and nothing else.
 * The second paragraph of `ATTESTATION.caption` — *"The signature seeds a
 * shape. It encrypts nothing and secures nothing."* — is non-optional and
 * stays prose rather than becoming a HUD line.
 */

/**
 * Heavier and wider than the `30,18,0.94` every other section's prose uses,
 * because this section runs the field at its highest authored energy — 1.30,
 * `docs/15 §3` row 3, the field's own moment. At 0.94 the panel prose measured
 * **4.30:1** on a lit gold pixel in light mode: below the 4.5 floor, and only
 * here, because only here is the field this bright behind body copy.
 *
 * `docs/04 §3.5` A8.4's remedy order, taken in order: raise the amount, then
 * widen the padding. Lowering the field's energy is the last resort and
 * dimming the ramp is not a remedy at all — and neither is reaching for a
 * brighter ink, which is the same move refused for the eyebrow below.
 */
const BODY_SCRIM = "34,22,0.98";

/**
 * The eyebrow gets its OWN rect, and it is the one block in this section that
 * earns a second slot.
 *
 * It sits at the very top edge of the section, where the section-level carve
 * is feathered weakest — A8.3 feathers asymmetrically so the field stays
 * bright right up to the edge of the column — and it is the dimmest string on
 * the stage, `--field-fg-muted` (6.83:1 static, §3.7). Measured on composited
 * pixels it came back at **6.71:1** in the dimmest path: above the 4.5 floor,
 * below the 7:1 ship target.
 *
 * `docs/04 §3.5` A8.4 fixes the remedy order for exactly this case — *"raise
 * the `data-scrim` amount, widen its padding, or move the block"* — and names
 * the alternative as not a remedy at all. Substituting `--field-fg-secondary`
 * here would buy the ratio by collapsing the eyebrow onto the body value,
 * which is both an F6 breach (eyebrow text is `--color-foreground-muted`) and
 * the same mistake as dimming the ramp toward grey, pointed the other way:
 * fixing the composite by editing the design instead of the carve.
 *
 * Tighter vertically than `BODY_SCRIM` because the block is one line tall.
 */
const EYEBROW_SCRIM = "30,14,0.98";

export function AttestationSection(): ReactNode {
  return (
    <Section id={ATTESTATION.id} width="wide" field="stage" fieldState="attestation">
      <p className="eyebrow" data-scrim={EYEBROW_SCRIM}>
        {ATTESTATION.sectionEyebrow}
      </p>

      <hr className="lit-rule mt-[var(--rhythm-meta)]" data-lit />

      <Reveal className="mt-[var(--rhythm-heading)]">
        {/* `data-lit` sits on the PANEL, not on the `Reveal` wrapper and not on
            the section. `--lx` / `--ly` are percentages of the element's own
            border box, so the lamp has to be resolved against the box that
            actually carries the lit edge — resolving it against an ancestor and
            letting the custom property inherit puts the specular in the wrong
            place on every element that is not exactly the ancestor's size. */}
        <div className="panel" data-lit data-scrim={BODY_SCRIM}>
          {ATTESTATION.caption.map((paragraph, index) => (
            <p
              key={`attestation-p${index}`}
              className="mt-[var(--rhythm-paragraph)] first:mt-0 text-body text-foreground max-w-[var(--measure-prose)]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
