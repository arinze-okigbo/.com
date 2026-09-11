import { describe, expect, it } from "vitest";

import { FrontmatterError, parseFrontmatter } from "@/content/writing/frontmatter";

const VALID = `---
title: Why browser-native certificate auth is hard
description: What Entra ID CBA does not give you, and the workaround.
date: 2026-03-04
published: true
---

Body text.
`;

describe("parseFrontmatter", () => {
  it("parses every field of the docs/05 §6 contract", () => {
    const { frontmatter, body } = parseFrontmatter("post.mdx", VALID);

    expect(frontmatter.title).toBe("Why browser-native certificate auth is hard");
    expect(frontmatter.date).toBe("2026-03-04");
    expect(frontmatter.published).toBe(true);
    expect(body.trim()).toBe("Body text.");
  });

  it("strips surrounding quotes from a value", () => {
    const raw = VALID.replace("title: Why", 'title: "Why');
    const quoted = raw.replace("auth is hard", 'auth is hard"');

    expect(parseFrontmatter("post.mdx", quoted).frontmatter.title).toBe(
      "Why browser-native certificate auth is hard",
    );
  });

  it("throws when the frontmatter block is missing", () => {
    expect(() => parseFrontmatter("post.mdx", "no frontmatter")).toThrow(FrontmatterError);
  });

  it("throws when a required key is absent", () => {
    const missing = VALID.replace("published: true\n", "");
    expect(() => parseFrontmatter("post.mdx", missing)).toThrow(/published/);
  });

  it("throws when the date is not ISO 8601", () => {
    const bad = VALID.replace("2026-03-04", "March 4 2026");
    expect(() => parseFrontmatter("post.mdx", bad)).toThrow(/ISO 8601/);
  });

  it("throws when published is not a boolean literal", () => {
    const bad = VALID.replace("published: true", "published: yes");
    expect(() => parseFrontmatter("post.mdx", bad)).toThrow(/published/);
  });

  it("throws when the description exceeds 20 words [R11]", () => {
    const long = `description: ${"word ".repeat(25).trim()}`;
    const bad = VALID.replace(
      "description: What Entra ID CBA does not give you, and the workaround.",
      long,
    );
    expect(() => parseFrontmatter("post.mdx", bad)).toThrow(/limit is 20/);
  });

  it("does not mutate its input", () => {
    const original = VALID;
    parseFrontmatter("post.mdx", VALID);
    expect(VALID).toBe(original);
  });
});
