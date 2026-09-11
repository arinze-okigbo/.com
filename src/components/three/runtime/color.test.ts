import { describe, expect, it } from "vitest";

import { parseCssColor } from "./color";

/** 0–1 channels back to the 0–255 space the review measured in. */
const toBytes = (rgb: readonly [number, number, number]): readonly number[] =>
  rgb.map((channel) => Math.round(channel * 255));

describe("parseCssColor", () => {
  /**
   * The regression this file exists for. The float pattern used to have no
   * boundary guard, so it matched the `3` in `display-p3` as the first
   * component: `color(display-p3 .47 .37 .1)` parsed as `[3, .47, .37]`, the
   * red channel clamped to 1.0, and the lattice drew rgb(255,120,94) — salmon
   * — against the gold poster it cross-fades over.
   */
  it("does not read the colour-space keyword's digits as a component", () => {
    const light = parseCssColor("color(display-p3 0.47 0.37 0.1)");
    const dark = parseCssColor("color(display-p3 0.81 0.66 0.3)");

    expect(light).not.toBeNull();
    expect(dark).not.toBeNull();
    expect(toBytes(light!)).toEqual([120, 94, 26]);
    expect(toBytes(dark!)).toEqual([207, 168, 77]);
  });

  it("accepts the leading-dot spelling browsers may serialise", () => {
    expect(toBytes(parseCssColor("color(display-p3 .47 .37 .1)")!)).toEqual([120, 94, 26]);
  });

  it("parses color(srgb …) 0–1 channels", () => {
    expect(toBytes(parseCssColor("color(srgb 0.47 0.37 0.1)")!)).toEqual([120, 94, 26]);
  });

  it("parses rgb() on the 0–255 scale", () => {
    expect(toBytes(parseCssColor("rgb(124, 94, 29)")!)).toEqual([124, 94, 29]);
  });

  it("parses rgba() and ignores the alpha channel", () => {
    expect(toBytes(parseCssColor("rgba(209, 169, 84, 0.5)")!)).toEqual([209, 169, 84]);
  });

  it("ignores a slash-separated alpha in color()", () => {
    expect(toBytes(parseCssColor("color(display-p3 0.81 0.66 0.3 / 0.5)")!)).toEqual([
      207, 168, 77,
    ]);
  });

  it("parses the documented sRGB accent hexes", () => {
    expect(toBytes(parseCssColor("#7c5e1d")!)).toEqual([124, 94, 29]);
    expect(toBytes(parseCssColor("#d1a954")!)).toEqual([209, 169, 84]);
  });

  it("parses shorthand hex", () => {
    expect(toBytes(parseCssColor("#fff")!)).toEqual([255, 255, 255]);
  });

  it("returns null for an unset or unparseable token", () => {
    expect(parseCssColor("")).toBeNull();
    expect(parseCssColor("   ")).toBeNull();
    expect(parseCssColor("transparent")).toBeNull();
    expect(parseCssColor("color(display-p3 0.47)")).toBeNull();
  });
});
