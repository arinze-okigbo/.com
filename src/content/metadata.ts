/**
 * Page metadata strings — `docs/05 §3.8`.
 *
 * Consumed by `src/app/layout.tsx` (frontend-core) and
 * `src/app/opengraph-image.tsx` (backend). Held here so the strings have one
 * home and cannot drift between the three surfaces that render them.
 *
 * Fixes `docs/00` Defect 8 (the `www.` inconsistency between `openGraph.url` and
 * `metadataBase`/`canonical`) and Defects 3 + 9 (OG pointing at a 4.9 MB square
 * portrait while declaring 1200×630). The OG image is generated at
 * `/opengraph-image`. A resized portrait recovered from repository history
 * is available separately at `/portrait.webp`; provenance is recorded in
 * `hive/research/portrait.json`.
 */

const TITLE = "Arinze Okigbo — group payments and browser-native authentication";

const DESCRIPTION =
  "Co-founder and CEO of Splita. Browser-native FIDO2 and PKI authentication R&D at Queralt Inc. Model-evaluation pipelines at Snorkel AI.";

export const siteMetadata = {
  baseUrl: "https://arinzeokigbo.com",
  canonical: "https://arinzeokigbo.com",
  siteName: "Arinze Okigbo",
  title: TITLE,
  titleTemplate: "%s — Arinze Okigbo",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "https://arinzeokigbo.com",
    siteName: "Arinze Okigbo",
    title: TITLE,
    description: DESCRIPTION,
    image: {
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Arinze Okigbo — group payments at Splita, browser-native authentication at Queralt Inc.",
      type: "image/png",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    image: "/opengraph-image",
  },
  icon: "/favicon.ico",
} as const;

/** The three lines rendered into the generated OG image. `docs/05 §3.8`. */
export const openGraphImageLines: readonly string[] = [
  "Arinze Okigbo",
  "I build group-payment and browser-native authentication systems.",
  "Splita · Queralt Inc. · Snorkel AI · NYU",
];
