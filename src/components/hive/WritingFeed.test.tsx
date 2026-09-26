import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { WritingFeed } from "./WritingFeed";
vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => (
    // Test image rendering without Next's runtime loader.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));
const articles = [
  {
    slug: "identity",
    title: "Digital identity",
    subtitle: "A longer thought",
    date: "2026-06-24T00:00:00Z",
    readingMinutes: 8,
    tags: ["Security"],
    cover: null,
  },
  {
    slug: "environment",
    title: "Environmental technology",
    subtitle: "A second essay",
    date: "2025-01-09T00:00:00Z",
    readingMinutes: 4,
    tags: ["Environment"],
    cover: null,
  },
];
const posts = [
  {
    title: "Working on Splita",
    url: "https://www.linkedin.com/posts/arinzeokigbo_example-activity-123-example",
    date: "2024-12-01T00:00:00Z",
    dateLabel: "Dec 1, 2024",
    summary: "A startup note",
    topics: ["Splita"],
    embedUrl: "https://www.linkedin.com/embed/feed/update/urn:li:share:123",
  },
];
afterEach(cleanup);
describe("writing archive browsing", () => {
  it("combines topic/year/search filters, announces counts, and resets an empty result", () => {
    render(<WritingFeed articles={articles} posts={posts} />);
    expect(screen.getByRole("status")).toHaveTextContent("2 of 2 essays");
    fireEvent.change(screen.getByLabelText("Topic"), { target: { value: "Security" } });
    expect(screen.getByRole("status")).toHaveTextContent("1 of 2 essays");
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2025" } });
    expect(
      screen.getByRole("heading", { name: "No writing matches those filters." }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Show all essays" }));
    fireEvent.change(screen.getByLabelText("Search the archive"), {
      target: { value: " environment " },
    });
    expect(screen.getByRole("status")).toHaveTextContent("1 of 2 essays");
    expect(screen.getByRole("link", { name: /Environmental technology/ })).toHaveAttribute(
      "href",
      "/writing/environment",
    );
  });
  it("sorts real entries, switches collection filters, and requires consent before creating an external iframe", () => {
    render(<WritingFeed articles={articles} posts={posts} />);
    fireEvent.change(screen.getByLabelText("Order"), { target: { value: "oldest" } });
    expect(screen.getAllByRole("heading", { level: 2 })[0]).toHaveTextContent(
      "Environmental technology",
    );
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2026" } });
    fireEvent.click(screen.getByRole("button", { name: "LinkedIn 1" }));
    expect(screen.getByRole("status")).toHaveTextContent("1 of 1 posts");
    expect(document.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Load official LinkedIn embed/ }));
    expect(screen.getByTitle("LinkedIn post: Working on Splita")).toHaveAttribute(
      "src",
      posts[0].embedUrl,
    );
  });
});
