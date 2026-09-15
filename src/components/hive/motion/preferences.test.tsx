import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "./preferences";

function Probe() {
  return <p>{useReducedMotion() ? "Static interface" : "Interactive interface"}</p>;
}
const media = Object.assign(new EventTarget(), { matches: false });
const constructor = vi.fn(() => media);
beforeAll(() => vi.stubGlobal("matchMedia", constructor));
beforeEach(() => {
  media.matches = false;
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
afterAll(() => vi.unstubAllGlobals());

describe("motion preference hydration", () => {
  it("shares one media query and native listener across dozens of StrictMode subscribers", () => {
    const add = vi.spyOn(media, "addEventListener");
    const remove = vi.spyOn(media, "removeEventListener");
    const probes = (
      <StrictMode>
        {Array.from({ length: 48 }, (_, index) => (
          <Probe key={index} />
        ))}
      </StrictMode>
    );
    expect(renderToString(probes)).toContain("Interactive interface");
    expect(constructor).not.toHaveBeenCalled();
    const { rerender, unmount } = render(probes);
    expect(constructor).toHaveBeenCalledTimes(1);
    // StrictMode rehearses cleanup and remount; only one listener remains active.
    expect(add.mock.calls.length - remove.mock.calls.length).toBe(1);
    act(() => {
      media.matches = true;
      media.dispatchEvent(new Event("change"));
    });
    expect(screen.getAllByText("Static interface")).toHaveLength(48);
    rerender(probes);
    expect(constructor).toHaveBeenCalledTimes(1);
    unmount();
    expect(add.mock.calls.length).toBe(remove.mock.calls.length);
    // The cached query stays current even while there are no subscribers.
    media.matches = false;
    const remount = render(<Probe />);
    expect(screen.getByText("Interactive interface")).toBeInTheDocument();
    expect(constructor).toHaveBeenCalledTimes(1);
    remount.unmount();
    expect(add.mock.calls.length).toBe(remove.mock.calls.length);
  });

  it("hydrates identical server markup before applying a reduced-motion preference", () => {
    media.matches = true;
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
    render(<Probe />);
    expect(screen.getByText("Interactive interface")).toBeInTheDocument();
    act(() => {
      media.matches = true;
      media.dispatchEvent(new Event("change"));
    });
    expect(screen.getByText("Static interface")).toBeInTheDocument();
  });
});
