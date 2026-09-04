import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { spent: 'desc' },
    })

    return json(customers)
  } catch (e: any) {
    return error(e.message || 'Erreur serveur', 500)
  }
}
