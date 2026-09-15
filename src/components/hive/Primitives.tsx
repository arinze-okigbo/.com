import Link from "next/link";
import { Icon } from "./Icon";
import { SplitaLogo } from "./SplitaLogo";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Reveal, ScrambleLabel, SplitText, TiltCard } from "./Motion";
import { StickySectionHeading } from "./SectionMotion";
import { TransitionLink } from "./Interactions";
import type { Project } from "@/content/editorial";
export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} — Arinze Okigbo`,
      description,
      url: path,
      images: [`/api/og?title=${encodeURIComponent(title)}`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?title=${encodeURIComponent(title)}`],
    },
  };
}
export function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return (
    <span aria-hidden="true">
      <Icon name={diagonal ? "arrow-up-right" : "arrow-right"} />
    </span>
  );
}
export function Label({ children }: { children: string }) {
  return <ScrambleLabel text={children} className="eyebrow" />;
}
export function PageIntro({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-intro shell">
      <Label>{label}</Label>
      <SplitText as="h1" text={title} by="word" className="page-title" />
      <Reveal>
        <p className="page-description">{description}</p>
        {children}
      </Reveal>
    </section>
  );
}
export function SectionHeading({
  label,
  title,
  href,
  link,
}: {
  label: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <StickySectionHeading>
      <div>
        <Label>{label}</Label>
        <SplitText as="h2" text={title} by="word" />
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {link ?? "Explore"} <Arrow />
        </Link>
      )}
    </StickySectionHeading>
  );
}
export function Source({ href, label = "Source" }: { href: string; label?: string }) {
  return (
    <a className="source-link" href={href} target="_blank" rel="noreferrer">
      {label} <Icon name="arrow-up-right" />
    </a>
  );
}
export function ProjectArt({ kind, large = false }: { kind: Project["visual"]; large?: boolean }) {
  return (
    <div
      className={`project-art art-${kind}${kind === "hive" ? " system-art" : ""}${large ? " art-large" : ""}`}
      aria-label={`${kind === "splita" ? "Splita group payment flow" : kind === "auth" ? "Authentication protocol" : kind === "globe" ? "Geospatial globe" : "Systems architecture"} illustration`}
      data-hive-cursor="view"
      role="img"
    >
      {kind === "splita" ? (
        <>
          <div className="art-grid" />
          <div className="payment-phone">
            <div className="phone-top">
              <SplitaLogo />
              <i>GROUP PAYMENT</i>
            </div>
            <p>
              Good plans.
              <br />
              Already paid.
            </p>
            <div className="payment-avatars">
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span>+1</span>
            </div>
            <div className="payment-rule" />
            <div className="payment-step">
              <span>Collect together</span>
              <Icon name="arrow-up-right" />
            </div>
            <div className="payment-confirm">
              <Icon name="check" /> Everyone in. Move forward.
            </div>
          </div>
          <span className="art-caption">CONCEPTUAL PRODUCT FLOW</span>
        </>
      ) : kind === "auth" ? (
        <>
          <div className="auth-orbits">
            <i />
            <i />
            <i />
          </div>
          <div className="auth-core">
            <Icon name="lock" size={40} />
          </div>
          <span className="auth-node node-one">BROWSER</span>
          <span className="auth-node node-two">AUTHENTICATOR</span>
          <span className="auth-node node-three">IDENTITY PROVIDER</span>
          <span className="art-caption">A PROTOCOL, MADE TANGIBLE</span>
        </>
      ) : kind === "globe" ? (
        <>
          <div className="globe">
            <i />
            <i />
            <i />
            <i />
            <i />
            <b>
              <Icon name="sparkle" />
            </b>
            <b>
              <Icon name="sparkle" />
            </b>
            <b>
              <Icon name="sparkle" />
            </b>
          </div>
          <div className="globe-cross cross-one">
            <Icon name="plus" />
          </div>
          <div className="globe-cross cross-two">
            <Icon name="plus" />
          </div>
          <span className="globe-coordinate">
            40.7128° N<br />
            74.0060° W
          </span>
          <span className="art-caption">GEOSPATIAL SYSTEM ILLUSTRATION</span>
        </>
      ) : (
        <>
          <div className="hive-map">
            <span className="hive-root">
              <Icon name="code" />
              <span>SYSTEM</span>
            </span>
            <div className="hive-connect" />
            <div className="hive-drones">
              <span>INPUT</span>
              <span>PROCESS</span>
              <span>OUTPUT</span>
              <span>CHECKS</span>
            </div>
          </div>
          <span className="art-caption">CONNECTED PARTS. A WORKING SYSTEM.</span>
        </>
      )}
    </div>
  );
}
export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <TiltCard className="project-card">
      <TransitionLink
        href={`/projects/${project.slug}`}
        className="project-card-link"
        transitionName={`project-${project.slug}`}
      >
        <ProjectArt kind={project.visual} />
        <div className="project-card-copy">
          <span className="eyebrow">{project.eyebrow}</span>
          <div className="project-card-title">
            <SplitText as="h3" text={project.name} by="word" />
            <Arrow />
          </div>
          <p>{project.description}</p>
          <span className="project-index">0{index + 1}</span>
        </div>
      </TransitionLink>
    </TiltCard>
  );
}
export function ContactBanner() {
  return (
    <section className="contact-banner shell" id="contact">
      <Label>AN OPEN CONVERSATION</Label>
      <h2>
        Let’s make
        <br />
        something <em>matter.</em>
      </h2>
      <Link href="/contact" className="round-link" aria-label="Get in touch">
        <Arrow />
      </Link>
      <p>Interesting problems. Thoughtful people. Real things, built.</p>
    </section>
  );
}
