import { describe, expect, it } from "vitest";

import { fromBase64Url } from "./bytes";
import { ClientDataError, parseClientData } from "./client-data";
import { SAMPLE_CEREMONY_BASE64URL } from "./sample";

const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

describe("parseClientData — the captured registration", () => {
  it("reads type, challenge, origin and crossOrigin", () => {
    const parsed = parseClientData(
      fromBase64Url(SAMPLE_CEREMONY_BASE64URL.registration.clientDataJSON),
    );

    expect(parsed.type).toBe("webauthn.create");
    expect(parsed.challenge).toBe(SAMPLE_CEREMONY_BASE64URL.registration.challenge);
    expect(parsed.origin).toBe("http://localhost:8931");
    expect(parsed.crossOrigin).toBe(false);
  });

  it("keeps the raw text, because a server must hash these exact bytes", () => {
    const parsed = parseClientData(
      fromBase64Url(SAMPLE_CEREMONY_BASE64URL.assertion.clientDataJSON),
    );

    expect(parsed.text.startsWith('{"type":"webauthn.get"')).toBe(true);
    expect(parsed.type).toBe("webauthn.get");
  });
});

describe("parseClientData — rejections", () => {
  it("rejects invalid JSON", () => {
    expect(() => parseClientData(encode("{"))).toThrow(ClientDataError);
  });

  it("rejects a JSON array, which is not the object the spec requires", () => {
    expect(() => parseClientData(encode("[]"))).toThrow(/not a JSON object/);
  });

  it("rejects null", () => {
    expect(() => parseClientData(encode("null"))).toThrow(/not a JSON object/);
  });

  it("names the missing member", () => {
    expect(() => parseClientData(encode('{"type":"webauthn.get"}'))).toThrow(/"challenge"/);
  });

  it("reports an absent crossOrigin as null rather than as false", () => {
    const parsed = parseClientData(
      encode('{"type":"webauthn.get","challenge":"a","origin":"https://example.com"}'),
    );

    expect(parsed.crossOrigin).toBeNull();
  });
});
