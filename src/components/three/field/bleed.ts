import { FIELD_SECTION_ATTRIBUTE } from "./attention";

/**
 * A8.2's stated consequence: **in light mode the field is sectioned, not
 * continuous.**
 *
 * The field's ground is `--field-ink` in light mode and dark mode alike,
 * because `#D1A954` measures 2.16:1 on a near-white page and cannot carry
 * emissive weight there. The price is that a light-mode page which keeps its
 * own ladder outside the stage cannot have a near-black surface behind it:
 * `#1A1A1A` body copy on `#0A0908` is **1.14:1**, worse than the 1.44:1 failure
 * this work exists to correct.
 *
 * So in light mode the field runs at full energy behind the `.stage` sections —
 * `hero`, `attestation`, `ceremony` — and bleeds out to `--color-background`
 * behind the rest. docs/15 §2.11: "bleed out, don't stop". In dark mode the
 * whole document is the stage and no mask is applied at all.
 *
 * This is a CSS mask on the host, not a second GL pass, because it must cover
 * the **poster** as well as the canvas — they are one artifact on two surfaces
 * (A8.6) and a mask that only reached the live frame would section the field
 * for some visitors and not others.
 */

/** The sections the field is licensed to paint behind in light mode. */
const STAGE_SECTIONS: ReadonlySet<string> = new Set(["hero", "attestation", "ceremony"]);

/**
 * How far the field's fade extends past a stage section's edge, in viewport
 * fractions — and it is capped, in `featherFor()`, to fit the section gap.
 *
 * ## It used to feather INWARD, and that ate the last block of every stage
 *
 * The inward direction was chosen for a real reason: feathering outward puts
 * partially-painted field under the first lines of the next section, and in
 * light mode those lines are on the page ladder — measured at the
 * `#attestation` / `#work` boundary as `#1A1A1A` over the field at **1.14:1**.
 *
 * But inward has a cost that was not measured: 0.14 of a 844px viewport is
 * 118px, so the last 118px of every stage section faded out **underneath its
 * own content**. The hero's closing line sat in it — the résumé affordance
 * before this pass, the field readout after it — as `--field-fg-muted` over a
 * ground halfway between `#0A0908` and `#FDFDFC`, which is about **1.3:1**.
 * The A8.4 probe could not see it either: `isPaintedAt` treats the band edges
 * as where the field stops, so those samples were skipped as unpainted while
 * the screen showed type fading into a gradient.
 *
 * ## Outward, capped to the gap
 *
 * The fade now happens entirely OUTSIDE the section, in the `--section-gap`
 * that separates it from the next one — which is empty by construction, since
 * the gap is the next section's `padding-block-start`. `featherFor()` caps the
 * fade at 75% of that gap, so it always reaches zero before the next section's
 * first line, and a stage section is fully lit edge to edge underneath every
 * one of its own blocks.
 *
 * Both constraints are met at once, which is why this replaces the inward rule
 * rather than trading against it.
 */
const FEATHER = 0.14;

/** Cap: the fade must reach zero inside the gap, with room to spare. */
const GAP_FRACTION = 0.75;

/**
 * The feather for this viewport, in viewport fractions.
 *
 * `--section-gap` is 72px at the base scale, 96px from `md` and 144px from
 * `lg`, and the cap binds at every one of them: 118px of fade wanted against
 * 54px available on mobile, 126px against 108px on desktop. The proportional
 * term is therefore a ceiling the layout never reaches, which is the safe
 * direction — a shorter fade is a visual compromise, an uncapped one puts lit
 * field under the next section's first line.
 */
export function featherFor(viewportHeight: number, sectionGapPx: number): number {
  const height = Math.max(viewportHeight, 1);
  const proportional = FEATHER * height;
  const capped =
    sectionGapPx > 0 ? Math.min(proportional, sectionGapPx * GAP_FRACTION) : proportional;
  return capped / height;
}

/** Reads `--section-gap` off the root, in CSS pixels. 0 when it is unset. */
function readSectionGap(): number {
  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--section-gap")
    .trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
}

export interface BleedMask {
  /** Re-reads the stage rects and writes the mask. Cheap when nothing changed. */
  readonly update: () => void;
  /** Removes the mask. */
  readonly dispose: () => void;
}

/**
 * Published on `<html>` as `data-field-ground`, so anything fixed over the
 * field — the HUD — can take its colour from what is actually behind it.
 *
 * Without this the HUD reads `--field-fg-muted` `#9C978C` on whatever the page
 * ground happens to be, which over light mode's `#FCFCFC` is **2.4:1**. That is
 * the same class of mistake as the field it annotates, at a smaller size, and
 * it is not fixed by choosing a different single colour: the ground genuinely
 * changes underneath it as the page scrolls.
 */
export const GROUND_ATTRIBUTE = "fieldGround";
export type FieldGround = "stage" | "page";

/** The corner the HUD occupies, in viewport fractions. */
const HUD_PROBE_Y = 0.94;

/**
 * The painted bands, published on the host as `data-field-bands`.
 *
 * The A8.4 probe reads back the **canvas framebuffer**, which always holds the
 * full-bleed composite — the mask is a CSS property of the host and hides those
 * pixels without removing them. So without this the probe scores light mode's
 * page ink against a field the visitor cannot see and reports 1.14:1 where the
 * screen shows 5.71:1. A harness that cries wolf gets switched off, which is
 * how the thing it guards ships broken.
 *
 * Empty means "no mask, everything is painted".
 */
