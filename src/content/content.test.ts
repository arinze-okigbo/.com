import { describe, expect, it } from "vitest";

import {
  aboutParagraphs,
  credentialsDetailLine,
  credentialsLine,
  educationLine,
} from "@/content/about";
import { ATTESTATION } from "@/content/attestation";
import { footerLinks, navItems, resumePendingLabel } from "@/content/chrome";
import { CONTACT, contactEmail, contactLinks } from "@/content/contact";
import { heroArtifacts, heroClaim, heroCredentials, heroName } from "@/content/hero";
import { NOT_FOUND } from "@/content/not-found";
import { PROJECTS, projectEntries } from "@/content/projects";
import { SELECTED_WORK, workEntries } from "@/content/work";
import { WRITING } from "@/content/writing/copy";

/** Every string that can reach the DOM, flattened. */
function shippedStrings(): readonly string[] {
  return [
    heroName,
    heroClaim,
    ...heroCredentials.map((segment) => segment.text),
    ...heroArtifacts.flatMap((artifact) => [artifact.label, artifact.href]),
    SELECTED_WORK.heading,
    SELECTED_WORK.intro ?? "",
    ...workEntries.flatMap((entry) => [
      entry.artifact,
      entry.mechanism,
      ...entry.contribution,
      entry.outcome ?? "",
      entry.role ?? "",
      entry.org,
      entry.period ?? "",
      entry.domain,
    ]),
    ATTESTATION.posterAlt,
    ...ATTESTATION.caption,
    PROJECTS.heading,
    PROJECTS.intro ?? "",
    ...projectEntries.flatMap((project) => [
      project.artifact,
      project.mechanism,
      project.meta,
      ...project.body,
    ]),
    WRITING.heading,
    WRITING.intro ?? "",
    ...aboutParagraphs,
    educationLine,
    ...credentialsLine,
    ...credentialsDetailLine,
    CONTACT.heading,
    contactEmail,
    ...contactLinks.map((link) => link.label),
    ...navItems.map((item) => item.label),
    ...footerLinks.map((link) => link.label),
    resumePendingLabel,
    NOT_FOUND.heading,
    NOT_FOUND.body,
  ];
}

describe("the placeholder rule", () => {
  const BANNED_MARKERS = [
    "[[NEEDS-FACT",
    "NEEDS-FACT",
    "TBD",
    "TODO",
    "coming soon",
    "Coming soon",
    "Lorem ipsum",
    "placeholder",
  ];

  it.each(BANNED_MARKERS)("never renders the marker %s to the page", (marker) => {
    const offenders = shippedStrings().filter((value) => value.includes(marker));
    expect(offenders).toEqual([]);
  });

  it("renders no square-bracketed placeholder of any shape", () => {
    const offenders = shippedStrings().filter((value) => /\[\[|\]\]/.test(value));
    expect(offenders).toEqual([]);
  });

  it("omits the Cyera entry entirely rather than shipping it unsourced", () => {
    // docs/05 §3.3 ship-gate: the entry is 100% placeholder while §11 Q2 is open.
    expect(workEntries.some((entry) => entry.org === "Cyera")).toBe(false);
    expect(SELECTED_WORK.heading).not.toContain("Cyera");
  });

  it("omits a disputed metadata slot instead of guessing it", () => {
    const snorkel = workEntries.find((entry) => entry.org === "Snorkel AI");
    expect(snorkel?.role).toBeNull();
    expect(snorkel?.period).toBeNull();
  });

  it("keeps the work-section intro count in step with the entry count", () => {
    expect(SELECTED_WORK.intro).toContain(
      workEntries.length === 4 ? "Four entries" : "Three entries",
    );
  });
});

