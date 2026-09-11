import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "./Reveal";

/** jsdom has no matchMedia; install one that reports a given preference. */
const setReducedMotion = (matches: boolean): void => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "matchMedia");
  vi.restoreAllMocks();
});

describe("Reveal — motion allowed", () => {
  it("marks the element for the CSS reveal at the default distance", () => {
    setReducedMotion(false);
    render(<Reveal>content</Reveal>);

    const element = screen.getByText("content");
    expect(element).toHaveAttribute("data-reveal", "default");
  });

  it("uses the large distance for the hero block", () => {
    setReducedMotion(false);
    render(<Reveal distance="lg">hero</Reveal>);

    expect(screen.getByText("hero")).toHaveAttribute("data-reveal", "lg");
  });

  it("keeps the hero painted so it stays an LCP candidate", () => {
    setReducedMotion(false);
    render(<Reveal distance="lg">hero</Reveal>);

    // Text at opacity 0 is not an LCP candidate; the hero reveals by transform
    // alone so first paint is never delayed.
    expect(screen.getByText("hero")).toHaveStyle({ opacity: "1" });
  });

  it("does not pin opacity on ordinary reveals", () => {
    setReducedMotion(false);
    render(<Reveal>entry</Reveal>);

    // No inline style at all — the CSS in globals.css owns the opacity fade.
    expect(screen.getByText("entry")).not.toHaveAttribute("style");
  });

  it("passes the stagger index to CSS", () => {
    setReducedMotion(false);
    render(<Reveal index={2}>item</Reveal>);

    expect(screen.getByText("item").getAttribute("style")).toContain("--reveal-index: 2");
  });

  it("renders as the requested element so list markup stays valid", () => {
    setReducedMotion(false);
    render(
      <ul>
        <Reveal as="li" index={0}>
          entry
        </Reveal>
      </ul>,
    );

    const item = screen.getByText("entry");
    expect(item.tagName).toBe("LI");
    expect(item.parentElement?.tagName).toBe("UL");
  });

  it("reveals immediately when IntersectionObserver is unavailable", () => {
    setReducedMotion(false);
    render(<Reveal>content</Reveal>);

    // No observer in this environment — content must never be left hidden.
    const element = screen.getByText("content");
    expect(element).toHaveAttribute("data-revealed");
    expect(element).toHaveAttribute("data-reveal-instant");
  });
});

describe("Reveal — prefers-reduced-motion: reduce", () => {
  it("renders no reveal attributes at all", () => {
    setReducedMotion(true);
    render(<Reveal index={3}>content</Reveal>);

    const element = screen.getByText("content");
    expect(element).not.toHaveAttribute("data-reveal");
    expect(element).not.toHaveAttribute("data-revealed");
    expect(element).not.toHaveAttribute("data-reveal-instant");
  });

  it("applies no stagger delay", () => {
    setReducedMotion(true);
    render(<Reveal index={4}>content</Reveal>);

    expect(screen.getByText("content")).not.toHaveAttribute("style");
  });

  it("keeps the hero visible and unpositioned", () => {
    setReducedMotion(true);
    render(<Reveal distance="lg">hero</Reveal>);

    const element = screen.getByText("hero");
    expect(element).toBeVisible();
    expect(element).not.toHaveAttribute("data-reveal");
  });

  it("still renders the requested element and children", () => {
    setReducedMotion(true);
    render(
      <Reveal as="article" className="entry" id="work-1">
        entry
      </Reveal>,
    );

    const element = screen.getByText("entry");
    expect(element.tagName).toBe("ARTICLE");
    expect(element).toHaveClass("entry");
    expect(element).toHaveAttribute("id", "work-1");
  });
});
