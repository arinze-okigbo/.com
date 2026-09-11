import { describe, expect, test } from "vitest";

import { isWritingEnabled } from "@/content/writing/posts";
import { RSS_CONTENT_TYPE } from "@/lib/feed/rss";
import { GET, buildFeedDocument } from "@/app/feed.xml/route";

/**
 * `content/writing/` holds no published posts at launch, so these run against
 * the real content-layer parser rather than a mock — the empty case is the
 * condition that actually has to hold in production.
 */
describe("GET /feed.xml with zero posts", () => {
  test("the content layer really does report the writing section as hidden", () => {
    expect(isWritingEnabled()).toBe(false);
  });

  test("returns 200 with the RSS content type", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(RSS_CONTENT_TYPE);
  });

  test("body is a complete, item-free RSS 2.0 document", async () => {
    const response = await GET();
    const body = await response.text();

    expect(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(body).toContain('<rss version="2.0"');
    expect(body).toContain("</rss>");
    expect(body).not.toContain("<item>");
  });

  test("advertises itself via atom:link rel=self at the canonical origin", () => {
    const xml = buildFeedDocument(new Date("2026-09-11T00:00:00Z"));

    expect(xml).toContain(
      '<atom:link href="https://arinzeokigbo.com/feed.xml" rel="self" type="application/rss+xml" />',
    );
  });

  test("never emits a www. form of the canonical host", () => {
    const xml = buildFeedDocument();

    expect(xml).not.toContain("www.arinzeokigbo.com");
  });

  test("falls back to the build time for lastBuildDate when nothing is published", () => {
    const now = new Date("2026-09-11T00:00:00Z");

    expect(buildFeedDocument(now)).toContain(
      "<lastBuildDate>Fri, 11 Sep 2026 00:00:00 GMT</lastBuildDate>",
    );
  });
});
