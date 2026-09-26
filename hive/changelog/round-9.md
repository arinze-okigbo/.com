# Round9 — clearer projects and a fuller writing archive

Status: validated local candidate; production verification pending.

## Changes

- Corrected Learn More destinations, including Splita, and added five sourced company logos.
- Authentic images now lead SkyView, Campus Bookshelf, Homework and NYC Live project cards/details. NYC's image is a real September26local run; Scanner exposes actual input/output. Images and runtime limitations carry accurate provenance.
- Five complete public essays and fourteen verified LinkedIn posts, with visible cover art, topic/year/search/order controls, result counts, reset states and a clearer reader.
- Explicit project navigation controls and keyboard/reduced-motion browsing.
- Fixed light-mode tab-count contrast, printed writing heading, cropped cover titles and long article-link overflow. Public construction content remains absent.

## Evidence and limits

Local380unit tests, full107browser passes/3intentional skips,28focused final browser checks, lint, types and build pass. InitialJS worst158.1KiB under180KiB. Local fixed-five performance94/96/96/96/96; selected96/100/100/100,CLS0,TBT11.5ms.22pages and50external destinations checked:49HTTP200, LinkedIn profile999automated-access restriction.

All seven GitHub projects were attempted; a screenshot is not proof of complete runtime health. SkyView capture timed out and keyless feeds were not verified; Campus needs Supabase configuration; Homework needs Gemini credentials and has a broken pinned dependency; LinkedIn+ is README-only; Java Library GUI launched but could not be captured. Scanner has real CLI text, not a fabricated terminal screenshot. NYC renders a map/alerts while some feeds/layers report errors. See project-media.json and round9-native-captures.json.

The five-essay count matches the public Substack archive. Fourteen LinkedIn posts are a verified public collection, not a complete account export. Source checks from September16retain their original dates.

Next: required LinuxCI, exact preview inspection, gated production deployment and independent production audits, then continued bounded visual/UX review.
