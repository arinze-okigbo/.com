import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactBlock } from "@/components/sections/primitives/ContactBlock";
import { CONTACT, contactEmail, contactLinks, contactPrimaryAction } from "@/content/contact";

/**
 * `padX,padY,amount` — `docs/15 §2.10`. It belongs on the TEXT BLOCK, never on
 * the `<section>`.
 *
 * The rule, the measurements and the reason a too-large carve is expensive are
 * on the `scrim` prop in `src/components/ui/field.ts`. Deliberately stated
 * once and pointed at from here: this note used to be copied into four section
 * files, and when the predicate changed all four became wrong at the same time
 * in the same way.
 */
/**
 * Held at 0.94, and it was briefly 0.97 — the wrong fix, recorded so it is not
 * made again.
 *
 * Re-staging the hero on a resolved lattice made the field genuinely bright,
 * and the worst string over these sections dropped to 5.01:1. Raising the carve
 * bought some of that back. It was treating a symptom: the composite was
 * carving an HDR value and tonemapping the result, so the authored amount was
 * never the fraction of light that actually survived — see the note on the
 * tonemap in `three/field/post.shader.ts`. With the order corrected, 0.94 means
 * 0.94 and these sections measure 5.5-5.7:1 against their ink's own ceiling of
 * **5.88:1** (`--color-foreground-muted` `#8C877E` cannot reach 7:1 on pure
 * black, so A8.4's ship target is unreachable here by any carve at all).
 *
 * The extra 0.03 is given back to the field rather than banked, because what it
 * buys in contrast is 0.1:1 and what it costs is the receding plane `docs/15
 * §3` asks these sections to sit above.
 */
const BODY_SCRIM = "30,18,0.94";

/** The heading group carries its own, tighter: fewer lines, larger type. */
const HEADING_SCRIM = "30,14,0.94";

/**
 * Contact — `docs/05 §3.6`. Screenful 6, the exit point.
 *
 * The heading IS the email address, which is what makes [R9] pass on the "how to
 * reach him" clause: a recruiter who scans only the headings chain and stops
 * still has the address.
 */
export function ContactSection(): ReactNode {
  return (
    // `isLast`: the last section before the footer carries the closing gap
    // (docs/04 §2.3). It used to come from `.site-footer`'s own
    // `margin-block-start`, which left `isLast` and `.section--last` dead and
    // put the gap on the wrong owner. Same rendered value, correct owner.
    <Section
      id={CONTACT.id}
      labelledBy={CONTACT.headingId}
      isLast
      field="over"
      fieldState="contact"
    >
      <SectionHeading id={CONTACT.headingId} scrim={HEADING_SCRIM} level={2}>
        {CONTACT.heading}
      </SectionHeading>

      <Reveal className="mt-[var(--rhythm-heading)]">
        <div data-scrim={BODY_SCRIM}>
          <ContactBlock
            email={contactEmail}
            links={contactLinks}
            primaryAction={
              <Button as="a" href={contactPrimaryAction.href} variant="primary">
                {contactPrimaryAction.label}
              </Button>
            }
          />
        </div>
      </Reveal>
    </Section>
  );
}
