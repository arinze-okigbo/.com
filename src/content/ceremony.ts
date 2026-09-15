import type { SectionCopy } from "@/content/types";

/**
 * The ceremony section — `docs/15 §3`, position 4.
 *
 * Every word a visitor reads in `#ceremony` is here. `@/lib/webauthn` decides
 * what is *true*; this file decides how it is *said*. That split is what lets
 * the parsers be unit-tested against fixed bytes with no strings in the way.
 *
 * THE HONESTY COPY IS NOT DECORATION.
 * `docs/15 §7 R7`: this section sits one after `#attestation`, which says its
 * signature "encrypts nothing and secures nothing". This one is a real
 * credential ceremony — and it is still a *demonstration*, because the
 * challenge is generated client-side. Both facts are stated plainly and
 * neither may be softened. Removing the client-side-challenge disclosure turns
 * an honest demo into a false security claim to the exact audience most able
 * to notice.
 */

export const CEREMONY: SectionCopy = {
  id: "ceremony",
  headingId: "ceremony-heading",
  heading: "A WebAuthn ceremony runs here, on your device, and this page decodes every byte of it.",
  /**
   * `null` at rest by `docs/05 §3.3a`. This paragraph is not cut — it opens the
   * disclosure as `CEREMONY_METHOD`, still server-rendered and still in the
   * initial DOM. The resting state is heading, bridge, button and one line.
   */
  intro: null,
};

/**
 * The §7 R7 bridge — `docs/05 §3.3a`, verbatim, above the button, at rest.
 *
 * ALWAYS EXPANDED, AND RULED SO. It was proposed for the disclosure to recover
 * 139px of resting height, and `information-architecture` rejected the move and
 * amended the budget instead: the second half carries what pressing the button
 * does, the string "WebAuthn/FIDO2", and the tie back to the Queralt entry at
 * position 2. `docs/03` A3 has evaluators skimming for technology keywords and
 * reading the prose around them, and B4.1 calls moving protocol nouns *up* the
 * highest-value structural edit on this page — collapsing the highest-value
 * keyword into a closed `<details>` is that edit in reverse.
 *
 * The opening sentence REPEATS `docs/05 §3.3`'s disclaimer rather than softening
 * it. That repetition is the mechanism: it is what stops the adjacency to the
 * attestation figure reading as a retraction of that figure's honesty note.
 *
 * TWO TIGHTENINGS THAT ARE DELIBERATE, not damage to be repaired: "verifies it
 * here", not "in this tab"; and "This is not.", not "This is not decoration."
 *
 * The Queralt entry is named as being *above*, never claimed as the same
 * artifact: `docs/00` sources WebAuthn as one of the integration pathways
 * analysed there, not as this demonstration.
 */
export const CEREMONY_BRIDGE =
  "The field above is decoration with real bytes behind it. This is not. Press the button and your own authenticator creates a credential, signs a challenge, and verifies it here — WebAuthn/FIDO2, the protocol named in the Queralt entry above.";

/**
 * The one honesty line that never collapses.
 *
 * `docs/05 §3.3a` puts the three-item notice behind the disclosure, and the
 * full text is still there. This single line is not: the claim that the
 * challenge is client-side — that this is a demonstration and not
 * authentication — is the one sentence that must be true and visible at rest,
 * because a security reader who runs the ceremony and never opens a disclosure
 * must still not be able to mistake what they saw.
 *
 * RULED, not merely tolerated. §3.3a carries a row for this line and records
 * that the table previously said otherwise. It is also refused as a height
 * lever **permanently**: trimming it buys 25–40px against debts several times
 * that, so it is the cut that hurts and misses. Do not offer it again.
 */
export const CEREMONY_RESTING_CAVEAT =
  "The challenge is generated client-side, so this demonstrates the protocol rather than authenticating you to anything. Nothing is stored and nothing leaves your browser.";

/** Opens the disclosure. Was the section intro; unchanged wording. */
export const CEREMONY_METHOD =
  "Your own authenticator — Touch ID, Windows Hello, a security key — prompts. What comes back is a CBOR attestation object and a COSE public key. This page decodes both byte by byte, then asks the same credential to sign a fresh challenge and verifies that signature in your browser with WebCrypto. No libraries, no network, no server.";

