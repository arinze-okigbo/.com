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

import { existsSync, readFileSync } from "node:fs";
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
  try {
    return JSON.parse(readFileSync(full, "utf8"));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
  }
}

function chunkFile(chunkPath) {
  let decoded;
  try {
    // Manifest URLs encode dynamic route brackets; emitted filenames do not.
    decoded = decodeURIComponent(chunkPath);
  } catch {
    fail(`Invalid encoded chunk path: ${chunkPath}`);
  }
  const full = path.resolve(NEXT_DIR, decoded);
  if (!full.startsWith(`${NEXT_DIR}${path.sep}`)) fail(`Invalid chunk path: ${chunkPath}`);
  return full;
}

function gzipBytes(chunkPath) {
  const full = chunkFile(chunkPath);
  if (!existsSync(full)) return null;
  return gzipSync(readFileSync(full), { level: 9 }).length;
}

function chunkList(value, label, allowEmpty = false) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string"))
    fail(`${label} must be an array of chunk paths.`);
  if (!allowEmpty && !value.some((item) => item.endsWith(".js")))
    fail(`${label} contains no JavaScript chunks.`);
  for (const chunk of value) {
    const resolved = chunkFile(chunk);
    if (!existsSync(resolved)) fail(`chunk named in ${label} is missing: ${chunk}`);
  }
  return value;
}

// Next 16's Webpack build no longer emits app-build-manifest.json. Its
// per-page client-reference manifest merges parent layout and route entries;
// each client module lists [chunk ID, chunk path, ...] for its required chunks.
// Union those paths, including shared layout/fallback boundaries, with the
// framework runtime. This conservatively budgets every referenced boundary,
// without pulling in on-demand imports absent from the manifest.
// See next/dist/build/webpack/plugins/flight-manifest-plugin.js.
const rootMainFiles = chunkList(readJson("build-manifest.json").rootMainFiles, "rootMainFiles");
const legacy = existsSync(path.join(NEXT_DIR, "app-build-manifest.json"))
  ? readJson("app-build-manifest.json")
  : null;
const appPaths = legacy ? null : readJson("server/app-paths-manifest.json");
const layoutChunks = legacy ? chunkList(legacy.pages?.["/layout"], "/layout") : [];

function routeFiles(route) {
  if (legacy) return chunkList(legacy.pages?.[route], route);
  const appPath = appPaths[route];
  if (typeof appPath !== "string" || !appPath.startsWith("app/") || !appPath.endsWith(".js"))
    fail(`${route} is missing from server/app-paths-manifest.json.`);
  chunkList([`server/${appPath}`], `${route} server entry`);
  const manifestPath = `server/${appPath.replace(/\.js$/, "_client-reference-manifest.js")}`;
  const full = path.join(NEXT_DIR, manifestPath);
  if (!existsSync(full)) fail(`${manifestPath} not found — run \`next build\` first.`);
  const source = readFileSync(full, "utf8");
  const assignment = `globalThis.__RSC_MANIFEST[${JSON.stringify(route)}]=`;
  const offset = source.indexOf(assignment);
  if (offset === -1) fail(`${manifestPath} does not declare ${route}.`);
  let manifest;
  try {
    // The generated file wraps a JSON object in an assignment. Parse the data
    // only; do not execute build output to inspect its bundle references.
    manifest = JSON.parse(
      source
        .slice(offset + assignment.length)
        .trim()
        .replace(/;$/, ""),
    );
  } catch (error) {
    fail(`${manifestPath} has invalid manifest data: ${error.message}`);
  }
  const modules = manifest.clientModules;
  if (
    !modules ||
    typeof modules !== "object" ||
    Array.isArray(modules) ||
    !Object.keys(modules).length
  )
    fail(`${manifestPath} has no client module entries.`);
  const files = [];
  for (const [name, entry] of Object.entries(modules)) {
    if (!entry || !Array.isArray(entry.chunks) || entry.chunks.length % 2 !== 0)
      fail(`${manifestPath}: malformed required chunks for ${name}.`);
    for (let index = 0; index < entry.chunks.length; index += 2) {
      const id = entry.chunks[index];
      const file = entry.chunks[index + 1];
      if (
        !["string", "number"].includes(typeof id) ||
        typeof file !== "string" ||
        !file.endsWith(".js")
      )
        fail(`${manifestPath}: invalid chunk pair for ${name}.`);
      files.push(file);
    }
  }
  return chunkList([...new Set(files)], `${route} client references`);
}

let worst = 0;
let worstRoute = "";
let failed = false;

for (const route of ROUTES) {
  const chunks = [...new Set([...rootMainFiles, ...layoutChunks, ...routeFiles(route)])];

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
