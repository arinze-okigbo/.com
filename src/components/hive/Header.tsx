"use client";
import Link from "next/link";
import { Icon } from "./Icon";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getFocusableElements } from "@/lib/a11y/focusable";
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
  // Route changes unmount the old disclosure, releasing its focus and scroll
  // ownership. Returning to a prior URL cannot resurrect an open menu.
  return <Navigation key={pathname} pathname={pathname} />;
}

function Navigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const menu = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const container = header.current;
    const panel = menu.current;
    if (!open || !container || !panel) return;

    const background = Array.from(
      document.querySelectorAll<HTMLElement>("main, .hive-footer, .skip-link"),
    ).map((node) => ({ node, wasInert: node.inert }));
    background.forEach(({ node }) => {
      node.inert = true;
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const mobile = matchMedia("(max-width: 767px)");

    const focusFirst = () => getFocusableElements(panel)[0]?.focus();
    const anotherDialogOwnsFocus = () => document.querySelector("dialog[open]") !== null;
    focusFirst();

    const keydown = (event: KeyboardEvent) => {
      // A native modal is the top-level focus owner. Never intercept its Tab
      // or Escape, including during the short menu-dismissal render boundary.
      if (anotherDialogOwnsFocus()) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        toggle.current?.focus();
        setOpen(false);
        return; // The palette's existing shortcut handler receives the event.
      }
      if (event.key === "Escape") {
        event.preventDefault();
        toggle.current?.focus();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(container);
      if (!focusable.length) return;
      event.preventDefault();
      const current =
        document.activeElement instanceof HTMLElement
          ? focusable.indexOf(document.activeElement)
          : -1;
      const next =
        current < 0
          ? event.shiftKey
            ? focusable.length - 1
            : 0
          : (current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
      focusable[next]?.focus();
    };
    const focusin = (event: FocusEvent) => {
      if (anotherDialogOwnsFocus()) {
        setOpen(false);
        return;
      }
      if (event.target instanceof Node && !container.contains(event.target)) focusFirst();
    };
    const resize = () => {
      if (mobile.matches) return;
      // The toggle is hidden on desktop, so move focus to its visible counterpart.
      const desktopTarget =
        container.querySelector<HTMLAnchorElement>(".desktop-nav a[aria-current='page']") ??
        container.querySelector<HTMLAnchorElement>(".desktop-nav a");
      desktopTarget?.focus();
      setOpen(false);
    };
    const preventBackgroundScroll = (event: Event) => {
      if (anotherDialogOwnsFocus()) return;
      if (!(event.target instanceof Node) || !panel.contains(event.target)) event.preventDefault();
    };

    document.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", focusin);
    document.addEventListener("wheel", preventBackgroundScroll, { passive: false });
    document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
    mobile.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", keydown, true);
      document.removeEventListener("focusin", focusin);
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      mobile.removeEventListener("change", resize);
      background.forEach(({ node, wasInert }) => {
        node.inert = wasInert;
      });
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header ref={header} className="hive-header">
      <div className="header-inner">
        <Link
          href="/"
          className="wordmark"
          aria-label="ao — Arinze Okigbo home"
          onClick={() => setOpen(false)}
        >
          ao
          <span>
            <Icon name="arrow-up-right" />
          </span>
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
            Let’s talk{" "}
            <span aria-hidden="true">
              <Icon name="arrow-up-right" />
            </span>
          </Link>
          <button
            ref={toggle}
            className="mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}{" "}
            <span aria-hidden="true">
              <Icon name={open ? "close" : "menu"} />
            </span>
          </button>
        </div>
      </div>
      {open && (
        <nav ref={menu} className="mobile-nav" id="mobile-menu" aria-label="Mobile navigation">
          {[...links, ["Now", "/now"], ["Contact", "/contact"]].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
              <span aria-hidden="true">
                <Icon name="arrow-up-right" />
              </span>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
