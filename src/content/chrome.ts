import type { ContactLink, NavItem } from "@/content/types";

/**
 * Global chrome copy — `docs/05 §3.0`.
 * Consumed by `src/app/layout.tsx` (SiteHeader, SiteFooter, SkipLink, ThemeToggle).
 */

export const SKIP_LINK_LABEL: string = "Skip to content";

export const WORDMARK: string = "Arinze Okigbo";

/**
 * Primary nav, in order. The resume affordance is NOT an item here —
 * `SiteHeader` renders it from `resumeHref` so the pending state of [R24]
 * is a property of the slot rather than of the list.
 */
export const navItems: readonly NavItem[] = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/**
 * [[NEEDS-FACT §11 Q1]] — no resume PDF exists in the repo.
 *
 * [R24] the slot is never silently omitted. While this is `null` the three
 * resume slots (nav, hero, contact) render `resumePendingLabel` as
 * non-interactive text. When the PDF exists, set this to its absolute URL and
 * every slot becomes a live link reading `resumeLabel`. One-line change.
 */
export const resumeHref: string | null = null;

export const resumeLabel: string = "Résumé (PDF)";

export const resumePendingLabel: string = "Résumé (PDF) — not yet published";

/** Icon-only control. `aria-label` names the TARGET mode. */
export const themeToggleLabels = {
  toDark: "Switch to dark theme",
  toLight: "Switch to light theme",
} as const;

/** Mobile nav disclosure `aria-label`, by state. */
export const mobileNavLabels = {
  open: "Open menu",
  close: "Close menu",
} as const;

export const FOOTER_YEAR: number = 2026;

export const footerCopyright: string = "© 2026 Arinze Okigbo";

/**
 * Footer links. Labels are short here and long in the contact section —
 * both forms are information-bearing, so [R12] holds in both places.
 * [R20] every href is absolute with protocol.
 */
export const footerLinks: readonly ContactLink[] = [
  {
    label: "arinze@splita.co",
    href: "mailto:arinze@splita.co",
    value: "arinze@splita.co",
  },
  {
    label: "GitHub",
    href: "https://github.com/arinze-okigbo",
    value: "github.com/arinze-okigbo",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/arinzeokigbo",
    value: "linkedin.com/in/arinzeokigbo",
  },
  { label: "X", href: "https://x.com/arinzeokigbo", value: "x.com/arinzeokigbo" },
];
