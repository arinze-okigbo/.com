import { describe, it, expect, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import githubFallback from '../../../content/github.json';
import substackFallback from '../../../content/substack.json';
import { refreshGithub, refreshSubstack, publicPushRecord } from './refresh';
import { researchPath } from '../../../scripts/ingest-hive';
const snapshotSource = (url: string) => readFile(researchPath(url), 'utf8');

describe('six-hour public feed refresh', () => {
  it('refreshes latest commit detail from the new public event instead of retaining the checked-in commit', async () => {
    const newSha = 'a'.repeat(40);
    const source = vi.fn(async (url: string) => {
      if (url.endsWith('/events/public')) return JSON.stringify([{ type: 'PushEvent', created_at: '2026-09-15T02:01:00Z', repo: { name: 'arinze-okigbo/.com' }, payload: { head: newSha } }]);
      if (url.includes('/commits/')) return JSON.stringify({ sha: newSha, commit: { message: 'feat: a new public change\n\nDetails', committer: { date: '2026-09-15T02:00:00Z' } } });
      return snapshotSource(url);
    });
    const result = await refreshGithub(githubFallback, source);
    expect(result.status).toBe('fresh');
    expect(result.latestCommit).toEqual({ message: 'feat: a new public change', url: `https://github.com/arinze-okigbo/.com/commit/${newSha}`, date: '2026-09-15T02:00:00Z', repo: 'arinze-okigbo/.com' });
    expect(source.mock.calls.some(([url]) => url.endsWith('/languages'))).toBe(true);
  });
  it('preserves the last-good content and its timestamp during an upstream outage', async () => {
    const offline = async () => { throw new Error('offline'); };
    const [github, substack] = await Promise.all([refreshGithub(githubFallback, offline), refreshSubstack(substackFallback, offline)]);
    expect(github).toEqual({ ...githubFallback, status: 'cached' });
    expect(substack).toEqual({ ...substackFallback, status: 'cached' });
  });
  it('does not label an API error object or mismatched commit as a fresh snapshot', async () => {
    for (const failure of ['events', 'languages', 'commit']) {
      const result = await refreshGithub(githubFallback, async url => {
        if (failure === 'events' && url.endsWith('/events/public')) return '{"message":"API rate limit"}';
        if (failure === 'languages' && url.endsWith('/languages')) return '{"message":"API rate limit"}';
        if (failure === 'commit' && url.includes('/commits/')) return JSON.stringify({ sha: 'b'.repeat(40), commit: { message: 'Wrong commit', committer: { date: '2026-09-15T01:00:00Z' } } });
        return snapshotSource(url);
      });
      expect(result.status).toBe('cached');
      expect(result.latestCommit).toEqual(githubFallback.latestCommit);
      expect(result.fetchedAt).toBe(githubFallback.fetchedAt);
    }
  });
  it('keeps an empty public event feed genuinely empty', async () => {
    const result = await refreshGithub(githubFallback, url => url.endsWith('/events/public') ? Promise.resolve('[]') : snapshotSource(url));
    expect(result.status).toBe('fresh');
    expect(result.latestCommit).toBeNull();
  });
  it('rejects malformed push records and unapproved cache targets', () => {
    expect(() => publicPushRecord({ message: 'unavailable' })).toThrow();
    expect(() => researchPath('https://example.com/file')).toThrow();
    expect(() => researchPath('https://api.github.com/repos/arinze-okigbo/../../private/languages')).toThrow();
  });
});
