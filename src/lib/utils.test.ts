import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conditional and conflicting classes", () => {
    expect(cn("px-4", false && "hidden", "px-2")).toBe("px-2");
  });
});