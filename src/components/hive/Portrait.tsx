import Image from "next/image";
import { PortraitMotion } from "./PortraitMotion";

/** The owner's recovered photograph, served responsively without client image logic. */
export function Portrait({ variant = "hero" }: { variant?: "hero" | "about" }) {
  return (
    <figure className={`editorial-portrait editorial-portrait-${variant}`}>
      <PortraitMotion className="editorial-portrait-frame" variant={variant}>
        <Image
          src="/portrait.webp"
          alt="Portrait of Arinze Okigbo"
          width={1280}
          height={1280}
          sizes="(max-width: 767px) 46vw, (max-width: 1199px) 40vw, 460px"
          loading="eager"
          fetchPriority="high"
          className="editorial-portrait-image"
        />
      </PortraitMotion>
      <figcaption>
        <span>ARINZE OKIGBO</span>
        <span>THE PERSON BEHIND THE WORK</span>
      </figcaption>
    </figure>
  );
}
