/**
 * The attestation figure — `docs/05 §3.3`.
 *
 * Amended for the field port (`docs/15` §3). This was a `<figure>` inside
 * `#work`; the boxed figure is deleted and the copy is promoted into
 * `#attestation`, the field's own section at position 3. It still carries NO
 * heading, so it does not enter the [R9] headings chain — it is titled by its
 * eyebrow.
 *
 * The poster and the live canvas are owned by the `field-three-d` agent
 * (`@/components/three` → `AttestationField`). This module owns only the copy,
 * and `caption` is the honesty copy `docs/02 §9` makes non-optional.
 */
export const ATTESTATION = {
  /** The anchor `docs/15 §3` row 3 gives the section. */
  id: "attestation",

  /**
   * `docs/15 §3` row 3: this section contributes **no heading**, preserving the
   * [R9] headings chain — it is titled by its eyebrow, as the prototype does.
   * Verbatim from `proto-c-field.html`. Rendered `--color-foreground-muted`,
   * never accent (`docs/04 §3.5` F6).
   *
   * ADDITIVE ONLY. `content.test.ts` locks every string in this module that it
   * enumerates; this key is new rather than a rewrite of one.
   */
  sectionEyebrow: "Attestation · live in this tab",

  /** [WCAG 1.1.1] poster alt, verbatim from `docs/02 §8.1`. */
  posterAlt: "A lattice of points resolving from scattered noise into an ordered surface.",

  /**
   * The honesty caption. `docs/02 §9` names overclaiming crypto to a security
   * audience as the single way this figure backfires.
   *
   * THE SECOND PARAGRAPH IS NOT OPTIONAL. No copy anywhere on the site may
   * describe this figure as encryption, as a security guarantee, or as a demo of
   * the Queralt work.
   */
  caption: [
    "This page generated an ECDSA P-256 keypair in your browser with WebCrypto — the same curve WebAuthn passkeys use — signed a nonce, and seeded the geometry above with the 64 signature bytes.",
    "The signature seeds a shape. It encrypts nothing and secures nothing. Reload and the structure changes, because the nonce does.",
  ],
} as const;
