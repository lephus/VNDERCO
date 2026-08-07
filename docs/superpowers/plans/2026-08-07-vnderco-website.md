# VNDERCO Website — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây website tin tức + giới thiệu sản phẩm/công ty cho VNDERCO, kèm trang admin tự quản trị toàn bộ nội dung và cấu hình được màu chủ đạo.

**Architecture:** Một Next.js App Router duy nhất, chia hai vùng bằng route group `(public)` và `admin`. Trang công khai render tĩnh + ISR, làm mới bằng `revalidateTag` do server action gọi. Mọi thao tác ghi DB bắt buộc đi qua một helper server action chung (xác thực → validate Zod → ghi Prisma → revalidate), component không được ghi DB trực tiếp.

**Tech Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma · PostgreSQL · Auth.js (NextAuth v5) · Tiptap · culori · Vercel Blob · Vitest · Playwright

**Spec:** `docs/superpowers/specs/2026-08-07-vnderco-website-design.md`

## Global Constraints

Mọi task đều phải tuân thủ phần này.

- **Ngôn ngữ:** chỉ tiếng Việt. Nhãn giao diện, thông báo lỗi, nội dung mẫu đều tiếng Việt. Code, tên biến, commit message dùng tiếng Anh.
- **Chỉ chế độ sáng.** Không dark mode, không `prefers-color-scheme`, không lớp `dark:`.
- **Tài khoản seed:** `SEED_ADMIN_EMAIL` mặc định `admin@app.com`, `SEED_ADMIN_PASSWORD` mặc định `Admin@6868`.
- **Kỷ luật ghi dữ liệu:** chỉ file trong `lib/actions/` được gọi `prisma.*.create/update/delete`. Component và route handler không import `prisma` để ghi. Mọi action đi qua `createAction()` (Task 6).
- **Nội dung `DRAFT` không bao giờ lộ ra ngoài:** không ở trang công khai, không ở `sitemap.xml`, không ở `rss.xml`, không ở khối liên quan.
- **ISR:** mỗi trang công khai đặt `export const revalidate = 3600` làm lưới an toàn, kết hợp `revalidateTag` on-demand.
- **Tag cache:** `settings` · `posts` · `post:<slug>` · `products` · `product:<slug>` · `pages` · `page:<slug>` · `banners` · `categories`.
- **Số lượng cố định:** danh sách 12 mục/trang · trang chủ 6 tin nổi bật (theo `publishedAt` giảm dần) và 8 sản phẩm nổi bật (theo `order` tăng dần) · 3 bài liên quan.
- **Ảnh:** chỉ `image/jpeg`, `image/png`, `image/webp`, `image/avif`; tối đa 5MB; kiểm tra ở cả client lẫn server.
- **Đường dẫn công khai tiếng Việt không dấu:** `/tin-tuc`, `/san-pham`, `/[slug]`. Lọc danh mục bằng query `?danh-muc=`.
- **Xoá là xoá thật**, luôn có hộp thoại xác nhận. Không thùng rác.
- **Bảng màu mặc định:** `presetKey = "violet"`. Đầu vào màu không hợp lệ luôn quay về preset này, không bao giờ để trang trắng.

---

## Cấu trúc file

Bảng dưới là bản đồ trách nhiệm. Mỗi file một việc; file nào thay đổi cùng nhau thì ở cạnh nhau.

| File | Trách nhiệm | Task |
|---|---|---|
| `docker-compose.yml` | Postgres cho dev + test cục bộ | 1 |
| `vitest.config.ts` · `playwright.config.ts` | Cấu hình 2 tầng kiểm thử | 1, 5 |
| `lib/slug.ts` | Sinh slug tiếng Việt, khử trùng | 2 |
| `lib/theme/presets.ts` | 6 bảng màu dựng sẵn (hex + tên) | 3 |
| `lib/theme/palette.ts` | Hex → dải OKLCH + gradient + màu chữ | 3 |
| `prisma/schema.prisma` | 9 model theo spec §6 | 4 |
| `prisma/seed.ts` | Upsert admin + SiteSetting + danh mục mẫu | 4 |
| `lib/db.ts` | Prisma client singleton | 4 |
| `lib/auth.config.ts` | Cấu hình Auth.js **edge-safe** (không import Prisma) | 5 |
| `lib/auth.ts` | Auth.js đầy đủ, có Credentials + Prisma | 5 |
| `middleware.ts` | Chặn `/admin/*` | 5 |
| `lib/actions/helper.ts` | `createAction()` — auth + Zod + ghi + revalidate | 6 |
| `lib/queries/*.ts` | Hàm đọc, bọc `unstable_cache` theo tag | 6 |
| `lib/validation/*.ts` | Schema Zod từng loại nội dung | 6, 9–13 |
| `components/admin/*` | Vỏ danh sách, vỏ form, hook form, hộp thoại xoá | 9 |
| `lib/storage.ts` | Upload/xoá Vercel Blob | 8 |
| `components/admin/MediaPicker.tsx` | Chọn ảnh từ thư viện | 8 |
| `components/admin/RichTextEditor.tsx` | Tiptap + làm sạch HTML | 10 |
| `app/(public)/layout.tsx` | Nhúng biến CSS màu, header, footer | 14 |
| `app/sitemap.ts` · `app/robots.ts` · `app/rss.xml/route.ts` | SEO kỹ thuật | 18 |

---

## Task 1: Khởi tạo dự án + hạ tầng kiểm thử

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `vitest.config.ts`, `docker-compose.yml`, `.env.example`, `.env`, `.env.test`
- Test: `lib/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: không có (task đầu tiên)
- Produces: lệnh `npm run dev`, `npm test`, `npm run db:up`; alias import `@/*` trỏ về gốc repo

- [ ] **Step 1: Tạo skeleton Next.js**

Chạy tại gốc repo (`/Users/lehuuphu/Documents/workspace/freelancer/VNDERCO`). Repo đã có `.gitignore`, `README.md`, `docs/` — dùng `.` để tạo tại chỗ:

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias "@/*" --eslint --no-turbopack
```

Khi được hỏi ghi đè `.gitignore` hoặc `README.md`: **chọn không**. `.gitignore` hiện tại đã đúng.

- [ ] **Step 2: Cài phụ thuộc**

```bash
npm i @prisma/client @prisma/adapter-pg pg next-auth@beta bcryptjs zod culori @vercel/blob
npm i -D prisma vitest @vitejs/plugin-react @types/bcryptjs @types/culori @types/pg tsx dotenv-cli
```

`@prisma/adapter-pg` và `pg` là bắt buộc, không phải tuỳ chọn: từ Prisma 7, `new PrismaClient()` không có driver adapter sẽ ném `PrismaClientInitializationError`. Cùng một adapter dùng được cho cả Postgres trong Docker lúc dev lẫn Neon/Supabase lúc chạy thật.

- [ ] **Step 3: Postgres cục bộ**

`docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: vnderco
      POSTGRES_PASSWORD: vnderco
      POSTGRES_DB: vnderco
    ports: ["5433:5432"]
    volumes: ["vnderco_pg:/var/lib/postgresql/data"]
volumes:
  vnderco_pg:
```

`.env.example` (commit file này; `.env` và `.env.test` đã bị `.gitignore` bỏ qua):

```
DATABASE_URL="postgresql://vnderco:vnderco@localhost:5433/vnderco"
AUTH_SECRET=""
AUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN=""
SEED_ADMIN_EMAIL="admin@app.com"
SEED_ADMIN_PASSWORD="Admin@6868"
```

Tạo `.env` bằng cách copy `.env.example` rồi sinh `AUTH_SECRET`:

```bash
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Dán giá trị vào `AUTH_SECRET` trong `.env`.

Tạo `.env.test` giống `.env` nhưng đổi tên DB để test không đụng dữ liệu dev:

```
DATABASE_URL="postgresql://vnderco:vnderco@localhost:5433/vnderco_test"
```

- [ ] **Step 4: Cấu hình Vitest**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    exclude: ['node_modules', '.next', 'e2e'],
  },
  resolve: { alias: { '@': path.resolve(__dirname) } },
})
```

Thêm script vào `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:up": "docker compose up -d",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

- [ ] **Step 5: Viết test khói cho biết hạ tầng chạy được**

`lib/__tests__/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest'

describe('hạ tầng kiểm thử', () => {
  it('chạy được test và resolve alias @', async () => {
    const mod = await import('@/lib/env-marker')
    expect(mod.MARKER).toBe('vnderco')
  })
})
```

- [ ] **Step 6: Chạy test để xác nhận nó fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/env-marker'`

- [ ] **Step 7: Viết code tối thiểu cho test pass**

`lib/env-marker.ts`:

```ts
export const MARKER = 'vnderco'
```

- [ ] **Step 8: Chạy lại test**

Run: `npm test`
Expected: PASS (1 test)

- [ ] **Step 9: Xác nhận app chạy và DB lên được**

```bash
npm run db:up
docker compose exec db psql -U vnderco -c "CREATE DATABASE vnderco_test;"
npm run dev
```

Mở `http://localhost:3000` — phải thấy trang mặc định của Next.js. Dừng server bằng Ctrl-C.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Vitest and local Postgres"
```

---

## Task 2: Sinh slug tiếng Việt

Slug xuất hiện trong URL của mọi loại nội dung, nên viết nó trước và viết cho đúng. Điểm bẫy: `Đ`/`đ` (U+0110/U+0111) **không** phân rã được bằng NFD, phải thay tay trước khi khử dấu.

**Files:**
- Create: `lib/slug.ts`
- Test: `lib/__tests__/slug.test.ts`

**Interfaces:**
- Consumes: không
- Produces:
  - `slugify(input: string): string`
  - `uniqueSlug(base: string, taken: string[]): string`

- [ ] **Step 1: Viết test fail trước**

`lib/__tests__/slug.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { slugify, uniqueSlug } from '@/lib/slug'

describe('slugify', () => {
  it('khử dấu tiếng Việt', () => {
    expect(slugify('Sản phẩm mới 2026')).toBe('san-pham-moi-2026')
  })

  it('xử lý được chữ Đ và đ vốn không phân rã bằng NFD', () => {
    expect(slugify('Đầu tư & phát triển')).toBe('dau-tu-phat-trien')
    expect(slugify('Đồng Nai')).toBe('dong-nai')
  })

  it('gộp khoảng trắng và ký tự đặc biệt thành một dấu gạch', () => {
    expect(slugify('  Xin   chào --- thế giới!!! ')).toBe('xin-chao-the-gioi')
  })

  it('không để lại dấu gạch thừa ở hai đầu', () => {
    expect(slugify('---Tin tức---')).toBe('tin-tuc')
  })

  it('trả về "noi-dung" khi không còn ký tự hợp lệ nào', () => {
    expect(slugify('!!!')).toBe('noi-dung')
    expect(slugify('   ')).toBe('noi-dung')
  })
})

describe('uniqueSlug', () => {
  it('giữ nguyên khi chưa ai dùng', () => {
    expect(uniqueSlug('tin-tuc', ['san-pham'])).toBe('tin-tuc')
  })

  it('thêm hậu tố số khi trùng', () => {
    expect(uniqueSlug('tin-tuc', ['tin-tuc'])).toBe('tin-tuc-2')
    expect(uniqueSlug('tin-tuc', ['tin-tuc', 'tin-tuc-2'])).toBe('tin-tuc-3')
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npx vitest run lib/__tests__/slug.test.ts`
Expected: FAIL — `Cannot find module '@/lib/slug'`

- [ ] **Step 3: Viết implementation**

`lib/slug.ts`:

```ts
const FALLBACK = 'noi-dung'

export function slugify(input: string): string {
  const slug = input
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || FALLBACK
}

export function uniqueSlug(base: string, taken: string[]): string {
  const used = new Set(taken)
  if (!used.has(base)) return base

  let n = 2
  while (used.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `npx vitest run lib/__tests__/slug.test.ts`
Expected: PASS (7 test)

- [ ] **Step 5: Commit**

```bash
git add lib/slug.ts lib/__tests__/slug.test.ts
git commit -m "feat: add Vietnamese slug generation"
```

---

## Task 3: Sinh bảng màu từ một mã hex

Đây là logic khó nhất của dự án và là thứ khiến tính năng "admin đổi màu" hoạt động. Dùng OKLCH thay vì HSL vì HSL cho độ sáng cảm nhận không đồng đều giữa các sắc độ.

**Files:**
- Create: `lib/theme/presets.ts`, `lib/theme/palette.ts`
- Test: `lib/theme/__tests__/palette.test.ts`

**Interfaces:**
- Consumes: không
- Produces:
  - `PRESETS: Record<PresetKey, { name: string; primary: string }>` với `PresetKey = 'violet' | 'teal' | 'blue' | 'orange' | 'pink' | 'green'`
  - `DEFAULT_PRESET_KEY = 'violet'`
  - `type Palette = { shades: Record<Shade, string>; primary: string; foreground: string; gradientFrom: string; gradientVia: string; gradientTo: string }` với `Shade = 50|100|200|300|400|500|600|700|800|900`
  - `buildPalette(hex: string): Palette` — đầu vào hỏng thì trả về palette của preset `violet`
  - `paletteToCssVars(p: Palette): Record<string, string>` — khoá dạng `--vnd-primary-500`, `--vnd-primary-fg`, `--vnd-gradient-from`…

- [ ] **Step 1: Viết bộ màu dựng sẵn**

`lib/theme/presets.ts`:

```ts
export const PRESETS = {
  violet: { name: 'Tím', primary: '#6C3DF4' },
  teal:   { name: 'Xanh ngọc', primary: '#0EA5A4' },
  blue:   { name: 'Xanh dương', primary: '#0057FF' },
  orange: { name: 'Cam', primary: '#F97316' },
  pink:   { name: 'Hồng', primary: '#EC4899' },
  green:  { name: 'Xanh lá', primary: '#16A34A' },
} as const

export type PresetKey = keyof typeof PRESETS
export const DEFAULT_PRESET_KEY: PresetKey = 'violet'

export function isPresetKey(value: string): value is PresetKey {
  // Object.hasOwn, KHÔNG dùng `in`: `in` đi cả chuỗi prototype nên 'toString',
  // 'constructor', '__proto__' đều lọt. Hàm này là validator cho dữ liệu người
  // dùng gửi lên ở Task 13 — lọt là ghi rác vào DB.
  return Object.hasOwn(PRESETS, value)
}
```

- [ ] **Step 2: Viết test fail trước**

`lib/theme/__tests__/palette.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildPalette, paletteToCssVars, SHADES } from '@/lib/theme/palette'
import { PRESETS } from '@/lib/theme/presets'

const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v)

describe('buildPalette', () => {
  it('trả về đủ 10 bậc, tất cả đều là mã hex hợp lệ', () => {
    const p = buildPalette('#6C3DF4')
    expect(Object.keys(p.shades).map(Number)).toEqual([...SHADES])
    for (const shade of SHADES) expect(isHex(p.shades[shade])).toBe(true)
  })

  it('độ sáng giảm dần đều từ bậc 50 xuống bậc 900', () => {
    const p = buildPalette('#0EA5A4')
    const luminance = (hex: string) => {
      const n = parseInt(hex.slice(1), 16)
      return ((n >> 16) & 255) * 0.2126 + ((n >> 8) & 255) * 0.7152 + (n & 255) * 0.0722
    }
    for (let i = 1; i < SHADES.length; i++) {
      expect(luminance(p.shades[SHADES[i]])).toBeLessThan(luminance(p.shades[SHADES[i - 1]]))
    }
  })

  it('chọn chữ trắng trên nền tím đậm', () => {
    expect(buildPalette('#6C3DF4').foreground).toBe('#ffffff')
  })

  it('chọn chữ đen trên nền vàng chanh cực sáng', () => {
    expect(buildPalette('#EAFF00').foreground).toBe('#111827')
  })

  it('không vỡ với đen tuyền và trắng tinh', () => {
    expect(isHex(buildPalette('#000000').shades[500])).toBe(true)
    expect(isHex(buildPalette('#FFFFFF').shades[500])).toBe(true)
    expect(buildPalette('#FFFFFF').foreground).toBe('#111827')
  })

  it('quay về preset violet khi mã màu sai định dạng', () => {
    const fallback = buildPalette(PRESETS.violet.primary)
    expect(buildPalette('khong-phai-mau')).toEqual(fallback)
    expect(buildPalette('')).toEqual(fallback)
    expect(buildPalette('#12345')).toEqual(fallback)
  })

  it('gradient gồm 3 chặng khác nhau, sáng dần', () => {
    const p = buildPalette('#6C3DF4')
    expect(p.gradientFrom).not.toBe(p.gradientVia)
    expect(p.gradientVia).not.toBe(p.gradientTo)
    expect([p.gradientFrom, p.gradientVia, p.gradientTo].every(isHex)).toBe(true)
  })
})

describe('paletteToCssVars', () => {
  it('sinh đúng tên biến CSS', () => {
    const vars = paletteToCssVars(buildPalette('#6C3DF4'))
    expect(vars['--vnd-primary-500']).toMatch(/^#/)
    expect(vars['--vnd-primary-fg']).toBe('#ffffff')
    expect(vars['--vnd-gradient-from']).toMatch(/^#/)
    expect(vars['--vnd-gradient-via']).toMatch(/^#/)
    expect(vars['--vnd-gradient-to']).toMatch(/^#/)
  })
})
```

- [ ] **Step 3: Chạy test để xác nhận fail**

Run: `npx vitest run lib/theme/__tests__/palette.test.ts`
Expected: FAIL — `Cannot find module '@/lib/theme/palette'`

- [ ] **Step 4: Viết implementation**

`lib/theme/palette.ts`:

```ts
import { converter, formatHex, parse, wcagContrast } from 'culori'
import { DEFAULT_PRESET_KEY, PRESETS } from './presets'

const toOklch = converter('oklch')

export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
export type Shade = (typeof SHADES)[number]

// Độ sáng (L) cố định theo bậc; độ bão hoà (C) co lại ở hai đầu để tránh màu bệt.
const RAMP: Record<Shade, { l: number; c: number }> = {
  50:  { l: 0.97, c: 0.25 },
  100: { l: 0.94, c: 0.40 },
  200: { l: 0.88, c: 0.60 },
  300: { l: 0.80, c: 0.80 },
  400: { l: 0.70, c: 0.95 },
  500: { l: 0.62, c: 1.00 },
  600: { l: 0.55, c: 1.00 },
  700: { l: 0.47, c: 0.92 },
  800: { l: 0.39, c: 0.82 },
  900: { l: 0.31, c: 0.70 },
}

const LIGHT_TEXT = '#ffffff'
const DARK_TEXT = '#111827'

export type Palette = {
  primary: string
  foreground: string
  shades: Record<Shade, string>
  gradientFrom: string
  gradientVia: string
  gradientTo: string
}

function shift(base: { l: number; c: number; h: number }, dHue: number, dL: number): string {
  return formatHex({
    mode: 'oklch',
    l: Math.min(0.95, Math.max(0.05, base.l + dL)),
    c: base.c,
    h: (base.h + dHue + 360) % 360,
  })!
}

export function buildPalette(hex: string): Palette {
  const parsed = parse(hex)
  if (!parsed) return buildPalette(PRESETS[DEFAULT_PRESET_KEY].primary)

  const oklch = toOklch(parsed)!
  // Màu xám tuyệt đối không có sắc độ; gán 0 để phép xoay hue vẫn tất định.
  const base = { l: oklch.l, c: oklch.c, h: oklch.h ?? 0 }

  const shades = {} as Record<Shade, string>
  for (const shade of SHADES) {
    const step = RAMP[shade]
    shades[shade] = formatHex({ mode: 'oklch', l: step.l, c: base.c * step.c, h: base.h })!
  }

  const primary = shades[500]
  const foreground =
    wcagContrast(primary, LIGHT_TEXT) >= wcagContrast(primary, DARK_TEXT) ? LIGHT_TEXT : DARK_TEXT

  const mid = { l: RAMP[500].l, c: base.c, h: base.h }

  return {
    primary,
    foreground,
    shades,
    gradientFrom: primary,
    gradientVia: shift(mid, 40, 0.06),
    gradientTo: shift(mid, 105, 0.14),
  }
}

export function paletteToCssVars(p: Palette): Record<string, string> {
  const vars: Record<string, string> = {
    '--vnd-primary': p.primary,
    '--vnd-primary-fg': p.foreground,
    '--vnd-gradient-from': p.gradientFrom,
    '--vnd-gradient-via': p.gradientVia,
    '--vnd-gradient-to': p.gradientTo,
  }
  for (const shade of SHADES) vars[`--vnd-primary-${shade}`] = p.shades[shade]
  return vars
}
```

- [ ] **Step 5: Chạy test để xác nhận pass**

Run: `npx vitest run lib/theme/__tests__/palette.test.ts`
Expected: PASS (8 test)

Nếu test "chọn chữ đen trên nền vàng chanh" fail: kiểm tra `wcagContrast` được import từ `culori` chứ không tự viết. Nếu test "độ sáng giảm dần" fail ở bậc 50–100: giá trị `c` trong `RAMP` đang quá cao cho màu đó — giảm hệ số `c` của hai bậc đầu, đừng đổi `l`.

- [ ] **Step 6: Nối biến CSS vào Tailwind**

Thêm vào cuối `app/globals.css` (Tailwind v4 khai báo theme bằng CSS):

```css
@theme inline {
  --color-primary-50:  var(--vnd-primary-50);
  --color-primary-100: var(--vnd-primary-100);
  --color-primary-200: var(--vnd-primary-200);
  --color-primary-300: var(--vnd-primary-300);
  --color-primary-400: var(--vnd-primary-400);
  --color-primary-500: var(--vnd-primary-500);
  --color-primary-600: var(--vnd-primary-600);
  --color-primary-700: var(--vnd-primary-700);
  --color-primary-800: var(--vnd-primary-800);
  --color-primary-900: var(--vnd-primary-900);
  --color-primary-fg:  var(--vnd-primary-fg);
}

/* Giá trị dự phòng khi biến chưa được layout nhúng vào (ví dụ trang lỗi toàn cục) */
:root {
  /* 12 biến, giá trị SINH RA từ code chứ không gõ tay — xem hướng dẫn ngay dưới */
}
```

**Không tự gõ các giá trị hex này.** Chúng phải là đầu ra thật của `buildPalette('#6C3DF4')`, nếu không trang admin login và trang 404 toàn cục sẽ hiển thị một sắc tím khác với phần còn lại của site. Sinh ra bằng:

```bash
npx tsx -e "import {buildPalette,paletteToCssVars} from './lib/theme/palette'; console.log(JSON.stringify(paletteToCssVars(buildPalette('#6C3DF4')),null,2))"
```

rồi chép nguyên 12 cặp `--vnd-*` từ đầu ra vào khối `:root`. Lưu ý `--vnd-primary-500` **không** bằng `#6C3DF4` — mã đầu vào là hạt giống để tính dải màu, không phải một bậc trong dải.

- [ ] **Step 7: Commit**

```bash
git add lib/theme app/globals.css
git commit -m "feat: generate OKLCH color palette from a single hex"
```

---

## Task 4: Lược đồ CSDL + seed

**Files:**
- Create: `prisma/schema.prisma`, `prisma/seed.ts`, `lib/db.ts`
- Modify: `package.json` (thêm khối `prisma`)
- Test: `prisma/__tests__/seed.test.ts`

**Interfaces:**
- Consumes: `slugify` (Task 2), `DEFAULT_PRESET_KEY` (Task 3)
- Produces:
  - `prisma` — Prisma client singleton từ `@/lib/db`
  - `seed(): Promise<void>` từ `@/prisma/seed` — chạy lại nhiều lần không lỗi
  - Toàn bộ model: `User`, `Category`, `Post`, `Product`, `ProductImage`, `Page`, `Banner`, `Media`, `SiteSetting`

- [ ] **Step 1: Viết schema**

