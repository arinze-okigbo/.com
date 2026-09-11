import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactBlock } from "@/components/sections/primitives/ContactBlock";
import { CONTACT, contactEmail, contactLinks, contactPrimaryAction } from "@/content/contact";

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
    <Section id={CONTACT.id} labelledBy={CONTACT.headingId} isLast>
      <SectionHeading id={CONTACT.headingId} level={2}>
        {CONTACT.heading}
      </SectionHeading>

      <Reveal className="mt-[var(--rhythm-heading)]">
        <ContactBlock
          email={contactEmail}
          links={contactLinks}
          primaryAction={
            <Button as="a" href={contactPrimaryAction.href} variant="primary">
              {contactPrimaryAction.label}
            </Button>
          }
        />
      </Reveal>
    </Section>
  );
}
