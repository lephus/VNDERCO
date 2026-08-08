import { auth } from '@/lib/auth'
import { logoutAction } from '@/lib/actions/auth'
import { AdminShell } from '@/components/admin/AdminShell'
import { DefaultPasswordBanner } from '@/components/admin/DefaultPasswordBanner'

export const metadata = { title: { template: '%s | Quản trị VNDERCO', default: 'Quản trị VNDERCO' } }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-slate-50">
      {session?.user?.usingDefaultPassword && <DefaultPasswordBanner />}
      <AdminShell
        email={session?.user?.email}
        logout={
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
              Đăng xuất
            </button>
          </form>
        }
      >
        {children}
      </AdminShell>
    </div>
  )
}