`prisma/schema.prisma` — chép nguyên khối `prisma` ở spec §6 (đã bao gồm sửa đổi ở phần tự soát: `contactEmail`/`contactPhone` có `@default("")` và nhóm trường `homeIntro*`). Thêm phần đầu:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Kiểm tra lại đủ 9 model và 4 enum (`Role`, `CategoryType`, `ContentStatus`, `ThemeMode`).

- [ ] **Step 2: Prisma client singleton (qua driver adapter)**

Prisma 7 bỏ engine nhị phân mặc định: `new PrismaClient()` trần sẽ ném `PrismaClientInitializationError: A driver adapter is required`. Kết nối đi qua `@prisma/adapter-pg`, và chuỗi kết nối **không** còn đặt trong khối `datasource` của `schema.prisma` nữa.

`lib/db.ts` — singleton để hot-reload lúc dev không mở hàng chục kết nối:

```ts
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('Thiếu biến môi trường DATABASE_URL')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Ngoài ra cần `prisma.config.ts` ở gốc repo để CLI (`prisma db push`, `prisma studio`) biết schema ở đâu và nạp được `.env`. Tra tài liệu Prisma 7 cho đúng API hiện hành thay vì chép mù — tối thiểu nó phải trỏ tới `prisma/schema.prisma` và khai báo lệnh seed là `tsx prisma/seed.ts`.

- [ ] **Step 3: Đẩy schema lên DB dev**

```bash
npm run db:up
npx prisma db push
npx prisma generate
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 4: Viết test fail cho seed**

`prisma/__tests__/seed.test.ts`:

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { seed } from '@/prisma/seed'

describe('seed', () => {
  beforeAll(async () => {
    await prisma.productImage.deleteMany()
    await prisma.product.deleteMany()
    await prisma.post.deleteMany()
    await prisma.category.deleteMany()
    await prisma.siteSetting.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => { await prisma.$disconnect() })

  it('tạo tài khoản admin với mật khẩu đã băm và cờ mật khẩu mặc định', async () => {
    await seed()
    const admin = await prisma.user.findUnique({ where: { email: 'admin@app.com' } })
    expect(admin).not.toBeNull()
    expect(admin!.passwordHash).not.toBe('Admin@6868')
    expect(await bcrypt.compare('Admin@6868', admin!.passwordHash)).toBe(true)
    expect(admin!.usingDefaultPassword).toBe(true)
    expect(admin!.role).toBe('ADMIN')
  })

  it('tạo bản ghi SiteSetting đơn với bảng màu violet', async () => {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } })
    expect(settings?.presetKey).toBe('violet')
    expect(settings?.themeMode).toBe('PRESET')
  })

  it('tạo danh mục mẫu cho cả tin tức lẫn sản phẩm', async () => {
    expect(await prisma.category.count({ where: { type: 'NEWS' } })).toBeGreaterThan(0)
    expect(await prisma.category.count({ where: { type: 'PRODUCT' } })).toBeGreaterThan(0)
  })

  it('chạy lần hai không lỗi và không nhân đôi dữ liệu', async () => {
    const before = await prisma.category.count()
    await expect(seed()).resolves.not.toThrow()
    expect(await prisma.user.count()).toBe(1)
    expect(await prisma.siteSetting.count()).toBe(1)
    expect(await prisma.category.count()).toBe(before)
  })
})
```

Test này chạy trên DB test. Thêm script:

```json
"test:db": "dotenv -e .env.test -- vitest run prisma/__tests__"
```

và trước khi chạy lần đầu:

```bash
dotenv -e .env.test -- npx prisma db push
```

- [ ] **Step 5: Chạy test để xác nhận fail**

Run: `npm run test:db`
Expected: FAIL — `Cannot find module '@/prisma/seed'`

- [ ] **Step 6: Viết seed**

`prisma/seed.ts`:

```ts
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/slug'
import { DEFAULT_PRESET_KEY } from '@/lib/theme/presets'

const NEWS_CATEGORIES = ['Tin công ty', 'Tin ngành', 'Sự kiện']
const PRODUCT_CATEGORIES = ['Thiết bị', 'Giải pháp', 'Phụ kiện']

export async function seed(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@app.com'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@6868'

  await prisma.user.upsert({
    where: { email },
    update: {},                       // đã tồn tại thì không đụng vào mật khẩu người dùng đã đổi
    create: {
      email,
      name: 'Quản trị viên',
      passwordHash: await bcrypt.hash(password, 10),
      role: 'ADMIN',
      usingDefaultPassword: true,
    },
  })

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: 'VNDERCO',
      themeMode: 'PRESET',
      presetKey: DEFAULT_PRESET_KEY,
      contactEmail: 'lienhe@vnderco.vn',
      contactPhone: '0900000000',
      homeIntroTitle: 'Về VNDERCO',
      homeIntroBody: 'Chúng tôi cung cấp sản phẩm và giải pháp cho doanh nghiệp Việt.',
      seoTitleTemplate: '%s | VNDERCO',
      seoDescription: 'VNDERCO — sản phẩm và giải pháp cho doanh nghiệp Việt.',
    },
  })

  for (const [type, names] of [
    ['NEWS', NEWS_CATEGORIES],
    ['PRODUCT', PRODUCT_CATEGORIES],
  ] as const) {
    for (const [index, name] of names.entries()) {
      const slug = slugify(name)
      await prisma.category.upsert({
        where: { type_slug: { type, slug } },
        update: {},
        create: { name, slug, type, order: index },
      })
    }
  }
}

// Cho phép `npm run db:seed` chạy trực tiếp file này
if (process.argv[1]?.includes('seed')) {
  seed()
    .then(() => console.log('Seed xong.'))
    .catch((err) => { console.error(err); process.exit(1) })
    .finally(() => prisma.$disconnect())
}
```

- [ ] **Step 7: Chạy test để xác nhận pass**

Run: `npm run test:db`
Expected: PASS (4 test)

- [ ] **Step 8: Chạy seed trên DB dev**

```bash
npm run db:seed
npx prisma studio
```

Kiểm tra bảng `User` có `admin@app.com`, bảng `SiteSetting` có đúng 1 dòng. Đóng Prisma Studio.

- [ ] **Step 9: Commit**

```bash
git add prisma lib/db.ts package.json
git commit -m "feat: add Prisma schema and idempotent seed"
```

---

## Task 5: Đăng nhập admin + chặn route

**Bẫy quan trọng:** middleware của Next.js chạy trên Edge runtime, nơi Prisma **không** chạy được. Vì vậy cấu hình Auth.js phải tách đôi: `auth.config.ts` không import Prisma (dùng cho middleware), `auth.ts` import Prisma (dùng cho server component và server action). Gộp một file sẽ build được nhưng lỗi lúc chạy.

**Files:**
- Create: `lib/auth.config.ts`, `lib/auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/admin/login/page.tsx`, `app/admin/login/login-form.tsx`, `lib/actions/auth.ts`, `playwright.config.ts`, `e2e/login.spec.ts`
- Modify: `package.json`
- Test: `e2e/login.spec.ts`

**Interfaces:**
- Consumes: `prisma` (Task 4), tài khoản seed (Task 4)
- Produces:
  - `auth()` — đọc phiên trong server component/action
  - `signIn`, `signOut`
  - `requireAdmin(): Promise<{ id: string; email: string; usingDefaultPassword: boolean }>` — ném lỗi nếu chưa đăng nhập
  - `loginAction(prev, formData): Promise<{ error?: string }>`

- [ ] **Step 1: Cài Playwright**

```bash
npm i -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Viết E2E test fail trước**

`e2e/login.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('từ chối sai mật khẩu', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('sai-mat-khau')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page.getByText('Email hoặc mật khẩu không đúng')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('đăng nhập bằng tài khoản seed rồi vào được admin', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page).toHaveURL(/\/admin$/)
})

test('chưa đăng nhập thì bị đá về trang login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})
```

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

Thêm script: `"test:e2e": "playwright test"`

- [ ] **Step 3: Chạy E2E để xác nhận fail**

Run: `npm run test:e2e -- e2e/login.spec.ts`
Expected: FAIL — cả 3 test, `/admin/login` trả 404

- [ ] **Step 4: Cấu hình Auth.js phần edge-safe**

`lib/auth.config.ts` — **không được import `@/lib/db`**:

```ts
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: { signIn: '/admin/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isAdminArea = request.nextUrl.pathname.startsWith('/admin')
      const isLoginPage = request.nextUrl.pathname === '/admin/login'
      if (!isAdminArea) return true
      if (isLoginPage) return true
      return Boolean(auth?.user)
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.usingDefaultPassword = (user as { usingDefaultPassword?: boolean }).usingDefaultPassword ?? false
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.usingDefaultPassword = token.usingDefaultPassword as boolean
      return session
    },
  },
} satisfies NextAuthConfig
```

Khai báo kiểu mở rộng, `types/next-auth.d.ts`:

```ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session { user: { id: string; email: string; usingDefaultPassword: boolean } & { name?: string | null } }
  interface User { usingDefaultPassword?: boolean }
}

declare module 'next-auth/jwt' {
  interface JWT { id?: string; usingDefaultPassword?: boolean }
}
```

- [ ] **Step 5: Cấu hình Auth.js phần đầy đủ**

`lib/auth.ts`:

```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from './auth.config'
import { prisma } from './db'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
        if (!user) return null
        if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          usingDefaultPassword: user.usingDefaultPassword,
        }
      },
    }),
  ],
})

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('UNAUTHORIZED')
  return session.user
}
```

`app/api/auth/[...nextauth]/route.ts`:

```ts
export { GET, POST } from '@/lib/auth'
```

`middleware.ts` (ở gốc repo):

```ts
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export default NextAuth(authConfig).auth

export const config = { matcher: ['/admin/:path*'] }
```

- [ ] **Step 6: Trang đăng nhập**

`lib/actions/auth.ts`:

```ts
'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '@/lib/auth'

export async function loginAction(_prev: { error?: string }, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/admin',
    })
    return {}
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Email hoặc mật khẩu không đúng' }
    throw error   // redirect của Next.js ném lỗi có chủ đích — phải cho nó đi tiếp
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
```

`app/admin/login/login-form.tsx`:

```tsx
'use client'

import { useActionState } from 'react'
import { loginAction } from '@/lib/actions/auth'

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mật khẩu</label>
        <input id="password" name="password" type="password" required autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending}
        className="w-full rounded-lg bg-primary-600 px-4 py-2 font-semibold text-primary-fg disabled:opacity-60">
        {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
    </form>
  )
}
```

`app/admin/login/page.tsx`:

```tsx
import { LoginForm } from './login-form'

export const metadata = { title: 'Đăng nhập quản trị' }

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-xl font-bold text-slate-900">Quản trị VNDERCO</h1>
        <LoginForm />
      </div>
    </main>
  )
}
```

Tạm thời `app/admin/page.tsx` để E2E có đích đến:

```tsx
export default function AdminHome() {
  return <p>Tổng quan</p>
}
```

- [ ] **Step 7: Chạy E2E để xác nhận pass**

Run: `npm run test:e2e -- e2e/login.spec.ts`
Expected: PASS (3 test)

Nếu test 3 fail vì `/admin` không redirect: kiểm tra `matcher` trong `middleware.ts` và callback `authorized`. Nếu build lỗi `PrismaClient is unable to run in this browser environment`: `auth.config.ts` đang lỡ import `@/lib/db` — gỡ ra.

- [ ] **Step 8: Commit**

```bash
git add lib/auth.config.ts lib/auth.ts lib/actions middleware.ts types app/admin app/api playwright.config.ts e2e package.json
git commit -m "feat: add admin authentication with seeded credentials"
```

---

## Task 6: Lớp truy cập dữ liệu

Đây là task then chốt của kiến trúc. Sau task này, không file nào ngoài `lib/actions/` được phép ghi DB.

**Files:**
- Create: `lib/actions/helper.ts`, `lib/queries/settings.ts`, `lib/queries/posts.ts`, `lib/queries/products.ts`, `lib/queries/categories.ts`, `lib/queries/pages.ts`, `lib/queries/banners.ts`, `lib/cache-tags.ts`
- Test: `lib/actions/__tests__/helper.test.ts`

**Interfaces:**
- Consumes: `requireAdmin` (Task 5), `prisma` (Task 4)
- Produces:
  - `type ActionResult<T> = { ok: true; data: T } | { ok: false; formError?: string; fieldErrors?: Record<string, string[]> }`
  - `createAction<S, T>({ schema, handler, tags }): (input: FormData | unknown) => Promise<ActionResult<T>>`
  - `TAGS` — hằng số tên tag
  - `getSiteSettings()`, `getPublishedPosts({ page, categorySlug })`, `getPostBySlug(slug)`, `getFeaturedPosts()`, `getRelatedPosts(postId, categoryId)`, `getPublishedProducts(...)`, `getProductBySlug(slug)`, `getFeaturedProducts()`, `getPageBySlug(slug)`, `getActiveBanners()`, `getCategories(type)`

- [ ] **Step 1: Hằng số tag**

`lib/cache-tags.ts`:

```ts
export const TAGS = {
  settings: 'settings',
  posts: 'posts',
  post: (slug: string) => `post:${slug}`,
  products: 'products',
  product: (slug: string) => `product:${slug}`,
  pages: 'pages',
  page: (slug: string) => `page:${slug}`,
  banners: 'banners',
  categories: 'categories',
} as const

export const PAGE_SIZE = 12
export const FEATURED_POSTS = 6
export const FEATURED_PRODUCTS = 8
export const RELATED_POSTS = 3
```

- [ ] **Step 2: Viết test fail cho helper**

`lib/actions/__tests__/helper.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

const revalidateTag = vi.fn()
const requireAdmin = vi.fn()

vi.mock('next/cache', () => ({ revalidateTag }))
vi.mock('@/lib/auth', () => ({ requireAdmin }))

const { createAction } = await import('@/lib/actions/helper')

const schema = z.object({ name: z.string().min(1, 'Tên không được để trống') })

beforeEach(() => {
  revalidateTag.mockClear()
  requireAdmin.mockReset().mockResolvedValue({ id: 'u1', email: 'a@b.c', usingDefaultPassword: false })
})

describe('createAction', () => {
  it('chặn khi chưa đăng nhập và không đụng tới handler', async () => {
    requireAdmin.mockRejectedValue(new Error('UNAUTHORIZED'))
    const handler = vi.fn()
    const action = createAction({ schema, handler, tags: () => ['posts'] })

    const result = await action({ name: 'x' })

    expect(result).toEqual({ ok: false, formError: 'Bạn cần đăng nhập lại.' })
    expect(handler).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('trả lỗi theo từng trường khi dữ liệu sai và không ghi gì', async () => {
    const handler = vi.fn()
    const action = createAction({ schema, handler, tags: () => ['posts'] })

    const result = await action({ name: '' })

    expect(result.ok).toBe(false)
    expect((result as { fieldErrors: Record<string, string[]> }).fieldErrors.name)
      .toContain('Tên không được để trống')
    expect(handler).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('nhận được FormData chứ không chỉ object', async () => {
    const handler = vi.fn().mockResolvedValue({ id: '1' })
    const action = createAction({ schema, handler, tags: () => [] })

    const fd = new FormData()
    fd.set('name', 'Danh mục A')
    const result = await action(fd)

    expect(result).toEqual({ ok: true, data: { id: '1' } })
    expect(handler).toHaveBeenCalledWith({ name: 'Danh mục A' })
  })

  it('revalidate đúng các tag sau khi ghi thành công', async () => {
    const handler = vi.fn().mockResolvedValue({ slug: 'tin-moi' })
    const action = createAction({
      schema,
      handler,
      tags: (_input, result) => ['posts', `post:${result.slug}`],
    })

    await action({ name: 'Tin mới' })

    expect(revalidateTag).toHaveBeenCalledWith('posts')
    expect(revalidateTag).toHaveBeenCalledWith('post:tin-moi')
  })

  it('biến lỗi trùng khoá của Prisma thành thông báo tiếng Việt', async () => {
    const handler = vi.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: 'P2002' }))
    const action = createAction({ schema, handler, tags: () => [] })

    const result = await action({ name: 'Trùng' })

    expect(result).toEqual({ ok: false, formError: 'Dữ liệu đã tồn tại (slug hoặc email bị trùng).' })
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Chạy test để xác nhận fail**

Run: `npx vitest run lib/actions/__tests__/helper.test.ts`
Expected: FAIL — `Cannot find module '@/lib/actions/helper'`

- [ ] **Step 4: Viết helper**

`lib/actions/helper.ts`:

```ts
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; formError?: string; fieldErrors?: Record<string, string[]> }

type Options<S extends z.ZodTypeAny, T> = {
  schema: S
  handler: (input: z.infer<S>) => Promise<T>
  tags: (input: z.infer<S>, result: T) => string[]
}

function toPlainObject(input: FormData | unknown): unknown {
  if (!(input instanceof FormData)) return input
  const out: Record<string, unknown> = {}
  for (const [key, value] of input.entries()) {
    if (key in out) {
      const existing = out[key]
      out[key] = Array.isArray(existing) ? [...existing, value] : [existing, value]
    } else {
      out[key] = value
    }
  }
  return out
}

export function createAction<S extends z.ZodTypeAny, T>({ schema, handler, tags }: Options<S, T>) {
  return async (input: FormData | unknown): Promise<ActionResult<T>> => {
    try {
      await requireAdmin()
    } catch {
      return { ok: false, formError: 'Bạn cần đăng nhập lại.' }
    }

    const parsed = schema.safeParse(toPlainObject(input))
    if (!parsed.success) {
      return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
    }

    let result: T
    try {
      result = await handler(parsed.data)
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        return { ok: false, formError: 'Dữ liệu đã tồn tại (slug hoặc email bị trùng).' }
      }
      if ((error as { code?: string }).code === 'P2025') {
        return { ok: false, formError: 'Không tìm thấy bản ghi cần thao tác.' }
      }
      console.error('[action]', error)
      return { ok: false, formError: 'Có lỗi xảy ra, vui lòng thử lại.' }
    }

    for (const tag of tags(parsed.data, result)) revalidateTag(tag)
    return { ok: true, data: result }
  }
}
```

- [ ] **Step 5: Chạy test để xác nhận pass**

Run: `npx vitest run lib/actions/__tests__/helper.test.ts`
Expected: PASS (5 test)

- [ ] **Step 6: Viết tầng đọc**

`lib/queries/settings.ts`:

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { DEFAULT_PRESET_KEY } from '@/lib/theme/presets'

export const getSiteSettings = unstable_cache(
  async () => {
    const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } })
    // Chưa seed thì vẫn phải render được, không để trang trắng.
    return settings ?? {
      id: 1, siteName: 'VNDERCO', logoUrl: null, faviconUrl: null,
      contactEmail: '', contactPhone: '', contactAddress: null,
      zaloUrl: null, facebookUrl: null,
      themeMode: 'PRESET' as const, presetKey: DEFAULT_PRESET_KEY, customPrimary: null,
      homeIntroTitle: '', homeIntroBody: '', homeIntroImageUrl: null,
      homeIntroCtaLabel: null, homeIntroCtaHref: null,
      seoTitleTemplate: '%s | VNDERCO', seoDescription: '', seoOgImageUrl: null,
      updatedAt: new Date(),
    }
  },
  ['site-settings'],
  { tags: [TAGS.settings] },
)
```

`lib/queries/posts.ts`:

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { FEATURED_POSTS, PAGE_SIZE, RELATED_POSTS, TAGS } from '@/lib/cache-tags'

const PUBLISHED = { status: 'PUBLISHED' as const }

export const getPublishedPosts = unstable_cache(
  async ({ page = 1, categorySlug }: { page?: number; categorySlug?: string }) => {
    const where = { ...PUBLISHED, ...(categorySlug ? { category: { slug: categorySlug } } : {}) }
    const [items, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.post.count({ where }),
    ])
    return { items, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
  },
  ['posts-list'],
  { tags: [TAGS.posts] },
)

export const getFeaturedPosts = unstable_cache(
  async () => prisma.post.findMany({
    where: { ...PUBLISHED, featured: true },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: FEATURED_POSTS,
  }),
  ['posts-featured'],
  { tags: [TAGS.posts] },
)

export async function getPostBySlug(slug: string) {
  return unstable_cache(
    async () => prisma.post.findFirst({ where: { slug, ...PUBLISHED }, include: { category: true } }),
    ['post', slug],
    { tags: [TAGS.post(slug), TAGS.posts] },
  )()
}

export async function getRelatedPosts(postId: string, categoryId: string | null) {
  if (!categoryId) return []
  return unstable_cache(
    async () => prisma.post.findMany({
      where: { ...PUBLISHED, categoryId, NOT: { id: postId } },
      orderBy: { publishedAt: 'desc' },
      take: RELATED_POSTS,
    }),
    ['posts-related', postId],
    { tags: [TAGS.posts] },
  )()
}

export const getAllPublishedPostSlugs = unstable_cache(
  async () => prisma.post.findMany({ where: PUBLISHED, select: { slug: true, updatedAt: true } }),
  ['posts-slugs'],
  { tags: [TAGS.posts] },
)
```

`lib/queries/products.ts` — cùng khuôn, đổi model và thứ tự sắp xếp:

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { FEATURED_PRODUCTS, PAGE_SIZE, TAGS } from '@/lib/cache-tags'

const PUBLISHED = { status: 'PUBLISHED' as const }

export const getPublishedProducts = unstable_cache(
  async ({ page = 1, categorySlug }: { page?: number; categorySlug?: string }) => {
    const where = { ...PUBLISHED, ...(categorySlug ? { category: { slug: categorySlug } } : {}) }
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, images: { orderBy: { order: 'asc' }, take: 1 } },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ])
    return { items, total, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
  },
  ['products-list'],
  { tags: [TAGS.products] },
)

export const getFeaturedProducts = unstable_cache(
  async () => prisma.product.findMany({
    where: { ...PUBLISHED, featured: true },
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { order: 'asc' },
    take: FEATURED_PRODUCTS,
  }),
  ['products-featured'],
  { tags: [TAGS.products] },
)

export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => prisma.product.findFirst({
      where: { slug, ...PUBLISHED },
      include: { category: true, images: { orderBy: { order: 'asc' } } },
    }),
    ['product', slug],
    { tags: [TAGS.product(slug), TAGS.products] },
  )()
}

export const getAllPublishedProductSlugs = unstable_cache(
  async () => prisma.product.findMany({ where: PUBLISHED, select: { slug: true, updatedAt: true } }),
  ['products-slugs'],
  { tags: [TAGS.products] },
)
```

`lib/queries/categories.ts`:

```ts
import { unstable_cache } from 'next/cache'
import type { CategoryType } from '@prisma/client'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

export async function getCategories(type: CategoryType) {
  return unstable_cache(
    async () => prisma.category.findMany({ where: { type }, orderBy: { order: 'asc' } }),
    ['categories', type],
    { tags: [TAGS.categories] },
  )()
}
```

`lib/queries/pages.ts`:

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

export async function getPageBySlug(slug: string) {
  return unstable_cache(
    async () => prisma.page.findFirst({ where: { slug, status: 'PUBLISHED' } }),
    ['page', slug],
    { tags: [TAGS.page(slug), TAGS.pages] },
  )()
}

export const getAllPublishedPageSlugs = unstable_cache(
  async () => prisma.page.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
  ['pages-slugs'],
  { tags: [TAGS.pages] },
)
```

`lib/queries/banners.ts`:

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

export const getActiveBanners = unstable_cache(
  async () => prisma.banner.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ['banners-active'],
  { tags: [TAGS.banners] },
)
```

- [ ] **Step 7: Chạy toàn bộ unit test**

Run: `npm test`
Expected: PASS — smoke + slug + palette + helper

- [ ] **Step 8: Commit**

```bash
git add lib/actions lib/queries lib/cache-tags.ts
git commit -m "feat: add cached query layer and guarded write-action helper"
```

---

## Task 7: Vỏ admin, cảnh báo mật khẩu mặc định, đổi mật khẩu

