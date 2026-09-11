import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /**
     * Inline the route's CSS into the document instead of linking it.
     *
     * The single stylesheet emitted from `src/app/globals.css` was the only
     * render-blocking resource on the page and Lighthouse measured it at 152 ms
     * of blocking — roughly half the gap between the measured LCP and the 2.0 s
     * requirement. The LCP element is server-rendered text with no resource of
     * its own, so 80% of its metric was render delay charged against exactly
     * this kind of critical-path dependency.
     *
     * This inlines the WHOLE stylesheet rather than a hand-extracted critical
     * subset, which is what makes it safe here: the cascade ships in its
     * authored order, so the layer ordering (`@layer components` before
     * Tailwind's `utilities`), the `@supports (animation-timeline: view())`
     * block, the reduced-motion block that must come last, and the P3 accent
     * upgrade all keep their relative positions. A hand-split critical subset
     * would reorder them and is the thing NOT to do.
     *
     * `ThemeScript` is unaffected: it is inline and synchronous in `<head>` and
     * writes `data-theme` before first paint either way.
     */
    inlineCss: true,
  },
};

export default nextConfig;
