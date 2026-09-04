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
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'PUT') {
    if (!requireAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const product = await prisma.product.update({ where: { id: id as string }, data: req.body });
    return res.json(product);
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    await prisma.orderLine.deleteMany({ where: { productId: id as string } });
    await prisma.product.delete({ where: { id: id as string } });
    return res.json({ success: true });
  }

  if (req.method === 'PATCH') {
    if (!requireAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const product = await prisma.product.findUnique({ where: { id: id as string } });
    if (!product) return res.status(404).json({ error: 'Produit introuvable' });
    const updated = await prisma.product.update({ where: { id: id as string }, data: { active: !product.active } });
    return res.json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
