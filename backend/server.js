const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET non défini dans .env');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Auth middleware
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token manquant' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  next();
}

function managerOrAdmin(req, res, next) {
  if (!['ADMIN', 'MANAGER'].includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' });
  next();
}

// ==================== HEALTH ====================
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', service: 'JambarrTech API', timestamp: new Date(), database: 'connected' });
  } catch {
    res.status(500).json({ status: 'ERROR', database: 'disconnected' });
  }
});

// ==================== AUTH ====================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Champs requis: name, email, phone, password' });
    }
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) return res.status(409).json({ error: 'Email ou téléphone déjà utilisé' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hash, role: role || 'CLIENT' },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et password requis' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== USERS ====================
app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/users/:id/role', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['CLIENT', 'ADMIN', 'MANAGER'].includes(role)) return res.status(400).json({ error: 'Rôle invalide' });
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== CATEGORIES ====================
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } } });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/categories', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Nom requis' });
    const category = await prisma.category.create({ data: { name, icon } });
    await logActivity(`Création catégorie: ${name}`, req.user.email, 'Catégories');
    res.status(201).json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/categories/:id', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { name, icon } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(icon && { icon }) }
    });
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/categories/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== PRODUCTS ====================
app.get('/api/products/featured', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      include: { category: true, _count: { select: { reviews: true } } }
    });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/products/flash', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isFlash: true },
      orderBy: { createdAt: 'desc' },
      include: { category: true, _count: { select: { reviews: true } } }
    });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { search, category, sort, featured, flash, limit, offset } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { reference: { contains: search } },
      ];
    }
    if (category) where.categoryId = category;
    if (featured === 'true') where.isFeatured = true;
    if (flash === 'true') where.isFlash = true;

    const orderBy = {};
    if (sort === 'price_asc') orderBy.price = 'asc';
    else if (sort === 'price_desc') orderBy.price = 'desc';
    else if (sort === 'name') orderBy.name = 'asc';
    else orderBy.createdAt = 'desc';

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined,
      include: { category: true, _count: { select: { reviews: true, orderItems: true } } }
    });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        reviews: { where: { status: 'approved' }, orderBy: { createdAt: 'desc' } },
        _count: { select: { reviews: true, orderItems: true } }
      }
    });
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/products', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { name, reference, price, oldPrice, stock, imageUrl, categoryId, isFeatured, isFlash, description } = req.body;
    if (!name || !reference || !price || !categoryId) {
      return res.status(400).json({ error: 'Champs requis: name, reference, price, categoryId' });
    }
    const product = await prisma.product.create({
      data: { name, reference, price, oldPrice, stock: stock || 0, imageUrl: imageUrl || '', categoryId, isFeatured: isFeatured || false, isFlash: isFlash || false, description }
    });
    await logActivity(`Ajout produit: ${name}`, req.user.email, 'Produits');
    res.status(201).json(product);
  } catch (e) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Référence déjà utilisée' });
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/products/:id', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { name, reference, price, oldPrice, stock, imageUrl, categoryId, isFeatured, isFlash, description } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(reference && { reference }),
        ...(price && { price }),
        ...(oldPrice !== undefined && { oldPrice }),
        ...(stock !== undefined && { stock }),
        ...(imageUrl && { imageUrl }),
        ...(categoryId && { categoryId }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isFlash !== undefined && { isFlash }),
        ...(description !== undefined && { description }),
      }
    });
    await logActivity(`Mise à jour produit: ${product.name}`, req.user.email, 'Produits');
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/products/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const product = await prisma.product.delete({ where: { id: req.params.id } });
    await logActivity(`Suppression produit: ${product.name}`, req.user.email, 'Produits');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== ORDERS ====================
