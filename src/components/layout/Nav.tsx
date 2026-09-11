"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useFocusTrap, type FocusTrapDismissReason } from "@/lib/a11y/use-focus-trap";

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface MobileNavLabels {
  readonly open: string;
  readonly close: string;
}

export interface NavProps {
  readonly items: readonly NavItem[];
  /** `null` until a résumé PDF exists — the slot still renders. [03 R24] */
  readonly resumeHref: string | null;
  readonly resumeLabel?: string;
  readonly resumePendingLabel?: string;
  readonly mobileLabels?: MobileNavLabels;
  /** Overrides the internal scroll-spy when the page already knows. */
  readonly activeId?: string;
}

const DEFAULT_MOBILE_LABELS: MobileNavLabels = {
  open: "Open menu",
  close: "Close menu",
};

const SHEET_ID = "primary-nav";

/** `--header-height` (docs/04 §2.3). Used as an observer offset, not rendered. */
const HEADER_OFFSET_PX = 64;

/** A section counts as active until its last 40% has scrolled past the top. */
const ACTIVE_BOTTOM_MARGIN = "-60%";

function hashIdsOf(items: readonly NavItem[]): readonly string[] {
  return items.filter((item) => item.href.startsWith("#")).map((item) => item.href.slice(1));
}

/**
 * docs/04 §8.1. Desktop is an inline row; below 768px it is a disclosure
 * sheet — but only when JS is available. Without JS the `.js` class is absent,
 * the sheet rules never match, the list stays inline and every nav target is
 * reachable [03 R30].
 *
 * The active item takes a 2px `--color-accent` bottom marker (allowlist A5,
 * R-GOLD-1 — a 1px accent hairline is a defect, F10).
 *
 * **The open sheet traps focus.** The code this replaced cited SC 2.4.11 Focus
 * Not Obscured as the reason it deliberately did *not* manage focus, on the
 * grounds that the sheet is a non-modal disclosure rather than a dialog. That
 * reading inverted the criterion. 2.4.11 does not ask whether a thing is a
 * dialog; it asks whether the *focused* element is obscured by author content.
 * With the sheet open, Tab walked straight past it onto the hero links
 * underneath, and at 767×900 and 480×700 the focused link and its 2px ring were
 * measured **100% covered — zero visible pixels** (`docs/08-review-accessibility-c2`
 * N1). A non-modal disclosure that paints over content has two lawful options:
 * release the overlay when focus leaves, or keep focus inside it. This takes
 * the second, because it is also the answer to N2 (SC 2.4.3): the trap owns
 * dismissal, so every close has a defined focus destination.
 *
 * The trap is inert on desktop, where the list is an inline row that covers
 * nothing — see `isDisclosure`.
 */
