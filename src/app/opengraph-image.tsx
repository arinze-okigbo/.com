/**
 * `GET /opengraph-image` — the Open Graph card, generated at the edge by
 * `next/og`. Artwork lives in `@/lib/seo/render-og-image`; this file is the
 * route-segment config, which Next must be able to read as literals.
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

export default function OpenGraphImage(): Promise<Response> {
  return renderSocialCard();
}
