"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Magnetic } from "./Motion";
import { ThemeToggle } from "./Interactions";
const links = [
  ["Work", "/work"],
  ["Projects", "/projects"],
  ["About", "/about"],
  ["Lab", "/lab"],
  ["Writing", "/writing"],
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="hive-header">
      <div className="header-inner">
        <Link href="/" className="wordmark" aria-label="ao — Arinze Okigbo home">
          ao<span>↗</span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Magnetic key={href}>
              <Link href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>
                {label}
              </Link>
            </Magnetic>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link href="/contact" className="header-contact">
            Let’s talk <span aria-hidden="true">↗</span>
          </Link>
          <button
            className="mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"} <span aria-hidden="true">{open ? "−" : "+"}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" id="mobile-menu" aria-label="Mobile navigation">
          {[...links, ["Now", "/now"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <span>↗</span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
