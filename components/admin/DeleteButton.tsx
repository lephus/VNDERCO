'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { ActionResult } from '@/lib/actions/helper'

export function DeleteButton({
  id, action, confirmText,
}: { id: string; action: (input: unknown) => Promise<ActionResult<unknown>>; confirmText: string }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
      onClick={async () => {
        if (!window.confirm(confirmText)) return
        setPending(true)
        const result = await action({ id })
        setPending(false)
        if (!result.ok) return alert(result.formError ?? 'Xoá thất bại.')
        router.refresh()
      }}
    >
      Xoá
    </button>
  )
}
