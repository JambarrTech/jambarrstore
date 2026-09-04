import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'jambarr-jwt-secret-2024';

function requireAdmin(req: VercelRequest): boolean {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return false;
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { role: string };
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { status } = req.query;
    const where: any = {};
    if (status && status !== 'all') where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  }

  if (req.method === 'POST') {
    const { customerId, customerName, city, payment, lines } = req.body;
    if (!city) return res.status(400).json({ error: 'Ville requise' });
    if (!lines?.length) return res.status(400).json({ error: 'Panier vide' });

    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      const guest = await prisma.customer.create({ data: { name: customerName || 'Client', phone: 'N/A', city } });
      resolvedCustomerId = guest.id;
    }

    const productIds = lines.map((l: any) => l.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    const orderLinesData: any[] = [];
    let total = 0;
    for (const line of lines) {
      const product = productMap.get(line.productId);
      if (!product) return res.status(400).json({ error: `Produit ${line.productId} introuvable` });
      if (product.stock < line.quantity) {
        return res.status(400).json({ error: `Stock insuffisant pour "${product.name}"` });
      }
      total += product.price * line.quantity;
      orderLinesData.push({ productId: product.id, name: product.name, price: product.price, quantity: line.quantity, image: product.image });
    }

    const paymentMap: Record<string, string> = { wave: 'Wave', orange: 'Orange_Money', cash: 'Paiement_a_la_livraison' };

    const order = await prisma.$transaction(async (tx) => {
      for (const line of orderLinesData) {
        await tx.product.update({ where: { id: line.productId }, data: { stock: { decrement: line.quantity } } });
      }
      const count = await tx.order.count();
      return tx.order.create({
        data: {
          id: `JB-${String(2420 + count).padStart(4, '0')}`,
          customerId: resolvedCustomerId, customerName: customerName || 'Client',
          city, payment: (paymentMap[payment] || 'Wave') as any, total,
          lines: { create: orderLinesData },
        },
        include: { lines: true },
      });
    });
    return res.json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
