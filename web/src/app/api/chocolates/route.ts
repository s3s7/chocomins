import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const chocolates = await prisma.chocolate.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ chocolates })
  } catch (error) {
    console.error('Failed to fetch chocolates', error)
    return NextResponse.json({ error: 'Failed to fetch chocolates' }, { status: 500 })
  }
}
