'use server'

import { prisma } from '@/lib/db'
import { TAGS } from '@/lib/cache-tags'
import { createAction } from './helper'
import { settingsSchema } from '@/lib/validation/settings'

export const updateSettingsAction = createAction({
  schema: settingsSchema,
  // `handler` phải khai báo trước `tags`: TS suy luận kiểu T của createAction
  // từ giá trị trả về của handler, còn tham số thứ hai của tags cũng có kiểu
  // T — nếu tags đứng trước, T chưa được suy ra sẽ mặc định là `unknown`.
  handler: (input) => prisma.siteSetting.upsert({
    where: { id: 1 },
    update: input,
    create: { id: 1, ...input },
  }),
  // Màu và thông tin liên hệ nằm ở layout gốc → phải làm mới mọi thứ.
  tags: () => [TAGS.settings, TAGS.posts, TAGS.products, TAGS.pages, TAGS.banners],
})
