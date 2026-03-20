"use client";

import {
  useState,
  useRef,
  useContext,
  createContext,
  useEffect,
} from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

// mouse context
const MouseContext = createContext({ x: 0, y: 0 });

type DockItem = {
  icon: React.ReactNode;
  href: string;
};

function DockIcon({ icon, href }: DockItem) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mouse = useContext(MouseContext);
  const distance = useMotionValue(Infinity);

  useEffect(() => {
    if (!ref.current || mouse.x === 0) {
      distance.set(Infinity);
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const parentRect =
      ref.current.parentElement!.getBoundingClientRect();

    const center = rect.left + rect.width / 2;
    const mouseX = parentRect.left + mouse.x;

    distance.set(Math.abs(mouseX - center));
  }, [mouse, distance]);

  const width = useTransform(distance, [0, 120], [64, 48]);
  const spring = useSpring(width, {
    stiffness: 180,
    damping: 15,
  });

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
      style={{ width: spring }}
      className="aspect-square rounded-xl bg-white/[0.05] hover:bg-white/[0.08] grid place-items-center text-foreground/80 transition"
    >
      {icon}
    </motion.a>
  );
}

export default function MagneticDock() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, currentTarget } = e;
    const { left } = currentTarget.getBoundingClientRect();
    setPos({ x: clientX - left, y: 0 });
  };

  return (
    <MouseContext.Provider value={pos}>
      <div className="w-full flex justify-center">
        <div
          onMouseMove={handleMove}
          onMouseLeave={() => setPos({ x: 0, y: 0 })}
          className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 pb-3 pt-4 backdrop-blur-xl"
        >
          <DockIcon
            href="https://github.com/arinze-okigbo"
            icon={<Github size={22} />}
          />
          <DockIcon
            href="https://linkedin.com/in/arinzeokigbo"
            icon={<Linkedin size={22} />}
          />
          <DockIcon
            href="https://x.com/arinzeokigbo"
            icon={<Twitter size={22} />}
          />
          <DockIcon
            href="mailto:arinze@splita.co"
            icon={<Mail size={22} />}
          />
        </div>
      </div>
    </MouseContext.Provider>
  );
}