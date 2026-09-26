import { z } from "zod";
import { publicArchivePosts, publicArticle, publicArticleUrl } from "./substack-archive";
import { githubSchema, substackSchema } from "./schemas";
import { normalizeRepos, normalizeSubstack, parseContributions } from "./normalize";

export type ReadPublicSource = (url: string) => Promise<string>;
const repoName = z.string().regex(/^[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/);
const sha = z.string().regex(/^[a-f0-9]{40}$/);
const eventsSchema = z.array(
  z.object({
    type: z.string(),
    created_at: z.string().datetime(),
    repo: z.object({ name: repoName }),
    payload: z
      .object({
        head: sha.optional(),
        commits: z.array(z.object({ sha, message: z.string() })).optional(),
      })
      .passthrough(),
  }),
);
const commitSchema = z.object({
  sha,
  commit: z.object({ message: z.string(), committer: z.object({ date: z.string().datetime() }) }),
});

export function publicPushRecord(input: unknown) {
  const event = eventsSchema.parse(input).find((row) => row.type === "PushEvent");
  const commit = event?.payload.commits?.at(-1);
  const head = commit?.sha ?? event?.payload.head;
  if (!event || !head) return null;
  return {
    message: commit?.message.split("\n")[0] ?? "Public commit",
    url: `https://github.com/${event.repo.name}/commit/${head}`,
    date: event.created_at,
    repo: event.repo.name,
    sha: head,
  };
}

export async function refreshSubstack(
  fallbackInput: unknown,
  read: ReadPublicSource,
  options: { deep?: boolean } = {},
) {
  const fallback = substackSchema.parse(fallbackInput);
  let fresh;
  try {
    fresh = normalizeSubstack(await read(fallback.source));
  } catch {
    return { ...fallback, status: "cached" as const };
  }
  // RSS is a moving window, not a deletion signal. Keep previously verified bodies.
  const items = new Map(fallback.items.map((item) => [item.slug, item]));
  const shortened = new Set<string>();
  for (const item of fresh.items) {
    const previous = items.get(item.slug);
    const textLength = (entry: typeof item) =>
      entry.blocks.reduce((length, block) => length + block.text.length, 0);
    if (previous && textLength(item) < textLength(previous)) {
      // RSS can switch to excerpts. A shorter body needs confirmation from the full public page.
      shortened.add(item.slug);
    } else items.set(item.slug, item);
  }
  if (!options.deep) {
    // Request-time refresh reads RSS only. Archive traversal belongs to build ingestion.
    return substackSchema.parse({
      ...fresh,
      items: [...items.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
      archive: fallback.archive,
    });
  }
  const discovered = new Set(fresh.items.map((item) => item.slug));
  let complete = true;
  const archiveSource = "https://arinzeokigbo.substack.com/archive";
  const pendingSlugs: string[] = [];
  const deadline = Date.now() + 30000;
  try {
    const archive = publicArchivePosts(await read(archiveSource));
    for (const post of archive) {
      discovered.add(post.slug);
      const existing = items.get(post.slug);
      if (existing)
        items.set(post.slug, {
          ...existing,
          tags: (post.postTags ?? []).filter((tag) => !tag.hidden).map((tag) => tag.name),
        });
    }
    // Follow actual public previous-post links, never invented/private APIs.
    // Bound work per refresh; last-good bodies survive errors or a long archive.
    const queue = [
      ...new Set([
        ...(fallback.archive?.pendingSlugs ?? []),
        ...shortened,
        ...archive.filter((post) => !items.has(post.slug)).map((post) => post.slug),
      ]),
    ];
    const oldest = archive.toSorted((a, b) => Date.parse(a.post_date) - Date.parse(b.post_date))[0];
    if (oldest && !queue.includes(oldest.slug)) queue.push(oldest.slug);
    const visited = new Set<string>();
    let requests = 0;
    while (queue.length && requests < 24 && Date.now() < deadline) {
      const slug = queue.shift()!;
      if (visited.has(slug)) continue;
      visited.add(slug);
      requests++;
      let parsed;
      try {
        parsed = publicArticle(await read(publicArticleUrl(slug)));
      } catch {
        pendingSlugs.push(slug);
        complete = false;
        continue;
      }
      const { article, previous } = parsed;
      if (article.slug !== slug) throw new Error("Article slug does not match source");
      items.set(slug, article);
      discovered.add(slug);
      if (previous && !visited.has(previous)) queue.push(previous);
    }
    pendingSlugs.push(...queue);
    if (pendingSlugs.length) complete = false;
  } catch {
    pendingSlugs.push(...(fallback.archive?.pendingSlugs ?? []));
    complete = false;
  }
  return substackSchema.parse({
    ...fresh,
    items: [...items.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)),
    archive: {
      source: archiveSource,
      checkedAt: fresh.fetchedAt,
      discovered: discovered.size,
      status: complete ? "checked" : "partial",
      retained: [...items.keys()].filter((slug) => !discovered.has(slug)).length,
      pendingSlugs: [...new Set(pendingSlugs)],
    },
  });
}

export async function refreshGithub(fallbackInput: unknown, read: ReadPublicSource) {
  const fallback = githubSchema.parse(fallbackInput);
  try {
    const [raw, calendar, events, profile] = await Promise.all([
      read("https://api.github.com/users/arinze-okigbo/repos?per_page=100&sort=updated"),
      read("https://github.com/users/arinze-okigbo/contributions"),
      read("https://api.github.com/users/arinze-okigbo/events/public"),
      read("https://github.com/arinze-okigbo"),
    ]);
    const repos = normalizeRepos(JSON.parse(raw));
    // Languages belong to this snapshot too: no stale language list is labelled fresh.
    await Promise.all(
      repos.map(async (repo) => {
        const result = JSON.parse(
          await read(
            `https://api.github.com/repos/arinze-okigbo/${encodeURIComponent(repo.name)}/languages`,
          ),
        );
        repo.languages = Object.keys(z.record(z.string(), z.number().nonnegative()).parse(result));
      }),
    );
    const push = publicPushRecord(JSON.parse(events));
    let latestCommit = push
      ? { message: push.message, url: push.url, date: push.date, repo: push.repo }
      : null;
    if (push) {
      // A malformed/unavailable commit response must not be passed off as fresh detail.
      const detail = commitSchema.parse(
        JSON.parse(await read(`https://api.github.com/repos/${push.repo}/commits/${push.sha}`)),
      );
      if (detail.sha !== push.sha) throw new Error("Commit response does not match public push");
      latestCommit = {
        message: detail.commit.message.split("\n")[0],
        url: push.url,
        date: detail.commit.committer.date,
        repo: push.repo,
      };
    }
    if (!profile.includes("arinze-okigbo") || !profile.includes("pinned"))
      throw new Error("Public profile unavailable");
    const pinned = Array.from(profile.matchAll(/<span class="repo">(.*?)<\/span>/g)).map(
      (m) => m[1],
    );
    return githubSchema.parse({
      ...fallback,
      repos,
      contributions: parseContributions(calendar),
      latestCommit,
      pinned,
      fetchedAt: new Date().toISOString(),
      status: "fresh",
    });
  } catch {
    // Preserve the original fetch timestamp, including when validation fails.
    return { ...fallback, status: "cached" as const };
  }
}
