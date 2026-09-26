import { z } from "zod";
import { articleSchema, articleImageUrl, type Article } from "./schemas";
import { articleBlocks } from "./normalize";
const origin = "https://arinzeokigbo.substack.com";
const slug = z.string().regex(/^[a-z0-9-]+$/);
const sourcePost = z.object({
  slug,
  title: z.string().min(1),
  subtitle: z.string().nullish(),
  canonical_url: z
    .string()
    .url()
    .refine((value) => new URL(value).origin === origin),
  post_date: z.string().datetime(),
  audience: z.string(),
  body_html: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  previous_post_slug: slug.nullish(),
  publishedBylines: z.array(z.object({ handle: z.string() })),
  postTags: z.array(z.object({ name: z.string(), hidden: z.boolean().optional() })).optional(),
});
/** Read only JSON embedded in a public page. Never evaluate source JavaScript. */
export function publicSubstackState(html: string): Record<string, unknown> {
  const match = html.match(/window\._preloads\s*=\s*JSON\.parse\(("(?:[^"\\]|\\.)*")\)/);
  if (!match) throw new Error("Public archive data missing");
  return z.record(z.string(), z.unknown()).parse(JSON.parse(JSON.parse(match[1])));
}
function authoredPost(input: unknown) {
  const post = sourcePost.parse(input);
  if (!post.publishedBylines.some((byline) => byline.handle === "arinzeokigbo"))
    throw new Error("Unexpected author");
  if (post.audience !== "everyone") throw new Error("Article is not fully public");
  return post;
}
export function publicArchivePosts(html: string) {
  const state = publicSubstackState(html);
  const data = z.object({ pub: z.array(z.unknown()) }).parse(state.newPostsForArchive);
  return data.pub.map(authoredPost);
}
export function publicArticle(html: string): { article: Article; previous: string | null } {
  const post = authoredPost(publicSubstackState(html).post);
  if (!post.body_html) throw new Error("Full public article body missing");
  const blocks = articleBlocks(post.body_html, post.canonical_url);
  return {
    previous: post.previous_post_slug ?? null,
    article: articleSchema.parse({
      slug: post.slug,
      title: post.title,
      subtitle: post.subtitle ?? "",
      url: post.canonical_url,
      date: post.post_date,
      cover: articleImageUrl.safeParse(post.cover_image).success ? post.cover_image : null,
      bodyHtml: post.body_html,
      blocks,
      readingMinutes: Math.max(
        1,
        Math.ceil(blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0) / 230),
      ),
      tags: (post.postTags ?? []).filter((tag) => !tag.hidden).map((tag) => tag.name),
    }),
  };
}
export const publicArticleUrl = (value: string) => `${origin}/p/${slug.parse(value)}`;
