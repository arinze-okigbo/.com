"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { QuickNavigationDialogProps } from "./QuickNavigationDialog";
import "./quick-navigation-trigger.css";

export function QuickNavigation() {
  const [Dialog, setDialog] = useState<ComponentType<QuickNavigationDialogProps> | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const pending = useRef(false);
  const active = useRef(true);

  const close = (restoreFocus = true) => {
    pending.current = false;
    setOpen(false);
    setLoading(false);
    if (restoreFocus)
      requestAnimationFrame(() => {
        if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
      });
  };
  const launch = () => {
    if (pending.current) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setError(false);
    pending.current = true;
    if (Dialog) {
      setOpen(true);
      return;
    }
    setLoading(true);
    void import("./QuickNavigationDialog")
      .then((module) => {
        if (!active.current) return;
        setDialog(() => module.default);
        setLoading(false);
        if (pending.current) setOpen(true);
      })
      .catch(() => {
        if (!active.current) return;
        pending.current = false;
        setLoading(false);
        setError(true);
      });
  };

  useEffect(() => {
    active.current = true;
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && pending.current && !open) {
        close();
        return;
      }
      if (
        event.key.toLowerCase() !== "k" ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        event.repeat ||
        event.defaultPrevented
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            "input, textarea, select, [contenteditable]:not([contenteditable='false']), [role='textbox']",
          ))
      )
        return;
      event.preventDefault();
      // Native dialog close events are queued; the request ref updates synchronously.
      if (pending.current) close();
      else launch();
    };
    document.addEventListener("keydown", keydown);
    return () => {
      active.current = false;
      document.removeEventListener("keydown", keydown);
    };
  });

  return (
    <>
      <button
        className="quick-navigation-trigger"
        type="button"
        onClick={launch}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Meta+K Control+K"
        disabled={loading}
      >
        Navigate <kbd aria-hidden="true">⌘ / Ctrl K</kbd>
      </button>
      {loading && (
        <span className="quick-navigation-notice" role="status">
          Loading navigation…
        </span>
      )}
      {error && (
        <span className="quick-navigation-notice" role="status">
          Navigation couldn’t load. Try again, or use the page links.
        </span>
      )}
      {open && Dialog && <Dialog onDismiss={close} />}
    </>
  );
}
