import { readFile, readdir } from "node:fs/promises";
import { PageIntro, pageMeta } from "@/components/hive/Primitives";
import tasks from "../../../../hive/tasks.json";
export const metadata = pageMeta(
  "Changelog",
  "A public record of the ASTRA HIVE build: sourced content, implementation, motion, and verification.",
  "/lab/changelog",
);
export default async function Changelog() {
  const directory = `${process.cwd()}/hive/changelog`;
  let records: { round: number; filename: string; title: string; lines: string[] }[] = [];
  try {
    const filenames = (await readdir(directory)).filter((name) => /^round-\d+\.md$/.test(name));
    const results = await Promise.all(
      filenames.map(async (filename) => {
        const round = Number(filename.match(/^round-(\d+)\.md$/)![1]);
        const lines = (await readFile(`${directory}/${filename}`, "utf8")).split("\n");
        const titleLine = lines.findIndex((line) => /^#\s+/.test(line));
        return {
          round,
          filename,
          title: titleLine >= 0 ? lines[titleLine].replace(/^#\s+/, "").trim() : `Round ${round}`,
          lines: lines.filter((line, index) => index !== titleLine && line.trim()),
        };
      }),
    );
    records = results.sort((a, b) => b.round - a.round || a.filename.localeCompare(b.filename));
  } catch {
    // A missing or unreadable record is not evidence that a round shipped.
  }
  return (
    <>
      <PageIntro
        label="THE HIVE / PUBLIC BUILD RECORD"
        title="Show your working."
        description="The site is an ongoing build. This log records concrete changes; the repository holds the tasks, decisions, and verification evidence."
      />
      <div className="shell" style={{ paddingBottom: 112 }}>
        {records.length ? (
          records.map((record) => (
            <article className="changelog-entry" key={record.filename}>
              <span className="eyebrow">ROUND {record.round}</span>
              <div>
                <h2>{record.title}</h2>
                <div className="changelog-copy">
                  {record.lines.map((line, index) =>
                    line.startsWith("## ") ? (
                      <h3 key={index}>{line.slice(3)}</h3>
                    ) : (
                      <p key={index}>{line.replace(/^[-*] /, "")}</p>
                    ),
                  )}
                </div>
                <a
                  href={`https://github.com/arinze-okigbo/.com/blob/main/hive/changelog/${record.filename}`}
                  className="text-link"
                  target="_blank"
                  rel="noreferrer"
                >
                  Inspect the source ↗
                </a>
              </div>
            </article>
          ))
        ) : (
          <article className="changelog-entry">
            <span className="eyebrow">BUILD RECORD</span>
            <div>
              <h2>No round records available.</h2>
              <p className="page-description">
                Saved changelog documents could not be loaded. The task record below shows the
                build’s saved state.
              </p>
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
        )}
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