**Files:**
- Create: `app/admin/(dashboard)/layout.tsx`, `app/admin/(dashboard)/page.tsx`, `components/admin/Sidebar.tsx`, `components/admin/DefaultPasswordBanner.tsx`, `app/admin/(dashboard)/doi-mat-khau/page.tsx`, `app/admin/(dashboard)/doi-mat-khau/form.tsx`, `lib/actions/account.ts`, `lib/validation/account.ts`
- Move: `app/admin/page.tsx` → `app/admin/(dashboard)/page.tsx`
- Test: `e2e/change-password.spec.ts`

**Interfaces:**
- Consumes: `auth`, `requireAdmin`, `logoutAction` (Task 5), `createAction` (Task 6)
- Produces: `changePasswordAction(input)` → `ActionResult<{ ok: true }>`; layout `(dashboard)` bọc mọi trang admin trừ login

- [ ] **Step 1: Viết E2E test fail trước**

`e2e/change-password.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const login = async (page: import('@playwright/test').Page, password: string) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
}

test('hiện cảnh báo khi còn dùng mật khẩu mặc định, mất đi sau khi đổi', async ({ page }) => {
  await login(page, 'Admin@6868')
  await expect(page.getByRole('alert')).toContainText('mật khẩu mặc định')

  await page.goto('/admin/doi-mat-khau')
  await page.getByLabel('Mật khẩu hiện tại').fill('Admin@6868')
  await page.getByLabel('Mật khẩu mới').fill('Vnderco@2026')
  await page.getByLabel('Nhập lại mật khẩu mới').fill('Vnderco@2026')
  await page.getByRole('button', { name: 'Đổi mật khẩu' }).click()

  // Đổi mật khẩu xong là bị đăng xuất, không ở lại trang admin
  await expect(page).toHaveURL(/\/admin\/login/)
  await expect(page.getByText('Đã đổi mật khẩu, vui lòng đăng nhập lại')).toBeVisible()

  // Đăng nhập lại bằng mật khẩu mới, cảnh báo phải biến mất
  await login(page, 'Vnderco@2026')
  await expect(page.getByRole('alert')).toHaveCount(0)
})
```

**Vì sao phải đăng xuất chứ không chỉ hiện thông báo tại chỗ.** Phiên đăng nhập là JWT, và callback `jwt` chỉ ghi `usingDefaultPassword` đúng một lần lúc đăng nhập. Đổi mật khẩu xong mà giữ nguyên phiên thì cookie vẫn mang `usingDefaultPassword: true`, nên dải cảnh báo đỏ vẫn nhắc mãi dù admin đã làm đúng việc được nhắc — người dùng sẽ tưởng thao tác thất bại. Đăng xuất giải quyết triệt để, và huỷ phiên sau khi đổi thông tin đăng nhập vốn cũng là cách làm chuẩn.

Test này đổi trạng thái DB, nên phải reset trước khi chạy. Thêm script:

```json
"test:e2e": "dotenv -e .env.test -- playwright test",
"test:e2e:reset": "dotenv -e .env.test -- prisma db push --force-reset && dotenv -e .env.test -- tsx prisma/seed.ts"
```

và sửa `playwright.config.ts` để dev server dùng DB test:

```ts
webServer: {
  command: 'dotenv -e .env.test -- npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
},
```

- [ ] **Step 2: Chạy E2E để xác nhận fail**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/change-password.spec.ts`
Expected: FAIL — không có dải cảnh báo, `/admin/doi-mat-khau` trả 404

- [ ] **Step 3: Schema Zod cho đổi mật khẩu**

`lib/validation/account.ts`:

```ts
import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Nhập mật khẩu hiện tại'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới tối thiểu 8 ký tự')
      .regex(/[A-Z]/, 'Cần ít nhất một chữ hoa')
      .regex(/[0-9]/, 'Cần ít nhất một chữ số'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Hai mật khẩu không khớp',
  })
```

- [ ] **Step 4: Action đổi mật khẩu**

`lib/actions/account.ts`:

```ts
'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { createAction } from './helper'
import { changePasswordSchema } from '@/lib/validation/account'

export const changePasswordAction = createAction({
  schema: changePasswordSchema,
  tags: () => [],                      // mật khẩu không ảnh hưởng trang công khai
  handler: async (input) => {
    const session = await requireAdmin()
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } })

    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw Object.assign(new Error('WRONG_PASSWORD'), { code: 'WRONG_PASSWORD' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(input.newPassword, 10),
        usingDefaultPassword: false,
      },
    })
    return { changed: true }
  },
})

// Huỷ phiên sau khi đổi mật khẩu. Gọi tách rời khỏi createAction vì signOut()
// ném redirect có chủ đích của Next.js — để nó chạy trong handler sẽ bị khối
// try/catch của helper nuốt mất và biến thành "có lỗi xảy ra".
export async function changePasswordAndSignOut(formData: FormData) {
  const result = await changePasswordAction(formData)
  if (!result.ok) return result
  await signOut({ redirectTo: '/admin/login?doi-mat-khau=1' })
  return result
}
```

Thêm `import { signOut } from '@/lib/auth'` ở đầu file.

Trang `app/admin/login/page.tsx` đọc `searchParams` và hiện dòng *"Đã đổi mật khẩu, vui lòng đăng nhập lại."* khi có `?doi-mat-khau=1`. Form đổi mật khẩu gọi `changePasswordAndSignOut` thay vì `changePasswordAction`, và không cần hiện thông báo thành công tại chỗ nữa — người dùng đã bị chuyển sang trang đăng nhập.
```

Bổ sung nhánh lỗi vào `lib/actions/helper.ts`, ngay trước nhánh `P2002`:

```ts
if ((error as { code?: string }).code === 'WRONG_PASSWORD') {
  return { ok: false, fieldErrors: { currentPassword: ['Mật khẩu hiện tại không đúng'] } }
}
```

- [ ] **Step 5: Sidebar + layout + cảnh báo**

`components/admin/Sidebar.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin', label: 'Tổng quan' },
  { href: '/admin/tin-tuc', label: 'Tin tức' },
  { href: '/admin/san-pham', label: 'Sản phẩm' },
  { href: '/admin/danh-muc', label: 'Danh mục' },
  { href: '/admin/trang', label: 'Trang tĩnh' },
  { href: '/admin/banner', label: 'Banner' },
  { href: '/admin/thu-vien', label: 'Thư viện ảnh' },
  { href: '/admin/cai-dat', label: 'Cài đặt' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav aria-label="Điều hướng quản trị" className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
      <p className="mb-4 px-2 text-sm font-bold text-slate-900">VNDERCO</p>
      <ul className="space-y-1">
        {LINKS.map((link) => {
          const active = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-lg px-3 py-2 text-sm ${
                  active ? 'bg-primary-50 font-semibold text-primary-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
```

`components/admin/DefaultPasswordBanner.tsx`:

```tsx
import Link from 'next/link'

export function DefaultPasswordBanner() {
  return (
    <div role="alert" className="bg-red-600 px-4 py-2 text-sm text-white">
      Tài khoản đang dùng <strong>mật khẩu mặc định</strong>. Hãy{' '}
      <Link href="/admin/doi-mat-khau" className="underline">đổi mật khẩu</Link> ngay để tránh bị truy cập trái phép.
    </div>
  )
}
```

`app/admin/(dashboard)/layout.tsx`:

```tsx
import { auth } from '@/lib/auth'
import { logoutAction } from '@/lib/actions/auth'
import { Sidebar } from '@/components/admin/Sidebar'
import { DefaultPasswordBanner } from '@/components/admin/DefaultPasswordBanner'

export const metadata = { title: { template: '%s | Quản trị VNDERCO', default: 'Quản trị VNDERCO' } }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-slate-50">
      {session?.user?.usingDefaultPassword && <DefaultPasswordBanner />}
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
            <span className="text-sm text-slate-600">{session?.user?.email}</span>
            <form action={logoutAction}>
              <button type="submit" className="text-sm text-slate-600 hover:text-slate-900">Đăng xuất</button>
            </form>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
```

Chuyển `app/admin/page.tsx` sang `app/admin/(dashboard)/page.tsx` và thay bằng trang tổng quan:

```tsx
import { prisma } from '@/lib/db'

export const metadata = { title: 'Tổng quan' }

export default async function AdminHome() {
  const [posts, products, pages] = await Promise.all([
    prisma.post.count(), prisma.product.count(), prisma.page.count(),
  ])
  const recent = await prisma.post.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Tổng quan</h1>
      <div className="grid grid-cols-3 gap-4">
        {[['Bài viết', posts], ['Sản phẩm', products], ['Trang tĩnh', pages]].map(([label, count]) => (
          <div key={label as string} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{count}</p>
          </div>
        ))}
      </div>
      <section className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 font-semibold text-slate-900">Sửa gần đây</h2>
        <ul className="space-y-1 text-sm text-slate-600">
          {recent.map((p) => <li key={p.id}>{p.title}</li>)}
          {recent.length === 0 && <li className="text-slate-400">Chưa có bài viết nào.</li>}
        </ul>
      </section>
    </div>
  )
}
```

- [ ] **Step 6: Trang đổi mật khẩu**

`app/admin/(dashboard)/doi-mat-khau/form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { changePasswordAction } from '@/lib/actions/account'
import type { ActionResult } from '@/lib/actions/helper'

const FIELDS = [
  { name: 'currentPassword', label: 'Mật khẩu hiện tại' },
  { name: 'newPassword', label: 'Mật khẩu mới' },
  { name: 'confirmPassword', label: 'Nhập lại mật khẩu mới' },
] as const

export function ChangePasswordForm() {
  const [state, setState] = useState<ActionResult<{ changed: boolean }> | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="max-w-sm space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        setPending(true)
        const result = await changePasswordAction(new FormData(event.currentTarget))
        setState(result)
        setPending(false)
        if (result.ok) event.currentTarget.reset()
      }}
    >
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-slate-700">{field.label}</label>
          <input id={field.name} name={field.name} type="password" required autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          {state && !state.ok && state.fieldErrors?.[field.name]?.[0] && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors[field.name][0]}</p>
          )}
        </div>
      ))}

      {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}
      {state?.ok && <p className="text-sm text-green-700">Đã đổi mật khẩu thành công.</p>}

      <button type="submit" disabled={pending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-primary-fg disabled:opacity-60">
        Đổi mật khẩu
      </button>
    </form>
  )
}
```

`app/admin/(dashboard)/doi-mat-khau/page.tsx`:

```tsx
import { ChangePasswordForm } from './form'

export const metadata = { title: 'Đổi mật khẩu' }

export default function ChangePasswordPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Đổi mật khẩu</h1>
      <ChangePasswordForm />
    </div>
  )
}
```

- [ ] **Step 7: Chạy E2E để xác nhận pass**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/change-password.spec.ts e2e/login.spec.ts`
Expected: PASS

Nếu cảnh báo vẫn hiện sau khi đăng nhập lại: `usingDefaultPassword` đang nằm trong JWT cũ — kiểm tra người dùng đã đăng nhập lại (phiên mới) chứ không chỉ reload.

- [ ] **Step 8: Commit**

```bash
git add app/admin components/admin lib/actions lib/validation playwright.config.ts e2e package.json
git commit -m "feat: add admin shell, default-password warning and password change"
```

---

## Task 8: Upload ảnh và thư viện ảnh

**Files:**
- Create: `lib/storage.ts`, `lib/validation/media.ts`, `lib/actions/media.ts`, `lib/queries/media.ts`, `app/admin/(dashboard)/thu-vien/page.tsx`, `components/admin/MediaUploader.tsx`, `components/admin/MediaPicker.tsx`
- Modify: `lib/cache-tags.ts` (thêm tag `media`), `next.config.ts` (cho phép domain ảnh)
- Test: `lib/__tests__/storage.test.ts`

**Interfaces:**
- Consumes: `createAction` (Task 6)
- Produces:
  - `ALLOWED_MIME: string[]`, `MAX_SIZE_BYTES = 5 * 1024 * 1024`
  - `assertUploadable(file: { type: string; size: number }): void` — ném `Error` với thông báo tiếng Việt
  - `uploadImage(file: File): Promise<{ url: string; pathname: string }>`
  - `deleteImage(url: string): Promise<void>`
  - `uploadMediaAction(formData)`, `deleteMediaAction({ id })`, `updateMediaAltAction({ id, alt })`
  - `<MediaPicker value onChange />` — dùng lại ở Task 10–13
  - `getMediaList()`

- [ ] **Step 1: Viết test fail cho kiểm tra file**

`lib/__tests__/storage.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { assertUploadable, MAX_SIZE_BYTES } from '@/lib/storage'

describe('assertUploadable', () => {
  it('chấp nhận các định dạng ảnh cho phép', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'image/avif']) {
      expect(() => assertUploadable({ type, size: 1000 })).not.toThrow()
    }
  })

  it('từ chối định dạng khác kèm thông báo tiếng Việt', () => {
    expect(() => assertUploadable({ type: 'application/pdf', size: 1000 }))
      .toThrow('Chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF')
    expect(() => assertUploadable({ type: 'image/svg+xml', size: 1000 })).toThrow()
  })

  it('từ chối file quá 5MB', () => {
    expect(() => assertUploadable({ type: 'image/png', size: MAX_SIZE_BYTES + 1 }))
      .toThrow('Ảnh không được vượt quá 5MB')
    expect(() => assertUploadable({ type: 'image/png', size: MAX_SIZE_BYTES })).not.toThrow()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npx vitest run lib/__tests__/storage.test.ts`
Expected: FAIL — `Cannot find module '@/lib/storage'`

- [ ] **Step 3: Viết tầng lưu trữ**

`lib/storage.ts`:

```ts
import { del, put } from '@vercel/blob'

export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function assertUploadable(file: { type: string; size: number }): void {
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error('Chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Ảnh không được vượt quá 5MB')
  }
}

export async function uploadImage(file: File): Promise<{ url: string; pathname: string }> {
  assertUploadable(file)
  const blob = await put(`vnderco/${Date.now()}-${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  })
  return { url: blob.url, pathname: blob.pathname }
}

export async function deleteImage(url: string): Promise<void> {
  await del(url)
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `npx vitest run lib/__tests__/storage.test.ts`
Expected: PASS (3 test)

- [ ] **Step 5: Action và query cho media**

Thêm vào `lib/cache-tags.ts`: `media: 'media',` trong `TAGS`.

`lib/validation/media.ts`:

```ts
import { z } from 'zod'

export const deleteMediaSchema = z.object({ id: z.string().min(1) })
export const updateMediaAltSchema = z.object({
  id: z.string().min(1),
  alt: z.string().max(200, 'Mô tả ảnh tối đa 200 ký tự'),
})
```

`lib/actions/media.ts`:

```ts
'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { deleteImage, uploadImage } from '@/lib/storage'
import { createAction } from './helper'
import { deleteMediaSchema, updateMediaAltSchema } from '@/lib/validation/media'

export const uploadMediaAction = createAction({
  schema: z.object({ file: z.instanceof(File, { message: 'Chưa chọn ảnh' }) }),
  tags: () => [TAGS.media],
  handler: async ({ file }) => {
    const { url, pathname } = await uploadImage(file)
    return prisma.media.create({
      data: { url, pathname, filename: file.name, mimeType: file.type, size: file.size },
    })
  },
})

export const deleteMediaAction = createAction({
  schema: deleteMediaSchema,
  tags: () => [TAGS.media],
  handler: async ({ id }) => {
    const media = await prisma.media.delete({ where: { id } })
    // Xoá bản ghi trước, xoá file sau: file mồ côi vô hại, bản ghi mồ côi thì vỡ giao diện.
    await deleteImage(media.url).catch((err) => console.error('[blob-delete]', err))
    return media
  },
})

export const updateMediaAltAction = createAction({
  schema: updateMediaAltSchema,
  tags: () => [TAGS.media],
  handler: ({ id, alt }) => prisma.media.update({ where: { id }, data: { alt } }),
})
```

`lib/queries/media.ts`:

```ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'

export const getMediaList = unstable_cache(
  async () => prisma.media.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
  ['media-list'],
  { tags: [TAGS.media] },
)
```

- [ ] **Step 6: Cho phép hiển thị ảnh Blob**

`next.config.ts`:

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
}

export default config
```

- [ ] **Step 7: Giao diện thư viện ảnh và bộ chọn ảnh**

`components/admin/MediaUploader.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { uploadMediaAction } from '@/lib/actions/media'
import { ALLOWED_MIME, MAX_SIZE_BYTES } from '@/lib/storage'

export function MediaUploader({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <div>
      <label className="inline-block cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-primary-fg">
        {pending ? 'Đang tải lên…' : 'Tải ảnh lên'}
        <input
          type="file"
          accept={ALLOWED_MIME.join(',')}
          className="hidden"
          disabled={pending}
          onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ''         // cho phép chọn lại đúng file đó sau khi lỗi
            if (!file) return

            // Kiểm tra phía trình duyệt để báo lỗi ngay, server vẫn kiểm tra lại
            if (!ALLOWED_MIME.includes(file.type)) return setError('Chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF')
            if (file.size > MAX_SIZE_BYTES) return setError('Ảnh không được vượt quá 5MB')

            setError(null)
            setPending(true)
            const fd = new FormData()
            fd.set('file', file)
            const result = await uploadMediaAction(fd)
            setPending(false)

            if (!result.ok) return setError(result.formError ?? 'Tải ảnh thất bại, vui lòng thử lại.')
            onUploaded?.(result.data.url)
            router.refresh()
          }}
        />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
```

`components/admin/MediaPicker.tsx` — dùng lại ở mọi form có ảnh:

```tsx
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { MediaUploader } from './MediaUploader'

type Media = { id: string; url: string; filename: string; alt: string | null }

export function MediaPicker({
  value, onChange, label = 'Ảnh',
}: { value: string | null; onChange: (url: string | null) => void; label?: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Media[]>([])

  useEffect(() => {
    if (open) fetch('/api/media').then((r) => r.json()).then(setItems)
  }, [open])

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          <Image src={value} alt="" width={96} height={64} className="h-16 w-24 rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
            Chưa có
          </div>
        )}
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Chọn ảnh
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-sm text-red-600">Bỏ ảnh</button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Thư viện ảnh</h2>
              <MediaUploader onUploaded={(url) => { onChange(url); setOpen(false) }} />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {items.map((m) => (
                <button key={m.id} type="button" onClick={() => { onChange(m.url); setOpen(false) }}
                  className="overflow-hidden rounded-lg border border-slate-200 hover:border-primary-500">
                  <Image src={m.url} alt={m.alt ?? ''} width={200} height={140} className="h-24 w-full object-cover" />
                </button>
              ))}
            </div>
            {items.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Chưa có ảnh nào.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
```

`app/api/media/route.ts` — chỉ đọc, có kiểm tra đăng nhập:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMediaList } from '@/lib/queries/media'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json([], { status: 401 })
  return NextResponse.json(await getMediaList())
}
```

`app/admin/(dashboard)/thu-vien/page.tsx`:

```tsx
import Image from 'next/image'
import { getMediaList } from '@/lib/queries/media'
import { MediaUploader } from '@/components/admin/MediaUploader'

export const metadata = { title: 'Thư viện ảnh' }

export default async function MediaLibraryPage() {
  const items = await getMediaList()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Thư viện ảnh</h1>
        <MediaUploader />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {items.map((m) => (
          <figure key={m.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
            <Image src={m.url} alt={m.alt ?? ''} width={300} height={200} className="h-28 w-full object-cover" />
            <figcaption className="truncate p-2 text-xs text-slate-500">{m.filename}</figcaption>
          </figure>
        ))}
      </div>
      {items.length === 0 && <p className="text-sm text-slate-400">Chưa có ảnh nào. Bấm “Tải ảnh lên” để bắt đầu.</p>}
    </div>
  )
}
```

- [ ] **Step 8: Kiểm tra thủ công**

```bash
npm run dev
```

Vào `/admin/thu-vien`, tải lên một ảnh PNG < 5MB → ảnh hiện trong lưới. Thử tải một file PDF → hiện lỗi *"Chỉ nhận ảnh JPG, PNG, WEBP hoặc AVIF"*, không có request nào lên Blob.

Nếu chưa có `BLOB_READ_WRITE_TOKEN`: chạy `npx vercel link` rồi `npx vercel env pull .env.local`, hoặc tạo Blob store trên dashboard Vercel và dán token vào `.env`.

- [ ] **Step 9: Commit**

```bash
git add lib/storage.ts lib/actions/media.ts lib/queries/media.ts lib/validation/media.ts components/admin app/admin app/api next.config.ts lib/cache-tags.ts
git commit -m "feat: add image upload, media library and reusable media picker"
```

---

## Task 9: Khối dùng chung cho admin + CRUD Danh mục

Danh mục là loại nội dung đơn giản nhất, nên dùng nó để dựng luôn các khối dùng chung mà Task 10–13 sẽ tiêu thụ. Không loại nào sau đó phải chép lại vỏ danh sách hay vỏ form.

**Files:**
- Create: `components/admin/AdminListShell.tsx`, `components/admin/AdminFormShell.tsx`, `components/admin/FieldError.tsx`, `components/admin/DeleteButton.tsx`, `components/admin/useActionForm.ts`, `components/admin/SlugField.tsx`, `lib/validation/category.ts`, `lib/actions/category.ts`, `app/admin/(dashboard)/danh-muc/page.tsx`, `app/admin/(dashboard)/danh-muc/form.tsx`, `app/admin/(dashboard)/danh-muc/[id]/page.tsx`, `app/admin/(dashboard)/danh-muc/moi/page.tsx`
- Test: `lib/validation/__tests__/category.test.ts`, `e2e/category-crud.spec.ts`

**Interfaces:**
- Consumes: `createAction` (Task 6), `slugify`/`uniqueSlug` (Task 2), `TAGS` (Task 6)
- Produces:
  - `<AdminListShell title createHref search filters>{rows}</AdminListShell>`
  - `<AdminFormShell title backHref>{fields}</AdminFormShell>`
  - `<FieldError errors={string[] | undefined} />`
  - `<DeleteButton action label />` — có `window.confirm`
  - `useActionForm(action)` → `{ state, pending, submit }`
  - `<SlugField titleValue value onChange />` — tự sinh slug khi người dùng chưa sửa tay
  - `createCategoryAction`, `updateCategoryAction`, `deleteCategoryAction`

- [ ] **Step 1: Viết test fail cho schema danh mục**

`lib/validation/__tests__/category.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { categoryCreateSchema } from '@/lib/validation/category'

describe('categoryCreateSchema', () => {
  it('chấp nhận dữ liệu hợp lệ và ép order về số', () => {
    const parsed = categoryCreateSchema.parse({ name: 'Tin công ty', slug: 'tin-cong-ty', type: 'NEWS', order: '3' })
    expect(parsed.order).toBe(3)
  })

  it('tự sinh slug từ tên khi slug bỏ trống', () => {
    expect(categoryCreateSchema.parse({ name: 'Đầu tư & phát triển', slug: '', type: 'NEWS', order: '0' }).slug)
      .toBe('dau-tu-phat-trien')
  })

  it('báo lỗi tiếng Việt khi thiếu tên', () => {
    const result = categoryCreateSchema.safeParse({ name: '', slug: '', type: 'NEWS', order: '0' })
    expect(result.success).toBe(false)
    expect(result.error!.flatten().fieldErrors.name).toContain('Tên danh mục không được để trống')
  })

  it('từ chối loại danh mục không hợp lệ', () => {
    expect(categoryCreateSchema.safeParse({ name: 'X', slug: 'x', type: 'BLOG', order: '0' }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npx vitest run lib/validation/__tests__/category.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validation/category'`

- [ ] **Step 3: Viết schema**

`lib/validation/category.ts`:

```ts
import { z } from 'zod'
import { slugify } from '@/lib/slug'

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Tên danh mục không được để trống').max(100, 'Tên tối đa 100 ký tự'),
  slug: z.string().trim(),
  type: z.enum(['NEWS', 'PRODUCT'], { message: 'Loại danh mục không hợp lệ' }),
  order: z.coerce.number().int().min(0).default(0),
}).transform((v) => ({ ...v, slug: v.slug ? slugify(v.slug) : slugify(v.name) }))

export const categoryUpdateSchema = z.object({ id: z.string().min(1) })
  .and(categoryCreateSchema)

export const categoryDeleteSchema = z.object({ id: z.string().min(1) })
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `npx vitest run lib/validation/__tests__/category.test.ts`
Expected: PASS (4 test)

- [ ] **Step 5: Action cho danh mục**

`lib/actions/category.ts`:

```ts
'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { uniqueSlug } from '@/lib/slug'
import { createAction } from './helper'
import { categoryCreateSchema, categoryDeleteSchema, categoryUpdateSchema } from '@/lib/validation/category'

// Danh mục lộ ra ở mọi trang danh sách và menu lọc, nên đụng vào là làm mới cả tin lẫn sản phẩm.
const ALL = [TAGS.categories, TAGS.posts, TAGS.products]

async function takenSlugs(type: 'NEWS' | 'PRODUCT', exceptId?: string) {
  const rows = await prisma.category.findMany({
    where: { type, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

export const createCategoryAction = createAction({
  schema: categoryCreateSchema,
  tags: () => ALL,
  handler: async (input) => prisma.category.create({
    data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs(input.type)) },
  }),
})

export const updateCategoryAction = createAction({
  schema: categoryUpdateSchema,
  tags: () => ALL,
  handler: async ({ id, ...input }) => prisma.category.update({
    where: { id },
    data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs(input.type, id)) },
  }),
})

export const deleteCategoryAction = createAction({
  schema: categoryDeleteSchema,
  tags: () => ALL,
  handler: ({ id }) => prisma.category.delete({ where: { id } }),
})
```

- [ ] **Step 6: Khối dùng chung**

`components/admin/useActionForm.ts`:

```ts
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ActionResult } from '@/lib/actions/helper'

export function useActionForm<T>(
  action: (input: FormData) => Promise<ActionResult<T>>,
  options: { redirectTo?: string; resetOnSuccess?: boolean } = {},
) {
  const router = useRouter()
  const [state, setState] = useState<ActionResult<T> | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setPending(true)
    const result = await action(new FormData(form))
    setState(result)
    setPending(false)

    if (!result.ok) return                       // giữ nguyên dữ liệu người dùng đã nhập
    if (options.resetOnSuccess) form.reset()
    if (options.redirectTo) { router.push(options.redirectTo); router.refresh() }
  }

  const fieldError = (name: string) =>
    state && !state.ok ? state.fieldErrors?.[name] : undefined

  return { state, pending, submit, fieldError }
}
```

`components/admin/FieldError.tsx`:

```tsx
export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return <p className="mt-1 text-sm text-red-600">{errors[0]}</p>
}
```

`components/admin/AdminListShell.tsx`:

```tsx
import Link from 'next/link'

export function AdminListShell({
  title, createHref, createLabel = 'Thêm mới', toolbar, children,
}: {
  title: string; createHref?: string; createLabel?: string
  toolbar?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {createHref && (
          <Link href={createHref} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-primary-fg">
            {createLabel}
          </Link>
        )}
      </div>
      {toolbar && <div className="flex flex-wrap gap-3">{toolbar}</div>}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">{children}</div>
    </div>
  )
}
```

`components/admin/AdminFormShell.tsx`:

```tsx
import Link from 'next/link'

export function AdminFormShell({
  title, backHref, children,
}: { title: string; backHref: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href={backHref} className="text-sm text-slate-500 hover:text-slate-900">← Quay lại</Link>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">{children}</div>
    </div>
  )
}
```

`components/admin/DeleteButton.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ActionResult } from '@/lib/actions/helper'

export function DeleteButton({
  id, action, confirmText,
}: { id: string; action: (input: unknown) => Promise<ActionResult<unknown>>; confirmText: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
      onClick={async () => {
        if (!window.confirm(confirmText)) return
        setPending(true)
        const result = await action({ id })
        setPending(false)
        if (!result.ok) return alert(result.formError ?? 'Xoá thất bại.')
        router.refresh()
      }}
    >
      Xoá
    </button>
  )
}
```

`components/admin/SlugField.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { slugify } from '@/lib/slug'
import { FieldError } from './FieldError'

export function SlugField({
  name = 'slug', titleValue, defaultValue = '', errors,
}: { name?: string; titleValue: string; defaultValue?: string; errors?: string[] }) {
  const [touched, setTouched] = useState(Boolean(defaultValue))
  const [value, setValue] = useState(defaultValue)
  const shown = touched ? value : slugify(titleValue || '')

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">Đường dẫn (slug)</label>
      <input
        id={name} name={name} value={shown}
        onChange={(e) => { setTouched(true); setValue(e.target.value) }}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
      />
      <FieldError errors={errors} />
    </div>
  )
}
```

- [ ] **Step 7: Viết E2E test fail cho CRUD danh mục**

`e2e/category-crud.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page).toHaveURL(/\/admin$/)
})

