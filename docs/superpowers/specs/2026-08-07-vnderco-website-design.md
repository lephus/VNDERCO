# VNDERCO — Website tin tức & giới thiệu công ty

**Ngày:** 2026-08-07
**Trạng thái:** Đã chốt thiết kế, chờ lập kế hoạch triển khai

## 1. Mục tiêu

Website giới thiệu công ty VNDERCO gồm ba mảng nội dung — tin tức, sản phẩm, thông tin doanh nghiệp — kèm trang quản trị để người không biết kỹ thuật tự cập nhật toàn bộ nội dung. Giao diện hiện đại, màu tươi sáng, nổi bật; màu chủ đạo do admin cấu hình.

Sản phẩm chỉ được **giới thiệu**, không bán trực tuyến. Người quan tâm bấm nút liên hệ (gọi điện / email / Zalo) để trao đổi trực tiếp.

## 2. Phạm vi

**Trong phạm vi**

- Trang công khai: trang chủ, tin tức (danh sách + chi tiết), sản phẩm (danh sách + chi tiết), trang tĩnh theo slug
- Nút liên hệ trên trang sản phẩm, lấy email và số điện thoại từ cấu hình admin
- Trang admin: tin tức, danh mục, sản phẩm, trang tĩnh, banner trang chủ, thư viện ảnh, cài đặt site
- Cấu hình màu chủ đạo: 6 bảng màu dựng sẵn + tuỳ chỉnh mã hex
- Tài khoản admin seed sẵn, đổi mật khẩu được
- SEO: metadata, Open Graph, JSON-LD, sitemap, RSS

**Ngoài phạm vi**

Giỏ hàng và thanh toán · đa ngôn ngữ · bình luận · đăng ký tài khoản người dùng · form liên hệ lưu vào DB · chế độ tối · phân quyền nhiều vai trò · xem trước bản nháp qua link công khai · thùng rác / khôi phục nội dung đã xoá.

## 3. Công nghệ & triển khai

| Hạng mục | Lựa chọn |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| CSDL | PostgreSQL trên Supabase (dev + prod); Docker cục bộ chỉ dùng cho E2E |
| ORM | Prisma |
| Giao diện | Tailwind CSS + shadcn/ui |
| Soạn thảo | Tiptap |
| Xác thực | Auth.js (NextAuth v5), Credentials provider |
| Lưu ảnh | Supabase Storage (bucket công khai) |
| Kiểm thử | Vitest (unit) + Playwright (E2E) |
| Deploy | Vercel |

Một codebase duy nhất cho cả web công khai lẫn admin.

**Biến môi trường**

```
DATABASE_URL=            # chuỗi kết nối Postgres
AUTH_SECRET=             # khoá ký JWT phiên đăng nhập
AUTH_URL=                # URL gốc của site
SUPABASE_URL=            # https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=  # chỉ dùng phía server, bỏ qua RLS
SUPABASE_STORAGE_BUCKET= # tên bucket công khai, mặc định "media"
SEED_ADMIN_EMAIL=admin@app.com
SEED_ADMIN_PASSWORD=Admin@6868
```

## 4. Chiến lược render

Trang công khai render tĩnh kèm ISR. Nội dung và cấu hình màu được đọc lúc render rồi nhúng thẳng vào HTML; khi admin lưu thay đổi, server action gọi `revalidateTag` để làm mới đúng những trang liên quan.

Lý do chọn thay vì SSR toàn bộ: tin tức cần tốc độ và SEO, còn Neon/Supabase gói miễn phí tính theo thời lượng compute — mỗi lượt xem một truy vấn DB sẽ chạm trần nhanh khi có traffic từ mạng xã hội.

Rủi ro đã biết của cách này là quên gọi revalidate ở một nhánh ghi nào đó. Cách chặn: **mọi thao tác ghi bắt buộc đi qua một helper server action chung**, helper này tự kiểm tra đăng nhập → validate → ghi → revalidate theo tag. Form trong admin không được gọi Prisma trực tiếp.

**Danh sách tag**

| Tag | Làm mới khi |
|---|---|
| `settings` | Đổi bất kỳ mục nào trong Cài đặt site (kể cả màu — kéo theo làm mới toàn site) |
| `posts` / `post:<slug>` | Tạo, sửa, xoá, đổi trạng thái bài viết |
| `products` / `product:<slug>` | Tạo, sửa, xoá sản phẩm |
| `pages` / `page:<slug>` | Tạo, sửa, xoá trang tĩnh |
| `banners` | Thay đổi banner trang chủ |
| `categories` | Thay đổi danh mục |