/**
 * The disclosure — `docs/05 §3.3a`, three hard constraints.
 *
 * 1. A native `<details>`/`<summary>`, server-rendered. Not a JS accordion:
 *    `docs/04 §8.5` refuses a Disclosure *component* for content, R30/R4 need
 *    every word in the initial DOM and surviving a JS-disabled render, and R34
 *    needs the information reachable without interaction. Native `<details>`
 *    is the only construction that satisfies all three — the words stay in the
 *    DOM, in-page search finds them, and assistive tech is told it is there.
 * 2. `summary` is information-bearing [R12]. Never "Show more".
 * 3. The captured sample exists FOR the visitor who cannot run the ceremony —
 *    no platform authenticator, JavaScript off, a locked-down work laptop. If a
 *    disclosure ever breaks that path, the disclosure is wrong, not the path.
 */
export const CEREMONY_DISCLOSURE = {
  summary: "A captured ceremony, decoded field by field",
  /** Named for the reader who cannot run one, so they know this is for them. */
  note: "Every value below is the real output of a real ceremony, captured once and decoded by the same parsers. It is here for anyone who cannot run one — no platform authenticator enrolled, JavaScript off, or a machine that will not allow it — and it is server-rendered, so it reads with no script at all.",
} as const;

/** Read this first — the three claims the whole section stands on. */
export const CEREMONY_NOTICE = {
  heading: "Read this first",
  items: [
    {
      lead: "This is a demonstration, not authentication.",
      body: "The challenge is generated client-side, in this page. A real relying party generates the challenge on the server, stores it, and verifies the attestation and the assertion signature server-side against that stored value. Nothing verified in a browser tab proves anything to a server — the client is exactly what an attacker controls.",
    },
    {
      lead: "Nothing is stored and nothing leaves your browser.",
      body: "This section makes zero network requests: no analytics, no CDN, no fetch of the FIDO Metadata Service. Ceremony output lives in a JavaScript variable and dies with the tab. Nothing is written to localStorage, sessionStorage or IndexedDB.",
    },
    {
      lead: "The credential is requested as non-discoverable.",
      body: 'With residentKey: "discouraged", most authenticators wrap the private key into the credential ID itself and keep no entry on the device. Some platform authenticators — notably iCloud Keychain under Safari, and Chrome\'s profile-bound Touch ID authenticator — create a discoverable passkey anyway. If yours does, you will see an entry for this site in your password manager and can delete it there. This page will tell you which happened.',
    },
  ],
} as const;

/** Identity presented to the authenticator. No personal data reaches it. */
export const CEREMONY_IDENTITY = {
  relyingPartyName: "Arinze Okigbo — WebAuthn demonstration",
  userLabel: "webauthn-demo",
  userDisplayName: "WebAuthn demonstration",
} as const;

/** The controls. Every one is reachable and operable from the keyboard alone. */
export const CEREMONY_CONTROLS = {
  attachmentLabel: "Authenticator",
  attachmentPlatform: "Platform (Touch ID / Hello)",
  attachmentAny: "Any (including security key)",
  run: "Run the ceremony",
  runUnavailableInsecure: "Unavailable — insecure context",
  runUnavailableNoApi: "Unavailable — no WebAuthn",
  sample: "Replay the captured sample",
  cancel: "Cancel the ceremony",
  clear: "Clear the results",
  showPanel: "Load the interactive ceremony",
  showPanelHint:
    "Loads roughly 20 kB of JavaScript on demand. Nothing prompts until you press Run.",
} as const;

