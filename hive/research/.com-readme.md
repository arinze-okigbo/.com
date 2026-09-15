# ArinzeOkigbo.com

Premium one-page personal website for Arinze Okigbo, built with Next.js App Router and TypeScript.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Framer Motion
- Lenis smooth scrolling
- shadcn-style component patterns (`cn`, variant-based button)
- Vitest + Testing Library
- Playwright
- Vercel Analytics + Speed Insights

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev          # Start local dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint checks
npm run typecheck    # TypeScript checks
npm run test         # Vitest unit/component tests
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright e2e tests
npm run format       # Prettier check
npm run format:write # Prettier write
```

## Project Structure

```text
content/
	writing/            MDX posts (empty at launch — see Writing below)
src/
	app/
		globals.css
		layout.tsx
		page.tsx
		not-found.tsx
		writing/          /writing and /writing/[slug]
	components/
		layout/
		motion/
		providers/
		sections/         one component per page section
			primitives/     Hero, WorkEntry, ProjectEntry, ContactBlock, …
		three/
		ui/               generic primitives
	content/
		site-content.ts   public entry point (re-exports the modules below)
		chrome.ts hero.ts work.ts projects.ts about.ts contact.ts
		attestation.ts metadata.ts not-found.ts types.ts
		writing/          MDX pipeline: frontmatter, posts, renderer
	lib/
		utils.ts
tests/
	e2e/
```

## Content Editing

All website copy and list data live in `src/content/`, exported as typed
constants. Import them from `@/content/site-content` — that file is the public
entry point and re-exports every module, so the split can change without
churning call sites. No copy is written inline in a component.

Every string traces to `docs/05-information-architecture.md`, which cites
`docs/00-content-inventory.md` for each underlying fact. The copy is
adjudicated: it is not rewritten, tightened or re-toned in a component.

### Missing facts

`docs/05 §11` lists open questions the site owner has not answered. **No
placeholder ever renders.** Each unanswered slot is typed `| null` (or is simply
absent from its array) and the renderer omits it — no brackets, no "TBD", no
invented filler. Each module documents what was omitted and which open question
unblocks it. Supplying a fact is a one-line change in `src/content/`; no
component changes.

`src/content/content.test.ts` enforces this: it fails the build if any
placeholder marker, bracketed stub or unsourced entry reaches a shipped string.

## Writing

The MDX pipeline is built and working, but the section ships hidden and
unlisted — zero posts exist, and an empty writing section reads worse than none.

Add posts as `content/writing/<slug>.mdx` with this frontmatter:

```yaml
---
title: string # becomes the h3 and the per-post <title>
description: string # <= 20 words, mechanism-first; becomes the meta description
date: 2026-03-04 # ISO 8601
published: true # false keeps a draft out of the count, the feed and the routes
---
```

The switch is one derived boolean — `publishedPosts.length >= 2`, exposed as
`isWritingEnabled()` in `src/content/writing/posts.ts`. Nothing is hand-edited:
when the second published post lands, the homepage section, the nav item, the
sitemap, the feed and the `robots` directives all flip together.

Post bodies render through `src/content/writing/render.tsx`, a server-side
markdown renderer that ships zero client bytes. It does not evaluate JSX inside
`.mdx`. If a post ever needs an inline React component, add `next-mdx-remote`
and replace that one module — nothing else in the pipeline depends on it.

## Images

`public/profile.jpg` is the 4809x4809 original and is referenced by nothing; no
page ships it to the browser. `public/profile-576.jpg` (576x576, 46 KB) is the
correctly sized derivative to use if a portrait is ever added. Whether a
portrait appears at all is `docs/05 §11 Q12`.

## Public Repository Safety

- No private credentials or secrets are committed.
- No real API keys or hidden admin routes are included.
- The app is frontend-only for MVP.
- Environment files are ignored via `.gitignore` (`.env*`).

If future integrations require environment variables, add a `.env.example` with placeholders only.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Keep framework preset as Next.js.
4. Deploy from the `main` branch.
5. Add custom domain `arinzeokigbo.com` in Vercel.
6. Update IONOS DNS records to point to Vercel.
7. Verify SSL certificate, Open Graph preview, and Lighthouse metrics.

## Quality Targets

- Lighthouse Performance: 90+
- Largest Contentful Paint: under 2.5s on modern mobile/desktop
- Smooth but restrained motion with reduced-motion support
- Strong readability and responsive behavior
