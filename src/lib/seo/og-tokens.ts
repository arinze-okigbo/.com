/**
 * The subset of `docs/04-design-system.md` the OG image renders with.
 *
 * Satori (the renderer behind `ImageResponse`) resolves no CSS custom
 * properties and reads no stylesheet, so the tokens are restated here as
 * literals. Each one carries the token name it mirrors — if a value in
 * `docs/04` moves, it moves here too, and nowhere else.
 *
 * The OG image is a dark-mode surface: a social card is composited against an
 * unknown chrome, and the dark palette is the site's own identity
 * (`docs/00` §11, `docs/04` §3.3).
 */

/** `docs/04` §3.3 — dark mode. */
export const OG_COLORS = {
  /** `--color-background` */
  background: "#0A0A0A",
  /** `--color-foreground-strong` — `--text-display` and `--text-h1` only */
  foregroundStrong: "#FCFCFC",
  /** `--color-foreground` — primary text at every step below `--text-h1` */
  foreground: "#EDEDED",
  /** `--color-foreground-secondary` */
  foregroundSecondary: "#A8A8A8",
  /** `--color-foreground-muted` */
  foregroundMuted: "#8A8A8A",
  /** `--color-accent` — brand gold, unchanged */
  accent: "#D1A954",
  /**
   * `--color-border` (`#FFFFFF1F` composited over `--color-background`).
   * 10 + (255 - 10) * (0x1F / 255) = 39.8 -> 0x28. The previous `#2A2A2A`
   * was a transcription slip, not a decision — its own comment claimed this
   * composite.
   */
  border: "#282828",
} as const;

/**
 * `docs/04` §1.2. The OG canvas is fixed at 1200x630, so every clamp resolves
 * to a single value — these are the resolved pixel sizes, not the clamps.
 */
export const OG_TYPE = {
  /** `--text-h1`, clamp maximum */
  h1: { size: 49, lineHeight: 1.08, letterSpacing: "-0.02em", weight: 500 },
  /** `--text-h2`, clamp maximum */
  h2: { size: 31, lineHeight: 1.2, letterSpacing: "-0.01em", weight: 500 },
  /** `--text-lead` */
  lead: { size: 20, lineHeight: 1.45, letterSpacing: "0em", weight: 400 },
  /** `--text-label` — uppercase, +0.12em, never accent (`docs/04` §3.5 F6) */
  label: { size: 13, lineHeight: 1.3, letterSpacing: "0.12em", weight: 500 },
} as const;

/** `docs/04` §2.1 named spacing steps. */
export const OG_SPACE = {
  space2: 8,
  space4: 16,
  space6: 24,
  space8: 32,
  space16: 64,
} as const;

/**
 * `docs/04` §3.4 R-GOLD-1: an accent marker is never 1px. This is the
 * card's single accent element — one short rule, the marker form of A5.
 */
export const OG_ACCENT_RULE = { width: 64, height: 4 } as const;

/**
 * `docs/04` §1.5 measures, in pixels.
 *
 * Satori resolves neither `ch` nor `rem` against a 1200x630 canvas, so the
 * one measure docs/04 states in absolute units is the only one that can be
 * restated here honestly: `--measure-prose`, 42rem = 672px. The claim column
 * previously carried a bare `maxWidth: 900`, which is not a docs/04 value in
 * any unit.
 */
export const OG_MEASURE = {
  /** `--measure-prose` — 42rem at the 16px root. */
  prose: 672,
} as const;

export const OG_SIZE = { width: 1200, height: 630 } as const;
