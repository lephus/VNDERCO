'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ActionResult } from '@/lib/actions/helper'

export function useActionForm<T>(
  action: (input: FormData) => Promise<ActionResult<T>>,
  options: { redirectTo?: string; resetOnSuccess?: boolean } = {},
) {
  const router = useRouter()
  const [state, setState] = useState<ActionResult<T> | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setPending(true)
    const result = await action(new FormData(form))
    setState(result)
    setPending(false)

    if (!result.ok) return                       // giữ nguyên dữ liệu người dùng đã nhập
    if (options.resetOnSuccess) form.reset()
    if (options.redirectTo) { router.push(options.redirectTo); router.refresh() }
  }

  const fieldError = (name: string) =>
    state && !state.ok ? state.fieldErrors?.[name] : undefined

  return { state, pending, submit, fieldError }
}
