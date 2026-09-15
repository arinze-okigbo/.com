import { PageIntro, ProjectCard, pageMeta, ContactBanner } from "@/components/hive/Primitives";
import { projects } from "@/content/editorial";
export const metadata = pageMeta(
  "Projects",
  "Products, systems, and experiments by Arinze Okigbo. Open the work and inspect the thinking behind it.",
  "/projects",
);
export default function Projects() {
  return (
    <>
      <PageIntro
        label="THE BUILD INDEX"
        title="Less hypothetical. More shipped."
        description="Companies, open-source systems, and experiments. Each has a different starting point. Each gives an idea something concrete to stand on."
      />
      <section
        className="shell project-strip-container"
        style={{ paddingBottom: 112 }}
        data-hive-projects
      >
        <div className="project-strip" data-hive-strip data-hive-spotlight>
          {projects.map((project, index) => (
            <ProjectCard project={project} index={index} key={project.slug} />
          ))}
        </div>
      </section>
      <ContactBanner />
    </>
  );
}
