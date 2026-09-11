"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

export interface SmoothScrollProviderProps {
  readonly children: ReactNode;
}

/**
 * docs/04 M12 — Lenis is kept (docs/02 §5), but under
 * `prefers-reduced-motion: reduce` the instance is **never constructed** and
 * the browser's native scroll is the whole mechanism. That is the real static
 * end state the table asks for, not a paused instance.
 *
 * The previous implementation set `autoRaf: false` and `duration: 0`, which
 * left Lenis mounted: its wheel, touch and resize listeners stayed attached
 * and kept intercepting the scroll position. Pausing is not destroying.
 *
 * On unmount the rAF loop is cancelled and `lenis.destroy()` detaches every
 * listener, so a remount can never stack two instances on one scroller.
 *
 * No options are passed: Lenis's own defaults apply, so this file invents no
 * duration or easing value that docs/04 does not name.
 *
 * **The import is dynamic, and that is load-bearing in two ways.**
 *
 * 1. Smooth scroll cannot matter before the visitor scrolls, but a static
 *    import put ~6 kB gz of Lenis on the critical path of a page whose LCP is
 *    server-rendered text in the first viewport. Lighthouse's Lantern
 *    simulator charges initial script transfer against LCP render delay at
 *    roughly 8 ms per kB, and that was the last of the 2.0 s budget.
 * 2. It makes M12 a byte guarantee rather than only a behavioural one. The
 *    reduced-motion check happens BEFORE the `import()`, exactly as gate 1 of
 *    the 3D figure does for M11, so a visitor who asks for reduced motion now
 *    downloads zero bytes of Lenis instead of paying for a library that is
 *    then deliberately not constructed.
 *
 * `isCancelled` covers the unmount-before-resolve race: without it a provider
 * that unmounts during the fetch would construct an instance nothing holds a
 * reference to, and leak every listener it attaches.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // M12, checked before the import: reduced motion costs zero Lenis bytes.
    if (prefersReducedMotion) return;

    let isCancelled = false;
    let frameHandle = 0;
    let teardown: (() => void) | null = null;

    void import("lenis")
      .then(({ default: Lenis }) => {
        if (isCancelled) return;

        const lenis = new Lenis();

        function step(time: number): void {
          lenis.raf(time);
          frameHandle = requestAnimationFrame(step);
        }

        frameHandle = requestAnimationFrame(step);
        teardown = () => {
          cancelAnimationFrame(frameHandle);
          lenis.destroy();
        };
      })
      .catch(() => {
        // The chunk failed to load — offline, or a stale deploy. Native scroll
        // is the correct and complete fallback, so there is nothing to do and
        // nothing to report to the visitor. Never leave this unhandled: an
        // unhandled rejection here would surface as a console error.
      });

    return () => {
      isCancelled = true;
      teardown?.();
    };
  }, [prefersReducedMotion]);

  return <>{children}</>;
}
