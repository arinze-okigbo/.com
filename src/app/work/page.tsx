import { SplitText } from "@/components/hive/Motion";
import {
  ContactBanner,
  Label,
  PageIntro,
  SectionHeading,
  Source,
  pageMeta,
} from "@/components/hive/Primitives";
import { experience } from "@/content/editorial";
import { experience as verifiedExperience, honors, sources } from "@/content/hive";
export const metadata = pageMeta(
  "Work",
  "Group payments, browser-native authentication, data security, and AI evaluation.",
  "/work",
);
export default function Work() {
  const entries = [
    experience[0],
    ...verifiedExperience.map((e) => ({ ...e, href: e.source })),
    ...experience.slice(1),
  ];
  return (
    <>
      <PageIntro
        label="EXPERIENCE / SELECTED CHAPTERS"
        title="Real problems. Different scales."
        description="From coordinating group payments to understanding browser authentication. A selection of the teams, systems, and ideas I’ve worked on."
      />
      <section className="timeline shell" data-hive-experience style={{ position: "relative" }}>
        <svg
          aria-hidden="true"
          viewBox="0 0 2 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            left: -20,
            top: 80,
            width: 2,
            height: "calc(100% - 80px)",
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <path
            d="M1 0V100"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity=".45"
            data-hive-draw
          />
        </svg>
        <p className="eyebrow work-intro-pin" data-hive-pin>
          EXPERIENCE / THE TIMELINE
        </p>
        {entries.map((entry, index) => (
          <article className="timeline-item" key={entry.org} data-hive-step>
            <div className="timeline-date">{entry.period || `0${index + 1}`}</div>
            <div className="timeline-role">
              <SplitText as="h2" text={entry.org} by="word" />
              <p>{entry.role}</p>
            </div>
            <div className="timeline-body">
              <p>{entry.body}</p>
              <Source
                href={entry.org === "Cyera" ? sources.cyera : sources.site}
                label="Public source"
              />
            </div>
          </article>
        ))}
      </section>
      <section className="section shell" id="honors">
        <SectionHeading label="RECOGNITION & PARTICIPATION" title="Beyond the workbench." />
        <div className="credential-list">
          {honors.map((h) => (
            <article className="credential" key={h.name}>
              <Label>ON RECORD</Label>
              <SplitText as="h3" text={h.name} by="word" />
              <p>{h.description}</p>
              <Source href={h.source} />
            </article>
          ))}
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
