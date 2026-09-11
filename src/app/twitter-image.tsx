/**
 * `GET /twitter-image` — the Twitter/X card.
 *
 * `summary_large_image` is 1200x630, the same canvas as Open Graph, so this
 * renders the identical artwork rather than a second design that could drift.
 * It is a separate file-convention route so Next emits an absolute
 * `twitter:image` URL from `metadataBase` — the same mechanism that removes
 * the hand-written `www.` URL of `docs/00` Defect 8.
 */

import {
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  renderSocialCard,
} from "@/lib/seo/render-og-image";

export const runtime = "edge";

export const alt = OG_ALT;

export const size = OG_IMAGE_SIZE;

export const contentType = OG_CONTENT_TYPE;

export default function TwitterImage(): Promise<Response> {
  return renderSocialCard();
}
