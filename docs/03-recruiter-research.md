# 03 — Recruiter & Hiring-Manager Research

**Phase:** 1 (parallel with `01-design-research`, `02-tech-research`)
**Consumed by:** Phase 2 (`04-design-system`), Phase 3 (`05-information-architecture`), Phase 5 (`review-design-qa`)
**Constraint being solved for:** primary audience spends **under 90 seconds** on arinzeokigbo.com and must leave convinced Arinze can build things most candidates cannot.

This document has two halves. **Part A is evidence** — what the research actually says, with URLs. **Part B is the contract** — numbered, checkable content-hierarchy rules the Phase 3 IA/copy agent is bound to. Where Part B goes beyond what a source strictly supports, it is marked `[judgment]`.

---

## 0. Method and source-quality grading

Sources are graded because a lot of "recruiter statistics" circulating online are laundered from one small 2012 study.

| Grade | Meaning |
|---|---|
| **A** | Instrumented research (eye-tracking, logged behavior), published methodology |
| **B** | Survey with disclosed n, or a large thread of self-identified hiring managers |
| **C** | Practitioner assertion, aggregator content, single-author opinion |

Anything graded **C** is used only as corroboration, never as the sole basis for a rule.

---

# PART A — FINDINGS

## A1. The scan is a rejection pass, not a reading pass

**Finding.** The famous "6-second resume scan" (Ladders 2012, updated to 7.4 seconds in 2018) has been systematically misread. It is not how long an evaluator spends understanding a candidate. It is how long they spend deciding **whether to keep going**. The 2012 study found that ~80% of that initial window landed on six data points: name, current title, current company, previous title, previous company, dates — plus education. Recruiters trace an F or E pattern down the page. [Grade A for the eye-tracking; Grade C for the retrospective framing.]

- https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf (403s to automated fetch; findings confirmed via the press release and secondary reporting below)
- https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html
- https://blog.theinterviewguys.com/the-6-second-resume-scan-was-never-a-reading-time-it-was-a-rejection/
- https://resumeheatmap.com/eye-tracking-study

**The critique, which matters as much as the finding.** The Ladders study used ~30 recruiters, undisclosed selection method, undisclosed role types and résumé lengths. It should be treated as directionally real and numerically soft.

- https://spectacletalentpartners.com/is-the-6-second-resume-scan-a-myth/

**The second clock.** Once a candidate clears the triage pass, time investment jumps by an order of magnitude. Reported figures: 57% of hiring managers spend 1–3 minutes on a promising résumé, 21% spend over three minutes. In the 2012 study, recruiters *self-reported* four minutes per résumé while eye-tracking caught them at six seconds — those are two different behaviors on two different documents (the ones they rejected, and the ones they kept).

- https://blog.theinterviewguys.com/the-6-second-resume-scan-was-never-a-reading-time-it-was-a-rejection/

> **Interpretation for this site.** The 90-second budget is not one continuous 90 seconds. It is a ~7-second *survival* gate followed by an ~80-second *evaluation* window that only opens if the gate is passed. These require different content. The gate is passed by **recognizable proper nouns and a legible claim**. The evaluation window is won by **specific technical evidence**. Designing the whole page for "evaluation" loses people at second 7. Designing it all for "gate" leaves nothing to evaluate.

---

## A2. Where the eyes actually go on a web page (not a résumé)

**F-pattern.** Users scan two horizontal stripes and one left-hand vertical stripe when text is unformatted and engagement is low. They miss large blocks based purely on where text happens to sit in the column, and are unaware of what they missed. The F-pattern is a **symptom of bad formatting**, not a layout to design toward. [Grade A]

- https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/

**Layer-cake pattern.** When headings and subheadings are visually distinct and *descriptive*, users scan heading → heading → heading, skipping body text, until a heading interests them — then they drop into the body underneath it. NN/g calls this, after reading every word, the most effective scanning mode available. [Grade A]

- https://www.nngroup.com/articles/layer-cake-pattern-scanning/

**Other documented patterns:** spotted (hunting for links/digits/proper nouns), marking (eye fixes while page scrolls — common on mobile), bypassing (skipping repeated opening words in a list), commitment (reading everything, only when highly motivated).

- https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/

**Design levers NN/g names explicitly:** front-load the most important points; make headings visually prominent and start them with information-carrying words; bold key terms; use bullets and numbers; make link text information-bearing.

**Scroll depth.** NN/g's 2018 study (130,000 fixations, 120 participants): **57% of page-viewing time is above the fold; 74% is in the first two screenfuls.** Attention decays sharply after that. Note this is *down* from 80% above-the-fold in their 2010 data — people scroll more than they used to, but the first two screens still own three-quarters of attention. [Grade A]

- https://www.nngroup.com/articles/scrolling-and-attention/
- https://www.nngroup.com/articles/scrolling-and-attention-original-research/

> **Interpretation.** A single-page portfolio should be built as a **layer cake**, not an F. Every section heading must be a *claim*, readable standalone, front-loaded with the load-bearing noun. A visitor who reads only the headings, in order, and nothing else, must still receive the full argument. That is the design target. And 74% of attention lives in the first two screenfuls — so a 3D hero that consumes screenful one spends the single most valuable asset on the page.

---

## A3. What technical evaluators specifically weight

From large hiring-manager/engineer threads. [Grade B — self-identified practitioners, large n, but self-report.]

**Order of reading.** "No one reads resumes — at best they skim them, looking at the shortest lines, which are usually where you worked and the job title." Then: skim for technology keywords, and **read the prose immediately around a keyword that matters**. The most recent position gets real attention; older ones get almost none.

- https://news.ycombinator.com/item?id=34519268
- https://news.ycombinator.com/item?id=23780236

