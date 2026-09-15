import type { ReactElement } from "react";

import { CEREMONY_ENVIRONMENT } from "@/content/ceremony";
import type { CeremonyEnvironment } from "@/lib/webauthn/environment";
import type { VerdictTone } from "@/lib/webauthn/types";

import { Field } from "./Field";
import { BLOCK_SCRIM } from "./tokens";
import { Verdict } from "./Verdict";

/**
 * Step 0 — what this browser can do.
 *
 * Every row is a silent feature test. None of them triggers an authenticator
 * prompt, which is why the panel is allowed to render on mount at all.
 */

const COPY = CEREMONY_ENVIRONMENT;
const VALUES = COPY.values;

interface Row {
  readonly label: string;
  readonly value: string;
  readonly tone: VerdictTone;
  readonly note: string;
}

function buildRows(environment: CeremonyEnvironment): readonly Row[] {
  const platformValue =
    environment.hasPlatformAuthenticator === null
      ? VALUES.unknown
      : environment.hasPlatformAuthenticator
        ? VALUES.available
        : VALUES.unavailable;

  const platformNote =
    environment.hasPlatformAuthenticator === null
      ? COPY.platform.unknown
      : environment.hasPlatformAuthenticator
        ? COPY.platform.yes
        : COPY.platform.no;

  const conditionalValue =
    environment.hasConditionalMediation === null
      ? VALUES.unknown
      : environment.hasConditionalMediation
        ? VALUES.supported
        : VALUES.unsupported;

  return [
    {
      label: COPY.secureContext.label,
      value: environment.isSecureContext ? VALUES.yes : VALUES.no,
      tone: environment.isSecureContext ? "ok" : "fail",
      note: environment.isSecureContext
        ? COPY.secureContext.yes
        : COPY.secureContext.no(environment.protocol),
    },
    {
      label: COPY.webauthn.label,
      value: environment.hasWebAuthn ? VALUES.present : VALUES.absent,
      tone: environment.hasWebAuthn ? "ok" : "fail",
      note: environment.hasWebAuthn ? COPY.webauthn.yes : COPY.webauthn.no,
    },
    {
      label: COPY.subtle.label,
      value: environment.hasSubtleCrypto ? VALUES.present : VALUES.absent,
      tone: environment.hasSubtleCrypto ? "ok" : "fail",
      note: environment.hasSubtleCrypto ? COPY.subtle.yes : COPY.subtle.no,
    },
    {
      label: COPY.platform.label,
      value: platformValue,
      tone:
        environment.hasPlatformAuthenticator === null
          ? "info"
          : environment.hasPlatformAuthenticator
            ? "ok"
            : "warn",
      note: platformNote,
    },
    {
      label: COPY.conditional.label,
      value: conditionalValue,
      tone: "info",
      note: COPY.conditional.note,
    },
  ];
}

export interface EnvironmentPanelProps {
  readonly environment: CeremonyEnvironment;
}

export function EnvironmentPanel({ environment }: EnvironmentPanelProps): ReactElement {
  // `.panel` is the design system's lit-surface recipe (`docs/04 §2.6`): the
  // two-stop radial, the masked contact ring, `--edge-lit` and `--shadow-panel`
  // as one indivisible value. `data-lit` must sit on this element and not on an
  // ancestor — the light-source loop writes `--lx` / `--ly` as percentages of
  // the element's own border box.
  return (
    <div className="panel" data-lit data-scrim={BLOCK_SCRIM}>
      {buildRows(environment).map((row) => (
        <Field
          key={row.label}
          label={row.label}
          meta={<Verdict tone={row.tone} label={row.value} />}
          note={row.note}
        />
      ))}
    </div>
  );
}
