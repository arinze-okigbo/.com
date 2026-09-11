import { toReadoutMilliseconds, toShortSignature } from "./format";
import type { Attestation } from "./types";

/**
 * The committed attestation.
 *
 * These are the bytes of a real ECDSA P-256 (`ES256`) signature over a random
 * 32-byte nonce, produced once with WebCrypto and checked in so the fallback is
 * deterministic and reviewable (docs/02 §6: "a fixed signature, committed seed,
 * so it's deterministic and reviewable"). The server-rendered poster is the
 * resolved lattice at exactly this seed, and the server-rendered readout shows
 * exactly these values — so the concept survives with JavaScript disabled.
 *
 * It is a public signature over a public nonce. It is not a key, not a secret,
 * and it authenticates nothing.
 */
const BUILD_SIGNATURE_BYTES: readonly number[] = [
  101, 38, 48, 203, 79, 147, 88, 7, 201, 2, 47, 229, 163, 143, 64, 148, 13, 38, 104, 7, 215, 248,
  93, 240, 169, 167, 253, 122, 113, 172, 251, 139, 244, 5, 243, 4, 77, 231, 74, 253, 79, 137, 196,
  100, 253, 66, 45, 234, 241, 39, 183, 132, 255, 44, 75, 66, 170, 192, 240, 120, 157, 133, 144, 171,
];

/** Measured once for the committed keypair, in milliseconds. */
const BUILD_VERIFY_MS = 0.1;

/** JOSE name for ECDSA P-256 with SHA-256 — the curve WebAuthn passkeys use. */
export const ALGORITHM_NAME = "ES256";

const buildSignature = Uint8Array.from(BUILD_SIGNATURE_BYTES);

/** The attestation rendered on the server, and whenever the scene never loads. */
export const BUILD_ATTESTATION: Attestation = {
  alg: ALGORITHM_NAME,
  short: toShortSignature(buildSignature),
  ms: toReadoutMilliseconds(BUILD_VERIFY_MS),
  signature: buildSignature,
};
