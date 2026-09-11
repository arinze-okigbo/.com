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
