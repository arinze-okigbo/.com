"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";

const headline = ["Founder", "Engineer", "Student"];

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.4], [0, prefersReducedMotion ? 0 : -120]);
  const scale = useTransform(scrollYProgress, [0, 0.35], [1, prefersReducedMotion ? 1 : 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0.75, 0.1]);

  return (
    <section id="top" className="section-shell overflow-clip pt-24 md:pt-32">
      <motion.div
        style={prefersReducedMotion ? undefined : { y, scale, opacity }}
        className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(209,169,84,0.18)_0%,rgba(209,169,84,0.06)_34%,transparent_68%)] blur-3xl"
      />
      <Container className="space-y-8">
        <motion.p
          className="eyebrow"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.6 }}
        >
          Arinze Okigbo
        </motion.p>

        <div className="grid items-end gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <h1 className="font-serif text-[clamp(2.8rem,7.6vw,6.8rem)] leading-[0.92] tracking-[-0.03em] text-balance">
              {headline.map((word, idx) => (
                <motion.span
                  key={word}
                  className="block"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + idx * 0.08, duration: 0.7 }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="max-w-2xl text-2xl leading-relaxed text-muted md:text-xl"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              Co-Founder & CEO of Splita.
              <br></br>
              AI @ Snorkel AI | SWE @ Queralt Inc. | CS + T&F @ Trinity
              <br></br>
              Building at the intersection of AI, security, and fintech.
            </motion.p>
          </div>

          <motion.div
            className="card relative space-y-5 p-6"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.65 }}
          >
            <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(140deg,rgba(209,169,84,0.1),transparent_45%)]" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <Image
                src="/profile.jpg"
                alt="Portrait of Arinze Okigbo"
                width={1200}
                height={1200}
                priority
                className="h-64 w-full object-cover object-center md:h-72"
              />
            </div>
            <div className="relative flex items-center gap-2 text-accent">
              <Sparkles size={16} />
              <p className="text-sm font-semibold tracking-wide">Current Focus</p>
            </div>
            <p className="relative text-sm leading-relaxed text-foreground/90 md:text-base">
              Building modern fintech infrastructure with AI-native product thinking, secure-by-default systems, and a relentless bias for high-quality execution.
            </p>
            <div className="relative flex flex-wrap items-center gap-3 pt-2">
              <Button href="#projects">View Projects</Button>
              <Button href="#contact" variant="ghost">
                Contact
              </Button>
            </div>
          </motion.div>
        </div>

        <a href="#about" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground">
          Scroll for story <ArrowDownRight size={16} />
        </a>
      </Container>
    </section>
  );
}