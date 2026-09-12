import { concatBytes, sha256, toBase64Url } from "./bytes";
import { ALG_EDDSA, COSE_CRV_P256, COSE_KTY_EC2, COSE_KTY_RSA } from "./cose";
import { P256_COORDINATE_BYTES, derToRawEcdsaSignature } from "./der";
import type { Bytes, ParsedCoseKey } from "./types";

/**
 * Signature verification with WebCrypto.
 *
 * This module is the one place in `@/lib/webauthn` that calls `crypto.subtle`.
 * No library, no server, no stored secret: the public key comes from the
 * attestation object parsed a few modules over, and the verification runs in
 * the visitor's own browser.
 */

/** Raised when a key cannot be imported or a signature cannot be checked. */
export class VerificationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "VerificationError";
  }
}

export interface VerificationResult {
  readonly isValid: boolean;
  readonly elapsedMs: number;
  /** `authenticatorData ‖ SHA-256(clientDataJSON)` — exactly what was signed. */
  readonly signedBytes: Bytes;
  readonly clientDataHash: Bytes;
  /** The signature in the form WebCrypto received it. */
  readonly normalisedSignature: Bytes;
  /** The WebCrypto algorithm name the COSE `alg` mapped onto. */
  readonly algorithmName: string;
}

function requireSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new VerificationError("SubtleCrypto is unavailable in an insecure context");
  }
  return subtle;
}

/** Imports a parsed COSE key as a non-extractable verify-only `CryptoKey`. */
export async function importCoseKey(cose: ParsedCoseKey): Promise<CryptoKey> {
  const subtle = requireSubtle();

  if (cose.kty === COSE_KTY_EC2) {
    if (cose.crv !== COSE_CRV_P256) {
      throw new VerificationError(
        `only P-256 is imported by this demonstration (crv=${String(cose.crv)})`,
      );
    }
    if (!cose.x || !cose.y) throw new VerificationError("the EC2 key has no x/y coordinates");
    const jwk: JsonWebKey = {
      kty: "EC",
      crv: "P-256",
      ext: true,
      x: toBase64Url(cose.x),
      y: toBase64Url(cose.y),
    };
    try {
      return await subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, [
        "verify",
      ]);
    } catch (cause) {
      throw new VerificationError("the P-256 public key was rejected by WebCrypto", { cause });
    }
  }

  if (cose.kty === COSE_KTY_RSA) {
    if (!cose.n || !cose.e) throw new VerificationError("the RSA key has no modulus/exponent");
    const jwk: JsonWebKey = {
      kty: "RSA",
      ext: true,
      n: toBase64Url(cose.n),
      e: toBase64Url(cose.e),
    };
    try {
      return await subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"],
      );
    } catch (cause) {
      throw new VerificationError("the RSA public key was rejected by WebCrypto", { cause });
    }
  }

  throw new VerificationError(
    cose.alg === ALG_EDDSA
      ? "Ed25519 verification is not available in WebCrypto in every browser"
      : `unsupported key type for verification: kty=${cose.kty}`,
  );
}

export interface VerifyAssertionInput {
  readonly cose: ParsedCoseKey;
  readonly signature: Bytes;
  readonly authenticatorData: Bytes;
  readonly clientDataJSON: Bytes;
}

/**
 * Verifies an assertion signature against the registered public key.
 *
 * @throws {VerificationError} when the key cannot be imported, the signature
 * cannot be normalised, or WebCrypto itself refuses the operation. A `false`
 * result is returned, not thrown — an invalid signature is data, not an error.
 */
export async function verifyAssertionSignature(
  input: VerifyAssertionInput,
): Promise<VerificationResult> {
  const subtle = requireSubtle();
  const key = await importCoseKey(input.cose);
  const clientDataHash = await sha256(input.clientDataJSON);
  const signedBytes = concatBytes(input.authenticatorData, clientDataHash);

  const isEcdsa = input.cose.kty === COSE_KTY_EC2;
  const algorithm: AlgorithmIdentifier | EcdsaParams = isEcdsa
    ? { name: "ECDSA", hash: "SHA-256" }
    : { name: "RSASSA-PKCS1-v1_5" };
  const normalisedSignature = isEcdsa
    ? derToRawEcdsaSignature(input.signature, P256_COORDINATE_BYTES)
    : input.signature;

  const startedAt = performance.now();
  let isValid: boolean;
  try {
    isValid = await subtle.verify(algorithm, key, normalisedSignature, signedBytes);
  } catch (cause) {
    throw new VerificationError("crypto.subtle.verify threw", { cause });
  }
  const elapsedMs = performance.now() - startedAt;

  return {
    isValid,
    elapsedMs,
    signedBytes,
    clientDataHash,
    normalisedSignature,
    algorithmName: isEcdsa ? "ECDSA / SHA-256 over P-256" : "RSASSA-PKCS1-v1_5 / SHA-256",
  };
}
