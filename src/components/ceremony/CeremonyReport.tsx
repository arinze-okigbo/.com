import type { CSSProperties, ReactElement } from "react";

import {
  CEREMONY_ASSERTION,
  CEREMONY_FAILURE,
  CEREMONY_PERSISTENCE,
  CEREMONY_REGISTRATION,
  CEREMONY_SAMPLE_BANNER,
} from "@/content/ceremony";
import type { CeremonyAnalysis } from "@/lib/webauthn/analyze";

import { AssertionReport } from "./AssertionReport";
import { Field } from "./Field";
import { FieldGroup } from "./FieldGroup";
import { RegistrationReport } from "./RegistrationReport";
import { BLOCK_SCRIM, BODY_STYLE, CAPTION_STYLE, LABEL_STYLE, MONO_STYLE } from "./tokens";

/**
 * One rendering path for both a live ceremony and the replayed sample.
 *
 * A sample is never rendered without its banner. That is the honesty rule with
 * the sharpest edge: a visitor must always be able to tell whose authenticator
 * produced the bytes they are reading.
 */

const STEP_STYLE: CSSProperties = {
  marginBlockStart: "var(--rhythm-heading)",
  paddingBlockStart: "var(--rhythm-entry)",
  borderBlockStart: "1px solid var(--color-border-subtle)",
};

const HEADING_STYLE: CSSProperties = {
  margin: 0,
  marginBlockStart: "var(--rhythm-meta)",
  fontSize: "var(--text-lead)",
  lineHeight: "var(--text-lead--line-height)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-foreground-strong)",
};

const BANNER_STYLE: CSSProperties = {
  marginBlockStart: "var(--rhythm-title)",
  padding: "var(--rhythm-title)",
  border: "1px dashed var(--color-border-interactive)",
  borderRadius: "var(--radius-sm)",
  ...CAPTION_STYLE,
  maxWidth: "var(--measure-prose)",
};

const KV_STYLE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--rhythm-meta) var(--rhythm-entry)",
  marginBlockStart: "var(--rhythm-title)",
  ...MONO_STYLE,
  fontSize: "var(--text-caption)",
  color: "var(--color-foreground-muted)",
};

const ROUND_TRIP_DECIMALS = 0;

export interface CeremonyReportProps {
  readonly analysis: CeremonyAnalysis;
}

function persistenceNote(analysis: CeremonyAnalysis): string {
  if (analysis.persistence === "synced-passkey") return CEREMONY_PERSISTENCE.syncedNote;
  if (analysis.persistence === "key-wrapped") {
    return CEREMONY_PERSISTENCE.wrappedNote(analysis.registration.credentialIdLength ?? 0);
  }
  return CEREMONY_PERSISTENCE.unknownNote;
}

export function CeremonyReport({ analysis }: CeremonyReportProps): ReactElement {
  const { input, registration, assertion } = analysis;
  const isSample = input.mode === "sample";

  return (
    <>
      <section style={STEP_STYLE}>
        <div data-scrim={BLOCK_SCRIM}>
          <p style={LABEL_STYLE}>
            {isSample ? CEREMONY_REGISTRATION.sampleEyebrow : CEREMONY_REGISTRATION.liveEyebrow}
          </p>
          <h3 style={HEADING_STYLE}>
            {isSample ? CEREMONY_REGISTRATION.sampleHeading : CEREMONY_REGISTRATION.liveHeading}
          </h3>

          {isSample && input.provenance ? (
            <p style={BANNER_STYLE}>
              <strong style={{ color: "var(--color-foreground-strong)" }}>
                {CEREMONY_SAMPLE_BANNER.lead}
              </strong>{" "}
              {CEREMONY_SAMPLE_BANNER.body(
                input.provenance.capturedAt,
                input.provenance.authenticator,
                input.provenance.origin,
              )}
            </p>
          ) : null}

          <dl style={KV_STYLE}>
            <div>
              <dt style={{ display: "inline" }}>RP ID: </dt>
              <dd style={{ display: "inline", margin: 0, color: "var(--color-foreground)" }}>
                {input.expected.rpId}
              </dd>
            </div>
            <div>
              <dt style={{ display: "inline" }}>origin: </dt>
              <dd style={{ display: "inline", margin: 0, color: "var(--color-foreground)" }}>
                {input.expected.origin}
              </dd>
            </div>
            {input.registrationMs === null ? null : (
              <div>
                <dt style={{ display: "inline" }}>create() round trip: </dt>
                <dd style={{ display: "inline", margin: 0, color: "var(--color-foreground)" }}>
                  {input.registrationMs.toFixed(ROUND_TRIP_DECIMALS)} ms
                </dd>
              </div>
            )}
            {input.registration.authenticatorAttachment === null ? null : (
              <div>
                <dt style={{ display: "inline" }}>attachment: </dt>
                <dd style={{ display: "inline", margin: 0, color: "var(--color-foreground)" }}>
                  {input.registration.authenticatorAttachment}
                </dd>
              </div>
            )}
            {input.registration.transports === null ? null : (
              <div>
                <dt style={{ display: "inline" }}>transports: </dt>
                <dd style={{ display: "inline", margin: 0, color: "var(--color-foreground)" }}>
                  {input.registration.transports.join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <RegistrationReport analysis={registration} mode={input.mode} expected={input.expected} />
      </section>

      {registration.cose && assertion ? (
        <section style={STEP_STYLE}>
          <div data-scrim={BLOCK_SCRIM}>
            <p style={LABEL_STYLE}>
              {isSample ? CEREMONY_ASSERTION.sampleEyebrow : CEREMONY_ASSERTION.liveEyebrow}
            </p>
            <h3 style={HEADING_STYLE}>{CEREMONY_ASSERTION.liveHeading}</h3>
            <p style={{ ...BODY_STYLE, marginBlockStart: "var(--rhythm-meta)" }}>
              {isSample ? CEREMONY_ASSERTION.sampleNote : CEREMONY_ASSERTION.liveNote}
            </p>
          </div>

          <AssertionReport
            analysis={assertion}
            cose={registration.cose}
            registrationSignCount={registration.authData.signCount}
          />

          <FieldGroup title={CEREMONY_PERSISTENCE.title}>
            <Field
              label={CEREMONY_PERSISTENCE.pageLabel}
              value={CEREMONY_PERSISTENCE.pageValue}
              note={CEREMONY_PERSISTENCE.pageNote}
            />
            <Field
              label={CEREMONY_PERSISTENCE.authenticatorLabel}
              value={
                analysis.persistence === "synced-passkey"
                  ? CEREMONY_PERSISTENCE.persistsValue
                  : CEREMONY_PERSISTENCE.discardedValue
              }
              note={persistenceNote(analysis)}
            />
          </FieldGroup>
        </section>
      ) : (
        <p
          data-scrim={BLOCK_SCRIM}
          style={{ ...BODY_STYLE, marginBlockStart: "var(--rhythm-title)" }}
        >
          {CEREMONY_FAILURE.noAttestedCredentialData}
        </p>
      )}
    </>
  );
}
