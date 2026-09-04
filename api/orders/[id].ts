import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'GET') {
    const order = await prisma.order.findUnique({ where: { id: id as string }, include: { lines: true } });
    if (!order) return res.status(404).json({ error: 'Commande introuvable' });
    return res.json(order);
  }

  if (req.method === 'PATCH') {
    if (!requireAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Statut requis' });
    const order = await prisma.order.update({ where: { id: id as string }, data: { status } });
    return res.json(order);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
