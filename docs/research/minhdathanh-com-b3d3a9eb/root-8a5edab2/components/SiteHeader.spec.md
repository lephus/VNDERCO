# SiteHeader Specification

- **Target file:** `components/public/SiteHeader.tsx`
- **Screenshot:** `docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2/section-header.png`
- **Interaction model:** scroll-driven (sticky) + click (mobile burger)

## DOM Structure
```
header                                   sticky, z-40
  div.topbar        bg #1E73BE, h 30.47px, collapses to 0 when stuck
    div.container   max-w 1080, px 15, flex justify-between items-center
      address text (left) · phone (right)
  div.main          bg white, h 100px (70px < 550px)
    div.container   max-w 1080, px 15, flex justify-between items-center
      logo 200×42 · nav (≥850px) · burger (<850px)
```

## Computed Styles
### Top bar
- backgroundColor: `rgb(30, 115, 190)`; height: `30.4688px`; zIndex: `11`
- display: `flex`; alignItems: `center`
- container: maxWidth `1080px`, padding `0px 15px`, justifyContent `space-between`

### Main bar
- height: `100px` desktop/tablet, `70px` below 550px; background white; zIndex: `10`
- container: maxWidth `1080px`, padding `0px 15px`, display `flex`, justifyContent `space-between`, alignItems `center`
- logo: `200×42`, marginRight `30px`

### Nav link
- fontSize `14.4px`; lineHeight `23.04px`; fontWeight `700`
- textTransform `uppercase`; letterSpacing `0.288px`; padding `10px 0px`
- color `rgb(0,0,0)`; transition `0.2s`

## States & Behaviors
### Sticky
- **Trigger:** scroll past the top bar; wrapper gains `stuck`
- **State A:** `position:relative`, total 130.47px, top bar visible
- **State B:** fixed to top, top bar `height:0`, only the 100px white bar shows
- **Transition:** `background-color 0.3s, opacity 0.3s`
- **Implementation:** CSS `position:sticky` with `top:-30.47px` so the top bar scrolls out
  and the main bar pins — no JS scroll listener needed.

### Hover
- Nav anchor: no computed change on the element itself; affordance is a pseudo-element.

## Responsive
- **≥850px:** horizontal nav
- **<850px:** nav → burger, top bar retained
- **<550px:** main bar 100px → 70px
- **Breakpoint:** custom `nav: 850px` token required (Tailwind has no 850 default)
