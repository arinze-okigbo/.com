/** Pure formatting helpers for the attestation readout. Server- and client-safe. */

const HEX_ALPHABET = "0123456789abcdef";

/** Bytes taken from each end of the signature for the truncated display form. */
const TRUNCATION_BYTES = 2;

/** Ellipsis separating the head and tail of the truncated signature. */
const ELLIPSIS = "…";

/** Hex-encodes a byte range without allocating an intermediate array of strings. */
export function toHex(bytes: Uint8Array, start = 0, end = bytes.length): string {
  let out = "";
  for (let i = start; i < end; i += 1) {
    const byte = bytes[i];
    out += HEX_ALPHABET[(byte >> 4) & 0x0f] + HEX_ALPHABET[byte & 0x0f];
  }
  return out;
}

/**
 * Renders `3045…a91c` from a raw signature. Falls back to the full hex string
 * when the signature is too short to truncate meaningfully.
 */
export function toShortSignature(signature: Uint8Array): string {
  if (signature.length <= TRUNCATION_BYTES * 2) return toHex(signature);
  const head = toHex(signature, 0, TRUNCATION_BYTES);
  const tail = toHex(signature, signature.length - TRUNCATION_BYTES);
  return `${head}${ELLIPSIS}${tail}`;
}

/** Rounds a duration to the one decimal place the readout displays. */
export function toReadoutMilliseconds(durationMs: number): number {
  if (!Number.isFinite(durationMs) || durationMs < 0) return 0;
  return Math.round(durationMs * 10) / 10;
}
