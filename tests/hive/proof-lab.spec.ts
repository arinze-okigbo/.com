import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function openLab(page: Page) {
  await page.goto("/lab", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open signature lab", exact: true }).click();
  await expect(page.getByRole("button", { name: "Generate key", exact: true })).toBeVisible();
  await page.waitForLoadState("networkidle");
}

test("real signatures verify, reject changed messages, and stay local", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openLab(page);
  const storageBefore = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
  }));
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url() + (request.postData() || "")));
  const marker = "hive-private-challenge-π-2026";
  await page.getByRole("button", { name: "Generate key", exact: true }).click();
  await expect(page.getByText("Key ready. Sign a message next.", { exact: true })).toBeVisible();
  const message = page.getByRole("textbox", { name: "Message", exact: true });
  await message.fill(marker);
  await page.getByRole("button", { name: "Sign message", exact: true }).click();
  await expect(
    page.getByText("Message signed. Verify it or change the message.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Verify signature", exact: true }).click();
  await expect(
    page.getByText("Verified. This signature matches the current message.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tamper with message", exact: true }).click();
  await expect(message).not.toHaveValue(marker);
  await page.getByRole("button", { name: "Verify signature", exact: true }).click();
  await expect(
    page.getByText("Not verified. The message does not match this signature.", { exact: true }),
  ).toBeVisible();
  // Restoring the signed bytes verifies again: the tamper action did not replace the proof.
  await message.fill(marker);
  await page.getByRole("button", { name: "Verify signature", exact: true }).click();
  await expect(
    page.getByText("Verified. This signature matches the current message.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset lab", exact: true }).click();
  await expect(
    page.getByText("Lab reset. The key and signature references have been cleared.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign message", exact: true })).toBeDisabled();
  expect(
    await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } })),
  ).toEqual(storageBefore);
  expect(
    requests.some(
      (request) => request.includes(marker) || request.includes(encodeURIComponent(marker)),
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test("reset discards a real signature that completes after reset", async ({ page }) => {
  await page.addInitScript(() => {
    const original = crypto.subtle.sign.bind(crypto.subtle);
    crypto.subtle.sign = async (...args) => {
      const result = await original(...args);
      await new Promise<void>((resolve) => Object.assign(window, { __releaseProofSign: resolve }));
      return result;
    };
  });
  await openLab(page);
  await page.getByRole("button", { name: "Generate key", exact: true }).click();
  await expect(page.getByText("Key ready. Sign a message next.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sign message", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => typeof (window as unknown as { __releaseProofSign?: () => void }).__releaseProofSign,
      ),
    )
    .toBe("function");
  await page.getByRole("button", { name: "Reset lab", exact: true }).click();
  await page.evaluate(() =>
    (window as unknown as { __releaseProofSign: () => void }).__releaseProofSign(),
  );
  await expect(
    page.getByText("Lab reset. The key and signature references have been cleared.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify signature", exact: true })).toBeDisabled();
});

test("signature lab supports keyboard, reduced motion, both themes and close focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lab", { waitUntil: "networkidle" });
  const opener = page.getByRole("button", { name: "Open signature lab", exact: true });
  await opener.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Generate key", exact: true })).toBeVisible();
  for (const light of [false, true]) {
    if (light) {
      await page.getByRole("button", { name: "Switch to light mode" }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    }
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      audit.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })),
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole("button", { name: "Close lab", exact: true }).click();
  await expect(opener).toBeFocused();
  await expect(page.getByRole("button", { name: "Generate key", exact: true })).toHaveCount(0);
});

test("signature lab explains unavailable crypto without attempting key creation", async ({
  page,
}) => {
  await page.addInitScript(() => Object.defineProperty(crypto, "subtle", { value: undefined }));
  await openLab(page);
  await expect(page.getByText("Web Crypto is unavailable here.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate key", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Close lab", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open signature lab", exact: true })).toBeFocused();
});

test("signature lab enforces encoded byte limits and signs empty messages", async ({ page }) => {
  await openLab(page);
  await page.getByRole("button", { name: "Generate key", exact: true }).click();
  await expect(page.getByText("Key ready. Sign a message next.", { exact: true })).toBeVisible();
  const message = page.getByRole("textbox", { name: "Message", exact: true });
  await message.fill("π".repeat(2049));
  await expect(message).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("button", { name: "Sign message", exact: true })).toBeDisabled();
  await message.fill("");
  await page.getByRole("button", { name: "Sign message", exact: true }).click();
  await expect(
    page.getByText("Message signed. Verify it or change the message.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Verify signature", exact: true }).click();
  await expect(
    page.getByText("Verified. This signature matches the current message.", { exact: true }),
  ).toBeVisible();
});
