"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export type TimelineEntry = {
  title: string;
  content: ReactNode;
};

type TimelineProps = {
  data: TimelineEntry[];
  title?: string;
  description?: string;
  className?: string;
};

export function Timeline({
  data,
  title = "Experience",
  description = "A timeline of my work across startups, AI systems, and engineering.",
  className,
}: TimelineProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.82", "end 0.22"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className={cn("relative bg-transparent", className)} ref={containerRef}>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl"
      >
        <p className="eyebrow">{title}</p>
        <h2 className="section-title mt-4 text-balance">{title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">{description}</p>
      </motion.div>

      <div className="relative mx-auto mt-12 max-w-4xl pb-2 md:mt-14">
        <div className="absolute bottom-2 left-[0.72rem] top-2 w-px bg-line md:left-[9.7rem]" />
        <motion.div
          aria-hidden
          className="absolute bottom-2 left-[0.72rem] top-2 w-px origin-top bg-accent md:left-[9.7rem]"
          style={{ scaleY: lineScale }}
        />

        <div className="space-y-8 md:space-y-10">
          {data.map((item, index) => (
            <motion.article
              key={`${item.title}-${index}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
                delay: prefersReducedMotion ? 0 : index * 0.05,
              }}
              className="relative grid gap-4 pl-8 md:grid-cols-[8.5rem_1fr] md:gap-7 md:pl-0"
            >
              <span className="absolute left-[0.44rem] top-[0.65rem] h-[0.62rem] w-[0.62rem] rounded-full border border-accent/80 bg-background md:left-[9.4rem]" />

              <p className="pt-0.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent md:text-[0.7rem]">
                {item.title}
              </p>

              <div className="rounded-[var(--radius)] border border-line bg-transparent p-5 md:p-6">{item.content}</div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}