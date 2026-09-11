import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerWidth } from "./Container";

export interface SectionProps {
  /** Anchor target. Every section is linkable from the primary nav. */
  readonly id: string;
  /** `id` of the heading that names this region. [WCAG 1.3.1] */
  readonly labelledBy?: string;
  readonly width?: ContainerWidth;
  /**
   * The last section before the footer also takes a closing gap.
   * Every other section takes `padding-block-start` only — docs/04 §2.3
   * makes the section gap a gap, not symmetric padding, so the page
   * stays inside the 6-viewport budget [03 R14].
   */
  readonly isLast?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}

export function Section({
  id,
  labelledBy,
  width = "prose",
  isLast = false,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("section", isLast && "section--last", className)}
    >
      <Container width={width}>{children}</Container>
    </section>
  );
}
