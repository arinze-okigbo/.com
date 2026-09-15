import Link from "next/link";
import { Suspense } from "react";
import { QualityBadge, AuditLink } from "./QualityBadge";
import { contactEmail } from "@/content/contact";
import { NYClock, SoundToggle, UnderTheHood } from "./Interactions";
import { QuickNavigation } from "./QuickNavigation";
export function Footer() {
  return (
    <footer className="hive-footer shell">
      <div className="footer-top">
        <Link className="footer-name" href="/">
          Arinze Okigbo<span>↗</span>
        </Link>
        <div className="footer-links">
          <a href="https://github.com/arinze-okigbo" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href="https://www.linkedin.com/in/arinzeokigbo" target="_blank" rel="noreferrer">
            LinkedIn ↗
          </a>
          <a href={`mailto:${contactEmail}`}>{contactEmail} ↗</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Arinze Okigbo</span>
        <span className="footer-location">
          NEW YORK <NYClock />
        </span>
        <Link href="/lab/changelog" className="swarm-credit">
          <i /> Built by a swarm. Directed by Arinze.
        </Link>
      </div>
      <div className="footer-tools has-quick-navigation">
        <UnderTheHood />
        <Suspense fallback={<AuditLink />}>
          <QualityBadge />
        </Suspense>
        <SoundToggle />
        <QuickNavigation />
        <Link href="/feed.xml">RSS ↗</Link>
      </div>
    </footer>
  );
}
