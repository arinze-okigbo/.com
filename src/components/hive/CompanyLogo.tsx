import Image from "next/image";
import { SplitaLogo } from "./SplitaLogo";
import "./company-logo.css";

const logos = {
  Cyera: { src: "/brand/cyera.svg", width: 34, height: 33 },
  "Queralt Inc.": { src: "/brand/queralt.png", width: 300, height: 100 },
  "Snorkel AI": { src: "/brand/snorkel.svg", width: 122, height: 35 },
  TechBuzz: { src: "/brand/techbuzz.jpeg", width: 100, height: 100 },
} as const;

/** Official artwork; the adjacent organization heading supplies its accessible name. */
export function CompanyLogo({ organization }: { organization: string }) {
  if (organization === "Splita")
    return (
      <span className="company-logo" aria-hidden="true">
        <SplitaLogo decorative />
      </span>
    );
  const logo = logos[organization as keyof typeof logos];
  if (!logo) return null;
  return (
    <span
      className={`company-logo${organization === "Queralt Inc." ? " company-logo-dark" : ""}`}
      aria-hidden="true"
    >
      <Image {...logo} alt="" sizes="126px" className="company-logo-image" />
    </span>
  );
}
