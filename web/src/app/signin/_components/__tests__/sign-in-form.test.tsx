import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInForm } from '../sign-in-form'

// Mocks
const pushMock = jest.fn()
const signInMock = jest.fn()
const toastSuccessMock = jest.fn<(message: string) => void>()
const toastErrorMock = jest.fn<(message: string) => void>()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

jest.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => signInMock(...args),
}))

jest.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => toastSuccessMock(...args),
    error: (...args: any[]) => toastErrorMock(...args),
  },
}))

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('ログイン成功時にリダイレクトとトーストが呼ばれる', async () => {
    signInMock.mockResolvedValue({ ok: true, status: 200 })

    render(<SignInForm />)

    const email = screen.getByLabelText('メールアドレス') as HTMLInputElement
    const password = screen.getByLabelText('パスワード') as HTMLInputElement

    await userEvent.type(email, 'user@example.com')
    await userEvent.type(password, 'password123')

    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'user@example.com',
        password: 'password123',
        redirect: false,
      })
    })

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith('ログインに成功しました！')
      expect(pushMock).toHaveBeenCalledWith('/')
    })

    // フォームがリセットされていること（値が空）
    expect(email.value).toBe('')
    expect(password.value).toBe('')
  })

  it('ログイン失敗時にエラートーストが表示され、リダイレクトされない', async () => {
    signInMock.mockResolvedValue({ ok: false, status: 401, error: 'CredentialsSignin' })

    render(<SignInForm />)

    await userEvent.type(screen.getByLabelText('メールアドレス'), 'user@example.com')
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123')

    await userEvent.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalled()
      expect(toastErrorMock).toHaveBeenCalled()
      expect(pushMock).not.toHaveBeenCalled()
      expect(toastSuccessMock).not.toHaveBeenCalled()
    })
  })
})
