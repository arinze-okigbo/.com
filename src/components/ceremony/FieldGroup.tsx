import type { ReactElement, ReactNode } from "react";

import { BLOCK_SCRIM, CAPTION_STYLE, LABEL_STYLE } from "./tokens";

/**
 * A titled group of fields.
 *
 * The title is a real `<h4>` under the step's `<h3>`, so a screen-reader user
 * can jump between `clientDataJSON`, `attestationObject`, `authenticatorData`
 * and the verification result by heading rather than by arrow key.
 *
 * The group is also the scrim unit for the results: one carve per group means
 * only the group being read is carved out of the field, and the rest stays lit.
 * Scrimming each `Field` row instead would put six-plus rects in view at once
 * and overflow the composite's six slots.
 */
export interface FieldGroupProps {
  readonly title: string;
  readonly note?: string;
  readonly children: ReactNode;
}

export function FieldGroup({ title, note, children }: FieldGroupProps): ReactElement {
  return (
    <section style={{ marginBlockStart: "var(--rhythm-entry)" }} data-scrim={BLOCK_SCRIM}>
      <h4
        style={{
          ...LABEL_STYLE,
          paddingBlockEnd: "var(--rhythm-meta)",
          borderBlockEnd: "1px solid var(--color-border)",
        }}
      >
        {title}
      </h4>
      {note ? (
        <p style={{ ...CAPTION_STYLE, marginBlockStart: "var(--rhythm-meta)" }}>{note}</p>
      ) : null}
      {children}
    </section>
  );
}
