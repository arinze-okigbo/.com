export type NavigationItem = {
  title: string;
  href: string;
  kind: "Page" | "Project" | "Writing";
  description: string;
  keywords: string;
};

/** These are existing site routes, also usable when the feed index is unavailable. */
export const navigationPages: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    kind: "Page",
    description: "Arinze Okigbo",
    keywords: "start homepage",
  },
  {
    title: "About",
    href: "/about",
    kind: "Page",
    description: "Story, interests, and how I work",
    keywords: "biography skills",
  },
  {
    title: "Work",
    href: "/work",
    kind: "Page",
    description: "Experience and recognition",
    keywords: "career timeline",
  },
  {
    title: "Projects",
    href: "/projects",
    kind: "Page",
    description: "Selected software projects",
    keywords: "portfolio software",
  },
  {
    title: "Lab",
    href: "/lab",
    kind: "Page",
    description: "Interactive experiments",
    keywords: "spring passkey authentication demos",
  },
  {
    title: "Writing",
    href: "/writing",
    kind: "Page",
    description: "Essays and public posts",
    keywords: "articles substack linkedin",
  },
  {
    title: "Now",
    href: "/now",
    kind: "Page",
    description: "Current work and recent updates",
    keywords: "currently activity github",
  },
  {
    title: "Contact",
    href: "/contact",
    kind: "Page",
    description: "Start a conversation",
    keywords: "email message hello",
  },
];

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-US");

export function searchNavigation(items: NavigationItem[], query: string) {
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (!terms.length) return items;
  return items
    .map((item, order) => {
      const title = normalize(item.title);
      const haystack = normalize(`${item.title} ${item.description} ${item.keywords} ${item.href}`);
      const matches = terms.every((term) => haystack.includes(term));
      const score = terms.reduce(
        (total, term) =>
          total + (title === term ? 5 : title.startsWith(term) ? 3 : title.includes(term) ? 2 : 0),
        0,
      );
      return { item, order, matches, score };
    })
    .filter((result) => result.matches)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((result) => result.item);
}

/** Only same-site route URLs can become actionable palette results. */
export function isNavigationItem(value: unknown): value is NavigationItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.title === "string" &&
    item.title.length > 0 &&
    typeof item.href === "string" &&
    /^\/(?!\/)[a-z0-9/-]*$/.test(item.href) &&
    ["Page", "Project", "Writing"].includes(String(item.kind)) &&
    typeof item.description === "string" &&
    typeof item.keywords === "string"
  );
}
