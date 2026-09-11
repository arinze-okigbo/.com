"use client";

import { useEffect, type RefObject } from "react";

import { getFocusableElements } from "./focusable";

/**
 * A focus trap for an overlay that paints on top of page content.
 *
 * WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum) is the criterion this exists
 * for, and it is worth stating precisely because the code it replaces cited the
 * same number to argue the opposite. 2.4.11 is not a rule about dialogs; it is a
 * rule about the *focused* element. An overlay that leaves the content behind it
 * in the tab order fails it the moment focus lands on something the overlay
 * covers — which is exactly what the mobile nav sheet did, at 100% coverage
 * between 480px and 767px.
 *
 * Three mechanisms, because a Tab-only trap has holes:
 *
 * 1. **Tab / Shift+Tab wrap** inside `containerRef`. The keyboard path.
 * 2. **`focusin` outside the container dismisses.** Covers focus moves the
 *    keydown handler never sees — a programmatic `focus()`, a browser find bar,
 *    an AT's own navigation.
 * 3. **`pointerdown` outside the container dismisses.** A mouse or touch can put
 *    focus behind the overlay without a Tab; dismissing is the behaviour a
 *    reader expects anyway, and it means the overlay is gone before the click
 *    lands rather than a moment after.
 *
 * The hook does nothing at all while `isActive` is false: no listeners are
 * attached, no focus is moved, and keyboard access to the rest of the page is
 * untouched. Restoring focus on dismiss is the caller's job — only the caller
 * knows whether the user dismissed (focus goes back to the trigger) or navigated
 * (focus goes to the destination).
 */
export interface FocusTrapOptions {
  /** Attach only while true. False must be a complete no-op. */
  readonly isActive: boolean;
  /** The trap boundary. Everything focusable inside it stays reachable. */
  readonly containerRef: RefObject<HTMLElement | null>;
  /**
   * Where focus goes on activation — the first Tab stop inside this element.
   * Defaults to the container. For a disclosure this is the sheet, not the
   * `<nav>`, so focus lands on the first link rather than staying on the
   * toggle that was just pressed.
   */
  readonly initialFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Escape, a focus move outside, or a pointer outside. The reason is passed
   * because the correct focus response differs: after Escape the trigger must
   * take focus back (SC 2.4.3), whereas after a pointer or focus move outside
   * the user has already chosen where focus goes and stealing it back is wrong.
   */
  readonly onDismiss: (reason: FocusTrapDismissReason) => void;
}

export type FocusTrapDismissReason = "escape" | "focus-outside" | "pointer-outside";

export function useFocusTrap({
  isActive,
  containerRef,
  initialFocusRef,
  onDismiss,
}: FocusTrapOptions): void {
  useEffect(() => {
    if (!isActive) return;
    const container = containerRef.current;
    if (!container) return;

    const initialTarget = initialFocusRef?.current ?? container;
    const [firstInside] = getFocusableElements(initialTarget);
    firstInside?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss("escape");
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(container as HTMLElement);
      if (focusable.length === 0) return;

      // Every Tab is handled here, not only the two at the ends of the ring.
      //
      // Wrapping only at the boundaries and letting the engine walk the middle
      // looks equivalent and is not. WebKit with "Press Tab to highlight each
      // item" off — Safari's default — moves focus from a link to BODY rather
      // than to the next link, so a boundary-only trap oscillated
      // toggle → BODY → toggle and never visited the sheet's own links.
      // Measured in WebKit 26.6. Driving the whole ring makes the traversal
      // identical in Chromium, Firefox and WebKit, and it is what makes the
      // overlay genuinely modal rather than merely hard to escape.
      event.preventDefault();

      const active = document.activeElement;
      const currentIndex = active instanceof HTMLElement ? focusable.indexOf(active) : -1;
      const step = event.shiftKey ? -1 : 1;
      // From outside the ring, Tab enters at the front and Shift+Tab at the back.
      const nextIndex =
        currentIndex === -1
          ? event.shiftKey
            ? focusable.length - 1
            : 0
          : (currentIndex + step + focusable.length) % focusable.length;

      focusable[nextIndex].focus();
    }

    function isOutside(event: Event): boolean {
      const target = event.target;
      return !(target instanceof Node) || container?.contains(target) !== true;
    }

    function handleFocusIn(event: FocusEvent): void {
      if (isOutside(event)) onDismiss("focus-outside");
    }

    function handlePointerDown(event: PointerEvent): void {
      if (isOutside(event)) onDismiss("pointer-outside");
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isActive, containerRef, initialFocusRef, onDismiss]);
}