**What reads as substance:**
- Concrete built-things with named mechanism: *"Architected real-time event messaging infrastructure using X and Y that eliminated expensive SaaS service Z"* — not *"improved efficiency."*
- Scale and delta numbers tied to a system: "used in over a million calls," "deploy time 4–8 hours → 30 minutes," "API handling 1M transactions/hour."
- **Why you chose a tool**, not that you used it. Breadth of technologies without reasoning is a negative signal, not a positive one.
- Detailed READMEs explaining what a project does and why it exists — "hiring managers may skim code but won't install and run things."
- Writing. One hiring manager: *"Blog posts are extremely valuable. I would prefer a non-experienced person with a bunch of articles over a person with less than 1 year of experience."*

**What reads as decoration or actively harms:**
- "High-level vague marketing speech" with missing attribution of contribution — read as **dishonesty**, not as fluff.
- Unsupported soft-skill claims ("I am a good communicator") — dismissed on sight; must be demonstrated, not asserted.
- Skill clouds / tech word-salad — evaluators report deliberately probing the most esoteric item in the list during interviews, and rejecting on a weak answer. **Listing a technology is an invitation to be examined on it.**
- MOOCs, certificates, free online courses — near-zero weight, and negative when they crowd out real work.
- Generic responsibility statements ("followed the SDLC," "attended all required meetings").
- Typos and grammar errors — cited as immediate disqualifiers across reviewers.

**GitHub's real weight is lower than folklore suggests.** "I don't care about your GitHub profile. It's a small value add, nothing more." Recommendation was consistently: only link GitHub if it's active, relevant, and strong — a dated or thin profile is a net negative. Experimental repo code is frequently read as evidence *against* production judgment.

- https://news.ycombinator.com/item?id=23780236

**Consolidated evidence hierarchy** as it emerged from those threads:

1. Shipped product with real users and business impact
2. Relevant work experience and demonstrated influence on a team
3. Technical depth in the specific technologies that matter for the role
4. Written explanation of technical decisions (READMEs, posts, writeups)
5. GitHub contribution activity
6. Coursework, certifications, MOOCs

> **Interpretation.** This ranking is the spine of the whole site. Arinze's assets map onto it unusually well at the top (Splita is #1; Cyera/Queralt/Snorkel are #2; the FIDO2/PKI/Entra work is #3) and unusually weakly at the bottom (student, so coursework is present but worthless as evidence). The correct move is not to balance the page across all six — it is to **spend the page almost entirely on tiers 1–3 and let tier 6 appear as a single line of biography.**

---

## A4. Does the portfolio site itself even matter?

A survey of 60+ hiring managers: **93% said they would look at a portfolio site if one was provided**, but **51% said a candidate's chances would not be lower without one.** The author's conclusion: the website is the *container*, not the content — the projects and their documentation are what do the work. [Grade B]

- https://profy.dev/article/portfolio-websites-survey
- https://dev.to/profydev/this-survey-among-60-hiring-managers-reveals-don-t-waste-your-time-on-a-react-portfolio-website-17ge
- https://news.ycombinator.com/item?id=28233243

Also from that discussion: a poor, broken, or outdated portfolio **actively hurts**. Engineers in a separate thread put it more bluntly: *"A bad, hard-to-understand one is worse than none at all."*

- https://news.ycombinator.com/item?id=15228025

> **Interpretation.** The site has asymmetric payoff. Upside from a great site is modest; downside from a slow, confusing, or content-thin site is real and immediate. That asymmetry should make the team conservative about anything that trades clarity or load time for impressiveness. The site's job is not to *be* the achievement — it is to make the achievements legible in 90 seconds and hand off cleanly to deeper artifacts (the product, the résumé, the writeups).

---

## A5. Documented failure modes

Assembled from the threads above plus the portfolio-guidance corpus.

| # | Failure mode | Evidence |
|---|---|---|
| F1 | No downloadable PDF résumé — "frustrates recruiters whose systems scan documents automatically" | HN 17310379 |
| F2 | No contact information, or contact buried behind a form only | HN 17310379 |
| F3 | Vague self-description with no attributable contribution; read as dishonesty | HN 23780236 |
| F4 | Unclear what the person *personally did* on a team/company project | HN 23780236, 34519268 |
| F5 | Excessive "bling" and unnecessary JS that distracts from content | HN 17310379 |
| F6 | Gimmicks that serve the author, not the reader (the `curl my résumé` genre): *"Who is going to CURL your resume?"* | HN 17310379 |
| F7 | Over-minimal design that reads as unstructured to a first-time visitor — minimalism has a failure mode too | HN 17310379 |
| F8 | Wall of repos with no context; no live demo; nothing openable | HN 28233243, hakia/careerfoundry corpus [C] |
| F9 | Skill clouds inviting adversarial probing | HN 23780236 |
| F10 | Broken/outdated site — worse than no site | HN 28233243, 15228025 |
| F11 | Mobile-hostile layout; recruiters browse on phones | portfolio corpus [C] |
| F12 | Scroll-jacking: "the page ignores your input and plays its own sequence, and visitors leave" | https://svilenkovic.com/3d/scroll-hero-animation [C] |

On scroll-driven hero motion specifically, the practitioner consensus that matches the NN/g attention data: **restraint on the first screen** — hero loads still or with one small movement; scroll effects begin only *after* the visitor has chosen to scroll, which is itself the interest signal. And: scroll animation adds friction wherever the visitor has a task. A recruiter on a portfolio at 4:50pm **has a task.** [Grade C, but consistent with A-grade attention data.]

---

## A6. Technical evaluators vs. non-technical recruiters

Two distinct readers will hit this site, and they are not looking for the same thing. [Grade C, trade sources, but uncontroversial and internally consistent.]

- https://www.seekout.com/blog/hiring-manager-vs-recruiter/
- https://www.wecreateproblems.com/blog/the-role-of-a-recruiter-and-hiring-manager-in-technical-recruiting
- https://recruitment.com/process/technical-recruiting

