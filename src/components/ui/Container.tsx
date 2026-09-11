import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** docs/04 §1.5 — the only three column widths on the site. */
export type ContainerWidth = "prose" | "wide" | "shell";

/** Elements a Container is allowed to become. Keeps the landmark set honest. */
export type ContainerElement = "div" | "section" | "article" | "header" | "footer" | "main" | "nav";

export interface ContainerProps {
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
 */
export function Container({
  width = "prose",
  as: Element = "div",
  className,
  children,
}: ContainerProps) {
  return <Element className={cn("col", WIDTH_CLASS[width], className)}>{children}</Element>;
}
