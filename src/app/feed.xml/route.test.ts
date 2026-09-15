import { describe, expect, test, vi } from "vitest";
import snapshot from "../../../content/substack.json";
vi.mock("@/lib/hive/feeds", () => ({ getHiveContent: async () => ({ substack: snapshot }) }));
import * as localWriting from "@/content/writing/posts";
import { buildFeedDocument, GET } from "./route";
import { RSS_CONTENT_TYPE } from "@/lib/feed/rss";
describe("writing RSS", () => {
  test("serves RSS with a 6-hour cache", async () => {
    const r = await GET();
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toBe(RSS_CONTENT_TYPE);
    expect(r.headers.get("cache-control")).toContain("s-maxage=21600");
  });
  test("publishes one item for each verified article at the local canonical route", () => {
    const xml = buildFeedDocument();
    expect(xml.match(/<item>/g)).toHaveLength(snapshot.items.length);
    for (const post of snapshot.items)
      expect(xml).toContain(`https://arinzeokigbo.com/writing/${post.slug}`);
    expect(xml).toContain("</rss>");
    expect(xml).not.toContain("www.arinzeokigbo.com");
  });
  test("includes published local archives while keeping each canonical URL unique", () => {
    const local = vi.spyOn(localWriting, "getPublishedSummaries").mockReturnValue([
      {
        slug: "local-archive",
        title: "Local archive fixture",
        description: "Test fixture",
        date: "2026-01-01",
      },
      {
        slug: snapshot.items[0].slug,
        title: "Duplicate fixture",
        description: "Test fixture",
        date: "2026-01-01",
      },
    ]);
    try {
      const xml = buildFeedDocument();
      expect(xml).toContain("https://arinzeokigbo.com/writing/local-archive");
      expect(xml.match(/<item>/g)).toHaveLength(snapshot.items.length + 1);
      expect(xml).not.toContain("Duplicate fixture");
    } finally {
      local.mockRestore();
    }
  });
  test("escapes feed strings instead of injecting markup", () => {
    const xml = buildFeedDocument(new Date(), [
      { slug: "safe", title: "A & <B>", subtitle: "A <script> tag", date: "2026-09-01" },
    ]);
    expect(xml).toContain("A &amp; &lt;B&gt;");
    expect(xml).not.toContain("<script>");
  });
  test("supports an empty collection without invalid dates", () => {
    const xml = buildFeedDocument(new Date("2026-09-11T00:00:00Z"), []);
    expect(xml).not.toContain("<item>");
    expect(xml).toContain("Fri, 11 Sep 2026 00:00:00 GMT");
  });
});
