const cors = require('./lib/cors');
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validate, registerSchema, loginSchema, productSchema, orderSchema, reviewSchema, promotionSchema, settingsSchema } = require('./lib/validations');
const { authMiddleware, requireAuth, requireAdmin, requireManagerOrAdmin, logActivity } = require('./lib/middleware');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET non défini');
}

// Simple in-memory rate limiter
const rateLimit = {};
function checkRateLimit(ip, maxRequests = 60, windowMs = 60000) {
  const now = Date.now();
  if (!rateLimit[ip]) rateLimit[ip] = [];
  rateLimit[ip] = rateLimit[ip].filter(t => now - t < windowMs);
  if (rateLimit[ip].length >= maxRequests) return false;
  rateLimit[ip].push(now);
  return true;
}

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
}

function parsePath(url) {
  return url.pathname.replace(/^\/api/, '');
}

function json(res, status, data) {
  return res.status(status).json(data);
}

const handler = async (req, res) => {
  const { method } = req;
  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = parsePath(url);

  // Rate limiting
  const clientIp = getClientIp(req);
  const maxReq = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE' ? 30 : 60;
  if (!checkRateLimit(clientIp, maxReq)) {
    return json(res, 429, { error: 'Trop de requêtes. Réessayez dans 1 minute.' });
  }

  try {
    // ==================== HEALTH ====================
    if (path === '/health' || path === '') {
      return json(res, 200, { status: 'OK', service: 'JambarrTech API', timestamp: new Date() });
    }

    // ==================== AUTH ====================
    if (path === '/auth/register' && method === 'POST') {
      const validation = validate(registerSchema, req.body);
      if (!validation.valid) {
        return json(res, 400, { error: 'Données invalides', details: validation.errors });
      }
      const { name, email, phone, password, role } = validation.data;
      const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
      if (existing) return json(res, 409, { error: 'Email ou téléphone déjà utilisé' });
      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, phone, password: hash, role: role || 'CLIENT' },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
      });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return json(res, 201, { user, token });
    }

    if (path === '/auth/login' && method === 'POST') {
      const validation = validate(loginSchema, req.body);
      if (!validation.valid) {
        return json(res, 400, { error: 'Données invalides', details: validation.errors });
      }
      const { email, password } = validation.data;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return json(res, 401, { error: 'Identifiants incorrects' });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return json(res, 401, { error: 'Identifiants incorrects' });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...safeUser } = user;
      return json(res, 200, { user: safeUser, token });
    }

    if (path === '/auth/me' && method === 'GET') {
      let user;
      try {
        user = requireAuth(req);
      } catch {
        return json(res, 401, { error: 'Token manquant ou invalide' });
      }
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
      });
      if (!dbUser) return json(res, 404, { error: 'Utilisateur non trouvé' });
      return json(res, 200, dbUser);
    }

    // ==================== USERS ====================
    if (path === '/users' && method === 'GET') {
      let user;
      try {
        user = requireAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès réservé aux administrateurs' });
      }
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
      });
      return json(res, 200, users);
    }

    if (path.match(/^\/users\/[^/]+\/role$/) && method === 'PATCH') {
      let user;
      try {
        user = requireAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès réservé aux administrateurs' });
      }
      const userId = path.split('/')[2];
      const { role } = req.body;
      if (!['CLIENT', 'ADMIN', 'MANAGER'].includes(role)) return json(res, 400, { error: 'Rôle invalide' });
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: { id: true, name: true, email: true, phone: true, role: true }
      });
      return json(res, 200, updated);
    }

    // ==================== CATEGORIES ====================
    if (path === '/categories' && method === 'GET') {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } }
      });
      return json(res, 200, categories);
    }

    if (path === '/categories' && method === 'POST') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const { name, icon } = req.body;
      if (!name) return json(res, 400, { error: 'Nom requis' });
      const category = await prisma.category.create({ data: { name, icon } });
      await logActivity(`Création catégorie: ${name}`, user.email, 'Catégories');
      return json(res, 201, category);
    }

    if (path.match(/^\/categories\/[^/]+$/) && method === 'PUT') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const catId = path.split('/')[2];
      const { name, icon } = req.body;
      const category = await prisma.category.update({
        where: { id: catId },
        data: { ...(name && { name }), ...(icon && { icon }) }
      });
      return json(res, 200, category);
    }

    if (path.match(/^\/categories\/[^/]+$/) && method === 'DELETE') {
      let user;
      try {
        user = requireAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès réservé aux administrateurs' });
      }
      const catId = path.split('/')[2];
      await prisma.category.delete({ where: { id: catId } });
      return json(res, 200, { success: true });
    }

    // ==================== PRODUCTS ====================
    if (path === '/products' && method === 'GET') {
      const { search, category, sort, featured, flash, limit, offset } = Object.fromEntries(url.searchParams);
      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } },
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
      return json(res, 200, products);
    }

    if (path === '/products' && method === 'POST') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const validation = validate(productSchema, req.body);
      if (!validation.valid) {
        return json(res, 400, { error: 'Données invalides', details: validation.errors });
      }
      const { name, reference, price, oldPrice, stock, imageUrl, categoryId, isFeatured, isFlash, description } = validation.data;
      const product = await prisma.product.create({
        data: { name, reference, price, oldPrice, stock: stock || 0, imageUrl: imageUrl || '', categoryId, isFeatured: isFeatured || false, isFlash: isFlash || false, description }
      });
      await logActivity(`Ajout produit: ${name}`, user.email, 'Produits');
      return json(res, 201, product);
    }

    if (path === '/products/featured' && method === 'GET') {
      const products = await prisma.product.findMany({
        where: { isFeatured: true },
        orderBy: { createdAt: 'desc' },
        include: { category: true, _count: { select: { reviews: true } } }
      });
      return json(res, 200, products);
    }

    if (path === '/products/flash' && method === 'GET') {
      const products = await prisma.product.findMany({
        where: { isFlash: true },
        orderBy: { createdAt: 'desc' },
        include: { category: true, _count: { select: { reviews: true } } }
      });
      return json(res, 200, products);
    }

    if (path.match(/^\/products\/[^/]+$/) && method === 'GET') {
      const productId = path.split('/')[2];
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          reviews: { where: { status: 'approved' }, orderBy: { createdAt: 'desc' } },
          _count: { select: { reviews: true, orderItems: true } }
        }
      });
      if (!product) return json(res, 404, { error: 'Produit non trouvé' });
      return json(res, 200, product);
    }

    if (path.match(/^\/products\/[^/]+$/) && method === 'PUT') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const productId = path.split('/')[2];
      const { name, reference, price, oldPrice, stock, imageUrl, categoryId, isFeatured, isFlash, description } = req.body;
      const product = await prisma.product.update({
        where: { id: productId },
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
      await logActivity(`Mise à jour produit: ${product.name}`, user.email, 'Produits');
      return json(res, 200, product);
    }

    if (path.match(/^\/products\/[^/]+$/) && method === 'DELETE') {
      let user;
      try {
        user = requireAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès réservé aux administrateurs' });
      }
      const productId = path.split('/')[2];
      const product = await prisma.product.delete({ where: { id: productId } });
      await logActivity(`Suppression produit: ${product.name}`, user.email, 'Produits');
      return json(res, 200, { success: true });
    }

    // ==================== ORDERS ====================
    if (path === '/orders' && method === 'GET') {
      let user;
      try {
        user = requireAuth(req);
      } catch {
        return json(res, 401, { error: 'Authentification requise' });
      }
      const { status } = Object.fromEntries(url.searchParams);
      const where = {};
      if (status) where.status = status;
      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      });
      return json(res, 200, orders);
    }

    if (path === '/orders' && method === 'POST') {
      const validation = validate(orderSchema, req.body);
      if (!validation.valid) {
        return json(res, 400, { error: 'Données invalides', details: validation.errors });
      }
      const { clientName, clientPhone, clientAddress, items, paymentMethod } = validation.data;

      let totalAmount = 0;
      const orderItems = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) return json(res, 404, { error: `Produit ${item.productId} non trouvé` });
        if (product.stock < item.quantity) return json(res, 400, { error: `Stock insuffisant pour ${product.name}` });
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

      for (const item of orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      await logActivity(`Nouvelle commande ${reference}`, clientName, 'Commandes');
      return json(res, 201, order);
    }

    if (path.match(/^\/orders\/[^/]+$/) && method === 'GET') {
      let user;
      try {
        user = requireAuth(req);
      } catch {
        return json(res, 401, { error: 'Authentification requise' });
      }
      const orderId = path.split('/')[2];
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      });
      if (!order) return json(res, 404, { error: 'Commande non trouvée' });
      return json(res, 200, order);
    }

    if (path.match(/^\/orders\/[^/]+\/status$/) && method === 'PATCH') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const orderId = path.split('/')[2];
      const { status } = req.body;
      const validStatuses = ['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) return json(res, 400, { error: `Statut invalide. Valides: ${validStatuses.join(', ')}` });
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: true }
      });
      await logActivity(`Mise à jour commande ${order.reference} → ${status}`, user.email, 'Commandes');
      return json(res, 200, order);
    }

    if (path.match(/^\/orders\/[^/]+$/) && method === 'DELETE') {
      let user;
      try {
        user = requireAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès réservé aux administrateurs' });
      }
      const orderId = path.split('/')[2];
      const order = await prisma.order.delete({ where: { id: orderId } });
      await logActivity(`Suppression commande ${order.reference}`, user.email, 'Commandes');
      return json(res, 200, { success: true });
    }

    // ==================== PAYMENTS ====================
    if (path === '/payments' && method === 'GET') {
      let user;
      try {
        user = requireAuth(req);
      } catch {
        return json(res, 401, { error: 'Authentification requise' });
      }
      const { method: payMethod } = Object.fromEntries(url.searchParams);
      const where = {};
      if (payMethod) where.method = payMethod;
      const payments = await prisma.paymentTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
      return json(res, 200, payments);
    }

    // ==================== REVIEWS ====================
    if (path === '/reviews' && method === 'GET') {
      const { status, productId } = Object.fromEntries(url.searchParams);
      const where = {};
      if (status) where.status = status;
      if (productId) where.productId = productId;
      const reviews = await prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { id: true, name: true } } }
      });
      return json(res, 200, reviews);
    }

    if (path === '/reviews' && method === 'POST') {
      const validation = validate(reviewSchema, req.body);
      if (!validation.valid) {
        return json(res, 400, { error: 'Données invalides', details: validation.errors });
      }
      const { productId, clientName, rating, comment } = validation.data;
      let product = null;
      if (productId) {
        product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return json(res, 404, { error: 'Produit non trouvé' });
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
      return json(res, 201, review);
    }

    if (path.match(/^\/reviews\/[^/]+\/approve$/) && method === 'PATCH') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const reviewId = path.split('/')[2];
      const review = await prisma.review.update({ where: { id: reviewId }, data: { status: 'approved' } });
      await logActivity(`Approbation avis (${review.clientName})`, user.email, 'Avis');
      return json(res, 200, review);
    }

    if (path.match(/^\/reviews\/[^/]+\/reject$/) && method === 'PATCH') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const reviewId = path.split('/')[2];
      const review = await prisma.review.update({ where: { id: reviewId }, data: { status: 'rejected' } });
      return json(res, 200, review);
    }

    if (path.match(/^\/reviews\/[^/]+$/) && method === 'DELETE') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const reviewId = path.split('/')[2];
      const review = await prisma.review.delete({ where: { id: reviewId } });
      await logActivity(`Suppression avis (${review.clientName})`, user.email, 'Avis');
      return json(res, 200, { success: true });
    }

    // ==================== PROMOTIONS ====================
    if (path === '/promotions' && method === 'GET') {
      const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
      return json(res, 200, promotions);
    }

    if (path === '/promotions' && method === 'POST') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const validation = validate(promotionSchema, req.body);
      if (!validation.valid) {
        return json(res, 400, { error: 'Données invalides', details: validation.errors });
      }
      const { title, discountPercent, targetCategory, startDate, endDate } = validation.data;
      const promo = await prisma.promotion.create({
        data: { title, discountPercent, targetCategory, startDate, endDate }
      });
      await logActivity(`Création promotion: ${title}`, user.email, 'Promotions');
      return json(res, 201, promo);
    }

    if (path.match(/^\/promotions\/[^/]+$/) && method === 'PUT') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const promoId = path.split('/')[2];
      const { title, discountPercent, targetCategory, startDate, endDate, isActive } = req.body;
      const promo = await prisma.promotion.update({
        where: { id: promoId },
        data: {
          ...(title && { title }),
          ...(discountPercent && { discountPercent }),
          ...(targetCategory && { targetCategory }),
          ...(startDate !== undefined && { startDate }),
          ...(endDate !== undefined && { endDate }),
          ...(isActive !== undefined && { isActive }),
        }
      });
      return json(res, 200, promo);
    }

    if (path.match(/^\/promotions\/[^/]+$/) && method === 'DELETE') {
      let user;
      try {
        user = requireAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès réservé aux administrateurs' });
      }
      const promoId = path.split('/')[2];
      await prisma.promotion.delete({ where: { id: promoId } });
      return json(res, 200, { success: true });
    }

    // ==================== CUSTOMERS ====================
    if (path === '/customers' && method === 'GET') {
      let user;
      try {
        user = requireManagerOrAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès refusé' });
      }
      const customers = await prisma.user.findMany({ where: { role: 'CLIENT' }, include: { orders: true } });
      const result = customers.map(c => ({
        id: c.id, name: c.name, phone: c.phone, email: c.email,
        ordersCount: c.orders.length,
        totalSpent: c.orders.reduce((s, o) => s + o.totalAmount, 0)
      }));
      return json(res, 200, result);
    }

    // ==================== MANAGERS ====================
    if (path === '/managers' && method === 'GET') {
      let user;
      try {
        user = requireAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès réservé aux administrateurs' });
      }
      const managers = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'MANAGER'] } } });
      const result = managers.map(m => ({
        id: m.id, name: m.name, email: m.email,
        role: m.role === 'ADMIN' ? 'Super Administrateur' : 'Gérant Boutique'
      }));
      return json(res, 200, result);
    }

    // ==================== STATS ====================
    if (path === '/stats' && method === 'GET') {
      let user;
      try {
        user = requireAuth(req);
      } catch {
        return json(res, 401, { error: 'Authentification requise' });
      }

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

      return json(res, 200, {
        totalRevenue,
        ordersCount,
        customersCount,
        productsCount,
        paymentsCount,
        averageBasket,
        recentOrders,
        lowStockProducts
      });
    }

    // ==================== ACTIVITY LOGS ====================
    if (path === '/activity-logs' && method === 'GET') {
      let user;
      try {
        user = requireAuth(req);
      } catch {
        return json(res, 401, { error: 'Authentification requise' });
      }
      const { module: mod } = Object.fromEntries(url.searchParams);
      const where = {};
      if (mod) where.module = mod;
      const logs = await prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100
      });
      return json(res, 200, logs);
    }

    // ==================== SETTINGS ====================
    if (path === '/settings' && method === 'GET') {
      let settings = await prisma.settings.findFirst();
      if (!settings) {
        settings = await prisma.settings.create({ data: {} });
      }
      return json(res, 200, settings);
    }

    if (path === '/settings' && method === 'PUT') {
      let user;
      try {
        user = requireAdmin(req);
      } catch {
        return json(res, 403, { error: 'Accès réservé aux administrateurs' });
      }
      const validation = validate(settingsSchema, req.body);
      if (!validation.valid) {
        return json(res, 400, { error: 'Données invalides', details: validation.errors });
      }
      const data = validation.data;
      let settings = await prisma.settings.findFirst();
      if (!settings) {
        settings = await prisma.settings.create({ data });
      } else {
        settings = await prisma.settings.update({
          where: { id: settings.id },
          data: {
            ...(data.storeName && { storeName: data.storeName }),
            ...(data.storeEmail && { storeEmail: data.storeEmail }),
            ...(data.phone && { phone: data.phone }),
            ...(data.address && { address: data.address }),
            ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
            ...(data.commissionRate !== undefined && { commissionRate: data.commissionRate }),
            ...(data.minCommission !== undefined && { minCommission: data.minCommission }),
          }
        });
      }
      await logActivity('Mise à jour paramètres', user.email, 'Paramètres');
      return json(res, 200, settings);
    }

    return json(res, 404, { error: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    return json(res, 500, { error: 'Erreur serveur', detail: error.message });
  }
};

module.exports = cors(handler);
