"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import "./proof-lab.css";

/** Loading the experiment is an explicit action, separate from creating its key. */
export function ProofLabMount() {
  const [Panel, setPanel] = useState<ComponentType<{ onClose: () => void }> | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const alive = useRef(true);
  const pending = useRef(false);
  const opener = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const launch = async () => {
    if (pending.current) return;
    setError(false);
    if (Panel) {
      setOpen(true);
      return;
    }
    pending.current = true;
    setLoading(true);
    try {
      const loaded = await import("./ProofLab");
      if (!alive.current) return;
      setPanel(() => loaded.default);
      setOpen(true);
    } catch {
      if (alive.current) setError(true);
    } finally {
      pending.current = false;
      if (alive.current) setLoading(false);
    }
  };
  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  };
  return (
    <div className="proof-lab-mount">
      {open && Panel ? (
        <Panel onClose={close} />
      ) : (
        <div className="proof-launch">
          <div>
            <span className="proof-overline">A MESSAGE. A SIGNATURE. A TEST.</span>
            <p>Sign a message. Change one character. Verify again.</p>
            <span className="proof-launch-note">
              A temporary key pair in this tab. No account, passkey, or saved key.
            </span>
          </div>
          <button
            ref={opener}
            type="button"
            className="button button-primary"
            disabled={loading}
            onClick={launch}
          >
            {loading ? "Opening signature lab…" : "Open signature lab"}
            <span aria-hidden="true">↗</span>
          </button>
          <p className="proof-load-status" role="status">
            {error
              ? "The lab could not load. Try opening it again."
              : loading
                ? "Loading the browser experiment."
                : ""}
          </p>
        </div>
      )}
    </div>
  );
}
