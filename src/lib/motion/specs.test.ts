import { describe, expect, it } from "vitest";

import type { MotionSpec } from "./motion-spec";
import { resolveMotionSpec } from "./motion-spec";
import { getStaggerDelayMs, revealSpec } from "./specs";
import { STAGGER_STEP_MS } from "./tokens";

/**
 * Every animation declared anywhere in the codebase. If a new one is added to
 * specs.ts and not listed here, the exhaustiveness test below fails — which is
 * the point: the reduced-motion audit cannot silently miss an animation.
 *
 * The list is short because this system has exactly one JS-driven motion
 * contract. Hover, press, route entrance and the nav sheet are CSS transitions
 * whose reduced-motion substitutions (docs/04 §6.1 rows M4–M9) are enforced in
 * the `@media (prefers-reduced-motion: reduce)` block of globals.css §9.
 */
const ALL_SPECS: ReadonlyArray<readonly [string, MotionSpec<unknown>]> = [
  ["revealSpec", revealSpec],
];

describe("every motion spec declares a real static end state", () => {
  it.each(ALL_SPECS)("%s names a docs/04 §6.1 row", (_name, spec) => {
    expect(spec.row).toMatch(/^M(1[0-5]|[1-9])$/);
  });

  it.each(ALL_SPECS)("%s describes its completed state", (_name, spec) => {
    expect(spec.staticEndState.length).toBeGreaterThan(0);
  });

  it.each(ALL_SPECS)("%s resolves to a non-animated branch under reduced motion", (_name, spec) => {
    // docs/04 §6.1 [DEV-9] rejects the "0.01ms duration" substitution. The
    // reduced branch must be a genuine absence of animation, not a fast one.
    const reduced = resolveMotionSpec(spec, true);
    expect(reduced).toBeNull();
  });

  it.each(ALL_SPECS)("%s still animates when motion is allowed", (_name, spec) => {
    expect(resolveMotionSpec(spec, false)).not.toBeNull();
  });

  it.each(ALL_SPECS)("%s is frozen against mutation", (_name, spec) => {
    expect(Object.isFrozen(spec)).toBe(true);
  });
});

describe("stagger delay", () => {
  it("steps by 50ms per item", () => {
    expect(getStaggerDelayMs(0)).toBe(0);
    expect(getStaggerDelayMs(1)).toBe(STAGGER_STEP_MS);
    expect(getStaggerDelayMs(3)).toBe(3 * STAGGER_STEP_MS);
  });

  it("caps the envelope at five items", () => {
    // Beyond 5 items the last one arrives after the reader has moved on.
    expect(getStaggerDelayMs(4)).toBe(200);
    expect(getStaggerDelayMs(9)).toBe(200);
    expect(getStaggerDelayMs(40)).toBe(200);
  });

  it("treats a negative index as the first item", () => {
    expect(getStaggerDelayMs(-3)).toBe(0);
  });
});
