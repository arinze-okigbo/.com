import { contactLinks } from "@/content/site-content";
import { Container } from "@/components/ui/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-8">
      <Container className="flex flex-col items-start justify-between gap-4 text-sm text-muted md:flex-row md:items-center">
        <p>Arinze Okigbo. Building with ambition, clarity, and technical depth.</p>
        <div className="flex flex-wrap items-center gap-4">
          {contactLinks.slice(1).map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="link-underline transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </div>
      </Container>
    </footer>
  );
}