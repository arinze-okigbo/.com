import type { ReactNode } from "react";

import { InlineLink } from "@/components/ui/InlineLink";
import type { PostSummary } from "@/content/writing/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * One listed post — `docs/05 §6`: a `ProjectEntry`-shaped row. The title is the
 * `h3` link, the post's own `description` frontmatter fills the mechanism slot
 * [R11], and the date renders as a real `<time datetime>` carrying the ISO 8601
 * value from frontmatter.
 */
export function PostRow({ post }: { readonly post: PostSummary }): ReactNode {
  const headingId = `post-${post.slug}-heading`;

  return (
    <article
      aria-labelledby={headingId}
      className="border-t border-border-subtle pt-[var(--rhythm-entry)]"
    >
      <h3 id={headingId} className="text-h3 text-foreground-strong max-w-[var(--measure-h3)]">
        <InlineLink href={`/writing/${post.slug}`}>{post.title}</InlineLink>
      </h3>

      <p className="mt-[var(--rhythm-title)] text-body text-foreground max-w-[var(--measure-prose)]">
        {post.description}
      </p>

      <p className="mt-[var(--rhythm-meta)] text-caption text-foreground-muted">
        <time dateTime={post.date}>
          {DATE_FORMATTER.format(new Date(`${post.date}T00:00:00Z`))}
        </time>
      </p>
    </article>
  );
}
