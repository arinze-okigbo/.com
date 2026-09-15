import { Icon } from "@/components/hive/Icon";
import Link from "next/link";
import { Suspense } from "react";
import HeroScene from "@/components/hive/HeroScene";
import { Magnetic, Reveal, SplitText } from "@/components/hive/Motion";
import { getHiveContent } from "@/lib/hive/feeds";
import { NYClock } from "@/components/hive/Interactions";
import { ContactBanner, Label, ProjectCard, SectionHeading } from "@/components/hive/Primitives";
import { projects } from "@/content/editorial";
import { Portrait } from "@/components/hive/Portrait";
import "@/components/hive/portrait-design.css";
export default function Home() {
  return (
    <>
      <section className="hero portrait-hero shell" id="top" data-portrait-stage>
        <div className="hero-topline portrait-topline">
          <span>
            <i className="status-dot" /> FOUNDER · ENGINEER · EXPLORER
          </span>
          <span className="hero-location">
            NEW YORK, NY <NYClock />
          </span>
        </div>
        <div className="portrait-hero-composition">
          <div className="portrait-introduction">
            <p className="portrait-kicker">
              A little curiosity.
              <br />A lot of building.
            </p>
            <h1 className="hero-full-name portrait-name" aria-label="Arinze Okigbo">
              <SplitText as="span" text="Arinze" className="hero-name" />
              <span className="hero-surname">
                Okigbo<span className="name-period">.</span>
              </span>
            </h1>
            <p className="portrait-role">
              <span aria-hidden="true">
                <Icon name="arrow-up-right" />
              </span>{" "}
              People. Systems. Possibility.
            </p>
          </div>
          <div className="portrait-hero-image">
            <Portrait />
          </div>
          <div className="portrait-hero-summary">
            <Reveal>
              <p className="hero-description">
                I build at the intersection of <strong>security, identity,</strong> and{" "}
                <strong>AI.</strong> From browser-native authentication to tools that help people
                work and pay together.
              </p>
              <div className="hero-actions">
                <Magnetic>
                  <Link href="/projects" className="button button-primary">
                    Explore my work{" "}
                    <span aria-hidden="true">
                      <Icon name="arrow-up-right" />
                    </span>
                  </Link>
                </Magnetic>
                <Link href="/about" className="text-link">
                  A bit about me{" "}
                  <span aria-hidden="true">
                    <Icon name="arrow-up-right" />
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
        <div className="hero-bottom portrait-hero-bottom">
          <span className="hero-scroll" data-hive-scroll-cue>
            <span>
              <Icon name="arrow-down" />
            </span>{" "}
            SCROLL TO DISCOVER
          </span>
          <Link href="/lab" className="hero-proof">
            <i className="status-dot" /> Try a signature. Test a spring.{" "}
            <span aria-hidden="true">
              <Icon name="arrow-up-right" />
            </span>
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
          <Link href="/now">
            Now, in more detail <Icon name="arrow-up-right" />
          </Link>
        </div>
      </section>
      <section className="section shell portrait-work" id="projects">
        <SectionHeading
          label="01 / SELECTED WORK"
          title="Ideas, made real."
          href="/projects"
          link="All projects"
        />
        <p className="portrait-work-intro">
          Products, protocols, and experiments. Different starting points. The same impulse to build
          something useful.
        </p>
        <div className="project-grid portrait-project-grid" data-hive-spotlight>
          {projects.slice(0, 4).map((project, index) => (
            <Reveal key={project.slug} delay={(index % 2) * 0.08}>
              <ProjectCard project={project} index={index} />
            </Reveal>
          ))}
        </div>
      </section>
      <section className="about-teaser shell portrait-throughline" id="about">
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
            The story so far <Icon name="arrow-up-right" />
          </Link>
        </div>
        <div className="about-index" aria-hidden="true">
          a<span>o</span>
        </div>
      </section>
      <section className="lab-teaser shell portrait-lab-teaser">
        <div>
          <Label>03 / THE LABORATORY</Label>
          <SplitText as="h2" text="Don’t take my word for it. Play with it." by="word" />
          <p>
            Inspect an authentication ceremony. Test a digital signature. Pull on a spring. A space
            for systems you can get your hands on.
          </p>
          <Link className="button button-primary" href="/lab">
            Enter the lab{" "}
            <span>
              <Icon name="arrow-up-right" />
            </span>
          </Link>
        </div>
        <div className="portrait-lab-sculpture">
          <HeroScene />
          <p className="portrait-sculpture-caption">FIG. 01 / CONNECTED INTELLIGENCE</p>
        </div>
      </section>
      <section className="section shell portrait-writing">
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
                Read the essays on identity, security, and building <Icon name="arrow-up-right" />
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
  const { substack } = await getHiveContent();
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
            <span>
              <Icon name="arrow-up-right" />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
