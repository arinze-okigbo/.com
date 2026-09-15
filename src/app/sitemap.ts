import type { MetadataRoute } from "next";
import { getPublishedSummaries } from "@/content/writing/posts";
import { projects } from "@/content/editorial";
import { getHiveContent } from "@/lib/hive/feeds";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { substack } = await getHiveContent();
  const paths = [
    "",
    "/about",
    "/work",
    "/projects",
    "/lab",
    "/writing",
    "/now",
    "/contact",
    ...projects.map((p) => `/projects/${p.slug}`),
  ];
  const articles = [
    ...substack.items,
    ...getPublishedSummaries().filter(
      (post) => !substack.items.some((remote) => remote.slug === post.slug),
    ),
  ];
  return [
    ...paths.map((path) => ({
      url: `https://arinzeokigbo.com${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...articles.map((p) => ({
      url: `https://arinzeokigbo.com/writing/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
