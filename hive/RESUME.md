# Exact resume point

Production runs a118398513ced42889540e45ba0b7a7118aac72b (PR4 merged). Custom-domain marker verified; 36 production browser tests pass. Production performance gate remains open: local audit90 and LinuxCI69.

Current branch: hive/round-5-navigation.
1. Round5 implementation complete: faster headline/scroll startup, keyboard search, verified screenshots, article citations/images, mobile focus and print. Current local build/lint/types/358 unit tests pass; final browser suite68 passed,2 device-specific skips. Latest local mobile Lighthouse98/100/100/100; fresh interaction harness passes with zero errors.
2. PR5 remains held by required Linux performance. The clock fix improved run 34932388400 to a representative 94 (five runs: 90, 92, 97, 94, 94), with TBT 183 ms, LCP 2658 ms, and other categories 100. Its exact Vercel preview 0495eaf passed desktop/mobile search, live visible clocks, and zero console errors. The next candidate reduces offscreen layout and shares motion-preference subscriptions. Build, types, lint, 358 unit tests and 68 browser checks pass, including new find/focus/geometry/anchor/print coverage. Local five-run audit is 98 in every run (LCP 2475 ms, TBT 8.5 ms, CLS 0). Feature commit ad6b1ef. Next: inspect the required Linux results for the pushed checkpoint, verify its exact preview and ordinary-motion scrolling, and merge only after all gates pass. Keep thresholds unchanged. Production audits now use the same fixed five-run method and publish measured scores before enforcement.
3. Verify merged production SHA and production Lighthouse. If below95, continue optimizing; never relabel a local score as production.
4. Publish measured round changelog, refresh acceptance/tasks, preserve clean checkpoint.

Worktree: /Users/arinzeokigbo/Documents/Codex/2026-09-14/github-plugin-github-openai-curated-remote/work/astra-site
Original branch preserved in /Users/arinzeokigbo/arinzeokigbo.
Daily09:00 America/New_York heartbeat: astra-hive-site-improvement.
