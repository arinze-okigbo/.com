import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildMaskImage, featherFor, isPaintedAt, mergeBands, parseBands } from "./bleed";
import { contrastRatio, relativeLuminance } from "./contrast";
import { paletteFallbackHexes } from "./palette";
import { isCarvableScrim, isLeafScrim, parseScrimSpec } from "./scrim";
import { POINT_FRAGMENT, POINT_VERTEX } from "./point.shader";
import { COMPOSITE_FRAGMENT } from "./post.shader";
import { buildLattice, buildSignatureTraces, resolveGrid } from "../lattice/seed";
import { parseCssColor } from "../runtime/color";
import { GRID_COLUMNS_HIGH, GRID_COLUMNS_LOW, GRID_COLUMNS_MID } from "../constants";

/**
 * The grey-regression guard, at unit speed.
 *
 * `tests/e2e/field-contrast.spec.ts` is the binding A8.4 measurement on real
 * composited pixels; this file is the cheap tripwire that runs on every commit.
 * docs/04 §3.5 states the rule these assert: substituting a foreground token
 * into the field ramp is itself the defect, and the two greys that did it —
 * `#A8A8A8` and `#5C5C5C` — must not exist anywhere in this module.
 */

const MODULE_ROOT = path.resolve(__dirname, "..");

function readModuleSource(relative: string): string {
  return readFileSync(path.join(MODULE_ROOT, relative), "utf8");
}

/** The two values docs/04 §3.5 names by hex as the defect. */
const FORBIDDEN_GREYS = ["#a8a8a8", "#5c5c5c"] as const;

const SOURCE_FILES = [
  "constants.ts",
  "field/palette.ts",
  "field/point.shader.ts",
  "field/ground.shader.ts",
  "field/trace.shader.ts",
  "field/post.shader.ts",
  "runtime/scene.ts",
  "runtime/color.ts",
  "AttestationPoster.tsx",
] as const;

describe("the field ramp carries no grey", () => {
  it.each(SOURCE_FILES)("%s contains neither forbidden grey", (file) => {
    const source = readModuleSource(file).toLowerCase();
    for (const grey of FORBIDDEN_GREYS) {
      expect(source).not.toContain(grey);
    }
  });

  it("no longer exports FIGURE_FALLBACK_DARK or FIGURE_FALLBACK_LIGHT", () => {
    const source = readModuleSource("constants.ts");
    expect(source).not.toMatch(/export\s+const\s+FIGURE_FALLBACK_(DARK|LIGHT)/);
  });

  it("does not read a foreground token for the field's colour", () => {
    const source = readModuleSource("field/palette.ts");
    expect(source).not.toContain("--color-foreground-secondary");
  });

  it("resolves every ramp value to a docs/04 §3.7 field token", () => {
    expect(paletteFallbackHexes()).toEqual({
      ink: "#0a0908",
      cold: "#3a4655",
      hot: "#d1a954",
      core: "#fff3d2",
      fgSecondary: "#b9b4a9",
    });
  });
});

describe("A8.1 — emitted, never filled", () => {
  it("blends the emitters additively", () => {
    expect(readModuleSource("runtime/scene.ts")).toContain("setBlendFunc(gl.ONE, gl.ONE)");
  });

  it("opens the renderer opaque, the required companion of additive blending", () => {
    expect(readModuleSource("runtime/scene.ts")).toMatch(/alpha:\s*false/);
  });

  it("emits a two-lobe core-plus-halo sprite rather than a flat disc", () => {
    expect(POINT_FRAGMENT).toContain("coreEdge");
    expect(POINT_FRAGMENT).toContain("halo * halo * halo");
  });

  it("keeps no alpha floor in the fade term", () => {
    expect(POINT_VERTEX).not.toContain("DEPTH_FADE_FLOOR");
  });

  it("gives the poster's every gold glow an outer stop of --glow-far", () => {
    const source = readModuleSource("AttestationPoster.tsx");
    expect(source).toContain('#d1a95400"');
  });
});

describe("A8.3 — the scrim carves the composite", () => {
  it("evaluates a rounded-box SDF in the composite fragment", () => {
    expect(COMPOSITE_FRAGMENT).toContain("uScrim[");
    expect(COMPOSITE_FRAGMENT).toContain("length(max(d, 0.0)) + min(max(d.x, d.y), 0.0)");
  });

  it("parses a well-formed data-scrim value", () => {
    expect(parseScrimSpec("30,18,0.94")).toEqual({ padX: 30, padY: 18, amount: 0.94 });
  });

  it.each(["", undefined, "30,18", "30,18,0.94,2", "a,b,c", "30,18,0", "30,18,1.4", "-4,18,0.5"])(
    "refuses to guess at %o rather than shipping a scrim that looks like it works",
    (raw) => {
      expect(parseScrimSpec(raw)).toBeNull();
    },
  );
});

