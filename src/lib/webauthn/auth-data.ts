import { decodeCborItem } from "./cbor";
import type { AttestedCredentialData, AuthDataFlag, Bytes, ParsedAuthData } from "./types";

/**
 * `authenticatorData` — a packed binary structure, not JSON.
 *
 * Offsets 0–36 are fixed by the spec. Everything after byte 36 is conditional
 * on the flag bits, which is why the AT branch has to consume the embedded CBOR
 * to find where it ends.
 */

/** Raised when `authData` is malformed or its declared lengths overrun. */
export class AuthDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthDataError";
  }
}

/** 32 bytes RP ID hash + 1 byte flags + 4 bytes counter. */
export const AUTH_DATA_HEADER_BYTES = 37;
export const RP_ID_HASH_BYTES = 32;
export const AAGUID_BYTES = 16;

export const FLAG_AT = 0x40;
export const FLAG_ED = 0x80;

/** The eight bits, in bit order, each with what it actually means. */
export const AUTH_DATA_FLAG_DEFINITIONS: readonly Omit<AuthDataFlag, "isSet">[] = [
  {
    bit: 0,
    code: "UP",
    name: "User Present",
    description: "A human touched or interacted with the authenticator.",
  },
  {
    bit: 1,
    code: "RFU1",
    name: "Reserved",
    description: "Reserved for future use. Must be zero.",
  },
  {
    bit: 2,
    code: "UV",
    name: "User Verified",
    description: "The user was verified — biometric, PIN or password — not merely present.",
  },
  {
    bit: 3,
    code: "BE",
    name: "Backup Eligible",
    description: "This credential may be synced or exported to another device.",
  },
  {
    bit: 4,
    code: "BS",
    name: "Backup State",
    description: "This credential currently is backed up / synced.",
  },
  {
    bit: 5,
    code: "RFU2",
    name: "Reserved",
    description: "Reserved for future use. Must be zero.",
  },
  {
    bit: 6,
    code: "AT",
    name: "Attested Credential Data",
    description: "AAGUID, credential ID and public key are appended below. Set on registration.",
  },
  {
    bit: 7,
    code: "ED",
    name: "Extension Data",
    description: "A CBOR map of authenticator extension outputs is appended.",
  },
];

function sliceBytes(source: Uint8Array, start: number, end: number): Bytes {
  const out = new Uint8Array(new ArrayBuffer(end - start));
  out.set(source.subarray(start, end), 0);
  return out;
}

function decodeFlags(flagsByte: number): readonly AuthDataFlag[] {
  return AUTH_DATA_FLAG_DEFINITIONS.map((flag) => ({
    ...flag,
    isSet: Boolean(flagsByte & (1 << flag.bit)),
  }));
}

/** Reads the attested credential data that follows the 37-byte header. */
function parseAttestedCredentialData(
  authData: Uint8Array,
  view: DataView,
  start: number,
): { readonly data: AttestedCredentialData; readonly pos: number } {
  if (authData.length < start + AAGUID_BYTES + 2) {
    throw new AuthDataError(
      "the AT flag is set but authData is too short to hold attested credential data",
    );
  }

  const aaguid = sliceBytes(authData, start, start + AAGUID_BYTES);
  const lengthOffset = start + AAGUID_BYTES;
  const credentialIdLength = view.getUint16(lengthOffset);
  const idOffset = lengthOffset + 2;

  if (authData.length < idOffset + credentialIdLength) {
    throw new AuthDataError(
      `the declared credential ID length (${credentialIdLength}) overruns authData`,
    );
  }

  const credentialId = sliceBytes(authData, idOffset, idOffset + credentialIdLength);
  const coseStart = idOffset + credentialIdLength;
  const cose = decodeCborItem(authData, coseStart);

  return {
    data: {
      aaguid,
      credentialIdLength,
      credentialId,
      coseKeyBytes: sliceBytes(authData, coseStart, cose.pos),
      coseKey: cose.value,
    },
    pos: cose.pos,
  };
}

/**
 * Decomposes `authenticatorData` into every field the spec defines.
 *
 * @throws {AuthDataError} when the structure is too short or self-inconsistent.
 */
export function parseAuthData(authData: Uint8Array): ParsedAuthData {
  if (authData.length < AUTH_DATA_HEADER_BYTES) {
    throw new AuthDataError(
      `authData is ${authData.length} bytes; the header alone needs ${AUTH_DATA_HEADER_BYTES}`,
    );
  }

  const view = new DataView(authData.buffer, authData.byteOffset, authData.byteLength);
  const flagsByte = authData[RP_ID_HASH_BYTES];

  let pos = AUTH_DATA_HEADER_BYTES;
  let attestedCredentialData: AttestedCredentialData | null = null;

  if (flagsByte & FLAG_AT) {
    const attested = parseAttestedCredentialData(authData, view, pos);
    attestedCredentialData = attested.data;
    pos = attested.pos;
  }

  let extensions = null;
  if (flagsByte & FLAG_ED) {
    const decoded = decodeCborItem(authData, pos);
    extensions = decoded.value;
    pos = decoded.pos;
  }

  return {
    raw: sliceBytes(authData, 0, authData.length),
    rpIdHash: sliceBytes(authData, 0, RP_ID_HASH_BYTES),
    flagsByte,
    flags: decodeFlags(flagsByte),
    signCount: view.getUint32(RP_ID_HASH_BYTES + 1),
    attestedCredentialData,
    extensions,
    trailingBytes: authData.length - pos,
  };
}

/** Looks one flag up by its spec code. Returns `false` for an unknown code. */
export function isFlagSet(flags: readonly AuthDataFlag[], code: string): boolean {
  return flags.find((flag) => flag.code === code)?.isSet ?? false;
}
