import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { json, error } from '@/lib/api'

const VALID_STATUSES = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee']

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(req)
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { lines: true },
    })

    if (!order) {
      return error('Commande introuvable', 404)
    }

    if (user.role === 'client' && order.customerId !== user.userId) {
      return error('Accès interdit', 403)
    }

    return json(order)
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    return error(e.message || 'Erreur serveur', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req)
    const { id } = await params
    const { status } = await req.json()

    if (!status) {
      return error('Statut requis')
    }

    if (!VALID_STATUSES.includes(status)) {
      return error('Statut invalide')
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { lines: true },
    })

    return json(order)
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    if (e.message === 'Forbidden') return error('Accès interdit', 403)
    return error(e.message || 'Erreur serveur', 500)
  }
}