export const BANDS_ATTRIBUTE = "fieldBands";

/** Parses `data-field-bands` back into viewport-fraction pairs. */
export function parseBands(raw: string | undefined): readonly (readonly [number, number])[] {
  if (!raw) return [];
  return raw
    .split(" ")
    .map((pair) => pair.split(":").map(Number))
    .filter(
      (pair): pair is [number, number] =>
        pair.length === 2 && pair.every((value) => Number.isFinite(value)),
    );
}

/** True when the field actually paints at this viewport fraction. */
export function isPaintedAt(
  bands: readonly (readonly [number, number])[],
  y: number,
  hasMask: boolean,
): boolean {
  if (!hasMask) return true;
  // The band edges are exactly where the mask reaches zero, so no expansion:
  // anything outside a band is over no field at all.
  return bands.some(([top, bottom]) => y >= top && y <= bottom);
}

interface MaskStyle extends CSSStyleDeclaration {
  webkitMaskImage: string;
}

function isLightTheme(): boolean {
  const declared = document.documentElement.dataset.theme;
  if (declared === "light") return true;
  if (declared === "dark") return false;
  return !window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * Builds a vertical mask: fully opaque over every stage section currently on
 * screen, and fading to nothing OUTSIDE it, across the section gap.
 *
 * The band itself is the section's own rect and it is painted at full strength
 * from edge to edge — that is what keeps the section's last block off a
 * gradient. The `feather` is spent above `top` and below `bottom`, in space the
 * layout leaves empty.
 */
export function buildMaskImage(
  bands: readonly (readonly [number, number])[],
  feather = FEATHER,
): string {
  if (bands.length === 0) return "linear-gradient(#0000, #0000)";
  const stops: string[] = [];
  for (const [top, bottom] of bands) {
    stops.push(
      `#0000 ${(clamp01(top - feather) * 100).toFixed(2)}%`,
      `#000 ${(clamp01(top) * 100).toFixed(2)}%`,
      `#000 ${(clamp01(bottom) * 100).toFixed(2)}%`,
      `#0000 ${(clamp01(bottom + feather) * 100).toFixed(2)}%`,
    );
  }
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/** Merges overlapping or touching bands so the gradient stops stay monotonic. */
export function mergeBands(
  bands: readonly (readonly [number, number])[],
  /**
   * How close two bands may be before they are one. Callers pass TWICE the
   * feather, because the fade now runs outside each band: two bands closer than
   * that would interleave a rising and a falling stop and the gradient would
   * stop being monotonic.
   */
  tolerance = FEATHER,
): readonly (readonly [number, number])[] {
  const sorted = [...bands].sort((a, b) => a[0] - b[0]);
  const merged: (readonly [number, number])[] = [];
  for (const band of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && band[0] <= previous[1] + tolerance) {
      merged[merged.length - 1] = [previous[0], Math.max(previous[1], band[1])];
      continue;
    }
    merged.push(band);
  }
  return merged;
}

export function createBleedMask(host: HTMLElement): BleedMask {
  let applied = "";

  const setGround = (ground: FieldGround): void => {
    if (document.documentElement.dataset[GROUND_ATTRIBUTE] === ground) return;
    document.documentElement.dataset[GROUND_ATTRIBUTE] = ground;
  };

  const clear = (): void => {
    setGround("stage");
    delete host.dataset[BANDS_ATTRIBUTE];
    if (applied === "") return;
    applied = "";
    host.style.maskImage = "";
    (host.style as MaskStyle).webkitMaskImage = "";
  };

  const update = (): void => {
    if (!isLightTheme()) {
      clear();
      return;
    }

    const viewportHeight = Math.max(window.innerHeight, 1);
    const bands: (readonly [number, number])[] = [];
    for (const node of document.querySelectorAll<HTMLElement>(`[${FIELD_SECTION_ATTRIBUTE}]`)) {
      const state = node.dataset.fieldSection;
      if (!state || !STAGE_SECTIONS.has(state)) continue;
      const rect = node.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > viewportHeight) continue;
      bands.push([rect.top / viewportHeight, rect.bottom / viewportHeight]);
    }

    const feather = featherFor(viewportHeight, readSectionGap());
    const merged = mergeBands(bands, feather * 2);
    setGround(
      merged.some(([top, bottom]) => HUD_PROBE_Y >= top && HUD_PROBE_Y <= bottom)
        ? "stage"
        : "page",
    );

    host.dataset[BANDS_ATTRIBUTE] = merged
      .map(([top, bottom]) => `${top.toFixed(4)}:${bottom.toFixed(4)}`)
      .join(" ");

    const next = buildMaskImage(merged, feather);
    if (next === applied) return;
    applied = next;
    host.style.maskImage = next;
    (host.style as MaskStyle).webkitMaskImage = next;
  };

  return {
    update,
    dispose: () => {
      clear();
      delete host.dataset[BANDS_ATTRIBUTE];
      delete document.documentElement.dataset[GROUND_ATTRIBUTE];
    },
  };
}
