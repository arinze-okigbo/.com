#!/usr/bin/env node
/** Diagnostic only: sample initial-load JS; never substitutes for the Lighthouse gate.
 * node scripts/profile-startup.mjs
 * PROFILE_URL=http://localhost:3100 PROFILE_OUTPUT_DIR=hive/qa/startup node scripts/profile-startup.mjs
 * PROFILE_CHANNEL=chrome selects installed system Chrome to match Lighthouse.
 * Without PROFILE_URL, starts the existing production build on an available loopback port.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";

const directory = path.resolve(process.env.PROFILE_OUTPUT_DIR || "hive/qa/startup");
const settleMs = 750;
const samplingIntervalUs = 1000;
let server;
let browser;
let serverError;
let serverLog = "";
let cleanupPromise;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function availablePort() {
  const socket = createServer();
  await new Promise((resolve, reject) => {
    socket.once("error", reject);
    socket.listen(0, "127.0.0.1", resolve);
  });
  const port = socket.address().port;
  await new Promise((resolve, reject) =>
    socket.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function waitForServer(target) {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (serverError) throw serverError;
    if (server.exitCode !== null || server.signalCode !== null)
      throw new Error(
        `Owned Next server exited before readiness: ${server.exitCode ?? server.signalCode}`,
      );
    try {
      // Readiness uses a static asset so the measured document remains cold.
      const response = await fetch(new URL("/favicon.ico", target), {
        signal: AbortSignal.timeout(1500),
      });
      if (response.ok) return;
    } catch {
      /* The owned process is still binding its port. */
    }
    await delay(200);
  }
  throw new Error("Owned Next server did not become ready within 60 seconds.");
}

async function cleanup() {
  cleanupPromise ??= (async () => {
    await browser?.close().catch(() => {});
    if (server && server.exitCode === null && server.signalCode === null) {
      server.kill("SIGTERM");
      for (let i = 0; i < 50 && server.exitCode === null && server.signalCode === null; i++)
        await delay(100);
      if (server.exitCode === null && server.signalCode === null) {
        server.kill("SIGKILL");
        await new Promise((resolve) => server.once("exit", resolve));
      }
    }
    await mkdir(directory, { recursive: true });
    if (server) await writeFile(path.join(directory, "server.log"), serverLog);
  })();
  return cleanupPromise;
}
for (const [signal, code] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
]) {
  process.once(signal, () => {
    void cleanup().finally(() => process.exit(code));
  });
}

function summarize(profile) {
  if (!profile.samples?.length || profile.samples.length !== profile.timeDeltas?.length)
    throw new Error("CPU profiler returned no usable samples or mismatched sample timings.");
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]));
  const totals = new Map();
  for (let index = 0; index < profile.samples.length; index++) {
    const node = nodes.get(profile.samples[index]);
    if (!node) throw new Error("CPU profile references a missing call-tree node.");
    const frame = node.callFrame;
    const key = JSON.stringify([
      frame.url,
      frame.functionName,
      frame.lineNumber,
      frame.columnNumber,
    ]);
    const row = totals.get(key) || {
      function: frame.functionName || "(anonymous)",
      url: frame.url || "(runtime)",
      line: frame.lineNumber >= 0 ? frame.lineNumber + 1 : null,
      column: frame.columnNumber >= 0 ? frame.columnNumber + 1 : null,
      selfMs: 0,
      samples: 0,
    };
    row.selfMs += profile.timeDeltas[index] / 1000;
    row.samples++;
    totals.set(key, row);
  }
  const rows = [...totals.values()].sort((a, b) => b.selfMs - a.selfMs);
  return {
    durationMs: (profile.endTime - profile.startTime) / 1000,
    sampleCount: profile.samples.length,
    runtime: rows.filter((row) => ["(idle)", "(program)", "(root)"].includes(row.function)),
    functions: rows.filter((row) => !["(idle)", "(program)", "(root)"].includes(row.function)),
  };
}

