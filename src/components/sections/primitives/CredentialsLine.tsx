import type { ReactNode } from "react";

/**
 * `CredentialsLine` — `docs/04 §8.2`.
 *
 * [R22] grant-shaped credentials (the Tyree Fellowship, the World Bank Youth
 * Summit) must not appear in the first two screenfuls and must not have a
 * section of their own. This component exists so they have exactly one compact
 * home and NO heading — it deliberately renders no `h2`/`h3`, so it never
 * enters the [R9] headings chain.
 *
 * [R23] education is one line here: no GPA, no coursework, no honours list.
 */
export function CredentialsLine({
  items,
  separator = " · ",
}: {
  readonly items: readonly string[];
  readonly separator?: string;
}): ReactNode {
  if (items.length === 0) return null;

  return (
    <p className="text-caption text-foreground-muted max-w-[var(--measure-caption)]">
      {items.join(separator)}
    </p>
  );
}
