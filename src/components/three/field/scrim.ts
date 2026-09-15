import { SCRIM_SLOTS } from "../constants";
import { reportScrimMisuse } from "../runtime/report";

/**
 * `[data-scrim]` blocks → the composite pass's six SDF slots. docs/15 §2.10.
 *
 * A8.3 is the contract: the carve happens inside the composite, so the pixels
 * a contrast probe samples are the pixels behind the type. This module's only
 * job is to keep the six slots pointed at whichever authored blocks are nearest
 * the viewport centre right now.
 *
 * `data-scrim="padX,padY,amount"` — padding in CSS pixels, amount in 0..1.
 * A malformed value is dropped rather than guessed at: a scrim is a contrast
 * guarantee, and a guessed one is worse than a missing one because it looks
 * like it is working.
 */

export interface ScrimUniforms {
  /**
   * `SCRIM_SLOTS * 4` floats, `[centreX, centreY, halfWidth, halfHeight]` in uv.
   *
   * A plain `Array`, deliberately, **never a `Float32Array`**. OGL's uniform
   * walker only recognises array uniforms (`uScrim[0]`…) when the value passes
   * `Array.isArray`; a typed array is silently dropped with a console warning
   * and the scrim never reaches the GPU — which fails A8.4 while looking fine.
   */
  readonly vectors: number[];
  /** `SCRIM_SLOTS` floats, the authored carve amount per slot. Plain `Array`. */
  readonly amounts: number[];
}

export interface ScrimTracker {
  readonly uniforms: ScrimUniforms;
  /** Re-reads the live rects and rewrites the slots. Called once per frame. */
  readonly update: (viewportWidth: number, viewportHeight: number) => void;
  /** Re-queries the DOM for `[data-scrim]` blocks. Call after a DOM change. */
  readonly refresh: () => void;
  readonly dispose: () => void;
}

export const SCRIM_SELECTOR = "[data-scrim]";

/**
 * A scrim carves a **text block**, never the section that contains one.
 *
 * This predicate is the single definition of that, shared by the composite
 * (here) and by the A8.4 probe (`field/contrast.ts`). They used to disagree:
 * the probe skipped enclosing rects while the composite consumed them, so a
 * `data-scrim` on a 2,066px `<section>` carved a taller-than-viewport rounded
 * box at 0.94 and **extinguished the field** across whole sections — while the
 * probe, sampling only the leaf blocks, reported healthy contrast against the
 * fully-carved floor it had itself created. Every number taken over those
 * sections was inflated, and the receding plane simply was not there.
 *
 * Two implementations of one idea is how a harness ends up certifying the
 * thing it was built to catch. There is one now, and both sides import it.
 */
export function isLeafScrim(node: Element, selector: string = SCRIM_SELECTOR): boolean {
  return node.querySelector(selector) === null;
}

/** Blocks this far outside the viewport cannot affect a visible pixel. */
const OFFSCREEN_MARGIN = 220;

/** Below this width a rect is a collapsed or hidden block, not a text column. */
const MIN_TRACKED_WIDTH = 8;

/**
 * The fraction of a scrim's own height that must actually be lines of text.
 *
 * Height alone is the wrong test, and it took a measurement at 320px to see
 * why: a prose block genuinely *is* 1,967px tall on a narrow screen, its text
 * fills all of it, and carving that is correct. What is not correct is carving
 * a box that is mostly not text — a section, a wrapper, a layout group — which
 * puts the field out across whole screenfuls and, worse, flatters every
 * contrast measurement taken over it, because every string is then scored
 * against a floor that carve created.
 *
 * `Range.getClientRects()` gives one rect per rendered line, so the ratio of
 * their summed height to the block's own height separates the two cleanly:
 * prose lands near 1, a container lands near 0. It is the same machinery the
 * A8.4 probe uses to find strings, which is the point — one idea, one
 * implementation.
 */
const MIN_TEXT_COVERAGE = 0.5;

/** Coverage is a layout property, so it is cached and invalidated on refresh. */
const coverageCache = new WeakMap<Element, number>();

/**
 * How much of a block's box is actually occupied by lines of text, 0..1.
 * Returns 1 for a block short enough that the question cannot matter.
 */
export function scrimTextCoverage(node: Element): number {
  const cached = coverageCache.get(node);
  if (cached !== undefined) return cached;

  const height = node.getBoundingClientRect().height;
  if (height <= 0) return 1;

  const range = document.createRange();
  range.selectNodeContents(node);
  // `Range.getClientRects` is absent in some non-browser DOM implementations.
  // Coverage is an optimisation over the safe default, so its absence must
  // degrade to "carve it" rather than throw inside the render loop.
  if (typeof range.getClientRects !== "function") {
    range.detach();
    return 1;
  }
  let lines = 0;
  for (const rect of Array.from(range.getClientRects())) {
    if (rect.width >= MIN_TRACKED_WIDTH) lines += rect.height;
  }
  range.detach();

  const coverage = Math.min(lines / height, 1);
  coverageCache.set(node, coverage);
  return coverage;
}

/**
 * True when a scrim is a text block the composite should carve.
 *
 * Short blocks are always carved — coverage is noisy at small heights and the
 * failure mode it guards against needs size to do damage.
 */
export function isCarvableScrim(node: Element, viewportHeight: number): boolean {
  if (node.getBoundingClientRect().height <= viewportHeight) return true;
  return scrimTextCoverage(node) >= MIN_TEXT_COVERAGE;
}

const SCRIM_FIELDS = 3;

interface ScrimSpec {
  readonly padX: number;
  readonly padY: number;
  readonly amount: number;
}

