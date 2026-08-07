type OgInput = { contentImage?: string | null; settingsImage?: string | null }

export function pickOgImage({ contentImage, settingsImage }: OgInput): string {
  return contentImage || settingsImage || '/opengraph-image'
}

// AUTH_URL rỗng hoặc chỉ có khoảng trắng vẫn phải rơi về giá trị mặc định — nếu không,
// mọi URL tuyệt đối trong sitemap/RSS/JSON-LD sẽ bị cụt (ví dụ "/tin-tuc/x" thay vì
// "https://vnderco.vn/tin-tuc/x"), phá hỏng sitemap và làm feed không hợp lệ.
// Ở production BẮT BUỘC phải đặt AUTH_URL="https://<domain-thật>" khi triển khai —
// nếu không, sitemap/RSS/OG sẽ quảng bá http://localhost:3000 ra ngoài.
export function siteUrl(): string {
  const raw = process.env.AUTH_URL?.trim()
  return raw ? raw.replace(/\/$/, '') : 'http://localhost:3000'
}

// unstable_cache (dùng cho getPostBySlug/getPublishedPosts trong lib/queries) tuần tự hoá
// kết quả qua JSON.stringify/parse trước khi lưu — ngay sau lần tính đầu tiên cho một
// khoá cache, các trường Date đọc lại từ cache KHÔNG còn là instance Date thật nữa mà chỉ
// là chuỗi ISO, dù kiểu khai báo (Prisma) vẫn ghi là Date. Gọi thẳng .toISOString()/
// .toUTCString() trên các trường như vậy sẽ ném lỗi ngẫu nhiên tuỳ trạng thái cache. Mọi
// nơi tiêu thụ trường ngày lấy từ các hàm trong lib/queries phải ép kiểu lại qua asDate()
// trước khi gọi phương thức của Date.
export function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

type ArticleInput = {
  title: string; excerpt: string | null; publishedAt: Date | null; coverImageUrl: string | null
}

export function articleJsonLd(post: ArticleInput, siteName: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImageUrl ?? undefined,
    datePublished: asDate(post.publishedAt)?.toISOString(),
    publisher: { '@type': 'Organization', name: siteName },
    mainEntityOfPage: url,
  }
}

type ProductInput = { name: string; summary: string | null; images: { url: string }[] }

export function productJsonLd(product: ProductInput, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary ?? undefined,
    image: product.images.map((i) => i.url),
    url,
  }
}

type OrgInput = {
  siteName: string; logoUrl: string | null; contactPhone: string; contactEmail: string
  facebookUrl: string | null; zaloUrl: string | null
}

export function organizationJsonLd(settings: OrgInput, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.siteName,
    url,
    logo: settings.logoUrl ?? undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.contactPhone || undefined,
      email: settings.contactEmail || undefined,
      contactType: 'sales',
    },
    sameAs: [settings.facebookUrl, settings.zaloUrl].filter(Boolean),
  }
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
    })),
  }
}
