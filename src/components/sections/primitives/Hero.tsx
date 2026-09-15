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
 *
 * ## Over the field — `docs/15 §3` row 1
 *
 * The hero is a `.stage` section: over the field in BOTH themes, so it takes
 * the `--field-*` token scope unconditionally, in CSS, never from script. If
 * that scope were applied by JavaScript, a light-mode visitor with JS disabled
 * would get `#1a1a1a` body copy on `#0a0908` — 1.14:1, worse than the failure
 * the whole port exists to correct.
 *
 * The field brightens directly behind the letterforms, so the name reads as
 * **backlit rather than painted**: `.backlit` is gold at three radii plus one
 * offset in `--field-ink` to hold the type off the ground. It is a
 * `text-shadow`, so it changes no box and contributes nothing to CLS, and it
 * does not delay the LCP paint — the glyphs are painted at full opacity in the
 * first frame either way.
 *
 * The two `data-scrim` rects are the asymmetry `docs/15 §2.10` specifies and
 * the reason the hero authors them per block rather than taking the section's
 * single rect: the headline gets a **tight, light** carve (`26,2,0.62`)
 * because it wants to stay backlit, and the prose gets a **generous,
 * near-opaque** one (`30,18,0.94`) because it wants to be legible. They carve
 * the composite itself (A8.3) — there is no CSS sheet over the canvas, and
 * adding one would mean the contrast check samples pixels that are not the
 * pixels behind the type.
 */

/** Tight and light — the headline wants to be backlit. `docs/15 §2.10`. */
const HEADLINE_SCRIM = "26,2,0.62";
/** Generous and near-opaque — the prose wants to be legible. */
const PROSE_SCRIM = "30,18,0.94";

export interface HeroProps {
  readonly name: string;
  readonly claim: ReactNode;
  readonly credentials: ReactNode;
  readonly artifacts: ReactNode;
  readonly primaryAction: ReactNode;
  readonly secondaryAction: ReactNode;
  /**
   * The field's live readout (`FieldHud`), rendered as the hero's closing
   * block. Optional, and the hero composes identically without it.
   *
   * It is a slot rather than an import because this primitive is presentational
   * and must not reach into `components/three`. It is IN FLOW on purpose: as a
   * fixed layer the readout painted on top of section copy at every scroll
   * position — see the note at the head of `FieldHud.tsx`.
   */
  readonly readout?: ReactNode;
}

export function Hero({
  name,
  claim,
  credentials,
  artifacts,
  primaryAction,
  secondaryAction,
  readout,
}: HeroProps): ReactNode {
  return (
    <Container
      as="section"
      width="prose"
      // `field="stage"` and `fieldState`, NOT a hand-written
      // `data-field-section` attribute. TypeScript does not excess-property
      // check hyphenated JSX attribute names, so a raw `data-*` on a
      // component silently type-checks and is then silently dropped — which
      // is exactly what happened here and cost one build to find. Going
      // through the prop is what makes the contract checkable.
      field="stage"
      fieldState="hero"
      // `padding-block-start` ONLY. docs/04 §8.2 gives Hero a top offset and
      // §2.3 makes the section rule a GAP rather than symmetric padding,
      // precisely so gaps cannot compound. The 64px closing pad that used to
      // be here stacked on #work's 144px `--section-gap` and rendered a 208px
      // hero-to-work gap that is not in the spec.
      className="pt-[calc(var(--header-height)+var(--space-12))]"
    >
      <h1
        className="backlit text-display text-foreground-strong max-w-[var(--measure-display)]"
        data-scrim={HEADLINE_SCRIM}
        data-lit
      >
        {name}
      </h1>

      <div className="mt-[var(--rhythm-title)]" data-scrim={PROSE_SCRIM}>
        <Lede>{claim}</Lede>
      </div>

      <p
        className="mt-[var(--rhythm-paragraph)] text-body text-foreground max-w-[var(--measure-prose)]"
        data-scrim={PROSE_SCRIM}
      >
        {credentials}
      </p>

      <div data-scrim={PROSE_SCRIM}>{artifacts}</div>

      <div
        className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-6)]"
        data-scrim={PROSE_SCRIM}
      >
        {primaryAction}
        {secondaryAction}
      </div>

      {/* The readout declares its own `data-scrim`, so it is not wrapped in
          one here — a second rect around it would be an enclosing scrim and
          `isLeafScrim` would then skip BOTH, leaving the block uncarved. */}
      {readout}
    </Container>
  );
}
