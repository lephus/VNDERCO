# Design Tokens — minhdathanh.com (homepage)

Extracted via `getComputedStyle()` at 1440 / 768 / 390. Every value below is measured,
not estimated. Source platform: WordPress 5.9 + Flatsome theme.

## Typography

| Token | Value |
|---|---|
| Family | `Roboto, sans-serif` — Google Fonts, weights 400 + 700 |
| Body | `16px / 25.6px` (ratio 1.6), weight 400, color `#000000` |
| Small text | `14.4px / 23.04px` |
| Footer body | `13px / 20.8px` |
| H2 section title | `25.6px / 33.28px`, weight 700, color `#2390EF` |
| Section title inner span | `23.552px / 30.6176px`, weight 700 → `17.664px` on mobile |
| Card title (H5) | `16.56px / 21.528px`, weight 700, color `#2390EF` |
| Widget title | `16px / 16.8px`, weight 600 |
| Nav link | `14.4px / 23.04px`, weight 700, `text-transform: uppercase`, `letter-spacing: 0.288px` |

No `text-transform` on headings. Body copy is pure black, not slate — a deliberately
high-contrast, utilitarian look.

## Color

| Role | Value | Where |
|---|---|---|
| Brand blue | `#2390EF` | section titles, card titles, rules |
| Link blue | `#228FF5` | inline links, "see all" chevron |
| Caption blue | `#0693E3` | category tile captions |
| Deep blue | `#1E73BE` | header top bar, footer widget band |
| Section blue | `#3289F5` | tile section background (under an 85% white overlay) |
| Band blue | `#1487C9` | commitment band |
| Footer text | `#F1F1F1` | on deep blue |
| Sub-footer | bg `#5B5B5B`, text `rgba(255,255,255,.5)` | copyright strip |
| Muted | `#777777` | dropdown body text |
| Body | `#000000` on `#FFFFFF` | page |

## Layout

| Token | Value |
|---|---|
| Container | `max-width: 1080px`, `padding: 0 15px` → 1050px content |
| Row | `display:flex`, `margin: 0 -15px` |
| Column | `padding: 0 15px 30px` |
| Grid — tiles | 4-up (`max-width:25%`) ≥550px, 2-up (`50%`) below |
| Grid — band | 5/7 split (`41.6667%` / `58.3333%`) |
| Grid — footer | 2-up (`50%`) |
| Section padding | `30px` vertical (tile section `0 30px`) |
| Section title block | `margin: 30px 0 24px`, title `margin-bottom: 12.8px` |

## Components

**Header** — total 130px = 30.47px top bar (`#1E73BE`) + 100px main bar (white).
Mobile (<550px) main bar drops to 70px. Logo 200×42.

**Section title** — the signature motif: a flex row of
`[2px rule, flex-grow] · title · [2px rule, flex-grow] · chevron link`,
rules `background:#2390EF`, height 2px.

**Category tile** — 1:1 square image (`margin-bottom:16px`) over a centered caption
(`16px/25.6px`, color `#0693E3`, `margin-bottom:20.8px`).

**Slider** — 1050×426 desktop (≈2.46:1), 738×299 tablet, 360×146 mobile.
Circular 36px nav buttons, white; page dots below.

**Footer** — `#1E73BE`, `padding: 30px 0 0`, 2 columns. Widget title `16px/600` with a
30×3px divider (`rgba(255,255,255,.3)`, `margin: 10.56px 0 16px`) beneath it.
Copyright strip `#5B5B5B`, `14.4px`, centered, `padding: 10px 0 15px`.

## Breakpoints

| Width | Behavior |
|---|---|
| ≥850px | horizontal nav visible |
| <850px | nav → burger; top bar stays |
| ≥550px | tiles 4-up |
| <550px | tiles 2-up; header main 100px → 70px; section title 23.55px → 17.66px |
