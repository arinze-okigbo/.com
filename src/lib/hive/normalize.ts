import { XMLParser, XMLValidator } from "fast-xml-parser";
import { substackSchema, githubSchema } from "./schemas";
import { parseFragment, type DefaultTreeAdapterMap } from "parse5";
import { articleImageUrl, type ArticleInline } from "./schemas";
type HtmlNode = DefaultTreeAdapterMap["childNode"];
const excluded = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "template",
  "noscript",
  "form",
  "svg",
  "math",
]);
const isElement = (node: HtmlNode): node is DefaultTreeAdapterMap["element"] => "tagName" in node;
function safeUrl(value: string | undefined, base: string, image = false) {
  if (!value) return undefined;
  try {
    const url = new URL(value, base);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
      return undefined;
    if (image && !articleImageUrl.safeParse(url.href).success) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
function plain(nodes: HtmlNode[]): string {
  return nodes
    .map((node) =>
      "value" in node
        ? node.value
        : isElement(node) && !excluded.has(node.tagName)
          ? plain(node.childNodes)
          : "",
    )
    .join("");
}
function text(html: string) {
  return plain(parseFragment(html).childNodes).replace(/\s+/g, " ").trim();
}
type InlineContext = { href?: string; strong?: boolean; emphasis?: boolean; code?: boolean };
function inlineNodes(
  nodes: HtmlNode[],
  base: string,
  context: InlineContext = {},
): ArticleInline[] {
  return nodes.flatMap((node): ArticleInline[] => {
    if ("value" in node) return [{ type: "text", text: node.value, ...context }];
    if (!isElement(node) || excluded.has(node.tagName)) return [];
    const attrs = Object.fromEntries(node.attrs.map((a) => [a.name, a.value]));
    if (node.tagName === "br") return [{ type: "break" }];
    if (node.tagName === "img") {
      const src = safeUrl(attrs.src, base, true);
      if (!src) return attrs.alt ? [{ type: "text", text: attrs.alt, ...context }] : [];
      const size = (value: string) =>
        /^\d+(?:\.\d+)?$/.test(value) && Number(value) > 0 ? Math.round(Number(value)) : undefined;
      return [
        {
          type: "image",
          src,
          alt: attrs.alt ?? "",
          href: context.href,
          width: size(attrs.width ?? ""),
          height: size(attrs.height ?? ""),
        },
      ];
    }
    const next = { ...context };
    if (node.tagName === "a") next.href = safeUrl(attrs.href, base);
    if (["strong", "b"].includes(node.tagName)) next.strong = true;
    if (["em", "i"].includes(node.tagName)) next.emphasis = true;
    if (node.tagName === "code") next.code = true;
    const children = inlineNodes(node.childNodes, base, next);
    return ["p", "li"].includes(node.tagName) ? [...children, { type: "break" }] : children;
  });
}
/** Parse HTML into a small, explicit React-renderable model. No source attributes reach the DOM. */
export function articleBlocks(html: string, base: string) {
  const blocks: {
    type: "heading" | "paragraph" | "list-item" | "quote" | "code";
    text: string;
    id: string;
    level: number;
    inline: ArticleInline[];
  }[] = [];
  const add = (tag: string, nodes: HtmlNode[]) => {
    const inline = inlineNodes(nodes, base);
    const body = inline
      .map((n) => (n.type === "text" ? n.text : n.type === "break" ? "\n" : ""))
      .join("");
    const value = tag === "pre" ? body : body.replace(/\s+/g, " ").trim();
    if (
      (!value && !inline.some((n) => n.type === "image")) ||
      ["Subscribe", "Share", "Leave a comment"].includes(value)
    )
      return;
    blocks.push({
      type: tag.startsWith("h")
        ? "heading"
        : tag === "li"
          ? "list-item"
          : tag === "blockquote"
            ? "quote"
            : tag === "pre"
              ? "code"
              : "paragraph",
      text: value,
      id: `section-${blocks.length}`,
      level: /^h[1-6]$/.test(tag) ? Number(tag[1]) : 0,
      inline,
    });
  };
  const walk = (nodes: HtmlNode[]) => {
    for (const node of nodes) {
      if (!isElement(node) || excluded.has(node.tagName)) continue;
      if (/^(h[1-6]|p|li|blockquote|pre|figcaption)$/.test(node.tagName))
        add(node.tagName, node.childNodes);
      else if (node.tagName === "img") add("p", [node]);
      else if (node.tagName === "a") add("p", [node]);
      else walk(node.childNodes);
    }
  };
  walk(parseFragment(html).childNodes);
  return blocks;
}
export function normalizeSubstack(xml: string, fetchedAt = new Date().toISOString()) {
  if (XMLValidator.validate(xml) !== true) throw new Error("Invalid RSS XML");
  const parsed = new XMLParser({
    ignoreAttributes: false,
    processEntities: true,
    parseTagValue: false,
  }).parse(xml);
  if (!parsed.rss?.channel) throw new Error("Missing RSS channel");
  const rows = parsed.rss.channel.item
    ? Array.isArray(parsed.rss.channel.item)
      ? parsed.rss.channel.item
      : [parsed.rss.channel.item]
    : [];
  return substackSchema.parse({
    source: "https://arinzeokigbo.substack.com/feed",
    fetchedAt,
    status: "fresh",
    items: rows.map((row: Record<string, unknown>) => {
      const url = String(row.link);
      if (new URL(url).hostname !== "arinzeokigbo.substack.com")
        throw new Error("Unexpected article origin");
      const html = String(row["content:encoded"] ?? row.description ?? "");
      const blocks = articleBlocks(html, url);
      return {
        slug: new URL(url).pathname.split("/").filter(Boolean).at(-1),
        title: text(String(row.title)),
        subtitle: text(String(row.description ?? "")),
        url,
        date: new Date(String(row.pubDate)).toISOString(),
        cover:
          safeUrl((row.enclosure as Record<string, string> | undefined)?.["@_url"], url, true) ??
          null,
        bodyHtml: html,
        blocks,
        readingMinutes: Math.max(
          1,
          Math.ceil(blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0) / 230),
        ),
        tags: String(row.title).includes("Identity")
          ? ["Identity", "Security"]
          : String(row.title).includes("Universities")
            ? ["AI", "Education"]
            : ["Technology", "Environment"],
      };
    }),
  });
}
export function normalizeRepos(input: unknown) {
  if (!Array.isArray(input)) throw new Error("GitHub repos must be an array");
  return githubSchema.shape.repos.parse(
    input.map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      languages: r.language ? [r.language] : [],
      updatedAt: r.pushed_at ?? r.updated_at,
      stars: r.stargazers_count,
    })),
  );
}
export function parseContributions(html: string) {
  const tooltips = new Map(
    Array.from(html.matchAll(/<tool-tip\b[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)).map(
      (m) => [m[1], text(m[2])],
    ),
  );
  const cells = Array.from(html.matchAll(/<td\b[^>]*data-date="\d{4}-\d{2}-\d{2}"[^>]*>/g)).map(
    (m) => {
      const attrs = Object.fromEntries(
        Array.from(m[0].matchAll(/([\w-]+)="([^"]*)"/g)).map((a) => [a[1], a[2]]),
      );
      const tip = tooltips.get(attrs.id) ?? "";
      const count = tip.match(/^(\d+) contributions?/);
      return {
        date: attrs["data-date"],
        level: Number(attrs["data-level"]),
        count: count ? Number(count[1]) : tip.startsWith("No contributions") ? 0 : null,
      };
    },
  );
  if (!cells.length) throw new Error("Contribution calendar unavailable");
  return githubSchema.shape.contributions.parse(cells.sort((a, b) => a.date.localeCompare(b.date)));
}
