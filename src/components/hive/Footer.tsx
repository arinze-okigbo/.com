import { Icon } from "@/components/hive/Icon";
import Link from "next/link";
import { contactEmail } from "@/content/contact";
import { NYClock, SoundToggle } from "./Interactions";
import { QuickNavigation } from "./QuickNavigation";
export function Footer() {
  return (
    <footer className="hive-footer shell">
      <div className="footer-top">
        <Link className="footer-name" href="/">
          Arinze Okigbo
          <span>
            <Icon name="arrow-up-right" />
          </span>
        </Link>
        <div className="footer-links">
          <a href="https://github.com/arinze-okigbo" target="_blank" rel="noreferrer">
            GitHub <Icon name="arrow-up-right" />
          </a>
          <a href="https://www.linkedin.com/in/arinzeokigbo" target="_blank" rel="noreferrer">
            LinkedIn <Icon name="arrow-up-right" />
          </a>
          <a href={`mailto:${contactEmail}`}>
            {contactEmail} <Icon name="arrow-up-right" />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Arinze Okigbo</span>
        <span className="footer-location">
          NEW YORK <NYClock />
        </span>
      </div>
      <div className="footer-tools has-quick-navigation">
        <SoundToggle />
        <QuickNavigation />
        <Link href="/feed.xml">
          RSS <Icon name="arrow-up-right" />
        </Link>
      </div>
    </footer>
  );
}
