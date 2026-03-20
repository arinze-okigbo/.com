import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Container } from "@/components/ui/Container";
import { currentWork } from "@/content/site-content";

export function CurrentWorkSection() {
  return (
    <section id="current-work" className="section-shell">
      <Container className="space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="Current Work"
            title="Operating where product ambition meets engineering reality."
            description="I currently work across startup execution, AI systems, software engineering, and deep technical study."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {currentWork.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.org} delay={index * 0.08}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="card block h-full space-y-4 p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.org}</h3>
                      <p className="text-sm text-muted">{item.role}</p>
                    </div>
                    <span className="rounded-full border border-line bg-surface-strong p-2.5 text-accent">
                      <Icon size={16} />
                    </span>
                  </div>
                  <p className="text-sm font-medium uppercase tracking-wider text-foreground/60">{item.period}</p>
                  <p className="text-base leading-relaxed text-foreground/90">{item.summary}</p>
                </a>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}