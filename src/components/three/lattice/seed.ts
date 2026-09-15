import {
  GRID_COLUMNS_HIGH,
  GRID_COLUMNS_LOW,
  GRID_COLUMNS_MID,
  GRID_ROWS_HIGH,
  GRID_ROWS_LOW,
  GRID_ROWS_MID,
  HIGH_DENSITY_CORE_THRESHOLD,
  HIGH_DENSITY_MEMORY_GB,
  LATTICE_HALF_HEIGHT,
  LATTICE_HALF_WIDTH,
  MID_DENSITY_CORE_THRESHOLD,
  NOISE_HALF_DEPTH,
  NOISE_HALF_HEIGHT,
  NOISE_HALF_WIDTH,
} from "../constants";

/**
 * Turns signature bytes into geometry.
 *
 * Pure and deterministic: the same bytes always produce the same lattice. This
 * is what lets the server-rendered poster and the WebGL scene be the same
 * structure rather than two artifacts that can drift (docs/02 §9, now binding
 * as A8.6).
 */

const TAU = Math.PI * 2;

export interface LatticeGrid {
  readonly columns: number;
  readonly rows: number;
}

export interface LatticeGeometry {
  /** Number of points. Equals `grid.columns * grid.rows`. */
  readonly count: number;
  readonly columns: number;
  readonly rows: number;
  /** Unresolved entropy positions, `count * 3` floats. */
  readonly noise: Float32Array;
  /** Resolved ordered positions, `count * 3` floats. */
  readonly lattice: Float32Array;
  /** Per-point `[stagger, sizeJitter]` in 0..1, `count * 2` floats. */
  readonly seeds: Float32Array;
  /**
   * Per-point heat bias in 0..1, read straight out of the signature, `count`
   * floats. This is what makes "every point has a coordinate that came out of
   * that signature" visibly true rather than merely asserted: a different
   * signature gives a different pattern of hotter and colder regions.
   */
  readonly flare: Float32Array;
}

export interface DeviceProfile {
  readonly cores: number | undefined;
  readonly memoryGb: number | undefined;
}

/**
 * Picks a density the device can sustain. Tiering is by capability, not by
 * viewport: fillrate is the only real constraint, and the cost of a point is
 * its halo area, not its vertex.
 */
export function resolveGrid(profile: DeviceProfile): LatticeGrid {
  const cores = profile.cores ?? 0;
  const memoryGb = profile.memoryGb ?? HIGH_DENSITY_MEMORY_GB;
  if (cores >= HIGH_DENSITY_CORE_THRESHOLD && memoryGb >= HIGH_DENSITY_MEMORY_GB) {
    return { columns: GRID_COLUMNS_HIGH, rows: GRID_ROWS_HIGH };
  }
  if (cores >= MID_DENSITY_CORE_THRESHOLD) {
    return { columns: GRID_COLUMNS_MID, rows: GRID_ROWS_MID };
  }
  return { columns: GRID_COLUMNS_LOW, rows: GRID_ROWS_LOW };
}

/** Mulberry32 — 4 lines, uniform enough, and identical on every platform. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a over the signature, so every byte reaches the PRNG stream. */
function hashBytes(bytes: Uint8Array): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** The shape of the resolved surface, read directly out of the signature. */
interface SurfaceParameters {
  readonly frequencyX: number;
  readonly frequencyY: number;
  readonly phaseX: number;
  readonly phaseY: number;
  readonly amplitudePrimary: number;
  readonly amplitudeSecondary: number;
  readonly diagonalFrequency: number;
  readonly diagonalPhase: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly rotation: number;
}

function readSurfaceParameters(signature: Uint8Array): SurfaceParameters {
  const at = (index: number): number => signature[index % signature.length] / 255;
  return {
    frequencyX: 1.4 + at(0) * 2.6,
    frequencyY: 1.1 + at(1) * 2.2,
    phaseX: at(2) * TAU,
    phaseY: at(3) * TAU,
    amplitudePrimary: 0.12 + at(4) * 0.2,
    amplitudeSecondary: 0.05 + at(5) * 0.13,
    diagonalFrequency: 0.6 + at(6) * 1.8,
    diagonalPhase: at(7) * TAU,
    tiltX: (at(8) - 0.5) * 0.36,
    tiltY: (at(9) - 0.5) * 0.24,
    rotation: (at(10) - 0.5) * 0.18,
  };
}

function surfaceHeight(x: number, y: number, p: SurfaceParameters): number {
  const primary = Math.sin(x * p.frequencyX + p.phaseX) * Math.cos(y * p.frequencyY + p.phaseY);
  const diagonal = Math.sin((x + y) * p.diagonalFrequency + p.diagonalPhase);
  return primary * p.amplitudePrimary + diagonal * p.amplitudeSecondary + x * p.tiltX + y * p.tiltY;
}

/** Signature-derived heat bias for one grid cell. */
const FLARE_BASE = 0.3;
const FLARE_SPAN = 0.7;

/**
 * Builds both states of the field from a signature.
 *
 * @throws {RangeError} when the signature is empty or the grid is degenerate.
 */
