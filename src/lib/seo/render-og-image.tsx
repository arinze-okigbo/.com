/**
 * The shared social-card renderer.
 *
 * This replaces the broken setup `docs/00` recorded: OG and Twitter tags both
 * pointed at a 4.9 MB, 4809x4809 square portrait declared as 1200x630
 * (Defects 1, 3, 9), while an unreferenced `og-image.svg` sat beside it, in a
 * format Open Graph does not support anyway. Both files have since been
 * deleted; this generated card is the only social image the site has.
 *
 * `src/app/opengraph-image.tsx` and `src/app/twitter-image.tsx` are thin
 * file-convention routes over this function, so the two cards can never drift
 * apart and each route still declares its own `runtime` literally (Next cannot
 * read a re-exported route segment config).
 *
 * Because these are file-convention routes, Next emits the `og:image` and
 * `twitter:image` tags itself, with absolute URLs derived from `metadataBase`.
 * That closes Defect 8 structurally: there is no hand-written OG URL left to
 * drift from the canonical one.
 *
 * Copy is verbatim from `docs/05` §3.8. Tokens are from `docs/04` via
 * `@/lib/seo/og-tokens`. Nothing user-supplied is rendered here — the card is
 * built entirely from constants, so there is no escaping surface.
 */

import { ImageResponse } from "next/og";

import { openGraphImageLines, siteMetadata } from "@/content/metadata";
import {
  OG_ACCENT_RULE,
  OG_COLORS,
  OG_MEASURE,
  OG_SIZE,
  OG_SPACE,
  OG_TYPE,
} from "@/lib/seo/og-tokens";
import { describeError, logger } from "@/lib/observability/logger";

/** `docs/05` §3.10, alt-text inventory. Adjudicated in `@/content/metadata`. */
export const OG_ALT: string = siteMetadata.openGraph.image.alt;

export const OG_IMAGE_SIZE = { width: OG_SIZE.width, height: OG_SIZE.height };

export const OG_CONTENT_TYPE = "image/png";

/**
 * `docs/05` §3.8, "Text rendered into the OG image" — three lines, verbatim
 * from `@/content/metadata`. Never retyped here.
 */
const [HEADLINE = "", CLAIM = "", PROOF_NOUNS = ""] = openGraphImageLines;

const FONT_FAMILY = "Space Grotesk";
const FONT_FETCH_TIMEOUT_MILLISECONDS = 4_000;

/**
 * Fetches a single Space Grotesk weight as TTF.
 *
 * Satori cannot read WOFF2, and the Google Fonts CSS endpoint only serves TTF
 * to a legacy user agent — hence the deliberately old UA string.
 *
 * Returns `null` on any failure. A missing webfont degrades the card to the
 * renderer's built-in sans; it must never fail the image, because a failed OG
 * route is a blank social card on every share.
 */
async function loadSpaceGrotesk(weight: number): Promise<ArrayBuffer | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FONT_FETCH_TIMEOUT_MILLISECONDS);

  try {
    const cssResponse = await fetch(
      `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64)" },
        signal: controller.signal,
      },
    );
    if (!cssResponse.ok) return null;

    const css = await cssResponse.text();
    const match = /src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/.exec(css);
    const fontUrl = match?.[1];
    if (fontUrl === undefined) return null;

    const fontResponse = await fetch(fontUrl, { signal: controller.signal });
    if (!fontResponse.ok) return null;

    return await fontResponse.arrayBuffer();
  } catch (error: unknown) {
    logger.warn("og.font_fetch_failed", { weight, ...describeError(error) });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

interface LoadedFont {
  readonly name: string;
  readonly data: ArrayBuffer;
  readonly weight: 400 | 500;
  readonly style: "normal";
}

async function loadFonts(): Promise<readonly LoadedFont[]> {
  const [regular, medium] = await Promise.all([loadSpaceGrotesk(400), loadSpaceGrotesk(500)]);

  const fonts: LoadedFont[] = [];
  if (regular !== null)
    fonts.push({ name: FONT_FAMILY, data: regular, weight: 400, style: "normal" });
  if (medium !== null)
    fonts.push({ name: FONT_FAMILY, data: medium, weight: 500, style: "normal" });
  return fonts;
}

export async function renderSocialCard(): Promise<ImageResponse> {
  const fonts = await loadFonts();
  const fontFamily = fonts.length > 0 ? FONT_FAMILY : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: OG_COLORS.background,
          padding: OG_SPACE.space16,
          fontFamily,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            // Fill the space above the footer rule and sit the claim in its
            // optical centre, rather than stranding it at the top edge.
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: OG_ACCENT_RULE.width,
              height: OG_ACCENT_RULE.height,
              backgroundColor: OG_COLORS.accent,
              marginBottom: OG_SPACE.space8,
            }}
          />
          <div
            style={{
              fontSize: OG_TYPE.h1.size,
              lineHeight: OG_TYPE.h1.lineHeight,
              letterSpacing: OG_TYPE.h1.letterSpacing,
              fontWeight: OG_TYPE.h1.weight,
              color: OG_COLORS.foregroundStrong,
            }}
          >
            {HEADLINE}
          </div>
          <div
            style={{
              marginTop: OG_SPACE.space6,
              maxWidth: OG_MEASURE.prose,
              fontSize: OG_TYPE.h2.size,
              lineHeight: OG_TYPE.h2.lineHeight,
              letterSpacing: OG_TYPE.h2.letterSpacing,
              fontWeight: OG_TYPE.h2.weight,
              // `--color-foreground-strong` is reserved for display and h1
              // (`docs/04` §3.2/§3.3); every step below it uses `--color-foreground`.
              color: OG_COLORS.foreground,
            }}
          >
            {CLAIM}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: OG_COLORS.border,
              marginBottom: OG_SPACE.space6,
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                fontSize: OG_TYPE.lead.size,
                lineHeight: OG_TYPE.lead.lineHeight,
                letterSpacing: OG_TYPE.lead.letterSpacing,
                fontWeight: OG_TYPE.lead.weight,
                color: OG_COLORS.foregroundSecondary,
              }}
            >
              {PROOF_NOUNS}
            </div>
            <div
              style={{
                fontSize: OG_TYPE.label.size,
                lineHeight: OG_TYPE.label.lineHeight,
                letterSpacing: OG_TYPE.label.letterSpacing,
                fontWeight: OG_TYPE.label.weight,
                color: OG_COLORS.foregroundMuted,
              }}
            >
              ARINZEOKIGBO.COM
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: fonts.map((font) => ({
        name: font.name,
        data: font.data,
        weight: font.weight,
        style: font.style,
      })),
    },
  );
}
