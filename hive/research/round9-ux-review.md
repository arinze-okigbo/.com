# Round 9: element review

## Observed on the live Round 8 release

| Element                  | Evidence / issue                                                                                                          | Improvement / acceptance                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Project Learn More       | The label said Read the public source; Splita's source destination was the personal homepage.                             | Learn More targets the actual product/company/repository; independently verify every project's href.                             |
| Experience identity      | Organization names lacked authentic logos.                                                                                | Five sourced logos, consistent frame size, no duplicate screen-reader name, correct official company links.                      |
| Project card imagery     | SkyView and NYC Live shared a generic globe drawing; screenshots were buried in the detail gallery.                       | Lead cards and detail pages with genuine selected images; preserve conceptual art only where there is no authentic image.        |
| Screenshot accuracy      | Repository images alone do not prove current execution.                                                                   | Run each listed GitHub project, record revisions/commands/limits, clearly distinguish local captures from repository images.     |
| Writing intro            | At 2225px viewport width, the generic intro occupies roughly the first 600px; an individual essay is reached late.        | Compact editorial intro, useful archive overview and prominent featured essay.                                                   |
| Writing title hierarchy  | The featured essay's full title wraps over four lines in a uniform list; cover art is hidden until hover.                 | Deliberate feature layout, visible artwork, readable full titles and deliberate secondary rows.                                  |
| Archive completeness     | Five essays and three LinkedIn items; fresh RSS/archive confirm five essays but LinkedIn was a curated subset.            | Discover additional verifiable posts, retain exact dates/sources and clearly state the public archive's scope.                   |
| Writing filters          | Search and year exist, but no topic control or explicit result count/reset.                                               | Search/topic/year controls work together with clear counts and empty/reset states.                                               |
| Project browsing         | Desktop strip presents 2.2 cards at a time, with later projects offscreen and no explicit controls in accessibility tree. | Review discoverability, keyboard scrolling and visible navigation cues after media integration; preserve touch-native scrolling. |
| Public construction copy | Removed in Round 8 per owner instruction.                                                                                 | Regression check all routes, metadata and navigation; never reintroduce build credits or process stories.                        |

## Release review to complete

Review updated home, projects/detail, work, writing/article, about, lab, now, contact and footer in desktop/mobile, light/dark and reduced motion. Inspect each visible control's destination, hover/focus/active behavior, reading hierarchy, media crop, text measure and mobile overflow. Fix concrete findings in scoped agent tasks before release. Defer speculative decorative changes unless they improve the actual experience.

## Continuing review

The existing daily 09:00 America/New_York heartbeat has been updated to continue these priorities, then rotate through every route/element and ship bounded improvements through the existing gates. It remains quiet when there is no actionable change. Current implementation and explicit source/runtime limits take priority over adding more decoration.

## Integrated candidate review — September26

- Independent code review found the new writing header hidden by a global print rule. Scoped print display restores title and context; real print-media browser check passes.
- Axe caught inactive LinkedIn count contrast in light mode. Removing nested opacity restores contrast; both desktop/mobile checks pass.
- Manual Chrome at1440px found featured artwork cropped through its own title. Full16:9 contained artwork now preserves the source image.
- Manual390px essay review found a long C2PA source URL expanding the document to660px. Source links now wrap anywhere; every essay has desktop/mobile overflow coverage.
- Desktop/mobile Chrome checks exercised collection tabs, Splita topic filtering, theme switching, project controls, actual NYC screenshot, experience logos and article headings. All50candidate external destinations were checked; only LinkedIn profile automation returned999, the other49returned200.
- Full browser suite107passed/3platform-specific skips; after final cover/reader CSS,28focused checks passed. Final exact preview and production checks remain release gates.

## Follow-up before release

PR review restored separate role evidence alongside company destinations and fixed full-page fetching for newly discovered RSS excerpts, including pending retries after source outages. The next element review found three concrete gaps: contact forms could default to a site GET without JavaScript, nested mobile routes lacked an active section, and dense screenshots could not be opened at original size. Scoped fixes now keep the composer inert until hydration with an email fallback, identify parent sections with aria-current=location, and expose full-size local image links without client JavaScript. Native Library screenshot was attempted again on September26and still timed out; no capture fabricated.
