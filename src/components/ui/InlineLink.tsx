import Link from "next/link";
import type { ReactNode } from "react";
import { cn, isExternalHref } from "@/lib/utils";

/**
 * The id of the single, document-level "(opens in a new tab)" notice that every
 * external link points at with `aria-describedby`.
 *
 * Why a shared DESCRIPTION and not a `VisuallyHidden` span inside the anchor:
 * the notice used to live inside the anchor's own text, so it became part of
 * the link's accessible NAME. Four of these links are the entire content of an
 * `<h3>`, and each `<article>` names itself from that heading via
 * `aria-labelledby` — so a screen-reader user browsing by heading heard the
 * warning inside the heading, and then again as the region's name, where it was
 * simply false (the article opens nothing). Moving it to a description keeps
 * the announcement on the link, where it is true, and out of both names.
 */
export const EXTERNAL_LINK_NOTICE_ID = "external-link-notice";

/**
 * Rendered exactly once, in `RootLayout`. Do not render per link.
 *
 * `hidden`, not `.visually-hidden`. The accname spec resolves an
 * `aria-describedby` target even when it is hidden, so the description is still
 * announced on the link — but the node itself stays out of the accessibility
 * tree, so it is not read a second time during linear navigation and does not
 * count as page content outside a landmark (axe `region`, which a
 * `.visually-hidden` span in `<body>` did trip: 16/16 scans).
 */
export function ExternalLinkNotice(): ReactNode {
  return (
    <span id={EXTERNAL_LINK_NOTICE_ID} hidden>
      opens in a new tab
    </span>
  );
}

/**
 * Which accent-allowlist row this link is (docs/04 §3.5).
 *
 * `"proof"` is **A1** — the hero credential sentence's proof nouns, and nothing
 * else. `"default"` is **A2**, which is every other inline link on the site.
 * F9 caps the page at one `"proof"` group per viewport.
 */
export type InlineLinkEmphasis = "proof" | "default";

export interface InlineLinkProps {
  readonly href: string;
  /**
   * Must be information-bearing. [03 R12] bans these accessible names:
   * `here`, `link`, `read more`, `click`, `learn more`, `view`, a bare arrow.
   */
  readonly children: ReactNode;
  /** Defaults to inferred from `href`. */
  readonly external?: boolean;
  /** docs/04 §8.3. `"proof"` is allowlist A1 — the hero proof nouns only. */
  readonly emphasis?: InlineLinkEmphasis;
  readonly className?: string;
}

/** A hash or `mailto:` target must not go through the router. */
function isRouterHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/**
 * docs/04 §8.3.
 *
 * `emphasis="default"` (**A2**) — rest: 1px `--color-border-interactive`
 * underline, so the link is identifiable without hovering [03 R34]; hover and
 * focus bring in a 2px `--color-accent` bar (R-GOLD-1 — never 1px).
 *
 * `emphasis="proof"` (**A1**) — the accent bar is present **at rest**. The
 * A1/A2 rest-versus-hover split is deliberate: §3.5's allowlist is normative
 * and §8.3's table, which said every inline link was hover-gated, was the
 * restatement that got it wrong (docs/04 §3.5 D4, resolved 2026-09-11). Until
 * this prop existed the hero rendered A2 behaviour where A1 was specified, so
 * the three names the hero exists to carry had no accent router at scroll 0 —
 * the [03 AP5] peripheral-vision failure.
 *
 * The text fill is never accent in either variant (F1).
 */
export function InlineLink({
  href,
  children,
  external,
  emphasis = "default",
  className,
}: InlineLinkProps) {
  const isExternal = external ?? isExternalHref(href);
  const classes = cn("link", emphasis === "proof" && "link--proof", className);

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        // A description, not part of the name — see EXTERNAL_LINK_NOTICE_ID.
        aria-describedby={EXTERNAL_LINK_NOTICE_ID}
      >
        {children}
      </a>
    );
  }

  if (isRouterHref(href)) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}
