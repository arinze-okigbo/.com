import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Nav, type MobileNavLabels, type NavItem } from "./Nav";
import { ThemeToggle, type ThemeToggleLabels } from "./ThemeToggle";

export interface SiteHeaderProps {
  readonly items: readonly NavItem[];
  readonly resumeHref: string | null;
  readonly resumeLabel?: string;
  readonly resumePendingLabel?: string;
  readonly mobileNavLabels?: MobileNavLabels;
  readonly themeToggleLabels?: ThemeToggleLabels;
  readonly wordmark?: string;
}

/**
 * docs/04 §8.1 — sticky, `--header-height` (64px), `--color-background` with
 * `backdrop-filter: blur(8px)` and a `--color-border-subtle` bottom hairline.
 * The only sticky element on the site (§5.3).
 *
 * [03 R5]: contact and résumé affordances are reachable at zero scroll, as
 * visible links, never hover-revealed.
 */
export function SiteHeader({
  items,
  resumeHref,
  resumeLabel,
  resumePendingLabel,
  mobileNavLabels,
  themeToggleLabels,
  wordmark = "Arinze Okigbo",
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Container width="shell">
        <div className="site-header-inner">
          <Link href="/" className="wordmark">
            {wordmark}
          </Link>
          <div className="header-actions">
            <Nav
              items={items}
              resumeHref={resumeHref}
              resumeLabel={resumeLabel}
              resumePendingLabel={resumePendingLabel}
              mobileLabels={mobileNavLabels}
            />
            <ThemeToggle labels={themeToggleLabels} />
          </div>
        </div>
      </Container>
    </header>
  );
}
