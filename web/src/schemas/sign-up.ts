import * as z from 'zod'

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'ニックネームは2文字以上で入力してください' })
      .max(30, { message: 'ニックネームは30文字以下で入力してください' }),
    email: z
      .email({ message: '正しいメールアドレスを入力してください' }),
    password: z
      .string()
      .min(6, { message: 'パスワードは6文字以上で入力してください' })
      .max(10, { message: 'パスワードは10文字以下で入力してください' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  })

export type SignUpValues = z.infer<typeof signUpSchema>
