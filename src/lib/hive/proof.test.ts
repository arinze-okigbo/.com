import { webcrypto, createHash, createPublicKey, verify } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_CHALLENGE_BYTES,
  createProofKeyPair,
  fingerprintPublicKey,
  signChallenge,
  verifyChallenge,
} from "./proof";

beforeEach(() => vi.stubGlobal("crypto", webcrypto));
afterEach(() => vi.unstubAllGlobals());

describe("ephemeral browser signature proof with real Web Crypto", () => {
  it("generates a non-extractable P-256 signing key and exportable verification key", async () => {
    const { privateKey, publicKey } = await createProofKeyPair();
    expect(privateKey.type).toBe("private");
    expect(privateKey.algorithm).toEqual({ name: "ECDSA", namedCurve: "P-256" });
    expect(privateKey.extractable).toBe(false);
    expect(privateKey.usages).toEqual(["sign"]);
    expect(publicKey.type).toBe("public");
    expect(publicKey.extractable).toBe(true);
    expect(publicKey.usages).toEqual(["verify"]);
    // Node 24 and 25 use different names for the same non-extractable-key rejection.
    for (const format of ["pkcs8", "jwk"] as const) {
      await expect(crypto.subtle.exportKey(format, privateKey)).rejects.toMatchObject({
        name: expect.stringMatching(/^(InvalidAccessError|InvalidAccessException)$/),
      });
    }
  });

  it("signs and verifies, then rejects changed text, changed signature, and a different key", async () => {
    const pair = await createProofKeyPair();
    const other = await createProofKeyPair();
    const text = "A local proof, signed in this tab.";
    const signature = await signChallenge(pair.privateKey, text);
    expect(signature).toBeInstanceOf(Uint8Array);
    expect(signature.byteLength).toBe(64);
    const publicDer = await crypto.subtle.exportKey("spki", pair.publicKey);
    expect(
      verify(
        "sha256",
        Buffer.from(text, "utf8"),
        {
          key: createPublicKey({ key: Buffer.from(publicDer), format: "der", type: "spki" }),
          dsaEncoding: "ieee-p1363",
        },
        signature,
      ),
    ).toBe(true);
    expect(await verifyChallenge(pair.publicKey, text, signature)).toBe(true);
    expect(await verifyChallenge(pair.publicKey, `${text}!`, signature)).toBe(false);
    expect(await verifyChallenge(other.publicKey, text, signature)).toBe(false);
    const changed = signature.slice();
    changed[0] ^= 1;
    expect(await verifyChallenge(pair.publicKey, text, changed)).toBe(false);
    expect(await verifyChallenge(pair.publicKey, text, new Uint8Array())).toBe(false);
    expect(await verifyChallenge(pair.publicKey, text, signature.slice(1))).toBe(false);
  });

  it.each([
    "",
    "Ndewo · こんにちは · 👋🏾",
    "a".repeat(MAX_CHALLENGE_BYTES),
    "é".repeat(MAX_CHALLENGE_BYTES / 2),
    "🛰️".repeat(585),
  ])("accepts empty, Unicode, and bounded challenges (case %#)", async (text) => {
    const pair = await createProofKeyPair();
    const signature = await signChallenge(pair.privateKey, text);
    expect(await verifyChallenge(pair.publicKey, text, signature)).toBe(true);
  });

  it("does not normalize distinct Unicode byte sequences", async () => {
    const pair = await createProofKeyPair();
    const signature = await signChallenge(pair.privateKey, "é");
    expect(await verifyChallenge(pair.publicKey, "e\u0301", signature)).toBe(false);
  });

  it.each(["a".repeat(MAX_CHALLENGE_BYTES + 1), "é".repeat(MAX_CHALLENGE_BYTES / 2 + 1)])(
    "rejects oversized UTF-8 challenges for both operations (case %#)",
    async (text) => {
      const pair = await createProofKeyPair();
      await expect(signChallenge(pair.privateKey, text)).rejects.toThrow(RangeError);
      await expect(verifyChallenge(pair.publicKey, text, new Uint8Array(64))).rejects.toThrow(
        RangeError,
      );
    },
  );

  it("fingerprints the actual SPKI bytes deterministically with SHA-256", async () => {
    const pair = await createProofKeyPair();
    const other = await createProofKeyPair();
    const spki = await crypto.subtle.exportKey("spki", pair.publicKey);
    const expected = createHash("sha256").update(new Uint8Array(spki)).digest("hex");
    const fingerprint = await fingerprintPublicKey(pair.publicKey);
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(fingerprint).toBe(expected);
    expect(await fingerprintPublicKey(pair.publicKey)).toBe(fingerprint);
    expect(await fingerprintPublicKey(other.publicKey)).not.toBe(fingerprint);
  });

  it("preserves invalid-key errors rather than reporting a failed verification", async () => {
    const pair = await createProofKeyPair();
    await expect(signChallenge(pair.publicKey, "challenge")).rejects.toMatchObject({
      name: "InvalidAccessError",
    });
    await expect(
      verifyChallenge(pair.privateKey, "challenge", new Uint8Array(64)),
    ).rejects.toMatchObject({
      name: "InvalidAccessError",
    });
  });

  it("reports unavailable Web Crypto without a fallback implementation", async () => {
    vi.stubGlobal("crypto", undefined);
    await expect(createProofKeyPair()).rejects.toThrow("Web Crypto is unavailable");
  });
});
