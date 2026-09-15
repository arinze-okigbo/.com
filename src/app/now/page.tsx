import Link from "next/link";
import { Label, PageIntro, Source, pageMeta } from "@/components/hive/Primitives";
import { AnimatedCounter, SplitText } from "@/components/hive/Motion";
import { NYClock } from "@/components/hive/Interactions";
import { getHiveContent } from "@/lib/hive/feeds";
import { profile } from "@/content/hive";
export const metadata = pageMeta(
  "Now",
  "The latest public work, writing, and repository activity from Arinze Okigbo.",
  "/now",
);
export default async function Now() {
  const { github, substack } = await getHiveContent();
  const commit = github.latestCommit,
    post = substack.items[0];
  return (
    <>
      <PageIntro
        label="A SMALL WINDOW INTO THE PRESENT"
        title="In motion."
        description="The current threads: building products, studying systems, and following the questions that open up along the way."
      />
      <section className="shell" style={{ paddingBottom: 112 }}>
        <div className="now-grid">
          <article className="now-card">
            <Label>THE THROUGHLINE</Label>
            <SplitText as="h2" text="Payments. Identity. Security." by="word" />
            <p>{profile.description}</p>
            <Link className="text-link" href="/work">
              Explore the work ↗
            </Link>
          </article>
          <article className="now-card">
            <Label>THE CLOCK</Label>
            <SplitText as="h2" text="New York." by="word" />
            <p>
              <NYClock />
            </p>
            <p style={{ marginTop: 16 }}>{profile.education}</p>
            <Source href={profile.educationSource} />
          </article>
          {commit && (
            <article className="now-card">
              <Label>LATEST CAPTURED COMMIT</Label>
              <SplitText as="h2" text={commit.repo} by="word" />
              <p>{commit.message}</p>
              <Source
                href={commit.url}
                label={`View commit · ${new Date(commit.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}`}
              />
            </article>
          )}
          {post && (
            <article className="now-card">
              <Label>LATEST WRITING</Label>
              <SplitText as="h2" text={post.title} by="word" />
              <p>{post.subtitle}</p>
              <Link className="text-link" href={`/writing/${post.slug}`}>
                Read the article ↗
              </Link>
            </article>
          )}
        </div>
        <section className="section">
          <Label>PUBLIC GITHUB ACTIVITY</Label>
          <h2 style={{ fontSize: "var(--type-6)", margin: "24px 0" }}>A record of making.</h2>
          <p className="repo-count">
            <AnimatedCounter value={github.repos.length} /> public repositories in this snapshot.
          </p>
          <div
            className="contribution-wrap"
            role="region"
            aria-label="Scrollable GitHub contribution calendar"
            tabIndex={0}
          >
            <div
              className="contribution-grid"
              role="img"
              aria-label="GitHub contribution activity over the last year, from the public GitHub contribution calendar."
            >
              {github.contributions.map((day) => (
                <span
                  key={day.date}
                  data-level={day.level}
                  title={`${day.date}: ${day.count === null ? "activity level " + day.level : day.count + " contributions"}`}
                />
              ))}
            </div>
          </div>
          <Source href="https://github.com/arinze-okigbo" label="View the live GitHub profile" />
          <p className="eyebrow">
            SOURCE SNAPSHOT ·{" "}
            {new Date(github.fetchedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            })}
          </p>
        </section>
      </section>
    </>
  );
}
