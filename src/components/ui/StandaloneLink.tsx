import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineLink } from "./InlineLink";

export interface StandaloneLinkProps {
  readonly href: string;
  /** Information-bearing text. [03 R12] — see `InlineLink`. */
  readonly children: ReactNode;
  readonly external?: boolean;
  readonly className?: string;
}

/**
 * docs/04 §8.3 — a link on its own line acting as a navigational affordance.
 * Same underline states as `InlineLink`, plus `--hover-lift` (-2px) and a
 * target of at least 24x24 CSS px (44x44 on a coarse pointer) [WCAG 2.5.8].
 */
export function StandaloneLink({ href, children, external, className }: StandaloneLinkProps) {
  return (
    <InlineLink href={href} external={external} className={cn("link-standalone", className)}>
      {children}
    </InlineLink>
  );
}
