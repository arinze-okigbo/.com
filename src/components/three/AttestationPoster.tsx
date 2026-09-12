import type { CSSProperties, ReactElement } from "react";

import { BUILD_ATTESTATION } from "./attestation/build-attestation";
import {
  GRID_COLUMNS_HIGH,
  GRID_ROWS_HIGH,
  POSTER_DEPTH_BANDS,
  POSTER_HEIGHT,
  POSTER_SAMPLE_STRIDE,
  POSTER_WIDTH,
} from "./constants";
import { paletteFallbackHexes } from "./field/palette";
import { createProjector, resolvedFade, resolvedHeat } from "./lattice/project";
import { buildLattice, buildSignatureTraces } from "./lattice/seed";

/**
 * The fallback, server-rendered — and for a large share of visitors, the whole
 * experience.
 *
 * This is the resolved field at the committed seed, framed at the Act III
 * camera (`lattice/project.ts` mirrors the vertex transform), drawn as inline
 * SVG. It renders in the HTML, so it is present with JavaScript disabled, when
 * WebGL is unavailable or its context is lost, under
 * `prefers-reduced-motion: reduce`, under forced colours, and on a device below
 * the capability floor. The canvas fades in over it with `opacity` only, so it
 * costs no layout shift.
 *
 * **Re-authored 2026-09-11 as a still of the NEW staging (A8.6).** The previous
 * poster drew 248 `<circle>` elements at `fill="currentColor"` on
 * `--color-foreground-secondary`: frame ∞ of a near-invisible shader, and
 * therefore near-invisible itself, which is how the 1.44:1 failure reached the
 * accessibility path. It now renders the §3.7 field ramp as five
 * `<radialGradient>` bands, each a core-plus-halo two-stop **whose outermost
 * stop is `#d1a95400`** (A8.1, `--glow-far`), screen-blended over a
 * `--field-ink` stage so overlapping halos reinforce exactly as the additive
 * emitters do on the GPU. Dark in both themes (A8.2).
 *
 * Substituting a foreground token back into this ramp is the defect — docs/04
 * §3.5's binding instruction, and `tests/e2e/field-contrast.spec.ts` asserts it.
 */

/** Points fully outside the frame by more than this margin are dropped. */
const CULL_MARGIN = 24;

/** Minimum rendered radius, so a far point never collapses to nothing. */
const MIN_RADIUS = 0.5;

/** Maximum rendered radius, so a near point cannot swallow the frame. */
const MAX_RADIUS = 26;

/** Heat is normalised against the shader's own clamp before it is banded. */
const HEAT_CEILING = 1.35;

/** A8.1 / docs/04 §2.8 `--glow-far`. Every gold glow fades to exactly this. */
const GLOW_FAR = "#d1a95400";

const TOKENS = paletteFallbackHexes();

type Rgb = readonly [number, number, number];

