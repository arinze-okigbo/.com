import type { Bytes, CborDecoded, CborValue } from "./types";

/**
 * A CBOR decoder, hand-written, for the profile WebAuthn actually uses.
 *
 * RFC 8949 restricted to CTAP2 canonical CBOR: definite-length items only.
 * Every decode returns the cursor position after the item, because `authData`
 * needs exactly that — it is the only way to find where the embedded COSE key
 * ends and the extension map begins.
 *
 * No dependency is added for this on purpose. A general-purpose CBOR library is
 * one to two orders of magnitude larger than the subset below.
 */

/** Raised on any malformed or out-of-profile CBOR. */
export class CborError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CborError";
  }
}

const TEXT_DECODER = new TextDecoder("utf-8", { fatal: false });

const MAJOR_UNSIGNED = 0;
const MAJOR_NEGATIVE = 1;
const MAJOR_BYTE_STRING = 2;
const MAJOR_TEXT_STRING = 3;
const MAJOR_ARRAY = 4;
const MAJOR_MAP = 5;
const MAJOR_TAG = 6;
const MAJOR_SIMPLE = 7;

const INFO_UINT8 = 24;
const INFO_UINT16 = 25;
const INFO_UINT32 = 26;
const INFO_UINT64 = 27;

const SIMPLE_FALSE = 20;
const SIMPLE_TRUE = 21;
const SIMPLE_NULL = 22;
const SIMPLE_UNDEFINED = 23;

interface Argument {
  readonly value: number;
  readonly pos: number;
}

