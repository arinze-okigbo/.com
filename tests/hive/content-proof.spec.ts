import { test, expect } from "@playwright/test";

const projectDestinations = {
  splita: "splita.co",
  "browser-authentication": "queraltinc.com",
  skyview: "github.com/arinze-okigbo/sky-view",
  "nyc-live": "github.com/arinze-okigbo/nyc-live",
  "linkedin-plus": "github.com/arinze-okigbo/linkedin-plus-bookmarklet",
  "campus-bookshelf": "github.com/arinze-okigbo/tindext-v2",
  "homework-chatbot": "github.com/arinze-okigbo/HomeworkAIChatBot",
  "library-management": "github.com/arinze-okigbo/LibraryManagementSystem",
  scanner: "github.com/arinze-okigbo/Scanner",
};

test("project Learn More links take readers to the actual project or company", async ({ page }) => {
  for (const [slug, destination] of Object.entries(projectDestinations)) {
    await page.goto(`/projects/${slug}`);
    await expect(page.getByText("Read the public source", { exact: true })).toHaveCount(0);
    const link = page.getByRole("link", { name: "Learn More", exact: true });
    await expect(link).toBeVisible();
    const target = new URL((await link.getAttribute("href"))!);
    expect(target.protocol).toBe("https:");
    expect(`${target.hostname.replace(/^www\./, "")}${target.pathname.replace(/\/$/, "")}`).toBe(
      destination,
    );
  }
});

test("contact links retain the right public profiles and existing email", async ({ page }) => {
  await page.goto("/contact");
  const destinations = {
    LinkedIn: "https://www.linkedin.com/in/arinzeokigbo",
    GitHub: "https://github.com/arinze-okigbo",
    Substack: "https://arinzeokigbo.substack.com",
    Splita: "https://splita.co",
  };
  for (const [label, target] of Object.entries(destinations)) {
    const link = page.locator("main").getByRole("link", { name: label, exact: true });
    expect((await link.getAttribute("href"))?.replace(/\/$/, "")).toBe(target);
  }
  await expect(page.locator('main a[href="mailto:arinze@splita.co"]').first()).toBeVisible();
});

test("experience logos load beside their company names", async ({ page }) => {
  await page.goto("/work");
  for (const company of ["Splita", "Cyera", "Queralt Inc.", "Snorkel AI", "TechBuzz"]) {
    const entry = page
      .locator(".timeline-item")
      .filter({ has: page.getByRole("heading", { name: company, exact: true }) });
    const logo = entry.locator(".company-logo img");
    await logo.scrollIntoViewIfNeeded();
    await expect(logo).toBeVisible();
    await expect
      .poll(() => logo.evaluate((node) => (node as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
  }
});

test("project evidence loads and scanner input and output remain accessible", async ({
  page,
  request,
}) => {
  for (const slug of ["skyview", "nyc-live", "campus-bookshelf", "homework-chatbot"]) {
    await page.goto(`/projects/${slug}`);
    const image = page.locator(".project-detail-hero .project-proof-image img");
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect
      .poll(() => image.evaluate((node) => (node as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.locator(".project-detail-hero figcaption")).not.toBeEmpty();
  }
  await page.goto("/projects/scanner");
  await expect(page.getByRole("region", { name: "Actual scanner output" })).not.toBeEmpty();
  for (const label of ["View input", "Full output"]) {
    const href = await page.getByRole("link", { name: label, exact: true }).getAttribute("href");
    expect(href).toBeTruthy();
    const response = await request.get(href!);
    expect(response.ok()).toBe(true);
    expect((await response.text()).trim().length).toBeGreaterThan(0);
  }
});

test("project controls reach the full collection with keyboard and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
  const track = page.getByRole("region", { name: "Project cards. Use arrow keys to browse." });
  const previous = page.getByRole("button", { name: "Previous projects", exact: true });
  const next = page.getByRole("button", { name: "Next projects", exact: true });
  await expect(previous).toBeDisabled();
  await next.click();
  await expect.poll(() => track.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  await track.focus();
  await track.press("End");
  await expect(next).toBeDisabled();
  await expect(page.locator(".project-browser-progress")).toContainText(/–9 of 9/);
  const scanner = track.locator('a[href="/projects/scanner"]');
  await expect(scanner).toBeInViewport();
  await track.press("Home");
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
});

test("writing archive exposes the expanded posts and working combined filters", async ({
  page,
}) => {
  await page.goto("/writing");
  await expect(page.getByRole("status")).toContainText("5 of 5 essays");
  await page.getByLabel("Search the archive").fill("no-writing-matches-this-phrase");
  await expect(
    page.getByRole("heading", { name: "No writing matches those filters." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show all essays", exact: true }).click();
  await page.getByRole("button", { name: /^LinkedIn \d+$/ }).click();
  expect(await page.locator(".archive-note").count()).toBeGreaterThan(3);
  await expect(page.locator(".linkedin-embed")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Topic", exact: true })
    .selectOption({ label: "Splita" });
  const before = await page.locator(".archive-note").count();
  expect(before).toBeGreaterThan(0);
  await page.getByLabel("Search the archive").fill("no-writing-matches-this-phrase");
  await expect(page.getByRole("status")).toContainText("0 of");
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  expect(await page.locator(".archive-note").count()).toBeGreaterThan(before);
});

test("writing covers load and the printed archive retains its title", async ({ page }) => {
  await page.goto("/writing");
  const covers = page.locator(".essay-art img");
  expect(await covers.count()).toBeGreaterThan(0);
  for (const cover of await covers.all()) {
    await cover.scrollIntoViewIfNeeded();
    await expect
      .poll(() => cover.evaluate((node) => (node as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    expect(await cover.getAttribute("src")).toContain("/_next/image?");
  }
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("heading", { name: "Writing.", exact: true })).toBeVisible();
  await expect(page.locator(".archive-tools")).toBeHidden();
});

test("every essay keeps long source links within the reading viewport", async ({ page }) => {
  await page.goto("/writing");
  const paths = await page
    .locator(".essay-link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")!));
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator("main h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});
