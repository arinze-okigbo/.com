import type { ReactElement } from "react";

import { CEREMONY_ASSERTION, CEREMONY_VERDICTS } from "@/content/ceremony";
import { toHex } from "@/lib/webauthn/bytes";
import { COSE_KTY_EC2 } from "@/lib/webauthn/cose";
import type { AssertionAnalysis } from "@/lib/webauthn/analyze";
import type { ParsedCoseKey } from "@/lib/webauthn/types";

import { Field } from "./Field";
import { FieldGroup } from "./FieldGroup";
import { FlagGrid } from "./FlagGrid";
import { Verdict } from "./Verdict";

/**
 * The assertion and the verification.
 *
 * The second ceremony: a fresh challenge, the same credential, and
 * `crypto.subtle.verify` against the public key parsed out of the attestation
 * object above. That is the loop closing in front of the visitor.
 */

const COPY = CEREMONY_ASSERTION;
const VERIFY_TIME_DECIMALS = 3;

export interface AssertionReportProps {
  readonly analysis: AssertionAnalysis;
  readonly cose: ParsedCoseKey;
  readonly registrationSignCount: number;
}

export function AssertionReport({
  analysis,
  cose,
  registrationSignCount,
}: AssertionReportProps): ReactElement {
  const isEcdsa = cose.kty === COSE_KTY_EC2;
  const { verification } = analysis;

  return (
    <>
      <FieldGroup title={COPY.title} note={COPY.note}>
        <Field label="type" value={analysis.clientData.type} note={COPY.typeNote} />

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
          value={analysis.clientData.challenge}
          isRaw
          note={COPY.challengeNote(analysis.challengeByteLength)}
        />

        <Field
          label="flags"
          meta={`0x${analysis.authData.flagsByte.toString(16).padStart(2, "0")}`}
          note={COPY.flagsNote}
        >
          <FlagGrid flags={analysis.authData.flags} />
        </Field>

        <Field
          label="signCount"
          value={String(analysis.authData.signCount)}
          note={COPY.signCountNote(registrationSignCount)}
        />
      </FieldGroup>

      {/* Split from the group above: one combined block measured 1,152px, and a
          carve that large flattens the field for its whole length. */}
      <FieldGroup title={COPY.signatureTitle} note={COPY.signatureGroupNote}>
        <Field
          label="signature"
          meta={`${analysis.signature.length} bytes, ${
            isEcdsa ? COPY.signatureMetaEcdsa : COPY.signatureMetaRsa
          }`}
          bytes={analysis.signature}
          note={isEcdsa ? COPY.signatureNoteEcdsa : COPY.signatureNoteRsa}
        />

        <Field
          label="signed bytes"
          meta={`${verification.signedBytes.length} bytes`}
          value={COPY.signedBytesValue(analysis.authData.raw.length)}
          note={COPY.signedBytesNote(toHex(verification.clientDataHash))}
        />
      </FieldGroup>

      <FieldGroup title={COPY.resultTitle} note={COPY.resultNote}>
        <Field
          label="crypto.subtle.verify"
          meta={
            <Verdict
              tone={verification.isValid ? "ok" : "fail"}
              label={
                verification.isValid
                  ? CEREMONY_VERDICTS.signatureValid
                  : CEREMONY_VERDICTS.signatureInvalid
              }
            />
          }
          value={String(verification.isValid)}
          note={verification.isValid ? COPY.validNote : COPY.invalidNote}
        />
        <Field
          label="algorithm"
          value={verification.algorithmName}
          note={COPY.algorithmNote(cose.alg, cose.algInfo.name)}
        />
        <Field
          label="verify time"
          value={`${verification.elapsedMs.toFixed(VERIFY_TIME_DECIMALS)} ms`}
          note={COPY.verifyTimeNote}
        />
      </FieldGroup>
    </>
  );
}