describe("R9 — the headings-only test", () => {
  /** Every h1–h3 in DOM order, as the page renders them. */
  const headingsChain: readonly string[] = [
    heroName,
    SELECTED_WORK.heading,
    ...workEntries.map((entry) => entry.artifact),
    PROJECTS.heading,
    ...projectEntries.map((project) => project.artifact),
    // About and Contact section headings close the chain.
  ];

  const fullChain = [...headingsChain, "TechBuzz", CONTACT.heading].join(" ");

  it("conveys what he builds", () => {
    expect(fullChain).toContain("Group payments");
    expect(fullChain).toContain("Browser authentication");
    expect(fullChain).toContain("Model evaluation");
  });

  it("conveys the three strongest pieces of evidence", () => {
    expect(fullChain).toContain("Splita — group payments collected up front");
    expect(fullChain).toContain(
      "Browser-native authentication — FIDO2, PKI, and Microsoft Entra ID",
    );
    expect(fullChain).toContain("LLM output evaluation inside production AI pipelines");
  });

  it("conveys how to reach him — the address is in the chain", () => {
    expect(CONTACT.heading).toContain(contactEmail);
  });

  it("contains no job title as a heading [R21]", () => {
    const TITLES = ["Co-Founder", "CEO", "Intern", "Contributor", "Engineer at"];
    const headings = [
      ...workEntries.map((entry) => entry.artifact),
      ...projectEntries.map((project) => project.artifact),
    ];
    TITLES.forEach((title) => {
      headings.forEach((heading) => expect(heading).not.toContain(title));
    });
  });

  it("contains no category label as a section heading [R8]", () => {
    const LABELS = ["About", "Projects", "Experience", "Skills", "More", "Work"];
    const sectionHeadings = [SELECTED_WORK.heading, PROJECTS.heading, CONTACT.heading];
    LABELS.forEach((label) => {
      sectionHeadings.forEach((heading) => expect(heading).not.toBe(label));
    });
  });
});

describe("link hygiene", () => {
  const allHrefs: readonly string[] = [
    ...heroCredentials.filter((segment) => segment.kind === "link").map((segment) => segment.href),
    ...heroArtifacts.map((artifact) => artifact.href),
    ...workEntries.map((entry) => entry.href),
    ...projectEntries.map((project) => project.href),
    ...contactLinks.map((link) => link.href),
    ...footerLinks.map((link) => link.href),
  ];

  it("uses an absolute URL with protocol for every outbound link [R20]", () => {
    const outbound = allHrefs.filter((href) => !href.startsWith("#"));
    outbound.forEach((href) => {
      expect(href).toMatch(/^(https:\/\/|mailto:|\/)/);
    });
  });

  it("never ships the protocol-less queraltinc.com of docs/00 Defect 4", () => {
    expect(allHrefs).not.toContain("www.queraltinc.com");
  });

  it("uses information-bearing link text everywhere [R12]", () => {
    const BANNED = ["here", "link", "read more", "click", "learn more", "view", "→"];
    const labels = [
      ...heroArtifacts.map((artifact) => artifact.label),
      ...workEntries.map((entry) => entry.artifact),
      ...projectEntries.map((project) => project.artifact),
      ...contactLinks.map((link) => link.label),
      ...footerLinks.map((link) => link.label),
      NOT_FOUND.homeLink.label,
    ];
    labels.forEach((label) => {
      expect(BANNED).not.toContain(label.toLowerCase().trim());
    });
  });
});

describe("entry shape", () => {
  it("states the mechanism in the first 12 words of every entry [R11]", () => {
    [...workEntries, ...projectEntries].forEach((entry) => {
      expect(entry.mechanism.trim().split(/\s+/).length).toBeLessThanOrEqual(12);
    });
  });

  it("carries an active first-person attribution on every work entry [R16]", () => {
    workEntries.forEach((entry) => {
      expect(entry.contribution.length).toBeGreaterThan(0);
      expect(entry.contribution[0]).toMatch(/\bI\b/);
    });
  });

  it("never implies an outcome that docs/00 does not source [R15]", () => {
    const queralt = workEntries.find((entry) => entry.id === "queralt");
    expect(queralt?.outcome).toBeNull();
  });
});

describe("hero gate", () => {
  it("carries at least three linked proper nouns above the fold [R3]", () => {
    const proofNouns = heroCredentials.filter((segment) => segment.kind === "link");
    expect(proofNouns.length).toBeGreaterThanOrEqual(3);
  });

  it("never uses the word student [R7]", () => {
    const heroText = [heroName, heroClaim, ...heroCredentials.map((s) => s.text)].join(" ");
    expect(heroText.toLowerCase()).not.toContain("student");
  });

  it("carries no self-assessment adjective [R6]", () => {
    const BANNED = [
      "passionate",
      "driven",
      "innovative",
      "dynamic",
      "results-driven",
      "detail-oriented",
      "solutions-focused",
      "visionary",
      "seasoned",
      "versatile",
    ];
    const heroText = [heroClaim, ...heroCredentials.map((s) => s.text)].join(" ").toLowerCase();
    BANNED.forEach((adjective) => expect(heroText).not.toContain(adjective));
  });
});

describe("the attestation caption", () => {
  it("keeps the non-optional second paragraph that refuses the crypto overclaim", () => {
    expect(ATTESTATION.caption).toHaveLength(2);
    expect(ATTESTATION.caption[1]).toContain("encrypts nothing and secures nothing");
  });
});
