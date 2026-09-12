import type { ReactElement } from "react";

import { CEREMONY_REGISTRATION, CEREMONY_VERDICTS } from "@/content/ceremony";
import { toBase64Url } from "@/lib/webauthn/bytes";
import { COSE_KTY_EC2, COSE_KTY_RSA } from "@/lib/webauthn/cose";
import type { RegistrationAnalysis } from "@/lib/webauthn/analyze";
import type { CeremonyExpectation, CeremonyMode } from "@/lib/webauthn/types";

import { Field } from "./Field";
import { FieldGroup } from "./FieldGroup";
import { FlagGrid } from "./FlagGrid";
import { Verdict } from "./Verdict";

/**
 * The registration half, field by field.
 *
 * Nothing here is summarised away. The depth is the proof: a hiring manager can
 * read every offset, every flag bit and every byte the authenticator returned,
 * and check them against the spec.
 */

const COPY = CEREMONY_REGISTRATION;
const KEY_WRAPPING_THRESHOLD = 64;

export interface RegistrationReportProps {
  readonly analysis: RegistrationAnalysis;
  readonly mode: CeremonyMode;
  readonly expected: CeremonyExpectation;
}

function ClientDataGroup({ analysis, mode, expected }: RegistrationReportProps): ReactElement {
  const { clientData } = analysis;

  return (
    <FieldGroup title={COPY.clientData.title} note={COPY.clientData.note}>
      <Field
        label="type"
        meta={`${analysis.clientDataByteLength} bytes of JSON total`}
        value={clientData.type}
        note={COPY.clientData.typeNote}
      />
      <Field
        label="challenge"
        meta={
          <Verdict
            tone={analysis.isChallengeEchoed ? "ok" : "fail"}
            label={
              analysis.isChallengeEchoed
                ? CEREMONY_VERDICTS.challengeEchoed
                : CEREMONY_VERDICTS.challengeMismatch
            }
          />
        }
        value={clientData.challenge}
        isRaw
        note={`${COPY.clientData.challengeNote(analysis.challengeByteLength, mode)} ${
          analysis.isChallengeEchoed
            ? COPY.clientData.challengeMatchNote
            : COPY.clientData.challengeMismatchNote(analysis.challengeSent)
        }`}
      />
      <Field
        label="origin"
        meta={
          <Verdict
            tone={analysis.isOriginExpected ? "ok" : "warn"}
            label={
              analysis.isOriginExpected
                ? CEREMONY_VERDICTS.originMatches
                : CEREMONY_VERDICTS.originDiffers
            }
          />
        }
        value={clientData.origin}
        note={
          analysis.isOriginExpected
            ? COPY.clientData.originMatchNote
            : COPY.clientData.originMismatchNote(expected.origin)
        }
      />
      <Field
        label="crossOrigin"
        value={
          clientData.crossOrigin === null ? COPY.clientData.absent : String(clientData.crossOrigin)
        }
        note={COPY.clientData.crossOriginNote}
      />
      <Field label="raw" meta="UTF-8" value={clientData.text} note={COPY.clientData.rawNote} />
    </FieldGroup>
  );
}

function AttestationGroup({ analysis }: { readonly analysis: RegistrationAnalysis }): ReactElement {
  return (
    <FieldGroup
      title={COPY.attestation.title}
      note={COPY.attestation.note(analysis.attestationObjectByteLength)}
    >
      <Field
        label="fmt"
        meta={<Verdict tone="info" label={CEREMONY_VERDICTS.attestationRequested} />}
        value={analysis.fmt}
        note={COPY.attestation.fmtNote(analysis.fmt)}
      />

      {analysis.hasAttestationStatement ? (
        analysis.attStmt.map((entry) => {
          if (entry.kind === "alg") {
            return (
              <Field
                key={entry.label}
                label={`attStmt.${entry.label}`}
                value={`${entry.alg} (${entry.info.name})`}
                note={entry.info.detail}
              />
            );
          }
          if (entry.kind === "x5c") {
            return (
              <Field
                key={entry.label}
                label={`attStmt.${entry.label}`}
                meta={`${entry.certificateLengths.length} certificate(s)`}
                value={entry.certificateLengths
                  .map((length, index) => `[${index}] ${length} bytes DER`)
                  .join("  ·  ")}
                note={COPY.attestation.x5cNote}
              />
            );
          }
          if (entry.kind === "bytes") {
            return (
              <Field
                key={entry.label}
                label={`attStmt.${entry.label}`}
                meta={entry.summary}
                bytes={entry.bytes}
              />
            );
          }
          return (
            <Field
              key={entry.label}
              label={`attStmt.${entry.label}`}
              meta={entry.summary}
              value={entry.text}
            />
          );
        })
      ) : (
        <Field label="attStmt" meta="empty map" value="{}" note={COPY.attestation.emptyNote} />
      )}

      <Field
        label="authData"
        meta={`${analysis.authDataBytes.length} bytes`}
        bytes={analysis.authDataBytes}
        note={COPY.attestation.authDataNote}
      />
    </FieldGroup>
  );
}

