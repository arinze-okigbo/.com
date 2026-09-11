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
import { createProjector } from "./lattice/project";
import { buildLattice } from "./lattice/seed";
import { DEPTH_FADE_FLOOR, SIZE_JITTER_BASE, SIZE_JITTER_SPAN } from "./lattice/shaders";

/**
 * The fallback, server-rendered.
 *
 * This is the resolved lattice at the committed seed, projected with the same
 * camera the shader uses (`lattice/project.ts` mirrors the vertex shader), drawn
 * as inline SVG. It renders in the HTML, so it is present with JavaScript
 * disabled, when WebGL is unavailable or its context is lost, under
 * `prefers-reduced-motion: reduce`, and on a device below the capability floor.
 * The canvas fades in over it with `opacity` only, so it costs no layout shift.
 *
 * It is inline SVG rather than the AVIF of docs/04 §8.4 because this figure is
 * no longer the LCP element (it moved to screenful 3, BUILD-PLAN 6). Generating
 * it from the same lattice function the shader consumes removes the poster/canvas
 * divergence risk flagged in docs/02 §9, costs no extra request, and carries the
 * accent token through `currentColor` so one artifact is correct in both modes.
 */

/** Points fully outside the frame by more than this margin are dropped. */
const CULL_MARGIN = 8;

/** Minimum rendered radius, so a far point never collapses to nothing. */
const MIN_RADIUS = 0.35;

interface PosterBand {
  readonly opacity: number;
  readonly circles: string[];
}

function round(value: number, places: number): string {
  return value.toFixed(places).replace(/\.?0+$/, "") || "0";
}

function buildPosterMarkup(): string {
  const grid = { columns: GRID_COLUMNS_HIGH, rows: GRID_ROWS_HIGH };
  const geometry = buildLattice(BUILD_ATTESTATION.signature, grid);
  const project = createProjector(POSTER_WIDTH, POSTER_HEIGHT);

  const bands: PosterBand[] = Array.from({ length: POSTER_DEPTH_BANDS }, (_unused, index) => ({
    // Band centre, mapped through the same depth fade the fragment shader applies.
    opacity: 1 + (DEPTH_FADE_FLOOR - 1) * ((index + 0.5) / POSTER_DEPTH_BANDS),
    circles: [],
  }));

  for (let row = 0; row < grid.rows; row += POSTER_SAMPLE_STRIDE) {
    for (let column = 0; column < grid.columns; column += POSTER_SAMPLE_STRIDE) {
      const index = row * grid.columns + column;
      const offset3 = index * 3;
      const point = project(
        geometry.lattice[offset3],
        geometry.lattice[offset3 + 1],
        geometry.lattice[offset3 + 2],
      );

      if (
        point.x < -CULL_MARGIN ||
        point.x > POSTER_WIDTH + CULL_MARGIN ||
        point.y < -CULL_MARGIN ||
        point.y > POSTER_HEIGHT + CULL_MARGIN
      ) {
        continue;
      }

      const jitter = SIZE_JITTER_BASE + SIZE_JITTER_SPAN * geometry.seeds[index * 2 + 1];
      const radius = Math.max(point.radius * jitter, MIN_RADIUS);
      const band = Math.min(Math.floor(point.depth * POSTER_DEPTH_BANDS), POSTER_DEPTH_BANDS - 1);

      bands[band].circles.push(
        `<circle cx="${round(point.x, 1)}" cy="${round(point.y, 1)}" r="${round(radius, 2)}"/>`,
      );
    }
  }

  return bands
    .filter((band) => band.circles.length > 0)
    .map((band) => `<g opacity="${round(band.opacity, 3)}">${band.circles.join("")}</g>`)
    .join("");
}

/**
 * Built once, at module evaluation, from committed bytes. No user input reaches
 * this string, so the `dangerouslySetInnerHTML` below carries no injection
 * surface; it exists only to keep several hundred `<circle>` elements out of the
 * React tree and the flight payload.
 */
const POSTER_MARKUP = buildPosterMarkup();

const POSTER_STYLE: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  // NO `color` HERE — DELIBERATELY. It moved to `[data-attestation-poster]` in
  // globals.css §8.
  //
  // An inline style attribute beats any stylesheet declaration without
  // `!important`, media query or not, so while `color` lived here the
  // `@media (forced-colors: active) { [data-attestation-poster] { color:
  // CanvasText } }` rule in §11 could never win. It was measured computing
  // rgb(92,92,92) under forced colours where CanvasText resolves to
  // rgb(0,0,0) — a fix that had never applied to a single render
  // (docs/08-review-accessibility-c2 N3). The token, the F4 reasoning and the
  // `currentColor` mechanism are unchanged; only the declaration's home moved,
  // so the forced-colours override can win by ordinary cascade instead of by an
  // `!important` arms race.
  display: "block",
  // The live canvas draws the same lattice at full resolution, so the poster
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
      fill="currentColor"
      data-attestation-poster=""
      style={POSTER_STYLE}
      dangerouslySetInnerHTML={{ __html: POSTER_MARKUP }}
    />
  );
}
