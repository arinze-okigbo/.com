import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/app/globals.css";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SkipLink } from "@/components/layout/SkipLink";
import { ThemeScript } from "@/components/layout/ThemeScript";
import { LightSourceScript } from "@/components/layout/LightSourceScript";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { AttestationField } from "@/components/three";
import { ExternalLinkNotice } from "@/components/ui/InlineLink";
import { ATTESTATION } from "@/content/attestation";
import {
  FOOTER_YEAR,
  WORDMARK,
  SKIP_LINK_LABEL,
  footerLinks,
  mobileNavLabels,
  navItems,
  resumeHref,
  resumeLabel,
  resumePendingLabel,
  siteMetadata,
  themeToggleLabels,
} from "@/content/site-content";

/**
 * docs/04 §1.1 — one variable family, 22,320 bytes, one preload link.
 * Instrument Serif is dropped (15,040 bytes, −40.3%).
 *
 * `display: "swap"` renders the claim sentence in the metric-matched fallback
 * at first paint, so time-to-first-meaningful-text is bounded by HTML rather
 * than by the font [03 R4]. `adjustFontFallback` stays on — it is what keeps
 * the swap's CLS contribution at ~0. No `weight` key: this resolves to the
 * variable file, which ships 400 and 500 in one request.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

/**
 * Every string below comes from `@/content/site-content` (docs/05 §3.8).
 * No copy is authored in this file, so metadata cannot drift out of sync with
 * the copy — which is how the `www.` / apex mismatch of docs/00 Defect 8 got
 * in. `openGraph.url` and `alternates.canonical` now resolve from the same
 * module and therefore agree by construction.
 *
 * NO `openGraph.images` / `twitter.images` KEY HERE, DELIBERATELY.
 * `src/app/opengraph-image.tsx` and `src/app/twitter-image.tsx` are Next file
 * conventions: Next emits `og:image` / `twitter:image` from them automatically,
 * as absolute URLs derived from `metadataBase`. An explicit `images` key does
 * not merge with that — it REPLACES it, which is exactly what left the tags
 * pointing at a 4.9 MB portrait (docs/00 Defects 3 and 9). That file has since
 * been deleted from `public/`; re-adding either key silently suppresses the
 * generated image.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.baseUrl),
  title: {
    default: siteMetadata.title,
    template: siteMetadata.titleTemplate,
  },
  description: siteMetadata.description,
  alternates: { canonical: siteMetadata.canonical },
  openGraph: {
    type: siteMetadata.openGraph.type,
    url: siteMetadata.openGraph.url,
    siteName: siteMetadata.openGraph.siteName,
    title: siteMetadata.openGraph.title,
    description: siteMetadata.openGraph.description,
  },
  twitter: {
    card: siteMetadata.twitter.card,
    title: siteMetadata.twitter.title,
    description: siteMetadata.twitter.description,
  },
  icons: { icon: siteMetadata.icon },
};

/**
 * `color-scheme: light dark` makes native scrollbars, form controls and the
 * browser's own canvas match the resolved theme, so there is no white flash
 * behind a dark page during navigation. docs/04 §9.3.
 */
