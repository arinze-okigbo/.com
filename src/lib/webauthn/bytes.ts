import type { Bytes } from "./types";

/**
 * Byte utilities for the ceremony. Pure, allocation-only, no globals touched
 * except `crypto` — and only inside the two functions that say so.
 */

/** SHA-256 digest length, in bytes. */
export const SHA256_BYTES = 32;

/** Raised when a byte-level operation cannot proceed. Callers explain it. */
export class ByteFormatError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ByteFormatError";
  }
}

/** Space-separated lowercase hex. Readable, and the form the hex dump prints. */
export function toHex(bytes: Uint8Array): string {
  const parts: string[] = [];
  for (const byte of bytes) parts.push(byte.toString(16).padStart(2, "0"));
  return parts.join(" ");
}

/** Unpadded base64url — the encoding WebAuthn uses everywhere. */
export function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Inverse of `toBase64Url`. Tolerates missing padding, rejects nothing else. */
export function fromBase64Url(text: string): Bytes {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  let binary: string;
  try {
    binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  } catch (cause) {
    throw new ByteFormatError("input is not valid base64url", { cause });
  }
  const out = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) out[index] = binary.charCodeAt(index);
  return out;
}

/** Returns a new buffer; neither input is touched. */
export function concatBytes(a: Uint8Array, b: Uint8Array): Bytes {
  const out = new Uint8Array(new ArrayBuffer(a.length + b.length));
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

/** Length-independent comparison. Constant-time over the common length. */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}

/** 16 bytes → canonical 8-4-4-4-12 UUID. AAGUIDs are printed this way. */
export function formatUuid(bytes: Uint8Array): string {
  if (bytes.length !== 16) {
    throw new ByteFormatError(`a UUID is 16 bytes; received ${bytes.length}`);
  }
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

/** Copies `source` into a fresh `ArrayBuffer`-backed view, for WebCrypto. */
export function toBytes(source: ArrayBuffer | Uint8Array): Bytes {
  const view = source instanceof Uint8Array ? source : new Uint8Array(source);
  const out = new Uint8Array(new ArrayBuffer(view.length));
  out.set(view, 0);
  return out;
}

/** Touches `crypto.getRandomValues`. The only randomness in the demonstration. */
export function randomBytes(length: number): Bytes {
  const out = new Uint8Array(new ArrayBuffer(length));
  globalThis.crypto.getRandomValues(out);
  return out;
}

/**
 * Touches `crypto.subtle`, which does not exist in an insecure context — a
 * normal condition here, not an exceptional one, so it throws something the UI
 * can explain rather than a bare `TypeError`.
 */
export async function sha256(bytes: Bytes): Promise<Bytes> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new ByteFormatError("SubtleCrypto is unavailable — this page is not in a secure context");
  }
  return toBytes(await subtle.digest("SHA-256", bytes));
}
