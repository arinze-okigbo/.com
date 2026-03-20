import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Container } from "@/components/ui/Container";
import { achievements } from "@/content/site-content";

export function AchievementsSection() {
  return (
    <section id="achievements" className="section-shell">
      <Container className="space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="Selected Achievements"
            title="A track record of building, shipping, and learning fast."
            description="A snapshot of milestones across startups, AI systems, and technical work."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {achievements.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.08}>
              <article className="card h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.detail}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}