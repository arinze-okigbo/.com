/** Public, build-time ingestion. --cached consumes the current round's source cache. */
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { refreshGithub, refreshSubstack } from '../src/lib/hive/refresh';
import { githubSchema, substackSchema, linkedinSchema } from '../src/lib/hive/schemas';

export function researchPath(url: string) {
  const fixed: Record<string, string> = {
    'https://arinzeokigbo.substack.com/feed': 'substack-feed.xml',
    'https://api.github.com/users/arinze-okigbo/repos?per_page=100&sort=updated': 'github-repos.json',
    'https://github.com/users/arinze-okigbo/contributions': 'github-contributions.html',
    'https://github.com/arinze-okigbo': 'github-profile.html',
    'https://api.github.com/users/arinze-okigbo/events/public': 'github-events.json',
  };
  if (fixed[url]) return `hive/research/${fixed[url]}`;
  const language = url.match(/^https:\/\/api\.github\.com\/repos\/arinze-okigbo\/([A-Za-z0-9_.%-]+)\/languages$/);
  if (language) return `hive/research/${language[1]}-languages.json`;
  if (/^https:\/\/api\.github\.com\/repos\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\/commits\/[a-f0-9]{40}$/.test(url)) return 'hive/research/github-latest-commit.json';
  throw new Error('Source has no approved cache path');
}
async function read(path: string) { return readFile(path, 'utf8'); }
async function save(path: string, value: unknown) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, JSON.stringify(value, null, 2) + '\n');
  await rename(temporary, path);
}
export async function ingest(cached = false) {
  await mkdir('hive/research', { recursive: true });
  // Invalid or missing last-good data fails the build; never quietly ship bad input.
  const githubFallback = githubSchema.parse(JSON.parse(await read('content/github.json')));
  const substackFallback = substackSchema.parse(JSON.parse(await read('content/substack.json')));
  linkedinSchema.parse(JSON.parse(await read('content/linkedin-posts.json')));
  const source = async (url: string) => {
    const path = researchPath(url);
    if (cached) return read(path);
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    const body = await response.text();
    await writeFile(path, body);
    return body;
  };
  const [substack, github] = await Promise.all([
    refreshSubstack(substackFallback, source),
    refreshGithub(githubFallback, source),
  ]);
  // A local rebuild is not a new source retrieval. Preserve the verified dates.
  if (cached) {
    substack.fetchedAt = substackFallback.fetchedAt;
    github.fetchedAt = githubFallback.fetchedAt;
    substack.status = 'cached';
    github.status = 'cached';
  }
  await Promise.all([save('content/substack.json', substack), save('content/github.json', github)]);
  console.log(`Public feed collections validated (GitHub: ${github.status}; Substack: ${substack.status}; LinkedIn: curated).`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ingest(process.argv.includes('--cached')).catch(error => {
    console.error(`Feed ingestion failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
