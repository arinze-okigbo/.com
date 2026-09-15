/**
 * Turning a thrown value into something nameable.
 *
 * The *explanations* are copy and live in `@/content/ceremony`; this module only
 * extracts the `DOMException` name a browser chose and whatever message came
 * with it, so nothing here has to be translated or rewritten to change wording.
 */

export interface DescribedError {
  /** `DOMException.name`, or the constructor name, or `"Error"`. */
  readonly name: string;
  /** The thrown value's own message, when it has one. */
  readonly detail: string | null;
}

/** Narrows an unknown thrown value without ever using `any`. */
export function describeCeremonyError(error: unknown): DescribedError {
  if (error instanceof Error) {
    return { name: error.name || "Error", detail: error.message || null };
  }
  if (typeof error === "string" && error.length > 0) {
    return { name: "Error", detail: error };
  }
  return { name: "Error", detail: null };
}
