import { SplitText } from "@/components/hive/Motion";
import { notFound } from "next/navigation";
import Link from "next/link";
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
        <Link href="/projects" className="text-link" style={{ marginBottom: 80 }}>
          ← Back to all projects
        </Link>
      </div>
      <ContactBanner />
    </>
  );
}
