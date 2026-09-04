import { prisma } from '../lib/prisma';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: weekAgo }, status: { not: 'annulee' } },
    select: { createdAt: true, total: true },
  });

  const salesByDay = days.map(day => ({ day, value: 0 }));
  orders.forEach(order => { salesByDay[new Date(order.createdAt).getDay()].value += order.total; });
  res.json([...salesByDay.slice(1), salesByDay[0]]);
}
