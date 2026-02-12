import { Brand } from '@prisma/client'
import { BrandItem } from './brand-item'

type BrandListProps = {
  brands: Brand[]
  currentUserRole: string
}

export function BrandList({
  brands,
  currentUserRole,
}: BrandListProps) {
  if (brands.length === 0) {
    return <p className="text-gray-500">メーカー・店舗はまだありません。</p>
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {brands.map((brand) => (
        <BrandItem
          key={brand.id}
          brand={brand}
          currentUserRole={currentUserRole}
        />
      ))}
    </ul>
  )
}
