/**
 * The WebAuthn ceremony library.
 *
 * Hand-written, zero dependencies: a CBOR decoder for the CTAP2 profile, an
 * `authenticatorData` splitter, a COSE_Key parser, a DER→raw ECDSA converter,
 * an AAGUID table and a WebCrypto verification step. Nothing in here imports
 * React, touches the DOM, writes storage or opens a connection.
 *
 * Everything is imported through the section's dynamically-loaded panel, so
 * none of it reaches First Load JS.
 */

export { AAGUID_REGISTRY, AAGUID_UNKNOWN_NAME, lookupAaguid, resolveAaguid } from "./aaguid";
export {
  AUTH_DATA_FLAG_DEFINITIONS,
  AUTH_DATA_HEADER_BYTES,
  AuthDataError,
  isFlagSet,
  parseAuthData,
} from "./auth-data";
export {
  ByteFormatError,
  bytesEqual,
  concatBytes,
  formatUuid,
  fromBase64Url,
  randomBytes,
  sha256,
  toBase64Url,
  toBytes,
  toHex,
} from "./bytes";
export {
  CborError,
  asCborBytes,
  asCborMap,
  decodeCbor,
  decodeCborItem,
  decodeFloat16,
  describeCborValue,
} from "./cbor";
export { ClientDataError, parseClientData } from "./client-data";
export {
  ALG_EDDSA,
  ALG_ES256,
  ALG_RS256,
  COSE_CRV_P256,
  COSE_KTY_EC2,
  COSE_KTY_OKP,
  COSE_KTY_RSA,
  CoseError,
  describeAlgorithm,
  parseCoseKey,
} from "./cose";
export { DerError, P256_COORDINATE_BYTES, derToRawEcdsaSignature } from "./der";
export {
  KEY_WRAPPING_ID_THRESHOLD_BYTES,
  analyzeAssertion,
  analyzeCeremony,
  analyzeRegistration,
} from "./analyze";
export type {
  AssertionAnalysis,
  AttStmtEntry,
  CeremonyAnalysis,
  PersistenceVerdict,
  RegistrationAnalysis,
} from "./analyze";
export { canRunLiveCeremony, canVerifySignatures, probeEnvironment } from "./environment";
export type { CeremonyEnvironment } from "./environment";
export { describeCeremonyError } from "./errors";
export type { DescribedError } from "./errors";
export { FIELD_FLARE_DETAIL, FIELD_FLARE_EVENT, dispatchFieldFlare } from "./flare";
export {
  CEREMONY_TIMEOUT_MS,
  CHALLENGE_BYTES,
  CeremonyAbandonedError,
  runLiveCeremony,
} from "./run-ceremony";
export type { AuthenticatorAttachmentChoice, RunCeremonyOptions } from "./run-ceremony";
export { SAMPLE_CEREMONY_BASE64URL, SAMPLE_PROVENANCE, loadSampleCeremony } from "./sample";
export { VerificationError, importCoseKey, verifyAssertionSignature } from "./verify";
export type { VerificationResult } from "./verify";
export type * from "./types";
