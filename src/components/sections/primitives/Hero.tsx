import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { Lede } from "@/components/sections/primitives/Lede";

/**
 * `Hero` — `docs/04 §8.2`. The 7-second survival gate.
 *
 * `credentials` is REQUIRED, which is what makes a name-plus-tagline hero
 * unbuildable [R2]. There is no `tagline` prop and no `eyebrow` prop, and there
 * is no portrait, no 3D object and no scroll hint [R32, BUILD-PLAN 6].
 *
 * Nothing here is client-only. The `h1`, the claim and the credential sentence
 * are plain server-rendered text and are not wrapped in a reveal, because this
 * is the LCP element and no animation may delay the availability of any text
 * [R4, R30]. `artifacts` and `actions` sit below the claim block and may be
 * revealed.
 */
export interface HeroProps {
  readonly name: string;
  readonly claim: ReactNode;
  readonly credentials: ReactNode;
  readonly artifacts: ReactNode;
  readonly primaryAction: ReactNode;
  readonly secondaryAction: ReactNode;
}

export function Hero({
  name,
  claim,
  credentials,
  artifacts,
  primaryAction,
  secondaryAction,
}: HeroProps): ReactNode {
  return (
    <Container
      as="section"
      width="prose"
      // `padding-block-start` ONLY. docs/04 §8.2 gives Hero a top offset and
      // §2.3 makes the section rule a GAP rather than symmetric padding,
      // precisely so gaps cannot compound. The 64px closing pad that used to
      // be here stacked on #work's 144px `--section-gap` and rendered a 208px
      // hero-to-work gap that is not in the spec.
      className="pt-[calc(var(--header-height)+var(--space-12))]"
    >
      <h1 className="text-display text-foreground-strong max-w-[var(--measure-display)]">{name}</h1>

      <div className="mt-[var(--rhythm-title)]">
        <Lede>{claim}</Lede>
      </div>

      <p className="mt-[var(--rhythm-paragraph)] text-body text-foreground max-w-[var(--measure-prose)]">
        {credentials}
      </p>

      {artifacts}

      <div className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-6)]">
        {primaryAction}
        {secondaryAction}
      </div>
    </Container>
  );
}
