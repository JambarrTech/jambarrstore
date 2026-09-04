import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
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
        prisma.product.count({ where: { stock: { lte: 5 } } }),
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
    return error(e.message || 'Erreur serveur', 500)
  }
}
