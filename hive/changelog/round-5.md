# Round 5 — Faster first paint, quicker navigation

## Shipped implementation
Keyboard navigation searches real pages, projects, and published writing. The search interface loads only when opened, and queries stay in the browser.
Hero text animates at first paint. Headlines use native browser animation, and scroll choreography loads on scroll intent. Initial font requests prioritize the main reading face.
Project pages include verified repository screenshots for SkyView and Campus Bookshelf. Imported essays retain source citations and images through a typed safe renderer.
Mobile menus contain keyboard focus and restore it on close. Print uses a readable monochrome palette. Page transitions run on navigation; initial streamed content does not trigger them. The theme wipe leaves pointer input available. New York clocks share an update source that runs only while visible. The homepage defers rendering below-fold homepage sections with content visibility, removes initial synchronous offscreen geometry reads, and shares one motion-preference query.

## Verification status
Round 5 shipped through PR #5, merged as 9be233e. The custom-domain deployment SHA is verified. The production browser suite passes 68 checks with two device-specific skips. Production audit 34933954175 selected run 4 at 2026-09-15 05:45:32 UTC: 100/100/100/100, LCP 1228.402ms, TBT 33ms and CLS 0. The full fixed-five performance series is 71, 100, 100, 100 and 99; the cold first run of 71 is retained. The representative passes; this does not claim every run exceeded 95.
Required Linux CI 34933482617 passed 96/100/100/100. The fixed-five performance scores were 75, 96, 96, 96 and 93; the median-run method selected run 3, with LCP 2036.84ms, TBT 184ms and CLS 0. Five local runs all scored 98. These are separate CI/local measurements from the custom-domain production result.
Local verification passes 358 unit tests, 68 browser checks with two device-specific skips, build, lint, types and bundle checks. Regressions cover browser find, focus, geometry, anchors, reduced motion and print. Initial script samples are 154.3, 161.9 and 162.6 KiB, within the 180 KiB budget. Mobile PDF export and a desktop-only pointer reproduction remain skipped on mobile.
Production audit verifies the deployed commit, uses the fixed five-run median method, and publishes measured scores before enforcing the threshold. A generated report filename collided with a historical tracked file during metrics checkout; a workflow correction on hive/round-5-audit-publish uses a production-current prefix. Queen independently enforced the retained raw reports and published the exact summary and full series to the metrics branch at d1fc2a8. Permanent automatic-publication repair remains pending in the follow-up PR.

## Next
Verify the permanent metrics-publication correction. Continue physical-device timing and verified project screenshot coverage; physical iPhone performance remains unverified and is not implied by desktop browser emulation.

## Publication follow-up — September 15, 2026
PR #6 merged as a4cb996. Automatic audit publication and enforcement passed in run34934773759, attempt2. The first attempt produced no measurement because Chrome failed to launch. The complete fixed series on retry was97,100,98,99,100; every run met every category gate. Representative run5 at05:59:32 UTC measured100/100/100/100, LCP1667.894ms, TBT60.5ms and CLS0. Metrics commit a6e010a records that exact deployed SHA. The final main quality check also passed.

The release is complete. Round6 is queued as a local cryptographic signature experiment; physical-device timing and further verified media remain future work.
