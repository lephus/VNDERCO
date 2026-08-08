/**
 * Dữ liệu mẫu để xem site có nội dung trông như thế nào.
 *
 * KHÁC với `prisma/seed.ts`: file đó tạo những thứ TỐI THIỂU để chạy được
 * (tài khoản admin, cài đặt site, danh mục) và an toàn để chạy trên
 * production. File này tạo nội dung GIẢ để demo — đừng chạy trên production.
 *
 * Chạy được nhiều lần: mọi thứ nó tạo đều mang dấu nhận biết (slug cố định,
 * ảnh có tiền tố `demo-`), và lần chạy sau xoá sạch dấu vết lần trước — kể cả
 * file ảnh trong Supabase Storage — trước khi tạo lại, nên không bị nhân bản
 * và không để lại ảnh mồ côi.
 *
 * Ảnh là ảnh nền gradient sinh bằng Chromium chứ không phải ảnh thật: site chỉ
 * cho phép ảnh nằm trên `*.supabase.co` (next.config.ts remotePatterns), nên
 * không thể mượn URL ảnh từ ngoài vào.
 */
import { chromium, type Browser } from '@playwright/test'
import { prisma } from '@/lib/db'
import { uploadImage, deleteImage } from '@/lib/storage'

const DEMO_MARK = 'demo-'

const POST_SLUGS = [
  'khanh-thanh-nha-may-thu-hai-tai-binh-duong',
  'xu-huong-tu-dong-hoa-san-xuat-2026',
  'vnderco-tham-du-trien-lam-vimf-2026',
  'hop-tac-chien-luoc-cung-doi-tac-han-quoc',
  'nam-luu-y-khi-bao-tri-he-thong-khi-nen',
  'chuong-trinh-dao-tao-ky-thuat-vien-2026',
]
const PRODUCT_SLUGS = [
  'may-nen-khi-truc-vit-vnd-75s',
  'he-thong-giam-sat-nang-luong-energyview',
  'bo-loc-khi-nen-vnd-f200',
  'may-say-khi-tac-nhan-lanh-vnd-d50',
]
const PAGE_SLUGS = ['gioi-thieu', 'lien-he', 'chinh-sach-bao-mat']

// ---------------------------------------------------------------- ảnh

type Shot = { key: string; label: string; kicker: string; w: number; h: number; hue: number }

/**
 * Ảnh banner phải KHÔNG có chữ: HeroSlider vẽ tiêu đề đè lên ảnh, nên chữ nung
 * sẵn trong ảnh sẽ chồng lên tiêu đề thật và trông rất bẩn.
 *
 * Banner còn khác thẻ tin/sản phẩm ở chỗ nó hiển thị ở độ đậm đầy đủ dưới một
 * lớp phủ tối dồn về bên trái, nên phải vẽ tối màu và dồn điểm nhấn sang PHẢI —
 * chỗ lớp phủ mỏng nhất. Ảnh sáng đều sẽ làm chữ trắng khó đọc.
 */
const isBanner = (key: string) => key.startsWith('banner-')

/** Cung tròn gợi hình máy móc, đặt lệch phải để không bị lớp phủ nuốt mất. */
const machineRings = `
  <svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice">
    <g fill="none" stroke="rgba(255,255,255,.16)">
      <circle cx="1230" cy="330" r="150" stroke-width="1.5"/>
      <circle cx="1230" cy="330" r="235" stroke-width="1"/>
      <circle cx="1230" cy="330" r="330" stroke-width=".8"/>
      <path d="M1230 100 A230 230 0 0 1 1460 330" stroke="rgba(255,255,255,.45)" stroke-width="3" stroke-linecap="round"/>
      <path d="M1000 330 A230 230 0 0 1 1120 130" stroke="rgba(255,255,255,.28)" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  </svg>`

/**
 * Vẽ ảnh nền bằng Chromium. Dùng Playwright vì nó đã có sẵn trong dự án cho
 * E2E — không phải thêm thư viện xử lý ảnh chỉ để sinh vài tấm ảnh giả.
 */
