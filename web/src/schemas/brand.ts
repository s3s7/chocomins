import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string().min(1, 'メーカー・店舗名は必須です'),
  country: z.string().min(1).optional(),
  imagePath: z.string().optional(),
})

export type BrandInput = z.infer<typeof brandSchema>

export const editBrandSchema = brandSchema.extend({
  brandId: z.string().min(1, 'メーカー・店舗IDが必要です'),
})

export type EditBrandInput = z.infer<typeof editBrandSchema>

export const deleteBrandSchema = z.object({
  brandId: z.string().min(1, 'メーカー・店舗IDは必須です'),
})

export type DeleteBrandInput = z.infer<typeof deleteBrandSchema>
