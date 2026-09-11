import type { ReactNode } from "react";

import { InlineLink } from "@/components/ui/InlineLink";
import { MetaLine } from "@/components/ui/MetaLine";

/**
 * `WorkEntry` — `docs/04 §8.2`. The most constrained contract in the system.
 *
 * [R21] THE ARTIFACT IS THE HEADING; THE JOB TITLE IS METADATA. `artifact`
 * renders as the `<h3>` and is a thing, never a job title. `role` renders fourth,
 * in caption type, inside the metadata line. This ordering is the structural
 * mechanism that makes a young candidate read as "ships things" rather than as
 * "impressive for a student" — it is enforced by the prop contract, not by
 * discipline.
 *
 * [R11] `mechanism` is the first line of body text, <= 12 words.
 * [R16] `contribution` is an active first-person clause naming what HE built.
 * [R15] `outcome` is omitted entirely where `docs/00` sources none — the entry
 *       must not imply one.
 *
 * No card, no border, no background, no icon, no logo. No `tags` prop [R17].
 * No size variant: `docs/03 B4.4` requires the Queralt entry to occupy >= 80% of
 * Splita's vertical space, and a `compact` variant is exactly how that gets
 * quietly broken.
 */
export interface WorkEntryProps {
  /** In-page anchor, e.g. `queralt`. */
  readonly id: string;
  /** [R21] the artifact. Renders as the `<h3>`. A thing, never a job title. */
  readonly artifact: string;
  /** [R19/R20] absolute https:// URL. No entry without an external referent. */
  readonly href: string;
  /** [R11] the mechanism, <= 12 words. First line of body text. */
  readonly mechanism: string;
  /** [R16] active first-person clause. Renders second. */
  readonly contribution: string;
  /** [R21] metadata, rendered below the heading and below the mechanism. */
  readonly role: string | null;
  readonly org: string;
  readonly period: string | null;
  readonly domain: string;
  /** [R15 slot 4]. Omit where `docs/00` has no sourceable outcome. */
  readonly outcome?: string | null;
  /** Nested detail — further contribution paragraphs. */
  readonly children?: ReactNode;
}

export function WorkEntry({
  id,
  artifact,
  href,
  mechanism,
  contribution,
  role,
  org,
  period,
  domain,
  outcome = null,
  children,
}: WorkEntryProps): ReactNode {
  const headingId = `${id}-heading`;

  // A metadata slot whose fact is missing or disputed is dropped from the line
  // rather than stubbed. `docs/05 §11 Q7` and Q8 leave the Snorkel AI title and
  // start date unresolved, so that entry renders "Snorkel AI · snorkel.ai".
  const metaItems: readonly string[] = [role, org, period, domain].filter(
    (item): item is string => item !== null,
  );

  return (
    <article
      id={id}
      aria-labelledby={headingId}
      className="border-t border-border-subtle pt-[var(--rhythm-entry)]"
    >
      <h3 id={headingId} className="text-h3 text-foreground-strong max-w-[var(--measure-h3)]">
        <InlineLink href={href}>{artifact}</InlineLink>
      </h3>

      <p className="mt-[var(--rhythm-title)] text-body text-foreground max-w-[var(--measure-prose)]">
        {mechanism}
      </p>

      <p className="mt-[var(--rhythm-paragraph)] text-body text-foreground max-w-[var(--measure-prose)]">
        {contribution}
      </p>

      {children}

      {outcome !== null && (
        <p className="mt-[var(--rhythm-paragraph)] text-body text-foreground max-w-[var(--measure-prose)]">
          {outcome}
        </p>
      )}

      <MetaLine className="mt-[var(--rhythm-meta)]" items={metaItems} />
    </article>
  );
}
