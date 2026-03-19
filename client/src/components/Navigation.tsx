/**
 * NAVIGATION — Minimal, scroll-aware top bar
 * 
 * Design: Noir Editorial
 * - Transparent initially, gains backdrop blur on scroll
 * - Minimal links, monospaced style
 * - Subtle opacity transitions on scroll state change
 * - Mobile: hamburger with slide-down menu
 */

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ease, duration } from "@/lib/motion";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
  });

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: duration.slow, ease: ease.out, delay: 1.8 }}
    >
      <div
        className={`transition-all duration-700 ease-out ${
          scrolled
            ? "bg-[oklch(0.07_0.005_260_/_0.9)] backdrop-blur-2xl border-b border-white/[0.03]"
            : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-mono text-sm tracking-[0.15em] text-foreground/80 hover:text-primary transition-colors duration-300"
          >
            AO
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleClick(e, link.href)}
                className="text-mono text-[0.65rem] tracking-[0.15em] uppercase text-foreground/40 hover:text-foreground/80 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex flex-col justify-center items-end gap-1.5 p-2 -mr-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <motion.span
              className="block h-px bg-foreground/60 origin-right"
              animate={{ width: mobileOpen ? 20 : 20, rotate: mobileOpen ? -45 : 0, y: mobileOpen ? 0 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: 20 }}
            />
            <motion.span
              className="block h-px bg-foreground/60"
              animate={{ width: mobileOpen ? 0 : 14, opacity: mobileOpen ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              style={{ width: 14 }}
            />
            <motion.span
              className="block h-px bg-foreground/60 origin-right"
              animate={{ width: mobileOpen ? 20 : 20, rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 0 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: 20 }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-[oklch(0.07_0.005_260_/_0.97)] backdrop-blur-2xl border-b border-white/[0.03]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: ease.out }}
          >
            <div className="container py-8 flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <a
                    href={link.href}
                    onClick={(e) => handleClick(e, link.href)}
                    className="text-mono text-sm tracking-[0.12em] uppercase text-foreground/50 hover:text-foreground transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
