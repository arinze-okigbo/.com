/**
 * FEATURED MOMENT — Standout scroll-driven experience
 * 
 * Design: Noir Editorial
 * - A single cinematic moment in the scroll journey
 * - Text scales and transforms as user scrolls through
 * - Creates a memorable, restrained but impactful pause
 * - The one "wow" moment that's earned through restraint elsewhere
 */

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function FeaturedMoment() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0.05, 0.25, 0.7, 0.95],
    [0, 1, 1, 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [0.05, 0.3, 0.65, 0.95],
    [0.92, 1, 1, 0.96]
  );
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const lineWidth = useTransform(
    scrollYProgress,
    [0.15, 0.5],
    ["0%", "100%"]
  );
  const labelOpacity = useTransform(
    scrollYProgress,
    [0.1, 0.3],
    [0, 1]
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden" style={{ position: 'relative' }}
    >
      <motion.div
        className="container text-center max-w-4xl mx-auto px-6"
        style={{ opacity, scale, y }}
      >
        <motion.p
          className="label-caps text-primary/40 mb-8 md:mb-10 tracking-[0.2em] text-[0.6rem]"
          style={{ opacity: labelOpacity }}
        >
          Philosophy
        </motion.p>

        <h2 className="heading-display text-[clamp(1.6rem,4.5vw,3.5rem)] leading-[1.15] tracking-[-0.02em]" style={{ fontWeight: 400 }}>
          The future belongs to builders who think{" "}
          <span className="text-primary">across boundaries</span>.
        </h2>

        {/* Animated underline */}
        <motion.div
          className="h-px mx-auto mt-10 md:mt-14"
          style={{
            width: lineWidth,
            background:
              "linear-gradient(90deg, transparent, oklch(0.78 0.1 75 / 0.3), transparent)",
          }}
        />
      </motion.div>
    </section>
  );
}
