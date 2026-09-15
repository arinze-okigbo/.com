"use client";
import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
let media: MediaQueryList | undefined;
const subscribers = new Set<() => void>();
function getMedia() {
  return (media ??= matchMedia(query));
}
function notify() {
  subscribers.forEach((callback) => callback());
}
function subscribe(callback: () => void) {
  const current = getMedia();
  if (subscribers.size === 0) current.addEventListener("change", notify);
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
    if (subscribers.size === 0) current.removeEventListener("change", notify);
  };
}
function getSnapshot() {
  return getMedia().matches;
}
function getServerSnapshot() {
  return false;
}
/** Consistent server snapshot prevents different markup during reduced-motion hydration. */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
