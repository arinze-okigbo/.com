/**
 * The two `padX,padY,amount` carves this section authors — `docs/04 §3.5` A8.3.
 *
 * Their own module, and not part of `./tokens`, for one reason: `CeremonyMount`
 * is a `"use client"` component in the FIRST-LOAD chunk, and it needs
 * `BLOCK_SCRIM` for its resting-state block. Importing `./tokens` for it would
 * drag the whole token sheet — every `CSSProperties` object, the verdict
 * palette — into first load to carry one 12-character string.
 *
 * `./tokens` re-exports both, so every existing import site is unchanged and
 * there is still exactly one definition of each value.
 */

/**
 * The block carve. Goes on TEXT BLOCKS and never on the `<section>` or a
 * `<details>`: `#ceremony` is 2,066px tall, so a container-level rect carves the
 * field to its floor for the section's whole length, extinguishes the receding
 * plane `docs/15 §3` row 4 asks for, and then inflates every contrast reading
 * taken over it — a dead field AND a better number, which is the one failure
 * that looks like success from both directions at once.
 *
 * THE PREDICATE IS TEXT COVERAGE, NOT HEIGHT. `three/field/scrim.ts`'s
 * `isCarvableScrim()` sums the line rects `Range.getClientRects()` returns and
 * divides by the box height: prose lands near 1, a container near 0, floor 0.5.
 * Real prose legitimately exceeds a viewport and carving it is correct.
 */
export const BLOCK_SCRIM = "30,18,0.94";

/**
 * The heading and eyebrow carve. Tighter vertically; these are one or two lines,
 * not prose.
 *
 * Every `<summary>` over the field takes this. Two of them shipped without it,
 * in `--color-accent` on the brightest part of the lattice, and measured
 * **1.81:1** — gold on gold. A `<summary>` is a text block like any other and
 * the `<details>` around it is not one, so the carve goes on the summary.
 */
export const HEADING_SCRIM = "30,14,0.94";
