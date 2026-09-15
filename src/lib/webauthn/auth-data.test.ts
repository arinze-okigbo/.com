import { describe, expect, it } from "vitest";

import { AuthDataError, isFlagSet, parseAuthData } from "./auth-data";
import { fromBase64Url } from "./bytes";
import { SAMPLE_CEREMONY_BASE64URL } from "./sample";

/** The captured assertion's authData: header only, no attested credential data. */
const assertionAuthData = fromBase64Url(SAMPLE_CEREMONY_BASE64URL.assertion.authenticatorData);

/** Builds a 37-byte header with the given flags and counter, and nothing after it. */
function header(flagsByte: number, signCount: number): Uint8Array {
  const out = new Uint8Array(new ArrayBuffer(37));
  out[32] = flagsByte;
  new DataView(out.buffer).setUint32(33, signCount);
  return out;
}

describe("parseAuthData — the fixed 37-byte header", () => {
  it("splits the RP ID hash, flags byte and big-endian counter", () => {
    const parsed = parseAuthData(header(0x01, 0x01020304));

    expect(parsed.rpIdHash.length).toBe(32);
    expect(parsed.flagsByte).toBe(0x01);
    expect(parsed.signCount).toBe(16909060);
  });

  it("reads a counter above 2^31 without sign extension", () => {
    expect(parseAuthData(header(0x01, 0xffffffff)).signCount).toBe(4294967295);
  });

  it("refuses a buffer shorter than the header", () => {
    expect(() => parseAuthData(new Uint8Array(36))).toThrow(AuthDataError);
  });

  it("reports no attested credential data when the AT bit is clear", () => {
    const parsed = parseAuthData(assertionAuthData);

    expect(parsed.attestedCredentialData).toBeNull();
    expect(parsed.trailingBytes).toBe(0);
  });
});

/**
 * A complete authData with every flag bit set: header, attested credential
 * data with a real EC2 COSE key, and an extension map after it. Building the
 * whole structure is the only way to exercise AT and ED together.
 */
function fullAuthData(): Uint8Array {
  const coseKey = [
    0xa5,
    0x01,
    0x02,
    0x03,
    0x26,
    0x20,
    0x01,
    0x21,
    0x58,
    0x20,
    ...new Array<number>(32).fill(0x11),
    0x22,
    0x58,
    0x20,
    ...new Array<number>(32).fill(0x22),
  ];
  const attested = [
    ...new Array<number>(16).fill(0xab), // AAGUID
    0x00,
    0x02, // credentialIdLength
    0x0a,
    0x0b, // credentialId
    ...coseKey,
  ];
  const extensions = [0xa0]; // an empty CBOR map

  const head = header(0xff, 7);
  const out = new Uint8Array(new ArrayBuffer(head.length + attested.length + extensions.length));
  out.set(head, 0);
  out.set(attested, head.length);
  out.set(extensions, head.length + attested.length);
  return out;
}

describe("parseAuthData — the eight flag bits", () => {
  it("decodes all eight bits in bit order", () => {
    const parsed = parseAuthData(fullAuthData());

    expect(parsed.flags.map((flag) => flag.code)).toEqual([
      "UP",
      "RFU1",
      "UV",
      "BE",
      "BS",
      "RFU2",
      "AT",
      "ED",
    ]);
    expect(parsed.flags.every((flag) => flag.isSet)).toBe(true);
  });

  it("reports every bit clear for a zero flags byte", () => {
    expect(parseAuthData(header(0x00, 0)).flags.some((flag) => flag.isSet)).toBe(false);
  });

  it("decodes the captured assertion's 0x05 as UP and UV only", () => {
    const parsed = parseAuthData(assertionAuthData);

    expect(parsed.flagsByte).toBe(0x05);
    expect(parsed.flags.filter((flag) => flag.isSet).map((flag) => flag.code)).toEqual([
      "UP",
      "UV",
    ]);
  });

  it("isFlagSet looks a bit up by its spec code and is false for an unknown code", () => {
    const parsed = parseAuthData(header(0b0001_0000, 0));

    expect(isFlagSet(parsed.flags, "BS")).toBe(true);
    expect(isFlagSet(parsed.flags, "BE")).toBe(false);
    expect(isFlagSet(parsed.flags, "NOPE")).toBe(false);
  });
});

describe("parseAuthData — attested credential data", () => {
  it("refuses a set AT bit with nothing after the header", () => {
    expect(() => parseAuthData(header(0x40, 0))).toThrow(/too short/);
  });

  it("consumes the embedded CBOR so the extension map starts in the right place", () => {
    const parsed = parseAuthData(fullAuthData());

    expect(parsed.attestedCredentialData?.credentialIdLength).toBe(2);
    expect(parsed.attestedCredentialData?.coseKeyBytes.length).toBe(77);
    expect(parsed.extensions).toBeInstanceOf(Map);
    expect(parsed.trailingBytes).toBe(0);
  });

  it("refuses a credential ID length that overruns the buffer", () => {
    const source = header(0x40, 0);
    const overrun = new Uint8Array(new ArrayBuffer(source.length + 18));
    overrun.set(source, 0);
    // 16 bytes of AAGUID, then a declared credential ID length of 0xffff.
    overrun[37 + 16] = 0xff;
    overrun[37 + 17] = 0xff;

    expect(() => parseAuthData(overrun)).toThrow(/overruns authData/);
  });
});
