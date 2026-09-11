import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectEntry } from "@/components/sections/primitives/ProjectEntry";
import { PROJECTS, projectEntries } from "@/content/projects";

/**
 * Projects — `docs/05 §3.4`. Self-directed shipped work with a real repo.
 *
 * Below the employed work because `docs/03 A3` ranks a shipped product with real
 * users and work experience above a personal repo, and [R28] caps GitHub's
 * weight: it is linked here, never featured. No activity graph, no repo grid.
 */
export function ProjectsSection(): ReactNode {
  return (
    <Section id={PROJECTS.id} labelledBy={PROJECTS.headingId}>
      <SectionHeading id={PROJECTS.headingId} level={2} intro={PROJECTS.intro ?? undefined}>
        {PROJECTS.heading}
      </SectionHeading>

      <div className="mt-[var(--rhythm-heading)] flex flex-col gap-[var(--rhythm-entry)]">
        {projectEntries.map((project, index) => (
          <Reveal key={project.id} index={index}>
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
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
