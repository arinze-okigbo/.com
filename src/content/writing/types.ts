/**
 * Writing pipeline types — `docs/05 §6`.
 *
 * The post frontmatter contract, verbatim from `docs/05 §6`:
 *
 *   title:       string    — becomes the h3 and the per-post <title>
 *   description: string    — <= 20 words, mechanism-first [R11]; the meta description
 *   date:        ISO 8601
 *   published:   boolean   — false keeps a draft out of the count and out of the feed
 */

export interface PostFrontmatter {
  readonly title: string;
  readonly description: string;
  /** ISO 8601 calendar date, `YYYY-MM-DD`. Rendered in a `<time datetime>`. */
  readonly date: string;
  readonly published: boolean;
}

export interface Post {
  /** Derived from the filename, minus extension. The route segment. */
  readonly slug: string;
  readonly frontmatter: PostFrontmatter;
  /** Raw MDX body, frontmatter stripped. */
  readonly body: string;
}

/** A post reduced to what the homepage row and the index list need. */
export interface PostSummary {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly date: string;
}
