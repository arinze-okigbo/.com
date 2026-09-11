import type { ReactNode } from "react";

import { StandaloneLink } from "@/components/ui/StandaloneLink";
import { ResumeAffordance } from "@/components/sections/primitives/ResumeAffordance";
import type { ContactLink } from "@/content/types";

/**
 * `ContactBlock` — `docs/04 §8.2`.
 *
 * [R25] `email` is a plain string prop rendered as selectable DOM text — not
 * script-obfuscated, not assembled at runtime, and it survives a JS-disabled
 * render. Recruiters copy addresses into their own systems.
 *
 * [R26] never a form alone: no form ships, and the four profile links below are
 * real `<a>` elements. [R27] all four outbound profile links are present.
 */
export interface ContactBlockProps {
  readonly email: string;
  readonly links: readonly ContactLink[];
  readonly primaryAction: ReactNode;
}

export function ContactBlock({ email, links, primaryAction }: ContactBlockProps): ReactNode {
  return (
    <div>
      <p className="text-lead text-foreground">{email}</p>

      <div className="mt-[var(--space-6)]">{primaryAction}</div>

      <ul className="mt-[var(--space-8)] flex flex-col gap-[var(--space-3)]">
        {links.map((link) => (
          <li key={link.href}>
            <StandaloneLink href={link.href}>{link.label}</StandaloneLink>
          </li>
        ))}
        <li>
          <ResumeAffordance />
        </li>
      </ul>
    </div>
  );
}
