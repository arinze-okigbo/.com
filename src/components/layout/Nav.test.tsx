import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Nav, type NavItem } from "./Nav";

/**
 * Regression guards for `docs/08-review-accessibility-c2` N1 (SC 2.4.11 Focus
 * Not Obscured, Level AA) and N2 (SC 2.4.3 Focus Order, Level A).
 *
 * These are the two defects axe could not see, and they are both *focus-state*
 * behaviour rather than DOM shape — so they are tested by driving focus, not by
 * asserting attributes. jsdom does not implement the browser's own Tab
 * traversal, which is exactly why the trap has to preventDefault and place
 * focus itself; that placement is what these assert. The geometric half of N1
 * (ring coverage at 767x900 and 480x700) needs real layout and lives in
 * `tests/e2e/nav-focus-trap.spec.ts`.
 */

/**
 * jsdom ships no IntersectionObserver and the scroll spy constructs one on
 * mount. A no-op stub keeps the spy inert without touching the component under
 * test; `spiedId` simply stays `null`, which is the pre-scroll state anyway.
 */
class NoopIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: readonly number[] = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const ITEMS: readonly NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
];

function renderNav(): void {
  render(
    <>
      {/* Stand-ins for the hero proof-noun links the open sheet covers 100%
          between 480px and 767px. Buttons rather than anchors only because
          `next/link` lint forbids a bare <a href="/"> in this repo; what
          matters is that they are focusable and outside <nav>. */}
      <button type="button" id="before-nav">
        behind the sheet, above
      </button>
      <Nav items={ITEMS} resumeHref={null} />
      <section id="work">the work section</section>
      <button type="button" id="after-nav">
        behind the sheet, below
      </button>
    </>,
  );
}

function openSheet(): HTMLElement {
  const toggle = screen.getByRole("button", { name: "Open menu" });
  fireEvent.click(toggle);
  return toggle;
}

afterEach(cleanup);

/** jsdom implements no navigation, so an un-prevented link click logs a stack. */
function swallowNavigation(event: MouseEvent): void {
  event.preventDefault();
}

beforeEach(() => {
  document.body.innerHTML = "";
  window.IntersectionObserver = NoopIntersectionObserver;
  document.addEventListener("click", swallowNavigation);
});

afterEach(() => {
  document.removeEventListener("click", swallowNavigation);
});

describe("Nav mobile disclosure — focus containment (N1, SC 2.4.11)", () => {
  it("moves focus into the sheet when it opens, not onto the toggle that opened it", () => {
    // Arrange / Act
    renderNav();
    openSheet();

    // Assert
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Work" }));
  });

  it("wraps Tab from the last sheet stop back to the first, so focus never lands behind the sheet", () => {
    renderNav();
    const toggle = openSheet();
    const projects = screen.getByRole("link", { name: "Projects" });
    projects.focus();

    // Act — Tab off the end of the trap.
    const handled = fireEvent.keyDown(document, { key: "Tab" });

    // Assert — the default was prevented and focus went to the first stop
    // inside <nav>, which is the toggle. Before the fix this Tab left the nav
    // entirely and landed on a link the sheet covers 100%.
    expect(handled).toBe(false);
    expect(document.activeElement).toBe(toggle);
  });

  it("drives every Tab in the ring, not only the two at the ends", () => {
    // WebKit with Safari's default "Press Tab to highlight each item" OFF moves
    // focus from a link to BODY rather than to the next link. A boundary-only
    // trap therefore oscillated toggle → BODY → toggle in WebKit 26.6 and never
    // visited the sheet's links at all. Driving the whole ring makes the
    // traversal identical in all three engines.
    renderNav();
    const toggle = openSheet();
    toggle.focus();

    fireEvent.keyDown(document, { key: "Tab" });

    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Work" }));
  });

  it("wraps Shift+Tab from the first stop to the last", () => {
    renderNav();
    const toggle = openSheet();
    toggle.focus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Projects" }));
  });

  it("pulls focus back into the trap if it is somehow outside when Tab is pressed", () => {
    renderNav();
    const toggle = openSheet();
    const outside = document.getElementById("after-nav");
    outside?.focus();

    fireEvent.keyDown(document, { key: "Tab" });

    expect(document.activeElement).toBe(toggle);
  });

  it("does nothing at all while the sheet is closed", () => {
    // Arrange — a closed sheet must not interfere with the rest of the page.
    renderNav();
    const outside = document.getElementById("after-nav");
    outside?.focus();

    // Act
    const handled = fireEvent.keyDown(document, { key: "Tab" });

    // Assert — default not prevented, focus untouched.
    expect(handled).toBe(true);
    expect(document.activeElement).toBe(outside);
  });

  it("closes when focus moves outside the nav by any route the key handler cannot see", () => {
    renderNav();
    const toggle = openSheet();
    const outside = document.getElementById("after-nav");

    fireEvent.focusIn(outside as HTMLElement);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on a pointer press outside the nav rather than leaving an overlay over the page", () => {
    renderNav();
    const toggle = openSheet();

    fireEvent.pointerDown(document.getElementById("after-nav") as HTMLElement);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Nav mobile disclosure — focus destination on dismissal (N2, SC 2.4.3)", () => {
  it("returns focus to the toggle on Escape instead of dropping it to BODY", () => {
    renderNav();
    const toggle = openSheet();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(toggle);
    expect(document.activeElement).not.toBe(document.body);
  });

  it("moves focus to the destination section when an in-page link is activated", () => {
    // Arrange — closing the sheet hides the link that holds focus, so without
    // this the activeElement became BODY and the virtual cursor reset to the
    // top of the document.
    renderNav();
    openSheet();

    // Act
    fireEvent.click(screen.getByRole("link", { name: "Work" }));

    // Assert
    const section = document.getElementById("work");
    expect(document.activeElement).toBe(section);
    // tabindex="-1" makes it focusable WITHOUT adding a Tab stop.
    expect(section).toHaveAttribute("tabindex", "-1");
  });

  it("falls back to the toggle when the link leaves the page", () => {
    render(
      <Nav items={ITEMS} resumeHref="https://example.com/resume.pdf" resumeLabel="Résumé (PDF)" />,
    );
    const toggle = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(toggle);

    fireEvent.click(screen.getByRole("link", { name: "Résumé (PDF)" }));

    expect(document.activeElement).toBe(toggle);
  });
});
