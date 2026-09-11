import type { ReactNode } from "react";

import { StandaloneLink } from "@/components/ui/StandaloneLink";
import { resumeHref, resumeLabel, resumePendingLabel } from "@/content/chrome";

/**
 * The résumé slot — `docs/05 §3.0`, [R24].
 *
 * The slot is NEVER silently omitted. While no PDF exists (`docs/05 §11 Q1`) it
 * renders as non-interactive text marked pending; when `resumeHref` becomes a
 * URL it becomes a live link reading exactly "Résumé (PDF)". That is a one-line
 * change in `src/content/chrome.ts` — this component needs no edit.
 *
 * This is deliberately NOT a placeholder: "Résumé (PDF) — not yet published" is
 * an adjudicated string stating a true fact, not a bracket standing in for one.
 */
export function ResumeAffordance(): ReactNode {
  if (resumeHref !== null) {
    return <StandaloneLink href={resumeHref}>{resumeLabel}</StandaloneLink>;
  }

  // `--color-foreground-muted`, not `--color-foreground-faint`: docs/04 §3.6
  // licenses the faint token only for a real control that also carries
  // `aria-disabled="true"`, and this is a bare <span> where ARIA discards that
  // attribute. At faint the string measured 1.83:1 light / 2.23:1 dark against
  // a 4.5:1 bar (WCAG 1.4.3). Muted is the token docs/04 names for metadata:
  // 5.35:1 light, 5.73:1 dark.
  return <span className="text-body text-foreground-muted">{resumePendingLabel}</span>;
}
