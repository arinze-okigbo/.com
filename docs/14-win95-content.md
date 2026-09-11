# 14 — Windows 95 Desktop: Filesystem and Content Architecture

**Phase:** 3 (content architecture for the Win95 rebuild)
**In:** `docs/05-information-architecture.md` (the adjudicated copy — the only permitted source of strings), `docs/00-content-inventory.md` (the only permitted source of facts), `docs/03-recruiter-research.md` (rules R1–R35)
**Out:** the desktop icon set, the full byte-for-byte text of every file, the Start menu, every window title, every dialog, and the disposition of the five missing facts.
**Consumed by:** the Phase-4 build agents.

---

## 0. Governing rules for this document

1. **`docs/05` owns every sentence.** Where a sentence exists there, it ships here verbatim. This document reformats it — line breaks, fixed-width alignment, ASCII rules, uppercase headers — and reformatting is the whole job. It does not rewrite.
2. **`docs/00` owns every fact.** Nothing new is introduced. Not by the Win95 metaphor, not by a filename, not by a dialog, not by a joke.
3. **Omission, never placeholder.** Where `docs/05` carries a `[[NEEDS-FACT]]`, the line is cut. No brackets, no ellipsis, no "coming soon," no greyed-out row. The one exception is the résumé, which `R24` requires to render as a visibly pending affordance rather than vanish — §7.5 handles it.
4. **The metaphor may not cost evidence.** Every gag carries a fact or it does not ship. Any interaction that adds a click must buy something back. This is checked per-icon in §1.3.
5. **The 90-second budget is unchanged.** `docs/03 B2` still applies: a ~7-second gate, then a ~80-second evaluation window. The desktop is the gate. `README.TXT` is the claim. §9 re-runs the attention map against this format.

### 0.1 Typographic policy for the plain-text files

| Rule | Decision |
|---|---|
| Column width | 78 columns of content, hard-wrapped. Notepad's window opens at 80 columns; 78 leaves two columns so no line touches the scrollbar. |
| Font | A Unicode-capable bitmap-style monospace at a fixed cell size. **Not** a CP437-restricted DOS font. |
| Em dashes, `·`, `é` | Ship as-is. `docs/05`'s copy contains `—`, `·` and `Résumé`; downgrading them to `--`, `|` and `Resume` would corrupt approved strings for an authenticity gain nobody can see. The one place ASCII wins is filenames (§1.2). |
| Rules | `=` for the header rule (78 chars), `-` for interior rules (78 chars). No box-drawing characters inside file bodies — they are an MS-DOS convention, not a `.txt` convention, and a `.txt` file is what this is. |
| Headers | Title line uppercased, between two `=` rules. **Exception:** a header is not uppercased where uppercasing would alter a literal value — an email address or a URL. `CONTACT.TXT` is the only file this affects. |
| Indentation | One leading space on every body line, so text does not start flush against the window's client edge. Aligned columns use spaces, never tabs. |
| Filename repetition inside a file | None. The filename is in the title bar (`SPLITA.TXT - Notepad`), which is where Windows puts it. `README.TXT` is the sole exception, because it is a directory of the other files and naming them is its content. |

---

## 1. The desktop

### 1.1 Icon list, order and grid position

Win95 lays desktop icons out column-major on a 75 × 75 px cell grid from the top-left. The grid below is for a 1024 × 768 desktop; §1.6 covers reflow.

**Column 1 — the evidence column.**

| Cell | Label | Kind | Opens |
|---|---|---|---|
| (1,1) | `README.TXT` | document | `README.TXT - Notepad` — **already open at load** |
| (1,2) | `SPLITA.TXT` | document | `SPLITA.TXT - Notepad` |
| (1,3) | `QUERALT.TXT` | document | `QUERALT.TXT - Notepad` |
| (1,4) | `SNORKEL.TXT` | document | `SNORKEL.TXT - Notepad` |
| (1,5) | `SKYVIEW.TXT` | document | `SKYVIEW.TXT - Notepad` |
| (1,6) | `ABOUT.TXT` | document | `ABOUT.TXT - Notepad` |
| (1,7) | `CONTACT.TXT` | document | `CONTACT.TXT - Notepad` |

**Column 2 — the system column.**

| Cell | Label | Kind | Opens |
|---|---|---|---|
| (2,1) | `My Computer` | container | `My Computer` — Explorer window, the index view |
| (2,2) | `RESUME.TXT` | document | `RESUME.TXT - Notepad` |
| (2,3) | `LATTICE.SCR` | screen saver | Display Properties → Screen Saver tab |
| (2,4) | `Recycle Bin` | container | `Recycle Bin` — Explorer window, three deleted files |

**Eleven icons. Nine of them are content. Zero folders ship at launch.**

`WRITING` is a folder and it is the twelfth icon, dark at launch — §1.5.

### 1.2 The deviation from the authentic default layout, stated

Real Windows 95 puts `My Computer` at (1,1) and stacks `Network Neighborhood`, `Inbox` and `Recycle Bin` beneath it. **This desktop does not.** Cell (1,1) is the highest-fixation cell on the screen — it is this format's equivalent of the top of the first viewport, and `docs/03 A2` will not permit it to be spent on chrome. `README.TXT` takes it; `My Computer` moves to the head of column 2, which is still an entirely plausible place for a user to have dragged it.

This is a knowing, adjudicated deviation of the same class as the `R1` word-count deviation recorded at `docs/05 §10`. It should be scored as a decision, not an oversight.

`Network Neighborhood`, `Inbox`, `The Internet` and `My Briefcase` are cut entirely. None of them can be made to carry a fact, and four dead icons in the eye's first landing zone are four icons of travel cost against a 90-second budget (`docs/03 F7`, `R33`).

### 1.3 Labels: the naming decision

**Decision: uppercase 8.3 names with visible extensions for every document; mixed-case long names for the two system containers.**

Windows 95 shipped VFAT long filenames, so both conventions are period-correct and the choice is free. It is made on legibility, and legibility here happens to point at 8.3:

- Every name the content needs fits in eight characters as a **whole English word or proper noun**: `README`, `SPLITA`, `QUERALT`, `SNORKEL`, `SKYVIEW`, `ABOUT`, `CONTACT`, `RESUME`, `LATTICE`. Nothing has to be truncated, so nothing becomes cryptic. The charm is free and the cost is zero.
- **If any name had required truncation, legibility would have won and it would have shipped long.** The test case is the one that got cut: "Selected Work" does not fit, and `SELECTE~1` is unreadable — which is one of the reasons there is no work *folder* (§1.4).
- The visible `.TXT` extension is load-bearing, not decoration. It is the single strongest signal that this is a filesystem and not a menu with a costume on, and it sets the reader's expectation that double-clicking yields *text* — which is exactly what they want and exactly what they get.
- `My Computer` and `Recycle Bin` keep their real long names because those two strings are the most recognisable objects in the entire idiom. Renaming them buys nothing and costs recognition.
- **`RESUME.TXT` is spelled without the accent** — DOS filenames are ASCII, and the ASCII filename against the accented `Résumé` in the file's own body text is a detail that rewards the reader who notices it. The visible copy always says `Résumé`.

### 1.4 Folder vs. document, per icon, with the click cost paid or refused

The rule: **a folder is justified only when the collection is variable-length and its members' names are not needed at the top level.** A folder costs one click and one window; a click against a 90-second budget must buy something.

| Icon | Decision | Why |
|---|---|---|
| `README.TXT` | **document**, and pre-opened | Zero clicks. It is the gate. §2. |
| `SPLITA.TXT`, `QUERALT.TXT`, `SNORKEL.TXT` | **three documents on the desktop, no `WORK` folder** | This is the most consequential decision on the page. A `WORK` folder would hide the three strongest evidence items behind the generic word "Work" and charge a click for the privilege. Left on the desktop, the three filenames *are* `R3`'s above-the-fold proper-noun surface: **Splita, Queralt and Snorkel are readable at zero clicks, before any window is opened**, which is precisely what `R3` asks for and what the section-heading chain did in the scrolling version. The `h2` that carried the four-clause claim in `docs/05 §3.2` is carried here by the desktop itself plus `README.TXT` lines 13–21. |
| `SKYVIEW.TXT` | **document** | One project. A `PROJECTS` folder containing exactly one file is a click that buys nothing (`docs/05 §3.4` ships one `ProjectEntry`). If Q16 (Scanner) is ever answered, two projects still do not justify a folder; three do, and at three this becomes `PROJECTS`. |
| `ABOUT.TXT` | **document** | One file, one screenful-and-a-bit. The Tyree and World Bank credentials live at its foot rather than as their own icons — `R22` forbids them a surface of their own, and an icon *is* a surface. |
| `CONTACT.TXT` | **document** | `R25`/`R26`: the address must be plain selectable text. It is the second line of the file, and the file is one click from anywhere. |
| `RESUME.TXT` | **document** | §7.5. |
| `LATTICE.SCR` | **screen saver, not a document** | §8. |
| `My Computer` | **container** | The one container that earns its click: it is a different *view* of the same files (Details, with dates and sizes), not a hiding place for them. Nothing is reachable only through it. |
| `Recycle Bin` | **container** | Earns its click by containing things that are deliberately *not* on the site. §6.3. |
| `WRITING` | **folder** — the only true folder in the design, dark at launch | The textbook case: a variable-length collection of like items whose individual names are not needed at the top level to satisfy `R3` or `R9`. When post count ≥ 2 it appears at (2,5). §1.5. |

