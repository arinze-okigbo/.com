"use client";
import { Icon } from "./Icon";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "./motion/preferences";

export default function ProjectStack({
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
      title: "Signature proof",
      description: "Sign a message, change it, and verify the signature.",
      href: "/lab#proof",
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
            <a href={item.href}>
              Open experiment <Icon name="arrow-up-right" />
            </a>
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
            <a href={item.href}>
              Open experiment <Icon name="arrow-up-right" />
            </a>
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
