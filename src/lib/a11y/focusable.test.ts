import { afterEach, describe, expect, it } from "vitest";

import { getFocusableElements } from "./focusable";

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("getFocusableElements", () => {
  it("returns every tab stop in document order", () => {
    // Arrange
    const host = mount(`
      <button type="button">first</button>
      <a href="#work">second</a>
      <span tabindex="0">third</span>
    `);

    // Act
    const focusable = getFocusableElements(host);

    // Assert
    expect(focusable.map((element) => element.textContent?.trim())).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("excludes tabindex=-1 so a trap never cycles onto a reading-position target", () => {
    const host = mount(`
      <main tabindex="-1">reading position</main>
      <a href="#work">real stop</a>
    `);

    expect(getFocusableElements(host)).toHaveLength(1);
  });

  it("excludes a disabled control", () => {
    const host = mount(`<button type="button" disabled>inert</button><a href="/">live</a>`);

    expect(getFocusableElements(host).map((element) => element.tagName)).toEqual(["A"]);
  });

  it("excludes a subtree hidden with visibility, which is how the closed nav sheet hides", () => {
    // Arrange — `visibility` is inherited, so the anchor computes hidden too.
    const host = mount(`<div style="visibility: hidden"><a href="#work">in the sheet</a></div>`);

    // Assert
    expect(getFocusableElements(host)).toHaveLength(0);
  });

  it("excludes a subtree hidden with display, which visibility alone cannot detect", () => {
    // `display` is NOT inherited: the anchor's own computed display is `inline`.
    // Only walking the ancestor chain catches this.
    const host = mount(`<div style="display: none"><a href="#work">hidden</a></div>`);

    expect(getFocusableElements(host)).toHaveLength(0);
  });

  it("excludes the document-level external-link notice, which uses the hidden attribute", () => {
    const host = mount(`<span id="external-link-notice" hidden><a href="/">x</a></span>`);

    expect(getFocusableElements(host)).toHaveLength(0);
  });

  it("returns a frozen array so a caller cannot hold a mutable view of the tree", () => {
    const host = mount(`<a href="/">only</a>`);

    expect(Object.isFrozen(getFocusableElements(host))).toBe(true);
  });
});
