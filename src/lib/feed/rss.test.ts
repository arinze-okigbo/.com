import { describe, expect, test } from "vitest";

import { escapeXml, renderRssFeed, toRfc822, type FeedChannel } from "@/lib/feed/rss";

const channel: FeedChannel = {
  title: "Arinze Okigbo",
  description: "Co-founder and CEO of Splita.",
  link: "https://arinzeokigbo.com",
  feedUrl: "https://arinzeokigbo.com/feed.xml",
  language: "en-US",
  lastBuildDate: new Date("2026-09-11T00:00:00Z"),
  copyright: "(c) 2026 Arinze Okigbo",
};

describe("escapeXml", () => {
  test("escapes all five XML metacharacters", () => {
    expect(escapeXml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;",
    );
  });

  test("escapes the ampersand before the other entities, not after", () => {
    expect(escapeXml("&lt;")).toBe("&amp;lt;");
  });

  test("strips control characters XML 1.0 forbids", () => {
    const withNul = `before${String.fromCharCode(0)}after`;
    expect(escapeXml(withNul)).toBe("beforeafter");
  });

  test("keeps tab, newline and carriage return", () => {
    expect(escapeXml("a\tb\nc\rd")).toBe("a\tb\nc\rd");
  });
});

describe("renderRssFeed", () => {
  test("renders a valid document with zero items — the launch state", () => {
    const xml = renderRssFeed(channel, []);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<channel>");
    expect(xml).toContain("<title>Arinze Okigbo</title>");
    expect(xml).toContain("<link>https://arinzeokigbo.com</link>");
    expect(xml).toContain("<description>Co-founder and CEO of Splita.</description>");
    expect(xml).toContain("</channel>");
    expect(xml).toContain("</rss>");
    expect(xml).not.toContain("<item>");
  });

  test("balances every opened tag when empty", () => {
    const xml = renderRssFeed(channel, []);
    const opened = xml.match(/<(?!\?|\/|!)[a-zA-Z:]+/g) ?? [];
    const closed = xml.match(/<\/[a-zA-Z:]+/g) ?? [];

    // rss, channel, title, link, description, language, lastBuildDate, copyright
    // all close; atom:link is self-closing.
    expect(closed.length).toBe(opened.length - 1);
  });

  test("renders an item with a permalink guid and an RFC 822 date", () => {
    const xml = renderRssFeed(channel, [
      {
        title: "Why FIDO2 in the browser is hard",
        description: "The platform gap that forced the proof of concept.",
        link: "https://arinzeokigbo.com/writing/fido2-in-the-browser",
        pubDate: new Date("2026-08-01T12:00:00Z"),
      },
    ]);

    expect(xml).toContain("<item>");
    expect(xml).toContain(
      '<guid isPermaLink="true">https://arinzeokigbo.com/writing/fido2-in-the-browser</guid>',
    );
    expect(xml).toContain("<pubDate>Sat, 01 Aug 2026 12:00:00 GMT</pubDate>");
  });

  test("escapes hostile post metadata rather than emitting it as markup", () => {
    const xml = renderRssFeed(channel, [
      {
        title: "</title><script>alert(1)</script>",
        description: "a & b < c",
        link: "https://arinzeokigbo.com/writing/x",
        pubDate: new Date("2026-08-01T12:00:00Z"),
      },
    ]);

    expect(xml).not.toContain("<script>");
    expect(xml).toContain("&lt;/title&gt;&lt;script&gt;");
    expect(xml).toContain("a &amp; b &lt; c");
  });
});

describe("toRfc822", () => {
  test("formats as RSS 2.0 requires", () => {
    expect(toRfc822(new Date("2026-01-02T03:04:05Z"))).toBe("Fri, 02 Jan 2026 03:04:05 GMT");
  });
});
