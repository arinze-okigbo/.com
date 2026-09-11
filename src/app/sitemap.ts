/**
 * `sitemap.xml`, via Next's file convention.
 *
 * Only URLs that render real content are emitted. The writing section ships
 * hidden with zero posts (`docs/05` §6), so `/writing` and every
 * `/writing/[slug]` are excluded until the switch flips — listing a URL a
 * crawler will find empty is worse than not listing it.
 *
 * "Published" is defined in exactly one place, the content layer
 * (`@/content/writing/posts`). This file derives from it and never re-parses
 * a post, so a sitemap URL and a rendered page can never disagree.
 *
 * Server-side only. Nothing here reaches the client bundle.
 */

import type { MetadataRoute } from "next";

import { getPublishedSummaries, isWritingEnabled } from "@/content/writing/posts";
import { SITE_ORIGIN, WRITING_BASE_PATH, absoluteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: SITE_ORIGIN,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 1,
  };

  if (!isWritingEnabled()) {
    return [home];
  }

  const posts = getPublishedSummaries();

  const writingIndex: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl(WRITING_BASE_PATH),
    lastModified: new Date(posts[0]?.date ?? now),
    changeFrequency: "weekly",
    priority: 0.7,
  };

  const postEntries = posts.map((post) => ({
    url: absoluteUrl(`${WRITING_BASE_PATH}/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [home, writingIndex, ...postEntries];
}
