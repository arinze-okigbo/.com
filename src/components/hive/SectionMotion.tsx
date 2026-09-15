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
    let nearby = false;
    const update = () => {
      frame = 0;
      if (!nearby) return;
      const top = Number.parseFloat(getComputedStyle(node).top) || 88;
      node.dataset.compact = String(
        !preference.matches && node.getBoundingClientRect().top <= top + 1,
      );
    };
    const schedule = () => {
      if (nearby && !frame) frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        nearby = entry.isIntersecting;
        if (nearby) schedule();
        else node.dataset.compact = "false";
      },
      { rootMargin: "160px" },
    );
    observer.observe(node);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    preference.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
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
