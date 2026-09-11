# Rebuild build plan (handoff)

Status: PLAN ONLY. No feature code written. Awaiting approval on open questions below.
Branch: claude/wizardly-feynman-octebb

## Audience and goal

Primary audience: technical recruiters and engineering hiring managers, under 90 seconds on site.
Goal: they leave convinced Arinze can build things most candidates cannot.

## Repo state as found

Two apps stacked in one repo:

1. Live app (`src/`): Next.js 15 App Router, React 19, TS strict, Tailwind 4, Framer Motion, Lenis.
   One page, seven sections. All copy centralized in `src/content/site-content.ts`.
   Dark-only palette (`#0a0a0a` background, gold accent `#d1a954`). Space Grotesk + Instrument Serif.
2. Dead Vite app (`client/`, `server/`, `shared/`, `vite.config.ts`, `patches/`): full shadcn dump,
   wouter routing, Express static server, an OAuth login helper, and
   `client/public/__manus__/debug-collector.js`. Excluded from `tsconfig.json`. Not deployed.
   Roughly 60 files of carrying cost.

Real content worth preserving:
- Four current-work entries (Splita, Snorkel AI, Queralt Inc., Trinity College)
- Three featured projects (Splita, QX509 Authentication Research, SkyView)
- Four achievements (pre-seed, Tyree Fellow, World Bank Youth Summit 2025, cross-domain builder)
- Four contact links (email arinze@splita.co, LinkedIn, GitHub, X)
- Ten company logos in `public/logos/`
- Metadata block in `src/app/layout.tsx`

## Defects found in the current site

- `public/profile.jpg` is 5.1 MB. This alone fails the LCP target.
- `@vercel/analytics` and `@vercel/speed-insights` are installed but never rendered in
  `src/app/layout.tsx`. Analytics currently collects nothing.
- `public/og-image.svg` exists but OG tags point at `profile.jpg`. SVG is not a valid OG format anyway.
- No sitemap, no robots, no RSS, no contact endpoint, no resume file anywhere in the repo.
- `html { scroll-behavior: smooth }` in `globals.css` fights Lenis smooth scrolling.
- No `prefers-reduced-motion` handling anywhere in `globals.css`.
- `featuredProjects[1].href` is `"www.queraltinc.com"` with no protocol. It will resolve as a relative path.

## Open questions blocking Phase 3

The brief contradicts the repo on three facts. Nothing gets invented to paper over this.

1. School: repo says Trinity College B.S. CS 2024-2028. Brief says NYU. Which, and if it changed, when?
   Is the other still part of the story (transfer)?
2. Cyera: absent from the repo entirely. Need exact title, dates, and one sentence on what shipped.
3. Snorkel AI (AI Contributor, DevOps): in the repo, not in the brief. Keep, demote, or drop?
4. Resume: is there a PDF to link? Nothing is in the repo.
5. Writing section: zero posts exist. Recommendation is to build the MDX pipeline but hide the section
   until there are two real posts. An empty writing section reads worse than no writing section.
6. Delete `client/`, `server/`, `shared/`, `patches/`, `vite.config.ts`? Recommendation is yes, Phase 4.

## Strategy

Rebuild in place on the existing Next.js app. Same repo, branch `claude/wizardly-feynman-octebb`.
Orchestrator does coordination, git, and phase-boundary reporting only. All feature code comes from agents.

## Phase 0: Audit (1 agent, serial)

**content-auditor**
- In: full repo tree, `src/content/site-content.ts`, `src/app/layout.tsx`, `public/`, `README.md`,
  git history, `package.json`
- Out: `docs/00-content-inventory.md`
- Does: inventories every real fact, link, asset, byte size, analytics hook, deploy assumption.
  Tags each MUST-SURVIVE / REWRITE / DELETE. Records the three fact conflicts as open questions
  rather than resolving them. Measures every asset, flags anything over 200 KB.

## Phase 1: Research (3 agents, fully parallel)

**design-research**
- In: `docs/00`, aesthetic direction
- Out: `docs/01-design-research.md`
- Does: 8 to 12 reference sites across Apple-minimalist and Awwwards-tier portfolios. Per site,
  measured mechanics only: type scale ratio and clamp values, spacing rhythm and base unit,
  scroll choreography trigger points, named easing curves with cubic-bezier values, color count
  and where the single accent appears. Banned from adjectives with no number attached.

**tech-research**
- In: `docs/00`, stack from brief, hard performance budgets
- Out: `docs/02-tech-research.md`
- Does: compares R3F+drei vs hand-rolled WebGL vs CSS/canvas 2D vs pre-rendered sprite sequence,
  each scored against the 200 KB initial JS budget and the mid-tier Android constraint. Same for
  GSAP ScrollTrigger vs Framer Motion useScroll vs native CSS scroll-driven animations. Picks one
  stack, writes out what it costs. Only phase permitted to override the stack, and only in writing here.
- Known constraint: R3F + drei is roughly 150-180 KB gzipped alone. It must be below the fold and
  dynamically imported or the budget is gone before anything else loads.

**recruiter-research**
- In: `docs/00`, the 90-second constraint
- Out: `docs/03-recruiter-research.md`
- Does: what senior technical recruiters scan for in order, where portfolio sites lose them, how a
  student-founder profile is read differently from a senior IC profile. Converts to numbered
  content-hierarchy rules Phase 3 must obey.

## Phase 2: Design system (1 agent, serial, blocks everything downstream)

