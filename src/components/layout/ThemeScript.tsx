/**
 * docs/04 §9.3 — the blocking inline script that prevents a flash of the
 * wrong theme, and supplies the `.js` hook the no-JS reveal guard needs
 * (docs/02 §8.6). One script, two jobs, ~200 bytes.
 *
 * Precedence it implements (§9.1): `[data-theme]` > `@media` > `:root`.
 *
 * **The OS preference is resolved OUTSIDE the `try`, so `data-theme` is always
 * written.** It used to be resolved inside, and on a `localStorage` throw —
 * a private window, or site data blocked, which throws `SecurityError` on
 * access in Chromium and is reproducible in Firefox with
 * `dom.storage.enabled = false` — the attribute was never written at all. The
 * `@media (prefers-color-scheme: dark)` path then painted the page dark, but
 * `.js` was added outside the `try` regardless, so the toggle was revealed
 * while the `[data-theme="dark"]` rules that select its name and icon could not
 * match. Measured: a dark page, with the control announcing "Switch to dark
 * theme", whose first activation produced no perceivable change and only
 * re-labelled the button — SC 4.1.2, the exposed name not describing what the
 * control does (docs/08-review-accessibility-c2 N4). Resolving the media query
 * first and letting a successful `localStorage` read override it costs the same
 * bytes and removes the only state in which `.js` is present and `[data-theme]`
 * is absent.
 *
 * This is a Server Component on purpose. docs/04 §8.1 marks it `'use client'`,
 * but it renders a static `<script>` and has no interactivity; shipping it to
 * the client bundle would cost bytes and buy nothing. The emitted DOM is
 * identical.
 */
const THEME_SCRIPT = `(function(){var d=matchMedia("(prefers-color-scheme: dark)").matches;try{var s=localStorage.getItem("theme");if(s)d=s==="dark";}catch(e){}var r=document.documentElement;r.dataset.theme=d?"dark":"light";r.classList.add("js");})()`;

export function ThemeScript() {
  return (
    <script
      // Synchronous and parser-blocking. Deferring this is what causes the
      // flash; it must not become `async` or `defer`.
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}
