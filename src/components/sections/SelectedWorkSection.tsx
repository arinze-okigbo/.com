import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { AttestationFigure } from "@/components/three";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkEntry } from "@/components/sections/primitives/WorkEntry";
import { ATTESTATION } from "@/content/attestation";
import { SELECTED_WORK, workEntries } from "@/content/work";

/** The attestation figure sits immediately after this entry. `docs/05 §3.3`. */
const FIGURE_AFTER_ENTRY_ID = "queralt";

/** Clamps prose to the 672px measure inside the 768px section column. */
const PROSE_COLUMN = "mx-auto max-w-[var(--container-prose)]";

/**
 * Selected work — `docs/05 §3.2`. Screenfuls 2–4.
 *
 * Entries are ordered by difficulty-legibility, not by date [03 B2]: Splita,
 * then Queralt Inc., then Snorkel AI. The Cyera entry is cut under the
 * `docs/05 §3.3` ship-gate because `docs/05 §11 Q2` is unanswered, and the
 * heading and intro strings follow the entry count from `src/content/work.ts` —
 * restoring Cyera is a data change, not a refactor.
 *
 * The section column is `wide` (768px) so the attestation figure gets the full
 * width; every prose block is clamped back to the 672px measure.
 */
export function SelectedWorkSection(): ReactNode {
  return (
    <Section id={SELECTED_WORK.id} labelledBy={SELECTED_WORK.headingId} width="wide">
      <div className={PROSE_COLUMN}>
        <SectionHeading
          id={SELECTED_WORK.headingId}
          level={2}
          intro={SELECTED_WORK.intro ?? undefined}
        >
          {SELECTED_WORK.heading}
        </SectionHeading>
      </div>

      <div className="mt-[var(--rhythm-heading)] flex flex-col gap-[var(--rhythm-entry)]">
        {workEntries.map((entry, index) => (
          <div key={entry.id}>
            <Reveal className={PROSE_COLUMN} index={index}>
              <WorkEntry
                id={entry.id}
                artifact={entry.artifact}
                href={entry.href}
                mechanism={entry.mechanism}
                contribution={entry.contribution[0]}
                role={entry.role}
                org={entry.org}
                period={entry.period}
                domain={entry.domain}
                outcome={entry.outcome}
              >
                {entry.contribution.slice(1).map((paragraph, paragraphIndex) => (
                  <p
                    key={`${entry.id}-c${paragraphIndex}`}
                    className="mt-[var(--rhythm-paragraph)] text-body text-foreground max-w-[var(--measure-prose)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </WorkEntry>
            </Reveal>

            {/* A plain <div>, NOT a nested <Container width="wide">. The
                Section already renders the 768px wide column; nesting a second
                Container inside it applies `padding-inline: var(--gutter)` a
                second time and the figure came out at 672px instead of 768px.
                The prose blocks above are clamped back to the 672px measure by
                PROSE_COLUMN; the figure is the one thing that takes the whole
                column, so it needs no wrapper of its own. */}
            {entry.id === FIGURE_AFTER_ENTRY_ID && (
              <div className="mt-[var(--space-12)]">
                <AttestationFigure alt={ATTESTATION.posterAlt} caption={ATTESTATION.caption} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
