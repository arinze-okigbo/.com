import {
  DPR_MAX,
  DPR_MAX_WITH_BLOOM,
  HIGH_DENSITY_CORE_THRESHOLD,
  HIGH_DENSITY_MEMORY_GB,
  MIN_CORES,
  MIN_MEMORY_GB,
} from "../constants";
import type { BloomTier } from "../field/post-chain";
import type { DeviceProfile } from "../lattice/seed";

/**
 * The budget gates from docs/02 §8.2, in order, plus the field's own gate 0.
 * Every one of them resolves to "leave the poster up", which is why there is
 * only one fallback surface.
 *
 * Reduced motion is checked first and separately so those visitors never
 * trigger the chunk download — respecting the preference before charging for
 * it. Under `prefers-reduced-motion: reduce` **zero 3D bytes are fetched**: the
 * dynamic `import()` is behind this check, not inside it.
 */

interface NetworkInformationLike {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

interface NavigatorWithHints extends Navigator {
  readonly connection?: NetworkInformationLike;
  readonly deviceMemory?: number;
}

export function isReducedMotionPreferred(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Calls back when the reduced-motion preference is turned on *after* mount, so
 * a live scene can be disposed and the poster cross-faded back (docs/04 §12
 * M11). Ignores the transition to `no-preference`: a visitor who has asked for
 * less motion once should not have a WebGL context started under them because
 * a system setting flickered.
 */
export function watchReducedMotion(onEnabled: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handle = (event: MediaQueryListEvent): void => {
    if (event.matches) onEnabled();
  };
  query.addEventListener("change", handle);
  return () => query.removeEventListener("change", handle);
}

/**
 * Windows High Contrast Mode and equivalents.
 *
 * A WebGL surface is not subject to the forced palette at all — the GPU paints
 * exactly the colours the shader asks for — so with the scene live, a visitor in
 * HCM gets a canvas of author-coloured light on a system-coloured page, which is
 * what the `forced-colors` rule in `globals.css` exists to prevent. Declining to
 * mount is the same bargain reduced motion already gets: the poster is an SVG
 * with a `currentColor` hairline reduction the system palette can re-colour.
 */
export function isForcedColorsActive(): boolean {
  return window.matchMedia("(forced-colors: active)").matches;
}

function isConnectionConstrained(navigatorRef: NavigatorWithHints): boolean {
  const connection = navigatorRef.connection;
  if (!connection) return false;
  if (connection.saveData === true) return true;
  return connection.effectiveType !== undefined && /2g/.test(connection.effectiveType);
}

function isDeviceBelowFloor(navigatorRef: NavigatorWithHints): boolean {
  if ((navigatorRef.hardwareConcurrency ?? MIN_CORES) < MIN_CORES) return true;
  const memory = navigatorRef.deviceMemory;
  return memory !== undefined && memory < MIN_MEMORY_GB;
}

/**
 * Probes WebGL2 on a throwaway canvas and immediately releases the context, so
 * the probe cannot count against the browser's live-context limit.
 */
function isWebGl2Available(): boolean {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    if (!gl) return false;
    const loseContext = gl.getExtension("WEBGL_lose_context");
    loseContext?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** True when every gate after reduced motion passes. */
export function canRunScene(): boolean {
  const navigatorRef = navigator as NavigatorWithHints;
  if (isConnectionConstrained(navigatorRef)) return false;
  if (isDeviceBelowFloor(navigatorRef)) return false;
  return isWebGl2Available();
}

/** The cores and memory the density and bloom tiers are chosen from. */
export function readDeviceProfile(): DeviceProfile {
  const navigatorRef = navigator as NavigatorWithHints;
  return {
    cores: navigatorRef.hardwareConcurrency,
    memoryGb: navigatorRef.deviceMemory,
  };
}

/**
 * Bloom tier. The blur ladder is fillrate-quadratic in DPR and resolution, so
 * it is the first thing that costs a mid-tier device its frame budget and the
 * first thing gated. Tier A — the two-lobe sprite — is always on and carries
 * most of the look on its own, so `"off"` is a reduction, not an absence.
 */
export function resolveBloomTier(profile: DeviceProfile): BloomTier {
  const cores = profile.cores ?? 0;
  const memoryGb = profile.memoryGb ?? HIGH_DENSITY_MEMORY_GB;
  if (cores >= HIGH_DENSITY_CORE_THRESHOLD && memoryGb >= HIGH_DENSITY_MEMORY_GB) return "full";
  if (cores >= MIN_CORES) return "reduced";
  return "off";
}

/** docs/02 §8.3 — hard DPR cap, tightened when the blur ladder is running. */
export function resolveDpr(hasBloom: boolean): number {
  const cap = hasBloom ? DPR_MAX_WITH_BLOOM : DPR_MAX;
  return Math.min(window.devicePixelRatio || 1, cap);
}

/** True on devices with no hover-capable pointer — parallax is not attached at all. */
export function isCoarsePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Defers work until the main thread is free — after LCP has settled on any
 * realistic connection. Falls back to a timeout where the API is missing.
 */
export function whenIdle(callback: () => void, timeout: number): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(() => callback(), { timeout });
    return () => window.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(callback, Math.min(timeout, 200));
  return () => window.clearTimeout(handle);
}
