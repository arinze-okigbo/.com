import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { Container } from "@/components/ui/Container";
import { contactLinks } from "@/content/site-content";

export function ContactSection() {
  return (
    <section id="contact" className="section-shell pb-20 md:pb-28">
      <Container className="space-y-10">
        <Reveal>
          <SectionHeading
            eyebrow="Contact"
            title="Building something meaningful? Let us connect."
            description="Reach out for collaborations, product conversations, engineering opportunities, or founder-to-founder discussion."
          />
        </Reveal>

        <Reveal delay={0.12}>
          <div className="card divide-y divide-line overflow-hidden">
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("mailto") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto") ? undefined : "noreferrer"}
                className="group flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-white/[0.03]"
              >
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">{link.label}</p>
                  <p className="mt-1 text-sm text-foreground/90 md:text-base">{link.value}</p>
                </div>
                <ArrowUpRight className="text-muted transition group-hover:text-foreground" size={18} />
              </a>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}