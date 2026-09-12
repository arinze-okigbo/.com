/**
 * The capability probe.
 *
 * Runs on mount and triggers no prompt of any kind: every call below is a
 * feature test or an availability question the spec defines as silent.
 * `isConditionalMediationAvailable()` is probed and reported but never used —
 * autofill-driven prompts would break this section's "nothing prompts without
 * an explicit click" rule.
 */

export interface CeremonyEnvironment {
  /** HTTPS or localhost. WebAuthn and SubtleCrypto both require it. */
  readonly isSecureContext: boolean;
  readonly hasWebAuthn: boolean;
  readonly hasSubtleCrypto: boolean;
  /** `null` when the browser declined to answer. */
  readonly hasPlatformAuthenticator: boolean | null;
  readonly hasConditionalMediation: boolean | null;
  /** The page's protocol, quoted back when the context is insecure. */
  readonly protocol: string;
}

/** Can a live ceremony even be attempted? Sample replay has a lower bar. */
export function canRunLiveCeremony(environment: CeremonyEnvironment): boolean {
  return environment.isSecureContext && environment.hasWebAuthn;
}

/** Can anything be verified? Without SubtleCrypto, not even the sample. */
export function canVerifySignatures(environment: CeremonyEnvironment): boolean {
  return environment.hasSubtleCrypto;
}

async function askQuietly(probe: () => Promise<boolean>): Promise<boolean | null> {
  try {
    return await probe();
  } catch {
    // A browser that refuses to answer is reported as "unknown", never as
    // "unavailable" — the difference matters to the visitor reading this.
    return null;
  }
}

/** Probes the browser. Never prompts, never throws. */
export async function probeEnvironment(): Promise<CeremonyEnvironment> {
  const isSecureContext = window.isSecureContext === true;
  const hasWebAuthn =
    typeof window.PublicKeyCredential === "function" &&
    typeof navigator.credentials?.create === "function";
  const hasSubtleCrypto = Boolean(window.crypto?.subtle);

  const hasPlatformAuthenticator =
    hasWebAuthn &&
    typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
      ? await askQuietly(() => PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
      : null;

  const hasConditionalMediation =
    hasWebAuthn && typeof PublicKeyCredential.isConditionalMediationAvailable === "function"
      ? await askQuietly(() => PublicKeyCredential.isConditionalMediationAvailable())
      : null;

  return {
    isSecureContext,
    hasWebAuthn,
    hasSubtleCrypto,
    hasPlatformAuthenticator,
    hasConditionalMediation,
    protocol: window.location.protocol,
  };
}