test('tạo, sửa, xoá một danh mục tin tức', async ({ page }) => {
  await page.goto('/admin/danh-muc/moi')
  await page.getByLabel('Tên danh mục').fill('Chuyển đổi số')
  await expect(page.getByLabel('Đường dẫn (slug)')).toHaveValue('chuyen-doi-so')
  await page.getByLabel('Loại').selectOption('NEWS')
  await page.getByRole('button', { name: 'Lưu' }).click()

  await expect(page).toHaveURL(/\/admin\/danh-muc$/)
  await expect(page.getByText('Chuyển đổi số')).toBeVisible()

  await page.getByRole('link', { name: 'Chuyển đổi số' }).click()
  await page.getByLabel('Tên danh mục').fill('Chuyển đổi số 2026')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Chuyển đổi số 2026')).toBeVisible()

  page.on('dialog', (d) => d.accept())
  await page.getByRole('row', { name: /Chuyển đổi số 2026/ }).getByRole('button', { name: 'Xoá' }).click()
  await expect(page.getByText('Chuyển đổi số 2026')).toHaveCount(0)
})

test('báo lỗi ngay dưới ô nhập khi bỏ trống tên', async ({ page }) => {
  await page.goto('/admin/danh-muc/moi')
  await page.getByLabel('Tên danh mục').fill('   ')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Tên danh mục không được để trống')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/danh-muc\/moi$/)
})
```

- [ ] **Step 8: Chạy E2E để xác nhận fail**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/category-crud.spec.ts`
Expected: FAIL — `/admin/danh-muc/moi` trả 404

- [ ] **Step 9: Màn hình danh mục**

`app/admin/(dashboard)/danh-muc/form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Category } from '@prisma/client'
import { createCategoryAction, updateCategoryAction } from '@/lib/actions/category'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { SlugField } from '@/components/admin/SlugField'

export function CategoryForm({ category }: { category?: Category }) {
  const [name, setName] = useState(category?.name ?? '')
  const action = category ? updateCategoryAction : createCategoryAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/danh-muc' })

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Tên danh mục</label>
        <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <FieldError errors={fieldError('name')} />
      </div>

      <SlugField titleValue={name} defaultValue={category?.slug ?? ''} errors={fieldError('slug')} />

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-slate-700">Loại</label>
        <select id="type" name="type" defaultValue={category?.type ?? 'NEWS'}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
          <option value="NEWS">Tin tức</option>
          <option value="PRODUCT">Sản phẩm</option>
        </select>
        <FieldError errors={fieldError('type')} />
      </div>

      <div>
        <label htmlFor="order" className="block text-sm font-medium text-slate-700">Thứ tự</label>
        <input id="order" name="order" type="number" min={0} defaultValue={category?.order ?? 0}
          className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2" />
        <FieldError errors={fieldError('order')} />
      </div>

      {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

      <button type="submit" disabled={pending}
        className="rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg disabled:opacity-60">
        {pending ? 'Đang lưu…' : 'Lưu'}
      </button>
    </form>
  )
}
```

`app/admin/(dashboard)/danh-muc/page.tsx`:

```tsx
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminListShell } from '@/components/admin/AdminListShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deleteCategoryAction } from '@/lib/actions/category'

export const metadata = { title: 'Danh mục' }

const TYPE_LABEL = { NEWS: 'Tin tức', PRODUCT: 'Sản phẩm' } as const

export default async function CategoryListPage() {
  const categories = await prisma.category.findMany({ orderBy: [{ type: 'asc' }, { order: 'asc' }] })

  return (
    <AdminListShell title="Danh mục" createHref="/admin/danh-muc/moi" createLabel="Thêm danh mục">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="p-3">Tên</th><th className="p-3">Slug</th><th className="p-3">Loại</th><th className="p-3">Thứ tự</th><th className="p-3" /></tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-t border-slate-100">
              <td className="p-3">
                <Link href={`/admin/danh-muc/${c.id}`} className="font-medium text-slate-900 hover:underline">{c.name}</Link>
              </td>
              <td className="p-3 font-mono text-xs text-slate-500">{c.slug}</td>
              <td className="p-3">{TYPE_LABEL[c.type]}</td>
              <td className="p-3">{c.order}</td>
              <td className="p-3 text-right">
                <DeleteButton id={c.id} action={deleteCategoryAction}
                  confirmText={`Xoá danh mục “${c.name}”? Bài viết và sản phẩm thuộc danh mục này sẽ chuyển về chưa phân loại.`} />
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr><td colSpan={5} className="p-6 text-center text-slate-400">Chưa có danh mục nào.</td></tr>
          )}
        </tbody>
      </table>
    </AdminListShell>
  )
}
```

`app/admin/(dashboard)/danh-muc/moi/page.tsx`:

```tsx
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { CategoryForm } from '../form'

export const metadata = { title: 'Thêm danh mục' }

export default function NewCategoryPage() {
  return (
    <AdminFormShell title="Thêm danh mục" backHref="/admin/danh-muc">
      <CategoryForm />
    </AdminFormShell>
  )
}
```

`app/admin/(dashboard)/danh-muc/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { CategoryForm } from '../form'

export const metadata = { title: 'Sửa danh mục' }

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const category = await prisma.category.findUnique({ where: { id } })
  if (!category) notFound()

  return (
    <AdminFormShell title="Sửa danh mục" backHref="/admin/danh-muc">
      <CategoryForm category={category} />
    </AdminFormShell>
  )
}
```

- [ ] **Step 10: Chạy E2E để xác nhận pass**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/category-crud.spec.ts`
Expected: PASS (2 test)

Nếu ô slug không tự điền: `SlugField` đang nhận `titleValue` rỗng — kiểm tra `name` được giữ trong state của `CategoryForm` chứ không phải `defaultValue`.

- [ ] **Step 11: Commit**

```bash
git add components/admin lib/actions/category.ts lib/validation/category.ts app/admin e2e
git commit -m "feat: add shared admin primitives and category CRUD"
```

---

## Task 10: CRUD Tin tức + trình soạn thảo Tiptap

**Files:**
- Create: `components/admin/RichTextEditor.tsx`, `lib/sanitize.ts`, `lib/validation/post.ts`, `lib/actions/post.ts`, `app/admin/(dashboard)/tin-tuc/page.tsx`, `app/admin/(dashboard)/tin-tuc/form.tsx`, `app/admin/(dashboard)/tin-tuc/moi/page.tsx`, `app/admin/(dashboard)/tin-tuc/[id]/page.tsx`
- Test: `lib/__tests__/sanitize.test.ts`, `lib/validation/__tests__/post.test.ts`

**Interfaces:**
- Consumes: khối dùng chung (Task 9), `MediaPicker` (Task 8), `uniqueSlug` (Task 2)
- Produces:
  - `sanitizeHtml(dirty: string): string`
  - `<RichTextEditor name defaultValue />` — ghi HTML vào input ẩn cùng `name`
  - `createPostAction`, `updatePostAction`, `deletePostAction`

- [ ] **Step 1: Cài Tiptap và bộ làm sạch HTML**

```bash
npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-youtube sanitize-html
npm i -D @types/sanitize-html
```

- [ ] **Step 2: Viết test fail cho làm sạch HTML**

`lib/__tests__/sanitize.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from '@/lib/sanitize'

describe('sanitizeHtml', () => {
  it('giữ lại thẻ định dạng hợp lệ', () => {
    const html = '<h2>Tiêu đề</h2><p><strong>đậm</strong> và <em>nghiêng</em></p><ul><li>một</li></ul>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('loại bỏ thẻ script', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>')
  })

  it('loại bỏ thuộc tính bắt sự kiện', () => {
    expect(sanitizeHtml('<p onclick="alert(1)">ok</p>')).toBe('<p>ok</p>')
  })

  it('chặn liên kết javascript: nhưng giữ liên kết http', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:')
    expect(sanitizeHtml('<a href="https://vnderco.vn">x</a>')).toContain('https://vnderco.vn')
  })

  it('giữ iframe nhúng YouTube', () => {
    const embed = '<iframe src="https://www.youtube.com/embed/abc123"></iframe>'
    expect(sanitizeHtml(embed)).toContain('youtube.com/embed/abc123')
  })

  it('loại iframe từ tên miền lạ', () => {
    expect(sanitizeHtml('<iframe src="https://evil.example/x"></iframe>')).toBe('')
  })
})
```

- [ ] **Step 3: Chạy test để xác nhận fail**

Run: `npx vitest run lib/__tests__/sanitize.test.ts`
Expected: FAIL — `Cannot find module '@/lib/sanitize'`

- [ ] **Step 4: Viết bộ làm sạch**

`lib/sanitize.ts`:

```ts
import sanitize from 'sanitize-html'

export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, {
    allowedTags: [
      'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'iframe', 'figure', 'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com'],
    transformTags: {
      a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  })
}
```

- [ ] **Step 5: Chạy test để xác nhận pass**

Run: `npx vitest run lib/__tests__/sanitize.test.ts`
Expected: PASS (6 test)

- [ ] **Step 6: Viết test fail cho schema bài viết**

`lib/validation/__tests__/post.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { postCreateSchema } from '@/lib/validation/post'

const base = {
  title: 'VNDERCO ra mắt sản phẩm mới', slug: '', excerpt: '', content: '<p>Nội dung</p>',
  coverImageUrl: '', coverImageAlt: '', categoryId: '', status: 'DRAFT',
  featured: 'off', seoTitle: '', seoDescription: '',
}

describe('postCreateSchema', () => {
  it('sinh slug từ tiêu đề và làm sạch nội dung', () => {
    const p = postCreateSchema.parse({ ...base, content: '<p>ok</p><script>x</script>' })
    expect(p.slug).toBe('vnderco-ra-mat-san-pham-moi')
    expect(p.content).toBe('<p>ok</p>')
  })

  it('chuyển chuỗi rỗng của ô chọn thành null', () => {
    const p = postCreateSchema.parse(base)
    expect(p.categoryId).toBeNull()
    expect(p.coverImageUrl).toBeNull()
  })

  it('hiểu checkbox: "on" là bật, thiếu là tắt', () => {
    expect(postCreateSchema.parse({ ...base, featured: 'on' }).featured).toBe(true)
    const { featured, ...withoutFeatured } = base
    expect(postCreateSchema.parse(withoutFeatured).featured).toBe(false)
  })

  it('đặt publishedAt khi xuất bản, để trống khi còn nháp', () => {
    expect(postCreateSchema.parse({ ...base, status: 'PUBLISHED' }).publishedAt).toBeInstanceOf(Date)
    expect(postCreateSchema.parse(base).publishedAt).toBeNull()
  })

  it('báo lỗi khi thiếu tiêu đề hoặc nội dung rỗng', () => {
    expect(postCreateSchema.safeParse({ ...base, title: '' }).error!.flatten().fieldErrors.title)
      .toContain('Tiêu đề không được để trống')
    expect(postCreateSchema.safeParse({ ...base, content: '<p></p>' }).error!.flatten().fieldErrors.content)
      .toContain('Nội dung không được để trống')
  })
})
```

- [ ] **Step 7: Chạy test để xác nhận fail**

Run: `npx vitest run lib/validation/__tests__/post.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validation/post'`

- [ ] **Step 8: Viết schema bài viết**

`lib/validation/post.ts`:

```ts
import { z } from 'zod'
import { slugify } from '@/lib/slug'
import { sanitizeHtml } from '@/lib/sanitize'

// FormData luôn trả chuỗi; các helper dưới đây quy về kiểu thật.
const optionalId = z.string().optional().transform((v) => (v && v.length > 0 ? v : null))
const checkbox = z.union([z.literal('on'), z.literal('true'), z.undefined(), z.literal('')])
  .transform((v) => v === 'on' || v === 'true')

const hasText = (html: string) => sanitizeHtml(html).replace(/<[^>]*>/g, '').trim().length > 0

export const postCreateSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  slug: z.string().trim().optional().default(''),
  excerpt: z.string().trim().max(400, 'Tóm tắt tối đa 400 ký tự').optional().default(''),
  content: z.string().refine(hasText, 'Nội dung không được để trống'),
  coverImageUrl: optionalId,
  coverImageAlt: z.string().trim().optional().default(''),
  categoryId: optionalId,
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featured: checkbox,
  seoTitle: z.string().trim().optional().default(''),
  seoDescription: z.string().trim().optional().default(''),
}).transform((v) => ({
  ...v,
  slug: slugify(v.slug || v.title),
  content: sanitizeHtml(v.content),
  excerpt: v.excerpt || null,
  coverImageAlt: v.coverImageAlt || null,
  seoTitle: v.seoTitle || null,
  seoDescription: v.seoDescription || null,
  publishedAt: v.status === 'PUBLISHED' ? new Date() : null,
}))

export const postUpdateSchema = z.object({ id: z.string().min(1) }).and(postCreateSchema)
export const postDeleteSchema = z.object({ id: z.string().min(1) })
```

- [ ] **Step 9: Chạy test để xác nhận pass**

Run: `npx vitest run lib/validation/__tests__/post.test.ts`
Expected: PASS (5 test)

- [ ] **Step 10: Action cho bài viết**

`lib/actions/post.ts`:

```ts
'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { uniqueSlug } from '@/lib/slug'
import { requireAdmin } from '@/lib/auth'
import { createAction } from './helper'
import { postCreateSchema, postDeleteSchema, postUpdateSchema } from '@/lib/validation/post'

async function takenSlugs(exceptId?: string) {
  const rows = await prisma.post.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : {},
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

export const createPostAction = createAction({
  schema: postCreateSchema,
  tags: (_input, post) => [TAGS.posts, TAGS.post(post.slug)],
  handler: async (input) => {
    const session = await requireAdmin()
    return prisma.post.create({
      data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs()), authorId: session.id },
    })
  },
})

export const updatePostAction = createAction({
  schema: postUpdateSchema,
  // Slug có thể đổi, nên phải làm mới cả slug cũ lẫn slug mới.
  tags: (_input, post) => [TAGS.posts, TAGS.post(post.slug)],
  handler: async ({ id, ...input }) => {
    const current = await prisma.post.findUniqueOrThrow({ where: { id }, select: { slug: true, publishedAt: true } })
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...input,
        slug: uniqueSlug(input.slug, await takenSlugs(id)),
        // Đã xuất bản rồi thì giữ nguyên ngày đăng gốc, đừng nhảy về hôm nay mỗi lần sửa.
        publishedAt: input.status === 'PUBLISHED' ? (current.publishedAt ?? new Date()) : null,
      },
    })
    if (current.slug !== post.slug) return Object.assign(post, { previousSlug: current.slug })
    return post
  },
})

export const deletePostAction = createAction({
  schema: postDeleteSchema,
  tags: (_input, post) => [TAGS.posts, TAGS.post(post.slug)],
  handler: ({ id }) => prisma.post.delete({ where: { id } }),
})
```

Bổ sung tag cho slug cũ — sửa `tags` của `updatePostAction` thành:

```ts
tags: (_input, post) => {
  const previous = (post as { previousSlug?: string }).previousSlug
  return [TAGS.posts, TAGS.post(post.slug), ...(previous ? [TAGS.post(previous)] : [])]
},
```

- [ ] **Step 11: Trình soạn thảo**

`components/admin/RichTextEditor.tsx`:

