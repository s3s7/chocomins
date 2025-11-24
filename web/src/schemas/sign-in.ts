import * as z from 'zod'

export const signInSchema = z.object({
  email: z
    .email({ message: '正しいメールアドレスを入力してください' }),
  password: z
    .string()
    .min(6, { message: 'パスワードは6文字以上で入力してください' }),
})

export type SignInValues = z.infer<typeof signInSchema>
