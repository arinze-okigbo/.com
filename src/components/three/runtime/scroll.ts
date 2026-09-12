/**
 * The three-act scroll scrub — docs/12 §5 M6, docs/15 §2.2.
 *
 * Act I   curl-noise entropy, the field unresolved and drifting
 * Act II  a spatial wave of resolution sweeps the field while the camera dollies
 * Act III the signature polylines lock in
 *
 * The three acts are one number: `resolve`, 0 → 1, scrubbed against the
 * document rather than against a box. The old tracker measured the figure's own
 * 768x432 frame, which gave the whole entropy→structure story one element's
 * passage of runway; the field is now the page's ground and has the document to
 * play across.
 *
 * docs/02 §8.6: progress is written into a ref and read inside the rAF loop.
 * Driving a uniform from React state would be a re-render per frame. Document
 * offsets are cached and recomputed on resize only, so the render loop never
 * forces a synchronous layout.
 *
 * `position: sticky` on the anchor section is what gives Act II its dwell; this
 * module only reads where the anchor is. No GSAP, no ScrollTrigger, no
 * scroll-linked library of any kind.
 */

export interface ScrollActs {
  /** The master resolve, 0 → 1. Drives the point shader's `uProgress`. */
  readonly resolve: number;
  /** Act III reveal for the r/s traces, 0 → 1. */
  readonly traceReveal: number;
  /** Normalised document scroll, 0 → 1. Drives depth parallax. */
  readonly documentProgress: number;
}

export interface ScrollTracker {
  /** Cheap — reads cached numbers and does no layout. */
  readonly read: () => ScrollActs;
  /** Recomputes the cached offsets. Call after a layout change. */
  readonly measure: () => void;
  readonly dispose: () => void;
}

/**
 * Fraction of the document over which the resolve completes. The field is fully
 * resolved well before the end of the page, so the lower sections are read over
 * a settled, structured ground rather than over an animation still running.
 */
const RESOLVE_SPAN = 0.62;

/** Fraction of the resolve spent on Act III, the trace lock-in. */
const TRACE_SPAN = 0.34;

/**
 * Where the field STARTS, before the anchor section has taken any runway.
 *
 * Acts II and III are scrubbed against `#attestation`, which is the third
 * section on the page. `anchoredProgress` is therefore 0 for the whole of the
 * hero and the whole of `#work` — so the two screenfuls a first-time visitor
 * actually looks at rendered the lattice at `resolve = 0`: every point still in
 * the entropy cloud, no rows or columns aligned, no halos overlapping. What
 * that composites to is a soft warm nebula, and it is not the approved look.
 *
 * `scratchpad/proto-c-field.html` settles it. Its default mode is `"hold"`,
 * which lerps `state.progress` to **1.0** and holds it there — the comment on
 * the state object reads *"resting state = fully resolved (spectacular as a
 * still)"*, and the file's closing lines say the scroll-driven mode is opt-in
 * via `?mode=scroll` because "default is the resolved hold, which is the still
 * the art direction is meant to be judged on". The prototype's hero is a
 * resolved lattice, not an entropy cloud.
 *
 * So the resolve is remapped onto `[RESOLVE_FLOOR, 1]` rather than `[0, 1]`.
 * The field opens already ordered — crisp lattice, aligned rows, ignited ridges
 * where halos reinforce — and `#attestation` still owns the last of the resolve
 * and the whole of the trace lock-in, which is the moment docs/15 §3 row 3
 * gives it. Nothing about the three acts moves; only their starting frame does.
 *
 * Tuned by screenshot at 1440x900 and 390x844 in both themes: below ~0.8 the
 * hero still reads as diffuse, and at 1.0 there is no resolve left to watch.
 */
const RESOLVE_FLOOR = 0.9;

/** Depth parallax travel across the whole document, in world units. */
const PARALLAX_TRAVEL = 0.42;

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * Progress against an anchor element, when one is given: the resolve is tied to
 * that section's own passage through the viewport instead of to raw document
 * scroll, so it reads the same on a short page and a long one.
 */
function anchoredProgress(
  anchorTop: number,
  anchorHeight: number,
  scrollY: number,
  viewportHeight: number,
): number {
  const travel = anchorHeight + viewportHeight;
  if (travel <= 0) return 1;
  return clamp01((scrollY + viewportHeight - anchorTop) / travel);
}

export interface ScrollTrackerOptions {
  /**
   * The section whose passage Acts II and III are normalised to — `#attestation`
   * in the shipped composition. When it is absent (it is another lane's file and
   * may not exist yet) the tracker falls back to raw document scroll, which is
   * degraded but never broken.
   */
  readonly anchorSelector?: string;
}

export function createScrollTracker(options: ScrollTrackerOptions = {}): ScrollTracker {
  let documentHeight = 1;
  let viewportHeight = window.innerHeight;
  let scrollY = window.scrollY;
  let anchorTop = 0;
  let anchorHeight = 0;
  let hasAnchor = false;

  const measure = (): void => {
    viewportHeight = window.innerHeight;
    scrollY = window.scrollY;
    documentHeight = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);

    const anchor = options.anchorSelector
      ? document.querySelector<HTMLElement>(options.anchorSelector)
      : null;
    hasAnchor = anchor !== null;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      anchorTop = rect.top + window.scrollY;
      anchorHeight = rect.height;
    }
  };

  const onScroll = (): void => {
    scrollY = window.scrollY;
  };

  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measure, { passive: true });

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(document.documentElement);

  const read = (): ScrollActs => {
    const documentProgress = clamp01(scrollY / documentHeight);
    const raw = hasAnchor
      ? anchoredProgress(anchorTop, anchorHeight, scrollY, viewportHeight)
      : clamp01(documentProgress / RESOLVE_SPAN);
    // Remapped onto [RESOLVE_FLOOR, 1]: the field is never fully unresolved,
    // because the first two screenfuls take no anchor runway at all.
    const resolve = clamp01(RESOLVE_FLOOR + (1 - RESOLVE_FLOOR) * clamp01(raw));
    return {
      resolve,
      traceReveal: clamp01((resolve - (1 - TRACE_SPAN)) / TRACE_SPAN),
      documentProgress: documentProgress * PARALLAX_TRAVEL,
    };
  };

  return {
    read,
    measure,
    dispose: () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    },
  };
}
