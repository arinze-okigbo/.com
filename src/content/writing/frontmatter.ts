import type { PostFrontmatter } from "@/content/writing/types";

/**
 * Frontmatter parsing and validation for `content/writing/*.mdx`.
 *
 * Deliberately dependency-free: the frontmatter contract in `docs/05 §6` is four
 * scalar keys, which does not justify pulling a YAML parser into the tree.
 * Validation is strict and fails the build loudly — a post with a malformed
 * `date` or a missing `description` must never reach the feed or the meta tags.
 */

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DESCRIPTION_MAX_WORDS = 20;

export interface ParsedFile {
  readonly frontmatter: PostFrontmatter;
  readonly body: string;
}

export class FrontmatterError extends Error {
  constructor(source: string, detail: string) {
    super(`Invalid frontmatter in ${source}: ${detail}`);
    this.name = "FrontmatterError";
  }
}

function stripQuotes(raw: string): string {
  const trimmed = raw.trim();
  const isQuoted =
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")));

  return isQuoted ? trimmed.slice(1, -1) : trimmed;
}

/** Parses `key: value` scalar lines. Comments and blank lines are skipped. */
function parseScalarBlock(block: string): Readonly<Record<string, string>> {
  return block.split(/\r?\n/).reduce<Record<string, string>>((accumulator, line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) return accumulator;

    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) return accumulator;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripQuotes(trimmed.slice(separatorIndex + 1));

    return { ...accumulator, [key]: value };
  }, {});
}

function requireString(
  fields: Readonly<Record<string, string>>,
  key: string,
  source: string,
): string {
  const value = fields[key];
  if (value === undefined || value.length === 0) {
    throw new FrontmatterError(source, `missing required key "${key}"`);
  }
  return value;
}

function countWords(value: string): number {
  return value.trim().split(/\s+/).length;
}

/**
 * Splits frontmatter from body and validates every field.
 *
 * @throws {FrontmatterError} when the block is absent, malformed, or violates
 *   the `docs/05 §6` contract.
 */
export function parseFrontmatter(source: string, raw: string): ParsedFile {
  const match = FRONTMATTER_PATTERN.exec(raw);
  if (match === null) {
    throw new FrontmatterError(source, "no `---` frontmatter block at the top of the file");
  }

  const fields = parseScalarBlock(match[1]);

  const title = requireString(fields, "title", source);
  const description = requireString(fields, "description", source);
  const date = requireString(fields, "date", source);
  const publishedRaw = requireString(fields, "published", source);

  if (!ISO_DATE_PATTERN.test(date)) {
    throw new FrontmatterError(source, `date "${date}" is not ISO 8601 (YYYY-MM-DD)`);
  }
  if (Number.isNaN(Date.parse(date))) {
    throw new FrontmatterError(source, `date "${date}" is not a real calendar date`);
  }
  if (publishedRaw !== "true" && publishedRaw !== "false") {
    throw new FrontmatterError(
      source,
      `published must be exactly "true" or "false", got "${publishedRaw}"`,
    );
  }
  // [R11] mechanism-first, <= 20 words. The description becomes the homepage
  // row's mechanism slot and the per-post meta description.
  if (countWords(description) > DESCRIPTION_MAX_WORDS) {
    throw new FrontmatterError(
      source,
      `description is ${countWords(description)} words; the limit is ${DESCRIPTION_MAX_WORDS} (docs/05 §6, R11)`,
    );
  }

  return {
    frontmatter: { title, description, date, published: publishedRaw === "true" },
    body: raw.slice(match[0].length),
  };
}
