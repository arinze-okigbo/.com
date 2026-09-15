import 'server-only';
import { unstable_cache } from 'next/cache';
import githubFallback from '../../../content/github.json';
import substackFallback from '../../../content/substack.json';
import linkedinFallback from '../../../content/linkedin-posts.json';
import { linkedinSchema } from './schemas';
import { refreshGithub, refreshSubstack } from './refresh';

export const FEED_REVALIDATE_SECONDS = 21600;
async function readPublicSource(url: string) {
  // unstable_cache owns the six-hour lifetime. A second fetch cache could return
  // an older response during revalidation and incorrectly advance fetchedAt.
  const response = await fetch(url, {
    cache: 'no-store',
    headers: { Accept: url.includes('api.github.com') ? 'application/vnd.github+json' : '*/*' },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`Public source returned ${response.status}`);
  return response.text();
}
const getSubstack = unstable_cache(() => refreshSubstack(substackFallback, readPublicSource), ['hive-substack-v2'], { revalidate: FEED_REVALIDATE_SECONDS });
const getGithub = unstable_cache(() => refreshGithub(githubFallback, readPublicSource), ['hive-github-v2'], { revalidate: FEED_REVALIDATE_SECONDS });
// LinkedIn has no unauthenticated profile feed. This curated collection keeps
// its real verification date; revalidation does not manufacture new posts.
const getLinkedin = unstable_cache(async () => ({ ...linkedinSchema.parse(linkedinFallback), status: 'cached' as const }), ['hive-linkedin-curated-v2'], { revalidate: FEED_REVALIDATE_SECONDS });
export async function getHiveContent() {
  const [github, substack, linkedin] = await Promise.all([getGithub(), getSubstack(), getLinkedin()]);
  return { github, substack, linkedin };
}