export function Nav({
  items,
  resumeHref,
  resumeLabel = "Résumé (PDF)",
  resumePendingLabel = "Résumé (PDF) — not yet published",
  mobileLabels = DEFAULT_MOBILE_LABELS,
  activeId,
}: NavProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [spiedId, setSpiedId] = useState<string | null>(null);
  const [isDisclosure, setIsDisclosure] = useState<boolean>(false);

  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  /**
   * Is the sheet an overlay right now, or the inline desktop row?
   *
   * Read from the toggle's own `display` rather than from a breakpoint literal:
   * the toggle is revealed by exactly the media query that turns the list into
   * a sheet (`globals.css §8`, `@media not all and (min-width: 48rem)` plus the
   * `.js` gate), so this asks the question the CSS actually answers and cannot
   * drift if `--breakpoint-md` changes. It is also the no-JS answer: without
   * the `.js` class the toggle stays hidden, `isDisclosure` stays false, and
   * nothing here ever runs.
   */
  useEffect(() => {
    const toggle = toggleRef.current;
    if (!toggle) return;
    const sync = (): void => setIsDisclosure(window.getComputedStyle(toggle).display !== "none");
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  // A sheet left open across a resize to desktop would trap focus in a row that
  // covers nothing. Collapse the state with the presentation.
  useEffect(() => {
    if (!isDisclosure) setIsOpen(false);
  }, [isDisclosure]);

  const returnFocusToToggle = useCallback((): void => {
    toggleRef.current?.focus();
  }, []);

  /**
   * Dismissal. SC 2.4.3 Focus Order: closing the sheet applies
   * `visibility: hidden` to whatever holds focus, so the browser blurs it and
   * `document.activeElement` becomes `BODY` unless something puts focus back.
   * Escape returns it to the control that owns the disclosure, which is what
   * `aria-expanded` promises. A pointer or focus move outside is the user
   * choosing a destination themselves — take the sheet down, leave focus alone.
   */
  const handleDismiss = useCallback(
    (reason: FocusTrapDismissReason): void => {
      setIsOpen(false);
      if (reason === "escape") returnFocusToToggle();
    },
    [returnFocusToToggle],
  );

  useFocusTrap({
    isActive: isOpen && isDisclosure,
    containerRef: navRef,
    initialFocusRef: sheetRef,
    onDismiss: handleDismiss,
  });

  /**
   * Activating a link inside the sheet. SC 2.4.3 again: the sheet closes under
   * the focused link, so focus has to be placed deliberately. For an in-page
   * hash the destination section takes it — `tabindex="-1"` makes a section
   * focusable without adding a Tab stop, and `preventScroll` leaves the scroll
   * to the browser's own fragment handling (and to Lenis), so nothing fights
   * over the scroll position. For any other href the browser is about to
   * navigate, so the toggle is the honest resting place.
   */
  const closeAndMoveFocus = useCallback(
    (href: string): void => {
      setIsOpen(false);
      if (!href.startsWith("#")) {
        returnFocusToToggle();
        return;
      }
      const target = document.getElementById(href.slice(1));
      if (!target) {
        returnFocusToToggle();
        return;
      }
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    },
    [returnFocusToToggle],
  );

  // Scroll spy. Pure state read: no motion, so it needs no reduced-motion
  // branch — M9 only removes the marker's travel, not the marker.
  useEffect(() => {
    const ids = hashIdsOf(items);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    let visibility: ReadonlyMap<string, boolean> = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        visibility = entries.reduce<ReadonlyMap<string, boolean>>(
          (accumulated, entry) => new Map(accumulated).set(entry.target.id, entry.isIntersecting),
          visibility,
        );
        setSpiedId(ids.find((id) => visibility.get(id) === true) ?? null);
      },
      {
        rootMargin: `-${HEADER_OFFSET_PX}px 0px ${ACTIVE_BOTTOM_MARGIN} 0px`,
        threshold: 0,
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  const currentId = activeId ?? spiedId;

  return (
    <nav ref={navRef} aria-label="Primary" className="nav">
      <button
        ref={toggleRef}
        type="button"
        className="nav-toggle"
        aria-expanded={isOpen}
        aria-controls={SHEET_ID}
        aria-label={isOpen ? mobileLabels.close : mobileLabels.open}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="theme-toggle-icon"
          aria-hidden="true"
          focusable="false"
        >
          {isOpen ? <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" /> : <path d="M2 4.5h12M2 11.5h12" />}
        </svg>
      </button>

      <div ref={sheetRef} id={SHEET_ID} className="nav-sheet" data-open={isOpen}>
        <ul className="nav-list">
          {items.map((item) => {
            const isCurrent = currentId !== null && item.href === `#${currentId}`;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="nav-link"
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={() => closeAndMoveFocus(item.href)}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
          <li>
            {resumeHref === null ? (
              // Never silently omitted: the slot renders as inert text with a
              // non-colour cue naming the pending state. [03 R24]
              //
              // No `aria-disabled`: this is a bare <span> whose computed role
              // is `generic`, where ARIA discards the attribute entirely. It
              // exposed nothing to AT while implying the WCAG 1.4.3
              // inactive-component exemption applied, which it does not. The
              // words "not yet published" are the non-colour cue R24 asks for.
              <span className="nav-pending">{resumePendingLabel}</span>
            ) : (
              <a
                href={resumeHref}
                className="nav-link"
                onClick={() => closeAndMoveFocus(resumeHref)}
              >
                {resumeLabel}
              </a>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
