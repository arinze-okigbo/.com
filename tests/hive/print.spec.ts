import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("printed homepage preserves readable content and contact destinations", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "PDF output is a desktop Chromium facility");
  await page.goto("/", { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("header")).toBeHidden();
  await expect(page.locator('a[href="mailto:arinze@splita.co"]')).toBeVisible();
  const audit = await new AxeBuilder({ page }).withTags(["wcag2aa"]).analyze();
  expect(
    audit.violations.map((item) => ({
      id: item.id,
      targets: item.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
  expect(pdf.length).toBeGreaterThan(10000);
});
