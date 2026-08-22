# CategoryTile / Card Specification

- **Target file:** `components/public/ProductCard.tsx`, `components/public/PostCard.tsx`
- **Interaction model:** static + hover

## DOM Structure
```
div.col-inner              225×267
  div.img                  225×225, mb 16px
    a > div.img-inner      overflow hidden
      img                  aspect-ratio 1/1
  p                        text-center, mb 20.8px
    a > span               caption
```

## Computed Styles
### Image frame
- width/height `225×225` at a 1050px container → square, `aspect-ratio: 1 / 1`
- marginBottom `16px`; `.img-inner` overflow `hidden`
- img aspectRatio `auto 1020 / 1020`; source assets are 1019×1019

### Caption
- p: textAlign `center`; margin `0px 0px 20.8px`
- a/span: fontSize `16px`; lineHeight `25.6px`; fontWeight `400`; color `rgb(6, 147, 227)`

## States & Behaviors
### Hover
- Caption link: `color: rgb(34,143,245) → rgb(0,0,0)` — links **darken**, inverse of the
  usual convention; this is a deliberate part of the look and must be ported.
- Image: wrapper `.has-hover`, `.img-inner` clips → inner scales.
- Ignore `transition: opacity 1s` on img — that is the lazy-loader, not design.

## Responsive
- **≥550px:** 4-up (`max-width:25%`), column padding `0 15px 30px`
- **<550px:** 2-up (`max-width:50%`)
