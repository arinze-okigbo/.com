import { describe, expect, it } from "vitest";

import { CEREMONY_SAMPLE_SUMMARY } from "@/content/ceremony";

import { analyzeCeremony, type CeremonyAnalysis } from "./analyze";
import { FIELD_FLARE_DETAIL, FIELD_FLARE_EVENT } from "./flare";
import { loadSampleCeremony } from "./sample";
import type { CeremonyInput } from "./types";

/**
 * End-to-end over the captured sample.
 *
 * These run the exact code path a visitor's browser runs, including the real
 * `crypto.subtle.verify`, over fixed bytes — so a regression in any parser
 * shows up as a failed assertion rather than as a wrong number on the page.
 */

const analyse = (): Promise<CeremonyAnalysis> => analyzeCeremony(loadSampleCeremony());

function findRow(label: string): string {
  const row = CEREMONY_SAMPLE_SUMMARY.rows.find((entry) => entry.label === label);
  if (!row) throw new Error(`the server-rendered summary has no row "${label}"`);
  return row.value;
}

describe("loadSampleCeremony", () => {
  it("decodes the captured base64url into the same shape a live ceremony produces", () => {
    const input: CeremonyInput = loadSampleCeremony();

    expect(input.mode).toBe("sample");
    expect(input.provenance?.origin).toBe("http://localhost:8931");
    expect(input.registration.attestationObject.length).toBe(759);
    expect(input.assertion.signature.length).toBe(71);
  });
});

describe("analyzeCeremony — registration", () => {
  it("decodes the attestation object's three keys", async () => {
    const { registration } = await analyse();

    expect(registration.fmt).toBe("packed");
    expect(registration.attestationObjectByteLength).toBe(759);
    expect(registration.authDataBytes.length).toBe(164);
  });

  it("reads the attestation statement, including the certificate chain", async () => {
    const { registration } = await analyse();
    const algEntry = registration.attStmt.find((entry) => entry.kind === "alg");
    const x5cEntry = registration.attStmt.find((entry) => entry.kind === "x5c");
    const sigEntry = registration.attStmt.find((entry) => entry.kind === "bytes");

    expect(algEntry?.kind === "alg" && algEntry.alg).toBe(-7);
    expect(x5cEntry?.kind === "x5c" && x5cEntry.certificateLengths).toEqual([472]);
    expect(sigEntry?.kind === "bytes" && sigEntry.bytes.length).toBe(72);
    expect(registration.hasAttestationStatement).toBe(true);
  });

  it("verifies the RP ID hash against SHA-256 of the expected RP ID", async () => {
    const { registration } = await analyse();

    expect(registration.isRpIdHashExpected).toBe(true);
  });

  it("confirms the challenge was echoed and the origin matches", async () => {
    const { registration } = await analyse();

    expect(registration.isChallengeEchoed).toBe(true);
    expect(registration.isOriginExpected).toBe(true);
    expect(registration.clientData.type).toBe("webauthn.create");
  });

  it("decodes the flags byte as UP, UV and AT", async () => {
    const { registration } = await analyse();

    expect(registration.authData.flagsByte).toBe(0x45);
    expect(
      registration.authData.flags.filter((flag) => flag.isSet).map((flag) => flag.code),
    ).toEqual(["UP", "UV", "AT"]);
    expect(registration.authData.signCount).toBe(1);
    expect(registration.authData.trailingBytes).toBe(0);
  });

  it("resolves the AAGUID and cross-checks the credential ID against rawId", async () => {
    const { registration } = await analyse();

    expect(registration.aaguid?.uuid).toBe("01020304-0506-0708-0102-030405060708");
    expect(registration.aaguid?.isKnown).toBe(true);
    expect(registration.credentialIdLength).toBe(32);
    expect(registration.doesCredentialIdMatchRawId).toBe(true);
  });

  it("extracts the COSE public key from inside authData", async () => {
    const { registration } = await analyse();

    expect(registration.coseKeyByteLength).toBe(77);
    expect(registration.cose?.kty).toBe(2);
    expect(registration.cose?.alg).toBe(-7);
    expect(registration.cose?.crv).toBe(1);
    expect(registration.cose?.x?.length).toBe(32);
    expect(registration.cose?.y?.length).toBe(32);
  });

  it("reports no extensions, because the ED flag is clear", async () => {
    const { registration } = await analyse();

    expect(registration.extensionsSummary).toBeNull();
    expect(registration.authData.extensions).toBeNull();
  });
});

