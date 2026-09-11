"use client";

import type { MotionSpec } from "./motion-spec";
import { resolveMotionSpec } from "./motion-spec";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

/**
 * The only sanctioned way to read a `MotionSpec` inside a component.
 *
 * Returns `null` when the user has asked for reduced motion and the spec's
 * static end state is "no animation at all" — the caller must then render the
 * element in its completed state with nothing animated. Every component in
 * `src/components/motion/**` goes through here, so the reduced-motion branch is
 * taken by construction rather than by remembering to add it (docs/04 §6).
 */
export function useMotionSpec<TAnimated>(spec: MotionSpec<TAnimated>): TAnimated | null {
  const prefersReducedMotion = usePrefersReducedMotion();
  return resolveMotionSpec(spec, prefersReducedMotion);
}
