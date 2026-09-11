import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names, resolving conflicting Tailwind utilities last-wins.
 * Returns a new string; never mutates its inputs.
 */
export function cn(...inputs: readonly ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Matches an absolute URL the browser will treat as off-site. [03 R20] */
const EXTERNAL_HREF_PATTERN = /^https?:\/\//i;

/**
 * True when `href` points off-site and therefore needs
 * `target="_blank" rel="noopener noreferrer"` plus a new-tab announcement.
 */
export function isExternalHref(href: string): boolean {
  return EXTERNAL_HREF_PATTERN.test(href);
}