/** Status-line copy. This live region is the primary result signal. */
export const CEREMONY_STATUS = {
  idle: "Ready. Nothing has prompted — the ceremony only starts when you press the button.",
  idleNoPlatform:
    'No platform authenticator is enrolled. Switch the selector to "Any" and use a security key, or replay the captured sample.',
  insecure:
    "WebAuthn needs HTTPS or localhost. The captured sample below still works if SubtleCrypto is available.",
  noApi: "This browser has no WebAuthn API. Replay the captured sample to see the explanation.",
  loading: "Loading the ceremony code…",
  creating: "Requesting a credential — your authenticator should prompt now.",
  asserting: "Credential created. Asking it to sign a fresh challenge.",
  parsing: "Parsing and verifying.",
  cancelling: "Cancelling.",
  verified: (ms: string): string => `Done. Signature verified in ${ms} ms.`,
  notVerified: "Done, but the signature did not verify — see the result below.",
  failed: (name: string): string =>
    `Ceremony failed: ${name}. Falling back to the captured sample.`,
  sampleReplayed: (ms: string): string =>
    `Captured sample replayed. Signature verified live in ${ms} ms.`,
  sampleFailed: "The captured sample could not be replayed.",
  cleared: "Results cleared. Nothing has prompted.",
} as const;

/** Step 0 — the capability probe. None of these checks trigger a prompt. */
export const CEREMONY_ENVIRONMENT = {
  heading: "What this browser can do",
  /**
   * The probe and the authenticator selector sit behind their own `<details>`,
   * for the resting-height budget in `docs/05 §3.3a`. They are diagnostics
   * about the visitor's own browser rather than the section's evidence, they
   * exist only once script has run, and the summary names what is inside [R12].
   */
  summary: "What this browser can do, and which authenticator to use",
  note: "Probed on load. None of these checks trigger a prompt.",
  secureContext: {
    label: "Secure context",
    yes: "WebAuthn and SubtleCrypto both require HTTPS, or localhost.",
    no: (protocol: string): string =>
      `This page is on ${protocol}. WebAuthn will refuse to run and crypto.subtle does not exist. Open it over https:// or http://localhost.`,
  },
  webauthn: {
    label: "WebAuthn API",
    yes: "window.PublicKeyCredential and navigator.credentials.create are available.",
    no: "This browser does not expose the Web Authentication API. Only the captured sample can be shown.",
  },
  subtle: {
    label: "WebCrypto SubtleCrypto",
    yes: "Signature verification will run locally.",
    no: "Without SubtleCrypto no verification is possible in this context.",
  },
  platform: {
    label: "Platform authenticator",
    yes: "Touch ID, Windows Hello, Android screen lock or equivalent is enrolled and will prompt.",
    no: 'No user-verifying platform authenticator is enrolled. Switch the selector to "Any" and use a security key, or replay the captured sample.',
    unknown: "This browser did not answer isUserVerifyingPlatformAuthenticatorAvailable().",
  },
  conditional: {
    label: "Conditional mediation",
    note: 'Conditional UI is how passkeys appear in the browser\'s autofill dropdown. This section does not use it — an autofill-driven prompt would violate the "nothing prompts without an explicit click" rule here.',
  },
  values: {
    yes: "yes",
    no: "no",
    present: "present",
    absent: "absent",
    available: "available",
    unavailable: "not available",
    supported: "supported",
    unsupported: "not supported",
    unknown: "unknown",
  },
} as const;

/** Verdict chip labels. Always words — colour is never the only signal. */
export const CEREMONY_VERDICTS = {
  challengeEchoed: "echoes the bytes we sent",
  challengeMismatch: "MISMATCH",
  originMatches: "matches this page",
  originDiffers: "differs from this page",
  rpIdHashMatches: (rpId: string): string => `= SHA-256("${rpId}")`,
  rpIdHashDiffers: (rpId: string): string => `does not match ${rpId}`,
  aaguidResolved: "resolved",
  aaguidUnknown: "unknown model",
  idMatchesRawId: "identical to credential.rawId",
  idDiffersRawId: "differs from rawId",
  attestationRequested: "requested: direct",
  signatureValid: "signature valid",
  signatureInvalid: "signature INVALID",
} as const;

