import { z } from 'zod';
import { githubSchema, substackSchema } from './schemas';
import { normalizeRepos, normalizeSubstack, parseContributions } from './normalize';

export type ReadPublicSource = (url: string) => Promise<string>;
const repoName = z.string().regex(/^[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/);
const sha = z.string().regex(/^[a-f0-9]{40}$/);
const eventsSchema = z.array(z.object({
  type: z.string(), created_at: z.string().datetime(),
  repo: z.object({ name: repoName }),
  payload: z.object({
    head: sha.optional(),
    commits: z.array(z.object({ sha, message: z.string() })).optional(),
  }).passthrough(),
}));
const commitSchema = z.object({
  sha,
  commit: z.object({ message: z.string(), committer: z.object({ date: z.string().datetime() }) }),
});

export function publicPushRecord(input: unknown) {
  const event = eventsSchema.parse(input).find(row => row.type === 'PushEvent');
  const commit = event?.payload.commits?.at(-1);
  const head = commit?.sha ?? event?.payload.head;
  if (!event || !head) return null;
  return { message: commit?.message.split('\n')[0] ?? 'Public commit', url: `https://github.com/${event.repo.name}/commit/${head}`, date: event.created_at, repo: event.repo.name, sha: head };
}

export async function refreshSubstack(fallbackInput: unknown, read: ReadPublicSource) {
  const fallback = substackSchema.parse(fallbackInput);
  try { return normalizeSubstack(await read(fallback.source)); }
  catch { return { ...fallback, status: 'cached' as const }; }
}

export async function refreshGithub(fallbackInput: unknown, read: ReadPublicSource) {
  const fallback = githubSchema.parse(fallbackInput);
  try {
    const [raw, calendar, events, profile] = await Promise.all([
      read('https://api.github.com/users/arinze-okigbo/repos?per_page=100&sort=updated'),
      read('https://github.com/users/arinze-okigbo/contributions'),
      read('https://api.github.com/users/arinze-okigbo/events/public'),
      read('https://github.com/arinze-okigbo'),
    ]);
    const repos = normalizeRepos(JSON.parse(raw));
    // Languages belong to this snapshot too: no stale language list is labelled fresh.
    await Promise.all(repos.map(async repo => {
      const result = JSON.parse(await read(`https://api.github.com/repos/arinze-okigbo/${encodeURIComponent(repo.name)}/languages`));
      repo.languages = Object.keys(z.record(z.string(), z.number().nonnegative()).parse(result));
    }));
    const push = publicPushRecord(JSON.parse(events));
    let latestCommit = push ? { message: push.message, url: push.url, date: push.date, repo: push.repo } : null;
    if (push) {
      // A malformed/unavailable commit response must not be passed off as fresh detail.
      const detail = commitSchema.parse(JSON.parse(await read(`https://api.github.com/repos/${push.repo}/commits/${push.sha}`)));
      if (detail.sha !== push.sha) throw new Error('Commit response does not match public push');
      latestCommit = { message: detail.commit.message.split('\n')[0], url: push.url, date: detail.commit.committer.date, repo: push.repo };
    }
    if (!profile.includes('arinze-okigbo') || !profile.includes('pinned')) throw new Error('Public profile unavailable');
    const pinned = Array.from(profile.matchAll(/<span class="repo">(.*?)<\/span>/g)).map(m => m[1]);
    return githubSchema.parse({ ...fallback, repos, contributions: parseContributions(calendar), latestCommit, pinned, fetchedAt: new Date().toISOString(), status: 'fresh' });
  } catch {
    // Preserve the original fetch timestamp, including when validation fails.
    return { ...fallback, status: 'cached' as const };
  }
}
