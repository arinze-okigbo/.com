/** Measure the built app before a pull request can reach production. */
import { spawn } from "node:child_process";
import { mkdir, open, readFile, writeFile } from "node:fs/promises";
import { computeMedianRun } from "lighthouse/core/lib/median-run.js";
import { resolve } from "node:path";

const target = process.env.QA_URL || "http://localhost:3100";
const directory = resolve("hive/qa");
await mkdir(directory, { recursive: true });
let server;
let log;
const run = (file, args, env = process.env) =>
  new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, [file, ...args], { stdio: "inherit", env });
    child.once("error", reject);
    child.once("exit", (code, signal) =>
      code === 0 ? resolveRun() : reject(new Error(`${file} exited ${code ?? signal}`)),
    );
  });
const ready = async () => {
  try {
    return (await fetch(target, { signal: AbortSignal.timeout(1500) })).ok;
  } catch {
    return false;
  }
};
try {
  if (!process.env.QA_URL && !(await ready())) {
    log = await open(resolve(directory, "preflight-server.log"), "w");
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3100"], {
      stdio: ["ignore", log.fd, log.fd],
    });
    const deadline = Date.now() + 60000;
    while (!(await ready())) {
      if (server.exitCode !== null || Date.now() > deadline)
        throw new Error("Built app failed to start; inspect preflight-server.log");
      await new Promise((resolveWait) => setTimeout(resolveWait, 300));
    }
  }
  // Fixed five-run series, selected by Lighthouse's FCP/TTI median algorithm.
  // Never retry until green or select the best score. Keep every raw report.
  const reports = [];
  for (let index = 1; index <= 5; index++) {
    const output = `${directory}/preflight-run-${index}-mobile.json`;
    await run("node_modules/lighthouse/cli/index.js", [
      target,
      "--quiet",
      "--output=json",
      "--save-assets",
      `--output-path=${output}`,
      "--chrome-flags=--headless --no-sandbox",
    ]);
    const report = JSON.parse(await readFile(output, "utf8"));
    if (report.runtimeError) throw new Error(report.runtimeError.message);
    reports.push(report);
    console.log(`Lighthouse ${index}/5: ${Math.round(report.categories.performance.score * 100)}`);
  }
  const median = computeMedianRun(reports);
  await writeFile(`${directory}/preflight-mobile.json`, JSON.stringify(median));
  await writeFile(`${directory}/preflight-series.json`, JSON.stringify({
    method: "Lighthouse computeMedianRun; fixed five sequential runs",
    reference: "https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md",
    selectedRun: reports.indexOf(median) + 1,
    runs: reports.map((report, index) => ({
      run: index + 1,
      auditedAt: report.fetchTime,
      performance: Math.round(report.categories.performance.score * 100),
      benchmarkIndex: report.environment.benchmarkIndex,
      tbt: report.audits["total-blocking-time"].numericValue,
      lcp: report.audits["largest-contentful-paint"].numericValue,
    })),
  }, null, 2) + "\n");
  for (const report of reports) {
    if (report.categories.accessibility.score < 0.95 ||
        report.categories["best-practices"].score !== 1 || report.categories.seo.score !== 1)
      throw new Error("A series run failed accessibility, best practices, or SEO");
  }
  await run(
    "scripts/audit-summary.mjs",
    [
      `${directory}/preflight-mobile.json`,
      `${directory}/preflight-summary.json`,
      process.env.GITHUB_SHA || "local",
    ],
    { ...process.env, ENFORCE_GATES: "1" },
  );
} finally {
  server?.kill("SIGTERM");
  await log?.close();
}
