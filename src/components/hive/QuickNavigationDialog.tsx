"use client";
import { Icon } from "./Icon";

import Link from "next/link";
import { getFocusableElements } from "@/lib/a11y/focusable";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import {
  isNavigationItem,
  navigationPages,
  searchNavigation,
  type NavigationItem,
} from "./navigation-index";
import "./quick-navigation-dialog.css";

export type QuickNavigationDialogProps = { onDismiss: (restoreFocus?: boolean) => void };

export default function QuickNavigationDialog({ onDismiss }: QuickNavigationDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dismissed = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<NavigationItem[]>(navigationPages);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const matches = useMemo(() => searchNavigation(items, query), [items, query]);

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    dismissed.current = false;
    if (!node.open) node.showModal();
    input.current?.focus({ preventScroll: true });
    return () => {
      if (node.open) node.close();
      root.style.overflow = previousOverflow;
      root.style.scrollbarGutter = previousGutter;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/navigation", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Index unavailable");
        const data: unknown = await response.json();
        if (!data || typeof data !== "object" || !("items" in data) || !Array.isArray(data.items))
          throw new Error("Invalid index");
        const valid = data.items.filter(isNavigationItem);
        if (!valid.length) throw new Error("Empty index");
        const unique = new Map(valid.map((item) => [item.href, item]));
        setItems(Array.from(unique.values()));
        setLoading(false);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
        setFailed(true);
      });
    return () => controller.abort();
  }, [attempt]);

  const dismiss = (restoreFocus = true) => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (dialog.current?.open) dialog.current.close();
    onDismiss(restoreFocus);
  };
  const resultLinks = () =>
    Array.from(list.current?.querySelectorAll<HTMLAnchorElement>("a[href]") || []);
  const inputKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      resultLinks()[0]?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      resultLinks().at(-1)?.focus();
    }
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      resultLinks()[0]?.click();
    }
  };
  const resultKeys = (event: KeyboardEvent<HTMLUListElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const links = resultLinks();
    if (!links.length) return;
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    event.preventDefault();
    if (event.key === "ArrowUp" && current === 0) {
      input.current?.focus();
      return;
    }
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? links.length - 1
          : (current + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
    links[next]?.focus();
  };
  const navigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey)
      dismiss(false);
  };

  return (
    <dialog
      ref={dialog}
      className="quick-navigation-dialog"
      aria-labelledby="quick-navigation-title"
      aria-describedby="quick-navigation-help"
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onKeyDown={(event) => {
        // Search inputs otherwise consume the first Escape to clear their value.
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          dismiss();
          return;
        }
        if (event.key !== "Tab" || event.ctrlKey || event.metaKey || event.altKey) return;
        // Native dialog focus containment can include browser chrome at the ends.
        // Keep sequential keyboard navigation cycling through the live modal controls.
        const controls = getFocusableElements(event.currentTarget);
        const first = controls[0];
        const last = controls.at(-1);
        const current = document.activeElement;
        if (event.shiftKey && (current === first || current === event.currentTarget)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (current === last || current === event.currentTarget)) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onClose={(event) => {
        // Strict Mode may queue a close event before reopening the same dialog.
        if (!event.currentTarget.open && !dismissed.current) dismiss();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          dismiss();
      }}
    >
      <div className="quick-navigation-top">
        <div>
          <p className="eyebrow">FIND YOUR WAY</p>
          <h2 id="quick-navigation-title">Go somewhere.</h2>
        </div>
        <button
          className="quick-navigation-close"
          type="button"
          onClick={() => dismiss()}
          aria-label="Close navigation"
        >
          Esc <Icon name="close" />
        </button>
      </div>
      <div className="quick-navigation-search" role="search">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          ref={input}
          type="search"
          aria-label="Search this site"
          aria-controls="quick-navigation-results"
          placeholder="A page, a project, an essay…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={inputKeys}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={120}
        />
      </div>
      <div className="quick-navigation-meta" role="status">
        {loading
          ? "Loading project and writing links…"
          : `${matches.length} ${matches.length === 1 ? "result" : "results"}`}
      </div>
      {failed && (
        <div className="quick-navigation-failure">
          <p>Project and writing links couldn’t load. Page links are still available.</p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setLoading(true);
              setAttempt((value) => value + 1);
            }}
          >
            Try again <Icon name="refresh" />
          </button>
        </div>
      )}
      <ul
        ref={list}
        id="quick-navigation-results"
        className="quick-navigation-results"
        aria-label="Matching destinations"
        onKeyDown={resultKeys}
      >
        {matches.map((item) => (
          <li key={item.href}>
            <Link href={item.href} prefetch={false} onClick={navigate}>
              <span className="quick-navigation-kind">{item.kind}</span>
              <span className="quick-navigation-copy">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>
              <span aria-hidden="true" className="quick-navigation-arrow">
                <Icon name="arrow-up-right" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {!matches.length && !loading && (
        <p className="quick-navigation-empty">No matches. Try a page name, project, or topic.</p>
      )}
      <div className="quick-navigation-help" id="quick-navigation-help">
        <span>
          <kbd>↑</kbd> <kbd>↓</kbd> to move · <kbd>Enter</kbd> to open
        </span>
        <span>
          <kbd>Esc</kbd> to close
        </span>
      </div>
    </dialog>
  );
}
