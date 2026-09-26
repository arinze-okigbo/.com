import "@/components/hive/writing-archive.css";
import { Icon } from "@/components/hive/Icon";
import { getPublishedPosts } from "@/content/writing/posts";
import { pageMeta } from "@/components/hive/Primitives";
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
      <header className="shell writing-masthead">
        <div>
          <span className="eyebrow">ESSAYS &amp; NOTES</span>
          <h1>Writing.</h1>
        </div>
        <div className="writing-masthead-description">
          <p>
            Ideas on identity, security, and the technology we choose to build. Notes from the work
            along the way.
          </p>
          <div className="archive-counts">
            {articles.length} essays · {linkedin.items.length} public LinkedIn posts
          </div>
        </div>
      </header>
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
        <p className="archive-scope">
          The essays collected here include full text from my{" "}
          <a href="https://arinzeokigbo.substack.com/archive" target="_blank" rel="noreferrer">
            public Substack archive
          </a>
          . LinkedIn is a collection of publicly accessible posts, with links to the originals; it
          is not a complete account history. Dates on essays reflect their Substack publication.
        </p>
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