function viewOf(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function requireBytes(bytes: Uint8Array, end: number, what: string): void {
  if (end > bytes.length) {
    throw new CborError(`CBOR: ${what} runs past the end of the input`);
  }
}

/** Reads the item's argument — inline for info < 24, else 1/2/4/8 following bytes. */
function readArgument(bytes: Uint8Array, pos: number, info: number): Argument {
  if (info < INFO_UINT8) return { value: info, pos };

  const view = viewOf(bytes);
  if (info === INFO_UINT8) {
    requireBytes(bytes, pos + 1, "a 1-byte argument");
    return { value: view.getUint8(pos), pos: pos + 1 };
  }
  if (info === INFO_UINT16) {
    requireBytes(bytes, pos + 2, "a 2-byte argument");
    return { value: view.getUint16(pos), pos: pos + 2 };
  }
  if (info === INFO_UINT32) {
    requireBytes(bytes, pos + 4, "a 4-byte argument");
    return { value: view.getUint32(pos), pos: pos + 4 };
  }
  if (info === INFO_UINT64) {
    requireBytes(bytes, pos + 8, "an 8-byte argument");
    // Read as BigInt so the high word is not lost, then narrow: no WebAuthn
    // structure is anywhere near 2^53 bytes, and Number keeps arithmetic honest.
    const wide = view.getBigUint64(pos);
    if (wide > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new CborError("CBOR: 64-bit argument exceeds the safe integer range");
    }
    return { value: Number(wide), pos: pos + 8 };
  }

  throw new CborError(
    `CBOR: additional info ${info} (indefinite length or reserved) is not valid CTAP2 CBOR`,
  );
}

/** IEEE 754 binary16. `DataView` has no `getFloat16` in the supported targets. */
export function decodeFloat16(raw: number): number {
  const exponent = (raw & 0x7c00) >> 10;
  const fraction = raw & 0x03ff;
  const sign = raw & 0x8000 ? -1 : 1;
  if (exponent === 0) return sign * Math.pow(2, -14) * (fraction / 1024);
  if (exponent === 0x1f) return fraction ? Number.NaN : sign * Number.POSITIVE_INFINITY;
  return sign * Math.pow(2, exponent - 15) * (1 + fraction / 1024);
}

function decodeSimple(bytes: Uint8Array, pos: number, info: number): CborDecoded {
  if (info === SIMPLE_FALSE) return { value: false, pos };
  if (info === SIMPLE_TRUE) return { value: true, pos };
  if (info === SIMPLE_NULL) return { value: null, pos };
  if (info === SIMPLE_UNDEFINED) return { value: undefined, pos };

  const view = viewOf(bytes);
  if (info === INFO_UINT16) {
    requireBytes(bytes, pos + 2, "a half-precision float");
    return { value: decodeFloat16(view.getUint16(pos)), pos: pos + 2 };
  }
  if (info === INFO_UINT32) {
    requireBytes(bytes, pos + 4, "a single-precision float");
    return { value: view.getFloat32(pos), pos: pos + 4 };
  }
  if (info === INFO_UINT64) {
    requireBytes(bytes, pos + 8, "a double-precision float");
    return { value: view.getFloat64(pos), pos: pos + 8 };
  }
  throw new CborError(`CBOR: unsupported simple value ${info}`);
}

/**
 * Decodes exactly one item starting at `start`.
 *
 * @returns the value and the offset of the first byte after it.
 */
export function decodeCborItem(bytes: Uint8Array, start: number): CborDecoded {
  if (start >= bytes.length) throw new CborError(`CBOR: truncated input at offset ${start}`);

  const initial = bytes[start];
  const major = initial >> 5;
  const info = initial & 0x1f;

  if (major === MAJOR_SIMPLE) return decodeSimple(bytes, start + 1, info);

  const argument = readArgument(bytes, start + 1, info);
  let pos = argument.pos;

  if (major === MAJOR_UNSIGNED) return { value: argument.value, pos };
  if (major === MAJOR_NEGATIVE) return { value: -1 - argument.value, pos };

  if (major === MAJOR_BYTE_STRING || major === MAJOR_TEXT_STRING) {
    const end = pos + argument.value;
    requireBytes(bytes, end, "a string length");
    const slice = bytes.subarray(pos, end);
    return {
      value: major === MAJOR_BYTE_STRING ? slice : TEXT_DECODER.decode(slice),
      pos: end,
    };
  }

  if (major === MAJOR_ARRAY) {
    const items: CborValue[] = [];
    for (let index = 0; index < argument.value; index += 1) {
      const item = decodeCborItem(bytes, pos);
      items.push(item.value);
      pos = item.pos;
    }
    return { value: items, pos };
  }

  if (major === MAJOR_MAP) {
    // A Map, not an object: COSE labels are negative integers.
    const map = new Map<CborValue, CborValue>();
    for (let index = 0; index < argument.value; index += 1) {
      const key = decodeCborItem(bytes, pos);
      const value = decodeCborItem(bytes, key.pos);
      map.set(key.value, value.value);
      pos = value.pos;
    }
    return { value: map, pos };
  }

  if (major === MAJOR_TAG) {
    const tagged = decodeCborItem(bytes, pos);
    return { value: { tag: argument.value, value: tagged.value }, pos: tagged.pos };
  }

  throw new CborError(`CBOR: unreachable major type ${major}`);
}

/** Decodes the single item a buffer holds, ignoring nothing silently. */
export function decodeCbor(bytes: Uint8Array): CborValue {
  return decodeCborItem(bytes, 0).value;
}

/** Narrowing helper — the attestation object and COSE keys are both maps. */
export function asCborMap(value: CborValue): Map<CborValue, CborValue> {
  if (!(value instanceof Map)) throw new CborError("CBOR: expected a map");
  return value;
}

/** Narrowing helper for byte strings, with the label named in the message. */
export function asCborBytes(value: CborValue, label: string): Bytes {
  if (!(value instanceof Uint8Array)) throw new CborError(`CBOR: ${label} is not a byte string`);
  // Copy so the result is ArrayBuffer-backed and independent of the source view.
  const out = new Uint8Array(new ArrayBuffer(value.length));
  out.set(value, 0);
  return out;
}

/** A one-line human description of any CBOR value, for attStmt and extensions. */
export function describeCborValue(value: CborValue): string {
  if (value instanceof Uint8Array) return `${value.length} bytes`;
  if (Array.isArray(value)) return `array of ${value.length}`;
  if (value instanceof Map) return `map with ${value.size} entries`;
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "object" && "tag" in value) return `tag ${value.tag}`;
  return String(value);
}
