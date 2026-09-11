import type { ReactNode } from "react";

import { InlineLink } from "@/components/ui/InlineLink";
import { MetaLine } from "@/components/ui/MetaLine";

/**
 * `ProjectEntry` — `docs/04 §8.2`. Same shape as `WorkEntry`, fewer slots.
 *
 * Renders as a ROW, not a card (`docs/04` DEV-10). [R21] the project is the
 * heading. [R11] the mechanism is the first <= 12 words.
 */
export interface ProjectEntryProps {
  readonly id: string;
  readonly artifact: string;
  /** [R20] absolute https:// URL. */
  readonly href: string;
  /** [R11] <= 12 words, mechanism-first. */
  readonly mechanism: string;
  readonly meta?: string;
  readonly children?: ReactNode;
}

export function ProjectEntry({
  id,
  artifact,
  href,
  mechanism,
  meta,
  children,
}: ProjectEntryProps): ReactNode {
  const headingId = `${id}-heading`;

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

      {children}

      {meta !== undefined && <MetaLine className="mt-[var(--rhythm-meta)]" items={[meta]} />}
    </article>
  );
}
