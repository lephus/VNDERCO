import type { MetadataRoute } from 'next'
import { getAllPublishedPostSlugs } from '@/lib/queries/posts'
import { getAllPublishedProductSlugs } from '@/lib/queries/products'
import { getAllPublishedPageSlugs } from '@/lib/queries/pages'
import { siteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [posts, products, pages] = await Promise.all([
    getAllPublishedPostSlugs(), getAllPublishedProductSlugs(), getAllPublishedPageSlugs(),
  ])

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/tin-tuc`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/san-pham`, changeFrequency: 'weekly', priority: 0.9 },
    ...posts.map((p) => ({ url: `${base}/tin-tuc/${p.slug}`, lastModified: p.updatedAt })),
    ...products.map((p) => ({ url: `${base}/san-pham/${p.slug}`, lastModified: p.updatedAt })),
    ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt })),
  ]
}
