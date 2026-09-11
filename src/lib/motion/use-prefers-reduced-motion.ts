"use client";

import { useSyncExternalStore } from "react";

/**
 * `prefers-reduced-motion: reduce`, as a strict boolean.
 *
 * Framer Motion's own `useReducedMotion()` returns `boolean | null`, which
 * invites `if (prefersReducedMotion)` to silently take the animated branch
 * during the null window. This returns a real boolean and subscribes to live
 * changes, so a user flipping the OS setting mid-session is honoured without a
 * reload (docs/04 §6).
 *
 * SSR snapshot is `false`: the server cannot know the preference, and the
 * reduced-motion CSS block in globals.css §10.8 is authored with `!important`
 * precisely so the static end state is correct before any JS runs. JS is the
 * second line of defence here, never the first.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onStoreChange: () => void): (() => void) => {
  if (typeof window === "undefined" || !("matchMedia" in window)) {
    return () => undefined;
  }
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
};

const getSnapshot = (): boolean => {
  if (typeof window === "undefined" || !("matchMedia" in window)) {
    return false;
  }
  return window.matchMedia(QUERY).matches;
};

const getServerSnapshot = (): boolean => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
