# Page Topology — minhdathanh.com homepage

Desktop 1440px, document height 4481px. Tablet 4494px. Mobile 6194px.

| # | Block | Y range | Height | Background | Interaction model |
|---|---|---|---|---|---|
| 1 | Header top bar | 0–30 | 30.47 | `#1E73BE` | static; collapses to 0 when header sticks |
| 2 | Header main bar | 30–130 | 100 | white | sticky (`position:fixed` via `.stuck`) |
| 3 | Hero slider | 160–586 | 426 | image | time-driven autoplay + prev/next + dots |
| 4 | Section title | 616–659 | 43 | — | static |
| 5 | Category tile grid | 683–1321 | 638 | `#3289F5` + 85% white overlay | static; per-tile hover |
| 6 | Content grid (4 titled groups) | 1321–3622 | 2301 | white | static; per-card hover |
| 7 | Commitment band | 3622–4115 | 493 | `#1487C9` | static |
| 8 | Footer widgets | 4202–4433 | 231 | `#1E73BE` | static |
| 9 | Copyright strip | 4433–4481 | 48 | `#5B5B5B` | static |
| — | Back-to-top | fixed | 39×39 | — | scroll-triggered visibility |
| — | Chat widget | fixed 60×60 | — | — | third-party iframe (not cloned) |

## Structure

```
#wrapper
  header#header .has-sticky.sticky-jump
    .header-top .hide-for-sticky.nav-dark      ← 30px, #1E73BE
    .header-main                                ← 100px white
      .header-inner.flex-row.container          ← 1080px, space-between
        .flex-col.logo                          ← 200×42
        .flex-col.flex-right                    ← nav 784×43
  main#main
    #content .page-wrapper                      ← padding 30px 0
      .row.row-main > .large-12.col > .col-inner
        .slider-wrapper                         ← block 3
        .section-title-container                ← block 4
        section.section  × 3                    ← blocks 5, 6, 7
  footer#footer .footer-wrapper
    .footer-widgets.footer-2.dark               ← block 8
    .absolute-footer.dark                       ← block 9
```

Column model throughout is Flatsome's 12-column flex grid: `.row` at `margin:0 -15px`,
each `.col` at `padding:0 15px 30px` with a percentage `max-width`. There is no CSS grid
anywhere on the page.

## Section anatomy

**Block 5 — category tiles.** `section.section` `padding:0 30px`, `display:flex`,
`align-items:center`. Inside, `.bg.section-bg.fill` carries the blue, and
`.section-bg-overlay` lays `rgba(255,255,255,.85)` over it — so the visible field is a
pale blue wash, not the saturated `#3289F5`. Content is 8 `.col.medium-3.small-6` tiles
in two rows of four.

**Block 6 — content grid.** BỐN nhóm có tiêu đề xếp chồng, mỗi nhóm là một tiêu đề mục
rồi tới một hàng thẻ:

| Nhóm | Tiêu đề (top) | Hàng (top) | Số thẻ | Kiểu thẻ |
|---|---|---|---|---|
| 1 | 1351 | 1418 | 8 | ô vuông 4 cột |
| 2 | 2055 | 2123 | 8 | ô vuông 4 cột |
| 3 | 2758 | 2826 | 4 | ô vuông 4 cột |
| 4 | 3155 | 3222 | 3 | thẻ tin 3 cột, ảnh 16:9 |

Nhóm 4 dùng cấu trúc `.box-blog-post` khác hẳn ba nhóm trên — xem NewsRow.spec.md.
29 ảnh, 49 liên kết toàn khối.

**Block 7 — commitment band.** `padding:30px`, two columns `medium-5` / `medium-7`;
the left column is `text-center` and holds a single image, the right holds the copy.
