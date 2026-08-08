import fs from 'node:fs'
import path from 'node:path'
import manifest from '@/lib/generated/banner-manifest.json'
import {
  CAPTIONS_FILE, isImageFile, parseCaptions, slidesFromFileNames, sortByFileName,
  type BannerCaptions, type HeroSlide,
} from '@/lib/hero-slide'

/**
 * Nguồn banner thứ hai bên cạnh bảng Banner trong database: chỉ cần thả ảnh vào
 * `public/banners/` là ảnh lên trang chủ ở lần deploy kế tiếp — không cần đăng
 * nhập admin, không cần upload.
 *
 * Ở production đọc từ manifest sinh lúc build (xem scripts/build-banner-manifest.ts
 * để biết vì sao không đọc đĩa lúc chạy). Ở dev thì đọc thẳng thư mục để thêm ảnh
 * xong tải lại trang là thấy ngay, khỏi phải build lại.
 */

const BANNER_DIR = path.join(process.cwd(), 'public', 'banners')

function readFolder(dir: string): { files: string[]; captions: BannerCaptions } {
  try {
    const captionsPath = path.join(dir, CAPTIONS_FILE)
    return {
      files: sortByFileName(fs.readdirSync(dir).filter(isImageFile)),
      captions: parseCaptions(fs.existsSync(captionsPath) ? fs.readFileSync(captionsPath, 'utf8') : null),
    }
  } catch {
    return { files: [], captions: {} }
  }
}

export function getFolderBanners(fallback: { title: string; subtitle?: string }): HeroSlide[] {
  const source = process.env.NODE_ENV === 'development'
    ? readFolder(BANNER_DIR)
    : { files: manifest.files, captions: manifest.captions as BannerCaptions }

  return slidesFromFileNames(source.files, source.captions, fallback)
}
