import type { OGLRenderingContext } from "ogl";

import { BANDS_ATTRIBUTE, isPaintedAt, parseBands } from "./bleed";
import { isCarvableScrim, isLeafScrim, SCRIM_SELECTOR } from "./scrim";
import { parseCssColor, type Rgb } from "../runtime/color";

/**
 * The A8.4 harness: WCAG contrast measured on **composited pixels**, read back
 * from the default framebuffer after the composite pass has run.
 *
 * A8.4 is explicit that the floor is measured on what renders, at the field's
 * brightest authored frame — not against `--field-ink`, and not at a resting
 * frame chosen for being dim. Because the scrim carves inside the composite
 * (A8.3), the pixels this samples really are the pixels behind the type. A CSS
 * overlay would measure something other than what renders, which is how a field
 * ships "compliant" and invisible.
 *
 * **This never runs inside the render loop.** `docs/15` names a per-frame
 * `readPixels` as a performance blower, and it is right: the call stalls the
 * pipeline until the GPU has caught up. The probe runs once per explicit
 * request, at the end of a frame that was going to be drawn anyway, and the
 * scene only arms it when something asks.
 *
 * ## What it enumerates, and why that changed
 *
 * It used to walk `[data-scrim]` blocks. That measured *the carves that were
 * authored* rather than *the text that is over the field*, so a string with no
 * `data-scrim` at all was invisible to the harness — it got no carve AND no
 * measurement, and the two absences hid each other. That is exactly how
 * `#ceremony`'s two `<summary>` eyebrows shipped in `--color-accent` directly
 * on the brightest part of the lattice: gold on gold, measured **1.98:1**,
 * while every gate in the build was green and the A8.4 number being reported
 * was the healthy one from the blocks that did declare a carve.
 *
 * So it walks **text** now: every element inside `.stage` / `.over-field` that
 * has a text node of its own. A missing scrim can no longer hide from it,
 * because nothing about the enumeration depends on the scrim existing.
 */

export interface ContrastSample {
  /** WCAG contrast ratio of the element's own ink against this composited pixel. */
  readonly ratio: number;
  /** The floor this element has to clear — A8.4's 4.5, or 3 for large text. */
  readonly floor: number;
  /** The composited pixel, 0–255. */
  readonly rgb: readonly [number, number, number];
  /** The element's computed `color`, so a failure names its own ink. */
  readonly ink: string;
  /** The nearest `data-scrim`, so a failure names the carve to raise — or its absence. */
  readonly scrim: string;
  /** The start of the string itself, so a failure says which one it is. */
  readonly label: string;
}

export interface ContrastReport {
  /** The worst ratio found. `null` when no block was on screen to sample. */
  readonly worst: number | null;
  /** How many pixels were read. */
  readonly samples: number;
  /** The worst sample, for diagnosis. */
  readonly worstSample: ContrastSample | null;
  /**
   * Luminance spread across a coarse grid of the whole composite, 0–255.
   *
   * The failure this port corrects did not look like a bad ratio; it looked
   * like an empty box. A field that is drawing nothing composites to a flat
   * frame, and a flat frame is a defect no contrast number catches — so the
   * spread is measured alongside the ratio, in the same readback.
   */
  readonly luminanceSpread: number;
  /**
   * Every text element that measured below its own A8.4 floor.
   *
   * Reported as a list rather than folded into `worst`, because the question
   * the harness has to answer is not "how bad is the worst string" but "is any
   * string over the field failing" — and a single worst figure cannot name the
   * three that failed behind it.
   */
  readonly failures: readonly ContrastSample[];
  /** How many distinct text elements were enumerated and read. */
  readonly elements: number;
  /**
   * Text elements skipped because an opaque CSS fill sits between them and the
   * field. Reported so a shrinking sample can never pass for a clean one.
   */
  readonly shielded: number;
}

/** A8.4 floors: body copy, and `--text-h3`-and-above large text. */
export const BODY_FLOOR = 4.5;
export const LARGE_FLOOR = 3;

/**
 * WCAG 2.2's definition of large text: 18pt (24px), or 14pt (18.66px) bold.
 * A8.4 phrases its own large-text case as "`--text-h3` and above"; the WCAG
 * rule is the one that can be evaluated from computed style alone, and on this
 * page it selects the same set.
 */
const LARGE_TEXT_PX = 24;
const LARGE_BOLD_PX = 18.66;
const BOLD_WEIGHT = 700;

/** Sample points taken across each line of text. */
const SAMPLES_PER_LINE = 6;

/** Lines sampled per block, evenly spread, so a long block stays cheap. */
const MAX_LINES_PER_BLOCK = 4;

