import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { NOT_FOUND } from "@/content/not-found";
import { getPublishedPost, getPublishedPosts, isWritingEnabled } from "@/content/writing/posts";
import { renderPostBody } from "@/content/writing/render";

/**
 * `/writing/[slug]` — built and working, unlisted at launch (`docs/05 §6`).
 *
 * Statically generated from `content/writing/*.mdx`. Drafts (`published: false`)
 * never produce a route. `Prose` (`docs/04 §8.2`) supplies every token; code
 * blocks render monochrome because no syntax-highlighting palette exists.
 */

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

interface PostPageProps {
  readonly params: Promise<{ readonly slug: string }>;
}

export function generateStaticParams(): readonly { slug: string }[] {
  return getPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedPost(slug);

  // The title MUST be set on the not-found branch. Returning a metadata object
  // with no `title` declares `title: undefined` for the segment, which
  // suppresses the layout's `title.template` rather than falling through to it,
  // and the document shipped an EMPTY <title> — WCAG 2.4.2 Page Titled, Level
  // A. Reuse the same string `not-found.tsx` renders, so they cannot drift.
  if (post === null) {
    return {
      title: NOT_FOUND.metadata.title,
      description: NOT_FOUND.metadata.description,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    robots: isWritingEnabled() ? undefined : { index: false, follow: false },
  };
}

export default async function PostPage({ params }: PostPageProps): Promise<ReactNode> {
  const { slug } = await params;
  const post = getPublishedPost(slug);

  if (post === null) notFound();

  return (
    <Container
      as="article"
      width="prose"
      className="pt-[calc(var(--header-height)+var(--space-12))] pb-[var(--section-gap)]"
    >
      <h1 className="text-h1 text-foreground-strong max-w-[var(--measure-h1)]">
        {post.frontmatter.title}
      </h1>

      <p className="mt-[var(--rhythm-meta)] text-caption text-foreground-muted">
        <time dateTime={post.frontmatter.date}>
          {DATE_FORMATTER.format(new Date(`${post.frontmatter.date}T00:00:00Z`))}
        </time>
      </p>

      <Prose className="mt-[var(--rhythm-heading)]">{renderPostBody(post.body)}</Prose>
    </Container>
  );
}
