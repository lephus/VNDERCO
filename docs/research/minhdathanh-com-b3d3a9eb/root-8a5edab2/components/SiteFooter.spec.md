# SiteFooter Specification

- **Target file:** `components/public/SiteFooter.tsx`
- **Interaction model:** static

## DOM Structure
```
footer
  div.footer-widgets      bg #1E73BE, padding 30px 0 0
    div.row               max-w 1080, flex, 2 cols @ 50%
      div.col             padding 0 15px, mb 24px
        span.widget-title
        div.is-divider    30×3px
        body copy
  div.absolute-footer     bg #5B5B5B, padding 10px 0 15px, centered
```

## Computed Styles
### Widget band
- backgroundColor `rgb(30, 115, 190)`; padding `30px 0px 0px`; color `rgb(241, 241, 241)`
- row: maxWidth `1080px`, display `flex`
- col: maxWidth `50%`, padding `0px 15px`, margin `0px 0px 24px`

### Widget title
- fontSize `16px`; lineHeight `16.8px`; fontWeight `600`; color `rgb(241, 241, 241)`

### Divider
- width `30px`; height `3px`; backgroundColor `rgba(255, 255, 255, 0.3)`
- margin `10.56px 0px 16px`

### Body copy
- fontSize `13px`; lineHeight `20.8px`; marginBottom `16.9px`

### Copyright strip
- backgroundColor `rgb(91, 91, 91)`; color `rgba(255, 255, 255, 0.5)`
- fontSize `14.4px`; lineHeight `23.04px`; padding `10px 0px 15px`; textAlign `center`

## Responsive
- **≥850px:** 2 columns; **<850px:** stacked full width
