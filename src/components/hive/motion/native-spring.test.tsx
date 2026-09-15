import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { createPointerSpring, stepSnappy } from "./native-spring";
import { Magnetic, TiltCard } from "../Motion";

vi.mock("./interactions.css", () => ({}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function animationFrames() {
  let id = 0;
  const pending = new Map<number, FrameRequestCallback>();
  vi.spyOn(performance, "now").mockReturnValue(0);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      pending.set(++id, callback);
      return id;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((key: number) => pending.delete(key)),
  );
  return {
    pending,
    advance(time: number) {
      const callbacks = [...pending.values()];
      pending.clear();
      callbacks.forEach((callback) => callback(time));
    },
  };
}

describe("native interaction springs", () => {
  it("converges and produces the same state across frame rates", () => {
    const oneStep = stepSnappy(0, 0, 100, 0.5);
    let state = { value: 0, velocity: 0 };
    for (let i = 0; i < 60; i++) state = stepSnappy(state.value, state.velocity, 100, 1 / 120);
    expect(state.value).toBeCloseTo(oneStep.value, 10);
    expect(state.velocity).toBeCloseTo(oneStep.velocity, 10);
    expect(stepSnappy(0, 0, 100, 3).value).toBeCloseTo(100, 10);
    expect(stepSnappy(0, 0, 100, 3).velocity).toBeCloseTo(0, 10);
  });

  it("starts only on interaction and stop cancels pending work", () => {
    const frames = animationFrames();
    const renderFrame = vi.fn();
    const spring = createPointerSpring(renderFrame);
    expect(frames.pending.size).toBe(0);
    spring.set(100, -20);
    expect(frames.pending.size).toBe(1);
    frames.advance(16);
    expect(renderFrame).toHaveBeenCalledTimes(1);
    spring.stop();
    expect(frames.pending.size).toBe(0);
    frames.advance(32);
    expect(renderFrame).toHaveBeenCalledTimes(1);
  });

  it("retains existing velocity during rapid target changes", () => {
    const frames = animationFrames();
    const renderFrame = vi.fn();
    const spring = createPointerSpring(renderFrame);
    spring.set(100, 0);
    frames.advance(16);
    const first = stepSnappy(0, 0, 100, 0.016);
    spring.set(-50, 0);
    frames.advance(32);
    const expected = stepSnappy(first.value, first.velocity, -50, 0.016);
    const restarted = stepSnappy(first.value, 0, -50, 0.016);
    expect(renderFrame.mock.lastCall?.[0]).toBeCloseTo(expected.value, 10);
    expect(Math.abs(expected.value - restarted.value)).toBeGreaterThan(1);
    spring.stop();
  });

  it("stops scheduling once it reaches equilibrium", () => {
    const frames = animationFrames();
    const renderFrame = vi.fn();
    const spring = createPointerSpring(renderFrame);
    spring.set(10, -7);
    for (let time = 16; time <= 3000 && frames.pending.size; time += 16) frames.advance(time);
    expect(frames.pending.size).toBe(0);
    expect(renderFrame).toHaveBeenLastCalledWith(10, -7);
  });

  it("keeps pointer decorations static with reduced motion", () => {
    const frames = animationFrames();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    const { getByText } = render(
      <>
        <Magnetic>Navigation</Magnetic>
        <TiltCard>Project</TiltCard>
      </>,
    );
    for (const label of ["Navigation", "Project"]) {
      const element = getByText(label);
      fireEvent.mouseMove(element, { clientX: 80, clientY: 40 });
      fireEvent.mouseLeave(element);
      expect(element.style.transform).toBe("none");
    }
    expect(frames.pending.size).toBe(0);
  });
});