app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } } }
    });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { clientName, clientPhone, clientAddress, items, paymentMethod } = req.body;
    if (!clientName || !clientPhone || !items || !items.length || !paymentMethod) {
      return res.status(400).json({ error: 'Champs requis: clientName, clientPhone, items, paymentMethod' });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ error: `Produit ${item.productId} non trouvé` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` });
      totalAmount += product.price * item.quantity;
      orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }

    const reference = 'CMD-' + Math.floor(1000 + Math.random() * 9000);

    const order = await prisma.order.create({
      data: {
        reference,
        clientName,
        clientPhone: clientPhone || null,
        clientAddress: clientAddress || null,
        totalAmount,
        paymentMethod,
        status: 'PENDING',
        items: { create: orderItems }
      },
      include: { items: { include: { product: true } } }
    });

    // Create payment transaction
    await prisma.paymentTransaction.create({
      data: {
        reference: 'TX-' + Math.floor(10000 + Math.random() * 90000),
        orderId: order.id,
        clientName,
        amount: totalAmount,
        method: paymentMethod,
        status: 'Réussi'
      }
    });

    // Update stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    await logActivity(`Nouvelle commande ${reference}`, clientName, 'Commandes');
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/orders/:id/status', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: `Statut invalide. Valides: ${validStatuses.join(', ')}` });
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true }
    });
    await logActivity(`Mise à jour commande ${order.reference} → ${status}`, req.user.email, 'Commandes');
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/orders/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const order = await prisma.order.delete({ where: { id: req.params.id } });
    await logActivity(`Suppression commande ${order.reference}`, req.user.email, 'Commandes');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== PAYMENTS ====================
app.get('/api/payments', authMiddleware, async (req, res) => {
  try {
    const { method } = req.query;
    const where = {};
    if (method) where.method = method;
    const payments = await prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== REVIEWS ====================
app.get('/api/reviews', async (req, res) => {
  try {
    const { status, productId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (productId) where.productId = productId;
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true } } }
    });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { productId, clientName, rating, comment } = req.body;
    if (!clientName || !comment) return res.status(400).json({ error: 'Champs requis: clientName, comment' });
    if (rating && (rating < 1 || rating > 5)) return res.status(400).json({ error: 'Rating doit être entre 1 et 5' });
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
    }
    const review = await prisma.review.create({
      data: {
        productId: productId || null,
        clientName: clientName.trim().slice(0, 100),
        rating: Math.min(5, Math.max(1, rating || 5)),
        comment: comment.trim().slice(0, 1000),
        status: 'pending'
      }
    });
    res.status(201).json(review);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/reviews/:id/approve', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: 'approved' }
    });
    await logActivity(`Approbation avis (${review.clientName})`, req.user.email, 'Avis');
    res.json(review);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/reviews/:id/reject', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status: 'rejected' }
    });
    res.json(review);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/reviews/:id', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const review = await prisma.review.delete({ where: { id: req.params.id } });
    await logActivity(`Suppression avis (${review.clientName})`, req.user.email, 'Avis');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== PROMOTIONS ====================
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(promotions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/promotions', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { title, discountPercent, targetCategory, startDate, endDate } = req.body;
    if (!title || !discountPercent || !targetCategory) {
      return res.status(400).json({ error: 'Champs requis: title, discountPercent, targetCategory' });
    }
    const promo = await prisma.promotion.create({
      data: { title, discountPercent, targetCategory, startDate, endDate }
    });
    await logActivity(`Création promotion: ${title}`, req.user.email, 'Promotions');
    res.status(201).json(promo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/promotions/:id', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { title, discountPercent, targetCategory, startDate, endDate, isActive } = req.body;
    const promo = await prisma.promotion.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(discountPercent && { discountPercent }),
        ...(targetCategory && { targetCategory }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(isActive !== undefined && { isActive }),
      }
    });
    res.json(promo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/promotions/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== STATS ====================
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const [ordersCount, customersCount, productsCount, revenueResult, paymentsCount] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.product.count(),
      prisma.paymentTransaction.aggregate({ _sum: { amount: true }, where: { status: 'Réussi' } }),
      prisma.paymentTransaction.count(),
    ]);

    const totalRevenue = revenueResult._sum.amount || 0;
    const averageBasket = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, reference: true, clientName: true, totalAmount: true, status: true, paymentMethod: true, createdAt: true }
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, stock: true }
    });

    res.json({
      totalRevenue,
      ordersCount,
      customersCount,
      productsCount,
      paymentsCount,
      averageBasket,
      recentOrders,
      lowStockProducts
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== ACTIVITY LOGS ====================
app.get('/api/activity-logs', authMiddleware, async (req, res) => {
  try {
    const { module: mod } = req.query;
    const where = {};
    if (mod) where.module = mod;
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== SETTINGS ====================
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/settings', authMiddleware, adminOnly, async (req, res) => {
  try {
    let settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
    settings = await prisma.storeSettings.update({
      where: { id: settings.id },
      data: {
        ...(req.body.storeName && { storeName: req.body.storeName }),
        ...(req.body.storeEmail && { storeEmail: req.body.storeEmail }),
        ...(req.body.phone && { phone: req.body.phone }),
        ...(req.body.address && { address: req.body.address }),
        ...(req.body.logoUrl !== undefined && { logoUrl: req.body.logoUrl }),
        ...(req.body.commissionRate !== undefined && { commissionRate: req.body.commissionRate }),
        ...(req.body.minCommission !== undefined && { minCommission: req.body.minCommission }),
      }
    });
    await logActivity('Mise à jour paramètres', req.user.email, 'Paramètres');
    res.json(settings);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== HELPERS ====================
async function logActivity(action, user, module) {
  try {
    await prisma.activityLog.create({
      data: { action, user, module, result: 'SUCCÈS' }
    });
  } catch (e) {
    console.error('Activity log error:', e.message);
  }
}

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`JambarrTech Backend API running on http://localhost:${PORT}`);
});
