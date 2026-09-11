import { ALGORITHM_NAME } from "./build-attestation";
import { toReadoutMilliseconds, toShortSignature } from "./format";
import type { Attestation } from "./types";

/**
 * The live attestation: a real ECDSA P-256 keypair generated in the visitor's
 * browser with WebCrypto, a fresh random nonce, a real signature, a real verify.
 *
 * WebCrypto is a native browser API, so this whole module is 0 KB of dependency.
 * It runs inside the deferred scene chunk, never in First Load JS.
 */

/** Nonce length in bytes. 32 = the SHA-256 digest size the signature commits to. */
const NONCE_BYTES = 32;

/** P-256 raw signatures are `r || s`, 32 bytes each. */
const EXPECTED_SIGNATURE_BYTES = 64;

const KEY_ALGORITHM: EcKeyGenParams = { name: "ECDSA", namedCurve: "P-256" };
const SIGN_ALGORITHM: EcdsaParams = { name: "ECDSA", hash: "SHA-256" };

/** Raised when the browser cannot produce an attestation. Callers fall back. */
export class AttestationUnavailableError extends Error {
  constructor(reason: string, options?: { cause?: unknown }) {
    super(`Attestation unavailable: ${reason}`, options);
    this.name = "AttestationUnavailableError";
  }
}

function requireSubtleCrypto(): SubtleCrypto {
  // `crypto.subtle` is undefined outside a secure context, which is a normal
  // condition (plain-HTTP preview deploys), not an exceptional one.
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new AttestationUnavailableError("WebCrypto subtle is not available in this context");
  }
  return subtle;
}

/**
 * Generates a keypair, signs a fresh nonce, verifies the signature, and returns
 * the bytes that seed the lattice plus the values the readout prints.
 *
 * @throws {AttestationUnavailableError} when WebCrypto is missing, refuses the
 * curve, or returns a signature that fails its own verification.
 */
export async function createAttestation(): Promise<Attestation> {
  const subtle = requireSubtleCrypto();

  let keyPair: CryptoKeyPair;
  try {
    keyPair = await subtle.generateKey(KEY_ALGORITHM, false, ["sign", "verify"]);
  } catch (cause) {
    throw new AttestationUnavailableError("P-256 key generation was refused", { cause });
  }

  const nonce = new Uint8Array(NONCE_BYTES);
  globalThis.crypto.getRandomValues(nonce);

  // Explicitly backed by an ArrayBuffer (not SharedArrayBuffer) so it satisfies
  // `BufferSource` when handed back to `subtle.verify`.
  let signature: Uint8Array<ArrayBuffer>;
  try {
    const raw = await subtle.sign(SIGN_ALGORITHM, keyPair.privateKey, nonce);
    signature = new Uint8Array(raw);
  } catch (cause) {
    throw new AttestationUnavailableError("signing failed", { cause });
  }

  if (signature.length !== EXPECTED_SIGNATURE_BYTES) {
    throw new AttestationUnavailableError(
      `expected ${EXPECTED_SIGNATURE_BYTES} signature bytes, received ${signature.length}`,
    );
  }

  const startedAt = performance.now();
  let isVerified: boolean;
  try {
    isVerified = await subtle.verify(SIGN_ALGORITHM, keyPair.publicKey, signature, nonce);
  } catch (cause) {
    throw new AttestationUnavailableError("verification failed", { cause });
  }
  const elapsedMs = performance.now() - startedAt;

  if (!isVerified) {
    throw new AttestationUnavailableError("the signature did not verify against its own key");
  }

  return {
    alg: ALGORITHM_NAME,
    short: toShortSignature(signature),
    ms: toReadoutMilliseconds(elapsedMs),
    signature,
  };
}
