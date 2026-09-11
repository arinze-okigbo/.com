import { describe, expect, test } from "vitest";

import { isWritingEnabled } from "@/content/writing/posts";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

/**
 * These assert the launch state: zero published posts, writing hidden. Nothing
 * is mocked — both surfaces read the content layer's own switch, so if that
 * switch flips these tests see it.
 */
describe("sitemap", () => {
  test("the content layer really does report the writing section as hidden", () => {
    expect(isWritingEnabled()).toBe(false);
  });

  test("emits the home page only while writing is unpublished", () => {
    const entries = sitemap();

    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toBe("https://arinzeokigbo.com");
  });

  test("emits no URL for unpublished writing", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls.some((url) => url.includes("/writing"))).toBe(false);
  });

  test("every URL is absolute and on the canonical apex host", () => {
    for (const entry of sitemap()) {
      expect(entry.url.startsWith("https://arinzeokigbo.com")).toBe(true);
      expect(entry.url).not.toContain("www.");
    }
  });
});

describe("robots", () => {
  test("allows the site root and disallows the API", () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;

    expect(rule?.allow).toBe("/");
    expect(rule?.disallow).toContain("/api/");
  });

  test("disallows the writing section while it is unlisted", () => {
    const rules = robots().rules;
    const rule = Array.isArray(rules) ? rules[0] : rules;

    expect(rule?.disallow).toContain("/writing");
  });

  test("points at the sitemap on the canonical apex host", () => {
    expect(robots().sitemap).toBe("https://arinzeokigbo.com/sitemap.xml");
    expect(robots().host).toBe("arinzeokigbo.com");
  });
});