/** Below this a client rect is a stray inline fragment, not a line of text. */
const MIN_LINE_WIDTH = 8;

/** Coarse grid used for the whole-composite spread check. */
const SPREAD_GRID = 8;

function toLinear(channel: number): number {
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** Relative luminance, WCAG 2.x. Channels are 0–1. */
export function relativeLuminance(color: Rgb): number {
  return 0.2126 * toLinear(color[0]) + 0.7152 * toLinear(color[1]) + 0.0722 * toLinear(color[2]);
}

/** WCAG contrast ratio between two relative luminances. */
export function contrastRatio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export interface ContrastProbeOptions {
  readonly gl: OGLRenderingContext;
  /**
   * Fallback ink, used only when a block's computed `color` cannot be parsed —
   * `--field-fg-secondary`, the dimmest string A8.4 names.
   *
   * It is a fallback rather than the measurement, deliberately. Scoring every
   * block against one colour reports a block dimmer than that colour as
   * *better* than it is: the HUD is `--field-fg-muted` `#9C978C`, and on a lit
   * ground of `#2B2720` this probe scored it 7.19:1 while the real figure is
   * **5.10:1** — a ratio that passes the floor either way, but which was on its
   * way into a document as clearing the ship target. Optimistic contrast
   * reporting is how the 1.44:1 field shipped; a harness that does it is worse
   * than no harness, because it is believed.
   */
  readonly textColor: Rgb;
  /**
   * Scope selector for the regions that composite over the field. Defaults to
   * the two token scopes `globals.css` §3.7 declares — `.stage` (over the field
   * in both themes) and `.over-field` (dark mode only). Every text element
   * inside them is enumerated, whether or not it declares a carve.
   */
  readonly selector?: string;
  /**
   * The field host, read for `data-field-bands` — the regions the bleed mask
   * actually paints. Samples outside them are skipped, because the composite
   * still contains pixels the visitor cannot see there.
   */
  readonly host: HTMLElement;
}

export interface ContrastProbe {
  /**
   * Reads back the composited pixels behind every on-screen block.
   *
   * Call immediately after the composite pass, on the frame you want measured,
   * and never on every frame.
   */
  readonly sample: (viewportWidth: number, viewportHeight: number, dpr: number) => ContrastReport;
}

/** The token scopes that composite over the field. globals.css §3.7. */
export const FIELD_SCOPE_SELECTOR = ".stage, .over-field";

/**
 * Every element inside `root` that renders a string of its own.
 *
 * "Of its own" is the whole point: an element is collected when it has a direct
 * non-empty text child, so a `<p>` and the `<strong>` inside it are two
 * samples with two inks rather than one sample scored against whichever colour
 * the outer box happened to declare. That is the same principle as reading each
 * block's computed colour instead of one palette value, applied one level down.
 */
function textElements(root: Element): readonly HTMLElement[] {
  const found: HTMLElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null = root;
  while (node) {
    const element = node as HTMLElement;
    for (const child of Array.from(element.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0) {
        found.push(element);
        break;
      }
    }
    node = walker.nextNode();
  }
  return found;
}

/** A8.4's floor for this element, from its computed type size and weight. */
export function contrastFloorFor(style: CSSStyleDeclaration): number {
  const size = Number.parseFloat(style.fontSize);
  if (!Number.isFinite(size)) return BODY_FLOOR;
  const weight = Number.parseFloat(style.fontWeight);
  const isBold = Number.isFinite(weight) && weight >= BOLD_WEIGHT;
  if (size >= LARGE_TEXT_PX) return LARGE_FLOOR;
  if (isBold && size >= LARGE_BOLD_PX) return LARGE_FLOOR;
  return BODY_FLOOR;
}

/**
 * Text WCAG 1.4.3 does not set a floor for: an inactive control's label.
 *
 * This is the one exemption the enumeration takes, and it is taken narrowly —
 * `:disabled` and `aria-disabled` only. It is not a place to park a string that
 * is merely hard to read.
 */
function isInactiveControl(element: HTMLElement): boolean {
  const control = element.closest("button, input, select, textarea, [aria-disabled]");
  if (!control) return false;
  if (control.getAttribute("aria-disabled") === "true") return true;
  return (control as HTMLButtonElement).disabled === true;
}

/** Invisible text is not text over the field. */
function isRendered(style: CSSStyleDeclaration): boolean {
  return style.visibility !== "hidden" && style.display !== "none" && style.opacity !== "0";
}

/**
 * Alpha at which a CSS fill stops being a tint over the field and becomes the
 * ground the type actually sits on.
 *
 * The field's own panel token is `--field-panel` `#FFFFFF05` — alpha 0.02 — and
 * a panel at that value is still text over the field, which is why the bar is
 * near-opaque rather than "any background at all".
 */
const OPAQUE_ALPHA = 0.9;

/**
 * The alpha of a computed `background-color`. 1 when a colour is present and
 * carries no alpha component at all.
 *
 * **A form this cannot read must resolve to OPAQUE, never to transparent.** The
 * first draft returned 0 for anything that was not `rgb()`/`rgba()`, and Chrome
 * serialises a wide-gamut fill as `color(display-p3 0.81 0.66 0.3)` — so the
 * primary CTA read as having no background, the probe scored its near-black
 * label against the field behind the button, and reported **1.01:1** for a
 * string that is perfectly legible. Wide-gamut serialisation defeating a naive
 * colour parse is the same failure that once rendered this lattice salmon
 * (`runtime/color.ts`); it is not a hypothetical on this page.
 *
 * Erring opaque errs toward *excluding* a string from the measurement, which is
 * why the exclusion is counted and reported as `shielded` rather than hidden.
 */
function backgroundAlpha(style: CSSStyleDeclaration): number {
  const value = style.backgroundColor?.trim();
  if (!value || value === "transparent" || value === "none") return 0;
  // Modern syntax puts alpha after a slash: `rgb(0 0 0 / 0.5)`,
  // `color(display-p3 0.8 0.6 0.3 / 0.5)`, `oklch(… / 0.5)`.
  const slashed = /\/\s*([0-9.]+)%?\s*\)/.exec(value);
  if (slashed) {
    const alpha = Number.parseFloat(slashed[1]);
    return Number.isFinite(alpha) ? (value.includes("%") ? alpha / 100 : alpha) : 1;
  }
  // Legacy comma syntax: `rgba(0, 0, 0, 0)`.
  const legacy = /rgba\(([^)]+)\)/.exec(value);
  if (legacy) {
    const parts = legacy[1].split(",");
    if (parts.length >= 4) {
      const alpha = Number.parseFloat(parts[3]);
      return Number.isFinite(alpha) ? alpha : 1;
    }
  }
  return 1;
}

