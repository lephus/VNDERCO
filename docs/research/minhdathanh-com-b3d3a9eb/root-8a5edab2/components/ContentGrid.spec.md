# ContentGrid Specification (khối 6 — các nhóm nội dung có tiêu đề)

## Overview
- **Target file:** `app/(public)/page.tsx` (khung) + `components/public/ProductCard.tsx`
- **Interaction model:** static + hover

## DOM Structure
```
section.section                1050×2300.67, padding 30px, KHÔNG có nền
  div.col-inner                990px
    ├─ div.section-title-container   990×43.41, margin 0 0 24px
    ├─ div.row                       1020px, flex-wrap, margin 0 -15px → 8 ô @25%
    ├─ div.section-title-container   (nhóm 2)
    ├─ div.row                       → 8 ô
    ├─ div.section-title-container   (nhóm 3)
    ├─ div.row                       → 4 ô
    ├─ div.section-title-container   (nhóm tin tức)
    └─ div.row                       → 3 thẻ tin @33.3333%   (xem NewsRow.spec.md)
```

Trang gốc có **4 nhóm**: 3 nhóm sản phẩm + 1 nhóm tin tức.

## Computed Styles

### section
- width `1050px`; padding `30px`; backgroundColor trong suốt
- display `flex`; con `.col-inner` rộng `990px` (1050 − 2×30)

### tiêu đề nhóm (khác tiêu đề đứng riêng ở khối 4)
- container: width `990px`, maxWidth `1080px`, margin `0px 0px 24px`
  (tiêu đề đứng riêng ở khối 4 dùng margin `30px 0px 24px` — khác nhau ở lề trên)
- h2: display `flex`, justifyContent `space-between`, alignItems `center`,
  margin `0px 0px 12.8px`, fontSize `25.6px`, lineHeight `33.28px`, fontWeight `700`,
  color `rgb(35, 144, 239)`
- `b` (hai vạch): height `2px`, backgroundColor `rgb(35, 144, 239)`, `flex: 1 1 0%`
- `span`: fontSize `23.552px`, lineHeight `30.6176px`, fontWeight `700`,
  margin `0px 15px`, textAlign `center`
- **KHÔNG có link "xem tất cả"** ở tiêu đề trong nhóm (chỉ tiêu đề khối 4 có)

### row / col — giống hệt khối 5
- row: width `1020px`, margin `0px -15px`, flexWrap `wrap`
- col: maxWidth `25%`, padding `0px 15px 30px`
- ô: ảnh `225×225` (1:1) marginBottom `16px`; caption `p` margin `0 0 20.8px`,
  fontSize `16px/25.6px`, color `rgb(6, 147, 227)`, textAlign center

## Đo chiều cao (để đối chiếu QA)
- nhóm 8 ô: row cao `636.78px` (2 hàng × 318.39)
- nhóm 4 ô: row cao `328.98px`
- tiêu đề nhóm: `43.41px` + `24px` lề dưới

## Responsive
- **1440 / 768:** 4 cột; **390:** 2 cột (breakpoint 550px)
- Tiêu đề: span `23.552px` → `17.664px` dưới 550px
