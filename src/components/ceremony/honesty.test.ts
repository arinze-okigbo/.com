import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The honesty guarantees, enforced mechanically.
 *
 * The section tells every visitor that nothing is stored and nothing is sent.
 * These tests read the actual source of the ceremony chunk and fail if a
 * storage or network call ever appears in it — so the claim cannot rot into a
 * comment that used to be true.
 */

const ROOT = path.resolve(__dirname, "..", "..");
const SCANNED_DIRECTORIES = [
  path.join(ROOT, "lib", "webauthn"),
  path.join(ROOT, "components", "ceremony"),
];

/** Call shapes, not bare words: the copy is allowed to *discuss* these APIs. */
const FORBIDDEN_CALLS: readonly { readonly name: string; readonly pattern: RegExp }[] = [
  { name: "fetch()", pattern: /\bfetch\s*\(/ },
  { name: "XMLHttpRequest", pattern: /new\s+XMLHttpRequest/ },
  { name: "navigator.sendBeacon", pattern: /sendBeacon\s*\(/ },
  { name: "WebSocket", pattern: /new\s+WebSocket/ },
  { name: "EventSource", pattern: /new\s+EventSource/ },
  { name: "import() of a URL", pattern: /import\s*\(\s*["'`]https?:/ },
  { name: "localStorage", pattern: /localStorage\s*[.[]/ },
  { name: "sessionStorage", pattern: /sessionStorage\s*[.[]/ },
  { name: "indexedDB", pattern: /indexedDB\s*[.[]/ },
  { name: "document.cookie", pattern: /document\s*\.\s*cookie/ },
  { name: "navigator.clipboard", pattern: /navigator\s*\.\s*clipboard/ },
  { name: "console", pattern: /\bconsole\s*\./ },
];

function sourceFiles(directory: string): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    if (!/\.tsx?$/.test(entry.name)) return [];
    if (/\.test\.tsx?$/.test(entry.name)) return [];
    return [full];
  });
}

const files = SCANNED_DIRECTORIES.flatMap(sourceFiles);

describe("the ceremony chunk", () => {
  it("contains source files to scan", () => {
    expect(files.length).toBeGreaterThan(15);
  });

  it.each(FORBIDDEN_CALLS)("never calls $name", ({ pattern }) => {
    const offenders = files.filter((file) => pattern.test(readFileSync(file, "utf8")));

    expect(offenders.map((file) => path.relative(ROOT, file))).toEqual([]);
  });

  it("reaches navigator.credentials from exactly one module", () => {
    const callers = files.filter((file) =>
      /navigator\s*\.\s*credentials\s*\.\s*(create|get)\s*\(/.test(readFileSync(file, "utf8")),
    );

    // One module, so "nothing prompts without an explicit click" is auditable
    // by reading a single file.
    expect(callers.map((file) => path.basename(file))).toEqual(["run-ceremony.ts"]);
  });

  it("requests a non-discoverable credential, so nothing lingers on the authenticator", () => {
    const driver = readFileSync(path.join(ROOT, "lib", "webauthn", "run-ceremony.ts"), "utf8");

    expect(driver).toMatch(/residentKey:\s*"discouraged"/);
    expect(driver).toMatch(/requireResidentKey:\s*false/);
  });

  it("passes an AbortSignal to both ceremony calls, so cancel always works", () => {
    const driver = readFileSync(path.join(ROOT, "lib", "webauthn", "run-ceremony.ts"), "utf8");
    const signals = driver.match(/signal:\s*options\.signal/g) ?? [];

    expect(signals.length).toBe(2);
  });
});

describe("the page's own bundle", () => {
  it("keeps the ceremony behind a dynamic import", () => {
    const mount = readFileSync(
      path.join(ROOT, "components", "ceremony", "CeremonyMount.tsx"),
      "utf8",
    );

    expect(mount).toMatch(/import\("\.\/CeremonyPanel"\)/);
    // A static import of the panel would pull the whole chunk into First Load JS.
    expect(mount).not.toMatch(/^import .*CeremonyPanel/m);
  });

  it("exports only the mount from the module's public surface", () => {
    const index = readFileSync(path.join(ROOT, "components", "ceremony", "index.ts"), "utf8");

    expect(index).toMatch(/export \{ CeremonyMount \}/);
    // A re-export of the panel would defeat the dynamic boundary.
    expect(index).not.toMatch(/export .*CeremonyPanel/);
  });
});
