# ASTRA HIVE

## Mission

Rebuild arinzeokigbo.com as a visually ambitious, technically credible personal site. Source every claim, preserve public URLs and the existing contact method, ship only after measured QA.

## Current session

Round 5 shipped as 9be233e after required Linux 96/100/100/100 and preview QA. Production verified at 100/100/100/100 using the fixed representative five-run method, with 68 browser checks passing. Branch hive/round-5-audit-publish repairs measurement publication and records the release. Queen coordinates; specialist agents implement research, frontend, and motion.

## Decisions

- 2026-09-15: Work in an isolated worktree based on the existing local redesign; preserve its branch and reuse the real WebAuthn demo.
- 2026-09-15: The owner's full brief explicitly authorizes branch pushes, preview deployment, and production shipping after QA.
- 2026-09-15: Verify public-source facts before publishing; missing sources omit claims rather than substitute biography from the brief.
- 2026-09-15: Use latest stable Next.js 16.3.5 and React 19.3.0 verified against npm and Next documentation today; RSC, Tailwind 4, Motion, GSAP, Lenis, R3F/drei, Zod.
- 2026-09-15: Dark graphite and warm white, mint primary accent and muted violet secondary; Geist variable sans with a self-hosted display face.
- 2026-09-15: Use eight type steps and only the requested expo/quart easing and two named spring presets.
- 2026-09-15: All requested page routes will exist; unverifiable projects and articles will not acquire fabricated case studies.
- 2026-09-15: Feeds use 6-hour server caching and checked-in last-good snapshots with capture times. LinkedIn login walls are recorded, never bypassed.
- 2026-09-15: Retain working old routes; use explicit 301 redirects only for relocated URLs found by the inventory.
- 2026-09-15: Disable external analytics. Real browser measurements can be shown without collecting visitor identifiers.
- 2026-09-15: Lighthouse scores must be measured for a particular URL and date. No generated score or old score is presented as current.
- 2026-09-15: Vercel CLI has no saved login; use the repository's verified existing GitHub→Vercel integration for previews and production.

## QA gates

Build, strict TypeScript, ESLint, ingestion tests, all internal routes/links, no browser console errors, keyboard navigation, reduced motion, mobile/light/dark visual review. Production targets: Lighthouse performance >=95, accessibility >=95, best practices 100, SEO 100. Report any unmet gate honestly and retain production until fixed.

- 2026-09-15: Strict per-response nonce CSP requires dynamic HTML in Next.js; choose it over unsafe inline scripts. Feed data still revalidates independently every six hours; full-route ISR is deliberately disabled rather than falsely claimed.
- 2026-09-15: Permit inline styles for Motion transforms while blocking inline scripts without the nonce, objects, external connections, framing, and unsolicited permissions.
- 2026-09-15: React Three Fiber 9.7 requires React <19.3, so use the latest 19.2 patch instead of 19.3.0; no forced peer dependency overrides.
- 2026-09-15: Daily 09:00 America/New_York heartbeat created in this Codex task for bounded continued improvement; no duplicate PRs or repeated blocker notifications.
- 2026-09-15: Live production baseline measured 68 performance, 94 accessibility, 100 best practices, 100 SEO on Lighthouse mobile; prior remembered scores were not reused.
- 2026-09-15: Production audit workflow publishes dated real measurements to hive/metrics; that branch is excluded from Vercel builds to prevent audit/deploy loops.

- 2026-09-15: Final local route suite passes 26/26 and 343 unit tests; candidate2 mobile audit is 95/100/100/100 with CLS0. Production remains unverified until deployment.
- 2026-09-15: Enable React production profiling for local-only named client-island timings; measure its overhead against the release gate.
- 2026-09-15: Replace invalid sun/moon path interpolation with fixed-path crossfade plus color wipe; avoid console errors from malformed SVG.

## Production checkpoint and next round

