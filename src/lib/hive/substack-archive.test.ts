import { describe, it, expect } from "vitest";
import { publicArchivePosts, publicArticle, publicSubstackState } from "./substack-archive";
import { refreshSubstack as refreshWithMode, type ReadPublicSource } from "./refresh";
const refreshSubstack = (input: unknown, read: ReadPublicSource) =>
  refreshWithMode(input, read, { deep: true });
import fallback from "../../../content/substack.json";
const page = (data: unknown) =>
  `<script>window._preloads = JSON.parse(${JSON.stringify(JSON.stringify(data))})</script>`;
const source = (slug = "older-essay", previous: string | null = null) => ({
  slug,
  title: "A verified essay",
  subtitle: "Archive",
  canonical_url: `https://arinzeokigbo.substack.com/p/${slug}`,
  post_date: "2024-01-01T00:00:00Z",
  audience: "everyone",
  publishedBylines: [{ handle: "arinzeokigbo" }],
  body_html: '<p>Text with a <a href="https://example.org/reference">citation</a>.</p>',
  previous_post_slug: previous,
  postTags: [{ name: "Technology" }],
});
const emptyRSS = "<rss><channel><title>Arinze</title></channel></rss>";
describe("public writing archive", () => {
  it("keeps request-time refresh shallow and preserves the dated deep archive evidence", async () => {
    const calls: string[] = [];
    const result = await refreshWithMode(fallback, async (url) => {
      calls.push(url);
      return emptyRSS;
    });
    expect(calls).toEqual([fallback.source]);
    expect(result.items).toEqual(fallback.items);
    expect(result.archive).toEqual(fallback.archive);
  });
  it("reads embedded JSON without evaluating JavaScript and rejects unrelated author/paywalls", () => {
    expect(publicArchivePosts(page({ newPostsForArchive: { pub: [source()] } }))).toHaveLength(1);
    expect(() => publicSubstackState("window._preloads = stealCookies()")).toThrow();
    expect(() => publicArticle(page({ post: { ...source(), audience: "only_paid" } }))).toThrow();
    expect(() =>
      publicArticle(
        page({ post: { ...source(), publishedBylines: [{ handle: "another-writer" }] } }),
      ),
    ).toThrow();
    expect(() =>
      publicArticle(
        page({ post: { ...source(), canonical_url: "https://evil.example/p/older-essay" } }),
      ),
    ).toThrow();
  });
  it("retains genuine older essays when RSS becomes a shorter window and imports missing full archive bodies", async () => {
    const result = await refreshSubstack(fallback, async (url) => {
      if (url.endsWith("/feed")) return emptyRSS;
      if (url.endsWith("/archive")) return page({ newPostsForArchive: { pub: [source()] } });
      return page({ post: source() });
    });
    expect(result.items).toHaveLength(fallback.items.length + 1);
    expect(result.items.find((p) => p.slug === "older-essay")?.blocks[0].inline).toContainEqual({
      type: "text",
      text: "citation",
      href: "https://example.org/reference",
    });
    expect(result.archive?.retained).toBe(fallback.items.length);
  });
  it("fetches the full public body of a new RSS excerpt during deep ingestion while runtime remains RSS-only", async () => {
    const older = source("older-essay");
    const newer = { ...source("new-essay"), post_date: "2026-06-24T17:56:11Z" };
    const input = { ...fallback, items: [publicArticle(page({ post: older })).article] };
    const rss = `<rss><channel><item><title>New essay</title><link>${newer.canonical_url}</link><pubDate>Wed, 24 Jun 2026 17:56:11 GMT</pubDate><description>Preview only.</description></item></channel></rss>`;
    const calls: string[] = [];
    const read = async (url: string) => {
      calls.push(url);
      if (url.endsWith("/feed")) return rss;
      if (url.endsWith("/archive")) return page({ newPostsForArchive: { pub: [newer, older] } });
      return page({ post: url === newer.canonical_url ? newer : older });
    };
    const deep = await refreshSubstack(input, read);
    expect(calls).toContain(newer.canonical_url);
    expect(deep.items.find((item) => item.slug === newer.slug)?.bodyHtml).toBe(newer.body_html);
    expect(deep.items.find((item) => item.slug === newer.slug)?.blocks[0].inline).toContainEqual({
      type: "text",
      text: "citation",
      href: "https://example.org/reference",
    });
    calls.length = 0;
    const shallow = await refreshWithMode(input, read);
    expect(calls).toEqual([fallback.source]);
    expect(shallow.items.find((item) => item.slug === newer.slug)?.bodyHtml).toBe("Preview only.");
    // A failed archive request must keep the new slug queued for a later ingestion.
    const interrupted = await refreshSubstack(input, async (url) => {
      if (url.endsWith("/feed")) return rss;
      throw new Error("Archive unavailable");
    });
    expect(interrupted.archive?.pendingSlugs).toContain(newer.slug);
    const resumed = await refreshSubstack(interrupted, read);
    expect(resumed.items.find((item) => item.slug === newer.slug)?.bodyHtml).toBe(newer.body_html);
  });
  it("does not overwrite a retained full body with a shorter RSS excerpt during an article-page outage", async () => {
    const retained = fallback.items[0];
    const rss = `<rss><channel><item><title>Updated title</title><link>${retained.url}</link><pubDate>Wed, 24 Jun 2026 17:56:11 GMT</pubDate><description>Short preview only.</description></item></channel></rss>`;
    const result = await refreshSubstack(fallback, async (url) => {
      if (url.endsWith("/feed")) return rss;
      if (url.endsWith("/archive")) return page({ newPostsForArchive: { pub: [] } });
      throw new Error("Full public page unavailable");
    });
    expect(result.items.find((item) => item.slug === retained.slug)).toEqual(retained);
    expect(result.archive?.status).toBe("partial");
  });
  it("marks partial archive outages honestly while retaining all last-good bodies", async () => {
    const result = await refreshSubstack(fallback, async (url) => {
      if (url.endsWith("/feed")) return emptyRSS;
      throw new Error("offline");
    });
    expect(result.items).toEqual(fallback.items);
    expect(result.archive?.status).toBe("partial");
  });
  it("bounds traversal of source-provided previous links and stops cycles", async () => {
    let requests = 0;
    const result = await refreshSubstack({ ...fallback, items: [] }, async (url) => {
      if (url.endsWith("/feed")) return emptyRSS;
      if (url.endsWith("/archive"))
        return page({ newPostsForArchive: { pub: [source("entry-0")] } });
      const i = requests++;
      return page({ post: source(`entry-${i}`, `entry-${i + 1}`) });
    });
    expect(requests).toBe(24);
    expect(result.items).toHaveLength(24);
    expect(result.archive?.status).toBe("partial");
    expect(result.archive?.pendingSlugs).toEqual(["entry-24"]);
    const resumed: string[] = [];
    await refreshSubstack(result, async (url) => {
      if (url.endsWith("/feed")) return emptyRSS;
      if (url.endsWith("/archive"))
        return page({ newPostsForArchive: { pub: [source("entry-0")] } });
      const slug = url.split("/").at(-1)!;
      resumed.push(slug);
      return page({ post: source(slug) });
    });
    expect(resumed[0]).toBe("entry-24");
    requests = 0;
    const cycle = await refreshSubstack({ ...fallback, items: [] }, async (url) => {
      if (url.endsWith("/feed")) return emptyRSS;
      if (url.endsWith("/archive")) return page({ newPostsForArchive: { pub: [source()] } });
      requests++;
      return page({ post: source("older-essay", "older-essay") });
    });
    expect(requests).toBe(1);
    expect(cycle.items).toHaveLength(1);
  });
});
