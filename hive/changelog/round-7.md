# Round 7 — A person behind the work

## What changed

The owner asked for stronger layout, personal representation and more animation. The homepage now puts Arinze's actual headshot beside his name in the first desktop and mobile viewport. About uses an editorial portrait introduction, and selected work has larger alternating compositions. The orbital scene now sits in the laboratory teaser.

## Portrait provenance

The portrait was recovered from this site's Git history, where its original component identified it as Arinze Okigbo. The 4809×4809 source becomes a 1280×1280 WebP of 197,684 bytes, with no appearance edits. Source hashes and processing details are in hive/research/portrait.json.

## Motion

Spring pointer depth, a bounded scroll offset, a hover light sweep and decorative frame entrances add motion around an immediately visible image. Effects stop offscreen and when the page is hidden; reduced-motion and no-JavaScript presentations remain readable. The photo does not animate its scale at startup, avoiding an unnecessary later paint candidate.

## Local verification

- Build, lint, TypeScript and all 371 unit tests pass. Full browser suite: 87 passed, 3 device-specific skips. After the final mobile layout and motion refinements, focused portrait checks pass (7 passed, 1 mobile pointer skip); the layout refinement also passed 19 portrait/metadata checks with 1 skip.
- Manual Chrome review covers the homepage and selected work at desktop sizes and home/About at 390px in light and dark themes. The portrait is visible in the first viewport; About body copy spans the mobile width. Physical iPhone frame rate remains unverified.
- Homepage initial JavaScript is 160.5KiB, up from 154.3KiB, below the unchanged 180KiB budget. All budgeted routes pass.
- Controlled same-host baseline at dee660f: fixed-five performance 98/98/98/98/98, representative 98/100/100/100, LCP2477ms, TBT10ms, CLS0.
- First portrait candidate: 95/97/97/97/97, representative 97/100/100/100, LCP2633ms, TBT27ms, CLS0.
- Final decorative-entrance candidate: 98/97/97/97/97, representative 97/100/100/100, LCP2626ms, TBT21ms, CLS0. This small timing difference does not establish a causal improvement. The portrait adds visual value with a one-point local performance tradeoff; every gate still passes.

## Release and remaining follow-up

First required Linux CI34978867809 held PR8 at94/100/100/100 (91/94/94/97/92), TBT161ms,LCP2662ms,CLS0.00313. All other checks passed. Exact Vercel preview b852228 was visually verified. The mobile name block is now top-aligned so streamed content does not recenter it; scroll progress also avoids reading page height at scrollY0 and batches updates. The revised production build passes87 browser checks (3 skips) and a fresh fixed-five97/100/100/100 (97 in every run), LCP2626ms,TBT19ms,CLS0. No large speedup or root-cause claim is made from this small local difference. Required Linux validation of the revision and production verification remain pending. Earlier Round 6 post-merge Linux94 remains preserved in round-six-postmerge-linux reports; no claim is made that its cause has been identified or fixed. Release thresholds remain 95/95/100/100.

## Verified production

PR8 merged as 4fd1c6ca0a6e63a36f2ac16e280e89c544dafefd after required Linux34980406593 passed96/100/100/100. Its fixed series64/95/96/98/96 is retained, including the slow first run. The exact preview a2430f1 and production domain commit were verified manually.

Production audit34981175312 passed and automatically published99/100/100/100, series95/97/99/99/99. Representative LCP1666ms,TBT111ms,CLS0. Metrics branch ce651fd contains the exact release SHA and measurement. All87 production browser checks pass (3 device-specific skips). The first attempt was interrupted by local ERR_NETWORK_CHANGED/ERR_INTERNET_DISCONNECTED after51passes; traces are retained locally and one infrastructure retry completed successfully.

Final main CI34981068899 passed build/unit/browser/bundle checks but measured93/100/100/100 (91/94/97/92/93),LCP2657ms,TBT223ms,CLS0. R7-04 remains open for this separate Linux startup consistency issue; do not describe the entire round as fully green or retry unchanged measurements until green. The live site meets every production audit gate. No causal claim is made for runner variance, and historical failures remain intact.

The portrait is already SSR-preloaded at high priority; raw run3/run5 resource timings are nearly identical despite the simulated LCP mode split. Adding another preload is unsupported by the evidence. Physical iPhone60fps remains unverified.

Next investigation: intent-triggered homepage route prefetch. The failed representative run made7 automatic RSC requests during startup (10.6KB), and sampled functions include Next prefetch handling. No new implementation or measured benefit is claimed. Preserve the real React render timing showcase.
