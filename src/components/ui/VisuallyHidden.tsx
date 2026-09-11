import type { ReactNode } from "react";

export type VisuallyHiddenElement = "span" | "div";

export interface VisuallyHiddenProps {
  readonly as?: VisuallyHiddenElement;
  readonly children: ReactNode;
}

/**
 * docs/04 §8.4 — clip-path technique. Remains focusable and readable by
 * assistive technology; never `display: none`.
 */
export function VisuallyHidden({ as: Element = "span", children }: VisuallyHiddenProps) {
  return <Element className="visually-hidden">{children}</Element>;
}
