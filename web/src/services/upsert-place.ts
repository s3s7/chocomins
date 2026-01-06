import { prisma } from '@/lib/prisma'

type UpsertPlaceInput = {
  googlePlaceId: string
  name: string
  address?: string
  lat?: number
  lng?: number
}

export async function upsertPlace({
  googlePlaceId,
  name,
  address,
  lat,
  lng,
}: UpsertPlaceInput) {
  return prisma.place.upsert({
    where: { googlePlaceId },
    update: {
      name,
      address,
      lat: typeof lat === 'number' ? lat : undefined,
      lng: typeof lng === 'number' ? lng : undefined,
    },
    create: {
      googlePlaceId,
      name,
      address,
      lat: typeof lat === 'number' ? lat : undefined,
      lng: typeof lng === 'number' ? lng : undefined,
    },
  })
}
