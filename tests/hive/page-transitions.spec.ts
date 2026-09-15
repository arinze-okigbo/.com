import { test, expect } from "@playwright/test";

test("initial streamed content stays immediate and route changes still animate", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = document.startViewTransition.bind(document);
    const probe = { calls: 0 };
    Object.assign(window, { __hiveTransitionProbe: probe });
    document.startViewTransition = (...args) => {
      probe.calls++;
      return original(...args);
    };
  });
  const response = await page.goto("/", { waitUntil: "networkidle" });
  const html = await response!.text();
  // Server HTML must opt out before hydration, when streamed Suspense content
  // can arrive. Counting native API calls catches the expensive stream wrapper.
  expect(html).toContain('vt-update="none"');
  await expect(page.locator(".writing-list .writing-row").first()).toBeVisible();
  const calls = () =>
    page.evaluate(
      () =>
        (window as unknown as { __hiveTransitionProbe: { calls: number } }).__hiveTransitionProbe
          .calls,
    );
  expect(await calls()).toBe(0);
  await page.locator('main a[href="/about"]').first().click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("main h1")).toBeVisible();
  await expect.poll(calls).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
