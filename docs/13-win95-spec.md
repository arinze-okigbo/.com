# Windows 95 UI Specification

Reference document for the pixel-accurate Windows 95 desktop rebuild of arinzeokigbo.com.

**Status:** research complete. Every number in sections 1, 2, 4, 5, 6 and 8 was either read
out of a reimplementation of the Win32 drawing code or measured pixel-by-pixel from an
authentic 640×480 8-bit Windows 95 screenshot. Where a value is inferred rather than
measured, it says so.

## 0. Sources and how to trust them

| Source | What it gives us | Confidence |
| --- | --- | --- |
| [ReactOS `win32ss/user/user32/windows/draw.c`](https://github.com/reactos/reactos/blob/master/win32ss/user/user32/windows/draw.c) | The literal `DrawEdge` colour tables (`LTInnerNormal`, `LTOuterNormal`, `RBInnerNormal`, `RBOuterNormal`, `*Soft`) and which edge style each control uses | Primary — a clean-room reimplementation of the Win32 API |
| [ReactOS `controls/scrollbar.c`](https://github.com/reactos/reactos/blob/master/win32ss/user/user32/controls/scrollbar.c), [`windows/defwnd.c`](https://github.com/reactos/reactos/blob/master/win32ss/user/user32/windows/defwnd.c) | Scrollbar thumb edge style and the dithered track brush | Primary |
| [guidebookgallery.org `win95.png`](https://guidebookgallery.org/pics/gui/desktop/full/win95.png) — 640×480, 8-bit, lossless | Every measurement in §4, §5, §6, §8 | Primary — measured directly |
| [98.css](https://github.com/jdan/98.css) (`style.css`, MIT) | Working CSS `box-shadow` encodings of the bevels | Verified against the ReactOS tables — it is correct |
| Classic `HKCU\Control Panel\Desktop\WindowMetrics` defaults ([example](https://github.com/leetftw/SimpleClassicTheme/blob/master/SimpleClassicTheme/Resources/WindowMetrics.reg)) | Caption / menu / scrollbar / icon metrics in twips | Primary |

Two independent checks agreed on every geometric number, so the measurements below are
reliable to the pixel. **Verify anything you change against the screenshot rather than
against another recreation** — most recreations copy each other's mistakes.

---

## 1. The palette

Windows 95 does not have a "brand palette". It has a set of named system colours
(`GetSysColor` / `HKCU\Control Panel\Colors`), and the default scheme is called
**Windows Standard**. These are the ones that matter.

| System colour name | `COLOR_*` constant | Hex | Where it appears |
| --- | --- | --- | --- |
| 3D Objects / Button Face | `COLOR_BTNFACE` / `COLOR_3DFACE` | `#C0C0C0` | All chrome: window bodies, buttons, menu bars, taskbar |
| Button Highlight | `COLOR_BTNHIGHLIGHT` / `COLOR_3DHILIGHT` | `#FFFFFF` | Outermost top/left of a raised button |
| Button Light | `COLOR_3DLIGHT` | `#DFDFDF` | Second top/left pixel of a raised button; outer edge of window frames |
| Button Shadow | `COLOR_BTNSHADOW` / `COLOR_3DSHADOW` | `#808080` | Inner bottom/right; inactive title bars; disabled text |
| Button Dark Shadow | `COLOR_3DDKSHADOW` | `#000000` | Outermost bottom/right |
| Window Frame | `COLOR_WINDOWFRAME` | `#000000` | 1px outline around menus, list boxes, field interiors |
| Window (client) | `COLOR_WINDOW` | `#FFFFFF` | Text field and document backgrounds |
| Window Text | `COLOR_WINDOWTEXT` | `#000000` | Body text |
| Desktop | `COLOR_BACKGROUND` / `COLOR_DESKTOP` | `#008080` | The teal |
| Active Title Bar | `COLOR_ACTIVECAPTION` | `#000080` | **Solid.** See the note below. |
| Gradient Active Title | `COLOR_GRADIENTACTIVECAPTION` | `#1084D0` | Win98+ only |
| Inactive Title Bar | `COLOR_INACTIVECAPTION` | `#808080` | Solid |
| Gradient Inactive Title | `COLOR_GRADIENTINACTIVECAPTION` | `#B5B5B5` | Win98+ only |
| Title Bar Text | `COLOR_CAPTIONTEXT` | `#FFFFFF` | Active caption text, **bold** |
| Inactive Title Text | `COLOR_INACTIVECAPTIONTEXT` | `#C0C0C0` | Measured directly off the Control Panel window |
| Selected Items | `COLOR_HIGHLIGHT` | `#000080` | Menu highlight, selected icon label, text selection |
| Selected Item Text | `COLOR_HIGHLIGHTTEXT` | `#FFFFFF` | |
| Disabled Text | `COLOR_GRAYTEXT` | `#808080` | Plus a `#FFFFFF` emboss offset +1px/+1px |
| Button Text | `COLOR_BTNTEXT` | `#000000` | |
| Menu | `COLOR_MENU` | `#C0C0C0` | |
| Menu Text | `COLOR_MENUTEXT` | `#000000` | |
| ToolTip background | `COLOR_INFOBK` | `#FFFFE1` | |
| ToolTip text | `COLOR_INFOTEXT` | `#000000` | |
| Application Workspace | `COLOR_APPWORKSPACE` | `#808080` | MDI background |
| Scrollbar | `COLOR_SCROLLBAR` | `#C0C0C0` | Only one half of the track — see §4.7 |
| Active / Inactive Border | `COLOR_ACTIVEBORDER` / `COLOR_INACTIVEBORDER` | `#C0C0C0` | |

### CSS custom properties

```css
:root {
  --w95-face:            #C0C0C0;  /* COLOR_3DFACE      */
  --w95-highlight:       #FFFFFF;  /* COLOR_3DHILIGHT   */
  --w95-light:           #DFDFDF;  /* COLOR_3DLIGHT     */
  --w95-shadow:          #808080;  /* COLOR_3DSHADOW    */
  --w95-dark-shadow:     #000000;  /* COLOR_3DDKSHADOW  */
  --w95-frame:           #000000;  /* COLOR_WINDOWFRAME */
  --w95-window:          #FFFFFF;
  --w95-window-text:     #000000;
  --w95-desktop:         #008080;
  --w95-active-title:    #000080;
  --w95-inactive-title:  #808080;
  --w95-title-text:      #FFFFFF;
  --w95-inactive-text:   #C0C0C0;
  --w95-select:          #000080;
  --w95-select-text:     #FFFFFF;
  --w95-gray-text:       #808080;
  --w95-info-bk:         #FFFFE1;
}
```

### The gradient title bar is not Windows 95

**The brief assumed Win95 shipped a gradient title-bar option. It did not.** Windows 95
draws the active caption as a flat `#000080` fill. `COLOR_GRADIENTACTIVECAPTION` (index
27) was introduced in **Windows 98 / Windows 2000**; Microsoft Plus! for Windows 95 added
full-window drag, font smoothing, wallpaper stretching and desktop themes — not gradient
captions. Gradient captions on Win95 existed only as an unofficial `user.exe` file-swap
hack circulating for OSR2.

This was confirmed by measuring an authentic Win95 dialog: the active caption is a single
flat navy value across its entire width, with no horizontal variation.

**Decision for this build:** flat `#000080`. If a gradient is wanted for aesthetics, it is
a Windows 98 quotation, and it should be a deliberate, documented choice rather than an
accident. `linear-gradient(90deg, #000080, #1084D0)` is the Win98 value.

### `#DFDFDF` really is in the Win95 palette

There is a persistent claim that `COLOR_3DLIGHT` equalled `COLOR_3DFACE` on Win95 and that
`#DFDFDF` is a Win98 invention. It is not. `#DFDFDF` was measured as a distinct colour in
the authentic screenshot in three separate places: the second pixel of every caption
button's top edge, the outer pixel of the taskbar's raised top edge, and the inner
bottom/right pixel of every sunken client edge. It is also the registry default
(`ButtonLight = 223 223 223`). Use it.

*(One caveat: in 16-colour VGA mode `#DFDFDF` is not in the palette and collapses to
`#C0C0C0`. Anyone who took a screenshot in 16-colour mode will show you a flatter bevel.
Ignore those.)*

---

## 2. The bevel system

This is the whole game. Get this wrong and nothing else matters.

### 2.1 How Windows actually draws it

Every piece of Win95 chrome comes from one API: `DrawEdge(hdc, rect, edgeType, flags)`.
An "edge" is up to two concentric 1px rings — an **outer** ring and an **inner** ring —
and each ring paints its top+left sides one colour and its bottom+right sides another.
So a full bevel is four colours: `TL-outer`, `TL-inner`, `BR-inner`, `BR-outer`.

`edgeType` is one of `EDGE_RAISED`, `EDGE_SUNKEN`, `EDGE_ETCHED`, `EDGE_BUMP`. The
critical extra is the **`BF_SOFT` flag**, which swaps which ring gets the highlight.
Pushbuttons use `BF_SOFT`; window frames and text fields do not. **This single flag is
why buttons and window frames look different, and it is the thing recreations get
wrong.**

From the ReactOS colour tables:

| Construction | TL outer | TL inner | BR inner | BR outer |
| --- | --- | --- | --- | --- |
| `EDGE_RAISED \| BF_SOFT` — **pushbutton at rest** | `#FFFFFF` | `#DFDFDF` | `#808080` | `#000000` |
| `EDGE_SUNKEN \| BF_SOFT` — **pushbutton pressed** | `#000000` | `#808080` | `#DFDFDF` | `#FFFFFF` |
| `EDGE_RAISED` — **window frame, menu popup, taskbar, scrollbar thumb** | `#DFDFDF` | `#FFFFFF` | `#808080` | `#000000` |
| `EDGE_SUNKEN` — **text field, client edge, group box lower half** | `#808080` | `#000000` | `#DFDFDF` | `#FFFFFF` |

Note the elegant symmetry: pressed is rest reversed; sunken is raised reversed. And note
that the raised *button* leads with white while the raised *window* leads with `#DFDFDF`
and puts white second. That 1px difference is exactly the tell that separates a careful
recreation from a sloppy one.

### 2.2 The CSS encoding

Because CSS `border` cannot vary per-side-per-ring cleanly and `border` participates in
layout, encode bevels as **inset `box-shadow` layers**. Layer order is outer-first;
shadows paint in declaration order with the first on top, so the 1px outer ring is
declared before the 2px inner ring.

```css
:root {
  /* pushbutton — EDGE_RAISED | BF_SOFT */
  --bevel-raised-outer: inset -1px -1px var(--w95-dark-shadow),
                        inset  1px  1px var(--w95-highlight);
  --bevel-raised-inner: inset -2px -2px var(--w95-shadow),
                        inset  2px  2px var(--w95-light);

  /* pushbutton pressed — EDGE_SUNKEN | BF_SOFT */
  --bevel-pressed-outer: inset -1px -1px var(--w95-highlight),
                         inset  1px  1px var(--w95-dark-shadow);
  --bevel-pressed-inner: inset -2px -2px var(--w95-light),
                         inset  2px  2px var(--w95-shadow);

  /* window frame, menu popup, taskbar — EDGE_RAISED (no BF_SOFT) */
  --bevel-window-outer: inset -1px -1px var(--w95-dark-shadow),
                        inset  1px  1px var(--w95-light);
  --bevel-window-inner: inset -2px -2px var(--w95-shadow),
                        inset  2px  2px var(--w95-highlight);

  /* text field, client edge — EDGE_SUNKEN (no BF_SOFT) */
  --bevel-field: inset -1px -1px var(--w95-highlight),
                 inset  1px  1px var(--w95-shadow),
                 inset -2px -2px var(--w95-light),
                 inset  2px  2px var(--w95-dark-shadow);

  /* 1px sunken — status bar panel, system tray well */
  --bevel-status: inset -1px -1px var(--w95-highlight),
                  inset  1px  1px var(--w95-shadow);
}
```

### 2.3 Each control, literally

**Raised button at rest** — the canonical construction:

```css
.w95-button {
  box-sizing: border-box;
  border: none;
  border-radius: 0;
  background: var(--w95-face);
  box-shadow:
    inset -1px -1px #000000,   /* BR outer: 3DDKSHADOW */
    inset  1px  1px #FFFFFF,   /* TL outer: BTNHIGHLIGHT */
    inset -2px -2px #808080,   /* BR inner: BTNSHADOW */
    inset  2px  2px #DFDFDF;   /* TL inner: 3DLIGHT */
  min-width: 75px;
  min-height: 23px;
  padding: 0 12px;
  font: 11px "Pixelated MS Sans Serif", "MS Sans Serif", Tahoma, sans-serif;
  color: #000000;
}
```

**That same button pressed** — bevel reversed, **and the label shifts 1px down and right**.
The label shift is not decorative; without it the press does not read.

```css
.w95-button:active:not(:disabled) {
  box-shadow:
    inset -1px -1px #FFFFFF,
    inset  1px  1px #000000,
    inset -2px -2px #DFDFDF,
    inset  2px  2px #808080;
  padding: 1px 11px 0 13px;   /* or translate the label 1px/1px */
}
```

**Default button** (the one Enter activates) carries an *extra* 1px `#000000` ring outside
the normal bevel, so it is 2px larger on each side. Measured directly on a real Win95
dialog's OK button.

```css
.w95-button.is-default {
  box-shadow:
    inset -2px -2px #000000, inset 1px 1px #000000,      /* black ring */
    inset  2px  2px #FFFFFF,
    inset -3px -3px #808080, inset 3px 3px #DFDFDF;
}
```

**Sunken text field** — note this is `EDGE_SUNKEN` *without* `BF_SOFT`, so the outermost
top/left pixel is `#808080` and the black sits *inside* it:

```css
.w95-field {
  background: #FFFFFF;
  color: #000000;
  border: none;
  border-radius: 0;
  padding: 3px 4px;
  box-shadow:
    inset -1px -1px #FFFFFF,
    inset  1px  1px #808080,
    inset -2px -2px #DFDFDF,
    inset  2px  2px #000000;
}
```

**Window frame** — 4px total on every side: a 2px `EDGE_RAISED` bevel plus 2px of flat
face that is the resize gutter. Measured: window outer edge at x, `#DFDFDF` at x,
`#FFFFFF` at x+1, `#C0C0C0` at x+2 and x+3, title bar begins at x+4.

```css
.w95-window {
  background: var(--w95-face);
  padding: 3px;                 /* 1px face + the 2px bevel = the 4px frame */
  box-shadow:
    inset -1px -1px #000000,
    inset  1px  1px #DFDFDF,
    inset -2px -2px #808080,
    inset  2px  2px #FFFFFF;
}
```

A non-resizable dialog uses a 3px frame instead (`SM_CXDLGFRAME`): the same 2px bevel plus
1px of face, with no resize gutter.

**Group box** (`fieldset`) — an `EDGE_ETCHED` rectangle, which is 2px: `#808080` on the
outside of the top/left, `#FFFFFF` on the inside; and `#FFFFFF` outside the bottom/right,
`#808080` inside. In effect, a 1px grey line with a 1px white line offset down-right all
the way around. The legend sits on the top line with the line broken behind it.

```css
.w95-groupbox {
  border: none;
  box-shadow:
    inset  1px  1px #808080, inset -1px -1px #FFFFFF,
    inset  2px  2px #FFFFFF, inset -2px -2px #808080;
  padding: 10px;
  position: relative;
}
.w95-groupbox > legend { background: var(--w95-face); padding: 0 4px; }
```

**Status bar** — each panel is a **1px** sunken well, not the 2px field bevel. Measured on
the system-tray well: `#808080` on top/left, `#FFFFFF` on bottom/right, nothing else.

```css
.w95-statusbar { display: flex; gap: 2px; margin: 0 1px; }
.w95-statusbar-panel {
  box-shadow: inset 1px 1px #808080, inset -1px -1px #FFFFFF;
  padding: 2px 4px;
}
```

*(98.css uses `#DFDFDF` rather than `#FFFFFF` for the bottom/right here. The measurement
says `#FFFFFF`. Use `#FFFFFF`.)*

**Menu bar** — **flat**. No bevel at all. It is a plain `#C0C0C0` strip that is part of the
window's non-client area. Items get no border until they are open, at which point the item
rectangle fills solid `#000080` with `#FFFFFF` text. There is no hover bevel in Win95 — the
raised-on-hover menu item is a Windows 98 / IE4 toolbar idiom.

```css
.w95-menubar { background: var(--w95-face); height: 19px; display: flex; align-items: center; }
.w95-menubar-item { padding: 0 8px; height: 18px; line-height: 18px; }
.w95-menubar-item[aria-expanded="true"] { background: #000080; color: #FFFFFF; }
```

---

## 3. Typography

### 3.1 The actual fonts

| Role | Font | Size | Notes |
| --- | --- | --- | --- |
| Title bar caption | MS Sans Serif **Bold** | 8pt = **11px** | Bold is not optional; it is the system caption font |
| Menu bar and menu items | MS Sans Serif | 8pt = **11px** | |
| Dialog / button / label text | MS Sans Serif | 8pt = **11px** | |
| Desktop icon labels | MS Sans Serif | 8pt = **11px** | |
| Status bar | MS Sans Serif | 8pt = **11px** | |
| Notepad / DOS box / editors | **Fixedsys** | 9pt, 8px advance | Monospace bitmap |

**Everything in the Win95 shell is MS Sans Serif 8pt.** At the era-standard 96 dpi that is
exactly 11 pixels of em size, with an 13px line box. There is no type scale. There is no
secondary size. Resisting the urge to introduce one is most of the discipline here.

### 3.2 Win95 text did not scale

MS Sans Serif is a **bitmap** (raster) font. It shipped as a set of fixed-size strikes —
8, 10, 12, 14, 18 and 24 point at 96 dpi — and Windows selected the nearest strike rather
than scaling. Request 8pt and you get an exact, hand-drawn 11px bitmap. Request 9pt and
you get the 8pt bitmap, not a 9pt one. Nothing was interpolated and nothing was
antialiased. (Microsoft Plus! added optional antialiasing, and even then only for large
sizes.)

Practical consequence: **the recreation must use one size and must not scale with the
viewport.** No `rem`, no `clamp()`, no fluid type. `font-size: 11px` and nothing else.
Users can still zoom the whole page, which scales everything together and is fine.

### 3.3 Web substitutes

Ranked:

1. **"Pixelated MS Sans Serif"** — the strike from the real font converted to WOFF/WOFF2,
   shipped in [98.css](https://github.com/jdan/98.css/tree/main/fonts) under MIT. Renders
   1:1 at `font-size: 11px`. Normal and bold weights. **This is the recommendation.**
2. **W95FA** — an OpenType recreation of the MS Sans Serif bitmap by FontsArena, SIL Open
   Font License, `.otf` + `.woff` + `.woff2`. Slightly freer interpretation; good fallback
   and it covers more glyphs.
3. **Microsoft Sans Serif** → `Tahoma` → `Verdana` → `sans-serif` as the system fallback
   chain. These are outline fonts and will antialias, so they are a graceful degradation
   rather than a substitute.

For Fixedsys: **Fixedsys Excelsior 3.01** (public domain), which renders 1:1 **only at
`font-size: 16px`** with antialiasing off — 8px advance, 16px line height. Multiples
(32px, 48px) also land on-grid. Any other size destroys it.

```css
@font-face {
  font-family: "Pixelated MS Sans Serif";
  src: url("/fonts/ms_sans_serif.woff2") format("woff2"),
       url("/fonts/ms_sans_serif.woff")  format("woff");
  font-weight: normal; font-style: normal; font-display: block;
}
@font-face {
  font-family: "Pixelated MS Sans Serif";
  src: url("/fonts/ms_sans_serif_bold.woff2") format("woff2"),
       url("/fonts/ms_sans_serif_bold.woff")  format("woff");
  font-weight: bold; font-style: normal; font-display: block;
}
```

Use `font-display: block`, not `swap`. A fallback flash in an outline font at 11px looks
broken, and the fonts are a few kilobytes.

### 3.4 Killing antialiasing

```css
.w95 {
  font-family: "Pixelated MS Sans Serif", "MS Sans Serif", Tahoma, sans-serif;
  font-size: 11px;
  line-height: 13px;
  -webkit-font-smoothing: none;      /* Chromium, Safari */
  -moz-osx-font-smoothing: grayscale; /* best available on macOS Firefox */
  font-smooth: never;                 /* legacy/spec-ish; harmless */
  text-rendering: geometricPrecision; /* disables ligature/kern substitution */
}
```

Caveats worth knowing before you promise pixel perfection:

- `-webkit-font-smoothing: none` genuinely disables antialiasing in Chromium and Safari.
  **Firefox has no equivalent** and will always render with some smoothing. Firefox users
  get a very slightly soft render. That is acceptable and unavoidable.
- On a HiDPI display the browser renders at 2× and the bitmap outlines land on the device
  grid cleanly, so pixel fonts look *better* on Retina, not worse. Do not try to correct
  for it.
- For raster assets (icons, glyph sprites) use `image-rendering: pixelated;`. Do **not**
  put `image-rendering` on text — it does nothing there.
- Never apply a non-integer `transform: scale()` or a fractional `translate` to anything
  containing text. That is what actually destroys the crispness, far more than font
  settings do.

---

## 4. Window chrome anatomy

All measurements below were taken from the Control Panel window in the reference
screenshot, then cross-checked against a second authentic Win95 dialog.

### 4.1 The frame

| Metric | Value | Registry / API |
| --- | --- | --- |
| Resizable window frame | **4px** per side | `SM_CXFRAME` / `SM_CYFRAME` |
| — composition | 1px `#DFDFDF`, 1px `#FFFFFF`, 2px `#C0C0C0` (top/left)<br>2px `#C0C0C0`, 1px `#808080`, 1px `#000000` (bottom/right) | `EDGE_RAISED` + gutter |
| Fixed dialog frame | **3px** per side | `SM_CXDLGFRAME` |
| Thin border | 1px | `SM_CXBORDER`, `BorderWidth = -15` twips |
| Title bar height | **18px** | `CaptionHeight = -270` twips |
| Menu bar height | **19px** (18px band + 1px) | `MenuHeight = -270` twips |
| Scrollbar width/height | **16px** | `ScrollWidth/Height = -240` twips |
| Small caption (tool windows) | 12–16px | `SmCaptionHeight` |

`GetSystemMetrics(SM_CYCAPTION)` reports **19** on Win95 — the 18px caption plus the 1px
rule that separates it from the client area. When laying out in CSS, draw an 18px title
bar.

### 4.2 Title bar

Left to right inside the 18px band, which itself begins 4px in from the window's outer
edge:

1. **Window icon**, 16×16, at 1–2px from the left edge, vertically centred (1px above and
   below). Double-clicking it closes the window; single-clicking opens the system menu.
2. **Caption text**, MS Sans Serif **bold** 11px, `#FFFFFF` when active / `#C0C0C0` when
   inactive, vertically centred, ~2px after the icon. Ellipsised, never wrapped.
3. **Flexible gap.**
4. **`_ □ ×` buttons**, right-aligned, each **16×14**, with **2px of title bar above and
   below them** and **2px between the title bar's right edge and the close button**.

**Button order and spacing (measured, exact):** minimize and maximize are **flush against
each other with zero gap**; there is then a **2px navy gap**; then close. So the run is
`[16][16][2 gap][16][2 margin][frame]`. That 2px gap before close is a deliberate
mis-click guard and it is one of the most commonly missed details.

Each caption button carries the standard `EDGE_RAISED | BF_SOFT` pushbutton bevel — 1px
`#FFFFFF` top/left, 1px `#DFDFDF` inside it, 1px `#808080`, 1px `#000000` bottom/right.
Pressed, they take the reversed bevel; they do **not** get a focus rectangle.

### 4.3 Caption glyph construction

All glyphs are pure `#000000` on the `#C0C0C0` button face. Inner (post-bevel) drawing
area of a 16×14 button is 12×10.

**Minimize** — a `6 × 2` filled bar, positioned at the **bottom-left** of the inner area:
2px in from the inner left edge, 2px up from the inner bottom edge. It is *not* centred.

```
............
............
............
............
............
............
............
..######....
..######....
............
```

**Maximize** — a `9 × 9` open rectangle whose **top edge is 2px thick** (representing a
title bar) and whose left, right and bottom edges are 1px. Positioned 1px in from the
inner left, 1px down from the inner top.

```
#########
#########
#.......#
#.......#
#.......#
#.......#
#.......#
#.......#
#########
```

**Restore** — two overlapping maximize boxes: a `7×7` box offset up-and-right and a `7×7`
box offset down-and-left, the rear one occluded by the front.

**Close** — an `8 × 7` X built from **2px-thick diagonals**, not a 1px cross:

```
##....##
.##..##.
..####..
...##...
..####..
.##..##.
##....##
```

Getting this X wrong — drawing a thin 1px X, or a font glyph `×`, or a Unicode multiply
sign — is the single most visible tell in the whole title bar. Draw it as an inline SVG
with `shape-rendering: crispEdges`, or as a CSS box-shadow sprite, or as a 1× PNG with
`image-rendering: pixelated`.

### 4.4 Menu bar

- Height **19px**, flat `#C0C0C0`, no bevel, no separating rule below it.
- Items: text at 11px, **8px horizontal padding** each side, full-height hit target.
- Open item: the whole item rectangle fills `#000080`, text turns `#FFFFFF`.
- Accelerator letters are underlined with a 1px `#000000` rule directly under the glyph.
  In real Win95 the underlines were **always visible**; hiding them until Alt is pressed
  is a Windows 2000 behaviour.
- Disabled items: `#808080` text with a `#FFFFFF` emboss at +1px/+1px.

### 4.5 Dropdown menus (popups)

- Popup body: `#C0C0C0` with the **window** bevel (`#DFDFDF`/`#FFFFFF` top-left,
  `#808080`/`#000000` bottom-right), plus 1px of internal padding.
- Item height **~18–20px** for a standard 16×16-icon menu.
- Left gutter ~20px reserved for the icon / checkmark column.
- Hover/selected: the item rectangle fills solid `#000080` with `#FFFFFF` text. **Square
  corners, full item width, no inset, no rounding, no transition.**
- Separator: a 1px `#808080` line with a 1px `#FFFFFF` line directly beneath it (etched),
  spanning the full item width, with a couple of px of padding above and below.
- Submenu arrow: a solid black right-pointing triangle, ~4px wide × 7px tall, right-aligned.
- Accelerator text (`Ctrl+S`) is right-aligned in the same row.

### 4.6 Client area

The client area is inset from the frame. If the content is a document surface (list view,
text editor), it carries the `EDGE_SUNKEN` client edge (`WS_EX_CLIENTEDGE`) — a 2px sunken
bevel: `#808080` then `#000000` on top/left, `#DFDFDF` then `#FFFFFF` on bottom/right.
Measured: this sits 1px inside the menu bar's bottom.

### 4.7 Scrollbars

- Width (vertical) / height (horizontal): **16px**.
- Arrow buttons: **16×16** at each end, carrying the pushbutton bevel
  (`EDGE_RAISED | BF_SOFT`), with a solid `#000000` triangle glyph roughly 7px wide × 4px
  tall, centred.
- Thumb: uses the **window** bevel (`EDGE_RAISED` without `BF_SOFT` — `#DFDFDF` then
  `#FFFFFF` top/left). Minimum length is the scrollbar width (16px); below that Windows
  clamps it and further shrinking stops.
- **Track: a 1px checkerboard of `#C0C0C0` and `#FFFFFF`** — a 50% dither, not a flat
  fill. (`DefWndControlColor` sets the text colour to `COLOR_3DFACE` and the background to
  `COLOR_3DHILIGHT` and paints with the `0x55AA` pattern brush.) **This is the number one
  thing recreations get wrong.** A flat `#C0C0C0` or `#DFDFDF` track instantly reads as
  fake.
- Clicking the track pages; **holding the track paints it solid black** (`BLACKNESS` raster
  op) for the duration of the press. Niche, but delightful.

```css
.w95-scroll-track {
  background-color: #C0C0C0;
  background-image:
    linear-gradient(45deg,  #FFFFFF 25%, transparent 25%, transparent 75%, #FFFFFF 75%),
    linear-gradient(45deg,  #FFFFFF 25%, transparent 25%, transparent 75%, #FFFFFF 75%);
  background-size: 2px 2px;
  background-position: 0 0, 1px 1px;
}
```

A 2×2 base64 PNG with `image-rendering: pixelated` and `background-repeat: repeat` is more
reliable across browsers than the gradient trick and is what should ship.

- Corner box where a vertical and horizontal scrollbar meet: flat `#C0C0C0`, no bevel
  (unless the window is resizable, in which case it holds the size grip).

---

## 5. The taskbar

All values measured from the reference screenshot at 640×480.

| Element | Measurement |
| --- | --- |
| Taskbar total height | **28px** |
| Top edge | 2px `EDGE_RAISED`: row 0 `#DFDFDF`, row 1 `#FFFFFF` |
| Body | `#C0C0C0` |
| Start button | **54 × 22** |
| Start button position | x = 2px from the left edge; y = 4px from the taskbar top (2px below the raised edge), leaving 2px below |
| Task button height | **22px**, same y band as the Start button |
| Task button max width | **160px** |
| Gap between task buttons | **3px** |
| First task button x | 60px (Start button ends at 55, then a 4px gutter) |
| System tray well | **22px tall**, sunken **1px**: `#808080` top/left, `#FFFFFF` bottom/right |
| Tray well y | 4px from taskbar top, 2px from bottom — same band as the buttons |
| Tray well right margin | 2px from the taskbar's right edge |
| Clock well width (measured) | 63px for `1:47 PM` |

### Start button

- Two states only: **raised** (pushbutton bevel) and **pressed/latched** (sunken bevel)
  while the Start menu is open. There is no hover state.
- When latched, it *also* carries a **1px dotted `#000000` focus rectangle** inset 3px
  from the button's outer edge. Measured directly.
- Contents: the 16×16 four-colour Windows flag, then ~2px, then the word **`Start`** in
  MS Sans Serif **bold** 11px.
- Pressed, the icon and label shift 1px down and right like any other button.

### Task buttons

- Pushbutton bevel raised; the button for the foreground window is drawn **pressed** —
  sunken bevel, contents shifted 1px, **and the face filled with the `0x55AA` checkerboard
  of `#C0C0C0`/`#FFFFFF`** (the `DFCS_CHECKED` pattern). Most recreations use a plain
  sunken bevel and lose the texture.
- 16×16 icon, ~4px left padding, ~2px gap, then the window title at 11px, left-aligned,
  clipped with an ellipsis.
- **Width behaviour:** buttons share the available strip equally, capped at **160px** each.
  As windows are added they shrink in lockstep. Below roughly 38px they stop shrinking and
  Win95 simply lets the leftover overflow (Win95 has no taskbar grouping and no scroll
  arrows — those are XP and Win98 respectively).

### The clock

- Format is the locale **short time**: `h:mm AM/PM` in en-US. **No seconds. No date.**
- Right-aligned inside the tray well with ~4px padding, 11px MS Sans Serif, `#000000`.
- Hovering shows a tooltip with the full date (`Monday, September 11, 2026`).
- Tray icons (16×16) sit to the left of the clock inside the same well, ~2px apart.

```css
.w95-taskbar {
  position: fixed; inset: auto 0 0 0;
  height: 28px;
  background: var(--w95-face);
  box-shadow: inset 0 1px #DFDFDF, inset 0 2px #FFFFFF; /* only the top edge is bevelled */
  display: flex; align-items: center; gap: 4px;
  padding: 2px;
}
```

Note the taskbar is bevelled on its **top edge only** — the other three sides are against
the screen edges. Applying a full four-sided bevel is a common error.

---

## 6. The Start menu

Measured from the reference screenshot, which has the menu open with a cascade showing.

| Element | Measurement |
| --- | --- |
| Panel bevel | Window bevel: `#DFDFDF`/`#FFFFFF` top-left, `#808080`/`#000000` bottom-right |
| Panel body | `#C0C0C0` |
| Panel width (default items) | 166px |
| Banner stripe width | **21px**, starting 3px in from the panel's outer edge |
| Banner colour | **Solid `#808080`** |
| Banner text | `Windows 95` rotated 90° CCW, reading **bottom-to-top** |
| Banner text colour | `#C0C0C0` body with a `#FFFFFF` highlight edge (an embossed/3D look) |
| Top-level item height | **32px** (large 32×32 icons) |
| Cascade submenu item height | **20px** (16×16 icons) |
| Highlight | Solid `#000080`, `#FFFFFF` text, full item width, square |
| Separator | 1px `#808080` + 1px `#FFFFFF` directly below (etched), full width, ~2px padding above |
| Panel sits | Flush to the left screen edge, bottom overlapping the taskbar's top bevel by ~4px |

### Banner details

The Win95 banner is **flat `#808080`**, not a gradient. The gradient banner
(`#000080` → lighter, or the blue-to-black fade) is Windows NT 4 and Windows 98. The text
is embossed rather than plain white: a `#C0C0C0` body with `#FFFFFF` catching the
top-left, which is why it reads as engraved into the grey.

```css
.w95-start-banner {
  width: 21px;
  background: #808080;
  writing-mode: vertical-rl;
  transform: rotate(180deg);   /* reads bottom-to-top */
  font: bold 16px "Pixelated MS Sans Serif", sans-serif;
  color: #C0C0C0;
  text-shadow: -1px -1px 0 #FFFFFF;
  display: flex; align-items: flex-start; justify-content: center;
  padding-block: 6px;
}
```

### Item behaviour

- Top-level items (`Programs`, `Documents`, `Settings`, `Find`, `Help`, `Run…`,
  `Shut Down…`) use **32×32** icons and a 32px row. Only one separator in the default
  menu: between `Run…` and `Shut Down…`.
- Cascades use **16×16** icons and 20px rows.
- Hover is **immediate** — no delay, no animation. The navy bar snaps.
- A submenu opens on hover after a short dwell (~400ms in Win95's `SPI_GETMENUSHOWDELAY`
  lineage; Win95 itself opened essentially instantly on the Start menu) and **stays open
  while the pointer is anywhere in the chain**. It closes when the pointer enters a
  *different* item in the parent menu.
- Submenus open to the right, top-aligned with the parent item, and **flip to the left**
  if they would overflow the screen. They are also clamped vertically to stay on screen —
  in the reference screenshot the cascade's top is clamped to the parent panel's top.
- Ellipsis (`…`) suffix means "opens a dialog". Triangle suffix means "has a submenu".
  Both conventions are worth honouring.
- The whole menu dismisses on Escape, on click-outside, and on choosing an item. There is
  no fade.

---

## 7. Notepad

`notepad.exe` in Windows 95 is about as simple as a Windows program gets, which is what
makes it the right container for a section of writing.

**Menus:** exactly four — **`File`  `Edit`  `Search`  `Help`**.

- `File`: New, Open…, Save, Save As…, Page Setup…, Print, ——, Exit
- `Edit`: Undo, ——, Cut, Copy, Paste, Delete, ——, Select All, Time/Date, ——, Word Wrap
- `Search`: Find…, Find Next
- `Help`: Help Topics, ——, About Notepad

`Search` becoming `Format`/`View` and the arrival of a status bar are **Windows 2000**
changes. A Win95 Notepad has **no toolbar, no status bar, and no line-number readout.**

**Client area:** a plain `#FFFFFF` edit control filling the window below the menu bar,
with the `EDGE_SUNKEN` client edge (2px: `#808080`/`#000000` top-left,
`#DFDFDF`/`#FFFFFF` bottom-right). Text starts at roughly **1px inset from the client
edge** — Notepad has essentially **no margin**; the first character sits almost against
the frame. Print margins are a separate thing (File ▸ Page Setup, default 0.75"/1") and do
not affect the on-screen view.

**Font:** **Fixedsys**, 9pt. In Windows 95 this is **not user-changeable** — the font
picker did not arrive until Windows NT/2000. Fixedsys is monospace: 8px advance, 15px
glyph cell.

Substitute: **Fixedsys Excelsior 3.01** at exactly `font-size: 16px`, `line-height: 16px`,
antialiasing off. Fallback chain `"Fixedsys Excelsior 3.01", "Fixedsys", "Courier New", monospace`.

**Word wrap: OFF by default.** This is the correct and slightly awkward truth. With wrap
off, long lines run past the right edge and Notepad shows a **horizontal scrollbar**; the
vertical scrollbar is always present. Turning wrap on (Edit ▸ Word Wrap) removes the
horizontal scrollbar and disables Search.

For a website whose Notepad windows hold prose, shipping with wrap **on** is the sane
deviation — an unwrapped essay is unreadable. Keep the `Edit ▸ Word Wrap` item, keep it
checked, and let people uncheck it. That preserves the honesty of the model while not
punishing the reader.

**Caret:** a 1px `#000000` vertical bar, blinking at the system rate (~530ms). Not a block.

**Selection:** `#000080` background, `#FFFFFF` text.

```css
.w95-notepad-body {
  background: #FFFFFF;
  box-shadow:
    inset -1px -1px #FFFFFF, inset 1px 1px #808080,
    inset -2px -2px #DFDFDF, inset 2px 2px #000000;
  padding: 1px;
  overflow: auto;
}
.w95-notepad-text {
  font: 16px/16px "Fixedsys Excelsior 3.01", "Fixedsys", "Courier New", monospace;
  -webkit-font-smoothing: none;
  color: #000000;
  white-space: pre-wrap;   /* word-wrap ON — the deliberate deviation */
  padding: 0 1px;
}
::selection { background: #000080; color: #FFFFFF; }
```

---

## 8. Desktop icons

| Element | Measurement |
| --- | --- |
| Icon bitmap | **32 × 32** (`Shell Icon Size = 32`) |
| Grid cell | **75 × 75** (`IconSpacing` / `IconVerticalSpacing` = `-1125` twips) |
| Icon position in cell | Horizontally centred, near the top |
| Gap between icon bottom and label text | ~6px (measured: icon rows 2–33, label text rows 40–50) |
| Label font | MS Sans Serif 11px |
| Label colour | **`#FFFFFF`** |
| Label background (unselected) | **The desktop colour, opaque** — `#008080` |
| Label max width | ~64px, wrapping to **2 lines**, then ellipsised |
| Label alignment | Centred |

### There is no drop shadow

**Windows 95 desktop icon labels have no text shadow.** The label is white text painted on
an opaque rectangle filled with the desktop colour. The soft drop shadow everyone
remembers ("Use drop shadows for icon labels on the desktop") is a **Windows 2000 / XP**
feature. This was confirmed by counting pixels: the `My Computer` label region contains
`#008080` and `#FFFFFF` and nothing else — zero black pixels.

If you add `text-shadow: 1px 1px 0 #000` you have built a Windows XP desktop.

### Selected state

Three things change simultaneously:

1. The **label background** fills solid `#000080` (`COLOR_HIGHLIGHT`), text stays `#FFFFFF`.
2. The **icon bitmap** is blended 50% toward `#000080` — a dither/checkerboard blend of the
   icon's own pixels with navy, not a flat tint and not an opacity change.
3. A **1px dotted `#000000` focus rectangle** is drawn tight around the label rectangle
   (not around the icon) when the item has keyboard focus.

```css
.w95-icon { width: 75px; height: 75px; text-align: center; user-select: none; }
.w95-icon img { width: 32px; height: 32px; image-rendering: pixelated; margin-top: 2px; }
.w95-icon-label {
  display: inline-block;
  max-width: 64px;
  margin-top: 4px;
  padding: 1px 2px;
  font: 11px/13px "Pixelated MS Sans Serif", sans-serif;
  color: #FFFFFF;
  background: var(--w95-desktop);
  overflow-wrap: break-word;
}
.w95-icon[aria-selected="true"] .w95-icon-label { background: #000080; }
.w95-icon:focus-visible .w95-icon-label { outline: 1px dotted #000000; outline-offset: 0; }
```

### Selection rectangle (marquee)

Dragging on empty desktop draws a **1px dotted `#000000` XOR rectangle**. It is not filled,
not translucent, and not blue. The translucent blue marquee is Windows XP.

### Icon layout

Icons fill **column-first** (top to bottom, then wrap to a new column on the right), which
is the opposite of how a CSS grid defaults. Use `grid-auto-flow: column` with an explicit
row count, or absolute positioning on the 75px lattice.

---

## 9. Interaction behaviours

Marked **[95]** for authentic, **[LATER]** for things that feel Win95 but are not.

| Behaviour | Era | Notes |
| --- | --- | --- |
| **Double-click** an icon to open | **[95]** | Default double-click time 500ms; second click must land within a 4×4px slop rectangle. Single-click-to-open was the IE4 "Web view" option (1997). |
| **Single-click** selects | **[95]** | Click selects, click-outside deselects, Ctrl+click multi-selects, Shift+click range-selects. |
| **Drag by title bar** | **[95]** | But by default Win95 dragged a **1px dotted XOR outline**, not the live window. Full-window drag shipped with **Microsoft Plus!**, so it is an accessory, not the base. Live drag is the right choice for the web; the outline drag is a fun optional easter egg. |
| **Focus/blur caption colour** | **[95]** | Active `#000080` + `#FFFFFF` bold text; inactive `#808080` + `#C0C0C0` text. The bevel does **not** change. |
| **Z-order stacking** | **[95]** | Click anywhere in a window raises it. No animation. Windows are strictly stacked; there is no always-on-top except for the taskbar and `WS_EX_TOPMOST` windows. |
| **Minimise to taskbar** | **[95]** | Win95 drew an "unfolding rectangles" zoom animation between the window and its taskbar button (`SPI_SETANIMATION` / "Window animation" in Plus!). The window is not destroyed; its task button remains, un-pressed. |
| **Maximise** | **[95]** | Fills the work area — the screen minus the taskbar — not the screen. The maximize button swaps to the **restore** glyph. The window frame's 4px border is retained but sits off-screen. |
| **Double-click title bar** = maximise/restore | **[95]** | |
| **Right-click context menus** | **[95]** | This was one of Win95's headline features. Desktop, icons, taskbar and title bars all have them. Menus open with their top-left at the cursor, flipping when near a screen edge. |
| **Dotted keyboard focus rectangle** | **[95]** | 1px dotted `#000000`, inset ~3–4px inside a button, or tight around a label elsewhere. Drawn with `DrawFocusRect` in XOR, so it inverts whatever is under it. |
| **Alt+F4** closes, **Alt+Tab** switches | **[95]** | Alt+Tab's task-switcher overlay (the box of icons) is Win95. |
| **Alt** reveals accelerator underlines | **[LATER]** | Win95 showed them permanently. Hide-until-Alt is Windows 2000. |
| Resize by dragging the 4px frame | **[95]** | Corners ~16px² give diagonal resize; edges give single-axis. Cursor changes to the eight resize arrows. |
| Window snapping / Aero snap | **[LATER]** | Windows 7. Absolutely not. |
| Drop shadows under windows | **[LATER]** | Windows XP. Win95 windows have **hard edges and no shadow**. |
| Rounded corners | **[LATER]** | Everything in Win95 is `border-radius: 0`. |
| Animated transitions on hover | **[LATER]** | Win95 state changes are instantaneous. `transition: none` everywhere. |
| Menu fade/slide | **[LATER]** | `SPI_SETMENUANIMATION` is Win98. Win95 menus appear instantly. |

### Non-negotiable global rules

```css
.w95 *, .w95 *::before, .w95 *::after {
  border-radius: 0 !important;
  transition: none !important;
  box-shadow: none;              /* then re-add bevels explicitly */
}
```

The `transition: none` is the single highest-value line in the whole stylesheet. Nothing
gives a retro recreation away faster than a 150ms ease on a bevel.

---

## 10. Sound and boot

**What existed:**

- `The Microsoft Sound` — the ~6-second startup chime composed by Brian Eno, played once at
  logon completion.
- System event sounds: `ding.wav` (default beep / error), `chord.wav` (exclamation),
  `chimes.wav` (asterisk/information), `tada.wav` (often set to program-open),
  `notify.wav`, `recycle.wav`, and the Open/Close Program whooshes.
- A boot splash: the Windows 95 logo with the "It's here" cloud on a black field, and an
  animated blue/red progress bar scrolling along the bottom.
- Shutdown: the orange "It is now safe to turn off your computer" screen.

**What this site should do:**

> **Autoplaying audio on a website is hostile.** It is also blocked by every modern browser
> without a user gesture, so it would not work even if it were acceptable.

Recommendation:

1. **Sound is off by default.** No exceptions, including the startup chime.
2. Offer it as an explicit, obvious opt-in — a speaker icon in the system tray is the
   perfect place, because it is both authentic and discoverable. Clicking it toggles a
   persisted `localStorage` preference.
3. Once opted in, keep it to the small, meaningful set: window open, window close, error
   dialog, and the startup chime on the *next* visit. Nothing on hover, nothing on scroll.
4. Respect `prefers-reduced-motion` as a proxy signal for "this person does not want
   surprises" and keep audio off when it is set.
5. The boot splash is a **loading screen**, and a loading screen that delays real content
   is a cost paid by every visitor. If it appears at all it should be time-boxed to well
   under a second, skippable on any keypress or click, shown once per session, and never
   shown to `prefers-reduced-motion` users. An animated progress bar that fakes work is
   the kind of joke that stops being funny on the second visit.

---

## 11. What people always get wrong

The tells. In rough order of how badly each one gives the game away.

1. **Flat scrollbar tracks.** The Win95 track is a 1px `#C0C0C0`/`#FFFFFF` checkerboard.
   Almost every recreation paints it flat grey. It is the fastest way to spot a fake, and
   it is trivially easy to fix.

2. **A gradient title bar on a "Windows 95" page.** Windows 95 captions are flat `#000080`.
   The `#000080 → #1084D0` gradient is Windows 98. Half the Win95 tributes on the internet
   are actually Win98 tributes.

3. **Rounded corners and transitions.** Any `border-radius` above 0, any `transition`, any
   `ease-out` on a hover state. Win95 has zero of each. A 100ms fade on a button press is
   instantly, viscerally wrong even to people who cannot say why.

4. **Wrong bevel order — using the same bevel for buttons and window frames.** A raised
   *button* leads with `#FFFFFF` then `#DFDFDF`. A raised *window* leads with `#DFDFDF`
   then `#FFFFFF`. This is the `BF_SOFT` flag, and recreations that use a single "raised"
   mixin for everything get one of the two wrong 100% of the time.

5. **A 1px close X, or a text `×`.** The real glyph is an 8×7 X with **2px-thick**
   diagonals. A thin X, a Unicode `✕`, or a font-rendered `x` all read as modern.

6. **No 2px gap before the close button.** Minimize and maximize are flush; close is
   separated by 2px. Evenly spacing all three is very common and very visible.

7. **Drop-shadowed desktop icon labels.** White text with a soft black shadow is Windows
   XP. Win95 paints white text on an opaque desktop-coloured rectangle, no shadow.

8. **Antialiased type.** Rendering MS Sans Serif as Arial/Helvetica/Tahoma at 12px with
   smoothing on. The whole look depends on hard-edged 11px bitmaps.

9. **A type scale.** Introducing 14px headings, 16px body, letter-spacing, a second
   typeface. The Win95 shell is *one font at one size*. The monotony is the point.

10. **Rounded or inset menu highlights.** Win95 menu selection is a hard-edged, full-width,
    solid `#000080` bar. Recreations reach for a rounded, inset, pale-blue pill because
    that is what modern UI does.

11. **The wrong grey.** `#C0C0C0` is not `#CCCCCC`, not `#D4D0C8` (that is the Windows 2000
    "Windows Standard" face), and not `#BFBFBF`. Windows 2000/XP-classic chrome is
    `#D4D0C8` — warmer and lighter. If your greys look beige, you built Windows 2000.

12. **Window drop shadows.** Win95 windows sit on the desktop with hard edges. A
    `box-shadow: 0 4px 12px rgba(0,0,0,.3)` under a window is a 2007 idiom.

13. **Hover states on menu bar items.** Win95 menu bar items do nothing on hover; they only
    highlight when *open*. The raised-bevel-on-hover toolbar button is IE4/Win98.

14. **A too-tall taskbar and a too-big Start button.** 28px and 54×22. Recreations usually
    inflate both to 40px+ because it feels more clickable — and it does, which is a real
    tension, addressed in §12.

15. **Full four-sided bevel on the taskbar.** Only the top edge is bevelled.

16. **Fractional scaling.** Any `transform: scale(1.05)`, any `zoom`, any `vw`-based sizing
    that lands on a half pixel. Everything must sit on integer pixels or the bitmaps smear.

17. **Hiding accelerator underlines until Alt is pressed.** Win95 always showed them.

18. **The wrong inactive title text.** `#C0C0C0` on `#808080`, not white on grey. (Note this
    is also the worst contrast ratio in the entire OS — see §12.)

19. **Pressed task buttons without the checkerboard.** The foreground window's task button
    is `DFCS_CHECKED`: sunken **and** filled with the `#C0C0C0`/`#FFFFFF` dither.

20. **Forgetting the 1px content shift on button press.** The bevel flips but the label
    stays put. Real Win95 nudges the label 1px down and right.

---

## 12. Accessibility

Windows 95 predates WCAG entirely — WCAG 1.0 is 1999, four years later. A literal
reproduction fails AA in several specific, identifiable places. The good news is that
almost all of them can be fixed without touching a single visible pixel of the illusion.

### 12.1 Contrast audit

WCAG 2.2 **1.4.3 Contrast (Minimum)** requires 4.5:1 for normal text, 3:1 for large text
(≥18.66px bold or ≥24px). **1.4.11 Non-text Contrast** requires 3:1 for UI component
boundaries and states.

All ratios below were computed, not estimated.

| Pair | Ratio | AA? | Verdict |
| --- | --- | --- | --- |
| `#000000` on `#C0C0C0` (body/menu/button text) | **11.54:1** | ✅ | Fine. The grey is darker than it looks. |
| `#000000` on `#FFFFFF` (document text) | 21:1 | ✅ | Fine |
| `#FFFFFF` on `#000080` (active caption, menu selection) | **16.01:1** | ✅ | Fine |
| `#FFFFFF` on `#008080` (desktop icon labels) | **4.77:1** | ✅ | Passes, but with almost no headroom — **do not touch the teal** |
| `#808080` on `#C0C0C0` (**disabled text**) | **2.17:1** | ⚠️ | Formally **exempt** — see below |
| `#C0C0C0` on `#808080` (**inactive caption text**) | **2.17:1** | ❌ | Fails. Not exempt — an inactive window is not a disabled control. |
| `#DFDFDF` vs `#C0C0C0` (bevel light edge) | **1.37:1** | ❌ | Fails 1.4.11 taken alone |
| `#808080` vs `#C0C0C0` (bevel shadow edge) | **2.17:1** | ❌ | Fails 1.4.11 taken alone |
| `#000000` vs `#C0C0C0` (bevel dark edge) | **11.54:1** | ✅ | This is the edge that carries the shape |
| Dotted `#000000` focus ring on `#C0C0C0` | 11.54:1, but **1px dotted** | ⚠️ | Fails **2.4.13 Focus Appearance** on thickness |
| `#000000` on `#FFFFE1` (tooltip) | 20.64:1 | ✅ | Fine |

Also failing by construction:

- **2.5.8 Target Size (Minimum)** — 24×24 CSS px. Caption buttons are **16×14**. Scrollbar
  arrows are **16×16**. Menu items are 18–20px tall. All below.
- **2.4.13 Focus Appearance** — needs a focus indicator at least 2px thick with 3:1
  contrast against adjacent colours. The 1px dotted rectangle is 1px.
- **1.4.4 Resize Text** — text must scale to 200%. Fixed `11px` with no fluid sizing.
- **1.4.1 Use of Color** — the active/inactive window distinction is carried *only* by the
  caption colour.

### 12.2 The minimal deviations

Ordered so that the least-visible fixes come first. Every one of these is invisible or
near-invisible at rest.

**A. Disabled text — keep `#808080`. It is exempt. (no change)**

SC 1.4.3 carries an explicit exception: *"Text or images of text that are part of an
inactive user interface component … have no contrast requirement."* Disabled controls are
exactly that. `#808080` on `#C0C0C0` at 2.17:1 is therefore **compliant as-is**, and
darkening it would defeat the purpose — the low contrast *is* the affordance.

What is required instead:

- Mark it up as genuinely disabled (`disabled` on form controls, `aria-disabled="true"`
  elsewhere) so it is announced, not merely greyed.
- **Never put information a user needs into disabled text.** If a control is disabled,
  the reason must be available somewhere legible.
- Keep the authentic `#FFFFFF` emboss at +1px/+1px, which does genuinely aid legibility.

```css
.w95 :disabled, .w95 [aria-disabled="true"] {
  color: #808080;                  /* authentic — and exempt under 1.4.3 */
  text-shadow: 1px 1px 0 #FFFFFF;  /* the emboss, retained */
}
```

If the owner wants belt-and-braces anyway, `#4C4C4C` reaches 4.72:1 — but it reads as
enabled text, which is a worse outcome for everyone. **Recommendation: leave it alone.**

**B. Inactive caption text — darken the bar two shades. (barely visible)**

This one is a real failure with no exemption: an inactive window is still fully usable, so
its title is not "inactive UI component" text. `#C0C0C0` on `#808080` is 2.17:1.

Two changes, both tiny:

- Caption text `#C0C0C0` → `#FFFFFF`
- Caption bar `#808080` → `#767676`

That lands at **4.54:1**. `#767676` is two steps darker than `#808080`; side by side you
can see it, in isolation nobody can. The active/inactive distinction still reads instantly
because it is navy-versus-grey, not light-grey-versus-grey.

```css
.w95-titlebar.is-inactive { background: #767676; color: #FFFFFF; }
```

(White on the authentic `#808080` alone gives 3.95:1, which clears AA only for large text —
and 11px bold is not large text. Hence the bar has to move too.)

**C. Focus indicator — thicken the dots, keep the dots. (barely visible)**

Keep the authentic dotted pattern; make it 2px and give it a light companion so it holds
3:1 against both `#C0C0C0` and `#000080`:

```css
.w95 :focus-visible {
  outline: 2px dotted #000000;
  outline-offset: -4px;
}
/* on navy surfaces the black dots vanish — invert */
.w95-menu-item:focus-visible,
.w95 [aria-selected="true"]:focus-visible {
  outline-color: #FFFFFF;
}
@media (forced-colors: active) {
  .w95 :focus-visible { outline: 2px solid CanvasText; }
}
```

2px dotted at 11px scale is only slightly chunkier than 1px and still reads as the Win95
marching-ants rectangle.

**D. Never rely on the bevel alone to convey state. (invisible)**

The bevel's light edges fail 1.4.11, but the **`#000000` dark-shadow edge is 11.54:1** and it
is present on every raised and sunken control. So every control already has a
3:1-compliant boundary — the failing `#DFDFDF` and `#808080` edges are *decoration layered
on top of* a compliant boundary, which is permitted. **No change needed**, provided the
black edge is never omitted. Document this so nobody "simplifies" the bevel to three
colours later.

For pressed/checked/selected states, always pair the visual change with `aria-pressed`,
`aria-selected` or `aria-expanded` so it is not colour-only.

**E. Target size — grow the hit area, not the box. (invisible)**

This is the important one, and CSS solves it cleanly. Keep the 16×14 caption button
exactly 16×14, and hang a transparent 24×24 pseudo-element off it:

```css
.w95-caption-button { position: relative; width: 16px; height: 14px; }
.w95-caption-button::after {
  content: "";
  position: absolute;
  inset: -5px;            /* 16×14 → 26×24 hit area */
}
```

WCAG 2.5.8 measures the **target**, not the rendered control, so this is a genuine pass and
not a loophole. Apply the same technique to scrollbar arrows, menu items, taskbar buttons,
and desktop icons. Take care that adjacent targets (minimize/maximize are flush) do not
overlap — expand them asymmetrically where they touch.

**F. Text resize — let the page zoom, don't fight it. (invisible at 100%)**

1.4.4 is satisfied by browser zoom, which scales everything including the 11px text.
Because the whole UI is in `px` and integer-based, zoom scales it uniformly and the bitmap
font stays crisp at 200% and 300%. **Do not add a fluid type scale** — it would break both
the fidelity and, ironically, the crispness. Do make sure no container uses a fixed `px`
height that would clip text when zoomed: use `min-height` on window bodies, menu items and
buttons rather than `height`.

Additionally offer a **"Large Fonts" display option** — which is itself a real Win95
feature (Display Properties ▸ Settings ▸ Font Size) and therefore *in character*. Toggling
it swaps the whole UI to a 2× integer scale. An in-fiction accessibility control is the
best possible outcome here.

**G. Non-visual structure — free, and entirely invisible.**

None of this changes a pixel:

- Real semantics: `<button>` for buttons, `role="menubar"/"menu"/"menuitem"`,
  `role="dialog"` + `aria-modal` for modal windows, `role="listbox"`/`option` for the icon
  grid.
- Full keyboard operation: Tab cycles windows, F10/Alt opens the menu bar, arrows move
  within menus and the icon grid, Enter opens, Escape closes, Alt+F4 closes the window,
  Alt+Tab cycles. All of this is authentic Win95 behaviour *and* satisfies 2.1.1.
- Focus management: when a window opens, move focus into it; when it closes, return focus
  to the icon that opened it. Trap focus in modal dialogs only.
- Announce window state changes (`aria-live="polite"`) for minimise/maximise/close.
- **Double-click is not accessible on its own.** Every icon must also open on `Enter` and
  on `Space` when focused, and the context menu must offer `Open`. Keep double-click as the
  mouse idiom; never make it the only route.
- `prefers-reduced-motion`: disable the minimise zoom animation, the boot splash, and the
  caret blink.
- `prefers-contrast: more` and `forced-colors: active`: fall back to system colours. In
  forced-colors mode the bevels will collapse — that is correct and expected behaviour, and
  the layout must survive it. Test it.

**H. Contrast escape hatch — in character.**

Windows 95 shipped a **High Contrast** accessibility option (Control Panel ▸
Accessibility Properties ▸ Display). Reproducing it gives a fully AA-compliant colour
scheme that is *historically accurate*: a "High Contrast Black" theme with
`#FFFFFF` on `#000000` chrome. Put it where Win95 put it, honour
`prefers-contrast: more` by defaulting to it, and the conflict between fidelity and
accessibility dissolves entirely — because Microsoft already solved it in 1995.

### 12.3 Summary of deviations

| # | Change | Visible at rest? |
| --- | --- | --- |
| A | Disabled text — **no change**, `#808080` is exempt under 1.4.3; add `aria-disabled` | No |
| B | Inactive caption bar `#808080` → `#767676`, text `#C0C0C0` → `#FFFFFF` | Barely |
| C | Focus ring 1px dotted → 2px dotted, inverted on navy | Barely |
| E | Transparent 24×24 hit areas on all small targets | No |
| F | `min-height` instead of `height`; in-fiction "Large Fonts" toggle | No |
| G | Semantics, keyboard parity, focus management, reduced-motion | No |
| H | In-fiction High Contrast scheme, auto-applied on `prefers-contrast: more` | No |

Six changes, and only **one** of them alters a colour — the inactive title bar, by two
shades, on the least prominent chrome in the interface. Everything else is structural,
semantic, or a transparent hit area. **The illusion survives intact, and the page reaches
WCAG 2.2 AA.**

The remaining known gap is **1.4.1 Use of Color** for the active/inactive window
distinction, which Win95 carries in the caption colour alone. Fix it the way Win95 already
half-did: the active window is also the topmost in z-order and its task button is drawn
pressed. Add `aria-current="true"` on the focused window's task button and the distinction
is no longer colour-only.

---

## Appendix: quick reference

```
GREYS      face #C0C0C0 · light #DFDFDF · shadow #808080 · dkshadow #000000 · hilight #FFFFFF
ACCENTS    desktop #008080 · caption #000080 · inactive #808080 · select #000080 · tooltip #FFFFE1

BUTTON     raised  TL #FFFFFF,#DFDFDF   BR #808080,#000000    (EDGE_RAISED|BF_SOFT)
           pressed TL #000000,#808080   BR #DFDFDF,#FFFFFF    + 1px content shift
WINDOW     raised  TL #DFDFDF,#FFFFFF   BR #808080,#000000    (EDGE_RAISED)
FIELD      sunken  TL #808080,#000000   BR #DFDFDF,#FFFFFF    (EDGE_SUNKEN)
STATUS     sunken  TL #808080           BR #FFFFFF            (1px)

TITLE BAR  18px   ·  buttons 16×14, 2px inset, gap: [min][max][2px][close][2px]
FRAME      4px resizable / 3px dialog   ·   MENU BAR 19px   ·   SCROLLBAR 16px
TASKBAR    28px   ·  Start 54×22 at x=2,y=4   ·  task buttons 22px, max 160px, 3px gap
START MENU banner 21px solid #808080   ·  items 32px top-level / 20px cascade
ICONS      32×32 bitmap on a 75×75 grid   ·   labels #FFFFFF, no shadow
TYPE       MS Sans Serif 11px everywhere   ·   Fixedsys 16px in Notepad   ·   no AA
```
