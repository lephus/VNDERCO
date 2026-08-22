import { getPublishedProducts } from '@/lib/queries/products'
import { ProductCard } from '@/components/public/ProductCard'
import { ContentListPage } from '@/components/public/ContentListPage'

export const revalidate = 3600
export const metadata = { title: 'Sản phẩm' }

export default function ProductListPage({
  searchParams,
}: { searchParams: Promise<{ trang?: string; 'danh-muc'?: string }> }) {
  return (
    <ContentListPage
      title="Sản phẩm"
      basePath="/san-pham"
      categoryType="PRODUCT"
      emptyMessage="Chưa có sản phẩm nào trong mục này."
      gridClassName="grid grid-cols-2 gap-x-[30px] gap-y-2 tile:grid-cols-4"
      fetchItems={getPublishedProducts}
      renderItem={(product) => <ProductCard key={product.id} product={product} />}
      searchParams={searchParams}
    />
  )
}