| | Non-technical / technical recruiter | Engineering hiring manager |
|---|---|---|
| Question being asked | "Does this clear the bar to forward?" | "Can this person do the work on my team?" |
| Reads for | Proper nouns: companies, titles, school, funding status, awards | Mechanism: what system, what constraint, what decision |
| Time | Seconds | Minutes, if the seconds were survived |
| Response to jargon | Pattern-matches it as a keyword | Evaluates whether it was used correctly |
| Fatal signal | Can't tell what the person is | Depth claimed but not demonstrated |

> **Interpretation.** This is the design tension that defines the page, and it resolves cleanly: **proper nouns and mechanism must occupy the same line.** "Security Intern, Cyera" satisfies the recruiter. "…built X that does Y under constraint Z" satisfies the engineer. Both in one entry, with the noun first (recruiter reads left-to-right and stops early) and the mechanism second (engineer keeps reading). This is a per-entry layout rule, not a section-level one.

---

## A7. The student-founder read problem

This is the least-documented question and the most important one here, so the finding is thinner and the judgment is heavier. Flagged accordingly.

**What the sources support.** Running your own startup "generally puts you ahead of the pack," but the advantage collapses if the founder can't demonstrate genuine technical involvement. It is *easy to claim you "did everything at a startup"* without demonstrating real skill, so what's needed is specific challenges faced, individual contributions, and concrete indicators. There is live disagreement about the "CEO" title on a small company — some readers find it pretentious and prefer "founder." Technologies on a résumé should be supporting detail for a story told in the bullets, not the story itself. [Grade C]

- https://fortune.com/2015/03/19/sunil-rajarama-interview-tips
- https://www.rezi.ai/resume-examples/startup-founder
- https://sciontechnical.com/startup-engineering-hiring-guide/

Adjacent and relevant: evaluators distinguish "one year of experience seven times" from "seven years of growth" — they read a trajectory, not a duration.

- https://news.ycombinator.com/item?id=23780236

**`[judgment]` The mechanism behind "impressive for a student."** A young profile triggers a *discount* heuristic: the reader silently normalizes every claim against age. Titles are the most discountable evidence type in existence — a title is granted, and on a company you founded, granted by yourself. Awards and fellowships are also grant-shaped: someone *gave* them to you. So a page whose top-of-funnel evidence is **CEO + Fellowship + Summit** is a page built entirely from discountable material, and it will be read as a strong *student*.

What resists the discount is evidence the reader can verify has an **external referent that doesn't care how old you are**: a product that exists and takes real money; a protocol with a spec number; a system in production at a company that isn't yours; a constraint that was genuinely hard. A FIDO2/PKI implementation is exactly as hard at 20 as at 40 — the spec doesn't grade on a curve. That property is the escape hatch from "impressive for a student," and it is why the Queralt work is strategically more valuable on this page than its line-count would suggest.

**The conversion rule:** lead with the artifact, let the title arrive as an attribute of the artifact. Not *"CEO of Splita, which does group payments"* but *"Splita — commit-first group payments, pre-seed raised"*, with the role stated underneath. The reader meets a thing that exists before they meet a title they can discount.

---

## A8. Résumé PDF vs. site

Direct evidence is limited but one-directional: the absence of a downloadable PDF is a named, specific frustration, because downstream systems (ATS, internal candidate trackers, forwarding to a panel) consume documents, not URLs. A recruiter who likes the site needs an artifact they can attach to an email. HN also notes the reverse convenience: sites that print-to-PDF cleanly get credit.

- https://news.ycombinator.com/item?id=17310379

`[judgment]` The résumé and the site do different jobs and neither substitutes: the site is the **persuasion surface** (90 seconds, one reader, narrative), the PDF is the **transport format** (forwarded, attached, parsed, re-read by four people who never visit the site). A site without a PDF forces the recruiter to do work — and the specific work of manually retyping a candidate's history into their system is exactly the work that causes a candidate to be dropped in favor of one who didn't create it.

Note: `docs/BUILD-PLAN.md` line 59 records that no résumé PDF exists in the repo. **This is a blocking gap, not a nice-to-have.** See Rule 24.

---

# PART B — THE CONTRACT

## B1. Content hierarchy rules

Binding on the Phase 3 information-architecture agent and checkable by Phase 5 `review-design-qa`. Each rule is written to be pass/fail against the rendered page. Rules marked `[judgment]` extend beyond direct source support; they are still binding.

### Group 1 — The first viewport (the 7-second gate)

**R1.** The first viewport must contain, as real DOM text, a statement of **what he builds** plus **at least one concrete proof noun**, in **25 words or fewer** across all text in that viewport combined. Proof noun = a shipped product name, a company name, or a named technical system. Not an adjective.
*Check:* extract all visible text in the initial viewport at 1440×900 and at 390×844; word count ≤ 25; at least one proper noun from the approved facts list in `docs/00`.

**R2.** The first viewport must not be occupied solely by a name, a decorative object, or a tagline. If a 3D element is present, textual content stating the claim must be **co-present in the same viewport**, not revealed on scroll.
*Check:* screenshot at 0 scroll; the claim sentence is legible without any scroll or interaction.

**R3.** Three or more of the following proper nouns must appear **above the fold at 1440×900**: Splita, Cyera, Queralt, Snorkel AI, NYU. These are the recruiter's pattern-match surface and they carry the gate.
*Check:* count in initial viewport DOM.

**R4.** Time-to-first-meaningful-text must be **≤ 1.0s on 4G throttling**, and the claim text must render **with JavaScript disabled**. No animation may gate the appearance of the claim.
*Check:* JS-disabled render; Lighthouse trace. Reuses the existing Phase-5 perf harness.

