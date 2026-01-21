import { Brand } from '@prisma/client'
import { BrandItem } from './brand-item'

type BrandListProps = {
  brands: Brand[]
  currentUserRole: string
}

export function BrandList({ brands, currentUserRole }: BrandListProps) {
  if (brands.length === 0) {
    return <p className="text-gray-500">メーカー・店舗はまだありません。</p>
  }

  return (
    <ul className="space-y-4">
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
