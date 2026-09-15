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

Required Linux CI, exact Vercel preview and production verification are pending.