function CoseKeyFields({
  analysis,
}: {
  readonly analysis: RegistrationAnalysis;
}): ReactElement | null {
  const { cose } = analysis;
  if (!cose) return null;

  const descriptor = [
    cose.ktyName,
    `${cose.algInfo.name} (${cose.alg})`,
    cose.crvName,
    cose.modulusBits ? `${cose.modulusBits}-bit modulus` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(" · ");

  return (
    <>
      <Field
        label="COSE public key"
        meta={`${analysis.coseKeyByteLength} bytes of CBOR`}
        value={descriptor}
        note={COPY.authData.coseKeyNote(cose.algInfo.detail)}
      />
      {cose.kty === COSE_KTY_EC2 && cose.x && cose.y ? (
        <>
          <Field
            label="└ x coordinate"
            meta={`${cose.x.length} bytes`}
            bytes={cose.x}
            note={COPY.authData.xNote(cose.crvName ?? "this curve")}
          />
          <Field
            label="└ y coordinate"
            meta={`${cose.y.length} bytes`}
            bytes={cose.y}
            note={COPY.authData.yNote}
          />
        </>
      ) : null}
      {cose.kty === COSE_KTY_RSA && cose.n && cose.e ? (
        <>
          <Field
            label="└ modulus n"
            meta={`${cose.n.length} bytes`}
            bytes={cose.n}
            note={COPY.authData.modulusNote}
          />
          <Field
            label="└ exponent e"
            meta={`${cose.e.length} bytes`}
            bytes={cose.e}
            note={COPY.authData.exponentNote}
          />
        </>
      ) : null}
    </>
  );
}

/**
 * The fixed 37-byte header.
 *
 * Split from the attested credential data below because one combined group
 * measured 1,712px of mostly-container box (`docs/04 §3.5` A8.3): a carve that
 * large flattens the field for nearly two screens. The seam is the
 * spec's own, not a convenience: this half is present in every ceremony, the
 * half below exists only because the AT bit is set.
 */
function AuthDataHeaderGroup({ analysis, expected }: RegistrationReportProps): ReactElement {
  const { authData } = analysis;

  return (
    <FieldGroup title={COPY.authData.headerTitle} note={COPY.authData.headerNote}>
      <Field
        label="rpIdHash"
        meta={
          <Verdict
            tone={analysis.isRpIdHashExpected ? "ok" : "warn"}
            label={
              analysis.isRpIdHashExpected
                ? CEREMONY_VERDICTS.rpIdHashMatches(expected.rpId)
                : CEREMONY_VERDICTS.rpIdHashDiffers(expected.rpId)
            }
          />
        }
        bytes={authData.rpIdHash}
        note={COPY.authData.rpIdHashNote}
      />

      <Field
        label="flags"
        meta={COPY.authData.flagsMeta(
          authData.flagsByte.toString(16).padStart(2, "0"),
          authData.flagsByte.toString(2).padStart(8, "0"),
        )}
        note={COPY.authData.flagsIntro}
      >
        <FlagGrid flags={authData.flags} />
      </Field>

      <Field
        label="signCount"
        meta={COPY.authData.signCountMeta}
        value={String(authData.signCount)}
        note={
          authData.signCount === 0 ? COPY.authData.signCountZeroNote : COPY.authData.signCountNote
        }
      />
    </FieldGroup>
  );
}

/** Everything the flag bits make conditional. Present only when AT is set. */
function AttestedCredentialGroup({
  analysis,
}: {
  readonly analysis: RegistrationAnalysis;
}): ReactElement {
  return (
    <FieldGroup title={COPY.authData.credentialTitle} note={COPY.authData.credentialNote}>
      {analysis.aaguid ? (
        <Field
          label="aaguid"
          meta={
            <Verdict
              tone={analysis.aaguid.isKnown ? "ok" : "info"}
              label={
                analysis.aaguid.isKnown
                  ? CEREMONY_VERDICTS.aaguidResolved
                  : CEREMONY_VERDICTS.aaguidUnknown
              }
            />
          }
          value={analysis.aaguid.uuid}
          note={COPY.authData.aaguidNote(analysis.aaguid.name)}
        />
      ) : null}

      {analysis.credentialIdLength !== null ? (
        <Field
          label="credentialIdLength"
          meta={COPY.authData.credentialIdLengthMeta}
          value={`${analysis.credentialIdLength} bytes`}
          note={
            analysis.credentialIdLength > KEY_WRAPPING_THRESHOLD
              ? COPY.authData.credentialIdLongNote
              : COPY.authData.credentialIdShortNote
          }
        />
      ) : null}

      {analysis.credentialId ? (
        <Field
          label="credentialId"
          meta={
            analysis.doesCredentialIdMatchRawId === null ? undefined : (
              <Verdict
                tone={analysis.doesCredentialIdMatchRawId ? "ok" : "fail"}
                label={
                  analysis.doesCredentialIdMatchRawId
                    ? CEREMONY_VERDICTS.idMatchesRawId
                    : CEREMONY_VERDICTS.idDiffersRawId
                }
              />
            )
          }
          bytes={analysis.credentialId}
          note={COPY.authData.credentialIdNote(toBase64Url(analysis.credentialId))}
        />
      ) : null}

      <CoseKeyFields analysis={analysis} />

      {analysis.extensionsSummary ? (
        <Field
          label="extensions"
          meta={COPY.authData.extensionsMeta}
          value={analysis.extensionsSummary}
          note={COPY.authData.extensionsNote}
        />
      ) : null}
    </FieldGroup>
  );
}

export function RegistrationReport(props: RegistrationReportProps): ReactElement {
  return (
    <>
      <ClientDataGroup {...props} />
      <AttestationGroup analysis={props.analysis} />
      <AuthDataHeaderGroup {...props} />
      <AttestedCredentialGroup analysis={props.analysis} />
    </>
  );
}
