import type { Attestation } from "../attestation/types";

/**
 * Replaces the HUD's build-time values with the live ones.
 *
 * `FieldHud` is server-rendered from `BUILD_ATTESTATION`, so it is correct and
 * complete with JavaScript disabled. When the deferred chunk produces a real
 * in-browser signature, this patches the three fields in place — no React
 * state, no re-render, zero additional client JS. It is the same trick
 * `AttestationReadout` already used, moved to a `data-*` contract so the HUD
 * can be mounted anywhere in the tree without a prop drill.
 */

export const HUD_SELECTOR = "[data-field-hud]";

const FIELD_SELECTORS = {
  signature: "[data-field-hud-sig]",
  milliseconds: "[data-field-hud-ms]",
  points: "[data-field-hud-points]",
} as const;

function setText(root: ParentNode, selector: string, value: string): void {
  const node = root.querySelector(selector);
  if (node) node.textContent = value;
}

/** Patches every HUD on the page. A no-op when none is mounted. */
export function patchFieldHud(attestation: Attestation, points: number): void {
  for (const hud of document.querySelectorAll(HUD_SELECTOR)) {
    setText(hud, FIELD_SELECTORS.signature, attestation.short);
    setText(hud, FIELD_SELECTORS.milliseconds, String(attestation.ms));
    setText(hud, FIELD_SELECTORS.points, points.toLocaleString("en-US"));
  }
}