**R5.** A contact affordance and a résumé affordance must both be reachable **without scrolling** — in persistent nav, in the hero, or both. "Reachable" means a visible link or button, not a hover-revealed element.
*Check:* at 0 scroll, a link with an accessible name matching /contact|email|resume|cv/i exists and is visible.

**R6.** `[judgment]` No line in the first viewport may be a self-assessment adjective. Banned in hero copy: passionate, driven, innovative, dynamic, results-driven, detail-oriented, solutions-focused, visionary, seasoned, versatile, and any synonym. The hero states what exists, not what he is like.
*Check:* regex the hero string against the banned list; manual read for synonyms.

**R7.** `[judgment]` The word "student" may not appear in the first viewport. Education is a **biography fact**, and per A3 it sits at the bottom of the evidence hierarchy; placing it at the top invites the age-discount read before any evidence has landed. NYU may appear as an affiliation noun; "CS student at NYU" as a self-description may not appear before the work section.
*Check:* string search of first-viewport text.

### Group 2 — Layer-cake scannability (structural)

**R8.** Every section heading must be a **standalone claim**, front-loaded with its load-bearing noun in the **first two words**, and comprehensible with zero surrounding context. Category labels are forbidden as headings where a claim is possible.
*Check:* read the heading list in isolation. Each must answer "so what?" Headings failing: "About", "Projects", "Experience", "Skills", "More".

**R9.** **The headings-only test.** Extract every `h1`–`h3` in DOM order, concatenate, and read. That text alone must convey: what he builds, the three strongest pieces of evidence, and how to contact him. If it does not, the headings are wrong — not the body copy.
*Check:* automated extraction + manual read. This is the single highest-value check in this document.

**R10.** No body-text block may exceed **3 lines at 1440px** without an intervening heading, subheading, bolded lead-in, or list. Enforces layer-cake and defeats the F-pattern.
*Check:* rendered-height inspection per paragraph.

**R11.** Within every work or project entry, the **first ≤ 12 words** must state the mechanism — what was built, with what, under what constraint. Role, dates, and company metadata follow. Nothing scrolls or expands to reveal the mechanism.
*Check:* per-entry first-sentence word count and content.

**R12.** Every link's text must be information-bearing. Banned link text: "here", "link", "read more", "click", "→" alone, "learn more", "view".
*Check:* enumerate anchor accessible names; assert none match the banned set.

**R13.** The evidence order on the page must be **descending by the A3 hierarchy**: shipped product → work experience → technical depth → writing → GitHub → education. No lower-tier evidence may be positioned above a higher-tier item.
*Check:* section order audit against the six-tier list.

**R14.** `[judgment]` Total scroll length of the page must not exceed **6 full viewport heights at 1440×900**. Given 74% of attention lands in the first two screenfuls, screens 7+ are not read, and their presence dilutes the screens that are.
*Check:* `document.body.scrollHeight / window.innerHeight ≤ 6`.

### Group 3 — Per-entry evidence construction

**R15.** Every work entry must answer all four of: **what the system was**, **what he personally did**, **what technology or protocol was involved**, **what changed as a result**. A missing fourth element is acceptable only if `docs/00` has no sourceable outcome — in which case the entry may not imply one.
*Check:* four-slot audit per entry.

**R16.** **Personal-contribution attribution is mandatory on every multi-person effort.** Every entry describing work at a company or with a team must contain a first-person verb clause distinguishing his work from the team's. Passive constructions ("was built", "was deployed") and bare "we" without a subsequent "I" are defects. Directly targets F3/F4, the failure mode that reads as dishonesty.
*Check:* per-entry, assert presence of an active first-person verb; flag every passive-voice outcome clause.

**R17.** No skill cloud, no tag soup, no proficiency bars, no percentage-filled rings, no logo grid presented as a skills inventory. Technologies appear **only inside the entry where they were used**. Per A3, a listed technology is an invitation to be examined on it; an unattached one has no defense.
*Check:* assert no standalone skills section exists.

**R18.** Every numeric claim must carry its unit and its referent, and must be traceable to `docs/00`. "Pre-seed raised" is a sourceable status claim and is permitted; an unsourced amount, user count, or percentage is a defect.
*Check:* enumerate all digits on the page; each maps to a `docs/00` line.

**R19.** `[judgment]` Every top-three evidence item must expose at least one **externally verifiable referent** — a live product URL, a company site, a protocol/spec name, a publication, or an artifact the reader can open. Evidence with no exit link is discounted, and it is discounted hardest on a young profile (A7).
*Check:* each of the top three entries contains ≥ 1 outbound link or a named external standard.

**R20.** Every outbound link must have an absolute URL with protocol. *(Standing defect: `BUILD-PLAN.md` line 40 records `featuredProjects[1].href = "www.queraltinc.com"`, which resolves as a relative path. A broken link on the Queralt entry breaks R19 on the single entry that most needs it.)*
*Check:* assert every external href matches `^https://`.

### Group 4 — Titles, age, and the discount heuristic

**R21.** `[judgment]` In every entry, the **artifact precedes the title**. The product, system, or protocol name is the entry's heading; the role is metadata beneath it. No entry may use a job title as its heading.
*Check:* per-entry heading is a thing, not a role.

**R22.** `[judgment]` Grant-shaped credentials — Tyree Fellowship, World Bank Youth Summit 2025 — may not appear in the first two screenfuls and may not be given a section of their own. They belong in a single compact credentials line in the about/biography region. They are corroboration for a case already made, and when they lead, they *are* the case, which triggers the "impressive for a student" read (A7).
*Check:* string search; assert first occurrence is below screenful 2 and not under its own `h2`.

**R23.** `[judgment]` Education appears exactly once, as one line, in the biography region: NYU as current, Trinity as prior. No GPA, no coursework, no relevant-classes list, no honors list. Per A3 tier 6, coursework carries near-zero evaluative weight and consumes attention that tiers 1–3 need.
*Check:* assert no coursework/GPA strings; education occurs once.

