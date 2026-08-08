# Ảnh banner trang chủ

Thả ảnh vào **chính thư mục này** rồi commit + deploy — ảnh sẽ tự lên banner trang
chủ, không cần vào trang quản trị.

## Cách dùng

1. Chép ảnh vào `public/banners/`.
2. Đặt tên file có **số thứ tự dẫn đầu** để quyết định thứ tự chạy:
   `01-phong-khach.jpg`, `02-tran-go.jpg`, `03-mat-tien.jpg`
3. Commit và deploy. Xong.

Ở máy local (`npm run dev`) chỉ cần thả ảnh vào rồi tải lại trang là thấy ngay.

## Yêu cầu ảnh

| Mục | Khuyến nghị |
|---|---|
| Kích thước | 1920 × 900 px (tỉ lệ ngang, khoảng 21:9) |
| Định dạng | `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif` |
| Dung lượng | dưới 500 KB mỗi ảnh (ảnh nặng làm trang chủ tải chậm) |
| Nội dung | **không nung sẵn chữ vào ảnh** — banner đã vẽ tiêu đề đè lên giữa ảnh |

Tên file cũng chính là chữ mô tả ảnh (thẻ `alt`) khi không khai trong `captions.json`,
nên đặt tên có nghĩa (`phong-khach-hien-dai.jpg`) thay vì `IMG_2931.jpg` — Google và
trình đọc màn hình chỉ có ngần đó thông tin về tấm ảnh.

## Chú thích riêng cho từng ảnh (tuỳ chọn)

Mặc định mọi slide dùng chung tiêu đề = tên công ty và phụ đề = dòng giới thiệu
trong phần **Cài đặt** của trang quản trị. Muốn slide nào có chữ riêng thì khai
trong `captions.json` cùng thư mục, khoá là **đúng tên file ảnh**:

```json
{
  "01-phong-khach.jpg": {
    "title": "MINH ĐÀ THÀNH",
    "subtitle": "Cung cấp & thi công tấm ốp tường/trần/sàn chính hãng tại Đà Nẵng",
    "alt": "Phòng khách ốp tấm vân đá và lam gỗ",
    "ctaLabel": "Xem sản phẩm",
    "ctaHref": "/san-pham"
  }
}
```

Mọi trường đều không bắt buộc. `ctaLabel` và `ctaHref` phải có **đủ cả cặp** thì nút
mới hiện. `captions.json` viết sai cú pháp cũng không làm sập trang — chỉ là chú thích
bị bỏ qua, ảnh vẫn chạy bình thường.

## Ảnh đang có là ảnh tạm

`01-thi-cong-tam-op-tuong-phong-khach.jpg` và `02-logo-thuong-hieu.jpg` chỉ là ảnh
mẫu để xem giao diện. Cứ xoá đi và thay bằng ảnh công trình thật.

## Ghi chú kỹ thuật

Banner trang chủ lấy từ hai nguồn, ghép lại theo thứ tự:

1. Banner tạo trong trang quản trị (`/admin/banner`) — có sẵn tiêu đề, phụ đề, nút.
2. Ảnh trong thư mục này.

Lệnh `npm run build` chạy `scripts/build-banner-manifest.ts` để quét thư mục và ghi
`lib/generated/banner-manifest.json`. Trang chủ đọc file manifest đó chứ không đọc
thư mục lúc chạy, vì trên Vercel thư mục `public/` do CDN phục vụ và không nằm trong
hàm serverless. **Đừng sửa tay file manifest** — mỗi lần build nó được sinh lại.
