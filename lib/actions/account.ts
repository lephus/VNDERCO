'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { requireAdmin, signOut } from '@/lib/auth'
import { createAction } from './helper'
import { changePasswordSchema } from '@/lib/validation/account'

export const changePasswordAction = createAction({
  schema: changePasswordSchema,
  tags: () => [],                      // mật khẩu không ảnh hưởng trang công khai
  handler: async (input) => {
    const session = await requireAdmin()
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.id } })

    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      throw Object.assign(new Error('WRONG_PASSWORD'), { code: 'WRONG_PASSWORD' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(input.newPassword, 10),
        usingDefaultPassword: false,
      },
    })
    return { changed: true }
  },
})

// Huỷ phiên sau khi đổi mật khẩu. Gọi tách rời khỏi createAction vì signOut()
// ném redirect có chủ đích của Next.js — để nó chạy trong handler sẽ bị khối
// try/catch của helper nuốt mất và biến thành "có lỗi xảy ra".
export async function changePasswordAndSignOut(formData: FormData) {
  const result = await changePasswordAction(formData)
  if (!result.ok) return result
  await signOut({ redirectTo: '/admin/login?doi-mat-khau=1' })
  return result
}
