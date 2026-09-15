/**
 * CSS colour parsing for the field.
 *
 * This module is pure parsing. The tokens it is pointed at, and the ramp they
 * form, live in `field/palette.ts` — retargeted 2026-09-11 from
 * `--color-foreground-secondary` to the `--field-*` group of docs/04 §3.7
 * [DEV-13 / A8]. The P3 hardening below is kept verbatim through that move,
 * because it is the defence against a real, measured defect.
 */

export type Rgb = readonly [number, number, number];

const HEX_SHORT_LENGTH = 4;
const HEX_LONG_LENGTH = 7;

/**
 * Matches a CSS number, but only where one can legally start.
 *
 * The `(?<![\w.])` guard is the whole point. Without it this pattern matched
 * the literal `3` in the colour-space keyword `display-p3`, so
 * `color(display-p3 .47 .37 .1)` parsed as `[3, .47, .37]` — the red channel
 * clamped to 1.0 and the blue channel discarded — and the lattice drew salmon
 * (`rgb(255,120,94)`). Dropping this guard reintroduces that defect.
 */
const FLOAT_PATTERN = /(?<![\w.])-?\d*\.?\d+(?:e[+-]?\d+)?/gi;

/**
 * Strips `fn(` and any leading colour-space keyword, so the float scan only
 * ever sees the component list. Belt-and-braces with FLOAT_PATTERN: either
 * alone fixes the `display-p3` bug, and a future colour form (`lab(`, a named
 * space with digits) has to defeat both.
 */
const COLOR_SPACE_KEYWORD = /^\s*[a-z][\w-]*(?=\s)/i;

function componentList(value: string): string {
  const open = value.indexOf("(");
  if (open === -1) return value;
  const close = value.lastIndexOf(")");
  const body = value.slice(open + 1, close === -1 ? undefined : close);
  return body.replace(COLOR_SPACE_KEYWORD, "");
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

function parseHex(value: string): Rgb | null {
  if (value.length === HEX_SHORT_LENGTH) {
    const r = Number.parseInt(value[1] + value[1], 16);
    const g = Number.parseInt(value[2] + value[2], 16);
    const b = Number.parseInt(value[3] + value[3], 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return [r / 255, g / 255, b / 255];
  }
  if (value.length !== HEX_LONG_LENGTH) return null;
  const packed = Number.parseInt(value.slice(1), 16);
  if (Number.isNaN(packed)) return null;
  return [((packed >> 16) & 0xff) / 255, ((packed >> 8) & 0xff) / 255, (packed & 0xff) / 255];
}

/**
 * Handles `rgb()` / `rgba()` (0–255 channels) and `color(display-p3 …)` /
 * `color(srgb …)` (0–1 channels).
 *
 * P3 components are used as sRGB components without a gamut conversion. That is
 * deliberate: docs/04 §3.4 specifies every P3 upgrade as lightness-matched to
 * its sRGB counterpart and chroma-extended only, so the naive read lands within
 * ~2/255 of the sRGB token, and far cheaper than a matrix conversion.
 */
function parseFunctional(value: string): Rgb | null {
  const matches = componentList(value).match(FLOAT_PATTERN);
  if (!matches || matches.length < 3) return null;
  const components = matches.slice(0, 3).map(Number);
  if (components.some((component) => !Number.isFinite(component))) return null;
  const isByteScale = value.startsWith("rgb");
  const divisor = isByteScale ? 255 : 1;
  return [
    clamp01(components[0] / divisor),
    clamp01(components[1] / divisor),
    clamp01(components[2] / divisor),
  ];
}

/** Parses any CSS colour form a theme token is permitted to take. */
export function parseCssColor(raw: string): Rgb | null {
  const value = raw.trim().toLowerCase();
  if (value.length === 0) return null;
  if (value.startsWith("#")) return parseHex(value);
  if (value.startsWith("rgb") || value.startsWith("color(")) return parseFunctional(value);
  return null;
}
