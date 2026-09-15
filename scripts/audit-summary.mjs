import fs from "node:fs";
const [input, output, sha = process.env.GITHUB_SHA || "local"] = process.argv.slice(2);
if (!input || !output) throw new Error("Usage: audit-summary.mjs input.json output.json commitSha");
const audit = JSON.parse(fs.readFileSync(input, "utf8"));
if (audit.runtimeError) throw new Error(audit.runtimeError.message);
const score = (key) => Math.round(audit.categories[key].score * 100);
const result = {
  url: audit.finalDisplayedUrl || audit.finalUrl,
  auditedAt: audit.fetchTime,
  commitSha: sha,
  scores: {
    performance: score("performance"),
    accessibility: score("accessibility"),
    bestPractices: score("best-practices"),
    seo: score("seo"),
  },
  metrics: {
    lcp: audit.audits["largest-contentful-paint"].numericValue,
    cls: audit.audits["cumulative-layout-shift"].numericValue,
    tbt: audit.audits["total-blocking-time"].numericValue,
  },
};
fs.writeFileSync(output, JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
if (
  process.env.ENFORCE_GATES === "1" &&
  (result.scores.performance < 95 ||
    result.scores.accessibility < 95 ||
    result.scores.bestPractices < 100 ||
    result.scores.seo < 100)
)
  process.exitCode = 1;
