import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Source-level guards for the four print defects of
 * `docs/08-review-crossbrowser-c2` (N1 HIGH, N2/N3/N4 MEDIUM).
 *
 * Print is the one surface no runtime test in this suite can reach — jsdom
 * evaluates no `@media print` — and it is precisely the surface cycle 1 never
 * looked at, which is how a blank rectangle shipped where the site's one
 * authored visual should be. The real proof is a Chromium `page.pdf()` byte
 * comparison with WebGL live versus blocked (`tests/e2e/print.spec.ts`); this
 * file is the cheap guard that runs on every `npm test` so a deletion is caught
 * without a browser.
 *
 * Asserting on source text is a deliberate trade: it cannot prove the rules
 * *work*, only that they are still there with the properties that make them
 * work. Each assertion below therefore targets the exact declaration whose
 * absence caused the measured defect.
 */

/**
 * Comments are stripped first. This file is heavily commented — the deletion of
 * the scroll-driven block leaves a comment quoting the rule it deleted — so a
 * naive text search would pass on prose and fail on the one thing it exists to
 * check.
 */
const GLOBALS_CSS = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** The body of the top-level `@media print` block, brace-matched. */
function printBlock(css: string): string {
  const start = css.indexOf("@media print");
  expect(start).toBeGreaterThan(-1);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, index);
    }
  }
  throw new Error("unterminated @media print block");
}

const PRINT = printBlock(GLOBALS_CSS);

describe("@media print — the attestation figure (N1, HIGH)", () => {
  it("forces the poster visible with !important, because mount.ts pins it inline", () => {
    // `runtime/mount.ts` sets `poster.style.opacity = "0"` on the first drawn
    // frame. An inline style outranks any stylesheet declaration without
    // `!important`, so dropping the keyword silently reinstates the blank box.
    expect(PRINT).toMatch(/\[data-attestation-poster\]\s*\{[^}]*opacity:\s*1\s*!important/);
  });

  it("hides the canvas, which has no drawing buffer to rasterise", () => {
    // `runtime/scene.ts` uses OGL's default `preserveDrawingBuffer: false`.
    expect(PRINT).toMatch(/(^|[\s,}])canvas\s*\{[^}]*display:\s*none\s*!important/);
  });
});

describe("@media print — URL expansion (N2)", () => {
  it("gives back every geometric property the component layer set on .link::after", () => {
    // `.link::after` is the 2px accent underline bar: absolute, 2px tall,
    // scaleX(0). Replacing only `content` laid the URL out inside that box and
    // painted none of it.
    const rule = PRINT.match(/a\[href\^="https:\/\/"\]::after[^{]*\{([^}]*)\}/);
    expect(rule).not.toBeNull();
    const declarations = rule?.[1] ?? "";
    expect(declarations).toMatch(/content:\s*" \(" attr\(href\) "\)"/);
    expect(declarations).toMatch(/position:\s*static/);
    expect(declarations).toMatch(/block-size:\s*auto/);
    expect(declarations).toMatch(/transform:\s*none/);
  });

  it("expands mailto: as well, so the printed sheet carries the email destination", () => {
    expect(PRINT).toMatch(/a\[href\^="mailto:"\]::after/);
  });
});

describe("@media print — the call to action (N3)", () => {
  it("outlines .btn--primary, whose identity is a fill the print reset removes", () => {
    expect(PRINT).toMatch(/\.btn--primary\s*\{[^}]*border-color:[^};]*!important/);
  });

  it("uses currentColor rather than introducing a literal colour", () => {
    expect(PRINT).toMatch(/\.btn--primary\s*\{[^}]*border-color:\s*currentColor/);
  });
});

describe("@media print — pagination (N4)", () => {
  it("keeps a heading with what follows it", () => {
    expect(PRINT).toMatch(/break-after:\s*avoid/);
  });

  it("refuses to split an entry, the figure, or a metadata line across sheets", () => {
    const rule = PRINT.match(/article,\s*figure,\s*\.meta-line\s*\{([^}]*)\}/);
    expect(rule?.[1]).toMatch(/break-inside:\s*avoid/);
  });

  it("sets orphans and widows from a named token, not a bare integer", () => {
    expect(PRINT).toMatch(/orphans:\s*var\(--print-min-lines\)/);
    expect(PRINT).toMatch(/widows:\s*var\(--print-min-lines\)/);
    expect(GLOBALS_CSS).toMatch(/--print-min-lines:\s*\d+/);
  });
});

describe("forced colours (accessibility-c2 N3)", () => {
  it("declares the poster ink in the stylesheet, not in an inline style", () => {
    // While `color` lived in POSTER_STYLE the forced-colours override could
    // never win the cascade, so the fix cycle 1 reported had never applied.
    expect(GLOBALS_CSS).toMatch(
      /\[data-attestation-poster\]\s*\{\s*color:\s*var\(--color-foreground-secondary\)/,
    );
  });

  it("still hands the figure back to the system palette under forced colours", () => {
    expect(GLOBALS_CSS).toMatch(
      /@media \(forced-colors: active\)[^}]*\{[\s\S]*?\[data-attestation-poster\]\s*\{\s*color:\s*CanvasText/,
    );
  });
});

describe("the metric-matched fallback (crossbrowser-c2 N5)", () => {
  it("declares a fallback face that resolves on Android and Linux", () => {
    const face = GLOBALS_CSS.match(/@font-face\s*\{[^}]*Space Grotesk Metric Fallback[^}]*\}/)?.[0];
    expect(face).toBeDefined();
    // next/font's own face is `src: local("Arial")` only, which resolves on
    // Windows, macOS and iOS and nowhere else.
    expect(face).toMatch(/local\("Roboto"\)/);
    expect(face).toMatch(/local\("Liberation Sans"\)/);
    // The metric contract has to travel with it or the face buys nothing.
    expect(face).toMatch(/size-adjust:\s*109\.69%/);
    expect(face).toMatch(/ascent-override:\s*89\.71%/);
    expect(face).toMatch(/descent-override:\s*26\.62%/);
  });

  it("puts it in --font-sans ahead of the unadjusted system stack", () => {
    const stack = GLOBALS_CSS.match(/--font-sans:\s*([^;]*);/)?.[1] ?? "";
    expect(stack.indexOf("Space Grotesk Metric Fallback")).toBeGreaterThan(-1);
    expect(stack.indexOf("Space Grotesk Metric Fallback")).toBeLessThan(
      stack.indexOf("-apple-system"),
    );
  });
});

describe("the deleted scroll-driven reveal block (crossbrowser-c2 N7)", () => {
  it("is gone, along with the keyframes it was the only consumer of", () => {
    // It was unreachable code AND the only three-way engine split in the
    // codebase: `animation-timeline: view()` is unsupported in Firefox 155.
    expect(GLOBALS_CSS).not.toMatch(/animation-timeline:\s*view\(\)/);
    expect(GLOBALS_CSS).not.toMatch(/@keyframes\s+reveal/);
  });
});
