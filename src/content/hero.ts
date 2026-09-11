import type { NamedLink, TextSegment } from "@/content/types";

/**
 * Hero copy — `docs/05 §3.1`. The 7-second survival gate.
 *
 * Everything here is server-rendered text at scroll 0 [R4, R30]. No portrait,
 * no 3D, no scroll hint, no eyebrow, no "Current Focus" card, and the word
 * *student* does not appear [R7].
 */

export const heroName: string = "Arinze Okigbo";

/**
 * [R1, R6] the claim. Seven words, two concrete system nouns, no adjective.
 * Sourced: group payments `[00 §2/L43, §3/L84]`; browser-native authentication
 * `[00 §2/L45, L55]`.
 */
export const heroClaim: string = "I build group-payment and browser-native authentication systems.";

/**
 * [R3] The credential sentence. Four proof nouns, three of them linked.
 * `NYU` is deliberately unlinked — `docs/05 §11 Q3` is unanswered, so there is
 * no sourced URL. Adding one later means adding an `href` to that segment.
 *
 * Cyera is absent on purpose: `docs/05 §11 Q2` sources no title, date or verb
 * for it, so there is no honest clause to write. [R3] needs three approved
 * proper nouns above the fold and four are present without it.
 */
export const heroCredentials: readonly TextSegment[] = [
  { kind: "text", text: "Co-founder and CEO of " },
  { kind: "link", text: "Splita", href: "https://splita.co" },
  {
    kind: "text",
    text: ", with early commitments toward a $200K pre-seed. Authentication R&D at ",
  },
  { kind: "link", text: "Queralt Inc.", href: "https://www.queraltinc.com" },
  { kind: "text", text: ". Model-evaluation pipelines at " },
  { kind: "link", text: "Snorkel AI", href: "https://snorkel.ai" },
  { kind: "text", text: ". CS at NYU." },
];

/**
 * The named linked artifacts — `docs/01` Part 4 item 3: "the three or four
 * things he built, by name, each one a link". The whole line is the accessible
 * name, so [R12] holds on all three.
 */
export const heroArtifacts: readonly NamedLink[] = [
  {
    label: "Splita — group payments collected up front",
    href: "https://splita.co",
  },
  {
    label: "Browser-native authentication at Queralt Inc. — FIDO2, PKI, Microsoft Entra ID",
    href: "#queralt",
  },
  {
    label: "SkyView — 3D globe with live flight traffic",
    href: "https://github.com/arinze-okigbo/sky-view",
  },
];

/**
 * The page's single accent-filled CTA above the fold (allowlist A4).
 * The header's resume slot is therefore a plain link, not a primary button.
 */
export const heroPrimaryAction: NamedLink = {
  label: "Email arinze@splita.co",
  href: "mailto:arinze@splita.co",
};
