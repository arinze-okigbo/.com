/**
 * Tuning constants for the attestation field.
 *
 * Visual values are references to docs/04 design tokens; the numbers here are
 * geometry, camera and performance tuning, which docs/04 §8.4 explicitly leaves
 * to this module ("this document owns only the frame, the poster, the readout
 * type, and the gates").
 *
 * COLOUR LIVES IN `field/palette.ts`, NOT HERE. docs/04 §3.5 row A8 and
 * conditions A8.1–A8.6 [DEV-13] license this surface as emitted light on the
 * §3.7 `--field-*` ramp — cold slate, gold, hot core — over a `--field-ink`
 * stage that is dark in both themes.
 *
 * The `FIGURE_FALLBACK_DARK` / `FIGURE_FALLBACK_LIGHT` greys that used to live
 * here, and the nine-line comment defending them, are deleted by the DEV-13
 * amendment. They were a correct reading of the pre-amendment document and are
 * a wrong reading of this one: they shipped the lattice at 1.44:1. docs/04 §3.5
 * and §13 now state that substituting a foreground token back into the field
 * ramp is itself the defect. Do not reintroduce a grey value in this module.
 */

/** docs/04 §4 `--ease-glide` — the one authored moment on the site. */
export const EASE_GLIDE: readonly [number, number, number, number] = [0.32, 0.72, 0, 1];

/**
 * docs/02 §8.3 — hard cap so mid-tier Android never renders at 3x.
 * docs/15 §2.7: the blur ladder is fillrate-quadratic in DPR, so a bloom-enabled
 * device takes the tighter cap.
 */
export const DPR_MAX = 1.5;
export const DPR_MAX_WITH_BLOOM = 1.25;

/** Poster viewBox. Full-bleed now (A8 / docs/15 §2.2), sized to a 16:10 stage. */
export const POSTER_WIDTH = 1440;
export const POSTER_HEIGHT = 900;

/**
 * Perspective camera, at the Act III framing the poster is a still of.
 * Shared by the GL scene and the poster's projection so the two cannot drift
 * (A8.6).
 */
export const CAMERA_FOV_DEGREES = 32;
export const CAMERA_DISTANCE = 3.4;
export const CAMERA_HEIGHT = 0.86;
export const FIELD_TILT_X = -1.41;

/**
 * World-space half-extents of the resolved lattice. Widened from 1.95 x 1.22
 * (docs/15 §2.7) because the plane is now tilted into depth and must bleed past
 * all four edges of a 1440x900 viewport rather than float inside a box.
 */
export const LATTICE_HALF_WIDTH = 2.85;
export const LATTICE_HALF_HEIGHT = 2.05;

/** World-space half-extents of the unresolved entropy cloud. */
export const NOISE_HALF_WIDTH = 3.2;
export const NOISE_HALF_HEIGHT = 2.3;
export const NOISE_HALF_DEPTH = 1.35;

/** World-space radius of a single point at unit distance. Depth-scaled 2.1x → 0.5x. */
export const POINT_SIZE = 0.0168;

/** Depth band the fade, the sprite mix and the poster's five bands share. */
export const DEPTH_NEAR = 1.35;
export const DEPTH_RANGE = 4.35;

/**
 * Density tiers, 4–7x the shipped 48x28 = 1,344 (docs/15 §2.7). One instanced
 * draw call at every tier, so the cost is fillrate, not draw count.
 */
export const GRID_COLUMNS_HIGH = 164;
export const GRID_ROWS_HIGH = 92;
export const GRID_COLUMNS_MID = 112;
export const GRID_ROWS_MID = 62;
export const GRID_COLUMNS_LOW = 72;
export const GRID_ROWS_LOW = 40;

/** Capability thresholds for the density tiers. docs/15 §2.7. */
export const HIGH_DENSITY_CORE_THRESHOLD = 8;
export const HIGH_DENSITY_MEMORY_GB = 8;
export const MID_DENSITY_CORE_THRESHOLD = 4;

/**
 * The poster draws every Nth column and every Nth row — a coarser sub-grid, not
 * every Nth point. Sampling by flat index aliases against the column count and
 * collapses the lattice into stripes. Raised 2 → 5 to hold the poster near its
 * ~9 kB gz cap at the new density (docs/15 §2.12).
 */
export const POSTER_SAMPLE_STRIDE = 5;

/** Depth bands, one per `<radialGradient>` on the poster. docs/15 §2.12. */
export const POSTER_DEPTH_BANDS = 5;

/** docs/02 §8.2 gate thresholds. */
export const MIN_CORES = 4;
export const MIN_MEMORY_GB = 4;

