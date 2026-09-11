import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./Button";
import { Container } from "./Container";
import { EXTERNAL_LINK_NOTICE_ID, ExternalLinkNotice, InlineLink } from "./InlineLink";
import { MetaLine } from "./MetaLine";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

// vitest.config.ts does not set `globals: true`, so RTL's auto-cleanup never
// registers. Unmount explicitly or renders accumulate across tests.
afterEach(cleanup);

describe("Button", () => {
  it("defaults to the secondary variant so the accent fill is opt-in", () => {
    // Arrange / Act
    render(<Button>Email arinze@splita.co</Button>);

    // Assert — A4 caps primary at one per viewport, so it is never the default
    expect(screen.getByRole("button")).toHaveClass("btn--secondary");
  });

  it("renders the primary fill without a literal text colour", () => {
    render(<Button variant="primary">Email arinze@splita.co</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn--primary");
    // F11: the text colour comes from --color-accent-foreground, which
    // inverts between modes. An inline style here would be the defect.
    expect(button.getAttribute("style")).toBeNull();
  });

  it("marks a disabled link as inert rather than rendering a dead anchor", () => {
    render(
      <Button as="a" href="/resume.pdf" disabled>
        Résumé (PDF)
      </Button>,
    );

    const slot = screen.getByRole("link");
    expect(slot).toHaveAttribute("aria-disabled", "true");
    expect(slot).not.toHaveAttribute("href");
  });
});

describe("InlineLink", () => {
  it("announces a new tab and hardens rel on an external href", () => {
    render(
      <>
        <ExternalLinkNotice />
        <InlineLink href="https://splita.co">Splita</InlineLink>
      </>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    // The notice is a DESCRIPTION, never part of the name. These links are the
    // whole content of an <h3> whose <article> is named from it by
    // `aria-labelledby`, so a notice inside the name leaked into the heading
    // text and into the region name, where it was false.
    expect(link).toHaveAccessibleName("Splita");
    expect(link).toHaveAccessibleDescription("opens in a new tab");
    expect(link).toHaveAttribute("aria-describedby", EXTERNAL_LINK_NOTICE_ID);
  });

  it("gives a same-tab link no new-tab description", () => {
    render(
      <>
        <ExternalLinkNotice />
        <InlineLink href="/writing">Writing</InlineLink>
      </>,
    );

    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("aria-describedby");
    expect(link).toHaveAccessibleName("Writing");
    expect(link).toHaveAccessibleDescription("");
  });

  it("leaves a hash anchor in the same tab", () => {
    render(<InlineLink href="#queralt">Queralt Inc.</InlineLink>);

    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveAccessibleName("Queralt Inc.");
  });

  // docs/04 §3.5 D4: the accent allowlist is normative, A1 wants the 2px bar at
  // REST on the hero proof nouns, and A2 — every other inline link — wants it on
  // hover only. The build followed §8.3's (wrong) table, so the three names the
  // hero exists to carry had no accent router at scroll 0.
  it("is A2 by default, so the accent bar stays hover-gated", () => {
    render(<InlineLink href="https://splita.co">Splita</InlineLink>);

    const link = screen.getByRole("link");
    expect(link).toHaveClass("link");
    expect(link).not.toHaveClass("link--proof");
  });

  it("takes the A1 proof class when emphasis is proof", () => {
    render(
      <InlineLink href="https://splita.co" emphasis="proof">
        Splita
      </InlineLink>,
    );

    expect(screen.getByRole("link")).toHaveClass("link--proof");
  });

  it("keeps emphasis orthogonal to routing and to the new-tab description", () => {
    // A1 is a paint decision. It must not change which element type is
    // rendered, nor the external-link handling that four heading texts depend
    // on.
    render(
      <>
        <ExternalLinkNotice />
        <InlineLink href="https://snorkel.ai" emphasis="proof">
          Snorkel AI
        </InlineLink>
      </>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAccessibleName("Snorkel AI");
    expect(link).toHaveAccessibleDescription("opens in a new tab");
  });
});

describe("MetaLine", () => {
  it("hides the separator from assistive technology", () => {
    const { container } = render(<MetaLine items={["Co-founder", "Splita", "2024—"]} />);

    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators).toHaveLength(2);
    expect(screen.getByText(/Co-founder/)).toBeInTheDocument();
  });
});

describe("SectionHeading", () => {
  it("renders an h2 by default and omits the intro when absent", () => {
    const { container } = render(
      <SectionHeading id="work-heading">Splita collects every share up front</SectionHeading>,
    );

    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "work-heading");
    expect(container.querySelector(".section-heading-intro")).toBeNull();
  });

  it("renders an h3 with its intro at level 3", () => {
    render(
      <SectionHeading id="sub" level={3} intro="One line of context.">
        Browser-native authentication
      </SectionHeading>,
    );

    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    expect(screen.getByText("One line of context.")).toBeInTheDocument();
  });
});

describe("Section and Container", () => {
  it("names the region by its heading and takes the gap, not padding", () => {
    const { container } = render(
      <Section id="work" labelledBy="work-heading">
        <p>Body</p>
      </Section>,
    );

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("id", "work");
    expect(section).toHaveAttribute("aria-labelledby", "work-heading");
    expect(section).toHaveClass("section");
    expect(section).not.toHaveClass("section--last");
  });

  it("defaults to the 672px reading column", () => {
    const { container } = render(<Container>Body</Container>);

    expect(container.firstElementChild).toHaveClass("col", "col--prose");
  });

  // Regression guard for the cascade-layer inversion: Tailwind emits its own
  // `.container` utility into `@layer utilities`, which outranks anything we
  // author in `@layer components`. If this class name ever comes back, every
  // column on the site silently renders at 1024px again.
  it("never emits the reserved Tailwind `container` class", () => {
    const { container } = render(<Container width="wide">Body</Container>);

    expect(container.firstElementChild).not.toHaveClass("container");
  });
});
