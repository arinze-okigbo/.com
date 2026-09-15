import { getPublishedSummaries } from "@/content/writing/posts";
import { RSS_CONTENT_TYPE, renderRssFeed, type FeedItem } from "@/lib/feed/rss";
import substackSnapshot from "../../../content/substack.json";
export const runtime = "nodejs";
export const revalidate = 21600;
type FeedPost = { slug: string; title: string; subtitle: string; date: string };
export function buildFeedDocument(
  now = new Date(),
  posts: FeedPost[] = substackSnapshot.items,
): string {
  const items: FeedItem[] = [
    ...posts.map((p) => ({
      title: p.title,
      description: p.subtitle,
      link: `https://arinzeokigbo.com/writing/${p.slug}`,
      pubDate: new Date(p.date),
    })),
    ...getPublishedSummaries()
      .filter((post) => !posts.some((remote) => remote.slug === post.slug))
      .map((p) => ({
        title: p.title,
        description: p.description,
        link: `https://arinzeokigbo.com/writing/${p.slug}`,
        pubDate: new Date(p.date),
      })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  return renderRssFeed(
    {
      title: "Arinze Okigbo — Writing",
      description: "Writing on digital identity, security, and building technology.",
      link: "https://arinzeokigbo.com",
      feedUrl: "https://arinzeokigbo.com/feed.xml",
      language: "en-US",
      lastBuildDate: items[0]?.pubDate ?? now,
      copyright: "(c) 2026 Arinze Okigbo",
    },
    items,
  );
}
export async function GET() {
  const { getHiveContent } = await import("@/lib/hive/feeds");
  const { substack } = await getHiveContent();
  return new Response(buildFeedDocument(new Date(), substack.items), {
    headers: {
      "content-type": RSS_CONTENT_TYPE,
      "cache-control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