/** The registration report. */
export const CEREMONY_REGISTRATION = {
  liveEyebrow: "Step 1",
  liveHeading: "What your authenticator returned",
  sampleEyebrow: "Sample",
  sampleHeading: "A captured ceremony, replayed",

  clientData: {
    title: "clientDataJSON — what the browser swears it saw",
    note: "The browser builds this, not the authenticator, and the authenticator signs a SHA-256 hash of it. It is how the relying party learns which origin the ceremony actually happened on.",
    typeNote:
      "webauthn.create for registration, webauthn.get for authentication. A server must check this, or a registration response could be replayed into a login.",
    challengeNote: (byteLength: number, mode: "live" | "sample"): string =>
      `base64url of the ${byteLength} random bytes generated by ${
        mode === "sample" ? "the capture harness" : "crypto.getRandomValues in this tab"
      }.`,
    challengeMatchNote:
      "Byte for byte what we sent — the authenticator signed over our challenge, which is what makes a replayed response detectable.",
    challengeMismatchNote: (sent: string): string =>
      `We sent ${sent}. This does not match, which a server would reject.`,
    originMatchNote:
      "This is WebAuthn's phishing resistance in one line: the browser writes the true origin, the authenticator signs over it, and a look-alike domain cannot forge it.",
    originMismatchNote: (expected: string): string =>
      `Expected ${expected}. For a replayed sample this is normal — the ceremony was captured on a different origin.`,
    crossOriginNote:
      "True if the ceremony ran inside a cross-origin iframe. A relying party generally refuses those.",
    rawNote:
      "Servers must hash these exact bytes rather than re-serialising the parsed JSON — key order and whitespace are not guaranteed to round-trip.",
    absent: "(absent)",
  },

  attestation: {
    title: "attestationObject — CBOR, decoded",
    note: (byteLength: number): string =>
      `${byteLength} bytes of CBOR containing three keys. Decoded by a hand-written CBOR decoder in this page; no library is loaded.`,
    fmtNote: (fmt: string): string =>
      `The attestation statement format. We asked for "direct"; the browser and authenticator returned "${fmt}". A relying party must handle the downgrade rather than treat it as an error.`,
    x5cNote:
      "The attestation certificate chain. Verifying it to a FIDO root is what turns the AAGUID from a hint into an authenticated claim — and it can only be done server-side.",
    emptyNote:
      'No attestation statement. Expected for fmt "none" — and this is the common case: Chrome strips attestation without an enterprise policy, Firefox prompts and typically returns none, and most platform authenticators never had a per-model attestation key.',
    authDataNote: "The authenticator's own signed statement. Broken apart below.",
  },

  authData: {
    /**
     * Two groups, not one. A single `authenticatorData` block measured 1,712px
     * of mostly-container box (`docs/04 §3.5` A8.3), which extinguishes the
     * field over nearly two screens and flatters every contrast reading taken
     * inside it. Height alone is not the defect — coverage is; see
     * `components/ceremony/tokens.ts`. The seam is the spec's own: the fixed 37-byte
     * header, then everything the flag bits make conditional.
     */
    headerTitle: "authenticatorData — the fixed header",
    headerNote:
      "A packed binary structure, not JSON. The first 37 bytes sit at offsets the spec fixes and are present in every ceremony: 32 bytes of RP ID hash, one byte of flags, four bytes of counter.",
    credentialTitle: "authenticatorData — the attested credential",
    credentialNote:
      "Everything after byte 36 is conditional on the flag bits. AT is set here, so the AAGUID, the credential ID and the COSE public key follow — and the key's length is discoverable only by decoding it, which is why the CBOR decoder reports where each item ends.",
    rpIdHashNote:
      "Bytes 0–31. SHA-256 of the RP ID the credential is bound to. The authenticator will never release this credential to a different RP ID — that binding is enforced in hardware, not by page script.",
    flagsIntro: "Each bit, decoded:",
    flagsMeta: (hex: string, binary: string): string => `byte 32 = 0x${hex} (0b${binary})`,
    signCountMeta: "bytes 33–36, uint32 big-endian",
    signCountZeroNote:
      "Zero. Many platform authenticators and all synced passkeys report 0 permanently, because a counter cannot be kept consistent across synced copies. A server must tolerate 0 rather than reject it.",
    signCountNote:
      "A monotonic counter. A server stores it and treats a value that fails to increase as possible credential cloning.",
    aaguidNote: (name: string): string =>
      `${name}. The AAGUID identifies the authenticator model, never the individual device — that is deliberate, so it cannot be used as a tracking handle.`,
    credentialIdLengthMeta: "uint16 big-endian",
    credentialIdLongNote:
      "Longer than 64 bytes, which usually means the authenticator wrapped the private key into the ID itself — the hallmark of a non-discoverable credential with no on-device storage.",
    credentialIdShortNote:
      "Short enough to be a handle into on-device storage rather than a key-wrapping blob.",
    credentialIdNote: (base64url: string): string => `base64url: ${base64url}`,
    coseKeyNote: (detail: string): string =>
      `${detail}. This is the only thing a server needs to keep: the public key, the credential ID and the sign count.`,
    xNote: (curveName: string): string =>
      `COSE label -2. The affine x of the public point on ${curveName}.`,
    yNote:
      "COSE label -3. Together x and y are the public key; the private half never leaves the authenticator's secure element.",
    modulusNote: "COSE label -1.",
    exponentNote: "COSE label -2. Almost always 65537 (0x010001).",
    extensionsNote: "Authenticator extension outputs, CBOR-encoded after the credential data.",
    extensionsMeta: "ED flag set",
  },
} as const;

