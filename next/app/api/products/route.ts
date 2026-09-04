import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const active = searchParams.get('active')
    const ids = searchParams.get('ids')

    const where: any = {}

    if (ids) {
      where.id = { in: ids.split(',') }
    }

    if (category) {
      where.categoryId = category
    }

    if (active !== null && active !== undefined && active !== '') {
      where.active = active === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    return json(products)
  } catch (e: any) {
    return error(e.message || 'Erreur serveur', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)

    const body = await req.json()
    const { id, name, categoryId, price, oldPrice, image, stock, rating, reviews, sold, seller, description, active } = body

    if (!name || !categoryId || !price || !image || !seller || !description) {
      return error('Champs requis manquants')
    }

    if (id) {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          name,
          categoryId,
          price,
          oldPrice: oldPrice || null,
          image,
          stock: stock ?? 0,
          rating: rating ?? 0,
          reviews: reviews ?? 0,
          sold: sold ?? 0,
          seller,
          description,
          active: active ?? true,
        },
        include: { category: true },
      })
      return json(updated)
    }

    const created = await prisma.product.create({
      data: {
        name,
        categoryId,
        price,
        oldPrice: oldPrice || null,
        image,
        stock: stock ?? 0,
        rating: rating ?? 0,
        reviews: reviews ?? 0,
        sold: sold ?? 0,
        seller,
        description,
        active: active ?? true,
      },
      include: { category: true },
    })

    return json(created, 201)
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    if (e.message === 'Forbidden') return error('Accès interdit', 403)
    return error(e.message || 'Erreur serveur', 500)
  }
}
