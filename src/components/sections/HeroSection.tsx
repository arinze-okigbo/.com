import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { StandaloneLink } from "@/components/ui/StandaloneLink";
import { Hero } from "@/components/sections/primitives/Hero";
// Imported from its own module, NOT from the `@/components/three` barrel.
// The barrel also exports `AttestationField`, which pulls `FieldStage`'s
// "use client" boundary in with it — and importing the barrel here put that
// boundary into the PAGE chunk as well as the layout's, costing 4 kB of
// First Load JS for a Server Component that renders four spans of text.
import { FieldHud } from "@/components/three/FieldHud";
import { ResumeAffordance } from "@/components/sections/primitives/ResumeAffordance";
import { RichText } from "@/components/sections/primitives/RichText";
import {
  heroArtifacts,
  heroClaim,
  heroCredentials,
  heroName,
  heroPrimaryAction,
} from "@/content/hero";

/**
 * Hero — `docs/05 §3.1`. Screenful 1, the survival gate.
 *
 * `Reveal distance="lg"` per `docs/05 §9`. The motion agent confirms that the
 * `lg` variant pins `opacity: 1` inline and reveals by transform alone, so the
 * LCP text paints on the first frame in every render path — JS enabled, JS
 * disabled, and reduced motion. [R4, R30] hold by construction: no text here is
 * ever held at `opacity: 0`.
 */
export function HeroSection(): ReactNode {
  return (
    <Reveal distance="lg">
      <Hero
        name={heroName}
        claim={heroClaim}
        // `emphasis="proof"` is allowlist A1 (docs/04 §3.5): the 2px accent
        // underline is present AT REST on Splita / Queralt Inc. / Snorkel AI,
        // because a hover-gated router routes nothing for a reader who is
        // skimming [03 AP5]. This is the one call site — F9 caps the page at
        // one accent underline group per viewport, and these three are it.
        credentials={<RichText segments={heroCredentials} emphasis="proof" />}
        artifacts={
          <ul className="mt-[var(--space-8)] flex flex-col gap-[var(--rhythm-inline)]">
            {heroArtifacts.map((artifact) => (
              <li key={artifact.href}>
                <StandaloneLink href={artifact.href}>{artifact.label}</StandaloneLink>
              </li>
            ))}
          </ul>
        }
        primaryAction={
          <Button as="a" href={heroPrimaryAction.href} variant="primary">
            {heroPrimaryAction.label}
          </Button>
        }
        secondaryAction={<ResumeAffordance />}
        // The field's live readout, in flow as the hero's closing block.
        // It used to be `position: fixed` in `layout.tsx` and painted on top
        // of section copy at every scroll position; `FieldHud.tsx` carries the
        // measurement and the reasoning. Server-rendered here too, so it is
        // correct with JavaScript disabled.
        readout={<FieldHud />}
      />
    </Reveal>
  );
}
