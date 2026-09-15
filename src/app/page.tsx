import Link from "next/link";
import { Suspense } from "react";
import HeroScene from "@/components/hive/HeroScene";
import { Magnetic, Reveal, SplitText } from "@/components/hive/Motion";
import { getHiveContent } from "@/lib/hive/feeds";
import { NYClock, ProfiledIsland } from "@/components/hive/Interactions";
import { ContactBanner, Label, ProjectCard, SectionHeading } from "@/components/hive/Primitives";
import { projects } from "@/content/editorial";
export default function Home() {
  return (
    <>
      <section className="hero shell" id="top">
        <div className="hero-topline">
          <span>
            <i className="status-dot" /> FOUNDER · ENGINEER · EXPLORER
          </span>
          <span className="hero-location">
            NEW YORK, NY <NYClock />
          </span>
        </div>
        <div className="hero-composition">
          <div className="hero-copy" data-parallax="0.08">
            <p className="hero-kicker">
              A little curiosity.
              <br />A lot of building.
            </p>
            <h1 className="hero-full-name" aria-label="Arinze Okigbo">
              <SplitText as="span" text="Arinze" className="hero-name" />
              <span className="hero-surname" style={{ display: "block" }}>
                Okigbo<span className="name-period">.</span>
              </span>
            </h1>
            <Reveal delay={0.3}>
              <p className="hero-description">
                I build at the intersection of <strong>security, identity,</strong> and{" "}
                <strong>AI.</strong> From browser-native authentication to products shipped with
                agent swarms.
              </p>
              <div className="hero-actions">
                <Magnetic>
                  <Link href="/projects" className="button button-primary">
                    Explore my work <span>↗</span>
                  </Link>
                </Magnetic>
                <Link href="/about" className="text-link">
                  A bit about me <span>↗</span>
                </Link>
              </div>
            </Reveal>
          </div>
          <div className="hero-visual" data-parallax="0.15">
            <ProfiledIsland name="Orbital sculpture">
              <HeroScene />
            </ProfiledIsland>
            <div className="sculpture-label" data-parallax="0.24">
              <span>FIG. 01 — CONNECTED INTELLIGENCE</span>
              <span>MOVE TO EXPLORE ↗</span>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <span className="hero-scroll" data-hive-scroll-cue>
            <span>↓</span> SCROLL TO DISCOVER
          </span>
          <Link href="/lab" className="hero-proof">
            <i className="status-dot" /> This site is Exhibit A. Built by an agent swarm.{" "}
            <span>↗</span>
          </Link>
        </div>
      </section>
      <section className="now-strip" id="current-work">
        <span id="experience" className="legacy-anchor" />
        <div className="shell now-strip-inner">
          <Label>IN THE WORKS</Label>
          <span>
            <b>Splita</b> <span>Group payments, before the group purchase.</span>
          </span>
          <Link href="/now">Now, in more detail ↗</Link>
        </div>
      </section>
      <section className="section shell" id="projects">
        <SectionHeading
          label="01 / SELECTED WORK"
          title="Ideas, made real."
          href="/projects"
          link="All projects"
        />
        <div className="project-grid" data-hive-spotlight>
          {projects.slice(0, 4).map((project, index) => (
            <Reveal key={project.slug} delay={(index % 2) * 0.08}>
              <ProjectCard project={project} index={index} />
            </Reveal>
          ))}
        </div>
      </section>
      <section className="about-teaser shell" id="about">
        <span id="achievements" className="legacy-anchor" />
        <Label>02 / THE THROUGHLINE</Label>
        <div className="about-teaser-copy">
          <SplitText as="h2" text="Curiosity is the constant." by="word" />
          <p>
            From a technology media platform to browser authentication and group payments. I like
            getting close to a problem, understanding its moving parts, and building something you
            can use.
          </p>
          <Link className="text-link" href="/about">
            The story so far ↗
          </Link>
        </div>
        <div className="about-index">
          a<span>o</span>
        </div>
      </section>
      <section className="lab-teaser shell">
        <div>
          <Label>03 / THE LABORATORY</Label>
          <SplitText as="h2" text="Don’t take my word for it. Play with it." by="word" />
          <p>
            Inspect an authentication ceremony. Replay an agent build. Pull on a spring. A space for
            systems you can get your hands on.
          </p>
          <Link className="button button-primary" href="/lab">
            Enter the lab <span>↗</span>
          </Link>
        </div>
        <div className="lab-diagram" aria-hidden="true">
          <span className="lab-orbit orbit-a" />
          <span className="lab-orbit orbit-b" />
          <span className="lab-orbit orbit-c" />
          <span className="lab-center">↗</span>
          <span className="lab-coordinate">EXPERIMENT / INTERACT / UNDERSTAND</span>
        </div>
      </section>
      <section className="section shell">
        <SectionHeading
          label="04 / NOTES & SIGNALS"
          title="Thinking in public."
          href="/writing"
          link="Writing & posts"
        />
        <Suspense
          fallback={
            <div className="writing-home-fallback">
              <Link className="text-link" href="/writing">
                Read the essays on identity, security, and building ↗
              </Link>
            </div>
          }
        >
          <HomeWriting />
        </Suspense>
      </section>
      <ContactBanner />
    </>
  );
}

async function HomeWriting() {
  const { substack, github } = await getHiveContent();
  return (
    <>
      <div className="writing-list">
        {substack.items.slice(0, 2).map((p) => (
          <Link
            href={`/writing/${p.slug}`}
            className="writing-row"
            data-hive-cursor="view"
            key={p.slug}
          >
            <time dateTime={p.date}>
              {new Date(p.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
            <div>
              <SplitText as="h2" text={p.title} by="word" />
              <p>{p.subtitle}</p>
            </div>
            <span>↗</span>
          </Link>
        ))}
      </div>
      {github.latestCommit && (
        <p className="latest-home-commit">
          <span className="eyebrow">LATEST CAPTURED COMMIT</span>
          <a href={github.latestCommit.url} target="_blank" rel="noreferrer">
            {github.latestCommit.repo} — {github.latestCommit.message} ↗
          </a>
        </p>
      )}
    </>
  );
}
