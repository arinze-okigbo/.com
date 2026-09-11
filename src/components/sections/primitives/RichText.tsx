import type { ReactNode } from "react";

import { InlineLink, type InlineLinkEmphasis } from "@/components/ui/InlineLink";
import type { TextSegment } from "@/content/types";

export interface RichTextProps {
  readonly segments: readonly TextSegment[];
  /**
   * Passed through to every link in the sentence. docs/04 §3.5 A1 applies to
   * the hero credential sentence and to nothing else, and F9 caps the page at
   * one such group per viewport — so this is `"proof"` in exactly one call
   * site. Defaults to A2.
   */
  readonly emphasis?: InlineLinkEmphasis;
}

/**
 * Renders a sentence made of plain runs and linked proof nouns.
 *
 * The copy lives in `src/content/` as data, not as markup, so a segment can gain
 * or lose a link without touching a component. Server-rendered text only — no
 * `dangerouslySetInnerHTML`, nothing gated on JavaScript [R4, R30].
 */
export function RichText({ segments, emphasis = "default" }: RichTextProps): ReactNode {
  return segments.map((segment, index) =>
    segment.kind === "link" ? (
      <InlineLink key={`s${index}`} href={segment.href} emphasis={emphasis}>
        {segment.text}
      </InlineLink>
    ) : (
      <span key={`s${index}`}>{segment.text}</span>
    ),
  );
}
