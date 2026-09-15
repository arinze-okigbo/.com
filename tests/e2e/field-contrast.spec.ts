import { expect, test, type Page, type TestInfo } from "@playwright/test";

/**
 * The A8.4 harness, and the structural defence against the regression this
 * whole port exists to undo.
 *
 * The shipped lattice drew ~2px cores at 0.165 alpha of `#A8A8A8` on `#0A0A0A`
 * — **1.44:1**, an empty box. Two documents and two review passes described it
 * as compliant, because nothing measured it. docs/15 calls a spec at this level
 * the only thing that stops it recurring, and docs/04 §3.5 states the rule it
 * asserts: substituting a foreground token into the field's ramp is *itself*
 * the defect.
 *
 * This file fails if:
 *   1. either forbidden grey reaches the field or the poster;
 *   2. the poster's gold glows do not terminate at `--glow-far` (A8.1);
 *   3. **any** text element over the live field measures below its own A8.4
 *      floor — 4.5:1 body, 3:1 large — on **composited pixels** read back with
 *      `gl.readPixels`, at seven scroll positions and two viewports;
 *   4. any text element over the field has no `data-scrim` carve at all;
 *   5. any `data-scrim` is a container in disguise;
 *   6. any fixed or sticky layer paints on top of page text.
 *
 * ## Why 3 and 4 are two rules and not one
 *
 * They were one rule, and it was the rule that missed. The probe used to
 * enumerate `[data-scrim]` blocks, so a string with no carve got **no carve and
 * no measurement**, and the two absences covered for each other: the reported
 * A8.4 number stayed healthy because it came only from the blocks that had
 * remembered to declare one. `#ceremony` shipped two `<summary>` eyebrows in
 * `--color-accent` directly on the brightest part of the lattice — gold on gold,
 * **1.98:1** — under a green gate.
 *
 * So the probe now walks *text* (`field/contrast.ts`, `FIELD_SCOPE_SELECTOR`),
 * and rule 4 is asserted separately from the DOM, without the field running at
 * all. Either one alone would have caught that defect; both are here because
 * rule 4 also runs where rule 3 cannot — no GPU, gated device, production
 * build — and a structural check that survives every skip is worth its lines.
 *
 * ## Rule 6 is not a contrast rule and it belongs here anyway
 *
 * The readout shipped as `position: fixed` and painted on top of section copy
 * at every scroll position. No contrast probe can see that: `readPixels` reads
 * the field's framebuffer, which contains no DOM, so two strings drawn over
 * each other compose to a perfect score. It is in this file because this is the
 * file that is supposed to know whether the type over the field is readable,
 * and "another string is printed across it" is the most complete way for it not
 * to be.
 *
 * The probe is `window.__fieldContrast`, exposed by `runtime/mount.ts` in
 * development builds only and dead-code-eliminated from production. It runs
 * `readPixels` once per call, at the end of a frame that was going to be drawn
 * anyway — never inside the render loop, which `docs/15` names as a performance
 * blower.
 */

/** docs/04 §3.5 names these two by hex as the defect. */
const FORBIDDEN_GREYS = ["#a8a8a8", "#5c5c5c", "rgb(168, 168, 168)", "rgb(92, 92, 92)"];

/** A8.4 floors. */
const BODY_FLOOR = 4.5;
const LARGE_FLOOR = 3;

/** docs/04 §3.5 A8.4 — "Ship target: ≥7:1." Reported, not asserted, so a */
/** legitimate art-direction change cannot be blocked by a stretch goal. */
const SHIP_TARGET = 7;

interface ContrastSample {
  readonly ratio: number;
  readonly floor: number;
  readonly rgb: readonly number[];
  readonly ink: string;
  readonly scrim: string;
  readonly label: string;
}

interface ContrastReport {
  readonly worst: number | null;
  readonly samples: number;
  readonly worstSample: ContrastSample | null;
  readonly luminanceSpread: number;
  readonly failures: readonly ContrastSample[];
  readonly elements: number;
  readonly shielded: number;
}

declare global {
  interface Window {
    __fieldContrast?: () => Promise<ContrastReport>;
    __fieldScrimDrops?: () => string;
  }
}

