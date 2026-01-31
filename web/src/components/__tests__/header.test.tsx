import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '../header'

// Mocks
const pushMock = jest.fn()
const signOutMock = jest.fn()
const toastSuccessMock = jest.fn<void, [string]>()
const toastErrorMock = jest.fn<void, [string]>()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const useSessionMock = jest.fn()
jest.mock('next-auth/react', () => ({
  useSession: (...args: unknown[]) => useSessionMock(...args),
  signOut: (...args: unknown[]) => signOutMock(...args),
}))

jest.mock('sonner', () => ({
  toast: {
    success: (...args: [string]) => toastSuccessMock(...args),
    error: (...args: [string]) => toastErrorMock(...args),
  },
}))

describe('Header - Logout', () => {
  const originalConfirm = window.confirm
  const openMenu = async (menuLabel: string) => {
    const menuTrigger = screen.getByRole('menuitem', { name: menuLabel })
    await userEvent.click(menuTrigger)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // 認証済みセッション
    useSessionMock.mockReturnValue({
      data: {
        user: {
          id: 'user_1',
          name: 'Alice',
          email: 'alice@example.com',
          role: 'ADMIN',
        },
      },
      status: 'authenticated',
    })
  })

  afterEach(() => {
    window.confirm = originalConfirm
  })

  it('確認ダイアログがOKの場合、signOutとリダイレクトと成功トーストが呼ばれる', async () => {
    window.confirm = jest.fn(() => true)
    signOutMock.mockResolvedValue(undefined)

    render(<Header />)

    await openMenu('その他')
    const logoutMenuItem = await screen.findByRole('menuitem', {
      name: 'ログアウト',
    })
    await userEvent.click(logoutMenuItem)

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalledWith({ redirect: false })
      expect(toastSuccessMock).toHaveBeenCalledWith('ログアウトしました')
      expect(pushMock).toHaveBeenCalledWith('/')
    })
  })

  it('確認ダイアログがキャンセルの場合、signOutが呼ばれない', async () => {
    window.confirm = jest.fn(() => false)

    render(<Header />)

    await openMenu('その他')
    const logoutMenuItem = await screen.findByRole('menuitem', {
      name: 'ログアウト',
    })
    await userEvent.click(logoutMenuItem)

    await waitFor(() => {
      expect(signOutMock).not.toHaveBeenCalled()
      expect(toastSuccessMock).not.toHaveBeenCalled()
      expect(pushMock).not.toHaveBeenCalled()
    })
  })

  it('未ログイン時はログアウトボタンが表示されない', () => {
    useSessionMock.mockReturnValueOnce({
      data: null,
      status: 'unauthenticated',
    })

    render(<Header />)

    expect(screen.queryByRole('menuitem', { name: 'ログアウト' })).toBeNull()

    await openMenu('ログイン / 新規登録')
    expect(
      await screen.findByRole('menuitem', { name: 'ログイン' }),
    ).toBeInTheDocument()
  })
})
