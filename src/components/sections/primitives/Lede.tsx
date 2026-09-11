import type { ReactNode } from "react";

/**
 * `Lede` — the hero claim. `docs/04 §8.2`.
 *
 * [R1] states what he builds. [R6] carries no self-assessment adjective.
 * [R30] server-rendered and never animation-gated: this text is present in the
 * initial DOM and is not wrapped in a reveal.
 */
export function Lede({ children }: { readonly children: ReactNode }): ReactNode {
  return <p className="text-lead text-foreground max-w-[var(--measure-lead)]">{children}</p>;
}
