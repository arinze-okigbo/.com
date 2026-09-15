import { SplitText } from "@/components/hive/Motion";
import Link from "next/link";
import { ProfiledIsland } from "@/components/hive/Interactions";
import tasks from "../../../hive/tasks.json";
import history from "../../../hive/build-history.json";
import { BuildHistory } from "@/components/hive/BuildHistory";
import { BuildReplay, SpringLab, ProjectStack } from "@/components/hive/Experiments";
import { CeremonyMount } from "@/components/ceremony/CeremonyMount";
import { Label, PageIntro, pageMeta } from "@/components/hive/Primitives";
import { projects } from "@/content/editorial";
export const metadata = pageMeta(
  "Lab",
  "Interactive experiments in authentication, motion, and AI-assisted building. Try the systems in your browser.",
  "/lab",
);
export default function Lab() {
  return (
    <>
      <PageIntro
        label="THE LABORATORY"
        title="Thinking you can touch."
        description="Experiments that turn the hidden parts of software into something you can see, pull apart, and play with."
      />
      <div className="shell">
        <section className="lab-section">
          <Label>01 / MOTION, UNDER THE MICROSCOPE</Label>
          <SplitText as="h2" text="A little push. A real response." by="word" />
          <p>
            A spring’s personality comes from its stiffness and damping. Tune both, move the target,
            and watch the solver respond.
          </p>
          <div className="experiment-shell">
            <ProfiledIsland name="Spring lab">
              <SpringLab />
            </ProfiledIsland>
          </div>
        </section>
        <section className="lab-section" id="ceremony">
          <Label>02 / BROWSER-NATIVE AUTHENTICATION</Label>
          <SplitText as="h2" text="A ceremony, made visible." by="word" />
          <p>
            Inspect what happens when a browser creates a passkey and verifies an assertion. Run the
            sample to explore the protocol; creating a real credential always requires your action.
          </p>
          <div className="experiment-shell ceremony-panel">
            <ProfiledIsland name="Passkey lab">
              <CeremonyMount
                loadLabel="Load authentication lab"
                loadHint="Runs in your browser. No account required."
              />
            </ProfiledIsland>
          </div>
        </section>
        <section className="lab-section">
          <Label>03 / HOW THIS SITE IS BUILT</Label>
          <SplitText as="h2" text="One direction. Many specialists." by="word" />
          <p>
            A Queen coordinates research, design, motion, and implementation. Each specialist works
            against an explicit task. The sequence below explains the process; the changelog records
            actual changes.
          </p>
          <div className="experiment-shell">
            <BuildReplay
              events={tasks.map((t) => ({
                id: t.id,
                title: t.owner.replaceAll("_", " "),
                detail: t.acceptance_test,
                status: t.status as "complete" | "in_progress" | "pending",
              }))}
            />
          </div>
          <div className="experiment-shell" style={{ marginTop: 24 }}>
            <BuildHistory history={history} />
          </div>
          <Link href="/lab/changelog" className="text-link" style={{ marginTop: 24 }}>
            Read the build log ↗
          </Link>
        </section>
        <section className="lab-section">
          <Label>04 / PHYSICAL INTERFACES</Label>
          <SplitText as="h2" text="Pick up an idea." by="word" />
          <p>
            Drag the cards to explore the stack. A small experiment in direct manipulation, with
            ordinary links underneath.
          </p>
          <div className="experiment-shell">
            <ProjectStack
              items={projects.slice(0, 4).map((p) => ({
                title: p.name,
                description: p.description,
                href: `/projects/${p.slug}`,
              }))}
            />
          </div>
        </section>
      </div>
    </>
  );
}
