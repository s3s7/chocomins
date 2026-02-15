import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  email: z.string().email('正しいメールアドレスを入力してください'),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
