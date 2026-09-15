import type { CSSProperties, ReactNode } from "react";

import { CeremonyMount } from "@/components/ceremony";
import { BLOCK_SCRIM, HEADING_SCRIM } from "@/components/ceremony/tokens";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  CEREMONY,
  CEREMONY_BRIDGE,
  CEREMONY_CONTROLS,
  CEREMONY_DISCLOSURE,
  CEREMONY_METHOD,
  CEREMONY_NOTES,
  CEREMONY_NOTICE,
  CEREMONY_RESTING_CAVEAT,
  CEREMONY_SAMPLE_SUMMARY,
} from "@/content/ceremony";

/**
 * The ceremony — `docs/15 §3`, position 4 on the page.
 *
 * A **Server Component**. The heading, the honesty notice, the decoded sample
 * and the closing notes are all in the initial HTML, so the section teaches a
 * visitor with JavaScript disabled exactly what a WebAuthn ceremony contains —
 * `docs/11 §6.1`'s "completely blank page with no scripts running" is the most
 * consistent criticism this audience makes of personal sites.
 *
 * The interactive ceremony is the only part that needs script, and it arrives
 * through `CeremonyMount`'s dynamic `import()` after the visitor approaches.
 *
 * RESTING STATE — `docs/05 §3.3a`, binding. At rest this section is the
 * heading, the bridge, one honesty line and the button, and nothing else; it
 * measured 2.30 vp at 1440×900 and 3.71 vp at 390×844 against a 0.60 budget,
 * and collapsing it is the only reason the page clears `docs/03` R14 at all.
 * The reference material moved into a native `<details>` — it did not move out
 * of the DOM. Re-measure at **390×844**, not desktop: the mobile figure is 38%
 * worse and it is the one the budget is written against.
 *
 * `docs/15 §7 R7`: `#attestation` one section above says its signature
 * "encrypts nothing and secures nothing". This section is a real credential
 * ceremony — and still a demonstration, because the challenge is client-side.
 * `CEREMONY_BRIDGE` states the difference so the adjacency reads as neither a
 * walked-back disclaimer nor an overclaim.
 *
 * FIELD COMPOSITION — `docs/15 §3` row 4. The field runs under `#ceremony` in
 * both themes, so this section takes `field="stage"` (the unconditional token
 * scope, applied in CSS) rather than the dark-mode-only `"over"`.
 * `fieldState="ceremony"` drops the field's energy to 0.55 and holds it nearly
 * still for the duration of the ceremony.
 *
 * The `<Section>` carries NO scrim. Scrims are declared on the text blocks
 * below, because `#ceremony` is 2,066px tall and a section-level rect at 0.94
 * is a taller-than-viewport carve that extinguishes the field for the section's
 * whole length — and then flatters every contrast reading taken over it, since
 * each string gets measured against a floor the visitor never sees.
 *
 * `field` and `fieldState` are the named props, never `data-*` written by hand:
 * a hyphenated JSX attribute is not excess-property-checked, so a typo there
 * type-checks and is then silently dropped. `data-scrim` is written directly
 * only on plain elements this file owns, where there is no prop to mistype.
 */

const BODY_STYLE: CSSProperties = {
  margin: 0,
  marginBlockStart: "var(--rhythm-paragraph)",
  fontSize: "var(--text-body)",
  lineHeight: "var(--text-body--line-height)",
  letterSpacing: "var(--text-body--letter-spacing)",
  color: "var(--color-foreground)",
  maxWidth: "var(--measure-prose)",
};

const CAPTION_STYLE: CSSProperties = {
  margin: 0,
  fontSize: "var(--text-caption)",
  lineHeight: "var(--text-caption--line-height)",
  color: "var(--color-foreground-secondary)",
  maxWidth: "var(--measure-prose)",
};

const LABEL_STYLE: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-label)",
  lineHeight: "var(--text-label--line-height)",
  letterSpacing: "var(--text-label--letter-spacing)",
  fontWeight: "var(--font-weight-medium)",
  textTransform: "uppercase",
  color: "var(--color-accent)",
};

const NOTICE_STYLE: CSSProperties = {
  marginBlockStart: "var(--rhythm-entry)",
  padding: "var(--rhythm-title)",
  background: "var(--color-accent-tint)",
  border: "1px solid var(--color-border-subtle)",
  borderInlineStart: "2px solid var(--color-accent)",
  borderRadius: "var(--radius-sm)",
  maxWidth: "var(--measure-prose)",
};

const MONO_STYLE: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-mono)",
  lineHeight: "var(--text-mono--line-height)",
};

