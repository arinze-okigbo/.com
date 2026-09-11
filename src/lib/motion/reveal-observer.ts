/**
 * A single shared `IntersectionObserver` for every reveal on the page.
 *
 * One observer per configuration rather than one per element: an observer is a
 * main-thread object with its own bookkeeping, and a page with fifteen entries
 * should not pay for fifteen of them. Elements register, fire once, and are
 * unobserved immediately (docs/04 §5.3 — "Fire once, unobserve immediately,
 * never reverse").
 */

import { REVEAL_ROOT_MARGIN, REVEAL_THRESHOLD } from "./tokens";

/**
 * How an element reached its final state.
 * - `animate`: it crossed the trigger line while the reader was looking at it.
 * - `instant`: the backlog rule (docs/04 §5.3) — the reader has already scrolled
 *   past it, so it snaps to final with no transition and no delay rather than
 *   queueing a cascade of reveals behind a fast scroll.
 */
export type RevealMode = "animate" | "instant";

export type RevealListener = (mode: RevealMode) => void;

interface RegistryEntry {
  readonly listener: RevealListener;
  hasBeenSeen: boolean;
}

const observers = new Map<string, IntersectionObserver>();
const registry = new WeakMap<Element, RegistryEntry>();

const configKey = (rootMargin: string, threshold: number): string => `${rootMargin}|${threshold}`;

const isSupported = (): boolean =>
  typeof window !== "undefined" && "IntersectionObserver" in window;

const release = (
  observer: IntersectionObserver,
  target: Element,
  entry: RegistryEntry,
  mode: RevealMode,
): void => {
  observer.unobserve(target);
  registry.delete(target);
  entry.listener(mode);
};

const handleEntries = (
  entries: readonly IntersectionObserverEntry[],
  observer: IntersectionObserver,
): void => {
  for (const entry of entries) {
    const registered = registry.get(entry.target);
    if (!registered) continue;

    if (entry.isIntersecting) {
      release(observer, entry.target, registered, "animate");
      continue;
    }

    // Backlog rule: on this element's first callback, anything already above
    // the viewport is finished content — reveal it with no transition.
    const isAlreadyScrolledPast = entry.boundingClientRect.bottom <= 0;
    if (!registered.hasBeenSeen && isAlreadyScrolledPast) {
      release(observer, entry.target, registered, "instant");
      continue;
    }

    registered.hasBeenSeen = true;
  }
};

const getObserver = (rootMargin: string, threshold: number): IntersectionObserver => {
  const key = configKey(rootMargin, threshold);
  const existing = observers.get(key);
  if (existing) return existing;

  const observer = new IntersectionObserver(handleEntries, {
    rootMargin,
    threshold,
  });
  observers.set(key, observer);
  return observer;
};

/**
 * Observes `element` until it reaches its final state exactly once.
 * Returns a cleanup function.
 *
 * If `IntersectionObserver` is unavailable the listener fires immediately in
 * `instant` mode — content is never left hidden because a browser API is
 * missing (docs/03 R30).
 */
export function observeReveal(
  element: Element,
  listener: RevealListener,
  rootMargin: string = REVEAL_ROOT_MARGIN,
  threshold: number = REVEAL_THRESHOLD,
): () => void {
  if (!isSupported()) {
    listener("instant");
    return () => undefined;
  }

  registry.set(element, { listener, hasBeenSeen: false });
  const observer = getObserver(rootMargin, threshold);
  observer.observe(element);

  return () => {
    observer.unobserve(element);
    registry.delete(element);
  };
}
