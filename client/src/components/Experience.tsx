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
    role: "Co-Founder & CEO",
    company: "Splita",
    period: "2025 — Present",
    description:
      "Building a startup focused on simplifying group payments. Leading product direction, positioning, and execution at the intersection of fintech, coordination, and user experience.",
    tags: ["Founder", "Fintech", "Product"],
  },
  {
    role: "Software Developer Intern",
    company: "Queralt Inc.",
    period: "2025 — Present",
    description:
      "Working on authentication infrastructure and secure systems. Contributing to identity- and security-oriented engineering efforts across browser-native authentication.",
    tags: ["Security", "Infrastructure", "Auth"],
  },
  {
    role: "AI",
    company: "Snorkel AI",
    period: "2026 — Present",
    description:
      "Contributing to AI-related evaluation and workflow tasks. Supporting quality and reliability-oriented work across AI systems at the intersection of structured analysis and applied workflows.",
    tags: ["AI", "Evaluation", "Systems"],
  },
  {
    role: "B.S. in Computer Science",
    company: "Trinity College",
    period: "Expected May 2028",
    description:
      "Studying computer science with a strong interest in software development, AI, security, and systems. Building projects across startups, engineering, and technical experimentation.",
    tags: ["Education", "CS", "Technical"],
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
        <p className="text-body text-sm text-foreground/50 mb-4 leading-relaxed">
          {entry.description}
        </p>
        {entry.tags && (
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="label-caps text-[0.6rem] px-2 py-0.5 rounded border border-white/[0.05] text-foreground/30"
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
          <p className="text-body text-foreground/35 max-w-lg mb-16 md:mb-24 text-base">
            A track record of building impactful products and systems across startups, AI, security, and infrastructure.
          </p>
        </RevealItem>

        {/* Experience timeline */}
        <div className="max-w-4xl">
          {experiences.map((entry, i) => (
            <RevealItem key={`${entry.company}-${i}`}>
              <ExperienceCard entry={entry} index={i} />
            </RevealItem>
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}
