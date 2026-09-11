import type { SectionCopy, WorkEntryContent } from "@/content/types";

/**
 * Selected work — `docs/05 §3.2`.
 *
 * Order is by difficulty-legibility, NOT by date (`docs/03 B2`):
 *   Splita → Queralt Inc. → (Cyera) → Snorkel AI.
 *
 * THE CYERA SHIP-GATE (`docs/05 §1`, §3.2, §3.3)
 * ----------------------------------------------
 * The Cyera entry is 100% unsourced — `docs/05 §11 Q2`. `docs/00` has no title,
 * no date range, no URL, no verb for it, and the brief's "former Security Intern
 * at Cyera" is not a permitted source. docs/05 is explicit: the entry is omitted
 * entirely rather than shipped with visible brackets. It is therefore absent
 * from `workEntries` below, and the section heading uses the fallback string.
 *
 * To restore it when Q2 is answered: add the entry at index 2 of `workEntries`
 * and swap `SELECTED_WORK.heading` for `WORK_HEADING_WITH_CYERA`. The intro's
 * count re-derives itself. No component changes.
 */

/** Primary `h2` — used only when the Cyera entry ships. `docs/05 §3.2`. */
export const WORK_HEADING_WITH_CYERA: string =
  "Group payments at Splita. Browser authentication at Queralt Inc. Security at Cyera. AI evaluation at Snorkel AI.";

/** Fallback `h2` — used while the Cyera entry is cut. `docs/05 §3.2`. */
export const WORK_HEADING_WITHOUT_CYERA: string =
  "Group payments at Splita. Browser authentication at Queralt Inc. Model evaluation at Snorkel AI.";

/**
 * Both `intro` strings are authored in `docs/05 §3.2`; the numeral is derived
 * from the entry count, which is the mechanism `information-architecture`
 * sanctioned. Only counts of three and four are reachable (BUILD-PLAN decision 2
 * fixes the entry set at four). A fifth entry must go back to Phase 3 for a new
 * string rather than being pluralised here — hence the explicit map.
 */
const WORK_INTRO_BY_COUNT: Readonly<Record<number, string>> = {
  3: "Three entries, ordered by how hard the work is to fake — not by date.",
  4: "Four entries, ordered by how hard the work is to fake — not by date.",
};

export const workEntries: readonly WorkEntryContent[] = [
  {
    id: "splita",
    artifact: "Splita — group payments collected up front",
    href: "https://splita.co",
    // [R11] 12 words. Verbatim mechanism from `[00 §2/L54]`.
    mechanism: "Each user pays their share first; the platform pays vendors in full.",
    contribution: [
      // [R16]. `[00 §2/L54]`, converted to first person.
      //
      // OMITTED ABOVE THIS LINE: the personal-engineering-contribution sentence
      // required by `docs/05 §3.2` / §7 and tracked as `docs/05 §11 Q4` — the
      // highest-priority gap on the page. `docs/00` sources product-model and
      // company decisions only, never a system he wrote, so no sentence is
      // written here rather than an inferred one. Required shape when supplied:
      // "I built <named component/service> in <language/stack> that <does what,
      // under what constraint>." It becomes contribution[0] and this sourced
      // line moves to index 1 — a one-line data change.
      "I lead vision, product strategy, fundraising, and go-to-market, and I run user research, product development, branding, and partnerships.",
    ],
    // [R15 slot 4], [R18] — the one number traces to `[00 §4/L104]`.
    outcome:
      "Early commitments toward a $200K pre-seed from institutional and fellowship sources. Initial users onboarding.",
    role: "Co-Founder & CEO",
    org: "Splita",
    period: "Aug 2025 – Present",
    domain: "splita.co",
  },
  {
    id: "queralt",
    artifact: "Browser-native authentication — FIDO2, PKI, and Microsoft Entra ID",
    // [R19, R20] absolute with protocol — fixes `[00 Defect 4]` on the one entry
    // where a dead link would do the most damage.
    href: "https://www.queraltinc.com",
    // [R11, 03 B4.1] 11 words. Every noun from `[00 §2/L55]`. The three protocol
    // nouns sit in the heading and the first eleven words, never in a tag row.
    mechanism:
      "Browser-based certificate authentication across Entra ID CBA, WebAuthn/FIDO2, and Windows Hello.",
    contribution: [
      "I analyzed the integration pathways across Entra ID CBA, Windows Hello for Business credential providers, the Microsoft Graph API, WebAuthn/FIDO2, and the Windows Hello APIs.",
      "I mapped credential enrollment, activation, and passwordless login journeys for Chrome and Edge, on Windows and on macOS.",
      "I developed proof-of-concept browser-based certificate authentication workflows and deployment flows with Intune, PKCS/SCEP, and Conditional Access.",
      // OMITTED: the constraint clause required by `docs/03 B4.2` and tracked as
      // `docs/05 §11 Q5` — one clause naming what made browser-native certificate
      // auth hard. `[00 §2/L55]` lists what was analyzed, mapped and built but
      // never states the obstacle, and docs/03 B4.2 will not accept an inferred
      // one. Appended here as contribution[3] when supplied.
    ],
    // `docs/00` sources no outcome for this work and [R15] forbids implying one.
    outcome: null,
    role: "Software Developer Intern",
    org: "Queralt Inc.",
    period: "Jun 2025 – Present",
    domain: "queraltinc.com",
  },
  {
    id: "snorkel-ai",
    artifact: "LLM output evaluation inside production AI pipelines",
    href: "https://snorkel.ai",
    // [R11] 11 words. `[00 §2/L56]` verbatim in substance.
    mechanism:
      "Structured validation of AI-generated outputs across DevOps and infrastructure workflows.",
    contribution: [
      "I evaluate output quality, failure modes, and correctness in engineering-adjacent workflows, and I write the structured feedback used to improve reliability, robustness, and performance.",
    ],
    outcome: null,
    // [[NEEDS-FACT §11 Q7]] — `docs/00` carries two conflicting titles
    // ("AI Contributor (DevOps)" vs "AI Expert Contributor (DevOps)") and docs/05
    // deliberately does not pick one. The slot is omitted from the metadata line
    // rather than guessed. Set the correct title here to restore it.
    role: null,
    org: "Snorkel AI",
    // [[NEEDS-FACT §11 Q8]] — three conflicting start dates in `docs/00`
    // ("2024 – Present", "Dec 2025 - Present", "2026 — Present"). Omitted, not guessed.
    period: null,
    domain: "snorkel.ai",
  },
];

export const SELECTED_WORK: SectionCopy = {
  id: "work",
  headingId: "work-heading",
  heading: workEntries.length === 4 ? WORK_HEADING_WITH_CYERA : WORK_HEADING_WITHOUT_CYERA,
  intro: WORK_INTRO_BY_COUNT[workEntries.length] ?? null,
};
