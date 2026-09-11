# Content Inventory — arinzeokigbo.com

Single source of truth for every real fact and asset in this repo, as of the audit on 2026-09-11 (commit `c347819`, branch `claude/wizardly-feynman-octebb`). A later copy agent must use ONLY this document as its factual basis. Nothing here is paraphrased where copy is quoted — quotes are verbatim from the source file.

Tags: **MUST-SURVIVE** (a real, current fact — must appear in the rebuild), **REWRITE** (real fact, but the wording/presentation should change), **DELETE** (dead code, placeholder, or superseded content — do not carry forward).

Live app = `src/**` (Next.js 15, deployed). Dead app = `client/`, `server/`, `shared/`, `patches/`, `vite.config.ts` (Vite/shadcn/wouter, excluded from `tsconfig.json` via `"exclude": ["node_modules", "client", "server", "shared"]`, not deployed, scheduled for deletion in BUILD-PLAN Phase 4).

---

## 1. Bio and about copy

All from the live app.

| Copy (verbatim) | Source | Tag |
|---|---|---|
| "I build systems, products, and companies." | `src/components/sections/AboutSection.tsx:12` (SectionHeading title) | REWRITE |
| "I'm a founder and software engineer working at the intersection of AI, security, infrastructure, and fintech. I focus on building real systems that solve concrete problems — not just ideas." | `src/components/sections/AboutSection.tsx:13` | MUST-SURVIVE (facts) / REWRITE (wording) |
| "Right now, I'm building Splita, a fintech platform that simplifies group payments by collecting each person's share upfront. At the same time, I work as an AI Expert Contributor (DevOps) at Snorkel AI and authentication infrastructure at Queralt." | `src/components/sections/AboutSection.tsx:20` | MUST-SURVIVE (facts) / REWRITE (wording) |
| "I care about execution and clarity. I like problems where technical depth and product thinking compound, and where building the right system makes everything else easier." | `src/components/sections/AboutSection.tsx:23` | REWRITE (generic voice-of-founder filler; no new facts) |
| Hero eyebrow: "Arinze Okigbo" | `src/components/sections/HeroSection.tsx:31` | MUST-SURVIVE |
| Hero headline: "Founder" / "Engineer" / "Student" (three stacked words) | `src/components/sections/HeroSection.tsx:9` (`const headline`) | REWRITE (BUILD-PLAN implies NYU-current framing may change "Student") |
| Hero subline: "Co-Founder & CEO of Splita.<br>AI @ Snorkel AI \| SWE @ Queralt Inc. \| CS + T&F @ Trinity<br>Building at the intersection of AI, security, and fintech." | `src/components/sections/HeroSection.tsx:56-60` | MUST-SURVIVE (facts) / REWRITE (Trinity vs NYU per open question) |
| Hero card label: "Current Focus" | `src/components/sections/HeroSection.tsx:83` | REWRITE |
| Hero card body: "Building modern fintech infrastructure with AI-native product thinking, secure-by-default systems, and a relentless bias for high-quality execution." | `src/components/sections/HeroSection.tsx:86` | REWRITE (marketing filler) |
| Scroll hint: "Scroll for story" | `src/components/sections/HeroSection.tsx:98` | REWRITE |
| Footer line: "Arinze Okigbo. Building with ambition, clarity, and technical depth." | `src/components/layout/SiteFooter.tsx:8` | REWRITE |
| Site header wordmark: "Arinze Okigbo" | `src/components/layout/SiteHeader.tsx:10` | MUST-SURVIVE |
| Nav items: About / Work / Projects / Experience / Contact (hrefs `#about #current-work #projects #experience #contact`) | `src/content/site-content.ts:23-29` | REWRITE (IA is being redesigned per BUILD-PLAN) |

Dead-app bio copy (client/, DELETE — never shipped, but flagged for fact cross-check):
- "I'm a founder, software engineer, and computer science student interested in building ambitious products and technical systems that solve real problems." — `client/src/components/About.tsx:70`
- "My work sits at the intersection of AI, security, infrastructure, and fintech — from building Splita, a startup simplifying group payments, to contributing to AI systems at Snorkel AI and authentication infrastructure at Queralt Inc." — `client/src/components/About.tsx:76`
- Stats block: `{ value: "3+", label: "Current Roles" }`, `{ value: "1", label: "Startup Founded" }`, `{ value: "4", label: "Domains" }`, `{ value: "2028", label: "Graduation" }` — `client/src/components/About.tsx:15-20`. DELETE — "2028" graduation conflicts with BUILD-PLAN's "NYU is current, transferred from Trinity" note; not reliable.
- Skills list: TypeScript, Python, Go, React, Next.js, Node.js, PostgreSQL, Redis, AWS, Kubernetes, Docker, TensorFlow, PyTorch, GraphQL, gRPC — `client/src/components/About.tsx:22-38`. DELETE as sourced (unverified, looks like generic placeholder list from an AI site-builder — no corroboration anywhere else in the repo that these specific technologies were used). Flag in Open Questions.

## 2. Roles and work history

### Live app — `currentWork` array, `src/content/site-content.ts:31-68`