```tsx
'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import { useState } from 'react'
import { MediaPicker } from './MediaPicker'

export function RichTextEditor({ name, defaultValue = '' }: { name: string; defaultValue?: string }) {
  const [html, setHtml] = useState(defaultValue)

  const editor = useEditor({
    immediatelyRender: false,          // bắt buộc với SSR của Next.js, thiếu sẽ lỗi hydration
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Youtube.configure({ nocookie: true }),
    ],
    content: defaultValue,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: { class: 'prose max-w-none min-h-64 p-4 focus:outline-none' },
    },
  })

  if (!editor) return <div className="h-64 rounded-lg border border-slate-300 bg-slate-50" />

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-sm ${active ? 'bg-primary-100 text-primary-700' : 'text-slate-600 hover:bg-slate-100'}`

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div className="rounded-lg border border-slate-300">
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 p-2">
          <button type="button" className={btn(editor.isActive('heading', { level: 2 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
          <button type="button" className={btn(editor.isActive('heading', { level: 3 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
          <button type="button" className={btn(editor.isActive('bold'))}
            onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
          <button type="button" className={btn(editor.isActive('italic'))}
            onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
          <button type="button" className={btn(editor.isActive('bulletList'))}
            onClick={() => editor.chain().focus().toggleBulletList().run()}>• Danh sách</button>
          <button type="button" className={btn(editor.isActive('blockquote'))}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝ Trích dẫn</button>
          <button type="button" className={btn(editor.isActive('link'))}
            onClick={() => {
              const url = window.prompt('Nhập đường dẫn (để trống để gỡ liên kết):', editor.getAttributes('link').href ?? '')
              if (url === null) return
              if (url === '') return void editor.chain().focus().unsetLink().run()
              editor.chain().focus().setLink({ href: url }).run()
            }}>Liên kết</button>
          <button type="button" className={btn(false)}
            onClick={() => {
              const url = window.prompt('Dán đường dẫn video YouTube:')
              if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
            }}>YouTube</button>
        </div>
        <EditorContent editor={editor} />
      </div>
      <div className="mt-2">
        <MediaPicker
          label="Chèn ảnh vào bài"
          value={null}
          onChange={(url) => { if (url) editor.chain().focus().setImage({ src: url }).run() }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 12: Màn hình tin tức**

`app/admin/(dashboard)/tin-tuc/form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Category, Post } from '@prisma/client'
import { createPostAction, updatePostAction } from '@/lib/actions/post'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { SlugField } from '@/components/admin/SlugField'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { RichTextEditor } from '@/components/admin/RichTextEditor'

export function PostForm({ post, categories }: { post?: Post; categories: Category[] }) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [cover, setCover] = useState<string | null>(post?.coverImageUrl ?? null)
  const action = post ? updatePostAction : createPostAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/tin-tuc' })

  return (
    <form onSubmit={submit} className="grid grid-cols-3 gap-6">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="coverImageUrl" value={cover ?? ''} />

      <div className="col-span-2 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Tiêu đề</label>
          <input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg" />
          <FieldError errors={fieldError('title')} />
        </div>

        <SlugField titleValue={title} defaultValue={post?.slug ?? ''} errors={fieldError('slug')} />

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700">Tóm tắt</label>
          <textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('excerpt')} />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700">Nội dung</span>
          <div className="mt-1"><RichTextEditor name="content" defaultValue={post?.content ?? ''} /></div>
          <FieldError errors={fieldError('content')} />
        </div>
      </div>

      <aside className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">Trạng thái</label>
          <select id="status" name="status" defaultValue={post?.status ?? 'DRAFT'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700">Danh mục</label>
          <select id="categoryId" name="categoryId" defaultValue={post?.categoryId ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">— Chưa phân loại —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="featured" defaultChecked={post?.featured ?? false} />
          Bài nổi bật (hiện ở trang chủ)
        </label>

        <MediaPicker label="Ảnh bìa" value={cover} onChange={setCover} />
        <div>
          <label htmlFor="coverImageAlt" className="block text-sm font-medium text-slate-700">Mô tả ảnh bìa</label>
          <input id="coverImageAlt" name="coverImageAlt" defaultValue={post?.coverImageAlt ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>

        <details className="rounded-lg border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">SEO</summary>
          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="seoTitle" className="block text-sm text-slate-600">Tiêu đề SEO</label>
              <input id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ''}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="seoDescription" className="block text-sm text-slate-600">Mô tả SEO</label>
              <textarea id="seoDescription" name="seoDescription" rows={3} defaultValue={post?.seoDescription ?? ''}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </div>
          </div>
        </details>

        {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

        <button type="submit" disabled={pending}
          className="w-full rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg disabled:opacity-60">
          {pending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </aside>
    </form>
  )
}
```

`app/admin/(dashboard)/tin-tuc/page.tsx`:

```tsx
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { AdminListShell } from '@/components/admin/AdminListShell'
import { DeleteButton } from '@/components/admin/DeleteButton'
import { deletePostAction } from '@/lib/actions/post'

export const metadata = { title: 'Tin tức' }

export default async function PostListPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; trang_thai?: string }> }) {
  const { q, trang_thai } = await searchParams
  const posts = await prisma.post.findMany({
    where: {
      ...(q ? { title: { contains: q, mode: 'insensitive' as const } } : {}),
      ...(trang_thai === 'DRAFT' || trang_thai === 'PUBLISHED' ? { status: trang_thai } : {}),
    },
    include: { category: true },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <AdminListShell
      title="Tin tức"
      createHref="/admin/tin-tuc/moi"
      createLabel="Viết bài mới"
      toolbar={
        <form className="flex gap-2">
          <input name="q" defaultValue={q ?? ''} placeholder="Tìm theo tiêu đề"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          <select name="trang_thai" defaultValue={trang_thai ?? ''}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            <option value="">Mọi trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
          </select>
          <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">Lọc</button>
        </form>
      }
    >
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr><th className="p-3">Tiêu đề</th><th className="p-3">Danh mục</th><th className="p-3">Trạng thái</th><th className="p-3">Cập nhật</th><th className="p-3" /></tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="p-3">
                <Link href={`/admin/tin-tuc/${p.id}`} className="font-medium text-slate-900 hover:underline">{p.title}</Link>
                {p.featured && <span className="ml-2 rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-700">Nổi bật</span>}
              </td>
              <td className="p-3 text-slate-600">{p.category?.name ?? '—'}</td>
              <td className="p-3">{p.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp'}</td>
              <td className="p-3 text-slate-500">{p.updatedAt.toLocaleDateString('vi-VN')}</td>
              <td className="p-3 text-right">
                <DeleteButton id={p.id} action={deletePostAction} confirmText={`Xoá bài “${p.title}”? Không khôi phục được.`} />
              </td>
            </tr>
          ))}
          {posts.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Không có bài viết nào.</td></tr>}
        </tbody>
      </table>
    </AdminListShell>
  )
}
```

`app/admin/(dashboard)/tin-tuc/moi/page.tsx`:

```tsx
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { PostForm } from '../form'

export const metadata = { title: 'Viết bài mới' }

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ where: { type: 'NEWS' }, orderBy: { order: 'asc' } })
  return (
    <AdminFormShell title="Viết bài mới" backHref="/admin/tin-tuc">
      <PostForm categories={categories} />
    </AdminFormShell>
  )
}
```

`app/admin/(dashboard)/tin-tuc/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { PostForm } from '../form'

export const metadata = { title: 'Sửa bài viết' }

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { type: 'NEWS' }, orderBy: { order: 'asc' } }),
  ])
  if (!post) notFound()

  return (
    <AdminFormShell title="Sửa bài viết" backHref="/admin/tin-tuc">
      <PostForm post={post} categories={categories} />
    </AdminFormShell>
  )
}
```

- [ ] **Step 13: Chạy toàn bộ unit test và kiểm tra thủ công**

Run: `npm test`
Expected: PASS toàn bộ

```bash
npm run dev
```

Vào `/admin/tin-tuc/moi`, gõ tiêu đề (slug tự điền), soạn nội dung có H2 + danh sách + một ảnh, chọn ảnh bìa, để trạng thái *Xuất bản*, bấm Lưu → quay về danh sách và thấy bài. Sửa lại tiêu đề rồi lưu → ngày đăng **không** đổi.

- [ ] **Step 14: Commit**

```bash
git add lib/sanitize.ts lib/validation/post.ts lib/actions/post.ts components/admin/RichTextEditor.tsx app/admin
git commit -m "feat: add news CRUD with Tiptap editor and HTML sanitization"
```

---

## Task 11: CRUD Sản phẩm

Khác bài viết ở hai chỗ: **nhiều ảnh có thứ tự** và **bảng thông số key–value**.

**Files:**
- Create: `lib/validation/product.ts`, `lib/actions/product.ts`, `components/admin/SpecsEditor.tsx`, `components/admin/GalleryEditor.tsx`, `app/admin/(dashboard)/san-pham/page.tsx`, `app/admin/(dashboard)/san-pham/form.tsx`, `app/admin/(dashboard)/san-pham/moi/page.tsx`, `app/admin/(dashboard)/san-pham/[id]/page.tsx`
- Test: `lib/validation/__tests__/product.test.ts`

**Interfaces:**
- Consumes: khối dùng chung (Task 9), `MediaPicker` (Task 8), `RichTextEditor` (Task 10)
- Produces: `createProductAction`, `updateProductAction`, `deleteProductAction`; `<SpecsEditor name defaultValue />` và `<GalleryEditor name defaultValue />` ghi JSON vào input ẩn

- [ ] **Step 1: Viết test fail cho schema sản phẩm**

`lib/validation/__tests__/product.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { productCreateSchema } from '@/lib/validation/product'

const base = {
  name: 'Máy lọc không khí X1', slug: '', summary: '', description: '<p>Mô tả</p>',
  specs: '[]', images: '[]', categoryId: '', status: 'DRAFT', featured: 'off',
  order: '0', seoTitle: '', seoDescription: '',
}

describe('productCreateSchema', () => {
  it('phân tích chuỗi JSON thông số thành mảng đối tượng', () => {
    const specs = JSON.stringify([{ label: 'Công suất', value: '500W' }])
    expect(productCreateSchema.parse({ ...base, specs }).specs).toEqual([{ label: 'Công suất', value: '500W' }])
  })

  it('bỏ qua dòng thông số thiếu nhãn hoặc giá trị', () => {
    const specs = JSON.stringify([{ label: '', value: 'x' }, { label: 'Màu', value: '' }, { label: 'Cân nặng', value: '3kg' }])
    expect(productCreateSchema.parse({ ...base, specs }).specs).toEqual([{ label: 'Cân nặng', value: '3kg' }])
  })

  it('coi JSON hỏng là danh sách rỗng thay vì ném lỗi', () => {
    expect(productCreateSchema.parse({ ...base, specs: 'không-phải-json' }).specs).toEqual([])
    expect(productCreateSchema.parse({ ...base, images: '{' }).images).toEqual([])
  })

  it('đánh số thứ tự ảnh theo đúng thứ tự trong mảng', () => {
    const images = JSON.stringify([{ url: 'https://a/1.jpg', alt: 'A' }, { url: 'https://a/2.jpg', alt: '' }])
    expect(productCreateSchema.parse({ ...base, images }).images).toEqual([
      { url: 'https://a/1.jpg', alt: 'A', order: 0 },
      { url: 'https://a/2.jpg', alt: null, order: 1 },
    ])
  })

  it('báo lỗi khi thiếu tên sản phẩm', () => {
    expect(productCreateSchema.safeParse({ ...base, name: '' }).error!.flatten().fieldErrors.name)
      .toContain('Tên sản phẩm không được để trống')
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npx vitest run lib/validation/__tests__/product.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validation/product'`

- [ ] **Step 3: Viết schema sản phẩm**

`lib/validation/product.ts`:

```ts
import { z } from 'zod'
import { slugify } from '@/lib/slug'
import { sanitizeHtml } from '@/lib/sanitize'

const checkbox = z.union([z.literal('on'), z.literal('true'), z.undefined(), z.literal('')])
  .transform((v) => v === 'on' || v === 'true')
const optional = z.string().optional().transform((v) => (v && v.length > 0 ? v : null))

// Editor phía client gửi JSON qua input ẩn; JSON hỏng không được làm sập cả form.
function parseJsonArray(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, 'Tên sản phẩm không được để trống').max(200, 'Tên tối đa 200 ký tự'),
  slug: z.string().trim().optional().default(''),
  summary: z.string().trim().max(400, 'Tóm tắt tối đa 400 ký tự').optional().default(''),
  description: z.string().optional().default(''),
  specs: z.string().optional().default('[]'),
  images: z.string().optional().default('[]'),
  categoryId: optional,
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featured: checkbox,
  order: z.coerce.number().int().min(0).default(0),
  seoTitle: z.string().trim().optional().default(''),
  seoDescription: z.string().trim().optional().default(''),
}).transform((v) => ({
  ...v,
  slug: slugify(v.slug || v.name),
  description: sanitizeHtml(v.description),
  summary: v.summary || null,
  seoTitle: v.seoTitle || null,
  seoDescription: v.seoDescription || null,
  specs: parseJsonArray(v.specs)
    .map((s) => s as { label?: string; value?: string })
    .filter((s) => s.label?.trim() && s.value?.trim())
    .map((s) => ({ label: s.label!.trim(), value: s.value!.trim() })),
  images: parseJsonArray(v.images)
    .map((i) => i as { url?: string; alt?: string })
    .filter((i) => typeof i.url === 'string' && i.url.length > 0)
    .map((i, order) => ({ url: i.url!, alt: i.alt?.trim() || null, order })),
}))

export const productUpdateSchema = z.object({ id: z.string().min(1) }).and(productCreateSchema)
export const productDeleteSchema = z.object({ id: z.string().min(1) })
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `npx vitest run lib/validation/__tests__/product.test.ts`
Expected: PASS (5 test)

- [ ] **Step 5: Action cho sản phẩm**

`lib/actions/product.ts`:

```ts
'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { uniqueSlug } from '@/lib/slug'
import { createAction } from './helper'
import { productCreateSchema, productDeleteSchema, productUpdateSchema } from '@/lib/validation/product'

async function takenSlugs(exceptId?: string) {
  const rows = await prisma.product.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : {},
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

export const createProductAction = createAction({
  schema: productCreateSchema,
  tags: (_input, product) => [TAGS.products, TAGS.product(product.slug)],
  handler: async ({ images, ...input }) => prisma.product.create({
    data: {
      ...input,
      slug: uniqueSlug(input.slug, await takenSlugs()),
      images: { create: images },
    },
  }),
})

export const updateProductAction = createAction({
  schema: productUpdateSchema,
  tags: (_input, product) => {
    const previous = (product as { previousSlug?: string }).previousSlug
    return [TAGS.products, TAGS.product(product.slug), ...(previous ? [TAGS.product(previous)] : [])]
  },
  handler: async ({ id, images, ...input }) => {
    const current = await prisma.product.findUniqueOrThrow({ where: { id }, select: { slug: true } })
    // Thay toàn bộ bộ ảnh: đơn giản và luôn khớp thứ tự người dùng vừa sắp.
    const product = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } })
      return tx.product.update({
        where: { id },
        data: {
          ...input,
          slug: uniqueSlug(input.slug, await takenSlugs(id)),
          images: { create: images },
        },
      })
    })
    return current.slug === product.slug ? product : Object.assign(product, { previousSlug: current.slug })
  },
})

export const deleteProductAction = createAction({
  schema: productDeleteSchema,
  tags: (_input, product) => [TAGS.products, TAGS.product(product.slug)],
  handler: ({ id }) => prisma.product.delete({ where: { id } }),   // ProductImage xoá theo Cascade
})
```

- [ ] **Step 6: Editor thông số và bộ ảnh**

`components/admin/SpecsEditor.tsx`:

```tsx
'use client'

import { useState } from 'react'

type Spec = { label: string; value: string }

export function SpecsEditor({ name, defaultValue = [] }: { name: string; defaultValue?: Spec[] }) {
  const [rows, setRows] = useState<Spec[]>(defaultValue.length ? defaultValue : [{ label: '', value: '' }])

  const update = (index: number, patch: Partial<Spec>) =>
    setRows(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <span className="block text-sm font-medium text-slate-700">Thông số kỹ thuật</span>
      <div className="mt-2 space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="flex gap-2">
            <input aria-label={`Tên thông số ${index + 1}`} value={row.label} placeholder="Công suất"
              onChange={(e) => update(index, { label: e.target.value })}
              className="w-1/3 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input aria-label={`Giá trị thông số ${index + 1}`} value={row.value} placeholder="500W"
              onChange={(e) => update(index, { value: e.target.value })}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="button" onClick={() => setRows(rows.filter((_, i) => i !== index))}
              className="px-2 text-sm text-red-600">Xoá</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows([...rows, { label: '', value: '' }])}
        className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm">+ Thêm dòng</button>
      <p className="mt-1 text-xs text-slate-500">Dòng để trống nhãn hoặc giá trị sẽ tự bị bỏ qua khi lưu.</p>
    </div>
  )
}
```

`components/admin/GalleryEditor.tsx`:

```tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MediaPicker } from './MediaPicker'

type GalleryImage = { url: string; alt: string }

export function GalleryEditor({ name, defaultValue = [] }: { name: string; defaultValue?: GalleryImage[] }) {
  const [images, setImages] = useState<GalleryImage[]>(defaultValue)

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[index], next[target]] = [next[target], next[index]]
    setImages(next)
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <span className="block text-sm font-medium text-slate-700">Ảnh sản phẩm</span>
      <p className="text-xs text-slate-500">Ảnh đầu tiên được dùng làm ảnh đại diện ở trang danh sách.</p>

      <ul className="mt-2 space-y-2">
        {images.map((img, index) => (
          <li key={`${img.url}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2">
            <Image src={img.url} alt="" width={80} height={56} className="h-14 w-20 rounded object-cover" />
            <input aria-label={`Mô tả ảnh ${index + 1}`} value={img.alt} placeholder="Mô tả ảnh (alt)"
              onChange={(e) => setImages(images.map((v, i) => (i === index ? { ...v, alt: e.target.value } : v)))}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
            <button type="button" onClick={() => move(index, -1)} className="px-1 text-slate-500" aria-label="Lên">↑</button>
            <button type="button" onClick={() => move(index, 1)} className="px-1 text-slate-500" aria-label="Xuống">↓</button>
            <button type="button" onClick={() => setImages(images.filter((_, i) => i !== index))}
              className="px-2 text-sm text-red-600">Xoá</button>
          </li>
        ))}
      </ul>

      <div className="mt-2">
        <MediaPicker label="Thêm ảnh" value={null}
          onChange={(url) => { if (url) setImages([...images, { url, alt: '' }]) }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Màn hình sản phẩm**

`app/admin/(dashboard)/san-pham/form.tsx` — cùng bố cục hai cột như `PostForm`, thay các trường riêng:

```tsx
'use client'

import { useState } from 'react'
import type { Category, Product, ProductImage } from '@prisma/client'
import { createProductAction, updateProductAction } from '@/lib/actions/product'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { SlugField } from '@/components/admin/SlugField'
import { RichTextEditor } from '@/components/admin/RichTextEditor'
import { SpecsEditor } from '@/components/admin/SpecsEditor'
import { GalleryEditor } from '@/components/admin/GalleryEditor'

type ProductWithImages = Product & { images: ProductImage[] }

export function ProductForm({ product, categories }: { product?: ProductWithImages; categories: Category[] }) {
  const [name, setName] = useState(product?.name ?? '')
  const action = product ? updateProductAction : createProductAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/san-pham' })

  return (
    <form onSubmit={submit} className="grid grid-cols-3 gap-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="col-span-2 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Tên sản phẩm</label>
          <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg" />
          <FieldError errors={fieldError('name')} />
        </div>

        <SlugField titleValue={name} defaultValue={product?.slug ?? ''} errors={fieldError('slug')} />

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-slate-700">Tóm tắt</label>
          <textarea id="summary" name="summary" rows={2} defaultValue={product?.summary ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('summary')} />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700">Mô tả</span>
          <div className="mt-1"><RichTextEditor name="description" defaultValue={product?.description ?? ''} /></div>
        </div>

        <SpecsEditor name="specs" defaultValue={(product?.specs as { label: string; value: string }[]) ?? []} />
        <GalleryEditor name="images"
          defaultValue={product?.images.map((i) => ({ url: i.url, alt: i.alt ?? '' })) ?? []} />
      </div>

      <aside className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">Trạng thái</label>
          <select id="status" name="status" defaultValue={product?.status ?? 'DRAFT'}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700">Danh mục</label>
          <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">— Chưa phân loại —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Sản phẩm nổi bật
        </label>

        <div>
          <label htmlFor="order" className="block text-sm font-medium text-slate-700">Thứ tự</label>
          <input id="order" name="order" type="number" min={0} defaultValue={product?.order ?? 0}
            className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2" />
        </div>

        <details className="rounded-lg border border-slate-200 p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">SEO</summary>
          <div className="mt-3 space-y-3">
            <input name="seoTitle" placeholder="Tiêu đề SEO" aria-label="Tiêu đề SEO" defaultValue={product?.seoTitle ?? ''}
              className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            <textarea name="seoDescription" rows={3} placeholder="Mô tả SEO" aria-label="Mô tả SEO"
              defaultValue={product?.seoDescription ?? ''} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </div>
        </details>

        {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

        <button type="submit" disabled={pending}
          className="w-full rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg disabled:opacity-60">
          {pending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </aside>
    </form>
  )
}
```

`app/admin/(dashboard)/san-pham/page.tsx`, `moi/page.tsx`, `[id]/page.tsx` — cùng cấu trúc như bộ tin tức ở Task 10, đổi model `post`→`product`, đường dẫn `/admin/tin-tuc`→`/admin/san-pham`, danh mục lọc `type: 'PRODUCT'`, cột bảng là *Tên · Danh mục · Trạng thái · Thứ tự*, và trang sửa phải `include: { images: { orderBy: { order: 'asc' } } }` để `GalleryEditor` nhận đúng thứ tự.

- [ ] **Step 8: Chạy test và kiểm tra thủ công**

Run: `npm test`
Expected: PASS toàn bộ

Vào `/admin/san-pham/moi`: thêm 3 ảnh, đổi thứ tự bằng nút ↑ ↓, thêm 2 dòng thông số + 1 dòng trống, xuất bản. Mở lại bản ghi → thứ tự ảnh giữ nguyên, dòng thông số trống đã bị loại.

- [ ] **Step 9: Commit**

```bash
git add lib/validation/product.ts lib/actions/product.ts components/admin app/admin
git commit -m "feat: add product CRUD with ordered gallery and spec table"
```

---

## Task 12: CRUD Trang tĩnh + Banner

Hai loại nội dung đơn giản nhất còn lại, gộp một task vì cùng dùng khuôn đã có và không loại nào đủ lớn để cần cổng review riêng.

**Files:**
- Create: `lib/validation/page.ts`, `lib/validation/banner.ts`, `lib/actions/page.ts`, `lib/actions/banner.ts`, `app/admin/(dashboard)/trang/{page.tsx,form.tsx,moi/page.tsx,[id]/page.tsx}`, `app/admin/(dashboard)/banner/{page.tsx,form.tsx,moi/page.tsx,[id]/page.tsx}`
- Test: `lib/validation/__tests__/banner.test.ts`

**Interfaces:**
- Consumes: khối dùng chung (Task 9), `RichTextEditor` (Task 10), `MediaPicker` (Task 8)
- Produces: `createPageAction`, `updatePageAction`, `deletePageAction`, `createBannerAction`, `updateBannerAction`, `deleteBannerAction`

- [ ] **Step 1: Viết test fail cho schema banner**

`lib/validation/__tests__/banner.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { bannerCreateSchema } from '@/lib/validation/banner'

const base = {
  title: 'Giải pháp cho doanh nghiệp Việt', subtitle: '', imageUrl: 'https://a/b.jpg',
  imageAlt: '', ctaLabel: '', ctaHref: '', order: '0', active: 'on',
}

describe('bannerCreateSchema', () => {
  it('chấp nhận banner hợp lệ', () => {
    expect(bannerCreateSchema.parse(base).active).toBe(true)
  })

  it('bắt buộc phải có ảnh', () => {
    expect(bannerCreateSchema.safeParse({ ...base, imageUrl: '' }).error!.flatten().fieldErrors.imageUrl)
      .toContain('Banner phải có ảnh')
  })

  it('chấp nhận link CTA nội bộ dạng /san-pham', () => {
    expect(bannerCreateSchema.parse({ ...base, ctaLabel: 'Xem', ctaHref: '/san-pham' }).ctaHref).toBe('/san-pham')
  })

  it('từ chối link CTA không phải http(s) hay đường dẫn nội bộ', () => {
    expect(bannerCreateSchema.safeParse({ ...base, ctaLabel: 'X', ctaHref: 'javascript:alert(1)' }).success).toBe(false)
  })

  it('bắt buộc có nhãn khi đã nhập link CTA', () => {
    expect(bannerCreateSchema.safeParse({ ...base, ctaLabel: '', ctaHref: '/san-pham' }).error!.flatten().fieldErrors.ctaLabel)
      .toContain('Nhập nhãn cho nút')
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npx vitest run lib/validation/__tests__/banner.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validation/banner'`

- [ ] **Step 3: Viết hai schema**

`lib/validation/banner.ts`:

```ts
import { z } from 'zod'

const checkbox = z.union([z.literal('on'), z.literal('true'), z.undefined(), z.literal('')])
  .transform((v) => v === 'on' || v === 'true')

const href = z.string().trim().refine(
  (v) => v === '' || v.startsWith('/') || /^https?:\/\//.test(v),
  'Link phải bắt đầu bằng / hoặc http(s)://',
)

export const bannerCreateSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(120, 'Tiêu đề tối đa 120 ký tự'),
  subtitle: z.string().trim().max(200, 'Phụ đề tối đa 200 ký tự').optional().default(''),
  imageUrl: z.string().trim().min(1, 'Banner phải có ảnh'),
  imageAlt: z.string().trim().optional().default(''),
  ctaLabel: z.string().trim().optional().default(''),
  ctaHref: href.optional().default(''),
  order: z.coerce.number().int().min(0).default(0),
  active: checkbox,
})
  .refine((v) => !(v.ctaHref && !v.ctaLabel), { path: ['ctaLabel'], message: 'Nhập nhãn cho nút' })
  .transform((v) => ({
    ...v,
    subtitle: v.subtitle || null,
    imageAlt: v.imageAlt || null,
    ctaLabel: v.ctaLabel || null,
    ctaHref: v.ctaHref || null,
  }))

export const bannerUpdateSchema = z.object({ id: z.string().min(1) }).and(bannerCreateSchema)
export const bannerDeleteSchema = z.object({ id: z.string().min(1) })
```

`lib/validation/page.ts`:

```ts
import { z } from 'zod'
import { slugify } from '@/lib/slug'
import { sanitizeHtml } from '@/lib/sanitize'

const hasText = (html: string) => sanitizeHtml(html).replace(/<[^>]*>/g, '').trim().length > 0

export const pageCreateSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề tối đa 200 ký tự'),
  slug: z.string().trim().optional().default(''),
  content: z.string().refine(hasText, 'Nội dung không được để trống'),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  seoTitle: z.string().trim().optional().default(''),
  seoDescription: z.string().trim().optional().default(''),
}).transform((v) => ({
  ...v,
  slug: slugify(v.slug || v.title),
  content: sanitizeHtml(v.content),
  seoTitle: v.seoTitle || null,
  seoDescription: v.seoDescription || null,
}))

export const pageUpdateSchema = z.object({ id: z.string().min(1) }).and(pageCreateSchema)
export const pageDeleteSchema = z.object({ id: z.string().min(1) })
```

**Slug bị chiếm chỗ:** `/[slug]` là route bắt tất cả ở tầng gốc, nên trang tĩnh không được dùng slug trùng với route đã có. Thêm vào `lib/validation/page.ts`:

```ts
export const RESERVED_SLUGS = ['tin-tuc', 'san-pham', 'admin', 'api', 'sitemap.xml', 'robots.txt', 'rss.xml']
```

và kiểm tra trong action (Step 4) — đặt ở action chứ không ở schema vì thông báo cần nêu đúng slug đã sinh ra sau khi chuẩn hoá.

- [ ] **Step 4: Chạy test để xác nhận pass, rồi viết action**

Run: `npx vitest run lib/validation/__tests__/banner.test.ts`
Expected: PASS (5 test)

`lib/actions/page.ts`:

```ts
'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { uniqueSlug } from '@/lib/slug'
import { createAction } from './helper'
import { pageCreateSchema, pageDeleteSchema, pageUpdateSchema, RESERVED_SLUGS } from '@/lib/validation/page'

async function takenSlugs(exceptId?: string) {
  const rows = await prisma.page.findMany({
    where: exceptId ? { NOT: { id: exceptId } } : {},
    select: { slug: true },
  })
  return [...rows.map((r) => r.slug), ...RESERVED_SLUGS]
}

export const createPageAction = createAction({
  schema: pageCreateSchema,
  tags: (_input, page) => [TAGS.pages, TAGS.page(page.slug)],
  handler: async (input) => prisma.page.create({
    data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs()) },
  }),
})

export const updatePageAction = createAction({
  schema: pageUpdateSchema,
  tags: (_input, page) => {
    const previous = (page as { previousSlug?: string }).previousSlug
    return [TAGS.pages, TAGS.page(page.slug), ...(previous ? [TAGS.page(previous)] : [])]
  },
  handler: async ({ id, ...input }) => {
    const current = await prisma.page.findUniqueOrThrow({ where: { id }, select: { slug: true } })
    const page = await prisma.page.update({
      where: { id },
      data: { ...input, slug: uniqueSlug(input.slug, await takenSlugs(id)) },
    })
    return current.slug === page.slug ? page : Object.assign(page, { previousSlug: current.slug })
  },
})

export const deletePageAction = createAction({
  schema: pageDeleteSchema,
  tags: (_input, page) => [TAGS.pages, TAGS.page(page.slug)],
  handler: ({ id }) => prisma.page.delete({ where: { id } }),
})
```

`lib/actions/banner.ts`:

```ts
'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { createAction } from './helper'
import { bannerCreateSchema, bannerDeleteSchema, bannerUpdateSchema } from '@/lib/validation/banner'

export const createBannerAction = createAction({
  schema: bannerCreateSchema,
  tags: () => [TAGS.banners],
  handler: (input) => prisma.banner.create({ data: input }),
})

export const updateBannerAction = createAction({
  schema: bannerUpdateSchema,
  tags: () => [TAGS.banners],
  handler: ({ id, ...input }) => prisma.banner.update({ where: { id }, data: input }),
})

export const deleteBannerAction = createAction({
  schema: bannerDeleteSchema,
  tags: () => [TAGS.banners],
  handler: ({ id }) => prisma.banner.delete({ where: { id } }),
})
```

- [ ] **Step 5: Màn hình trang tĩnh**

`app/admin/(dashboard)/trang/form.tsx` — dùng `useActionForm`, `SlugField`, `RichTextEditor`, `FieldError` như `PostForm` nhưng chỉ có các trường: Tiêu đề · Slug · Nội dung · Trạng thái · SEO. Không có ảnh bìa, không có danh mục, không có nổi bật.

`app/admin/(dashboard)/trang/page.tsx` — `AdminListShell` với cột *Tiêu đề · Đường dẫn · Trạng thái · Cập nhật*, cột đường dẫn hiển thị `/{slug}` kèm link mở tab mới. `moi/page.tsx` và `[id]/page.tsx` theo đúng khuôn Task 9.

- [ ] **Step 6: Màn hình banner**

`app/admin/(dashboard)/banner/form.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Banner } from '@prisma/client'
import { createBannerAction, updateBannerAction } from '@/lib/actions/banner'
import { useActionForm } from '@/components/admin/useActionForm'
import { FieldError } from '@/components/admin/FieldError'
import { MediaPicker } from '@/components/admin/MediaPicker'

export function BannerForm({ banner }: { banner?: Banner }) {
  const [image, setImage] = useState<string | null>(banner?.imageUrl ?? null)
  const action = banner ? updateBannerAction : createBannerAction
  const { pending, submit, fieldError, state } = useActionForm(action, { redirectTo: '/admin/banner' })

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <input type="hidden" name="imageUrl" value={image ?? ''} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">Tiêu đề</label>
        <input id="title" name="title" defaultValue={banner?.title ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <FieldError errors={fieldError('title')} />
      </div>

      <div>
        <label htmlFor="subtitle" className="block text-sm font-medium text-slate-700">Phụ đề</label>
        <input id="subtitle" name="subtitle" defaultValue={banner?.subtitle ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        <FieldError errors={fieldError('subtitle')} />
      </div>

      <MediaPicker label="Ảnh banner" value={image} onChange={setImage} />
      <FieldError errors={fieldError('imageUrl')} />

      <div>
        <label htmlFor="imageAlt" className="block text-sm font-medium text-slate-700">Mô tả ảnh</label>
        <input id="imageAlt" name="imageAlt" defaultValue={banner?.imageAlt ?? ''}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="ctaLabel" className="block text-sm font-medium text-slate-700">Nhãn nút</label>
          <input id="ctaLabel" name="ctaLabel" placeholder="Xem sản phẩm" defaultValue={banner?.ctaLabel ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('ctaLabel')} />
        </div>
        <div>
          <label htmlFor="ctaHref" className="block text-sm font-medium text-slate-700">Link nút</label>
          <input id="ctaHref" name="ctaHref" placeholder="/san-pham" defaultValue={banner?.ctaHref ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          <FieldError errors={fieldError('ctaHref')} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-slate-700">Thứ tự</label>
          <input id="order" name="order" type="number" min={0} defaultValue={banner?.order ?? 0}
            className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="active" defaultChecked={banner?.active ?? true} />
          Đang hiển thị
        </label>
      </div>

      {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}

      <button type="submit" disabled={pending}
        className="rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg disabled:opacity-60">
        {pending ? 'Đang lưu…' : 'Lưu'}
      </button>
    </form>
  )
}
```

`app/admin/(dashboard)/banner/page.tsx` — `AdminListShell` với cột *Ảnh (thumbnail) · Tiêu đề · Thứ tự · Hiển thị*; `moi/page.tsx` và `[id]/page.tsx` theo khuôn Task 9.

- [ ] **Step 7: Chạy test và kiểm tra thủ công**

Run: `npm test`
Expected: PASS toàn bộ

Tạo trang tĩnh với slug `tin-tuc` → hệ thống tự đổi thành `tin-tuc-2` (không cướp route tin tức). Tạo banner nhập link CTA nhưng bỏ trống nhãn → hiện lỗi *"Nhập nhãn cho nút"* ngay dưới ô nhãn.

- [ ] **Step 8: Commit**

```bash
git add lib/validation lib/actions app/admin
git commit -m "feat: add static page and homepage banner CRUD"
```

---

## Task 13: Cài đặt site + chọn màu chủ đạo

**Files:**
- Create: `lib/validation/settings.ts`, `lib/actions/settings.ts`, `app/admin/(dashboard)/cai-dat/page.tsx`, `app/admin/(dashboard)/cai-dat/form.tsx`, `components/admin/ThemePicker.tsx`
- Test: `lib/validation/__tests__/settings.test.ts`

**Interfaces:**
- Consumes: `createAction` (Task 6), `PRESETS`/`buildPalette`/`paletteToCssVars` (Task 3), `MediaPicker` (Task 8)
- Produces:
  - `updateSettingsAction(formData)`
  - `resolvePrimary(settings): string` — trả về hex đang có hiệu lực, dùng lại ở Task 14

- [ ] **Step 1: Viết test fail**

`lib/validation/__tests__/settings.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { resolvePrimary, settingsSchema } from '@/lib/validation/settings'
import { PRESETS } from '@/lib/theme/presets'

const base = {
  siteName: 'VNDERCO', logoUrl: '', faviconUrl: '',
  contactEmail: 'lienhe@vnderco.vn', contactPhone: '0901234567', contactAddress: '',
  zaloUrl: '', facebookUrl: '',
  themeMode: 'PRESET', presetKey: 'violet', customPrimary: '',
  homeIntroTitle: '', homeIntroBody: '', homeIntroImageUrl: '', homeIntroCtaLabel: '', homeIntroCtaHref: '',
  seoTitleTemplate: '%s | VNDERCO', seoDescription: '', seoOgImageUrl: '',
}

describe('settingsSchema', () => {
  it('từ chối email liên hệ sai định dạng', () => {
    expect(settingsSchema.safeParse({ ...base, contactEmail: 'không-phải-email' }).error!.flatten().fieldErrors.contactEmail)
      .toContain('Email liên hệ không hợp lệ')
  })

  it('từ chối preset không tồn tại', () => {
    expect(settingsSchema.safeParse({ ...base, presetKey: 'tim-than-thanh' }).success).toBe(false)
  })

  it('bắt buộc mã hex hợp lệ khi chọn chế độ tuỳ chỉnh', () => {
    expect(settingsSchema.safeParse({ ...base, themeMode: 'CUSTOM', customPrimary: 'xanh' }).error!
      .flatten().fieldErrors.customPrimary).toContain('Mã màu phải có dạng #RRGGBB')
    expect(settingsSchema.safeParse({ ...base, themeMode: 'CUSTOM', customPrimary: '#12AB34' }).success).toBe(true)
  })

  it('không đòi customPrimary khi đang ở chế độ preset', () => {
    expect(settingsSchema.safeParse({ ...base, themeMode: 'PRESET', customPrimary: '' }).success).toBe(true)
  })
})

describe('resolvePrimary', () => {
  it('lấy màu của preset khi ở chế độ PRESET', () => {
    expect(resolvePrimary({ themeMode: 'PRESET', presetKey: 'teal', customPrimary: null }))
      .toBe(PRESETS.teal.primary)
  })

  it('lấy customPrimary khi ở chế độ CUSTOM', () => {
    expect(resolvePrimary({ themeMode: 'CUSTOM', presetKey: 'teal', customPrimary: '#FF0000' })).toBe('#FF0000')
  })

  it('quay về violet khi dữ liệu hỏng', () => {
    expect(resolvePrimary({ themeMode: 'CUSTOM', presetKey: 'teal', customPrimary: null }))
      .toBe(PRESETS.violet.primary)
    expect(resolvePrimary({ themeMode: 'PRESET', presetKey: 'khong-ton-tai', customPrimary: null }))
      .toBe(PRESETS.violet.primary)
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npx vitest run lib/validation/__tests__/settings.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validation/settings'`

- [ ] **Step 3: Viết schema và `resolvePrimary`**

`lib/validation/settings.ts`:

```ts
import { z } from 'zod'
import { DEFAULT_PRESET_KEY, isPresetKey, PRESETS } from '@/lib/theme/presets'

const HEX = /^#[0-9a-fA-F]{6}$/
const blankToNull = z.string().trim().optional().transform((v) => (v ? v : null))
const url = z.string().trim().optional()
  .refine((v) => !v || v.startsWith('/') || /^https?:\/\//.test(v), 'Link phải bắt đầu bằng / hoặc http(s)://')
  .transform((v) => (v ? v : null))

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1, 'Tên site không được để trống').max(100),
  logoUrl: blankToNull,
  faviconUrl: blankToNull,

  contactEmail: z.string().trim().email('Email liên hệ không hợp lệ'),
  contactPhone: z.string().trim().min(8, 'Số điện thoại quá ngắn').max(20, 'Số điện thoại quá dài'),
  contactAddress: blankToNull,
  zaloUrl: url,
  facebookUrl: url,

  themeMode: z.enum(['PRESET', 'CUSTOM']),
  presetKey: z.string().refine(isPresetKey, 'Bảng màu không hợp lệ'),
  customPrimary: z.string().trim().optional().default(''),

  homeIntroTitle: z.string().trim().max(120, 'Tiêu đề tối đa 120 ký tự').optional().default(''),
  homeIntroBody: z.string().trim().max(600, 'Nội dung tối đa 600 ký tự').optional().default(''),
  homeIntroImageUrl: blankToNull,
  homeIntroCtaLabel: blankToNull,
  homeIntroCtaHref: url,

  seoTitleTemplate: z.string().trim().min(1, 'Mẫu tiêu đề không được để trống'),
  seoDescription: z.string().trim().max(300, 'Mô tả tối đa 300 ký tự').optional().default(''),
  seoOgImageUrl: blankToNull,
})
  .refine((v) => v.themeMode !== 'CUSTOM' || HEX.test(v.customPrimary), {
    path: ['customPrimary'],
    message: 'Mã màu phải có dạng #RRGGBB',
  })
  .transform((v) => ({ ...v, customPrimary: v.customPrimary || null }))

type ThemeFields = { themeMode: string; presetKey: string; customPrimary: string | null }

export function resolvePrimary(settings: ThemeFields): string {
  if (settings.themeMode === 'CUSTOM') {
    return settings.customPrimary && HEX.test(settings.customPrimary)
      ? settings.customPrimary
      : PRESETS[DEFAULT_PRESET_KEY].primary
  }
  return isPresetKey(settings.presetKey)
    ? PRESETS[settings.presetKey].primary
    : PRESETS[DEFAULT_PRESET_KEY].primary
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `npx vitest run lib/validation/__tests__/settings.test.ts`
Expected: PASS (7 test)

- [ ] **Step 5: Action lưu cài đặt**

`lib/actions/settings.ts`:

```ts
'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { createAction } from './helper'
import { settingsSchema } from '@/lib/validation/settings'

export const updateSettingsAction = createAction({
  schema: settingsSchema,
  // Màu và thông tin liên hệ nằm ở layout gốc → phải làm mới mọi thứ.
  tags: () => [TAGS.settings, TAGS.posts, TAGS.products, TAGS.pages, TAGS.banners],
  handler: (input) => prisma.siteSetting.upsert({
    where: { id: 1 },
    update: input,
    create: { id: 1, ...input },
  }),
})
```

- [ ] **Step 6: Bộ chọn màu có xem trước**

`components/admin/ThemePicker.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { PRESETS, type PresetKey } from '@/lib/theme/presets'
import { buildPalette, paletteToCssVars } from '@/lib/theme/palette'

const HEX = /^#[0-9a-fA-F]{6}$/

export function ThemePicker({
  defaultMode, defaultPreset, defaultCustom,
}: { defaultMode: 'PRESET' | 'CUSTOM'; defaultPreset: PresetKey; defaultCustom: string }) {
  const [mode, setMode] = useState(defaultMode)
  const [preset, setPreset] = useState<PresetKey>(defaultPreset)
  const [custom, setCustom] = useState(defaultCustom || PRESETS[defaultPreset].primary)

  const effective = mode === 'CUSTOM' && HEX.test(custom) ? custom : PRESETS[preset].primary
  const palette = buildPalette(effective)
  const vars = paletteToCssVars(palette) as React.CSSProperties

  return (
    <div className="space-y-4">
      <input type="hidden" name="themeMode" value={mode} />
      <input type="hidden" name="presetKey" value={preset} />
      <input type="hidden" name="customPrimary" value={mode === 'CUSTOM' ? custom : ''} />

      <div className="flex gap-4 text-sm">
        {(['PRESET', 'CUSTOM'] as const).map((value) => (
          <label key={value} className="flex items-center gap-2">
            <input type="radio" checked={mode === value} onChange={() => setMode(value)} />
            {value === 'PRESET' ? 'Bảng màu dựng sẵn' : 'Tuỳ chỉnh mã màu'}
          </label>
        ))}
      </div>

      {mode === 'PRESET' ? (
        <div className="flex flex-wrap gap-3">
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <button key={key} type="button" onClick={() => setPreset(key)}
              aria-pressed={preset === key}
              className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm ${
                preset === key ? 'border-slate-900' : 'border-slate-200'
              }`}>
              <span className="h-5 w-5 rounded-full" style={{ background: PRESETS[key].primary }} />
              {PRESETS[key].name}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input type="color" aria-label="Chọn màu" value={HEX.test(custom) ? custom : '#6C3DF4'}
            onChange={(e) => setCustom(e.target.value)} className="h-10 w-14 rounded border border-slate-300" />
          <input aria-label="Mã màu" value={custom} onChange={(e) => setCustom(e.target.value)}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" />
          {!HEX.test(custom) && <span className="text-sm text-red-600">Mã màu phải có dạng #RRGGBB</span>}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Xem trước (chưa lưu thì web thật chưa đổi)</p>
        <div style={vars} className="overflow-hidden rounded-xl border border-slate-200">
          <div className="p-6 text-white"
            style={{ background: `linear-gradient(125deg, ${palette.gradientFrom}, ${palette.gradientVia}, ${palette.gradientTo})`, color: palette.foreground }}>
            <p className="text-2xl font-extrabold">Giải pháp cho doanh nghiệp Việt</p>
            <span className="mt-3 inline-block rounded-full bg-white px-4 py-1.5 text-sm font-semibold"
              style={{ color: palette.primary }}>Xem sản phẩm</span>
          </div>
          <div className="flex gap-2 bg-white p-3">
            {[100, 300, 500, 700, 900].map((shade) => (
              <div key={shade} className="h-8 flex-1 rounded"
                style={{ background: palette.shades[shade as 100] }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Màn hình cài đặt 5 nhóm**

`app/admin/(dashboard)/cai-dat/form.tsx` — một form duy nhất, chia bằng `<fieldset>` cho từng nhóm: **Chung** (siteName, logoUrl, faviconUrl qua `MediaPicker`) · **Liên hệ** (contactEmail, contactPhone, contactAddress, zaloUrl, facebookUrl) · **Giao diện** (`<ThemePicker />`) · **Trang chủ** (homeIntroTitle, homeIntroBody, homeIntroImageUrl, homeIntroCtaLabel, homeIntroCtaHref) · **SEO mặc định** (seoTitleTemplate, seoDescription, seoOgImageUrl). Dùng `useActionForm(updateSettingsAction)` **không** truyền `redirectTo`, và hiện dòng *"Đã lưu cài đặt."* khi `state.ok`.

`app/admin/(dashboard)/cai-dat/page.tsx`:

```tsx
import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { SettingsForm } from './form'

export const metadata = { title: 'Cài đặt' }

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findUniqueOrThrow({ where: { id: 1 } })
  return (
    <AdminFormShell title="Cài đặt site" backHref="/admin">
      <SettingsForm settings={settings} />
    </AdminFormShell>
  )
}
```

- [ ] **Step 8: Chạy test và kiểm tra thủ công**

Run: `npm test`
Expected: PASS toàn bộ

Vào `/admin/cai-dat` → tab Giao diện: bấm lần lượt 6 bảng màu, khung xem trước đổi ngay. Chuyển sang *Tuỳ chỉnh*, nhập `#EAFF00` → chữ trên nút phải thành đen. Nhập `xanh` → hiện lỗi và nút Lưu trả về lỗi dưới ô mã màu.

- [ ] **Step 9: Commit**

```bash
git add lib/validation/settings.ts lib/actions/settings.ts components/admin/ThemePicker.tsx app/admin
git commit -m "feat: add site settings with preset and custom theme picker"
```

---

## Task 14: Layout công khai + nhúng màu + trang chủ

Đây là nơi hệ thống màu gặp người dùng thật. Biến CSS phải nằm trong HTML server trả về — nạp phía client sẽ gây chớp màu, đúng thứ đã bị loại ở giai đoạn thiết kế.

**Files:**
- Create: `app/(public)/layout.tsx`, `app/(public)/page.tsx`, `app/(public)/not-found.tsx`, `app/(public)/error.tsx`, `app/not-found.tsx`, `app/admin/(dashboard)/error.tsx`, `components/public/SiteHeader.tsx`, `components/public/SiteFooter.tsx`, `components/public/HeroSlider.tsx`, `components/public/PostCard.tsx`, `components/public/ProductCard.tsx`, `components/public/SectionHeading.tsx`
- Modify: `app/layout.tsx` (giữ tối thiểu), xoá `app/page.tsx` mặc định
- Test: `e2e/theme.spec.ts`, `e2e/not-found.spec.ts`

**Interfaces:**
- Consumes: `getSiteSettings`, `getActiveBanners`, `getFeaturedPosts`, `getFeaturedProducts` (Task 6, 8), `resolvePrimary` (Task 13), `buildPalette`/`paletteToCssVars` (Task 3)
- Produces: `<PostCard post />`, `<ProductCard product />`, `<SectionHeading title href linkLabel />` — dùng lại ở Task 15–16

- [ ] **Step 1: Viết E2E test fail trước**

`e2e/theme.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('màu chủ đạo nằm sẵn trong HTML server trả về, không nạp sau', async ({ page }) => {
  const response = await page.goto('/')
  const html = await response!.text()
  expect(html).toContain('--vnd-primary-500')
})

test('đổi bảng màu trong admin thì trang công khai đổi theo', async ({ page }) => {
  const readPrimary = async () => {
    await page.goto('/')
    return page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--vnd-primary-500').trim())
  }

  const before = await readPrimary()

  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()

  await page.goto('/admin/cai-dat')
  await page.getByRole('button', { name: 'Xanh ngọc' }).click()
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Đã lưu cài đặt')).toBeVisible()

  const after = await readPrimary()
  expect(after).not.toBe(before)
  expect(after).not.toBe('')
})
```

- [ ] **Step 2: Chạy E2E để xác nhận fail**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/theme.spec.ts`
Expected: FAIL — trang chủ vẫn là trang mặc định của Next.js, không có biến `--vnd-primary-500`

- [ ] **Step 3: Layout gốc tối giản**

`app/layout.tsx` — chỉ giữ `<html>`/`<body>` và import CSS; mọi thứ khác chuyển xuống layout con:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'VNDERCO' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  )
}
```

Xoá `app/page.tsx` mặc định (trang chủ chuyển vào `app/(public)/page.tsx`).

- [ ] **Step 4: Layout công khai nhúng biến màu**

`app/(public)/layout.tsx`:

```tsx
import { getSiteSettings } from '@/lib/queries/settings'
import { resolvePrimary } from '@/lib/validation/settings'
import { buildPalette, paletteToCssVars } from '@/lib/theme/palette'
import { SiteHeader } from '@/components/public/SiteHeader'
import { SiteFooter } from '@/components/public/SiteFooter'

export const revalidate = 3600

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const palette = buildPalette(resolvePrimary(settings))
  const vars = paletteToCssVars(palette)

  return (
    // Biến nằm ngay trong HTML server trả về → không có nhịp chớp màu khi tải.
    <div style={vars as React.CSSProperties} className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  )
}
```

- [ ] **Step 5: Header và footer**

`components/public/SiteHeader.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { SiteSetting } from '@prisma/client'

const NAV = [
  { href: '/san-pham', label: 'Sản phẩm' },
  { href: '/tin-tuc', label: 'Tin tức' },
  { href: '/gioi-thieu', label: 'Về chúng tôi' },
]

export function SiteHeader({ settings }: { settings: SiteSetting }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          {settings.logoUrl
            ? <Image src={settings.logoUrl} alt={settings.siteName} width={120} height={32} className="h-8 w-auto" />
            : settings.siteName}
        </Link>
        <nav aria-label="Điều hướng chính" className="flex items-center gap-6 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-600 hover:text-slate-900">{item.label}</Link>
          ))}
          <Link href="/lien-he"
            className="rounded-full bg-primary-600 px-4 py-1.5 font-semibold text-primary-fg">
            Liên hệ
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

`components/public/SiteFooter.tsx`:

```tsx
import Link from 'next/link'
import type { SiteSetting } from '@prisma/client'

export function SiteFooter({ settings }: { settings: SiteSetting }) {
  return (
    <footer className="mt-20 border-t border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold">{settings.siteName}</p>
          {settings.contactAddress && <p className="mt-2 text-sm text-slate-600">{settings.contactAddress}</p>}
        </div>
        <div className="text-sm text-slate-600">
          <p className="mb-2 font-semibold text-slate-900">Liên hệ</p>
          {settings.contactPhone && <p><a href={`tel:${settings.contactPhone}`} className="hover:underline">{settings.contactPhone}</a></p>}
          {settings.contactEmail && <p><a href={`mailto:${settings.contactEmail}`} className="hover:underline">{settings.contactEmail}</a></p>}
        </div>
        <div className="text-sm text-slate-600">
          <p className="mb-2 font-semibold text-slate-900">Liên kết</p>
          <p><Link href="/san-pham" className="hover:underline">Sản phẩm</Link></p>
          <p><Link href="/tin-tuc" className="hover:underline">Tin tức</Link></p>
          {settings.facebookUrl && <p><a href={settings.facebookUrl} className="hover:underline">Facebook</a></p>}
          {settings.zaloUrl && <p><a href={settings.zaloUrl} className="hover:underline">Zalo</a></p>}
        </div>
      </div>
      <p className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {settings.siteName}
      </p>
    </footer>
  )
}
```

- [ ] **Step 6: Hero slider và thẻ nội dung**

`components/public/HeroSlider.tsx` — client component, tự chuyển slide mỗi 6 giây, có nút chấm tròn; khi chỉ có 1 banner thì không hiện chấm và không chạy timer. Khi **không có banner nào**, render hero mặc định lấy `homeIntroTitle` làm tiêu đề để trang chủ không bao giờ trống:

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Banner } from '@prisma/client'

export function HeroSlider({ banners, fallbackTitle }: { banners: Banner[]; fallbackTitle: string }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (banners.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), 6000)
    return () => clearInterval(timer)
  }, [banners.length])

  const gradient = {
    backgroundImage: 'linear-gradient(125deg, var(--vnd-gradient-from), var(--vnd-gradient-via), var(--vnd-gradient-to))',
    color: 'var(--vnd-primary-fg)',
  }

  if (banners.length === 0) {
    return (
      <section style={gradient} className="px-4 py-24 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          {fallbackTitle || 'Giải pháp cho doanh nghiệp Việt'}
        </h1>
      </section>
    )
  }

  const banner = banners[index]

  return (
    <section style={gradient} className="relative overflow-hidden">
      {banner.imageUrl && (
        <Image src={banner.imageUrl} alt={banner.imageAlt ?? ''} fill priority
          className="absolute inset-0 object-cover opacity-25" />
      )}
      <div className="relative mx-auto max-w-6xl px-4 py-24">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{banner.title}</h1>
        {banner.subtitle && <p className="mt-4 max-w-xl text-lg opacity-90">{banner.subtitle}</p>}
        {banner.ctaHref && banner.ctaLabel && (
          <Link href={banner.ctaHref}
            className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-semibold text-slate-900 shadow-lg">
            {banner.ctaLabel}
          </Link>
        )}
        {banners.length > 1 && (
          <div className="mt-8 flex gap-2">
            {banners.map((b, i) => (
              <button key={b.id} type="button" onClick={() => setIndex(i)}
                aria-label={`Chuyển tới banner ${i + 1}`} aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

`components/public/PostCard.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Category, Post } from '@prisma/client'

export function PostCard({ post }: { post: Post & { category?: Category | null } }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-8px_var(--vnd-primary-300)] transition hover:-translate-y-1">
      <Link href={`/tin-tuc/${post.slug}`}>
        <div className="relative h-44 bg-primary-50">
          {post.coverImageUrl && (
            <Image src={post.coverImageUrl} alt={post.coverImageAlt ?? ''} fill className="object-cover" />
          )}
        </div>
        <div className="p-5">
          {post.category && (
            <span className="text-xs font-bold uppercase tracking-wide text-primary-600">{post.category.name}</span>
          )}
          <h3 className="mt-1 line-clamp-2 font-bold leading-snug text-slate-900">{post.title}</h3>
          {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>}
          {post.publishedAt && (
            <time dateTime={post.publishedAt.toISOString()} className="mt-3 block text-xs text-slate-400">
              {post.publishedAt.toLocaleDateString('vi-VN')}
            </time>
          )}
        </div>
      </Link>
    </article>
  )
}
```

`components/public/ProductCard.tsx` — cùng khuôn, link `/san-pham/${product.slug}`, ảnh lấy `product.images[0]`, hiển thị `summary` thay `excerpt`, không có ngày đăng.

`components/public/SectionHeading.tsx`:

```tsx
import Link from 'next/link'

export function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
      {href && linkLabel && (
        <Link href={href} className="text-sm font-semibold text-primary-600 hover:underline">{linkLabel} →</Link>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Trang chủ**

`app/(public)/page.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import { getActiveBanners } from '@/lib/queries/banners'
import { getFeaturedPosts } from '@/lib/queries/posts'
import { getFeaturedProducts } from '@/lib/queries/products'
import { getSiteSettings } from '@/lib/queries/settings'
import { HeroSlider } from '@/components/public/HeroSlider'
import { PostCard } from '@/components/public/PostCard'
import { ProductCard } from '@/components/public/ProductCard'
import { SectionHeading } from '@/components/public/SectionHeading'

export const revalidate = 3600

export default async function HomePage() {
  const [banners, posts, products, settings] = await Promise.all([
    getActiveBanners(), getFeaturedPosts(), getFeaturedProducts(), getSiteSettings(),
  ])

  return (
    <>
      <HeroSlider banners={banners} fallbackTitle={settings.homeIntroTitle} />

      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <SectionHeading title="Tin nổi bật" href="/tin-tuc" linkLabel="Xem tất cả" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="bg-primary-50/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading title="Sản phẩm nổi bật" href="/san-pham" linkLabel="Xem tất cả" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {settings.homeIntroTitle && (
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{settings.homeIntroTitle}</h2>
            <p className="mt-4 whitespace-pre-line text-slate-600">{settings.homeIntroBody}</p>
            {settings.homeIntroCtaHref && settings.homeIntroCtaLabel && (
              <Link href={settings.homeIntroCtaHref}
                className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 font-semibold text-primary-fg">
                {settings.homeIntroCtaLabel}
              </Link>
            )}
          </div>
          {settings.homeIntroImageUrl && (
            <Image src={settings.homeIntroImageUrl} alt="" width={640} height={420}
              className="rounded-2xl object-cover shadow-lg" />
          )}
        </section>
      )}

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl px-8 py-12 text-center"
          style={{
            backgroundImage: 'linear-gradient(125deg, var(--vnd-gradient-from), var(--vnd-gradient-via), var(--vnd-gradient-to))',
            color: 'var(--vnd-primary-fg)',
          }}>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Cần tư vấn cho doanh nghiệp của bạn?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {settings.contactPhone && (
              <a href={`tel:${settings.contactPhone}`}
                className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900">
                Gọi {settings.contactPhone}
              </a>
            )}
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`}
                className="rounded-full border border-white/60 px-6 py-3 font-semibold">
                Gửi email
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 8: Trang 404 và trang lỗi**

Làm ngay ở task này chứ không để sau: các task sau kiểm tra 404 bằng chữ *"Không tìm thấy"*, nếu chưa có thì test phải viết yếu đi rồi sửa lại — vòng vo và để lại một assert vô nghĩa trong lịch sử.

`e2e/not-found.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('slug không tồn tại trả 404 mang giao diện site', async ({ page }) => {
  const response = await page.goto('/khong-co-trang-nay')
  expect(response!.status()).toBe(404)
  await expect(page.getByText('Không tìm thấy')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible()
})
```

Test này fail cho tới khi có `app/(public)/[slug]/page.tsx` ở Task 17 — trước đó Next.js không có route nào khớp `/khong-co-trang-nay` nên dùng `app/not-found.tsx` toàn cục (không có header). Vì vậy **ở task này chỉ tạo file, chưa chạy `not-found.spec.ts`**; Task 17 mới bật nó lên. Không được nới lỏng assert để nó xanh sớm.

`app/(public)/not-found.tsx` — nằm trong `(public)` nên tự hưởng header, footer và màu của site:

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Không tìm thấy trang</h1>
      <p className="mt-2 text-slate-600">Trang bạn tìm có thể đã bị xoá hoặc đổi đường dẫn.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-primary-600 px-6 py-3 font-semibold text-primary-fg">
        Về trang chủ
      </Link>
    </div>
  )
}
```

`app/(public)/error.tsx`:

```tsx
'use client'

export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-slate-900">Đã có lỗi xảy ra</h1>
      <p className="mt-2 text-slate-600">Vui lòng thử lại. Nếu vẫn lỗi, hãy liên hệ với chúng tôi.</p>
      <button type="button" onClick={reset}
        className="mt-8 rounded-full bg-primary-600 px-6 py-3 font-semibold text-primary-fg">
        Thử lại
      </button>
    </div>
  )
}
```

`app/admin/(dashboard)/error.tsx` — tông trung tính, hiện `error.digest` để đối chiếu log:

```tsx
'use client'

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
      <h1 className="text-lg font-bold text-slate-900">Không tải được nội dung</h1>
      <p className="mt-2 text-sm text-slate-600">Thử lại, nếu vẫn lỗi hãy gửi mã sự cố bên dưới cho kỹ thuật.</p>
      {error.digest && <code className="mt-3 block text-xs text-slate-400">{error.digest}</code>}
      <button type="button" onClick={reset}
        className="mt-6 rounded-lg bg-primary-600 px-5 py-2 font-semibold text-primary-fg">Thử lại</button>
    </div>
  )
}
```

`app/not-found.tsx` — bắt 404 ngoài mọi route group (ví dụ `/admin/khong-ton-tai`), giao diện tối giản không phụ thuộc dữ liệu:

```tsx
import Link from 'next/link'

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-extrabold">Không tìm thấy trang</h1>
      <Link href="/" className="text-primary-600 underline">Về trang chủ</Link>
    </div>
  )
}
```

- [ ] **Step 9: Chạy E2E để xác nhận pass**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/theme.spec.ts`
Expected: PASS (2 test)

Nếu test 2 fail vì màu không đổi: `updateSettingsAction` chưa revalidate đủ tag — kiểm tra nó trả về mảng gồm cả `TAGS.posts`, `TAGS.products`, `TAGS.pages`, `TAGS.banners` chứ không chỉ `TAGS.settings`, vì layout công khai bọc mọi trang.

- [ ] **Step 10: Commit**

```bash
git add app components/public e2e
git commit -m "feat: add public layout with server-rendered theme, homepage and error boundaries"
```

---

## Task 15: Trang tin tức công khai

**Files:**
- Create: `app/(public)/tin-tuc/page.tsx`, `app/(public)/tin-tuc/[slug]/page.tsx`, `components/public/Pagination.tsx`, `components/public/CategoryFilter.tsx`, `components/public/RichContent.tsx`, `components/public/ContentListPage.tsx`
- Test: `e2e/publish-flow.spec.ts`

**Interfaces:**
- Consumes: `getPublishedPosts`, `getPostBySlug`, `getRelatedPosts`, `getCategories` (Task 6), `PostCard`/`SectionHeading` (Task 14)
- Produces: `<Pagination page pageCount basePath extraQuery />`, `<CategoryFilter categories active basePath />`, `<RichContent html />`, `<ContentListPage … />` — dùng lại ở Task 16–17

**Quyết định của chủ dự án (ghi đè plan gốc):** trang danh sách tin và trang danh sách sản phẩm dùng **chung một component** `ContentListPage`, không viết hai file song song gần giống nhau. Task 16 chỉ gọi lại component này với prop khác.

- [ ] **Step 1: Viết E2E test fail — luồng quan trọng nhất của dự án**

`e2e/publish-flow.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('bài nháp không lộ ra ngoài, xuất bản xong thì hiện ngay', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()

  // Lưu ở trạng thái nháp
  await page.goto('/admin/tin-tuc/moi')
  await page.getByLabel('Tiêu đề').fill('Bản tin thử nghiệm ISR')
  await page.locator('.ProseMirror').fill('Nội dung bản tin thử nghiệm.')
  await page.getByLabel('Trạng thái').selectOption('DRAFT')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page).toHaveURL(/\/admin\/tin-tuc$/)

  await page.goto('/tin-tuc')
  await expect(page.getByText('Bản tin thử nghiệm ISR')).toHaveCount(0)
  await page.goto('/tin-tuc/ban-tin-thu-nghiem-isr')
  await expect(page.getByText('Không tìm thấy')).toBeVisible()

  // Chuyển sang xuất bản
  await page.goto('/admin/tin-tuc')
  await page.getByRole('link', { name: 'Bản tin thử nghiệm ISR' }).click()
  await page.getByLabel('Trạng thái').selectOption('PUBLISHED')
  await page.getByRole('button', { name: 'Lưu' }).click()

  // Trang tĩnh phải được làm mới ngay, không phải chờ hết 3600 giây
  await page.goto('/tin-tuc')
  await expect(page.getByText('Bản tin thử nghiệm ISR')).toBeVisible()
  await page.goto('/tin-tuc/ban-tin-thu-nghiem-isr')
  await expect(page.getByRole('heading', { name: 'Bản tin thử nghiệm ISR' })).toBeVisible()
})
```

- [ ] **Step 2: Chạy E2E để xác nhận fail**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/publish-flow.spec.ts`
Expected: FAIL — `/tin-tuc` trả 404

- [ ] **Step 3: Khối phân trang, lọc, nội dung**

`components/public/Pagination.tsx`:

```tsx
import Link from 'next/link'

export function Pagination({
  page, pageCount, basePath, extraQuery,
}: { page: number; pageCount: number; basePath: string; extraQuery?: Record<string, string | undefined> }) {
  if (pageCount <= 1) return null

  const hrefFor = (target: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(extraQuery ?? {})) if (value) params.set(key, value)
    if (target > 1) params.set('trang', String(target))
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  return (
    <nav aria-label="Phân trang" className="mt-10 flex justify-center gap-2">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
        <Link key={n} href={hrefFor(n)} aria-current={n === page ? 'page' : undefined}
          className={`rounded-lg px-4 py-2 text-sm ${
            n === page ? 'bg-primary-600 font-semibold text-primary-fg' : 'border border-slate-200 text-slate-600'
          }`}>
          {n}
        </Link>
      ))}
    </nav>
  )
}
```

`components/public/CategoryFilter.tsx`:

```tsx
import Link from 'next/link'
import type { Category } from '@prisma/client'

export function CategoryFilter({
  categories, active, basePath,
}: { categories: Category[]; active?: string; basePath: string }) {
  const item = (href: string, label: string, isActive: boolean) => (
    <Link key={href} href={href}
      className={`rounded-full px-4 py-1.5 text-sm ${
        isActive ? 'bg-primary-600 font-semibold text-primary-fg' : 'border border-slate-200 text-slate-600'
      }`}>
      {label}
    </Link>
  )

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {item(basePath, 'Tất cả', !active)}
      {categories.map((c) => item(`${basePath}?danh-muc=${c.slug}`, c.name, active === c.slug))}
    </div>
  )
}
```

`components/public/RichContent.tsx` — HTML đã được làm sạch ở tầng ghi (Task 10), nên ở đây chỉ lo trình bày:

```tsx
export function RichContent({ html }: { html: string }) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-extrabold prose-a:text-primary-700 prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

Cài plugin typography: `npm i -D @tailwindcss/typography` và thêm `@plugin "@tailwindcss/typography";` vào `app/globals.css` ngay sau `@import "tailwindcss";`.

- [ ] **Step 4: Component danh sách dùng chung**

Trang tin và trang sản phẩm khác nhau ở nguồn dữ liệu và cách hiển thị thẻ, còn khung thì y hệt: đọc `searchParams`, tải danh mục, lọc, lưới, phân trang. Viết một lần.

`components/public/ContentListPage.tsx`:

```tsx
import type { Category, CategoryType } from '@prisma/client'
import { getCategories } from '@/lib/queries/categories'
import { CategoryFilter } from './CategoryFilter'
import { Pagination } from './Pagination'

type ListResult<T> = { items: T[]; pageCount: number }

export async function ContentListPage<T extends { id: string }>({
  title, basePath, categoryType, emptyMessage, gridClassName, fetchItems, renderItem, searchParams,
}: {
  title: string
  basePath: string
  categoryType: CategoryType
  emptyMessage: string
  gridClassName: string
  fetchItems: (args: { page: number; categorySlug?: string }) => Promise<ListResult<T>>
  renderItem: (item: T) => React.ReactNode
  searchParams: Promise<{ trang?: string; 'danh-muc'?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.trang) || 1)
  const categorySlug = params['danh-muc']

  const [{ items, pageCount }, categories] = await Promise.all([
    fetchItems({ page, categorySlug }),
    getCategories(categoryType),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight">{title}</h1>
      <CategoryFilter categories={categories as Category[]} active={categorySlug} basePath={basePath} />

      {items.length === 0
        ? <p className="py-16 text-center text-slate-500">{emptyMessage}</p>
        : <div className={gridClassName}>{items.map(renderItem)}</div>}

      <Pagination page={page} pageCount={pageCount} basePath={basePath}
        extraQuery={{ 'danh-muc': categorySlug }} />
    </div>
  )
}
```

- [ ] **Step 5: Danh sách tin**

`app/(public)/tin-tuc/page.tsx` — chỉ còn phần khác biệt:

```tsx
import { getPublishedPosts } from '@/lib/queries/posts'
import { PostCard } from '@/components/public/PostCard'
import { ContentListPage } from '@/components/public/ContentListPage'

export const revalidate = 3600
export const metadata = { title: 'Tin tức' }

export default function NewsListPage({
  searchParams,
}: { searchParams: Promise<{ trang?: string; 'danh-muc'?: string }> }) {
  return (
    <ContentListPage
      title="Tin tức"
      basePath="/tin-tuc"
      categoryType="NEWS"
      emptyMessage="Chưa có bài viết nào trong mục này."
      gridClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      fetchItems={getPublishedPosts}
      renderItem={(post) => <PostCard key={post.id} post={post} />}
      searchParams={searchParams}
    />
  )
}
```

- [ ] **Step 6: Chi tiết tin**

`app/(public)/tin-tuc/[slug]/page.tsx`:

```tsx
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPostBySlug, getRelatedPosts } from '@/lib/queries/posts'
import { RichContent } from '@/components/public/RichContent'
import { PostCard } from '@/components/public/PostCard'
import { SectionHeading } from '@/components/public/SectionHeading'

export const revalidate = 3600

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post.id, post.categoryId)

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {post.category && (
        <span className="text-xs font-bold uppercase tracking-wide text-primary-600">{post.category.name}</span>
      )}
      <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
      {post.publishedAt && (
        <time dateTime={post.publishedAt.toISOString()} className="mt-3 block text-sm text-slate-500">
          {post.publishedAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </time>
      )}

      {post.coverImageUrl && (
        <Image src={post.coverImageUrl} alt={post.coverImageAlt ?? ''} width={1200} height={630} priority
          className="mt-6 w-full rounded-2xl object-cover" />
      )}

      <div className="mt-8"><RichContent html={post.content} /></div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="Bài liên quan" />
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((item) => <PostCard key={item.id} post={item} />)}
          </div>
        </section>
      )}
    </article>
  )
}
```

- [ ] **Step 7: Chạy E2E để xác nhận pass**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/publish-flow.spec.ts`
Expected: PASS

Assert *"Không tìm thấy"* dựa vào `app/(public)/not-found.tsx` đã có từ Task 14. Route `/tin-tuc/[slug]` tồn tại ở task này, nên `notFound()` trong đó dùng đúng trang 404 có header của site. Không nới lỏng assert này trong bất kỳ tình huống nào — nếu nó fail thì `notFound()` chưa được gọi hoặc bài nháp đang lọt ra ngoài, cả hai đều là lỗi thật.

- [ ] **Step 8: Commit**

```bash
git add app/\(public\)/tin-tuc components/public app/globals.css package.json
git commit -m "feat: add public news list and detail pages"
```

---

## Task 16: Trang sản phẩm công khai + nút liên hệ

Nút liên hệ là lý do tồn tại của phần sản phẩm — sản phẩm không bán online, mọi chuyển đổi đi qua cụm nút này.

**Files:**
- Create: `app/(public)/san-pham/page.tsx`, `app/(public)/san-pham/[slug]/page.tsx`, `components/public/ProductGallery.tsx`, `components/public/ContactButtons.tsx`
- Test: `e2e/product-contact.spec.ts`

**Interfaces:**
- Consumes: `getPublishedProducts`, `getProductBySlug`, `getSiteSettings` (Task 6), `ContentListPage`/`RichContent` (Task 15), `ProductCard` (Task 14)
- Produces: `<ContactButtons settings productName sticky />`

- [ ] **Step 1: Viết E2E test fail trước**

`e2e/product-contact.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const CONTACT = { phone: '0987654321', email: 'kinhdoanh@vnderco.vn' }

test('nút liên hệ trên trang sản phẩm dùng đúng số và email trong cài đặt', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()

  // Đặt thông tin liên hệ
  await page.goto('/admin/cai-dat')
  await page.getByLabel('Số điện thoại').fill(CONTACT.phone)
  await page.getByLabel('Email liên hệ').fill(CONTACT.email)
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Đã lưu cài đặt')).toBeVisible()

  // Tạo sản phẩm đã xuất bản
  await page.goto('/admin/san-pham/moi')
  await page.getByLabel('Tên sản phẩm').fill('Máy lọc không khí X1')
  await page.getByLabel('Trạng thái').selectOption('PUBLISHED')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page).toHaveURL(/\/admin\/san-pham$/)

  await page.goto('/san-pham/may-loc-khong-khi-x1')
  await expect(page.getByRole('link', { name: /Gọi/ }))
    .toHaveAttribute('href', `tel:${CONTACT.phone}`)

  const mailto = await page.getByRole('link', { name: /email/i }).getAttribute('href')
  expect(mailto).toContain(`mailto:${CONTACT.email}`)
  expect(decodeURIComponent(mailto!)).toContain('Hỏi về sản phẩm Máy lọc không khí X1')
})
```

- [ ] **Step 2: Chạy E2E để xác nhận fail**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/product-contact.spec.ts`
Expected: FAIL — `/san-pham/...` trả 404