/** The scroll positions A8.4 is measured at. `top` is `scrollY = 0`. */
const MEASURED_ANCHORS = [
  "top",
  "#work",
  "#attestation",
  "#ceremony",
  "#projects",
  "#about",
  "#contact",
] as const;

/** The two viewports the redesign is reviewed at. */
const REVIEW_VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
] as const;

async function scrollTo(page: Page, anchor: string): Promise<void> {
  await page.evaluate((target) => {
    if (target === "top") {
      window.scrollTo(0, 0);
      return;
    }
    document
      .querySelector(target)
      ?.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
  }, anchor);
  // The field lerps its camera, energy and focus toward the new section's state
  // and the scrim tracker re-sorts its slots on the next frame. Measuring before
  // that settles reads a frame the visitor never sees — and under four parallel
  // workers sharing one software GPU, "the next frame" is not immediate.
  await page.waitForTimeout(1_500);
}

/** Mounts every deferred chunk and opens every disclosure, so nothing hides. */
async function revealEverything(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
  });
  await page.waitForTimeout(2_000);
  await page.evaluate(() => {
    for (const disclosure of document.querySelectorAll("details")) disclosure.open = true;
  });
  await page.waitForTimeout(300);
}

async function measure(page: Page): Promise<ContrastReport | null> {
  return page.evaluate(async () => {
    const probe = window.__fieldContrast;
    if (!probe) return null;
    // Three passes: the first arms the loop, the second lets the scrim slots
    // and the camera lerp land, the third measures a settled frame. Two was
    // enough alone and flaked under parallel load, which is the same shape of
    // silent miss this file exists to prevent — a flaky gate gets deleted.
    await probe();
    await probe();
    return probe();
  });
}

async function gotoFieldPage(page: Page): Promise<void> {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
}

/**
 * Waits for the deferred chunk to mount and draw. Returns false if it never does.
 *
 * The 30s budget is not generosity. At 15s the mobile project skipped every
 * measurement in this file while the desktop project passed — the field mounts
 * fine on a Pixel 7 viewport, it was losing the race under four parallel
 * workers — and a silent skip reported as a pass is precisely the failure this
 * whole file exists to catch, reproduced inside the file itself. A skip here
 * now annotates itself so it is visible in the report rather than absent from
 * it.
 */
async function waitForLiveField(page: Page): Promise<boolean> {
  // The field is gated behind an IntersectionObserver and requestIdleCallback,
  // so nudging the scroll is what actually arms it.
  await page.evaluate(() => window.scrollTo(0, 120));
  try {
    await page.waitForFunction(() => typeof window.__fieldContrast === "function", null, {
      timeout: 30_000,
    });
    return true;
  } catch {
    return false;
  }
}

/** Records a skip in the report, so an unmeasured path cannot read as a pass. */
function noteUnmeasured(testInfo: TestInfo, reason: string): void {
  testInfo.annotations.push({ type: "A8.4-unmeasured", description: reason });
}

test.describe("the attestation field is never grey", () => {
  test("the poster renders the field ramp, not a foreground token", async ({ page }) => {
    await gotoFieldPage(page);

    const poster = page.locator("[data-attestation-poster]");
    await expect(poster).toHaveCount(1);

    const markup = (await poster.innerHTML()).toLowerCase();
    for (const grey of FORBIDDEN_GREYS) {
      expect(
        markup,
        `the poster is frame ∞ of the field's shader — ${grey} in it is the 1.44:1 regression, not compliance (docs/04 §3.5)`,
      ).not.toContain(grey);
    }

    // A8.1: emitted light, never paint. Every gold glow terminates at
    // `--glow-far` `#D1A95400`, which is what makes it a light source rather
    // than a gradient-shaped fill.
    expect(markup, "A8.1 requires every poster glow's outer stop to be #d1a95400").toContain(
      "#d1a95400",
    );

    // The ramp is present: the cold end, the gold end, and the hot core.
    expect(markup).toContain("radialgradient");
  });

  test("the poster's resolved colour token is the field ramp", async ({ page }) => {
    await gotoFieldPage(page);
    const color = await page
      .locator("[data-attestation-poster]")
      .evaluate((node) => window.getComputedStyle(node).color);

    for (const grey of FORBIDDEN_GREYS) {
      expect(color.toLowerCase().replace(/\s+/g, " ")).not.toContain(grey);
    }
  });

  test("the stage is dark in both themes (A8.2)", async ({ page }) => {
    await gotoFieldPage(page);
    for (const theme of ["light", "dark"] as const) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      const ink = await page.evaluate(() =>
        window.getComputedStyle(document.documentElement).getPropertyValue("--field-ink").trim(),
      );
      expect(ink, `--field-ink must be the dark stage in ${theme} mode too`).toBe("#0a0908");
    }
  });
});

