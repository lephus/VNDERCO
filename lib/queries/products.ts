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
