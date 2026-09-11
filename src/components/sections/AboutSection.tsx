import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CredentialsLine } from "@/components/sections/primitives/CredentialsLine";
import {
  ABOUT,
  aboutParagraphs,
  credentialsDetailLine,
  credentialsLine,
  educationLine,
} from "@/content/about";

/**
 * About — `docs/05 §3.5`. Screenful 5.
 *
 * [R23] education appears exactly once, as one line, and lives here.
 * [R22] the Tyree Fellowship and the World Bank Youth Summit are grant-shaped:
 * they may not appear in the first two screenfuls and may not hold a section of
 * their own. This is their one compact home, in caption type, with no heading.
 *
 * No skills list, no stat counters, no achievement cards [R17, R18].
 */
export function AboutSection(): ReactNode {
  return (
    <Section id={ABOUT.id} labelledBy={ABOUT.headingId}>
      <SectionHeading id={ABOUT.headingId} level={2}>
        {ABOUT.heading}
      </SectionHeading>

      <Reveal className="mt-[var(--rhythm-heading)]">
        {aboutParagraphs.map((paragraph, index) => (
          <p
            key={`about-p${index}`}
            className="mt-[var(--rhythm-paragraph)] first:mt-0 text-body text-foreground max-w-[var(--measure-prose)]"
          >
            {paragraph}
          </p>
        ))}

        <p className="mt-[var(--rhythm-paragraph)] text-body text-foreground max-w-[var(--measure-prose)]">
          {educationLine}
        </p>

        <div className="mt-[var(--space-8)] flex flex-col gap-[var(--rhythm-meta)]">
          <CredentialsLine items={credentialsLine} />
          <CredentialsLine items={credentialsDetailLine} />
        </div>
      </Reveal>
    </Section>
  );
}
