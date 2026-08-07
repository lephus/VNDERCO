import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/queries/pages'
import { RichContent } from '@/components/public/RichContent'

export const revalidate = 3600

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  if (!page) notFound()

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{page.title}</h1>
      <div className="mt-8"><RichContent html={page.content} /></div>
    </article>
  )
}
