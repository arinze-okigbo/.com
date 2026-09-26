import { expect, test, type Request } from "@playwright/test";

const isPrefetch = (request: Request, path: string) =>
  new URL(request.url()).pathname === path && request.headers()["next-router-prefetch"] === "1";

test("visible navigation waits for intent and keyboard focus warms its destination", async ({
  page,
}) => {
  const startup: string[] = [];
  page.on("request", (request) => {
    if (request.headers()["next-router-prefetch"] === "1")
      startup.push(new URL(request.url()).pathname);
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(startup).toEqual([]);

  // Focusing the current-page logo must not fetch that page again.
  await page.locator(".wordmark").focus();
  const about = page.locator('.hero-actions a[href="/about"]');
  const warmed = page.waitForRequest((request) => isPrefetch(request, "/about"));
  await about.focus();
  await warmed;
  expect(startup).not.toContain("/");
  await expect(about).toBeFocused();
  await about.press("Enter");
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("main h1")).toBeVisible();
});

test("pointer intent warms a route and touch still navigates immediately", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  const projects = page.locator('.hero-actions a[href="/projects"]');
  if (isMobile) {
    // A touch need not wait for a speculative request to complete before navigation.
    await projects.tap();
  } else {
    const warmed = page.waitForRequest((request) => isPrefetch(request, "/projects"));
    await projects.hover();
    await warmed;
    await projects.click();
  }
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("main h1")).toBeVisible();
  expect(errors).toEqual([]);
});

test("intent links remain usable server-rendered anchors without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const about = page.locator('.hero-actions a[href="/about"]');
    await expect(about).toBeVisible();
    await about.click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("main h1")).toBeVisible();
  } finally {
    await context.close();
  }
});