async function render(browser: Browser, shot: Shot): Promise<Buffer> {
  const page = await browser.newPage({ viewport: { width: shot.w, height: shot.h } })

  const banner = isBanner(shot.key)
  const background = banner
    ? `
      radial-gradient(ellipse 60% 80% at 76% 32%, hsla(${shot.hue + 20},85%,60%,.42), transparent 60%),
      radial-gradient(ellipse 50% 70% at 92% 78%, hsla(${shot.hue + 70},88%,58%,.34), transparent 60%),
      radial-gradient(ellipse 70% 90% at 8% 18%, hsla(${shot.hue},80%,55%,.30), transparent 65%),
      repeating-linear-gradient(115deg, rgba(255,255,255,.05) 0 2px, transparent 2px 88px),
      repeating-linear-gradient(25deg, rgba(255,255,255,.035) 0 1px, transparent 1px 54px),
      linear-gradient(135deg, #080b1a 0%, #140f34 45%, #241344 100%)`
    : `
      radial-gradient(circle at 18% 22%, hsla(${shot.hue + 28},95%,72%,.55), transparent 55%),
      radial-gradient(circle at 82% 78%, hsla(${shot.hue - 34},92%,62%,.5), transparent 55%),
      linear-gradient(125deg, hsl(${shot.hue},82%,58%), hsl(${shot.hue + 40},80%,56%), hsl(${shot.hue + 78},78%,58%))`

  await page.setContent(`
    <html><body style="margin:0">
      <div style="
        position:relative;overflow:hidden;
        width:${shot.w}px;height:${shot.h}px;display:flex;flex-direction:column;
        align-items:center;justify-content:center;gap:${Math.round(shot.h / 28)}px;
        font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#fff;text-align:center;
        padding:0 ${Math.round(shot.w / 10)}px;box-sizing:border-box;
        background:${background};
      ">
        ${banner ? machineRings : `
          <div style="
            font-size:${Math.round(shot.h / 26)}px;letter-spacing:.22em;text-transform:uppercase;
            font-weight:700;opacity:.82;
          ">${shot.kicker}</div>
          <div style="font-size:${Math.round(shot.h / 11)}px;font-weight:800;line-height:1.15;
            text-shadow:0 2px 24px rgba(0,0,0,.22)">${shot.label}</div>
          <div style="font-size:${Math.round(shot.h / 30)}px;opacity:.7;font-weight:600">VNDERCO</div>`}
      </div>
    </body></html>`)
  const buffer = await page.screenshot({ type: 'png' })
  await page.close()
  return buffer
}

/** Xoá ảnh demo của lần chạy trước, cả trong Storage lẫn bảng Media. */
async function clearDemoMedia(): Promise<number> {
  const old = await prisma.media.findMany({ where: { pathname: { contains: DEMO_MARK } } })
  for (const item of old) {
    // Ảnh có thể đã bị xoá tay trên dashboard — đừng để việc đó chặn cả lần seed.
    await deleteImage(item.pathname).catch(() => {})
  }
  await prisma.media.deleteMany({ where: { pathname: { contains: DEMO_MARK } } })
  return old.length
}

async function upload(buffer: Buffer, shot: Shot): Promise<string> {
  const file = new File([new Uint8Array(buffer)], `${DEMO_MARK}${shot.key}.png`, { type: 'image/png' })
  const { url, pathname } = await uploadImage(file)
  await prisma.media.create({
    data: {
      url,
      pathname,
      filename: file.name,
      mimeType: 'image/png',
      size: buffer.byteLength,
      width: shot.w,
      height: shot.h,
      alt: shot.label,
    },
  })
  return url
}

// ---------------------------------------------------------------- nội dung

