# Exact resume point

Production runs a118398513ced42889540e45ba0b7a7118aac72b (PR4 merged). Custom-domain marker verified; 36 production browser tests pass. Production performance gate remains open: local audit90 and LinuxCI69.

Current branch: hive/round-5-navigation.
1. Round5 implementation complete: faster headline/scroll startup, keyboard search, verified screenshots, article citations/images, mobile focus and print. Current local build/lint/types/355 unit tests pass; final browser suite66 passed,2 device-specific skips. Latest local mobile Lighthouse97/100/100/100; fresh interaction harness passes with zero errors.
2. PR5 is open. Its first Linux run34929619920 failed at70performance/TBT1096; all other checks passed. Preview15cd201 was manually verified. Follow-up removed eagerFramer: home154KiB, writing161–162KiB, under180KiB; local97/100/100/100,TBT19,CLS0. Second Linux run34930120934 scored74/TBT881.5. Trace showed initial streamed ViewTransition layout; now route-keyed transitions opt out of streamed updates. Theme wipe also permits immediate pointer input. New66browserchecks and local97 pass. Third Linux run34930913742 still scored70/TBT1318; latestpreview63b1d1 verified theme→immediateLab, stack, realtimings. Now fixed5-run median (local97inall5), plusCPUprofileonfailure, awaitsCI. Next: use actualsystemChromeCPUprofilebefore furtherfeatureedits; thresholdsremainunchanged. Do not change thresholds to pass.
3. Verify merged production SHA and production Lighthouse. If below95, continue optimizing; never relabel a local score as production.
4. Publish measured round changelog, refresh acceptance/tasks, preserve clean checkpoint.

Worktree: /Users/arinzeokigbo/Documents/Codex/2026-09-14/github-plugin-github-openai-curated-remote/work/astra-site
Original branch preserved in /Users/arinzeokigbo/arinzeokigbo.
Daily09:00 America/New_York heartbeat: astra-hive-site-improvement.
