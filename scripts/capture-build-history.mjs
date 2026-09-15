/** Capture actual commits from this build; never synthesize agent activity. */
import { execFileSync } from 'node:child_process';
import { writeFile, rename, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baseRef = 'aed7ac2';
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
const baseCommit = git('rev-parse', '--verify', `${baseRef}^{commit}`).trim();
const headCommit = git('rev-parse', '--verify', 'HEAD^{commit}').trim();
git('merge-base', '--is-ancestor', baseCommit, headCommit);
const hashes = git('log', '--reverse', '--format=%H', `${baseCommit}..${headCommit}`).trim().split('\n').filter(Boolean);
const commits = hashes.map(commitSHA => {
  if (!/^[a-f0-9]{40}$/.test(commitSHA)) throw new Error('Git returned an invalid commit SHA');
  const [timestamp, subject] = git('show', '--no-patch', '--format=%cI%x00%s', commitSHA).trimEnd().split('\0');
  if (!subject || !Number.isFinite(Date.parse(timestamp))) throw new Error('Git returned incomplete commit metadata');
  const changedFiles = [...new Set(git('diff-tree', '-m', '--root', '--no-commit-id', '--name-only', '-r', '-z', commitSHA).split('\0').filter(Boolean))].sort();
  return { commitSHA, timestamp, subject, changedFiles };
});
const destination = resolve(root, 'hive/build-history.json');
await mkdir(dirname(destination), { recursive: true });
await writeFile(`${destination}.tmp`, JSON.stringify({ capturedAt: new Date().toISOString(), baseCommit, headCommit, commits }, null, 2) + '\n');
await rename(`${destination}.tmp`, destination);
console.log(`Captured ${commits.length} actual build commit${commits.length === 1 ? '' : 's'} (${baseRef}..${headCommit.slice(0, 7)}).`);