/** The assertion and verification report. */
export const CEREMONY_ASSERTION = {
  liveEyebrow: "Step 2",
  liveHeading: "Signing and verifying",
  sampleEyebrow: "Sample, part 2",
  liveNote:
    "A fresh random challenge was sent back to the credential that was just created. Its signature is verified here, in this tab, with WebCrypto.",
  sampleNote:
    "The captured assertion, verified live in your browser against the captured public key.",

  /**
   * Two groups, not one. A single block here measured 1,152px and carved the
   * field flat for its whole length (`docs/04 §3.5` A8.3). The seam is real rather than arbitrary: what the
   * ceremony reported, then what the authenticator actually signed.
   */
  title: "The assertion",
  note: "A second ceremony. A fresh random challenge went to the same credential, and the browser wrote a new clientDataJSON to describe it.",
  signatureTitle: "The signature, and the bytes it covers",
  signatureGroupNote:
    "What the authenticator actually signed: its own authenticatorData concatenated with SHA-256(clientDataJSON). Nothing else is covered directly — the challenge and the origin reach the signature only through that hash.",
  typeNote: "webauthn.get — an authentication, not a registration.",
  challengeNote: (byteLength: number): string =>
    `A different ${byteLength} random bytes from the registration challenge. Reusing a challenge is what makes a replay attack possible.`,
  flagsNote:
    "Note that AT is now clear — an assertion carries no attested credential data, only the RP ID hash, flags and counter.",
  signCountNote: (registrationCount: number): string =>
    `Registration reported ${registrationCount}. A server compares the two and flags a non-increase, unless both are 0.`,
  signatureMetaEcdsa: "ASN.1 DER SEQUENCE { INTEGER r, INTEGER s }",
  signatureMetaRsa: "raw PKCS#1 v1.5",
  signatureNoteEcdsa:
    "WebCrypto's ECDSA verifier wants raw r‖s, so this page strips the DER and left-pads each integer to 32 bytes. Getting this conversion wrong is the single most common reason a hand-rolled WebAuthn server rejects valid signatures.",
  signatureNoteRsa: "RSASSA-PKCS1-v1_5, passed to WebCrypto unmodified.",
  signedBytesValue: (authDataLength: number): string =>
    `authenticatorData (${authDataLength}) ‖ SHA-256(clientDataJSON) (32)`,
  signedBytesNote: (clientDataHashHex: string): string => `clientDataHash = ${clientDataHashHex}`,

  resultTitle: "Verification result",
  resultNote:
    "crypto.subtle.verify, against the public key extracted from the attestation object above. Nothing else was used — no library, no server, no stored secret.",
  validNote:
    "The private key that signed this challenge is the counterpart of the public key that arrived during registration. That is the whole loop, closed, in front of you.",
  invalidNote:
    "The signature did not verify. On a live ceremony that indicates a parsing bug or a mismatched key, not an attack — please treat it as a defect in this page.",
  algorithmNote: (alg: number, name: string): string =>
    `COSE alg ${alg} (${name}) mapped onto the WebCrypto algorithm.`,
  verifyTimeNote:
    "Asymmetric verification is cheap. The expensive part of a passkey login is the human.",
} as const;

