"use client";

import { useEffect, useRef } from "react";

import { observeReveal } from "./reveal-observer";
import { revealSpec } from "./specs";
import { ATTR_REVEAL_INSTANT, ATTR_REVEALED } from "./tokens";
import { useMotionSpec } from "./use-motion-spec";

export interface UseRevealResult {
  /** Attach to the element that carries `data-reveal`. */
  readonly ref: React.RefObject<HTMLElement | null>;
  /**
   * `false` under `prefers-reduced-motion: reduce`. When false the caller must
   * render the element with NO reveal attributes at all, so it paints in its
   * completed state (docs/04 §6.1 M1/M2/M3).
   */
  readonly isManaged: boolean;
}

/**
 * Observes an element and writes its final-state attributes when it crosses the
 * trigger line.
 *
 * The attributes are written straight to the DOM rather than through React
 * state: a reveal must not re-render its subtree, and the CSS transition is
 * what actually animates. This keeps the per-reveal cost to one attribute write
 * and one style recalculation.
 */
export function useReveal(): UseRevealResult {
  const ref = useRef<HTMLElement | null>(null);
  // `null` under reduced motion — the observer is then never constructed.
  const observerConfig = useMotionSpec(revealSpec);

  useEffect(() => {
    if (!observerConfig) return;
    const node = ref.current;
    if (!node) return;

    return observeReveal(
      node,
      (mode) => {
        // Order matters: suppressing the transition must land before the
        // element is marked revealed, or a backlogged element animates
        // anyway (docs/04 §5.3, backlog rule).
        if (mode === "instant") {
          node.setAttribute(ATTR_REVEAL_INSTANT, "");
        }
        node.setAttribute(ATTR_REVEALED, "");
      },
      observerConfig.rootMargin,
      observerConfig.threshold,
    );
  }, [observerConfig]);

  return { ref, isManaged: observerConfig !== null };
}