describe("A8.4 — the contrast maths", () => {
  it("reproduces the documented static pair for body copy on the stage", () => {
    const ink = parseCssColor("#0a0908");
    const body = parseCssColor("#b9b4a9");
    expect(ink).not.toBeNull();
    expect(body).not.toBeNull();
    const ratio = contrastRatio(relativeLuminance(ink!), relativeLuminance(body!));
    // docs/04 §3.7 prints 9.62:1 for --field-fg-secondary on --field-ink.
    expect(ratio).toBeCloseTo(9.62, 1);
  });

  it("reproduces the 1.44:1 failure this work exists to correct", () => {
    // #A8A8A8 at 0.165 alpha over #0A0A0A is the shipped lattice core.
    const composited = 0x0a / 255 + (0xa8 / 255 - 0x0a / 255) * 0.165;
    const ratio = contrastRatio(
      relativeLuminance([composited, composited, composited]),
      relativeLuminance([0x0a / 255, 0x0a / 255, 0x0a / 255]),
    );
    expect(ratio).toBeLessThan(1.5);
  });
});

describe("the signature seeds the field", () => {
  const signature = Uint8Array.from({ length: 64 }, (_unused, index) => (index * 37 + 11) % 256);
  const grid = { columns: 24, rows: 16 };

  it("gives every point a heat bias read out of the signature", () => {
    const geometry = buildLattice(signature, grid);
    expect(geometry.flare).toHaveLength(grid.columns * grid.rows);
    for (const value of geometry.flare) {
      expect(value).toBeGreaterThanOrEqual(0.3);
      expect(value).toBeLessThanOrEqual(1.0);
    }
  });

  it("produces a different field for a different signature", () => {
    const other = Uint8Array.from(signature, (byte) => byte ^ 0xff);
    expect(Array.from(buildLattice(signature, grid).flare)).not.toEqual(
      Array.from(buildLattice(other, grid).flare),
    );
  });

  it("is deterministic for the same bytes — the poster and the canvas agree", () => {
    expect(Array.from(buildLattice(signature, grid).lattice)).toEqual(
      Array.from(buildLattice(signature, grid).lattice),
    );
  });

  it("draws r and s as two 31-segment polylines", () => {
    const geometry = buildLattice(signature, grid);
    const traces = buildSignatureTraces(geometry, signature);
    // Two strands of 32 vertices → 31 segments each, two vertices per segment.
    expect(traces.count).toBe(2 * 31 * 2);
    expect(traces.position).toHaveLength(traces.count * 3);
  });

  it("flares the lattice points its traces run through", () => {
    const geometry = buildLattice(signature, grid);
    const before = Array.from(geometry.flare);
    buildSignatureTraces(geometry, signature);
    expect(Array.from(geometry.flare).some((value, i) => value > before[i])).toBe(true);
    expect(Math.max(...geometry.flare)).toBe(1);
  });

  it("refuses a signature too short to carry r and s", () => {
    const geometry = buildLattice(signature, grid);
    expect(() => buildSignatureTraces(geometry, signature.slice(0, 40))).toThrow(RangeError);
  });

  it("refuses an empty signature or a degenerate grid", () => {
    expect(() => buildLattice(new Uint8Array(), grid)).toThrow(RangeError);
    expect(() => buildLattice(signature, { columns: 1, rows: 9 })).toThrow(RangeError);
  });
});

describe("density tiers", () => {
  it("uses the high tier only when cores and memory both allow it", () => {
    expect(resolveGrid({ cores: 8, memoryGb: 8 }).columns).toBe(GRID_COLUMNS_HIGH);
    expect(resolveGrid({ cores: 8, memoryGb: 4 }).columns).toBe(GRID_COLUMNS_MID);
    expect(resolveGrid({ cores: 4, memoryGb: 8 }).columns).toBe(GRID_COLUMNS_MID);
    expect(resolveGrid({ cores: 2, memoryGb: 4 }).columns).toBe(GRID_COLUMNS_LOW);
    expect(resolveGrid({ cores: undefined, memoryGb: undefined }).columns).toBe(GRID_COLUMNS_LOW);
  });

  it("is 4-7x the density the boxed figure shipped at", () => {
    const shipped = 48 * 28;
    const now = resolveGrid({ cores: 8, memoryGb: 8 });
    expect((now.columns * now.rows) / shipped).toBeGreaterThan(4);
  });
});

