import type { ReactNode } from "react";

import { AboutSection } from "@/components/sections/AboutSection";
import { AttestationSection } from "@/components/sections/AttestationSection";
import { CeremonySection } from "@/components/sections/CeremonySection";
import { ContactSection } from "@/components/sections/ContactSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { SelectedWorkSection } from "@/components/sections/SelectedWorkSection";
import { WritingSection } from "@/components/sections/WritingSection";

/**
 * The page. One column, eight slots, `docs/15 §3`.
 *
 * Order still descends the [R13] evidence hierarchy — shipped product, work
 * experience and technical depth first, then writing, then biography, then the
 * exit. **No existing section moved.** The port adds two, both between `#work`
 * and `#projects`:
 *
 *   1. Hero                        gate        [R1-R7]   field energy 1.30
 *   2. Selected work   #work       tiers 1-3             field cools to 0.88
 *   3. The attestation #attestation  NEW                 field energy 1.30
 *   4. The ceremony    #ceremony     NEW                 field drops to 0.55
 *   5. Projects        #projects   tier 1/5              field 0.80
 *   6. Writing         #writing    tier 4 — renders null at launch, docs/05 §6
 *   7. About           #about      tier 6                field 0.70
 *   8. Contact         #contact    exit                  field 0.40
 *
 * ## Why the ceremony sits at position 4
 *
 * `docs/15 §3.1`: it is the live proof of the entry at position 2, and the two
 * new sections read as a deliberate pair whose order is the argument —
 * `#attestation` says *this shape came out of a real signature, and it secures
 * nothing*; `#ceremony` answers *this, by contrast, is the real thing*. That
 * adjacency is also the strongest answer to `docs/11 §6`'s failure mode 2,
 * spectacle unrelated to the domain: the field stops being atmosphere the
 * moment the section after it fires the visitor's Touch ID. Putting the demo
 * after Projects would separate the claim from its proof by a screenful and
 * waste the setup.
 *
 * ## What the field reads from this file
 *
 * Nothing is imported, subscribed to or wired up here. Each section carries
 * `data-field-section`, and `three/field/attention.ts` observes those
 * attributes. An unrecognised value falls back to the low-energy state rather
 * than throwing, so adding a section can never break the field, and the page
 * renders identically when the field never mounts at all.
 *
 * ## Before you add a section here, read this
 *
 * **The page height budget is binding at 1440×900, and the headroom is thin.**
 * `docs/05 §12.1` settles a ruling that took three agents to get right, and the
 * two things a future pass needs from it are:
 *
 * - The governing check is **≤6.00 vp at 1440×900** — the viewport R14's own
 *   sentence names. `docs/04 §13` used to assert R14 was "viewport-independent"
 *   and that assertion is **rescinded**: it imposed a desktop-calibrated cap at
 *   mobile, which is a silent tightening (measured reflow inflation between the
 *   two viewports is 1.36×) and it manufactured a defect against a page that
 *   was passing. A separate calibrated companion, ≤8.00 vp at 390×844, exists
 *   for mobile.
 * - Measured after the port: **≈5.67 vp desktop, ≈7.09 vp mobile**. Desktop
 *   headroom is **0.33 vp — 5.5%**; mobile has 0.91. So **1440×900 is the
 *   binding constraint**, and a new section must be checked against it first.
 *   Not mobile, and not 1280×900, which flatters `#ceremony` by 38%.
 *
 * A section that pushes desktop over reopens `docs/05 §12.1` rather than being
 * absorbed. Two things that are NOT available as easy viewport headroom, both
 * deliberate and both load-bearing: `.site-footer`'s block-end padding is
 * WCAG 2.2 SC 2.4.11 clearance for the fixed `FieldHud` over focusable footer
 * links, and `.panel`'s block padding is half of the §2.6 elevation pair.
 *
 * Every section is a Server Component and every string is in the initial HTML,
 * so the whole page reads with JavaScript disabled [R4, R30] — including both
 * new sections. `#attestation` is prose; `#ceremony` server-renders its
 * heading, honesty notice and decoded sample and only the live ceremony needs
 * script.
 */
export default function HomePage(): ReactNode {
  return (
    <>
      <HeroSection />
      <SelectedWorkSection />
      <AttestationSection />
      <CeremonySection />
      <ProjectsSection />
      <WritingSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
