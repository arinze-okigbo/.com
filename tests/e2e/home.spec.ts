import { expect, test } from "@playwright/test";

test("renders core one-page sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Founder" })).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#current-work")).toBeVisible();
  await expect(page.locator("#projects")).toBeVisible();
  await expect(page.locator("#experience")).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();
});

test("shows top call-to-action on mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Connect" })).toBeVisible();
});