'use client'

import { useState } from 'react'
import { changePasswordAndSignOut } from '@/lib/actions/account'
import type { ActionResult } from '@/lib/actions/helper'

const FIELDS = [
  { name: 'currentPassword', label: 'Mật khẩu hiện tại' },
  { name: 'newPassword', label: 'Mật khẩu mới' },
  { name: 'confirmPassword', label: 'Nhập lại mật khẩu mới' },
] as const

export function ChangePasswordForm() {
  const [state, setState] = useState<ActionResult<{ changed: boolean }> | null>(null)
  const [pending, setPending] = useState(false)

  return (
    <form
      className="max-w-sm space-y-4"
      onSubmit={async (event) => {
        event.preventDefault()
        setPending(true)
        const result = await changePasswordAndSignOut(new FormData(event.currentTarget))
        setState(result)
        setPending(false)
        if (result.ok) event.currentTarget.reset()
      }}
    >
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-slate-700">{field.label}</label>
          <input id={field.name} name={field.name} type="password" required autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          {state && !state.ok && state.fieldErrors?.[field.name]?.[0] && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors[field.name][0]}</p>
          )}
        </div>
      ))}

      {state && !state.ok && state.formError && <p role="alert" className="text-sm text-red-600">{state.formError}</p>}
      {state?.ok && <p className="text-sm text-green-700">Đã đổi mật khẩu thành công.</p>}

      <button type="submit" disabled={pending}
        className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-primary-fg disabled:opacity-60">
        Đổi mật khẩu
      </button>
    </form>
  )
}
