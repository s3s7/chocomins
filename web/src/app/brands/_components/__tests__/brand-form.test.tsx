import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

import { BrandForm } from '../brand-form'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { createBrand } from '@/app/actions/brand/create'
import type { ActionResult } from '@/types'

jest.mock('next/navigation', () => {
  const push = jest.fn()
  const router = { push }
  return {
    useRouter: () => router,
  }
})

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/lib/error-messages', () => ({
  getErrorMessage: jest.fn(() => 'mock error'),
}))

jest.mock('@/app/actions/brand/create', () => ({
  createBrand: jest.fn(),
}))

const toastMock = toast as jest.Mocked<typeof toast>
const getErrorMessageMock = getErrorMessage as jest.MockedFunction<
  typeof getErrorMessage
>
const createBrandMock = createBrand as jest.MockedFunction<typeof createBrand>

type Deferred<T> = {
  promise: Promise<T>
  resolve: (value: T) => void
}

const createDeferred = <T,>(): Deferred<T> => {
  let resolver: (value: T) => void
  const promise = new Promise<T>((resolve) => {
    resolver = resolve
  })

  return {
    promise,
    resolve: resolver!,
  }
}

describe('ブランドフォーム', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    createBrandMock.mockResolvedValue({ isSuccess: true })
    getErrorMessageMock.mockReturnValue('mock error')
  })

  it('ブランド名と国名のフィールドが表示される', () => {
    render(<BrandForm />)

    expect(screen.getByLabelText('ブランド名')).toBeInTheDocument()
    expect(screen.getByLabelText('国名（任意）')).toBeInTheDocument()
  })

  it('ブランド名が空の場合はエラーを表示する', async () => {
    render(<BrandForm />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() =>
      expect(screen.getByText('ブランド名は必須です')).toBeVisible(),
    )
    expect(createBrandMock).not.toHaveBeenCalled()
  })

  it('入力値を用いて createBrand が呼び出される', async () => {
    render(<BrandForm />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('ブランド名'), 'Meiji')
    await user.type(screen.getByLabelText('国名（任意）'), 'Japan')
    await user.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() => expect(createBrandMock).toHaveBeenCalledTimes(1))
    const [, formData] = createBrandMock.mock.calls[0]
    expect((formData as FormData).get('name')).toBe('Meiji')
    expect((formData as FormData).get('country')).toBe('Japan')
  })

  it('任意の国名はクリア時に送信しない', async () => {
    render(<BrandForm />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('ブランド名'), 'Godiva')
    const countryInput = screen.getByLabelText('国名（任意）')
    await user.type(countryInput, 'Belgium')
    await user.clear(countryInput)
    await user.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() => expect(createBrandMock).toHaveBeenCalledTimes(1))
    const [, formData] = createBrandMock.mock.calls[0]
    expect((formData as FormData).get('name')).toBe('Godiva')
    expect((formData as FormData).get('country')).toBeNull()
  })

  it('送信中は送信ボタンを無効化する', async () => {
    const deferred = createDeferred<ActionResult>()
    createBrandMock.mockImplementation(() => deferred.promise)

    render(<BrandForm />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('ブランド名'), 'Nestle')
    await user.click(screen.getByRole('button', { name: '追加' }))

    const pendingButton = await screen.findByRole('button', {
      name: '追加中...',
    })
    expect(pendingButton).toBeDisabled()

    await act(async () => {
      deferred.resolve({ isSuccess: true })
    })
  })

  it('成功時に成功トーストを表示する', async () => {
    createBrandMock.mockResolvedValue({ isSuccess: true })

    render(<BrandForm />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('ブランド名'), 'Lindt')
    await user.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() =>
      expect(toastMock.success).toHaveBeenCalledWith(
        'ブランドを追加しました！',
      ),
    )
  })

  it('失敗時にエラートーストを表示する', async () => {
    createBrandMock.mockResolvedValue({
      isSuccess: false,
      errorCode: 'INVALID_INPUT',
    })
    getErrorMessageMock.mockReturnValue('custom error')

    render(<BrandForm />)

    const user = userEvent.setup()
    await user.type(screen.getByLabelText('ブランド名'), 'Bonnat')
    await user.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() =>
      expect(getErrorMessageMock).toHaveBeenCalledWith('INVALID_INPUT'),
    )
    expect(toastMock.error).toHaveBeenCalledWith('custom error')
  })
})
