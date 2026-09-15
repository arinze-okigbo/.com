import type { CSSProperties, ReactElement } from "react";

import { BUILD_ATTESTATION } from "./attestation/build-attestation";
import { GRID_COLUMNS_HIGH, GRID_ROWS_HIGH } from "./constants";

/**
 * The attestation readout, sited as a HUD over the field — docs/15 §2.11.
 *
 * Real, selectable text. Server-rendered from `BUILD_ATTESTATION`, so it is
 * correct and complete with JavaScript disabled; the deferred chunk patches the
 * signature, the verify time and the point count in place through the
 * `data-field-hud-*` contract in `field/hud-patch.ts` — no React state, no
 * re-render, zero additional client JS.
 *
 * Copy constraint (docs/02 §9): algorithm, truncated signature, verify time and
 * point count only. Nothing here may imply encryption or a security guarantee;
 * the honesty caption is prose in `#attestation` and does not become a HUD line.
 *
 * ## Why this is IN FLOW and not `position: fixed`
 *
 * It shipped as `position: fixed` at the bottom-left gutter, and at 1440x900
 * that put it **on top of section copy at every scroll position**: over "Three
 * entries, ordered by how hard the work is to fake" in the hero, over the
 * authenticator status line in `#ceremony`. Two strings rendered on top of each
 * other, in a build whose gates were all green — no contrast probe catches it,
 * because the probe reads the field's framebuffer and a DOM-on-DOM collision is
 * not in it.
 *
 * There is no fixed placement that fixes this. The site is one scrolling
 * column with no reserved band: at 1440 the reading column starts at x=384 and
 * this readout is ~580px wide, so it reaches into the column; at 390 there is
 * no gutter at all. A fixed layer over a scrolling document either overlaps
 * text or hides it, and A8.4 clearance says nothing about either.
 *
 * So the readout participates in layout. It is the last block of the hero —
 * the field's own instrument label, under the actions, inside the `.stage`
 * scope and inside the reading column — which means:
 *
 * - it **cannot** occlude content at any scroll position or any viewport,
 *   because it occupies its own box like every other block;
 * - it is visible in the framing shot, where the field is at full energy
 *   (docs/15 §3 row 1) and the readout's claim does the most work;
 * - it contributes nothing to CLS: it is server-rendered and in flow from the
 *   first paint, and the deferred patch only rewrites text inside three spans
 *   whose widths are fixed by `font-variant-numeric: tabular-nums`.
 *
 * ## Colour is inherited, not computed
 *
 * The previous version carried a 14-rule stylesheet keyed off `data-field-ground`
 * — the attribute `field/bleed.ts` publishes to say which ground a FIXED layer
 * is currently over — because a fixed HUD crosses from the stage onto the page
 * as light mode's sectioned field masks out beneath it. In flow inside `.stage`
 * that question cannot arise: the ground under this block is `--field-ink` in
 * both themes, unconditionally, in CSS (globals.css §3.7), so the `.stage`
 * scope's own `--color-foreground-muted` / `--color-border` / `--color-accent`
 * are already the right values and a plain inline style is correct everywhere.
 *
 * That is also why the "no `color` in the inline style object" trap in the old
 * comment is gone rather than restated: there is no stylesheet left for an
 * inline declaration to outrank.
 */

/** The HUD's tracking. Referenced by `reserve()` too; they must not drift. */
const TRACKING = "0.11em";

const HUD_STYLE: CSSProperties = {
  margin: 0,
  marginBlockStart: "var(--space-10)",
  paddingBlockStart: "var(--rhythm-title)",
  borderBlockStart: "1px solid var(--color-border)",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "0.75rem",
  color: "var(--color-foreground-muted)",
  fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)",
  fontSize: "var(--text-mono, 0.8125rem)",
  lineHeight: "var(--text-mono--line-height, 1.5)",
  letterSpacing: TRACKING,
  // The patched values replace the build-time ones character for character in
  // width, so the live update reflows nothing.
  fontVariantNumeric: "tabular-nums",
};

const RULE_STYLE: CSSProperties = { color: "var(--color-border)" };
const MARK_STYLE: CSSProperties = { color: "var(--color-accent)" };

/**
 * Reserved width for a patched value, so the live update reflows nothing.
 *
 * The three `data-field-hud-*` spans are rewritten in place by the deferred
 * chunk, and two of them change LENGTH: `ms` goes from `0.1` to whatever the
 * browser measured, and `pts` from the build's `15,088` to the tier the device
 * actually got — `6,944` on mid, `2,880` on low. In flow that is a real layout
 * shift. It measured **0.0003** on a mobile sweep: small, and the budget is
 * CLS 0, and the old fixed HUD contributed nothing because it was out of flow.
 * Moving it into flow is what put it on the page's account, so it is paid here.
 *
 * `ch` is the width of "0" and this is a monospace face, so N characters is
 * exactly `Nch` — plus the tracking, which `ch` does not include and which is
 * applied once per character.
 */
function reserve(characters: number, align: "start" | "end"): CSSProperties {
  return {
    display: "inline-block",
    minWidth: `calc(${characters}ch + ${characters} * ${TRACKING})`,
    textAlign: align,
  };
}

/** `40e2…37ab` — four hex chars, an ellipsis, four hex chars. Always 9. */
const SIGNATURE_CHARS = 9;
/** `12.3`. One decimal place, `toReadoutMilliseconds`. */
const MILLISECOND_CHARS = 5;
/** `15,088` at the high tier; `6,944` and `2,880` below it. */
const POINT_CHARS = 6;

const NBSP = " ";

/**
 * The HUD is text over the field like any other block, so it declares its own
 * carve (A8.3). Without one the readout sits on whatever the field happens to
 * be emitting behind it, which in the hero is a lit region at energy 1.30.
 *
 * Kept at the value measured for the fixed placement — it is still the one
 * block whose ink is `--field-fg-muted`, the dimmest step of the §3.7 ladder.
 * A8.4 fixes the remedy order and puts the carve first: raise the amount,
 * widen the padding, move the block. Dimming the field is the last resort and
 * re-toning the ramp is not a remedy at all.
 */
const HUD_SCRIM = "28,16,0.98";

function Separator(): ReactElement {
  return (
    <span aria-hidden="true" data-field-hud-rule="" style={RULE_STYLE}>
      │
    </span>
  );
}

export function FieldHud(): ReactElement {
  const buildPoints = (GRID_COLUMNS_HIGH * GRID_ROWS_HIGH).toLocaleString("en-US");

  return (
    <p style={HUD_STYLE} data-field-hud="" data-scrim={HUD_SCRIM}>
      <span>
        P-256{NBSP}·{NBSP}ECDSA
      </span>
      <Separator />
      <span>
        sig{NBSP}
        <span data-field-hud-sig="" style={reserve(SIGNATURE_CHARS, "start")}>
          {BUILD_ATTESTATION.short}
        </span>
      </span>
      <Separator />
      <span>
        <span aria-hidden="true" data-field-hud-mark="" style={MARK_STYLE}>
          ✓
        </span>{" "}
        {/* JSX trims whitespace that contains a newline, so the space after
            "verified" is explicit and there is none before "ms". */}
        verified{NBSP}
        <span data-field-hud-ms="" style={reserve(MILLISECOND_CHARS, "end")}>
          {BUILD_ATTESTATION.ms}
        </span>
        ms
      </span>
      <Separator />
      <span>
        pts{NBSP}
        <span data-field-hud-points="" style={reserve(POINT_CHARS, "start")}>
          {buildPoints}
        </span>
      </span>
    </p>
  );
}