- [ ] **Step 3: Cụm nút liên hệ**

`components/public/ContactButtons.tsx`:

```tsx
import type { SiteSetting } from '@prisma/client'

export function ContactButtons({
  settings, productName, sticky = false,
}: { settings: SiteSetting; productName: string; sticky?: boolean }) {
  const subject = encodeURIComponent(`Hỏi về sản phẩm ${productName}`)
  const wrapper = sticky
    ? 'fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-slate-200 bg-white p-3 sm:hidden'
    : 'hidden flex-wrap gap-3 sm:flex'

  return (
    <div className={wrapper}>
      {settings.contactPhone && (
        <a href={`tel:${settings.contactPhone}`}
          className="flex-1 rounded-full bg-primary-600 px-6 py-3 text-center font-semibold text-primary-fg">
          Gọi {settings.contactPhone}
        </a>
      )}
      {settings.contactEmail && (
        <a href={`mailto:${settings.contactEmail}?subject=${subject}`}
          className="flex-1 rounded-full border border-primary-600 px-6 py-3 text-center font-semibold text-primary-700">
          Gửi email
        </a>
      )}
      {settings.zaloUrl && (
        <a href={settings.zaloUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 rounded-full border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700">
          Nhắn Zalo
        </a>
      )}
    </div>
  )
}
```

