# Exact resume point

Round 7 — portrait, composition and motion. Local implementation and revised QA complete; release held pending a new required Linux run on hive/round-7-portrait-design. Production remains dee660fbd3e6c4f911b083078537ab13db48c026.

## Implemented and verified

- Real owner portrait recovered from site Git history; 1280×1280 WebP, 197684 bytes, provenance in hive/research/portrait.json.
- Home and About recomposed around the portrait; larger editorial selected work; orbital scene moved to laboratory teaser.
- Spring pointer depth, bounded scroll offset, hover light and decorative frame entrance; static accessible photo, reduced-motion/no-JavaScript and visibility safeguards.
- Build/lint/types/371 unit tests pass; full browser suite87 passed/3 skips; final focused portrait suite7 passed/1 mobile pointer skip. Desktop and390px light/dark manually reviewed.
- Fixed-five local final97/100/100/100 (98/97/97/97/97), LCP2626ms,TBT21ms,CLS0. Same-host baseline98; first portrait candidate97. All three compact reports retained. Homepage160.5KiB initial JS versus154.3 before; unchanged180KiB gate passes.

## Exact next action

PR8 is open: https://github.com/arinze-okigbo/.com/pull/8. First Linux34978867809 failed performance94; all otherchecks passed. The exact b852228 preview was visually verified. A targeted mobile top-alignment fix prevents streamed content recentering the name; MotionProvider skips the startup page-height read and coalesces scroll events. Revised build/fullbrowser87pass3skip and localfixedfive97allruns/CLS0pass; mobilelayout manually rechecked. Push this revised commit and wait for its fresh required Linux run. Do not rerun the failed unchanged candidate. Wait required Linux verify, inspect its complete fixed-five results, visually verify the exact Vercel preview commit, then merge with matching head only after all gates pass. Verify production domain SHA, full production browser suite, independent production audit and final main CI. Record actual results and failures; update tasks/changelog/this checkpoint.

## Retained prior evidence

Round6 pre-merge CI34974009657 passed96 and production audit34974650171 published99/100/100/100. Later main CI34974556397 failed94 (77/94/94/95/93,TBT213ms). Its reports remain in hive/qa/round-six-postmerge-linux-\*.json. The unthrottled profile did not establish the cause; R6-04 stays open. Do not retry completed measurements until green or claim a cause was fixed. The user explicitly prioritizes the portrait/design round over the prior investigation and planned audio experiment; all release gates remain unchanged.

Worktree: /Users/arinzeokigbo/Documents/Codex/2026-09-14/github-plugin-github-openai-curated-remote/work/astra-site
Original checkout preserved: /Users/arinzeokigbo/arinzeokigbo.
Daily09:00 America/New_York heartbeat: astra-hive-site-improvement. Continue from this file.
