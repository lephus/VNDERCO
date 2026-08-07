import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { CategoryForm } from '../form'

export const metadata = { title: 'Thêm danh mục' }

export default function NewCategoryPage() {
  return (
    <AdminFormShell title="Thêm danh mục" backHref="/admin/danh-muc">
      <CategoryForm />
    </AdminFormShell>
  )
}
