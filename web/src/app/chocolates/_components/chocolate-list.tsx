import { Chocolate } from '@prisma/client'
import { ChocolateItem } from './chocolate-item'

type ChocolateListProps = {
  chocolates: Chocolate[]
  currentUserRole: string
}

export function ChocolateList({
  chocolates,
  currentUserRole,
}: ChocolateListProps) {
  if (chocolates.length === 0) {
    return <p className="text-gray-500">投稿がまだありません。</p>
  }

  return (
    <ul className="space-y-4">
      {chocolates.map((chocolate) => (
        <ChocolateItem
          key={chocolate.id}
          chocolate={chocolate}
          currentUserRole={currentUserRole}
        />
      ))}
    </ul>
  )
}
