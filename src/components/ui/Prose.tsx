import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ProseElement = "div" | "article";

export interface ProseProps {
  readonly as?: ProseElement;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * docs/04 §8.2 — applies the type system to server-rendered long-form copy
 * and MDX. Constrained to `--measure-prose` (672px, ~68ch).
 *
 * Code blocks render monochrome on `--color-surface`: no syntax-highlighting
 * palette is defined, and adding one would break the §3.1 colour count.
 */
export function Prose({ as: Element = "div", className, children }: ProseProps) {
  return <Element className={cn("prose", className)}>{children}</Element>;
}
