import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// --- Types ---
interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// --- Error handler ---
function handleErrors(fn: (req: Request, res: Response) => Promise<any>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (err: any) {
      console.error('[API Error]', err.message);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Ressource introuvable' });
      }
      res.status(500).json({ error: 'Erreur serveur' });
    }
  };
}

// --- Auth middleware ---
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acces reserve aux administrateurs' });
  }
  next();
}

// --- Auth routes ---
app.post('/api/auth/register', handleErrors(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caracteres' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    return res.status(409).json({ error: 'Cet email est deja utilise' });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hash,
      phone: phone?.trim() || null,
      role: 'client',
    },
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, createdAt: user.createdAt.toISOString() },
  });
}));

app.post('/api/auth/login', handleErrors(async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, createdAt: user.createdAt.toISOString() },
  });
}));

app.get('/api/auth/me', requireAuth, handleErrors(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json({ ...user, createdAt: user.createdAt.toISOString() });
}));

// --- Categories ---
app.get('/api/categories', handleErrors(async (_req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
}));

// --- Products ---
app.get('/api/products', handleErrors(async (req, res) => {
  const { category, search, active, ids } = req.query;

  const where: Prisma.ProductWhereInput = {};
  if (ids) where.id = { in: (ids as string).split(',') };
  if (category && category !== 'all') where.categoryId = category as string;
  if (active !== undefined) where.active = active === 'true';
  if (search) where.OR = [
    { name: { contains: search as string, mode: 'insensitive' } },
    { description: { contains: search as string, mode: 'insensitive' } },
  ];

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
}));

app.get('/api/products/:id', handleErrors(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(product);
}));

app.post('/api/products', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  const { id, ...data } = req.body;
  if (!data.name?.trim() || !data.price || data.price <= 0) {
    return res.status(400).json({ error: 'Nom et prix requis' });
  }
  const product = id
    ? await prisma.product.update({ where: { id }, data, include: { category: true } })
    : await prisma.product.create({ data, include: { category: true } });
  res.json(product);
}));

app.put('/api/products/:id', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
    include: { category: true },
  });
  res.json(product);
}));

app.delete('/api/products/:id', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  await prisma.orderLine.deleteMany({ where: { productId: req.params.id } });
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

app.patch('/api/products/:id', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { active: !product.active },
    include: { category: true },
  });
  res.json(updated);
}));

// --- Orders ---
app.get('/api/orders', requireAuth, handleErrors(async (req, res) => {
  const { status } = req.query;
  const where: Prisma.OrderWhereInput = {};
  if (status && status !== 'all') where.status = status as any;
  if (req.user?.role === 'client') where.customerId = req.user.userId;

  const orders = await prisma.order.findMany({
    where,
    include: { lines: true, customer: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
}));

app.get('/api/orders/:id', requireAuth, handleErrors(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { lines: true },
  });
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  if (req.user?.role === 'client' && order.customerId !== req.user.userId) {
    return res.status(403).json({ error: 'Acces interdit' });
  }
  res.json(order);
}));

app.patch('/api/orders/:id', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Statut requis' });
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
    include: { lines: true },
  });
  res.json(order);
}));

const paymentMap: Record<string, string> = {
  wave: 'Wave',
  orange: 'Orange_Money',
  orange_money: 'Orange_Money',
  cash: 'Paiement_a_la_livraison',
  'Paiement a la livraison': 'Paiement_a_la_livraison',
  'Paiement_a_la_livraison': 'Paiement_a_la_livraison',
  Wave: 'Wave',
  Orange_Money: 'Orange_Money',
  'Orange Money': 'Orange_Money',
};

// --- Checkout ---
app.post('/api/orders', handleErrors(async (req, res) => {
  const { customerName, phone, city, payment, items, userId } = req.body;

  if (!city) return res.status(400).json({ error: 'Ville requise' });
  if (!items || items.length === 0) return res.status(400).json({ error: 'Panier vide' });

  const paymentKey = paymentMap[payment];
  if (!paymentKey) return res.status(400).json({ error: 'Methode de paiement invalide' });

  const productIds = items.map((item: any) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map(p => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) return res.status(400).json({ error: `Produit ${item.productId} introuvable` });
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` });
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    let customer = phone
      ? await tx.customer.findFirst({ where: { phone } })
      : null;

    if (!customer) {
      customer = await tx.customer.create({
        data: { name: customerName || 'Client', phone: phone || 'N/A', city },
      });
    }

    let total = 0;
    const orderLines: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      total += product.price * item.quantity;

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } },
      });

      orderLines.push({
        productId: product.id, name: product.name, price: product.price,
        quantity: item.quantity, image: product.image,
      });
    }

    const count = await tx.order.count();
    const orderId = `JB-${String(2420 + count).padStart(4, '0')}`;

    const order = await tx.order.create({
      data: {
        id: orderId, customerId: userId || customer.id, customerName: customer.name,
        city, payment: paymentKey as any, total,
        lines: { create: orderLines },
      },
      include: { lines: true },
    });

    await tx.customer.update({
      where: { id: customer.id },
      data: { orders: { increment: 1 }, spent: { increment: total } },
    });

    return order;
  });

  res.json(result);
}));

// --- Customers ---
app.get('/api/customers', requireAuth, requireAdmin, handleErrors(async (_req, res) => {
  const customers = await prisma.customer.findMany({ orderBy: { spent: 'desc' } });
  res.json(customers);
}));

app.get('/api/customers/:id', handleErrors(async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) return res.status(404).json({ error: 'Client introuvable' });
  res.json(customer);
}));

// --- Dashboard ---
app.get('/api/dashboard/stats', requireAuth, requireAdmin, handleErrors(async (_req, res) => {
  const [totalOrders, totalCustomers, totalProducts, revenueResult, pendingOrders, lowStock] =
    await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'annulee' } } }),
      prisma.order.count({ where: { status: 'en_attente' } }),
      prisma.product.findMany({ where: { stock: { lte: 5 } }, select: { id: true, name: true, stock: true } }),
    ]);

  res.json({
    totalOrders, totalCustomers, totalProducts,
    revenue: revenueResult._sum.total || 0,
    pendingOrders, lowStock,
  });
}));

app.get('/api/dashboard/sales', requireAuth, requireAdmin, handleErrors(async (_req, res) => {
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
}));

// --- Health check ---
app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });

// --- Start ---
app.listen(PORT, () => {
  console.log(API server running on http://localhost:);
});

process.on('beforeExit', () => prisma.());