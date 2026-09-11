import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Container } from "@/components/ui/Container";
import { StandaloneLink } from "@/components/ui/StandaloneLink";
import { PostRow } from "@/components/sections/PostRow";
import { WRITING_INDEX } from "@/content/writing/copy";
import { getPublishedSummaries, isWritingEnabled } from "@/content/writing/posts";

/**
 * `/writing` — built and working, unlisted at launch (`docs/05 §6`).
 *
 * The route renders whatever published MDX exists in `content/writing/`. While
 * fewer than two posts exist it is `noindex, nofollow`, it is absent from the
 * nav and the footer, and `sitemap.ts` / `feed.xml` exclude it. All of that
 * reads the same flag: `isWritingEnabled()`.
 */
export const metadata: Metadata = {
  title: WRITING_INDEX.metadata.title,
  description: WRITING_INDEX.metadata.description,
  robots: isWritingEnabled() ? undefined : { index: false, follow: false },
};

export default function WritingIndexPage(): ReactNode {
  const posts = getPublishedSummaries();

  return (
    <Container
      as="section"
      width="prose"
      className="pt-[calc(var(--header-height)+var(--space-12))] pb-[var(--section-gap)]"
    >
      <h1 className="text-h1 text-foreground-strong max-w-[var(--measure-h1)]">
        {WRITING_INDEX.heading}
      </h1>

      {posts.length === 0 ? (
        // The empty branch. `getPublishedSummaries()` returns `[]` in every
        // build so far, and mapping over nothing rendered a page whose entire
        // <main> was the word "Writing" (accessibility-c2 N5).
        <>
          <p className="mt-[var(--rhythm-title)] text-body text-foreground max-w-[var(--measure-prose)]">
            {WRITING_INDEX.emptyState.body}
          </p>
          <div className="mt-[var(--space-8)]">
            <StandaloneLink href={WRITING_INDEX.emptyState.homeLink.href}>
              {WRITING_INDEX.emptyState.homeLink.label}
            </StandaloneLink>
          </div>
        </>
      ) : (
        <div className="mt-[var(--rhythm-heading)] flex flex-col gap-[var(--rhythm-entry)]">
          {posts.map((post) => (
            <PostRow key={post.slug} post={post} />
          ))}
        </div>
      )}
    </Container>
  );
}
