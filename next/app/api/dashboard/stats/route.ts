import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)

    const [totalOrders, totalCustomers, totalProducts, revenueResult, pendingOrders, lowStock] =
      await Promise.all([
        prisma.order.count(),
        prisma.customer.count(),
        prisma.product.count(),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: 'annulee' } },
        }),
        prisma.order.count({ where: { status: 'en_attente' } }),
        prisma.product.findMany({
          where: { stock: { lte: 5 } },
          select: { id: true, name: true, stock: true },
        }),
      ])

    return json({
      totalOrders,
      totalCustomers,
      totalProducts,
      revenue: revenueResult._sum.total || 0,
      pendingOrders,
      lowStock,
    })
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    if (e.message === 'Forbidden') return error('Accès interdit', 403)
    return error(e.message || 'Erreur serveur', 500)
  }
}