Render **hai lần** trên trang chi tiết: một bản thường trong cột thông tin (ẩn trên mobile) và một bản `sticky` dính đáy màn hình (chỉ hiện trên mobile). Cả hai dùng cùng component, chỉ khác prop.

- [ ] **Step 4: Bộ ảnh sản phẩm**

`components/public/ProductGallery.tsx`:

```tsx
'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { ProductImage } from '@prisma/client'

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-4/3 rounded-2xl bg-primary-50" aria-hidden />
  }

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-primary-50">
        <Image src={images[active].url} alt={images[active].alt ?? name} fill priority className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button key={image.id} type="button" onClick={() => setActive(index)}
              aria-label={`Xem ảnh ${index + 1}`} aria-current={index === active}
              className={`relative h-16 w-20 overflow-hidden rounded-lg border-2 ${
                index === active ? 'border-primary-600' : 'border-transparent'
              }`}>
              <Image src={image.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Danh sách sản phẩm**

Dùng lại `ContentListPage` của Task 15 — **không** viết lại khung danh sách.

`app/(public)/san-pham/page.tsx`:

```tsx
import { getPublishedProducts } from '@/lib/queries/products'
import { ProductCard } from '@/components/public/ProductCard'
import { ContentListPage } from '@/components/public/ContentListPage'

