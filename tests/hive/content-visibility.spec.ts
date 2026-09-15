import { test, expect } from "@playwright/test";

const sections =
  "main .hero ~ .section, main .hero ~ .about-teaser, main .hero ~ .lab-teaser, main .hero ~ .contact-banner";

test("offscreen rendering preserves find, focus, section geometry, anchors and print", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const contained = page.locator(sections);
  await expect(contained).toHaveCount(5);
  expect(await contained.first().evaluate((node) => getComputedStyle(node).contentVisibility)).toBe(
    "auto",
  );
  // Browser find-in-page and focus must activate content without application code.
  expect(
    await page.evaluate(() =>
      (window as unknown as { find: (text: string) => boolean }).find("Thoughtful people"),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => window.getSelection()?.toString())).toContain(
    "Thoughtful people",
  );
  const about = page.locator(".about-teaser a");
  await about.focus();
  await expect(about).toBeFocused();
  await expect(about).toBeInViewport();
  // Let the browser record actual responsive heights as each section is revealed.
  for (const section of await contained.all()) {
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeInViewport();
  }
  await page.evaluate(() => document.fonts.ready);
  const heights = () =>
    contained.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
  const before = await heights();
  await page.emulateMedia({ media: "print" });
  expect(
    await contained.evaluateAll((nodes) =>
      nodes.every((node) => getComputedStyle(node).contentVisibility === "visible"),
    ),
  ).toBe(true);
  await page.emulateMedia({ media: "screen" });
  // Compare containment against ordinary layout at the same viewport and fonts.
  await page.addStyleTag({
    content: `${sections} { content-visibility: visible !important; contain: none !important; }`,
  });
  const after = await heights();
  after.forEach((height, index) => expect(Math.abs(height - before[index])).toBeLessThan(2));
  // A fresh direct legacy hash must resolve while containment is active.
  await page.goto("/#contact", { waitUntil: "networkidle" });
  await expect(page.locator("#contact")).toBeInViewport();
  await expect(page.locator('#contact a[href="/contact"]')).toBeVisible();
});
