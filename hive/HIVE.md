# ASTRA HIVE

## Mission

Rebuild arinzeokigbo.com as a visually ambitious, technically credible personal site. Source every claim, preserve public URLs and the existing contact method, ship only after measured QA.

## Current session

Rounds 1–4: foundation, motion, signature interactions, and hardening. Source brief: BRIEF.md. Branch: hive/astra-rebuild. Queen coordinates; specialist agents implement research, frontend, and motion.

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
