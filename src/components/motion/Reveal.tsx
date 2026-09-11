"use client";

import { createElement } from "react";
import type { CSSProperties, ReactNode } from "react";

import { useReveal } from "@/lib/motion/use-reveal";
import { ATTR_REVEAL } from "@/lib/motion/tokens";

/**
 * The single reveal primitive (docs/04 §8.3). No other component on this site
 * implements its own scroll animation.
 *
 * Mechanism: this component sets `data-reveal` and an `IntersectionObserver`
 * adds `data-revealed`. The animation itself is a CSS transition declared in
 * `globals.css` §10.7 — there is no JS animation here at all, which is the
 * cheapest correct mechanism (docs/02 §6).
 *
 * No-JS: the reveal CSS is scoped to `.js [data-reveal]`, and `.js` is added by
 * the blocking theme script. With JS disabled the selector never matches and
 * every wrapped node renders fully visible (docs/02 §8.6, docs/03 R30).
 *
 * Reduced motion: the reveal attributes are not rendered at all and the
 * observer is never constructed, so the element paints in its completed state
 * in the first paint (docs/04 §6.1 M1/M2/M3). That branch is taken inside
 * `useReveal` via `useMotionSpec`, not by an opt-in prop here.
 *
 * Layout: this component adds no box of its own — no padding, no margin, no
 * display change. It animates `transform` and `opacity` only, so its CLS
 * contribution is zero.
 */

/** Tags `Reveal` may become. Constrained so it can never render a void or
 *  interactive element, and wide enough to BE the `<li>` / `<article>` rather
 *  than inject an invalid wrapper inside a list. */
export type RevealElement =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "figure"
  | "ul"
  | "ol"
  | "li"
  | "p"
  | "span";

export type RevealDistance = "default" | "lg";

export interface RevealProps {
  children: ReactNode;
  /**
   * `"default"` → 8px travel (every section and entry).
   * `"lg"` → 16px travel, reserved for the hero block; docs/04 §5.2 permits
   * exactly one use of it on the page.
   */
  distance?: RevealDistance;
  /**
   * Position in a staggered list. Each step adds 50ms, capped at 5 items
   * (docs/04 §5.3). The cap is applied in CSS as `min(var(--reveal-index), 4)`,
   * so passing index 40 is harmless — it shares the last delay.
   */
  index?: number;
  /** Element to render. Defaults to `div`. */
  as?: RevealElement;
  className?: string;
  id?: string;
}

/** `--reveal-index` is read by the CSS `transition-delay` expression. */
type RevealStyle = CSSProperties & {
  "--reveal-index"?: number;
};

export function Reveal({
  children,
  distance = "default",
  index,
  as = "div",
  className,
  id,
}: RevealProps): React.JSX.Element {
  const { ref, isManaged } = useReveal();

  // Reduced motion: no attributes, no custom properties, no observer. The
  // element is indistinguishable from unwrapped markup, which is exactly the
  // static end state docs/04 §6.1 M1/M2/M3 specifies.
  if (!isManaged) {
    return createElement(as, { className, id }, children);
  }

  const style: RevealStyle | undefined =
    index === undefined ? undefined : { "--reveal-index": Math.max(Math.trunc(index), 0) };

  // The hero (`distance="lg"`) is the LCP element. `.js [data-reveal]` sets
  // `opacity: 0` at first paint, and text at zero opacity is not an LCP
  // candidate — so a hero that faded in would push LCP out by hydration time
  // plus the reveal duration. Pinning opacity inline keeps the hero painted
  // from the very first frame and lets it reveal by transform alone, which
  // affects neither LCP eligibility nor CLS. Transform is still `16px` /
  // `--duration-reveal` / `--ease-entrance` exactly as docs/04 §8.2 specifies.
  const heroOpacityGuard: CSSProperties | undefined =
    distance === "lg" ? { opacity: 1 } : undefined;

  const mergedStyle: RevealStyle | undefined =
    style || heroOpacityGuard ? { ...style, ...heroOpacityGuard } : undefined;

  return createElement(
    as,
    {
      ref,
      className,
      id,
      style: mergedStyle,
      [ATTR_REVEAL]: distance,
    },
    children,
  );
}
