/** Run a simulation only while it is visible and the document is foregrounded. */
export function visibleLoop(element: Element, update: (delta: number) => void) {
  let visible = false;
  let frame = 0;
  let previous = 0;
  const tick = (now: number) => {
    if (!visible || document.hidden) {
      frame = 0;
      previous = 0;
      return;
    }
    update(previous ? Math.min((now - previous) / 1000, 1 / 30) : 1 / 60);
    previous = now;
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    if (visible && !document.hidden) {
      if (!frame) frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    }
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(element);
  document.addEventListener("visibilitychange", sync);
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    document.removeEventListener("visibilitychange", sync);
  };
}