/** Parses `"padX,padY,amount"`. Returns null for anything it cannot trust. */
export function parseScrimSpec(raw: string | undefined): ScrimSpec | null {
  if (!raw) return null;
  const parts = raw.split(",");
  if (parts.length !== SCRIM_FIELDS) return null;
  const [padX, padY, amount] = parts.map((part) => Number(part.trim()));
  if (![padX, padY, amount].every((value) => Number.isFinite(value))) return null;
  if (padX < 0 || padY < 0 || amount <= 0 || amount > 1) return null;
  return { padX, padY, amount };
}

/**
 * A leaf scrim bigger than the viewport whose box is mostly not text — the one
 * case `isLeafScrim` cannot catch, because such a thing genuinely has no scrim
 * inside it. Reported as well as skipped, because a silent console is not
 * evidence the rects are fine.
 */
const warned = new WeakSet<Element>();

function warnIfContainerScrim(node: Element, rect: DOMRect, viewportHeight: number): void {
  if (warned.has(node)) return;
  warned.add(node);
  reportScrimMisuse(node, rect.height, viewportHeight, scrimTextCoverage(node));
}

interface Candidate {
  readonly node: HTMLElement;
  readonly rect: DOMRect;
  readonly spec: ScrimSpec;
  readonly distance: number;
  /** How much of the block is actually on screen, in CSS pixels. */
  readonly visibleHeight: number;
}

/**
 * Published on the host as `data-scrim-dropped`, `"<count>:<maxVisiblePx>"`.
 *
 * There are more `[data-scrim]` blocks in view than there are slots — measured
 * 8–9 against 6 — so the nearest-to-centre sort drops some every frame. That is
 * the mechanism working, not a shortfall, but only while what it drops is
 * always a sliver entering or leaving the viewport. The moment a block with
 * real height on screen loses its carve, a string is over uncarved field and
 * nothing else would say so.
 *
 * So the tracker reports what it dropped and how much of it was visible, and
 * `tests/e2e/field-contrast.spec.ts` asserts the bound across widths, scroll
 * positions and themes. Raising `SCRIM_SLOTS` costs a rounded-box SDF per pixel
 * full-screen against R5's integrated-graphics risk; this is how we know
 * whether that cost is owed.
 */
export const DROPPED_ATTRIBUTE = "scrimDropped";

export function createScrimTracker(root: ParentNode = document, host?: HTMLElement): ScrimTracker {
  const vectors = new Array<number>(SCRIM_SLOTS * 4).fill(0);
  const amounts = new Array<number>(SCRIM_SLOTS).fill(0);

  const reportDropped = (dropped: readonly Candidate[]): void => {
    if (!host) return;
    const maxVisible = dropped.reduce(
      (highest, candidate) => Math.max(highest, candidate.visibleHeight),
      0,
    );
    host.dataset[DROPPED_ATTRIBUTE] = `${dropped.length}:${Math.round(maxVisible)}`;
  };

  let nodes: readonly HTMLElement[] = [];

  const refresh = (): void => {
    nodes = Array.from(root.querySelectorAll<HTMLElement>(SCRIM_SELECTOR));
    for (const node of nodes) coverageCache.delete(node);
  };
  refresh();

  const observer = new MutationObserver(refresh);
  if (root instanceof Document) {
    observer.observe(root.documentElement, { childList: true, subtree: true });
  }

  const update = (viewportWidth: number, viewportHeight: number): void => {
    const candidates: Candidate[] = [];

    for (const node of nodes) {
      // An enclosing rect is a section, not a block. Carving it darkens
      // everything, including the field the section exists to show.
      if (!isLeafScrim(node)) continue;
      const spec = parseScrimSpec(node.dataset.scrim);
      if (!spec) continue;
      const rect = node.getBoundingClientRect();
      if (rect.width < MIN_TRACKED_WIDTH) continue;
      // A container masquerading as a block carves a screenful of field and
      // flatters every number measured over it. Reported, and not carved.
      if (!isCarvableScrim(node, viewportHeight)) {
        warnIfContainerScrim(node, rect, viewportHeight);
        continue;
      }
      if (rect.bottom < -OFFSCREEN_MARGIN || rect.top > viewportHeight + OFFSCREEN_MARGIN) continue;
      candidates.push({
        node,
        rect,
        spec,
        distance: Math.abs(rect.top + rect.height / 2 - viewportHeight / 2),
        visibleHeight: Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)),
      });
    }

    // Nearest-to-viewport-centre blocks win the slots, so the carve always
    // tracks whatever type is actually on screen.
    candidates.sort((a, b) => a.distance - b.distance);

    for (let slot = 0; slot < SCRIM_SLOTS; slot += 1) {
      const candidate = candidates[slot];
      if (!candidate) {
        amounts[slot] = 0;
        continue;
      }
      const { rect, spec } = candidate;
      const offset = slot * 4;
      vectors[offset] = (rect.left + rect.width / 2) / viewportWidth;
      vectors[offset + 1] = 1 - (rect.top + rect.height / 2) / viewportHeight;
      vectors[offset + 2] = (rect.width / 2 + spec.padX) / viewportWidth;
      vectors[offset + 3] = (rect.height / 2 + spec.padY) / viewportHeight;
      amounts[slot] = spec.amount;
    }

    reportDropped(candidates.slice(SCRIM_SLOTS));
  };

  return {
    uniforms: { vectors, amounts },
    update,
    refresh,
    dispose: () => {
      observer.disconnect();
      if (host) delete host.dataset[DROPPED_ATTRIBUTE];
    },
  };
}