Làm mới chủ yếu theo tag (on-demand). Ngoài ra mỗi trang công khai đặt `revalidate = 3600` làm lưới an toàn: nếu có nhánh ghi nào lỡ sót tag thì nội dung vẫn tự lên sau tối đa một giờ thay vì kẹt vĩnh viễn.

## 5. Cấu trúc thư mục

```
app/
  (public)/
    layout.tsx           header, footer, nhúng biến CSS màu
    page.tsx             trang chủ
    tin-tuc/page.tsx     danh sách tin (lọc + phân trang)
    tin-tuc/[slug]/      chi tiết tin
    san-pham/page.tsx    danh sách sản phẩm
    san-pham/[slug]/     chi tiết sản phẩm + nút liên hệ
    [slug]/              trang tĩnh
  admin/
    login/
    (dashboard)/
      layout.tsx         sidebar + dải cảnh báo mật khẩu mặc định
      page.tsx           tổng quan
      tin-tuc/  san-pham/  danh-muc/  trang/  banner/  thu-vien/  cai-dat/  doi-mat-khau/
  sitemap.ts  robots.ts  rss.xml/route.ts
lib/
  db.ts                  Prisma client
  auth.ts                cấu hình Auth.js
  queries/               hàm đọc, bọc cache theo tag
  actions/               server action ghi — chỗ DUY NHẤT được ghi DB
  theme/
    presets.ts           6 bảng màu dựng sẵn
    palette.ts           sinh dải màu từ 1 mã hex
  storage.ts             upload Vercel Blob
  slug.ts                sinh slug tiếng Việt
  validation/            schema Zod
components/
  ui/                    shadcn/ui
  public/                component trang công khai
  admin/                 component trang quản trị
prisma/
  schema.prisma
  seed.ts
```

Ranh giới cốt lõi: `lib/queries` chỉ đọc, `lib/actions` chỉ ghi và luôn revalidate. Component không import Prisma.

## 6. Mô hình dữ liệu

```prisma
enum Role          { ADMIN }
enum CategoryType  { NEWS PRODUCT }
enum ContentStatus { DRAFT PUBLISHED }
enum ThemeMode     { PRESET CUSTOM }

model User {
  id                  String   @id @default(cuid())
  email               String   @unique
  passwordHash        String
  name                String
  role                Role     @default(ADMIN)
  usingDefaultPassword Boolean @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  posts               Post[]
}

model Category {
  id        String       @id @default(cuid())
  name      String
  slug      String
  type      CategoryType
  order     Int          @default(0)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
  posts     Post[]
  products  Product[]

  @@unique([type, slug])
  @@index([type, order])
}

model Post {
  id             String        @id @default(cuid())
  title          String
  slug           String        @unique
  excerpt        String?
  content        String                        // HTML đã làm sạch
  coverImageUrl  String?
  coverImageAlt  String?
  categoryId     String?
  category       Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  authorId       String?
  author         User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  status         ContentStatus @default(DRAFT)
  featured       Boolean       @default(false)
  publishedAt    DateTime?
  seoTitle       String?
  seoDescription String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([status, publishedAt])
  @@index([categoryId])
}

model Product {
  id             String         @id @default(cuid())
  name           String
  slug           String         @unique
  summary        String?
  description    String                        // HTML đã làm sạch
  specs          Json           @default("[]") // [{ "label": "Công suất", "value": "500W" }]
  categoryId     String?
  category       Category?      @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  status         ContentStatus  @default(DRAFT)
  featured       Boolean        @default(false)
  order          Int            @default(0)
  seoTitle       String?
  seoDescription String?
  images         ProductImage[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([status, order])
  @@index([categoryId])
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  alt       String?
  order     Int     @default(0)

  @@index([productId, order])
}

model Page {
  id             String        @id @default(cuid())
  title          String
  slug           String        @unique
  content        String
  status         ContentStatus @default(DRAFT)
  seoTitle       String?
  seoDescription String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model Banner {
  id        String   @id @default(cuid())
  title     String
  subtitle  String?
  imageUrl  String
  imageAlt  String?
  ctaLabel  String?
  ctaHref   String?
  order     Int      @default(0)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([active, order])
}

model Media {
  id        String   @id @default(cuid())
  url       String   @unique
  pathname  String
  filename  String
  mimeType  String
  size      Int
  width     Int?
  height    Int?
  alt       String?
  createdAt DateTime @default(now())
}

model SiteSetting {
  id                 Int       @id @default(1)   // bản ghi đơn, luôn id = 1
  siteName           String    @default("VNDERCO")
  logoUrl            String?
  faviconUrl         String?
  contactEmail       String    @default("")
  contactPhone       String    @default("")
  contactAddress     String?
  zaloUrl            String?
  facebookUrl        String?
  themeMode          ThemeMode @default(PRESET)
  presetKey          String    @default("violet")
  customPrimary      String?                     // mã hex, chỉ dùng khi themeMode = CUSTOM
  homeIntroTitle     String    @default("")      // dải giới thiệu công ty ở trang chủ
  homeIntroBody      String    @default("")
  homeIntroImageUrl  String?
  homeIntroCtaLabel  String?
  homeIntroCtaHref   String?
  seoTitleTemplate   String    @default("%s | VNDERCO")
  seoDescription     String    @default("")
  seoOgImageUrl      String?
  updatedAt          DateTime  @updatedAt
}
```

