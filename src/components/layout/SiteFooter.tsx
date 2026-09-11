import { Container } from "@/components/ui/Container";
import { StandaloneLink } from "@/components/ui/StandaloneLink";

export interface FooterLink {
  readonly label: string;
  readonly href: string;
}

export interface SiteFooterProps {
  readonly contactLinks: readonly FooterLink[];
  readonly year: number;
}

/**
 * docs/04 §8.1 — `--text-caption` at `--color-foreground-muted`
 * (5.35:1 / 5.73:1). [03 R27] every outbound profile link is present and live;
 * [03 R26] the footer is not the only contact surface, so it carries no
 * tagline and no self-assessment.
 */
export function SiteFooter({ contactLinks, year }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <Container width="shell">
        <div className="site-footer-inner">
          <p>{`© ${year} Arinze Okigbo`}</p>
          <ul className="footer-links">
            {contactLinks.map((link) => (
              // `StandaloneLink`, not `InlineLink`: each of these is alone in
              // its own <li> and is a navigational affordance, not a link
              // inside a sentence, so the WCAG 2.5.8 inline exception does not
              // apply. As InlineLink they measured 16px tall — "X" was
              // 8.6 x 16 — and passed 2.5.8 only by the spacing exception,
              // with 2.5px of slack at 320px. `.link-standalone` is 24px, and
              // 44px under `pointer: coarse`. This is what ContactBlock does.
              <li key={link.href}>
                <StandaloneLink href={link.href}>{link.label}</StandaloneLink>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
