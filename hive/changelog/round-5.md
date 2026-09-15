# Round 5 — Faster first paint, quicker navigation

## In this build
Keyboard navigation searches real pages, projects, and published writing. The search interface loads only when opened, and queries stay in the browser.
Hero text animates at first paint. Headlines use native browser animation, and scroll choreography loads on scroll intent. Initial font requests prioritize the main reading face.
Project pages include verified repository screenshots for SkyView and Campus Bookshelf. Imported essays retain source citations and images through a typed safe renderer.
Mobile menus contain keyboard focus and restore it on close. Print uses a readable monochrome palette. Page transitions run on navigation; initial streamed content does not trigger them. The theme wipe leaves pointer input available. New York clocks share an update source that runs only while visible.

## Verification status
This round is held for performance verification. Production remains commit a118398, previously verified with 36 browser checks; its performance scores were 90 on the local Mac audit host and 69 on Linux CI.
The required PR check includes Lighthouse before merge. Production audit verifies the deployed commit, uses the same fixed five-run median method, and publishes measured scores before enforcing the threshold. A published measurement does not mean the gate passed.
Latest Linux CI run 34931595978 recorded performance scores of 75, 93, 98, 95 and 93. The representative score is 93, with TBT 205ms and LCP 2644ms; accessibility, best practices and SEO are 100. The performance requirement is 95, so this candidate remains held.
The subsequent shared visible-only New York clock fix passes 357 unit tests, 66 browser checks with two device-specific skips, build, lint, types and bundle checks. Initial script samples are 154.1, 161.7 and 162.3 KiB, within the 180 KiB budget. Mobile PDF export and a desktop-only pointer reproduction remain skipped on mobile. Five local Lighthouse runs after the clock fix scored 97, 98, 97, 97 and 97. The documented median-run method selected run 3 at 05:19:25.253 UTC: performance 97, LCP 2626.3609ms, TBT 18ms, CLS 0 and other categories 100. No Linux pass or production shipment is claimed.

## Next
Preserve the passing local measurements, clear the Linux performance gate, then verify the candidate on the custom domain. Continue physical-device timing and verified project screenshot coverage; neither is implied by desktop browser emulation.
