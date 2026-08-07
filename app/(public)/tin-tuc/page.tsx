import { getPublishedPosts } from '@/lib/queries/posts'
import { PostCard } from '@/components/public/PostCard'
import { ContentListPage } from '@/components/public/ContentListPage'

export const revalidate = 3600
export const metadata = { title: 'Tin tức' }

export default function NewsListPage({
  searchParams,
}: { searchParams: Promise<{ trang?: string; 'danh-muc'?: string }> }) {
  return (
    <ContentListPage
      title="Tin tức"
      basePath="/tin-tuc"
      categoryType="NEWS"
      emptyMessage="Chưa có bài viết nào trong mục này."
      gridClassName="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      fetchItems={getPublishedPosts}
      renderItem={(post) => <PostCard key={post.id} post={post} />}
      searchParams={searchParams}
    />
  )
}