### 1.5 `WRITING` — built, specified, dark

`docs/05 §6` holds the writing section unlisted until `publishedPosts.length >= 2`. The same gate applies unchanged:

| Surface | Launch state |
|---|---|
| `WRITING` desktop icon at (2,5) | **Absent.** No icon, no cell reserved, no gap. |
| `Start > Documents > WRITING` | **Absent.** |
| `README.TXT` file listing | **No `WRITING` line.** |
| `/writing` and `/writing/[slug]` routes | Built, working, `noindex, nofollow`, excluded from sitemap and feed |

When it flips, the icon appears at (2,5); opening it gives an Explorer window titled `WRITING`, Large Icons view, one `.TXT` per post named from the post slug in 8.3 (truncate to eight characters and accept it — post titles are carried by the file's own header line, and this is the one place where the filename is not load-bearing). The folder window's status bar carries the section intro verbatim: `Why a decision was made, not just what was built.` The `SectionHeading` string `Writeups on authentication, payments, and the systems underneath them.` becomes the folder window's second status-bar pane.

### 1.6 Mobile

Windows open fullscreen; the taskbar is the switcher. The desktop reflows to a **row-major 4-column grid** (3 at ≤ 360 px) preserving the sequence 1 → 11 exactly as numbered in §1.1, because phones are read left-to-right-then-down and a column-major layout on a phone reorders the evidence. `README.TXT` is still first, and it is still open on arrival — on mobile it occupies the whole screen, which means the claim, the credential sentence and the email are the entire first paint. That is a better gate than the desktop version, not a worse one.

Icon labels wrap to two lines at the same cell width. No label in §1.1 exceeds eleven characters, so none wraps to three.

### 1.7 Icon art

32 × 32 px at 1× and 16 × 16 px for the taskbar, title bars and Explorer list views, drawn in the Windows 95 16-colour system palette (`#000000`, `#800000`, `#008000`, `#808000`, `#000080`, `#800080`, `#008080`, `#C0C0C0`, `#808080`, `#FF0000`, `#00FF00`, `#FFFF00`, `#0000FF`, `#FF00FF`, `#00FFFF`, `#FFFFFF`), with the 2× set hand-authored rather than scaled — nearest-neighbour doubling is acceptable, bilinear is not.

**These must be drawn fresh in the Win95 idiom, not extracted from `shell32.dll`.** The original icon bitmaps are Microsoft's. Recreating the visual language is fine; shipping the resources is not.

| Icon | Art |
|---|---|
| All `.TXT` files | The generic text-document icon: a white page, `#FFFFFF`, with a `#808080` one-pixel border, the top-right corner folded over to show `#C0C0C0`, and four short `#808080` text rules across the body. **Identical for every document, including `README.TXT`.** Uniform art is what makes the desktop read as a filesystem; a special README icon would make it read as a designed navigation. |
| `LATTICE.SCR` | The screen-saver icon: a `#C0C0C0` CRT in three-quarter view on a stand, screen `#000000`, with four single-pixel `#FFFFFF` points and one `#00FFFF` point on the black — the lattice, at five pixels. |
| `My Computer` | The beige CRT and tower: `#C0C0C0` body, `#808080` shadow faces, `#000080` screen with a `#00FFFF` single-pixel highlight, on a `#808080` base. |
| `Recycle Bin` | **The full state**, not the empty one: the `#C0C0C0` ribbed cylinder with three white paper edges protruding and a `#008000` recycle triangle on the face. It renders full because it contains three files (§6.3), and the art telling the truth about the container's contents is the entire point of this design. |
| `WRITING` (dark at launch) | The standard manila folder: `#808000` outline, `#FFFF00`-tinted face, `#C0C0C0` tab shadow. |

Selection state: the icon bitmap is blended 50% toward `#000080`, and the label gets a `#000080` background with `#FFFFFF` text and a dotted focus rectangle — the authentic treatment, and it doubles as the keyboard focus indicator (§10).

---

## 2. `README.TXT` — the file that opens itself

This is the single most important artifact in the design. It is open when the page loads, at the top of the z-order, positioned so its title bar sits at roughly (96, 64) on desktop and fullscreen on mobile. It is the claim, the proof, the contact route, and the table of contents, in that order.

**Window title:** `README.TXT - Notepad`

**Window size:** 80 columns × 24 rows of client area. Line 24 is the last line visible before scrolling.

### 2.1 The file, verbatim

```
==============================================================================
 ARINZE OKIGBO                                                    README.TXT
==============================================================================

 I build group-payment and browser-native authentication systems.

 Co-founder and CEO of Splita, with early commitments toward a $200K
 pre-seed. Authentication R&D at Queralt Inc. Model-evaluation pipelines at
 Snorkel AI. CS at NYU.

 Email:  arinze@splita.co

------------------------------------------------------------------------------
 Three entries, ordered by how hard the work is to fake — not by date.
------------------------------------------------------------------------------

 SPLITA.TXT     Group payments collected up front.              splita.co
 QUERALT.TXT    Browser-native authentication — FIDO2, PKI,
                and Microsoft Entra ID.                         queraltinc.com
 SNORKEL.TXT    LLM output evaluation inside production AI
                pipelines.                                      snorkel.ai

------------------------------------------------------------------------------

 SKYVIEW.TXT    Browser-based 3D globe on Google Photorealistic 3D Tiles.
 ABOUT.TXT      TechBuzz, AI training, and a Nigerian tech incubator came
                before Splita.
 CONTACT.TXT    arinze@splita.co, plus GitHub, LinkedIn, X, and the résumé.
 RESUME.TXT     Résumé (PDF) — not yet published.

 LATTICE.SCR    Screen saver. Generates an ECDSA P-256 keypair in your
                browser and seeds a point lattice with the signature.

==============================================================================
 Double-click any icon. Start > Internet has the profile links. Everything
 here is plain text, and nothing on this desktop is behind a hover.
==============================================================================
```

### 2.2 What lands before the first scroll

Lines 1–24 — everything down to and including the `SNORKEL.TXT` entry — are visible without scrolling. Measured against `docs/03`:

| Rule | Where it lands | Line |
|---|---|---|
| `R1` — what he builds, as real DOM text | the seven-word claim | 5 |
| `R3` — ≥ 3 proper nouns | Splita, Queralt Inc., Snorkel AI, NYU in the credential sentence; **plus** SPLITA / QUERALT / SNORKEL as desktop icon labels behind the window | 7–9, and the desktop |
| `R5` — contact without scrolling | `Email:  arinze@splita.co` | 11 |
| `R25` — email as selectable plain text | same line; `Edit > Select All` and `Edit > Copy` are live | 11 |
| `R9` — the headings chain | lines 17–21 are the three `h3` claims from `docs/05 §4`, in the same order | 17–21 |
| `R6` — no self-assessment adjective | checked against the full banned list; none present | — |
| `R7` — the word *student* | absent from the file entirely | — |
| `R11` — mechanism in the first ≤ 12 words | each listing line leads with the mechanism, not the company | 17–21 |
| `R12` — information-bearing link text | every listed filename carries its claim on the same line; no bare filenames | 17–29 |

The `$200K` is the only numeral above line 24 and it traces to `[00 §4/L104]` as a *commitment* status, not a raise (`R18`).

**Line 14 is the load-bearing count.** `docs/05 §3.2`'s fallback intro string ships verbatim because the Cyera entry is cut (§7.2). The numeral is derived from the number of work files, not typed — three files, three entries. If Cyera is ever answered, the numeral becomes four, the string becomes the primary one from `docs/05 §3.2`, and `CYERA.TXT` inserts at line 20 and at desktop cell (1,4).

### 2.3 Why `README.TXT` and not `RESUME.TXT` or `INDEX.TXT`

`README.TXT` is the one filename in computing that carries an imperative. A person who has never used Windows 95 still knows, without being told, that this file is the one to read first and that it was left open on purpose. That is a free instruction, and it is the only icon on the desktop that gets one.

---

## 3. The work files

### 3.1 `SPLITA.TXT`

**Window title:** `SPLITA.TXT - Notepad`

```
==============================================================================
 SPLITA — GROUP PAYMENTS COLLECTED UP FRONT
==============================================================================

 Each user pays their share first; the platform pays vendors in full.

 I lead vision, product strategy, fundraising, and go-to-market, and I run
 user research, product development, branding, and partnerships.

 Early commitments toward a $200K pre-seed from institutional and fellowship
 sources. Initial users onboarding.

------------------------------------------------------------------------------
 Co-Founder & CEO · Splita · Aug 2025 – Present · splita.co
------------------------------------------------------------------------------
```

Structure per `docs/05 §3.2` and `R15`/`R21`: the artifact heads the file, the twelve-word mechanism is the first body line, the contribution follows, the outcome follows that, and the role sits last, below a rule, where the eye reaches it fourth. The title bar says `SPLITA.TXT`, not `CO-FOUNDER`.

**The gap.** `docs/05 §3.2` places a `[[NEEDS-FACT]]` for the personal engineering contribution between the mechanism (line 5) and the leadership sentence (line 7). **It is omitted, not marked.** When Q4 is answered, the sentence inserts at line 7 and the leadership sentence moves to line 10. Everything else in the file is unchanged. §7.1 records the cost of shipping without it.

### 3.2 `QUERALT.TXT`

**Window title:** `QUERALT.TXT - Notepad`

```
==============================================================================
 BROWSER-NATIVE AUTHENTICATION — FIDO2, PKI, AND MICROSOFT ENTRA ID
==============================================================================

 Browser-based certificate authentication across Entra ID CBA, WebAuthn/FIDO2,
 and Windows Hello.

 I analyzed the integration pathways across Entra ID CBA, Windows Hello for
 Business credential providers, the Microsoft Graph API, WebAuthn/FIDO2, and
 the Windows Hello APIs.

 I mapped credential enrollment, activation, and passwordless login journeys
 for Chrome and Edge, on Windows and on macOS.

 I developed proof-of-concept browser-based certificate authentication
 workflows and deployment flows with Intune, PKCS/SCEP, and Conditional
 Access.

------------------------------------------------------------------------------
 Software Developer Intern · Queralt Inc. · Jun 2025 – Present · queraltinc.com
------------------------------------------------------------------------------

 See also — LATTICE.SCR

 The screen saver on this desktop generates an ECDSA P-256 keypair in your
 browser with WebCrypto, the same curve WebAuthn passkeys use, signs a nonce,
 and seeds a point lattice with the 64 signature bytes.

 The signature seeds a shape. It encrypts nothing and secures nothing. Reload
 and the structure changes, because the nonce does.
```

**Vertical-space guarantee (`03 B4.4`).** `docs/05 §5` binds this entry to no less than 80% of Splita's vertical space. In this format the measure is line count: `SPLITA.TXT` is 15 lines, `QUERALT.TXT` is 30. The ratio is 200%, and the no-variant rule from `docs/04 §8.2` has a direct analogue here — **there is no compact Notepad.** Every window uses the same font at the same cell size, so a file cannot be quietly shrunk; it can only be shortened, which is visible in the Explorer `Size` column.

**The `See also` block** is how `docs/05 §5`'s "the attestation figure lands immediately after it" survives. The honesty caption from `docs/05 §3.3` ships verbatim and in full, both paragraphs, and the second paragraph is not optional here either. The same two paragraphs appear again in the screen saver's Settings dialog (§8.3) — they are the only text in the entire design that is deliberately duplicated, because `docs/02 §9` names overclaiming as the single way this backfires and there is no such thing as saying it once too often.

**The gap.** Q5's constraint clause is omitted. No bracket. The entry ships eight named systems across three first-person sentences and states no obstacle, which is a weaker entry than it should be and is recorded as such in §7.

**No tag row, here or anywhere.** `[00 §2/L55]`'s four tags — Cybersecurity, FIDO2, PKI, Zero Trust — do not ship. There is no UI surface in this design that could hold them: Notepad has no tag strip, and the Explorer `Type` column says `Text Document` for every file. `R17` is satisfied by the format's own poverty, which is the best way to satisfy it.

### 3.3 `SNORKEL.TXT`

**Window title:** `SNORKEL.TXT - Notepad`

```
==============================================================================
 LLM OUTPUT EVALUATION INSIDE PRODUCTION AI PIPELINES
==============================================================================

 Structured validation of AI-generated outputs across DevOps and
 infrastructure workflows.

 I evaluate output quality, failure modes, and correctness in
 engineering-adjacent workflows, and I write the structured feedback used to
 improve reliability, robustness, and performance.

------------------------------------------------------------------------------
 Snorkel AI · snorkel.ai
------------------------------------------------------------------------------
```

The metadata rule carries two of its four fields. Title and period are omitted, not bracketed — see §7.4, which is the one place the format makes a gap harder to hide than the scrolling version did.

### 3.4 `SKYVIEW.TXT`

**Window title:** `SKYVIEW.TXT - Notepad`

```
==============================================================================
 SKYVIEW — BROWSER-BASED 3D GLOBE ON GOOGLE PHOTOREALISTIC 3D TILES
==============================================================================

 Built outside of work, running in a browser, openable now.

 Vite and Cesium over Google Photorealistic 3D Tiles.

 It layers flight traffic, airports, landmarks, optional weather and
 satellite feeds, and the interface to drive them onto the globe.

------------------------------------------------------------------------------
 Open source · github.com/arinze-okigbo/sky-view
------------------------------------------------------------------------------
```

Line 5 is the Projects section intro from `docs/05 §3.4`, which in the scrolling version sat under the section heading and above the entry; here the file *is* the section, so it sits directly under the header rule. The mechanism (`R11`, eight words) is still the first line of entry body at line 7.

Q9's technical-judgment sentence is omitted.

**Splita and the Queralt research are not repeated here**, for the same reason `docs/05 §3.4` gives: they hold first-class files of their own, and a second copy costs travel, not evidence. **`QX509` appears nowhere in this design** (`docs/05 §11 Q10`).

### 3.5 `ABOUT.TXT`

**Window title:** `ABOUT.TXT - Notepad`

```
==============================================================================
 TECHBUZZ, AI TRAINING, AND A NIGERIAN TECH INCUBATOR CAME BEFORE SPLITA
==============================================================================

 I founded TechBuzz in 2022 and ran it until 2024 — a media platform about
 technology and society. I built and maintained the site, led the writers and
 the editorial direction, and handled the technical and operational
 execution.

 Since 2024 I have evaluated AI-generated code and real software workflows at
 Alignerr and Outlier, including Microsoft Copilot GenAI tasks reviewed
 through screen-shared sessions, writing human-readable rationales for the
 judgments.

 Earlier: large-scale data labelling for Mars rover terrain models on NASA's
 AI4Mars project through Zooniverse, from 2020 to 2023, and a 2018 internship
 at Ventures Platform Fund in Nigeria working on data security, server
 management, and operations.

------------------------------------------------------------------------------
 Computer Science at NYU. Previously Trinity College.
------------------------------------------------------------------------------

 Tyree Innovation & Entrepreneurship Fellow · World Bank Group Youth Summit
 2025 Youth Delegate

 Tyree: Trinity's entrepreneurship fellowship; winner of internal pitch and
 hackathon competitions. World Bank Youth Summit, May 2025: delivered a
 speech on Africa's youth in building a global technology hub, and joined a
 fireside chat on digital currencies in development.
```

**`R22` in this format.** The Tyree and World Bank credentials get no icon, no window, no folder and no Start menu entry. They sit at the foot of one file, below three paragraphs of trajectory and below the education rule, which is roughly line 24 — the fold of the default window. A reader reaches them only after the case is already made, which is exactly the position `R22` specifies.

**`R23` in this format.** One education line, between two rules, no GPA, no coursework, no honours list, no dates. §7.3.

**Not in `ABOUT.TXT`:** the `I care about execution and clarity…` paragraph, `I build systems, products, and companies.`, the `Builder Across AI, Security, and Fintech` achievement, the dead app's skills list and stats block, and AFRIG Mag. All per `docs/05 §3.5`. Three of them reappear as deleted files in the Recycle Bin (§6.3), which is the only place in this design where cut content is visible, and it is visible as *cut*.

### 3.6 `CONTACT.TXT`

**Window title:** `CONTACT.TXT - Notepad`

The header is not uppercased — uppercasing would alter an email address and four URLs.

```
==============================================================================
 arinze@splita.co — direct email, plus GitHub, LinkedIn, X, and the résumé.
==============================================================================

   Email       arinze@splita.co
   GitHub      https://github.com/arinze-okigbo
   LinkedIn    https://www.linkedin.com/in/arinzeokigbo
   X           https://x.com/arinzeokigbo
   Splita      https://splita.co
   Résumé      RESUME.TXT, on this desktop.
               Résumé (PDF) — not yet published.

------------------------------------------------------------------------------
 The address above is plain text. Ctrl+A then Ctrl+C copies this window, or
 use Edit > Select All and Edit > Copy. Nothing here is an image and nothing
 here is assembled by script.
------------------------------------------------------------------------------
```

The header line *is* the address (`docs/05 §3.6`: this is why `R9` passes on the contact clause), and here it is also the window's title-bar-adjacent first line and the first thing a screen reader announces after the title.

`R25` gets a better answer in this format than it had in the scrolling one: `Edit > Select All` and `Edit > Copy` are real, live menu items on a real menu bar, and they are the single most authentic Notepad interaction there is. The recruiter's actual job — get this address into my ATS — becomes a first-class affordance of the metaphor rather than something the metaphor tolerates.

Every URL is absolute with protocol (`R20`). The GitHub handle is hyphenated and the LinkedIn handle is not; both are reproduced exactly as `[00 §5/L119–122]` records them (`docs/05 §11 Q13` still stands and is still the owner's to confirm).

**No contact form ships.** There is no form component in this design and no dialog that takes free text except `Run...`, which navigates. `R26` holds by construction.

### 3.7 `RESUME.TXT`

**Window title:** `RESUME.TXT - Notepad`

See §7.5 for why this file exists as a `.TXT` at all. Its content is assembled entirely from strings already approved in `docs/05` — the same sentences, relaid as a résumé. Nothing is compressed into new phrasing and no fact is added.

```
==============================================================================
 ARINZE OKIGBO
==============================================================================
 arinze@splita.co  ·  github.com/arinze-okigbo  ·  linkedin.com/in/arinzeokigbo
 x.com/arinzeokigbo  ·  splita.co
==============================================================================

 Résumé (PDF) — not yet published. File > Print produces one. File > Save As
 downloads this file as plain text.

 I build group-payment and browser-native authentication systems.


 EXPERIENCE
------------------------------------------------------------------------------

 Co-Founder & CEO · Splita · Aug 2025 – Present · splita.co
   Splita — group payments collected up front.
   Each user pays their share first; the platform pays vendors in full.
   I lead vision, product strategy, fundraising, and go-to-market, and I run
   user research, product development, branding, and partnerships.
   Early commitments toward a $200K pre-seed from institutional and
   fellowship sources. Initial users onboarding.

 Software Developer Intern · Queralt Inc. · Jun 2025 – Present
   Browser-native authentication — FIDO2, PKI, and Microsoft Entra ID.
   Browser-based certificate authentication across Entra ID CBA,
   WebAuthn/FIDO2, and Windows Hello.
   I analyzed the integration pathways across Entra ID CBA, Windows Hello for
   Business credential providers, the Microsoft Graph API, WebAuthn/FIDO2,
   and the Windows Hello APIs.
   I mapped credential enrollment, activation, and passwordless login
   journeys for Chrome and Edge, on Windows and on macOS.
   I developed proof-of-concept browser-based certificate authentication
   workflows and deployment flows with Intune, PKCS/SCEP, and Conditional
   Access.

 Snorkel AI · snorkel.ai
   LLM output evaluation inside production AI pipelines.
   Structured validation of AI-generated outputs across DevOps and
   infrastructure workflows.
   I evaluate output quality, failure modes, and correctness in
   engineering-adjacent workflows, and I write the structured feedback used
   to improve reliability, robustness, and performance.

 AI evaluation · Alignerr and Outlier · Since 2024
   I have evaluated AI-generated code and real software workflows, including
   Microsoft Copilot GenAI tasks reviewed through screen-shared sessions,
   writing human-readable rationales for the judgments.

 Founder · TechBuzz · 2022 – 2024
   A media platform about technology and society. I built and maintained the
   site, led the writers and the editorial direction, and handled the
   technical and operational execution.

 Volunteer · Zooniverse, NASA AI4Mars · 2020 – 2023
   Large-scale data labelling for Mars rover terrain models.

 Intern · Ventures Platform Fund, Nigeria · 2018
   Data security, server management, and operations.


 PROJECTS
------------------------------------------------------------------------------

 SkyView — browser-based 3D globe on Google Photorealistic 3D Tiles
   github.com/arinze-okigbo/sky-view · open source
   Vite and Cesium over Google Photorealistic 3D Tiles. It layers flight
   traffic, airports, landmarks, optional weather and satellite feeds, and
   the interface to drive them onto the globe.


 EDUCATION
------------------------------------------------------------------------------

 Computer Science at NYU. Previously Trinity College.


 HONOURS
------------------------------------------------------------------------------

 Tyree Innovation & Entrepreneurship Fellow — Trinity's entrepreneurship
 fellowship; winner of internal pitch and hackathon competitions.

 World Bank Group Youth Summit 2025 Youth Delegate — May 2025: delivered a
 speech on Africa's youth in building a global technology hub, and joined a
 fireside chat on digital currencies in development.
```

Three roles in `EXPERIENCE` carry no dates or no title because `docs/00` does not source them (Snorkel: neither; Alignerr/Outlier and the rest: dates only as `docs/05 §3.5` states them). Those fields are absent, not blank-with-a-dash and not bracketed.

---

## 4. The Start menu

The banner stripe down the left edge reads **`Arinze Okigbo`**, rotated 90°, white on the `#000080` → `#1084D0` gradient. That is where `Windows 95` went, and it is the correct home for the wordmark: `docs/05 §3.0` gives the header wordmark as `Arinze Okigbo`, and this is the only persistent chrome in the design.

```
┌──────────────────────────────────────────────┐
│  Programs                                  ▸ │
│  Documents                                 ▸ │
│  Internet                                  ▸ │
│  Find                                      ▸ │
│  Settings                                  ▸ │
│  Help                                        │
│  Run...                                      │
├──────────────────────────────────────────────┤
│  Shut Down...                                │
└──────────────────────────────────────────────┘
```

### 4.1 `Programs ▸`

```
Accessories ▸
    Notepad
    Lattice (ECDSA P-256)
```

`Notepad` opens an empty `Untitled - Notepad` window. It is the only thing in this design that does nothing useful, and it stays because removing it would be the one obviously missing item a person who knows Win95 would go looking for. It is nine lines of state and it buys the whole illusion.

`Lattice (ECDSA P-256)` runs the screen saver in a window rather than fullscreen (§8.2).

### 4.2 `Documents ▸`

The authentic Win95 recent-documents list, and here it is the complete file index in evidence order — a keyboard- and screen-reader-reachable route to every file that does not require hunting the desktop grid:

```
README.TXT
SPLITA.TXT
QUERALT.TXT
SNORKEL.TXT
SKYVIEW.TXT
ABOUT.TXT
CONTACT.TXT
RESUME.TXT
```

### 4.3 `Internet ▸` — the external links

`docs/05 §3.9` requires information-bearing link text (`R12`). Menu items carry the full domain, which is both authentic (long filenames in menus were normal) and compliant:

```
Splita — splita.co
GitHub — github.com/arinze-okigbo
LinkedIn — linkedin.com/in/arinzeokigbo
X — x.com/arinzeokigbo
──────────────────────────────────
Queralt Inc. — queraltinc.com
Snorkel AI — snorkel.ai
SkyView — github.com/arinze-okigbo/sky-view
──────────────────────────────────
Email — arinze@splita.co
```

All nine are absolute `https://` or `mailto:` targets, `target="_blank" rel="noopener noreferrer"`, each announcing `(opens in a new tab)` to assistive technology. This submenu is the direct replacement for `docs/05 §3.0`'s footer link row and `§3.6`'s profile-link block, and it is why no icon on the desktop is spent on a social profile.

### 4.4 `Find ▸`

```
Files or Folders...
Computer...            (greyed, unavailable)
```

`Files or Folders...` opens `Find: All Files` — the authentic dialog, `Named:` and `Containing text:` fields, a `Find Now` button and a results list with `Name | In Folder | Size | Type | Modified` columns. It searches the actual text of all nine files. **This is a genuinely useful feature wearing a costume:** a security-team recruiter types `FIDO2` and gets `QUERALT.TXT`; a payments recruiter types `ledger` and gets nothing, which is itself honest. The results list is a real, keyboard-navigable list, and `Ctrl+F` anywhere on the desktop opens it.

### 4.5 `Settings ▸`

```
Control Panel
Taskbar...
```

`Control Panel` opens a window containing exactly two applets — `Display` and `Date/Time` — because an applet that does nothing is a dead icon and `R33`'s spirit applies to every surface, not just scrolled ones. `Display` opens `Display Properties` (§6.1). `Date/Time` opens the authentic clock dialog showing the visitor's real local time; its `Time Zone` tab is where the practical fact goes: `Eastern Time (US & Canada)`, which is the only new-looking string in the design and is not a claim about Arinze, it is a claim about the clock.

`Taskbar...` opens `Taskbar Properties` with the real `Always on top` / `Auto hide` / `Show small icons in Start menu` / `Show Clock` checkboxes, all functional. Small, cheap, and it is the kind of detail that convinces.

### 4.6 `Help`

Opens `Windows Help` — the authentic three-tab window (`Contents` / `Index` / `Find`) with a book-and-page tree. Contents:

```
📖 Reading this desktop
   📄 What is on it, and in what order
   📄 Opening, closing and switching windows
   📄 Keyboard shortcuts
📖 Getting in touch
   📄 Email, GitHub, LinkedIn, X
   📄 The résumé
📖 About the screen saver
   📄 What LATTICE.SCR does
   📄 What it does not do
```

Every page is one screen of plain prose. `Keyboard shortcuts` is the real a11y documentation (§10) and is not a joke. `What it does not do` is the honesty caption, a third time.

### 4.7 `Run...`

The authentic dialog: the running-application icon, the prompt *"Type the name of a program, folder, or document, and Windows will open it for you."*, an `Open:` combo box, `OK` / `Cancel` / `Browse...`.

It is a command palette in period dress, and it works. The combo's drop-down history is prefilled:

```
README.TXT
RESUME.TXT
splita.co
mailto:arinze@splita.co
LATTICE.SCR
```

Any filename opens that window. Any of the nine URLs from §4.3 navigates. Anything else produces the authentic error (§6.5). `Browse...` opens an Explorer file-picker over the same nine files.

### 4.8 `Shut Down...` — the joke, and the four facts it carries

```
┌─ Shut Down Windows ──────────────────────────────────┐
│                                                      │
│   ?    Are you sure you want to shut down?           │
│                                                      │
│        ( ) Shut down the computer?                   │
│        ( ) Restart the computer?                     │
│        ( ) Restart the computer in MS-DOS mode?      │
│        (•) Close all programs and start over?        │
│                                                      │
│         [   Yes   ]  [   No   ]  [   Help   ]        │
└──────────────────────────────────────────────────────┘
```

| Option | What it does | The fact it carries |
|---|---|---|
| **Shut down the computer?** | The orange-on-black `It's now safe to turn off your computer.` screen — and one line beneath it, in the same amber VGA text: `arinze@splita.co`. Any click or key returns to the desktop. | The email survives the shutdown. It is the last thing on screen and the only thing on screen. |
| **Restart the computer?** | Reloads. **The keypair is regenerated, the nonce changes, and the lattice comes back a different shape.** | This is the literal demonstration of `docs/05 §3.3`'s second paragraph — *"Reload and the structure changes, because the nonce does."* The joke *is* the proof. |
| **Restart the computer in MS-DOS mode?** | Drops to a full-screen text-mode view: white-on-black, 80 columns, a `C:\>` prompt, and all nine files concatenated in evidence order — README, Splita, Queralt, Snorkel, SkyView, About, Contact, Résumé. | **This is the no-JS render, the print stylesheet and the screen-reader linearisation, all the same artifact.** `R4`, `R29`, `R30` and `R35` are satisfied by a view the design already wanted to have. §10.3. |
| **Close all programs and start over?** | Closes every window and reopens `README.TXT`. The default selection. | Reset. The only one of the four a confused visitor is likely to want, so it is the one pre-selected. |

`Help` in this dialog opens the Windows Help page `Reading this desktop`.

---

## 5. Window titles and title-bar text

The convention is `FILENAME.TXT - Notepad` for documents and the bare object name for shell windows.

| Window | Title bar | Buttons | Menu bar |
|---|---|---|---|
| `README.TXT` | `README.TXT - Notepad` | `_ ▫ ×` | File Edit Search Help |
| `SPLITA.TXT` | `SPLITA.TXT - Notepad` | `_ ▫ ×` | File Edit Search Help |
| `QUERALT.TXT` | `QUERALT.TXT - Notepad` | `_ ▫ ×` | File Edit Search Help |
| `SNORKEL.TXT` | `SNORKEL.TXT - Notepad` | `_ ▫ ×` | File Edit Search Help |
| `SKYVIEW.TXT` | `SKYVIEW.TXT - Notepad` | `_ ▫ ×` | File Edit Search Help |
| `ABOUT.TXT` | `ABOUT.TXT - Notepad` | `_ ▫ ×` | File Edit Search Help |
| `CONTACT.TXT` | `CONTACT.TXT - Notepad` | `_ ▫ ×` | File Edit Search Help |
| `RESUME.TXT` | `RESUME.TXT - Notepad` | `_ ▫ ×` | File Edit Search Help |
| Empty Notepad | `Untitled - Notepad` | `_ ▫ ×` | File Edit Search Help |
| Index | `My Computer` | `_ ▫ ×` | File Edit View Help |
| Deleted files | `Recycle Bin` | `_ ▫ ×` | File Edit View Help |
| Writing folder (dark) | `WRITING` | `_ ▫ ×` | File Edit View Help |
| Display settings | `Display Properties` | `×` only | — |
| Screen saver settings | `Lattice (ECDSA P-256) Setup` | `×` only | — |
| Lattice, windowed | `Lattice — ECDSA P-256` | `_ ▫ ×` | — |
| File properties | `SPLITA.TXT Properties` | `×` only | — |
| About box | `About Arinze Okigbo` | `×` only | — |
| Search | `Find: All Files` | `_ ▫ ×` | File Edit View Options Help |
| Run | `Run` | `×` only | — |
| Shut down | `Shut Down Windows` | `×` only | — |
| Help | `Windows Help` | `_ ▫ ×` | File Edit Bookmark Options Help |
| Control panel | `Control Panel` | `_ ▫ ×` | File Edit View Help |
| Clock | `Date/Time Properties` | `×` only | — |
| Taskbar settings | `Taskbar Properties` | `×` only | — |
| Errors | `Notepad`, `Run`, `Recycle Bin` — the dialog is titled by the component raising it, never by the error | `×` only | — |

**Active vs inactive title bars.** Active: `#000080` → `#1084D0` left-to-right gradient with `#FFFFFF` bold 11px text. Inactive: flat `#808080` with `#C0C0C0` text. This is the z-order indicator and on mobile it is the only one, so it must not be softened.

**Title bar text is never truncated with an ellipsis** at any width used in this design; every title above is short enough to fit the narrowest mobile window at 320 px.

### 5.1 The Notepad menus, and the fact each one carries

Windows 95 Notepad had exactly `File  Edit  Search  Help`. All four ship, all four work, and each is chosen because it does real work for a recruiter:

| Menu | Items | Why it earns its place |
|---|---|---|
| **File** | `New`, `Open...`, `Save As...`, `Page Setup...`, `Print`, `Exit` | `Print` fires the real print path — `R29` requires the content print legibly, and here printing is a first-class feature rather than an afterthought. `Save As...` downloads the actual `.txt`. On `RESUME.TXT` those two are the entire answer to `R24` (§7.5). `Open...` gives the file-picker over all nine. `New` opens `Untitled`. |
| **Edit** | `Undo`, `Cut`, `Copy`, `Paste`, `Delete`, `Select All`, `Time/Date`, `Word Wrap` | `Select All` + `Copy` is how a recruiter gets the address and the entry text into their own system (`R25`). `Word Wrap` is a live toggle — off by default, which is authentic and which is why every line is hard-wrapped to 78 columns. `Undo`/`Cut`/`Paste`/`Delete` are present and greyed, because the files are read-only (§6.2) and a greyed menu item is more honest than a missing one. |
| **Search** | `Find...`, `Find Next` | The authentic `Find` dialog, scoped to the open file. `F3` repeats. |
| **Help** | `Help Topics`, `About Notepad` | `Help Topics` opens §4.6. `About Notepad` opens the About box, retitled — §6.4. |

---

## 6. System surfaces that carry content

### 6.1 `Display Properties`

Right-click the desktop → `Properties`, or `Start > Settings > Control Panel > Display`. Four tabs, authentic tab strip, `OK` / `Cancel` / `Apply`.

| Tab | Contents | The real function underneath |
|---|---|---|
| **Background** | The little CRT preview, a `Wallpaper` list (`(None)`, `Teal`, `Lattice (still)`), `Display: Center / Tile`, and a `Pattern` list | Wallpaper choice. `Lattice (still)` sets the poster frame — the AVIF still — as the background, which is the only way the lattice ever appears behind content, and it is opt-in. |
| **Screen Saver** | `Screen Saver:` drop-down with `(None)` and `Lattice (ECDSA P-256)`, a `Settings...` button, a `Preview` button, and `Wait: [3] minutes` | §8. |
| **Appearance** | `Scheme:` drop-down — `Windows Standard`, `High Contrast Black`, `High Contrast White`, and a live preview pane | **This is the theme toggle.** `docs/05 §3.0` specifies `Switch to dark theme` / `Switch to light theme`; in this idiom those are colour schemes, and Win95's actual high-contrast schemes were shipped as accessibility features, so the authentic control and the accessible control are the same control. `prefers-color-scheme: dark` preselects `High Contrast Black` on first load; `prefers-contrast: more` also preselects it. |
| **Settings** | `Desktop area: 1024 by 768 pixels`, `Color palette: 256 Color`, a `Font size` drop-down | `Font size` (`Small Fonts` / `Large Fonts`) is a real text-scaling control and it is where the browser's own zoom gets a period-correct twin. The resolution and palette readouts report the actual rendered desktop and are live, not decorative. |

### 6.2 File `Properties` — the dialog where every field is a real fact

Right-click any `.TXT` → `Properties`. The authentic Win95 General tab: the file's icon and name at the top, a rule, then a labelled field block, then the `Attributes` checkbox row.

```
┌─ QUERALT.TXT Properties ─────────────────────────────┐
│  ┌ General ┐                                         │
│  │                                                   │
│  │   📄   QUERALT.TXT                                │
│  │  ──────────────────────────────────────────────   │
│  │   Type:      Text Document                        │
│  │   Location:  Desktop                              │
│  │   Size:      1.18KB (1,208 bytes)                 │
│  │  ──────────────────────────────────────────────   │
│  │   Created:   Jun 2025                             │
│  │   Modified:  Present                              │
│  │  ──────────────────────────────────────────────   │
│  │   Attributes:  [✓] Read-only   [ ] Hidden         │
│  │                [ ] Archive     [ ] System         │
│  │                                                   │
│  │         [  OK  ]  [ Cancel ]  [ Apply ]           │
│  └───────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────┘
```

- **`Size` is computed from the file's own bytes at build time and never hand-entered.** A build agent that types a number here has invented a fact.
- **`Created` and `Modified` are the role's period**, split across the two fields. `SPLITA.TXT`: `Aug 2025` / `Present`. `QUERALT.TXT`: `Jun 2025` / `Present`. This is the metadata line doing a second, quieter job, and it is the correct place for dates: `R21` wants the artifact ahead of the title and `R13` wants order by difficulty rather than date, and a properties dialog is the definition of information that is available but not in the way.
- **Where a date is not sourced, the row is removed, not blanked.** `SNORKEL.TXT` Properties has no `Created`/`Modified` block at all, and the rule that would have separated it is removed with it, so the dialog reads as a shorter dialog rather than an empty one. §7.4.
- **`Read-only` is checked and greyed**, on every file. It is a one-pixel joke that says the thing the whole project is about: the facts here are not editable, and nothing on this desktop was written to be flattering.
- `Hidden`, `Archive` and `System` are unchecked and disabled.

`My Computer` and `Recycle Bin` get their own Properties sheets; the former's General tab reports the same nine-file total the status bar does.

### 6.3 `Recycle Bin` — three things deliberately cut

Explorer window, Details view, status bar `3 object(s)`. The bin icon renders **full**, because it is.

| Name | Size | Type | Deleted |
|---|---|---|---|
| `SKILLS.TXT` | 312 bytes | Text Document | 11 Sep 2026 |
| `TAGLINE.TXT` | 64 bytes | Text Document | 11 Sep 2026 |
| `PROFILE.JPG` | 4.89MB | JPEG Image | 11 Sep 2026 |

Double-clicking any of the three does **not** open it. It opens a properties-shaped dialog titled `<NAME> Properties` with a single `General` tab whose body is one sentence of plain text:

- **`SKILLS.TXT`** — *"Fifteen technologies, none of them attached to anything that was built with them. A listed technology is an invitation to be examined on it; an unattached one has no defence."*
- **`TAGLINE.TXT`** — *"Three adjectives about the author with no artifact behind any of them."*
- **`PROFILE.JPG`** — *"4,809 × 4,809 pixels, 4.89MB, displayed at under 300 pixels. 25,600 times more image than the page needed."*

**The list itself never renders.** The bin holds filenames and judgments, not the cut content — putting the fifteen technologies on screen would be shipping a skill cloud with an alibi, and `R17` does not have an alibi clause. The `PROFILE.JPG` entry is the sharpest of the three because it is a measurement, not an opinion, and it is measured in `[00 §7/L140]`.

`File > Empty Recycle Bin` is present and greyed. `File > Restore` is present and greyed. Nothing here comes back.

### 6.4 The About box

`Help > About Notepad` in any Notepad window, retitled `About Arinze Okigbo`. The authentic layout: flag logo, product line, version line, a rule, the licensee block, a rule, the system block, and an `OK` button.

```
┌─ About Arinze Okigbo ────────────────────────────────┐
│                                                      │
│   ⊞   Arinze Okigbo                                  │
│       Version 4.00.950                               │
│                                                      │
│  ──────────────────────────────────────────────────  │
│                                                      │
│   This product is licensed to:                       │
│        Arinze Okigbo                                 │
│        Splita — splita.co                            │
│                                                      │
│   Product ID:                                        │
│        arinze@splita.co                              │
│                                                      │
│  ──────────────────────────────────────────────────  │
│                                                      │
│   Memory available to Windows:   90 seconds          │
│                                                      │
│                                    [    OK    ]      │
└──────────────────────────────────────────────────────┘
```

Two jokes, two facts. **`Product ID`** sits exactly where a twenty-digit unreadable string sits in the real dialog, and it is the email address — the one string the whole site exists to deliver, placed where nobody would look for it and where everybody has seen one before. **`Memory available to Windows`** is the only line in the design that names the constraint the design was built against; it is a wink to anyone who has read `docs/03`, and it costs one line.

The version string `4.00.950` is the real Windows 95 RTM build. It is left alone — a fake version number here would be the one invented fact in a document whose entire premise is that there are none.

### 6.5 Error dialogs

Three, all authentic, all carrying something.

**Unknown target in `Run...`:**
```
┌─ Run ────────────────────────────────────────────────┐
│  ⛔  Cannot find the file 'foo'. Make sure the file  │
│      name and path are correct.                      │
│                                                      │
│      Everything on this desktop is listed in         │
│      README.TXT.                                     │
│                             [    OK    ]             │
└──────────────────────────────────────────────────────┘
```

**Attempting to edit a read-only file** (typing into a Notepad window):
```
┌─ Notepad ────────────────────────────────────────────┐
│  ℹ   This file is read-only. Every fact on this      │
│      desktop is sourced; none of it is editable.     │
│                             [    OK    ]             │
└──────────────────────────────────────────────────────┘
```

**Opening a deleted file from the Recycle Bin** — replaced by the judgment dialog of §6.3, because a bare *"restore it first"* error carries no fact and would therefore fail rule 4 of §0.

### 6.6 The taskbar and the tray

`Start` button, then one task button per open window (icon + truncated title, pressed state for the focused window), then the tray at the right: a separator, one indicator, and the clock.

| Element | Content |
|---|---|
| Clock | The visitor's real local time, `h:mm AM/PM`. Hovering gives the full date. It is live and it is correct, because a stopped clock is the tell that breaks the illusion fastest. |
| **Attestation indicator** | A 16 × 16 key glyph, `#FFFF00` on `#C0C0C0`. Its tooltip is the readout from `docs/05 §3.3`: `ES256 · sig 3045…a91c · verified 0.4ms`, with real runtime values. Double-clicking it opens the lattice window (§8.2). |

**`R34` guard:** the tooltip is not the only route to the readout. The same three values render as static text inside the lattice window and inside the screen saver's Settings dialog, both reachable without hover and both reachable by keyboard. The indicator is a convenience, never a hiding place.

On mobile the tray keeps the clock and the indicator; task buttons become a horizontally scrolling row and are the only window switcher, per the fullscreen decision.

### 6.7 `My Computer` — the index view

Explorer window, `Details` view, columns `Name | Size | Type | Modified`, **in the authored evidence order**, no sort indicator on any column header.

| Name | Size | Type | Modified |
|---|---|---|---|
| `README.TXT` | — | Text Document | |
| `SPLITA.TXT` | — | Text Document | Aug 2025 – Present |
| `QUERALT.TXT` | — | Text Document | Jun 2025 – Present |
| `SNORKEL.TXT` | — | Text Document | |
| `SKYVIEW.TXT` | — | Text Document | |
| `ABOUT.TXT` | — | Text Document | |
| `CONTACT.TXT` | — | Text Document | |
| `RESUME.TXT` | — | Text Document | |
| `LATTICE.SCR` | — | Screen Saver | |
| `Control Panel` | | System Folder | |

Sizes are computed at build time. Blank `Modified` cells are blank — a blank cell in a file listing is unremarkable and invents nothing, which is exactly why this column is the right place for the dates that exist and the right place for the dates that do not (§7.4).

**Status bar, two panes:**

```
 10 object(s)                    Ordered by how hard the work is to fake — not by date.
```

Clicking a column header re-sorts, which is a user action and not the shipped state. **This matters:** `R13` binds the primary surface, and the primary surface is the desktop plus `README.TXT`, both of which are in strict descending evidence order and neither of which can be re-sorted. `My Computer` is an opt-in secondary index that says in its own status bar what its order means. A visitor who sorts by `Modified` gets the reverse-chronological view, which is a legitimate thing to want and which the design declines to make the default.

---

## 7. The five missing facts

`docs/05 §11` leaves seventeen open questions; five of them bear on what ships. The handling below is the ship-gate applied to this format. **In no case does a placeholder render.**

### 7.1 Q4 — what Arinze personally built at Splita

**Handled by:** omission from `SPLITA.TXT`, at the position between the mechanism (line 5) and the leadership sentence (line 7).

No bracket, no marker, no "more soon". The file ships fifteen lines long and the second thing in it is a company-and-product-model sentence, not a system he wrote.

**The cost, stated plainly, because this format makes it worse rather than better.** `docs/03 B3.3`: *without that sentence, "CEO" defaults to "did not build."* In the scrolling version the entry sat in a column of running prose and its thinness was relative. Here it sits in an Explorer listing beside `QUERALT.TXT` with a `Size` column, and `SPLITA.TXT` is visibly the smaller file. That is uncomfortable and it is also true, and the design does not hide it: the order is difficulty-first and the status bar says so, so the reader is told the small file is first on purpose.

**Mitigation that does not invent anything:** `QUERALT.TXT` is the file that proves he builds, it is one cell below on the desktop, and it is twice the length. The desktop's second and third cells carry the engineering case whether or not Q4 ever arrives. This is `docs/05 §1`'s difficulty ordering paying for itself.

**When Q4 is answered:** one sentence inserts at `SPLITA.TXT` line 7 in the shape `docs/05 §7` specifies. Nothing else changes — not the icon, not the order, not `README.TXT`.

### 7.2 Q2 — Cyera, entirely

**Handled by:** total absence. There is no `CYERA.TXT`, no desktop cell, no `My Computer` row, no `Documents` entry, no `Internet` link, no Recycle Bin entry. The word does not appear anywhere in the design, including in this sentence's sense of a "known gap" — a visitor has no way to learn that something was omitted, which is correct, because an omission that advertises itself is a placeholder with extra steps.

`README.TXT` line 14 therefore ships the three-entry fallback string from `docs/05 §3.2`, and the numeral is derived from the file count rather than typed.

**When Q2 is answered:** `CYERA.TXT` takes desktop cell (1,4); `SNORKEL.TXT`, `SKYVIEW.TXT`, `ABOUT.TXT` and `CONTACT.TXT` each shift down one; `CONTACT.TXT` moves to (2,1) and `My Computer` to (2,2) as column 1 fills. `README.TXT` line 14 becomes the four-entry string and a `CYERA.TXT` listing line inserts at line 20.

### 7.3 Q3 — the NYU transfer date

**Handled by:** `ABOUT.TXT` shipping one education line with no dates on either institution:

```
 Computer Science at NYU. Previously Trinity College.
```

The `[[NEEDS-FACT]]` fragment that `docs/05 §3.5` carries inside this line is dropped. `R23` holds: one line, one place, no GPA, no coursework, no honours list, and no graduation year — the dead app's `2028` is excluded as `[00 §1/L35]` requires.

**The word "student" appears nowhere in the design**, in any file, menu, dialog or tooltip (`R7`).

There is no `SCHOOL.TXT` and no `EDUCATION` folder. Education is tier 6 and it gets one line inside another file, which is the most accurate possible representation of its weight.

### 7.4 Q7 / Q8 — the Snorkel AI title and date conflict

Two titles across two files and three start dates across three files. `docs/05` declines to pick and so does this.

**Handled by:** `SNORKEL.TXT`'s metadata rule carries two of its four fields —

```
 Snorkel AI · snorkel.ai
```

— and the format's other date surfaces omit rather than blank:

| Surface | Treatment |
|---|---|
| `SNORKEL.TXT` metadata line | Title and period absent; org and domain present. The `·` separators that would have bracketed them are removed with them, so the line reads as a short line rather than a broken one. |
| `SNORKEL.TXT` Properties | The `Created` / `Modified` block is **removed entirely**, along with the rule above it. The dialog is shorter than `QUERALT.TXT`'s. It does not show a dash, an em dash, `(unknown)`, or an empty field. |
| `My Computer` `Modified` column | Blank cell. Blank cells are ordinary in a file listing and assert nothing. |
| `RESUME.TXT` | The Snorkel block leads with `Snorkel AI · snorkel.ai` and no date range. |

**This is the one place where the desktop format is harder on a gap than the scrolling page was**, because files have dates and a file without one is slightly conspicuous. That conspicuousness is accepted: it is one blank cell in one column of one secondary window, against the alternative of picking one of three conflicting dates, which would be inventing a fact.

### 7.5 Q1 — the résumé, which is a real design problem

`R24` wants a PDF at a stable URL, linked from persistent nav and again from contact, as a direct download. `[00 §6/L132]` is definitive: **no PDF exists.** `docs/05 §3.0` handles this with a visible pending string in three slots.

An icon is a stronger promise than a link. A `RESUME.PDF` icon on the desktop asserts that a PDF exists; double-clicking it into an error dialog is a bait-and-switch, and doing that to the one visitor who came specifically for the résumé is the worst available outcome.

**Three options were considered:**

| Option | Verdict |
|---|---|
| `RESUME.PDF` icon that opens a "file not found" error | **Rejected.** The icon promises a file that does not exist. `R27`'s principle — a dead link is a stronger negative signal than a missing one — applies to icons with more force than to links, because an icon is a picture of a file. |
| No résumé icon at all, pending text only inside `CONTACT.TXT` | **Rejected.** `R24` explicitly forbids silent omission, and a recruiter who came for the résumé would have to open the right file to learn there isn't one. |
| **`RESUME.TXT` — a real, complete, plain-text résumé** | **Adopted.** |

**The recommendation: ship `RESUME.TXT`, and make `File > Print` the PDF.**

1. **The icon never lies.** It is a `.TXT` with the same icon as every other `.TXT`, it opens instantly, and the file it opens is real and complete.
2. **Nothing is invented.** §3.7's content is `docs/05`'s own approved sentences relaid in résumé order. Not one new claim, not one new date.
3. **`R24`'s pending requirement is satisfied in visible text**, on line 8 of the file, in `CONTACT.TXT`'s link block, and in `README.TXT` line 29 — three slots, the same three `docs/05 §3.0` specifies: `Résumé (PDF) — not yet published.`
4. **There is an honest PDF route today.** `File > Print` renders the résumé through the print stylesheet; every browser's print dialog offers *Save as PDF*. That is a real PDF of a real document, produced on demand, and `R29` already required the print path to work.
5. **There is an honest ATS route today.** `File > Save As` downloads `RESUME.TXT`. Plain text is the single most reliably parsed format an applicant tracking system accepts — better than most PDFs. The recruiter's actual job gets easier, not harder, because the file is text.
6. **The metaphor pays for itself here.** `File > Print` and `File > Save As` are the two most authentic menu items Notepad has, and they are the two that solve this problem. That is the design working rather than the design being worked around.

**When a real PDF exists:** `RESUME.TXT` is replaced by `RESUME.PDF` at cell (2,2) with the document-with-red-icon art, double-click triggers a direct download at the stable URL (`R24`: not a viewer embed, not a Drive preview), the pending string is removed from all three slots, and `RESUME.TXT` is deleted rather than kept alongside — two résumé files is a worse state than one.

---

## 8. The cryptographic lattice

The current site generates a real ECDSA P-256 keypair in-browser with WebCrypto, signs a nonce, and seeds a WebGL point lattice from the 64 signature bytes. `docs/05 §5` calls it *"the page's one moment where the aesthetic and the evidence are the same artifact."* It is the most distinctive thing he has built and it does not get discarded.

### 8.1 The options, and the recommendation

| Option | Assessment |
|---|---|
| **Wallpaper / Active Desktop** | Rejected. A live WebGL canvas behind every window is on from the first paint, which is precisely what `R32` and `BUILD-PLAN` decision 6 forbid: the object must not be the LCP element and must not compete with the claim. It also runs for the entire session, which is the worst possible power and thermal profile on the mobile devices the taskbar decision was made for. |
| **A window: `LATTICE.EXE`, canvas plus readout panel** | Good, and adopted as a *secondary* route (§8.2). Rejected as the primary because a window is something the visitor must choose to open during the 90 seconds they were going to spend reading — it converts a reward into a competitor. |
| **The Display Properties monitor thumbnail only** | Rejected as primary — a 120 × 90 px preview is too small for a point lattice to resolve — but kept, because it is authentic and it is a free, zero-commitment first look. |
| **Screen saver, `LATTICE.SCR`** | **Recommended.** |

### 8.2 Why the screen saver is the right answer

**It is idle-triggered, which makes it structurally incapable of costing evidence.** A screen saver runs only after the visitor has stopped interacting — which is to say, after the 90-second evaluation window has closed. `R32` and `BUILD-PLAN` decision 6 both say the 3D must be a reward for going deeper and never a tax on the gate. A screen saver does not need to be disciplined into that behaviour; it is the definition of it. **It cannot be the LCP element because it does not exist until three minutes in.**

**The idiom already has a place for the honesty caption.** A `.SCR`'s `Settings...` dialog is where a screen saver explains itself, and `docs/05 §3.3`'s two paragraphs — the second of which is mandatory and non-negotiable per `docs/02 §9` — fit there natively rather than being bolted on. There is no other system surface in Windows 95 where a paragraph of technical explanation is *expected*.

**It sits one cell from the work it corroborates.** `LATTICE.SCR` is at (2,3); `QUERALT.TXT` is at (1,3) — the same row, the adjacent column. And `QUERALT.TXT`'s own `See also` block (§3.2) names it directly, which is how `docs/05 §5`'s "immediately after the Queralt entry" survives a format with no scroll order.

**The `Restart` joke is its proof.** `Start > Shut Down > Restart the computer?` regenerates the keypair, and the lattice comes back different. The design's most authentic gag is a live demonstration of its most important honesty claim.

**Reduced motion has a native control.** `prefers-reduced-motion: reduce` sets the `Screen Saver:` drop-down to `(None)` and the wait timer never arms. **Nothing downloads** — the `ogl` chunk is never requested, matching `docs/04`'s `M11` 0 KB path. The Display Properties preview thumbnail shows the AVIF still instead, so the artifact is still visible; it just does not move. The visitor can select `Lattice (ECDSA P-256)` manually and it will run, because a reduced-motion preference is a default, not a prohibition.

### 8.3 The specification

**Registration.** `Display Properties > Screen Saver`. `Screen Saver:` drop-down offers `(None)` and `Lattice (ECDSA P-256)`. `Wait: [3] minutes`, a live spinner. `Preview` runs it fullscreen immediately. `Settings...` opens the dialog below.

**Idle behaviour.** After the wait interval with no pointer, key, touch or scroll: fade to the fullscreen lattice over 400 ms. **Any input at all dismisses it instantly** — pointer move, key, touch, wheel, focus change. It never traps input, never requires a click to escape, and never asks for a password. The dismissal is unconditional; `R31`'s no-scroll-jacking principle applies to anything that holds the viewport.

**Windowed route.** `Start > Programs > Accessories > Lattice (ECDSA P-256)`, the tray indicator's double-click, and `Run...` with `LATTICE.SCR` all open `Lattice — ECDSA P-256`: a resizable window, the canvas filling the client area, and a one-line readout strip along the bottom —

```
 ES256 · sig 3045…a91c · verified 0.4ms
```

— rendered as static DOM text, not a tooltip, which is what discharges `R34` for the tray indicator.

**`Lattice (ECDSA P-256) Setup`** — the Settings dialog. Title bar per §5. A `Points:` slider, a `Speed:` slider, an `OK` / `Cancel` pair, and above them the caption, verbatim from `docs/05 §3.3`, both paragraphs:

```
 This page generated an ECDSA P-256 keypair in your browser with WebCrypto —
 the same curve WebAuthn passkeys use — signed a nonce, and seeded the
 geometry with the 64 signature bytes.

 The signature seeds a shape. It encrypts nothing and secures nothing.
 Reload and the structure changes, because the nonce does.
```

**Poster fallback.** The AVIF still, with `alt` verbatim from `docs/05 §3.10`: `A lattice of points resolving from scattered noise into an ordered surface.` It renders in the Display Properties preview thumbnail always, and it replaces the canvas on WebGL failure, under reduced motion, and with JavaScript disabled.

**What no copy anywhere may say about it.** It is not encryption, not a security guarantee, and not a demo of the Queralt work. `docs/02 §9` names overclaiming crypto to a security audience as the single way this backfires, and the audience for this site is a security audience roughly a third of the time.

---

## 9. The 90-second budget, re-run against this format

`docs/03 B2`'s three phases, remapped. The question this section answers is the one the concept has to survive: **does the metaphor bury the evidence?**

### At 7 seconds — the gate

Nothing has been clicked. On screen: the desktop, eleven icons, and `README.TXT` open over it.

| Absorbed | Delivered by |
|---|---|
| What he builds | `README.TXT` line 5, the seven-word claim, in the focused window at the centre of the screen |
| That recognisable organisations are attached | line 7–9: Splita, Queralt Inc., Snorkel AI, NYU — four proof nouns, `R3` satisfied twice over |
| That named real things exist | the desktop icon labels visible around the window: `SPLITA.TXT`, `QUERALT.TXT`, `SNORKEL.TXT`, `SKYVIEW.TXT` |
| Where contact is | line 11, `Email:  arinze@splita.co` |
| Where the résumé is | line 29 and the `RESUME.TXT` icon at (2,2) |

**Zero clicks required for any of it.** This is a better gate than a scrolling hero, because the icons deliver the proof nouns *in parallel with* the claim rather than after it, and because a window that is already open reads as something left behind rather than something arranged.

### At 30 seconds — the case

The reader has opened one or two files. Reaching them costs one double-click each, from icons that are already on screen and already labelled with the proper noun.

| Absorbed | Delivered by | Cost |
|---|---|---|
| The three strongest evidence claims | `README.TXT` lines 17–21 — the three `h3` strings from `docs/05 §4`, in difficulty order, already visible | 0 clicks |
| Splita is real and has money attached | `SPLITA.TXT`, the whole file in one screenful | 1 click |
| The Queralt work is hard, specifically | `QUERALT.TXT` — eight named systems in three first-person sentences | 1 click |
| The ordering is deliberate | `README.TXT` line 14, and the `My Computer` status bar | 0 clicks |

**The one click per file is the format's real cost, and it is paid back twice:** the filename is the claim, so the reader chooses which evidence to spend the click on rather than scrolling past it; and windows stay open, so a reader who opens all three has all three on screen at once and can tile them — something the scrolling version could not do at all.

### At 90 seconds — the verdict

| Behaviour | What they find |
|---|---|
| Reading one entry deeply | The whole file is one or two screenfuls of plain monospace prose. Nothing is behind an expand toggle, a hover, or a second page. |
| Opening `splita.co` | `Start > Internet`, the `README.TXT` and `SPLITA.TXT` domain columns, and `Run...` — three routes |
| Looking for the address | `README.TXT` line 11 (open since load), `CONTACT.TXT`, the Start menu, the About box, and the shutdown screen — five |
| Looking for the résumé | The `RESUME.TXT` icon; `File > Print` for a PDF, `File > Save As` for a `.txt` |
| Checking attribution | First-person verb clauses in every entry (`R16`), and one entry — Splita — that visibly does not have one (§7.1) |

**Word budget.** `docs/03 B2` puts 90 seconds at roughly 250–400 words actually read. `README.TXT` is 214 words and it contains the claim, the credential sentence, the three evidence claims, and the address. **The entire argument fits in the file that is already open.** Everything else on the desktop is the reward.

---

## 10. Accessibility, no-JS, and print

The metaphor is not permitted to cost any of these. `R4`, `R29`, `R30`, `R34` and `R35` all still bind.

### 10.1 Structure

Every file's text is **server-rendered into the document at load**, whether or not its window is open — inside hidden containers for the closed ones. This is what makes `Ctrl+F` work across the whole site, what makes a screen reader able to read everything without operating a window manager, and what satisfies `R30`: no animation and no interaction gates the availability of any text.

- Each Notepad window is a `role="dialog"` with `aria-labelledby` pointing at its title bar.
- Each file body is a `<pre>` inside `role="document"`, so line structure and column alignment survive into the accessibility tree.
- The desktop is a `role="listbox"` of icons; arrow keys move selection, `Enter` opens, `Home`/`End` jump. This is the real Win95 behaviour and it is also the correct ARIA pattern, which is a rare piece of luck.
- The taskbar is a `role="toolbar"`; task buttons are `aria-pressed` toggles.
- A skip link — `Skip to content`, verbatim from `docs/05 §3.0` — is the first focusable element and jumps to the open `README.TXT` body.

### 10.2 Keyboard

Documented in `Windows Help > Reading this desktop > Keyboard shortcuts`, and functional:

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Cycle desktop → open windows → taskbar → tray |
| `Arrow keys` | Move icon selection on the desktop |
| `Enter` | Open the selected icon |
| `Alt+Tab` | Switch windows, with the authentic centred window-picker overlay |
| `Alt+F4` | Close the focused window |
| `Ctrl+Esc` | Open the Start menu |
| `Ctrl+A`, `Ctrl+C` | Select all / copy, in the focused Notepad |
| `Ctrl+F`, `F3` | Find, find next |
| `Alt+Enter` | Properties of the selected icon |
| `Escape` | Dismiss a menu, a dialog, or the screen saver |

Focus is always visible: the dotted focus rectangle on icons and controls, the `#000080` title bar on the focused window. Focus is trapped inside modal dialogs and released on `Escape`.

### 10.3 No JavaScript, print, and the linear view

All three are the same artifact, and it is the one behind `Restart the computer in MS-DOS mode?` (§4.8): **all nine files concatenated in evidence order, as plain text, in one column.**

- **With JavaScript disabled**, the desktop, taskbar and window manager do not initialise and this view renders instead, with a single line of text at the top explaining it. `R4` and `R30` hold: every word of the claim, the credential sentence, the evidence entries and the address is present in the initial DOM.
- **Printing** any window prints this view from the top of the current file. `R29` holds: text-selectable, links printed with their full URLs, light background forced, no content lost.
- **`prefers-reduced-motion`** keeps the full desktop but removes window-open scaling, menu fades, the Alt+Tab overlay transition, and the screen saver (§8.2). `R35` holds: the reduced path is a real layout, not a zero-duration animation.

---

## 11. What this document does not decide

1. **The window manager's implementation** — drag, resize, z-order, snapping, the cascade algorithm for a second and third window. This document specifies where `README.TXT` opens and nothing else about geometry.
2. **The pixel art itself.** §1.7 specifies the idiom, the palette, the sizes and the copyright constraint. Somebody still has to draw eleven icons.
3. **The shader.** `docs/02 §6` owns it. This document owns the screen saver's registration, its Settings dialog copy, its trigger conditions and its fallbacks.
4. **Anything in `docs/05 §11`.** Seventeen open questions, five of them handled by omission here (§7), none of them fillable by a build agent.
5. **Whether `WRITING` ever appears.** Two real published posts, or the folder stays off the desktop (§1.5).
```