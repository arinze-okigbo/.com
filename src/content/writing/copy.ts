import type { SectionCopy } from "@/content/types";

/**
 * Writing copy — `docs/05 §6`. Final strings for the ENABLED state.
 *
 * The section ships hidden and unlisted at launch (BUILD-PLAN decision 3): zero
 * posts exist, and `docs/03 F10` rates a thin or stale surface as worse than a
 * missing one. Nothing below is rewritten when the section turns on.
 */
export const WRITING: SectionCopy = {
  id: "writing",
  headingId: "writing-heading",
  heading: "Writeups on authentication, payments, and the systems underneath them.",
  intro: "Why a decision was made, not just what was built.",
};

/** `/writing` index page. */
export const WRITING_INDEX = {
  heading: "Writing",
  metadata: {
    title: "Writing",
    description: "Writeups on authentication, payments, and the systems underneath them.",
  },
  /**
   * Rendered when `getPublishedSummaries()` is empty, which is every build so
   * far. Without it the route returned HTTP 200 with `main.innerText` equal to
   * the single word "Writing" — zero links and zero articles inside `<main>`,
   * so heading-only navigation delivered one word and then silence
   * (docs/08-review-accessibility-c2 N5). No SC is failed; the route is
   * `noindex, nofollow`, absent from the nav, the footer, the sitemap and the
   * feed, and reachable only by typing the URL. It is fixed because a dead end
   * is a dead end.
   *
   * The sentence states a fact rather than promising a schedule — [03 R34]:
   * this is not a placeholder standing in for content, it is an accurate
   * description of the current state. The affordance back is the same
   * information-bearing one `not-found.tsx` uses [03 R12].
   */
  emptyState: {
    body: "Nothing is published here yet. The work itself is on the home page: Splita, browser-native authentication at Queralt Inc., and SkyView.",
    homeLink: { label: "Arinze Okigbo — the home page", href: "/" },
  },
} as const;