export function CeremonySection(): ReactNode {
  return (
    <Section
      id={CEREMONY.id}
      labelledBy={CEREMONY.headingId}
      width="wide"
      field="stage"
      fieldState="ceremony"
    >
      <SectionHeading id={CEREMONY.headingId} level={2} scrim={HEADING_SCRIM}>
        {CEREMONY.heading}
      </SectionHeading>

      {/* THE RESTING STATE — docs/05 §3.3a. Heading, bridge, the one honesty
          line that never collapses, and the button. Nothing else. */}
      <div data-scrim={BLOCK_SCRIM}>
        {/* One paragraph, not two. IA rejected moving the second half into the
            disclosure and rewrote it as one instead: that half carries
            "WebAuthn/FIDO2" and the tie to the Queralt entry, and docs/03 B4.1
            makes burying the page's highest-value protocol noun in a closed
            `details` the single worst structural edit available here. The
            saved `--rhythm-paragraph` gap is the point. */}
        <p style={{ ...BODY_STYLE, marginBlockStart: "var(--rhythm-heading)" }}>
          {CEREMONY_BRIDGE}
        </p>

        <p style={{ ...CAPTION_STYLE, marginBlockStart: "var(--rhythm-title)" }}>
          {CEREMONY_RESTING_CAVEAT}
        </p>
      </div>

      <CeremonyMount
        loadLabel={CEREMONY_CONTROLS.showPanel}
        loadHint={CEREMONY_CONTROLS.showPanelHint}
      />

      {/* THE DISCLOSURE — docs/05 §3.3a. A native `details`, server-rendered:
          every word below is in the initial DOM, findable by in-page search,
          and readable with JavaScript disabled. The scrims stay on the blocks
          INSIDE it, never on the `details` itself, which would be exactly the
          container-shaped carve A8.3 forbids. */}
      <details
        style={{
          marginBlockStart: "var(--rhythm-heading)",
          paddingBlockStart: "var(--rhythm-entry)",
          borderBlockStart: "1px solid var(--color-border-subtle)",
        }}
      >
        {/* The summary carries its own carve, like every other text block over
            the field (A8.3). The `details` around it must NOT — that is the
            container-shaped rect A8.3 forbids, and `isLeafScrim` would skip
            both. Measured before this was added: gold `--color-accent` on the
            lit lattice, under the 4.5 floor. */}
        <summary
          data-scrim={HEADING_SCRIM}
          style={{
            ...LABEL_STYLE,
            cursor: "pointer",
            minBlockSize: "44px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {CEREMONY_DISCLOSURE.summary}
        </summary>

        <div data-scrim={BLOCK_SCRIM}>
          <p style={{ ...BODY_STYLE, marginBlockStart: "var(--rhythm-title)" }}>
            {CEREMONY_METHOD}
          </p>
          <p style={{ ...CAPTION_STYLE, marginBlockStart: "var(--rhythm-paragraph)" }}>
            {CEREMONY_DISCLOSURE.note}
          </p>
        </div>

        <aside
          style={NOTICE_STYLE}
          aria-labelledby="ceremony-notice-heading"
          data-scrim={BLOCK_SCRIM}
        >
          <h3 id="ceremony-notice-heading" style={LABEL_STYLE}>
            {CEREMONY_NOTICE.heading}
          </h3>
          <ul
            style={{
              margin: 0,
              marginBlockStart: "var(--rhythm-title)",
              paddingInlineStart: "var(--rhythm-title)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--rhythm-meta)",
            }}
          >
            {CEREMONY_NOTICE.items.map((item) => (
              <li key={item.lead} style={{ ...CAPTION_STYLE, color: "var(--color-foreground)" }}>
                <strong style={{ color: "var(--color-foreground-strong)", fontWeight: 500 }}>
                  {item.lead}
                </strong>{" "}
                {item.body}
              </li>
            ))}
          </ul>
        </aside>

        <section
          aria-labelledby="ceremony-sample-heading"
          data-scrim={BLOCK_SCRIM}
          style={{ marginBlockStart: "var(--rhythm-entry)" }}
        >
          <h3 id="ceremony-sample-heading" style={LABEL_STYLE}>
            {CEREMONY_SAMPLE_SUMMARY.title}
          </h3>
          <p style={{ ...CAPTION_STYLE, marginBlockStart: "var(--rhythm-title)" }}>
            {CEREMONY_SAMPLE_SUMMARY.note}
          </p>

          <dl
            style={{
              margin: 0,
              marginBlockStart: "var(--rhythm-title)",
              display: "grid",
              gridTemplateColumns: "minmax(12rem, auto) 1fr",
              gap: "var(--rhythm-meta) var(--rhythm-entry)",
              ...MONO_STYLE,
              maxWidth: "var(--measure-mono)",
            }}
          >
            {CEREMONY_SAMPLE_SUMMARY.rows.map((row) => (
              <div key={row.label} style={{ display: "contents" }}>
                <dt style={{ color: "var(--color-foreground-muted)" }}>{row.label}</dt>
                <dd
                  style={{ margin: 0, color: "var(--color-foreground)", overflowWrap: "anywhere" }}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="ceremony-notes-heading"
          data-scrim={BLOCK_SCRIM}
          style={{ marginBlockStart: "var(--rhythm-entry)" }}
        >
          <h3 id="ceremony-notes-heading" style={LABEL_STYLE}>
            {CEREMONY_NOTES.title}
          </h3>
          {CEREMONY_NOTES.items.map((item) => (
            <p
              key={item.lead}
              style={{ ...CAPTION_STYLE, marginBlockStart: "var(--rhythm-title)" }}
            >
              <strong style={{ color: "var(--color-foreground)", fontWeight: 500 }}>
                {item.lead}
              </strong>{" "}
              {item.body}
            </p>
          ))}
        </section>
      </details>
    </Section>
  );
}
