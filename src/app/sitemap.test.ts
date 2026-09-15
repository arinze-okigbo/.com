import { describe, expect, test, vi } from "vitest";
import snapshot from "../../content/substack.json";
vi.mock("@/lib/hive/feeds", () => ({ getHiveContent: async () => ({ substack: snapshot }) }));
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import * as localWriting from "@/content/writing/posts";
import { projects } from "@/content/editorial";
describe("sitemap", () => {
  test("includes all major routes and every sourced project", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    for (const route of [
      "",
      "/about",
      "/work",
      "/projects",
      "/lab",
      "/lab/changelog",
      "/writing",
      "/now",
      "/contact",
      ...projects.map((p) => `/projects/${p.slug}`),
    ])
      expect(urls).toContain(`https://arinzeokigbo.com${route}`);
  });
  test("includes exactly the sourced article routes", async () => {
    const urls = (await sitemap()).map((e) => e.url).filter((u) => u.includes("/writing/"));
    expect(urls).toEqual(snapshot.items.map((p) => `https://arinzeokigbo.com/writing/${p.slug}`));
  });
  test("keeps published local article URLs and deduplicates an overlapping Substack slug", async () => {
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
      const urls = (await sitemap()).map((entry) => entry.url);
      expect(urls).toContain("https://arinzeokigbo.com/writing/local-archive");
      expect(urls.filter((url) => url.endsWith(`/writing/${snapshot.items[0].slug}`))).toHaveLength(
        1,
      );
    } finally {
      local.mockRestore();
    }
  });
  test("all entries have unique canonical HTTPS URLs", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(new URL(url).origin).toBe("https://arinzeokigbo.com");
    }
  });
});
describe("robots", () => {
  test("allows the published writing and links the canonical sitemap", () => {
    expect(robots().rules).toEqual({ userAgent: "*", allow: "/" });
    expect(robots().sitemap).toBe("https://arinzeokigbo.com/sitemap.xml");
  });
});
