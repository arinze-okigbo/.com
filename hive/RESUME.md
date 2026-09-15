# Exact resume point

Production runs a118398513ced42889540e45ba0b7a7118aac72b (PR4 merged). Custom-domain marker verified; 36 production browser tests pass. Production performance gate remains open: local audit90 and LinuxCI69.

Current branch: hive/round-5-navigation.
1. Round5 implementation complete: faster headline/scroll startup, keyboard search, verified screenshots, article citations/images, mobile focus and print. Current local build/lint/types/350 unit tests pass; final browser suite61 passed,1 mobile PDF skip. Local mobile Lighthouse95/100/100/100; fresh interaction harness passes with zero errors.
2. Push completed checkpoint and open PR. Require Linux verify (including pre-merge Lighthouse) and manual Vercel preview validation before merge. If performance fails, reduce initial Framer/hydration cost; do not change thresholds to pass.
3. Verify merged production SHA and production Lighthouse. If below95, continue optimizing; never relabel a local score as production.
4. Publish measured round changelog, refresh acceptance/tasks, preserve clean checkpoint.

Worktree: /Users/arinzeokigbo/Documents/Codex/2026-09-14/github-plugin-github-openai-curated-remote/work/astra-site
Original branch preserved in /Users/arinzeokigbo/arinzeokigbo.
Daily09:00 America/New_York heartbeat: astra-hive-site-improvement.