| org | role | period | summary (verbatim) | href | Tag |
|---|---|---|---|---|---|
| Splita | Co-Founder & CEO | 2025 – Present | "Building a coordination-first fintech platform that collects each participant's share upfront to remove friction and risk from group payments. Raised early commitments toward a $200K pre-seed and onboarding initial users." | https://splita.co | MUST-SURVIVE |
| Snorkel AI | AI Contributor (DevOps) | 2024 – Present | "Working on production AI evaluation workflows, improving LLM output quality and reliability through structured feedback and system-level analysis." | https://snorkel.ai | MUST-SURVIVE |
| Queralt Inc. | Software Developer Intern | 2025 – Present | "Leading R&D on browser-native authentication using FIDO2, PKI, and Microsoft Entra ID to enable secure, passwordless identity systems." | https://www.queraltinc.com | MUST-SURVIVE |
| Trinity College | B.S. Computer Science | 2024 – 2028 | "Studying software development while building real systems across AI, security, and fintech." | https://www.trincoll.edu | REWRITE — conflicts with NYU-transfer fact from BUILD-PLAN (see Open Questions) |

Note: period for Snorkel AI here says "2024 – Present" but the detailed timeline entry below (`ExperienceTimeline.tsx`) says "Dec 2025 - Present" for the same role. **Internal date conflict — flag in Open Questions.**

### Live app — detailed timeline, `src/components/sections/ExperienceTimeline.tsx:8-308` (`experiences` array, ten entries, newest-relevant first as authored)

| role | company | period (verbatim) | description (verbatim) | tags | details (verbatim bullets) | logo | Tag |
|---|---|---|---|---|---|---|---|
| Co-Founder & CEO | Splita | Aug 2025 - Present | "Leading vision, product strategy, fundraising, and go-to-market for a social fintech platform that makes group payments simple, fair, and seamless." | Fintech, Founder, Product, Fundraising | "Oversee user research, product development, branding, and strategic partnerships."; "Built Splita around an upfront-share model where each user pays first and the platform pays vendors in full."; "Driving launch strategy, growth initiatives, and long-term company direction." | `/logos/splita.png` | MUST-SURVIVE |
| Software Developer Intern | Queralt Inc. | Jun 2025 - Present | "Led R&D on browser-native, selectable authentication across Microsoft Entra ID and internet-integrated identity environments." | Cybersecurity, FIDO2, PKI, Zero Trust | "Analyzed integration pathways across Entra ID CBA, WHfB credential providers, Graph API, WebAuthn/FIDO2, and Windows Hello APIs."; "Mapped credential enrollment, activation, and passwordless login journeys for Chrome and Edge on Windows and macOS."; "Developed proof-of-concept browser-based certificate authentication workflows and deployment flows with Intune, PKCS/SCEP, and Conditional Access." | `/logos/queralt.jpeg` | MUST-SURVIVE — this is the most technically detailed entry in the repo; note role says "Led R&D" here vs "Leading R&D" in site-content.ts |
| AI Expert Contributor (DevOps) | Snorkel AI | Dec 2025 - Present | "Supporting model development and evaluation pipelines through structured validation of AI-generated outputs across DevOps and infrastructure workflows." | AI, LLMs, DevOps, Evaluation | "Evaluate output quality, failure modes, and correctness in engineering-adjacent workflows."; "Provide structured feedback used to improve reliability, robustness, and performance."; "Contribute within production-oriented pipelines used to refine large-scale AI systems." | `/logos/snorkel.jpeg` | MUST-SURVIVE (date conflict noted above) |
| Web Developer | AFRIG Mag | Jul 2025 - Present | "Designed and developed the official site for AFRIG Mag from concept to launch with a focus on UX, performance, and accessibility." | Web Dev, Frontend, Performance, UX | "Built a responsive and visually engaging platform for a global audience."; "Managed architecture, multimedia integration, and frontend implementation."; "Optimized performance while preserving editorial brand identity." | `/logos/afrig.avif` | MUST-SURVIVE — absent from `currentWork` and from BUILD-PLAN's "real content" list; only appears here |
| AI Trainer | Alignerr & Outlier | Jun 2024 - Present | "Evaluating AI-generated code and real-world software workflows across enterprise and coding contexts." | AI, Copilot, Code Eval, Systems | "Worked on Microsoft Copilot video GenAI-related tasks through screen-shared workflow evaluation."; "Assessed generated code quality and wrote human-readable rationale summaries."; "Contributed to model improvement through practical software and systems judgment." | `/logos/alignerr.jpeg` | MUST-SURVIVE |
| Student Leadership | Trinity College | Aug 2024 - Present | "Serving across technology, athletics, entrepreneurship, and computer science communities while studying Computer Science." | Leadership, CS, Athletics, Campus | "Student Advisory Board Member for Library Information and Technology Services (LITS)."; "Track & Field Representative on the Student-Athlete Advisory Committee (SAAC)."; "Member of the Entrepreneurship Club, Computer Science Club, and Varsity Track & Field team." | `/logos/trinity.jpeg` | REWRITE — "Present" here conflicts with the NYU-transfer fact (see Open Questions) |
| 2025 Youth Delegate | World Bank Group Youth Summit | May 2025 | "Represented youth-led innovation through public speaking, policy discussion, and collaborative development work." | Global, Policy, Innovation, Speaking | "Delivered a speech on the role of Africa's youth in building a global hub for innovation and technology."; "Participated in a fireside chat on crypto and digital currencies in development."; "Co-led a team presenting a sustainable fashion and SME initiative in the Innovation Lab." | `/logos/worldbank.jpeg` | MUST-SURVIVE |
| Founder & CEO | TechBuzz | Feb 2022 - Jul 2024 | "Built and led a media platform focused on the intersection of technology and society." | Founder, Media, Content, Leadership | "Developed, built and updated the website, ensuring a seamless user experience."; "Led writers, editorial direction, website development, communications, and growth."; "Managed technical and operational execution across the platform."; "Built a strong foundation in storytelling, audience-building, and digital product execution." | `/logos/techbuzz.jpeg` | MUST-SURVIVE |
| Volunteer | Zooniverse (NASA AI4Mars) | May 2020 - Jun 2023 | "Contributed to machine learning training efforts supporting Mars rover terrain understanding." | AI, NASA, ML, Data | "Helped train AI systems through large-scale data labeling and analysis."; "Gained early exposure to practical machine learning workflows in space exploration contexts." | `/logos/zooniverse.jpeg` | MUST-SURVIVE |
| Intern | Ventures Platform Fund | Apr 2018 - May 2018 | "Gained early exposure to startup operations, cybersecurity, and venture-backed innovation in Nigeria." | Startups, Cybersecurity, Africa, Operations | "Worked with startup teams on data security, server management, and operational support."; "Learned directly inside a fast-paced African tech incubator environment." | `/logos/venturesplatform.jpeg` | MUST-SURVIVE |