describe("A8.2 — in light mode the field is sectioned, not continuous", () => {
  it("masks to nothing when no stage section is on screen", () => {
    expect(buildMaskImage([])).toBe("linear-gradient(#0000, #0000)");
  });

  /**
   * This asserted INWARD feathering, which is the rule that ate the last block
   * of every stage section: 0.14 of a 844px viewport is 118px, so the hero's
   * closing line — the readout — faded out underneath itself in light mode, at
   * roughly 1.3:1, and `isPaintedAt` then skipped those samples as unpainted so
   * the A8.4 probe agreed nothing was wrong.
   *
   * The band is the section's own rect and it is painted at full strength from
   * edge to edge. The fade is spent OUTSIDE it, in the `--section-gap` that the
   * next section's `padding-block-start` leaves empty.
   */
  it("paints a stage section edge to edge and feathers OUTWARD into the gap", () => {
    const mask = buildMaskImage([[0.25, 0.75]], 0.1);
    expect(mask).toBe(
      "linear-gradient(to bottom, #0000 15.00%, #000 25.00%, #000 75.00%, #0000 85.00%)",
    );
  });

  /**
   * The other half of the rule, and the reason outward feathering is safe here
   * at all: the fade is capped so it always reaches zero inside the gap, before
   * the next section's first line. The cap binds at every breakpoint on this
   * page — 72px gap gives 54px of fade where 118px was wanted, 144px gives
   * 108px where 126px was wanted — so the proportional term is a ceiling the
   * layout never actually reaches, and that is the safe direction for it to be
   * wrong in.
   */
  it("caps the feather to the section gap, so the fade never reaches the next section", () => {
    const mobile = featherFor(844, 72);
    expect(mobile * 844).toBeCloseTo(54, 5);
    expect(mobile * 844).toBeLessThan(72);

    const desktop = featherFor(900, 144);
    expect(desktop * 900).toBeCloseTo(108, 5);
    expect(desktop * 900).toBeLessThan(144);
  });

  it("keeps the gradient stops monotonic by merging adjacent bands", () => {
    expect(
      mergeBands([
        [0.6, 0.9],
        [0.0, 0.5],
        [0.45, 0.7],
      ]),
    ).toEqual([[0, 0.9]]);
  });

  it("leaves genuinely separate bands separate", () => {
    expect(
      mergeBands([
        [0.0, 0.2],
        [0.8, 1.0],
      ]),
    ).toEqual([
      [0, 0.2],
      [0.8, 1],
    ]);
  });

  it("clamps a band that runs past the viewport", () => {
    expect(buildMaskImage([[-0.4, 1.6]], 0.1)).toBe(
      "linear-gradient(to bottom, #0000 0.00%, #000 0.00%, #000 100.00%, #0000 100.00%)",
    );
  });

  it("counts only the band itself as painted, with no feather expansion", () => {
    expect(isPaintedAt([[0.3, 0.6]], 0.68, true)).toBe(false);
    expect(isPaintedAt([[0.3, 0.6]], 0.45, true)).toBe(true);
  });
});

describe("the A8.4 probe scores each block against its own ink", () => {
  /**
   * The probe used to score every `[data-scrim]` block against one colour —
   * `--field-fg-secondary`, the dimmest string A8.4 names. A block dimmer than
   * that then read as BETTER than it is. The HUD is `--field-fg-muted`
   * `#9C978C`, and on a lit ground of `#2B2720` the single-colour probe
   * reported 7.19:1 against a true 5.10:1, which was on its way into a document
   * as clearing the 7:1 ship target.
   *
   * Optimistic contrast reporting is how the 1.44:1 field shipped in the first
   * place. These two figures are the arithmetic the fix rests on.
   */
  const groundAtHud = parseCssColor("#2b2720")!;

  it("reports the muted ladder step at its real value, not the secondary one", () => {
    const muted = contrastRatio(
      relativeLuminance(parseCssColor("#9c978c")!),
      relativeLuminance(groundAtHud),
    );
    expect(muted).toBeCloseTo(5.1, 1);
  });

  it("and the secondary step is the figure that used to be reported for both", () => {
    const secondary = contrastRatio(
      relativeLuminance(parseCssColor("#b9b4a9")!),
      relativeLuminance(groundAtHud),
    );
    expect(secondary).toBeCloseTo(7.19, 1);
    expect(secondary).toBeGreaterThan(5.1);
  });

  it("reads the block's computed colour rather than a fixed palette value", () => {
    const source = readModuleSource("field/contrast.ts");
    expect(source).toContain("getComputedStyle(node).color");
  });

  it("names the ink and the carve on the worst sample, so a failure is diagnosable", () => {
    const source = readModuleSource("field/contrast.ts");
    expect(source).toMatch(/readonly ink: string/);
    expect(source).toMatch(/readonly scrim: string/);
  });
});