describe("analyzeCeremony — assertion and verification", () => {
  it("verifies the captured signature live with WebCrypto", async () => {
    const { assertion } = await analyse();

    expect(assertion?.verification.isValid).toBe(true);
    expect(assertion?.verification.algorithmName).toBe("ECDSA / SHA-256 over P-256");
  });

  it("converts the DER signature and signs over authData ‖ clientDataHash", async () => {
    const { assertion } = await analyse();

    expect(assertion?.signature.length).toBe(71);
    expect(assertion?.verification.normalisedSignature.length).toBe(64);
    expect(assertion?.verification.clientDataHash.length).toBe(32);
    expect(assertion?.verification.signedBytes.length).toBe(37 + 32);
  });

  it("shows the counter increasing and the AT flag now clear", async () => {
    const analysis = await analyse();

    expect(analysis.assertion?.authData.signCount).toBe(2);
    expect(analysis.assertion?.authData.signCount).toBeGreaterThan(
      analysis.registration.authData.signCount,
    );
    expect(analysis.assertion?.authData.attestedCredentialData).toBeNull();
  });

  it("confirms the fresh assertion challenge was echoed", async () => {
    const { assertion } = await analyse();

    expect(assertion?.isChallengeEchoed).toBe(true);
    expect(assertion?.clientData.type).toBe("webauthn.get");
  });
});

describe("analyzeCeremony — persistence verdict", () => {
  it("reports 'unknown' for a 32-byte credential ID with no backup flags", async () => {
    const analysis = await analyse();

    expect(analysis.persistence).toBe("unknown");
  });
});

describe("the server-rendered sample summary", () => {
  /**
   * `@/content/ceremony` states these values as static text so the section
   * teaches with JavaScript disabled. They must equal what the parsers produce,
   * or the page tells a visitor something untrue.
   */
  it("matches the parsed attestation object", async () => {
    const { registration } = await analyse();

    expect(findRow("attestationObject")).toBe(
      `${registration.attestationObjectByteLength} bytes of CBOR`,
    );
    expect(findRow("fmt")).toBe(registration.fmt);
    expect(findRow("authData")).toBe(`${registration.authDataBytes.length} bytes`);
  });

  it("matches the parsed flags, counters and credential", async () => {
    const analysis = await analyse();

    expect(findRow("flags")).toBe("0x45 — UP, UV and AT set");
    expect(analysis.registration.authData.flagsByte.toString(16)).toBe("45");
    expect(findRow("signCount (registration)")).toBe(
      String(analysis.registration.authData.signCount),
    );
    expect(findRow("signCount (assertion)")).toBe(String(analysis.assertion?.authData.signCount));
    expect(findRow("credentialId")).toBe(
      `${analysis.registration.credentialIdLength} bytes, identical to credential.rawId`,
    );
    expect(analysis.registration.doesCredentialIdMatchRawId).toBe(true);
  });

  it("matches the parsed key and signature sizes", async () => {
    const analysis = await analyse();

    expect(findRow("COSE public key")).toBe(
      `${analysis.registration.coseKeyByteLength} bytes of CBOR — EC2 / P-256 / ES256`,
    );
    expect(findRow("signature")).toBe(
      `${analysis.assertion?.signature.length} bytes DER → ${analysis.assertion?.verification.normalisedSignature.length} bytes raw r‖s`,
    );
    expect(findRow("signed bytes")).toBe(
      `${analysis.assertion?.verification.signedBytes.length} = authenticatorData (37) ‖ SHA-256(clientDataJSON) (32)`,
    );
  });

  it("matches the expected origin and RP ID", async () => {
    const { input } = await analyse();

    expect(findRow("origin")).toBe(input.expected.origin);
    expect(findRow("rpId")).toBe(input.expected.rpId);
  });
});

describe("the field flare contract", () => {
  it("keeps the event name and detail docs/15 §3 fixed", () => {
    expect(FIELD_FLARE_EVENT).toBe("field:flare");
    expect(FIELD_FLARE_DETAIL).toEqual({ amount: 1.6, ms: 900 });
  });
});
