import "server-only";
import Image from "next/image";
import inventory from "../../../hive/research/project-media.json";
import "./project-media.css";

export function getProjectMedia(slug: string) {
  const project = inventory.projects.find((item) => item.slug === slug);
  const images = project?.media.filter((item) => item.selected && item.localPath) ?? [];
  return { project, images, transcript: project?.transcript };
}

export function hasProjectMedia(slug: string) {
  const { images, transcript } = getProjectMedia(slug);
  return images.length > 0 || Boolean(transcript);
}

/** All provenance stays on the server; client islands receive only rendered content. */
export function ProjectMedia({ slug, detail = false }: { slug: string; detail?: boolean }) {
  const { images, transcript } = getProjectMedia(slug);
  const image = images[0];
  if (image?.localPath) {
    return (
      <figure className={`project-proof ${detail ? "project-proof-detail" : "project-proof-card"}`}>
        <div className="project-proof-image">
          <Image
            src={image.localPath}
            alt={image.factualAlt}
            width={image.width}
            height={image.height}
            loading={detail ? "eager" : "lazy"}
            sizes={
              detail
                ? "(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) calc(100vw - 112px), 1328px"
                : "(max-width: 767px) calc(100vw - 40px), (max-width: 1440px) 45vw, 648px"
            }
          />
        </div>
        <figcaption>
          {detail ? (
            <>
              <p>{image.suggestedCaption}</p>
              <a href={image.source} target="_blank" rel="noreferrer">
                {image.captureType === "local-runtime" ? "Captured project" : "Screenshot source"}
              </a>
            </>
          ) : image.captureType === "local-runtime" ? (
            "Local runtime capture"
          ) : (
            "Repository screenshot"
          )}
        </figcaption>
      </figure>
    );
  }
  if (transcript) {
    return (
      <figure
        className={`project-proof project-proof-terminal ${detail ? "project-proof-detail" : "project-proof-card"}`}
      >
        <div className="project-proof-terminal-heading">
          <span>SCANNER</span>
          <span>LOCAL CLI RUN</span>
        </div>
        <pre
          tabIndex={detail ? 0 : undefined}
          role={detail ? "region" : undefined}
          aria-label={detail ? "Actual scanner output" : undefined}
          aria-hidden={detail ? undefined : true}
        >
          <code>{transcript.text}</code>
        </pre>
        <figcaption>
          {detail ? (
            <>
              <p>{transcript.caption}</p>
              <div className="project-proof-files">
                <a href={transcript.inputPath}>View input</a>
                <a href={transcript.localPath}>Full output</a>
              </div>
            </>
          ) : (
            "Actual command-line output"
          )}
        </figcaption>
      </figure>
    );
  }
  return null;
}

export function ProjectRuntimeNote({ slug }: { slug: string }) {
  const { project } = getProjectMedia(slug);
  if (!project?.runtime?.publicNote) return null;
  return <p className="project-runtime-note">{project.runtime.publicNote}</p>;
}
