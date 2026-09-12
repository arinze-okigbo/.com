"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from "react";

import {
  CEREMONY_A11Y,
  CEREMONY_CONTROLS,
  CEREMONY_ENVIRONMENT,
  CEREMONY_FAILURE,
  CEREMONY_IDENTITY,
  CEREMONY_STATUS,
} from "@/content/ceremony";
import { analyzeCeremony, type CeremonyAnalysis } from "@/lib/webauthn/analyze";
import {
  canRunLiveCeremony,
  probeEnvironment,
  type CeremonyEnvironment,
} from "@/lib/webauthn/environment";
import { describeCeremonyError, type DescribedError } from "@/lib/webauthn/errors";
import { dispatchFieldFlare } from "@/lib/webauthn/flare";
import { loadSampleCeremony } from "@/lib/webauthn/sample";
import { runLiveCeremony, type AuthenticatorAttachmentChoice } from "@/lib/webauthn/run-ceremony";

import { CeremonyReport } from "./CeremonyReport";
import { EnvironmentPanel } from "./EnvironmentPanel";
import {
  BLOCK_SCRIM,
  HEADING_SCRIM,
  BODY_STYLE,
  CAPTION_STYLE,
  CONTROLS_STYLE,
  LABEL_STYLE,
  MONO_STYLE,
} from "./tokens";

/**
 * The interactive ceremony.
 *
 * This module is the root of the dynamically-imported chunk: everything under
 * `@/lib/webauthn` and every report component arrives with it, and none of it
 * is in First Load JS.
 *
 * THE RULES THIS COMPONENT ENFORCES MECHANICALLY
 * - Nothing prompts on mount. `probeEnvironment()` is silent by construction,
 *   and `runLiveCeremony` is reachable only from the Run button's click.
 * - Nothing is stored. No web-storage, cookie or database call exists anywhere in
 *   this chunk; the ceremony lives in React state and dies with the tab.
 * - Nothing is sent. No network API is called from this chunk at all.
 * - Every failure falls back to the captured sample, labelled as such.
 *
 * The storage and network rules are not promises in a comment: `honesty.test.ts`
 * reads every source file of this chunk and fails if such a call ever appears.
 *
 * MOTION: this component animates nothing, so `prefers-reduced-motion` needs no
 * branch here. The one motion in the section is the field's flare, which lives
 * behind the page and is not mounted under reduced motion at all (`docs/15 §5.5`).
 */

const VERIFY_TIME_DECIMALS = 2;

type StatusTone = "idle" | "busy" | "ok" | "fail";

interface Status {
  readonly text: string;
  readonly tone: StatusTone;
}

const SEGMENTED_STYLE: CSSProperties = {
  display: "inline-flex",
  // A control boundary over the field takes --color-border-interactive and
  // nothing else: --color-border is remapped to --field-rule (1.16:1) inside
  // .stage and is decorative only.
  border: "1px solid var(--color-border-interactive)",
  borderRadius: "var(--radius-sm)",
  overflow: "hidden",
};

function segmentStyle(isPressed: boolean): CSSProperties {
  return {
    border: "none",
    borderRadius: 0,
    background: isPressed ? "var(--color-accent-tint)" : "transparent",
    color: isPressed ? "var(--color-accent)" : "var(--color-foreground-secondary)",
    fontFamily: "var(--font-sans)",
    fontSize: "var(--text-caption)",
    padding: "var(--rhythm-meta) var(--rhythm-title)",
    cursor: "pointer",
    minHeight: "44px",
  };
}

function statusColor(tone: StatusTone): string {
  if (tone === "ok") return "var(--color-accent)";
  if (tone === "fail") return "var(--color-foreground-strong)";
  return "var(--color-foreground-secondary)";
}

/** Resolves a thrown value to the sentence that explains it. */
function explain(error: DescribedError): string {
  return CEREMONY_FAILURE.byName[error.name] ?? error.detail ?? CEREMONY_FAILURE.unknown;
}