const html = (...blocks: string[]) => blocks.join('\n')
const p = (text: string) => `<p>${text}</p>`
const h2 = (text: string) => `<h2>${text}</h2>`
const ul = (...items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`

async function main() {
  console.log('Đang dọn dữ liệu mẫu của lần chạy trước...')
  const removed = await clearDemoMedia()
  await prisma.post.deleteMany({ where: { slug: { in: POST_SLUGS } } })
  await prisma.product.deleteMany({ where: { slug: { in: PRODUCT_SLUGS } } })
  await prisma.page.deleteMany({ where: { slug: { in: PAGE_SLUGS } } })
  // Nhận diện banner demo qua ẢNH nó trỏ tới, không qua tiêu đề: tiêu đề banner
  // hiển thị đè lên hero cho khách xem, nên không được nhét dấu kỹ thuật vào đó.
  await prisma.banner.deleteMany({ where: { imageUrl: { contains: DEMO_MARK } } })
  console.log(`  đã xoá ${removed} ảnh demo cũ`)

  const cats = await prisma.category.findMany()
  const cat = (type: 'NEWS' | 'PRODUCT', name: string) =>
    cats.find((c) => c.type === type && c.name === name)?.id ?? null
  const admin = await prisma.user.findFirst({ select: { id: true } })

  console.log('Đang sinh và tải ảnh lên Supabase Storage...')
  const browser = await chromium.launch()
  const put = async (shot: Shot) => upload(await render(browser, shot), shot)

  const bannerImgs = [
    await put({ key: 'banner-1', kicker: 'Giải pháp công nghiệp', label: 'Vận hành hiệu quả hơn mỗi ngày', w: 1600, h: 700, hue: 258 }),
    await put({ key: 'banner-2', kicker: 'Thiết bị chính hãng', label: 'Bảo hành 24 tháng toàn quốc', w: 1600, h: 700, hue: 292 }),
  ]
  const introImg = await put({ key: 'intro', kicker: 'Từ năm 2009', label: 'Nhà máy VNDERCO', w: 1280, h: 840, hue: 268 })

  const postImgs = await Promise.all([
    put({ key: 'post-1', kicker: 'Tin công ty', label: 'Nhà máy thứ hai tại Bình Dương', w: 1200, h: 800, hue: 250 }),
    put({ key: 'post-2', kicker: 'Tin ngành', label: 'Tự động hoá sản xuất 2026', w: 1200, h: 800, hue: 276 }),
    put({ key: 'post-3', kicker: 'Sự kiện', label: 'Triển lãm VIMF 2026', w: 1200, h: 800, hue: 300 }),
    put({ key: 'post-4', kicker: 'Tin công ty', label: 'Hợp tác chiến lược', w: 1200, h: 800, hue: 232 }),
    put({ key: 'post-5', kicker: 'Tin ngành', label: 'Bảo trì hệ thống khí nén', w: 1200, h: 800, hue: 318 }),
    put({ key: 'post-6', kicker: 'Sự kiện', label: 'Đào tạo kỹ thuật viên', w: 1200, h: 800, hue: 210 }),
  ])

  const prodImgs = await Promise.all(
    ([
      ['prod-1a', 'Máy nén khí VND-75S', 254], ['prod-1b', 'VND-75S — buồng nén', 262],
      ['prod-2a', 'EnergyView Dashboard', 284], ['prod-2b', 'EnergyView — cảm biến', 292],
      ['prod-3a', 'Bộ lọc VND-F200', 308], ['prod-3b', 'VND-F200 — lõi lọc', 316],
      ['prod-4a', 'Máy sấy khí VND-D50', 238], ['prod-4b', 'VND-D50 — dàn lạnh', 246],
    ] as const).map(([key, label, hue]) =>
      put({ key, kicker: 'Sản phẩm', label, w: 1200, h: 900, hue })),
  )
  await browser.close()
  console.log(`  đã tải lên ${2 + 1 + 6 + 8} ảnh`)

  console.log('Đang tạo nội dung...')

  await prisma.banner.createMany({
    data: [
      { title: 'Vận hành hiệu quả hơn mỗi ngày', subtitle: 'Thiết bị và giải pháp công nghiệp cho doanh nghiệp Việt', imageUrl: bannerImgs[0], imageAlt: 'Dây chuyền sản xuất VNDERCO', ctaLabel: 'Xem sản phẩm', ctaHref: '/san-pham', order: 0, active: true },
      { title: 'Bảo hành 24 tháng toàn quốc', subtitle: 'Đội ngũ kỹ thuật có mặt trong 24 giờ tại 3 miền', imageUrl: bannerImgs[1], imageAlt: 'Kỹ thuật viên VNDERCO', ctaLabel: 'Liên hệ tư vấn', ctaHref: '/lien-he', order: 1, active: true },
    ],
  })

  const posts = [
    {
      slug: POST_SLUGS[0], title: 'VNDERCO khánh thành nhà máy thứ hai tại Bình Dương',
      excerpt: 'Nhà máy rộng 12.000 m² đi vào hoạt động từ tháng 3, nâng công suất lắp ráp lên gấp đôi.',
      categoryId: cat('NEWS', 'Tin công ty'), featured: true, cover: postImgs[0], days: 3,
      content: html(
        p('Sáng 12/3, VNDERCO chính thức đưa vào vận hành nhà máy thứ hai tại Khu công nghiệp VSIP II, Bình Dương. Nhà máy có diện tích 12.000 m² với hai dây chuyền lắp ráp máy nén khí và một khu vực kiểm định độc lập.'),
        h2('Nâng gấp đôi năng lực sản xuất'),
        p('Với nhà máy mới, năng lực lắp ráp của công ty tăng từ 1.200 lên 2.500 thiết bị mỗi năm, đủ đáp ứng nhu cầu đang tăng nhanh của các khách hàng trong ngành dệt may và chế biến thực phẩm.'),
        ul('Hai dây chuyền lắp ráp tự động', 'Khu kiểm định đạt chuẩn ISO 8573-1', 'Kho linh kiện 3.000 m² đặt ngay cạnh xưởng'),
        p('Ban lãnh đạo cho biết giai đoạn hai của dự án sẽ khởi công trong quý IV năm nay.'),
      ),
    },
    {
      slug: POST_SLUGS[1], title: 'Xu hướng tự động hoá sản xuất tại Việt Nam năm 2026',
      excerpt: 'Chi phí nhân công tăng và yêu cầu truy xuất nguồn gốc đang đẩy nhanh quá trình tự động hoá ở các nhà máy vừa.',
      categoryId: cat('NEWS', 'Tin ngành'), featured: true, cover: postImgs[1], days: 8,
      content: html(
        p('Theo khảo sát của Hiệp hội Doanh nghiệp cơ khí, 62% nhà máy quy mô vừa dự định đầu tư thiết bị tự động trong hai năm tới — cao hơn đáng kể so với mức 41% của năm 2024.'),
        h2('Ba động lực chính'),
        ul('Chi phí nhân công tăng trung bình 8%/năm', 'Khách hàng xuất khẩu yêu cầu truy xuất dữ liệu sản xuất', 'Giá thiết bị đo lường và điều khiển giảm mạnh'),
        p('Đáng chú ý, phần lớn doanh nghiệp chọn cách nâng cấp từng cụm thiết bị thay vì thay mới toàn bộ dây chuyền, nhằm giữ dòng tiền ổn định.'),
      ),
    },
    {
      slug: POST_SLUGS[2], title: 'VNDERCO tham dự triển lãm VIMF 2026',
      excerpt: 'Gian hàng B12 giới thiệu dòng máy nén khí trục vít thế hệ mới và hệ thống giám sát năng lượng EnergyView.',
      categoryId: cat('NEWS', 'Sự kiện'), featured: true, cover: postImgs[2], days: 14,
      content: html(
        p('Triển lãm Công nghiệp & Sản xuất Việt Nam (VIMF) 2026 diễn ra từ ngày 20 đến 23/5 tại Trung tâm Hội chợ Bình Dương. VNDERCO có mặt tại gian hàng B12.'),
        h2('Những gì được giới thiệu'),
        ul('Máy nén khí trục vít VND-75S tiết kiệm 18% điện năng', 'Hệ thống giám sát năng lượng EnergyView', 'Chương trình bảo trì trọn gói cho nhà máy vừa'),
        p('Khách tham quan đăng ký trước tại gian hàng sẽ được khảo sát hệ thống khí nén miễn phí trong tháng 6.'),
      ),
    },
    {
      slug: POST_SLUGS[3], title: 'Hợp tác chiến lược cùng đối tác Hàn Quốc',
      excerpt: 'Thoả thuận chuyển giao công nghệ buồng nén thế hệ mới được ký kết trong tháng 2.',
      categoryId: cat('NEWS', 'Tin công ty'), featured: false, cover: postImgs[3], days: 26,
      content: html(
        p('VNDERCO và đối tác Hàn Quốc đã ký thoả thuận hợp tác kỹ thuật kéo dài 5 năm, tập trung vào chuyển giao công nghệ buồng nén hai cấp.'),
        p('Theo thoả thuận, đội ngũ kỹ sư của công ty sẽ được đào tạo tại nhà máy đối tác trong 6 tháng đầu, trước khi triển khai sản xuất thử tại Bình Dương.'),
      ),
    },
    {
      slug: POST_SLUGS[4], title: '5 lưu ý khi bảo trì hệ thống khí nén',
      excerpt: 'Phần lớn sự cố khí nén đến từ những việc rất nhỏ bị bỏ qua trong lịch bảo trì định kỳ.',
      categoryId: cat('NEWS', 'Tin ngành'), featured: false, cover: postImgs[4], days: 35,
      content: html(
        p('Hệ thống khí nén thường chiếm 20–30% hoá đơn điện của một nhà máy. Bảo trì đúng cách giúp giảm đáng kể con số đó.'),
        h2('Năm việc nên làm định kỳ'),
        ul(
          'Kiểm tra rò rỉ đường ống — rò rỉ 3mm có thể tốn hơn 20 triệu đồng điện mỗi năm',
          'Thay lọc khí đúng chu kỳ nhà sản xuất khuyến cáo',
          'Xả nước ngưng hằng ngày, đặc biệt trong mùa nồm',
          'Theo dõi nhiệt độ dầu và thay dầu đúng hạn',
          'Ghi lại áp suất làm việc để phát hiện sụt áp bất thường sớm',
        ),
      ),
    },
    {
      slug: POST_SLUGS[5], title: 'Chương trình đào tạo kỹ thuật viên 2026',
      excerpt: 'Bản nháp — chưa xuất bản.',
      categoryId: cat('NEWS', 'Sự kiện'), featured: false, cover: postImgs[5], days: null,
      content: html(p('Nội dung đang được biên tập, chưa công bố.')),
    },
  ]

  for (const post of posts) {
    const published = post.days !== null
    await prisma.post.create({
      data: {
        title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
        coverImageUrl: post.cover, coverImageAlt: post.title,
        categoryId: post.categoryId, authorId: admin?.id ?? null,
        status: published ? 'PUBLISHED' : 'DRAFT',
        featured: post.featured,
        publishedAt: published ? new Date(Date.now() - post.days! * 864e5) : null,
        seoDescription: post.excerpt,
      },
    })
  }

  const products = [
    {
      slug: PRODUCT_SLUGS[0], name: 'Máy nén khí trục vít VND-75S',
      summary: 'Máy nén khí trục vít 75kW có biến tần, tiết kiệm tới 18% điện năng so với dòng chạy tải/không tải.',
      categoryId: cat('PRODUCT', 'Thiết bị'), featured: true, order: 0, imgs: [prodImgs[0], prodImgs[1]],
      specs: [
        { label: 'Công suất', value: '75 kW' },
        { label: 'Lưu lượng', value: '13,2 m³/phút' },
        { label: 'Áp suất làm việc', value: '7,5 bar' },
        { label: 'Điều khiển', value: 'Biến tần, màn hình cảm ứng 7"' },
        { label: 'Độ ồn', value: '68 dB(A)' },
        { label: 'Bảo hành', value: '24 tháng' },
      ],
      description: html(
        p('VND-75S là dòng máy nén khí trục vít có biến tần dành cho nhà máy hoạt động liên tục. Buồng nén hai cấp giúp giảm nhiệt độ khí đầu ra và kéo dài tuổi thọ lọc.'),
        h2('Điểm nổi bật'),
        ul('Biến tần điều chỉnh theo nhu cầu thực tế, tiết kiệm tới 18% điện', 'Buồng nén hai cấp, tuổi thọ thiết kế 40.000 giờ', 'Cảnh báo bảo trì hiển thị trực tiếp trên màn hình', 'Kết nối được với hệ thống giám sát EnergyView'),
      ),
    },
    {
      slug: PRODUCT_SLUGS[1], name: 'Hệ thống giám sát năng lượng EnergyView',
      summary: 'Theo dõi điện năng, áp suất và thời gian chạy của toàn bộ hệ thống khí nén trên một màn hình.',
      categoryId: cat('PRODUCT', 'Giải pháp'), featured: true, order: 1, imgs: [prodImgs[2], prodImgs[3]],
      specs: [
        { label: 'Số điểm đo', value: 'Tối đa 64' },
        { label: 'Kết nối', value: 'Modbus RTU / TCP, LoRa' },
        { label: 'Lưu trữ', value: '24 tháng dữ liệu' },
        { label: 'Cảnh báo', value: 'Email, Zalo OA' },
        { label: 'Triển khai', value: '3–5 ngày làm việc' },
      ],
      description: html(
        p('EnergyView thu thập dữ liệu từ cảm biến gắn trên máy nén, bình tích và đường ống chính, sau đó dựng lại bức tranh tiêu thụ năng lượng theo giờ, theo ca và theo dây chuyền.'),
        h2('Giúp được gì'),
        ul('Phát hiện rò rỉ khí nén qua bất thường tiêu thụ ban đêm', 'So sánh hiệu suất giữa các ca sản xuất', 'Cảnh báo sớm khi áp suất sụt ngoài ngưỡng', 'Xuất báo cáo phục vụ kiểm toán năng lượng'),
      ),
    },
    {
      slug: PRODUCT_SLUGS[2], name: 'Bộ lọc khí nén VND-F200',
      summary: 'Bộ lọc ba cấp cho khí nén dùng trong chế biến thực phẩm và dược phẩm.',
      categoryId: cat('PRODUCT', 'Phụ kiện'), featured: true, order: 2, imgs: [prodImgs[4], prodImgs[5]],
      specs: [
        { label: 'Lưu lượng', value: '200 m³/giờ' },
        { label: 'Cấp lọc', value: '3 cấp (1 µm / 0,01 µm / than hoạt tính)' },
        { label: 'Áp suất tối đa', value: '16 bar' },
        { label: 'Tiêu chuẩn', value: 'ISO 8573-1 Class 1.2.1' },
      ],
      description: html(
        p('VND-F200 loại bỏ dầu, hơi nước và hạt bụi khỏi khí nén, đạt mức sạch yêu cầu cho dây chuyền tiếp xúc trực tiếp với thực phẩm.'),
        p('Lõi lọc thay được từng cấp, giúp giảm chi phí vận hành so với loại thay nguyên cụm.'),
      ),
    },
    {
      slug: PRODUCT_SLUGS[3], name: 'Máy sấy khí tác nhân lạnh VND-D50',
      summary: 'Máy sấy khí tác nhân lạnh cho hệ thống công suất trung bình, điểm sương ổn định 3°C.',
      categoryId: cat('PRODUCT', 'Thiết bị'), featured: false, order: 3, imgs: [prodImgs[6], prodImgs[7]],
      specs: [
        { label: 'Lưu lượng', value: '5,0 m³/phút' },
        { label: 'Điểm sương', value: '3 °C' },
        { label: 'Nguồn điện', value: '220V / 50Hz' },
        { label: 'Môi chất lạnh', value: 'R134a' },
      ],
      description: html(
        p('VND-D50 tách hơi nước khỏi khí nén bằng nguyên lý làm lạnh, giữ điểm sương ổn định ở 3°C ngay cả khi tải thay đổi.'),
        p('Thiết kế trao đổi nhiệt kiểu tấm giúp máy nhỏ gọn và ít tổn thất áp suất.'),
      ),
    },
  ]

  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name, slug: product.slug, summary: product.summary,
        description: product.description, specs: product.specs,
        categoryId: product.categoryId, status: 'PUBLISHED',
        featured: product.featured, order: product.order,
        seoDescription: product.summary,
        images: { create: product.imgs.map((url, i) => ({ url, alt: product.name, order: i })) },
      },
    })
  }

  await prisma.page.createMany({
    data: [
      {
        title: 'Về chúng tôi', slug: PAGE_SLUGS[0], status: 'PUBLISHED',
        seoDescription: 'VNDERCO — thiết bị và giải pháp khí nén công nghiệp cho doanh nghiệp Việt từ năm 2009.',
        content: html(
          p('VNDERCO được thành lập năm 2009, chuyên cung cấp thiết bị và giải pháp khí nén công nghiệp cho các nhà máy tại Việt Nam.'),
          h2('Chúng tôi làm gì'),
          ul('Cung cấp máy nén khí, máy sấy khí và phụ kiện chính hãng', 'Thiết kế và lắp đặt hệ thống khí nén trọn gói', 'Bảo trì định kỳ và sửa chữa khẩn cấp trong 24 giờ', 'Tư vấn tiết kiệm năng lượng cho hệ thống đang vận hành'),
          h2('Con số'),
          ul('Hơn 800 nhà máy đã tin dùng', '2 nhà máy lắp ráp tại Bình Dương', '35 kỹ thuật viên có mặt tại 3 miền'),
          p('Chúng tôi tin rằng một hệ thống khí nén tốt là hệ thống mà khách hàng không phải nghĩ tới nó.'),
        ),
      },
      {
        title: 'Liên hệ', slug: PAGE_SLUGS[1], status: 'PUBLISHED',
        seoDescription: 'Thông tin liên hệ VNDERCO — văn phòng, nhà máy, hotline kỹ thuật.',
        content: html(
          h2('Văn phòng chính'),
          p('Số 128 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh<br>Điện thoại: 0900 000 000<br>Email: lienhe@vnderco.vn'),
          h2('Nhà máy'),
          p('Lô B12, KCN VSIP II, Thành phố Thủ Dầu Một, Bình Dương'),
          h2('Hỗ trợ kỹ thuật'),
          p('Hotline kỹ thuật hoạt động 24/7 cho khách hàng đang trong thời gian bảo hành.'),
        ),
      },
      {
        title: 'Chính sách bảo mật', slug: PAGE_SLUGS[2], status: 'PUBLISHED',
        seoDescription: 'Cách VNDERCO thu thập và sử dụng thông tin của khách hàng.',
        content: html(
          p('Trang này mô tả cách VNDERCO thu thập, sử dụng và bảo vệ thông tin khách hàng cung cấp khi liên hệ với chúng tôi.'),
          h2('Thông tin chúng tôi thu thập'),
          ul('Họ tên, số điện thoại và email khi khách hàng gửi yêu cầu tư vấn', 'Thông tin về thiết bị đang sử dụng, phục vụ việc báo giá và bảo trì'),
          h2('Cách chúng tôi sử dụng'),
          p('Thông tin chỉ được dùng để liên hệ lại và phục vụ yêu cầu của khách hàng. Chúng tôi không bán hoặc chia sẻ thông tin cho bên thứ ba vì mục đích quảng cáo.'),
        ),
      },
    ],
  })

  // Cài đặt site KHÔNG bị ghi đè. Khác với bài viết/sản phẩm/trang (thuộc về
  // script này, mang slug cố định, xoá tạo lại thoải mái), SiteSetting là bản
  // ghi đơn dùng chung mà người dùng sửa qua trang admin. Lần trước script ghi
  // đè thẳng và xoá mất số điện thoại, địa chỉ, đoạn giới thiệu người dùng vừa
  // nhập tay. Giờ chỉ điền vào ô nào đang trống — có sẵn giá trị thì để yên.
  const current = await prisma.siteSetting.findUniqueOrThrow({ where: { id: 1 } })
  const demoSettings = {
    contactEmail: 'lienhe@vnderco.vn',
    contactPhone: '0900000000',
    contactAddress: 'Số 128 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
    zaloUrl: 'https://zalo.me/0900000000',
    facebookUrl: 'https://facebook.com/vnderco',
    homeIntroTitle: 'Đồng hành cùng nhà máy Việt từ năm 2009',
    homeIntroBody:
      'VNDERCO cung cấp thiết bị khí nén, giải pháp giám sát năng lượng và dịch vụ bảo trì cho hơn 800 nhà máy trên cả nước.\n\nĐội ngũ kỹ thuật của chúng tôi có mặt tại 3 miền, cam kết phản hồi trong 24 giờ.',
    homeIntroImageUrl: introImg,
    homeIntroCtaLabel: 'Tìm hiểu về VNDERCO',
    homeIntroCtaHref: '/gioi-thieu',
    seoDescription: 'VNDERCO — thiết bị và giải pháp khí nén công nghiệp cho doanh nghiệp Việt.',
    seoOgImageUrl: bannerImgs[0],
    homeStats: [
      { label: 'Nhà máy tin dùng', value: '800+' },
      { label: 'Năm kinh nghiệm', value: '17' },
      { label: 'Kỹ thuật viên', value: '35' },
      { label: 'Phản hồi trong', value: '24h' },
    ],
  }

  const fills = Object.fromEntries(
    Object.entries(demoSettings).filter(([key]) => {
      const existing = current[key as keyof typeof current]
      if (Array.isArray(existing)) return existing.length === 0
      return existing === null || existing === ''
    }),
  )

  if (Object.keys(fills).length > 0) {
    await prisma.siteSetting.update({ where: { id: 1 }, data: fills })
    console.log(`  điền ${Object.keys(fills).length} ô cài đặt còn trống:`, Object.keys(fills).join(', '))
  }
  const kept = Object.keys(demoSettings).length - Object.keys(fills).length
  if (kept > 0) console.log(`  giữ nguyên ${kept} ô cài đặt bạn đã tự nhập`)

  const counts = {
    Post: await prisma.post.count(),
    Product: await prisma.product.count(),
    Page: await prisma.page.count(),
    Banner: await prisma.banner.count(),
    Media: await prisma.media.count(),
  }
  console.log('Xong. Tổng số bản ghi hiện có:', counts)
  // Script này ghi thẳng vào DB nên KHÔNG đi qua revalidateTag() như các thao
  // tác trong trang admin. Trang nào đã được truy cập trước lúc seed sẽ còn giữ
  // kết quả cũ trong cache của Next (nằm trong .next/, sống qua cả lần khởi
  // động lại) — kể cả kết quả 404 của một trang lúc đó chưa tồn tại.
  console.log('\nLƯU Ý: xoá cache rồi khởi động lại để thấy nội dung mới:')
  console.log('  rm -rf .next && npm run dev')
  await prisma.$disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await prisma.$disconnect()
  process.exit(1)
})
