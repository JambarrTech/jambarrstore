import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!product) {
      return error('Produit introuvable', 404)
    }

    return json(product)
  } catch (e: any) {
    return error(e.message || 'Erreur serveur', 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req)
    const { id } = await params
    const body = await req.json()

    const allowedFields = ['name', 'price', 'oldPrice', 'image', 'stock', 'rating', 'reviews', 'sold', 'seller', 'description', 'active', 'categoryId']
    const data: any = {}
    for (const key of allowedFields) {
      if (key in body) {
        data[key] = body[key]
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    })

    return json(updated)
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    if (e.message === 'Forbidden') return error('Accès interdit', 403)
    return error(e.message || 'Erreur serveur', 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req)
    const { id } = await params

    await prisma.orderLine.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })

    return json({ success: true })
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    if (e.message === 'Forbidden') return error('Accès interdit', 403)
    return error(e.message || 'Erreur serveur', 500)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req)
    const { id } = await params

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return error('Produit introuvable', 404)
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { active: !product.active },
      include: { category: true },
    })

    return json(updated)
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    if (e.message === 'Forbidden') return error('Accès interdit', 403)
    return error(e.message || 'Erreur serveur', 500)
  }
}
