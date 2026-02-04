import { Chocolate } from '@prisma/client'
import { ChocolateItem } from './chocolate-item'

type ChocolateForClient = Omit<Chocolate, 'cacaoPercent'> & {
  cacaoPercent: number | null
  brandName: string
  categoryName: string | null
}

type ChocolateListProps = {
  chocolates: ChocolateForClient[]
  currentUserRole: string
  currentUserId: string
}

export function ChocolateList({
  chocolates,
  currentUserRole,
  currentUserId,
}: ChocolateListProps) {
  if (chocolates.length === 0) {
    return <p className="text-gray-500">投稿がまだありません。</p>
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {chocolates.map((chocolate) => (
        <ChocolateItem
          key={chocolate.id}
          chocolate={chocolate}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
        />
      ))}
    </ul>
  )
}
