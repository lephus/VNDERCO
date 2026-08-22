/**
 * Dựng lại toàn bộ nội dung site theo bộ khung của bản thiết kế tham chiếu:
 * 11 danh mục sản phẩm (8 ô danh mục + 3 nhóm nội dung), 36 sản phẩm, 3 bài tin,
 * 3 trang tĩnh.
 *
 * XOÁ SẠCH nội dung cũ trước khi dựng (sản phẩm, bài viết, trang, danh mục,
 * banner, media) — giữ lại tài khoản admin và bảng cài đặt. Sao lưu trước khi
 * chạy: xem backups/.
 *
 * Ảnh là ảnh CHỖ sinh bằng Chromium, không phải ảnh thật: mọi mô tả và ảnh ở
 * đây do dự án tự tạo. Ảnh sản phẩm/công trình thật cần khách tự cung cấp rồi
 * thay trong admin.
 */
import { chromium, type Browser } from '@playwright/test'
import { prisma } from '@/lib/db'
import { uploadImage, deleteImage } from '@/lib/storage'
import { slugify } from '@/lib/slug'

// ------------------------------------------------------------------ phân loại

type Material = {
  name: string
  kicker: string
  hue: number
  blurb: string          // mô tả ngắn dùng cho sản phẩm
  variants: string[]     // hậu tố tạo tên sản phẩm
}

/** 8 danh mục hiện thành ô trong dải xanh trên trang chủ (order 0–7). */
const TILE_CATEGORIES: Material[] = [
  { name: 'Tấm ốp vân đá', kicker: 'Ốp tường', hue: 210, variants: ['VD-01 khổ 1220mm', 'VD-02 vân mây'],
    blurb: 'Tấm nhựa PVC phủ lớp vân đá, bề mặt phẳng bóng, không thấm nước. Thi công dán trực tiếp lên tường phẳng, phù hợp phòng khách và sảnh thang máy.' },
  { name: 'Tấm ốp Nano', kicker: 'Ốp tường', hue: 196, variants: ['NA-10 bóng gương', 'NA-12 vân gỗ sáng'],
    blurb: 'Tấm nhựa nano rỗng ruột, nhẹ hơn tấm đặc nên giảm tải cho tường và thi công nhanh. Bề mặt phủ film chống trầy, lau chùi bằng khăn ẩm.' },
  { name: 'Lam sóng', kicker: 'Trang trí', hue: 32, variants: ['LS-3 sóng lớn', 'LS-4 sóng nhỏ'],
    blurb: 'Thanh lam sóng nhựa giả gỗ tạo nhịp đứng cho mảng tường lớn. Hèm âm dương giấu mối nối, cắt ngắn được theo chiều cao trần.' },
  { name: 'Tấm ốp than tre', kicker: 'Ốp tường', hue: 24, variants: ['TT-20 vân sồi', 'TT-22 vân óc chó'],
    blurb: 'Composite bột tre ép định hình, bề mặt ấm và ít bám tĩnh điện hơn nhựa nguyên sinh. Dùng cho phòng ngủ và phòng làm việc.' },
  { name: 'Trần nhựa giật cấp', kicker: 'Trần', hue: 205, variants: ['TG-2 hai cấp', 'TG-3 ba cấp'],
    blurb: 'Hệ trần nhựa nhiều cấp đi cùng khung xương thép mạ kẽm, chừa sẵn khe hắt đèn. Tháo lắp lại được khi cần bảo trì đường điện.' },
  { name: 'Tranh tráng gương', kicker: 'Trang trí', hue: 280, variants: ['TG-A khổ đứng', 'TG-B khổ ngang'],
    blurb: 'Tranh in trên nền kính tráng, viền hợp kim mảnh. Treo mảng tường trống trong phòng khách hoặc hành lang.' },
  { name: 'Trần than tre', kicker: 'Trần', hue: 18, variants: ['TCT-1 phẳng', 'TCT-2 nan'],
    blurb: 'Trần composite than tre lắp hèm, giữ được vân gỗ đều màu trên diện rộng. Hợp trần nhà hàng và showroom.' },
  { name: 'Lam hộp cầu thang', kicker: 'Trang trí', hue: 44, variants: ['LH-50 vuông', 'LH-80 chữ nhật'],
    blurb: 'Lam hộp rỗng dùng làm lan can, vách ngăn cầu thang hoặc chia không gian mà vẫn lấy sáng. Nhẹ, không cong vênh theo mùa.' },
]

