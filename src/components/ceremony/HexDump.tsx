import type { ReactElement } from "react";

import { CEREMONY_A11Y } from "@/content/ceremony";
import { toHex } from "@/lib/webauthn/bytes";

import { HEX_STYLE, MONO_STYLE } from "./tokens";

/** Byte strings at or below this length render inline rather than collapsed. */
const INLINE_LIMIT_BYTES = 24;

export interface HexDumpProps {
  readonly bytes: Uint8Array;
}

/**
 * Bytes, shown.
 *
 * Short strings print in full; long ones collapse behind a native `<details>`,
 * which is keyboard-operable, announced as a disclosure, and needs no script.
 */
export function HexDump({ bytes }: HexDumpProps): ReactElement {
  const full = toHex(bytes);

  if (bytes.length <= INLINE_LIMIT_BYTES) {
    return (
      <div style={{ ...MONO_STYLE, color: "var(--color-accent)", overflowWrap: "anywhere" }}>
        {full}
      </div>
    );
  }

  const preview = toHex(bytes.subarray(0, INLINE_LIMIT_BYTES));

  return (
    <details style={{ marginBlockStart: "var(--rhythm-meta)" }}>
      <summary
        style={{
          ...MONO_STYLE,
          color: "var(--color-foreground-secondary)",
          cursor: "pointer",
        }}
      >
        {CEREMONY_A11Y.hexPreview(preview, bytes.length)}
      </summary>
      <div style={HEX_STYLE}>{full}</div>
    </details>
  );
}
