import { CAMERA_HEIGHT, FIELD_TILT_X, FLARE_EVENT } from "../constants";

/**
 * Which section owns the field, and the one-shot flare the ceremony fires.
 *
 * docs/15 §2.11 and §6 Lane W. Sections carry `data-field-section="<name>"`;
 * an unrecognised name resolves to the low-energy `work` state rather than
 * throwing, so adding a section can never break the field.
 */

export interface FieldAttentionState {
  /** Focus lobe centre in uv. The ground concentrates light here. */
  readonly focus: readonly [number, number];
  /** Overall emission multiplier. */
  readonly energy: number;
  /** Ground filament flow rate. */
  readonly flow: number;
  /** Camera dolly, in world units toward the plane. */
  readonly dolly: number;
  /** Field yaw, radians. */
  readonly yaw: number;
  /** Horizon lift position in uv-y. */
  readonly horizon: number;
  /** Camera height, world units. */
  readonly cameraY: number;
  /** Field tilt about x, radians. */
  readonly tilt: number;
}

export const FIELD_SECTION_ATTRIBUTE = "data-field-section";

/**
 * The named states. `attestation` is the Act II framing the whole port exists
 * to stage, and it is also the framing `AttestationPoster` is a still of, so
 * its `cameraY` and `tilt` are the shared constants rather than literals.
 */
const SECTION_STATES: Readonly<Record<string, FieldAttentionState>> = {
  hero: {
    focus: [0.62, 0.5],
    energy: 1.3,
    flow: 1.0,
    dolly: 0.0,
    yaw: -0.14,
    horizon: 0.56,
    cameraY: 0.3,
    tilt: -1.24,
  },
  attestation: {
    focus: [0.5, 0.42],
    energy: 1.3,
    flow: 1.18,
    dolly: 0.3,
    yaw: 0.11,
    horizon: 0.43,
    cameraY: CAMERA_HEIGHT,
    tilt: FIELD_TILT_X,
  },
  ceremony: {
    focus: [0.5, 0.46],
    energy: 1.22,
    flow: 1.24,
    dolly: 0.24,
    yaw: 0.04,
    horizon: 0.48,
    cameraY: 0.72,
    tilt: -1.36,
  },
  work: {
    focus: [0.62, 0.22],
    energy: 0.88,
    flow: 0.86,
    dolly: 0.05,
    yaw: -0.07,
    horizon: 0.7,
    cameraY: 0.08,
    tilt: -1.14,
  },
  projects: {
    focus: [0.38, 0.24],
    energy: 0.84,
    flow: 0.82,
    dolly: 0.02,
    yaw: 0.06,
    horizon: 0.72,
    cameraY: 0.1,
    tilt: -1.12,
  },
  about: {
    focus: [0.56, 0.3],
    energy: 0.8,
    flow: 0.78,
    dolly: 0.0,
    yaw: -0.04,
    horizon: 0.74,
    cameraY: 0.14,
    tilt: -1.1,
  },
  contact: {
    focus: [0.5, 0.36],
    energy: 0.96,
    flow: 0.9,
    dolly: 0.08,
    yaw: 0.0,
    horizon: 0.66,
    cameraY: 0.2,
    tilt: -1.18,
  },
};

const DEFAULT_SECTION = "work";

/** The state for a section name, never undefined. */
export function resolveSectionState(name: string | undefined): FieldAttentionState {
  if (name && name in SECTION_STATES) return SECTION_STATES[name];
  return SECTION_STATES[DEFAULT_SECTION];
}

/** Default flare strength and duration if the ceremony sends neither. */
const FLARE_DEFAULT_AMOUNT = 1.6;
const FLARE_DEFAULT_MS = 900;
const FLARE_MAX_AMOUNT = 2.5;
const FLARE_MAX_MS = 4000;

interface FlarePayload {
  readonly amount?: unknown;
  readonly ms?: unknown;
}

/**
 * Reads the CustomEvent detail defensively. The ceremony is a separate lane and
 * may not exist at all; the field must never assume it does, and must never
 * trust the numbers it sends without bounding them — an unbounded `amount`
 * would blow past every A8.4 measurement in one frame.
 */
function readFlarePayload(detail: unknown): { amount: number; ms: number } {
  const payload = (detail ?? {}) as FlarePayload;
  const amount = typeof payload.amount === "number" ? payload.amount : FLARE_DEFAULT_AMOUNT;
  const ms = typeof payload.ms === "number" ? payload.ms : FLARE_DEFAULT_MS;
  return {
    amount: Math.min(Math.max(Number.isFinite(amount) ? amount : 1, 1), FLARE_MAX_AMOUNT),
    ms: Math.min(Math.max(Number.isFinite(ms) ? ms : FLARE_DEFAULT_MS, 1), FLARE_MAX_MS),
  };
}

export interface FieldAttention {
  /** The state of whichever tracked section currently owns the viewport. */
  readonly current: () => FieldAttentionState;
  /**
   * The flare multiplier for this instant, 1 at rest. Advanced by the render
   * loop, so a backgrounded tab cannot leave a pulse half-finished.
   */
  readonly flare: (elapsedMs: number) => number;
  readonly dispose: () => void;
}

/**
 * Observes `[data-field-section]` and listens for `field:flare`.
 *
 * The flare is fire-and-forget in both directions: the ceremony dispatches on
 * `document` and never learns whether anything heard it, and this listener is
 * simply absent when the field did not mount.
 */
export function createFieldAttention(): FieldAttention {
  let active: FieldAttentionState = resolveSectionState(undefined);

  const observer = new IntersectionObserver(
    (entries) => {
      let best: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      }
      if (!best) return;
      active = resolveSectionState(
        (best.target as HTMLElement).dataset.fieldSection ?? best.target.id,
      );
    },
    { threshold: [0.25, 0.5, 0.75] },
  );

  for (const node of document.querySelectorAll(`[${FIELD_SECTION_ATTRIBUTE}]`)) {
    observer.observe(node);
  }

  let flareAmount = 1;
  let flareDurationMs = 0;
  let flareRemainingMs = 0;

  const onFlare = (event: Event): void => {
    const { amount, ms } = readFlarePayload((event as CustomEvent<unknown>).detail);
    flareAmount = amount;
    flareDurationMs = ms;
    flareRemainingMs = ms;
  };
  document.addEventListener(FLARE_EVENT, onFlare);

  const flare = (elapsedMs: number): number => {
    if (flareRemainingMs <= 0) return 1;
    flareRemainingMs = Math.max(flareRemainingMs - elapsedMs, 0);
    const t = flareRemainingMs / flareDurationMs;
    // Fast attack, long decay — a pulse of light, not a fade-in.
    const shape = t * t * (3 - 2 * t);
    return 1 + (flareAmount - 1) * shape;
  };

  return {
    current: () => active,
    flare,
    dispose: () => {
      observer.disconnect();
      document.removeEventListener(FLARE_EVENT, onFlare);
    },
  };
}
