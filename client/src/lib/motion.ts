/**
 * MOTION SYSTEM — Noir Editorial
 * 
 * Cohesive motion tokens for the entire site.
 * All animations use these shared curves and durations
 * for a unified, cinematic feel.
 */

// Easing curves
export const ease = {
  // Primary curve — smooth, confident deceleration
  out: [0.16, 1, 0.3, 1] as const,
  // Entry curve — gentle start, confident finish
  inOut: [0.65, 0, 0.35, 1] as const,
  // Subtle curve — barely perceptible
  subtle: [0.25, 0.1, 0.25, 1] as const,
};

// Duration tokens (seconds)
export const duration = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.8,
  cinematic: 1.2,
};

// Stagger delay between children
export const stagger = {
  fast: 0.05,
  normal: 0.08,
  slow: 0.12,
};

// Shared animation variants for scroll-based reveals
export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: ease.out,
    },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: duration.normal,
      ease: ease.subtle,
    },
  },
};

export const slideInLeft = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration.slow,
      ease: ease.out,
    },
  },
};

export const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: duration.normal,
      ease: ease.out,
    },
  },
};

// Container variant for staggering children
export const staggerContainer = (staggerDelay = stagger.normal) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

// Line draw animation
export const lineDraw = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: duration.cinematic,
      ease: ease.inOut,
    },
  },
};