/** 3 danh mục hiện thành nhóm nội dung bên dưới (order 8–10). */
const GROUP_CATEGORIES: (Material & { count: number })[] = [
  { name: 'Tấm ốp - Sàn gỗ ngoài trời', kicker: 'Ngoài trời', hue: 100, count: 8,
    variants: ['GN-140 sàn đặc', 'GN-146 sàn rỗng', 'GN-70 thanh ốp', 'GN-100 thanh ốp lớn',
               'GN-25 nẹp kết thúc', 'GN-K1 ke nhựa', 'GN-B2 bậc tam cấp', 'GN-H1 hàng rào'],
    blurb: 'Gỗ nhựa composite dùng ngoài trời: chịu mưa nắng, không mối mọt, không cần sơn lại hằng năm như gỗ tự nhiên.' },
  { name: 'Sàn gỗ sàn nhựa', kicker: 'Lát sàn', hue: 30, count: 8,
    variants: ['SG-8 công nghiệp 8mm', 'SG-12 công nghiệp 12mm', 'SN-4 hèm khoá 4mm', 'SN-5 hèm khoá 5mm',
               'SN-D2 dán keo', 'SG-X1 xương cá', 'SP-N1 nẹp nối', 'SP-L1 len chân tường'],
    blurb: 'Sàn gỗ công nghiệp và sàn nhựa hèm khoá, lắp nổi trên nền phẳng, đi lại được ngay sau khi thi công.' },
  { name: 'Cửa nhựa - Vách ngăn - Thảm lót sàn', kicker: 'Cửa & vách', hue: 250, count: 4,
    variants: ['CN-1 cửa composite', 'VN-2 vách vệ sinh', 'TL-3 thảm nhựa cuộn', 'TL-4 thảm gai'],
    blurb: 'Cửa nhựa composite, vách ngăn vệ sinh và thảm lót sàn cho khu vực ẩm — không ngấm nước, vệ sinh nhanh.' },
]

const NEWS_CATEGORIES = ['Công trình thi công', 'Tin ngành', 'Hướng dẫn kỹ thuật']

const POSTS = [
  {
    title: 'Hoàn thiện 320m² tấm ốp vân đá cho căn hộ tại Quận 7',
    cat: 'Công trình thi công', hue: 210,
    excerpt: 'Toàn bộ mảng tường phòng khách, hành lang và sảnh thang được ốp trong 9 ngày, bàn giao đúng tiến độ chủ đầu tư đặt ra.',
    body: [
      'Công trình gồm 320m² tấm ốp vân đá cho ba mặt bằng căn hộ. Phần khó nhất là mảng tường cong ở sảnh thang: tấm phải được hơ nóng đều rồi ép khuôn trước khi dán, nếu ép nguội thì mép tấm sẽ bật ra sau vài tuần.',
      'Đội thi công xử lý phẳng tường bằng bột bả trước khi dán, sai số dưới 2mm trên mỗi mét dài. Đây là bước hay bị bỏ qua và là nguyên nhân phổ biến nhất khiến mặt ốp bị gợn sóng khi nhìn chéo sáng.',
      'Tổng thời gian thi công 9 ngày, trong đó 2 ngày dành riêng cho xử lý nền tường.',
    ],
  },
  {
    title: 'Chọn sàn nhựa hèm khoá hay sàn gỗ công nghiệp cho nhà có trẻ nhỏ',
    cat: 'Hướng dẫn kỹ thuật', hue: 30,
    excerpt: 'Hai loại sàn cùng tầm giá nhưng khác nhau ở khả năng chịu nước và cảm giác chân. Bài viết so sánh theo bốn tiêu chí thực tế.',
    body: [
      'Sàn nhựa hèm khoá không ngấm nước, đổ nước lên để qua đêm vẫn không phồng mép. Sàn gỗ công nghiệp thì cốt HDF sẽ nở nếu nước đọng lâu ở khe nối, nên chỉ hợp phòng khô.',
      'Đổi lại, sàn gỗ công nghiệp dày 8–12mm cho cảm giác chân chắc và ấm hơn, ít vọng tiếng bước chân hơn sàn nhựa 4–5mm lắp nổi.',
      'Với nhà có trẻ nhỏ và khu bếp mở, chúng tôi thường tư vấn dùng sàn nhựa cho tầng trệt và sàn gỗ cho phòng ngủ tầng trên.',
    ],
  },
  {
    title: 'Vì sao lam sóng bị cong sau một mùa nắng và cách phòng tránh',
    cat: 'Tin ngành', hue: 44,
    excerpt: 'Phần lớn trường hợp cong lam không phải do vật liệu kém mà do khe giãn nở bị bỏ qua lúc lắp đặt.',
    body: [
      'Nhựa giãn nở theo nhiệt độ. Một thanh lam dài 2,8m có thể dài thêm vài milimet giữa trưa hè, và nếu hai đầu bị bắt cứng vào tường thì phần giữa buộc phải vồng lên.',
      'Cách phòng tránh: chừa khe 3–5mm ở hai đầu thanh và giấu khe đó dưới nẹp kết thúc. Khe nằm khuất nên không ảnh hưởng thẩm mỹ.',
      'Với mảng tường hướng tây nhận nắng chiều gay gắt, nên chọn lam có lõi composite thay vì nhựa nguyên sinh — hệ số giãn nở thấp hơn đáng kể.',
    ],
  },
]

