/** Local demonstration primitives: no storage, network, account, or credential creation. */
export const MAX_CHALLENGE_BYTES = 4096;
const encoder = new TextEncoder();
const signingAlgorithm = { name: "ECDSA", hash: "SHA-256" } as const;

function subtle() {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable in this environment.");
  }
  return globalThis.crypto.subtle;
}

/** Empty strings are valid. UTF-8 encoding follows TextEncoder, without normalization. */
function challengeBytes(text: string) {
  if (typeof text !== "string") throw new TypeError("Challenge must be a string.");
  // Reject clearly oversized input before allocating its encoded byte array.
  if (text.length > MAX_CHALLENGE_BYTES) {
    throw new RangeError(`Challenge must be at most ${MAX_CHALLENGE_BYTES} UTF-8 bytes.`);
  }
  const bytes = encoder.encode(text);
  if (bytes.byteLength > MAX_CHALLENGE_BYTES) {
    throw new RangeError(`Challenge must be at most ${MAX_CHALLENGE_BYTES} UTF-8 bytes.`);
  }
  return bytes;
}

/**
 * Generates a fresh in-memory P-256 pair. The private key cannot be exported;
 * Web Crypto keeps the public key exportable for its fingerprint.
 * Unavailable Web Crypto and native key-generation errors reject the promise.
 */
export async function createProofKeyPair(): Promise<CryptoKeyPair> {
  return subtle().generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]);
}

/**
 * Signs the exact UTF-8 challenge using ECDSA/SHA-256; returns the raw r || s bytes.
 * Rejects with RangeError over MAX_CHALLENGE_BYTES, TypeError for non-string input,
 * or the native Web Crypto error for invalid keys or unavailable operations.
 */
export async function signChallenge(privateKey: CryptoKey, text: string): Promise<Uint8Array> {
  const bytes = challengeBytes(text);
  return new Uint8Array(await subtle().sign(signingAlgorithm, privateKey, bytes));
}

/**
 * Returns false for a signature that does not match this key and exact challenge.
 * Input-limit and native key/operation errors reject, as in signChallenge.
 */
export async function verifyChallenge(
  publicKey: CryptoKey,
  text: string,
  signature: Uint8Array,
): Promise<boolean> {
  const bytes = challengeBytes(text);
  return subtle().verify(signingAlgorithm, publicKey, new Uint8Array(signature), bytes);
}

/** SHA-256 of exported SPKI public-key bytes, rendered as 64 lowercase hex digits. */
export async function fingerprintPublicKey(publicKey: CryptoKey): Promise<string> {
  const crypto = subtle();
  const spki = await crypto.exportKey("spki", publicKey);
  const digest = new Uint8Array(await crypto.digest("SHA-256", spki));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
