# VNDERCO

Website giới thiệu công ty VNDERCO — tin tức, sản phẩm (chỉ giới thiệu, không bán trực tuyến), trang tĩnh — kèm trang quản trị (`/admin`) để cập nhật toàn bộ nội dung mà không cần biết kỹ thuật. Next.js App Router, Prisma, PostgreSQL (Supabase), Auth.js.

## Yêu cầu

- Node.js 20+
- Docker (chỉ để chạy PostgreSQL cục bộ dùng cho **E2E test**, xem giải thích ở dưới)
- Một project Supabase (dev và production dùng chung một project) — cần connection string Postgres, Storage bucket, và Service Role Key

## Cơ sở dữ liệu: Supabase, không phải Docker

**CSDL phát triển và production đều là Supabase cloud.** Docker Postgres cục bộ (`docker-compose.yml`, cổng `5433`) **chỉ** dùng làm CSDL cho bộ test E2E (`vnderco_test`), vì Playwright xoá sạch và tạo lại database đó trước mỗi lượt chạy — không thể trỏ việc đó vào Supabase.

Supabase cấp hai connection string:

| Pooler | Cổng | Dùng khi nào |
|---|---|---|
| Session pooler | `5432` | `npx prisma db push` / migration — pooler ở chế độ transaction (`6543`) không hỗ trợ các lệnh DDL mà `db push` cần. Kết nối trực tiếp (direct connection) chỉ hỗ trợ IPv6 nên không dùng được ở hầu hết mạng — luôn dùng session pooler thay cho direct connection. |
| Transaction pooler | `6543` | Runtime của app khi deploy serverless (Vercel) — mỗi instance serverless mở một pool riêng, transaction pooler (pgbouncer) chịu được nhiều pool nhỏ đồng thời tốt hơn session pooler. |

`lib/db.ts` tự giới hạn `max: 3` kết nối cho mỗi pool nó tạo ra (qua `@prisma/adapter-pg`), để một tiến trình Next (dev, `next build` chạy nhiều worker song song, hay một instance serverless) không bao giờ tự chiếm hết giới hạn kết nối phía Supabase.

## Chạy lần đầu (phát triển cục bộ, dùng Supabase)

```bash
npm i
cp .env.example .env
```

Điền `.env`:

