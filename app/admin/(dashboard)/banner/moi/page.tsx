import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { BannerForm } from '../form'

export const metadata = { title: 'Thêm banner' }

export default function NewBannerPage() {
  return (
    <AdminFormShell title="Thêm banner" backHref="/admin/banner">
      <BannerForm />
    </AdminFormShell>
  )
}
