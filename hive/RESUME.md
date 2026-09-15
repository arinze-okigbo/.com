# Exact resume point

Production runs a118398513ced42889540e45ba0b7a7118aac72b (PR4 merged). Custom-domain marker verified; 36 production browser tests pass. Production performance gate remains open: local audit90 and LinuxCI69.

Current branch: hive/round-5-navigation.
1. Round5 implementation complete: faster headline/scroll startup, keyboard search, verified screenshots, article citations/images, mobile focus and print. Current local build/lint/types/357 unit tests pass; final browser suite66 passed,2 device-specific skips. Latest local mobile Lighthouse97/100/100/100; fresh interaction harness passes with zero errors.
2. PR5 remains held by required Linux performance. Latest run34931595978: fixed five scores75/93/98/95/93; representative93,TBT205ms,LCP2644ms, other categories100. CPU profiling identified repeated NYClock Intl initialization. Commit4ca4b4e now shares one formatter/timer only among visible clocks; local five scores97/98/97/97/97, representative97,TBT18ms,CLS0. Next: inspect the new Linux check for this clock fix, verify its exact Vercel preview SHA and visible clock/navigation, then merge only after required gates pass. Do not relax thresholds. Production audits now use the same fixed five-run method and publish measured scores before enforcement. Previous preview63b1d1 passed manual theme→immediateLab navigation, stack and real timings.
3. Verify merged production SHA and production Lighthouse. If below95, continue optimizing; never relabel a local score as production.
4. Publish measured round changelog, refresh acceptance/tasks, preserve clean checkpoint.

Worktree: /Users/arinzeokigbo/Documents/Codex/2026-09-14/github-plugin-github-openai-curated-remote/work/astra-site
Original branch preserved in /Users/arinzeokigbo/arinzeokigbo.
Daily09:00 America/New_York heartbeat: astra-hive-site-improvement.
