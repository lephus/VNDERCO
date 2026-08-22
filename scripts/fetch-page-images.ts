/**
 * Lấy ảnh cho ba trang tĩnh (/gioi-thieu, /cong-trinh-thi-cong, /lien-he) và ghi
 * ra `lib/generated/page-media.json`.
 *
 * Ba trang này không do CMS quản lý — nội dung nằm thẳng trong code — nên ảnh
 * cũng được chốt lúc build thay vì tra database mỗi lượt render. Cùng cách làm
 * với `lib/generated/banner-manifest.json`.
 *
 * Ảnh vẫn đi qua Supabase Storage chứ không trỏ thẳng CDN của Pexels:
 * next.config.ts chỉ cho phép `*.supabase.co`.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { prisma } from '@/lib/db'
import { uploadImage } from '@/lib/storage'
import { slugify } from '@/lib/slug'

const KEY = process.env.PEXELS_API_KEY
if (!KEY) { console.error('Thiếu PEXELS_API_KEY trong .env'); process.exit(1) }

/** Mỗi công trình: từ khoá tìm ảnh + thông tin hiển thị trên thẻ. */
const PROJECTS = [
  { q: 'modern living room wood wall', title: 'Căn hộ Vinhomes Central Park', area: '120 m²', kind: 'Căn hộ', place: 'Bình Thạnh, TP.HCM', year: 2025 },
  { q: 'luxury hotel lobby interior', title: 'Sảnh khách sạn Mường Thanh', area: '340 m²', kind: 'Khách sạn', place: 'Đà Nẵng', year: 2025 },
  { q: 'modern office interior wood', title: 'Văn phòng Công ty Tân Hiệp', area: '260 m²', kind: 'Văn phòng', place: 'Quận 7, TP.HCM', year: 2025 },
  { q: 'restaurant interior wooden', title: 'Nhà hàng Bếp Nhà Tôi', area: '180 m²', kind: 'Nhà hàng', place: 'Thủ Đức, TP.HCM', year: 2024 },
  { q: 'modern bedroom wood panel wall', title: 'Nhà phố Lakeview City', area: '95 m²', kind: 'Nhà phố', place: 'Quận 2, TP.HCM', year: 2024 },
  { q: 'wooden deck terrace house', title: 'Sân vườn biệt thự Thảo Điền', area: '210 m²', kind: 'Biệt thự', place: 'Quận 2, TP.HCM', year: 2024 },
  { q: 'coffee shop interior wood', title: 'Chuỗi cà phê An Nhiên', area: '140 m²', kind: 'Cà phê', place: 'Gò Vấp, TP.HCM', year: 2024 },
  { q: 'showroom interior modern', title: 'Showroom nội thất Hòa Phát', area: '420 m²', kind: 'Showroom', place: 'Biên Hòa, Đồng Nai', year: 2024 },
  { q: 'staircase modern interior wood', title: 'Biệt thự Nine South Estates', area: '380 m²', kind: 'Biệt thự', place: 'Nhà Bè, TP.HCM', year: 2023 },
  { q: 'clinic interior modern white', title: 'Phòng khám Đa khoa Sài Gòn', area: '230 m²', kind: 'Y tế', place: 'Tân Bình, TP.HCM', year: 2023 },
  { q: 'apartment hallway interior', title: 'Hành lang căn hộ Masteri', area: '160 m²', kind: 'Căn hộ', place: 'Thủ Đức, TP.HCM', year: 2023 },
  { q: 'wooden ceiling restaurant', title: 'Trần gỗ Nhà hàng Sen Việt', area: '150 m²', kind: 'Nhà hàng', place: 'Quận 1, TP.HCM', year: 2023 },
]

const SINGLES = [
  { key: 'about-hero', q: 'construction team working interior' },
  { key: 'about-workshop', q: 'carpenter workshop wood cutting' },
  { key: 'contact-office', q: 'modern office reception desk' },
]

type Photo = { id: number; src: { large2x: string; large: string }; alt: string }

async function pick(query: string): Promise<Photo> {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: KEY! } })
  if (!res.ok) throw new Error(`Pexels ${res.status} cho "${query}"`)
  const data = (await res.json()) as { photos: Photo[] }
  if (!data.photos?.length) throw new Error(`Không có ảnh nào cho "${query}"`)
  return data.photos[0]
}

async function store(photo: Photo, name: string, alt: string): Promise<string> {
  const res = await fetch(photo.src.large2x || photo.src.large)
  const buffer = Buffer.from(await res.arrayBuffer())
  const file = new File([new Uint8Array(buffer)], `page-${slugify(name)}-${photo.id}.jpg`, { type: 'image/jpeg' })
  const { url, pathname } = await uploadImage(file)
  await prisma.media.create({
    data: { url, pathname, filename: file.name, mimeType: 'image/jpeg', size: buffer.byteLength, alt },
  })
  return url
}

async function main() {
  const projects = []
  for (const p of PROJECTS) {
    const url = await store(await pick(p.q), p.title, p.title)
    projects.push({ ...p, imageUrl: url })
    console.log('  ', p.title)
  }

  const singles: Record<string, string> = {}
  for (const s of SINGLES) {
    singles[s.key] = await store(await pick(s.q), s.key, s.key)
    console.log('  ', s.key)
  }

  const out = path.join(process.cwd(), 'lib/generated/page-media.json')
  await fs.writeFile(out, JSON.stringify({ projects, singles }, null, 2) + '\n')
  console.log(`XONG — ${projects.length + SINGLES.length} ảnh, ghi ra ${out}`)
  process.exit(0)
}

main()
