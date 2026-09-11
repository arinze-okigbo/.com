/**
 * All website copy and list data.
 *
 * `src/content/` is the single home for every string and every list that ships.
 * Components take content as props or import it from here; no copy is written
 * inline in a component. This file is the public entry point — import from
 * `@/content/site-content` and the split below can change without churning
 * call sites.
 *
 * Provenance. Every string traces to `docs/05-information-architecture.md`,
 * which in turn cites `docs/00-content-inventory.md` for each fact. The copy is
 * adjudicated: it is not rewritten, tightened or re-toned in a component.
 *
 * Missing facts. `docs/05` carries 13 `[[NEEDS-FACT]]` placeholders. None of them
 * renders. Each missing slot is typed `| null` (or simply absent from its array)
 * and the renderer omits it — no brackets, no "TBD", no invented filler. See
 * `src/content/types.ts` for the contract and each module for what was omitted
 * and which open question unblocks it.
 */

export type {
  ContactLink,
  NamedLink,
  NavItem,
  ProjectEntryContent,
  SectionCopy,
  TextSegment,
  WorkEntryContent,
} from "@/content/types";

export {
  FOOTER_YEAR,
  SKIP_LINK_LABEL,
  WORDMARK,
  footerCopyright,
  footerLinks,
  mobileNavLabels,
  navItems,
  resumeHref,
  resumeLabel,
  resumePendingLabel,
  themeToggleLabels,
} from "@/content/chrome";

export {
  heroArtifacts,
  heroClaim,
  heroCredentials,
  heroName,
  heroPrimaryAction,
} from "@/content/hero";

export {
  SELECTED_WORK,
  WORK_HEADING_WITHOUT_CYERA,
  WORK_HEADING_WITH_CYERA,
  workEntries,
} from "@/content/work";

export { ATTESTATION } from "@/content/attestation";

export { PROJECTS, projectEntries } from "@/content/projects";

export {
  ABOUT,
  aboutParagraphs,
  credentialsDetailLine,
  credentialsLine,
  educationLine,
} from "@/content/about";

export { CONTACT, contactEmail, contactLinks, contactPrimaryAction } from "@/content/contact";

export { NOT_FOUND } from "@/content/not-found";

export { openGraphImageLines, siteMetadata } from "@/content/metadata";

export { WRITING, WRITING_INDEX } from "@/content/writing/copy";