try {
  await mkdir(directory, { recursive: true });
  let target = process.env.PROFILE_URL;
  if (!target) {
    const port = await availablePort();
    target = `http://127.0.0.1:${port}/`;
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NODE_ENV: "production" },
      },
    );
    server.on("error", (error) => {
      serverError = error;
    });
    const capture = (data) => {
      serverLog = (serverLog + data.toString()).slice(-65536);
    };
    server.stdout.on("data", capture);
    server.stderr.on("data", capture);
    await waitForServer(target);
  }
  const url = new URL(target);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("PROFILE_URL must use HTTP(S).");
  const channel = process.env.PROFILE_CHANNEL || undefined;
  browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
  const context = await browser.newContext({
    viewport: { width: 412, height: 823 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const cdp = await context.newCDPSession(page);
  const version = await cdp.send("Browser.getVersion");
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: samplingIntervalUs });
  await cdp.send("Profiler.start");
  const startedAt = new Date().toISOString();
  const response = await page.goto(url.href, { waitUntil: "networkidle", timeout: 45000 });
  await delay(settleMs);
  const { profile } = await cdp.send("Profiler.stop");
  await cdp.send("Profiler.disable");
  await writeFile(path.join(directory, "startup.cpuprofile"), JSON.stringify(profile));
  const summary = {
    url: url.href,
    startedAt,
    status: response?.status() ?? null,
    ownedServer: Boolean(server),
    samplingIntervalUs,
    settleMs,
    browser: { ...version, channel: channel || "bundled-chromium" },
    host: {
      platform: process.platform,
      arch: process.arch,
      node: process.version,
      release: os.release(),
      cpuModel: os.cpus()[0]?.model,
      logicalCPUs: os.cpus().length,
      memoryBytes: os.totalmem(),
      loadAverage: os.loadavg(),
      ci: Boolean(process.env.CI),
      commit: process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "local",
    },
    methodology:
      "Unthrottled fresh browser context, 412x823 mobile viewport. Samples cover navigation through network idle plus 750ms. Self time sums sample intervals at leaf call frames; it is sampled elapsed time, not per-thread CPU accounting. Profiling adds overhead. This diagnostic does not score or replace Lighthouse.",
    pageErrors: errors,
    ...summarize(profile),
  };
  await writeFile(path.join(directory, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
  const report =
    [
      `Startup CPU profile: ${url.href}`,
      `${version.product}; ${process.platform}/${process.arch}; ${summary.host.logicalCPUs} logical CPUs`,
      `${summary.sampleCount} samples over ${summary.durationMs.toFixed(1)}ms; interval ${samplingIntervalUs}µs; no throttling`,
      "Sampled self ms | samples | function | URL:line:column",
      ...summary.functions
        .slice(0, 30)
        .map(
          (row) =>
            `${row.selfMs.toFixed(2).padStart(10)} | ${String(row.samples).padStart(7)} | ${row.function} | ${row.url}:${row.line ?? "-"}:${row.column ?? "-"}`,
        ),
      "Runtime buckets: " +
        summary.runtime.map((row) => `${row.function} ${row.selfMs.toFixed(1)}ms`).join(", "),
      `Page errors: ${errors.length}; HTTP ${summary.status}`,
      `Full call tree: ${path.join(directory, "startup.cpuprofile")}`,
    ].join("\n") + "\n";
  await writeFile(path.join(directory, "summary.txt"), report);
  console.log(report);
  if (!response?.ok())
    throw new Error(`Profiled page returned HTTP ${summary.status}. Artifacts retained.`);
  if (errors.length)
    throw new Error(`Profiled page emitted ${errors.length} uncaught errors. Artifacts retained.`);
} catch (error) {
  console.error(`profile-startup: ${error.stack || error.message}`);
  process.exitCode = 1;
} finally {
  await cleanup();
}
