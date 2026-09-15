export type Body = { x: number; y: number; vx: number; vy: number };

/** Semi-implicit Euler, capped timestep, finite input guards. Units are CSS pixels. */
export function springStep(
  body: Body,
  target: { x: number; y: number },
  stiffness: number,
  damping: number,
  elapsed: number,
): Body {
  const dt = Math.max(0, Math.min(Number.isFinite(elapsed) ? elapsed : 0, 1 / 60));
  const vx = body.vx + ((target.x - body.x) * stiffness - body.vx * damping) * dt;
  const vy = body.vy + ((target.y - body.y) * stiffness - body.vy * damping) * dt;
  return { x: body.x + vx * dt, y: body.y + vy * dt, vx, vy };
}

export function resolveCollision(a: Body, b: Body, minDistance: number) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  if (distance >= minDistance) return;
  const nx = distance > 0.001 ? dx / distance : 1;
  const ny = distance > 0.001 ? dy / distance : 0;
  const overlap = (minDistance - distance) / 2;
  a.x -= nx * overlap;
  a.y -= ny * overlap;
  b.x += nx * overlap;
  b.y += ny * overlap;
  const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (closing < 0) {
    const impulse = -0.7 * closing;
    a.vx -= impulse * nx;
    a.vy -= impulse * ny;
    b.vx += impulse * nx;
    b.vy += impulse * ny;
  }
}
