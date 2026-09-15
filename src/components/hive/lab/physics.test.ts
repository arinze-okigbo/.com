import { describe, expect, it } from "vitest";
import { resolveCollision, springStep } from "./physics";

describe("interactive spring solver", () => {
  it("converges on the target without a drifting resting position", () => {
    let body = { x: 0, y: 0, vx: 0, vy: 0 };
    for (let i = 0; i < 600; i++) body = springStep(body, { x: 100, y: -25 }, 200, 20, 1 / 60);
    expect(body.x).toBeCloseTo(100, 3);
    expect(body.y).toBeCloseTo(-25, 3);
    expect(body.vx).toBeCloseTo(0, 3);
  });
  it("caps long background frames to avoid unstable jumps", () => {
    const body = { x: 0, y: 0, vx: 0, vy: 0 };
    expect(springStep(body, { x: 100, y: 100 }, 400, 30, 50)).toEqual(
      springStep(body, { x: 100, y: 100 }, 400, 30, 1 / 60),
    );
  });
  it("separates overlapping bodies and leaves distant bodies alone", () => {
    const a = { x: 0, y: 0, vx: 10, vy: 0 },
      b = { x: 10, y: 0, vx: -10, vy: 0 };
    resolveCollision(a, b, 20);
    expect(b.x - a.x).toBeCloseTo(20);
    expect(a.vx).toBeLessThan(10);
    const before = { ...a };
    resolveCollision(a, { x: 1000, y: 0, vx: 0, vy: 0 }, 20);
    expect(a).toEqual(before);
  });
});
