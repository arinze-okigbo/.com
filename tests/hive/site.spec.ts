import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/about",
  "/work",
  "/projects",
  "/lab",
  "/lab/changelog",
  "/writing",
  "/now",
  "/contact",
];
for (const route of routes) {
  test(`${route} is readable, accessible, stable and free of browser errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const csp = response?.headers()["content-security-policy"] || "";
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).not.toContain("'unsafe-eval'");
    const nonces = await page
      .locator("script:not([src])")
      .evaluateAll((nodes) => nodes.map((n) => (n as HTMLScriptElement).nonce));
    expect(nonces.every(Boolean)).toBe(true);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/\[\[|NEEDS-FACT|\bTBD\b|Lorem ipsum/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("all internal page links resolve, including project and article detail pages", async ({
  page,
  request,
}) => {
  const destinations = new Set<string>();
  for (const route of routes) {
    await page.goto(route);
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") || ""))) {
      if (href.startsWith("/") && !href.startsWith("//"))
        destinations.add(href.split("#")[0] || "/");
    }
  }
  for (const url of destinations) {
    const response = await request.get(url);
    expect(response.status(), `${url} returned ${response.status()}`).toBeLessThan(400);
  }
});

test("reduced-motion keeps the hero and navigation usable without a WebGL canvas", async ({
  browser,
}) => {
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toBeVisible();
  expect(await page.locator("canvas").count()).toBe(0);
  await expect(page.locator('a[href="/projects"]').first()).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test("core content and existing contact survive JavaScript disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('a[href="mailto:arinze@splita.co"]').first()).toBeVisible();
  await page.goto("/projects");
  await expect(page.locator("h1")).toBeVisible();
  expect(await page.locator('a[href^="/projects/"]').count()).toBeGreaterThan(0);
  await context.close();
});

test("404 keeps a path back to the site", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator('a[href="/"]').first()).toBeVisible();
});
