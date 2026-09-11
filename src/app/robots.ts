/**
 * `robots.txt`, via Next's file convention.
 *
 * Two rules that matter:
 *  - `/api/` is disallowed. The contact endpoint is not content and a crawler
 *    hitting it only burns the rate limiter.
 *  - `/writing` is disallowed while the section is unlisted (`docs/05` §6).
 *
 * The hidden/public decision comes from the content layer's single switch
 * (`isWritingEnabled`), the same one the homepage section, the nav and the
 * feed read. There is no second definition of "published" here.
 *
 * NOTE for whoever owns the writing routes: `Disallow` stops crawling, not
 * indexing — a disallowed URL can still surface from an external link. The
 * `/writing` and `/writing/[slug]` pages must ALSO export
 * `robots: { index: false, follow: false }` in their own metadata while the
 * section is hidden. robots.txt alone is not sufficient.
 *
 * Server-side only. Nothing here reaches the client bundle.
 */

import type { MetadataRoute } from "next";

import { isWritingEnabled } from "@/content/writing/posts";
import { SITE_HOST, WRITING_BASE_PATH, absoluteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/"];

  if (!isWritingEnabled()) {
    disallow.push(WRITING_BASE_PATH);
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    // Canonical host, apex form. Declared here as well as in the page metadata
    // so the `www.` inconsistency of `docs/00` Defect 8 cannot reappear.
    host: SITE_HOST,
  };
}
