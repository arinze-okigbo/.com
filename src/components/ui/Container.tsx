import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fieldAttributes, fieldClass, type FieldCompositeProps } from "./field";

/** docs/04 §1.5 — the only three column widths on the site. */
export type ContainerWidth = "prose" | "wide" | "shell";

/** Elements a Container is allowed to become. Keeps the landmark set honest. */
export type ContainerElement = "div" | "section" | "article" | "header" | "footer" | "main" | "nav";

export interface ContainerProps extends FieldCompositeProps {
  /** 672px reading column (default), 768px wide block, or the 1024px shell. */
  readonly width?: ContainerWidth;
  readonly as?: ContainerElement;
  readonly className?: string;
  readonly children: ReactNode;
}

const WIDTH_CLASS: Readonly<Record<ContainerWidth, string>> = {
  prose: "col--prose",
  wide: "col--wide",
  shell: "col--shell",
};

/**
 * docs/04 §8.1 — `max-inline-size: var(--container-{width})`,
 * `margin-inline: auto`, `padding-inline: var(--gutter)`.
 *
 * The emitted class is `col`, not `container`: `container` is a Tailwind
 * utility name and Tailwind's `@layer utilities` beats our `@layer components`
 * regardless of specificity, which silently widened every column to 1024px.
 * See the comment on `.col` in globals.css §8.
 *
 * It also carries the field-composite props (`src/components/ui/field.ts`),
 * because `Hero` renders `Container as="section"` and is therefore the one
 * section on the page that is not a `Section`. Every one of them is optional
 * and every value is `undefined` by default, so a Container that opts into
 * none of them renders byte-identical markup to before the port.
 */
export function Container({
  width = "prose",
  as: Element = "div",
  field,
  fieldState,
  scrim,
  lit,
  className,
  children,
}: ContainerProps) {
  return (
    <Element
      className={cn("col", WIDTH_CLASS[width], fieldClass(field), className)}
      {...fieldAttributes({ fieldState, scrim, lit })}
    >
      {children}
    </Element>
  );
}
