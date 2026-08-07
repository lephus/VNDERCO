import { getPublishedPosts } from '@/lib/queries/posts'
import { getSiteSettings } from '@/lib/queries/settings'
import { asDate, siteUrl } from '@/lib/seo'

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const revalidate = 3600

export async function GET() {
  const base = siteUrl()
  const [{ items }, settings] = await Promise.all([getPublishedPosts({ page: 1 }), getSiteSettings()])

  const entries = items.map((post) => {
    const publishedAt = asDate(post.publishedAt)
    return `
    <item>
      <title>${escape(post.title)}</title>
      <link>${base}/tin-tuc/${post.slug}</link>
      <guid>${base}/tin-tuc/${post.slug}</guid>
      ${post.excerpt ? `<description>${escape(post.excerpt)}</description>` : ''}
      ${publishedAt ? `<pubDate>${publishedAt.toUTCString()}</pubDate>` : ''}
    </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${escape(settings.siteName)} — Tin tức</title>
  <link>${base}/tin-tuc</link>
  <description>${escape(settings.seoDescription)}</description>
  <language>vi</language>${entries}
</channel></rss>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
