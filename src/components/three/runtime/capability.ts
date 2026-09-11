import { MIN_CORES, MIN_MEMORY_GB } from "../constants";

/**
 * The budget gates from docs/02 §8.2, in order. Every one of them resolves to
 * "leave the poster up", which is why there is only one fallback surface.
 *
 * Reduced motion is checked first and separately so those visitors never
 * trigger the chunk download — respecting the preference before charging for it.
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
 * Windows High Contrast Mode and equivalents.
 *
 * A WebGL surface is not subject to the forced palette at all — the GPU paints
 * exactly the colours the shader asks for — so with the scene live, a visitor in
 * HCM got a canvas of author-coloured grey points on a system-coloured page,
 * which is precisely the outcome the `forced-colors` rule in `globals.css §11`
 * exists to prevent (docs/08-review-accessibility-c2 N3). Declining to mount is
 * the same bargain reduced motion already gets: the poster is an SVG whose ink
 * is an inherited `color`, so the system palette can re-colour it.
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
