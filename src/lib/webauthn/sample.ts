import { fromBase64Url } from "./bytes";
import type { CeremonyInput, SampleProvenance } from "./types";

/**
 * A real ceremony, captured once and compiled in.
 *
 * Every failure path in the section falls back to this, so the explanation
 * always has bytes to explain. Captured through the Chrome DevTools Protocol
 * virtual authenticator (`WebAuthn.addVirtualAuthenticator`) driven by
 * Playwright — a genuine CTAP2 implementation, just a software one.
 *
 * The signature below verifies against the public key below, and that check is
 * recomputed live in the visitor's browser every time the sample is shown. It
 * is captured data, not a captured *result*.
 */

export const SAMPLE_PROVENANCE: SampleProvenance = {
  capturedAt: "2026-09-11",
  authenticator:
    "a Chrome DevTools Protocol virtual authenticator (CTAP2.1, internal transport, user verification enabled) driven by Playwright",
  origin: "http://localhost:8931",
  rpId: "localhost",
};

/** The captured bytes, base64url exactly as the ceremony produced them. */
export const SAMPLE_CEREMONY_BASE64URL = {
  registration: {
    challenge: "sPNEDJLVP9SZ26Juds3MLN7vpI53YuPy4Y0DAlQzHcc",
    rawId: "9vtPsFAJzAnnY9AhRm5DxTOB8nl5-IeR7XH0tgtzqaM",
    attestationObject:
      "o2NmbXRmcGFja2VkZ2F0dFN0bXSjY2FsZyZjc2lnWEgwRgIhAO-2y914iB1EoF8oKIHUKSPzRI85t-fvdnC1DwvAguHjAiEA9mAifZThHyrR9KZsWBbu8XOGyLiBK1vG1-OzUaKS01ljeDVjgVkB2DCCAdQwggF6oAMCAQICAQEwCgYIKoZIzj0EAwIwYDELMAkGA1UEBhMCVVMxETAPBgNVBAoMCENocm9taXVtMSIwIAYDVQQLDBlBdXRoZW50aWNhdG9yIEF0dGVzdGF0aW9uMRowGAYDVQQDDBFCYXRjaCBDZXJ0aWZpY2F0ZTAeFw0xNzA3MTQwMjQwMDBaFw00NjA5MDYyMTU4NDhaMGAxCzAJBgNVBAYTAlVTMREwDwYDVQQKDAhDaHJvbWl1bTEiMCAGA1UECwwZQXV0aGVudGljYXRvciBBdHRlc3RhdGlvbjEaMBgGA1UEAwwRQmF0Y2ggQ2VydGlmaWNhdGUwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASNYX5lyVCOZLzFZzrIKmeZ2jwURmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEBoyUwIzAMBgNVHRMBAf8EAjAAMBMGCysGAQQBguUcAgEBBAQDAgMIMAoGCCqGSM49BAMCA0gAMEUCIQC40z9sxXUFqcAKQqVbi7gOdf7kQLOG7leHrx607aZQIgIgIgxEZs8AcXVqCiY2NZW27OO3xWfZOm-4iL1psplLX05oYXV0aERhdGFYpEmWDeWIDoxodDQXD2R2YFuP5K65ooYyx5lc87qDHZdjRQAAAAEBAgMEBQYHCAECAwQFBgcIACD2-0-wUAnMCedj0CFGbkPFM4HyeXn4h5HtcfS2C3Opo6UBAgMmIAEhWCAJNHUn1XNWWiPDQpPD0VSqr-BN2cAldHyHPO_9iDdYlyJYIO-VtJ601ZDWJjsbRfnxJwur50I4Uf5kVXTk7t9gXfj5",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoic1BORURKTFZQOVNaMjZKdWRzM01MTjd2cEk1M1l1UHk0WTBEQWxRekhjYyIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODkzMSIsImNyb3NzT3JpZ2luIjpmYWxzZX0",
    authenticatorAttachment: "platform",
    transports: ["internal"],
  },
  assertion: {
    challenge: "8OOJ5xnYHZd8cufGBBdt-eZI7UTcr2WjCKRdfFS7Obs",
    authenticatorData: "SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAg",
    clientDataJSON:
      "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiOE9PSjV4bllIWmQ4Y3VmR0JCZHQtZVpJN1VUY3IyV2pDS1JkZkZTN09icyIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODkzMSIsImNyb3NzT3JpZ2luIjpmYWxzZX0",
    signature:
      "MEUCIEhYJxSS2kqUwj0meHVZ_K13vF8L4vi13N7OeClFCUNdAiEArGss_vyXCevY6ySY38l8kdSnRZRmekfsvGnQnPSZ23A",
  },
} as const;

/**
 * Decodes the captured sample into the same shape a live ceremony produces, so
 * exactly one rendering path exists.
 */
export function loadSampleCeremony(): CeremonyInput {
  const { registration, assertion } = SAMPLE_CEREMONY_BASE64URL;

  return {
    mode: "sample",
    expected: { origin: SAMPLE_PROVENANCE.origin, rpId: SAMPLE_PROVENANCE.rpId },
    provenance: SAMPLE_PROVENANCE,
    registrationMs: null,
    assertionMs: null,
    registration: {
      challenge: fromBase64Url(registration.challenge),
      rawId: fromBase64Url(registration.rawId),
      attestationObject: fromBase64Url(registration.attestationObject),
      clientDataJSON: fromBase64Url(registration.clientDataJSON),
      authenticatorAttachment: registration.authenticatorAttachment,
      transports: registration.transports,
    },
    assertion: {
      challenge: fromBase64Url(assertion.challenge),
      authenticatorData: fromBase64Url(assertion.authenticatorData),
      clientDataJSON: fromBase64Url(assertion.clientDataJSON),
      signature: fromBase64Url(assertion.signature),
      userHandle: null,
    },
  };
}
