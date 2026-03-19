/**
 * HERO — Cinematic entrance with staggered letter animation
 * 
 * Design: Noir Editorial
 * - Full viewport, near-empty composition
 * - Name revealed letter by letter with staggered timing
 * - Single descriptor line fades in after
 * - Dramatic use of negative space
 * - Bottom-aligned content for editorial weight
 */

import { motion } from "framer-motion";
import { ease, duration, stagger as staggerTokens } from "@/lib/motion";

const firstName = "Arinze";
const lastName = "Okigbo";

const heroSubtitle = "Founder. Engineer. Builder.";
const heroDescription =
  "Co-Founder & CEO of Splita, working across AI systems at Snorkel AI, authentication infrastructure at Queralt Inc., and computer science at Trinity College.";

const letterVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.7,
      ease: ease.out,
      delay: 0.4 + i * staggerTokens.fast,
    },
  }),
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: duration.cinematic,
      ease: ease.inOut,
      delay: 1.0,
    },
  },
};

export function Hero() {
  return (
    <section className="relative h-screen flex items-end overflow-hidden">
      {/* Profile picture — positioned top right */}
      <motion.div
        className="absolute top-0 right-0 w-1/3 h-full hidden md:flex items-center justify-end pr-8 lg:pr-16 z-5"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: duration.slow, ease: ease.out, delay: 0.8 }}
      >
        <div className="relative w-full max-w-xs aspect-square rounded-lg overflow-hidden border border-white/[0.08]">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663433635030/kRBXHxgPQPt2KXqRuJwog7/profile_0c82ad80.webp"
            alt="Arinze Okigbo"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </motion.div>

      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663433635030/kRBXHxgPQPt2KXqRuJwog7/hero-abstract-dvSQRePRaUi3H4D5syQms8.webp"
          alt=""
          className="w-full h-full object-cover opacity-25"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
      </div>

      <div className="container relative z-10 pb-20 md:pb-28 lg:pb-36">
        {/* Name — letter by letter */}
        <div className="mb-8 md:mb-10" style={{ perspective: "800px" }}>
          <h1 className="heading-display text-[clamp(3.5rem,12vw,9rem)] leading-[0.9] tracking-[-0.04em]">
            <span className="block overflow-hidden">
              {firstName.split("").map((letter, i) => (
                <motion.span
                  key={`first-${i}`}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                  style={{ transformOrigin: "bottom" }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            <span className="block overflow-hidden">
              {lastName.split("").map((letter, i) => (
                <motion.span
                  key={`last-${i}`}
                  custom={i + firstName.length}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  className="inline-block"
                  style={{ transformOrigin: "bottom" }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </h1>
        </div>

        {/* Animated gold line */}
        <motion.div
          className="h-px w-full max-w-sm mb-8 md:mb-10"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.78 0.1 75 / 0.5), oklch(0.78 0.1 75 / 0.1), transparent)",
            transformOrigin: "left",
          }}
          variants={lineVariants}
          initial="hidden"
          animate="visible"
        />

        {/* Subtitle */}
        <motion.p
          className="text-mono text-sm md:text-base tracking-[0.1em] text-primary/70 mb-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.out, delay: 1.15 }}
        >
          {heroSubtitle}
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-body text-base md:text-lg text-foreground/40 max-w-md leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.out, delay: 1.35 }}
        >
          {heroDescription}
        </motion.p>
      </div>

      {/* Scroll indicator — bottom center */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <span className="label-caps text-[0.55rem] tracking-[0.2em]">Scroll</span>
        <motion.div
          className="w-px h-10 origin-top"
          style={{ background: "linear-gradient(180deg, oklch(1 0 0 / 0.2), transparent)" }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </section>
  );
}
