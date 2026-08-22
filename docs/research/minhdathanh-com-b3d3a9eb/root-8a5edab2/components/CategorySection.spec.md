# CategorySection Specification (khối 5 — dải ô danh mục nền xanh)

## Overview
- **Target file:** `components/public/CategorySection.tsx` + `components/public/CategoryTile.tsx`
- **Screenshot:** `docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2/section-block-1.png`
- **Interaction model:** static + hover trên từng ô

## DOM Structure
```
section.section          1050×637.66  ← KHÔNG full-bleed, nằm trong lòng 1050px
  div.section-bg.fill    absolute, phủ kín  → backgroundColor #3289F5
  div.section-bg-overlay absolute, phủ kín  → rgba(255,255,255,.85)
  div.section-content > .row      1020px, flex-wrap, margin 0 -15px
    div.col × 8                   max-width 25%, padding 0 15px 30px
      div.col-inner               225×266.59
        div.img                   225×225, margin 0 0 16px, .img-inner overflow hidden
        p                         text-center, margin 0 0 20.8px
```

## Computed Styles (getComputedStyle, 1440px)

### section
- width `1050px` (không phải 1440 — dải màu bị bó trong khung nội dung)
- padding `0px 30px`; minHeight `600px`; height đo được `637.656px`
- display `flex`; flexDirection `row`; flexWrap `nowrap`; alignItems `center`
- position `relative`; backgroundColor `rgb(50, 137, 245)`

### lớp phủ
- `.section-bg-overlay`: position `absolute`, phủ kín `1050×637.656`
- backgroundColor `rgba(255, 255, 255, 0.85)`
- → màu nhìn thấy là xanh rất nhạt, KHÔNG phải #3289F5 bão hoà

### row / col
- row: width `1020px`, display `flex`, flexWrap `wrap`, margin `0px -15px`
- col: maxWidth `25%`, width `255px`, padding `0px 15px 30px`
- col-inner: `225×266.594`

### ô (CategoryTile)
- khung ảnh `225×225` → `aspect-ratio: 1/1`, marginBottom `16px`, overflow `hidden`
- caption `p`: textAlign `center`, margin `0px 0px 20.8px`
- caption `span`: fontSize `16px`, lineHeight `25.6px`, fontWeight `400`, color `rgb(6, 147, 227)`

## States & Behaviors
### Hover trên caption
- **Trigger:** hover trên ô
- **State A:** color `rgb(34, 143, 245)` → **State B:** `rgb(0, 0, 0)`
- Link **tối đi** khi hover, ngược quy ước thường thấy — giữ nguyên, đây là nét nhận dạng
- **Transition:** `0.2s`

### Hover trên ảnh
- `.img-inner` có `overflow: hidden`, phần tử bên trong phóng to → zoom bị cắt trong khung

## Assets
- Ảnh ô: lấy từ CMS của VNDERCO (ảnh đầu tiên của sản phẩm đầu tiên trong danh mục).
  KHÔNG tải ảnh của minhdathanh.com — đây là site thương mại của bên khác.

## Text Content
- Tên danh mục lấy từ `Category.name` của VNDERCO.

## Responsive
- **Desktop 1440 / Tablet 768:** 4 ô một hàng (`max-width: 25%`)
- **Mobile 390:** 2 ô một hàng (`max-width: 50%`)
- **Breakpoint:** 550px (token `tile`)
