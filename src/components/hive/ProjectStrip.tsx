"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import { useReducedMotion } from "./motion/preferences";
import "./project-strip.css";

/** Native scrolling keeps every server-rendered card reachable before hydration. */
export function ProjectStrip({ children, count }: { children: ReactNode; count: number }) {
  const track = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const reduced = useReducedMotion();
  const [position, setPosition] = useState({
    first: 0,
    last: 0,
    start: true,
    end: false,
    ready: false,
  });

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const cards = Array.from(node.children) as HTMLElement[];
      const left = node.scrollLeft;
      const right = left + node.clientWidth;
      const visible = cards.flatMap((card, index) =>
        card.offsetLeft + card.offsetWidth > left + 16 && card.offsetLeft < right - 16
          ? [index]
          : [],
      );
      const next = {
        first: visible[0] ?? 0,
        last: visible.at(-1) ?? 0,
        start: left <= 2,
        end: left >= node.scrollWidth - node.clientWidth - 2,
        ready: true,
      };
      setPosition((previous) =>
        Object.keys(next).every(
          (key) => previous[key as keyof typeof next] === next[key as keyof typeof next],
        )
          ? previous
          : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    node.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      node.removeEventListener("scroll", schedule);
    };
  }, [count]);

  const move = (direction: -1 | 1 | "start" | "end") => {
    const node = track.current;
    if (!node) return;
    const cards = Array.from(node.children) as HTMLElement[];
    const current = Math.max(
      0,
      cards.findIndex((card) => card.offsetLeft + card.offsetWidth > node.scrollLeft + 16),
    );
    const index = Math.max(
      0,
      Math.min(cards.length - 1, current + (typeof direction === "number" ? direction : 0)),
    );
    const left =
      direction === "start"
        ? 0
        : direction === "end"
          ? node.scrollWidth - node.clientWidth
          : (cards[index]?.offsetLeft ?? 0);
    node.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey)
      return;
    const directions = { ArrowLeft: -1, ArrowRight: 1, Home: "start", End: "end" } as const;
    const direction = directions[event.key as keyof typeof directions];
    if (direction === undefined) return;
    event.preventDefault();
    move(direction);
  };

  return (
    <section className="shell project-browser" aria-label="Browse projects">
      <div className="project-browser-toolbar">
        <div>
          <h2 className="eyebrow">Explore the collection</h2>
          <p className="project-browser-progress" aria-live="polite" aria-atomic="true">
            {position.ready
              ? `Projects ${position.first + 1}–${position.last + 1} of ${count}`
              : `${count} projects`}
          </p>
        </div>
        <div className="project-browser-controls" data-ready={position.ready}>
          <button
            type="button"
            aria-label="Previous projects"
            aria-controls={trackId}
            disabled={position.start}
            onClick={() => move(-1)}
          >
            <Icon name="arrow-left" /> <span>Previous</span>
          </button>
          <button
            type="button"
            aria-label="Next projects"
            aria-controls={trackId}
            disabled={position.end}
            onClick={() => move(1)}
          >
            <span>Next</span> <Icon name="arrow-right" />
          </button>
        </div>
      </div>
      <div
        id={trackId}
        ref={track}
        className="project-browser-track"
        role="region"
        aria-label="Project cards. Use arrow keys to browse."
        tabIndex={0}
        onKeyDown={onKeyDown}
        data-lenis-prevent
      >
        {children}
      </div>
      <p className="project-browser-hint">
        Scroll to explore. Select a project to see the details.
      </p>
    </section>
  );
}
