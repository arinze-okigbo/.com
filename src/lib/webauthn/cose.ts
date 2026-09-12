import { CborError, asCborBytes } from "./cbor";
import type { Bytes, CborValue, CoseAlgorithmInfo, ParsedCoseKey } from "./types";

/**
 * COSE_Key parsing — RFC 8152 §7.
 *
 * Labels are integers: 1 = kty, 3 = alg, then key-type-specific negatives.
 * That is why the CBOR decoder returns `Map` rather than a plain object.
 */

/** Raised when a COSE key is absent, malformed, or of an unsupported type. */
export class CoseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoseError";
  }
}

export const COSE_KTY_OKP = 1;
export const COSE_KTY_EC2 = 2;
export const COSE_KTY_RSA = 3;

export const COSE_CRV_P256 = 1;

export const ALG_ES256 = -7;
export const ALG_EDDSA = -8;
export const ALG_RS256 = -257;

const LABEL_KTY = 1;
const LABEL_ALG = 3;
const LABEL_CRV = -1;
const LABEL_X = -2;
const LABEL_Y = -3;
const LABEL_RSA_N = -1;
const LABEL_RSA_E = -2;

const COSE_KEY_TYPES: Readonly<Record<number, string>> = {
  [COSE_KTY_OKP]: "OKP (Octet Key Pair)",
  [COSE_KTY_EC2]: "EC2 (two-coordinate elliptic curve)",
  [COSE_KTY_RSA]: "RSA",
};

const COSE_CURVES: Readonly<Record<number, string>> = {
  1: "P-256 (secp256r1 / prime256v1)",
  2: "P-384",
  3: "P-521",
  6: "Ed25519",
};

const COSE_ALGORITHMS: Readonly<Record<number, CoseAlgorithmInfo>> = {
  [-7]: { name: "ES256", detail: "ECDSA over P-256 with SHA-256" },
  [-8]: { name: "EdDSA", detail: "Ed25519" },
  [-35]: { name: "ES384", detail: "ECDSA over P-384 with SHA-384" },
  [-36]: { name: "ES512", detail: "ECDSA over P-521 with SHA-512" },
  [-37]: { name: "PS256", detail: "RSASSA-PSS with SHA-256" },
  [-257]: { name: "RS256", detail: "RSASSA-PKCS1-v1_5 with SHA-256" },
  [-259]: { name: "RS512", detail: "RSASSA-PKCS1-v1_5 with SHA-512" },
};

/** Names a COSE algorithm identifier, or says plainly that it is unrecognised. */
export function describeAlgorithm(alg: number): CoseAlgorithmInfo {
  return (
    COSE_ALGORITHMS[alg] ?? {
      name: `alg ${alg}`,
      detail: "Unrecognised COSE algorithm identifier.",
    }
  );
}

function readNumber(map: Map<CborValue, CborValue>, label: number, what: string): number {
  const value = map.get(label);
  if (typeof value !== "number") throw new CoseError(`COSE key is missing its ${what}`);
  return value;
}

/** Reads a byte-string label, reporting a miss as a COSE fault, not a CBOR one. */
function readBytes(map: Map<CborValue, CborValue>, label: number, what: string): Bytes {
  try {
    return asCborBytes(map.get(label), what);
  } catch (cause) {
    if (cause instanceof CborError) throw new CoseError(`COSE key is missing ${what}`);
    throw cause;
  }
}

interface CurveFields {
  readonly crv: number;
  readonly crvName: string;
}

function readCurve(map: Map<CborValue, CborValue>): CurveFields {
  const crv = readNumber(map, LABEL_CRV, "curve identifier");
  return { crv, crvName: COSE_CURVES[crv] ?? `crv ${crv}` };
}

/**
 * Parses a decoded COSE_Key map into named fields.
 *
 * @throws {CoseError} for a non-map, a missing coordinate, or an unsupported
 * key type — each of which the UI reports rather than swallows.
 */
export function parseCoseKey(coseKey: CborValue): ParsedCoseKey {
  if (!(coseKey instanceof Map)) throw new CoseError("the COSE key is not a CBOR map");

  const kty = readNumber(coseKey, LABEL_KTY, "key type (label 1)");
  const alg = readNumber(coseKey, LABEL_ALG, "algorithm (label 3)");

  const base = {
    kty,
    ktyName: COSE_KEY_TYPES[kty] ?? `kty ${kty}`,
    alg,
    algInfo: describeAlgorithm(alg),
    crv: null,
    crvName: null,
    x: null,
    y: null,
    n: null,
    e: null,
    modulusBits: null,
  } as const satisfies ParsedCoseKey;

  if (kty === COSE_KTY_EC2) {
    const curve = readCurve(coseKey);
    return {
      ...base,
      ...curve,
      x: readBytes(coseKey, LABEL_X, "the EC2 x coordinate (label -2)"),
      y: readBytes(coseKey, LABEL_Y, "the EC2 y coordinate (label -3)"),
    };
  }

  if (kty === COSE_KTY_RSA) {
    const n: Bytes = readBytes(coseKey, LABEL_RSA_N, "the RSA modulus (label -1)");
    return {
      ...base,
      n,
      e: readBytes(coseKey, LABEL_RSA_E, "the RSA exponent (label -2)"),
      modulusBits: n.length * 8,
    };
  }

  if (kty === COSE_KTY_OKP) {
    return {
      ...base,
      ...readCurve(coseKey),
      x: readBytes(coseKey, LABEL_X, "the OKP public key (label -2)"),
    };
  }

  throw new CoseError(`unsupported COSE key type: kty=${kty}`);
}
