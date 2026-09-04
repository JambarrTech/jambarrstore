import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { json, error } from '@/lib/api'

const PAYMENT_MAP: Record<string, string> = {
  wave: 'Wave',
  orange: 'Orange_Money',
  cash: 'Paiement_a_la_livraison',
}

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = {}
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
    return error(e.message || 'Erreur serveur', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customerName, phone, city, payment, lines } = await req.json()

    if (!customerName || !phone || !city || !payment || !lines?.length) {
      return error('Champs requis manquants')
    }

    const paymentKey = PAYMENT_MAP[payment]
    if (!paymentKey) {
      return error('Méthode de paiement invalide')
    }

    const cityRecord = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "City" WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      city
    )

    if (!cityRecord?.length) {
      return error('Ville introuvable')
    }

    const result = await prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findFirst({
        where: { phone },
      })

      if (!customer) {
        customer = await tx.customer.create({
          data: { name: customerName, phone, city },
        })
      }

      let total = 0
      const orderLines: any[] = []

      for (const line of lines) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
        })

        if (!product) {
          throw new Error(`Produit ${line.productId} introuvable`)
        }

        if (product.stock < line.quantity) {
          throw new Error(`Stock insuffisant pour ${product.name}`)
        }

        total += product.price * line.quantity

        await tx.product.update({
          where: { id: line.productId },
          data: {
            stock: { decrement: line.quantity },
            sold: { increment: line.quantity },
          },
        })

        orderLines.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: line.quantity,
          image: product.image,
        })
      }

      const orderId = `JB-${Date.now().toString().slice(-4).padStart(4, '0')}`

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
