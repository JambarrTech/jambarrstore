import { prisma } from '../lib/prisma';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const totalOrders = await prisma.order.count();
  const totalCustomers = await prisma.customer.count();
  const totalProducts = await prisma.product.count();
  const revenue = await prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'annulee' } } });
  const pendingOrders = await prisma.order.count({ where: { status: 'en_attente' } });
  const lowStock = await prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: 'asc' } });

  res.json({ totalOrders, totalCustomers, totalProducts, revenue: revenue._sum.total || 0, pendingOrders, lowStock });
}
