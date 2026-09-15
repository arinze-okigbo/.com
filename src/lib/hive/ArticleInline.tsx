import { Fragment, type ReactNode } from "react";
import type { ArticleInline } from "./schemas";

/** Only explicit safe model fields are rendered; source HTML/attributes are never spread. */
export function renderArticleInline(
  nodes: ArticleInline[] | undefined,
  fallback: string,
): ReactNode {
  if (!nodes) return fallback;
  return nodes.map((node, index) => {
    if (node.type === "break") return <br key={index} />;
    let content: ReactNode;
    if (node.type === "image") {
      // Source CDN URLs are allowlisted during schema validation; preserve the original image.
      content = (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.src}
          alt={node.alt}
          width={node.width}
          height={node.height}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      );
    } else {
      content = node.text;
      if (node.code) content = <code>{content}</code>;
      if (node.emphasis) content = <em>{content}</em>;
      if (node.strong) content = <strong>{content}</strong>;
    }
    return node.href ? (
      <a
        key={index}
        href={node.href}
        rel="noreferrer"
        aria-label={node.type === "image" && !node.alt ? "View original image" : undefined}
      >
        {content}
      </a>
    ) : (
      <Fragment key={index}>{content}</Fragment>
    );
  });
}
