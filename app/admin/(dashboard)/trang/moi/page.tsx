import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { PageForm } from '../form'

export const metadata = { title: 'Thêm trang' }

export default function NewPagePage() {
  return (
    <AdminFormShell title="Thêm trang" backHref="/admin/trang">
      <PageForm />
    </AdminFormShell>
  )
}
