import { projects } from "@/content/editorial";
import { getPublishedSummaries } from "@/content/writing/posts";
import { getHiveContent } from "@/lib/hive/feeds";
import { navigationPages, type NavigationItem } from "@/components/hive/navigation-index";

/** Lightweight current index; article bodies, personal data and external URLs are omitted. */
export async function GET() {
  const { substack } = await getHiveContent();
  const items: NavigationItem[] = [
    ...navigationPages,
    ...projects.map((project) => ({
      title: project.name,
      href: `/projects/${project.slug}`,
      kind: "Project" as const,
      description: project.description,
      keywords: project.stack.join(" "),
    })),
    ...substack.items.map((article) => ({
      title: article.title,
      href: `/writing/${article.slug}`,
      kind: "Writing" as const,
      description: article.subtitle,
      keywords: article.tags.join(" "),
    })),
    ...getPublishedSummaries()
      .filter((post) => !substack.items.some((article) => article.slug === post.slug))
      .map((post) => ({
        title: post.title,
        href: `/writing/${post.slug}`,
        kind: "Writing" as const,
        description: post.description,
        keywords: "",
      })),
  ];
  return Response.json(
    { items },
    { headers: { "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" } },
  );
}
