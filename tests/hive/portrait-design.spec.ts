import { expect, test } from "@playwright/test";

for (const route of ["/", "/about"]) {
  test(`${route} presents the real portrait immediately with stable responsive geometry`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "networkidle" });
    const portrait = page
      .getByRole("img", { name: "Portrait of Arinze Okigbo", exact: true })
      .first();
    await expect(portrait).toBeVisible();
    await expect
      .poll(() => portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    const box = await portrait.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize()!;
    expect(box!.width).toBeGreaterThanOrEqual(160);
    expect(box!.y).toBeLessThan(viewport.height - 80);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(await portrait.getAttribute("src")).toContain("portrait");
    const imageStyle = await portrait.evaluate((image) => {
      const style = getComputedStyle(image);
      return { opacity: style.opacity, filter: style.filter };
    });
    expect(Number(imageStyle.opacity)).toBe(1);
    expect(imageStyle.filter).not.toContain("blur");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test("portrait and primary navigation remain available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
    baseURL,
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const portrait = page
      .getByRole("img", { name: "Portrait of Arinze Okigbo", exact: true })
      .first();
    await expect(portrait).toBeVisible();
    await expect
      .poll(() => portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('main a[href="/projects"]').first()).toBeVisible();
    await expect(page.locator('a[href="mailto:arinze@splita.co"]').first()).toBeVisible();
  } finally {
    await context.close();
  }
});

test("portrait responds to pointer movement and resets when reduced motion is enabled", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Pointer depth is reserved for a fine hover pointer.");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });
  const frame = page.locator("[data-portrait-frame]").first();
  await expect(frame).toBeVisible();
  const box = await frame.boundingBox();
  await page.mouse.move(box!.x + box!.width * 0.8, box!.y + box!.height * 0.25);
  await expect(frame).toHaveAttribute("data-portrait-active", "true");
  await expect
    .poll(() =>
      frame.evaluate((element) =>
        Math.abs(Number((element as HTMLElement).style.getPropertyValue("--portrait-x"))),
      ),
    )
    .toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(frame).not.toHaveAttribute("data-portrait-active", "true");
  await expect
    .poll(() =>
      frame.evaluate((element) => (element as HTMLElement).style.getPropertyValue("--portrait-x")),
    )
    .toBe("");
  const image = page.getByRole("img", { name: "Portrait of Arinze Okigbo", exact: true }).first();
  await expect(image).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
