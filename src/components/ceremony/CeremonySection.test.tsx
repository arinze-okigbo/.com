import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CeremonySection } from "@/components/sections/CeremonySection";
import {
  CEREMONY,
  CEREMONY_BRIDGE,
  CEREMONY_DISCLOSURE,
  CEREMONY_NOTICE,
  CEREMONY_RESTING_CAVEAT,
  CEREMONY_SAMPLE_SUMMARY,
} from "@/content/ceremony";

// vitest.config.ts does not set `globals: true`, so RTL's auto-cleanup never
// registers. Unmount explicitly or renders accumulate across tests.
afterEach(cleanup);

/**
 * What the section renders on the server — that is, what a visitor with
 * JavaScript disabled reads. Everything asserted here is in the initial HTML.
 */
describe("CeremonySection", () => {
  it("names the region with its own heading", () => {
    render(<CeremonySection />);

    const region = screen.getByRole("region", { name: CEREMONY.heading });
    expect(region).toHaveAttribute("id", CEREMONY.id);
  });

  it("declares the field composition docs/15 §3 row 4 fixes", () => {
    render(<CeremonySection />);

    const region = screen.getByRole("region", { name: CEREMONY.heading });
    // `stage`, not `over-field`: the field runs under #ceremony in both themes.
    expect(region).toHaveClass("stage");
    expect(region).toHaveAttribute("data-field-section", "ceremony");
  });

  it("never scrims the section itself — carves belong on the text blocks", () => {
    const { container } = render(<CeremonySection />);

    // #ceremony is 2,066px tall. A section-level rect at 0.94 is a
    // taller-than-viewport carve that extinguishes the field for the whole
    // section and inflates every contrast reading taken over it.
    const region = screen.getByRole("region", { name: CEREMONY.heading });
    expect(region).not.toHaveAttribute("data-scrim");

    const blocks = container.querySelectorAll("[data-scrim]");
    expect(blocks.length).toBeGreaterThanOrEqual(4);
    // Including the heading group, which is a text block like any other and is
    // covered by nothing the section declares.
    expect(container.querySelector(".section-heading-group")).toHaveAttribute("data-scrim");
  });

  it("server-renders all three honesty claims as real text", () => {
    render(<CeremonySection />);

    for (const item of CEREMONY_NOTICE.items) {
      expect(screen.getByText(item.lead)).toBeInTheDocument();
    }
  });

  it("keeps the client-side-challenge caveat OUTSIDE the disclosure", () => {
    const { container } = render(<CeremonySection />);

    // docs/05 §3.3a collapses the three-item notice, and the full text is still
    // in the DOM inside it. This one line is not collapsible: a security reader
    // who runs the ceremony and never opens a disclosure must still be unable
    // to mistake a demonstration for authentication.
    const caveat = screen.getByText(CEREMONY_RESTING_CAVEAT);
    expect(caveat).toBeInTheDocument();
    expect(caveat.closest("details")).toBeNull();

    // And the deeper version is present, behind the disclosure, not deleted.
    const deep = screen.getByText(/A real relying party generates the challenge on the server/i, {
      exact: false,
    });
    expect(deep.closest("details")).not.toBeNull();
    expect(container.querySelectorAll("details").length).toBeGreaterThanOrEqual(1);
  });

  it("keeps the resting state to heading, bridge, one line and the button", () => {
    const { container } = render(<CeremonySection />);

    // docs/05 §3.3a: #ceremony measured 3.71 vp at 390×844 against a 0.60
    // budget, and collapsing it is the only reason the page clears R14. Anything
    // added here at rest spends that budget, so the count is pinned.
    const resting = Array.from(container.querySelectorAll("p")).filter(
      (node) => node.closest("details") === null,
    );
    const prose = resting.filter((node) => node.querySelector("button") === null);

    // The bridge is ONE paragraph by ruling, not two: IA rejected moving its
    // second half into the disclosure — that half carries "WebAuthn/FIDO2" and
    // the tie to the Queralt entry — and rewrote it as one instead.
    expect(prose.map((node) => node.textContent)).toEqual([
      CEREMONY_BRIDGE,
      CEREMONY_RESTING_CAVEAT,
    ]);
    // Plus exactly one paragraph carrying the button. Three blocks, no more.
    expect(resting.length - prose.length).toBe(1);
  });

  it("puts the reference material behind a native details with an information-bearing summary", () => {
    const { container } = render(<CeremonySection />);

    const disclosure = container.querySelector("details");
    expect(disclosure).not.toBeNull();

    // [R12] the summary names what is inside — never "Show more".
    const summary = disclosure?.querySelector("summary");
    expect(summary?.textContent).toBe(CEREMONY_DISCLOSURE.summary);

    // A native <details>, not a JS accordion: docs/04 §8.5 refuses a Disclosure
    // component for content, and R30/R4 need the words to survive a render with
    // no script at all. A scrim on the <details> itself would also re-create the
    // container-shaped carve A8.3 forbids.
    expect(disclosure).not.toHaveAttribute("data-scrim");
    expect(disclosure?.querySelectorAll("[data-scrim]").length).toBeGreaterThanOrEqual(3);
  });

  it("server-renders every decoded sample value, so the section teaches with no script", () => {
    render(<CeremonySection />);

    // Collapsed is not absent. `<details>` keeps its content in the DOM, where
    // in-page search finds it and a JS-disabled render still shows it — which is
    // docs/05 §3.3a's third constraint: the captured sample exists FOR the
    // visitor who cannot run the ceremony, so that path must never be broken.
    for (const row of CEREMONY_SAMPLE_SUMMARY.rows) {
      expect(screen.getByText(row.label)).toBeInTheDocument();
      expect(screen.getByText(row.value)).toBeInTheDocument();
    }
  });

  it("offers the interactive ceremony behind an explicit control", () => {
    render(<CeremonySection />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("never reaches navigator.credentials on mount — nothing prompts without a click", () => {
    const create = vi.fn();
    const get = vi.fn();
    vi.stubGlobal("navigator", { ...navigator, credentials: { create, get } });

    render(<CeremonySection />);

    expect(create).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
