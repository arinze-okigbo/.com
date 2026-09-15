"use client";

import { useEffect, useRef, useState } from "react";
import {
  createProofKeyPair,
  signChallenge,
  verifyChallenge,
  fingerprintPublicKey,
  MAX_CHALLENGE_BYTES,
} from "@/lib/hive/proof";

const initialMessage = "Meet me at 10:00.";
type Result = "empty" | "key" | "signed" | "changed" | "verified" | "mismatch" | "error";
type Busy = "generating" | "signing" | "verifying" | null;
const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

export default function ProofLab({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState(initialMessage);
  const [fingerprint, setFingerprint] = useState("");
  const [signatureHex, setSignatureHex] = useState("");
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [result, setResult] = useState<Result>("empty");
  const [busy, setBusy] = useState<Busy>(null);
  const [status, setStatus] = useState("Ready. Generate a key to begin.");
  const keys = useRef<CryptoKeyPair | null>(null);
  const signature = useRef<Uint8Array | null>(null);
  const revision = useRef(0);
  const pending = useRef(false);
  const alive = useRef(true);
  const heading = useRef<HTMLHeadingElement>(null);
  const supported =
    typeof window !== "undefined" && window.isSecureContext && Boolean(globalThis.crypto?.subtle);
  const byteCount = new TextEncoder().encode(message).byteLength;
  const tooLong = byteCount > MAX_CHALLENGE_BYTES;
  useEffect(() => {
    const operationRevision = revision;
    alive.current = true;
    heading.current?.focus({ preventScroll: true });
    return () => {
      alive.current = false;
      operationRevision.current++;
      keys.current = null;
      signature.current = null;
      pending.current = false;
    };
  }, []);
  const current = (token: number) => alive.current && revision.current === token;
  const reset = () => {
    revision.current++;
    pending.current = false;
    keys.current = null;
    signature.current = null;
    setMessage(initialMessage);
    setFingerprint("");
    setSignatureHex("");
    setSignedMessage(null);
    setBusy(null);
    setResult("empty");
    setStatus("Lab reset. The key and signature references have been cleared.");
  };
  const fail = (token: number, action: string) => {
    if (!current(token)) return;
    setResult("error");
    setStatus(`${action} could not complete in this browser. Reset the lab to try again.`);
  };
  const finish = (token: number) => {
    if (!current(token)) return;
    pending.current = false;
    setBusy(null);
  };
  const generate = async () => {
    if (!supported || pending.current) return;
    const token = ++revision.current;
    pending.current = true;
    keys.current = null;
    signature.current = null;
    setFingerprint("");
    setSignatureHex("");
    setSignedMessage(null);
    setResult("empty");
    setBusy("generating");
    setStatus("Generating a temporary key pair in this tab.");
    try {
      const pair = await createProofKeyPair();
      const digest = await fingerprintPublicKey(pair.publicKey);
      if (!current(token)) return;
      keys.current = pair;
      setFingerprint(digest);
      setResult("key");
      setStatus("Key ready. Sign a message next.");
    } catch {
      fail(token, "Key generation");
    } finally {
      finish(token);
    }
  };
  const sign = async () => {
    const pair = keys.current;
    if (!pair || pending.current || tooLong) return;
    const token = ++revision.current;
    const snapshot = message;
    pending.current = true;
    setBusy("signing");
    setStatus("Signing the current message with the private key.");
    try {
      const bytes = await signChallenge(pair.privateKey, snapshot);
      if (!current(token)) return;
      signature.current = bytes;
      setSignatureHex(toHex(bytes));
      setSignedMessage(snapshot);
      setResult("signed");
      setStatus("Message signed. Verify it or change the message.");
    } catch {
      fail(token, "Signing");
    } finally {
      finish(token);
    }
  };
  const verify = async () => {
    const pair = keys.current,
      bytes = signature.current;
    if (!pair || !bytes || pending.current || tooLong) return;
    const token = ++revision.current;
    const snapshot = message;
    pending.current = true;
    setBusy("verifying");
    setStatus("Checking the signature against the current message.");
    try {
      const valid = await verifyChallenge(pair.publicKey, snapshot, bytes);
      if (!current(token)) return;
      setResult(valid ? "verified" : "mismatch");
      setStatus(
        valid
          ? "Verified. This signature matches the current message."
          : "Not verified. The message does not match this signature.",
      );
    } catch {
      fail(token, "Verification");
    } finally {
      finish(token);
    }
  };
  const changeMessage = (value: string) => {
    // An edit supersedes any pending signing/verification operation, including
    // one whose promise completes after the visitor resets or generates again.
    revision.current++;
    pending.current = false;
    setBusy(null);
    setMessage(value);
    setResult(signature.current ? "changed" : keys.current ? "key" : "empty");
    setStatus(
      signature.current
        ? "Message changed. Verify the existing signature to test it."
        : keys.current
          ? "Key ready. Sign a message next."
          : "Ready. Generate a key to begin.",
    );
  };
  const tamper = () => {
    const characters = Array.from(message);
    // Replacing the first code point stays within the byte limit, including a
    // full-length Unicode message; the original signed snapshot stays intact.
    if (characters.length) characters[0] = characters[0] === "A" ? "B" : "A";
    else characters.push("!");
    changeMessage(characters.join(""));
  };
  const close = () => {
    reset();
    onClose();
  };
  const stateLabel = busy
    ? "WORKING"
    : (
        {
          empty: "READY",
          key: "KEY CREATED",
          signed: "SIGNED",
          changed: "MESSAGE CHANGED",
          verified: "MATCH",
          mismatch: "NO MATCH",
          error: "UNAVAILABLE",
        } as const
      )[result];

  return (
    <div className="proof-lab" data-proof-result={result}>
      <div className="proof-toolbar">
        <div>
          <span className="proof-overline">EPHEMERAL SIGNATURE LAB</span>
          <h3 ref={heading} tabIndex={-1}>
            The message is the evidence.
          </h3>
        </div>
        <button className="proof-quiet" type="button" onClick={close}>
          Close lab <span aria-hidden="true">×</span>
        </button>
      </div>
      <p className="proof-intro">
        A signature connects an exact message to a key. Change the message and check what happens.
      </p>
      <ol className="proof-flow" aria-label="Experiment steps">
        <li data-complete={Boolean(fingerprint)}>
          <span>01</span> Create a key
        </li>
        <li data-complete={Boolean(signatureHex)}>
          <span>02</span> Sign a message
        </li>
        <li data-complete={result === "verified" || result === "mismatch"}>
          <span>03</span> Test the signature
        </li>
      </ol>
      {!supported && (
        <p className="proof-unsupported" role="status">
          Web Crypto is unavailable here. Open this page in a modern browser over HTTPS to run the
          experiment.
        </p>
      )}
      <div className="proof-workbench">
        <div className="proof-message-panel">
          <div className="proof-panel-heading">
            <label htmlFor="proof-message">Message</label>
            <span aria-hidden="true">UTF-8</span>
          </div>
          <textarea
            id="proof-message"
            value={message}
            onChange={(event) => changeMessage(event.target.value)}
            maxLength={MAX_CHALLENGE_BYTES}
            rows={5}
            spellCheck={false}
            aria-describedby="proof-message-limit"
            aria-invalid={tooLong}
          />
          <p id="proof-message-limit" className="proof-byte-count" data-invalid={tooLong}>
            {byteCount.toLocaleString()} / {MAX_CHALLENGE_BYTES.toLocaleString()} UTF-8 bytes
            {tooLong
              ? " — shorten the message to sign or verify."
              : ". Empty messages and Unicode work too."}
          </p>
          <div className="proof-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={generate}
              disabled={!supported || Boolean(busy)}
            >
              {busy === "generating" ? "Generating key…" : "Generate key"}
            </button>
            <button
              type="button"
              className="proof-button"
              onClick={sign}
              disabled={!supported || !fingerprint || Boolean(busy) || tooLong}
            >
              {busy === "signing" ? "Signing message…" : "Sign message"}
            </button>
          </div>
          <p className="proof-key-note">
            The private key stays in this tab’s memory and is non-extractable through Web Crypto.
            Reset or close the lab to release its references.
          </p>
        </div>
        <div className="proof-evidence-panel">
          <div className="proof-panel-heading">
            <span>Public evidence</span>
            <span aria-hidden="true">P-256</span>
          </div>
          <dl className="proof-evidence">
            <div>
              <dt>
                Public-key fingerprint <span>SHA-256 of SPKI</span>
              </dt>
              <dd>
                <code data-proof-fingerprint>
                  {fingerprint || "Generate a key to see its fingerprint."}
                </code>
              </dd>
            </div>
            <div>
              <dt>
                Signature{" "}
                <span>
                  {signatureHex ? `${signatureHex.length / 2} bytes · hex` : "ECDSA · SHA-256"}
                </span>
              </dt>
              <dd>
                <code data-proof-signature>
                  {signatureHex || "Sign a message to see its signature."}
                </code>
              </dd>
            </div>
          </dl>
          {signedMessage !== null && (
            <details className="proof-snapshot">
              <summary>Original signed message</summary>
              <pre tabIndex={0} role="region" aria-label="Original signed message">
                {signedMessage === "" ? "(empty message)" : signedMessage}
              </pre>
            </details>
          )}
        </div>
      </div>
      <div className="proof-verification">
        <div className="proof-result-mark" aria-hidden="true">
          {result === "verified" ? "✓" : result === "mismatch" ? "≠" : "·"}
        </div>
        <div className="proof-result-copy">
          <span className="proof-overline">{stateLabel}</span>
          <p role="status" aria-live="polite" aria-atomic="true">
            {status}
          </p>
        </div>
        <div className="proof-test-actions">
          <button
            type="button"
            className="proof-button"
            onClick={verify}
            disabled={!supported || !signatureHex || Boolean(busy) || tooLong}
          >
            {busy === "verifying" ? "Verifying signature…" : "Verify signature"}
          </button>
          <button
            type="button"
            className="proof-quiet"
            onClick={tamper}
            disabled={!signatureHex || Boolean(busy)}
          >
            Tamper with message
          </button>
        </div>
      </div>
      <div className="proof-footnote">
        <p>
          This tests a message against this public key. It does not encrypt the message or establish
          anyone’s identity. No key or message is saved or sent by this experiment.
        </p>
        <button type="button" className="proof-quiet" onClick={reset}>
          Reset lab <span aria-hidden="true">↺</span>
        </button>
      </div>
      <a
        className="proof-reference"
        href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign"
        target="_blank"
        rel="noreferrer"
      >
        How Web Crypto signatures work <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
