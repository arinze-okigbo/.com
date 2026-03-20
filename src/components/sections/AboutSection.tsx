import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Container } from "@/components/ui/Container";

export function AboutSection() {
  return (
    <section id="about" className="section-shell">
      <Container className="space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="About"
            title="I build systems, products, and companies."
            description="I’m a founder and software engineer working at the intersection of AI, security, infrastructure, and fintech. I focus on building real systems that solve concrete problems — not just ideas."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card grid gap-6 p-7 md:grid-cols-2 md:p-10">
            <p className="text-base leading-relaxed text-foreground/90 md:text-lg">
              Right now, I’m building Splita, a fintech platform that simplifies group payments by collecting each person’s share upfront. At the same time, I work as an AI Expert Contributor (DevOps) at Snorkel AI and authentication infrastructure at Queralt.
            </p>
            <p className="text-base leading-relaxed text-muted md:text-lg">
              I care about execution and clarity. I like problems where technical depth and product thinking compound, and where building the right system makes everything else easier.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}