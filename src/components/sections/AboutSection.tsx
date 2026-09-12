import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CredentialsLine } from "@/components/sections/primitives/CredentialsLine";
import { ABOUT, aboutParagraphs, credentialsLine, educationLine } from "@/content/about";

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
    <Section id={ABOUT.id} labelledBy={ABOUT.headingId} field="over" fieldState="about">
      <SectionHeading id={ABOUT.headingId} scrim={HEADING_SCRIM} level={2}>
        {ABOUT.heading}
      </SectionHeading>

      <Reveal className="mt-[var(--rhythm-heading)]">
        <div data-scrim={BODY_SCRIM}>
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

          {/* LEVER 2, executed. `docs/05 §12.1` takes D17's named cut: the
              `credentialsDetailLine` row is no longer rendered, −0.14 vp. The
              strings stay in `src/content/about.ts` and stay enumerated by
              `content.test.ts` — this is a composition change, not a copy
              deletion, so restoring the row is one line and no copy is lost.
              [R22] still holds: the grant-shaped credentials that remain have
              exactly one compact home and no heading of their own. */}
          <div className="mt-[var(--space-8)] flex flex-col gap-[var(--rhythm-meta)]">
            <CredentialsLine items={credentialsLine} />
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
