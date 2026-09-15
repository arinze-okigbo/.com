import { Icon } from "@/components/hive/Icon";
import { getPublishedPosts } from "@/content/writing/posts";
import { PageIntro, pageMeta } from "@/components/hive/Primitives";
import { WritingFeed } from "@/components/hive/WritingFeed";
import { getHiveContent } from "@/lib/hive/feeds";
export const metadata = pageMeta(
  "Writing",
  "Essays on digital identity, conditional anonymity, and security, plus public notes from Arinze Okigbo.",
  "/writing",
);
export default async function Writing() {
  const { substack, linkedin } = await getHiveContent();
  const articles = [
    ...substack.items,
    ...getPublishedPosts()
      .filter((post) => !substack.items.some((remote) => remote.slug === post.slug))
      .map((post) => ({
        slug: post.slug,
        title: post.frontmatter.title,
        subtitle: post.frontmatter.description,
        date: post.frontmatter.date,
        readingMinutes: Math.max(1, Math.ceil(post.body.split(/\s+/).length / 220)),
        tags: [] as string[],
        cover: null,
      })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return (
    <>
      <PageIntro
        label="ESSAYS / NOTES / PUBLIC THINKING"
        title="The questions are the work."
        description="Writing about digital identity, security, and the technology we choose to build. Longer thoughts on Substack. Updates along the way on LinkedIn."
      />
      <section className="shell" style={{ paddingBottom: 112 }}>
        <WritingFeed
          articles={articles.map(
            ({ slug, title, subtitle, date, readingMinutes, tags, cover }) => ({
              slug,
              title,
              subtitle,
              date,
              readingMinutes,
              tags,
              cover,
            }),
          )}
          posts={linkedin.items}
        />
        <div className="writing-sources">
          <a
            href="https://arinzeokigbo.substack.com"
            className="text-link"
            target="_blank"
            rel="noreferrer"
          >
            Subscribe on Substack <Icon name="arrow-up-right" />
          </a>
          <a href="/feed.xml" className="text-link">
            Follow via RSS <Icon name="arrow-up-right" />
          </a>
        </div>
      </section>
    </>
  );
}
