import type { ReactNode } from "react";

import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SelectedWorkSection } from "@/components/sections/SelectedWorkSection";
import { WritingSection } from "@/components/sections/WritingSection";

/**
 * The page. One column, six sections, `docs/05 §1`.
 *
 * Order descends the [R13] evidence hierarchy exactly — shipped product, work
 * experience and technical depth first, then writing, then biography, then the
 * exit. No reorder of the six was required.
 *
 *   1. Hero            gate       [R1–R7]
 *   2. Selected work   tiers 1–3  #work      (carries the attestation figure)
 *   3. Projects        tier 1/5   #projects
 *   4. Writing         tier 4     #writing   — renders null at launch, docs/05 §6
 *   5. About           tier 6     #about
 *   6. Contact         exit       #contact
 *
 * Every section is a Server Component and every string is in the initial HTML,
 * so the whole page reads with JavaScript disabled [R4, R30].
 */
export default function HomePage(): ReactNode {
  return (
    <>
      <HeroSection />
      <SelectedWorkSection />
      <ProjectsSection />
      <WritingSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
