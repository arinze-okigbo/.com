import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const css = readFileSync("src/app/globals.css", "utf8");
function block(query: string) {
  const start = css.indexOf(query);
  expect(start).toBeGreaterThan(-1);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return "";
}
const print = block("@media print").replace(/\s+/g, "");
describe("print accessibility", () => {
  it("removes fixed navigation and live canvases", () => {
    expect(print).toMatch(/header[^}]*canvas[^}]*display:none!important/);
  });
  it("prints external destinations", () => {
    expect(print).toContain("attr(href)");
    expect(print).toContain("mailto:");
  });
  it("avoids headings stranded at page ends and split entries", () => {
    expect(print).toMatch(/break-after:\s*avoid/);
    expect(print).toMatch(/break-inside:\s*avoid/);
  });
  it("preserves body contrast and outlines primary actions", () => {
    expect(print).toContain("color:#111");
    expect(print).toContain("border-color:currentColor");
  });
});
describe("motion accessibility", () => {
  it("provides reduced-motion static final state", () => {
    const reduced = block("@media (prefers-reduced-motion: reduce)").replace(/\s+/g, "");
    expect(reduced).toContain("animation:none");
    expect(reduced).toContain("opacity:1");
    expect(reduced).toContain("transform:none");
  });
  it("retains a visible keyboard focus ring", () => {
    expect(css).toContain(":focus-visible");
    expect(css.replace(/\s+/g, "")).toContain("outline:2pxsolidvar(--accent)");
  });
});
