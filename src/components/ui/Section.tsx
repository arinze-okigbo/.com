import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerWidth } from "./Container";
import {
  fieldAttributes,
  fieldClass,
  type FieldCompositeProps,
  type SectionField,
  type SectionFieldState,
} from "./field";

export type { SectionField, SectionFieldState };

export interface SectionProps extends FieldCompositeProps {
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

/**
 * docs/04 §8.1. The field-composite props (`./field`) land on the
 * `<section>` itself rather than on the inner column, because the rect the
 * composite pass carves is the block the reader sees, and because the
 * `.stage` / `.over-field` token scope has to cover the heading as well as
 * the prose.
 *
 * `docs/15 §3.3` is the reason this passthrough exists at all: every section
 * gains `data-scrim` on its text blocks and a field class where it composites
 * over the stage, and hand-rolling that in eight files is how two of them end
 * up disagreeing.
 */
export function Section({
  id,
  labelledBy,
  width = "prose",
  isLast = false,
  field,
  fieldState,
  scrim,
  lit,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("section", isLast && "section--last", fieldClass(field), className)}
      {...fieldAttributes({ fieldState, scrim, lit })}
    >
      <Container width={width}>{children}</Container>
    </section>
  );
}
