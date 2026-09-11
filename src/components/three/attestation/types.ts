/** A completed in-browser ECDSA P-256 attestation, and its readout values. */
export interface Attestation {
  /** JOSE algorithm name. Always `ES256` for ECDSA P-256 + SHA-256. */
  readonly alg: string;
  /** Truncated signature, e.g. `3045…a91c`. Display only. */
  readonly short: string;
  /** Wall time the verify call took, in milliseconds, to one decimal place. */
  readonly ms: number;
  /** The raw 64-byte `r || s` signature that seeds the lattice. */
  readonly signature: Uint8Array;
}

/** The readout half of an {@link Attestation} — everything renderable as text. */
export type AttestationReadoutValues = Omit<Attestation, "signature">;
