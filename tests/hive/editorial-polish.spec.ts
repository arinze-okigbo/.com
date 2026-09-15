import { test, expect } from "@playwright/test";

const constructionCopy =
  /built by a swarm|agent swarm|ASTRA HIVE|specialist agents|how this site is built|under the hood|Exhibit A|public build record|build history playback/i;

test("public copy and navigation focus on the person and projects", async ({ page, request }) => {
  for (const route of ["/", "/about", "/projects", "/lab", "/now", "/contact"]) {
    await page.goto(route);
    await expect(page.locator("body")).not.toContainText(constructionCopy);
    const descriptions = await page
      .locator('meta[name="description"], meta[property="og:description"]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("content") || "").join(" "));
    expect(descriptions).not.toMatch(constructionCopy);
  }
  const index = await request.get("/api/navigation");
  expect(index.ok()).toBe(true);
  const serialized = JSON.stringify(await index.json());
  expect(serialized).not.toMatch(constructionCopy);
  expect(serialized).not.toContain("/projects/astra-hive");
  expect(serialized).not.toContain("/lab/changelog");
});

test("retired build pages permanently redirect to working experiments", async ({
  page,
  request,
}) => {
  for (const route of ["/lab/changelog", "/projects/astra-hive"]) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(response.headers().location).toBe("/lab");
    await page.goto(route);
    await expect(page).toHaveURL(/\/lab$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("body")).not.toContainText(constructionCopy);
  }
});

test("Splita's supplied identity is visible on its project", async ({ page }) => {
  await page.goto("/projects/splita");
  const logo = page.locator('img[alt="Splita"]').first();
  await expect(logo).toBeVisible();
  await expect(logo).toHaveJSProperty("complete", true);
  const width = await logo.evaluate((node) => (node as HTMLImageElement).naturalWidth);
  expect(width).toBeGreaterThan(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
  ).toBeLessThanOrEqual(1);
});
