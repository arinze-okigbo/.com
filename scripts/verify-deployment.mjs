const [url, expected] = process.argv.slice(2);
if (!url || !expected) throw new Error("Usage: verify-deployment.mjs URL expectedCommitSha");
const response = await fetch(url, {
  headers: { "Cache-Control": "no-cache" },
  signal: AbortSignal.timeout(20000),
});
if (!response.ok) throw new Error(`Deployment returned ${response.status}`);
const html = await response.text();
const tag = (html.match(/<meta\b[^>]*>/g) || []).find((tag) =>
  /name=["']hive:commit["']/.test(tag),
);
const actual = tag?.match(/content=["']([^"']+)["']/)?.[1];
if (actual !== expected)
  throw new Error(`Custom domain serves ${actual || "no build marker"}, expected ${expected}`);
console.log(`Verified deployed commit ${actual} at ${url}`);
