import type { CSSProperties, ReactElement, ReactNode } from "react";

import { HexDump } from "./HexDump";
import { MONO_STYLE } from "./tokens";

/**
 * One labelled field: what it is called, how big it is, what it holds, and what
 * it actually means.
 *
 * The `note` is the point of the whole section. A field with a value and no
 * explanation teaches nothing.
 */

const ROW_STYLE: CSSProperties = {
  paddingBlock: "var(--rhythm-title)",
  borderBlockEnd: "1px solid var(--color-border-subtle)",
};

const HEAD_STYLE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--rhythm-meta) var(--rhythm-inline)",
  alignItems: "baseline",
  justifyContent: "space-between",
};

const LABEL_STYLE: CSSProperties = {
  ...MONO_STYLE,
  color: "var(--color-foreground-strong)",
};

const META_STYLE: CSSProperties = {
  ...MONO_STYLE,
  fontSize: "var(--text-caption)",
  color: "var(--color-foreground-muted)",
};

const NOTE_STYLE: CSSProperties = {
  margin: 0,
  marginBlockStart: "var(--rhythm-meta)",
  fontSize: "var(--text-caption)",
  lineHeight: "var(--text-caption--line-height)",
  color: "var(--color-foreground-secondary)",
  maxWidth: "var(--measure-prose)",
};

export interface FieldProps {
  readonly label: string;
  /** A size, an offset, or a `<Verdict>`. */
  readonly meta?: ReactNode;
  readonly value?: string;
  /** `true` prints the value in the accent, for raw cryptographic material. */
  readonly isRaw?: boolean;
  readonly bytes?: Uint8Array;
  readonly note?: ReactNode;
  readonly children?: ReactNode;
}

export function Field({
  label,
  meta,
  value,
  isRaw = false,
  bytes,
  note,
  children,
}: FieldProps): ReactElement {
  return (
    <div style={ROW_STYLE}>
      <div style={HEAD_STYLE}>
        <span style={LABEL_STYLE}>{label}</span>
        {typeof meta === "string" ? <span style={META_STYLE}>{meta}</span> : meta}
      </div>

      {value === undefined ? null : (
        <div
          style={{
            ...MONO_STYLE,
            marginBlockStart: "var(--rhythm-meta)",
            color: isRaw ? "var(--color-accent)" : "var(--color-foreground)",
            overflowWrap: "anywhere",
            maxWidth: "var(--measure-mono)",
          }}
        >
          {value}
        </div>
      )}

      {bytes && bytes.length > 0 ? <HexDump bytes={bytes} /> : null}
      {children}
      {note === undefined ? null : <p style={NOTE_STYLE}>{note}</p>}
    </div>
  );
}
