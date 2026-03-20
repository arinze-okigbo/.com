"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type SmoothScrollProviderProps = {
  children: ReactNode;
};

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <ReactLenis
      root
      autoRaf={!prefersReducedMotion}
      options={{
        duration: prefersReducedMotion ? 0 : 1.15,
        smoothWheel: !prefersReducedMotion,
      }}
    >
      {children}
    </ReactLenis>
  );
}