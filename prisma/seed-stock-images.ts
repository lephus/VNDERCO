/**
 * Thay ảnh chờ bằng ảnh stock thật cho toàn bộ catalog.
 *
 * Nguồn: Pexels (https://www.pexels.com/license/) — cho dùng thương mại, không
 * bắt buộc ghi công. Cần biến môi trường PEXELS_API_KEY (lấy miễn phí tại
 * https://www.pexels.com/api/, cấp ngay sau khi đăng nhập).
 *
 * Vì sao phải tải về rồi upload lên Supabase chứ không trỏ thẳng URL của Pexels:
 * next.config.ts chỉ cho phép ảnh từ `*.supabase.co`, và trỏ thẳng ra CDN ngoài
 * thì site phụ thuộc vào một dịch vụ có thể đổi URL bất cứ lúc nào.
 *
 * Chạy được nhiều lần: mỗi lần chạy thay ảnh mới và xoá ảnh cũ khỏi Storage.
 */
import { prisma } from '@/lib/db'
import { uploadImage, deleteImage } from '@/lib/storage'
import { slugify } from '@/lib/slug'

const KEY = process.env.PEXELS_API_KEY
if (!KEY) {
  console.error('Thiếu PEXELS_API_KEY. Lấy miễn phí tại https://www.pexels.com/api/ rồi thêm vào .env')
  process.exit(1)
}

/** Từ khoá tìm ảnh cho từng danh mục — tiếng Anh vì kho ảnh gắn thẻ bằng tiếng Anh. */
const QUERIES: Record<string, string> = {
  'Tấm ốp vân đá': 'marble wall interior luxury',
  'Tấm ốp Nano': 'modern white wall panel interior',
  'Lam sóng': 'wood slat wall panel interior',
  'Tấm ốp than tre': 'bamboo wood wall texture interior',
  'Trần nhựa giật cấp': 'modern ceiling light interior',
  'Tranh tráng gương': 'framed art living room wall',
  'Trần than tre': 'wooden ceiling architecture',
  'Lam hộp cầu thang': 'wooden staircase railing modern',
  'Tấm ốp - Sàn gỗ ngoài trời': 'wooden deck terrace outdoor',
  'Sàn gỗ sàn nhựa': 'wooden floor parquet room',
  'Cửa nhựa - Vách ngăn - Thảm lót sàn': 'modern interior door hallway',
}

const POST_QUERIES = [
  'interior renovation apartment wall',
  'living room wooden floor modern',
  'carpenter wood work construction',
]

const INTRO_QUERY = 'interior construction worker installing'

type Photo = { id: number; src: { large2x: string; large: string }; alt: string }

async function search(query: string, perPage: number): Promise<Photo[]> {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: KEY! } })
  if (!res.ok) throw new Error(`Pexels ${res.status} cho "${query}": ${(await res.text()).slice(0, 120)}`)
  const data = (await res.json()) as { photos: Photo[] }
  if (!data.photos?.length) throw new Error(`Pexels không trả kết quả nào cho "${query}"`)
  return data.photos
}

/** Tải ảnh về rồi đẩy lên Storage của dự án, trả URL công khai. */
async function grab(photo: Photo, name: string, alt: string): Promise<string> {
  const res = await fetch(photo.src.large2x || photo.src.large)
  if (!res.ok) throw new Error(`Tải ảnh thất bại: HTTP ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const file = new File([new Uint8Array(buffer)], `stock-${slugify(name)}-${photo.id}.jpg`, { type: 'image/jpeg' })
  const { url, pathname } = await uploadImage(file)
  await prisma.media.create({
    data: { url, pathname, filename: file.name, mimeType: 'image/jpeg',
      size: buffer.byteLength, alt: alt || photo.alt || name },
  })
  return url
}

/** Xoá ảnh khỏi Storage + bảng Media theo URL công khai. */
async function dropByUrl(url: string | null | undefined) {
  if (!url) return
  const row = await prisma.media.findFirst({ where: { url } })
  if (!row) return
  await deleteImage(row.pathname).catch(() => {})
  await prisma.media.delete({ where: { id: row.id } })
}

async function main() {
  let done = 0

  // --- ảnh sản phẩm, theo từng danh mục ---
  const categories = await prisma.category.findMany({
    where: { type: 'PRODUCT' },
    orderBy: { order: 'asc' },
    include: { products: { orderBy: { order: 'asc' }, include: { images: true } } },
  })

  for (const cat of categories) {
    const query = QUERIES[cat.name]
    if (!query) { console.log(`  bỏ qua "${cat.name}" — chưa khai từ khoá`); continue }
    if (!cat.products.length) continue

    const photos = await search(query, Math.max(cat.products.length, 3))
    for (const [i, product] of cat.products.entries()) {
      const photo = photos[i % photos.length]
      const url = await grab(photo, product.name, product.name)
      for (const old of product.images) {
        await dropByUrl(old.url)
        await prisma.productImage.delete({ where: { id: old.id } })
      }
      await prisma.productImage.create({ data: { productId: product.id, url, alt: product.name, order: 0 } })
      done++
    }
    console.log(`  ${cat.name}: ${cat.products.length} ảnh`)
  }

  // --- ảnh bài tin ---
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: 'desc' } })
  for (const [i, post] of posts.entries()) {
    const photos = await search(POST_QUERIES[i % POST_QUERIES.length], 3)
    const url = await grab(photos[0], post.title, post.title)
    await dropByUrl(post.coverImageUrl)
    await prisma.post.update({ where: { id: post.id }, data: { coverImageUrl: url, coverImageAlt: post.title } })
    done++
  }
  console.log(`  ${posts.length} ảnh bài tin`)

  // --- ảnh dải cam kết ---
  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } })
  const introPhotos = await search(INTRO_QUERY, 3)
  const introUrl = await grab(introPhotos[0], 'gioi-thieu-trang-chu', 'Thi công trọn gói')
  await dropByUrl(settings?.homeIntroImageUrl)
  await prisma.siteSetting.update({ where: { id: 1 }, data: { homeIntroImageUrl: introUrl } })
  done++

  console.log(`XONG — ${done} ảnh stock đã thay`)
  process.exit(0)
}

main()
