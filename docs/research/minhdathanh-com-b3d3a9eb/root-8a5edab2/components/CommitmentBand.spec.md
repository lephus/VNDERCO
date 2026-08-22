# CommitmentBand Specification (khối 7 — dải cam kết nền xanh)

## Overview
- **Target file:** `components/public/CommitmentBand.tsx`
- **Screenshot:** `docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2/section-block-3.png`
- **Interaction model:** static

## DOM Structure
```
section.section        1050×493.09, padding 30px, bg #1487C9  ← KHÔNG full-bleed
  div.col-inner        990px
    div.row.align-center  990px, flex, align-items center, margin 0 -15px
      div.col          max-width 41.6667% (412.5px), padding 0 15px 30px, text-center
        img            382.5×382.5 (vuông)
      div.col          max-width 58.3333% (577.48px), padding 0 15px 30px
        p              câu dẫn, margin 0 0 20.8px
        ul > li × 4    margin 0 0 9.6px 20.8px
```

## Computed Styles

### section
- width `1050px`; padding `30px`; backgroundColor `rgb(20, 135, 201)`
- display `flex`; alignItems `center`; position `relative`
- height đo được `493.094px`

### cột trái
- maxWidth `41.6667%`; width `412.5px`; padding `0px 15px 30px`; textAlign `center`
- ảnh `382.5×382.5` → **vuông**, nguồn 1080×1080

### cột phải
- maxWidth `58.3333%`; width `577.484px`; padding `0px 15px 30px`
- câu dẫn `p`: fontSize `16px`, lineHeight `25.6px`, fontWeight `400`,
  color `rgb(245, 240, 240)`, margin `0px 0px 20.8px`, textAlign start
- `li`: fontSize `16px`, lineHeight `25.6px`, color `rgb(245, 240, 240)`,
  margin `0px 0px 9.6px 20.8px` (thụt lề trái 20.8px, cách nhau 9.6px)

Màu chữ `#F5F0F0` — trắng ngà chứ không phải trắng tinh.

## Text Content
Lấy từ CMS VNDERCO: `homeIntroTitle` làm câu dẫn, mỗi dòng của `homeIntroBody`
thành một `li`, `homeIntroImageUrl` làm ảnh vuông bên trái.

## Responsive
- **1440:** 5/7; **768:** giữ 5/7; **390:** xếp chồng, ảnh full width
