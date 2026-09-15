/**
 * The lattice is an enhancement: every failure path falls back to the poster
 * rather than surfacing anything to the visitor. That must not mean the error
 * disappears — it is reported on the development console, where the person who
 * can fix it will see it, and stripped from production builds.
 */
export function reportSceneFailure(stage: string, cause: unknown): void {
  if (process.env.NODE_ENV === "production") return;
  console.warn(`[attestation] falling back to the poster — ${stage}`, cause);
}

/**
 * A `data-scrim` on something section-sized carves a rounded box bigger than
 * the viewport and puts the field out. The contrast numbers taken over it then
 * *improve*, because every string is measured against a floor the scrim itself
 * created — so this is exactly the defect that does not announce itself.
 *
 * Development only, like every other report here.
 */
export function reportScrimMisuse(
  node: Element,
  height: number,
  viewportHeight: number,
  coverage: number,
): void {
  if (process.env.NODE_ENV === "production") return;
  const id = node.id ? `#${node.id}` : node.tagName.toLowerCase();
  console.warn(
    `[field] ${id} declares data-scrim on a ${Math.round(height)}px box ` +
      `(${(height / viewportHeight).toFixed(1)} viewports) that is only ` +
      `${Math.round(coverage * 100)}% lines of text. A scrim carves a text block, not a ` +
      `container: this one would extinguish the field across a screenful and flatter every ` +
      `contrast measurement taken over it. It is being skipped. Move data-scrim onto the ` +
      `text blocks inside it (docs/04 A8.3).`,
  );
}
