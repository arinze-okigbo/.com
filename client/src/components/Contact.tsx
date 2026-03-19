/**
 * CONTACT & FOOTER — Clean, confident closing section
 * 
 * Design: Noir Editorial
 * - Strong closing statement
 * - Minimal contact links with hover interactions
 * - Clean footer with copyright
 */

import { SectionReveal, RevealItem } from "./SectionReveal";
import { ArrowUpRight } from "lucide-react";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/arinze-okigbo" },
  { label: "LinkedIn", href: "https://linkedin.com/in/arinze-okigbo" },
  { label: "Twitter", href: "https://twitter.com/arinzeokigbo" },
  { label: "Email", href: "mailto:hello@arinzeokigbo.com" },
];

export function Contact() {
  return (
    <section id="contact" className="relative pt-28 md:pt-40 pb-12">
      {/* Section counter */}
      <span className="section-counter">04</span>

      <SectionReveal className="container">
        <RevealItem>
          <div className="flex items-baseline gap-4 mb-3">
            <span className="label-caps text-primary/50">04</span>
            <h2 className="heading-section text-3xl md:text-4xl lg:text-5xl">
              Get in Touch
            </h2>
          </div>
        </RevealItem>

        <RevealItem>
          <p className="text-body text-lg md:text-xl text-foreground/40 max-w-lg mb-16 md:mb-20 leading-relaxed">
            Interested in working together, investing, or just want to connect?
            I'm always open to meaningful conversations.
          </p>
        </RevealItem>

        {/* Contact links — 2-column on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 max-w-lg">
          {socialLinks.map((link) => (
            <RevealItem key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-4 border-b border-white/[0.04] hover:border-primary/20 transition-all duration-300"
              >
                <span className="text-mono text-sm text-foreground/50 group-hover:text-foreground/90 transition-colors duration-300">
                  {link.label}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-foreground/15 group-hover:text-primary transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </RevealItem>
          ))}
        </div>
      </SectionReveal>

      {/* Footer */}
      <div className="container mt-32 md:mt-48">
        <div
          className="h-px w-full mb-8"
          style={{
            background:
              "linear-gradient(90deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02))",
          }}
        />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4">
          <p className="text-mono text-[0.65rem] text-foreground/20 tracking-wider">
            &copy; {new Date().getFullYear()} Arinze Okigbo
          </p>
          <p className="text-mono text-[0.65rem] text-foreground/12 tracking-wider">
            Designed & built with intention
          </p>
        </div>
      </div>
    </section>
  );
}