**design-system**
- In: `docs/01`, `docs/02`, `docs/03`
- Out: `docs/04-design-system.md`
- Does: type scale with exact clamp values, spacing scale on one base unit, color tokens for
  monochrome base plus exactly one accent in both light and dark, named easing curves with
  cubic-bezier values, motion duration tiers, component inventory with prop contracts, focus-state
  spec meeting WCAG 2.2 AA contrast, and a reduced-motion substitution rule for every motion token.
  Every later agent builds only from these. No ad hoc values.

## Phase 3: Information architecture and copy (1 agent, serial)

**information-architecture**
- In: `docs/00` (facts), `docs/03` (hierarchy rules), `docs/04` (component capability), answers to open questions
- Out: `docs/05-information-architecture.md`
- Does: page and section order, the one-sentence claim each section must land, exact final copy.
  Sections: hero, selected work (Splita, Cyera, Queralt), projects, writing, about, contact.
  Queralt browser-native authentication gets a full first-class entry with the FIDO2 / PKI /
  Entra ID specifics, not a footnote.
- Hard constraint: every factual claim cites a line from `docs/00` or the answered questions.
  Anything unsourceable goes in an OPEN QUESTIONS block. Nothing invented.

## Phase 4: Build (5 agents, parallel, strict file ownership)

Disjoint path ownership. No agent edits another's files. Shared files (`package.json`,
`globals.css`, `layout.tsx`) are owned by frontend-core alone; others file requests.

**frontend-core** owns `src/app/layout.tsx`, `src/app/globals.css`, `src/components/layout/*`,
`src/components/ui/*`, tailwind config, `next.config.ts`, `package.json`
- Routing, layout shell, typography scale, responsive grid, dark mode with no flash on load,
  skip links, landmark regions, focus management, global reduced-motion switch.

**motion** owns `src/components/motion/*`, `src/lib/motion/*`
- Scroll-driven sequences, page transitions, text reveals, cursor and hover states. Every animation
  reads duration and easing from Phase 2 tokens. Every animation ships a reduced-motion path that is
  a real static state, not a zero-duration hack.

**three-d** owns `src/components/three/*`
- One hero 3D moment plus at most one secondary use, per `docs/02`. Dynamically imported,
  code-split, below the fold, static fallback that renders without JS and on WebGL failure.
  Must report a measured bundle number or the work is not done.

**content** owns `src/content/*`, `src/components/sections/*`, `content/writing/*.mdx`, MDX pipeline
- Renders Phase 3 copy into components. No copy invented at this layer.

**backend** owns `src/app/api/*`, `src/app/opengraph-image.tsx`, `src/app/sitemap.ts`,
`src/app/robots.ts`, `src/app/feed.xml/route.ts`, analytics wiring
- Contact endpoint with honeypot, rate limiting, server-side validation. Dynamic OG image
  generation. Sitemap, RSS. Actually mounts the analytics components that are installed and dormant.

Each may spawn subagents for isolated units. Each returns a changed-files report with line counts
and a self-check against the budgets.

Gate: run typecheck, lint, build, and a bundle measurement. Report diff summary.

## Phase 5: Review (4 agents parallel, then 1 fix agent serial)

**review-performance** measures real numbers: Lighthouse mobile all four categories, LCP and CLS
under 4G throttling, initial JS gzipped, per-route bundle breakdown.

**review-accessibility** WCAG 2.2 AA: keyboard traversal of every interactive element, visible focus,
semantic HTML, alt text, contrast ratios, reduced-motion behavior, JS-disabled core content.

**review-design-qa** checks every rendered value against `docs/04`. Any hardcoded value not traceable
to a token is a defect.

**review-crossbrowser** Safari, Chrome, Firefox, iOS Safari, mid-tier Android. Scroll smoothness,
3D fallback, touch targets, viewport units, safe-area insets.

Each returns a defect list with file and line. Output: `docs/06-review-defects.md`.

**fix-agent** (serial, after all four) resolves every defect, re-runs the measurements, reports what
was fixed and what could not be and why.

## Parallelization map

```
P0  [content-auditor]                                        serial
     |
P1  [design-research] [tech-research] [recruiter-research]    3-wide
     |
P2  [design-system]                                           serial, hard gate
     |
P3  [information-architecture]                                serial, needs answers
     |
P4  [frontend-core] [motion] [three-d] [content] [backend]    5-wide, disjoint paths
     |
P5  [perf] [a11y] [design-qa] [cross-browser]                 4-wide
     |
    [fix-agent]                                               serial
```

16 top-level agents. Subagents permitted within Phase 4 units.

## Hard requirements, all enforced in Phase 5

- Lighthouse 95+ on all four categories, mobile profile
- LCP under 2.0s, CLS under 0.05, 4G throttling
- Initial JS under 200 KB gzipped. All 3D and heavy motion dynamically imported below the fold
- 60fps scroll on M1 MacBook, no jank on mid-tier Android
- prefers-reduced-motion disables every non-essential animation, site stays fully usable
- WCAG 2.2 AA: keyboard navigable, visible focus, real semantic HTML, alt text
- Core content works with JavaScript disabled
- 3D is one deliberate hero moment plus at most one secondary use. Reject anything decorative
  that costs weight.

## Aesthetic direction

Restraint over density. Large type, heavy whitespace, few elements per viewport, near-monochrome
palette, motion that clarifies hierarchy rather than performing. If a visual effect does not make
the content easier to understand, cut it.