/** What persists afterwards, stated for each of the three cases. */
export const CEREMONY_PERSISTENCE = {
  title: "Afterwards — what persists",
  pageLabel: "This page's copy",
  pageValue: "discarded when the tab closes",
  pageNote:
    "Read the source and search: this section contains no fetch, no XMLHttpRequest, no localStorage.setItem and no IndexedDB. The ceremony exists only as a JavaScript object in this tab.",
  authenticatorLabel: "Your authenticator's copy",
  persistsValue: "likely persists",
  discardedValue: "probably nothing",
  syncedNote:
    'The Backup Eligible / Backup State flags are set, so your authenticator created a synced, discoverable passkey despite residentKey: "discouraged" — Safari with iCloud Keychain and most password managers do this. An entry for this site now exists in your passkey manager. You can delete it there; this page cannot, because nothing in the WebAuthn API lets a website delete a credential.',
  wrappedNote: (byteLength: number): string =>
    `The credential ID is ${byteLength} bytes, which strongly suggests the private key was wrapped into the ID itself rather than stored on the device. Once this tab closes, nothing about this credential exists anywhere — the only copy of the handle was in a JavaScript variable.`,
  unknownNote:
    "The credential may have been stored on the authenticator. Nothing in the WebAuthn API lets a website delete a credential, so if you want it gone, remove it through your browser's or authenticator's own passkey manager. This page stored nothing.",
} as const;

/** Failure copy. Every named DOMException teaches something. */
export const CEREMONY_FAILURE = {
  eyebrow: "Step 1",
  heading: "The ceremony did not complete",
  fallbackNote:
    "Nothing is lost — the explanation below uses a ceremony captured earlier, so the parsing still makes sense. Everything after this banner is sample data, clearly labelled.",
  sampleFailedHeading: "The captured sample could not be replayed",
  noAttestedCredentialData:
    "No attested credential data. The AT flag was clear, so there is no public key to verify against.",
  unknown: "The ceremony failed in a way this page does not have a specific explanation for.",
  byName: {
    NotAllowedError:
      "The ceremony was cancelled, timed out, or the authenticator declined. Browsers deliberately collapse all three into one error so a page cannot probe which authenticators you own.",
    InvalidStateError:
      "This authenticator already holds a credential that was listed in excludeCredentials — the spec's way of preventing a duplicate registration without leaking whether one exists.",
    NotSupportedError:
      "No algorithm in pubKeyCredParams is supported by the available authenticator. This page offers ES256 (-7) and RS256 (-257).",
    SecurityError:
      "The RP ID is not a registrable suffix of this origin, or the page is not in a secure context. WebAuthn requires HTTPS, or localhost.",
    AbortError: "The ceremony was aborted before it completed.",
    ConstraintError:
      "The authenticator could not satisfy a requested constraint — commonly user verification requested on a device with no PIN or biometric enrolled.",
    UnknownError:
      "The authenticator failed in a way it could not describe. Often a transport glitch.",
    TypeError: "The options passed to the API were malformed.",
    CeremonyAbandonedError:
      "The API resolved without a credential. Nothing to parse and nothing to verify.",
    CborError: "The CBOR could not be decoded. That is a defect in this page's decoder.",
    AuthDataError: "authenticatorData was malformed or its declared lengths overran the buffer.",
    CoseError: "The COSE public key could not be parsed.",
    DerError: "The signature was not the DER structure ECDSA requires.",
    ClientDataError: "clientDataJSON was not the JSON object the spec requires.",
    VerificationError: "WebCrypto refused to import the key or check the signature.",
    ByteFormatError: "A byte-level operation could not proceed in this context.",
  } as Readonly<Record<string, string>>,
} as const;

