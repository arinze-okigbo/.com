/**
 * ABOUT — Achievements & highlights with intentional layout
 * 
 * Design: Noir Editorial
 * - Asymmetric two-column layout
 * - Key stats as focal points with parallax
 * - Editorial feel with strong typography hierarchy
 * - Skills as minimal tags
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionReveal, RevealItem } from "./SectionReveal";

const stats = [
  { value: "3+", label: "Current Roles" },
  { value: "1", label: "Startup Founded" },
  { value: "4", label: "Domains" },
  { value: "2028", label: "Graduation" },
];

const skills = [
  "TypeScript",
  "Python",
  "Go",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Redis",
  "AWS",
  "Kubernetes",
  "Docker",
  "TensorFlow",
  "PyTorch",
  "GraphQL",
  "gRPC",
];

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const statsY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section id="about" ref={sectionRef} className="relative py-28 md:py-40" style={{ position: 'relative' }}>
      {/* Section counter */}
      <span className="section-counter">03</span>

      <SectionReveal className="container">
        <RevealItem>
          <div className="flex items-baseline gap-4 mb-3">
            <span className="label-caps text-primary/50">03</span>
            <h2 className="heading-section text-3xl md:text-4xl lg:text-5xl">
              About
            </h2>
          </div>
        </RevealItem>

        {/* Two-column asymmetric layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-16 lg:gap-24 mt-12 md:mt-20">
          {/* Left — narrative */}
          <div>
            <RevealItem>
              <p className="text-body text-xl md:text-2xl text-foreground/65 leading-[1.5] mb-8 tracking-[-0.01em]">
                I'm a founder, software engineer, and computer science student interested in building ambitious products and technical systems that solve real problems.
              </p>
            </RevealItem>

            <RevealItem>
              <p className="text-body text-base text-foreground/35 leading-relaxed mb-6">
                My work sits at the intersection of AI, security, infrastructure, and fintech — from building Splita, a startup simplifying group payments, to contributing to AI systems at Snorkel AI and authentication infrastructure at Queralt Inc.
              </p>
            </RevealItem>

            <RevealItem>
              <p className="text-body text-base text-foreground/35 leading-relaxed mb-14">
                I care deeply about execution, product taste, technical depth, and creating work that feels both useful and differentiated. Every project is an opportunity to build something that didn't exist before.
              </p>
            </RevealItem>

            {/* Skills */}
            <RevealItem>
              <div>
                <span className="label-caps text-foreground/25 block mb-5">
                  Technologies
                </span>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="label-caps text-[0.6rem] px-2 py-0.5 rounded border border-white/[0.05] text-foreground/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </RevealItem>
          </div>

          {/* Right — stats with parallax */}
          <motion.div
            className="flex flex-col justify-center gap-12 md:gap-16"
            style={{ y: statsY }}
          >
            {stats.map((stat, i) => (
              <RevealItem key={`stat-${i}`}>
                <div className="border-l border-white/[0.08] pl-6">
                  <p className="text-primary text-5xl md:text-6xl font-bold leading-none mb-2">
                    {stat.value}
                  </p>
                  <p className="label-caps text-foreground/40">{stat.label}</p>
                </div>
              </RevealItem>
            ))}
          </motion.div>
        </div>
      </SectionReveal>
    </section>
  );
}
