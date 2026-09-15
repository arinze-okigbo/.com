import {
  CAMERA_DISTANCE,
  CAMERA_FOV_DEGREES,
  CAMERA_HEIGHT,
  DEPTH_NEAR,
  DEPTH_RANGE,
  FIELD_TILT_X,
  POINT_SIZE,
  POINT_SIZE_FAR_SCALE,
  POINT_SIZE_NEAR_SCALE,
  SIZE_JITTER_BASE,
  SIZE_JITTER_SPAN,
} from "../constants";

/**
 * The same transform the vertex shader performs, in JavaScript.
 *
 * The poster is rendered on the server from this function and the field is
 * rendered on the GPU from the shader; keeping one camera definition in
 * `constants.ts` and mirroring the arithmetic here is what stops the two from
 * diverging visually when the canvas fades in over the poster. A8.6 makes that
 * binding rather than merely advisable.
 *
 * Framed at the **Act III camera** — the `attestation` attention state, fully
 * resolved — which is the moment the still is a still *of*.
 */

export interface ProjectedPoint {
  /** Horizontal position in poster units. */
  readonly x: number;
  /** Vertical position in poster units. */
  readonly y: number;
  /** Halo radius in poster units. The core lobe sits inside it. */
  readonly radius: number;
  /** 0 at the near plane, 1 at the far edge of the field. */
  readonly depth: number;
  /** True when the point is behind the camera and must be dropped. */
  readonly isBehind: boolean;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

/** Act III dolly and yaw, from `field/attention.ts`'s `attestation` state. */
const ACT_III_DOLLY = 0.3;
const ACT_III_YAW = 0.11;

/** Clamps the divisor so a point at or behind the camera cannot produce NaN. */
const MIN_VIEW_DEPTH = 0.05;

type Vector3 = readonly [number, number, number];

function subtract(a: Vector3, b: Vector3): Vector3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a: Vector3, b: Vector3): Vector3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

function dot(a: Vector3, b: Vector3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function normalize(v: Vector3): Vector3 {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

export interface Projector {
  readonly project: (x: number, y: number, z: number) => ProjectedPoint;
  /** Sprite radius multiplier for a point's own size jitter seed. */
  readonly jitter: (sizeSeed: number) => number;
}

export function createProjector(viewportWidth: number, viewportHeight: number): Projector {
  const focalLength = 1 / Math.tan((CAMERA_FOV_DEGREES * DEGREES_TO_RADIANS) / 2);
  const aspect = viewportWidth / viewportHeight;
  const halfWidth = viewportWidth / 2;
  const halfHeight = viewportHeight / 2;

  // The field's own transform: tilt about x, then yaw about y (OGL's `YXZ`).
  const cosTilt = Math.cos(FIELD_TILT_X);
  const sinTilt = Math.sin(FIELD_TILT_X);
  const cosYaw = Math.cos(ACT_III_YAW);
  const sinYaw = Math.sin(ACT_III_YAW);

  // The camera, at the Act III framing.
  const eye: Vector3 = [0, CAMERA_HEIGHT, CAMERA_DISTANCE - ACT_III_DOLLY * 0.72];
  const target: Vector3 = [0, CAMERA_HEIGHT * 0.42, 0];
  const zAxis = normalize(subtract(eye, target));
  const xAxis = normalize(cross([0, 1, 0], zAxis));
  const yAxis = cross(zAxis, xAxis);

  const project = (x: number, y: number, z: number): ProjectedPoint => {
    // rotateX
    const ty = y * cosTilt - z * sinTilt;
    const tz = y * sinTilt + z * cosTilt;
    // rotateY
    const world: Vector3 = [x * cosYaw + tz * sinYaw, ty, -x * sinYaw + tz * cosYaw];

    const relative = subtract(world, eye);
    const viewX = dot(relative, xAxis);
    const viewY = dot(relative, yAxis);
    const viewZ = dot(relative, zAxis);

    const viewDepth = -viewZ;
    const isBehind = viewDepth <= MIN_VIEW_DEPTH;
    const safeDepth = Math.max(viewDepth, MIN_VIEW_DEPTH);

    const depth = Math.min(Math.max((viewDepth - DEPTH_NEAR) / DEPTH_RANGE, 0), 1);
    const worldRadius =
      POINT_SIZE * (POINT_SIZE_NEAR_SCALE + (POINT_SIZE_FAR_SCALE - POINT_SIZE_NEAR_SCALE) * depth);

    return {
      x: halfWidth + (focalLength / aspect) * (viewX / safeDepth) * halfWidth,
      y: halfHeight - focalLength * (viewY / safeDepth) * halfHeight,
      radius: (worldRadius * focalLength * halfHeight) / safeDepth,
      depth,
      isBehind,
    };
  };

  return {
    project,
    jitter: (sizeSeed) => SIZE_JITTER_BASE + SIZE_JITTER_SPAN * sizeSeed,
  };
}

/**
 * The vertex shader's `vHeat`, at `placed = 1` and with the twinkle at its mean.
 * Exported so the poster bands a point onto the same ramp the shader tints it
 * with, rather than onto a second ramp that can drift (A8.6).
 */
export function resolvedHeat(sizeSeed: number, flare: number): number {
  return (0.46 + 0.54 * sizeSeed) * (0.72 + (1.35 - 0.72) * flare);
}

/** The vertex shader's `vFade`, at `placed = 1` and `hold = 0`. */
export function resolvedFade(depth: number): number {
  const near = smoothstep(0.01, 0.22, depth);
  const far = 1 + (0.6 - 1) * smoothstep(0.52, 1, depth);
  return near * far;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}
