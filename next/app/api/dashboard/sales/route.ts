import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
    const sales = await prisma.$queryRawUnsafe<
      { date: string; total: number; count: number }[]
    >(
      `SELECT
         TO_CHAR("createdAt"::date, 'YYYY-MM-DD') AS date,
         SUM(total)::int AS total,
         COUNT(*)::int AS count
       FROM "Order"
       WHERE "createdAt" >= NOW() - INTERVAL '7 days'
         AND status != 'annulee'
       GROUP BY "createdAt"::date
       ORDER BY "createdAt"::date ASC`
    )

    return json(sales)
  } catch (e: any) {
    return error(e.message || 'Erreur serveur', 500)
  }
}
