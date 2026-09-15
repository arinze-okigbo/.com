import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { articleBlocks } from "./normalize";
import { renderArticleInline } from "./ArticleInline";
import { articleInlineSchema } from "./schemas";

describe("safe article rendering", () => {
  it("renders the original citation and image without source event attributes or executable markup", () => {
    const blocks = articleBlocks(
      '<p><a href="https://example.org/study" onclick="evil()"><em>Study &amp; evidence</em></a><img src="https://substackcdn.com/figure.png" alt="Figure &quot;one&quot;" onerror="evil()"><script>alert(1)</script></p>',
      "https://arinzeokigbo.substack.com/p/article",
    );
    const html = renderToStaticMarkup(<>{renderArticleInline(blocks[0].inline, blocks[0].text)}</>);
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.querySelector("a")?.getAttribute("href")).toBe("https://example.org/study");
    expect(doc.querySelector("em")?.textContent).toBe("Study & evidence");
    expect(doc.querySelector("img")?.getAttribute("alt")).toBe('Figure "one"');
    expect(doc.querySelector("img")?.getAttribute("src")).toBe(
      "https://substackcdn.com/figure.png",
    );
    expect(doc.querySelectorAll("script,[onclick],[onerror]")).toHaveLength(0);
  });
  it("gives an image-only link an accessible name without inventing image alt text", () => {
    const html = renderToStaticMarkup(
      <>
        {renderArticleInline(
          [
            {
              type: "image",
              src: "https://substackcdn.com/image.png",
              alt: "",
              href: "https://example.org/original",
            },
          ],
          "",
        )}
      </>,
    );
    expect(html).toContain('aria-label="View original image"');
    expect(html).toContain('alt=""');
  });
  it("rejects executable URLs and non-allowlisted image destinations at the saved model boundary", () => {
    expect(
      articleInlineSchema.safeParse({ type: "text", text: "link", href: "javascript:alert(1)" })
        .success,
    ).toBe(false);
    expect(
      articleInlineSchema.safeParse({
        type: "image",
        src: "https://evil.example/image.png",
        alt: "",
      }).success,
    ).toBe(false);
    expect(
      articleInlineSchema.safeParse({ type: "image", src: "data:image/svg+xml,<svg/>", alt: "" })
        .success,
    ).toBe(false);
  });
});
