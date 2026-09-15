import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkEntry } from "@/components/sections/primitives/WorkEntry";
import { SELECTED_WORK, workEntries } from "@/content/work";

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
 * The boxed attestation figure that used to sit after the Queralt entry is
 * DELETED (`docs/15 §3.3`): the geometry is promoted into the page's ground
 * and the copy into `#attestation`, the section immediately after this one.
 * `FIGURE_AFTER_ENTRY_ID` and the `AttestationFigure` import go with it.
 *
 * The section column stays `wide` (768px) so the lit entry panels have room to
 * breathe; every prose block is clamped back to the 672px measure.
 */
export function SelectedWorkSection(): ReactNode {
  return (
    // `field="over"` — over the field in DARK mode only. `docs/04 §3.5` A8.2:
    // in light mode the field masks out behind this section and the entries
    // sit on `--color-background`, where §2.6's DEV-3 rule applies unchanged
    // and no panel carries a shadow. The class is unconditional; the switch it
    // sets (`--panel-elevation` / `--panel-ring`) is the part that is theme-
    // scoped, in CSS, so a JS-disabled render is correct in both themes.
    <Section
      id={SELECTED_WORK.id}
      labelledBy={SELECTED_WORK.headingId}
      width="wide"
      field="over"
      fieldState="work"
    >
      <div className={PROSE_COLUMN}>
        <SectionHeading
          id={SELECTED_WORK.headingId}
          scrim={HEADING_SCRIM}
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
              {/* `docs/15 §3` row 2 — entries become lit panels over the
                  field: `--field-panel` + `--edge-lit` + `--shadow-panel`,
                  plus the masked gold ring. `data-lit` is on the panel itself
                  because `--lx` / `--ly` are percentages of its own border
                  box; resolving the lamp against an ancestor and inheriting it
                  puts the specular in the wrong place. */}
              <div className="panel" data-lit data-scrim={BODY_SCRIM}>
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
              </div>
            </Reveal>
          </div>
        ))}
      </div>
    </Section>
  );
}
