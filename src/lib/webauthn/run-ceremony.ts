import { randomBytes, toBytes } from "./bytes";
import { ALG_ES256, ALG_RS256 } from "./cose";
import type { AssertionBytes, Bytes, CeremonyInput, RegistrationBytes } from "./types";

/**
 * The live ceremony driver.
 *
 * The one module that calls `navigator.credentials`. It is invoked from a click
 * handler and from nowhere else — no autofill, no conditional mediation, no
 * effect on mount — which is what makes "nothing prompts until you ask" a
 * property of the code rather than a promise in the copy.
 *
 * Nothing here writes to storage and nothing here opens a network connection.
 * The returned object is handed straight to the parsers and then dropped.
 */

/** The ceremony's own timeout. The cancel button exists so nobody waits it out. */
export const CEREMONY_TIMEOUT_MS = 60_000;

export const CHALLENGE_BYTES = 32;
export const USER_HANDLE_BYTES = 32;

/** Which authenticators the visitor allowed the browser to offer. */
export type AuthenticatorAttachmentChoice = "platform" | "any";

/** Raised when the API resolves with nothing, which the types permit. */
export class CeremonyAbandonedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CeremonyAbandonedError";
  }
}

export interface RunCeremonyOptions {
  readonly attachment: AuthenticatorAttachmentChoice;
  readonly signal: AbortSignal;
  /** Reports progress between the two prompts, for the live region. */
  readonly onRegistered?: () => void;
  /** Identifies the relying party in the authenticator's own UI. */
  readonly relyingPartyName: string;
  /** The user handle's `name` / `displayName`. Never personal data. */
  readonly userLabel: string;
  readonly userDisplayName: string;
}

function buildCreationOptions(
  options: RunCeremonyOptions,
  challenge: Bytes,
  userId: Bytes,
): PublicKeyCredentialCreationOptions {
  const authenticatorSelection: AuthenticatorSelectionCriteria = {
    // Non-discoverable: on most authenticators the private key is wrapped into
    // the credential ID itself and no entry is kept on the device.
    residentKey: "discouraged",
    requireResidentKey: false,
    userVerification: "preferred",
    ...(options.attachment === "platform" ? { authenticatorAttachment: "platform" as const } : {}),
  };

  return {
    // `rp.id` is deliberately omitted: the browser defaults it to this origin's
    // effective domain, so the section is portable between localhost and
    // production without an environment-specific constant.
    rp: { name: options.relyingPartyName },
    user: { id: userId, name: options.userLabel, displayName: options.userDisplayName },
    challenge,
    pubKeyCredParams: [
      { type: "public-key", alg: ALG_ES256 },
      { type: "public-key", alg: ALG_RS256 },
    ],
    timeout: CEREMONY_TIMEOUT_MS,
    attestation: "direct",
    excludeCredentials: [],
    authenticatorSelection,
  };
}

function readRegistration(credential: PublicKeyCredential, challenge: Bytes): RegistrationBytes {
  const response = credential.response;
  if (!(response instanceof AuthenticatorAttestationResponse)) {
    throw new CeremonyAbandonedError("create() returned something that is not an attestation");
  }
  const transports = typeof response.getTransports === "function" ? response.getTransports() : null;

  return {
    challenge: toBytes(challenge),
    rawId: toBytes(credential.rawId),
    attestationObject: toBytes(response.attestationObject),
    clientDataJSON: toBytes(response.clientDataJSON),
    authenticatorAttachment: credential.authenticatorAttachment ?? null,
    transports: transports && transports.length > 0 ? transports : null,
  };
}

function readAssertion(credential: PublicKeyCredential, challenge: Bytes): AssertionBytes {
  const response = credential.response;
  if (!(response instanceof AuthenticatorAssertionResponse)) {
    throw new CeremonyAbandonedError("get() returned something that is not an assertion");
  }

  return {
    challenge: toBytes(challenge),
    authenticatorData: toBytes(response.authenticatorData),
    clientDataJSON: toBytes(response.clientDataJSON),
    signature: toBytes(response.signature),
    userHandle: response.userHandle ? toBytes(response.userHandle) : null,
  };
}

/**
 * Registers a credential, then asks it to sign a fresh challenge.
 *
 * @throws {DOMException} straight from the WebAuthn API — cancel, timeout,
 * insecure context and every other failure is reported by name, not swallowed.
 */
export async function runLiveCeremony(options: RunCeremonyOptions): Promise<CeremonyInput> {
  // Synchronous on purpose up to the first await: Safari ties create() to the
  // user activation of the click, and an intervening await can lose it.
  const challenge = randomBytes(CHALLENGE_BYTES);
  const userId = randomBytes(USER_HANDLE_BYTES);
  const expected = { origin: window.location.origin, rpId: window.location.hostname };

  const startedAt = performance.now();
  const created = await navigator.credentials.create({
    publicKey: buildCreationOptions(options, challenge, userId),
    signal: options.signal,
  });
  const registrationMs = performance.now() - startedAt;

  if (!(created instanceof PublicKeyCredential)) {
    throw new CeremonyAbandonedError("navigator.credentials.create() resolved with no credential");
  }
  const registration = readRegistration(created, challenge);
  options.onRegistered?.();

  const assertionChallenge = randomBytes(CHALLENGE_BYTES);
  const assertionStartedAt = performance.now();
  const asserted = await navigator.credentials.get({
    signal: options.signal,
    publicKey: {
      challenge: assertionChallenge,
      timeout: CEREMONY_TIMEOUT_MS,
      allowCredentials: [
        {
          type: "public-key",
          id: created.rawId,
          ...(registration.transports
            ? { transports: registration.transports as AuthenticatorTransport[] }
            : {}),
        },
      ],
      userVerification: "preferred",
    },
  });
  const assertionMs = performance.now() - assertionStartedAt;

  if (!(asserted instanceof PublicKeyCredential)) {
    throw new CeremonyAbandonedError("navigator.credentials.get() resolved with no assertion");
  }

  return {
    mode: "live",
    expected,
    provenance: null,
    registration,
    assertion: readAssertion(asserted, assertionChallenge),
    registrationMs,
    assertionMs,
  };
}
