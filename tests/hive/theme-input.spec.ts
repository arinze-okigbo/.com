import { test, expect } from "@playwright/test";

test("theme wipe preserves immediate raw pointer navigation", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop header link reproduces the reported pointer-input defect.");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const lab = await page.locator('.desktop-nav a[href="/lab"]').boundingBox();
  expect(lab).not.toBeNull();
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  // Deliberately bypass locator actionability waiting: a real click during the wipe
  // must hit the link, even while the decorative animation is still running.
  await page.waitForTimeout(50);
  expect(await page.locator(".hive-theme-wipe").count()).toBe(1);
  await page.mouse.click(lab!.x + lab!.width / 2, lab!.y + lab!.height / 2);
  await expect(page).toHaveURL(/\/lab$/);
  await expect(page.locator(".hive-theme-wipe")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("theme wipe cleans up rapid toggles and respects reduced motion", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.locator(".hive-theme-wipe").count()).toBeLessThanOrEqual(1);
  await expect(page.locator(".hive-theme-wipe")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".hive-theme-wipe")).toHaveCount(0);
});
