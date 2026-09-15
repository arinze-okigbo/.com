"use client";
import { useReducedMotion } from "./motion/preferences";

import "./motion/interactions.css";

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, MotionConfig, useMotionValue, useSpring, useInView, animate } from "framer-motion";
import { usePathname } from "next/navigation";

export const snappy = { type: "spring" as const, stiffness: 400, damping: 30 };
export const bouncy = { type: "spring" as const, stiffness: 200, damping: 12 };

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const progress = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let destroy: (() => void) | undefined;
    const updateScroll = () => {
      const range = document.documentElement.scrollHeight - innerHeight;
      if (progress.current)
        progress.current.style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
      document.documentElement.dataset.scrolled = String(scrollY > 32);
    };
    updateScroll();
    addEventListener("scroll", updateScroll, { passive: true });
    if (!reduced) {
      void import("./motion/choreography").then(({ installChoreography }) => {
        if (!disposed) destroy = installChoreography();
      });
    }
    const teardown = () => {
      disposed = true;
      destroy?.();
      destroy = undefined;
    };
    const beforeNavigation = (event: globalThis.MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
        return;
      const anchor =
        event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.download || anchor.target === "_blank") return;
      const target = new URL(anchor.href);
      // Restore GSAP pin wrappers before React snapshots or removes route DOM.
      if (target.origin === location.origin && target.pathname !== location.pathname) teardown();
    };
    document.addEventListener("click", beforeNavigation, true);
    addEventListener("popstate", teardown);
    return () => {
      teardown();
      document.removeEventListener("click", beforeNavigation, true);
      removeEventListener("popstate", teardown);
      removeEventListener("scroll", updateScroll);
    };
  }, [reduced, pathname]);
  useEffect(() => {
    if (reduced || !matchMedia("(pointer: fine)").matches) return;
    const el = cursor.current;
    if (!el) return;
    const move = (event: PointerEvent) => {
      el.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      el.style.opacity = "1";
      const target =
        event.target instanceof Element
          ? event.target.closest("[data-hive-cursor],a,button")
          : null;
      el.dataset.state = target?.getAttribute("data-hive-cursor") || (target ? "link" : "default");
    };
    const leave = () => {
      el.style.opacity = "0";
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [reduced]);
  return (
    <MotionConfig reducedMotion="user" transition={snappy}>
      <div
        ref={progress}
        className="hive-scroll-progress"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 100,
          background: "var(--accent, #a7f4ce)",
          transformOrigin: "left",
          transform: "scaleX(0)",
          pointerEvents: "none",
        }}
      />
      {children}
      {!reduced && (
        <div
          ref={cursor}
          className="hive-cursor"
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 110,
            opacity: 0,
          }}
        >
          <span />
        </div>
      )}
    </MotionConfig>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -32px 0px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={{ y: seen || reduced ? 0 : 18 }}
      transition={{ ...snappy, delay: reduced ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

export function SplitText({
  text,
  className,
  as = "span",
  by = "char",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span";
  by?: "char" | "word";
}) {
  const Tag = as;
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  return (
    <Tag className={className}>
      <span className="hive-sr-only">{text}</span>
      <span ref={ref} aria-hidden="true">
        {text.split(" ").map((word, wi) => (
          <span key={`${word}-${wi}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {(by === "word" ? [word] : Array.from(word)).map((char, ci) => (
              <motion.span
                key={ci}
                initial={false}
                animate={{ y: seen || reduced ? 0 : 16, rotateX: seen || reduced ? 0 : 12 }}
                transition={{
                  ...bouncy,
                  delay: reduced ? 0 : Math.min(wi * 0.06 + ci * 0.024, 0.55),
                }}
                style={{ display: "inline-block" }}
              >
                {char}
              </motion.span>
            ))}
            {wi < text.split(" ").length - 1 ? "\u00a0" : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const x = useSpring(0, snappy),
    y = useSpring(0, snappy);
  const move = (event: MouseEvent<HTMLSpanElement>) => {
    if (reduced || !matchMedia("(pointer: fine)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.14);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.14);
  };
  return (
    <motion.span
      className={className}
      style={{ display: "inline-flex", x, y }}
      onMouseMove={move}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      data-hive-cursor="magnetic"
    >
      {children}
    </motion.span>
  );
}

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const rotateX = useSpring(0, snappy),
    rotateY = useSpring(0, snappy);
  return (
    <motion.div
      className={className}
      style={{ perspective: 1000, rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(event) => {
        if (reduced || !matchMedia("(pointer: fine)").matches) return;
        const rect = event.currentTarget.getBoundingClientRect();
        rotateY.set(((event.clientX - rect.left - rect.width / 2) / rect.width) * 7);
        rotateX.set((-(event.clientY - rect.top - rect.height / 2) / rect.height) * 7);
      }}
      onMouseLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrambleLabel({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!seen || reduced) return;
    let frame = 0;
    const chars = "01/·+";
    const timer = setInterval(() => {
      frame++;
      setDisplay(
        Array.from(text)
          .map((char, index) =>
            char === " " || index < frame ? char : chars[(index + frame) % chars.length],
          )
          .join(""),
      );
      if (frame >= text.length) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [seen, reduced, text]);
  return (
    <span ref={ref} className={className}>
      <span className="hive-sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}

export function AnimatedCounter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const counter = useMotionValue(value);
  useEffect(() => {
    if (!seen || reduced) return;
    counter.set(0);
    const unsubscribe = counter.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${Math.round(latest).toLocaleString()}${suffix}`;
    });
    const animation = animate(counter, value, { ...snappy });
    return () => {
      animation.stop();
      unsubscribe();
    };
  }, [seen, reduced, value, suffix, counter]);
  return (
    <span className={className}>
      <span className="hive-sr-only">
        {value.toLocaleString()}
        {suffix}
      </span>
      <span aria-hidden="true" ref={ref}>
        {value.toLocaleString()}
        {suffix}
      </span>
    </span>
  );
}
