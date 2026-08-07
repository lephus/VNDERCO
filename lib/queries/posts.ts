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
