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
src/
	app/
		globals.css
		layout.tsx
		page.tsx
	components/
		layout/
		motion/
		providers/
		sections/
		ui/
	content/
		site-content.ts
	lib/
		utils.ts
tests/
	e2e/
```

## Content Editing

All website copy and list data live in `src/content/site-content.ts`.

This keeps section components reusable and makes future updates straightforward.

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
