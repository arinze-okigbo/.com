import { describe, expect, it } from "vitest";
import { cn, isExternalHref } from "@/lib/utils";

describe("cn", () => {
  it("merges conditional and conflicting classes", () => {
    expect(cn("px-4", false && "hidden", "px-2")).toBe("px-2");
  });

  it("returns an empty string when every input is falsy", () => {
    expect(cn(false, undefined, null)).toBe("");
  });
});

describe("isExternalHref", () => {
  it("treats an absolute https URL as external", () => {
    expect(isExternalHref("https://splita.co")).toBe(true);
  });

  it("treats a hash anchor as internal", () => {
    expect(isExternalHref("#work")).toBe(false);
  });

  it("treats a root-relative route as internal", () => {
    expect(isExternalHref("/writing")).toBe(false);
  });

  it("treats a mailto address as internal so it opens in the same tab", () => {
    expect(isExternalHref("mailto:arinze@splita.co")).toBe(false);
  });
});
