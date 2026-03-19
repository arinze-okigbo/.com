/**
 * EXPERIENCE — Structured timeline with editorial clarity
 * 
 * Design: Noir Editorial
 * - Clean timeline layout with left-aligned dates
 * - Minimal borders, strong hierarchy through typography
 * - Each entry reveals on scroll with subtle hover interaction
 */

import { motion } from "framer-motion";
import { SectionReveal, RevealItem } from "./SectionReveal";
import { ease, duration } from "@/lib/motion";

interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  description: string;
  tags?: string[];
}

const experiences: ExperienceEntry[] = [
  {
    role: "Founder & CEO",
    company: "Stealth Startup",
    period: "2024 — Present",
    description:
      "Building next-generation infrastructure at the intersection of AI and security. Leading product strategy, engineering, and fundraising.",
    tags: ["Leadership", "AI", "Security"],
  },
  {
    role: "Software Engineer",
    company: "Enterprise Tech",
    period: "2023 — 2024",
    description:
      "Designed and shipped high-performance backend systems handling millions of daily transactions. Reduced latency by 40% through architectural improvements.",
    tags: ["Backend", "Systems", "Scale"],
  },
  {
    role: "Research Assistant",
    company: "University Lab",
    period: "2022 — 2023",
    description:
      "Conducted research in machine learning and natural language processing. Published findings on efficient transformer architectures for resource-constrained environments.",
    tags: ["ML", "NLP", "Research"],
  },
  {
    role: "Software Engineering Intern",
    company: "Fintech Company",
    period: "2022",
    description:
      "Built payment processing features and internal tooling. Contributed to a system processing $2M+ in daily transactions.",
    tags: ["Fintech", "Payments", "Full-stack"],
  },
];

function ExperienceCard({ entry, index }: { entry: ExperienceEntry; index: number }) {
  return (
    <motion.div
      className="group grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-16 py-8 md:py-10 border-b border-white/[0.04]"
      whileHover={{ x: 3 }}
      transition={{ duration: duration.fast, ease: ease.out }}
    >
      {/* Date column */}
      <div className="flex items-baseline gap-3 md:flex-col md:gap-1.5 md:pt-1">
        <span className="text-mono text-[0.65rem] text-foreground/20">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-mono text-xs text-foreground/35">
          {entry.period}
        </span>
      </div>

      {/* Content column */}
      <div>
        <h3 className="heading-section text-lg md:text-xl text-foreground/85 mb-1 group-hover:text-primary transition-colors duration-300">
          {entry.role}
        </h3>
        <p className="text-mono text-[0.7rem] text-primary/40 mb-3 tracking-[0.1em]">
          {entry.company}
        </p>
        <p className="text-body text-sm text-foreground/35 leading-relaxed max-w-lg mb-4">
          {entry.description}
        </p>

        {entry.tags && (
          <div className="flex flex-wrap gap-3">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="label-caps text-[0.55rem] text-foreground/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Experience() {
  return (
    <section id="experience" className="relative py-28 md:py-40">
      {/* Section counter */}
      <span className="section-counter">02</span>

      <SectionReveal className="container">
        <RevealItem>
          <div className="flex items-baseline gap-4 mb-3">
            <span className="label-caps text-primary/50">02</span>
            <h2 className="heading-section text-3xl md:text-4xl lg:text-5xl">
              Experience
            </h2>
          </div>
        </RevealItem>

        <RevealItem>
          <p className="text-body text-foreground/35 max-w-lg mb-12 md:mb-16 text-base">
            A track record of building impactful systems across startups,
            enterprise, and research.
          </p>
        </RevealItem>

        {/* Top border for the list */}
        <div className="border-t border-white/[0.04]">
          {experiences.map((entry, i) => (
            <RevealItem key={entry.role + entry.company}>
              <ExperienceCard entry={entry} index={i} />
            </RevealItem>
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}
