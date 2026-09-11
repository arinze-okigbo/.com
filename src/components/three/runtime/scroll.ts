/**
 * Scroll-scrubbed progress for the resolve, 0 → 1.
 *
 * docs/02 §8.6: progress is written into a ref and read inside the rAF loop.
 * Driving a uniform from React state would be a re-render per frame.
 *
 * Element offsets are cached and only recomputed on resize, so the render loop
 * never forces a synchronous layout.
 */

export interface ScrollProgressTracker {
  /** Current progress in 0..1. Cheap — reads two cached numbers. */
  readonly read: () => number;
  /** Recomputes the cached document offsets. Call after a layout change. */
  readonly measure: () => void;
  readonly dispose: () => void;
}

/** Progress starts when the element's top crosses the viewport's bottom edge. */
function computeProgress(
  elementTop: number,
  elementHeight: number,
  scrollY: number,
  viewportHeight: number,
): number {
  const travel = viewportHeight / 2 + elementHeight / 2;
  if (travel <= 0) return 1;
  const remaining = elementTop + elementHeight / 2 - (scrollY + viewportHeight / 2);
  return Math.min(Math.max(1 - remaining / travel, 0), 1);
}

export function createScrollProgress(element: HTMLElement): ScrollProgressTracker {
  let elementTop = 0;
  let elementHeight = 0;
  let viewportHeight = window.innerHeight;
  let scrollY = window.scrollY;

  const measure = (): void => {
    const rect = element.getBoundingClientRect();
    elementTop = rect.top + window.scrollY;
    elementHeight = rect.height;
    viewportHeight = window.innerHeight;
    scrollY = window.scrollY;
  };

  const onScroll = (): void => {
    scrollY = window.scrollY;
  };

  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(element);

  return {
    read: () => computeProgress(elementTop, elementHeight, scrollY, viewportHeight),
    measure,
    dispose: () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    },
  };
}
