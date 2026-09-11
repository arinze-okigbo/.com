import type { SectionCopy } from "@/content/types";

/**
 * About — `docs/05 §3.5`. Trajectory, not duration (`docs/03 A7`).
 *
 * Excluded on purpose: the old site's "I care about execution and clarity…",
 * "I build systems, products, and companies.", and the "Builder Across AI,
 * Security, and Fintech" achievement — all three are self-summary with no
 * artifact behind them (`docs/03 F3`). The dead app's skills list and stats
 * block are excluded under [R17] and [R18]. AFRIG Mag is not in this copy
 * (`docs/05 §11 Q11`).
 */
export const ABOUT: SectionCopy = {
  id: "about",
  headingId: "about-heading",
  heading: "TechBuzz, AI training, and a Nigerian tech incubator came before Splita.",
  intro: null,
};

/** `[00 §2/L61, L58, L62, L63]`, converted to first person. */
export const aboutParagraphs: readonly string[] = [
  "I founded TechBuzz in 2022 and ran it until 2024 — a media platform about technology and society. I built and maintained the site, led the writers and the editorial direction, and handled the technical and operational execution.",
  "Since 2024 I have evaluated AI-generated code and real software workflows at Alignerr and Outlier, including Microsoft Copilot GenAI tasks reviewed through screen-shared sessions, writing human-readable rationales for the judgments.",
  "Earlier: large-scale data labelling for Mars rover terrain models on NASA's AI4Mars project through Zooniverse, from 2020 to 2023, and a 2018 internship at Ventures Platform Fund in Nigeria working on data security, server management, and operations.",
];

/**
 * [R23] education appears exactly once, as one line, with no GPA, no coursework
 * and no honours list.
 *
 * The trailing `[[NEEDS-FACT §11 Q3]]` of `docs/05 §3.5` — the NYU transfer date
 * and whether Trinity carries explicit dates — is OMITTED, not rendered. When
 * Q3 is answered this string is replaced wholesale. One-line change.
 */
export const educationLine: string = "Computer Science at NYU. Previously Trinity College.";

/**
 * [R22] grant-shaped credentials get exactly one compact home, no `h2`, and
 * never appear in the first two screenfuls. `[00 §4/L105, L106]`, `[00 §2/L60]`.
 */
export const credentialsLine: readonly string[] = [
  "Tyree Innovation & Entrepreneurship Fellow",
  "World Bank Group Youth Summit 2025 Youth Delegate",
];

/**
 * Optional second credentials line, same caption treatment.
 * `docs/05 §3.5`: if the assembled page exceeds six viewport heights [R14],
 * this line is the first thing cut — not the education line.
 */
export const credentialsDetailLine: readonly string[] = [
  "Tyree: Trinity's entrepreneurship fellowship; winner of internal pitch and hackathon competitions. World Bank Youth Summit, May 2025: delivered a speech on Africa's youth in building a global technology hub, and joined a fireside chat on digital currencies in development.",
];