export const revalidate = 3600
export const metadata = { title: 'Sản phẩm' }

export default function ProductListPage({
  searchParams,
}: { searchParams: Promise<{ trang?: string; 'danh-muc'?: string }> }) {
  return (
    <ContentListPage
      title="Sản phẩm"
      basePath="/san-pham"
      categoryType="PRODUCT"
      emptyMessage="Chưa có sản phẩm nào trong mục này."
      gridClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      fetchItems={getPublishedProducts}
      renderItem={(product) => <ProductCard key={product.id} product={product} />}
      searchParams={searchParams}
    />
  )
}
```

- [ ] **Step 6: Chi tiết sản phẩm**

`app/(public)/san-pham/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/queries/products'
import { getSiteSettings } from '@/lib/queries/settings'
import { ProductGallery } from '@/components/public/ProductGallery'
import { ContactButtons } from '@/components/public/ContactButtons'
import { RichContent } from '@/components/public/RichContent'

export const revalidate = 3600

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) notFound()

  const specs = (product.specs as { label: string; value: string }[]) ?? []

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 pb-24 sm:pb-12">
      <div className="grid gap-10 sm:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.category && (
            <span className="text-xs font-bold uppercase tracking-wide text-primary-600">{product.category.name}</span>
          )}
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{product.name}</h1>
          {product.summary && <p className="mt-3 text-slate-600">{product.summary}</p>}

          {specs.length > 0 && (
            <table className="mt-6 w-full text-sm">
              <caption className="sr-only">Thông số kỹ thuật {product.name}</caption>
              <tbody>
                {specs.map((spec) => (
                  <tr key={spec.label} className="border-b border-slate-100">
                    <th scope="row" className="py-2 pr-4 text-left font-medium text-slate-500">{spec.label}</th>
                    <td className="py-2 text-slate-900">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-8">
            <ContactButtons settings={settings} productName={product.name} />
          </div>
        </div>
      </div>

      {product.description && (
        <div className="mt-12 max-w-3xl"><RichContent html={product.description} /></div>
      )}

      <ContactButtons settings={settings} productName={product.name} sticky />
    </div>
  )
}
```

- [ ] **Step 7: Chạy E2E để xác nhận pass**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/product-contact.spec.ts`
Expected: PASS

Nếu `getByRole('link', { name: /Gọi/ })` khớp 2 phần tử: đó là bản thường và bản sticky — thêm `.first()` vào assert, đừng bỏ một trong hai bản render.

- [ ] **Step 8: Commit**

```bash
git add app/\(public\)/san-pham components/public
git commit -m "feat: add public product pages with contact call-to-action"
```

---

## Task 17: Trang tĩnh công khai

Trang 404 và các `error.tsx` đã làm ở Task 14. Task này thêm route `/[slug]` — cũng chính là thứ khiến `e2e/not-found.spec.ts` (viết ở Task 14, chưa chạy) bắt đầu xanh, vì từ giờ mọi đường dẫn lạ mới rơi vào `(public)` và dùng trang 404 có header.

**Files:**
- Create: `app/(public)/[slug]/page.tsx`
- Test: `e2e/static-page.spec.ts`, bật lại `e2e/not-found.spec.ts`

**Interfaces:**
- Consumes: `getPageBySlug` (Task 6), `RichContent` (Task 15)
- Produces: không có API mới

- [ ] **Step 1: Viết E2E test fail trước**

`e2e/static-page.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('trang tĩnh đã xuất bản hiện đúng nội dung, giữ header của site', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Email').fill('admin@app.com')
  await page.getByLabel('Mật khẩu').fill('Admin@6868')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()

  await page.goto('/admin/trang/moi')
  await page.getByLabel('Tiêu đề').fill('Giới thiệu')
  await page.locator('.ProseMirror').fill('VNDERCO thành lập năm 2015.')
  await page.getByLabel('Trạng thái').selectOption('PUBLISHED')
  await page.getByRole('button', { name: 'Lưu' }).click()

  await page.goto('/gioi-thieu')
  await expect(page.getByRole('heading', { name: 'Giới thiệu', level: 1 })).toBeVisible()
  await expect(page.getByText('VNDERCO thành lập năm 2015')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Điều hướng chính' })).toBeVisible()
})
```

Chỉ một test ở đây — phần 404 đã có `e2e/not-found.spec.ts` từ Task 14, đừng viết lại.

- [ ] **Step 2: Chạy E2E để xác nhận fail**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/static-page.spec.ts`
Expected: FAIL — `/gioi-thieu` trả 404 mặc định

- [ ] **Step 3: Trang tĩnh**

`app/(public)/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/queries/pages'
import { RichContent } from '@/components/public/RichContent'

export const revalidate = 3600

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{page.title}</h1>
      <div className="mt-8"><RichContent html={page.content} /></div>
    </article>
  )
}
```

Next.js ưu tiên route tĩnh hơn route động, nên `/tin-tuc` và `/san-pham` vẫn thắng `[slug]`. Danh sách `RESERVED_SLUGS` ở Task 12 chỉ để chặn admin tạo slug vô dụng, không phải để tránh xung đột routing.

- [ ] **Step 4: Chạy E2E để xác nhận pass**

Run: `npm run test:e2e:reset && npm run test:e2e -- e2e/static-page.spec.ts e2e/not-found.spec.ts e2e/publish-flow.spec.ts`
Expected: PASS

`e2e/not-found.spec.ts` được viết ở Task 14 nhưng chưa chạy vì thiếu route `/[slug]`; từ task này nó phải xanh. Nếu nó vẫn fail với 404 không có header, nghĩa là `app/(public)/[slug]/page.tsx` chưa gọi `notFound()` hoặc file đặt sai route group.

- [ ] **Step 5: Commit**

```bash
git add app e2e
git commit -m "feat: add public static pages by slug"
```

---

## Task 18: SEO — metadata, JSON-LD, sitemap, RSS

**Files:**
- Create: `lib/seo.ts`, `app/(public)/opengraph-image.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/rss.xml/route.ts`
- Modify: `app/(public)/layout.tsx` (thêm `generateMetadata`), `app/(public)/tin-tuc/[slug]/page.tsx`, `app/(public)/san-pham/[slug]/page.tsx`, `app/(public)/[slug]/page.tsx`
- Test: `lib/__tests__/seo.test.ts`

**Interfaces:**
- Consumes: `getSiteSettings`, `getAllPublishedPostSlugs`, `getAllPublishedProductSlugs`, `getAllPublishedPageSlugs` (Task 6)
- Produces:
  - `pickOgImage({ contentImage, settingsImage, fallbackPath }): string`
  - `articleJsonLd(post, siteName, url)`, `productJsonLd(product, url)`, `organizationJsonLd(settings, url)`, `breadcrumbJsonLd(items)`
  - `siteUrl(): string`

- [ ] **Step 1: Viết test fail cho thứ tự ưu tiên ảnh chia sẻ**

`lib/__tests__/seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { articleJsonLd, pickOgImage } from '@/lib/seo'

describe('pickOgImage', () => {
  it('ưu tiên ảnh của chính nội dung', () => {
    expect(pickOgImage({ contentImage: 'https://a/post.jpg', settingsImage: 'https://a/default.jpg' }))
      .toBe('https://a/post.jpg')
  })

  it('dùng ảnh mặc định trong cài đặt khi nội dung không có ảnh', () => {
    expect(pickOgImage({ contentImage: null, settingsImage: 'https://a/default.jpg' }))
      .toBe('https://a/default.jpg')
  })

  it('cuối cùng mới dùng ảnh sinh động', () => {
    expect(pickOgImage({ contentImage: null, settingsImage: null })).toBe('/opengraph-image')
  })
})

describe('articleJsonLd', () => {
  it('sinh JSON-LD kiểu Article đúng trường bắt buộc', () => {
    const json = articleJsonLd(
      { title: 'Tin A', excerpt: 'Tóm tắt', publishedAt: new Date('2026-01-15'), coverImageUrl: 'https://a/x.jpg' },
      'VNDERCO',
      'https://vnderco.vn/tin-tuc/tin-a',
    )
    expect(json['@type']).toBe('Article')
    expect(json.headline).toBe('Tin A')
    expect(json.datePublished).toBe('2026-01-15T00:00:00.000Z')
    expect(json.publisher).toEqual({ '@type': 'Organization', name: 'VNDERCO' })
    expect(json.mainEntityOfPage).toBe('https://vnderco.vn/tin-tuc/tin-a')
  })

  it('bỏ trường ảnh khi bài không có ảnh bìa', () => {
    const json = articleJsonLd({ title: 'B', excerpt: null, publishedAt: null, coverImageUrl: null }, 'VNDERCO', 'https://x/y')
    expect(json.image).toBeUndefined()
    expect(json.datePublished).toBeUndefined()
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận fail**

Run: `npx vitest run lib/__tests__/seo.test.ts`
Expected: FAIL — `Cannot find module '@/lib/seo'`

- [ ] **Step 3: Viết `lib/seo.ts`**

```ts
type OgInput = { contentImage?: string | null; settingsImage?: string | null }

export function pickOgImage({ contentImage, settingsImage }: OgInput): string {
  return contentImage || settingsImage || '/opengraph-image'
}

export function siteUrl(): string {
  return process.env.AUTH_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
}

type ArticleInput = {
  title: string; excerpt: string | null; publishedAt: Date | null; coverImageUrl: string | null
}

export function articleJsonLd(post: ArticleInput, siteName: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImageUrl ?? undefined,
    datePublished: post.publishedAt?.toISOString(),
    publisher: { '@type': 'Organization', name: siteName },
    mainEntityOfPage: url,
  }
}

type ProductInput = { name: string; summary: string | null; images: { url: string }[] }

export function productJsonLd(product: ProductInput, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary ?? undefined,
    image: product.images.map((i) => i.url),
    url,
  }
}

type OrgInput = {
  siteName: string; logoUrl: string | null; contactPhone: string; contactEmail: string
  facebookUrl: string | null; zaloUrl: string | null
}

export function organizationJsonLd(settings: OrgInput, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.siteName,
    url,
    logo: settings.logoUrl ?? undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.contactPhone || undefined,
      email: settings.contactEmail || undefined,
      contactType: 'sales',
    },
    sameAs: [settings.facebookUrl, settings.zaloUrl].filter(Boolean),
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
    })),
  }
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

Run: `npx vitest run lib/__tests__/seo.test.ts`
Expected: PASS (5 test)

- [ ] **Step 5: Metadata cho từng trang**

Trong `app/(public)/layout.tsx`, thêm:

```tsx
import type { Metadata } from 'next'
import { siteUrl } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    metadataBase: new URL(siteUrl()),
    title: { template: settings.seoTitleTemplate, default: settings.siteName },
    description: settings.seoDescription,
    openGraph: { siteName: settings.siteName, locale: 'vi_VN', type: 'website' },
  }
}
```

Trong `app/(public)/tin-tuc/[slug]/page.tsx`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [post, settings] = await Promise.all([getPostBySlug(slug), getSiteSettings()])
  if (!post) return { title: 'Không tìm thấy' }

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: { canonical: `/tin-tuc/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      publishedTime: post.publishedAt?.toISOString(),
      images: [pickOgImage({ contentImage: post.coverImageUrl, settingsImage: settings.seoOgImageUrl })],
    },
  }
}
```

và nhúng JSON-LD ngay trong `<article>`:

```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(post, settings.siteName, `${siteUrl()}/tin-tuc/${post.slug}`)) }} />
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd([
    { name: 'Trang chủ', url: siteUrl() },
    { name: 'Tin tức', url: `${siteUrl()}/tin-tuc` },
    { name: post.title, url: `${siteUrl()}/tin-tuc/${post.slug}` },
  ])) }} />
```

Làm tương tự cho `san-pham/[slug]` (dùng `productJsonLd`, ảnh lấy `product.images[0]?.url`) và `[slug]` (chỉ metadata + breadcrumb). Nhúng `organizationJsonLd` một lần trong `app/(public)/layout.tsx`.

- [ ] **Step 6: Ảnh chia sẻ sinh động**

`app/(public)/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { getSiteSettings } from '@/lib/queries/settings'
import { resolvePrimary } from '@/lib/validation/settings'
import { buildPalette } from '@/lib/theme/palette'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OgImage() {
  const settings = await getSiteSettings()
  const palette = buildPalette(resolvePrimary(settings))

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 80, color: palette.foreground,
        backgroundImage: `linear-gradient(125deg, ${palette.gradientFrom}, ${palette.gradientVia}, ${palette.gradientTo})`,
      }}>
        <div style={{ fontSize: 32, opacity: 0.85 }}>{settings.siteName}</div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.15, marginTop: 16 }}>
          {settings.seoDescription || 'Sản phẩm và giải pháp cho doanh nghiệp Việt'}
        </div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 7: sitemap, robots, RSS**

`app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { getAllPublishedPostSlugs } from '@/lib/queries/posts'
import { getAllPublishedProductSlugs } from '@/lib/queries/products'
import { getAllPublishedPageSlugs } from '@/lib/queries/pages'
import { siteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [posts, products, pages] = await Promise.all([
    getAllPublishedPostSlugs(), getAllPublishedProductSlugs(), getAllPublishedPageSlugs(),
  ])

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/tin-tuc`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/san-pham`, changeFrequency: 'weekly', priority: 0.9 },
    ...posts.map((p) => ({ url: `${base}/tin-tuc/${p.slug}`, lastModified: p.updatedAt })),
    ...products.map((p) => ({ url: `${base}/san-pham/${p.slug}`, lastModified: p.updatedAt })),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt })),
  ]
}
```

`app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
```

`app/rss.xml/route.ts`:

```ts
import { getPublishedPosts } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/settings'
import { siteUrl } from '@/lib/seo'

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const revalidate = 3600

export async function GET() {
  const base = siteUrl()
  const [{ items }, settings] = await Promise.all([getPublishedPosts({ page: 1 }), getSiteSettings()])

  const entries = items.map((post) => `
    <item>
      <title>${escape(post.title)}</title>
      <link>${base}/tin-tuc/${post.slug}</link>
      <guid>${base}/tin-tuc/${post.slug}</guid>
      ${post.excerpt ? `<description>${escape(post.excerpt)}</description>` : ''}
      ${post.publishedAt ? `<pubDate>${post.publishedAt.toUTCString()}</pubDate>` : ''}
    </item>`).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${escape(settings.siteName)} — Tin tức</title>
  <link>${base}/tin-tuc</link>
  <description>${escape(settings.seoDescription)}</description>
  <language>vi</language>${entries}
</channel></rss>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
```

- [ ] **Step 8: Kiểm tra thủ công**

```bash
npm run build && npm run start
```

Mở `/sitemap.xml` — chỉ chứa nội dung đã xuất bản, **không** có bài nháp. Mở `/rss.xml` — XML hợp lệ. Mở `/robots.txt` — có `Disallow: /admin`. Xem mã nguồn `/tin-tuc/<slug>` — có đúng 2 khối `application/ld+json` (Article + Breadcrumb).

- [ ] **Step 9: Commit**

```bash
git add lib/seo.ts app
git commit -m "feat: add SEO metadata, JSON-LD, sitemap, robots and RSS"
```

---

## Task 19: Rà soát cuối + tài liệu vận hành

**Files:**
- Create: `README.md` (thay nội dung một dòng hiện tại), `.github/workflows/ci.yml`
- Modify: `package.json` (script `test:all`)
- Test: chạy toàn bộ

**Interfaces:**
- Consumes: mọi task trước
- Produces: lệnh `npm run test:all`; README hướng dẫn chạy và deploy

- [ ] **Step 1: Gộp lệnh kiểm thử**

Thêm vào `package.json`:

```json
"test:all": "npm run typecheck && npm run lint && npm test && npm run test:db && npm run test:e2e:reset && npm run test:e2e"
```

`typecheck` (`tsc --noEmit`) phải nằm trong cổng này. Bài học từ Task 6: `next lint` xanh trong khi `tsc` đỏ — ESLint không kiểm tra kiểu, nên nếu thiếu bước này thì không có gì bắt lỗi kiểu cho tới lúc `next build` vỡ. `test:db` cũng phải có mặt, nếu không toàn bộ test seed sẽ không bao giờ chạy trong cổng cuối.

- [ ] **Step 2: Chạy toàn bộ**

Run: `npm run test:all`
Expected: PASS — lint sạch, toàn bộ unit test và 6 file E2E đều xanh

Sửa hết lỗi phát sinh trước khi đi tiếp. Không bỏ qua cảnh báo TypeScript.

- [ ] **Step 3: Kiểm tra ba điều kiện của Global Constraints**

Chạy ba lệnh này, tất cả phải **không có kết quả nào**:

```bash
# 1. Không component nào ghi DB trực tiếp
grep -rnE "prisma\.[a-zA-Z]+\.(create|update|delete|upsert)" components app --include=*.tsx

# 2. Không dark mode
grep -rn "dark:" app components

# 3. Không còn TODO sót lại
grep -rn "TODO\|FIXME" app components lib prisma
```

Lệnh 1 có thể báo ở `app/admin/**/page.tsx` nếu ai đó lỡ ghi trong server component — chuyển việc ghi đó sang `lib/actions/`.

- [ ] **Step 4: Kiểm tra thủ công lần cuối**

```bash
npm run build && npm run start
```

Đi hết đường: trang chủ → tin tức → chi tiết tin → sản phẩm → chi tiết sản phẩm (bấm thử nút gọi trên điện thoại giả lập, cụm nút phải dính đáy) → trang tĩnh → 404. Đổi màu trong admin sang *Cam*, tải lại trang chủ — toàn site đổi màu, hero gradient đổi theo.

- [ ] **Step 5: Viết README**

Thay `README.md` bằng nội dung gồm: giới thiệu ngắn · yêu cầu (Node, Docker) · các bước chạy lần đầu (`npm i` → `npm run db:up` → tạo DB test → `npx prisma db push` → `npm run db:seed` → `npm run dev`) · bảng lệnh (`dev`, `build`, `test`, `test:e2e`, `db:seed`, `db:studio`, `test:all`) · **tài khoản admin mặc định `admin@app.com` / `Admin@6868` kèm cảnh báo đổi ngay sau lần đăng nhập đầu** · hướng dẫn deploy Vercel (biến môi trường cần đặt, tạo Blob store, chạy `prisma db push` và seed trên DB production) · liên kết tới spec và plan trong `docs/superpowers/`.

- [ ] **Step 6: CI**

`.github/workflows/ci.yml` — dịch vụ `postgres:16`, các bước: checkout → setup Node 20 → `npm ci` → `npx prisma generate` → `npx prisma db push` → `npm run lint` → `npm test` → `npx playwright install --with-deps chromium` → `npm run db:seed` → `npm run test:e2e`. Biến môi trường lấy từ `secrets` với `DATABASE_URL` trỏ tới service Postgres và `AUTH_SECRET` là secret của repo.

- [ ] **Step 7: Commit**

```bash
git add README.md .github package.json
git commit -m "docs: add setup guide and CI workflow"
```

---

## Tự soát kế hoạch

Đã đối chiếu ngược lại spec sau khi viết xong:

**Phủ spec** — mọi mục trong spec đều có task tương ứng:

| Mục spec | Task |
|---|---|
| §3 Stack, biến môi trường | 1 |
| §4 ISR, tag, revalidate 3600 | 6, 14–17 |
| §5 Cấu trúc thư mục | 1, 6 |
| §6 9 model + seed | 4 |
| §7 Bảng màu OKLCH, 6 preset, nhúng biến CSS | 3, 13, 14 |
| §8 Auth, seed admin, cảnh báo mật khẩu mặc định | 5, 7 |
| §9 9 màn hình admin, slug, xoá xác nhận, Tiptap | 7–13 |
| §10 6 route công khai, số lượng cố định, nút liên hệ, SEO | 14–18 |
| §11 Xử lý lỗi, giữ dữ liệu đã nhập, giới hạn ảnh | 6, 8, 17 |
| §12 Vitest 3 nhóm + Playwright 3 luồng | 2, 3, 10, 5, 14, 16 |

**Ba luồng E2E bắt buộc trong spec §12** nằm ở: luồng đăng nhập→tạo→xuất bản→hiện ở `/tin-tuc` (Task 15, `publish-flow.spec.ts`); luồng đổi màu→biến CSS đổi (Task 14, `theme.spec.ts`); luồng nút liên hệ đúng số/email (Task 16, `product-contact.spec.ts`).

**Đã sửa trong lúc soát:**

- `app/admin/page.tsx` tạo tạm ở Task 5 sẽ xung đột với `app/admin/(dashboard)/page.tsx` — Task 7 Step 5 nói rõ phải chuyển file, không phải tạo thêm.
- `updatePostAction`/`updateProductAction`/`updatePageAction` ban đầu chỉ revalidate slug mới; nếu admin đổi slug thì trang cũ kẹt vĩnh viễn — đã thêm cơ chế `previousSlug`.
- `RichTextEditor` cần `immediatelyRender: false`, thiếu sẽ lỗi hydration với SSR — đã ghi trong code kèm lý do.
- `auth.config.ts` không được import Prisma vì middleware chạy trên Edge — đã cảnh báo ở đầu Task 5 và trong bước gỡ lỗi.

**Nhất quán kiểu:** `ActionResult<T>` (Task 6) được `useActionForm` (Task 9) và mọi form dùng đúng một hình dạng. `buildPalette`/`paletteToCssVars` (Task 3) dùng cùng tên ở Task 13, 14, 18. `resolvePrimary` khai báo ở Task 13 và tiêu thụ ở Task 14, 18. `TAGS` (Task 6) dùng thống nhất ở mọi action.

## Sửa đổi trước khi thực thi (2026-08-07, chủ dự án quyết)

Hai mâu thuẫn giữa plan và tiêu chuẩn review đã được đưa ra hỏi và chốt trước khi dispatch task đầu tiên:

1. **Trang danh sách tin và sản phẩm dùng chung `ContentListPage`.** Plan gốc bảo viết hai file song song gần giống hệt nhau, điều mà reviewer buộc phải báo là trùng lặp. Nay Task 15 dựng component nhận prop (hàm query, loại danh mục, component thẻ, số cột, tiêu đề, thông báo rỗng) và Task 16 chỉ gọi lại.
2. **Trang 404 và `error.tsx` chuyển từ Task 17 lên Task 14.** Plan gốc cho phép tạm làm yếu một assert E2E ở Task 15 rồi khôi phục ở Task 17 — reviewer coi assert bị làm yếu là lỗi, và một assert vô nghĩa nằm lại trong lịch sử git là cái giá không đáng. Chúng không phụ thuộc gì nên làm sớm được. `e2e/not-found.spec.ts` viết ở Task 14 nhưng chỉ chạy từ Task 17, khi route `/[slug]` tồn tại.

Ngoài ra đã tự sửa một lỗi soạn thảo: hằng `BUTTONS` chết trong `RichTextEditor` (Task 10) đã được gỡ khỏi plan.

