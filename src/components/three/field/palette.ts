import { parseCssColor, type Rgb } from "../runtime/color";

/**
 * The field's ramp, read from the `--field-*` tokens of docs/04 §3.7 [DEV-13].
 *
 * Every colour the field emits comes from this module and every value in it
 * comes from a token. There is no grey in the ramp and no foreground token in
 * it: docs/04 §3.5's binding instruction makes substituting one *the* defect,
 * because that is what shipped the lattice at 1.44:1.
 *
 * The tokens are dark in **both** themes (A8.2) — the field is a lit stage the
 * light-mode page enters and leaves — so, unlike the surface this replaces,
 * nothing here re-reads on a theme change.
 */

/**
 * Documented sRGB values from the docs/04 §3.7 table, used only when the CSS
 * custom property cannot be read — the stylesheet has not applied, or a test
 * environment has no `:root` block. The live token always wins.
 *
 * `--field-hot` is `= dark --color-accent` and `--field-fg` is
 * `= dark --color-foreground`; retyping either in CSS is a defect under A8.6.
 * These literals exist at one site, as a last-resort mirror of that table, and
 * `paletteTokenNames()` is what keeps them honest.
 */
const FIELD_TOKEN_FALLBACKS = {
  ink: "#0a0908",
  cold: "#3a4655",
  hot: "#d1a954",
  core: "#fff3d2",
  fgSecondary: "#b9b4a9",
} as const;

const FIELD_TOKEN_PROPERTIES = {
  ink: "--field-ink",
  cold: "--field-cold",
  hot: "--field-hot",
  core: "--field-core",
  fgSecondary: "--field-fg-secondary",
} as const;

export type FieldPaletteKey = keyof typeof FIELD_TOKEN_PROPERTIES;

export type FieldPalette = {
  readonly [Key in FieldPaletteKey]: Rgb;
};

/** The custom-property names this module reads. Exported for the token tests. */
export function paletteTokenNames(): readonly string[] {
  return Object.values(FIELD_TOKEN_PROPERTIES);
}

/** The documented sRGB mirror of the §3.7 table. Exported for the token tests. */
export function paletteFallbackHexes(): Readonly<Record<FieldPaletteKey, string>> {
  return FIELD_TOKEN_FALLBACKS;
}

/**
 * True when the page has actually declared the field token group.
 *
 * This is gate 0 of the mount. Until `globals.css` carries §3.7 and the
 * `.stage` scope that re-declares the foreground tokens from `--field-fg*`, a
 * full-bleed dark stage behind a light-mode page would put `#1A1A1A` body copy
 * on `#0A0908` — 1.14:1, worse than the failure this work exists to correct
 * (docs/04 §3.7, "the single highest-consequence implementation detail").
 * Declining to mount is the only safe reading of a missing token.
 */
export function isFieldScopeDeclared(): boolean {
  const declared = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--field-ink");
  return parseCssColor(declared) !== null;
}

function readToken(styles: CSSStyleDeclaration, key: FieldPaletteKey): Rgb {
  const parsed = parseCssColor(styles.getPropertyValue(FIELD_TOKEN_PROPERTIES[key]));
  if (parsed) return parsed;
  return parseCssColor(FIELD_TOKEN_FALLBACKS[key]) ?? [1, 1, 1];
}

/** Resolves the whole ramp in one `getComputedStyle` read. */
export function readFieldPalette(): FieldPalette {
  const styles = window.getComputedStyle(document.documentElement);
  return {
    ink: readToken(styles, "ink"),
    cold: readToken(styles, "cold"),
    hot: readToken(styles, "hot"),
    core: readToken(styles, "core"),
    fgSecondary: readToken(styles, "fgSecondary"),
  };
}

/** `Rgb` as the `Float32Array` an OGL `vec3` uniform wants. */
export function toUniform(color: Rgb): Float32Array {
  return new Float32Array([color[0], color[1], color[2]]);
}
