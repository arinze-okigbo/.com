import { expect, test } from "@playwright/test";

/**
 * Home page structural guarantees — `docs/05-information-architecture.md`.
 *
 * The site is a single page of six sections (hero, selected work, projects,
 * writing, about, contact); writing is hidden and unlisted until two real
 * posts exist (`docs/05 §6`), and the Cyera work entry is currently omitted
 * under the ship-gate in `docs/05 §3.2`/§3.3 rather than shipped with visible
 * placeholders, so `workEntries` (`src/content/work.ts`) has three entries and
 * the section renders the fallback heading/intro strings for that count.
 *
 * This file does not duplicate `tests/e2e/nav-focus-trap.spec.ts` (mobile
 * sheet focus behaviour) or `tests/e2e/print.spec.ts` (print rendering of the
 * attestation figure).
 */

/**
 * The headings-only test, `docs/05 §4` — the fallback chain, since the Cyera
 * entry is currently cut. In DOM order, this h1-h3 chain alone must convey
 * what Arinze builds, his three strongest pieces of evidence, and how to
 * reach him [R9].
 */
const EXPECTED_HEADING_CHAIN: readonly { level: number; text: string }[] = [
  { level: 1, text: "Arinze Okigbo" },
  {
    level: 2,
    text: "Group payments at Splita. Browser authentication at Queralt Inc. Model evaluation at Snorkel AI.",
  },
  { level: 3, text: "Splita — group payments collected up front" },
  {
    level: 3,
    text: "Browser-native authentication — FIDO2, PKI, and Microsoft Entra ID",
  },
  { level: 3, text: "LLM output evaluation inside production AI pipelines" },
  // #attestation sits here on the page and contributes NO heading, by design:
  // docs/15 §3 row 3 titles it by its eyebrow precisely so the R9 chain is
  // unchanged by the field port. Its absence from this list is the assertion.
  {
    level: 2,
    text: "A WebAuthn ceremony runs here, on your device, and this page decodes every byte of it.",
  },
  { level: 3, text: "Read this first" },
  { level: 3, text: "The captured sample, decoded" },
  { level: 3, text: "Notes" },
  {
    level: 2,
    text: "Open-source: SkyView layers live flight traffic on a photorealistic 3D globe.",
  },
  {
    level: 3,
    text: "SkyView — browser-based 3D globe on Google Photorealistic 3D Tiles",
  },
  { level: 2, text: "TechBuzz, AI training, and a Nigerian tech incubator came before Splita." },
  {
    level: 2,
    text: "arinze@splita.co — direct email, plus GitHub, LinkedIn, X, and the résumé.",
  },
];

/** Strings that must never reach rendered output — deliberately-omitted facts. */
const PLACEHOLDER_MARKERS = ["[[", "NEEDS-FACT", "TBD"] as const;

async function getHeadingChain(
  page: import("@playwright/test").Page,
): Promise<{ level: number; text: string }[]> {
  return page.$$eval("h1, h2, h3, h4, h5, h6", (nodes) =>
    nodes.map((node) => ({
      level: Number(node.tagName.slice(1)),
      text: (node.textContent ?? "").replace(/\s+/g, " ").trim(),
    })),
  );
}

test.describe("home page structure", () => {
  test("the core sections render with their real ids and headings", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "Arinze Okigbo" })).toBeVisible();

    await expect(page.locator("#work")).toBeVisible();
    await expect(
      page.locator("#work").getByRole("heading", {
        level: 2,
        name: "Group payments at Splita. Browser authentication at Queralt Inc. Model evaluation at Snorkel AI.",
      }),
    ).toBeVisible();

    await expect(page.locator("#projects")).toBeVisible();
    await expect(
      page.locator("#projects").getByRole("heading", {
        level: 2,
        name: "Open-source: SkyView layers live flight traffic on a photorealistic 3D globe.",
      }),
    ).toBeVisible();

    await expect(page.locator("#about")).toBeVisible();
    await expect(
      page.locator("#about").getByRole("heading", {
        level: 2,
        name: "TechBuzz, AI training, and a Nigerian tech incubator came before Splita.",
      }),
    ).toBeVisible();

    await expect(page.locator("#contact")).toBeVisible();
    await expect(
      page.locator("#contact").getByRole("heading", {
        level: 2,
        name: "arinze@splita.co — direct email, plus GitHub, LinkedIn, X, and the résumé.",
      }),
    ).toBeVisible();
  });

  test("the h1-h3 headings chain matches the headings-only test [R9]", async ({ page }) => {
    await page.goto("/");

    const chain = await getHeadingChain(page);

    expect(chain).toEqual(EXPECTED_HEADING_CHAIN);
  });

  test("exactly one h1 exists, and no heading level is skipped", async ({ page }) => {
    await page.goto("/");

    const chain = await getHeadingChain(page);
    const h1Count = chain.filter((heading) => heading.level === 1).length;
    expect(h1Count).toBe(1);

    for (let index = 1; index < chain.length; index += 1) {
      const jump = chain[index].level - chain[index - 1].level;
      expect(jump, `heading level jumped by ${jump} at "${chain[index].text}"`).toBeLessThanOrEqual(
        1,
      );
    }
  });

  test("the contact section's heading is the email address itself", async ({ page }) => {
    await page.goto("/");

    const contactHeading = page.locator("#contact").getByRole("heading", { level: 2 });
    await expect(contactHeading).toContainText("arinze@splita.co");

    // The address also appears as plain, selectable body text [R25], distinct
    // from the mailto: CTA button.
    await expect(
      page.locator("#contact").getByText("arinze@splita.co", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("#contact").getByRole("link", { name: "Email arinze@splita.co" }),
    ).toHaveAttribute("href", "mailto:arinze@splita.co");
  });

  test("core content renders with JavaScript disabled [R4, R30]", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "Arinze Okigbo" })).toBeVisible();
    await expect(
      page.getByText("I build group-payment and browser-native authentication systems."),
    ).toBeVisible();
    await expect(page.locator("#work")).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Email arinze@splita.co" }).first(),
    ).toHaveAttribute("href", "mailto:arinze@splita.co");

    await context.close();
  });

  test("no placeholder text ever reaches the rendered page", async ({ page }) => {
    await page.goto("/");

    const bodyText = await page.locator("body").innerText();

    for (const marker of PLACEHOLDER_MARKERS) {
      expect(
        bodyText.includes(marker),
        `found placeholder marker "${marker}" in rendered text`,
      ).toBe(false);
    }
  });

  test("the writing section is hidden and unlisted at launch [docs/05 §6]", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#writing")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Writing", exact: true })).toHaveCount(0);
    await expect(page.getByRole("navigation", { name: "Primary" })).not.toContainText("Writing");
  });
});