- 2026-09-15: PR4 merged; production commit a118398513ced42889540e45ba0b7a7118aac72b verified on arinzeokigbo.com. All 36 production browser checks pass.
- 2026-09-15: Production Lighthouse is below target: local-host audit90/100/100/100 and Linux CI69/100/100/100 (TBT1226ms). Preserve both measurements; reduce actual startup work before closing release QA.
- 2026-09-15: Enable Next's documented experimental inlineCss to remove render-blocking stylesheet round trips. Trade-off: larger HTML and no separate stylesheet caching; verify production benefit before retaining.
- 2026-09-15: Round5 preparation adds demand-loaded keyboard navigation and verified project media. Branch hive/round-5-navigation; deployment performance remains the priority gate.

- 2026-09-15: Address review P1 with Lighthouse in required PR quality checks before merge. Deployment audit remains independent verification; protected preview authentication prevents unauthenticated CI crawling, so the pre-merge audit runs the exact production build on Linux and manual QA covers Vercel preview.
- 2026-09-15: Retire obsolete Field-era browser suites; both test:e2e and test:hive use the mounted-site production suite. Preserve equivalent current coverage rather than keeping guaranteed failures for removed markup.

- 2026-09-15: Main now requires the verify status and an up-to-date PR, including administrators; no additional human approval count is required.

- 2026-09-15: Repair the historical 180KiB bundle gate for Next16 manifests; measured initial JS is202–210KiB, so isolate eager motion rather than raising the existing budget. Enforce the repaired check in CI.

- 2026-09-15: PR5 firstLinux run34929619920 failedperformance70/TBT1096; gate preventedmerge. Removed eagerFramer using exact analytic springs for small controls and a separate optionalstack. Local97/100/100/100,TBT19,CLS0; all355unit/61browserchecks and motionharnesspass.

- 2026-09-15: Linux74 trace exposed React streamed ViewTransition layout; set route-keyed boundary update/default none with explicit enter/exit. Replace native root-capturing theme wipe with an inert decorative overlay so immediate pointer navigation succeeds. All355unit/66browserchecks plus motionharness and local97 pass; Linux rerun required.

- 2026-09-15: Three held Linux candidates scored70/74/70 while local97 repeats. Adopt Lighthouse’s documented fixed five-run representative median, retain all raw reports and unchanged thresholds, and collect an unthrottled system-Chrome CPU profile only after failure. No retry-until-green or best-score selection.

- 2026-09-15: Fixed Linux series75/93/98/95/93 selects93 by Lighthouse median; gate still holds. CPU profile identified repeated Intl initialization in NYClock, so share a formatter/timer only among visible clocks. Align production with fixed five-run measurement, retain environment metadata and all raw reports, and publish the measured score before enforcing unchanged thresholds.

- 2026-09-15: Clock candidate run34932388400 scored90/92/97/94/94; representative94,TBT183ms,LCP2658ms and other categories100. Exact preview0495eaf passed desktop/mobile search, visible clock updates and zero console errors. New trace shows 724 layout objects/521 styled elements before paint; target offscreen layout and duplicated media-query objects next.

- 2026-09-15: Reduce measured offscreen layout with content-visibility:auto on lower homepage sections, retain responsive intrinsic dimensions and full print layout, and replace initial geometry reads with observer entries. Share one reduced-motion query/listener. Build, types, lint, 358 unit tests and 68 browser checks pass; the contrast test now waits for its theme overlay instead of all legitimately paused offscreen animations.

- 2026-09-15: PR5 merged as 9be233e after required Linux run34933482617 passed96/100/100/100. Custom domain SHA and68 browser checks passed. Production run34933954175 measured71/100/100/100/99, representative100/100/100/100, LCP1228ms, TBT33ms, CLS0; all raw reports retained. Its publish step failed because a generated summary overwrote a tracked historical file. Independently enforce the retained reports, publish exact measurements through a separate metrics worktree, and give subsequent workflow files a distinct production-current prefix.