### Group 5 — Exit paths

**R24.** A résumé must be downloadable as a **PDF at a stable URL**, linked from persistent nav and again in the contact section, with a direct-download link (not a viewer embed, not a Drive preview). *Currently blocking — no PDF exists in the repo (`BUILD-PLAN.md` line 59).* If the file does not exist by Phase 4, the nav slot must be built and the link marked as an OPEN QUESTION rather than silently omitted.
*Check:* `HEAD` the résumé URL returns `200` with `application/pdf`.

**R25.** A plain email address must appear as **selectable text**, not only as a `mailto:` button and not obfuscated by script. Recruiters copy addresses into their own systems.
*Check:* an email string is present in DOM text and survives JS-disabled render.

**R26.** Contact must never be a form alone. If a form exists, the raw email and LinkedIn must sit adjacent to it.
*Check:* contact region contains ≥ 2 non-form contact affordances.

**R27.** Every outbound profile link (GitHub, LinkedIn, X, Splita) must be present, correct, and live. A dead link is a stronger negative signal than a missing one (F10).
*Check:* link-liveness pass in Phase 5.

**R28.** `[judgment]` GitHub is linked but **not featured**. No contribution graph, no repo grid, no commit-count widget. Per A3 it is tier 5, and a thin or experimental profile on a student is read as evidence against production judgment.
*Check:* assert no embedded GitHub activity component.

**R29.** The page must print to PDF legibly: text-selectable, links not truncated, no content lost to dark-background or motion states.
*Check:* print-to-PDF at Letter; visual inspection.

### Group 6 — Motion, 3D, and the cost of aesthetics

**R30.** No animation may delay the availability of any text. All copy is present in the initial DOM; animation may only affect opacity/transform of already-present nodes.
*Check:* JS-disabled render contains 100% of copy. Overlaps `BUILD-PLAN.md` hard requirement on JS-disabled core content.

**R31.** **No scroll-jacking.** A single wheel gesture, a trackpad flick, `End`, `Cmd+↓`, and a spacebar press must each move the page immediately and proportionally. No section may pin for longer than **600ms** of user-time or resist input at any point.
*Check:* scripted scroll test asserting scroll position responds within one frame; manual `End`-key test.

**R32.** The 3D hero must not be the LCP element, must not block the claim text, and must be dynamically imported below the initial critical path with a static fallback that renders on WebGL failure and with JS disabled. *(Already a Phase-4 constraint; restated here because it is also a content rule — per A2, screenful one holds the largest share of total attention on the page and cannot be spent on decoration.)*
*Check:* Lighthouse LCP element identity; WebGL-disabled render.

**R33.** `[judgment]` Whitespace budget: no viewport between the hero and the contact section may contain **fewer than 30 words** of substantive content. Heavy whitespace and large type are legitimate, but a recruiter with 90 seconds who scrolls past three near-empty screens is spending their budget on travel, not evidence. This is the measurable form of failure mode F7.
*Check:* per-viewport word count during a scripted scroll.

**R34.** Hover, cursor effects, and reveal-on-interaction must never be the **only** path to information. Every fact is present in the default state.
*Check:* render with pointer events suppressed; assert no information loss.

**R35.** `prefers-reduced-motion` must yield a fully static page that still satisfies R1–R14. The reduced-motion path is a real layout, not an animation with duration zero. *(Restates a Phase-4 requirement as a content constraint.)*
*Check:* reduced-motion render audited against Group 1 and Group 2.

---

## B2. The 90-second attention budget

The budget is three phases, not one. Each has a different reader-state and a different job.

### 0–10s — the gate (survival)
**Reader state:** deciding whether this is worth continuing. Scanning for proper nouns and one legible claim. Has not committed.

**Must be absorbed:**
1. What he builds, in one sentence.
2. That at least one real, named thing exists (Splita).
3. That recognizable organizations are attached (Cyera / Queralt / Snorkel AI / NYU).
4. Where the résumé and contact are — registered as *available*, not yet clicked.

**Positioning:** all four in the **first viewport**, as text, without scroll, without JS. Enforced by R1–R5.

**Fails if:** the first screen is a name and a 3D object; the claim uses adjectives instead of nouns; the first noun encountered is "student."

### 10–30s — the case (first scroll)
**Reader state:** committed to a skim. Now in layer-cake mode — reading headings, dropping into body text only under a heading that catches. This is where the technical evaluator separates from the recruiter.

**Must be absorbed:**
1. **Splita is a real product with real money attached, and he built it** — not just runs it.
2. **The Queralt work is hard**, specifically: browser-native authentication, FIDO2, PKI, Entra ID. The reader need not understand it; they must register that it is deep. Named protocols do this work, because a protocol name is a claim that can be checked.
3. **Cyera and Snorkel AI** as an external-validation pattern: security and AI infrastructure, at companies that are not his own.

**Positioning:** screenfuls 2 and 3 = selected work, Splita first, Queralt second — **not** in reverse-chronological order, in **descending order of difficulty-legibility**. Headings carry the entire argument (R9), because at 30s the body text has not been read.

**Fails if:** work is ordered by date instead of by strength; the Queralt entry is compressed into a one-line footnote; entries are headed by job titles (R21).

### 30–90s — the verdict (evaluation window)
**Reader state:** one of three things is happening — reading one entry in depth around a keyword that hooked them, opening splita.co in a new tab, or looking for the résumé.

**Must be absorbed:**
1. **Attribution** — on each item, what *he* did versus what the team did (R16). This is where the "did everything at a startup" suspicion is either resolved or confirmed.
2. **Technical judgment** — one decision, with its reasoning, visible somewhere. Per A3, *why* a tool was chosen outranks *that* it was used.
3. **A clean exit** — résumé PDF downloaded, or email copied, or splita.co opened.

