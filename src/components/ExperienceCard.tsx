"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

type ExperienceCardProps = {
  role: string;
  company: string;
  period: string;
  description: string;
  details?: string[];
  tags?: string[];
  logo?: string;
};

export function ExperienceCard({
  role,
  company,
  period,
  description,
  details = [],
  tags = [],
  logo,
}: ExperienceCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);

  const rotateX = useSpring(rotateXRaw, { stiffness: 220, damping: 20, mass: 0.7 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 220, damping: 20, mass: 0.7 });

  const spotlightX = useTransform(mouseX, (v) => `${v}px`);
  const spotlightY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateYValue = ((x - centerX) / centerX) * 8;
    const rotateXValue = -((y - centerY) / centerY) * 8;

    rotateXRaw.set(rotateXValue);
    rotateYRaw.set(rotateYValue);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative [perspective:1200px]"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ y: -8, scale: 1.015 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl will-change-transform hover:border-white/20"
      >
        {/* Spotlight */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(260px circle at ${spotlightX} ${spotlightY}, rgba(255,255,255,0.16), transparent 45%)`,
          }}
        />

        {/* Soft ambient glow */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.06] via-transparent to-white/[0.02]" />

        {/* Border glow */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20" />

        <div
          className="relative z-10"
          style={{
            transform: "translateZ(30px)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {logo ? (
                <Image
                  src={logo}
                  alt={`${company} logo`}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-xl object-contain ring-1 ring-white/10"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-sm font-semibold text-foreground/70 ring-1 ring-white/10">
                  {company.slice(0, 1)}
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">{period}</p>
                <h3 className="text-lg font-semibold text-foreground md:text-xl">
                  {role}
                </h3>
                <p className="text-sm text-foreground/65">{company}</p>
              </div>
            </div>

            <div className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-foreground/50">
              {expanded ? "Hide" : "More"}
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground/80 md:text-[0.95rem]">
            {description}
          </p>

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-foreground/65"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <motion.div
            initial={false}
            animate={{
              height: expanded ? "auto" : 0,
              opacity: expanded ? 1 : 0,
              marginTop: expanded ? 16 : 0,
            }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {details.length > 0 && (
              <ul className="space-y-2 border-t border-white/10 pt-4 text-sm leading-relaxed text-foreground/72">
                {details.map((detail, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-foreground/40" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>

        {/* shadow depth */}
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-16 rounded-full bg-black/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Reduced motion for touch-ish experience fallback */}
        {!isHovering && (
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.18)]" />
        )}
      </motion.div>
    </motion.div>
  );
}