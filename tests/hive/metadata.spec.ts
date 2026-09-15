import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { XMLParser, XMLValidator } from "fast-xml-parser";

const canonicalOrigin = "https://arinzeokigbo.com";
function metadata(html: string, key: string) {
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = Object.fromEntries(
      Array.from(tag[0].matchAll(/([\w:-]+)=["']([^"']*)["']/g)).map(match => [match[1], match[2]]),
    );
    if (attrs.property === key || attrs.name === key)
      return attrs.content?.replaceAll("&amp;", "&").replaceAll("&quot;", '"');
  }
  return undefined;
}
function sitemapUrls(xml: string): string[] {
  expect(XMLValidator.validate(xml)).toBe(true);
  const document = new XMLParser().parse(xml);
  const rows = Array.isArray(document.urlset?.url) ? document.urlset.url : [document.urlset?.url];
  return rows.map((row: { loc: string }) => row.loc);
}

test("every sitemap page serves its own valid Open Graph PNG", async ({ request }) => {
  test.setTimeout(120000);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const urls = sitemapUrls(await sitemap.text());
  expect(urls).toContain(`${canonicalOrigin}/lab/changelog`);
  expect(urls.some(url => url.includes("/projects/"))).toBe(true);
  expect(urls.some(url => url.includes("/writing/"))).toBe(true);
  const distinctImages = new Set<string>();
  for (const canonicalUrl of urls) {
    const target = new URL(canonicalUrl);
    expect(target.origin).toBe(canonicalOrigin);
    const response = await request.get(target.pathname);
    expect(response.status(), target.pathname).toBe(200);
    const html = await response.text();
    const image = metadata(html, "og:image");
    expect(image, `${target.pathname} has an Open Graph image`).toBeTruthy();
    const imageUrl = new URL(image!, canonicalOrigin);
    expect(imageUrl.origin, `Image for ${target.pathname} is served by this site`).toBe(canonicalOrigin);
    distinctImages.add(imageUrl.href);
    const asset = await request.get(`${imageUrl.pathname}${imageUrl.search}`);
    expect(asset.status(), `${target.pathname}: ${imageUrl.pathname}`).toBe(200);
    expect(asset.headers()["content-type"]).toContain("image/png");
    const bytes = await asset.body();
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(630);
  }
  expect(distinctImages.size, "Each sitemap page should advertise its own page-specific image").toBe(urls.length);
});

test("RSS, sitemap, robots and security disclosure agree on canonical destinations", async ({ request }) => {
  const [feed, sitemap, robots, security] = await Promise.all([
    request.get("/feed.xml"), request.get("/sitemap.xml"), request.get("/robots.txt"), request.get("/.well-known/security.txt"),
  ]);
  for (const response of [feed, sitemap, robots, security]) expect(response.status(), response.url()).toBe(200);
  expect(feed.headers()["content-type"]).toContain("xml");
  expect(sitemap.headers()["content-type"]).toContain("xml");
  const xml = await feed.text();
  expect(XMLValidator.validate(xml)).toBe(true);
  const channel = new XMLParser().parse(xml).rss.channel;
  const items = Array.isArray(channel.item) ? channel.item : [channel.item];
  expect(items.length).toBeGreaterThan(0);
  const siteUrls = new Set(sitemapUrls(await sitemap.text()));
  for (const item of items) {
    expect(item.title).toBeTruthy();
    expect(Number.isFinite(Date.parse(item.pubDate))).toBe(true);
    expect(siteUrls.has(item.link), `RSS article ${item.link} is discoverable in the sitemap`).toBe(true);
  }
  const robotsText = await robots.text();
  expect(robotsText).toMatch(/User-Agent:\s*\*/i);
  expect(robotsText).toContain(`Sitemap: ${canonicalOrigin}/sitemap.xml`);
  const securityText = await security.text();
  expect(securityText).toContain("Contact: mailto:arinze@splita.co");
  expect(securityText).toContain(`Canonical: ${canonicalOrigin}/.well-known/security.txt`);
  const expiry = securityText.match(/^Expires:\s*(.+)$/m)?.[1];
  expect(expiry).toBeTruthy();
  expect(Date.parse(expiry!)).toBeGreaterThan(Date.now());
});

for (const route of ["/", "/writing", "/lab"]) {
  test(`${route} stays accessible after switching to light mode`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.getByRole("button", { name: "Switch to light mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();
    // Let the real browser color-wipe finish before auditing contrast.
    await page.evaluate(async () => {
      await Promise.allSettled(document.getAnimations().map(animation => animation.finished));
    });
    const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(audit.violations.map(violation => ({ id: violation.id, impact: violation.impact, targets: violation.nodes.map(node => node.target) }))).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
