/** Measure the built app before a pull request can reach production. */
import { spawn } from "node:child_process";
import { mkdir, open } from "node:fs/promises";
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
  await run("node_modules/lighthouse/cli/index.js", [
    target,
    "--quiet",
    "--output=json",
    "--save-assets",
    `--output-path=${directory}/preflight-mobile.json`,
    "--chrome-flags=--headless --no-sandbox",
  ]);
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
