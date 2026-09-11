/**
 * Motion library surface. Components live in `src/components/motion/**`;
 * this is the token and hook layer beneath them.
 *
 * Other agents should reach for `@/components/motion` first. These exports are
 * for the cases a component cannot cover: the reduced-motion predicate that
 * `SmoothScrollProvider` branches on, and the token-correct transitions behind
 * the hover/press/disclosure states in `src/components/ui/**`.
 */

export * from "./tokens";

export { defineMotionSpec, resolveMotionSpec } from "./motion-spec";
export type { MotionSpec, ReducedMotionRow } from "./motion-spec";

export { getStaggerDelayMs, revealSpec } from "./specs";
export type { RevealObserverConfig } from "./specs";

export { useMotionSpec } from "./use-motion-spec";
export { usePrefersReducedMotion } from "./use-prefers-reduced-motion";
export { useReveal } from "./use-reveal";
export type { UseRevealResult } from "./use-reveal";
