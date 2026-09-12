import { describe, expect, it } from "vitest";

import {
  CborError,
  asCborBytes,
  asCborMap,
  decodeCbor,
  decodeCborItem,
  decodeFloat16,
  describeCborValue,
} from "./cbor";

const bytes = (...values: readonly number[]): Uint8Array => new Uint8Array(values);

describe("decodeCbor — major type 0/1, unsigned and negative integers", () => {
  it("reads a small integer out of the initial byte", () => {
    expect(decodeCbor(bytes(0x17))).toBe(23);
  });

  it("reads each argument width", () => {
    expect(decodeCbor(bytes(0x18, 0xff))).toBe(255);
    expect(decodeCbor(bytes(0x19, 0x01, 0x00))).toBe(256);
    expect(decodeCbor(bytes(0x1a, 0x00, 0x01, 0x00, 0x00))).toBe(65536);
    expect(decodeCbor(bytes(0x1b, 0, 0, 0, 0, 0, 0, 0x01, 0x00))).toBe(256);
  });

  it("does not sign-extend a 32-bit argument", () => {
    // 0xffffffff must decode as 4294967295, not -1. A `<<` in the decoder
    // would silently produce the wrong number here.
    expect(decodeCbor(bytes(0x1a, 0xff, 0xff, 0xff, 0xff))).toBe(4294967295);
  });

  it("maps a negative integer to -1 - n", () => {
    expect(decodeCbor(bytes(0x20))).toBe(-1);
    expect(decodeCbor(bytes(0x38, 0x63))).toBe(-100);
  });
});

describe("decodeCbor — strings", () => {
  it("returns byte strings as a view, not as text", () => {
    const decoded = decodeCbor(bytes(0x43, 0x01, 0x02, 0x03));

    expect(decoded).toBeInstanceOf(Uint8Array);
    expect(Array.from(decoded as Uint8Array)).toEqual([1, 2, 3]);
  });

  it("decodes UTF-8 text strings", () => {
    expect(decodeCbor(bytes(0x66, 0x70, 0x61, 0x63, 0x6b, 0x65, 0x64))).toBe("packed");
  });

  it("refuses a declared length that runs past the buffer", () => {
    expect(() => decodeCbor(bytes(0x44, 0x01, 0x02))).toThrow(CborError);
  });
});

describe("decodeCbor — arrays and maps", () => {
  it("decodes a nested array", () => {
    expect(decodeCbor(bytes(0x82, 0x01, 0x81, 0x02))).toEqual([1, [2]]);
  });

  it("returns a Map so negative COSE labels survive", () => {
    // {1: 2, -1: 3} — an object would stringify both keys and lose the sign.
    const decoded = asCborMap(decodeCbor(bytes(0xa2, 0x01, 0x02, 0x20, 0x03)));

    expect(decoded.get(1)).toBe(2);
    expect(decoded.get(-1)).toBe(3);
    expect(decoded.size).toBe(2);
  });
});

describe("decodeCbor — tags and simple values", () => {
  it("preserves a tag rather than dropping it", () => {
    expect(decodeCbor(bytes(0xc1, 0x01))).toEqual({ tag: 1, value: 1 });
  });

  it("decodes false, true, null and undefined", () => {
    expect(decodeCbor(bytes(0xf4))).toBe(false);
    expect(decodeCbor(bytes(0xf5))).toBe(true);
    expect(decodeCbor(bytes(0xf6))).toBe(null);
    expect(decodeCbor(bytes(0xf7))).toBe(undefined);
  });

  it("decodes half, single and double precision floats", () => {
    expect(decodeCbor(bytes(0xf9, 0x3c, 0x00))).toBe(1);
    expect(decodeCbor(bytes(0xfa, 0x3f, 0x80, 0x00, 0x00))).toBe(1);
    expect(decodeCbor(bytes(0xfb, 0x3f, 0xf0, 0, 0, 0, 0, 0, 0))).toBe(1);
  });

  it("handles the float16 edge cases", () => {
    expect(decodeFloat16(0x0000)).toBe(0);
    expect(decodeFloat16(0x7c00)).toBe(Number.POSITIVE_INFINITY);
    expect(decodeFloat16(0xfc00)).toBe(Number.NEGATIVE_INFINITY);
    expect(Number.isNaN(decodeFloat16(0x7e00))).toBe(true);
    expect(decodeFloat16(0xc000)).toBe(-2);
  });
});

describe("decodeCbor — the CTAP2 profile boundary", () => {
  it("rejects indefinite-length items, which canonical CTAP2 CBOR forbids", () => {
    expect(() => decodeCbor(bytes(0x5f, 0x41, 0x01, 0xff))).toThrow(
      /indefinite length or reserved/,
    );
  });

  it("rejects a truncated buffer instead of returning a partial value", () => {
    expect(() => decodeCbor(bytes())).toThrow(CborError);
    expect(() => decodeCborItem(bytes(0x18), 0)).toThrow(CborError);
  });
});

describe("decodeCborItem — the cursor", () => {
  it("reports the offset after the item, which is how authData finds the COSE key's end", () => {
    const buffer = bytes(0x43, 0x01, 0x02, 0x03, 0xff, 0xff);

    const decoded = decodeCborItem(buffer, 0);

    expect(decoded.pos).toBe(4);
  });

  it("decodes an item that does not start at offset zero", () => {
    expect(decodeCborItem(bytes(0xaa, 0xbb, 0x01), 2).value).toBe(1);
  });
});

describe("narrowing helpers", () => {
  it("asCborMap rejects a non-map", () => {
    expect(() => asCborMap(1)).toThrow(CborError);
  });

  it("asCborBytes names the field it was looking for", () => {
    expect(() => asCborBytes("not bytes", "authData")).toThrow(/authData/);
  });

  it("asCborBytes copies, so the result is independent of the source view", () => {
    const source = bytes(1, 2, 3);

    const copy = asCborBytes(source, "sig");
    source[0] = 9;

    expect(copy[0]).toBe(1);
  });

  it("describeCborValue summarises each shape in one line", () => {
    expect(describeCborValue(bytes(1, 2))).toBe("2 bytes");
    expect(describeCborValue([1, 2, 3])).toBe("array of 3");
    expect(describeCborValue(new Map([[1, 2]]))).toBe("map with 1 entries");
    expect(describeCborValue(null)).toBe("null");
    expect(describeCborValue({ tag: 6, value: 1 })).toBe("tag 6");
  });
});
