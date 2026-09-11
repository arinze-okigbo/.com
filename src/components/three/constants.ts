/**
 * Tuning constants for the attestation lattice.
 *
 * Visual values are references to docs/04 design tokens; the numbers here are
 * geometry, camera and performance tuning, which docs/04 §8.4 explicitly leaves
 * to this module ("this document owns only the frame, the poster, the readout
 * type, and the gates").
 */

/**
 * sRGB fallbacks for `--color-foreground-secondary`, from docs/04 §3.2 / §3.3.
 * Used ONLY when the CSS custom property cannot be read (e.g. the stylesheet
 * has not applied yet). The live token is always preferred — `runtime/color.ts`.
 *
 * The point field is NOT accent. docs/04 §3.5's A1–A7 allowlist is exhaustive
 * and a gold field is not on it; docs/05 §1056 says the `verified` glyph is the
 * only accent permitted in this figure. Filling an 830x466 region with
 * `--color-accent` also made the figure the largest accent mass on the page,
 * defeating F9 and the R-GOLD-1 attention-router argument. The readout marker
 * in `AttestationReadout` keeps the accent; nothing else here may.
 */
export const FIGURE_FALLBACK_DARK = "#A8A8A8";
export const FIGURE_FALLBACK_LIGHT = "#5C5C5C";

/** docs/04 §4 `--ease-glide` — the one authored moment on the site. */
export const EASE_GLIDE: readonly [number, number, number, number] = [0.32, 0.72, 0, 1];

/** docs/02 §8.3 — hard cap so mid-tier Android never renders at 3x. */
export const DPR_MAX = 1.5;

/** docs/04 §8.4 — the frame is a fixed 16/9 box. */
export const FRAME_ASPECT_RATIO = "16 / 9";

/** Poster viewBox, sized to `--container-wide` (768px) at 16/9. */
export const POSTER_WIDTH = 768;
export const POSTER_HEIGHT = 432;

/** Perspective camera. Shared by the GL scene and the poster's projection. */
export const CAMERA_FOV_DEGREES = 32;
export const CAMERA_DISTANCE = 3.4;

/**
 * World-space half-extents of the resolved lattice. Deliberately larger than the
 * frame's visible area (1.73 x 0.98 world units at this camera) so the field
 * bleeds past all four edges instead of floating inside them with corner gaps.
 */
export const LATTICE_HALF_WIDTH = 1.95;
export const LATTICE_HALF_HEIGHT = 1.22;

/** World-space half-extents of the unresolved entropy cloud. */
export const NOISE_HALF_WIDTH = 2.6;
export const NOISE_HALF_HEIGHT = 1.7;
export const NOISE_HALF_DEPTH = 1.15;

/** World-space radius of a single point at unit distance. */
export const POINT_SIZE = 0.0135;

/** Grid used by the full-density scene, and by the poster. */
export const GRID_COLUMNS_HIGH = 48;
export const GRID_ROWS_HIGH = 28;

/** Grid used when `hardwareConcurrency` says the device is mid-tier. */
export const GRID_COLUMNS_LOW = 32;
export const GRID_ROWS_LOW = 19;

/** Cores at or above which the high-density grid is used. */
export const HIGH_DENSITY_CORE_THRESHOLD = 8;

/**
 * The poster draws every Nth column and every Nth row — a coarser sub-grid, not
 * every Nth point. Sampling by flat index aliases against the column count and
 * collapses the lattice into stripes.
 */
export const POSTER_SAMPLE_STRIDE = 2;

/** Depth bands the poster groups points into, so shared attributes hoist to <g>. */
export const POSTER_DEPTH_BANDS = 5;

/** docs/02 §8.2 gate thresholds. */
export const MIN_CORES = 4;
export const MIN_MEMORY_GB = 4;

/** Idle-callback timeout (ms) before the scene is allowed to load anyway. */
export const IDLE_TIMEOUT_MS = 2500;

/** IntersectionObserver margin — start loading just before the figure is needed. */
export const APPROACH_ROOT_MARGIN = "200px";
