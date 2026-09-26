# Writing archive verification — Round 9

Source retrieval: September 16, 2026 (UTC). Implementation resumed September 26; these source checks were not rerun or relabelled as new.

- The public Substack RSS and archive both exposed five distinct authored essays. Their complete public bodies, citations, and source images are retained in `content/substack.json`; the oldest article's public previous-post link is null. No additional distinct essay was invented. Bluedot's public author archive exposes the leather and ozone essays already represented on Substack; these are earlier publications, not extra essays.
- LinkedIn expands from three previously verified posts to fourteen. `linkedin-discovery.json` and the eleven individual JSON files preserve public page JSON-LD, exact publication dates, author profile, canonical post URL, and observed embed URNs. Comments and embedded third-party post content are excluded from authored body evidence. Display titles/summaries are editorial descriptions, not fabricated verbatim post titles. Fundraising figures are omitted.
- When a page contains multiple possible share URNs, this round keeps a direct link rather than guessing an embed. Official embeds load only after explicit reader action.
- This is not a complete LinkedIn account export. Public profile retrieval was blocked (999 in browser source retrieval); the public company page/search exposed additional repost text without a verified stable authored-post URL. Those entries were not invented or imported. No authenticated API, login bypass, or hidden pagination was used.
- `outbound-links.json`: 49 writing source, canonical, citation, media, and official embed URLs returned HTTP 200 on September 16. This is a dated transport check, not a promise of indefinite availability or verification of claims made in the linked essays.

## Ingestion behavior

Request-time revalidation reads RSS only, with the existing six-second source timeout. It retains older verified articles and refuses to replace a longer saved body with a shorter RSS excerpt. It preserves the date of the prior deep archive check.

Build ingestion explicitly enables public archive discovery and follows observed `previous_post_slug` links. It validates author, publication origin, public audience, and actual full body; traversal stops at 24 article requests or a 30-second loop deadline (an in-flight request remains bounded by the existing 15-second source timeout). Pending source-provided slugs persist for the next ingestion. Cached ingestion preserves source dates. Failed sources keep last-good bodies and mark archive coverage partial.

## Validation scope

Focused tests cover safe inline links/images, genuine fallback data, archive imports, shortened RSS body retention, shallow request-time fetches, bounded/resumable traversal, author/paywall rejection, search/topic/year/reset/order, and opt-in embeds. Full build, image optimizer HTTP checks, browser layout, and deployment verification belong to the coordinating QA pass.
