import { Icon } from "@/components/hive/Icon";
import Link from "next/link";
import { SplitText } from "@/components/hive/Motion";
import { renderArticleInline } from "@/lib/hive/ArticleInline";
import { notFound } from "next/navigation";
import { getHiveContent } from "@/lib/hive/feeds";
import { getPublishedPost, getPublishedPosts } from "@/content/writing/posts";
import { renderPostBody } from "@/content/writing/render";
import { PageIntro, Source, pageMeta } from "@/components/hive/Primitives";
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() {
  const { substack } = await getHiveContent();
  return [
    ...substack.items.map((p) => ({ slug: p.slug })),
    ...getPublishedPosts()
      .filter((post) => !substack.items.some((remote) => remote.slug === post.slug))
      .map((p) => ({ slug: p.slug })),
  ];
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { substack } = await getHiveContent();
  const p = substack.items.find((p) => p.slug === slug);
  const local = getPublishedPost(slug);
  return p
    ? pageMeta(p.title, p.subtitle, `/writing/${slug}`)
    : local
      ? pageMeta(local.frontmatter.title, local.frontmatter.description, `/writing/${slug}`)
      : { title: "Article not found" };
}
export default async function Article({ params }: Props) {
  const { slug } = await params;
  const { substack } = await getHiveContent();
  const post = substack.items.find((p) => p.slug === slug);
  const local = getPublishedPost(slug);
  if (!post && !local) notFound();
  if (!post && local)
    return (
      <>
        <PageIntro
          label="WRITING"
          title={local.frontmatter.title}
          description={local.frontmatter.description}
        >
          <div className="article-meta">
            <time dateTime={local.frontmatter.date}>
              {new Date(`${local.frontmatter.date}T00:00:00Z`).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
            <span>{Math.max(1, Math.ceil(local.body.split(/\s+/).length / 220))} min read</span>
          </div>
        </PageIntro>
        <article className="article-body">{renderPostBody(local.body)}</article>
      </>
    );
  if (!post) notFound();
  return (
    <>
      <PageIntro
        label="WRITING / ORIGINALLY ON SUBSTACK"
        title={post.title}
        description={post.subtitle}
      >
        <div className="article-meta">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </time>
          <span>{post.readingMinutes} min read</span>
          <Source href={post.url} label="Original article" />
        </div>
      </PageIntro>
      <article className="article-body">
        {post.blocks.some((b) => b.type === "heading") && (
          <nav className="article-toc" aria-label="Table of contents">
            <span className="eyebrow">IN THIS ESSAY</span>
            {post.blocks
              .filter((b) => b.type === "heading")
              .map((b) => (
                <a href={`#${b.id}`} key={b.id}>
                  {b.text}
                </a>
              ))}
          </nav>
        )}
        {post.blocks.map((b, index) =>
          b.type === "heading" ? (
            b.level <= 2 ? (
              <h2 id={b.id} key={index}>
                {b.inline?.some(
                  (node) => node.type === "image" || (node.type === "text" && node.href),
                ) ? (
                  renderArticleInline(b.inline, b.text)
                ) : (
                  <SplitText text={b.text} by="word" />
                )}
              </h2>
            ) : (
              <h3 id={b.id} key={index}>
                {b.inline?.some(
                  (node) => node.type === "image" || (node.type === "text" && node.href),
                ) ? (
                  renderArticleInline(b.inline, b.text)
                ) : (
                  <SplitText text={b.text} by="word" />
                )}
              </h3>
            )
          ) : b.type === "quote" ? (
            <blockquote key={index}>{renderArticleInline(b.inline, b.text)}</blockquote>
          ) : b.type === "code" ? (
            <pre key={index}>
              <code>{renderArticleInline(b.inline, b.text)}</code>
            </pre>
          ) : b.type === "list-item" ? (
            <p className="article-list-item" key={index}>
              • {renderArticleInline(b.inline, b.text)}
            </p>
          ) : (
            <p key={index}>{renderArticleInline(b.inline, b.text)}</p>
          ),
        )}
        <div className="article-end">
          <p>Originally published on Substack.</p>
          <a href={post.url} className="text-link" target="_blank" rel="noreferrer">
            Read the original <Icon name="arrow-up-right" />
          </a>
          <Link href="/writing" className="text-link">
            <Icon name="arrow-left" /> All writing
          </Link>
        </div>
      </article>
    </>
  );
}