**Ghi chú thiết kế**

- `Category` dùng chung cho tin và sản phẩm, phân biệt bằng `type`. Hai bảng riêng sẽ có cấu trúc và màn hình quản trị y hệt nhau, chỉ khác bộ lọc.
- Thông số sản phẩm lưu JSON mảng `{label, value}` thay vì bảng riêng: chỉ để hiển thị, không cần lọc hay so sánh theo thông số.
- Xoá danh mục không xoá nội dung — quan hệ đặt `SetNull`, bài viết/sản phẩm rơi về "chưa phân loại".
- `usingDefaultPassword` bật lúc seed, tắt khi admin đổi mật khẩu; điều khiển dải cảnh báo trong admin.
- Dải giới thiệu công ty ở trang chủ lấy từ nhóm trường `homeIntro*` trong `SiteSetting`, không lấy từ `Page`. Lý do: nó là một khối có cấu trúc cố định (tiêu đề, đoạn mô tả, ảnh, nút), còn `Page.content` là HTML tự do không cắt ra được các phần đó.

## 7. Hệ thống màu

### 7.1 Sinh bảng màu

Đầu vào là **một mã hex**. Thuật toán:

1. Chuyển hex sang OKLCH.
2. Sinh dải `primary-50 → primary-900` bằng cách giữ nguyên sắc độ và độ bão hoà, chỉ thay đổi độ sáng theo các mốc định sẵn.
3. Màu thứ hai của gradient = xoay sắc độ +45° và tăng độ sáng. Đây là nguồn của hiệu ứng tím → hồng → cam.
4. Màu chữ trên nền chủ đạo chọn đen hoặc trắng theo độ tương phản tính được, không cố định.

Dùng OKLCH thay vì HSL vì HSL cho độ sáng không đồng đều giữa các sắc độ — cùng một giá trị L, màu vàng và màu xanh dương nhìn lệch hẳn nhau.

Đầu vào không hợp lệ (hex sai định dạng, thiếu) → quay về bảng màu mặc định `violet`, không để trang trắng.

### 7.2 Đưa vào trang

`app/(public)/layout.tsx` đọc `SiteSetting` (query có cache, tag `settings`), tính bảng màu, in ra biến CSS ngay trên thẻ `<html>` trong HTML server trả về. Tailwind trỏ token màu vào các biến này.

Vì màu nằm sẵn trong HTML đầu tiên nên không có hiện tượng đổi màu giật một nhịp khi tải trang.

**Đánh đổi đã chấp nhận:** màu nằm ở layout gốc nên đổi màu phải revalidate toàn site. Thao tác này hiếm.

### 7.3 Bảng màu dựng sẵn

Sáu bảng, mỗi bảng chỉ là một mã hex chủ đạo kèm tên: tím, xanh ngọc, xanh dương, cam, hồng, xanh lá. Định nghĩa trong `lib/theme/presets.ts`.

## 8. Xác thực & seed

