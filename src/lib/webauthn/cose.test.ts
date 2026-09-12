import { describe, expect, it } from "vitest";

import { CoseError, describeAlgorithm, parseCoseKey } from "./cose";
import type { CborValue } from "./types";

const ec2Key = (): Map<CborValue, CborValue> =>
  new Map<CborValue, CborValue>([
    [1, 2],
    [3, -7],
    [-1, 1],
    [-2, new Uint8Array(32)],
    [-3, new Uint8Array(32)],
  ]);

describe("describeAlgorithm", () => {
  it("names the algorithms WebAuthn actually negotiates", () => {
    expect(describeAlgorithm(-7).name).toBe("ES256");
    expect(describeAlgorithm(-257).name).toBe("RS256");
    expect(describeAlgorithm(-8).name).toBe("EdDSA");
  });

  it("says plainly that an identifier is unrecognised rather than guessing", () => {
    const info = describeAlgorithm(-9999);

    expect(info.name).toBe("alg -9999");
    expect(info.detail).toMatch(/Unrecognised/);
  });
});

describe("parseCoseKey — EC2", () => {
  it("reads kty, alg, curve and both coordinates from the integer labels", () => {
    const parsed = parseCoseKey(ec2Key());

    expect(parsed.kty).toBe(2);
    expect(parsed.alg).toBe(-7);
    expect(parsed.crv).toBe(1);
    expect(parsed.crvName).toMatch(/P-256/);
    expect(parsed.x?.length).toBe(32);
    expect(parsed.y?.length).toBe(32);
  });

  it("throws when a coordinate is missing, rather than importing a half key", () => {
    const missingY = ec2Key();
    missingY.delete(-3);

    expect(() => parseCoseKey(missingY)).toThrow(CoseError);
  });
});

describe("parseCoseKey — RSA", () => {
  it("derives the modulus size from the modulus length", () => {
    const rsa = new Map<CborValue, CborValue>([
      [1, 3],
      [3, -257],
      [-1, new Uint8Array(256)],
      [-2, new Uint8Array([0x01, 0x00, 0x01])],
    ]);

    const parsed = parseCoseKey(rsa);

    expect(parsed.modulusBits).toBe(2048);
    expect(parsed.e?.length).toBe(3);
  });
});

describe("parseCoseKey — rejections", () => {
  it("rejects a value that is not a CBOR map", () => {
    expect(() => parseCoseKey(42)).toThrow(/not a CBOR map/);
  });

  it("rejects a key with no kty", () => {
    expect(() => parseCoseKey(new Map<CborValue, CborValue>([[3, -7]]))).toThrow(/key type/);
  });

  it("names an unsupported key type instead of returning an empty key", () => {
    const unsupported = new Map<CborValue, CborValue>([
      [1, 9],
      [3, -7],
    ]);

    expect(() => parseCoseKey(unsupported)).toThrow(/unsupported COSE key type: kty=9/);
  });
});
