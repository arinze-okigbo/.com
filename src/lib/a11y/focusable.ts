/**
 * Focusable-element discovery for focus traps.
 *
 * Pure and DOM-reading only: it never mutates, never focuses, and returns a new
 * frozen array on every call, so a caller cannot accidentally hold a live view
 * of the tree across a re-render.
 */

/**
 * Everything the sequential focus order can reach, before visibility is
 * considered. `[tabindex="-1"]` is deliberately excluded: it is programmatically
 * focusable but never a Tab stop, and a trap that cycles through it would stall
 * on `<main tabindex="-1">` and on the decorative canvas.
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * True when the element can actually receive focus right now.
 *
 * Two separate hiding mechanisms have to be caught, and one check does not
 * cover both:
 *
 * - **`visibility: hidden`** is what the closed nav sheet uses (globals.css §8
 *   hides it this way rather than with `display: none` so the desktop row is
 *   never affected). `visibility` is an inherited property, so reading it on
 *   the element itself already accounts for a hidden ancestor.
 * - **`display: none`** is *not* inherited: a child of a `display: none` parent
 *   reports its own `display`, not `none`. So the ancestor chain has to be
 *   walked. This also catches the `hidden` attribute, which the UA stylesheet
 *   implements as `display: none` — the document-level external-link notice
 *   `<span hidden>` is exactly that case.
 *
 * Deliberately NOT `getClientRects().length`, which is the usual shorthand for
 * both: it is a layout read, so it forces a reflow on every Tab and it reports
 * empty in any non-layout environment, which would make this function
 * untestable and silently answer "nothing is focusable".
 */
function isHiddenByAncestorDisplay(element: HTMLElement): boolean {
  for (let node: HTMLElement | null = element; node !== null; node = node.parentElement) {
    if (window.getComputedStyle(node).display === "none") return true;
  }
  return false;
}

function isFocusableNow(element: HTMLElement): boolean {
  if (element.hasAttribute("inert") || element.closest("[inert]") !== null) return false;
  const { visibility } = window.getComputedStyle(element);
  if (visibility === "hidden" || visibility === "collapse") return false;
  return !isHiddenByAncestorDisplay(element);
}

/** Every Tab stop inside `container`, in document order. Never mutates. */
export function getFocusableElements(container: HTMLElement): readonly HTMLElement[] {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return Object.freeze(candidates.filter(isFocusableNow));
}
