/**
 * PROJECTS — Premium card grid with depth and hover interactions
 * 
 * Design: Noir Editorial
 * - Cards with image backgrounds, subtle border, and depth on hover
 * - Hover reveals description overlay with backdrop blur
 * - Oversized section counter in background
 * - 2-column grid with consistent card sizing
 */

import { motion } from "framer-motion";
import { SectionReveal, RevealItem } from "./SectionReveal";
import { ease, duration } from "@/lib/motion";
import { ArrowUpRight } from "lucide-react";

interface Project {
  title: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
}

const projects: Project[] = [
  {
    title: "Splita",
    description:
      "A coordination-first fintech product built to remove the friction, awkwardness, and failure points of group payments. Collecting everyone's share upfront and paying the vendor in full.",
    tags: ["Fintech", "Startup", "Product", "Payments"],
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663433635030/kRBXHxgPQPt2KXqRuJwog7/project-fintech-cL5maUqM7pGMiHRcUmfD9X.webp",
  },
  {
    title: "arinzeokigbo.com",
    description:
      "A premium portfolio and digital flagship built with Next.js, TypeScript, Tailwind, and Framer Motion. Designed to present work across AI, security, infrastructure, and startups.",
    tags: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663433635030/kRBXHxgPQPt2KXqRuJwog7/hero-abstract-dvSQRePRaUi3H4D5syQms8.webp",
  },
  {
    title: "Scanner",
    description:
      "A technical project reflecting an interest in systems thinking, scanning workflows, and lower-level software structure. Built with discipline and focus on implementation.",
    tags: ["Systems", "Tooling", "C / Make", "Engineering"],
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663433635030/kRBXHxgPQPt2KXqRuJwog7/project-security-CiT2jq8XSnARJMX9wTyTrS.webp",
  },
  {
    title: "Splita Coming Soon",
    description:
      "A public-facing product and waitlist experience for Splita's launch phase. Built to communicate positioning and capture early interest from users.",
    tags: ["Marketing", "Landing Page", "Startup", "Frontend"],
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663433635030/kRBXHxgPQPt2KXqRuJwog7/project-ai-3KYyPpJJg96TeD5npt6RHe.webp",
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg border border-white/[0.04] bg-[oklch(0.09_0.005_260)] hover:border-white/[0.08] transition-colors duration-500"
      whileHover={{ y: -6 }}
      transition={{ duration: duration.fast, ease: ease.out }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.09_0.005_260)] via-transparent to-transparent" />

        {/* Hover overlay — CSS-driven for reliability */}
        <div className="absolute inset-0 flex items-center justify-center p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />
          <p className="relative text-body text-sm text-foreground/60 text-center leading-relaxed max-w-sm">
            {project.description}
          </p>
        </div>

        {/* Index badge */}
        <span className="absolute top-4 right-4 text-mono text-[0.65rem] text-foreground/15 z-10">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Card content */}
      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="heading-section text-base md:text-lg text-foreground/85 group-hover:text-primary transition-colors duration-300">
            {project.title}
          </h3>
          <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-foreground/20 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="label-caps text-[0.6rem] px-2 py-0.5 rounded border border-white/[0.05] text-foreground/30"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Projects() {
  return (
    <section id="work" className="relative py-28 md:py-40">
      {/* Section counter */}
      <span className="section-counter">01</span>

      <SectionReveal className="container">
        <RevealItem>
          <div className="flex items-baseline gap-4 mb-3">
            <span className="label-caps text-primary/50">01</span>
            <h2 className="heading-section text-3xl md:text-4xl lg:text-5xl">
              Selected Work
            </h2>
          </div>
        </RevealItem>

        <RevealItem>
          <p className="text-body text-foreground/35 max-w-lg mb-16 md:mb-24 text-base">
            Projects spanning fintech, AI systems, authentication infrastructure,
            and technical tooling — each built with precision and purpose.
          </p>
        </RevealItem>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, i) => (
            <RevealItem key={project.title}>
              <ProjectCard project={project} index={i} />
            </RevealItem>
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}
