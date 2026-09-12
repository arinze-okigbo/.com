import type { CSSProperties, ReactElement } from "react";

import type { AuthDataFlag } from "@/lib/webauthn/types";

import { MONO_STYLE } from "./tokens";

/**
 * The eight flag bits of `authData`, each with its value and its meaning.
 *
 * Rendered as a definition-style grid rather than a row of coloured dots: a set
 * bit reads as "1" and as its name, so the state survives greyscale, forced
 * colours and a screen reader.
 */

const GRID_STYLE: CSSProperties = {
  display: "grid",
  gap: "var(--rhythm-meta)",
  marginBlockStart: "var(--rhythm-title)",
  gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
  listStyle: "none",
  padding: 0,
  margin: 0,
};

function cellStyle(isSet: boolean): CSSProperties {
  return {
    border: `1px solid ${isSet ? "var(--color-border-interactive)" : "var(--color-border-subtle)"}`,
    borderRadius: "var(--radius-sm)",
    padding: "var(--rhythm-meta)",
    background: "var(--color-background)",
  };
}

export interface FlagGridProps {
  readonly flags: readonly AuthDataFlag[];
}

export function FlagGrid({ flags }: FlagGridProps): ReactElement {
  return (
    <ul style={GRID_STYLE}>
      {flags.map((flag) => (
        <li key={flag.code} style={cellStyle(flag.isSet)}>
          <span
            style={{
              ...MONO_STYLE,
              fontSize: "var(--text-caption)",
              color: "var(--color-foreground-muted)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>bit {flag.bit}</span>
            <span style={{ color: flag.isSet ? "var(--color-accent)" : undefined }}>
              {flag.isSet ? "1" : "0"}
            </span>
          </span>
          <span
            style={{
              ...MONO_STYLE,
              display: "block",
              color: flag.isSet ? "var(--color-accent)" : "var(--color-foreground-muted)",
            }}
          >
            {flag.code} · {flag.name}
          </span>
          <span
            style={{
              display: "block",
              marginBlockStart: "2px",
              fontSize: "var(--text-caption)",
              lineHeight: "var(--text-caption--line-height)",
              color: "var(--color-foreground-secondary)",
            }}
          >
            {flag.description}
          </span>
        </li>
      ))}
    </ul>
  );
}