export function CeremonyPanel(): ReactElement {
  const [environment, setEnvironment] = useState<CeremonyEnvironment | null>(null);
  const [attachment, setAttachment] = useState<AuthenticatorAttachmentChoice>("platform");
  const [status, setStatus] = useState<Status>({ text: CEREMONY_STATUS.idle, tone: "idle" });
  const [isBusy, setIsBusy] = useState(false);
  const [analysis, setAnalysis] = useState<CeremonyAnalysis | null>(null);
  const [failure, setFailure] = useState<DescribedError | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isCancelled = false;

    // Silent. Every call inside probeEnvironment is a feature test or an
    // availability question — none of them shows an authenticator prompt.
    void probeEnvironment().then((probed) => {
      if (isCancelled) return;
      setEnvironment(probed);
      if (!probed.isSecureContext) {
        setStatus({ text: CEREMONY_STATUS.insecure, tone: "fail" });
      } else if (!probed.hasWebAuthn) {
        setStatus({ text: CEREMONY_STATUS.noApi, tone: "fail" });
      } else if (probed.hasPlatformAuthenticator === false) {
        setStatus({ text: CEREMONY_STATUS.idleNoPlatform, tone: "idle" });
      }
    });

    return () => {
      isCancelled = true;
      abortRef.current?.abort();
    };
  }, []);

  const replaySample = useCallback(async (): Promise<void> => {
    try {
      const replayed = await analyzeCeremony(loadSampleCeremony());
      setAnalysis(replayed);
      setStatus({
        text: CEREMONY_STATUS.sampleReplayed(
          (replayed.assertion?.verification.elapsedMs ?? 0).toFixed(VERIFY_TIME_DECIMALS),
        ),
        tone: replayed.assertion?.verification.isValid ? "ok" : "fail",
      });
    } catch (error) {
      setFailure(describeCeremonyError(error));
      setStatus({ text: CEREMONY_STATUS.sampleFailed, tone: "fail" });
    }
  }, []);

  const onReplaySample = useCallback((): void => {
    setIsBusy(true);
    setAnalysis(null);
    setFailure(null);
    void replaySample().finally(() => setIsBusy(false));
  }, [replaySample]);

  const onRun = useCallback((): void => {
    const controller = new AbortController();
    abortRef.current = controller;

    setIsBusy(true);
    setAnalysis(null);
    setFailure(null);
    setStatus({ text: CEREMONY_STATUS.creating, tone: "busy" });

    const run = async (): Promise<void> => {
      try {
        const input = await runLiveCeremony({
          attachment,
          signal: controller.signal,
          relyingPartyName: CEREMONY_IDENTITY.relyingPartyName,
          userLabel: CEREMONY_IDENTITY.userLabel,
          userDisplayName: CEREMONY_IDENTITY.userDisplayName,
          onRegistered: () => setStatus({ text: CEREMONY_STATUS.asserting, tone: "busy" }),
        });

        setStatus({ text: CEREMONY_STATUS.parsing, tone: "busy" });
        const completed = await analyzeCeremony(input);
        setAnalysis(completed);

        const isVerified = completed.assertion?.verification.isValid === true;
        setStatus(
          isVerified
            ? {
                text: CEREMONY_STATUS.verified(
                  completed.assertion?.verification.elapsedMs.toFixed(VERIFY_TIME_DECIMALS) ?? "0",
                ),
                tone: "ok",
              }
            : { text: CEREMONY_STATUS.notVerified, tone: "fail" },
        );

        // The one authored moment. Fired once, on the visitor's own verified
        // ceremony only — never on a failure, and never for the replayed
        // sample, whose success is the capture harness's rather than theirs.
        if (isVerified) dispatchFieldFlare();
      } catch (error) {
        const described = describeCeremonyError(error);
        setFailure(described);
        setStatus({ text: CEREMONY_STATUS.failed(described.name), tone: "fail" });
        // Any failure still teaches: fall back to the captured sample, labelled.
        await replaySample();
      } finally {
        abortRef.current = null;
        setIsBusy(false);
      }
    };

    void run();
  }, [attachment, replaySample]);

  const onCancel = useCallback((): void => {
    if (!abortRef.current) return;
    setStatus({ text: CEREMONY_STATUS.cancelling, tone: "busy" });
    abortRef.current.abort(new DOMException("Cancelled from the page", "AbortError"));
  }, []);

  const onClear = useCallback((): void => {
    setAnalysis(null);
    setFailure(null);
    setStatus({ text: CEREMONY_STATUS.cleared, tone: "idle" });
  }, []);

  const isLiveAvailable = environment !== null && canRunLiveCeremony(environment);
  const runLabel = !environment
    ? CEREMONY_CONTROLS.run
    : !environment.isSecureContext
      ? CEREMONY_CONTROLS.runUnavailableInsecure
      : !environment.hasWebAuthn
        ? CEREMONY_CONTROLS.runUnavailableNoApi
        : CEREMONY_CONTROLS.run;

  return (
    <div aria-busy={isBusy}>
      {/* Scrims sit on blocks, never on an ancestor that spans the section:
          this panel grows past 4,000px once results render, and one rect around
          all of it would carve the field to its floor for the whole length. */}
      {/* The probe and the attachment selector are diagnostics about the
          visitor's own browser, not the section's evidence, and they exist only
          once script has run — so `docs/05 §3.3a`'s resting budget puts them
          behind their own native `details` rather than in the resting state.
          The default (`platform`) is the right one for almost everyone, so
          nobody has to open this to run the ceremony. */}
      <details style={{ marginBlockStart: "var(--rhythm-entry)" }}>
        {/* The summary carries its OWN carve. It is a text block over the field
            like any other (A8.3), and the `details` around it is not one — a
            scrim there would be the container-shaped rect A8.3 forbids, and
            `isLeafScrim` would then skip both. Without this the string rendered
            in `--color-accent` directly on the brightest part of the lattice:
            gold on gold, measured 1.98:1, well under A8.4's 4.5 floor. Every
            `summary` over the field needs one for the same reason. */}
        <summary
          data-scrim={HEADING_SCRIM}
          style={{
            ...LABEL_STYLE,
            cursor: "pointer",
            minBlockSize: "44px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {CEREMONY_ENVIRONMENT.summary}
        </summary>

        <p
          data-scrim={BLOCK_SCRIM}
          style={{ ...CAPTION_STYLE, marginBlockStart: "var(--rhythm-title)" }}
        >
          {CEREMONY_ENVIRONMENT.note}
        </p>

        <div style={{ marginBlockStart: "var(--rhythm-title)" }}>
          {environment ? <EnvironmentPanel environment={environment} /> : null}
        </div>

        <div style={CONTROLS_STYLE} data-scrim={BLOCK_SCRIM}>
          <span
            id="ceremony-attachment-label"
            style={{ ...CAPTION_STYLE, color: "var(--color-foreground-muted)" }}
          >
            {CEREMONY_CONTROLS.attachmentLabel}
          </span>
          <div style={SEGMENTED_STYLE} role="group" aria-labelledby="ceremony-attachment-label">
            <button
              type="button"
              style={segmentStyle(attachment === "platform")}
              aria-pressed={attachment === "platform"}
              onClick={() => setAttachment("platform")}
            >
              {CEREMONY_CONTROLS.attachmentPlatform}
            </button>
            <button
              type="button"
              style={segmentStyle(attachment === "any")}
              aria-pressed={attachment === "any"}
              onClick={() => setAttachment("any")}
            >
              {CEREMONY_CONTROLS.attachmentAny}
            </button>
          </div>
        </div>
      </details>

      <div data-scrim={BLOCK_SCRIM}>
        <div style={CONTROLS_STYLE}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onRun}
            disabled={isBusy || !isLiveAvailable}
          >
            {runLabel}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onReplaySample}
            disabled={isBusy}
          >
            {CEREMONY_CONTROLS.sample}
          </button>
          {isBusy ? (
            <button type="button" className="btn btn--secondary" onClick={onCancel}>
              {CEREMONY_CONTROLS.cancel}
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClear}
            disabled={isBusy || (!analysis && !failure)}
          >
            {CEREMONY_CONTROLS.clear}
          </button>
        </div>

        <p
          role="status"
          aria-live="polite"
          aria-label={CEREMONY_A11Y.statusLabel}
          style={{
            ...MONO_STYLE,
            marginBlockStart: "var(--rhythm-title)",
            minHeight: "1.5em",
            color: statusColor(status.tone),
          }}
        >
          {status.text}
        </p>
      </div>

      {failure ? (
        <div
          data-scrim={BLOCK_SCRIM}
          style={{
            marginBlockStart: "var(--rhythm-title)",
            padding: "var(--rhythm-title)",
            border: "1px solid var(--color-border-interactive)",
            borderInlineStart: "2px solid var(--color-foreground-strong)",
            borderRadius: "var(--radius-sm)",
            maxWidth: "var(--measure-prose)",
          }}
        >
          <p style={{ ...BODY_STYLE, color: "var(--color-foreground)" }}>
            <strong style={{ color: "var(--color-foreground-strong)" }}>{failure.name} — </strong>
            {explain(failure)}
          </p>
          <p style={{ ...CAPTION_STYLE, marginBlockStart: "var(--rhythm-meta)" }}>
            {CEREMONY_FAILURE.fallbackNote}
          </p>
        </div>
      ) : null}

      <div aria-label={CEREMONY_A11Y.resultsLabel} role="region">
        {analysis ? <CeremonyReport analysis={analysis} /> : null}
      </div>
    </div>
  );
}

export default CeremonyPanel;
