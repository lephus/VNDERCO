import Link from 'next/link'

export function Pagination({
  page, pageCount, basePath, extraQuery,
}: { page: number; pageCount: number; basePath: string; extraQuery?: Record<string, string | undefined> }) {
  if (pageCount <= 1) return null

  const hrefFor = (target: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(extraQuery ?? {})) if (value) params.set(key, value)
    if (target > 1) params.set('trang', String(target))
    const query = params.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  return (
    <nav aria-label="Phân trang" className="mt-10 flex justify-center gap-2">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
        <Link key={n} href={hrefFor(n)} aria-current={n === page ? 'page' : undefined}
          className={`rounded-lg px-4 py-2 text-sm ${
            n === page ? 'bg-primary-600 font-semibold text-primary-fg' : 'border border-slate-200 text-slate-600'
          }`}>
          {n}
        </Link>
      ))}
    </nav>
  )
}
