import Image from "next/image";
import "./brand.css";

/** An overflow window over the owner's original JPEG; the source artwork is unmodified. */
export function SplitaLogo({
  className = "",
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span className={`splita-logo ${className}`}>
      <Image
        src="/brand/splita-supplied.jpg"
        alt={decorative ? "" : "Splita"}
        width={3024}
        height={3024}
        sizes="280px"
        className="splita-logo-image"
      />
    </span>
  );
}