export function buildLattice(signature: Uint8Array, grid: LatticeGrid): LatticeGeometry {
  if (signature.length === 0) {
    throw new RangeError("buildLattice requires a non-empty signature");
  }
  if (grid.columns < 2 || grid.rows < 2) {
    throw new RangeError("buildLattice requires a grid of at least 2x2");
  }

  const count = grid.columns * grid.rows;
  const noise = new Float32Array(count * 3);
  const lattice = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 2);
  const flare = new Float32Array(count);

  const parameters = readSurfaceParameters(signature);
  const random = createRandom(hashBytes(signature));
  const cosRotation = Math.cos(parameters.rotation);
  const sinRotation = Math.sin(parameters.rotation);

  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const index = row * grid.columns + column;
      const offset3 = index * 3;
      const offset2 = index * 2;

      const u = column / (grid.columns - 1) - 0.5;
      const v = row / (grid.rows - 1) - 0.5;
      const gridX = u * 2 * LATTICE_HALF_WIDTH;
      const gridY = v * 2 * LATTICE_HALF_HEIGHT;

      lattice[offset3] = gridX * cosRotation - gridY * sinRotation;
      lattice[offset3 + 1] = gridX * sinRotation + gridY * cosRotation;
      lattice[offset3 + 2] = surfaceHeight(gridX, gridY, parameters);

      noise[offset3] = (random() * 2 - 1) * NOISE_HALF_WIDTH;
      noise[offset3 + 1] = (random() * 2 - 1) * NOISE_HALF_HEIGHT;
      noise[offset3 + 2] = (random() * 2 - 1) * NOISE_HALF_DEPTH;

      seeds[offset2] = random();
      seeds[offset2 + 1] = random();

      const byte = signature[(column * 7 + row * 13) % signature.length] / 255;
      flare[index] = FLARE_BASE + FLARE_SPAN * byte;
    }
  }

  return { count, columns: grid.columns, rows: grid.rows, noise, lattice, seeds, flare };
}

export interface SignatureTraces {
  /** Line-list vertices, `count * 3` floats. */
  readonly position: Float32Array;
  /** Per-vertex reveal parameter in 0..1, `count` floats. */
  readonly progress: Float32Array;
  /** Vertex count. Two per segment. */
  readonly count: number;
}

/** `[firstByte, lastByte, rowBandCentre]` — r is bytes 0–31, s is 32–63. */
const TRACE_STRANDS: readonly (readonly [number, number, number])[] = [
  [0, 32, 0.3],
  [32, 64, 0.7],
];

/** How far either side of its band centre a strand may wander, in rows. */
const TRACE_BAND_SPREAD = 0.3;

/** Lift above the surface, so a trace is never z-fighting its own points. */
const TRACE_LIFT = 0.004;

/** Heat written into the lattice where a trace passes, and beside it. */
const TRACE_FLARE_ON = 1.0;
const TRACE_FLARE_NEIGHBOUR = 0.9;

/**
 * Draws `r` and `s` as figures in the field.
 *
 * Each 32-byte half becomes a 32-vertex polyline whose row index is the byte
 * value, snapped to real lattice points so the traces lie on the resolved
 * surface. The points a trace passes through are flared hot, and so are their
 * four neighbours, so the trace reads as a lit seam rather than a hairline.
 *
 * **This mutates `geometry.flare` in place, deliberately and by contract.** The
 * flare buffer is a GPU upload source owned by the caller, and copying a
 * Float32Array per build to preserve a value nobody reads would be a cost with
 * no reader. The caller builds the lattice, calls this once, then uploads.
 *
 * @throws {RangeError} when the signature is shorter than the strands it names.
 */
export function buildSignatureTraces(
  geometry: LatticeGeometry,
  signature: Uint8Array,
): SignatureTraces {
  const required = TRACE_STRANDS[TRACE_STRANDS.length - 1][1];
  if (signature.length < required) {
    throw new RangeError(`buildSignatureTraces requires at least ${required} signature bytes`);
  }

  const { columns, rows, lattice, flare } = geometry;
  const positions: number[] = [];
  const progress: number[] = [];

  for (const [from, to, band] of TRACE_STRANDS) {
    const length = to - from;
    let previous: readonly [number, number, number] | null = null;

    for (let step = 0; step < length; step += 1) {
      const column = Math.min(columns - 1, Math.round((step / (length - 1)) * (columns - 1)));
      const rowFraction =
        (band - TRACE_BAND_SPREAD * 0.5 + (signature[from + step] / 255) * TRACE_BAND_SPREAD) *
        (rows - 1);
      const row = Math.max(0, Math.min(rows - 1, Math.round(rowFraction)));
      const index = row * columns + column;

      flare[index] = TRACE_FLARE_ON;
      for (const neighbour of [index - 1, index + 1, index - columns, index + columns]) {
        if (neighbour < 0 || neighbour >= flare.length) continue;
        flare[neighbour] = Math.max(flare[neighbour], TRACE_FLARE_NEIGHBOUR);
      }

      const current: readonly [number, number, number] = [
        lattice[index * 3],
        lattice[index * 3 + 1],
        lattice[index * 3 + 2] + TRACE_LIFT,
      ];

      if (previous) {
        positions.push(previous[0], previous[1], previous[2], current[0], current[1], current[2]);
        const t = step / length;
        progress.push(t, t);
      }
      previous = current;
    }
  }

  return {
    position: Float32Array.from(positions),
    progress: Float32Array.from(progress),
    count: progress.length,
  };
}
