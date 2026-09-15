import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PostRow } from "@/components/sections/PostRow";
import { WRITING } from "@/content/writing/copy";
import { getPublishedSummaries, isWritingEnabled } from "@/content/writing/posts";

/**
 * `padX,padY,amount` — `docs/15 §2.10`. `docs/15 §3` row 6 gives this section
 * no field state of its own because it renders `null` at launch; it takes the
 * low-energy `work` state, which is also what an unrecognised value would fall
 * back to, so the two agree by construction.
 */
const BODY_SCRIM = "30,18,0.94";

/** The heading group carries its own, tighter: fewer lines, larger type. */
const HEADING_SCRIM = "30,14,0.94";

/**
 * Writing — `docs/05 §6`. HIDDEN AND UNLISTED AT LAUNCH.
 *
 * Zero posts exist and `docs/03 F10` rates a thin surface as worse than a
 * missing one, so this renders `null` and contributes no DOM node and no
 * heading — it is absent from the [R9] chain, absent from the nav, and absent
 * from the footer.
 *
 * THE SWITCH is `isWritingEnabled()`: `publishedPosts.length >= 2`, derived from
 * the content layer and never hand-edited. When two real posts land in
 * `content/writing/`, this section appears with the copy already final — the
 * `/writing` routes, the sitemap, the feed and `robots` all read the same flag.
 *
 * Position: between Projects and About. [R13] writing is tier 4 — below
 * technical depth, above GitHub.
 */
export function WritingSection(): ReactNode {
  if (!isWritingEnabled()) return null;

  const posts = getPublishedSummaries();

  return (
    <Section id={WRITING.id} labelledBy={WRITING.headingId} field="over" fieldState="work">
      <SectionHeading
        id={WRITING.headingId}
        scrim={HEADING_SCRIM}
        level={2}
        intro={WRITING.intro ?? undefined}
      >
        {WRITING.heading}
      </SectionHeading>

      <div className="mt-[var(--rhythm-heading)] flex flex-col gap-[var(--rhythm-entry)]">
        {posts.map((post, index) => (
          <Reveal key={post.slug} index={index}>
            <div data-scrim={BODY_SCRIM}>
              <PostRow post={post} />
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
