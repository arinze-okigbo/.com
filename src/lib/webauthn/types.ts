/**
 * Shared types for the WebAuthn ceremony demonstration.
 *
 * Every module under `@/lib/webauthn` is a pure, side-effect-free parser over
 * bytes, with two deliberate exceptions that are named as such: `verify.ts`
 * (calls WebCrypto) and `run-ceremony.ts` (calls the WebAuthn API). Nothing
 * here touches the DOM, the network or storage.
 */

/**
 * A byte string backed by a real `ArrayBuffer`.
 *
 * Named so that values handed to WebCrypto satisfy `BufferSource` under
 * TypeScript 5.7's generic `Uint8Array<TArrayBuffer>`; a bare `Uint8Array`
 * widens to `ArrayBufferLike`, which `SubtleCrypto` refuses.
 */
export type Bytes = Uint8Array<ArrayBuffer>;

/** A CBOR tagged item (major type 6). WebAuthn itself uses none, but the
 *  decoder must not silently drop one if an authenticator emits it. */
export interface CborTagged {
  readonly tag: number;
  readonly value: CborValue;
}

/**
 * Every value the CTAP2 CBOR profile can produce.
 *
 * Maps stay `Map`, never plain objects: COSE keys are keyed by *negative
 * integers*, which an object cannot represent without lossy stringification.
 */
export type CborValue =
  | number
  | string
  | boolean
  | null
  | undefined
  | Uint8Array
  | readonly CborValue[]
  | Map<CborValue, CborValue>
  | CborTagged;

/** One decoded item plus the cursor position after it. The position is the
 *  point: `authData` locates the end of the COSE key by consumption. */
export interface CborDecoded<TValue extends CborValue = CborValue> {
  readonly value: TValue;
  readonly pos: number;
}

/** One of the eight bits of `authData`'s flags byte. */
export interface AuthDataFlag {
  readonly bit: number;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly isSet: boolean;
}

/** `authData`'s attested credential data — present only when the AT bit is set. */
export interface AttestedCredentialData {
  readonly aaguid: Bytes;
  readonly credentialIdLength: number;
  readonly credentialId: Bytes;
  /** The exact CBOR slice the COSE key occupies, for the byte view. */
  readonly coseKeyBytes: Bytes;
  readonly coseKey: CborValue;
}

/** A fully decomposed `authenticatorData` structure. */
export interface ParsedAuthData {
  readonly raw: Bytes;
  readonly rpIdHash: Bytes;
  readonly flagsByte: number;
  readonly flags: readonly AuthDataFlag[];
  readonly signCount: number;
  readonly attestedCredentialData: AttestedCredentialData | null;
  readonly extensions: CborValue | null;
  readonly trailingBytes: number;
}

/** COSE algorithm identifier, described. */
export interface CoseAlgorithmInfo {
  readonly name: string;
  readonly detail: string;
}

/** A parsed COSE_Key (RFC 8152 §7). */
export interface ParsedCoseKey {
  readonly kty: number;
  readonly ktyName: string;
  readonly alg: number;
  readonly algInfo: CoseAlgorithmInfo;
  readonly crv: number | null;
  readonly crvName: string | null;
  /** EC2 affine x / OKP public key. */
  readonly x: Bytes | null;
  /** EC2 affine y. */
  readonly y: Bytes | null;
  /** RSA modulus. */
  readonly n: Bytes | null;
  /** RSA public exponent. */
  readonly e: Bytes | null;
  readonly modulusBits: number | null;
}

/** The browser's own account of the ceremony. */
export interface ParsedClientData {
  readonly text: string;
  readonly type: string;
  readonly challenge: string;
  readonly origin: string;
  readonly crossOrigin: boolean | null;
}

/** AAGUID resolution against the compiled-in table. */
export interface AaguidResolution {
  readonly uuid: string;
  readonly name: string;
  readonly isKnown: boolean;
}

/** Where a ceremony's bytes came from. Never inferred — always carried. */
export type CeremonyMode = "live" | "sample";

/** A three-state verdict. `warn` means "explainable", not "broken". */
export type VerdictTone = "ok" | "warn" | "fail" | "info";

/** The registration half of a ceremony, as raw bytes. */
export interface RegistrationBytes {
  readonly challenge: Bytes;
  readonly rawId: Bytes | null;
  readonly attestationObject: Bytes;
  readonly clientDataJSON: Bytes;
  readonly authenticatorAttachment: string | null;
  readonly transports: readonly string[] | null;
}

/** The assertion half of a ceremony, as raw bytes. */
export interface AssertionBytes {
  readonly challenge: Bytes;
  readonly authenticatorData: Bytes;
  readonly clientDataJSON: Bytes;
  readonly signature: Bytes;
  readonly userHandle: Bytes | null;
}

/** What the relying party expected — the values every verdict is measured against. */
export interface CeremonyExpectation {
  readonly origin: string;
  readonly rpId: string;
}

/** Provenance shown above a replayed sample. */
export interface SampleProvenance {
  readonly capturedAt: string;
  readonly authenticator: string;
  readonly origin: string;
  readonly rpId: string;
}

/** One complete ceremony's inputs, live or captured — one shape, one code path. */
export interface CeremonyInput {
  readonly mode: CeremonyMode;
  readonly expected: CeremonyExpectation;
  readonly registration: RegistrationBytes;
  readonly assertion: AssertionBytes;
  readonly provenance: SampleProvenance | null;
  /** `create()` round trip, milliseconds. Absent for a replayed sample. */
  readonly registrationMs: number | null;
  readonly assertionMs: number | null;
}
