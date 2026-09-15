import { describe, expect, it } from "vitest";

import { fromBase64Url, toHex } from "./bytes";
import { DerError, P256_COORDINATE_BYTES, derToRawEcdsaSignature } from "./der";
import { SAMPLE_CEREMONY_BASE64URL } from "./sample";

const bytes = (...values: readonly number[]): Uint8Array => new Uint8Array(values);

describe("derToRawEcdsaSignature — the captured signature", () => {
  it("converts the real 71-byte DER signature to 64 raw bytes", () => {
    const der = fromBase64Url(SAMPLE_CEREMONY_BASE64URL.assertion.signature);

    const raw = derToRawEcdsaSignature(der, P256_COORDINATE_BYTES);

    expect(der.length).toBe(71);
    expect(raw.length).toBe(64);
    expect(toHex(raw).replace(/ /g, "")).toBe(
      // r ‖ s, 32 bytes each, left-padded.
      "4858271492da4a94c23d26787559fcad77bc5f0be2f8b5dcdece78294509435d" +
        "ac6b2cfefc9709ebd8eb2498dfc97c91d4a74594667a47ecbc69d09cf499db70",
    );
  });
});

describe("derToRawEcdsaSignature — padding", () => {
  it("strips the leading zero DER adds to a high-bit integer", () => {
    // SEQUENCE { INTEGER 0x00ff, INTEGER 0x01 }
    const der = bytes(0x30, 0x08, 0x02, 0x02, 0x00, 0xff, 0x02, 0x02, 0x00, 0x01);

    const raw = derToRawEcdsaSignature(der, 2);

    expect(Array.from(raw)).toEqual([0x00, 0xff, 0x00, 0x01]);
  });

  it("left-pads each integer to the coordinate size", () => {
    // SEQUENCE { INTEGER 0x01, INTEGER 0x02 }
    const der = bytes(0x30, 0x06, 0x02, 0x01, 0x01, 0x02, 0x01, 0x02);

    const raw = derToRawEcdsaSignature(der, 4);

    expect(Array.from(raw)).toEqual([0, 0, 0, 1, 0, 0, 0, 2]);
  });

  it("never strips a value down to nothing", () => {
    // SEQUENCE { INTEGER 0x00, INTEGER 0x00 } — r and s are both zero.
    const der = bytes(0x30, 0x06, 0x02, 0x01, 0x00, 0x02, 0x01, 0x00);

    expect(Array.from(derToRawEcdsaSignature(der, 1))).toEqual([0, 0]);
  });

  it("handles a long-form SEQUENCE length", () => {
    const der = bytes(0x30, 0x81, 0x06, 0x02, 0x01, 0x07, 0x02, 0x01, 0x08);

    expect(Array.from(derToRawEcdsaSignature(der, 1))).toEqual([7, 8]);
  });
});

describe("derToRawEcdsaSignature — rejections", () => {
  it("rejects a signature that is not a DER SEQUENCE", () => {
    expect(() => derToRawEcdsaSignature(bytes(0x31, 0x00), 32)).toThrow(DerError);
  });

  it("rejects an empty buffer with a readable message", () => {
    expect(() => derToRawEcdsaSignature(bytes(), 32)).toThrow(/empty buffer/);
  });

  it("rejects a member that is not an INTEGER", () => {
    expect(() => derToRawEcdsaSignature(bytes(0x30, 0x03, 0x04, 0x01, 0x01), 32)).toThrow(
      /DER INTEGER/,
    );
  });

  it("rejects an integer wider than the curve's coordinate size", () => {
    const der = bytes(0x30, 0x08, 0x02, 0x02, 0x01, 0x02, 0x02, 0x02, 0x03, 0x04);

    expect(() => derToRawEcdsaSignature(der, 1)).toThrow(/wider than/);
  });

  it("rejects an INTEGER whose declared length runs past the buffer", () => {
    expect(() => derToRawEcdsaSignature(bytes(0x30, 0x04, 0x02, 0x20, 0x01), 32)).toThrow(
      /past the end/,
    );
  });
});
