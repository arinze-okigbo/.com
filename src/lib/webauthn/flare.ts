/**
 * The one authored moment this section is allowed.
 *
 * `docs/15 §3` — on a successful verify the section dispatches `field:flare`
 * and the WebGL field behind the page pulses once and decays. Nothing else on
 * the site dispatches it.
 *
 * `docs/15 §5.5` makes the flare **decorative and additive only**: it may never
 * be the only signal that the ceremony succeeded. The visible result text and
 * the `role="status"` live region are the signal; this is a garnish on top, and
 * it is a no-op under reduced motion because the field is not mounted at all.
 */

export const FIELD_FLARE_EVENT = "field:flare";

/** Amplitude and decay, fixed by `docs/15 §3`. */
export const FIELD_FLARE_DETAIL: { readonly amount: number; readonly ms: number } = {
  amount: 1.6,
  ms: 900,
};

/**
 * Dispatches the flare. Call exactly once, and only when a signature genuinely
 * verified — never on a failure, never on a parse, never on mount.
 */
export function dispatchFieldFlare(): void {
  if (typeof document === "undefined" || typeof CustomEvent !== "function") return;
  document.dispatchEvent(new CustomEvent(FIELD_FLARE_EVENT, { detail: { ...FIELD_FLARE_DETAIL } }));
}