**Cyera (Security Intern) is absent from this array entirely** — it does not appear anywhere in `src/`, `client/`, or git history. See Open Questions.

**NYU is absent from this array entirely** — only Trinity College appears, as a current ("Present") school. See Open Questions.

Section framing copy (`src/components/sections/ExperienceTimeline.tsx:172-181`, `src/components/sections/CurrentWorkSection.tsx:12-15`):
- "Building across fintech, AI, security, media, and leadership." (h2)
- "A curated timeline of founder, engineering, research, and leadership work across startups, AI systems, cybersecurity, education, and global innovation." (subhead)
- "Operating where product ambition meets engineering reality." (CurrentWork h2)
- "I currently work across startup execution, AI systems, software engineering, and deep technical study." (CurrentWork subhead)
All REWRITE — restated per-section, no new facts.

### Dead-app work history (`client/src/components/Experience.tsx:22-55`) — DELETE, but flags one date conflict worth carrying into Open Questions: Snorkel AI period given here as **"2026 — Present"** (a third, different value from the two above). Trinity period here: "Expected May 2028" (graduation date, consistent with `site-content.ts`'s "2024 – 2028" but not with the NYU-transfer fact).

## 3. Projects

### Live app — `featuredProjects`, `src/content/site-content.ts:70-92`

| title | summary (verbatim) | tags | href | Tag |
|---|---|---|---|---|
| Splita | "A fintech platform that simplifies group payments by collecting everyone's share upfront and paying vendors in full." | Fintech, Payments, Startup | https://splita.co | MUST-SURVIVE |
| QX509 Authentication Research | "Exploration of certificate-based identity, FIDO2, and enterprise PKI to replace password-based authentication systems." | Security, PKI, Authentication | `www.queraltinc.com` | MUST-SURVIVE (fact) — **DEFECT: malformed URL, no protocol** (see Defects). "QX509" is not named anywhere else in the repo; it is the only place this project label appears. |
| SkyView | "SkyView is a browser-based 3D globe built with Vite and Cesium. It layers flight traffic, airports, landmarks, optional weather and satellite feeds, and related UI on a Google Photorealistic 3D Tiles globe." | REST APIs, Open-source, 3D Map | https://github.com/arinze-okigbo/sky-view | MUST-SURVIVE — only project with a real GitHub link and the most technically specific description in the repo |

Section framing (`src/components/sections/FeaturedProjectsSection.tsx:18-21`): "Selected work with clear technical and product intent." / "Projects focused on real execution quality, not noise." — REWRITE.

### Dead-app projects (`client/src/components/Projects.tsx:24-57`) — DELETE, all placeholder-grade:
- "Splita" — same subject, different copy: "A coordination-first fintech product built to remove the friction, awkwardness, and failure points of group payments. Collecting everyone's share upfront and paying the vendor in full."
- "arinzeokigbo.com" — self-referential portfolio entry, tags Next.js/TypeScript/Tailwind/Framer Motion
- "Scanner" — "A technical project reflecting an interest in systems thinking, scanning workflows, and lower-level software structure. Built with discipline and focus on implementation." tags: Systems, Tooling, "C / Make", Engineering
- "Splita Coming Soon" — waitlist/landing-page entry for Splita's launch phase

All four dead-app project images are external CDN URLs (`d2xsxph8kpxj0f.cloudfront.net/...`) generated by what appears to be an AI page-builder (see `client/public/__manus__/debug-collector.js`), not real screenshots. **"Scanner" is not corroborated anywhere else in the repo** — treat as unverified/likely placeholder, not a real project, unless the user confirms it. Flagged in Open Questions.

