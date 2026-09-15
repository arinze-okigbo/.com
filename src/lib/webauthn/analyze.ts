import { resolveAaguid } from "./aaguid";
import { isFlagSet, parseAuthData } from "./auth-data";
import { bytesEqual, sha256, toBase64Url } from "./bytes";
import { asCborBytes, asCborMap, decodeCbor, describeCborValue } from "./cbor";
import { parseClientData } from "./client-data";
import { describeAlgorithm, parseCoseKey } from "./cose";
import { verifyAssertionSignature, type VerificationResult } from "./verify";
import type {
  AaguidResolution,
  Bytes,
  CborValue,
  CeremonyInput,
  CoseAlgorithmInfo,
  ParsedAuthData,
  ParsedClientData,
  ParsedCoseKey,
} from "./types";

/**
 * The analysis layer: bytes in, facts and verdicts out.
 *
 * Deliberately carries no prose. Every sentence a visitor reads lives in
 * `@/content/ceremony`; this module decides only what is *true* — whether the
 * challenge echoed, whether the RP ID hash matches, whether the signature
 * verifies — so those decisions can be unit-tested against fixed bytes.
 */

/** One entry of the attestation statement, already narrowed for rendering. */
export type AttStmtEntry =
  | {
      readonly kind: "alg";
      readonly label: string;
      readonly alg: number;
      readonly info: CoseAlgorithmInfo;
    }
  | { readonly kind: "x5c"; readonly label: string; readonly certificateLengths: readonly number[] }
  | {
      readonly kind: "bytes";
      readonly label: string;
      readonly bytes: Bytes;
      readonly summary: string;
    }
  | {
      readonly kind: "value";
      readonly label: string;
      readonly text: string;
      readonly summary: string;
    };

/** Whether anything is likely to outlive the tab, and why. */
export type PersistenceVerdict = "synced-passkey" | "key-wrapped" | "unknown";

export interface RegistrationAnalysis {
  readonly clientData: ParsedClientData;
  readonly clientDataByteLength: number;
  readonly challengeSent: string;
  readonly challengeByteLength: number;
  readonly isChallengeEchoed: boolean;
  readonly isOriginExpected: boolean;
  readonly attestationObjectByteLength: number;
  readonly fmt: string;
  readonly attStmt: readonly AttStmtEntry[];
  readonly hasAttestationStatement: boolean;
  readonly authDataBytes: Bytes;
  readonly authData: ParsedAuthData;
  readonly isRpIdHashExpected: boolean;
  readonly aaguid: AaguidResolution | null;
  readonly credentialId: Bytes | null;
  readonly credentialIdLength: number | null;
  readonly doesCredentialIdMatchRawId: boolean | null;
  readonly cose: ParsedCoseKey | null;
  readonly coseKeyByteLength: number | null;
  readonly extensionsSummary: string | null;
}

export interface AssertionAnalysis {
  readonly clientData: ParsedClientData;
  readonly challengeSent: string;
  readonly challengeByteLength: number;
  readonly isChallengeEchoed: boolean;
  readonly isOriginExpected: boolean;
  readonly authData: ParsedAuthData;
  readonly signature: Bytes;
  readonly verification: VerificationResult;
}

export interface CeremonyAnalysis {
  readonly input: CeremonyInput;
  readonly registration: RegistrationAnalysis;
  /** `null` only when the AT flag was clear, so there is no key to verify with. */
  readonly assertion: AssertionAnalysis | null;
  readonly persistence: PersistenceVerdict;
}

/** Credential IDs longer than this usually wrap the private key itself. */
export const KEY_WRAPPING_ID_THRESHOLD_BYTES = 64;

function readAttStmt(attStmt: CborValue): readonly AttStmtEntry[] {
  if (!(attStmt instanceof Map) || attStmt.size === 0) return [];

  const entries: AttStmtEntry[] = [];
  for (const [key, value] of attStmt.entries()) {
    const label = String(key);

    if (label === "alg" && typeof value === "number") {
      entries.push({ kind: "alg", label, alg: value, info: describeAlgorithm(value) });
      continue;
    }

    if (label === "x5c" && Array.isArray(value)) {
      entries.push({
        kind: "x5c",
        label,
        certificateLengths: value.map((certificate) =>
          certificate instanceof Uint8Array ? certificate.length : 0,
        ),
      });
      continue;
    }

    if (value instanceof Uint8Array) {
      entries.push({
        kind: "bytes",
        label,
        bytes: asCborBytes(value, label),
        summary: describeCborValue(value),
      });
      continue;
    }

    entries.push({
      kind: "value",
      label,
      text: describeCborValue(value),
      summary: describeCborValue(value),
    });
  }
  return entries;
}

