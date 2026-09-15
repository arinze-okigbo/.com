import { Icon } from "@/components/hive/Icon";
import Link from "next/link";
import { SpringLab } from "@/components/hive/Experiments";
export default function NotFound() {
  return (
    <section className="shell page-intro">
      <span className="eyebrow">A SMALL DETOUR</span>
      <h1 className="error-number">404.</h1>
      <p className="page-description" style={{ marginTop: 24 }}>
        This page has wandered off. While you’re here, give the spring a nudge.
      </p>
      <Link href="/" className="button button-primary">
        Back to familiar ground <Icon name="arrow-up-right" />
      </Link>
      <div className="experiment-shell" style={{ margin: "56px 0", maxWidth: 640 }}>
        <SpringLab />
      </div>
    </section>
  );
}
