import { Icon } from "@/components/hive/Icon";
import Link from "next/link";
import {
  ContactBanner,
  Label,
  SectionHeading,
  Source,
  pageMeta,
} from "@/components/hive/Primitives";
import { PhysicsTags } from "@/components/hive/Experiments";
import { profile, sources } from "@/content/hive";
import { SplitText } from "@/components/hive/Motion";
import { Portrait } from "@/components/hive/Portrait";
import "@/components/hive/portrait-design.css";
export const metadata = pageMeta(
  "About",
  "The person behind the systems: Arinze Okigbo, founder and Computer Science student at NYU.",
  "/about",
);
export default function About() {
  return (
    <div className="portrait-about-page">
      <section className="portrait-about-intro shell" data-portrait-stage>
        <div className="portrait-about-copy">
          <Label>THE PERSON BEHIND THE WORK</Label>
          <SplitText
            as="h1"
            text="Always asking. Always building."
            by="word"
            className="portrait-about-title"
          />
          <p>
            I’m Arinze. I work across software, security, and products—with a particular interest in
            the systems people depend on.
          </p>
          <Link href="/work" className="text-link">
            Follow the work{" "}
            <span aria-hidden="true">
              <Icon name="arrow-up-right" />
            </span>
          </Link>
        </div>
        <div className="portrait-about-image">
          <Portrait variant="about" />
        </div>
        <div className="portrait-about-note">
          <span aria-hidden="true">
            <Icon name="arrow-up-right" />
          </span>
          <p>
            The tools change.
            <br />
            The curiosity stays.
          </p>
        </div>
      </section>
      <section className="story-grid shell">
        <div>
          <Label>01 / THE STORY</Label>
          <h2>A curious path.</h2>
        </div>
        <div className="story-body">
          <p>
            I started early: a 2018 internship at Ventures Platform Fund in Nigeria, working on data
            security, server management, and operations. Later, I founded TechBuzz, a media platform
            about technology and society.
          </p>
          <p>
            Building the platform meant building the site, working with writers, setting the
            editorial direction, and figuring out the operations. I’m still drawn to work that
            crosses those boundaries.
          </p>
          <p>
            Now, that work includes group payments at Splita, browser-native authentication at
            Queralt, and data security at Cyera.
          </p>
          <p>{profile.education}</p>
          <Source href={sources.site} label="Background" />{" "}
          <Source href={sources.nyu} label="NYU announcement" />{" "}
          <Source href={sources.cyera} label="Cyera announcement" />
        </div>
      </section>
      <section className="section shell">
        <SectionHeading label="02 / HOW I WORK" title="Direction is the craft." />
        <div className="principles-grid">
          <div className="principle">
            <span>01</span>
            <h3>Start with the system.</h3>
            <p>
              Understand the protocol, the people, and the constraints. The interface is only one
              part of the problem.
            </p>
          </div>
          <div className="principle">
            <span>02</span>
            <h3>Build to find out.</h3>
            <p>
              Give an idea something to stand on: a prototype, an experiment, or a working
              implementation.
            </p>
          </div>
          <div className="principle">
            <span>03</span>
            <h3>Test the assumptions.</h3>
            <p>
              A useful result should stand up to questions. Check the details, try the edge cases,
              and keep learning from what happens.
            </p>
          </div>
        </div>
      </section>
      <section className="story-grid shell">
        <div>
          <Label>03 / OFF THE CLOCK</Label>
          <h2>
            Another kind
            <br />
            of momentum.
          </h2>
        </div>
        <div className="story-body">
          <p>
            I competed in track and field at Trinity College. The public athletics record lists
            sprinting events and results.
          </p>
          <Source
            href="https://www.tfrrs.org/athletes/8992717/Trinity_CT/Arinze_Okigbo"
            label="Trinity track & field results"
          />
          <h3>
            The tools change.
            <br />
            The curiosity stays.
          </h3>
          <PhysicsTags
            tags={[
              "WebAuthn",
              "TypeScript",
              "Product",
              "FIDO2",
              "Identity",
              "AI systems",
              "PKI",
              "3D web",
            ]}
          />
        </div>
      </section>
      <ContactBanner />
    </div>
  );
}
