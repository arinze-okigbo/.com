import { chromium } from "playwright";
import fs from "node:fs/promises";
const base = process.env.HIVE_QA_URL || "http://localhost:3100";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const results = {};
await page.goto(base + "/lab", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Move target" }).click();
await page.waitForTimeout(800);
results.spring = await page
  .locator('.hive-spring-canvas circle[fill="var(--accent, #a7f4ce)"]')
  .getAttribute("cx");
await page.getByRole("button", { name: "Pause", exact: true }).click();
results.pauseLabel = await page.getByRole("button", { name: "Resume", exact: true }).count();
const cardButtons = page.getByRole("group", { name: "Choose a project card" }).getByRole("button");
results.cardSelectors = await cardButtons.count();
await cardButtons.nth(1).click();
results.activeCards = await page.locator(".hive-stack-card:not([inert])").count();
await page.getByRole("button", { name: "Under the hood" }).click();
results.profiler = {
  rows: await page.locator(".hive-profiler-table tbody tr").count(),
  records: await page.locator(".hive-profiler-table tbody tr").allTextContents(),
  outlines: await page.locator("html").getAttribute("data-hive-debug"),
};
await page.getByRole("button", { name: "Refresh measurements" }).click();
await page.getByRole("button", { name: "Under the hood" }).click();
await page.getByRole("button", { name: /Switch to light mode/ }).click();
await page.waitForTimeout(600);
results.light = await page.locator("html").getAttribute("data-theme");
await page.getByRole("button", { name: /Switch to dark mode/ }).click();
await page.waitForTimeout(600);
await page.goto(base + "/projects", { waitUntil: "networkidle" });
await page.evaluate(() => {
  window.__hiveTransitions = { calls: 0, errors: [] };
  const original = document.startViewTransition.bind(document);
  document.startViewTransition = (...args) => {
    window.__hiveTransitions.calls++;
    const transition = original(...args);
    transition.ready.catch((error) => window.__hiveTransitions.errors.push(error.message));
    return transition;
  };
});
await page.locator(".project-card-link").first().click();
await page.waitForURL("**/projects/*");
await page.waitForTimeout(700);
results.projectNavigation = page.url();
results.nativeTransitions = await page.evaluate(() => window.__hiveTransitions);
await page.goto(base + "/about", { waitUntil: "networkidle" });
const tag = page.locator(".hive-physics-tag").first();
results.tags = await page.locator(".hive-physics-tag").count();
await tag.focus();
await tag.press("ArrowRight");
await page.waitForTimeout(100);
results.tagMoved = await tag.getAttribute("style");
await page.emulateMedia({ reducedMotion: "reduce" });
await page.goto(base + "/lab", { waitUntil: "networkidle" });
results.reducedStack = await page.locator(".hive-project-stack-static").count();
results.reducedLinks = await page.locator(".hive-project-stack-static a").count();
results.errors = errors;
results.passed =
  errors.length === 0 &&
  Math.abs(Number(results.spring) - 100) < 10 &&
  results.activeCards === 1 &&
  results.reducedLinks === 3 &&
  results.nativeTransitions.calls > 0 &&
  results.nativeTransitions.errors.length === 0 &&
  results.profiler.rows > 0 &&
  results.profiler.outlines === "true";
await fs.mkdir("hive/qa", { recursive: true });
await fs.writeFile("hive/qa/motion-interactions.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
if (!results.passed) process.exitCode = 1;
