import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jambarr-jwt-secret-2024';
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Types ────────────────────────────────────────────────
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

// ─── Error handler ────────────────────────────────────────
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

// ─── Auth middleware ───────────────────────────────────────
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
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
}

// ─── Auth routes ──────────────────────────────────────────
app.post('/api/auth/register', handleErrors(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (existing) {
    return res.status(409).json({ error: 'Cet email est déjà utilisé' });
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

// ─── Categories ───────────────────────────────────────────
app.get('/api/categories', handleErrors(async (_req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
}));

// ─── Products ─────────────────────────────────────────────
app.get('/api/products', handleErrors(async (req, res) => {
  const { category, search, active } = req.query;

  const where: Prisma.ProductWhereInput = {};
  if (category && category !== 'all') where.categoryId = category as string;
  if (active !== undefined) where.active = active === 'true';
  if (search) where.name = { contains: search as string, mode: 'insensitive' };

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { sold: 'desc' },
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
    ? await prisma.product.update({ where: { id }, data })
    : await prisma.product.create({ data });
  res.json(product);
}));

app.put('/api/products/:id', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(product);
}));

app.delete('/api/products/:id', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  await prisma.orderLine.deleteMany({ where: { productId: req.params.id } });
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true });
}));

app.patch('/api/products/:id/toggle', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  const updated = await prisma.product.update({
    where: { id: req.params.id },
    data: { active: !product.active },
  });
  res.json(updated);
}));

// ─── Orders ───────────────────────────────────────────────
app.get('/api/orders', handleErrors(async (req, res) => {
  const { status } = req.query;
  const where: Prisma.OrderWhereInput = {};
  if (status && status !== 'all') where.status = status as any;

  const orders = await prisma.order.findMany({
    where,
    include: { lines: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
}));

app.get('/api/orders/:id', handleErrors(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { lines: true },
  });
  if (!order) return res.status(404).json({ error: 'Commande introuvable' });
  res.json(order);
}));

app.patch('/api/orders/:id/status', requireAuth, requireAdmin, handleErrors(async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Statut requis' });
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(order);
}));

const paymentMap: Record<string, string> = {
  wave: 'Wave',
  orange: 'Orange_Money',
  cash: 'Paiement_a_la_livraison',
};

// ─── Checkout (transactionnel) ────────────────────────────
app.post('/api/checkout', handleErrors(async (req, res) => {
  const { customerId, customerName, city, payment, lines } = req.body;

  if (!city) return res.status(400).json({ error: 'Ville requise' });
  if (!lines || lines.length === 0) {
    return res.status(400).json({ error: 'Panier vide' });
  }

  let resolvedCustomerId = customerId;
  if (!resolvedCustomerId) {
    const guest = await prisma.customer.create({
      data: { name: customerName || 'Client', phone: 'N/A', city },
    });
    resolvedCustomerId = guest.id;
  }

  const productIds = lines.map((l: any) => l.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map(p => [p.id, p]));

  const orderLinesData: { productId: string; name: string; price: number; quantity: number; image: string }[] = [];
  let total = 0;

  for (const line of lines) {
    const product = productMap.get(line.productId);
    if (!product) return res.status(400).json({ error: `Produit ${line.productId} introuvable` });
    if (product.stock < line.quantity) {
      return res.status(400).json({ error: `Stock insuffisant pour "${product.name}" (disponible: ${product.stock})` });
    }
    total += product.price * line.quantity;
    orderLinesData.push({ productId: product.id, name: product.name, price: product.price, quantity: line.quantity, image: product.image });
  }

  const order = await prisma.$transaction(async (tx) => {
    for (const line of orderLinesData) {
      await tx.product.update({ where: { id: line.productId }, data: { stock: { decrement: line.quantity } } });
    }
    const count = await tx.order.count();
    const orderId = `JB-${String(2420 + count).padStart(4, '0')}`;
    return tx.order.create({
      data: {
        id: orderId, customerId: resolvedCustomerId, customerName: customerName || 'Client',
        city, payment: (paymentMap[payment] || 'Wave') as any, total,
        lines: { create: orderLinesData },
      },
      include: { lines: true },
    });
  });

  res.json(order);
}));

// ─── Customers ────────────────────────────────────────────
app.get('/api/customers', handleErrors(async (_req, res) => {
  const customers = await prisma.customer.findMany({ orderBy: { spent: 'desc' } });
  res.json(customers);
}));

app.get('/api/customers/:id', handleErrors(async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) return res.status(404).json({ error: 'Client introuvable' });
  res.json(customer);
}));

// ─── Dashboard Stats ──────────────────────────────────────
app.get('/api/dashboard/stats', handleErrors(async (_req, res) => {
  const totalOrders = await prisma.order.count();
  const totalCustomers = await prisma.customer.count();
  const totalProducts = await prisma.product.count();
  const revenue = await prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'annulee' } } });
  const pendingOrders = await prisma.order.count({ where: { status: 'en_attente' } });
  const lowStock = await prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: 'asc' } });
  res.json({ totalOrders, totalCustomers, totalProducts, revenue: revenue._sum.total || 0, pendingOrders, lowStock });
}));

app.get('/api/dashboard/sales', handleErrors(async (_req, res) => {
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

// ─── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

process.on('beforeExit', () => prisma.$disconnect());
