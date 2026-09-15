import { describe, expect, it } from "vitest";

import {
  ByteFormatError,
  bytesEqual,
  concatBytes,
  formatUuid,
  fromBase64Url,
  randomBytes,
  sha256,
  toBase64Url,
  toHex,
} from "./bytes";

const bytes = (...values: readonly number[]): Uint8Array => new Uint8Array(values);

describe("toHex", () => {
  it("pads every byte to two digits and separates them with spaces", () => {
    expect(toHex(bytes(0x00, 0x0f, 0xff))).toBe("00 0f ff");
  });

  it("returns an empty string for an empty buffer", () => {
    expect(toHex(bytes())).toBe("");
  });
});

describe("base64url", () => {
  it("encodes without padding and with the URL-safe alphabet", () => {
    // 0xfb 0xff encodes to "+/8" in standard base64 — both substitutions at once.
    expect(toBase64Url(bytes(0xfb, 0xff))).toBe("-_8");
  });

  it("round-trips arbitrary bytes", () => {
    const source = bytes(0, 1, 127, 128, 254, 255, 42);
    expect(Array.from(fromBase64Url(toBase64Url(source)))).toEqual(Array.from(source));
  });

  it("decodes input whose padding was stripped", () => {
    expect(Array.from(fromBase64Url("AQID"))).toEqual([1, 2, 3]);
    expect(Array.from(fromBase64Url("AQI"))).toEqual([1, 2]);
  });

  it("throws a named error rather than a bare DOMException on invalid input", () => {
    expect(() => fromBase64Url("!!!!")).toThrow(ByteFormatError);
  });
});

describe("concatBytes", () => {
  it("returns a new buffer and leaves both inputs untouched", () => {
    const left = bytes(1, 2);
    const right = bytes(3);

    const joined = concatBytes(left, right);

    expect(Array.from(joined)).toEqual([1, 2, 3]);
    expect(Array.from(left)).toEqual([1, 2]);
    expect(Array.from(right)).toEqual([3]);
  });
});

describe("bytesEqual", () => {
  it("returns true only for identical contents", () => {
    expect(bytesEqual(bytes(1, 2, 3), bytes(1, 2, 3))).toBe(true);
    expect(bytesEqual(bytes(1, 2, 3), bytes(1, 2, 4))).toBe(false);
  });

  it("returns false when the lengths differ", () => {
    expect(bytesEqual(bytes(1, 2), bytes(1, 2, 3))).toBe(false);
  });
});

describe("formatUuid", () => {
  it("groups 16 bytes into the canonical 8-4-4-4-12 form", () => {
    const aaguid = bytes(1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8);

    expect(formatUuid(aaguid)).toBe("01020304-0506-0708-0102-030405060708");
  });

  it("rejects a buffer that is not 16 bytes", () => {
    expect(() => formatUuid(bytes(1, 2, 3))).toThrow(ByteFormatError);
  });
});

describe("randomBytes", () => {
  it("returns the requested length and does not repeat itself", () => {
    const first = randomBytes(32);
    const second = randomBytes(32);

    expect(first.length).toBe(32);
    expect(bytesEqual(first, second)).toBe(false);
  });
});

describe("sha256", () => {
  it("computes the known digest of the empty input", async () => {
    const digest = await sha256(new Uint8Array(new ArrayBuffer(0)));

    expect(toHex(digest).replace(/ /g, "")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});
