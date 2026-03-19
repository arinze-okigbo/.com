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
  { value: "4+", label: "Years Building" },
  { value: "10+", label: "Projects Shipped" },
  { value: "3", label: "Domains of Expertise" },
  { value: "1", label: "Mission" },
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
                I'm a computer science student and founder driven by the
                conviction that the most important problems sit at the
                intersection of disciplines.
              </p>
            </RevealItem>

            <RevealItem>
              <p className="text-body text-base text-foreground/35 leading-relaxed mb-6">
                My work spans artificial intelligence, cybersecurity, cloud
                infrastructure, and financial technology — not because I chase
                trends, but because these domains are converging. The future
                belongs to builders who can think across boundaries.
              </p>
            </RevealItem>

            <RevealItem>
              <p className="text-body text-base text-foreground/35 leading-relaxed mb-14">
                I believe in shipping fast, building with rigor, and solving
                problems that matter. Every project I take on is an opportunity
                to create something that didn't exist before.
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
                      className="text-mono text-[0.7rem] px-3 py-1.5 rounded border border-white/[0.05] text-foreground/30 hover:text-foreground/55 hover:border-white/[0.1] transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </RevealItem>
          </div>

          {/* Right — stats with parallax */}
          <motion.div style={{ y: statsY }}>
            {stats.map((stat) => (
              <RevealItem key={stat.label}>
                <div className="py-7 md:py-8 border-b border-white/[0.04] first:border-t first:border-white/[0.04]">
                  <span className="heading-display text-4xl md:text-5xl lg:text-6xl text-primary/70 block mb-1.5">
                    {stat.value}
                  </span>
                  <span className="label-caps text-[0.6rem] text-foreground/25">
                    {stat.label}
                  </span>
                </div>
              </RevealItem>
            ))}
          </motion.div>
        </div>
      </SectionReveal>
    </section>
  );
}
