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
    const { category, search, active } = req.query;
    const where: any = {};
    if (category && category !== 'all') where.categoryId = category as string;
    if (active !== undefined) where.active = active === 'true';
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { sold: 'desc' },
    });
    return res.json(products);
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req)) return res.status(403).json({ error: 'Accès refusé' });
    const { id, ...data } = req.body;
    if (!data.name?.trim() || !data.price || data.price <= 0) {
      return res.status(400).json({ error: 'Nom et prix requis' });
    }
    const product = id
      ? await prisma.product.update({ where: { id }, data })
      : await prisma.product.create({ data });
    return res.json(product);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
