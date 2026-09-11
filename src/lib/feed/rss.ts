/**
 * RSS 2.0 serialisation.
 *
 * Hand-rolled rather than dependency-backed: the feed has one channel and a
 * handful of fields, and every value that reaches it is escaped here. A feed
 * generator would add bundle weight and a supply-chain edge for ~40 lines of
 * string building.
 *
 * Every text node crosses `escapeXml` exactly once. There is no path from post
 * frontmatter to an unescaped XML node — the same rule as the email body in
 * `contact/delivery.ts`.
 */

export interface FeedItem {
  readonly title: string;
  readonly description: string;
  /** Absolute URL. Doubles as the `guid`. */
  readonly link: string;
  readonly pubDate: Date;
}

export interface FeedChannel {
  readonly title: string;
  readonly description: string;
  /** Absolute URL of the site the feed describes. */
  readonly link: string;
  /** Absolute URL of the feed document itself, for `atom:link rel="self"`. */
  readonly feedUrl: string;
  readonly language: string;
  readonly lastBuildDate: Date;
  readonly copyright: string;
}

export const RSS_CONTENT_TYPE = "application/rss+xml; charset=utf-8";

/**
 * Escapes the five XML metacharacters, then strips characters XML 1.0 forbids
 * outright (C0 controls other than tab/LF/CR). An unescaped `]]>` cannot
 * appear because nothing here emits a CDATA section.
 */
export function escapeXml(value: string): string {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  let cleaned = "";
  for (const character of escaped) {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) continue;
    const isAllowedControl = codePoint === 0x09 || codePoint === 0x0a || codePoint === 0x0d;
    if (codePoint < 0x20 && !isAllowedControl) continue;
    if (codePoint >= 0x7f && codePoint <= 0x9f) continue;
    cleaned += character;
  }
  return cleaned;
}

/** RFC 822 date, which RSS 2.0 requires for `pubDate` and `lastBuildDate`. */
export function toRfc822(date: Date): string {
  return date.toUTCString();
}

function renderItem(item: FeedItem): string {
  return [
    "    <item>",
    `      <title>${escapeXml(item.title)}</title>`,
    `      <link>${escapeXml(item.link)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
    `      <description>${escapeXml(item.description)}</description>`,
    `      <pubDate>${escapeXml(toRfc822(item.pubDate))}</pubDate>`,
    "    </item>",
  ].join("\n");
}

/**
 * Renders a complete RSS 2.0 document.
 *
 * With an empty `items` array this emits a valid feed: RSS 2.0 requires only
 * `title`, `link` and `description` on the channel, and zero `<item>` elements
 * is conformant. That is the launch state — see the tests.
 */
export function renderRssFeed(channel: FeedChannel, items: readonly FeedItem[]): string {
  const renderedItems = items.map(renderItem);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(channel.title)}</title>`,
    `    <link>${escapeXml(channel.link)}</link>`,
    `    <description>${escapeXml(channel.description)}</description>`,
    `    <language>${escapeXml(channel.language)}</language>`,
    `    <lastBuildDate>${escapeXml(toRfc822(channel.lastBuildDate))}</lastBuildDate>`,
    `    <copyright>${escapeXml(channel.copyright)}</copyright>`,
    `    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...renderedItems,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
