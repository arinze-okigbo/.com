import { expect, test } from "@playwright/test";

test("without JavaScript contact drafts cannot submit to the site", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  try {
    await page.goto("/contact");
    const composer = page.locator(".hive-contact-composer");
    await expect(page.getByLabel("What are you thinking about?")).toBeDisabled();
    await expect(page.getByLabel("Your message", { exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Open email draft" })).toBeDisabled();
    await expect(composer).toHaveAttribute("action", "mailto:arinze@splita.co");
    await expect(page.locator(".contact-email")).toHaveAttribute("href", "mailto:arinze@splita.co");
    await expect(composer.locator("noscript > p")).toBeVisible();
    await expect(composer.locator("noscript > p")).toContainText("Use the email address above");
    // Even a native submission triggered outside React targets email, never
    // the current route with form data in its query string.
    await composer.evaluate((form) => (form as HTMLFormElement).requestSubmit());
    expect(new URL(page.url()).search).toBe("");
    expect(
      requests.some((url) => /^https?:/.test(url) && /[?&](subject|message|body)=/.test(url)),
    ).toBe(false);
  } finally {
    await context.close();
  }
});

test("hydrated contact composer retains its draft and honest handoff message", async ({ page }) => {
  await page.goto("/contact");
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const subject = page.getByLabel("What are you thinking about?");
  await expect(subject).toBeEnabled();
  await subject.fill("A project idea");
  await page.getByLabel("Your message", { exact: true }).fill("A local draft for the email app.");
  await page.getByRole("button", { name: "Open email draft" }).click();
  await expect(page.locator(".hive-contact-composer").getByRole("status")).toContainText(
    "Message has not been sent.",
  );
  await expect(subject).toHaveValue("A project idea");
  expect(requests).toContain(
    "mailto:arinze@splita.co?subject=A%20project%20idea&body=A%20local%20draft%20for%20the%20email%20app.",
  );
  expect(
    requests.some((url) => /^https?:/.test(url) && /[?&](subject|message|body)=/.test(url)),
  ).toBe(false);
});

test("project details expose the original image without adding links inside cards", async ({
  page,
  request,
}) => {
  for (const slug of ["skyview", "campus-bookshelf", "homework-chatbot", "nyc-live"]) {
    await page.goto(`/projects/${slug}`);
    const link = page.getByRole("link", { name: "View full-size image", exact: true });
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^\/(project-media|projects)\/[^?]+\.(png|jpg)$/);
    const asset = await request.get(href!);
    expect(asset.ok()).toBe(true);
    expect(asset.headers()["content-type"]).toMatch(/^image\/(png|jpeg)/);
    await link.focus();
    await expect(link).toBeFocused();
  }
  await page.goto("/projects/skyview");
  const imageLink = page.getByRole("link", { name: "View full-size image", exact: true });
  const href = await imageLink.getAttribute("href");
  await imageLink.focus();
  await imageLink.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
  await page.goto("/projects");
  await expect(page.getByRole("link", { name: "View full-size image", exact: true })).toHaveCount(
    0,
  );
});
