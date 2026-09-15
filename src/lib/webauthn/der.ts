import type { Bytes } from "./types";

/**
 * DER → raw ECDSA signature conversion.
 *
 * An authenticator returns ECDSA signatures ASN.1 DER-encoded as
 * `SEQUENCE { INTEGER r, INTEGER s }`. WebCrypto wants raw `r ‖ s`, each
 * integer left-padded to the curve's coordinate size.
 *
 * Getting this conversion wrong is the single most common reason a hand-rolled
 * WebAuthn server rejects perfectly valid signatures, which is why it is its
 * own module with its own tests.
 */

/** Raised when a signature is not the DER structure ECDSA requires. */
export class DerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DerError";
  }
}

const TAG_SEQUENCE = 0x30;
const TAG_INTEGER = 0x02;
const LONG_FORM_MASK = 0x80;
const LENGTH_MASK = 0x7f;

/** P-256 coordinates are 32 bytes; P-384 is 48, P-521 is 66. */
export const P256_COORDINATE_BYTES = 32;

interface ReadInteger {
  readonly value: Uint8Array;
  readonly pos: number;
}

function readInteger(der: Uint8Array, start: number): ReadInteger {
  if (der[start] !== TAG_INTEGER) {
    throw new DerError("expected a DER INTEGER inside the ECDSA signature");
  }
  const length = der[start + 1];
  const end = start + 2 + length;
  if (end > der.length) throw new DerError("a DER INTEGER runs past the end of the signature");

  // DER stores INTEGERs two's-complement, so a value whose high bit is set
  // carries a leading 0x00. Strip it; never strip the whole value.
  let valueStart = start + 2;
  while (der[valueStart] === 0x00 && end - valueStart > 1) valueStart += 1;

  return { value: der.subarray(valueStart, end), pos: end };
}

/**
 * Converts a DER ECDSA signature to raw `r ‖ s`.
 *
 * @param der the signature exactly as the authenticator returned it.
 * @param coordinateBytes the curve's coordinate size — 32 for P-256.
 * @throws {DerError} when the input is not a DER SEQUENCE of two INTEGERs, or
 * when either integer is wider than the curve allows.
 */
export function derToRawEcdsaSignature(der: Uint8Array, coordinateBytes: number): Bytes {
  if (der.length < 2 || der[0] !== TAG_SEQUENCE) {
    const found = der.length > 0 ? `0x${der[0].toString(16).padStart(2, "0")}` : "an empty buffer";
    throw new DerError(`the ECDSA signature is not a DER SEQUENCE (found ${found})`);
  }

  // Skip the SEQUENCE header: short form is one length byte, long form encodes
  // the byte-count of the length in the low seven bits.
  const pos = der[1] & LONG_FORM_MASK ? 2 + (der[1] & LENGTH_MASK) : 2;

  const r = readInteger(der, pos);
  const s = readInteger(der, r.pos);

  if (r.value.length > coordinateBytes || s.value.length > coordinateBytes) {
    throw new DerError(
      `an ECDSA integer is wider than the ${coordinateBytes}-byte coordinate size of this curve`,
    );
  }

  const raw = new Uint8Array(new ArrayBuffer(coordinateBytes * 2));
  raw.set(r.value, coordinateBytes - r.value.length);
  raw.set(s.value, coordinateBytes * 2 - s.value.length);
  return raw;
}
