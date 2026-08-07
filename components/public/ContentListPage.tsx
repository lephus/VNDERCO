import type { Category, CategoryType } from '@prisma/client'
import { getCategories } from '@/lib/queries/categories'
import { CategoryFilter } from './CategoryFilter'
import { Pagination } from './Pagination'

type ListResult<T> = { items: T[]; pageCount: number }

export async function ContentListPage<T extends { id: string }>({
  title, basePath, categoryType, emptyMessage, gridClassName, fetchItems, renderItem, searchParams,
}: {
  title: string
  basePath: string
  categoryType: CategoryType
  emptyMessage: string
  gridClassName: string
  fetchItems: (args: { page: number; categorySlug?: string }) => Promise<ListResult<T>>
  renderItem: (item: T) => React.ReactNode
  searchParams: Promise<{ trang?: string; 'danh-muc'?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.trang) || 1)
  const categorySlug = params['danh-muc']

  const [{ items, pageCount }, categories] = await Promise.all([
    fetchItems({ page, categorySlug }),
    getCategories(categoryType),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight">{title}</h1>
      <CategoryFilter categories={categories as Category[]} active={categorySlug} basePath={basePath} />

      {items.length === 0
        ? <p className="py-16 text-center text-slate-500">{emptyMessage}</p>
        : <div className={gridClassName}>{items.map(renderItem)}</div>}

      <Pagination page={page} pageCount={pageCount} basePath={basePath}
        extraQuery={{ 'danh-muc': categorySlug }} />
    </div>
  )
}