**Positioning:** the deepest technical prose sits *inside* the top two entries, immediately adjacent to the protocol nouns that draw the eye there (A3: "they skim for key technologies and then read the text around them"). Contact and résumé are repeated at the natural exit point, having already been visible at 0s.

**Fails if:** the interesting technical detail is on a separate page or behind an expand-toggle; contact appears only in a footer below three near-empty whitespace screens (R33).

**Budget arithmetic.** 90 seconds at a portfolio-skim rate gives roughly 250–400 words of *actually read* text. The page may contain more, but **the 300 words that carry the argument must be the 300 most likely to be read**: the hero claim, every section heading, and the first sentence of each of the top three entries. That set — and only that set — is the real deliverable of Phase 3.

---

## B3. Framing the Splita CEO role so it reads as engineering capability

**The problem, precisely.** "Co-founder and CEO" on a company you founded is self-conferred, and on a young candidate it collides with the age-discount heuristic (A7). Worse, for an *engineering* reader, "CEO" is a signal pointing away from building. The literal worst outcome is that Splita — his single strongest tier-1 asset — gets read as a business credential rather than as proof he ships.

**The fix, in four parts:**

**1. The product is the heading; the title is metadata.** The entry opens with Splita and what it is, front-loaded. The role appears in a smaller metadata line beneath. `[R21]`

> Heading: **Splita — commit-first group payments**
> Meta: Co-founder & CEO · pre-seed raised · [live link]

Not: "CEO, Splita (2024–present)".

