# NewsRow / PostBoxCard Specification (nhóm cuối của khối 6)

## Overview
- **Target file:** `components/public/PostBoxCard.tsx` (mới — KHÔNG sửa `PostCard.tsx`,
  component đó còn dùng ở trang /tin-tuc và phạm vi lần này chỉ là trang chủ)
- **Interaction model:** static + hover (bản gốc bọc thêm Flickity nhưng 3 thẻ hiện
  đủ trong khung, không có mũi tên/chấm → dựng thành lưới tĩnh 3 cột)

## DOM Structure
```
div.row                    1020×369.5, margin 0 -15px
  div.col.post-item × 3    max-width 33.3333%, width 339.98, padding 0 15px 30px
    div.col-inner          309.98
      a.plain
        div.box.box-text-bottom.box-blog-post
          div.box-image    309.98×174.36, overflow hidden
            img            object-fit cover, position absolute
          div.box-text     padding 15px 15px 20px, text-center, 14.4px/23.04px
            h5.post-title  16.56px/21.528px, 700, rgb(35,144,239), margin 1.656px 0
            div.is-divider 30px × 1px, căn giữa, margin 7.2px auto
            p.excerpt      14.4px/23.04px, margin 1.44px 0
```

## Computed Styles

### col
- maxWidth `33.3333%`; width `339.984px`; padding `0px 15px 30px`
- col-inner `309.984px`

### .box-image
- `309.98×174.36` → **tỉ lệ 1.778 ≈ 16/9** (KHÔNG vuông như ô sản phẩm)
- overflow `hidden`; img objectFit `cover`, position `absolute`
- ảnh nguồn 300×225 bị cắt xuống 16:9

### .box-text
- padding `15px 15px 20px`; textAlign `center`
- fontSize `14.4px`; lineHeight `23.04px`

### h5.post-title
- fontSize `16.56px`; lineHeight `21.528px`; fontWeight `700`
- color `rgb(35, 144, 239)`; margin `1.656px 0px`

### .is-divider
- rộng `30px`, căn giữa (margin trái/phải bằng nhau ~125px trong lòng 279.98px)
- margin dọc `7.2px`

### p (trích đoạn)
- fontSize `14.4px`; lineHeight `23.04px`; margin `1.44px 0px`

## Đo chiều cao
- thẻ: `317.97px` (tiêu đề 1 dòng) → `339.5px` (tiêu đề 2 dòng); row cao `369.5px`

## States & Behaviors
### Hover
- cùng quy ước với ô sản phẩm: chữ xanh → đen, ảnh phóng nhẹ trong khung cắt

## Responsive
- **1440 / 768:** 3 cột; **390:** 1 cột toàn chiều rộng