- Auth.js Credentials provider, mật khẩu băm bcrypt, phiên JWT trong cookie `httpOnly`.
- Middleware chặn `/admin/*`, trừ `/admin/login`.
- Một vai trò `ADMIN`. Trường `role` giữ sẵn để mở rộng sau mà không phải migrate.
- `prisma/seed.ts` chạy upsert (gọi lại nhiều lần không lỗi), tạo:
  - tài khoản admin từ `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, mặc định `admin@app.com` / `Admin@6868`, đặt `usingDefaultPassword = true`
  - bản ghi `SiteSetting` mặc định (bảng màu `violet`, tên site VNDERCO)
  - vài danh mục mẫu cho tin và sản phẩm

**Về mật khẩu mặc định:** mật khẩu này nằm trong mã nguồn và tài liệu nên ai đọc repo cũng biết. Đây là yêu cầu của khách và được giữ nguyên, kèm hai biện pháp giảm rủi ro:

1. Màn hình **Đổi mật khẩu** trong admin.
2. Dải cảnh báo đỏ hiện ở mọi trang admin chừng nào `usingDefaultPassword` còn `true`, tự biến mất sau khi đổi.

## 9. Trang quản trị

Bố cục sidebar trái + vùng nội dung, tông trung tính (không gradient) vì đây là chỗ làm việc lâu. Màu chủ đạo chỉ xuất hiện ở nút chính và trạng thái đang chọn.

Mỗi loại nội dung dùng chung một khuôn: trang danh sách (tìm kiếm, lọc theo danh mục và trạng thái, phân trang) + trang form.

| Màn hình | Nội dung |
|---|---|
| Tổng quan | Số lượng bài viết / sản phẩm / trang, danh sách sửa gần đây |
| Tin tức | CRUD `Post`, đổi trạng thái nháp ↔ xuất bản, đánh dấu nổi bật |
| Sản phẩm | CRUD `Product` + nhiều ảnh có thứ tự + bảng thông số key–value |
| Danh mục | CRUD `Category`, lọc theo `type` |
| Trang tĩnh | CRUD `Page` |
| Banner | CRUD `Banner`, sắp thứ tự, bật/tắt |
| Thư viện ảnh | Lưới `Media`, upload, sửa alt, xoá |
| Cài đặt | Chung · Liên hệ · Giao diện · Trang chủ (dải giới thiệu) · SEO mặc định |
| Đổi mật khẩu | Mật khẩu cũ + mới |

**Slug** tự sinh từ tiêu đề tiếng Việt (bỏ dấu, `Sản phẩm mới 2026` → `san-pham-moi-2026`), sửa tay được, kiểm tra trùng trước khi lưu, trùng thì gợi ý thêm hậu tố số.

**Xoá** là xoá thật, có hộp thoại xác nhận. Không làm thùng rác.

**Soạn thảo** bằng Tiptap: tiêu đề, in đậm/nghiêng, danh sách, trích dẫn, liên kết, chèn ảnh từ thư viện, nhúng YouTube. Nội dung lưu HTML, làm sạch phía server trước khi ghi.

**Màn hình Cài đặt → Giao diện** hiển thị 6 ô bảng màu dựng sẵn + mục tuỳ chỉnh nhập hex, kèm khung xem trước cập nhật tức thì. Chưa bấm lưu thì web thật chưa đổi.

## 10. Trang công khai

| Đường dẫn | Nội dung |
|---|---|
| `/` | Hero gradient chạy slide banner → tin nổi bật → sản phẩm nổi bật → giới thiệu công ty → CTA liên hệ |
| `/tin-tuc` | Danh sách tin, lọc danh mục qua `?danh-muc=`, phân trang |
| `/tin-tuc/[slug]` | Chi tiết bài + bài liên quan cùng danh mục |
| `/san-pham` | Danh sách sản phẩm, lọc danh mục |
| `/san-pham/[slug]` | Chi tiết: bộ ảnh, mô tả, bảng thông số, **cụm nút liên hệ** |
| `/[slug]` | Trang tĩnh theo slug |

Lọc bằng tham số truy vấn thay vì đường dẫn lồng, để không phải sinh tĩnh mọi tổ hợp danh mục × số trang.

**Số lượng cố định** (tránh mơ hồ lúc triển khai): danh sách tin và sản phẩm 12 mục mỗi trang; trang chủ hiện tối đa 6 tin nổi bật (sắp theo `publishedAt` giảm dần) và 8 sản phẩm nổi bật (sắp theo `order` tăng dần); bài liên quan hiện 3 bài cùng danh mục, mới nhất trước.

**Giao diện** theo hướng đã chọn: hero gradient phủ kín, chữ tiêu đề lớn đậm, nút bo tròn, thẻ nội dung bo góc có đổ bóng nhuốm màu chủ đạo. Chỉ chế độ sáng.

**Cụm nút liên hệ ở trang sản phẩm** lấy dữ liệu từ Cài đặt → Liên hệ:

- Nút gọi → `tel:{contactPhone}`
- Nút email → `mailto:{contactEmail}` với tiêu đề điền sẵn `Hỏi về sản phẩm {tên sản phẩm}`
- Nút Zalo → hiện khi `zaloUrl` có giá trị

Trên màn hình điện thoại cụm nút dính ở đáy.

**SEO**

- `generateMetadata` theo từng trang, có Open Graph và Twitter Card
- Ảnh chia sẻ mạng xã hội chọn theo thứ tự ưu tiên: ảnh bìa của bài / ảnh đầu tiên của sản phẩm → `seoOgImageUrl` trong Cài đặt → ảnh sinh động từ tiêu đề + màu chủ đạo
- JSON-LD: `Article` (tin), `Product` (sản phẩm), `Organization` (toàn site), `BreadcrumbList`
- `sitemap.xml` và `robots.txt` sinh động từ DB
- `rss.xml` cho mục tin tức
- Nội dung `DRAFT` không xuất hiện ở bất kỳ trang công khai, sitemap hay RSS nào

## 11. Xử lý lỗi

**Server action** trả về `{ ok: true, data }` hoặc `{ ok: false, fieldErrors }`, không ném lỗi ra ngoài. Form hiển thị lỗi ngay dưới từng ô, lấy từ Zod, **giữ nguyên nội dung người dùng đã nhập** — mất bài viết đang soạn vì lỗi validate là kiểu hỏng nặng nhất ở CMS.

**Route** mỗi nhánh có `not-found.tsx` và `error.tsx` riêng. Trang 404 công khai giữ đúng giao diện và màu của site.

**Upload** thất bại thì báo tại chỗ, cho thử lại, không mất nội dung đang soạn. Chỉ nhận jpg/png/webp/avif, tối đa 5MB, kiểm tra ở cả trình duyệt lẫn server.

**Cấu hình màu hỏng** → quay về bảng màu mặc định thay vì để trang trắng.

## 12. Kiểm thử

Tập trung ba chỗ dễ sai, không đuổi theo độ phủ.

**Vitest — logic thuần**

- Sinh bảng màu: hex → dải OKLCH; chọn màu chữ theo tương phản; các ca biên gồm vàng chanh cực sáng, đen tuyền, hex sai định dạng
- Sinh slug tiếng Việt: `Đầu tư & phát triển` → `dau-tu-phat-trien`; xử lý đ/Đ; trùng slug thì thêm hậu tố
- Schema Zod của từng loại nội dung

**Playwright — luồng thật**

1. Đăng nhập bằng tài khoản seed → tạo bài viết → xuất bản → bài xuất hiện ở `/tin-tuc`
2. Đổi màu chủ đạo trong Cài đặt → biến CSS ở trang công khai đổi theo
3. Trang sản phẩm có nút gọi và nút email đúng số điện thoại và email trong Cài đặt

Luồng 2 quan trọng nhất — nó bắt đúng rủi ro của ISR: dữ liệu đã lưu nhưng trang tĩnh chưa được làm mới.

## 13. Các quyết định đã chốt

| Quyết định | Lý do |
|---|---|
| Next.js full-stack thay vì tách FE/BE | Một codebase đủ cho phạm vi này; SEO tốt cho tin tức |
| Chỉ tiếng Việt | Data model gọn nhất; chưa có nhu cầu tiếng Anh |
| Vercel + Neon/Supabase | Không tự quản hạ tầng; kéo theo phải dùng object storage cho ảnh |
| Tĩnh + ISR thay vì SSR toàn bộ | Nhanh hơn, ít tốn compute DB; đổi lại phải kỷ luật về revalidate |
| Hướng thiết kế "gradient nổi bật" | Khách yêu cầu nổi bật, hiện đại, màu tươi sáng |
| Bảng màu dựng sẵn + tuỳ chỉnh hex | Mặc định luôn đẹp, vẫn dùng được đúng màu thương hiệu khi cần |
| Một bảng `Category` chung | Hai bảng riêng chỉ nhân đôi code |
| Thông số sản phẩm dạng JSON | Chỉ để hiển thị, không cần lọc theo thông số |
| Không form liên hệ | Yêu cầu chỉ là nút liên hệ; form kéo theo chống spam, thông báo, màn hình quản lý |
| Không dark mode | Yêu cầu là màu tươi sáng; làm thêm nhân đôi công kiểm thử giao diện |
| Xoá thật, không thùng rác | "Quản trị cơ bản"; có hộp thoại xác nhận là đủ |