/** Banner above a replayed sample. Labelled, every time, without exception. */
export const CEREMONY_SAMPLE_BANNER = {
  lead: "This is a pre-captured sample, not your device.",
  body: (capturedAt: string, authenticator: string, origin: string): string =>
    `Captured ${capturedAt} from ${authenticator} on origin ${origin}. The bytes below are that real ceremony's real bytes, and the signature verification you see at the end is genuinely recomputed in your browser right now — but the private key involved was never yours.`,
} as const;

/**
 * The captured sample, summarised as server-rendered text.
 *
 * This is what a visitor with JavaScript disabled reads: real values from the
 * real capture, in the initial HTML, with no client bundle involved.
 *
 * EVERY NUMBER HERE IS ASSERTED AGAINST THE PARSERS in
 * `src/lib/webauthn/analyze.test.ts`. If a value drifts, that test fails rather
 * than the page quietly telling a visitor something untrue.
 */
export const CEREMONY_SAMPLE_SUMMARY = {
  title: "The captured sample, decoded",
  note: "These values are what the parsers produce from the captured bytes. They are rendered on the server, so this section still teaches with JavaScript turned off. Turn JavaScript on and the same bytes are re-parsed — and the signature re-verified — in your own browser.",
  rows: [
    { label: "origin", value: "http://localhost:8931" },
    { label: "rpId", value: "localhost" },
    { label: "attestationObject", value: "759 bytes of CBOR" },
    { label: "fmt", value: "packed" },
    { label: "attStmt.alg", value: "-7 (ES256 — ECDSA over P-256 with SHA-256)" },
    { label: "attStmt.sig", value: "72 bytes" },
    { label: "attStmt.x5c", value: "1 certificate, 472 bytes DER" },
    { label: "authData", value: "164 bytes" },
    { label: "flags", value: "0x45 — UP, UV and AT set" },
    { label: "signCount (registration)", value: "1" },
    {
      label: "aaguid",
      value: "01020304-0506-0708-0102-030405060708 — Chrome DevTools virtual authenticator",
    },
    { label: "credentialId", value: "32 bytes, identical to credential.rawId" },
    { label: "COSE public key", value: "77 bytes of CBOR — EC2 / P-256 / ES256" },
    { label: "signCount (assertion)", value: "2" },
    { label: "signature", value: "71 bytes DER → 64 bytes raw r‖s" },
    { label: "signed bytes", value: "69 = authenticatorData (37) ‖ SHA-256(clientDataJSON) (32)" },
  ],
} as const;

/** The closing notes. What this page skips, and what a real deployment adds. */
export const CEREMONY_NOTES = {
  title: "Notes",
  items: [
    {
      lead: "AAGUID lookup.",
      body: "The authenticator model names are resolved from a small table compiled into this page, snapshotted from the FIDO Alliance Metadata Service BLOB and the community passkey-authenticator-aaguids registry. It is abridged and it is a snapshot, so it will miss models. A production relying party fetches and verifies the signed MDS BLOB server-side on a schedule rather than trusting a hard-coded list — and treats the AAGUID as a hint, not as an authenticated fact, unless the attestation statement was actually verified to a trusted root.",
    },
    {
      lead: "What a real deployment adds.",
      body: "Server-generated single-use challenge with a TTL; origin and RP ID validated against a server-side allow-list; attestation certificate chain validated to a FIDO root; signature counter stored and checked for regression, for clone detection; credential ID, public key and sign count persisted against a user record; replay protection; rate limiting. This page does the cryptography honestly and skips every one of those, because it has no server.",
    },
    {
      lead: "CBOR.",
      body: "The decoder in this page is a few hundred lines, written for this section. A general-purpose CBOR library is one to two orders of magnitude larger than the subset WebAuthn actually uses: definite-length integers, byte strings, text strings, arrays, maps, tags and simple values.",
    },
  ],
} as const;

/** Screen-reader-only names for regions and controls. */
export const CEREMONY_A11Y = {
  statusLabel: "Ceremony status",
  resultsLabel: "Ceremony results",
  environmentLabel: "Browser capability probe",
  hexToggle: (byteLength: number): string => `show all ${byteLength} bytes`,
  hexPreview: (preview: string, byteLength: number): string =>
    `hex — ${preview} … (${byteLength} bytes, show all)`,
} as const;
