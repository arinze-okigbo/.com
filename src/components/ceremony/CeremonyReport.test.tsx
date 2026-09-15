import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { analyzeCeremony, type CeremonyAnalysis } from "@/lib/webauthn/analyze";
import { loadSampleCeremony } from "@/lib/webauthn/sample";

import { CeremonyReport } from "./CeremonyReport";

afterEach(cleanup);

/**
 * The report over the captured sample — the same render path a live ceremony
 * takes, since both go through one `CeremonyAnalysis`.
 */
let analysis: CeremonyAnalysis;

beforeAll(async () => {
  analysis = await analyzeCeremony(loadSampleCeremony());
});

/**
 * The group set is pinned deliberately.
 *
 * Each group is one scrim rect (`docs/04 §3.5` A8.3). `authenticatorData` and
 * `The assertion` were split because a single block of each measured 1,712px
 * and 1,152px — carves that flatten the field for their whole length and then
 * flatter every contrast reading taken inside them, which is the one failure
 * that looks like success from both directions at once.
 *
 * HEIGHT IS NOT THE PREDICATE. The defect is a rect that is tall **and mostly
 * not text**: field-three-d measures summed `Range.getClientRects()` line
 * height over box height, where prose lands near 1 and a container near 0. Real
 * prose legitimately exceeds a viewport — `authenticatorData — the attested
 * credential` is 919px at 1280×900 and correct as it stands. So re-measure
 * coverage, not height, before editing this list, and never merge two groups
 * back together to make a rename easier: that re-creates a container-shaped
 * carve, and the runtime guard is development-only and will not warn in the
 * build anyone profiles.
 */
const EXPECTED_GROUPS: readonly string[] = [
  "clientDataJSON — what the browser swears it saw",
  "attestationObject — CBOR, decoded",
  "authenticatorData — the fixed header",
  "authenticatorData — the attested credential",
  "The assertion",
  "The signature, and the bytes it covers",
  "Verification result",
  "Afterwards — what persists",
];

describe("CeremonyReport", () => {
  it("renders every group, each its own scrim rect", () => {
    render(<CeremonyReport analysis={analysis} />);

    const headings = screen.getAllByRole("heading", { level: 4 }).map((node) => node.textContent);
    expect(headings).toEqual(EXPECTED_GROUPS);
  });

  it("gives each group its own carve rather than one rect for the report", () => {
    const { container } = render(<CeremonyReport analysis={analysis} />);

    // One per group plus the two step headers. No enclosing rect: a scrim that
    // contains another scrim is the shape that extinguishes the field.
    const scrims = Array.from(container.querySelectorAll("[data-scrim]"));
    expect(scrims.length).toBe(EXPECTED_GROUPS.length + 2);
    for (const scrim of scrims) {
      expect(scrim.querySelector("[data-scrim]")).toBeNull();
    }
  });

  it("labels the replayed sample, always", () => {
    render(<CeremonyReport analysis={analysis} />);

    expect(screen.getByText(/pre-captured sample, not your device/i)).toBeInTheDocument();
    expect(screen.getByText(/the private key involved was never yours/i)).toBeInTheDocument();
  });

  it("reports the verification the visitor's own browser just computed", () => {
    render(<CeremonyReport analysis={analysis} />);

    const heading = screen.getByRole("heading", { level: 4, name: "Verification result" });
    const group = heading.closest("section");
    expect(group).not.toBeNull();
    expect(within(group as HTMLElement).getByText("signature valid")).toBeInTheDocument();
  });
});
