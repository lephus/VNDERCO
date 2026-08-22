# HeroSlider Specification

- **Target file:** `components/public/HeroSlider.tsx`
- **Interaction model:** time-driven autoplay + click (arrows, dots)

## Computed Styles
### Frame
- desktop `1050×426` → aspect ratio **2.463 : 1**
- tablet (768) `738×299` → 2.468 : 1
- mobile (390) `360×146` → 2.466 : 1
- Ratio is constant across breakpoints → use a single `aspect-ratio`, not per-breakpoint heights.
- viewport `overflow: hidden`; slides `position: absolute`

### Nav buttons
- `36×36`, `border-radius: 100%`, white glyph, `padding: 7.1875px`
- vertically centered inside a `36×85` hit area

### Page dots
- `ol.flickity-page-dots`, `630×16`, `position: absolute` — **ĐÈ LÊN mép dưới của
  ảnh**, không nằm dưới khung (số đo lại: dots top 555, khung 160→585,5 → tâm chấm
  cách đáy 24,5px)
- chấm `12×12`, `border-radius: 50%`, nền trắng, `margin: 0 5px` → khoảng cách tâm 22px

## States & Behaviors
- Autoplay advances slides; prev/next and dots override.
- Slides translate horizontally (Flickity), but a cross-fade is an acceptable
  substitution — VNDERCO's existing slider already cross-fades and the ratio,
  nav shape and dot placement carry the look.

## Responsive
- Single aspect ratio at all widths; arrows hidden on narrow screens.
