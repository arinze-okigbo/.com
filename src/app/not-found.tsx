import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StandaloneLink } from "@/components/ui/StandaloneLink";
import { NOT_FOUND } from "@/content/not-found";

export const metadata: Metadata = {
  title: NOT_FOUND.metadata.title,
  description: NOT_FOUND.metadata.description,
  robots: { index: false, follow: false },
};

/**
 * 404 — `docs/05 §3.7`. No 3D, no motion.
 *
 * [R12] the links are information-bearing: "Arinze Okigbo — the home page", not
 * "go back" or "home".
 */
export default function NotFound(): ReactNode {
  return (
    <Container
      as="section"
      width="prose"
      className="pt-[calc(var(--header-height)+var(--space-12))] pb-[var(--section-gap)]"
    >
      <h1 className="text-h1 text-foreground-strong max-w-[var(--measure-h1)]">
        {NOT_FOUND.heading}
      </h1>

      <p className="mt-[var(--rhythm-title)] text-body text-foreground max-w-[var(--measure-prose)]">
        {NOT_FOUND.body}
      </p>

      <div className="mt-[var(--space-8)] flex flex-wrap items-center gap-[var(--space-6)]">
        <StandaloneLink href={NOT_FOUND.homeLink.href}>{NOT_FOUND.homeLink.label}</StandaloneLink>

        <Button as="a" href={NOT_FOUND.emailAction.href} variant="secondary">
          {NOT_FOUND.emailAction.label}
        </Button>
      </div>
    </Container>
  );
}
