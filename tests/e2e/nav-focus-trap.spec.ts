import { expect, test, type Page } from "@playwright/test";

/**
 * The geometric half of `docs/08-review-accessibility-c2` N1 — SC 2.4.11 Focus
 * Not Obscured (Minimum), Level AA — plus N2 (SC 2.4.3 Focus Order, Level A).
 *
 * axe found neither, and cannot: axe evaluates a static DOM, and both defects
 * exist only while the sheet is open and focus has moved. The sheet-open axe
 * scan returns 0 violations and is still wrong about the page.
 *
 * 767x900 and 480x700 are the two viewports the reviewer measured at **100%
 * ring coverage, zero visible pixels**. 767 is the last pixel below the 48rem
 * breakpoint and is what a 1534px window at 200% zoom produces; 480 is a common
 * split-screen width. The unit tests in `src/components/layout/Nav.test.tsx`
 * cover the trap's logic; this file covers the thing only real layout can
 * answer — is the focused element actually behind the sheet.
 */

const OBSCURING_VIEWPORTS = [
  { width: 767, height: 900 },
  { width: 480, height: 700 },
  { width: 390, height: 844 },
  { width: 320, height: 640 },
] as const;

/** Tab stops to walk — comfortably more than the sheet contains. */
const TAB_STEPS = 12;

async function openSheet(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.locator(".nav-sheet")).toHaveAttribute("data-open", "true");
}

/** True when the focused element's box, plus its ring, is covered by the sheet. */
async function focusIsObscured(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const active = document.activeElement;
    const sheet = document.querySelector(".nav-sheet");
    if (!(active instanceof HTMLElement) || !(sheet instanceof HTMLElement)) return false;
    if (sheet.contains(active) || active === document.body) return false;
    const box = active.getBoundingClientRect();
    if (box.width === 0 && box.height === 0) return false;
    const centre = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return centre === sheet || (centre !== null && sheet.contains(centre));
  });
}

test.describe("mobile nav sheet — focus is never behind the overlay", () => {
  for (const viewport of OBSCURING_VIEWPORTS) {
    test(`focus stays inside the nav at ${viewport.width}x${viewport.height} (N1)`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await openSheet(page);

      // Focus must land inside the sheet on open, not stay on the toggle.
      await expect(page.locator(".nav-sheet :focus")).toHaveCount(1);

      for (let step = 0; step < TAB_STEPS; step += 1) {
        await page.keyboard.press("Tab");

        const inNav = await page.evaluate(() => {
          const active = document.activeElement;
          const nav = document.querySelector("nav.nav");
          return active instanceof HTMLElement && nav instanceof HTMLElement
            ? nav.contains(active)
            : false;
        });
        expect(inNav, `Tab ${step + 1} left the nav while the sheet was open`).toBe(true);
        expect(await focusIsObscured(page), `Tab ${step + 1} focused a covered element`).toBe(
          false,
        );
      }
    });
  }

  test("Escape returns focus to the toggle rather than dropping it to BODY (N2)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await openSheet(page);
    await page.keyboard.press("Tab");

    await page.keyboard.press("Escape");

    await expect(page.locator(".nav-sheet")).toHaveAttribute("data-open", "false");
    const landed = await page.evaluate(() => ({
      isBody: document.activeElement === document.body,
      className: document.activeElement?.className ?? null,
    }));
    expect(landed.isBody).toBe(false);
    expect(landed.className).toContain("nav-toggle");
  });

  test("activating a sheet link moves focus to the destination section (N2)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await openSheet(page);

    await page.getByRole("link", { name: "Work" }).click();

    await expect(page.locator(".nav-sheet")).toHaveAttribute("data-open", "false");
    const landed = await page.evaluate(() => ({
      isBody: document.activeElement === document.body,
      id: document.activeElement?.id ?? null,
    }));
    expect(landed.isBody).toBe(false);
    expect(landed.id).toBe("work");
  });

  test("desktop is untouched: no trap, and the skip link still works", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // The toggle is not rendered as a disclosure at this width.
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();

    // First Tab reveals the skip link; Enter must still reach <main>.
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip-link")).toBeFocused();
    await page.keyboard.press("Enter");
    const landedOnMain = await page.evaluate(() => document.activeElement?.id === "main");
    expect(landedOnMain).toBe(true);
  });
});