// ------------------------------------------------------------------ ảnh chỗ

type Shot = { key: string; label: string; kicker: string; w: number; h: number; hue: number }

async function render(browser: Browser, shot: Shot): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: shot.w, height: shot.h } })
  await page.setContent(`
    <html><body style="margin:0">
      <div style="
        position:relative;overflow:hidden;
        width:${shot.w}px;height:${shot.h}px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:${Math.round(shot.h / 26)}px;
        font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#fff;text-align:center;
        padding:0 ${Math.round(shot.w / 9)}px;box-sizing:border-box;
        background:
          repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px ${Math.round(shot.w / 9)}px),
          radial-gradient(circle at 22% 20%, hsla(${shot.hue + 22},60%,72%,.5), transparent 58%),
          linear-gradient(140deg, hsl(${shot.hue},34%,42%), hsl(${shot.hue + 16},30%,28%));
      ">
        <div style="font-size:${Math.round(shot.h / 30)}px;letter-spacing:.24em;text-transform:uppercase;
          font-weight:700;opacity:.75">${shot.kicker}</div>
        <div style="font-size:${Math.round(shot.h / 13)}px;font-weight:800;line-height:1.18;
          text-shadow:0 2px 20px rgba(0,0,0,.3)">${shot.label}</div>
        <div style="font-size:${Math.round(shot.h / 34)}px;opacity:.6;font-weight:600;letter-spacing:.1em">ẢNH CHỜ · VNDERCO</div>
      </div>
    </body></html>`)
  const buffer = await page.screenshot({ type: 'png' })
  await page.close()
  return buffer
}

async function upload(buffer: Buffer, shot: Shot): Promise<string> {
  const file = new File([new Uint8Array(buffer)], `catalog-${shot.key}.png`, { type: 'image/png' })
  const { url, pathname } = await uploadImage(file)
  await prisma.media.create({
    data: { url, pathname, filename: file.name, mimeType: 'image/png',
      size: buffer.byteLength, width: shot.w, height: shot.h, alt: shot.label },
  })
  return url
}

// ------------------------------------------------------------------ chạy

async function wipe() {
  const media = await prisma.media.findMany()
  for (const m of media) await deleteImage(m.pathname).catch(() => {})
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.post.deleteMany()
  await prisma.page.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.category.deleteMany()
  await prisma.media.deleteMany()
  console.log(`đã xoá sạch nội dung cũ (kể cả ${media.length} ảnh trong Storage)`)
}

