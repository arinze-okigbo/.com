import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { parseFrontmatter } from "@/content/writing/frontmatter";
import type { Post, PostSummary } from "@/content/writing/types";

/**
 * The writing content layer — `docs/05 §6`.
 *
 * Reads `content/writing/*.mdx` from disk at build time. Server-only: never
 * import this from a `'use client'` module.
 *
 * THE SWITCH. `docs/05 §6` specifies one boolean derived from the content layer,
 * never hand-edited:
 *
 *     publishedPosts.length >= WRITING_MIN_POSTS
 *
 * While it is false the homepage section is not rendered, the nav carries no
 * Writing item, the footer carries no writing link, and `/writing*` is
 * `noindex, nofollow` and excluded from the sitemap and the feed. When it flips
 * true, all seven surfaces invert without a copy change.
 */

/** `docs/03 F10`: one thin post reads worse than none. Two real posts or the section stays dark. */
export const WRITING_MIN_POSTS = 2;

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "writing");
const POST_EXTENSIONS: readonly string[] = [".mdx", ".md"];

function isPostFile(filename: string): boolean {
  return POST_EXTENSIONS.some((extension) => filename.endsWith(extension));
}

function toSlug(filename: string): string {
  return filename.replace(/\.mdx?$/, "");
}

function readPostFiles(): readonly string[] {
  try {
    return readdirSync(POSTS_DIRECTORY).filter(isPostFile).toSorted();
  } catch (error: unknown) {
    // An absent directory means zero posts, which is the launch state and not an
    // error. Anything else is a real filesystem failure and must not be swallowed.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
}

function readPost(filename: string): Post {
  const raw = readFileSync(path.join(POSTS_DIRECTORY, filename), "utf8");
  const { frontmatter, body } = parseFrontmatter(filename, raw);

  return { slug: toSlug(filename), frontmatter, body };
}

function byDateDescending(a: Post, b: Post): number {
  return Date.parse(b.frontmatter.date) - Date.parse(a.frontmatter.date);
}

/**
 * One snapshot per process in production, so every surface that reads this
 * pipeline sees the same set of posts.
 *
 * `sitemap.ts`, `robots.ts`, `feed.xml`, the homepage section and both writing
 * routes all derive from this module. Without a snapshot each of them re-reads
 * the directory independently, and a file landing mid-build could make the
 * sitemap and the rendered section disagree about what is published — the exact
 * divergence this pipeline was consolidated to remove.
 *
 * Not cached in development: the point there is that editing a post shows up on
 * the next request without restarting the dev server.
 *
 * INTERACTION WITH ISR, so nobody debugs the wrong layer. `sitemap.ts`,
 * `robots.ts` and `feed.xml` each set `revalidate = 3600`. Inside a warm
 * production process those revalidations re-render against this same snapshot,
 * so the timers cannot surface a newly published post at runtime. That is
 * correct, not a bug: `content/writing/` is baked into the deployment and the
 * serverless filesystem is immutable, so a new post requires a redeploy either
 * way. The timers refresh `lastModified` and `lastBuildDate`; they are not a
 * content-discovery mechanism.
 */
let snapshot: readonly Post[] | null = null;

function readAllPosts(): readonly Post[] {
  return readPostFiles().map(readPost).toSorted(byDateDescending);
}

/** Every post on disk, drafts included, newest first. */
export function getAllPosts(): readonly Post[] {
  if (process.env.NODE_ENV !== "production") return readAllPosts();

  snapshot ??= readAllPosts();
  return snapshot;
}

/** Published posts only, newest first. Drafts never reach the count or the feed. */
export function getPublishedPosts(): readonly Post[] {
  return getAllPosts().filter((post) => post.frontmatter.published);
}

export function getPublishedPost(slug: string): Post | null {
  return getPublishedPosts().find((post) => post.slug === slug) ?? null;
}

export function toSummary(post: Post): PostSummary {
  return {
    slug: post.slug,
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    date: post.frontmatter.date,
  };
}

export function getPublishedSummaries(): readonly PostSummary[] {
  return getPublishedPosts().map(toSummary);
}

/**
 * THE FLAG. The single switch of `docs/05 §6`.
 * Every writing surface reads this and nothing else.
 */
export function isWritingEnabled(): boolean {
  return getPublishedPosts().length >= WRITING_MIN_POSTS;
}
