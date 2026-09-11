import type { NamedLink } from "@/content/types";

/** 404 page copy — `docs/05 §3.7`. No 3D, no motion. */
export const NOT_FOUND = {
  heading: "No page at this address.",
  body: "The link is wrong, or the page moved. Everything lives on one page: Splita, browser-native authentication at Queralt Inc., SkyView, and how to reach me.",
  /** [R12] information-bearing, never "go back" or "home". */
  homeLink: { label: "Arinze Okigbo — the home page", href: "/" } satisfies NamedLink,
  emailAction: {
    label: "Email arinze@splita.co",
    href: "mailto:arinze@splita.co",
  } satisfies NamedLink,
  metadata: {
    title: "Page not found",
    description: "No page at this address. Everything is on arinzeokigbo.com.",
  },
} as const;
