# Exact resume point

Round 8 is complete and live at https://arinzeokigbo.com. PR #9 merged as `6b54d77964f50c9f16d23d09daa3f14f4e415161`. Working branch: `hive/round-8-editorial-polish`. This branch carries the postrelease evidence checkpoint; production remains the verified merge commit.

## Current direction

The owner supplied Splita's authentic logo and explicitly superseded the original public swarm/site-build showcase. Keep public pages focused on Arinze, real projects and useful experiments. Do not restore construction credits, build replays, internal changelogs, the self-site project or profiling/quality UI. This direction is also in AGENTS.md. Internal coordination and evidence stay in the repository.

Completed: readable typography and stable labels, consistent SVG icons, exact supplied Splita logo, public construction content removed. `/lab/changelog` and `/projects/astra-hive` permanently redirect to `/lab` and are excluded from canonical sitemap/navigation. The real headshot and interactive demos remain.

## Verified release

- Build, lint, TypeScript and 372 unit tests pass. Local and production browser suites each pass 93 checks with 3 device-specific skips. Regression coverage includes public copy, metadata, navigation, redirects, logo loading and bidirectional modal focus wrapping.
- Chrome visual review covered 390px home/Splita, 320px About and 1440px projects in light/dark. Exact preview and live domain verified. Live page is open in the browser.
- Homepage initial JavaScript: 154.5 KiB. All budgeted routes stay below the unchanged 180 KiB cap.
- Local fixed-five performance: 97/97/97/97/97. Required Linux CI 35034155418: 93/96/94/96/96, representative 96/100/100/100.
- Postmerge main CI 35034629171 passed: 79/96/96/95/96, representative 96/100/100/100, LCP 2655ms, TBT 118ms, CLS 0.
- Independent production audit 35034711769 passed and published exact merge SHA: 68/100/100/99/100, representative 100/100/100/100, LCP 1381ms, TBT 48ms, CLS 0.
- Compact reports are `hive/qa/editorial-polish-*.json`. Full raw artifacts remain in sibling `ci-round8-35034155418`, `main-round8-35034629171` and `prod-round8-35034711769` directories and GitHub runs.

## Follow-up

No release task remains. Continue only with bounded, useful improvements that respect the owner's current public content direction. Check for existing PRs before creating one. Keep unchanged performance/bundle gates and exact preview/production verification.

Historical Round 6 and 7 postmerge performance failures remain recorded. Current acceptance gates pass, closing their carried QA tasks against this release; this does not prove historical variance resolved. Slow first runs persist in the current series and must remain visible in evidence. Do not retry unchanged measurements until green or attribute the variance to a specific feature without evidence.
