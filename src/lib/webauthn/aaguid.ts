import { formatUuid } from "./bytes";
import type { AaguidResolution } from "./types";

/**
 * AAGUID → authenticator model.
 *
 * An abridged snapshot of the FIDO Alliance Metadata Service BLOB plus the
 * community `passkey-authenticator-aaguids` registry, compiled in deliberately:
 * this section makes no network requests, so it cannot fetch the MDS.
 *
 * A production relying party fetches and verifies the *signed* MDS BLOB
 * server-side on a schedule, and treats the AAGUID as a hint rather than an
 * authenticated fact unless the attestation statement was actually verified to
 * a trusted root.
 */

/** The model names this build can resolve. 23 entries — knowingly incomplete. */
export const AAGUID_REGISTRY: Readonly<Record<string, string>> = {
  "00000000-0000-0000-0000-000000000000":
    "No AAGUID asserted — the authenticator declined to identify its model",
  "01020304-0506-0708-0102-030405060708":
    "Chrome DevTools virtual authenticator — a software CTAP2 authenticator used for automated testing",
  "adce0002-35bc-c60a-648b-0b25f1f05503": "Chrome on macOS — profile-bound Touch ID authenticator",
  "08987058-cadc-4b81-b6e1-30de50dcbe96": "Windows Hello — hardware authenticator (TPM-backed)",
  "9ddd1817-af5a-4672-a2b9-3e3dd95000a9": "Windows Hello — software authenticator",
  "6028b017-b1d4-4c02-b4b3-afcdafc96bb2": "Windows Hello — VBS hardware authenticator",
  "fbfc3007-154e-4ecc-8c0b-6e020557d7bd": "Apple iCloud Keychain (passkey)",
  "dd4ec289-e01d-41c9-bb89-70fa845d4bf2": "Apple iCloud Keychain (managed)",
  "ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4": "Google Password Manager",
  "b93fd961-f2e6-462f-b122-82002247de78": "Android authenticator with SafetyNet attestation",
  "cb69481e-8ff7-4039-93ec-0a2729a154a8": "YubiKey 5 Series",
  "ee882879-721c-4913-9775-3dfcce97072a": "YubiKey 5 Series",
  "fa2b99dc-9e39-4257-8f92-4a30d23c4118": "YubiKey 5 Series with NFC",
  "2fc0579f-8113-47ea-b116-bb5a8db9202a": "YubiKey 5 Series with NFC",
  "73bb0cd4-e502-49b8-9c6f-b59445bf720b": "YubiKey 5 FIPS Series",
  "d8522d9f-575b-4866-88a9-ba99fa02f35b": "YubiKey Bio Series",
  "f8a011f3-8c0a-4d15-8006-17111f9edc7d": "Security Key by Yubico",
  "149a2021-8ef6-4133-96b8-81f8d5b7f1f5": "Security Key NFC by Yubico",
  "bada5566-a7aa-401f-bd96-45619a55120d": "1Password",
  "d548826e-79b4-db40-a3d8-11116f7e8349": "Bitwarden",
  "531126d6-e717-415c-9320-3d9aa6981239": "Dashlane",
  "0ea242b4-43c4-4a1b-8b17-dd6d0b6baec6": "Keeper",
  "39a5647e-1853-446c-a1f6-a79bae9f5bc7": "IDmelon",
};

/** What an unresolved AAGUID says, so the miss is stated rather than hidden. */
export const AAGUID_UNKNOWN_NAME =
  "Not in this page's abridged table — a production relying party would resolve it from the FIDO Metadata Service";

/** Resolves a canonical UUID string against the compiled-in table. */
export function lookupAaguid(uuid: string): AaguidResolution {
  const known = AAGUID_REGISTRY[uuid];
  if (known) return { uuid, name: known, isKnown: true };
  return { uuid, name: AAGUID_UNKNOWN_NAME, isKnown: false };
}

/** Formats 16 raw bytes as a UUID and resolves them in one step. */
export function resolveAaguid(aaguid: Uint8Array): AaguidResolution {
  return lookupAaguid(formatUuid(aaguid));
}
