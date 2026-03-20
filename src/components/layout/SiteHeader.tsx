import { navItems } from "@/content/site-content";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/35 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <a className="text-sm font-semibold tracking-[0.18em] text-foreground/90 uppercase" href="#top">
          Arinze Okigbo
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="link-underline text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Button href="#contact" size="sm" variant="ghost">
          Connect
        </Button>
      </Container>
    </header>
  );
}