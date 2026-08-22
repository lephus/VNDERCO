# Behaviors — minhdathanh.com homepage

Findings from the scroll / click / hover / responsive sweep. No smooth-scroll library is
present (`lenis: false`, `locomotive: false`, `scroll-behavior: auto`) — scrolling is
native. jQuery is loaded; the slider is Flatsome's bundled Flickity build.

## Sticky header

- **Trigger:** scroll past the top bar. `.header-wrapper` gains the class `stuck`.
- **State A (scroll 0):** wrapper `position:relative`, total height 130.47px, top bar
  30.47px visible.
- **State B (scroll 600):** wrapper `stuck` → fixed at top; `.header-top` collapses to
  `height:0` (it carries `hide-for-sticky`). Visible header is the 100px white bar alone.
- **Transition:** `background-color 0.3s, opacity 0.3s`.
- **z-index:** 30 on the wrapper, 11 on the top bar, 10 on the main bar.

## Hero slider

- **Model:** time-driven autoplay with manual override.
- Slides are absolutely positioned inside `.flickity-viewport` (`overflow:hidden`) and
  translated horizontally by `.flickity-slider`.
- Prev/next are 36×36 circular buttons (`border-radius:100%`), white glyph, vertically
  centered, sitting inside a 36×85 hit area.
- Page dots render below the slide as `ol.flickity-page-dots` (630×16).

## Hover

| Element | Change | Notes |
|---|---|---|
| Tile caption link | `color: #228FF5 → #000000` | links darken rather than brighten — the inverse of the usual convention, and a distinctive part of the look |
| Tile image | wrapper is `.has-hover` with `overflow:hidden` on `.img-inner` | zoom is applied to the inner element |
| Nav link | no computed change on the anchor itself | the visible affordance is a pseudo-element |

Images carry `transition: opacity 1s` from the lazy-loader, not a design intent —
do not port that as a hover effect.

## Responsive

| | 1440 | 768 | 390 |
|---|---|---|---|
| Top bar | 30px | 30px | 30px |
| Header main | 100px | 100px | **70px** |
| Horizontal nav | visible | **hidden → burger** | hidden → burger |
| Slider | 1050×426 | 738×299 | 360×146 |
| Tile columns | 25% (4-up) | 25% (4-up) | **50% (2-up)** |
| Section title | 23.552px | 23.552px | **17.664px** |
| Footer columns | 50% (2-up) | full width | full width |
| Doc height | 4481 | 4494 | 6194 |

Breakpoints: **850px** (nav → burger, footer stacks) and **550px** (tiles 4-up → 2-up,
header shrinks, section title shrinks).

## Not cloned

The fixed Zalo chat widget is a third-party iframe; VNDERCO already has its own
`ContactButtons` component covering the same job.