function hexToRgb(hex: string): Rgb {
  const packed = Number.parseInt(hex.slice(1), 16);
  return [((packed >> 16) & 0xff) / 255, ((packed >> 8) & 0xff) / 255, (packed & 0xff) / 255];
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

function toHex(color: Rgb): string {
  const channel = (value: number): string =>
    Math.round(Math.min(Math.max(value, 0), 1) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(color[0])}${channel(color[1])}${channel(color[2])}`;
}

const COLD = hexToRgb(TOKENS.cold);
const HOT = hexToRgb(TOKENS.hot);
const CORE = hexToRgb(TOKENS.core);

/**
 * The fragment shader's tint, in TypeScript. One ramp, two consumers — the
 * A8.6 coupling that keeps the cross-fade from showing a hue shift.
 */
function rampTint(heat: number, flare: number): Rgb {
  const base = mix(COLD, HOT, smoothstep(0.02, 0.8, heat));
  const coreWeight = Math.pow(Math.min(Math.max(heat, 0), 1), 5) * (0.45 + 0.55 * flare);
  return mix(base, CORE, coreWeight);
}

function round(value: number, places: number): string {
  return value.toFixed(places).replace(/\.?0+$/, "") || "0";
}

function bandIndex(heat: number): number {
  const normalised = Math.min(Math.max(heat / HEAT_CEILING, 0), 0.999);
  return Math.floor(normalised * POSTER_DEPTH_BANDS);
}

/**
 * One `<radialGradient>` per ramp band: a tight core lobe, a wide halo, and an
 * outermost stop at `--glow-far`. This is the poster's whole compliance with
 * A8.1 — a light source, never paint.
 */
function buildGradients(): string {
  const gradients: string[] = [];
  for (let band = 0; band < POSTER_DEPTH_BANDS; band += 1) {
    const t = (band + 0.5) / POSTER_DEPTH_BANDS;
    const heat = t * HEAT_CEILING;
    const flare = t;
    const tint = toHex(rampTint(heat, flare));
    const coreOpacity = round(0.55 + 0.42 * t, 3);
    const midOpacity = round(0.16 + 0.3 * t, 3);
    gradients.push(
      `<radialGradient id="fp-b${band}">` +
        `<stop offset="0" stop-color="${tint}" stop-opacity="${coreOpacity}"/>` +
        `<stop offset="0.26" stop-color="${tint}" stop-opacity="${midOpacity}"/>` +
        `<stop offset="1" stop-color="${GLOW_FAR}"/>` +
        `</radialGradient>`,
    );
  }
  return gradients.join("");
}

interface PosterGeometry {
  /** `[heatBand][depthBand]` → circle markup. */
  readonly circles: string[][];
  readonly traces: readonly string[];
  readonly contours: readonly string[];
}

function buildGeometry(): PosterGeometry {
  const grid = { columns: GRID_COLUMNS_HIGH, rows: GRID_ROWS_HIGH };
  const geometry = buildLattice(BUILD_ATTESTATION.signature, grid);
  // Flares the lattice points the traces run through, exactly as the scene does.
  buildSignatureTraces(geometry, BUILD_ATTESTATION.signature);

  const projector = createProjector(POSTER_WIDTH, POSTER_HEIGHT);
  const circles: string[][] = Array.from({ length: POSTER_DEPTH_BANDS }, () =>
    Array.from({ length: POSTER_DEPTH_BANDS }, () => ""),
  );

  for (let row = 0; row < grid.rows; row += POSTER_SAMPLE_STRIDE) {
    for (let column = 0; column < grid.columns; column += POSTER_SAMPLE_STRIDE) {
      const index = row * grid.columns + column;
      const offset3 = index * 3;
      const point = projector.project(
        geometry.lattice[offset3],
        geometry.lattice[offset3 + 1],
        geometry.lattice[offset3 + 2],
      );
      if (point.isBehind) continue;
      if (
        point.x < -CULL_MARGIN ||
        point.x > POSTER_WIDTH + CULL_MARGIN ||
        point.y < -CULL_MARGIN ||
        point.y > POSTER_HEIGHT + CULL_MARGIN
      ) {
        continue;
      }

      const sizeSeed = geometry.seeds[index * 2 + 1];
      const flare = geometry.flare[index];
      const radius = Math.min(
        Math.max(point.radius * projector.jitter(sizeSeed), MIN_RADIUS),
        MAX_RADIUS,
      );
      const heat = bandIndex(resolvedHeat(sizeSeed, flare));
      const depth = Math.min(Math.floor(point.depth * POSTER_DEPTH_BANDS), POSTER_DEPTH_BANDS - 1);

      circles[heat][depth] +=
        `<circle cx="${round(point.x, 1)}" cy="${round(point.y, 1)}" r="${round(radius, 2)}"/>`;
    }
  }

  const traces = buildTraces(geometry, projector);
  return { circles, traces, contours: buildContours(geometry, projector) };
}

type LatticeGeometry = ReturnType<typeof buildLattice>;
type Projector = ReturnType<typeof createProjector>;

/** The r and s polylines, snapped to the same lattice points the scene uses. */
function buildTraces(geometry: LatticeGeometry, projector: Projector): readonly string[] {
  const signature = BUILD_ATTESTATION.signature;
  const strands: readonly (readonly [number, number, number])[] = [
    [0, 32, 0.3],
    [32, 64, 0.7],
  ];
  const output: string[] = [];

  for (const [from, to, band] of strands) {
    const length = to - from;
    const points: string[] = [];
    for (let step = 0; step < length; step += 1) {
      const column = Math.min(
        geometry.columns - 1,
        Math.round((step / (length - 1)) * (geometry.columns - 1)),
      );
      const rowFraction =
        (band - 0.15 + (signature[from + step] / 255) * 0.3) * (geometry.rows - 1);
      const row = Math.max(0, Math.min(geometry.rows - 1, Math.round(rowFraction)));
      const index = row * geometry.columns + column;
      const projected = projector.project(
        geometry.lattice[index * 3],
        geometry.lattice[index * 3 + 1],
        geometry.lattice[index * 3 + 2] + 0.004,
      );
      if (projected.isBehind) continue;
      points.push(`${round(projected.x, 1)},${round(projected.y, 1)}`);
    }
    if (points.length > 1) output.push(points.join(" "));
  }
  return output;
}

/** Every eighth row, as a contour — the surface reading for the line reduction. */
function buildContours(geometry: LatticeGeometry, projector: Projector): readonly string[] {
  const output: string[] = [];
  for (let row = 0; row < geometry.rows; row += 8) {
    const points: string[] = [];
    for (let column = 0; column < geometry.columns; column += 4) {
      const index = row * geometry.columns + column;
      const projected = projector.project(
        geometry.lattice[index * 3],
        geometry.lattice[index * 3 + 1],
        geometry.lattice[index * 3 + 2],
      );
      if (projected.isBehind) continue;
      points.push(`${round(projected.x, 1)},${round(projected.y, 1)}`);
    }
    if (points.length > 1) output.push(points.join(" "));
  }
  return output;
}

/**
 * Forced colours, handled deterministically rather than by hoping a gradient
 * re-colours. The emissive field is hidden and a `currentColor` hairline
 * reduction takes its place — docs/15 §2.12.
 *
 * The rules live in the SVG's own `<style>`, not in `globals.css`: the poster
 * and the field are one artifact (A8.6) and this keeps their forced-colours
 * behaviour in the same file as the thing it governs. Nothing is declared as an
 * inline `style` attribute — that is precisely what made the previous
 * forced-colours fix unable to win the cascade.
 */
const POSTER_CSS =
  `[data-attestation-poster] [data-field-line]{display:none}` +
  `@media (forced-colors:active){` +
  `[data-attestation-poster] [data-field-glow]{display:none}` +
  `[data-attestation-poster] [data-field-line]{display:inline;color:CanvasText}` +
  // The host paints the same stage ground the poster does, so it has to be
  // neutralised in the same breath. `Canvas` is the system's own page ground.
  `[data-attestation-field]{--field-stage-ground:Canvas}}`;

function buildPosterMarkup(): string {
  const { circles, traces, contours } = buildGeometry();

  const glowBands = circles
    .map((byDepth, heat) =>
      byDepth
        .map((markup, depth) => {
          if (markup.length === 0) return "";
          const fade = resolvedFade((depth + 0.5) / POSTER_DEPTH_BANDS);
          return `<g fill="url(#fp-b${heat})" opacity="${round(fade, 3)}">${markup}</g>`;
        })
        .join(""),
    )
    .join("");

  const traceMarkup = traces
    .map(
      (points) =>
        `<polyline points="${points}" fill="none" stroke="${TOKENS.core}" stroke-opacity="0.5"` +
        ` stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");

  const contourMarkup = contours.map((points) => `<polyline points="${points}"/>`).join("");

  return (
    `<style>${POSTER_CSS}</style>` +
    `<defs>` +
    buildGradients() +
    // The horizon lift: light gathering where the lattice plane recedes. A glow,
    // fading to --glow-far, never a fill (A8.1).
    `<radialGradient id="fp-horizon" cx="0.5" cy="0.46" r="0.62">` +
    `<stop offset="0" stop-color="${TOKENS.hot}" stop-opacity="0.20"/>` +
    `<stop offset="0.45" stop-color="${TOKENS.hot}" stop-opacity="0.07"/>` +
    `<stop offset="1" stop-color="${GLOW_FAR}"/>` +
    `</radialGradient>` +
    // The baked scrim: the still's version of the composite's SDF carve, so the
    // poster composes the way a live frame does (A8.3 / A8.6).
    `<radialGradient id="fp-scrim" cx="0.36" cy="0.52" r="0.62">` +
    `<stop offset="0" stop-color="${TOKENS.ink}" stop-opacity="0.88"/>` +
    `<stop offset="0.55" stop-color="${TOKENS.ink}" stop-opacity="0.45"/>` +
    `<stop offset="1" stop-color="${TOKENS.ink}" stop-opacity="0"/>` +
    `</radialGradient>` +
    `<radialGradient id="fp-vignette" cx="0.5" cy="0.5" r="0.78">` +
    `<stop offset="0.3" stop-color="${TOKENS.ink}" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="${TOKENS.ink}" stop-opacity="0.72"/>` +
    `</radialGradient>` +
    // The blueprint grid, baked at the same 96px rhythm the CSS layer uses.
    `<pattern id="fp-grid" width="96" height="96" patternUnits="userSpaceOnUse">` +
    `<path d="M96 0H0v96" fill="none" stroke="#ffffff" stroke-opacity="0.055" stroke-width="1"/>` +
    `</pattern>` +
    `<radialGradient id="fp-gridfade" cx="0.5" cy="0.46" r="0.62">` +
    `<stop offset="0.2" stop-color="#ffffff"/>` +
    `<stop offset="1" stop-color="#000000"/>` +
    `</radialGradient>` +
    `<mask id="fp-gridmask">` +
    `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="url(#fp-gridfade)"/>` +
    `</mask>` +
    `</defs>` +
    // EVERY author-coloured layer lives inside `data-field-glow`, the stage
    // ground included. Under forced colours the whole group is hidden and the
    // `currentColor` line reduction below takes over on the system Canvas —
    // which is the point of the two-group split. Leaving the `--field-ink` rect
    // outside it left a near-black author ground under a forced palette, where
    // the only thing keeping the type readable was the UA's own text
    // backplates. That is luck, not a design.
    `<g data-field-glow>` +
    `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="${TOKENS.ink}"/>` +
    `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="url(#fp-horizon)"/>` +
    `<g style="mix-blend-mode:screen">${glowBands}${traceMarkup}</g>` +
    `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="url(#fp-grid)" mask="url(#fp-gridmask)"/>` +
    `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="url(#fp-scrim)"/>` +
    `<rect width="${POSTER_WIDTH}" height="${POSTER_HEIGHT}" fill="url(#fp-vignette)"/>` +
    `</g>` +
    `<g data-field-line fill="none" stroke="currentColor" stroke-width="1" opacity="0.85">` +
    contourMarkup +
    traces.map((points) => `<polyline points="${points}" stroke-width="2"/>`).join("") +
    `</g>`
  );
}

/**
 * Built once, at module evaluation, from committed bytes. No user input reaches
 * this string, so the `dangerouslySetInnerHTML` below carries no injection
 * surface; it exists only to keep several hundred `<circle>` elements out of
 * the React tree and the flight payload.
 */
const POSTER_MARKUP = buildPosterMarkup();

const POSTER_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  display: "block",
  // NO `color` HERE — DELIBERATELY. An inline style attribute beats any
  // stylesheet declaration without `!important`, media query or not, so a
  // `color` here would make the forced-colours rule above unable to ever win.
  // The line reduction inherits `color` from the document instead.
  //
  // The live canvas draws the same field at full resolution, so the poster
  // cross-fades out underneath it rather than showing through as a second,
  // coarser field. Opacity only, so this contributes no layout shift.
  transition:
    "opacity var(--duration-reveal, 280ms) var(--ease-entrance, cubic-bezier(0, 0, 0.2, 1))",
};

export interface AttestationPosterProps {
  /** Describes the resolved end state. docs/05 §3.3 fixes the wording. */
  readonly alt: string;
}

export function AttestationPoster({ alt }: AttestationPosterProps): ReactElement {
  return (
    <svg
      viewBox={`0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={alt}
      data-attestation-poster=""
      style={POSTER_STYLE}
      dangerouslySetInnerHTML={{ __html: POSTER_MARKUP }}
    />
  );
}
