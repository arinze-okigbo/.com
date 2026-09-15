# Round 5 — Faster first paint, quicker navigation

## In this build
Keyboard navigation searches real pages, projects, and published writing. The search interface loads only when opened, and queries stay in the browser.
Hero text animates at first paint. Headlines use native browser animation, and scroll choreography loads on scroll intent. Initial font requests prioritize the main reading face.
Project pages include verified repository screenshots for SkyView and Campus Bookshelf. Imported essays retain source citations and images through a typed safe renderer.
Mobile menus contain keyboard focus and restore it on close. Print uses a readable monochrome palette. Page transitions run on navigation; initial streamed content does not trigger them. The theme wipe leaves pointer input available. New York clocks share an update source that runs only while visible. The new candidate defers rendering below-fold homepage sections with content visibility, removes initial synchronous offscreen geometry reads, and shares one motion-preference query.

## Verification status
This round is held for performance verification. Production remains commit a118398, previously verified with 36 browser checks; its performance scores were 90 on the local Mac audit host and 69 on Linux CI.
The required PR check includes Lighthouse before merge. Production audit verifies the deployed commit, uses the same fixed five-run median method, and publishes measured scores before enforcing the threshold. A published measurement does not mean the gate passed.
Clock-fix Linux CI run 34932388400 recorded performance scores of 90, 92, 97, 94 and 94. The representative score is 94, with TBT 183ms and LCP 2658ms; accessibility, best practices and SEO are 100. The performance requirement is 95, so the round remains held.
Preview 0495eaf passed manual desktop/mobile search, visible clock updates and zero console-error checks. These checks verify that preview only.
The new candidate passes 358 unit tests, 68 browser checks with two device-specific skips, build, lint, types and bundle checks. New regressions cover browser find, focus, geometry, anchors, reduced motion and print. Initial script samples are 154.3, 161.9 and 162.6 KiB, within the 180 KiB budget. Mobile PDF export and a desktop-only pointer reproduction remain skipped on mobile. Five local Lighthouse runs for this candidate all scored 98. The representative report at 05:35:35 UTC is 98/100/100/100, LCP 2475.143ms, TBT 8.5ms and CLS 0. This local measurement does not clear the Linux or production gates. No Linux pass or production shipment is claimed.

## Next
Preserve the local measurements, clear the Linux performance gate, then verify the candidate on the custom domain. Continue physical-device timing and verified project screenshot coverage; neither is implied by desktop browser emulation.
