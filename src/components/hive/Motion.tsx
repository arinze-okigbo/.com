"use client";
import { useReducedMotion } from "./motion/preferences";

import "./motion/interactions.css";

import { useEffect, useRef, type ReactNode, type MouseEvent, type CSSProperties } from "react";
import { createPointerSpring, stepSnappy } from "./motion/native-spring";
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
    let started = false;
    const startChoreography = () => {
      if (started || reduced || disposed) return;
      started = true;
      void import("./motion/choreography").then(({ installChoreography }) => {
        if (!disposed) destroy = installChoreography();
      });
    };
    const onScrollIntent = (event: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key))
        startChoreography();
    };
    addEventListener("wheel", startChoreography, { passive: true, once: true });
    addEventListener("touchstart", startChoreography, { passive: true, once: true });
    addEventListener("scroll", startChoreography, { passive: true, once: true });
    addEventListener("keydown", onScrollIntent);
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
      removeEventListener("wheel", startChoreography);
      removeEventListener("touchstart", startChoreography);
      removeEventListener("scroll", startChoreography);
      removeEventListener("keydown", onScrollIntent);
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
    <>
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
    </>
  );
}

/** Native keyframes sample the same k=200, c=12 spring, avoiding a React
 * animation component and subscription for every character of every heading. */
const entranceFrames: Keyframe[] = Array.from({ length: 37 }, (_, i) => {
  const t = i / 50;
  const displacement =
    i === 36
      ? 0
      : Math.exp(-6 * t) *
        (Math.cos(Math.sqrt(164) * t) + (6 / Math.sqrt(164)) * Math.sin(Math.sqrt(164) * t));
  return { transform: `translateY(${displacement * 16}px) rotateX(${displacement * 12}deg)` };
});

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
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || typeof node.animate !== "function") return;
    // Content visible at hydration is already painted. Do not move it away from
    // its final position; scroll entrances enhance only content still below view.
    if (node.getBoundingClientRect().top < innerHeight) return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        animation = node.animate(entranceFrames, {
          duration: 720,
          delay: delay * 1000,
          easing: "linear",
          fill: "backwards",
        });
      },
      { rootMargin: "0px 0px -32px 0px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [reduced, delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
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
  const reduced = useReducedMotion();
  const initialHeading = as === "h1" || className === "hero-name";
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || initialHeading || typeof node.animate !== "function") return;
    if (node.getBoundingClientRect().top < innerHeight) return;
    const animations: Animation[] = [];
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      node.querySelectorAll<HTMLElement>("[data-hive-letter]").forEach((letter, index) => {
        animations.push(
          letter.animate(entranceFrames, {
            duration: 720,
            delay: Math.min(index * 24, 400),
            easing: "linear",
            fill: "backwards",
          }),
        );
      });
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [reduced, initialHeading, text]);
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="hive-sr-only">{text}</span>
      <span ref={ref} aria-hidden="true" data-hive-initial-heading={initialHeading || undefined}>
        {words.map((word, wi) => (
          <span key={`${word}-${wi}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {(by === "word" ? [word] : Array.from(word)).map((letter, ci) => (
              <span
                key={ci}
                data-hive-letter=""
                style={
                  {
                    display: "inline-block",
                    "--hive-letter-delay": `${Math.min(wi * 60 + ci * 24, 400)}ms`,
                  } as CSSProperties
                }
              >
                {letter}
              </span>
            ))}
            {wi < words.length - 1 ? "\u00a0" : ""}
          </span>
        ))}
      </span>
    </Tag>
  );
}

function usePointerSpring<T extends HTMLElement>(kind: "magnetic" | "tilt") {
  const ref = useRef<T>(null);
  const spring = useRef<ReturnType<typeof createPointerSpring> | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    return () => {
      spring.current?.stop();
      spring.current = null;
    };
  }, [reduced]);
  const set = (x: number, y: number) => {
    const node = ref.current;
    if (!node || reduced || !matchMedia("(pointer: fine)").matches) return;
    spring.current ??= createPointerSpring((a, b) => {
      node.style.transform =
        kind === "magnetic" ? `translate3d(${a}px,${b}px,0)` : `rotateX(${a}deg) rotateY(${b}deg)`;
    });
    spring.current.set(x, y);
  };
  useEffect(() => {
    if (reduced && ref.current) ref.current.style.transform = "none";
  }, [reduced]);
  return { ref, set };
}

export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, set } = usePointerSpring<HTMLSpanElement>("magnetic");
  const move = (event: MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    set(
      (event.clientX - rect.left - rect.width / 2) * 0.14,
      (event.clientY - rect.top - rect.height / 2) * 0.14,
    );
  };
  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-flex" }}
      onMouseMove={move}
      onMouseLeave={() => set(0, 0)}
      data-hive-cursor="magnetic"
    >
      {children}
    </span>
  );
}

export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, set } = usePointerSpring<HTMLDivElement>("tilt");
  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        set(
          (-(event.clientY - rect.top - rect.height / 2) / rect.height) * 7,
          ((event.clientX - rect.left - rect.width / 2) / rect.width) * 7,
        );
      }}
      onMouseLeave={() => set(0, 0)}
    >
      {children}
    </div>
  );
}

export function ScrambleLabel({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visual = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current,
      target = visual.current;
    if (!node || !target || reduced) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      let frame = 0;
      const chars = "01/·+";
      timer = setInterval(() => {
        frame++;
        target.textContent = Array.from(text)
          .map((char, index) =>
            char === " " || index < frame ? char : chars[(index + frame) % chars.length],
          )
          .join("");
        if (frame >= text.length) clearInterval(timer);
      }, 35);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearInterval(timer);
      target.textContent = text;
    };
  }, [reduced, text]);
  return (
    <span ref={ref} className={className}>
      <span className="hive-sr-only">{text}</span>
      <span aria-hidden="true" ref={visual}>
        {text}
      </span>
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
  const reduced = useReducedMotion();
  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    let raf = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (time: number) => {
        const seconds = (time - start) / 1000;
        const current = seconds >= 0.6 ? value : stepSnappy(0, 0, value, seconds).value;
        node.textContent = `${Math.round(current).toLocaleString()}${suffix}`;
        if (seconds < 0.6) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      node.textContent = `${value.toLocaleString()}${suffix}`;
    };
  }, [reduced, value, suffix]);
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