describe("the probe measures only pixels the visitor can actually see", () => {
  /**
   * `gl.readPixels` reads the composite, which is always full-bleed — the
   * light-mode sectioning is a CSS mask on the host and hides those pixels
   * without removing them. Scoring light mode's `#1A1A1A` page ink against a
   * field it cannot see reported 1.14:1 where the screen measured 5.71:1.
   *
   * A harness that cries wolf gets switched off, which is how the thing it
   * guards ships broken.
   */
  it("treats every sample as painted when no mask is applied", () => {
    expect(isPaintedAt([], 0.5, false)).toBe(true);
    expect(isPaintedAt([[0, 0.2]], 0.9, false)).toBe(true);
  });

  it("skips samples outside the painted bands once a mask exists", () => {
    expect(isPaintedAt([[0.1, 0.4]], 0.25, true)).toBe(true);
    expect(isPaintedAt([[0.1, 0.4]], 0.9, true)).toBe(false);
  });

  it("round-trips the published band attribute", () => {
    expect(parseBands("0.1000:0.4000 0.7000:0.9000")).toEqual([
      [0.1, 0.4],
      [0.7, 0.9],
    ]);
  });

  it("reads an absent or malformed attribute as no bands rather than throwing", () => {
    expect(parseBands(undefined)).toEqual([]);
    expect(parseBands("")).toEqual([]);
    expect(parseBands("nonsense")).toEqual([]);
  });
});

describe("the composite and the probe agree on what a scrim is", () => {
  /**
   * They did not. `contrast.ts` skipped enclosing rects while `scrim.ts`
   * consumed them, so a `data-scrim` on a 2,066px `<section>` carved a
   * taller-than-viewport box at 0.94 and put the field out across whole
   * sections — while the probe, sampling only the leaf blocks, reported healthy
   * contrast against the floor that carve had itself created.
   *
   * A dead field and a flattering number is the worst pair of symptoms
   * available, and two implementations of one idea is how you get it.
   */
  function scrimTree(html: string): Element {
    const host = document.createElement("div");
    host.innerHTML = html;
    return host.firstElementChild!;
  }

  it("treats a block with no nested scrim as a leaf", () => {
    expect(isLeafScrim(scrimTree(`<p data-scrim="30,18,0.94">body</p>`))).toBe(true);
  });

  it("refuses a section that encloses its own blocks", () => {
    const section = scrimTree(
      `<section data-scrim="30,18,0.94"><p data-scrim="20,12,0.9">body</p></section>`,
    );
    expect(isLeafScrim(section)).toBe(false);
  });

  it("is the one definition both sides import", () => {
    expect(readModuleSource("field/contrast.ts")).toContain("isLeafScrim");
    expect(readModuleSource("field/scrim.ts")).toContain("export function isLeafScrim");
    // The probe must not carry a second, local copy of the test.
    expect(readModuleSource("field/contrast.ts")).not.toMatch(/node\.querySelector\(selector\)/);
  });

  it("reports a container-shaped leaf rather than silently honouring it", () => {
    const source = readModuleSource("field/scrim.ts");
    expect(source).toContain("warnIfContainerScrim");
    expect(readModuleSource("runtime/report.ts")).toContain("reportScrimMisuse");
  });
});

