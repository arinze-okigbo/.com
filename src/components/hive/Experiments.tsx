"use client";
import { useReducedMotion } from "./motion/preferences";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { springStep, resolveCollision, type Body } from "./lab/physics";
import { visibleLoop } from "./motion/visible-loop";

export function SpringLab() {
  const [stiffness, setStiffness] = useState(200);
  const [damping, setDamping] = useState(12);
  const [playing, setPlaying] = useState(true);
  const [target, setTarget] = useState(360);
  const reduced = useReducedMotion();
  const surface = useRef<SVGSVGElement>(null);
  const orb = useRef<SVGCircleElement>(null);
  const tether = useRef<SVGLineElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const body = useRef<Body>({ x: 120, y: 150, vx: 0, vy: 0 });
  useEffect(() => {
    if (!surface.current || !playing) return;
    const samples: number[] = [];
    const render = (delta: number) => {
      body.current = reduced
        ? { x: target, y: 150, vx: 0, vy: 0 }
        : springStep(body.current, { x: target, y: 150 }, stiffness, damping, delta);
      orb.current?.setAttribute("cx", String(body.current.x));
      tether.current?.setAttribute("x2", String(body.current.x));
      if (!reduced) {
        samples.push(body.current.x);
        if (samples.length > 150) samples.shift();
        trail.current?.setAttribute(
          "d",
          samples
            .map((x, i) => `${i ? "L" : "M"}${40 + i * 2.7} ${245 - (x - 240) * 0.16}`)
            .join(" "),
        );
      }
    };
    if (reduced) {
      render(0);
      return;
    }
    return visibleLoop(surface.current, render);
  }, [stiffness, damping, target, playing, reduced]);
  return (
    <div className="hive-spring-lab">
      <div className="hive-experiment-head">
        <span className="hive-label">EXPERIMENT 001 / SPRING SYSTEM</span>
        <span className="hive-label">{reduced ? "STATIC · REDUCED MOTION" : "LIVE SOLVER"}</span>
      </div>
      <svg
        ref={surface}
        className="hive-spring-canvas"
        viewBox="0 0 480 290"
        role="img"
        aria-label="Interactive spring simulation. Change the target and spring settings using the controls below."
        style={{ width: "100%", display: "block", touchAction: "pan-y" }}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setTarget(Math.max(60, Math.min(420, ((event.clientX - rect.left) / rect.width) * 480)));
        }}
      >
        <defs>
          <pattern id="spring-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".75" fill="currentColor" opacity=".12" />
          </pattern>
        </defs>
        <rect width="480" height="290" fill="url(#spring-grid)" />
        <line x1="60" y1="150" x2="420" y2="150" stroke="currentColor" opacity=".13" />
        <line
          x1={target}
          y1="80"
          x2={target}
          y2="196"
          stroke="currentColor"
          strokeDasharray="3 6"
          opacity=".4"
        />
        <circle
          cx={target}
          cy="150"
          r="30"
          fill="none"
          stroke="var(--accent, #a7f4ce)"
          strokeDasharray="2 5"
          opacity=".4"
        />
        <line
          ref={tether}
          x1="60"
          y1="150"
          x2="120"
          y2="150"
          stroke="var(--accent, #a7f4ce)"
          strokeWidth="1"
          opacity=".5"
        />
        <circle ref={orb} cx="120" cy="150" r="19" fill="var(--accent, #a7f4ce)" />
        <circle cx="60" cy="150" r="4" fill="currentColor" opacity=".5" />
        <text x="24" y="30" fill="currentColor" opacity=".5" fontSize="10" fontFamily="monospace">
          F = −kx − cv
        </text>
        <path
          ref={trail}
          d="M40 245 L440 245"
          fill="none"
          stroke="var(--accent, #a7f4ce)"
          strokeWidth="1"
          opacity=".45"
        />
        <text x="24" y="276" fill="currentColor" opacity=".4" fontSize="9" fontFamily="monospace">
          POSITION / TIME
        </text>
      </svg>
      <div className="hive-lab-controls">
        <label>
          Stiffness <output>{stiffness}</output>
          <input
            type="range"
            min="40"
            max="400"
            step="10"
            value={stiffness}
            onChange={(e) => setStiffness(Number(e.target.value))}
          />
        </label>
        <label>
          Damping <output>{damping}</output>
          <input
            type="range"
            min="4"
            max="40"
            value={damping}
            onChange={(e) => setDamping(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="hive-lab-actions">
        <button type="button" onClick={() => setTarget(target > 240 ? 100 : 380)}>
          Move target ↔
        </button>
        <button type="button" aria-pressed={!playing} onClick={() => setPlaying(!playing)}>
          {playing ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={() => {
            setStiffness(200);
            setDamping(12);
            setTarget(360);
            body.current = { x: 120, y: 150, vx: 0, vy: 0 };
          }}
        >
          Reset
        </button>
      </div>
      <p className="hive-lab-caption">
        A real spring solver, running in your browser. Lower the damping to see overshoot; raise it
        to settle faster. Tap the field or use Move target.
      </p>
    </div>
  );
}

const defaultTags = [
  "TypeScript",
  "React",
  "WebAuthn",
  "FIDO2",
  "Python",
  "Next.js",
  "Systems",
  "Security",
];
export function PhysicsTags({ tags = defaultTags }: { tags?: string[] }) {
  const host = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const bodies = useRef<Body[]>([]);
  const dragging = useRef(-1);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!host.current || reduced) return;
    const element = host.current;
    const width = element.clientWidth;
    const cols = Math.max(2, Math.min(4, Math.floor(width / 130)));
    const targets = tags.map((_, i) => ({
      x: 65 + ((i % cols) * (width - 130)) / Math.max(1, cols - 1),
      y: 45 + Math.floor(i / cols) * 75,
    }));
    bodies.current = targets.map((target) => ({ ...target, vx: 0, vy: 0 }));
    const elements = nodes.current.slice();
    elements.forEach((node, i) => {
      if (node)
        Object.assign(node.style, {
          position: "absolute",
          left: "0",
          top: "0",
          width: "110px",
          height: "40px",
          transform: `translate3d(${targets[i].x - 55}px,${targets[i].y - 20}px,0)`,
        });
    });

    const stop = visibleLoop(element, (dt) => {
      bodies.current = bodies.current.map((body, i) =>
        i === dragging.current ? body : springStep(body, targets[i], 65, 8, dt),
      );
      for (let i = 0; i < bodies.current.length; i++)
        for (let j = i + 1; j < bodies.current.length; j++)
          if (i !== dragging.current && j !== dragging.current)
            resolveCollision(bodies.current[i], bodies.current[j], 55);
      bodies.current.forEach((body, i) => {
        const node = nodes.current[i];
        if (node) node.style.transform = `translate3d(${body.x - 55}px,${body.y - 20}px,0)`;
      });
    });
    return () => {
      stop();
      elements.forEach((node) => {
        if (node)
          ["position", "left", "top", "width", "height", "transform"].forEach((property) =>
            node.style.removeProperty(property),
          );
      });
    };
  }, [tags, reduced]);
  return (
    <div>
      <p className="hive-lab-caption">
        Drag a tag and let go. Keyboard: focus a tag and use the arrow keys.
      </p>
      <div
        ref={host}
        className="hive-physics-tags"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          position: "relative",
          height: Math.ceil(tags.length / 2) * 75 + 30,
          overflow: "hidden",
        }}
      >
        {tags.map((tag, i) => (
          <button
            key={tag}
            ref={(el) => {
              nodes.current[i] = el;
            }}
            type="button"
            data-hive-cursor="drag"
            className="hive-physics-tag"
            style={{ touchAction: reduced ? "auto" : "none" }}
            onPointerDown={(event) => {
              if (reduced) return;
              dragging.current = i;
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (dragging.current !== i || !host.current) return;
              const rect = host.current.getBoundingClientRect();
              const body = bodies.current[i];
              if (body) {
                body.x = Math.max(55, Math.min(rect.width - 55, event.clientX - rect.left));
                body.y = Math.max(20, Math.min(rect.height - 20, event.clientY - rect.top));
                body.vx = event.movementX * 12;
                body.vy = event.movementY * 12;
              }
            }}
            onPointerUp={() => {
              dragging.current = -1;
            }}
            onPointerCancel={() => {
              dragging.current = -1;
            }}
            onKeyDown={(event) => {
              const body = bodies.current[i];
              if (!body || reduced) return;
              if (event.key.startsWith("Arrow")) {
                event.preventDefault();
                body.vx += event.key === "ArrowRight" ? 500 : event.key === "ArrowLeft" ? -500 : 0;
                body.vy += event.key === "ArrowDown" ? 500 : event.key === "ArrowUp" ? -500 : 0;
              }
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProjectStack({
  items = [
    {
      title: "Spring dynamics",
      description: "Drag, release, and watch energy dissipate.",
      href: "#spring-lab",
    },
    {
      title: "Protocol thinking",
      description: "Explore the browser's credential ceremony.",
      href: "#passkey-lab",
    },
    {
      title: "Source to screen",
      description: "Inspect the decisions behind this site.",
      href: "/lab/changelog",
    },
  ],
}: {
  items?: { title: string; description: string; href: string }[];
}) {
  const constraints = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const cards = items.slice(0, 3);
  const [active, setActive] = useState(0);
  if (reduced)
    return (
      <div className="hive-project-stack-static" style={{ display: "grid", gap: 16 }}>
        {cards.map((item, i) => (
          <article className="hive-stack-card" key={item.title}>
            <span className="hive-label">0{i + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <a href={item.href}>Open experiment ↗</a>
          </article>
        ))}
      </div>
    );
  return (
    <div>
      <div
        ref={constraints}
        className="hive-project-stack"
        style={{ position: "relative", minHeight: 330 }}
      >
        <span className="hive-label">DRAG TO EXPLORE · OR CHOOSE A CARD BELOW</span>
        {cards.map((item, i) => (
          <motion.article
            key={item.title}
            drag={i === active}
            dragConstraints={constraints}
            dragElastic={0.12}
            dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
            whileDrag={{ scale: 1.03, rotate: 0 }}
            className="hive-stack-card"
            data-hive-cursor="drag"
            inert={i !== active ? true : undefined}
            aria-hidden={i !== active ? true : undefined}
            style={{
              position: "absolute",
              top: 60 + i * 12,
              left: `${8 + i * 3}%`,
              width: "78%",
              minHeight: 180,
              rotate: (i - 1) * 5,
              zIndex: i === active ? 5 : i + 1,
              touchAction: "pan-y",
            }}
          >
            <span className="hive-label">0{i + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <a href={item.href}>Open experiment ↗</a>
          </motion.article>
        ))}
      </div>
      <div className="hive-replay-tabs" role="group" aria-label="Choose a project card">
        {cards.map((item, i) => (
          <button
            type="button"
            key={item.title}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export type BuildEvent = {
  id: string;
  title: string;
  detail: string;
  status: "complete" | "in_progress" | "pending";
};
export function BuildReplay({ events = [] }: { events?: BuildEvent[] }) {
  const [selected, setSelected] = useState(0);
  if (!events.length)
    return (
      <div className="hive-build-replay">
        <h3>Built in the open.</h3>
        <p>
          The build decisions, verification results, and remaining work live in the public
          changelog.
        </p>
        <a href="/lab/changelog">Read the actual build record ↗</a>
      </div>
    );
  const event = events[Math.min(selected, events.length - 1)];
  return (
    <div className="hive-build-replay">
      <p className="hive-label">HIVE TASK RECORD · BUILD-TIME SNAPSHOT</p>
      <div className="hive-replay-tabs" role="group" aria-label="Build tasks">
        {events.map((item, i) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
          >
            {item.id}
          </button>
        ))}
      </div>
      <div aria-live="polite">
        <p className="hive-label">{event.status.replaceAll("_", " ")}</p>
        <h3>{event.title}</h3>
        <p>{event.detail}</p>
      </div>
      <p className="hive-lab-caption">
        Inspect recorded task states. This is a saved build record, not a live agent feed.
      </p>
    </div>
  );
}
