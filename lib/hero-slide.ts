/**
 * Kiểu dữ liệu chung cho một slide của banner trang chủ, và các hàm thuần dùng
 * để dựng slide từ TÊN FILE trong thư mục `public/banners`.
 *
 * Tách riêng khỏi `lib/queries/banner-folder.ts` vì file kia đọc đĩa bằng
 * `node:fs`; HeroSlider là client component nên không được kéo `node:fs` vào
 * bundle trình duyệt. Ở đây chỉ có kiểu và xử lý chuỗi nên cả hai phía dùng chung
 * được, và phần logic khó nhất (thứ tự, lọc, chú thích) kiểm thử được mà không
 * cần chạm vào ổ đĩa.
 */

import { z } from 'zod'

export type HeroSlide = {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  imageAlt: string | null
  ctaLabel: string | null
  ctaHref: string | null
}

/** Đường dẫn công khai của thư mục ảnh banner (tính từ gốc `public/`). */
export const BANNER_URL_PREFIX = '/banners'

/** Tên file chú thích tùy chọn nằm cùng thư mục ảnh. */
export const CAPTIONS_FILE = 'captions.json'

// Danh sách đuôi file mà `next/image` xử lý được. Đuôi lạ (.psd, .heic, .txt)
// bị bỏ qua thay vì render ra thẻ ảnh vỡ.
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']

const captionSchema = z.object({
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  alt: z.string().trim().optional(),
  ctaLabel: z.string().trim().optional(),
  ctaHref: z.string().trim().optional(),
})

/** `{ "01-phong-khach.jpg": { "title": "...", "subtitle": "..." } }` */
export const captionsSchema = z.record(z.string(), captionSchema)

export type BannerCaptions = z.infer<typeof captionsSchema>

export function isImageFile(name: string): boolean {
  // macOS rải `.DS_Store` khắp nơi và trình sao lưu hay để lại file `._tên.jpg`;
  // cả hai đều lọt qua bộ lọc đuôi file nếu chỉ nhìn phần mở rộng.
  if (name.startsWith('.') || name.startsWith('_')) return false
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return false
  return IMAGE_EXTENSIONS.includes(name.slice(dot).toLowerCase())
}

/**
 * Sắp xếp theo tên file có hiểu số: `2.jpg` phải đứng trước `10.jpg`.
 * So sánh chuỗi thuần sẽ cho ra 1, 10, 2 — thứ tự banner mà khách đặt bằng cách
 * đánh số file sẽ sai ngay khi có tấm thứ mười.
 */
export function sortByFileName(files: string[]): string[] {
  return [...files].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' }))
}

/**
 * Suy ra chữ mô tả ảnh từ tên file khi khách không khai trong captions.json:
 * `01-phong-khach-hien-dai.jpg` → `Phong khach hien dai`. Vì vậy README dặn khách
 * đặt tên file có nghĩa — đó là toàn bộ thông tin mà máy đọc màn hình và Google
 * có được về tấm ảnh.
 */
export function altFromFileName(name: string): string {
  const base = name.slice(0, name.lastIndexOf('.'))
    .replace(/^[\d]+[-_.\s]*/, '')   // bỏ số thứ tự dẫn đầu
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : ''
}

/**
 * Dựng danh sách slide từ tên file + chú thích. Slide nào không có chú thích
 * riêng thì dùng tiêu đề/phụ đề mặc định của site — giống hệt banner mẫu, nơi
 * mọi tấm ảnh cùng mang một dòng tiêu đề thương hiệu.
 */
export function slidesFromFileNames(
  files: string[],
  captions: BannerCaptions,
  fallback: { title: string; subtitle?: string },
): HeroSlide[] {
  return sortByFileName(files.filter(isImageFile)).map((file) => {
    const caption = captions[file] ?? {}
    return {
      id: `folder:${file}`,
      title: caption.title || fallback.title,
      subtitle: caption.subtitle || fallback.subtitle || null,
      imageUrl: `${BANNER_URL_PREFIX}/${encodeURIComponent(file)}`,
      imageAlt: caption.alt || altFromFileName(file) || null,
      ctaLabel: caption.ctaLabel || null,
      // Nút chỉ hiện khi có ĐỦ nhãn và link; thiếu một nửa thì bỏ cả cặp, tránh
      // vẽ ra một cái nút không bấm được hoặc một cái nút không có chữ.
      ctaHref: (caption.ctaLabel && caption.ctaHref) ? caption.ctaHref : null,
    }
  })
}

/** JSON hỏng hoặc sai kiểu thì coi như không có chú thích — không được làm sập trang chủ. */
export function parseCaptions(raw: string | null): BannerCaptions {
  if (!raw) return {}
  try {
    const parsed = captionsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : {}
  } catch {
    return {}
  }
}
