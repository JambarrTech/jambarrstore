import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { json, error } from '@/lib/api'

const PAYMENT_MAP: Record<string, string> = {
  wave: 'Wave',
  orange: 'Orange_Money',
  orange_money: 'Orange_Money',
  cash: 'Paiement_a_la_livraison',
  'Paiement à la livraison': 'Paiement_a_la_livraison',
  'Paiement_a_la_livraison': 'Paiement_a_la_livraison',
  Wave: 'Wave',
  Orange_Money: 'Orange_Money',
  'Orange Money': 'Orange_Money',
}

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
    const user = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}

    if (user.role === 'client') {
      where.customerId = user.userId
    }

    if (status) {
      where.status = status
    }

    const orders = await prisma.order.findMany({
      where,
      include: { lines: true, customer: true },
      orderBy: { createdAt: 'desc' },
    })

    return json(orders)
  } catch (e: any) {
    if (e.message === 'Unauthorized') return error('Non autorisé', 401)
    return error(e.message || 'Erreur serveur', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerName, phone, city, payment, items } = await req.json()

    if (!city) {
      return error('Ville requise')
    }

    if (!items?.length) {
      return error('Panier vide')
    }

    const paymentKey = PAYMENT_MAP[payment]
    if (!paymentKey) {
      return error('Méthode de paiement invalide')
    }

    const productIds = items.map((item: { productId: string }) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const productMap = new Map(products.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return error(`Produit ${item.productId} introuvable`)
      }
      if (product.stock < item.quantity) {
        return error(`Stock insuffisant pour ${product.name}`)
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      let customer = phone
        ? await tx.customer.findFirst({ where: { phone } })
        : null

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: customerName || 'Client',
            phone: phone || 'N/A',
            city,
          },
        })
      }

      let total = 0
      const orderLines: any[] = []

      for (const item of items) {
        const product = productMap.get(item.productId)!

        total += product.price * item.quantity

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            sold: { increment: item.quantity },
          },
        })

        orderLines.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          image: product.image,
        })
      }

      const count = await tx.order.count()
      const orderId = `JB-${String(2420 + count).padStart(4, '0')}`

      const order = await tx.order.create({
        data: {
          id: orderId,
          customerId: customer.id,
          customerName: customer.name,
          city,
          payment: paymentKey as any,
          total,
          lines: {
            create: orderLines,
          },
        },
        include: { lines: true },
      })

      await tx.customer.update({
        where: { id: customer.id },
        data: {
          orders: { increment: 1 },
          spent: { increment: total },
        },
      })

      return order
    })

    return json(result, 201)
  } catch (e: any) {
    return error(e.message || 'Erreur serveur', 500)
  }
}
