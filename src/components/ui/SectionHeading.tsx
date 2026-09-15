import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  /**
   * `padX,padY,amount` — `docs/04 §3.5` A8.3, emitted on the heading group.
   *
   * The heading and its intro are a text block like any other and need their
   * own carve when the section composites over the field. They are NOT covered
   * by anything the section declares: scrims live on blocks, never on the
   * `<section>` (see `ui/field.ts`), so without this the heading group sits on
   * whatever the field happens to be emitting. Measured before it was added:
   * `#projects`' intro paragraph at **2.41:1** on a lit gold pixel.
   */
  readonly scrim?: string;
  /** Referenced by the parent `Section`'s `aria-labelledby`. */
  readonly id: string;
  readonly level?: 2 | 3;
  /** Optional intro paragraph, rendered at `--text-lead` inside 42ch. */
  readonly intro?: string;
  readonly className?: string;
  /**
   * The claim. **A sentence, not a category label.**
   * [03 R8] front-load the load-bearing noun in the first two words.
   * [03 R9] the page must pass the headings-only test: read the headings
   * alone and the argument still stands. `<SectionHeading>Projects</SectionHeading>`
   * is the shape this prop name exists to discourage.
   */
  readonly children: ReactNode;
}

/**
 * docs/04 §8.2. Accent is forbidden on heading text (F2); the AP3 guard is
 * met by size + weight (§1.4), never by colour.
 */
export function SectionHeading({
  id,
  level = 2,
  intro,
  scrim,
  className,
  children,
}: SectionHeadingProps) {
  const Heading = level === 2 ? "h2" : "h3";

  return (
    <div className={cn("section-heading-group", className)} data-scrim={scrim}>
      <Heading
        id={id}
        className={cn("section-heading", level === 2 ? "section-heading--2" : "section-heading--3")}
      >
        {children}
      </Heading>
      {intro ? <p className="section-heading-intro">{intro}</p> : null}
    </div>
  );
}
