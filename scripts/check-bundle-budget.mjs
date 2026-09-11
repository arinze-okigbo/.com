#!/usr/bin/env node
/**
 * First Load JS budget gate — docs/02 §7.
 *
 * WHY THIS EXISTS RATHER THAN READING `next build`'s table.
 *
 * Next's "First Load JS" column omits layout-level client chunks. Measured on
 * this repo, the table said 108 kB while the served document actually requested
 * 145,376 B across 9 scripts — a 37,501 B undercount. A regression of up to
 * ~37 kB inside a layout client chunk would therefore have been invisible to a
 * gate reading that number. The review proved the blindness directly: removing
 * 38,051 B of real script moved the reported figure from 108 kB to 107 kB.
 *
 * So this reads the BUILD MANIFESTS instead, which name every chunk the
 * document will request, and gzips the files on disk.
 *
 * `noModule` polyfills are excluded: no browser that supports ES modules ever
 * fetches them, so they are not part of the initial payload for any supported
 * target. They are reported separately so the exclusion is visible.
 *
 * Usage: `node scripts/check-bundle-budget.mjs` after `next build`.
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

/** docs/02 §7 — fail CI if First Load JS for `/` exceeds this. */
const BUDGET_BYTES = 180 * 1024;

/** Routes to gate. `/` is the one docs/02 §7 names. */
const ROUTES = ["/page", "/writing/page", "/writing/[slug]/page"];

const NEXT_DIR = path.resolve(process.cwd(), ".next");

function fail(message) {
  console.error(`bundle-budget: ${message}`);
  process.exit(1);
}

function readJson(relativePath) {
  const full = path.join(NEXT_DIR, relativePath);
  if (!existsSync(full)) fail(`${relativePath} not found — run \`next build\` first.`);
  return JSON.parse(readFileSync(full, "utf8"));
}

function gzipBytes(chunkPath) {
  const full = path.join(NEXT_DIR, chunkPath);
  if (!existsSync(full)) return null;
  return gzipSync(readFileSync(full), { level: 9 }).length;
}

const appManifest = readJson("app-build-manifest.json");
// `app-build-manifest.json` lists only the route's own chunks. The framework
// runtime entries (`webpack`, the React/Next shared chunks, `main-app`) are in
// `build-manifest.json` under `rootMainFiles` and are requested by every
// document, so both lists must be summed to match the served page.
const rootMainFiles = readJson("build-manifest.json").rootMainFiles ?? [];
// The ROOT LAYOUT's own client chunk is listed under "/layout" and NOT under
// any "/…/page" entry, yet every document requests it. This is precisely the
// omission that made Next's build table undercount `/` by 37,501 B: the dead
// Framer Motion boundary lived in exactly this chunk and the table could not
// see it.
const layoutChunks = appManifest.pages["/layout"] ?? [];

let worst = 0;
let worstRoute = "";
let failed = false;

for (const route of ROUTES) {
  const routeChunks = appManifest.pages[route];
  const chunks = routeChunks
    ? [...new Set([...rootMainFiles, ...layoutChunks, ...routeChunks])]
    : null;
  if (!chunks) {
    console.log(`  ${route.padEnd(22)} (not in manifest, skipped)`);
    continue;
  }

  // This is a JAVASCRIPT budget. The manifests also list the route's
  // stylesheet, which `experimental.inlineCss` folds into the document rather
  // than requesting separately, so it is not a script and not counted here.
  //
  // `polyfills-*` is emitted with `noModule` and is never fetched by a browser
  // that supports modules. Every other entry is a real initial request.
  const scripts = chunks.filter((c) => c.endsWith(".js"));
  const counted = scripts.filter((c) => !c.includes("polyfills"));
  const skipped = scripts.filter((c) => c.includes("polyfills"));

  let total = 0;
  const missing = [];
  for (const chunk of counted) {
    const bytes = gzipBytes(chunk);
    if (bytes === null) {
      missing.push(chunk);
      continue;
    }
    total += bytes;
  }
  if (missing.length > 0) fail(`chunks named in the manifest are missing: ${missing.join(", ")}`);

  const over = total > BUDGET_BYTES;
  failed ||= over;
  if (total > worst) {
    worst = total;
    worstRoute = route;
  }

  const kib = (total / 1024).toFixed(1);
  console.log(
    `  ${route.padEnd(22)} ${String(total).padStart(7)} B gz (${kib} KiB)` +
      ` across ${counted.length} scripts${over ? "  ← OVER BUDGET" : ""}` +
      (skipped.length > 0 ? `  [+${skipped.length} noModule, excluded]` : ""),
  );
}

console.log(
  `\n  budget ${BUDGET_BYTES} B gz (180 KiB) — worst route ${worstRoute} at ${worst} B` +
    ` (${((worst / BUDGET_BYTES) * 100).toFixed(1)}% of budget)`,
);

if (failed) fail("First Load JS exceeds the docs/02 §7 budget.");
console.log("bundle-budget: PASS");
