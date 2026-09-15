import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { articleBlocks, normalizeRepos, normalizeSubstack, parseContributions } from "./normalize";
import { githubSchema, substackSchema, linkedinSchema } from "./schemas";
const item = (extra = "") =>
  `<rss><channel><item><title>Test identity</title><link>https://arinzeokigbo.substack.com/p/test-identity</link><pubDate>Wed, 24 Jun 2026 17:56:11 GMT</pubDate><description><![CDATA[<p>One &amp; two.</p>${extra}]]></description></item></channel></rss>`;
describe("public feed ingestion", () => {
  it("rejects malformed responses instead of replacing last-good content", () => {
    expect(() => normalizeSubstack("<html>Unavailable</html>")).toThrow();
    expect(() => normalizeRepos({ message: "API rate limit" })).toThrow();
    expect(() => parseContributions("<html>Sign in</html>")).toThrow();
  });
  it("retains a genuinely empty RSS feed", () =>
    expect(normalizeSubstack("<rss><channel><title>Empty</title></channel></rss>").items).toEqual(
      [],
    ));
  it("extracts reading blocks as text, excluding executable and embedded content", () => {
    const article = normalizeSubstack(
      item("<script>alert(1)</script><iframe>external</iframe><h2>Heading</h2>"),
    ).items[0];
    expect(article.blocks.map((b) => b.text)).toEqual(["One & two.", "Heading"]);
    expect(article.blocks[1].type).toBe("heading");
  });
  it("rejects article links outside the verified publication", () =>
    expect(() =>
      normalizeSubstack(
        item().replace(
          "https://arinzeokigbo.substack.com/p/test-identity",
          "https://evil.example/redirect",
        ),
      ),
    ).toThrow());
  it("reads real calendar dates and tooltip counts without inventing activity", () => {
    expect(
      parseContributions(
        '<td id="a" data-date="2026-09-14" data-level="2"></td><tool-tip for="a">3 contributions on September 14.</tool-tip>',
      ),
    ).toEqual([{ date: "2026-09-14", level: 2, count: 3 }]);
    expect(
      parseContributions('<td id="a" data-date="2026-09-14" data-level="0"></td>')[0].count,
    ).toBeNull();
  });
  it("validates every checked-in fallback", () => {
    expect(
      githubSchema.parse(JSON.parse(readFileSync("content/github.json", "utf8"))).repos.length,
    ).toBeGreaterThan(0);
    expect(
      substackSchema
        .parse(JSON.parse(readFileSync("content/substack.json", "utf8")))
        .items.every((a) => a.blocks.length > 0),
    ).toBe(true);
    expect(
      linkedinSchema
        .parse(JSON.parse(readFileSync("content/linkedin-posts.json", "utf8")))
        .items.every((p) => p.url.startsWith("https://www.linkedin.com/posts/arinzeokigbo_")),
    ).toBe(true);
  });
});

describe("article source fidelity and safe inline model", () => {
  it("keeps inline citation destinations, emphasis, image provenance and captions in order", () => {
    const blocks = articleBlocks(
      '<p>Read <a href="https://example.org/paper?q=one&amp;lang=en"><strong>the paper</strong></a> today.</p><figure><a href="/p/figure"><img src="https://substackcdn.com/image.png" alt="Original diagram" width="800" height="450.5"></a><figcaption>Source: <a href="https://example.org">original study</a></figcaption></figure>',
      "https://arinzeokigbo.substack.com/p/article",
    );
    expect(blocks.map((b) => b.text)).toEqual([
      "Read the paper today.",
      "",
      "Source: original study",
    ]);
    expect(blocks[0].inline[1]).toEqual({
      type: "text",
      text: "the paper",
      href: "https://example.org/paper?q=one&lang=en",
      strong: true,
    });
    expect(blocks[1].inline[0]).toMatchObject({
      type: "image",
      src: "https://substackcdn.com/image.png",
      alt: "Original diagram",
      href: "https://arinzeokigbo.substack.com/p/figure",
      width: 800,
      height: 451,
    });
    expect(blocks[2].inline[1]).toMatchObject({ href: "https://example.org/" });
  });
  it("drops executable elements and rejects unsafe protocols, credentials and unapproved image hosts", () => {
    const blocks = articleBlocks(
      '<p><a href="jav&#x61;script:alert(1)" onclick="evil()">citation</a><a href="data:text/html,bad">data</a><a href="https://user:pass@example.org">credential</a><img src="data:image/svg+xml,bad" onerror="evil()"><img src="https://evil.example/photo.png"><img src="https://substackcdn.com/good.png" alt="Safe" onerror="evil()"></p><svg><script>bad()</script><text>bad</text></svg><iframe>bad</iframe><script>bad()</script>',
      "https://arinzeokigbo.substack.com/p/article",
    );
    expect(blocks).toHaveLength(1);
    expect(blocks[0].text).toBe("citationdatacredential");
    expect(blocks[0].inline.filter((n) => n.type === "text").every((n) => !n.href)).toBe(true);
    expect(blocks[0].inline.filter((n) => n.type === "image")).toEqual([
      {
        type: "image",
        src: "https://substackcdn.com/good.png",
        alt: "Safe",
        href: undefined,
        width: undefined,
        height: undefined,
      },
    ]);
    expect(JSON.stringify(blocks)).not.toMatch(/onclick|onerror|bad\(\)|javascript|data:image/);
  });
  it("retains real source citation links and images from every cached article", () => {
    const feed = normalizeSubstack(readFileSync("hive/research/substack-feed.xml", "utf8"));
    expect(feed.items).toHaveLength(5);
    for (const article of feed.items) {
      expect(article.blocks.flatMap((b) => b.inline ?? []).some((n) => n.type === "image")).toBe(
        true,
      );
      const document = new DOMParser().parseFromString(article.bodyHtml, "text/html");
      const expected = [...document.querySelectorAll("a[href]")]
        .filter(
          (a) => !["Subscribe", "Share", "Leave a comment"].includes(a.textContent?.trim() ?? ""),
        )
        .map((a) => new URL(a.getAttribute("href")!, article.url).href)
        .filter((url) => /^https?:/.test(url));
      const actual = article.blocks
        .flatMap((b) => b.inline ?? [])
        .flatMap((n) => (n.type !== "break" && n.href ? [n.href] : []));
      for (const url of expected) expect(actual).toContain(url);
    }
  });
});
