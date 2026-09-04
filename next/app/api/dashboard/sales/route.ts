import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { json, error } from '@/lib/api'

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)

    const rows = await prisma.$queryRawUnsafe<
      { date: string; value: number }[]
    >(
      `SELECT
         TO_CHAR("createdAt"::date, 'YYYY-MM-DD') AS date,
         SUM(total)::int AS value
       FROM "Order"
       WHERE "createdAt" >= NOW() - INTERVAL '7 days'
         AND status != 'annulee'
       GROUP BY "createdAt"::date
       ORDER BY "createdAt"::date ASC`
    )

    const sales = rows.map((row) => {
      const d = new Date(row.date + 'T00:00:00')
      return {
        day: DAY_NAMES[d.getDay()],
        value: row.value,
      }
    })

    return json(sales)
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    if (e.message === 'Forbidden') return error('Accès interdit', 403)
    return error(e.message || 'Erreur serveur', 500)
  }
}