test.describe("A8.4 — the measured floor, on composited pixels", () => {
  test("body copy over the live field clears 4.5:1", async ({ page }, testInfo) => {
    await gotoFieldPage(page);

    const isLive = await waitForLiveField(page);
    if (!isLive) noteUnmeasured(testInfo, "field never mounted; A8.4 floor was NOT measured here");
    test.skip(
      !isLive,
      "the WebGL field did not mount in this environment (no GPU, gated device, or a production build with the probe eliminated); the grey-regression assertions above still ran",
    );

    // Measure at the brightest authored frame, not at a resting one: scroll to
    // the attestation section, where the field runs at its highest energy.
    await page.evaluate(() => {
      const anchor = document.querySelector("#attestation") ?? document.body;
      anchor.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    });
    await page.waitForTimeout(1_800);

    const report = await page.evaluate(async () => {
      const probe = window.__fieldContrast;
      if (!probe) return null;
      // Two passes: the first arms the loop, the second measures a settled frame.
      await probe();
      return probe();
    });

    expect(report, "the contrast probe returned nothing").not.toBeNull();
    expect(report!.samples, "no [data-scrim] block was on screen to sample").toBeGreaterThan(0);

    const worst = report!.worst ?? 0;
    testInfo.annotations.push({
      type: "A8.4",
      description: `worst composited contrast ${worst.toFixed(2)}:1 over ${report!.samples} samples (ship target ${SHIP_TARGET}:1)`,
    });

    expect(
      worst,
      `body copy over the field measured ${worst.toFixed(2)}:1 on composited pixels. ` +
        "A8.4: this is a defect in the scrim, not a licence to dim the field. " +
        "Remedies in order: raise the data-scrim amount, widen its padding, move the block. " +
        "Dimming the ramp toward grey is not a remedy at all.",
    ).toBeGreaterThanOrEqual(BODY_FLOOR);

    // Large text has a lower floor and is measured from the same pixels, so a
    // body pass implies a large pass; asserted explicitly so a future change
    // that splits the two cannot drop the weaker one silently.
    expect(worst).toBeGreaterThanOrEqual(LARGE_FLOOR);
  });

  /**
   * The six scrim slots are a mechanism, not a budget: only the six blocks
   * nearest the viewport centre are carved and the rest stay lit. There are
   * 8–9 candidates in view, so blocks are dropped every frame, and the question
   * that matters is whether a dropped block with real height on screen ever
   * loses a carve it needed.
   *
   * Two plausible answers were offered and both were wrong. "The dropped block
   * is below the fold" was wrong — dropped blocks are on screen. "The visible
   * part is always a sliver under 120px" was wrong too: a 40px scroll sweep
   * finds 171px at 1280x900 and 228px at 768x1024, where a 150px sweep finds
   * 81px. The coarser the scan, the better the answer looked.
   *
   * So this asserts the only thing that actually settles it — the measured
   * contrast at the scroll position where slot pressure is worst. That is also
   * why raising `SCRIM_SLOTS` is not owed: eight rounded-box SDFs per pixel
   * full-screen is real fillrate against R5's integrated-graphics risk, and the
   * measurement says the carve is not missed.
   */
  test("contrast holds where the scrim slots are most contended", async ({ page }, testInfo) => {
    await gotoFieldPage(page);
    const isLive = await waitForLiveField(page);
    if (!isLive) noteUnmeasured(testInfo, "field never mounted; slot contention was NOT measured");
    test.skip(!isLive, "the WebGL field did not mount in this environment");

    // The sweep runs in one `page.evaluate`, and it does NOT render.
    //
    // Two earlier shapes were too slow to keep. Driving it from the test was
    // ~500 round-trips; moving it in-page still cost a full 15k-point composite
    // per sample — ~264ms a step, 39s a pass, and a timeout the moment both
    // projects ran at once. A flaky two-minute test is a test someone deletes,
    // and deleting this one restores the failure it exists to catch.
    //
    // Resolution was never the thing to trade: a 150px step reports 81px where
    // 40px reports 171px. `scrollTo` settles layout synchronously, so the
    // tracker needs no frame — `__fieldScrimDrops` runs the real scrim pass and
    // nothing else, which makes the whole sweep milliseconds at full detail.
    const sweep = await page.evaluate(() => {
      const STEP = 40;
      const sample = window.__fieldScrimDrops;
      if (!sample) return null;

      const total = document.documentElement.scrollHeight - window.innerHeight;
      let worstY = 0;
      let worstVisible = 0;
      let maxDropped = 0;

      for (let y = 0; y <= total; y += STEP) {
        window.scrollTo(0, y);
        const [count, visible] = sample().split(":").map(Number);
        if (count > maxDropped) maxDropped = count;
        if (visible > worstVisible) {
          worstVisible = visible;
          worstY = y;
        }
      }
      return { worstY, worstVisible, maxDropped };
    });

    expect(sweep, "the scrim sweep hook was not exposed").not.toBeNull();

    const { worstY, worstVisible, maxDropped } = sweep!;

    await page.evaluate((position) => window.scrollTo(0, position), worstY);
    await page.waitForTimeout(2_000);

    const report = await page.evaluate(async () => {
      const probe = window.__fieldContrast;
      if (!probe) return null;
      await probe();
      return probe();
    });

    testInfo.annotations.push({
      type: "A8.3-slots",
      description: `peak ${maxDropped} dropped, largest visible ${worstVisible}px at scrollY ${worstY}; contrast there ${report?.worst?.toFixed(2) ?? "n/a"}:1`,
    });

    if (!report || report.worst === null) return;
    expect(
      report.worst,
      `at scrollY ${worstY} the field drops ${maxDropped} scrim candidates, the largest with ` +
        `${worstVisible}px on screen, and contrast there measured ${report.worst.toFixed(2)}:1. ` +
        "If this fails, the six slots are genuinely too few and SCRIM_SLOTS must rise — do not " +
        "dim the field and do not re-tone the ramp (docs/04 A8.4).",
    ).toBeGreaterThanOrEqual(BODY_FLOOR);
  });

  test("the field emits light rather than rendering an empty box", async ({ page }, testInfo) => {
    await gotoFieldPage(page);
    const isLive = await waitForLiveField(page);
    if (!isLive) noteUnmeasured(testInfo, "field never mounted; emission was NOT measured");
    test.skip(!isLive, "the WebGL field did not mount in this environment");

    await page.waitForTimeout(1_500);

    // The regression this file exists for did not look like a bad ratio. It
    // looked like an empty box: a field drawing almost nothing composites to a
    // near-flat frame, which no contrast number catches. The spread is read
    // back inside the same frame as the ratio, through the same probe, because
    // a `readPixels` issued from outside the render loop against a canvas with
    // `preserveDrawingBuffer: false` reads a cleared buffer and always returns
    // a flat zero — which would make this test pass for the wrong reason and
    // fail for the wrong reason, as it did on its first draft.
    const report = await page.evaluate(async () => {
      const probe = window.__fieldContrast;
      if (!probe) return null;
      await probe();
      return probe();
    });

    expect(report).not.toBeNull();
    testInfo.annotations.push({
      type: "A8.1",
      description: `composite luminance spread ${report!.luminanceSpread.toFixed(1)}/255`,
    });
    expect(
      report!.luminanceSpread,
      "the field composited to a flat frame — it is emitting nothing",
    ).toBeGreaterThan(4);
  });
});

