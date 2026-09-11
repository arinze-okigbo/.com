/**
 * `MotionSpec` — the mechanism that makes the reduced-motion path structurally
 * impossible to forget.
 *
 * docs/04 §6 is explicit: "set all durations to 0.01ms" is REJECTED as the
 * primary mechanism [DEV-9]. A zero-duration transition is still a transition —
 * the element still starts hidden and still depends on JS to arrive. Every
 * animation must instead declare a real STATIC END STATE.
 *
 * This module enforces that at the type level. There is no way to construct an
 * animation description in this codebase without also naming:
 *
 *   1. the docs/04 §6.1 substitution row it satisfies (`row`), and
 *   2. what the element looks like when motion is suppressed (`reduced`).
 *
 * `reduced: null` is the canonical answer and means "render the element with no
 * animation applied at all, in its completed state". It is deliberately a
 * distinct type from the animated value, so a consumer cannot pass the reduced
 * branch to an animation API by accident — the compiler makes them write the
 * static branch.
 */

/**
 * The rows of the docs/04 §6.1 reduced-motion substitution table. Naming a row
 * is required, so every animation is traceable to a specified static end state
 * and Phase 5 can diff the set of rows actually used against the table.
 */
export type ReducedMotionRow =
  | "M1" // Section/entry reveal
  | "M2" // Hero block reveal
  | "M3" // Stagger
  | "M4" // Inline link underline
  | "M5" // Button press
  | "M6" // Hover lift
  | "M7" // Nav sheet open/close
  | "M8" // Theme toggle crossfade
  | "M9" // Active-nav marker slide
  | "M10" // Focus ring appearance
  | "M11" // Hero 3D attestation resolve
  | "M12" // Lenis smooth scroll
  | "M13" // Scroll-linked progress line
  | "M14" // @supports (animation-timeline: view()) reveals
  | "M15"; // Decorative loops — none exist

export interface MotionSpec<TAnimated> {
  /** The docs/04 §6.1 row this animation's static end state is specified by. */
  readonly row: ReducedMotionRow;
  /** Human-readable note naming the completed state Phase 5 should observe. */
  readonly staticEndState: string;
  /** What runs when motion is permitted. */
  readonly animated: TAnimated;
  /**
   * What runs under `prefers-reduced-motion: reduce`.
   *
   * `null` means "apply no animation at all" — the element renders in its
   * completed state in the first paint. Prefer `null`. A non-null value is
   * permitted only when the reduced path is itself a different, non-motion
   * presentation (e.g. a colour swap standing in for a transform), never a
   * shortened version of the same movement.
   */
  readonly reduced: TAnimated | null;
}

/**
 * Declares an animation together with its reduced-motion end state.
 * Freezing makes the spec immutable at runtime as well as in the type system.
 */
export function defineMotionSpec<TAnimated>(spec: MotionSpec<TAnimated>): MotionSpec<TAnimated> {
  return Object.freeze({ ...spec });
}

/**
 * Picks the branch. Returns `null` when the element must render statically —
 * callers must handle that case, which is the whole point.
 */
export function resolveMotionSpec<TAnimated>(
  spec: MotionSpec<TAnimated>,
  prefersReducedMotion: boolean,
): TAnimated | null {
  return prefersReducedMotion ? spec.reduced : spec.animated;
}
