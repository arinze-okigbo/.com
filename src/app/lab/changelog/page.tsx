import { readFile } from "node:fs/promises";
import { PageIntro, pageMeta } from "@/components/hive/Primitives";
import tasks from "../../../../hive/tasks.json";
export const metadata = pageMeta(
  "Changelog",
  "A public record of the ASTRA HIVE build: sourced content, implementation, motion, and verification.",
  "/lab/changelog",
);
export default async function Changelog() {
  let log = "";
  try {
    log = await readFile(`${process.cwd()}/hive/changelog/round-1.md`, "utf8");
  } catch {}
  return (
    <>
      <PageIntro
        label="THE HIVE / PUBLIC BUILD RECORD"
        title="Show your working."
        description="The site is an ongoing build. This log records concrete changes; the repository holds the tasks, decisions, and verification evidence."
      />
      <div className="shell" style={{ paddingBottom: 112 }}>
        <article className="changelog-entry">
          <span className="eyebrow">
            SEPTEMBER 2026
            <br />
            ROUND 01
          </span>
          <div>
            <h2>Foundation, with a point of view.</h2>
            {log ? (
              <div className="changelog-copy">
                {log
                  .split("\n")
                  .filter((line) => line.trim() && !line.startsWith("# "))
                  .map((line, index) =>
                    line.startsWith("## ") ? (
                      <h3 key={index}>{line.slice(3)}</h3>
                    ) : (
                      <p key={index}>{line.replace(/^[-*] /, "")}</p>
                    ),
                  )}
              </div>
            ) : (
              <p className="page-description">
                The current round is in progress. The task record below shows the build’s saved
                state.
              </p>
            )}
            <a
              href="https://github.com/arinze-okigbo/.com"
              className="text-link"
              target="_blank"
              rel="noreferrer"
            >
              Inspect the source ↗
            </a>
          </div>
        </article>
        <div className="task-record">
          {tasks.map((task) => (
            <article key={task.id}>
              <span className="eyebrow">
                {task.id} / {task.status.replaceAll("_", " ")}
              </span>
              <p>{task.acceptance_test}</p>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
