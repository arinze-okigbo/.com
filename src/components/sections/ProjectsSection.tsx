import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectEntry } from "@/components/sections/primitives/ProjectEntry";
import { PROJECTS, projectEntries } from "@/content/projects";

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
 * Projects — `docs/05 §3.4`. Self-directed shipped work with a real repo.
 *
 * Below the employed work because `docs/03 A3` ranks a shipped product with real
 * users and work experience above a personal repo, and [R28] caps GitHub's
 * weight: it is linked here, never featured. No activity graph, no repo grid.
 */
export function ProjectsSection(): ReactNode {
  return (
    <Section id={PROJECTS.id} labelledBy={PROJECTS.headingId} field="over" fieldState="projects">
      <SectionHeading
        id={PROJECTS.headingId}
        scrim={HEADING_SCRIM}
        level={2}
        intro={PROJECTS.intro ?? undefined}
      >
        {PROJECTS.heading}
      </SectionHeading>

      <div className="mt-[var(--rhythm-heading)] flex flex-col gap-[var(--rhythm-entry)]">
        {projectEntries.map((project, index) => (
          <Reveal key={project.id} index={index}>
            <div data-scrim={BODY_SCRIM}>
              <ProjectEntry
                id={project.id}
                artifact={project.artifact}
                href={project.href}
                mechanism={project.mechanism}
                meta={project.meta}
              >
                {project.body.map((paragraph, paragraphIndex) => (
                  <p
                    key={`${project.id}-b${paragraphIndex}`}
                    className="mt-[var(--rhythm-paragraph)] text-body text-foreground max-w-[var(--measure-prose)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </ProjectEntry>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
