/**
 * `GET /feed.xml` — RSS 2.0.
 *
 * Zero posts is the launch state (`docs/05` §6), and it produces a valid feed
 * with a populated channel and no `<item>` elements rather than an error or an
 * empty body. See `src/app/feed.xml/route.test.ts`, which exercises that case
 * against the real content layer.
 *
 * Items come from the content layer's `getPublishedSummaries` and are gated by
 * its `isWritingEnabled` switch — the same definition of "published" the
 * homepage section, the nav, the sitemap and the routes use. A feed item can
 * therefore never point at a page the site does not render.
 */

import { getPublishedSummaries, isWritingEnabled } from "@/content/writing/posts";
import { RSS_CONTENT_TYPE, renderRssFeed, type FeedItem } from "@/lib/feed/rss";
import {
  SITE_DESCRIPTION,
  SITE_LANGUAGE,
  SITE_NAME,
  SITE_ORIGIN,
  WRITING_BASE_PATH,
  absoluteUrl,
} from "@/lib/seo/site";
import { describeError, logger } from "@/lib/observability/logger";

export const runtime = "nodejs";
/** Rebuild at most hourly; the feed changes only when a post is published. */
export const revalidate = 3600;

const FEED_PATH = "/feed.xml";
const COPYRIGHT_START_YEAR = 2026;

export function buildFeedDocument(now: Date = new Date()): string {
  // `docs/05` §6: writing items are excluded from the feed while the section is
  // unlisted. The channel still ships so the URL is stable and subscribable
  // from day one.
  const items: readonly FeedItem[] = isWritingEnabled()
    ? getPublishedSummaries().map((post) => ({
        title: post.title,
        description: post.description,
        link: absoluteUrl(`${WRITING_BASE_PATH}/${post.slug}`),
        pubDate: new Date(post.date),
      }))
    : [];

  const latest = items[0]?.pubDate ?? null;

  return renderRssFeed(
    {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      link: SITE_ORIGIN,
      feedUrl: absoluteUrl(FEED_PATH),
      language: SITE_LANGUAGE,
      lastBuildDate: latest !== null && !Number.isNaN(latest.getTime()) ? latest : now,
      copyright: `(c) ${COPYRIGHT_START_YEAR} ${SITE_NAME}`,
    },
    items,
  );
}

export async function GET(): Promise<Response> {
  try {
    return new Response(buildFeedDocument(), {
      status: 200,
      headers: {
        "content-type": RSS_CONTENT_TYPE,
        "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error: unknown) {
    logger.error("feed.render_failed", describeError(error));
    return new Response("Feed temporarily unavailable.", {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
