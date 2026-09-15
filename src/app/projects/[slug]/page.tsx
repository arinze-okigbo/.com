import { SplitText } from "@/components/hive/Motion";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import mediaInventory from "../../../../hive/research/project-media.json";
import { SharedElement } from "@/components/hive/Interactions";
import { projects } from "@/content/editorial";
import {
  PageIntro,
  ProjectArt,
  Source,
  pageMeta,
  ContactBanner,
} from "@/components/hive/Primitives";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  return p ? pageMeta(p.name, p.description, `/projects/${slug}`) : { title: "Project not found" };
}
export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  const screenshots =
    mediaInventory.projects
      .find((project) => project.slug === slug)
      ?.media.filter((item) => item.selected && item.localPath) ?? [];
  return (
    <>
      <PageIntro label={p.eyebrow} title={p.name} description={p.description}>
        <div className="tag-list">
          {p.stack.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <a className="button button-primary" href={p.url} target="_blank" rel="noreferrer">
          {p.url.includes("github") ? "View source" : "Visit project"} <span>↗</span>
        </a>
      </PageIntro>
      <div className="shell project-detail-hero">
        <SharedElement name={`project-${p.slug}`}>
          <ProjectArt kind={p.visual} large />
        </SharedElement>
      </div>
      <div className="shell">
        <section className="project-details">
          <SplitText as="h2" text="01 / The problem" by="word" />
          <p>{p.problem}</p>
        </section>
        <section className="project-details">
          <SplitText as="h2" text="02 / The build" by="word" />
          <div>
            <p>{p.build}</p>
            <Source href={p.source} label="Read the public source" />
          </div>
        </section>
        <section className="project-details">
          <SplitText as="h2" text="03 / The takeaway" by="word" />
          <p>{p.lesson}</p>
        </section>
        {screenshots.length > 0 && (
          <section className="project-gallery" aria-labelledby="project-screenshots-heading">
            <SplitText as="h2" text="The interface, on record." by="word" />
            <span id="project-screenshots-heading" className="sr-only">
              Public repository screenshots
            </span>
            {screenshots.map(
              (item) =>
                item.localPath && (
                  <figure key={item.localPath} style={{ maxWidth: item.width }}>
                    <Image
                      src={item.localPath}
                      alt={item.factualAlt}
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                      fetchPriority="low"
                      sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) calc(100vw - 112px), 1328px"
                    />
                    <figcaption>
                      <p>{item.suggestedCaption}</p>
                      <Source href={item.source} label="Screenshot source" />
                    </figcaption>
                  </figure>
                ),
            )}
            <p className="gallery-note">
              Repository images document the pictured interface; they do not establish current live
              data availability.
            </p>
          </section>
        )}
        <Link href="/projects" className="text-link" style={{ marginBottom: 80 }}>
          ← Back to all projects
        </Link>
      </div>
      <ContactBanner />
    </>
  );
}
