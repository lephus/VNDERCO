import { prisma } from '@/lib/db'
import { AdminFormShell } from '@/components/admin/AdminFormShell'
import { SettingsForm } from './form'

export const metadata = { title: 'Cài đặt' }

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findUniqueOrThrow({ where: { id: 1 } })
  return (
    <AdminFormShell title="Cài đặt site" backHref="/admin">
      <SettingsForm settings={settings} />
    </AdminFormShell>
  )
}
