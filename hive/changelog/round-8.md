# Round8 — editorial polish

## Changes

The owner's latest direction supersedes the public site-build showcase. Public pages, metadata, navigation, footer, lab and project lists now focus on Arinze's work. Swarm credits, process copy, task/build replay, the construction project and the profiling/quality interface are removed. Retired /lab/changelog and /projects/astra-hive URLs permanently redirect to /lab and leave the canonical sitemap and search index. Internal evidence remains in this repository and is no longer rendered publicly.

Typography uses a readable12px label floor,14px small body text, more generous leading and less aggressive headline tracking. Labels reveal without scrambled characters. The actual portrait and other motion remain.

A shared lightweight SVG icon family replaces inconsistent Unicode navigation and action glyphs. The supplied Splita logo is integrated using the original JPEG unchanged, cropped only by its CSS display window. Provenance and source hash are in hive/research/splita-logo.json. The logo keeps its white background in both themes.

## Validation

- Build, lint, TypeScript and372 unit tests pass. Full browser suite93passed/3device-specific skips, including both directions of keyboard focus wrapping, removal of construction copy, canonical metadata, permanent legacy redirects and actuallogo loading.
- QA caught and fixed an SVG display value unsupported by social-image rendering and a search-dialog Tab wrap bug exposed by the shorter navigation list. No checks were weakened.
- Manual Chrome review:390px dark homepage, mobileSplita logo/card,1440px light project layout,320px lightAbout. Content remains readable with no documentoverflow; supplied logo shape and crop checked.
- Homepage initial JavaScript154.5KiB versus160.5KiB before; unchanged180KiB gate passes. Removing unused React production profiling eliminates the now-removed showcase's runtime cost.
- Local fixed-five97/97/97/97/97; representative97/100/100/100,LCP2551ms,TBT9.5ms,CLS0. Historical Linux variation remains recorded. No current production score is claimed until release verification.

## Release

PR #9 merged as `6b54d77964f50c9f16d23d09daa3f14f4e415161` and is verified on https://arinzeokigbo.com. Required premerge Linux CI 35034155418 passed, with fixed-five performance 93/96/94/96/96 and representative 96/100/100/100. The exact candidate preview was visually inspected before merge.

All 93 production browser checks pass, with 3 device-specific skips. Final main CI 35034629171 passed build, lint, types, unit, browser, bundle and performance checks: series 79/96/96/95/96, representative 96/100/100/100, LCP 2655ms, TBT 118ms, CLS 0.

Independent production audit 35034711769 published and enforced the exact merge commit: series 68/100/100/99/100, representative 100/100/100/100, LCP 1381ms, TBT 48ms, CLS 0. All measurements use the existing fixed-five representative selection; the slow first runs remain recorded. Current gates pass; historical score variance is not claimed resolved.

Compact reports are under `hive/qa/editorial-polish-{linux,postmerge-linux,production}-{summary,series}.json`. Full raw reports are retained in the corresponding GitHub artifacts and sibling artifact directories. AGENTS.md records the owner's current public content direction so later work does not restore removed process material.
