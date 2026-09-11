import { expect, test } from "@playwright/test";
import { statSync } from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * The real print pipeline — `docs/08-review-crossbrowser-c2` N1 (HIGH).
 *
 * The figure printed as an empty rounded box for everyone not on reduced
 * motion. Two conditions produced it and both had to be true at once:
 * `runtime/mount.ts` pins the SVG poster to `opacity: 0` in an INLINE style on
 * the first drawn frame, and `runtime/scene.ts` builds the OGL renderer with
 * the default `preserveDrawingBuffer: false`, so the canvas has nothing for the
 * print rasteriser to re-snapshot.
 *
 * The counterfactual is the proof, not the computed styles: print the same page
 * twice, once with WebGL live and once with `getContext("webgl*")` stubbed to
 * `null`, and compare PDF bytes. Before the fix the live run was ~78 KB
 * smaller — the missing bytes being the vector poster's ~248 circles. After it
 * the two runs must agree closely, because both now print the poster.
 */

const BLOCK_WEBGL = `
  HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext, {
    apply(target, self, args) {
      if (typeof args[0] === "string" && args[0].startsWith("webgl")) return null;
      return Reflect.apply(target, self, args);
    },
  });
`;

/** Byte spread allowed between the two runs, as a fraction of the larger PDF. */
const MAX_PDF_DELTA_RATIO = 0.05;

test.describe("print", () => {
  // `page.pdf()` is headless-Chromium only.
  test.skip(({ browserName, isMobile }) => browserName !== "chromium" || isMobile === true);

  test("the attestation figure prints whether or not WebGL ran (N1)", async ({ browser }) => {
    const sizes: number[] = [];

    for (const blockWebgl of [false, true]) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      if (blockWebgl) await context.addInitScript(BLOCK_WEBGL);
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });

      // Bring the figure into view and let the poster→canvas cross-fade finish,
      // which is the state the defect needs.
      await page.locator("[data-attestation-poster]").scrollIntoViewIfNeeded();
      await page.waitForTimeout(4000);

      if (!blockWebgl) {
        // Precondition: the run really did reach the defective state.
        await expect(page.locator("canvas")).toHaveCount(1);
        const inlineStyle = await page.locator("[data-attestation-poster]").getAttribute("style");
        expect(inlineStyle).toContain("opacity: 0");
      }

      const file = path.join(os.tmpdir(), `print-${blockWebgl ? "nogl" : "gl"}-${Date.now()}.pdf`);
      await page.pdf({ path: file, format: "A4", printBackground: true });
      sizes.push(statSync(file).size);
      await context.close();
    }

    const [live, blocked] = sizes;
    const delta = Math.abs(blocked - live);
    // Before the fix this was ~77,986 B on a ~262 KB document (30%).
    expect(delta / Math.max(live, blocked)).toBeLessThan(MAX_PDF_DELTA_RATIO);
  });

  test("print styles reach the poster, the canvas, the CTA and the URLs", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator("[data-attestation-poster]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(4000);
    await page.emulateMedia({ media: "print" });
    // Both the poster's opacity and the button's border-color are transitioned
    // properties, so an immediate read samples them mid-flight and sees the
    // pre-print value. `--duration-reveal` is 280ms; wait past it.
    await page.waitForTimeout(1000);

    const measured = await page.evaluate(() => {
      const poster = document.querySelector("[data-attestation-poster]");
      const canvas = document.querySelector("canvas");
      const cta = document.querySelector(".btn--primary");
      const link = document.querySelector('a[href^="https://"]');
      const after = link === null ? null : getComputedStyle(link, "::after");
      const paragraph = document.querySelector("main p");
      return {
        posterOpacity: poster === null ? null : getComputedStyle(poster).opacity,
        canvasDisplay: canvas === null ? null : getComputedStyle(canvas).display,
        ctaBorderColor: cta === null ? null : getComputedStyle(cta).borderTopColor,
        urlContent: after?.content ?? null,
        urlPosition: after?.position ?? null,
        urlTransform: after?.transform ?? null,
        orphans: paragraph === null ? null : getComputedStyle(paragraph).orphans,
      };
    });

    // N1 — the poster is the printable artifact, over an inline opacity: 0.
    expect(measured.posterOpacity).toBe("1");
    expect(measured.canvasDisplay).toBe("none");
    // N3 — the CTA keeps an outline once its accent fill is reset away.
    expect(measured.ctaBorderColor).toBe("rgb(0, 0, 0)");
    // N2 — the URL text is laid out normally instead of inside a 2px box at
    // scaleX(0), which is what `.link::after` left it in.
    expect(measured.urlContent).toContain("https://");
    expect(measured.urlPosition).toBe("static");
    expect(measured.urlTransform).toBe("none");
    // N4 — pagination control exists at all.
    expect(measured.orphans).toBe("3");
  });
});
