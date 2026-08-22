# HomePage Assembly Specification

## Overview
- **Target file:** `app/(public)/page.tsx`
- **Screenshot:** `docs/design-references/minhdathanh-com-b3d3a9eb/root-8a5edab2/desktop-1440-full.png`

## Khung ngoài
```
#content .page-wrapper     padding 30px 0
  .row.row-main            max-width 1080px, width 1080px
    .col                   padding 0 15px 30px   → lòng trong 1050px
      .col-inner
```
- `main` bắt đầu ngay dưới header (top 130.47) và kết thúc đúng tại chân trang
  (4202) — **chân trang KHÔNG có lề trên**.
- Tổng chiều cao tài liệu 1440px: **4481px**.

## Thứ tự khối (đo tại 1440px)

| # | Khối | top | height | width | Ghi chú |
|---|---|---|---|---|---|
| 1 | `.slider-wrapper` | 160 | 425.52 | 1050 | tỉ lệ 2.463:1 |
| 2 | tiêu đề đứng riêng | 616 | 43.41 | 1050 | margin `30px 0 24px`, **có** mũi "xem tất cả" |
| 3 | dải ô danh mục | 683 | 637.66 | 1050 | nền #3289F5 + phủ trắng 85%, padding `0 30px` |
| 4 | lưới nội dung | 1321 | 2300.67 | 1050 | padding `30px`, 4 nhóm có tiêu đề |
| 5 | dải cam kết | 3622 | 493.09 | 1050 | nền #1487C9, padding `30px` |

- Chân trang: dải widget #1E73BE (top 4202, cao 231) + vạch bản quyền #5B5B5B (cao 48).
- Nút back-to-top: `position: fixed`, `38.8×38.8`, viền `2px solid`, bo `5px`.

## Điểm cần sửa so với bản VNDERCO hiện tại
1. Hai dải màu đang **full-bleed** → phải bó trong 1050px.
2. Thiếu **dải ô danh mục** (khối 3).
3. Lưới nội dung chỉ có 2 nhóm → phải thành nhiều nhóm theo danh mục + nhóm tin tức.
4. Nhóm tin tức phải dùng thẻ 3-cột ảnh 16:9, không phải ô vuông 4-cột.
5. Chân trang đang có `mt-16` → bỏ, bản gốc không có lề trên.
6. Trang hiện có mục "con số nổi bật" và mục CTA cuối trang — **bản gốc không có**,
   phải bỏ để khớp 1:1.
7. `#content` cần padding `30px 0` (hiện chỉ có padding-top).

## Responsive
| | 1440 | 768 | 390 |
|---|---|---|---|
| Chiều cao tài liệu gốc | 4481 | 4494 | 6194 |
| Ô danh mục / sản phẩm | 4 cột | 4 cột | 2 cột |
| Thẻ tin | 3 cột | 3 cột | 1 cột |
| Dải cam kết | 5/7 | 5/7 | xếp chồng |
| Tiêu đề mục | 23.552px | 23.552px | 17.664px |