/**
 * True when an opaque CSS fill sits between this string and the field.
 *
 * `gl.readPixels` reads the field's framebuffer, which contains no DOM at all —
 * so for the primary Button's label (`--accent-foreground` `#0A0908` on an
 * opaque gold fill) it reads the *field behind the button* and scores near-black
 * ink against near-black field: **1.00:1**, a total fabrication. The string is
 * perfectly legible and it is not over the field.
 *
 * A8.4's floor is for strings composited over the field. A string on an opaque
 * fill is composited over that fill, and its contrast is the design system's
 * §3.6 matrix to answer, not this harness's.
 *
 * Excluded rather than silently dropped: the count is reported as `shielded`,
 * because "the harness stopped looking" and "the harness found nothing" must
 * never be the same reading. That confusion is the whole history of this file.
 */
function isShielded(element: HTMLElement, scope: Element): boolean {
  let node: HTMLElement | null = element;
  while (node) {
    if (backgroundAlpha(window.getComputedStyle(node)) >= OPAQUE_ALPHA) return true;
    if (node === scope) return false;
    node = node.parentElement;
  }
  return false;
}

export function createContrastProbe(options: ContrastProbeOptions): ContrastProbe {
  const { gl, textColor, host, selector = FIELD_SCOPE_SELECTOR } = options;
  const fallbackLuminance = relativeLuminance(textColor);
  const pixel = new Uint8Array(4);

  /**
   * The rects of the actual lines of text inside a block.
   *
   * A8.4 sets a floor for "every body-size string over the field", and a string
   * is where the glyphs are — not the bounding box of the element that contains
   * them. Sampling boxes measures empty margins and gutters as though type sat
   * there, which reports failures that do not exist as readily as it hides ones
   * that do. A `Range` over the block's contents gives one rect per rendered
   * line, which is exactly the set A8.4 names.
   */
  const textLines = (node: HTMLElement): readonly DOMRect[] => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = Array.from(range.getClientRects()).filter(
      (rect) => rect.width >= MIN_LINE_WIDTH && rect.height > 0,
    );
    range.detach();
    if (rects.length <= MAX_LINES_PER_BLOCK) return rects;
    const step = (rects.length - 1) / (MAX_LINES_PER_BLOCK - 1);
    return Array.from({ length: MAX_LINES_PER_BLOCK }, (_unused, i) => rects[Math.round(i * step)]);
  };

  /** Each block is scored against its own ink, not against one assumed value. */
  const inkLuminance = (node: HTMLElement): number => {
    const parsed = parseCssColor(window.getComputedStyle(node).color);
    return parsed ? relativeLuminance(parsed) : fallbackLuminance;
  };

  const readLuminance = (pixelX: number, pixelY: number): number => {
    gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    return 0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2];
  };

  const measureSpread = (viewportWidth: number, viewportHeight: number, dpr: number): number => {
    let min = 255;
    let max = 0;
    for (let i = 0; i < SPREAD_GRID; i += 1) {
      for (let j = 0; j < SPREAD_GRID; j += 1) {
        const x = Math.round(((i + 0.5) / SPREAD_GRID) * viewportWidth * dpr);
        const y = Math.round(((j + 0.5) / SPREAD_GRID) * viewportHeight * dpr);
        const luminance = readLuminance(x, y);
        min = Math.min(min, luminance);
        max = Math.max(max, luminance);
      }
    }
    return max - min;
  };

  const sample = (viewportWidth: number, viewportHeight: number, dpr: number): ContrastReport => {
    const bandsRaw = host.dataset[BANDS_ATTRIBUTE];
    const hasMask = bandsRaw !== undefined;
    const bands = parseBands(bandsRaw);
    let worst = Number.POSITIVE_INFINITY;
    let worstSample: ContrastSample | null = null;
    let samples = 0;
    let elements = 0;
    let shielded = 0;
    const failures: ContrastSample[] = [];
    const seen = new Set<HTMLElement>();

    for (const scope of document.querySelectorAll<HTMLElement>(selector)) {
      for (const node of textElements(scope)) {
        // Nested scopes would otherwise enumerate the same element twice.
        if (seen.has(node)) continue;
        seen.add(node);

        const style = window.getComputedStyle(node);
        if (!isRendered(style)) continue;
        // WCAG 1.4.3 sets no floor for an inactive control's label.
        if (isInactiveControl(node)) continue;
        // An opaque CSS fill between the string and the field means the field
        // is not what it is composited over. Counted, never silently dropped.
        if (isShielded(node, scope)) {
          shielded += 1;
          continue;
        }

        const carve = node.closest<HTMLElement>(SCRIM_SELECTOR);
        // Skip what the COMPOSITE skips, and only that: a container-shaped
        // scrim is not carved at runtime, and `field-contrast.spec.ts` has a
        // dedicated gate that fails on those at five widths. Measuring them
        // here as well would report one defect as two.
        //
        // A missing carve is NOT skipped — that is the case this enumeration
        // exists to catch, and it is measured against the uncarved field
        // exactly as the visitor sees it.
        if (carve && !isLeafScrim(carve, SCRIM_SELECTOR)) continue;
        if (carve && !isCarvableScrim(carve, viewportHeight)) continue;

        const textLuminance = inkLuminance(node);
        const floor = contrastFloorFor(style);
        let worstHere: ContrastSample | null = null;

        for (const line of textLines(node)) {
          if (line.bottom < 0 || line.top > viewportHeight) continue;

          for (let i = 0; i < SAMPLES_PER_LINE; i += 1) {
            const x = line.left + (line.width * (i + 0.5)) / SAMPLES_PER_LINE;
            const y = line.top + line.height / 2;
            if (x < 0 || x > viewportWidth || y < 0 || y > viewportHeight) continue;
            if (!isPaintedAt(bands, y / viewportHeight, hasMask)) continue;

            // WebGL's origin is bottom-left; the DOM's is top-left.
            gl.readPixels(
              Math.round(x * dpr),
              Math.round((viewportHeight - y) * dpr),
              1,
              1,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              pixel,
            );

            const ratio = contrastRatio(
              textLuminance,
              relativeLuminance([pixel[0] / 255, pixel[1] / 255, pixel[2] / 255]),
            );
            samples += 1;
            const here: ContrastSample = {
              ratio,
              floor,
              rgb: [pixel[0], pixel[1], pixel[2]],
              ink: style.color,
              scrim: carve?.dataset.scrim ?? "(none)",
              label: (node.textContent ?? "").trim().slice(0, 48),
            };
            if (!worstHere || ratio < worstHere.ratio) worstHere = here;
            if (ratio < worst) {
              worst = ratio;
              worstSample = here;
            }
          }
        }

        if (!worstHere) continue;
        elements += 1;
        if (worstHere.ratio < floor) failures.push(worstHere);
      }
    }

    return {
      worst: samples > 0 ? worst : null,
      samples,
      worstSample,
      failures,
      elements,
      shielded,
      luminanceSpread: measureSpread(viewportWidth, viewportHeight, dpr),
    };
  };

  return { sample };
}
