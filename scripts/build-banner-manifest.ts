/**
 * Quét thư mục `public/banners` rồi ghi danh sách ảnh ra
 * `lib/generated/banner-manifest.json`. Chạy tự động ở bước đầu của `npm run build`,
 * nên quy trình của khách chỉ còn: bỏ ảnh vào thư mục → commit → deploy.
 *
 * Vì sao phải sinh ra một file manifest thay vì đọc thẳng thư mục lúc chạy?
 * Trên các nền tảng serverless (Vercel là ví dụ), `public/` được CDN phục vụ chứ
 * KHÔNG được đóng gói vào hàm serverless. `fs.readdir('public/banners')` chạy
 * ngon lúc build và lúc dev, rồi ném ENOENT ngay lần ISR revalidate đầu tiên trên
 * production — banner sẽ tự dưng biến mất sau một tiếng. Manifest là một import
 * tĩnh nên nó nằm sẵn trong bundle, chạy đúng ở mọi nơi.
 *
 * File manifest ĐƯỢC commit vào git để `next build` chạy trần vẫn có dữ liệu;
 * lệnh build luôn sinh lại nên nó không thể lệch với thư mục ảnh.
 */

import fs from 'node:fs'
import path from 'node:path'
import { CAPTIONS_FILE, isImageFile, parseCaptions, sortByFileName } from '../lib/hero-slide'

const BANNER_DIR = path.join(process.cwd(), 'public', 'banners')
const OUT_FILE = path.join(process.cwd(), 'lib', 'generated', 'banner-manifest.json')

export type BannerManifest = {
  note: string
  files: string[]
  captions: Record<string, Record<string, string>>
}

export function buildManifest(dir: string): BannerManifest {
  // Thư mục bị xoá mất cũng chỉ dẫn tới banner rỗng (trang chủ có sẵn phương án
  // dự phòng), không được làm hỏng cả lượt build.
  const entries = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  const captionsPath = path.join(dir, CAPTIONS_FILE)
  const raw = fs.existsSync(captionsPath) ? fs.readFileSync(captionsPath, 'utf8') : null

  return {
    note: 'File này do scripts/build-banner-manifest.ts sinh ra — đừng sửa tay. Thêm ảnh vào public/banners/.',
    files: sortByFileName(entries.filter(isImageFile)),
    captions: parseCaptions(raw) as Record<string, Record<string, string>>,
  }
}

function main() {
  const manifest = buildManifest(BANNER_DIR)
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`[banner-manifest] ${manifest.files.length} ảnh banner → ${path.relative(process.cwd(), OUT_FILE)}`)
}

// Chỉ chạy khi được gọi trực tiếp bằng `tsx`, không chạy khi bị import trong test.
if (process.argv[1] && process.argv[1].includes('build-banner-manifest')) main()
