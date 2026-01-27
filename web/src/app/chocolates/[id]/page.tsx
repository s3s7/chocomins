import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getChocolateById } from '@/services/get-chocolate-by-id'
import { ChocolateContent } from './_components/chocolate-content'

type PageParams = {
  params: Promise<{ id: string }>
}

export default async function ChocolateDetailPage({ params }: PageParams) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const chocolate = await getChocolateById(id)
  if (!chocolate) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <ChocolateContent
        chocolate={chocolate}
        currentUserRole={session.user.role}
      />
    </div>
  )
}
