# Exact resume point

Round7 portrait, composition and motion is live. Production commit: 4fd1c6ca0a6e63a36f2ac16e280e89c544dafefd, merged through PR8. Branch hive/round-7-portrait-design carries a post-release evidence checkpoint for the next gated release. No feature edits are pending.

## Verified result

- Real portrait recovered from site Git history,1280×1280 WebP,197684bytes; provenance in hive/research/portrait.json.
- Headshot appears in the first desktop/mobile viewport on home and About. Larger editorial project layouts, spring pointer depth, hover light, bounded scroll movement and decorative frame entrances. Mobile heading is top-aligned during streaming. Reduced motion and no-JavaScript retain readable content.
- Required premerge Linux34980406593 passed96/100/100/100 (64/95/96/98/96). Exact preview a2430f1 and custom domain4fd1c6c verified.
- Production audit34981175312 published/enforced99/100/100/100 (95/97/99/99/99),LCP1666ms,TBT111ms,CLS0. Metrics branch ce651fd records the exact production SHA.
- All87 production browserchecks pass,3 device-specific skips. First attempt encountered a local network disconnect after51passes; preserved traces at ../round7-production-network-interruption and report at ../round7-production-network-report. One infrastructure retry passed. Final log /tmp/astra-round7-production-browser.log.
- Build/lint/types/371 unit tests pass. Homepage160.5KiB initial JS, unchanged180KiB gate passes. Local final fixed-five97 in everyrun,CLS0. Instrumentation verifies MotionProvider startup height reads1→0 and accurate normal/reduced-motion scroll progress.

## Exact next action — Linux startup consistency

Read hive/qa/portrait-postmerge-linux-summary.json and series. Final mainCI34981068899 failed93/100/100/100 (91/94/97/92/93,LCP2657ms,TBT223ms,CLS0); build/unit/browser/bundle checks passed. Full raw reports and CPU profile: ../main-round7-34981068899/hive/qa/. Required premerge96 and actualproduction99 passed. Keep R7-04 open. Do not claim allchecks green, retry unchanged measurements until green, lower thresholds or attribute causality without evidence.

The earlier first R7 Linux94 is in portrait-linux-held reports; R6 late-main94 remains in round-six-postmerge-linux reports. Preserve all of them. Native profile mainly exposes Next module initialization; no confirmed app-module bottleneck. Raw image timing already shows a high-priority SSR head preload,7KB transfer and near-identical loadtimings across2177/2657ms simulated LCP runs. A duplicate image preload is not warranted.

Next controlled candidate: make visible homepage links prefetch on hover/focus/touch intent instead of automatically at initial load. Raw representative run5 contains7 automatic RSC requests260–320ms after navigation,10585transferbytes, while CPU samples include Next prefetch handling. Measure the candidate using unchanged fixed-five gates, request counts and navigation latency; no benefit is claimed yet. Preserve React production profiling: disabling it would remove the actual component render measurements. The estimated isolated-renderer overhead is7469gzipbytes, not a measured application-bundle saving. Resume this bounded investigation before another feature. If a concrete fix is supported, create a fresh branch from origin/main and carry this checkpoint forward. Keep the portrait/composition/effects and strict CSP. No speculative runtime changes have been made. Physical iPhone60fps remains unverified.

Worktree: /Users/arinzeokigbo/Documents/Codex/2026-09-14/github-plugin-github-openai-curated-remote/work/astra-site
Original checkout preserved: /Users/arinzeokigbo/arinzeokigbo.
Daily09:00 America/New_York heartbeat: astra-hive-site-improvement. Continue from this file.