function summariseExtensions(extensions: CborValue | null): string | null {
  if (!(extensions instanceof Map)) return null;
  return Array.from(extensions.entries())
    .map(([key, value]) => `${String(key)} = ${describeCborValue(value)}`)
    .join("; ");
}

function judgePersistence(
  authData: ParsedAuthData,
  credentialIdLength: number | null,
): PersistenceVerdict {
  if (isFlagSet(authData.flags, "BE") || isFlagSet(authData.flags, "BS")) return "synced-passkey";
  if (credentialIdLength !== null && credentialIdLength > KEY_WRAPPING_ID_THRESHOLD_BYTES) {
    return "key-wrapped";
  }
  return "unknown";
}

/** Decodes and judges the registration half. Touches `crypto.subtle.digest`. */
export async function analyzeRegistration(input: CeremonyInput): Promise<RegistrationAnalysis> {
  const { registration, expected } = input;

  const attestation = asCborMap(decodeCbor(registration.attestationObject));
  const fmt = attestation.get("fmt");
  const authDataBytes = asCborBytes(attestation.get("authData"), "attestationObject.authData");
  const authData = parseAuthData(authDataBytes);
  const clientData = parseClientData(registration.clientDataJSON);

  const rpIdHashExpected = await sha256(new TextEncoder().encode(expected.rpId));
  const attested = authData.attestedCredentialData;
  const cose = attested ? parseCoseKey(attested.coseKey) : null;
  const attStmt = readAttStmt(attestation.get("attStmt"));

  return {
    clientData,
    clientDataByteLength: registration.clientDataJSON.length,
    challengeSent: toBase64Url(registration.challenge),
    challengeByteLength: registration.challenge.length,
    isChallengeEchoed: toBase64Url(registration.challenge) === clientData.challenge,
    isOriginExpected: clientData.origin === expected.origin,
    attestationObjectByteLength: registration.attestationObject.length,
    fmt: typeof fmt === "string" ? fmt : String(fmt),
    attStmt,
    hasAttestationStatement: attStmt.length > 0,
    authDataBytes,
    authData,
    isRpIdHashExpected: bytesEqual(authData.rpIdHash, rpIdHashExpected),
    aaguid: attested ? resolveAaguid(attested.aaguid) : null,
    credentialId: attested?.credentialId ?? null,
    credentialIdLength: attested?.credentialIdLength ?? null,
    doesCredentialIdMatchRawId:
      attested && registration.rawId ? bytesEqual(attested.credentialId, registration.rawId) : null,
    cose,
    coseKeyByteLength: attested?.coseKeyBytes.length ?? null,
    extensionsSummary: summariseExtensions(authData.extensions),
  };
}

/** Decodes the assertion half and verifies it. Touches `crypto.subtle.verify`. */
export async function analyzeAssertion(
  input: CeremonyInput,
  cose: ParsedCoseKey,
): Promise<AssertionAnalysis> {
  const { assertion, expected } = input;

  const authData = parseAuthData(assertion.authenticatorData);
  const clientData = parseClientData(assertion.clientDataJSON);
  const challengeSent = toBase64Url(assertion.challenge);

  const verification = await verifyAssertionSignature({
    cose,
    signature: assertion.signature,
    authenticatorData: assertion.authenticatorData,
    clientDataJSON: assertion.clientDataJSON,
  });

  return {
    clientData,
    challengeSent,
    challengeByteLength: assertion.challenge.length,
    isChallengeEchoed: challengeSent === clientData.challenge,
    isOriginExpected: clientData.origin === expected.origin,
    authData,
    signature: assertion.signature,
    verification,
  };
}

/**
 * One code path for both a live ceremony and the captured sample.
 *
 * @throws whatever the parsers throw — the UI catches and explains it rather
 * than rendering a half-parsed ceremony.
 */
export async function analyzeCeremony(input: CeremonyInput): Promise<CeremonyAnalysis> {
  const registration = await analyzeRegistration(input);
  const assertion = registration.cose ? await analyzeAssertion(input, registration.cose) : null;

  return {
    input,
    registration,
    assertion,
    persistence: judgePersistence(registration.authData, registration.credentialIdLength),
  };
}
