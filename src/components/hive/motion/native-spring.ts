/** Analytic unit-mass spring: x'' + 30x' + 400(x-target) = 0.
 * Preserves velocity when the pointer changes target; independent of frame rate.
 */
export function stepSnappy(value: number, velocity: number, target: number, seconds: number) {
  const t = Math.max(0, seconds);
  const frequency = Math.sqrt(175);
  const displacement = value - target;
  const b = (velocity + 15 * displacement) / frequency;
  const cos = Math.cos(frequency * t),
    sin = Math.sin(frequency * t);
  const wave = displacement * cos + b * sin;
  const decay = Math.exp(-15 * t);
  return {
    value: target + decay * wave,
    velocity: decay * (frequency * (-displacement * sin + b * cos) - 15 * wave),
  };
}

export function springKeyframes(from: number, to: number, frame: (value: number) => Keyframe) {
  return Array.from({ length: 37 }, (_, index) =>
    frame(index === 36 ? to : stepSnappy(from, 0, to, index / 60).value),
  );
}

/** No animation loop exists until set() is called; settles and cancels on cleanup. */
export function createPointerSpring(render: (x: number, y: number) => void) {
  let x = 0,
    y = 0,
    vx = 0,
    vy = 0,
    tx = 0,
    ty = 0,
    raf = 0,
    previous = 0;
  const tick = (time: number) => {
    const dt = (time - previous) / 1000;
    previous = time;
    const nextX = stepSnappy(x, vx, tx, dt),
      nextY = stepSnappy(y, vy, ty, dt);
    x = nextX.value;
    vx = nextX.velocity;
    y = nextY.value;
    vy = nextY.velocity;
    const settled =
      Math.abs(x - tx) + Math.abs(y - ty) < 0.001 && Math.abs(vx) + Math.abs(vy) < 0.01;
    render(settled ? tx : x, settled ? ty : y);
    if (settled) {
      x = tx;
      y = ty;
      vx = 0;
      vy = 0;
      raf = 0;
    } else raf = requestAnimationFrame(tick);
  };
  return {
    set(nextX: number, nextY: number) {
      tx = nextX;
      ty = nextY;
      if (!raf) {
        previous = performance.now();
        raf = requestAnimationFrame(tick);
      }
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
