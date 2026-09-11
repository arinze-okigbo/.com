/**
 * The attestation figure — `docs/05 §3.3`.
 *
 * Not a section. A `<figure>` placed immediately after the Queralt entry inside
 * `#work`. It carries NO heading, so it does not enter the [R9] headings chain.
 *
 * Markup, frame, readout and `<figcaption>` are owned by the `three-d` agent
 * (`@/components/three` → `AttestationFigure`). This module owns only the copy.
 */
export const ATTESTATION = {
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
