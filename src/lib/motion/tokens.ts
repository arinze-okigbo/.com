/**
 * Motion tokens — the single source of truth for every animated value on the site.
 *
 * Every value here is transcribed from `docs/04-design-system.md` §4 (Easing),
 * §5.1 (Durations), §5.2 (Reveal distances) and §5.3 (Stagger and trigger).
 * The matching CSS custom properties live in `src/app/globals.css` §10; these
 * constants exist so the JS and CSS values cannot drift.
 *
 * HARD RULE (docs/04 §0): a rendered value that is not one of these tokens is a
 * defect. If a value you need is not here, that is a gap in docs/04 — escalate
 * it, do not add a number to this file.
 */

/** Milliseconds in one second. Named so no conversion uses a bare literal. */
const MS_PER_SECOND = 1000;

/** Framer Motion expresses durations in seconds; CSS expresses them in ms. */
export const toSeconds = (milliseconds: number): number => milliseconds / MS_PER_SECOND;

/* -------------------------------------------------------------------------- */
/* Easing — docs/04 §4. Three tokens. No fourth.                              */
/* -------------------------------------------------------------------------- */

/**
 * DOMINANT. The default for everything: hover, focus, press, colour change,
 * border change, nav sheet, theme toggle. docs/04 §4, `--ease-standard`.
 */
export const EASE_STANDARD = [0.4, 0, 0.2, 1] as const;

/**
 * Entrances only — anything appearing that was not there before (section
 * reveals, the nav sheet's first paint). docs/04 §4, `--ease-entrance`.
 */
export const EASE_ENTRANCE = [0, 0, 0.2, 1] as const;

/**
 * ONE authored moment on the entire site: the hero attestation's noise→lattice
 * resolve. docs/04 §4, `--ease-glide`. Reserved for `src/components/three/**`.
 */
export const EASE_GLIDE = [0.32, 0.72, 0, 1] as const;

export type EasingToken = typeof EASE_STANDARD | typeof EASE_ENTRANCE | typeof EASE_GLIDE;

/** A cubic-bezier as Framer Motion types it. */
export type BezierTuple = [number, number, number, number];

/**
 * Copies an easing token into the mutable 4-tuple Framer Motion's `ease` field
 * expects. Returns a new array every call — the tokens themselves are never
 * handed out by reference and so can never be mutated.
 */
export const toBezier = (easing: EasingToken): BezierTuple => [
  easing[0],
  easing[1],
  easing[2],
  easing[3],
];

/**
 * `ease-in` is forbidden in any form — CSS keyword, bezier, or Framer Motion
 * string (docs/04 §4). This includes `ease-in-out`; use `EASE_STANDARD`.
 */

/* -------------------------------------------------------------------------- */
/* Durations — docs/04 §5.1                                                   */
/* -------------------------------------------------------------------------- */

/** 150ms — hover, focus ring, link underline, button press, colour/border. */
export const DURATION_FAST_MS = 150;

/** 240ms — state changes: nav sheet open/close, theme toggle, disclosure. */
export const DURATION_BASE_MS = 240;

/** 280ms — section and entry reveals on scroll, and route entrances. */
export const DURATION_REVEAL_MS = 280;

/**
 * 320ms — NOT a usable value. A declared hard ceiling for Phase-5 assertion
 * (docs/04 §5.1). Exported only so a test can assert against it.
 */
export const DURATION_CEILING_MS = 320;

export const DURATION_FAST_S = toSeconds(DURATION_FAST_MS);
export const DURATION_BASE_S = toSeconds(DURATION_BASE_MS);
export const DURATION_REVEAL_S = toSeconds(DURATION_REVEAL_MS);

/* -------------------------------------------------------------------------- */
/* Reveal distances — docs/04 §5.2                                            */
/* -------------------------------------------------------------------------- */

/** 8px — every section and entry reveal. NOT the 40px template fade-up. */
export const REVEAL_DISTANCE_PX = 8;

/** 16px — the hero block only. One use on the page. */
export const REVEAL_DISTANCE_LG_PX = 16;

/** 1px — `:active` on buttons and standalone links. */
export const PRESS_TRANSLATE_PX = 1;

/** 0.98 — `:active` on the primary CTA. */
export const PRESS_SCALE = 0.98;

/** -2px — maximum hover translation anywhere on the site. */
export const HOVER_LIFT_PX = -2;

/* -------------------------------------------------------------------------- */
/* Stagger and trigger — docs/04 §5.3                                         */
/* -------------------------------------------------------------------------- */

/** 50ms between consecutive items in a staggered list. */
export const STAGGER_STEP_MS = 50;

/** 5 items (250ms total envelope). Past the cap every item shares delay #4. */
export const STAGGER_MAX_ITEMS = 5;

/** Highest delay multiplier the cap permits: `min(index, 4)`. */
export const STAGGER_MAX_INDEX = STAGGER_MAX_ITEMS - 1;

/** Reveal when the element's top crosses 85% of viewport height. */
export const REVEAL_ROOT_MARGIN = "0px 0px -15% 0px";

/** Fire on any intersection, however small. */
export const REVEAL_THRESHOLD = 0;

/* -------------------------------------------------------------------------- */
/* DOM contract — the attribute names globals.css §10.7 keys its rules on.    */
/* -------------------------------------------------------------------------- */

/** Marks an element as reveal-managed. Value is the distance variant. */
export const ATTR_REVEAL = "data-reveal";

/** Present once the element has reached its final state. */
export const ATTR_REVEALED = "data-revealed";

/** Suppresses the transition for backlogged elements (docs/04 §5.3). */
export const ATTR_REVEAL_INSTANT = "data-reveal-instant";

/** Custom property carrying the stagger index into the CSS delay expression. */
export const VAR_REVEAL_INDEX = "--reveal-index";
