# SectionHeading Specification

- **Target file:** `components/public/SectionHeading.tsx`
- **Interaction model:** static (link hover only)

This is the page's signature motif: a centered title flanked by full-bleed 2px rules.

## DOM Structure
```
div.container            margin 30px 0 24px, max-w 1080
  h2                     flex, justify-between, items-center, mb 12.8px
    b                    flex-1, height 2px, bg #2390EF
    span                 mx 15px, text-center
    b                    flex-1, height 2px, bg #2390EF
    a                    pl 15px  (optional "see all" chevron)
```

## Computed Styles
### h2
- color `rgb(35, 144, 239)`; fontSize `25.6px`; fontWeight `700`; lineHeight `33.28px`
- margin `0px 0px 12.8px`; display `flex`; justifyContent `space-between`; alignItems `center`

### b (rule)
- backgroundColor `rgb(35, 144, 239)`; height `2px`; display `block`
- measured width 400px each at 1050px container → flex-grow, not fixed

### span.section-title-main
- fontSize `23.552px`; fontWeight `700`; lineHeight `30.6176px`; margin `0px 15px`
- color `rgb(35, 144, 239)`; textAlign `center`

### a (chevron link)
- color `rgb(34, 143, 245)`; fontSize `20.48px`; fontWeight `700`; lineHeight `26.624px`
- padding `0px 0px 0px 15px`; icon marginLeft `10px`

## Responsive
- **Mobile (<550px):** span fontSize `23.552px` → `17.664px`
