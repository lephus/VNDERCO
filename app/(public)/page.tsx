import Image from 'next/image'
import Link from 'next/link'
import { getActiveBanners } from '@/lib/queries/banners'
import { getFeaturedPosts } from '@/lib/queries/posts'
import { getFeaturedProducts } from '@/lib/queries/products'
import { getSiteSettings } from '@/lib/queries/settings'
import { HeroSlider } from '@/components/public/HeroSlider'
import { PostCard } from '@/components/public/PostCard'
import { ProductCard } from '@/components/public/ProductCard'
import { SectionHeading } from '@/components/public/SectionHeading'

export const revalidate = 3600

export default async function HomePage() {
  const [banners, posts, products, settings] = await Promise.all([
    getActiveBanners(), getFeaturedPosts(), getFeaturedProducts(), getSiteSettings(),
  ])

  return (
    <>
      <HeroSlider banners={banners} fallbackTitle={settings.homeIntroTitle} />

      {posts.length > 0 && (
        <section className="vnd-reveal mx-auto max-w-6xl px-4 py-16">
          <SectionHeading title="Tin nổi bật" href="/tin-tuc" linkLabel="Xem tất cả" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="vnd-reveal bg-primary-50/40 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <SectionHeading title="Sản phẩm nổi bật" href="/san-pham" linkLabel="Xem tất cả" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}

      {settings.homeIntroTitle && (
        <section className="vnd-reveal mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:grid-cols-2">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{settings.homeIntroTitle}</h2>
            <p className="mt-4 whitespace-pre-line text-slate-600">{settings.homeIntroBody}</p>
            {settings.homeIntroCtaHref && settings.homeIntroCtaLabel && (
              <Link href={settings.homeIntroCtaHref}
                className="mt-6 inline-block rounded-full bg-primary-600 px-6 py-3 font-semibold text-primary-fg transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:translate-y-0">
                {settings.homeIntroCtaLabel}
              </Link>
            )}
          </div>
          {settings.homeIntroImageUrl && (
            <Image src={settings.homeIntroImageUrl} alt="" width={640} height={420}
              className="rounded-2xl object-cover shadow-lg transition duration-500 ease-out hover:scale-[1.02] hover:shadow-xl" />
          )}
        </section>
      )}

      <section className="vnd-reveal px-4 pb-20">
        <div className="mx-auto max-w-4xl rounded-3xl px-8 py-12 text-center"
          style={{
            backgroundImage: 'linear-gradient(125deg, var(--vnd-gradient-from), var(--vnd-gradient-via), var(--vnd-gradient-to))',
            color: 'var(--vnd-primary-fg)',
          }}>
          <h2 className="text-2xl font-extrabold sm:text-3xl">Cần tư vấn cho doanh nghiệp của bạn?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {settings.contactPhone && (
              <a href={`tel:${settings.contactPhone}`}
                className="rounded-full bg-white px-6 py-3 font-semibold text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0">
                Gọi {settings.contactPhone}
              </a>
            )}
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`}
                className="rounded-full border border-white/60 px-6 py-3 font-semibold transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0">
                Gửi email
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
