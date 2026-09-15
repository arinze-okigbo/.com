import { describe, expect, it } from "vitest";

import { AAGUID_REGISTRY, AAGUID_UNKNOWN_NAME, lookupAaguid, resolveAaguid } from "./aaguid";

describe("lookupAaguid", () => {
  it("resolves a model that is in the compiled-in table", () => {
    const resolved = lookupAaguid("cb69481e-8ff7-4039-93ec-0a2729a154a8");

    expect(resolved.isKnown).toBe(true);
    expect(resolved.name).toBe("YubiKey 5 Series");
  });

  it("names the all-zero AAGUID as a declined model, not as a miss", () => {
    const resolved = lookupAaguid("00000000-0000-0000-0000-000000000000");

    expect(resolved.isKnown).toBe(true);
    expect(resolved.name).toMatch(/declined to identify/);
  });

  it("says the table is abridged rather than inventing a model name", () => {
    const resolved = lookupAaguid("ffffffff-ffff-ffff-ffff-ffffffffffff");

    expect(resolved.isKnown).toBe(false);
    expect(resolved.name).toBe(AAGUID_UNKNOWN_NAME);
  });

  it("carries 23 entries, the snapshot this build shipped", () => {
    expect(Object.keys(AAGUID_REGISTRY).length).toBe(23);
  });
});

describe("resolveAaguid", () => {
  it("formats raw bytes and resolves them in one step", () => {
    const aaguid = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]);

    const resolved = resolveAaguid(aaguid);

    expect(resolved.uuid).toBe("01020304-0506-0708-0102-030405060708");
    expect(resolved.name).toMatch(/Chrome DevTools virtual authenticator/);
  });
});
