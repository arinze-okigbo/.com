import type { ReactElement } from "react";

import { AttestationPoster } from "./AttestationPoster";
import { FieldStage } from "./FieldStage";

/**
 * The attestation field — the one generative surface on the site.
 *
 * Server Component. Renders the fixed, full-bleed stage and the poster into the
 * HTML; the WebGL field loads later, over the top, only if the visitor's
 * browser, device and preferences allow it.
 *
 * **Mount this once, in `src/app/layout.tsx`, immediately before `{children}`.**
 * It is not a child of any section — that is what makes it the page's ground
 * rather than a figure inside one, and docs/04 §3.5 A8.5 makes the count
 * binding: there is exactly one such surface on the site, and a second is a
 * defect. It contributes no heading, so the `R9` headings chain is untouched.
 */

export interface AttestationFieldProps {
  /**
   * The poster's accessible name, describing the resolved end state.
   * docs/05 §3.3 fixes the wording; pass it from `@/content/attestation`.
   *
   * Required rather than optional on purpose: for a visitor with JavaScript
   * off, reduced motion on, forced colours on, or no WebGL, the poster is the
   * entire experience, and its name must not be silently droppable.
   */
  readonly alt: string;
  /**
   * The section Acts II and III of the scroll scrub are normalised to.
   * Defaults to `#attestation`, the section the composition gives the field.
   */
  readonly anchorSelector?: string;
}

const DEFAULT_ANCHOR = "#attestation";

export function AttestationField({
  alt,
  anchorSelector = DEFAULT_ANCHOR,
}: AttestationFieldProps): ReactElement {
  return <FieldStage anchorSelector={anchorSelector} poster={<AttestationPoster alt={alt} />} />;
}
