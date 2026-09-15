import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const trigger = "Navigate";
const searchLabel = "Search this site";

test("navigation loads on demand and opens a real project with Enter", async ({ page }) => {
  const requested: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/navigation")) requested.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(requested).toHaveLength(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: trigger, exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Go somewhere." })).toBeVisible();
  const search = page.getByRole("searchbox", { name: searchLabel });
  await expect(search).toBeFocused();
  await search.fill("Splita");
  await expect(page.getByRole("link", { name: /Project Splita/ })).toHaveAttribute(
    "href",
    "/projects/splita",
  );
  expect(requested).toHaveLength(1);
  await search.press("Enter");
  await expect(page).toHaveURL(/\/projects\/splita$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("both keyboard shortcuts open the palette and Escape restores the opener", async ({
  page,
}) => {
  await page.goto("/about", { waitUntil: "networkidle" });
  const opener = page.locator(".wordmark");
  await opener.focus();
  for (const shortcut of ["Control+k", "Meta+k"]) {
    await page.keyboard.press(shortcut);
    await expect(page.getByRole("searchbox", { name: searchLabel })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(opener).toBeFocused();
  }
});

test("shortcuts leave input, textarea and editable content alone", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "networkidle" });
  for (const id of ["contact-subject", "contact-message"]) {
    const editable = page.locator(`#${id}`);
    await editable.focus();
    await editable.press("Control+k");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.evaluate(() => {
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    editable.dataset.testid = "editable-probe";
    editable.textContent = "Typing context";
    document.body.appendChild(editable);
    editable.focus();
  });
  await page.keyboard.press("Meta+k");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("dialog keeps native focus containment, arrow navigation and accessible contrast", async ({
  page,
}) => {
  await page.goto("/lab", { waitUntil: "networkidle" });
  const opener = page.getByRole("button", { name: trigger, exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog");
  const search = page.getByRole("searchbox", { name: searchLabel });
  await expect(dialog).toBeVisible();
  const links = dialog.getByRole("link");
  await expect(dialog.getByRole("link", { name: /Project Splita/ })).toBeVisible();
  await search.press("ArrowDown");
  await expect(links.first()).toBeFocused();
  await page.keyboard.press("End");
  await expect(links.last()).toBeFocused();
  await page.keyboard.press("Home");
  await expect(links.first()).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(search).toBeFocused();
  for (let index = 0; index < 24; index++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest("dialog")))).toBe(
      true,
    );
  }
  const audit = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});

test("a failed dynamic index preserves useful page links and can retry", async ({ page }) => {
  await page.route("**/api/navigation", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/about", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: trigger, exact: true }).click();
  await expect(
    page.getByText("Project and writing links couldn’t load. Page links are still available."),
  ).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("link", { name: /Page About/ })).toHaveAttribute(
    "href",
    "/about",
  );
  await page.unroute("**/api/navigation");
  await page.getByRole("button", { name: "Try again" }).click();
  await page.getByRole("searchbox", { name: searchLabel }).fill("Splita");
  await expect(page.getByRole("link", { name: /Project Splita/ })).toBeVisible();
});

test("reduced-motion dialog fits the viewport and provides a useful empty state", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: trigger, exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
  const fits = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight
    );
  });
  expect(fits).toBe(true);
  await page.getByRole("searchbox", { name: searchLabel }).fill("nothing-matches-this-query");
  await expect(page.getByText("No matches. Try a page name, project, or topic.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("the index exposes only real same-site page destinations and short metadata", async ({
  request,
}) => {
  const response = await request.get("/api/navigation");
  expect(response.status()).toBe(200);
  const { items } = (await response.json()) as {
    items: { title: string; href: string; kind: string; description: string; keywords: string }[];
  };
  expect(items.length).toBeGreaterThan(9);
  expect(new Set(items.map((item) => item.href)).size).toBe(items.length);
  for (const item of items) {
    expect(item.title.length).toBeGreaterThan(0);
    expect(item.href).toMatch(/^\/(?!\/)[a-z0-9/-]*$/);
    expect(Object.keys(item).sort()).toEqual(["description", "href", "keywords", "kind", "title"]);
  }
  const article = items.find((item) => item.kind === "Writing");
  expect(article).toBeTruthy();
  expect((await request.get(article!.href)).status()).toBe(200);
});