- `DATABASE_URL` — connection string **session pooler** (cổng `5432`) của project Supabase
- `AUTH_SECRET` — chuỗi ngẫu nhiên, ví dụ `openssl rand -base64 32`
- `AUTH_URL` — `http://localhost:3000` khi chạy cục bộ
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — lấy trong Supabase Dashboard → Project Settings → API. **`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng phía server, tuyệt đối không đặt tiền tố `NEXT_PUBLIC_`.**
- `SUPABASE_STORAGE_BUCKET` — mặc định `media`
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — tài khoản admin sẽ được tạo lúc seed

Trong Supabase Dashboard → Storage, tạo bucket **công khai (public)** tên trùng với `SUPABASE_STORAGE_BUCKET` (mặc định `media`) nếu chưa có — ứng dụng giới hạn ảnh tải lên tối đa 5MB, chỉ nhận `image/jpeg`, `image/png`, `image/webp`, `image/avif`.

Sau đó:

```bash
npx prisma db push   # đẩy schema lên Supabase (cần session pooler, cổng 5432)
npm run db:seed      # tạo tài khoản admin + dữ liệu mẫu tối thiểu
npm run dev
```

Đăng nhập `/admin/login` bằng tài khoản seed bên dưới.

### Chạy E2E cục bộ (Docker, tách biệt hoàn toàn khỏi Supabase)

```bash
npm run db:up                                                              # khởi động Postgres cục bộ (cổng 5433)
npx dotenv -e .env.test -- prisma db push                                  # tạo schema cho database test lần đầu
PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION="Yes, tôi đồng ý xoá database vnderco_test" npm run test:e2e:reset
npm run test:e2e
```

`test:e2e:reset` xoá sạch và seed lại `vnderco_test` — được `scripts/assert-test-db.ts` chặn nếu `DATABASE_URL` (đọc từ `.env.test`) không trỏ đúng database test cục bộ, nên lệnh này không thể vô tình chạy nhắm vào Supabase.

## Tài khoản admin mặc định

```
Email:    admin@app.com
Mật khẩu: Admin@6868
```

**Phải đổi mật khẩu này ngay sau lần đăng nhập đầu tiên** — trang admin hiển thị banner cảnh báo màu đỏ ở mọi màn hình cho tới khi mật khẩu mặc định được thay (`/admin/doi-mat-khau`). Đừng để tài khoản này ở trạng thái mặc định trên môi trường production.

## Các lệnh

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy server phát triển |
| `npm run build` | Build production (`next build`) |
| `npm run start` | Chạy server production đã build (`next start`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit test (Vitest), không chạm DB |
| `npm run test:db` | Test có chạm DB (Vitest, dùng `.env.test`) |
| `npm run test:e2e` | Playwright, các luồng chính qua `/admin` và trang công khai |
| `npm run test:e2e:reset` | Xoá sạch + seed lại `vnderco_test` (yêu cầu biến môi trường xác nhận, xem trên) |
| `npm run test:all` | Cổng kiểm thử gộp — typecheck → lint → unit test → test DB → reset DB test → E2E |
| `npm run db:up` | Khởi động Postgres cục bộ qua Docker (chỉ dùng cho E2E) |
| `npm run db:push` | `prisma db push` (dùng `.env` hiện tại) |
| `npm run db:seed` | Seed tài khoản admin + dữ liệu mẫu tối thiểu (an toàn cho production) |
| `npm run db:seed:demo` | Tạo nội dung DEMO để xem thử giao diện — bài viết, sản phẩm, trang, banner, ảnh. Chỉ dùng cho môi trường phát triển. Chạy lại được nhiều lần; không ghi đè ô cài đặt bạn đã tự nhập. Chạy xong nhớ `rm -rf .next` vì script ghi thẳng vào DB nên không dọn được cache của Next |
| `npm run db:studio` | Mở Prisma Studio |

## Deploy (Vercel)

1. Tạo project trên Vercel, kết nối repo.
2. Đặt biến môi trường trên Vercel (Project Settings → Environment Variables):
   - `DATABASE_URL` — connection string **transaction pooler** (cổng `6543`) của Supabase; đây là runtime, khác với connection string dùng lúc `prisma db push`.
   - `AUTH_SECRET` — khoá riêng cho production, khác với khoá dùng lúc phát triển.
   - `AUTH_URL` — **domain thật của site** (ví dụ `https://vnderco.vn`). Đặt sai hoặc bỏ trống sẽ khiến sitemap, RSS và JSON-LD quảng bá `http://localhost:3000` ra ngoài — kiểm tra `/sitemap.xml` sau khi deploy để chắc chắn.
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — chỉ cần lúc seed, có thể bỏ sau khi đã seed xong và đổi mật khẩu qua UI.
3. Đảm bảo Storage bucket công khai (`SUPABASE_STORAGE_BUCKET`, mặc định `media`) đã được tạo trên Supabase (xem mục Chạy lần đầu ở trên).
4. Đẩy schema và seed database production **trước khi trỏ traffic thật vào site** — chạy cục bộ, trỏ `DATABASE_URL` sang **session pooler** (cổng `5432`) của Supabase production:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
5. Deploy. Sau khi deploy xong, đăng nhập `/admin/login` bằng tài khoản seed và đổi mật khẩu ngay.

## Tài liệu liên quan

- Spec thiết kế: [`docs/superpowers/specs/2026-08-07-vnderco-website-design.md`](docs/superpowers/specs/2026-08-07-vnderco-website-design.md)
- Kế hoạch triển khai: [`docs/superpowers/plans/2026-08-07-vnderco-website.md`](docs/superpowers/plans/2026-08-07-vnderco-website.md)
