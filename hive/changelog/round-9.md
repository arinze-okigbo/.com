# Round9 — clearer projects and a fuller writing archive

Status: shipped September26,2026 via PR10; production94a77990e531a23915171cbd3673fadc567055bd verified.

## Changes

- Corrected Learn More destinations, including Splita, and added five sourced company logos.
- Authentic images now lead SkyView, Campus Bookshelf, Homework and NYC Live project cards/details. NYC's image is a real September26local run; Scanner exposes actual input/output. Images and runtime limitations carry accurate provenance.
- Five complete public essays and fourteen verified LinkedIn posts, with visible cover art, topic/year/search/order controls, result counts, reset states and a clearer reader.
- Explicit project navigation controls and keyboard/reduced-motion browsing.
- Fixed light-mode tab-count contrast, printed writing heading, cropped cover titles and long article-link overflow. Public construction content remains absent.

- Follow-up review: preserve role source links, fetch complete pages for new RSS posts, prevent unhydrated contact drafts from submitting to the site, mark parent sections on detail-page navigation, and expose full-size project images.

## Evidence and limits

Local381unit tests, full107browser passes/3intentional skips,28focused final browser checks, lint, types and build pass. InitialJS worst158.1KiB under180KiB. Local fixed-five performance94/96/96/96/96; selected96/100/100/100,CLS0,TBT11.5ms.22pages and50external destinations checked:49HTTP200, LinkedIn profile999automated-access restriction.

All seven GitHub projects were attempted; a screenshot is not proof of complete runtime health. SkyView capture timed out and keyless feeds were not verified; Campus needs Supabase configuration; Homework needs Gemini credentials and has a broken pinned dependency; LinkedIn+ is README-only; Java Library GUI launched but could not be captured. Scanner has real CLI text, not a fabricated terminal screenshot. NYC renders a map/alerts while some feeds/layers report errors. See project-media.json and round9-native-captures.json.

The five-essay count matches the public Substack archive. Fourteen LinkedIn posts are a verified public collection, not a complete account export. Source checks from September16retain their original dates.

Next: required LinuxCI, exact preview inspection, gated production deployment and independent production audits, then continued bounded visual/UX review.

Performance follow-up: preserve Linux head8e847dc failure (representative94); defer initial navigation prefetch until intent. Local125browser checks pass/3skips, bundle158.5KiB, fixed-five96/97/96/96/96 selects96/100/100/100. Fresh Linux and exact preview verification pending.

## Final release verification

Required Linux36246279406 passed:381unit/125browser checks,3platform skips,158.5KiB initialJS and fixed-five82/95/95/95/95 selecting95/100/100/100. Exact preview69faccf was inspected before merge. Custom domain94a7799 and125production browser checks verified.

Independent production36246677130 published and enforced99/100/100/100 (full series87/99/99/99/98;LCP1668ms,TBT91ms,CLS0). Final main36246619673 passed96/100/100/100 (series72/95/94/98/96). These are representative median results, not claims that every performance run passed. Every raw run, held Linux94 and diagnostic evidence remain available.

Round10 scoped: Now latest-writing composition, About source-link spacing and a bounded interaction review. Runtime-media taskR9-03 remains blocked with exact limits above; all other Round9 tasks complete.
