import { describe, expect, it } from "vitest";
import {
  isNavigationItem,
  navigationPages,
  searchNavigation,
  type NavigationItem,
} from "./navigation-index";
const projects: NavigationItem[] = [
  ...navigationPages,
  {
    title: "Splita",
    href: "/projects/splita",
    kind: "Project",
    description: "Group payments",
    keywords: "fintech",
  },
];
describe("quick navigation index", () => {
  it("ranks a title before descriptions and searches every query word", () => {
    expect(searchNavigation(projects, "SPLITA")[0].href).toBe("/projects/splita");
    expect(searchNavigation(projects, "group fintech")[0].title).toBe("Splita");
    expect(searchNavigation(projects, "splita nonexistent")).toEqual([]);
    expect(searchNavigation(projects, "   ")).toEqual(projects);
  });
  it("rejects external and executable destinations from a fetched index", () => {
    for (const href of [
      "https://elsewhere.test",
      "//elsewhere.test",
      "javascript:alert(1)",
      "/\\elsewhere",
      "/projects/../../private",
    ])
      expect(isNavigationItem({ ...projects[0], href })).toBe(false);
    expect(isNavigationItem(projects.at(-1))).toBe(true);
  });
});