describe("a scrim carves a text block, never a container", () => {
  /**
   * Height alone was the wrong predicate and a measurement at 320px is what
   * showed it: five leaf scrims there were taller than the viewport, one of
   * them 3.1 viewports, and every one was genuine prose whose text filled its
   * box. Carving those is correct. What is not correct is carving a box that is
   * mostly *not* text, which puts the field out across a screenful and then
   * flatters every contrast measurement taken over it.
   *
   * The distinction is coverage, and `tests/e2e/field-contrast.spec.ts` sweeps
   * it at five widths against a real layout — jsdom has no line boxes, so what
   * is asserted here is the branch logic, not the geometry.
   */
  function block(height: number): Element {
    const node = document.createElement("p");
    node.dataset.scrim = "30,18,0.94";
    node.getBoundingClientRect = () => ({ height }) as DOMRect;
    return node;
  }

  it("always carves a block shorter than the viewport", () => {
    // Short blocks are carved without consulting coverage: the measure is noisy
    // at small heights, and the failure it guards needs size to do damage.
    expect(isCarvableScrim(block(200), 900)).toBe(true);
    expect(isCarvableScrim(block(900), 900)).toBe(true);
  });

  it("degrades to carving when the DOM cannot report line boxes", () => {
    // jsdom has no `Range.getClientRects`. Coverage is an optimisation over the
    // safe default, so its absence must mean "carve it" — never an exception
    // thrown inside the render loop.
    expect(isCarvableScrim(block(1900), 900)).toBe(true);
  });

  it("refuses a tall block whose box is mostly not text", () => {
    const node = block(1900);
    const line = { width: 600, height: 20 } as DOMRect;
    const range = document.createRange();
    range.getClientRects = () => [line, line] as unknown as DOMRectList;
    const create = document.createRange.bind(document);
    document.createRange = () => range;
    try {
      // 40px of lines in a 1,900px box — 2% text, a container in disguise.
      expect(isCarvableScrim(node, 900)).toBe(false);
    } finally {
      document.createRange = create;
    }
  });

  it("reports a refused block rather than skipping it silently", () => {
    const source = readModuleSource("field/scrim.ts");
    expect(source).toContain("warnIfContainerScrim");
    expect(readModuleSource("runtime/report.ts")).toMatch(/lines of text/);
  });

  it("is the one definition the composite and the probe both use", () => {
    expect(readModuleSource("field/scrim.ts")).toContain("export function isCarvableScrim");
    expect(readModuleSource("field/contrast.ts")).toContain("isCarvableScrim");
  });
});

describe("the slot budget reports what it drops", () => {
  /**
   * Six slots against 8–9 candidates in view means blocks are dropped every
   * frame. That is the nearest-to-centre sort working, but only while what it
   * drops is small on screen — and two separate claims about how small were
   * both wrong, because both came from scroll sweeps too coarse to see the
   * peak. A 150px sweep reported 81px; a 40px sweep found 171px at 1280x900
   * and 228px at 768x1024.
   *
   * So the tracker publishes what it dropped and how much of it was visible,
   * and the e2e spec measures contrast at the position where that peaks. The
   * format is asserted here because the spec parses it.
   */
  it("publishes the count and the largest visible height as `count:px`", () => {
    expect(readModuleSource("field/scrim.ts")).toContain("DROPPED_ATTRIBUTE");
    expect(readModuleSource("field/scrim.ts")).toMatch(/\$\{dropped\.length\}:\$\{Math\.round/);
  });

  it("measures visible height as the on-screen intersection, not the box", () => {
    // A dropped block's box can be far taller than the part a viewer can see;
    // the box would over-report and make the budget look worse than it is.
    const source = readModuleSource("field/scrim.ts");
    expect(source).toContain("Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)");
  });

  /**
   * This assertion went stale the moment the spec stopped reading
   * `data-scrim-dropped` off the DOM and started calling the render-free
   * `__fieldScrimDrops()` hook, which returns the same value. The sweep was in
   * the tree the whole time; the test named an implementation detail of how it
   * got there instead of the thing it cares about.
   *
   * So it now asserts the intent — the spec obtains the drop telemetry from the
   * shipped tracker, and does not reconstruct the selection itself — and names
   * both accepted routes. A cross-file content assertion is brittle by nature,
   * which is the price of it being the only thing that can catch a spec quietly
   * losing the mechanism it is supposed to exercise.
   */
  it("is read by the spec from the shipped tracker, not reimplemented", () => {
    const spec = readFileSync(
      path.resolve(MODULE_ROOT, "../../../tests/e2e/field-contrast.spec.ts"),
      "utf8",
    );
    expect(spec).toMatch(/__fieldScrimDrops|dataset\.scrimDropped/);
    expect(spec).toContain("SCRIM_SLOTS must rise");
    // The selection is the tracker's job. A spec that sorted candidates by
    // distance to the viewport centre would be the `isLeafScrim` divergence
    // again, in the harness this time.
    expect(spec).not.toMatch(/sort\(\s*\(a,\s*b\)\s*=>\s*a\.distance/);
  });
});