export const viewport: Viewport = {
  colorScheme: "light dark",
  // DELIBERATELY NO `viewportFit: "cover"`.
  //
  // Without it iOS keeps the page inside the safe area automatically and every
  // `env(safe-area-inset-*)` resolves to 0, so nothing is clipped by the notch
  // or the home indicator. The cost is that on a notched device in landscape
  // the page is letterboxed: the sticky header's background stops short of the
  // screen edge. That is accepted.
  //
  // `viewport-fit: cover` is the other half of a pair and must never ship
  // alone: opting in without `padding-inline: env(safe-area-inset-left)
  // env(safe-area-inset-right)` on `.site-header` and
  // `padding-block-end: calc(var(--space-8) + env(safe-area-inset-bottom))` on
  // `.site-footer` puts content under the notch and the home indicator. There
  // is currently no `env()` anywhere in `src/`, which is consistent and safe.
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // `suppressHydrationWarning`: ThemeScript writes `data-theme` and the
    // `.js` class onto <html> before React hydrates. This is the one element
    // whose server and client markup are expected to differ.
    // `spaceGrotesk.variable` MUST be on <html>, not <body>: `--font-sans`
    // (globals.css §3 `@theme`) is declared at `:root` and references
    // `--font-space-grotesk`. A custom property that is unset where the
    // referencing declaration lives makes that declaration invalid at
    // computed-value time, so `--font-sans` resolved to nothing and every
    // element fell back to Preflight's `ui-sans-serif` stack while the
    // webfont was preloaded and discarded. Declaring the variable on the
    // same element that declares `--font-sans` is what makes the face paint.
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        {/* Composition order per docs/04 §8.1: SmoothScrollProvider (Lenis,
            destroyed under prefers-reduced-motion, M12) > SkipLink >
            SiteHeader > main#main > SiteFooter.

            There is no Framer Motion boundary: every animation on this site is
            a CSS transition driven by an IntersectionObserver attribute write
            (globals.css §7, `useReveal`). `LazyMotion` was mounted here around
            zero motion components and cost 29,525 B gz on every load. */}
        <SmoothScrollProvider>
          {/* One shared description for every external link, so the new-tab
              notice stays out of heading text and out of the article names
              computed from those headings. See EXTERNAL_LINK_NOTICE_ID. */}
          <ExternalLinkNotice />

          {/* THE PAGE'S GROUND — docs/04 §2.7, §3.5 A8, docs/15 §2.2.
              Mounted ONCE, here, before {children}. A second field is a defect
              (A8.5): it is the substrate, not an element in the composition.

              `.field-backdrop` is the single stacking context the whole
              composition lives in, which is what makes §2.7's declared order
              — field -> grid -> content -> header -> skip link — actually
              render. `--z-field` and `--z-grid` index INSIDE it; `main` is
              `position: relative` and therefore paints above it. A bare
              `z-index: 1` fixed grid in the root stacking context would paint
              above non-positioned in-flow content instead of below it, and
              the page's own text would end up behind the blueprint.

              Order within it is deliberate: grain, then the field, then the
              grid. The grain is BELOW the field because §2.8 exempts the field
              from the CSS grain layer — the field carries its own grain and
              ordered dither inside its composite pass, and a CSS grain over an
              additive surface double-dithers. Where the field paints, the
              grain is covered; where it masks out (all of light mode's #work,
              #projects, #about and #contact, and every JS-disabled render) the
              grain textures the page ground exactly as intended.

              There is NO CSS scrim sheet anywhere in here, and adding one is a
              defect under A8.3: the scrim is carved out of the composite by
              the `data-scrim` rects, so the pixels a contrast check samples
              are the pixels actually behind the type. */}
          {/* NO `aria-hidden` on this wrapper, deliberately. It is a stacking
              -context device, not a semantics device, and `aria-hidden` here
              is inherited by everything inside it — which would have silently
              deleted the poster's `role="img"` + `aria-label`. That name is
              required by docs/05 §3.10's alt inventory and docs/02 §8.1, and
              `AttestationFieldProps.alt` is a REQUIRED prop for exactly that
              reason: the poster is the whole experience for a JS-off,
              reduced-motion or no-WebGL visitor. A8.5's "the field is
              aria-hidden" is about the LIVE canvas — which `AttestationField`
              marks itself — and about the field not counting as an element in
              F9's per-viewport accent tally. It is not a licence to drop a
              1.1.1 name from the one surface that has to carry it.

              The grain and the grid ARE hidden: they are empty decorative
              layers with no name to lose. */}
          <div className="field-backdrop">
            <div className="field-grain" aria-hidden="true" />
            <AttestationField alt={ATTESTATION.posterAlt} />
            <div className="blueprint-grid" data-lit aria-hidden="true" />
          </div>

          <SkipLink label={SKIP_LINK_LABEL} />
          <SiteHeader
            items={navItems}
            resumeHref={resumeHref}
            resumeLabel={resumeLabel}
            resumePendingLabel={resumePendingLabel}
            mobileNavLabels={mobileNavLabels}
            themeToggleLabels={themeToggleLabels}
            wordmark={WORDMARK}
          />
          {/* `tabIndex={-1}`: <main> is not focusable by default, and only
              Chromium moves the sequential focus navigation starting point to
              a non-focusable fragment target. Without this the skip link
              changes the URL and nothing else in WebKit (WCAG 2.4.1).
              `:focus:not(:focus-visible)` already suppresses the ring. */}
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter contactLinks={footerLinks} year={FOOTER_YEAR} />

          {/* NO `<FieldHud />` HERE, and this is deliberate.
              The readout (docs/15 §2.11 / M8.2) used to be mounted at this
              point as a `position: fixed` layer over the whole document, and
              at 1440x900 it painted on top of section copy at every scroll
              position — over "Three entries, ordered by how hard the work is
              to fake" in the hero, over the authenticator status line in
              `#ceremony`. It is now the hero's closing block, in flow, where
              it cannot occlude anything. See `three/FieldHud.tsx`.

              It still carries the A7 `verified` glyph, and it is still the
              only one on the page — `AttestationSection` renders no readout
              row for exactly that reason. */}
        </SmoothScrollProvider>

        {/* The light source (docs/04 §2.8). An inline script, not a client
            component: it renders no DOM, owns no state, and the port is
            budgeted at ±0 First Load JS. Mounted last so it never sits in
            front of the LCP text — the lamp already has a correct resting
            position in CSS and only improves on it. */}
        <LightSourceScript />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
