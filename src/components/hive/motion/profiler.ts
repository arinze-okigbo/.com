import type { ProfilerOnRenderCallback } from "react";

export type IslandTiming = {
  name: string;
  commits: number;
  actualDuration: number;
  baseDuration: number;
  totalDuration: number;
  lastPhase: string;
};
const timings = new Map<string, IslandTiming>();

/** React calls this after commits. It never updates React state or sends telemetry. */
export const recordIslandRender: ProfilerOnRenderCallback = (
  name,
  phase,
  actualDuration,
  baseDuration,
) => {
  const previous = timings.get(name);
  timings.set(name, {
    name,
    commits: (previous?.commits || 0) + 1,
    actualDuration,
    baseDuration,
    totalDuration: (previous?.totalDuration || 0) + actualDuration,
    lastPhase: phase,
  });
};

export function getIslandTimings(names?: ReadonlySet<string>): IslandTiming[] {
  return Array.from(timings.values())
    .filter((timing) => !names || names.has(timing.name))
    .map((timing) => ({ ...timing }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
