import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [320, 390, 767]) {
  test(`mobile menu at ${width}px owns visible keyboard focus and restores background`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });
    const toggle = page.getByRole("button", { name: "Open menu", exact: true });
    await toggle.focus();
    await page.keyboard.press("Enter");
    const navigation = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
    await expect(navigation.getByRole("link", { name: "Work", exact: true })).toBeFocused();
    await expect(page.locator("main")).toHaveAttribute("inert", "");
    await expect(page.locator(".hive-footer")).toHaveAttribute("inert", "");
    expect(await page.locator("body").evaluate((node) => node.style.overflow)).toBe("hidden");

    // Traverse the entire ring twice. Each focused control stays inside the
    // header, inside the viewport, and retains a visible keyboard focus style.
    const seen = new Set<string>();
    for (let index = 0; index < 20; index++) {
      const focused = await page.evaluate(() => {
        const node = document.activeElement as HTMLElement;
        const rect = node.getBoundingClientRect();
        return {
          name: node.getAttribute("aria-label") || node.textContent?.trim(),
          inside: !!node.closest(".hive-header"),
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          viewportWidth: innerWidth,
          viewportHeight: innerHeight,
          focusVisible: node.matches(":focus-visible"),
          outline: getComputedStyle(node).outlineStyle,
        };
      });
      expect(focused.inside).toBe(true);
      expect(focused.top).toBeGreaterThanOrEqual(0);
      expect(focused.bottom).toBeLessThanOrEqual(focused.viewportHeight);
      expect(focused.left).toBeGreaterThanOrEqual(0);
      expect(focused.right).toBeLessThanOrEqual(focused.viewportWidth);
      expect(focused.focusVisible).toBe(true);
      expect(focused.outline).not.toBe("none");
      seen.add(focused.name || "");
      await page.keyboard.press("Tab");
    }
    expect(Array.from(seen).some((name) => name.includes("Close menu"))).toBe(true);
    expect(Array.from(seen).some((name) => name.includes("Contact"))).toBe(true);
    await navigation.getByRole("link", { name: "Contact", exact: true }).focus();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "ao — Arinze Okigbo home", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(navigation.getByRole("link", { name: "Contact", exact: true })).toBeFocused();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);

    await page.keyboard.press("Escape");
    await expect(navigation).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open menu", exact: true })).toBeFocused();
    await expect(page.locator("main")).not.toHaveAttribute("inert");
    await expect(page.locator(".hive-footer")).not.toHaveAttribute("inert");
    expect(await page.locator("body").evaluate((node) => node.style.overflow)).toBe("");
  });
}

test("mobile menu closes on navigation and desktop resize without leaving inert content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation", exact: true })
    .getByRole("link", { name: "About", exact: true })
    .press("Enter");
  await expect(page).toHaveURL(/\/about$/);
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("main")).not.toHaveAttribute("inert");
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.setViewportSize({ width: 1024, height: 844 });
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("link", { name: "About", exact: true }),
  ).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert");
  expect(await page.locator("body").evaluate((node) => node.style.overflow)).toBe("");
});

test("command palette takes focus ownership from an open mobile menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation", exact: true }),
  ).toHaveCount(0);
  for (let index = 0; index < 5; index++) {
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog[open]"))).toBe(true);
    await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open menu", exact: true })).toBeFocused();
  await expect(page.locator("main")).not.toHaveAttribute("inert");
  expect(await page.locator("body").evaluate((node) => node.style.overflow)).toBe("");
});
