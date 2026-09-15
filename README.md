# Arinze Okigbo

The source for [arinzeokigbo.com](https://arinzeokigbo.com): work, projects, writing, and interactive experiments in authentication and motion.

## Develop

Use Node.js 24.

```sh
npm ci
npm run dev
```

## Verify

```sh
npm run ingest -- --cached  # Validate this round's saved source data
npm run typecheck
npm run lint
npm test
npm run build              # Refresh public feeds, then build production
npm run test:hive           # Production browser checks on port 3100
```

`QA_URL=https://example.vercel.app npm run test:hive` runs the same browser checks against a deployed preview. The suite checks routes, source-backed detail links, accessibility, CSP, browser errors, reduced motion, and JavaScript-disabled content.

## Architecture

- Next.js 16 App Router, TypeScript, React, server-rendered content, Tailwind CSS 4.
- Motion springs, GSAP ScrollTrigger, and Lenis for interaction and scroll choreography.
- React Three Fiber and drei power the hero after pointer interaction or explicit activation. The initial illustration and reduced-motion view are static SVG.
- A real WebAuthn lab preserves browser-local credential analysis; no account, credential upload, or tracking transport.
- Zod validates GitHub, Substack, and curated LinkedIn collections. Public feed refreshes use a six-hour server cache with verified snapshot fallback.
- A fresh nonce protects scripts on each HTML response. This requires dynamic HTML; data and the RSS/sitemap routes retain timed revalidation.
- No third-party analytics. LinkedIn embeds load only after the visitor explicitly opens one. Interface sound is off by default.

## Pages

`/`, `/about`, `/work`, `/projects`, `/projects/[slug]`, `/lab`, `/lab/changelog`, `/writing`, `/writing/[slug]`, `/now`, `/contact`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, and `/.well-known/security.txt`.

Every published claim has a source. See `content/inventory.json`, the typed editorial collections, and `hive/research/`. Unverified projects or biography details are omitted and recorded in the research decision log.

## Deployment and measured quality

The GitHub repository is connected to Vercel: development branches produce previews and `main` is production. CI runs build, lint, type, unit, and production browser checks.

The deployment audit verifies the production commit marker, measures Lighthouse, saves an artifact, and publishes a dated compact report on `hive/metrics`. That branch skips Vercel builds to prevent loops. The footer shows a measured score only when a valid report is available.

## Continue the build

Read `hive/RESUME.md` and `hive/HIVE.md`. The task board, source cache, acceptance matrix, and per-round changelog live under `hive/`. The full owner brief is preserved in `hive/BRIEF.md`.
