"use client";

import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

export interface ThemeToggleLabels {
  /** Names the TARGET mode, not the current one. docs/05 §3.0. */
  readonly toDark: string;
  readonly toLight: string;
}

export interface ThemeToggleProps {
  readonly labels?: ThemeToggleLabels;
}

const DEFAULT_LABELS: ThemeToggleLabels = {
  toDark: "Switch to dark theme",
  toLight: "Switch to light theme",
};

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * docs/04 §8.1 / §9.2 — two states, one control. No third "system" state.
 * The persisted value overrides the OS preference until the user toggles
 * again.
 *
 * **JS disabled:** the control is not rendered at all. `.theme-toggle` is
 * `display: none` and `.js .theme-toggle` reveals it; `.js` comes from the
 * same blocking script that sets `data-theme`, so the control is present
 * before first paint when JS runs and absent when it does not. No layout
 * shift, and no visible control that cannot function. The page still resolves
 * the correct theme from `prefers-color-scheme` in pure CSS (§9.3 case 5).
 *
 * Both icons and both accessible names are rendered, and CSS picks the right
 * pair off `[data-theme]`. That keeps the control correct at first paint and
 * makes a hydration mismatch structurally impossible.
 */
export function ThemeToggle({ labels = DEFAULT_LABELS }: ThemeToggleProps) {
  // No React state: nothing in this component renders from it. The icon and
  // the accessible name are both selected in CSS off `[data-theme]`, which is
  // what makes the control correct at first paint. The only state that ever
  // existed here fed `aria-pressed`, which has been removed (see below).
  function handleToggle(): void {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private window or blocked site data: the choice applies to this
      // document and simply does not persist. Never a thrown error.
    }
  }

  return (
    // No `aria-pressed`. The accessible name states an ACTION ("Switch to dark
    // theme"); `aria-pressed` states that action is on, so the pair announced
    // as "Switch to light theme, toggle button, pressed" — incoherent under
    // WCAG 4.1.2. It was also always `false` in the SSR HTML while ThemeScript
    // may have already resolved `data-theme="dark"`, so the exposed state was
    // wrong between first paint and hydration for every dark-preference
    // visitor. Action-phrased name with no state is the standard theme-switcher
    // pattern and removes both problems at once.
    <button type="button" className="theme-toggle" onClick={handleToggle}>
      <svg
        className="theme-toggle-icon theme-toggle-dark"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M13.5 9.3A5.8 5.8 0 0 1 6.7 2.5a5.8 5.8 0 1 0 6.8 6.8Z" />
      </svg>
      <svg
        className="theme-toggle-icon theme-toggle-light"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="8" cy="8" r="3.25" />
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M12.95 3.05l-1.06 1.06M4.11 11.89l-1.06 1.06" />
      </svg>
      <VisuallyHidden>
        <span className="theme-toggle-dark">{labels.toDark}</span>
        <span className="theme-toggle-light">{labels.toLight}</span>
      </VisuallyHidden>
    </button>
  );
}