## 4. Achievements, awards, credentials

Live app — `achievements`, `src/content/site-content.ts:94-115`:

| title | detail (verbatim) | Tag |
|---|---|---|
| Pre-Seed Fundraising (Splita) | "Secured early commitments toward a $200K pre-seed round from institutional and fellowship sources." | MUST-SURVIVE |
| Tyree Innovation & Entrepreneurship Fellow | "Selected for Trinity's entrepreneurship fellowship and winner of internal pitch and hackathon competitions." | MUST-SURVIVE |
| World Bank Youth Summit Delegate (2025) | "Contributed to global discussions on youth innovation and development." | MUST-SURVIVE |
| Builder Across AI, Security, and Fintech | "Hands-on experience spanning AI systems, authentication infrastructure, and startup product development." | DELETE/REWRITE — this is a generic self-summary, not a discrete achievement; duplicates About copy |

Section framing (`src/components/sections/AchievementsSection.tsx:12-14`): "A track record of building, shipping, and learning fast." / "A snapshot of milestones across startups, AI systems, and technical work." — REWRITE.

Trinity-specific leadership credentials also live only in the Experience timeline (§2): Tyree Fellow context, LITS Student Advisory Board, SAAC Track & Field Representative, Entrepreneurship Club / CS Club / Varsity Track & Field member. MUST-SURVIVE as facts.

## 5. Contact links and social handles

Live app — `contactLinks`, `src/content/site-content.ts:117-138` (rendered in `ContactSection.tsx` and, minus Email, in `SiteFooter.tsx:10`):

| label | href | value | Tag |
|---|---|---|---|
| Email | `mailto:arinze@splita.co` | arinze@splita.co | MUST-SURVIVE |
| LinkedIn | `https://www.linkedin.com/in/arinzeokigbo` | linkedin.com/in/arinzeokigbo | MUST-SURVIVE |
| GitHub | `https://github.com/arinze-okigbo` | github.com/arinze-okigbo | MUST-SURVIVE — note GitHub **username has a hyphen** (`arinze-okigbo`) while LinkedIn does **not** (`arinzeokigbo`) |
| X | `https://x.com/arinzeokigbo` | x.com/arinzeokigbo | MUST-SURVIVE |

All four hrefs are well-formed (valid `mailto:` / `https://` schemes). No malformed contact URL in the live contact list.

