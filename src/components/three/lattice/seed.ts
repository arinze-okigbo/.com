import {
  GRID_COLUMNS_HIGH,
  GRID_COLUMNS_LOW,
  GRID_ROWS_HIGH,
  GRID_ROWS_LOW,
  HIGH_DENSITY_CORE_THRESHOLD,
  LATTICE_HALF_HEIGHT,
  LATTICE_HALF_WIDTH,
  NOISE_HALF_DEPTH,
  NOISE_HALF_HEIGHT,
  NOISE_HALF_WIDTH,
} from "../constants";

/**
 * Turns signature bytes into geometry.
 *
 * Pure and deterministic: the same bytes always produce the same lattice. This
 * is what lets the server-rendered poster and the WebGL scene be the same
 * structure rather than two artifacts that can drift (docs/02 §9).
 */

const TAU = Math.PI * 2;

export interface LatticeGrid {
  readonly columns: number;
  readonly rows: number;
}

export interface LatticeGeometry {
  /** Number of points. Equals `grid.columns * grid.rows`. */
  readonly count: number;
  /** Unresolved entropy positions, `count * 3` floats. */
  readonly noise: Float32Array;
  /** Resolved ordered positions, `count * 3` floats. */
  readonly lattice: Float32Array;
  /** Per-point `[stagger, sizeJitter]` in 0..1, `count * 2` floats. */
  readonly seeds: Float32Array;
}

/** Picks a grid density the device can sustain. */
export function resolveGrid(coreCount: number | undefined): LatticeGrid {
  const cores = coreCount ?? 0;
  return cores >= HIGH_DENSITY_CORE_THRESHOLD
    ? { columns: GRID_COLUMNS_HIGH, rows: GRID_ROWS_HIGH }
    : { columns: GRID_COLUMNS_LOW, rows: GRID_ROWS_LOW };
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
    }
  }

  return { count, noise, lattice, seeds };
}
