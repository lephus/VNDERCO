export const TAGS = {
  settings: 'settings',
  posts: 'posts',
  post: (slug: string) => `post:${slug}`,
  products: 'products',
  product: (slug: string) => `product:${slug}`,
  pages: 'pages',
  page: (slug: string) => `page:${slug}`,
  banners: 'banners',
  categories: 'categories',
} as const

export const PAGE_SIZE = 12
export const FEATURED_POSTS = 6
export const FEATURED_PRODUCTS = 8
export const RELATED_POSTS = 3
