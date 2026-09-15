# Round 5 — Faster first paint, quicker navigation

## In this build
Keyboard navigation searches real pages, projects, and published writing. The search interface loads only when opened, and queries stay in the browser.
Hero text animates at first paint. Headlines use native browser animation, and scroll choreography loads on scroll intent. Initial font requests prioritize the main reading face.
Project pages include verified repository screenshots for SkyView and Campus Bookshelf. Imported essays retain source citations and images through a typed safe renderer.
Mobile menus contain keyboard focus and restore it on close. Print uses a readable monochrome palette.

## Verification status
This round is being verified. Production previously passed 36 route, accessibility, metadata, and link checks, but its first mobile performance measurements were 90 on the local audit host and 69 on Linux CI. Both reports remain in the repository.
The required PR check now includes Lighthouse before merge. The independent production audit still verifies the deployed commit and publishes measured scores.
Local verification passes: 355 unit tests, build, lint, types, 61 browser checks (one mobile PDF export check skipped), and the motion interaction harness. Latest local mobile Lighthouse is 97/100/100/100 with zero layout shift. The first Linux candidate scored70 and was held. Further reduction removed eager motion code: initial scripts are154KiB on the homepage and161–162KiB on writing routes, below the existing180KiB budget. Final scores for this round will be recorded after its deployed build is measured.

## Next
Verify the performance reduction on Linux and the custom domain. Continue physical-device timing and verified project screenshot coverage; neither is implied by desktop browser emulation.
