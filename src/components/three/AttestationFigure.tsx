import type { CSSProperties, ReactElement } from "react";

import { AttestationLive } from "./AttestationLive";
import { AttestationPoster } from "./AttestationPoster";
import { BUILD_ATTESTATION } from "./attestation/build-attestation";

/**
 * The attestation figure — the one 3D moment on the site.
 *
 * Server Component. Renders the framed poster, the readout and the caption into
 * the HTML; the WebGL lattice loads later, over the top, only if the visitor's
 * browser and preferences allow it.
 *
 * docs/05 §3.3: this figure contributes no heading, so the `R9` headings chain
 * is untouched.
 *
 * docs/05 §1038. The figure is `width: 100%` and does not self-constrain.
 */

export interface AttestationFigureProps {
  /**
   * The poster's accessible name, describing the resolved end state.
   * docs/05 §3.3 fixes the wording; pass it from `@/content/site-content`.
   */
  readonly alt: string;
  /**
   * The honesty caption, one entry per paragraph. docs/05 §3.3 makes the second
   * paragraph non-optional — no copy here may describe the figure as encryption
   * or as a security guarantee.
   */
  readonly caption: readonly string[];
}

const CAPTION_PARAGRAPH_STYLE: CSSProperties = {
  margin: 0,
  maxWidth: "var(--measure-prose, 42rem)",
  fontSize: "var(--text-body, 1rem)",
  // Referenced by name so an edit to the @theme token reaches here. Tailwind
  // applies these companion properties only through the `text-*` utility.
  lineHeight: "var(--text-body--line-height, 1.55)",
  letterSpacing: "var(--text-body--letter-spacing, -0.011em)",
  color: "var(--color-foreground-secondary)",
};

export function AttestationFigure({ alt, caption }: AttestationFigureProps): ReactElement {
  return (
    <AttestationLive
      poster={<AttestationPoster alt={alt} />}
      fallbackReadout={{
        alg: BUILD_ATTESTATION.alg,
        short: BUILD_ATTESTATION.short,
        ms: BUILD_ATTESTATION.ms,
      }}
      caption={caption.map((paragraph) => (
        <p key={paragraph} style={CAPTION_PARAGRAPH_STYLE}>
          {paragraph}
        </p>
      ))}
    />
  );
}
