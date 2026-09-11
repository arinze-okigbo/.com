/**
 * Canonical site identity, for `sitemap.ts`, `robots.ts`, `feed.xml` and the
 * generated social card.
 *
 * Every user-visible string is re-exported from `@/content/metadata`, which is
 * the adjudicated source (`docs/05` §3.8) and the same module
 * `src/app/layout.tsx` reads. Nothing is retyped here — that is what let
 * `openGraph.url` drift to a `www.` form while `metadataBase` and
 * `alternates.canonical` stayed on the apex domain (`docs/00` Defect 8).
 *
 * What this module adds is the URL discipline: one origin constant, one
 * checked helper for building absolute URLs, and the route constants my
 * surfaces need.
 */

import { siteMetadata } from "@/content/metadata";

/** Canonical origin. No trailing slash. No `www.`. */
export const SITE_ORIGIN: string = siteMetadata.baseUrl;

/** Canonical host, without scheme. Used by `robots.ts`'s `host` directive. */
export const SITE_HOST = "arinzeokigbo.com";

export const SITE_NAME: string = siteMetadata.siteName;

export const SITE_TITLE: string = siteMetadata.title;

export const SITE_DESCRIPTION: string = siteMetadata.description;

/** RFC 5646 language tag for the feed and the document. */
export const SITE_LANGUAGE = "en-US";

/** Route the writing index lives at, once it is public. */
export const WRITING_BASE_PATH = "/writing";

/**
 * Build an absolute URL from a root-relative path.
 *
 * Throws on anything that is not root-relative, so a caller can never
 * accidentally emit a protocol-relative or cross-origin URL into the sitemap,
 * the feed, or a canonical tag.
 */
export function absoluteUrl(pathname: string): string {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    throw new Error(`absoluteUrl requires a root-relative path, received: ${pathname}`);
  }
  return `${SITE_ORIGIN}${pathname}`;
}
