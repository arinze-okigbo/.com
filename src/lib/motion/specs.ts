/**
 * Every animation on this site, declared once, each with its reduced-motion
 * static end state attached (docs/04 §6.1).
 *
 * Nothing outside this file may declare a motion contract. That keeps the diff
 * against docs/04 to a single file, and it means adding an animation forces you
 * through `defineMotionSpec`, which will not compile without a §6.1 row and a
 * stated end state.
 *
 * SCOPE NOTE — read before adding to this file.
 *
 * Every animation this system ships is a CSS transition or an
 * IntersectionObserver attribute write. There is no JS animation runtime: the
 * Framer Motion boundary that used to wrap the app animated zero components and
 * cost 29,525 B gz on every page load, so it and its dependency were removed.
 * The specs that existed only to describe CSS that globals.css already
 * authors — route transition, hover lift, press, nav sheet — went with it;
 * their reduced-motion guarantees live in the
 * `@media (prefers-reduced-motion: reduce)` block of globals.css §9 (rows
 * M4–M9), which is where they were always actually enforced.
 *
 * What remains here is the one spec a component genuinely branches on at
 * runtime: the reveal observer. If a future animation needs JS, declare it here
 * through `defineMotionSpec` so the reduced-motion branch stays structural.
 */

import type { MotionSpec } from "./motion-spec";
import { defineMotionSpec } from "./motion-spec";
import { REVEAL_ROOT_MARGIN, REVEAL_THRESHOLD, STAGGER_MAX_INDEX, STAGGER_STEP_MS } from "./tokens";

/* -------------------------------------------------------------------------- */
/* Scroll reveals — the IntersectionObserver contract, not a JS animation.    */
/* -------------------------------------------------------------------------- */

/**
 * Reveals are driven by CSS transitions keyed off `data-revealed`
 * (globals.css §7). JS only decides *when* the attribute lands, which is why
 * this spec describes an observer rather than a set of keyframes: the cheapest
 * mechanism that does the job (docs/02 §6 — "Zero JS animation cost").
 */
export interface RevealObserverConfig {
  readonly rootMargin: string;
  readonly threshold: number;
}

/**
 * M1/M2/M3. Static end state: the element renders at `opacity: 1;
 * transform: none` in the FIRST paint, the `data-reveal` attribute is never
 * applied, the observer is never constructed, and every stagger delay is 0.
 */
export const revealSpec: MotionSpec<RevealObserverConfig> = defineMotionSpec({
  row: "M1",
  staticEndState:
    "Element renders at opacity 1 / transform none in the first paint; no data-reveal attribute, no observer, no stagger delay (M1, M2, M3).",
  animated: { rootMargin: REVEAL_ROOT_MARGIN, threshold: REVEAL_THRESHOLD },
  reduced: null,
});

/**
 * Stagger delay for item `index`, capped at `STAGGER_MAX_ITEMS` per docs/04
 * §5.3. The cap is also applied in CSS via `min(var(--reveal-index), 4)`; this
 * function exists for callers that need the number (tests, inline styles).
 */
export const getStaggerDelayMs = (index: number): number =>
  Math.min(Math.max(index, 0), STAGGER_MAX_INDEX) * STAGGER_STEP_MS;