**2. Lead the body with the technical problem, not the market.** "Commit-first" is a **mechanism word** — it names a specific design decision about how money is committed before it moves, which is a distributed-state and payments-correctness problem. An engineer reading "commit-first group payments" gets handed a genuinely interesting question (what happens to a commitment that doesn't settle?) in three words. That question is what makes the entry engineering rather than business. The first sentence should state the problem the architecture solves — sourced from `docs/00`, not invented here.

**3. State what he personally built.** `[R16]` — mandatory. The entry needs an active first-person clause naming a system he wrote. Without it, "CEO" defaults to "did not build." This is the single highest-leverage sentence on the page and it cannot be written from this document: it must come from `docs/00` or the open-questions answers. **If no sourceable statement of his personal technical contribution to Splita exists, that is a blocking gap on par with the missing résumé PDF, and Phase 3 must raise it rather than paper over it.**

**4. Let "pre-seed raised" do exactly one job.** It is the external referent (R19) — someone with money underwrote this, which is not discountable by age. One clause, adjacent to the product name. It must not become the entry's headline, and there must be no fundraising narrative.

**Explicitly avoid:** a founder-story paragraph; the word "journey"; vision language; team-size or hiring claims as evidence of engineering; any framing where the company's ambition substitutes for a description of what was built. Per A3, vague impact language without attributable contribution is read as *dishonesty*, and that penalty lands hardest on exactly this kind of entry.

**`[judgment]` On the title itself.** The sources note real disagreement about "CEO" on a small company. The recommendation is to **keep it** — it is accurate, and removing it looks like hedging — but to **position it so it is never the first thing read** (R21). Accuracy in the metadata line; the artifact in the heading.

---

## B4. Framing the Queralt browser-native authentication work so a skimmer registers its difficulty

**Why this entry is strategically the most important one on the page.** Per A7, the escape from "impressive for a student" requires evidence whose difficulty has an **external, age-independent referent**. FIDO2 is a published specification. PKI is a body of standards. Entra ID is a real identity platform with real constraints. None of them are easier because the implementer was 20. This is the entry that converts "impressive for a student" into "can build things most candidates cannot" — and per `BUILD-PLAN.md` line 121 it is already designated first-class. The risk is not that it gets cut; the risk is that it gets *written thin*, because it is harder to describe than a startup.

**The fix:**

**1. The protocol nouns must appear in the heading or the first line — not in a tag row at the bottom.** Per A3, evaluators skim for technology keywords and then read the prose *around* them. If FIDO2/PKI/Entra ID sit in a footer tag list, the surrounding prose is nothing, and the keyword's pull is wasted. In the heading, the keyword drags the eye into the paragraph that proves the depth. The single highest-value structural edit available on this page is **moving those three nouns upward into the first twelve words of the entry.**

**2. Name the hard part explicitly, in one clause.** A skimmer cannot infer difficulty from a technology list — they can only infer *involvement*. Difficulty becomes legible when a **constraint** is stated. "Browser-native" is itself the constraint word and must not be dropped: doing this natively in the browser, without a client agent or middleware, is precisely what makes it non-trivial. One clause naming the constraint does more than a paragraph of description. Sourced from `docs/00`.

**3. Use the R&D framing as an asset, not a hedge.** Research and development at a company that isn't his own, on identity infrastructure, is tier-2 *and* tier-3 evidence simultaneously (A3). It should not be softened into "explored" or "researched." Prefer verbs that assert construction — bounded by what `docs/00` actually supports. If the work was a prototype, say prototype: a named prototype of a hard thing beats a vague implication of production.

**4. Give it real estate proportional to its strategic value, not its résumé length.** `[judgment]` This entry should occupy no less than 80% of the vertical space given to Splita. If the Queralt entry is visibly smaller than the others, the layout itself communicates that it matters less — and layout is read faster than copy.

**5. Provide the external referent.** A working link to Queralt, protocol-accurate naming, and — if `docs/00` supports it — a link to the QX509 authentication research artifact already in the repo's featured projects. Fix the protocol-less URL (R20) before anything else in this entry.

**Explicitly avoid:** listing FIDO2, PKI, and Entra ID as three separate tags with no sentence connecting them (this is the exact shape of a skill cloud, R17); the word "familiar with"; describing the technologies rather than what he did with them; and — critically — **letting this entry sit third in visual weight because it sounds less exciting than a startup.** To the engineering reader, it is the most convincing thing on the page.

---

## B5. Anti-patterns specific to this site's aesthetic direction

`BUILD-PLAN.md` line 210 specifies: restraint over density, large type, heavy whitespace, few elements per viewport, near-monochrome, plus one 3D hero moment. That direction is right for credibility with an engineering audience — engineers read restraint as confidence — but it has four specific, predictable failure modes against a 90-second budget. Each is listed with the mechanism, the cost, and a mitigation that does not require abandoning the aesthetic.

### AP1 — The 3D hero spends the most valuable screen on the page
**Mechanism.** 57% of viewing time is above the fold (A2). A 3D moment occupying screenful one converts the highest-attention real estate on the site into content that carries zero evaluative information for a recruiter.
**Cost.** The 7-second gate is spent on an object. The reader scrolls to find out what this is, and the gate closes during the scroll.
**Mitigation.** 3D is **background or adjacent, never sole occupant**. The claim sentence and 3+ proper nouns are co-present in the same viewport (R2, R3). If the 3D cannot coexist with legible text in one viewport, it moves below the fold and becomes the secondary use permitted by the build plan. Consider inverting the plan entirely: the hero is type-only; the 3D moment lands at screenful 3 as a *reward* for scrolling, where per the practitioner consensus the visitor has already signalled interest.

### AP2 — Heavy whitespace converts attention into travel
**Mechanism.** Few elements per viewport × large type = low information density per screen. At a fixed 90-second budget, the reader's currency is screens, and low density raises the screen-price of the argument.
**Cost.** The direct form of failure mode F7. A site with the right facts spread over ten near-empty screens delivers fewer facts than a site with the same facts over four.
**Mitigation.** R33 (≥30 substantive words per viewport between hero and contact) and R14 (≤6 viewport heights total). Whitespace is spent *around* dense blocks, not *instead of* them. The pattern that works for this audience: generous margins and section gaps, but tight, information-dense entry blocks — the whitespace separates the argument's parts; it does not dilute them.

### AP3 — Large type hides the layer cake
**Mechanism.** When body type is set large, the visual gap between heading and body narrows, and section headings stop functioning as scan anchors. Near-monochrome removes the second differentiation channel. The layer-cake pattern (A2) — the most effective scan mode available — silently degrades into the F-pattern, and the reader starts missing content without knowing it.
**Cost.** R9 (the headings-only test) fails invisibly. Nothing looks broken.
**Mitigation.** Headings must remain differentiated by **at least two** of: size ratio ≥1.5× against adjacent body, weight, case, color/accent, or a rule. This is a hard input to Phase 2 (`04-design-system`) — the type scale must be validated against the headings-only test, not only against aesthetic preference. Test procedure: blur the page to illegibility; the heading rhythm must still be visible as distinct bands.

### AP4 — Motion that clarifies hierarchy still costs time
**Mechanism.** Reveal-on-scroll, staggered text, and pinned sections each add latency between *arriving* at content and *being able to read* it. Fifteen entrance animations at 400ms each, serialized down a scroll, is 6 seconds — 7% of the total budget — spent on nothing. And a reader who has decided to move fast experiences a well-crafted reveal as an obstruction.
**Cost.** F5 and F12. Worse on a mid-tier Android, which is a stated target.
**Mitigation.** R30 (no animation gates text), R31 (no scroll-jacking, no pin over 600ms), R34 (no information only on hover). Entrance animations are opacity/transform only, on already-present DOM, and must complete within 300ms of the element entering the viewport. A fast scroll must not queue a backlog of animations; anything already scrolled past renders in its final state immediately.

### AP5 — `[judgment]` Near-monochrome removes the only tool for directing a skimmer
**Mechanism.** One accent color across a whole page means the accent cannot signal *importance* — it becomes texture. In a layer-cake scan, color is the fastest attention-router available.
**Cost.** Nothing is emphasized, so the skimmer's own priorities decide what gets read — and the skimmer's default priority is name and title, i.e. the discountable evidence (A7).
**Mitigation.** Reserve the single accent for a **small, fixed, declared set** — proposed: the proof nouns in the hero, the top-three entry headings, and the résumé/contact links. Nowhere else. Phase 2 should state the accent's permitted uses as an explicit allowlist, and Phase 5 `review-design-qa` should treat any accent use outside that list as a defect.

### AP6 — `[judgment]` "Restraint" becoming a reason not to say hard things
**Mechanism.** A minimal aesthetic exerts quiet pressure toward short, elegant, vague copy — because "Splita — group payments" *looks* better in 72px than a sentence that names a distributed-commit problem. This is the aesthetic quietly producing failure mode F3.
**Cost.** The highest-value sentences on the page (the mechanism clauses, R11) get cut for line-length reasons. The site ends up beautiful and evidentially empty — which is precisely the "impressive for a student" outcome, achieved through typography.
**Mitigation.** R11 and R15 are non-negotiable regardless of layout consequences. **If a mechanism sentence does not fit the type scale, the type scale changes — not the sentence.** Phase 3 writes copy before Phase 4 sets final line-lengths, and Phase 5 treats any entry missing its mechanism clause as a content defect, not a design trade-off.

---

## B6. Acceptance checklist for Phase 5

Fast pass/fail against the rules above.

- [ ] **R9 headings-only test** — extracted `h1`–`h3` alone convey the full argument *(highest priority)*
- [ ] R1/R2 — first viewport: claim + proof noun, ≤25 words, co-present with any 3D
- [ ] R3 — ≥3 proper nouns above the fold
- [ ] R4/R30 — all copy renders with JS disabled; no animation gates text
- [ ] R5/R24/R25 — contact and résumé reachable at 0 scroll; PDF returns 200; email selectable
- [ ] R7/R22/R23 — "student" absent from first viewport; grant credentials below screenful 2; education is one line
- [ ] R11/R15/R16 — every entry: mechanism in first 12 words, four evidence slots, active first-person attribution
- [ ] R13 — section order matches the evidence hierarchy
- [ ] R14/R33 — ≤6 viewport heights; ≥30 substantive words per viewport
- [ ] R17 — no skills section, no tag soup, no proficiency bars
- [ ] R19/R20/R27 — top-three entries each have a live external referent; all hrefs absolute; no dead links
- [ ] R21 — no entry headed by a job title
- [ ] R31 — `End` key, spacebar, and a trackpad flick each move the page immediately
- [ ] R32 — 3D is not the LCP element; static fallback on WebGL failure
- [ ] R35 — reduced-motion render still satisfies Groups 1 and 2
- [ ] AP3 — blur test: heading rhythm visible as distinct bands
- [ ] AP5 — accent color used only within the declared allowlist

---

## B7. Open questions this document cannot resolve

Escalated to the orchestrator. Each blocks a rule above.

1. **Splita personal technical contribution** — R16 and B3.3 require a sourceable statement of what Arinze personally built. Nothing in `docs/00`/`BUILD-PLAN.md` supplies it. Without it, the strongest entry on the page cannot be written to spec. **Highest priority.**
2. **Résumé PDF** — R24. `BUILD-PLAN.md` line 59 records none exists. Named as a documented failure mode (F1).
3. **Queralt constraint sentence** — B4.2 requires one clause naming what made browser-native auth hard. Needs a sourced fact, not an inferred one.
4. **Cyera** — `BUILD-PLAN.md` line 57: absent from the repo. R15's four slots cannot be filled for that entry.
5. **Splita external link** — R19 requires a live product referent for the top entry.
6. **Queralt URL** — R20; currently protocol-less (`BUILD-PLAN.md` line 40).

---

## Sources

Graded A:
- [NN/g — F-Shaped Pattern of Reading: Misunderstood, But Still Relevant](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- [NN/g — F-Shaped Pattern (original eyetracking research)](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content-discovered/)
- [NN/g — The Layer-Cake Pattern of Scanning Content on the Web](https://www.nngroup.com/articles/layer-cake-pattern-scanning/)
- [NN/g — Text Scanning Patterns: Eyetracking Evidence](https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/)
- [NN/g — Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/)
- [NN/g — Scrolling and Attention (original research)](https://www.nngroup.com/articles/scrolling-and-attention-original-research/)
- [TheLadders 2018 Eye-Tracking Study (PDF)](https://www.theladders.com/static/images/basicSite/pdfs/TheLadders-EyeTracking-StudyC2.pdf)
- [Ladders press release — updated eye-tracking findings](https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html)
- [ResumeHeatMap — TheLadders 7.4-second study summary](https://resumeheatmap.com/eye-tracking-study)

Graded B:
- [HN — Ask HN: What do you want to see in a resume / GitHub profile?](https://news.ycombinator.com/item?id=23780236)
- [HN — What we look for in a resume](https://news.ycombinator.com/item?id=34519268)
- [HN — Ask HN: What are some resume/portfolio style webpages you like?](https://news.ycombinator.com/item?id=17310379)
- [HN — Ask HN: Good examples of personal websites (Software Engineers)?](https://news.ycombinator.com/item?id=15228025)
- [HN — Don't waste time on a portfolio website – 60 hiring managers and a survey](https://news.ycombinator.com/item?id=28233243)
- [Profy.dev — Portfolio websites survey, 60+ hiring managers](https://profy.dev/article/portfolio-websites-survey)
- [DEV — same survey, mirrored](https://dev.to/profydev/this-survey-among-60-hiring-managers-reveals-don-t-waste-your-time-on-a-react-portfolio-website-17ge)

Graded C:
- [The Interview Guys — The 6-Second Scan Was Never a Reading Time](https://blog.theinterviewguys.com/the-6-second-resume-scan-was-never-a-reading-time-it-was-a-rejection/)
- [The Interview Guys — The 6-Second Resume Test](https://blog.theinterviewguys.com/the-6-second-resume-test/)
- [Spectacle Talent Partners — Is the 6-Second Resume Scan a Myth?](https://spectacletalentpartners.com/is-the-6-second-resume-scan-a-myth/)
- [SeekOut — Hiring Manager vs Recruiter](https://www.seekout.com/blog/hiring-manager-vs-recruiter/)
- [WeCreateProblems — Role of Recruiter and Hiring Manager in Technical Recruiting](https://www.wecreateproblems.com/blog/the-role-of-a-recruiter-and-hiring-manager-in-technical-recruiting)
- [Recruitment.com — Technical Recruiting: Basics, Skills, Best Practices](https://recruitment.com/process/technical-recruiting)
- [Svilenković — Scroll Hero Animation (scroll-jacking critique)](https://svilenkovic.com/3d/scroll-hero-animation)
- [Fortune — Sunil Rajaraman on interviewing founders](https://fortune.com/2015/03/19/sunil-rajarama-interview-tips)
- [Rezi — Startup Founder Resume Examples](https://www.rezi.ai/resume-examples/startup-founder)
- [Scion Technical — Startup Engineering Hiring Guide](https://sciontechnical.com/startup-engineering-hiring-guide/)
- [CareerFoundry — Software Engineer Portfolio Guide](https://careerfoundry.com/en/blog/web-development/software-engineer-portfolio/)
- [Hakia — Developer Portfolio Guide 2026](https://hakia.com/skills/building-portfolio/)
- [TechieCV — Security Engineer Resume Guide](https://www.techiecv.com/resume-guides/security-engineer-resume)
