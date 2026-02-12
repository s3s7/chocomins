'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpSchema, SignUpValues } from '@/schemas/sign-up'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { signUp } from '@/app/actions/sign-up'
import { signIn, SignInResponse } from 'next-auth/react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { useRouter } from 'next/navigation'

export function SignUpForm() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (values: SignUpValues) => {
    startTransition(async () => {
      const result = await signUp(values)
      if (!result.isSuccess) {
        toast.error(getErrorMessage(result.errorCode))
        return
      }

      try {
        const signInResult = (await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        })) as SignInResponse | undefined

        if (signInResult?.ok) {
          toast.success('アカウントが作成され、ログインに成功しました！')
          form.reset()
          router.push('/')
        } else {
          toast.error('ログインに失敗しました。')
        }
      } catch (err) {
        console.error(err)
        toast.error('予期せぬエラーが発生しました。')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ニックネーム</FormLabel>
              <FormControl>
                <Input
                  placeholder="たろう"
                  autoComplete="nickname"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input
                  placeholder="your@email.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="******"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード（確認用）</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="******"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-transparent bg-[#8FCBAB] px-6 py-3 text-slate-900 shadow-lg hover:bg-[#7BB898] hover:shadow-xl"
        >
          {isPending ? '登録中...' : '新規登録'}
        </Button>
      </form>
    </Form>
  )
}
