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
