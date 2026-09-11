import { CAMERA_DISTANCE, CAMERA_FOV_DEGREES, POINT_SIZE } from "../constants";

/**
 * The same perspective projection the vertex shader performs, in JavaScript.
 *
 * The poster is rendered on the server from this function and the scene is
 * rendered on the GPU from the shader; keeping one camera definition in
 * `constants.ts` and mirroring the arithmetic here is what stops the two from
 * diverging visually when the canvas fades in over the poster.
 */

export interface ProjectedPoint {
  /** Horizontal position in poster units. */
  readonly x: number;
  /** Vertical position in poster units. */
  readonly y: number;
  /** Point radius in poster units. */
  readonly radius: number;
  /** 0 at the near plane, 1 at the far edge of the field. */
  readonly depth: number;
}

const DEGREES_TO_RADIANS = Math.PI / 180;

/** Clamps the divisor so a point at or behind the camera cannot produce NaN. */
const MIN_VIEW_DEPTH = 0.1;

/** World-space depth range used to normalise {@link ProjectedPoint.depth}. */
const DEPTH_RANGE = 2.4;

export function createProjector(
  viewportWidth: number,
  viewportHeight: number,
): (x: number, y: number, z: number) => ProjectedPoint {
  const focalLength = 1 / Math.tan((CAMERA_FOV_DEGREES * DEGREES_TO_RADIANS) / 2);
  const aspect = viewportWidth / viewportHeight;
  const halfWidth = viewportWidth / 2;
  const halfHeight = viewportHeight / 2;

  return (x, y, z) => {
    const viewDepth = Math.max(CAMERA_DISTANCE - z, MIN_VIEW_DEPTH);
    const ndcX = (focalLength / aspect) * (x / viewDepth);
    const ndcY = focalLength * (y / viewDepth);
    return {
      x: halfWidth + ndcX * halfWidth,
      y: halfHeight - ndcY * halfHeight,
      radius: (POINT_SIZE * focalLength * halfHeight) / viewDepth,
      depth: Math.min(
        Math.max((viewDepth - (CAMERA_DISTANCE - DEPTH_RANGE / 2)) / DEPTH_RANGE, 0),
        1,
      ),
    };
  };
}
