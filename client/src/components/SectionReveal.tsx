/**
 * SECTION REVEAL — Consistent scroll-based reveal wrapper
 * 
 * Design: Noir Editorial
 * Every section uses this component for a unified reveal system.
 * Content fades in with a subtle upward translation.
 */

import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { fadeInUp, staggerContainer, stagger } from "@/lib/motion";
import type { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  id?: string;
}

export function SectionReveal({
  children,
  className = "",
  staggerDelay = stagger.normal,
  id,
}: SectionRevealProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, rootMargin: "-50px" });

  return (
    <motion.div
      ref={ref}
      id={id}
      variants={staggerContainer(staggerDelay)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeInUp} className={className}>
      {children}
    </motion.div>
  );
}
