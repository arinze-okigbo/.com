import type { ContactLink, NamedLink, SectionCopy } from "@/content/types";

/**
 * Contact — `docs/05 §3.6`. The natural exit point, repeated from the header
 * where it was already visible at 0s [R5].
 *
 * [R26] no contact form ships. `docs/04 §8.5` provides no form component; if one
 * is ever added, these four links must remain adjacent to it and above it.
 */
export const CONTACT: SectionCopy = {
  id: "contact",
  headingId: "contact-heading",
  // [R9] passes on the "how to reach him" clause because the address itself is
  // in the headings chain.
  heading: "arinze@splita.co — direct email, plus GitHub, LinkedIn, X, and the résumé.",
  intro: null,
};

/**
 * [R25] plain, selectable DOM text — never script-obfuscated, and it survives a
 * JS-disabled render. Recruiters copy addresses into their own systems.
 */
export const contactEmail: string = "arinze@splita.co";

/** Allowlist A4 — the second and last accent-filled primary button on the page. */
export const contactPrimaryAction: NamedLink = {
  label: "Email arinze@splita.co",
  href: "mailto:arinze@splita.co",
};

/**
 * [R26, R27] four non-form affordances. All four hrefs verbatim from
 * `[00 §5/L119–122]`, all absolute with protocol [R20].
 *
 * The GitHub handle is hyphenated and the LinkedIn handle is not. That is real,
 * recorded at `[00 §5/L121]`, and both are reproduced exactly — see
 * `docs/05 §11 Q13`.
 */
export const contactLinks: readonly ContactLink[] = [
  {
    label: "GitHub — github.com/arinze-okigbo",
    href: "https://github.com/arinze-okigbo",
    value: "github.com/arinze-okigbo",
  },
  {
    label: "LinkedIn — linkedin.com/in/arinzeokigbo",
    href: "https://www.linkedin.com/in/arinzeokigbo",
    value: "linkedin.com/in/arinzeokigbo",
  },
  {
    label: "X — x.com/arinzeokigbo",
    href: "https://x.com/arinzeokigbo",
    value: "x.com/arinzeokigbo",
  },
  {
    label: "Splita — splita.co",
    href: "https://splita.co",
    value: "splita.co",
  },
];
