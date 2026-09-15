"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "./motion/preferences";
import { createPointerSpring, springKeyframes } from "./motion/native-spring";
import "./portrait-motion.css";

/** The server-rendered portrait remains visible before hydration and during every effect. */
export function PortraitMotion({
  children,
  className = "",
  variant = "hero",
}: {
  children: ReactNode;
  className?: string;
  variant?: "hero" | "about";
}) {
  const frame = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLDivElement>(null);
  const entered = useRef(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = frame.current;
    const imageLayer = reveal.current;
    if (!node || !imageLayer || reduced) return;
    let visible = false;
    let scrollFrame = 0;
    let bounds: DOMRect | null = null;
    let entrance: Animation | undefined;
    const pointer = createPointerSpring((x, y) => {
      node.style.setProperty("--portrait-x", x.toFixed(4));
      node.style.setProperty("--portrait-y", y.toFixed(4));
    });
    const rest = () => {
      pointer.stop();
      node.style.removeProperty("--portrait-x");
      node.style.removeProperty("--portrait-y");
      node.style.removeProperty("--portrait-scroll");
      node.removeAttribute("data-portrait-active");
    };
    const enter = () => {
      const image = imageLayer.querySelector("img");
      if (
        entered.current ||
        !visible ||
        document.hidden ||
        !image?.complete ||
        !image.naturalWidth ||
        typeof imageLayer.animate !== "function"
      )
        return;
      entered.current = true;
      entrance = imageLayer.animate(
        springKeyframes(1.055, 1, (scale) => ({ transform: `scale(${scale})` })),
        { duration: 950, easing: "linear" },
      );
    };
    const updateScroll = () => {
      scrollFrame = 0;
      if (!visible || document.hidden) return;
      bounds = null;
      const rect = node.getBoundingClientRect();
      const progress = Math.max(
        -1,
        Math.min(1, (innerHeight / 2 - rect.top - rect.height / 2) / innerHeight),
      );
      node.style.setProperty("--portrait-scroll", `${(progress * 10).toFixed(2)}px`);
    };
    const onScroll = () => {
      if (visible && !document.hidden && !scrollFrame)
        scrollFrame = requestAnimationFrame(updateScroll);
    };
    const onMove = (event: PointerEvent) => {
      if (!visible || document.hidden || event.pointerType !== "mouse") return;
      bounds ??= node.getBoundingClientRect();
      node.setAttribute("data-portrait-active", "true");
      pointer.set(
        Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)),
        Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)),
      );
    };
    const onLeave = () => {
      bounds = null;
      node.removeAttribute("data-portrait-active");
      pointer.set(0, 0);
    };
    const suspend = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      entrance?.cancel();
      rest();
    };
    const onVisibility = () => {
      if (document.hidden) suspend();
      else enter();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) enter();
      else suspend();
    });
    observer.observe(node);
    node.addEventListener("load", enter, true);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    node.addEventListener("pointercancel", onLeave);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      suspend();
      node.removeEventListener("load", enter, true);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      node.removeEventListener("pointercancel", onLeave);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div
      ref={frame}
      className={`portrait-motion ${className}`}
      data-portrait-frame
      data-portrait-variant={variant}
    >
      <div className="portrait-motion-depth">
        <div ref={reveal} className="portrait-motion-reveal">
          <div className="portrait-motion-media" data-portrait-image>
            {children}
          </div>
        </div>
        <span className="portrait-motion-light" aria-hidden="true" />
      </div>
      <span className="portrait-motion-rule portrait-motion-rule-top" aria-hidden="true" />
      <span className="portrait-motion-rule portrait-motion-rule-bottom" aria-hidden="true" />
      <span className="portrait-motion-corner" aria-hidden="true" />
    </div>
  );
}
