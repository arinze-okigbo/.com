"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Container } from "@/components/ui/Container";
import { featuredProjects } from "@/content/site-content";

export function FeaturedProjectsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="projects" className="section-shell">
      <Container className="space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="Featured Projects"
            title="Selected work with clear technical and product intent."
            description="Projects focused on real execution quality, not noise."
          />
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <Reveal key={project.title} delay={index * 0.1}>
              <motion.a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="card group relative flex h-full flex-col justify-between overflow-hidden p-6"
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: -6,
                        scale: 1.01,
                      }
                }
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(140deg,rgba(209,169,84,0.2),transparent_35%)]" />
                <div className="relative space-y-4">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-strong px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
                    Case
                    <ArrowUpRight size={13} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{project.summary}</p>
                </div>
                <ul className="relative mt-8 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-line px-2.5 py-1 text-xs text-foreground/80">
                      {tag}
                    </li>
                  ))}
                </ul>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}