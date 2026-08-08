'use client'

import { useActionState } from 'react'
import { loginAction } from '@/lib/actions/auth'
import { buttonClass } from '@/lib/ui/button'

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mật khẩu</label>
        <input id="password" name="password" type="password" required autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending}
        className={buttonClass({ size: 'md', shape: 'rounded', className: 'w-full' })}>
        {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
    </form>
  )
}
