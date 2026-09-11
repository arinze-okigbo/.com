import { describe, expect, it } from "vitest";

import {
  DURATION_BASE_MS,
  DURATION_CEILING_MS,
  DURATION_FAST_MS,
  DURATION_REVEAL_MS,
  EASE_ENTRANCE,
  EASE_GLIDE,
  EASE_STANDARD,
  HOVER_LIFT_PX,
  PRESS_SCALE,
  PRESS_TRANSLATE_PX,
  REVEAL_DISTANCE_LG_PX,
  REVEAL_DISTANCE_PX,
  REVEAL_ROOT_MARGIN,
  REVEAL_THRESHOLD,
  STAGGER_MAX_ITEMS,
  STAGGER_STEP_MS,
  toBezier,
  toSeconds,
} from "./tokens";

/**
 * These assertions are the Phase-5 diff against docs/04, run on every commit.
 * A failure here means a token drifted from the design system, not that a test
 * needs updating.
 */
describe("motion tokens match docs/04", () => {
  it("ships exactly the three easing curves from §4", () => {
    expect(EASE_STANDARD).toEqual([0.4, 0, 0.2, 1]);
    expect(EASE_ENTRANCE).toEqual([0, 0, 0.2, 1]);
    expect(EASE_GLIDE).toEqual([0.32, 0.72, 0, 1]);
  });

  it("never produces an ease-in curve", () => {
    // ease-in is forbidden in any form (§4) because it speeds up at the end.
    // A decelerating finish means the second control point sits on or above
    // the diagonal: y2 >= x2.
    for (const easing of [EASE_STANDARD, EASE_ENTRANCE, EASE_GLIDE]) {
      expect(easing[3]).toBeGreaterThanOrEqual(easing[2]);
    }
  });

  it("uses the §5.1 duration tiers", () => {
    expect(DURATION_FAST_MS).toBe(150);
    expect(DURATION_BASE_MS).toBe(240);
    expect(DURATION_REVEAL_MS).toBe(280);
  });

  it("keeps every usable duration under the 320ms ceiling", () => {
    expect(DURATION_CEILING_MS).toBe(320);
    for (const duration of [DURATION_FAST_MS, DURATION_BASE_MS, DURATION_REVEAL_MS]) {
      expect(duration).toBeLessThan(DURATION_CEILING_MS);
    }
  });

  it("uses the §5.2 reveal distances, not the 40px template fade-up", () => {
    expect(REVEAL_DISTANCE_PX).toBe(8);
    expect(REVEAL_DISTANCE_LG_PX).toBe(16);
    expect(REVEAL_DISTANCE_LG_PX).toBeLessThanOrEqual(16);
  });

  it("keeps press and hover states restrained", () => {
    expect(PRESS_TRANSLATE_PX).toBe(1);
    expect(PRESS_SCALE).toBe(0.98);
    expect(HOVER_LIFT_PX).toBe(-2);
  });

  it("uses the §5.3 stagger and trigger values", () => {
    expect(STAGGER_STEP_MS).toBe(50);
    expect(STAGGER_MAX_ITEMS).toBe(5);
    expect(REVEAL_ROOT_MARGIN).toBe("0px 0px -15% 0px");
    expect(REVEAL_THRESHOLD).toBe(0);
  });

  it("converts milliseconds to the seconds Framer Motion expects", () => {
    expect(toSeconds(DURATION_REVEAL_MS)).toBeCloseTo(0.28);
  });

  it("hands out a fresh bezier array so tokens cannot be mutated", () => {
    const first = toBezier(EASE_STANDARD);
    const second = toBezier(EASE_STANDARD);

    first[0] = 999;

    expect(second).toEqual([0.4, 0, 0.2, 1]);
    expect(EASE_STANDARD).toEqual([0.4, 0, 0.2, 1]);
  });
});
