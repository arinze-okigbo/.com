import type { CSSProperties, ReactElement } from "react";

import type { AttestationReadoutValues } from "./attestation/types";

/**
 * The readout beneath the figure. Real, selectable text — not an image, not a
 * caption on a canvas.
 *
 * docs/04 §8.4: `--font-mono` / `--text-mono` / `--color-foreground-muted`, with
 * the `verified` marker as the only accent glyph (allowlist entry A7). docs/05
 * §3.3 fixes the format: `ES256 · sig 3045…a91c · verified 0.4ms`.
 *
 * Copy constraint (docs/02 §9): algorithm, truncated signature and verify time
 * only. Nothing here may imply encryption or a security guarantee.
 */

export interface AttestationReadoutProps extends AttestationReadoutValues {
  readonly className?: string;
}

const READOUT_STYLE: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)",
  fontSize: "var(--text-mono, 0.8125rem)",
  // Referenced by name — see the note in AttestationFigure.
  lineHeight: "var(--text-mono--line-height, 1.5)",
  letterSpacing: "var(--text-mono--letter-spacing, 0em)",
  color: "var(--color-foreground-muted)",
  maxWidth: "var(--measure-mono, 72ch)",
};

const MARKER_STYLE: CSSProperties = {
  color: "var(--color-accent)",
};

const SEPARATOR = " · ";

export function AttestationReadout({
  alg,
  short,
  ms,
  className,
}: AttestationReadoutProps): ReactElement {
  return (
    <p className={className} style={READOUT_STYLE}>
      {alg}
      {SEPARATOR}sig {short}
      {SEPARATOR}
      <span aria-hidden="true" style={MARKER_STYLE}>
        ✓
      </span>{" "}
      verified {ms}ms
    </p>
  );
}
