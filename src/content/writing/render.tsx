import type { ReactElement, ReactNode } from "react";

import { renderInline } from "@/content/writing/inline";

/**
 * Post-body renderer — the one module the MDX pipeline swaps.
 *
 * WHY THIS IS NOT `next-mdx-remote`. The site ships against a 200 kB First Load
 * JS cap with ~31 kB shared across five build agents, and `frontend-core` owns
 * `package.json` and declined new dependencies. This renderer covers the block
 * and inline grammar the `docs/05 §6` frontmatter contract implies — headings,
 * paragraphs, lists, fenced code, blockquotes, rules — at zero bytes shipped to
 * the client, because it runs entirely on the server.
 *
 * It does NOT evaluate JSX embedded in `.mdx`. If a post ever needs a React
 * component inline, add `next-mdx-remote` and replace `renderPostBody` here.
 * Nothing else in the pipeline changes: the frontmatter parser, the content
 * layer, the routes and the section components are all independent of it.
 *
 * Output is wrapped by `Prose` (`docs/04 §8.2`), which supplies every token —
 * this module emits semantic elements and no styling of its own. `docs/04 §8.2`
 * defines no syntax-highlighting palette, so code blocks render monochrome.
 */

const HEADING_PATTERN = /^(#{2,3})\s+(.*)$/;
const ORDERED_ITEM_PATTERN = /^\d+\.\s+(.*)$/;
const UNORDERED_ITEM_PATTERN = /^[-*]\s+(.*)$/;
const QUOTE_PATTERN = /^>\s?(.*)$/;
const FENCE_PATTERN = /^```/;
const RULE_PATTERN = /^(-{3,}|\*{3,})$/;

/** Accessible name for the focusable code-block scroll region (WCAG 2.1.1). */
const CODE_SAMPLE_LABEL = "Code sample";

type Block =
  | { readonly kind: "heading"; readonly level: 2 | 3; readonly text: string }
  | { readonly kind: "paragraph"; readonly lines: readonly string[] }
  | { readonly kind: "list"; readonly ordered: boolean; readonly items: readonly string[] }
  | { readonly kind: "quote"; readonly lines: readonly string[] }
  | { readonly kind: "code"; readonly lines: readonly string[] }
  | { readonly kind: "rule" };

/**
 * Splits a body into blocks. Pure: builds a new array, never mutates input.
 * Implemented as an explicit cursor loop because block grammar is stateful
 * (fences and lists span lines) and a reduce here reads worse, not better.
 */
function toBlocks(body: string): readonly Block[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const line = lines[cursor];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      cursor += 1;
      continue;
    }

    if (FENCE_PATTERN.test(trimmed)) {
      const start = cursor + 1;
      let end = start;
      while (end < lines.length && !FENCE_PATTERN.test(lines[end].trim())) end += 1;
      blocks.push({ kind: "code", lines: lines.slice(start, end) });
      cursor = end + 1;
      continue;
    }

    if (RULE_PATTERN.test(trimmed)) {
      blocks.push({ kind: "rule" });
      cursor += 1;
      continue;
    }

    const heading = HEADING_PATTERN.exec(trimmed);
    if (heading !== null) {
      blocks.push({
        kind: "heading",
        level: heading[1].length === 2 ? 2 : 3,
        text: heading[2],
      });
      cursor += 1;
      continue;
    }

    const isOrdered = ORDERED_ITEM_PATTERN.test(trimmed);
    if (isOrdered || UNORDERED_ITEM_PATTERN.test(trimmed)) {
      const pattern = isOrdered ? ORDERED_ITEM_PATTERN : UNORDERED_ITEM_PATTERN;
      const items: string[] = [];
      let end = cursor;
      while (end < lines.length) {
        const item = pattern.exec(lines[end].trim());
        if (item === null) break;
        items.push(item[1]);
        end += 1;
      }
      blocks.push({ kind: "list", ordered: isOrdered, items });
      cursor = end;
      continue;
    }

    if (QUOTE_PATTERN.test(trimmed)) {
      const quoted: string[] = [];
      let end = cursor;
      while (end < lines.length) {
        const quote = QUOTE_PATTERN.exec(lines[end].trim());
        if (quote === null) break;
        quoted.push(quote[1]);
        end += 1;
      }
      blocks.push({ kind: "quote", lines: quoted });
      cursor = end;
      continue;
    }

    const paragraph: string[] = [];
    let end = cursor;
    while (end < lines.length && lines[end].trim().length > 0) {
      const next = lines[end].trim();
      const startsNewBlock =
        FENCE_PATTERN.test(next) ||
        RULE_PATTERN.test(next) ||
        HEADING_PATTERN.test(next) ||
        QUOTE_PATTERN.test(next) ||
        ORDERED_ITEM_PATTERN.test(next) ||
        UNORDERED_ITEM_PATTERN.test(next);
      if (startsNewBlock && end > cursor) break;
      paragraph.push(next);
      end += 1;
    }
    blocks.push({ kind: "paragraph", lines: paragraph });
    cursor = end;
  }

  return blocks;
}

function renderBlock(block: Block, index: number): ReactElement {
  const key = `b${index}`;

  switch (block.kind) {
    case "heading":
      // Post bodies start at h2: the post title is the page's h1, so no level is
      // ever skipped and the [R9] chain stays well-formed.
      return block.level === 2 ? (
        <h2 key={key}>{renderInline(block.text, key)}</h2>
      ) : (
        <h3 key={key}>{renderInline(block.text, key)}</h3>
      );
    case "paragraph":
      return <p key={key}>{renderInline(block.lines.join(" "), key)}</p>;
    case "list": {
      const items = block.items.map((item, itemIndex) => (
        <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
      ));
      return block.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
    }
    case "quote":
      return (
        <blockquote key={key}>
          <p>{renderInline(block.lines.join(" "), key)}</p>
        </blockquote>
      );
    case "code":
      // `tabIndex={0}` + a name: `.prose pre` is `overflow-x: auto` with a
      // `--measure-mono` cap, so a long line scrolls horizontally. A scroll
      // container that cannot be focused cannot be scrolled by keyboard alone
      // — WCAG 2.1.1 Keyboard, Level A (axe `scrollable-region-focusable`).
      //
      // `role="group"`, NOT `role="region"`. A named `region` is a LANDMARK, so
      // a post with six code blocks would contribute six identically-named
      // "Code sample" landmarks to the rotor ahead of `main`, `banner` and
      // `contentinfo` (docs/08-review-accessibility-c2 N6). `group` carries the
      // same name and the same focusability without polluting landmark
      // navigation, and 2.1.1 is satisfied by `tabIndex` alone regardless.
      //
      // The tab stop is unconditional, and that is a recorded decision rather
      // than an oversight: applying it only when `scrollWidth > clientWidth`
      // needs a client measurement this Server Component cannot make, so a
      // short snippet that never overflows is still a stop. An extra stop is
      // the cheaper error than an unreachable scroll container.
      return (
        <pre key={key} tabIndex={0} role="group" aria-label={CODE_SAMPLE_LABEL}>
          <code>{block.lines.join("\n")}</code>
        </pre>
      );
    case "rule":
      return <hr key={key} />;
  }
}

/** Renders a post body to server-rendered semantic HTML. Wrap the result in `Prose`. */
export function renderPostBody(body: string): ReactNode {
  return toBlocks(body).map(renderBlock);
}
