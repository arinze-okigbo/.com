/**
 * Shared content types for arinzeokigbo.com.
 *
 * Source of truth for every string: `docs/05-information-architecture.md`.
 * Source of truth for every fact behind a string: `docs/00-content-inventory.md`.
 *
 * THE MISSING-FACT CONTRACT
 * -------------------------
 * `docs/05` carries 13 inline `[[NEEDS-FACT: …]]` placeholders for facts the site
 * owner has not supplied. **No placeholder may ever reach the DOM.** Every slot
 * whose fact is missing is typed `| null` and is `null` here. Renderers omit a
 * `null` slot entirely — no brackets, no "TBD", no invented filler.
 *
 * When a fact arrives, filling it is a one-line change in this directory:
 * swap the `null` for the sourced string. No component changes.
 */

/** A run of text inside a sentence, optionally carrying a link. */
export type TextSegment =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "link"; readonly text: string; readonly href: string };

/** A link rendered on its own line. [R12] the label is always information-bearing. */
export interface NamedLink {
  readonly label: string;
  readonly href: string;
}

/** Header navigation item. */
export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/**
 * Contact / profile link. `value` is the bare domain form used in labels.
 * [R20] every `href` matches `^https://` or `^mailto:`.
 */
export interface ContactLink {
  readonly label: string;
  readonly href: string;
  readonly value: string;
}

/**
 * A Selected Work entry. Mirrors `WorkEntryProps` in `docs/04 §8.2`.
 *
 * [R21] `artifact` is the `<h3>` — a thing, never a job title. `role` is metadata
 * rendered below the heading and below the mechanism. That ordering is what makes
 * a young candidate read as "ships things" rather than "impressive for a student".
 */
export interface WorkEntryContent {
  /** In-page anchor id. `queralt` is linked from the hero artifact list. */
  readonly id: string;
  /** [R21] The artifact. Renders as the `<h3>`. Never a job title. */
  readonly artifact: string;
  /** [R19/R20] absolute https:// URL — the external referent. */
  readonly href: string;
  /** [R11] the mechanism, <= 12 words. First line of body text. */
  readonly mechanism: string;
  /**
   * [R16] active first-person clauses naming what he personally built.
   * Paragraph 1 fills the `contribution` prop; the rest render as nested detail.
   * Unsourced sentences are absent from this array, never stubbed.
   */
  readonly contribution: readonly string[];
  /** [R15 slot 4]. `null` where `docs/00` sources no outcome — the entry must not imply one. */
  readonly outcome: string | null;
  /** Metadata. `null` where the fact is disputed or missing; the slot is then omitted. */
  readonly role: string | null;
  readonly org: string;
  readonly period: string | null;
  /** Bare domain shown in the metadata line. */
  readonly domain: string;
}

/** A Projects entry. Mirrors `ProjectEntryProps` in `docs/04 §8.2`. */
export interface ProjectEntryContent {
  readonly id: string;
  readonly artifact: string;
  readonly href: string;
  /** [R11] mechanism, <= 12 words. */
  readonly mechanism: string;
  /** Body paragraphs rendered as nested detail. */
  readonly body: readonly string[];
  /** Metadata line. */
  readonly meta: string;
}

/** A section's heading block. */
export interface SectionCopy {
  readonly id: string;
  readonly headingId: string;
  /** [R8] a standalone claim, load-bearing noun in the first two words. Never a category label. */
  readonly heading: string;
  readonly intro: string | null;
}
