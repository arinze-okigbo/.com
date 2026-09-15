"use client";
import { useReducedMotion } from "./motion/preferences";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";

const OrbitalScene = dynamic(() => import("./motion/OrbitalScene"), { ssr: false });
class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function HeroScene({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !host.current) return;
    let visible = false;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "80px" },
    );
    observer.observe(host.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced]);
  return (
    <div
      onPointerMove={(event) => {
        if (!reduced && event.pointerType !== "touch") setReady(true);
      }}
      ref={host}
      className={`hive-orbital ${className || ""}`}
      role="group"
      aria-label="Interactive mint orbital sculpture"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 300,
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <svg
        viewBox="0 0 600 600"
        role="img"
        aria-label="Interlocking mint orbital rings surrounding a spherical core"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
          opacity: ready && !reduced && !failed ? 0.14 : 1,
        }}
      >
        <defs>
          <radialGradient id="orbital-fallback">
            <stop stopColor="var(--accent, #a7f4ce)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--accent, #a7f4ce)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="300" r="210" fill="url(#orbital-fallback)" />
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse
            key={i}
            cx="300"
            cy="300"
            rx={130 + i * 3.5}
            ry={46 + i * 4}
            transform={`rotate(${i * 11.25} 300 300)`}
            fill="none"
            stroke="var(--accent, #a7f4ce)"
            strokeOpacity={0.18 + (i % 4) * 0.12}
            strokeWidth=".8"
          />
        ))}
        <circle
          cx="300"
          cy="300"
          r="45"
          fill="var(--accent, #a7f4ce)"
          fillOpacity=".08"
          stroke="var(--accent, #a7f4ce)"
          strokeOpacity=".5"
        />
      </svg>
      {!ready && !reduced && !failed && (
        <button type="button" className="hive-orbital-activate" onClick={() => setReady(true)}>
          Enable interactive 3D ↗
        </button>
      )}
      {ready && !reduced && !failed && (
        <SceneBoundary onFailure={() => setFailed(true)}>
          <OrbitalScene active={active} onFailure={() => setFailed(true)} />
        </SceneBoundary>
      )}
    </div>
  );
}
