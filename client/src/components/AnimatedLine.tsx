/**
 * ANIMATED LINE — Horizontal rule transition between sections
 * 
 * Design: Noir Editorial
 * A thin line that draws from center outward as it enters the viewport,
 * creating an editorial page-turn feel between sections.
 */

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { ease, duration } from "@/lib/motion";

interface AnimatedLineProps {
  className?: string;
}

export function AnimatedLine({ className = "" }: AnimatedLineProps) {
  const { ref, isInView } = useInView({ threshold: 0.5 });

  return (
    <div ref={ref} className={`w-full py-4 md:py-6 ${className}`}>
      <div className="container">
        <motion.div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.08) 20%, oklch(1 0 0 / 0.08) 80%, transparent 100%)",
            transformOrigin: "center",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={
            isInView
              ? { scaleX: 1, opacity: 1 }
              : { scaleX: 0, opacity: 0 }
          }
          transition={{
            duration: duration.cinematic,
            ease: ease.inOut,
          }}
        />
      </div>
    </div>
  );
}
