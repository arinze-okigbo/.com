import { act, cleanup, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "./preferences";

function Probe() {
  return <p>{useReducedMotion() ? "Static interface" : "Interactive interface"}</p>;
}
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("motion preference hydration", () => {
  it("hydrates identical server markup before applying a reduced-motion preference", () => {
    const media = Object.assign(new EventTarget(), { matches: true });
    vi.stubGlobal("matchMedia", () => media);
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Probe />);
    expect(container.textContent).toBe("Interactive interface");
    document.body.appendChild(container);
    render(<Probe />, { container, hydrate: true });
    expect(screen.getByText("Static interface")).toBeInTheDocument();
    expect(error).not.toHaveBeenCalled();
  });
  it("reacts when the operating-system preference changes during a visit", () => {
    const media = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal("matchMedia", () => media);
    render(<Probe />);
    expect(screen.getByText("Interactive interface")).toBeInTheDocument();
    act(() => {
      media.matches = true;
      media.dispatchEvent(new Event("change"));
    });
    expect(screen.getByText("Static interface")).toBeInTheDocument();
  });
});