async function main() {
  const admin = await prisma.user.findFirst()
  await wipe()

  const browser = await chromium.launch()
  let uploaded = 0

  // --- danh mục tin ---
  for (const [i, name] of NEWS_CATEGORIES.entries()) {
    await prisma.category.create({ data: { name, slug: slugify(name), type: 'NEWS', order: i } })
  }

  // --- danh mục sản phẩm + sản phẩm ---
  const all = [
    ...TILE_CATEGORIES.map((m) => ({ ...m, count: m.variants.length })),
    ...GROUP_CATEGORIES,
  ]
  for (const [i, mat] of all.entries()) {
    const cat = await prisma.category.create({
      data: { name: mat.name, slug: slugify(mat.name), type: 'PRODUCT', order: i },
    })
    for (let v = 0; v < mat.count; v++) {
      const variant = mat.variants[v] ?? `Mã ${v + 1}`
      const name = `${mat.name} ${variant}`
      const key = `${slugify(mat.name)}-${v}`
      const url = await upload(await render(browser, {
        key, label: mat.name, kicker: mat.kicker, w: 1020, h: 1020, hue: mat.hue,
      }), { key, label: mat.name, kicker: mat.kicker, w: 1020, h: 1020, hue: mat.hue })
      uploaded++
      await prisma.product.create({
        data: {
          name, slug: slugify(name), categoryId: cat.id, status: 'PUBLISHED',
          featured: v < 4, order: v,
          summary: mat.blurb,
          description: `<p>${mat.blurb}</p><h2>Thi công</h2><p>Khảo sát và báo giá theo khối lượng thực tế. Nhận thi công trọn gói hoặc bán vật tư rời.</p>`,
          specs: [
            { label: 'Mã hàng', value: variant },
            { label: 'Nhóm vật liệu', value: mat.name },
            { label: 'Bảo hành', value: '24 tháng' },
            { label: 'Phạm vi giao hàng', value: 'Toàn quốc' },
          ],
          images: { create: { url, alt: name, order: 0 } },
        },
      })
    }
    console.log(`  ${mat.name}: ${mat.count} sản phẩm`)
  }

  // --- bài tin ---
  const newsCats = await prisma.category.findMany({ where: { type: 'NEWS' } })
  for (const [i, post] of POSTS.entries()) {
    const key = `post-${i}`
    const shot = { key, label: post.cat, kicker: 'Tin tức', w: 1200, h: 675, hue: post.hue }
    const cover = await upload(await render(browser, shot), shot)
    uploaded++
    await prisma.post.create({
      data: {
        title: post.title, slug: slugify(post.title), excerpt: post.excerpt,
        content: post.body.map((b) => `<p>${b}</p>`).join(''),
        coverImageUrl: cover, coverImageAlt: post.title,
        categoryId: newsCats.find((c) => c.name === post.cat)?.id ?? null,
        authorId: admin?.id ?? null,
        status: 'PUBLISHED', featured: true,
        publishedAt: new Date(Date.now() - (i + 1) * 4 * 86400000),
      },
    })
  }
  console.log(`  ${POSTS.length} bài tin`)

  // --- trang tĩnh ---
  const PAGES = [
    { slug: 'gioi-thieu', title: 'Giới thiệu', content: '<p>VNDERCO cung cấp và thi công vật liệu ốp lát nội thất: tấm ốp tường, lam trang trí, trần nhựa và sàn gỗ sàn nhựa. Đội thi công nhận công trình dân dụng và thương mại trên toàn quốc.</p>' },
    { slug: 'cong-trinh-thi-cong', title: 'Công trình thi công', content: '<p>Một số công trình tiêu biểu VNDERCO đã hoàn thiện. Liên hệ để nhận hồ sơ năng lực đầy đủ kèm ảnh thực tế từng hạng mục.</p>' },
    { slug: 'lien-he', title: 'Liên hệ', content: '<p>Gọi hoặc nhắn Zalo để được khảo sát và báo giá trong ngày. Nhận thi công trọn gói hoặc bán vật liệu theo khối lượng.</p>' },
  ]
  for (const pg of PAGES) {
    await prisma.page.create({ data: { ...pg, status: 'PUBLISHED' } })
  }
  console.log(`  ${PAGES.length} trang tĩnh`)

  // --- ảnh dải cam kết + nội dung giới thiệu trang chủ ---
  const introShot = { key: 'intro', label: 'Thi công trọn gói', kicker: 'VNDERCO', w: 1080, h: 1080, hue: 205 }
  const introUrl = await upload(await render(browser, introShot), introShot)
  uploaded++
  await prisma.siteSetting.update({
    where: { id: 1 },
    data: {
      homeIntroTitle: 'CAM KẾT CỦA VNDERCO VỚI MỖI CÔNG TRÌNH:',
      homeIntroBody: [
        'VẬT TƯ ĐÚNG CHỦNG LOẠI: tấm ốp, lam, trần và sàn đều có phiếu xuất kho ghi rõ mã hàng và lô sản xuất.',
        'THI CÔNG ĐÚNG KỸ THUẬT: xử lý phẳng nền trước khi ốp, chừa khe giãn nở theo đúng khuyến cáo của nhà sản xuất.',
        'HOÀN THIỆN SẠCH: mối nối giấu dưới nẹp, góc cạnh cắt vát, dọn dẹp mặt bằng trước khi bàn giao.',
        'BẢO HÀNH 24 THÁNG: nhận xử lý tại chỗ trong vòng 48 giờ kể từ khi tiếp nhận phản ánh.',
      ].join('\n'),
      homeIntroImageUrl: introUrl,
      homeIntroCtaLabel: 'Xem công trình đã thi công',
      homeIntroCtaHref: '/cong-trinh-thi-cong',
      homeStats: [],
    },
  })

  await browser.close()
  console.log(`XONG — ${uploaded} ảnh đã tải lên Storage`)
  process.exit(0)
}

main()
