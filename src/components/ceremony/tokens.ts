import type { CSSProperties } from "react";

import type { VerdictTone } from "@/lib/webauthn/types";

/**
 * Every visual value this section uses, referenced by `docs/04` token name.
 *
 * Styles are inline `CSSProperties` rather than classes because
 * `src/app/globals.css` belongs to the `design-system` lane and this section
 * must not write into it. Interaction states that inline styles cannot express
 * — hover, focus — come from the global `.btn` component layer and the global
 * `:focus-visible` ring, both already defined in `docs/04 §8`.
 */

/**
 * TODO(ds-amend): `docs/04` defines no status palette — there is no
 * `--color-status-ok` / `-warn` / `-fail` token, and inventing three hexes here
 * would put colours outside the design system. Each verdict therefore falls back
 * to an existing `docs/04` token, and every verdict chip states its result in
 * *words* as well, so nothing depends on colour alone [WCAG 1.4.1]. When
 * `ds-amend` lands a status palette these four lines pick it up with no other
 * change.
 */
export const VERDICT_COLOR: Readonly<Record<VerdictTone, string>> = {
  ok: "var(--color-status-ok, var(--color-accent))",
  warn: "var(--color-status-warn, var(--color-accent))",
  fail: "var(--color-status-fail, var(--color-foreground-strong))",
  info: "var(--color-status-info, var(--color-foreground-muted))",
};

const VERDICT_BORDER: Readonly<Record<VerdictTone, string>> = {
  ok: "var(--color-border-interactive)",
  warn: "var(--color-border-interactive)",
  fail: "var(--color-foreground-strong)",
  info: "var(--color-border)",
};

/** The chip. Uppercase mono label, hairline border, no fill. */
export function verdictStyle(tone: VerdictTone): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--rhythm-inline)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--text-label)",
    lineHeight: "var(--text-label--line-height)",
    letterSpacing: "var(--text-label--letter-spacing)",
    fontWeight: "var(--font-weight-medium)",
    textTransform: "uppercase",
    padding: "2px 6px",
    borderRadius: "var(--radius-sm)",
    border: `1px solid ${VERDICT_BORDER[tone]}`,
    color: VERDICT_COLOR[tone],
  };
}

export const NOTICE_STYLE: CSSProperties = {
  marginBlockStart: "var(--rhythm-title)",
  padding: "var(--rhythm-title)",
  background: "var(--color-accent-tint)",
  border: "1px solid var(--color-border-subtle)",
  borderInlineStart: "2px solid var(--color-accent)",
  borderRadius: "var(--radius-sm)",
};

export const LABEL_STYLE: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-label)",
  lineHeight: "var(--text-label--line-height)",
  letterSpacing: "var(--text-label--letter-spacing)",
  fontWeight: "var(--font-weight-medium)",
  textTransform: "uppercase",
  color: "var(--color-accent)",
  margin: 0,
};

export const MONO_STYLE: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-mono)",
  lineHeight: "var(--text-mono--line-height)",
  letterSpacing: "var(--text-mono--letter-spacing)",
};

/** Body prose inside the section. `--color-foreground-secondary` clears 4.5:1. */
export const BODY_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "var(--text-body)",
  lineHeight: "var(--text-body--line-height)",
  letterSpacing: "var(--text-body--letter-spacing)",
  color: "var(--color-foreground-secondary)",
  maxWidth: "var(--measure-prose)",
};

export const CAPTION_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "var(--text-caption)",
  lineHeight: "var(--text-caption--line-height)",
  letterSpacing: "var(--text-caption--letter-spacing)",
  color: "var(--color-foreground-secondary)",
  maxWidth: "var(--measure-caption)",
};

/** Long byte strings. `--measure-mono` keeps a hex dump readable. */
export const HEX_STYLE: CSSProperties = {
  ...MONO_STYLE,
  marginBlockStart: "var(--rhythm-meta)",
  padding: "var(--rhythm-meta)",
  background: "var(--color-background)",
  border: "1px solid var(--color-border-subtle)",
  borderRadius: "var(--radius-sm)",
  color: "var(--color-foreground-secondary)",
  overflowX: "auto",
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
  maxWidth: "var(--measure-mono)",
};

export const STACK_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--rhythm-title)",
};

/**
 * The `data-scrim` carves live in `./scrims`, re-exported here so every existing
 * import site is unchanged. They are a separate module because `CeremonyMount`
 * is in the first-load client chunk and must not pull this whole sheet in for
 * one string. See `./scrims` for the rule and the measurements.
 */
export { BLOCK_SCRIM, HEADING_SCRIM } from "./scrims";

export const CONTROLS_STYLE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--rhythm-inline)",
  alignItems: "center",
  marginBlockStart: "var(--rhythm-title)",
};