**Conflicting/unused contact data found elsewhere in the repo (flag, do not silently merge):**
- `src/components/ui/magnetic-dock.tsx:69-100` (dead code, not imported by `page.tsx` or any live section — see Defects) lists: GitHub `https://github.com/arinze-okigbo`, LinkedIn `https://linkedin.com/in/arinzeokigbo` (no `www.`, still no hyphen), X `https://x.com/arinzeokigbo`, Email `mailto:arinze@splita.co`, **plus a fifth link not present anywhere else: Substack `https://arinzeokigbo.substack.com/`**. Tag: DELETE the component, but flag the Substack URL in Open Questions — it may be a real, current channel worth adding, or it may be a stale placeholder.
- `client/src/components/Contact.tsx:13-18` (dead app) uses **different values entirely**: LinkedIn `https://linkedin.com/in/arinze-okigbo` (hyphenated, contradicts the live site's non-hyphenated handle), Twitter `https://twitter.com/arinzeokigbo`, Email `mailto:hello@arinzeokigbo.com` (a third, different email from `arinze@splita.co`). DELETE as source, but the discrepancy is itself a fact worth resolving — see Open Questions.

## 6. Resume

**No resume PDF exists anywhere in this repository.** Confirmed via `find . -iname "*.pdf"` (excluding `node_modules`) returning zero results, and via `docs/BUILD-PLAN.md:37` ("no resume file anywhere in the repo") and `docs/BUILD-PLAN.md:59` ("Resume: is there a PDF to link? Nothing is in the repo."). No component, route, or content file references a resume link or download. Definitive answer: **NO.**

## 7. Assets in `public/`

Measured via `ls -l` (byte-exact) and `du -h` (block-rounded); dimensions via `sips`.

| File | Bytes | Human | Dimensions | Used by | Flag |
|---|---|---|---|---|---|
| `public/profile.jpg` | 5,131,528 | ~4.9 MB | 4809×4809 px | `HeroSection.tsx:73` (`<Image src="/profile.jpg" width={1200} height={1200} priority>`, rendered at `h-64`/`h-72`, i.e. ≤288px tall) + OG/Twitter images in `layout.tsx:41,55` | **CRITICAL performance defect — 25,600x more pixel area than needed for its largest use (1200×1200), rendered at under 300px on screen. See Defects.** |
| `public/logos/splita.png` | 35,924 | 36 KB | 1563×1563 px | `ExperienceTimeline.tsx:181` (rendered 44×44px) | Over-provisioned but under the 200 KB threshold |
| `public/logos/afrig.avif` | 8,314 | 8.1 KB | 422×128 px | `ExperienceTimeline.tsx:223` | OK |
| `public/logos/worldbank.jpeg` | 5,032 | 4.9 KB | 100×100 px | `ExperienceTimeline.tsx:265` | OK |
| `public/logos/trinity.jpeg` | 5,006 | 4.9 KB | 100×100 px | `ExperienceTimeline.tsx:251` | OK |
| `public/logos/zooniverse.jpeg` | 4,494 | 4.4 KB | 100×100 px | `ExperienceTimeline.tsx:293` | OK |
| `public/logos/snorkel.jpeg` | 3,287 | 3.2 KB | 100×100 px | `ExperienceTimeline.tsx:209` | OK |
| `public/logos/queralt.jpeg` | 3,178 | 3.1 KB | 100×100 px | `ExperienceTimeline.tsx:195` | OK |
| `public/logos/techbuzz.jpeg` | 2,560 | 2.5 KB | 100×100 px | `ExperienceTimeline.tsx:280` | OK |
| `public/logos/alignerr.jpeg` | 2,728 | 2.7 KB | 100×100 px | `ExperienceTimeline.tsx:237` | OK |
| `public/logos/venturesplatform.jpeg` | 2,479 | 2.4 KB | 100×100 px | `ExperienceTimeline.tsx:306` | OK |
| `public/og-image.svg` | 1,449 | 1.4 KB | vector | **Not referenced anywhere** — grep of `src/` finds no use | DELETE or wire up — see Defects (OG points at profile.jpg instead) |
| `public/globe.svg` | 1,035 | 1.0 KB | vector | Next.js scaffold default — not referenced in `src/` | DELETE (unused scaffold asset) |
| `public/next.svg` | 1,375 | 1.3 KB | vector | Next.js scaffold default — not referenced in `src/` | DELETE (unused scaffold asset) |
| `public/window.svg` | 385 | 0.4 KB | vector | Next.js scaffold default — not referenced in `src/` | DELETE (unused scaffold asset) |
| `public/file.svg` | 391 | 0.4 KB | vector | Next.js scaffold default — not referenced in `src/` | DELETE (unused scaffold asset) |
| `public/vercel.svg` | 128 | 0.1 KB | vector | Next.js scaffold default — not referenced in `src/` | DELETE (unused scaffold asset) |
| `src/app/favicon.ico` | (not measured; lives outside `public/`) | — | — | `layout.tsx:63` (`icons.icon: "/favicon.ico"`) | MUST-SURVIVE, verify it isn't the Next.js default |

**Only asset over the 200 KB threshold: `public/profile.jpg` at ~4.9 MB — roughly 25x over.**

Ten of ten logo files listed in `ExperienceTimeline.tsx` are present in `public/logos/` (Splita, Queralt, Snorkel, AFRIG, Alignerr, Trinity, World Bank, TechBuzz, Zooniverse, Ventures Platform) — matches BUILD-PLAN's "Ten company logos" count.

## 8. Metadata — `src/app/layout.tsx:21-65`

```
metadataBase: new URL("https://arinzeokigbo.com")
title.default: "Arinze Okigbo | Founder, Engineer, Builder"
title.template: "%s | Arinze Okigbo"
description: "Founder and engineer building at the intersection of AI, security, infrastructure, and fintech."
openGraph.type: "website"
openGraph.url: "https://www.arinzeokigbo.com"   <- note "www." here vs metadataBase and canonical below without "www."
openGraph.title: "Arinze Okigbo | Founder, Engineer, Builder"
openGraph.description: "Co-Founder & CEO of Splita. AI DevOps @ Snorkel AI. Engineering @ Queralt Inc. CS @ Trinity College."
openGraph.siteName: "ArinzeOkigbo.com"
openGraph.images: [{ url: "https://arinzeokigbo.com/profile.jpg", width: 1200, height: 630, alt: "Arinze Okigbo", type: "image/jpeg" }]
twitter.card: "summary_large_image"
twitter.title: "Arinze Okigbo | Founder, Engineer, Builder"
twitter.description: "Building AI-forward products with depth in infrastructure, security, and fintech."
twitter.images: ["https://arinzeokigbo.com/profile.jpg"]
alternates.canonical: "https://arinzeokigbo.com"
icons.icon: "/favicon.ico"
```

Tag: MUST-SURVIVE (title/description substance) / REWRITE (exact strings, and fix the `www.` inconsistency — see Defects). Note the declared OG image dimensions (1200×630) do not match the source file's actual dimensions (4809×4809, square) — Next.js/social crawlers will use the declared 1200×630 but the source is not cropped to that aspect ratio, so the actual crop behavior is undefined/crawler-dependent.

## 9. Analytics

`package.json:21-22` (dependencies): `@vercel/analytics@^2.0.1`, `@vercel/speed-insights@^2.0.0` — both installed.

Grep of `src/` for `Analytics` and `SpeedInsights` components/imports: **zero matches.** `src/app/layout.tsx` (the only place they could be mounted, per Next.js convention) does not import or render either. `README.md` claims "Vercel Analytics + Speed Insights" under Stack, which is currently false as shipped.

**Gap: both packages are installed and paid-for in the bundle but contribute nothing — no data is being collected on the live site today.** Tag: DELETE the false README claim, REWRITE by actually mounting both components (per BUILD-PLAN Phase 4 "backend" ownership) or removing the dependencies.

## 10. Deploy and domain config

- **No `vercel.json`** anywhere in the repo (`find . -iname "vercel.json"` returns nothing outside `node_modules`).
- `next.config.ts` (`/Users/arinzeokigbo/arinzeokigbo/next.config.ts`) is the scaffold default — an empty `NextConfig` object, no redirects, headers, images config, or rewrites.
- `README.md:44-51` ("Deployment (Vercel)" section) documents the deploy process narratively: push to GitHub → import in Vercel → framework preset Next.js → deploy from `main` → add custom domain `arinzeokigbo.com` in Vercel → **"Update IONOS DNS records to point to Vercel"** (this is the only DNS hint in the repo — registrar is IONOS) → verify SSL/OG/Lighthouse.
- No `.env.example` file exists; README states one should be added "if future integrations require environment variables" (`README.md:39-42`) — none currently do. Grep of `src/**/*.ts(x)` for `process.env.` returns zero matches. The only `process.env`/`import.meta.env` references in the whole repo are in the dead app (`client/src/const.ts:5-6`, `client/src/components/Map.tsx`), which references `VITE_OAUTH_PORTAL_URL` and `VITE_APP_ID` for an OAuth login helper — dead, unused, DELETE.
- `package.json:5-7`: `"engines": { "node": ">=20" }`.
- Deploy target confirmed live at arinzeokigbo.com per task brief; no CI/CD workflow files found under `.github/` (not checked exhaustively — see Open Questions if relevant).

## 11. Fonts and design tokens

Fonts — `src/app/layout.tsx:2,8-19`: `Space_Grotesk` (Google font, `variable: --font-space-grotesk`, `display: swap`) as the body/sans font, and `Instrument_Serif` (Google font, `variable: --font-instrument-serif`, weight 400 only, `display: swap`) as the serif/display font used for `.section-title` and hero `h1` (`font-serif` utility). Both wired into Tailwind via `@theme inline` in `src/app/globals.css:22-23`.

Color tokens — `src/app/globals.css:3-12` (`:root`):

| Token | Hex/value | Usage |
|---|---|---|
| `--background` | `#0a0a0a` | page background |
| `--surface` | `#101010` | `.card` background base |
| `--surface-strong` | `#161616` | icon chips, badges |
| `--foreground` | `#f6f5f2` | primary text |
| `--muted` | `#b4b1ab` | secondary text |
| `--line` | `#232323` | borders (also global `* { border-color: var(--line) }`) |
| `--accent` | `#d1a954` | gold accent — eyebrows, hover states, focus rings, selection highlight |
| `--radius` | `18px` | card corner radius |

Dark-only palette — no `prefers-color-scheme` or light-theme tokens exist anywhere in `globals.css`. All colors are hardcoded hex custom properties, re-exposed to Tailwind via `@theme inline` (`--color-background`, `--color-surface`, etc., `globals.css:14-24`).

Other structural CSS worth carrying as reference, `src/app/globals.css`: `.container-shell` (`width: min(1120px, calc(100% - 2rem))`), `.section-shell` (`padding-block: clamp(4rem, 9vw, 7rem)`), `.section-title` (`clamp(2rem, 4vw, 3.5rem)`, line-height 1.05, letter-spacing -0.02em), `.eyebrow` (0.72rem, 600 weight, 0.16em tracking, uppercase, accent color), `.card` (gradient + shadow recipe, lines 72-81), `.link-underline` (animated underline, lines 83-103).

---

## DEFECTS

| # | Defect | Location | Severity |
|---|---|---|---|
| 1 | `public/profile.jpg` is 5,131,528 bytes (~4.9 MB), 4809×4809 px, rendered at ≤288px tall via `next/image` at `width=1200 height=1200`. Single largest performance liability in the repo; alone blows any realistic LCP budget. | `public/profile.jpg`; referenced `src/components/sections/HeroSection.tsx:73`, `src/app/layout.tsx:41,55` | CRITICAL |
| 2 | `@vercel/analytics` and `@vercel/speed-insights` are installed (`package.json:21-22`) but never imported or rendered anywhere in `src/`. Zero analytics data is being collected on the live site right now, contradicting `README.md`'s claim of "Vercel Analytics + Speed Insights" under Stack. | `src/app/layout.tsx` (absence), `README.md` (false claim), `package.json:21-22` | HIGH |
| 3 | `public/og-image.svg` exists (1,449 bytes) but is never referenced by any OG/Twitter tag; `layout.tsx:41,55` instead points both Open Graph and Twitter Card images at `profile.jpg`. SVG is also not a broadly-supported Open Graph image format regardless. | `public/og-image.svg`; `src/app/layout.tsx:39-47,55` | HIGH |
| 4 | `featuredProjects[1].href` is the bare string `"www.queraltinc.com"` with no `https://` protocol. Rendered directly into an anchor `href` (`FeaturedProjectsSection.tsx:28`), this resolves as a relative path from whatever page the link is clicked on, not an absolute URL — clicking it will NOT navigate to queraltinc.com from most contexts. | `src/content/site-content.ts:83` | HIGH |
| 5 | `html { scroll-behavior: smooth }` in `globals.css:30-32` runs concurrently with Lenis smooth-scroll (`SmoothScrollProvider.tsx`), which also intercepts and smooths scroll behavior. Two competing smooth-scroll implementations can fight for control of scroll position/anchor-jump animation, especially on in-page `#anchor` links (nav, hero "Scroll for story", footer). | `src/app/globals.css:30-32` vs `src/components/providers/SmoothScrollProvider.tsx` | MEDIUM |
| 6 | No global `prefers-reduced-motion` CSS guard beyond one late addition: `globals.css:105-114` DOES define a `@media (prefers-reduced-motion: reduce)` block that zeroes animation/transition durations — so this specific defect as described in the brief is **partially already fixed** in CSS. However, Lenis itself is NOT gated on `prefers-reduced-motion` at the CSS layer (it is gated in JS via `useReducedMotion()` in `SmoothScrollProvider.tsx:12,17,20` — so this actually works at the component level). Net: reduced-motion handling exists in both CSS (`globals.css`) and selectively in JS (`Reveal.tsx`, `HeroSection.tsx`, `FeaturedProjectsSection.tsx`, `SmoothScrollProvider.tsx`), but is inconsistent — e.g. `ExperienceCard.tsx`'s 3D tilt-on-hover and `ExperienceTimeline.tsx`'s scroll-linked line-height animation have no `useReducedMotion` check at all. | `src/components/ExperienceCard.tsx` (no reduced-motion check), `src/components/sections/ExperienceTimeline.tsx` (no reduced-motion check) | MEDIUM |
| 7 | Two fully dead, unimported components live in `src/components/ui/`: `magnetic-dock.tsx` (a `MagneticDock` default export, zero imports anywhere in `src/`) and `timeline.tsx` (a `Timeline` named export, zero imports anywhere in `src/`). Both carry real motion logic and (in `magnetic-dock.tsx`'s case) a fifth, undocumented contact link (Substack) not surfaced anywhere live. | `src/components/ui/magnetic-dock.tsx` (108 lines, dead); `src/components/ui/timeline.tsx` (84 lines, dead) | MEDIUM |
| 8 | `openGraph.url` is `"https://www.arinzeokigbo.com"` (with `www.`) while `metadataBase` and `alternates.canonical` both use `"https://arinzeokigbo.com"` (without `www.`) — an internal inconsistency in canonical domain form. | `src/app/layout.tsx:22,34,59` | MEDIUM |
| 9 | Declared OG image dimensions (`width: 1200, height: 630`, a 1.91:1 landscape crop, `layout.tsx:42-43`) do not match the actual source file (`profile.jpg`, 4809×4809, perfectly square) — the real crop behavior social platforms will apply is undefined/inconsistent. | `src/app/layout.tsx:41-46`; `public/profile.jpg` | MEDIUM |
| 10 | Internal date conflicts for the same role across files: Snorkel AI period is "2024 – Present" in `site-content.ts:44`, "Dec 2025 - Present" in `ExperienceTimeline.tsx:40`, and "2026 — Present" in the dead app's `client/src/components/Experience.tsx:42` (dead-app value not authoritative, but the live-app internal conflict between `site-content.ts` and `ExperienceTimeline.tsx` is real and unresolved). | `src/content/site-content.ts:44`; `src/components/sections/ExperienceTimeline.tsx:40` | MEDIUM |
| 11 | Five of six Next.js scaffold SVGs in `public/` (`globe.svg`, `next.svg`, `window.svg`, `file.svg`, `vercel.svg`) are never referenced anywhere in `src/` — leftover from `create-next-app` and safe to delete. | `public/globe.svg`, `public/next.svg`, `public/window.svg`, `public/file.svg`, `public/vercel.svg` | LOW |
| 12 | Dead Vite/shadcn app (`client/`, `server/`, `shared/`, `patches/`, `vite.config.ts`) carries ~60 files including a working OAuth login-URL builder (`client/src/const.ts`) referencing `VITE_OAUTH_PORTAL_URL`/`VITE_APP_ID` env vars that don't exist anywhere else in the repo, and a third-party debug/telemetry script `client/public/__manus__/debug-collector.js` from what appears to be an AI site-generation tool (Manus). None of this is deployed (excluded via `tsconfig.json:26` exclude list, no build script wires it up), but it is real carrying cost and a real (if inert) attack-surface/telemetry question until deleted. | `client/`, `server/`, `shared/`, `patches/`, `vite.config.ts`, `client/public/__manus__/debug-collector.js` | LOW (already scheduled for deletion per BUILD-PLAN Phase 4) |
| 13 | Contact-info inconsistency across dead/unused code paths vs. the live site: dead app's `client/src/components/Contact.tsx:13-18` uses a hyphenated LinkedIn handle (`arinze-okigbo`) and a different email (`hello@arinzeokigbo.com`) than the live site's non-hyphenated LinkedIn handle and `arinze@splita.co` email. Since the dead app is never deployed this causes no live user-facing harm, but it means the two email addresses and two LinkedIn handle spellings both exist in this repo's history and someone should confirm which is current. | `client/src/components/Contact.tsx:13-18` vs `src/content/site-content.ts:120-127` | LOW |

---

## OPEN QUESTIONS

Do not resolve any of these. Carry them forward verbatim into Phase 3.

1. **Cyera** — absent from the repo entirely (no file, no git history match for "Cyera" in any commit). BUILD-PLAN (`docs/BUILD-PLAN.md:47`) says Cyera should be one of four first-class selected-work entries (Splita, Cyera, Queralt, Snorkel AI) and (`docs/BUILD-PLAN.md:57`) that exact title, dates, and one sentence on what shipped are still needed. Task brief separately describes Arinze as "former Security Intern at Cyera" — that title/date range is not sourced anywhere in this repo and must come from the user directly.
2. **NYU transfer date** — task brief states Arinze is "CS student (NYU now, transferred from Trinity College)"; BUILD-PLAN (`docs/BUILD-PLAN.md:44-45`) confirms "NYU is current. Trinity College is prior — Arinze transferred. Both appear; NYU as current, Trinity as prior. STILL NEEDED: transfer date." Nothing in `src/` or `client/` mentions NYU at all — every school reference in the codebase (`site-content.ts:60-67`, `ExperienceTimeline.tsx:79-92`, dead app) describes Trinity as current/ongoing ("2024 – 2028", "Present", "Expected May 2028"). This is a real fact gap, not just a wording gap — the entire codebase is written as if Trinity is still current.
3. **Resume PDF** — confirmed absent (see §6). Open question is only whether one should be produced/linked in the rebuild, and if so, from what source.
4. **Snorkel AI start date conflict** — three different values across two live-app files and one dead-app file: "2024 – Present" (`site-content.ts:44`), "Dec 2025 - Present" (`ExperienceTimeline.tsx:40`), "2026 — Present" (dead app, not authoritative). Which is correct?
5. **Snorkel AI exact title** — `site-content.ts:43` says "AI Contributor (DevOps)"; `ExperienceTimeline.tsx:38` says "AI Expert Contributor (DevOps)". Which is the correct/current title?
6. **Queralt role framing** — `site-content.ts:52` says "Leading R&D on browser-native authentication..."; `ExperienceTimeline.tsx:27` says "Led R&D on browser-native, selectable authentication...". Tense and scope differ slightly (current "Leading" vs past "Led"). Is the Queralt R&D work ongoing or concluded?
7. **AFRIG Mag Web Developer role** — appears only in `ExperienceTimeline.tsx:212-224` ("Jul 2025 - Present"), not mentioned in `currentWork`, achievements, or the task brief at all. Should this be carried forward as current, real work, or was it a past one-off dropped from later copy for a reason?
8. **Substack channel** — `https://arinzeokigbo.substack.com/` appears only once, in the dead/unimported `src/components/ui/magnetic-dock.tsx:101-104`. Is this a real, current, or intended channel? Not corroborated anywhere else, including the task brief.
9. **Email address discrepancy** — live site uses `arinze@splita.co` everywhere (`site-content.ts:120-121`, `magnetic-dock.tsx:97`). Dead app's `client/src/components/Contact.tsx:17` uses `hello@arinzeokigbo.com`. Which is the intended contact address for a personal/portfolio site — the company email or a personal-domain email?
10. **GitHub/LinkedIn handle spelling** — live site's GitHub handle is hyphenated (`arinze-okigbo`) while its LinkedIn handle is not (`arinzeokigbo`). Dead app hyphenates LinkedIn too (`arinze-okigbo`). Confirm the actually-correct, currently-live handle for each platform directly rather than trusting either source.
11. **"Scanner" project** — appears only in the dead, unimported `client/src/components/Projects.tsx:42-48` with vague, generic-sounding copy ("A technical project reflecting an interest in systems thinking...") and a placeholder CDN image. Not corroborated by the live site, `site-content.ts`, achievements, or the task brief. Is this a real project that should be resurrected, or AI-generated filler from whatever tool produced the dead app (see `client/public/__manus__/debug-collector.js`)?
12. **Dead-app skills list** (`client/src/components/About.tsx:22-38`: TypeScript, Python, Go, React, Next.js, Node.js, PostgreSQL, Redis, AWS, Kubernetes, Docker, TensorFlow, PyTorch, GraphQL, gRPC) — never corroborated by any other file, the live site, or the task brief. Confirm which of these (if any) are real, current, relevant skills before using them.
13. **"QX509"** — the label for the Queralt-related featured project (`site-content.ts:79`) does not appear anywhere else in the repo, including the detailed Queralt timeline entry. Is "QX509" a real internal/product codename worth naming publicly, or should the featured-project entry just be titled "Queralt" / "Browser-Native Authentication Research" to match the rest of the repo's naming?

## Git history note

`git log --oneline -30` shows 11 commits total, from `3a701f2` (Initial commit) to `c347819` (the BUILD-PLAN doc commit that immediately precedes this audit). A search of the full commit history (`git log -p --all -S"Cyera"`) found zero occurrences of "Cyera" in any commit — it was never in this repo, not even a version that was later deleted. A targeted history search on `src/content/site-content.ts` shows only two commits ever touched it (`ee55ea6`, `fd58907`) — no evidence of content being added and then stripped out. **No recoverable deleted content was found in git history beyond what's already inventoried above.** The dead Vite app (`client/`, `server/`, `shared/`) was introduced whole and has not been partially deleted at any point — it is still fully present on disk today, pending its scheduled Phase 4 removal.
