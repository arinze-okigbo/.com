"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** The heading retains its layout box; only the displayed type is transformed. */
export function StickySectionHeading({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = Number.parseFloat(getComputedStyle(node).top) || 88;
      node.dataset.compact = String(
        !preference.matches && node.getBoundingClientRect().top <= top + 1,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    preference.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      preference.removeEventListener("change", update);
    };
  }, []);
  return (
    <div ref={ref} className="section-heading sticky-section-heading">
      {children}
    </div>
  );
}