/** Idle-callback timeout (ms) before the scene is allowed to load anyway. */
export const IDLE_TIMEOUT_MS = 2500;

/** IntersectionObserver margin — start loading just before the field is needed. */
export const APPROACH_ROOT_MARGIN = "200px";

/** Blur ladder radii, in texels, alternating horizontal / vertical. docs/15 §2.6. */
export const BLUR_RADII: readonly number[] = [1.0, 1.9, 3.1, 4.6, 6.5, 9.0];

/** Bright-pass threshold feeding the blur ladder. */
export const BLOOM_THRESHOLD = 0.3;

/** How much of the blurred bright pass the composite adds back. */
export const BLOOM_STRENGTH = 1.35;

/**
 * The device pixel ratio the blur ladder's radii are authored against.
 *
 * `scratchpad/proto-c-field.html` caps its renderer at 1.6 and its ladder is
 * tuned at that ratio; this module caps a bloom-enabled device at 1.25, because
 * the ladder is fillrate-quadratic in DPR. Left unscaled, the same texel radii
 * therefore cover a WIDER fraction of the frame here than in the prototype --
 * measured 1.0% against 0.78% for the widest rung on a retina panel -- which is
 * the whole of the reported "ours spreads light wider" symptom. It is invisible
 * at `devicePixelRatio` 1, which is why a screenshot at 1 could never find it.
 *
 * `field/post-chain.ts` scales the radii by `dpr / BLOOM_REFERENCE_DPR` so the
 * band is a fixed fraction of the frame on every display, and the same fraction
 * the prototype was art-directed at. The DPR cap itself is unchanged, so no
 * device renders a single extra pixel.
 */
export const BLOOM_REFERENCE_DPR = 1.6;

/** Scale of the bloom render targets relative to the scene target. */
export const BLOOM_TARGET_SCALE = 0.5;

/**
 * Scrim slots packed into the composite pass. docs/15 §2.10.
 *
 * Raised 6 -> 8, and only because the measurement finally said so.
 * `tests/e2e/field-contrast.spec.ts` names this as the remedy and puts a
 * condition on it: *"If this fails, the six slots are genuinely too few and
 * SCRIM_SLOTS must rise — do not dim the field and do not re-tone the ramp."*
 *
 * It failed. Once the hero staged a RESOLVED lattice rather than an entropy
 * cloud (`runtime/scroll.ts`, `RESOLVE_FLOOR`), the field behind the first
 * screenful got genuinely bright, and at scrollY 0 there are nine candidate
 * blocks for six slots — five in the hero, the readout, and `#work`'s heading
 * group arriving at the fold. `#work`'s h2 lost its slot and measured
 * **1.77:1** against a large-text floor of 3, on a composited pixel of
 * rgb(186,182,170): not a weak carve, no carve at all.
 *
 * Cost is two more rounded-box SDFs per pixel, full-screen, against R5's
 * integrated-graphics risk. That is real and it is why the number was 6 for as
 * long as the evidence allowed; it is now bought with a measurement rather
 * than with a guess.
 */
export const SCRIM_SLOTS = 8;

/** Feather width of the rounded-box scrim SDF, in uv units of the short axis. */
export const SCRIM_FEATHER = 0.085;

/** The CustomEvent the ceremony dispatches on a verified signature. docs/15 §6. */
export const FLARE_EVENT = "field:flare";

/**
 * Sprite shaping, shared by the vertex shader and by `lattice/project.ts` so the
 * poster is the same artifact as the canvas (A8.6). Changing one without the
 * other is the divergence the cross-fade makes visible.
 */
export const POINT_SIZE_NEAR_SCALE = 2.1;
export const POINT_SIZE_FAR_SCALE = 0.5;
export const SIZE_JITTER_BASE = 0.6;
export const SIZE_JITTER_SPAN = 0.8;

/** How much of the resolve range is spent staggering points in. */
export const STAGGER_SPAN = 0.46;

/** World-space amplitude of the pre-resolve drift. Damps to zero as it orders. */
export const DRIFT_AMPLITUDE = 0.085;

/**
 * The deterministic fraction of points that never leaves the entropy cloud, so
 * the space above the resolved plane is a volume rather than a void. docs/15
 * §2.8 — `step(HOLD_THRESHOLD, …)` over a fixed seed mix, about 6.6%.
 */
export const HOLD_THRESHOLD = 0.934;

/** Fraction of the resolve spent revealing the r/s traces, at the end. */
export const TRACE_REVEAL_SPAN = 0.34;
