import { z } from 'zod'

export const brandSchema = z.object({
  name: z.string().min(1, 'ブランド名は必須です'),
  country: z.string().min(1).optional(),
})

export type BrandInput = z.infer<typeof brandSchema>

export const editBrandSchema = brandSchema.extend({
  brandId: z.string().min(1, 'ブランドIDが必要です'),
})

export type EditBrandInput = z.infer<typeof editBrandSchema>

export const deleteBrandSchema = z.object({
  brandId: z.string().min(1, 'ブランドIDは必須です'),
})

export type DeleteBrandInput = z.infer<typeof deleteBrandSchema>