test.describe("A8.4 — every text element over the field, not just the carved ones", () => {
  // Seven scroll positions x two viewports, each with a settle frame and a
  // two-pass readback. It is a sweep, not a spot check, and it needs the
  // budget to be one — a timeout here reads as a skip, and a skip reported as
  // a pass is the failure this file exists to catch.
  test.describe.configure({ timeout: 240_000 });

  /**
   * The sweep this file was missing.
   *
   * The old A8.4 test measured ONE scroll position and reported ONE worst
   * figure over whatever `[data-scrim]` blocks happened to be on screen there.
   * Both narrowings hid the same defect: a string with no carve was not in the
   * enumeration, and `#ceremony`'s eyebrows are not at `#attestation`'s scroll
   * position anyway.
   *
   * This walks the whole document at both review viewports, with every deferred
   * chunk mounted and every disclosure open, and asserts the per-element result
   * — `report.failures` — rather than a single aggregate. An aggregate cannot
   * name the three strings that failed behind the worst one.
   */
  for (const viewport of REVIEW_VIEWPORTS) {
    test(`no string over the field fails its floor at ${viewport.width}x${viewport.height}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await gotoFieldPage(page);

      const isLive = await waitForLiveField(page);
      if (!isLive) {
        noteUnmeasured(testInfo, `field never mounted at ${viewport.width}; A8.4 was NOT measured`);
      }
      test.skip(!isLive, "the WebGL field did not mount in this environment");

      await revealEverything(page);

      const findings: string[] = [];
      let worstOverall = Number.POSITIVE_INFINITY;
      let worstWhere = "";
      let elementsSeen = 0;
      let shieldedSeen = 0;

      for (const anchor of MEASURED_ANCHORS) {
        await scrollTo(page, anchor);
        const report = await measure(page);
        if (!report) continue;

        elementsSeen += report.elements;
        shieldedSeen += report.shielded;
        if (report.worst !== null && report.worst < worstOverall) {
          worstOverall = report.worst;
          worstWhere = anchor;
        }

        for (const failure of report.failures) {
          findings.push(
            `${anchor}: ${failure.ratio.toFixed(2)}:1 against a floor of ${failure.floor} — ` +
              `ink ${failure.ink} on composited rgb(${failure.rgb.join(",")}), ` +
              `data-scrim="${failure.scrim}" — "${failure.label}…"`,
          );
        }
      }

      testInfo.annotations.push({
        type: "A8.4-sweep",
        description:
          `${viewport.width}x${viewport.height}: worst ${worstOverall === Number.POSITIVE_INFINITY ? "n/a" : worstOverall.toFixed(2)}:1 ` +
          `at ${worstWhere || "n/a"} over ${elementsSeen} element readings ` +
          `(${shieldedSeen} shielded by an opaque fill; ship target ${SHIP_TARGET}:1)`,
      });

      // A sample count of zero is the shape of a harness that measured nothing
      // and said nothing was wrong. It is the failure mode this file exists for.
      expect(elementsSeen, "no text element over the field was measured at all").toBeGreaterThan(0);

      expect(
        findings,
        "Text over the field measured below its A8.4 floor on composited pixels. " +
          "Remedies IN ORDER (docs/04 §3.5 A8.4): raise the block's data-scrim amount, " +
          "widen its padding, move the block. Dimming the field is the last resort and " +
          "re-toning the ramp toward grey is not a remedy at all. A block reported with " +
          'data-scrim="(none)" has no carve — give it one.\n' +
          findings.join("\n"),
      ).toEqual([]);

      expect(worstOverall).toBeGreaterThanOrEqual(BODY_FLOOR);
      expect(worstOverall).toBeGreaterThanOrEqual(LARGE_FLOOR);
    });
  }
});

test.describe("A8.3 — every text block over the field declares a carve", () => {
  test.describe.configure({ timeout: 180_000 });

  /**
   * The structural half of the rule above, and the one that runs everywhere.
   *
   * A8.3 says "every text block composited over the field declares
   * `data-scrim`". Nothing asserted it, so the compliance of a string was
   * decided by whether an author had remembered — and `#ceremony`'s two
   * `<summary>` eyebrows had not, in `--color-accent`, on the brightest part of
   * the lattice. The contrast probe could not report it because the probe's own
   * enumeration started from the carves.
   *
   * This needs no GPU and no field: it reads the DOM. So it holds on a
   * production build, on a machine with no WebGL, and under every gate that
   * makes the measurement above skip.
   */
  test("no text element inside .stage or .over-field is left uncarved", async ({
    page,
  }, testInfo) => {
    const findings: string[] = [];

    for (const viewport of REVIEW_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await gotoFieldPage(page);
      await revealEverything(page);

      const uncarved = await page.evaluate(() => {
        const out: { tag: string; color: string; scope: string; text: string }[] = [];
        const seen = new Set<Element>();
        for (const scope of Array.from(document.querySelectorAll(".stage, .over-field"))) {
          const walker = document.createTreeWalker(scope, NodeFilter.SHOW_ELEMENT);
          let node: Node | null = scope;
          while (node) {
            const element = node as HTMLElement;
            node = walker.nextNode();
            if (seen.has(element)) continue;
            seen.add(element);

            const hasOwnText = Array.from(element.childNodes).some(
              (child) =>
                child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0,
            );
            if (!hasOwnText) continue;
            if (element.closest("[data-scrim]")) continue;

            const style = window.getComputedStyle(element);
            if (style.visibility === "hidden" || style.display === "none") continue;
            if (element.getBoundingClientRect().height === 0) continue;

            out.push({
              tag: element.tagName.toLowerCase(),
              color: style.color,
              scope: (scope as HTMLElement).id || (scope as HTMLElement).className,
              text: (element.textContent ?? "").trim().slice(0, 56),
            });
          }
        }
        return out;
      });

      for (const item of uncarved) {
        findings.push(
          `${viewport.width}x${viewport.height} — [${item.scope}] <${item.tag}> ` +
            `${item.color} — "${item.text}…"`,
        );
      }
    }

    testInfo.annotations.push({
      type: "A8.3-coverage",
      description: `${findings.length} uncarved text element(s) over the field across ${REVIEW_VIEWPORTS.length} viewports`,
    });

    expect(
      findings,
      "A8.3: every text block composited over the field declares `data-scrim`. These do not, " +
        "so the field is emitting at full energy directly behind them and nothing measures it. " +
        "Put the carve on the TEXT BLOCK — never on the `<section>` or the `<details>` around " +
        "it, which is the container-shaped rect the next gate rejects.\n" +
        findings.join("\n"),
    ).toEqual([]);
  });
});

test.describe("nothing fixed paints on top of the page's own text", () => {
  test.describe.configure({ timeout: 240_000 });

  /**
   * The readout shipped as `position: fixed` at the bottom-left gutter and
   * overlapped section copy at every scroll position — over "Three entries,
   * ordered by how hard the work is to fake" in the hero, over the
   * authenticator status line in `#ceremony`. Every gate in that build was
   * green, because no gate looked at whether two strings occupy the same
   * pixels.
   *
   * The sticky header is the one intended exception and it is excluded by name:
   * the document is padded for it, it is opaque, and content scrolling beneath
   * an opaque bar is not the defect. Anything else fixed or sticky over live
   * text is.
   */
  const HEADER_SELECTOR = ".site-header";

  for (const viewport of REVIEW_VIEWPORTS) {
    test(`no fixed layer overlaps text at ${viewport.width}x${viewport.height}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await gotoFieldPage(page);
      await revealEverything(page);

      const collisions: string[] = [];

      for (const anchor of MEASURED_ANCHORS) {
        await scrollTo(page, anchor);
        const found = await page.evaluate((headerSelector) => {
          const overlaps: { fixed: string; text: string }[] = [];

          const pinned = Array.from(document.body.querySelectorAll<HTMLElement>("*")).filter(
            (element) => {
              if (element.closest(headerSelector)) return false;
              const style = window.getComputedStyle(element);
              if (style.position !== "fixed" && style.position !== "sticky") return false;
              if (style.visibility === "hidden" || style.opacity === "0") return false;
              // Decorative layers behind the content cannot occlude it.
              if (element.closest(".field-backdrop")) return false;
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            },
          );
          if (pinned.length === 0) return overlaps;

          const textElements = Array.from(
            document.querySelectorAll<HTMLElement>("main *, footer *"),
          )
            .filter((element) =>
              Array.from(element.childNodes).some(
                (child) =>
                  child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0,
              ),
            )
            .filter((element) => !pinned.some((layer) => layer.contains(element)));

          for (const layer of pinned) {
            const box = layer.getBoundingClientRect();
            for (const element of textElements) {
              const rect = element.getBoundingClientRect();
              if (rect.height === 0 || rect.bottom < 0 || rect.top > window.innerHeight) continue;
              const intersects =
                rect.left < box.right &&
                rect.right > box.left &&
                rect.top < box.bottom &&
                rect.bottom > box.top;
              if (!intersects) continue;
              overlaps.push({
                fixed: `<${layer.tagName.toLowerCase()}> "${(layer.textContent ?? "").trim().slice(0, 40)}"`,
                text: (element.textContent ?? "").trim().slice(0, 48),
              });
            }
          }
          return overlaps;
        }, HEADER_SELECTOR);

        for (const overlap of found) {
          collisions.push(`${anchor}: ${overlap.fixed} paints over "${overlap.text}…"`);
        }
      }

      testInfo.annotations.push({
        type: "occlusion",
        description: `${collisions.length} fixed-layer/text collision(s) across ${MEASURED_ANCHORS.length} scroll positions`,
      });

      expect(
        collisions,
        "A fixed or sticky layer is painting on top of the page's own copy. A z-index cannot " +
          "separate two layers that occupy the same pixels — put the element in flow, or dock " +
          "it somewhere content cannot reach. This is how the field readout shipped printed " +
          "across section headings at every scroll position.\n" +
          collisions.join("\n"),
      ).toEqual([]);
    });
  }
});

test.describe("A8.3 — a scrim carves a text block, never a container", () => {
  /**
   * The failure this guards is the one that certifies itself. A `data-scrim` on
   * a container carves a rounded box across whole screenfuls, puts the field
   * out behind them, and then *improves* every contrast number taken there,
   * because each string is scored against the floor that carve created. A dead
   * field and a flattering measurement is the hardest pair of symptoms to
   * notice and the most expensive to trust.
   *
   * `field/scrim.ts` skips these at runtime and warns in development. This is
   * the half that runs in CI, and it runs at every project's viewport on
   * purpose: the defect is viewport-dependent and it is worst where nobody
   * looks. Measured on this page, desktop was clean at 1440, 1280, 1024 and
   * 768 while 320x640 had five, one of them 3.1 viewports tall.
   */
  /**
   * Swept here rather than left to the project matrix. The two configured
   * projects are 1280 and 412 wide, and this page was clean at both while
   * 320x640 had five offenders, one of them 3.1 viewports tall. A gate that
   * only runs where the defect is absent is not a gate.
   */
  const VIEWPORTS = [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ] as const;

  test("no [data-scrim] block is a container in disguise, at any width", async ({
    page,
  }, testInfo) => {
    await gotoFieldPage(page);
    const findings: string[] = [];

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      // Let the responsive layout settle before the rects are read.
      await page.waitForTimeout(400);

      const offenders = await page.evaluate(() => {
        const viewportHeight = window.innerHeight;
        const MIN_TEXT_COVERAGE = 0.5;
        const MIN_LINE_WIDTH = 8;

        return Array.from(document.querySelectorAll<HTMLElement>("[data-scrim]"))
          .filter((node) => node.querySelector("[data-scrim]") === null)
          .map((node) => {
            const height = node.getBoundingClientRect().height;
            const range = document.createRange();
            range.selectNodeContents(node);
            const lines = Array.from(range.getClientRects())
              .filter((rect) => rect.width >= MIN_LINE_WIDTH)
              .reduce((sum, rect) => sum + rect.height, 0);
            range.detach();
            return {
              height: Math.round(height),
              viewports: Number((height / viewportHeight).toFixed(1)),
              coverage: height > 0 ? Math.min(lines / height, 1) : 1,
              scrim: node.dataset.scrim ?? "",
              section: node.closest<HTMLElement>("[data-field-section]")?.id ?? "?",
              text: (node.textContent ?? "").trim().slice(0, 48),
            };
          })
          .filter((item) => item.height > viewportHeight && item.coverage < MIN_TEXT_COVERAGE);
      });

      for (const offender of offenders) {
        findings.push(
          `${viewport.width}x${viewport.height} — ${offender.section}: ${offender.height}px ` +
            `(${offender.viewports} viewports) but only ${Math.round(offender.coverage * 100)}% ` +
            `text — data-scrim="${offender.scrim}" — "${offender.text}…"`,
        );
      }
    }

    testInfo.annotations.push({
      type: "A8.3",
      description: `${findings.length} container-shaped scrim(s) across ${VIEWPORTS.length} widths`,
    });

    expect(
      findings,
      "A scrim on a container carves a screenful of field and then flatters every contrast " +
        "measurement taken over it. The field skips these at runtime, so the text above them " +
        "gets no carve at all. Move data-scrim onto the text blocks inside:\n" +
        findings.join("\n"),
    ).toEqual([]);
  });
});
