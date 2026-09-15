"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "./motion/preferences";

export type BuildCommit = {
  commitSHA: string;
  timestamp: string;
  subject: string;
  changedFiles: string[];
};
export type BuildHistorySnapshot = {
  capturedAt: string | null;
  baseCommit: string;
  headCommit: string | null;
  commits: BuildCommit[];
};

/** A deterministic playback of recorded commits, never simulated agent activity. */
export function BuildHistory({ history }: { history: BuildHistorySnapshot }) {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const count = history.commits.length;
  const index = Math.min(position, Math.max(0, count - 1));
  const commit = history.commits[index];
  const running = playing && !reduced && count > 1;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      const next = Math.min(index + 1, count - 1);
      setPosition(next);
      if (next === count - 1) setPlaying(false);
    }, 1800);
    return () => clearInterval(timer);
  }, [running, index, count]);

  const step = (next: number) => {
    setPlaying(false);
    setPosition(Math.max(0, Math.min(next, count - 1)));
  };
  if (!commit) return (
    <section className="hive-build-replay" aria-labelledby="build-history-heading">
      <p className="eyebrow">RECORDED BUILD COMMITS</p>
      <h3 id="build-history-heading">The record starts with a commit.</h3>
      <p>No commits from this build have been captured yet. The task record shows the current work; committed changes will appear here after capture.</p>
      <a href="https://github.com/arinze-okigbo/.com/commits" target="_blank" rel="noreferrer">Open the repository history ↗</a>
    </section>
  );
  return (
    <section className="hive-build-replay" aria-labelledby="build-history-heading">
      <p className="eyebrow">RECORDED BUILD COMMITS</p>
      <h3 id="build-history-heading">Follow the changes.</h3>
      <p className="hive-lab-caption">A captured Git history, in commit order. Playback advances through real changes; it is not a live agent feed or a recording of agent messages.</p>
      <div className="hive-replay-tabs" role="group" aria-label="Build history playback">
        <button type="button" disabled={index === 0} onClick={() => step(index - 1)}>← Previous</button>
        <button type="button" disabled={reduced || count < 2} aria-pressed={running} onClick={() => {
          if (!playing && index === count - 1) setPosition(0);
          setPlaying(!playing);
        }}>{running ? "Pause playback" : "Play recorded commits"}</button>
        <button type="button" disabled={index === count - 1} onClick={() => step(index + 1)}>Next →</button>
      </div>
      {reduced && <p className="hive-lab-caption">Reduced motion is on. Use Previous, Next, or the timeline to inspect each commit.</p>}
      <label htmlFor="build-history-position" className="eyebrow">COMMIT {index + 1} OF {count}</label>
      <input id="build-history-position" type="range" min={0} max={Math.max(0, count - 1)} value={index} disabled={count < 2} onChange={event => step(Number(event.target.value))} aria-valuetext={`Commit ${index + 1} of ${count}: ${commit.subject}`} style={{ display: "block", width: "100%", minHeight: 44, accentColor: "var(--accent)", marginBlock: 12 }} />
      <div role="status" aria-live={running ? "off" : "polite"} aria-atomic="true" style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <p className="eyebrow"><time dateTime={commit.timestamp}>{new Date(commit.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</time></p>
        <h4 style={{ fontSize: "var(--type-4)", lineHeight: 1.4, marginBlock: 16 }}>{commit.subject}</h4>
        <a href={`https://github.com/arinze-okigbo/.com/commit/${commit.commitSHA}`} target="_blank" rel="noreferrer">Inspect commit {commit.commitSHA.slice(0, 7)} ↗</a>
      </div>
      <details key={commit.commitSHA} style={{ marginTop: 24 }}>
        <summary style={{ cursor: "pointer", minHeight: 44 }}>{commit.changedFiles.length} changed {commit.changedFiles.length === 1 ? "file" : "files"}</summary>
        <ul style={{ fontFamily: "var(--font-mono)", fontSize: "var(--type-2)", lineHeight: 1.9, paddingLeft: 20, overflowWrap: "anywhere" }}>{commit.changedFiles.map(file => <li key={file}>{file}</li>)}</ul>
      </details>
      <ol aria-label="Chronological commit timeline" style={{ borderLeft: "1px solid var(--line)", marginTop: 24, paddingLeft: 24, display: "grid", gap: 8 }}>
        {history.commits.map((entry, entryIndex) => <li key={entry.commitSHA}>
          <button type="button" aria-current={entryIndex === index ? "step" : undefined} onClick={() => step(entryIndex)} style={{ display: "block", textAlign: "left", padding: "10px 12px", minHeight: 44, width: "100%", color: entryIndex === index ? "var(--accent)" : "var(--muted)", background: "transparent", border: "1px solid var(--line)", borderRadius: 8, font: "inherit", cursor: "pointer" }}><span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--type-1)", marginRight: 12 }}>{String(entryIndex + 1).padStart(2, "0")}</span>{entry.subject}</button>
        </li>)}
      </ol>
      {history.capturedAt && <p className="hive-lab-caption" style={{ marginTop: 24 }}>Snapshot captured {new Date(history.capturedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC. Commit timestamps come from Git. Playback spacing does not represent elapsed build time.</p>}
    </section>
  );
}
