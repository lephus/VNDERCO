import { ChangePasswordForm } from './form'

export const metadata = { title: 'Đổi mật khẩu' }

export default function ChangePasswordPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Đổi mật khẩu</h1>
      <ChangePasswordForm />
    </div>
  )
}
