"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactElement,
} from "react";

import { BLOCK_SCRIM } from "./scrims";

/**
 * The client boundary — deliberately the only thing this section contributes to
 * the page's own JavaScript bundle.
 *
 * It holds no ceremony logic, no parsers and no copy beyond two control labels.
 * Everything real lives in `./CeremonyPanel`, which is reached exclusively
 * through a dynamic `import()` and therefore lands in its own chunk.
 *
 * Loading is gated twice: the visitor must approach the section
 * (`IntersectionObserver`), and the import then waits for idle so it never
 * competes with LCP. The button is the explicit affordance — and the retry if
 * the chunk fails. Loading the chunk prompts nothing; only the Run button
 * inside the panel can reach `navigator.credentials`.
 */

/** One viewport of warning, so the chunk is ready as the section arrives. */
const APPROACH_ROOT_MARGIN = "200px 0px";
const IDLE_TIMEOUT_MS = 2000;

type PanelComponent = ComponentType<Record<string, never>>;

interface IdleWindow {
  readonly requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  readonly cancelIdleCallback?: (handle: number) => void;
}

function whenIdle(callback: () => void): () => void {
  const idle = window as unknown as IdleWindow;
  if (typeof idle.requestIdleCallback === "function") {
    const handle = idle.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return () => idle.cancelIdleCallback?.(handle);
  }
  const timer = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timer);
}

export interface CeremonyMountProps {
  /** Button label. Passed in so no copy lives in the first-load chunk. */
  readonly loadLabel: string;
  readonly loadHint: string;
}

export function CeremonyMount({ loadLabel, loadHint }: CeremonyMountProps): ReactElement {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [Panel, setPanel] = useState<PanelComponent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasStartedRef = useRef(false);

  const load = useCallback((): void => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    setIsLoading(true);

    void import("./CeremonyPanel")
      .then((module) => {
        setPanel(() => module.CeremonyPanel as PanelComponent);
      })
      .catch(() => {
        // The chunk did not arrive. The server-rendered explanation above is
        // still on the page, so allow another attempt rather than dead-ending.
        hasStartedRef.current = false;
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor || typeof IntersectionObserver !== "function") return;

    let cancelIdle: (() => void) | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        cancelIdle = whenIdle(load);
      },
      { rootMargin: APPROACH_ROOT_MARGIN, threshold: 0 },
    );
    observer.observe(anchor);

    return () => {
      observer.disconnect();
      cancelIdle?.();
    };
  }, [load]);

  return (
    <div ref={anchorRef}>
      {Panel ? (
        <Panel />
      ) : (
        // Carved like every other text block over the field (A8.3). Without it
        // the load affordance and its hint sat on whatever the lattice was
        // emitting behind `#ceremony`, which is the section's brightest region.
        // This is the resting state a visitor sees first, so it is the one that
        // has to be legible before anything is clicked.
        <p data-scrim={BLOCK_SCRIM} style={{ marginBlockStart: "var(--rhythm-title)" }}>
          <button type="button" className="btn btn--secondary" onClick={load} disabled={isLoading}>
            {loadLabel}
          </button>
          <span
            style={{
              display: "block",
              marginBlockStart: "var(--rhythm-meta)",
              fontSize: "var(--text-caption)",
              lineHeight: "var(--text-caption--line-height)",
              color: "var(--color-foreground-secondary)",
            }}
          >
            {loadHint}
          </span>
        </p>
      )}
    </div>
  );
}
