const cors = require('./lib/cors');
const prisma = require('./lib/prisma');

const handler = async (req, res) => {
  const { method } = req;
  const url = new URL(req.url, `https://${req.headers.host}`);
  const path = url.pathname.replace(/^\/api/, '');
  const id = path.split('/').filter(Boolean).pop();

  try {
    // Health
    if (path === '/health' || path === '') {
      return res.status(200).json({ status: 'OK', service: 'JambarrTech API', timestamp: new Date() });
    }

    // Products
    if (path === '/products' && method === 'GET') {
      const { search, category, sort } = Object.fromEntries(url.searchParams);
      let where = {};
      if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
      if (category) where.categoryId = category;
      let orderBy = {};
      if (sort === 'price_asc') orderBy = { price: 'asc' };
      else if (sort === 'price_desc') orderBy = { price: 'desc' };
      const products = await prisma.product.findMany({ where, orderBy, include: { category: true } });
      return res.status(200).json(products);
    }

    if (path === '/products' && method === 'POST') {
      const product = await prisma.product.create({ data: req.body, include: { category: true } });
      await prisma.activityLog.create({ data: { action: `Ajout produit: ${product.name}`, user: 'Admin', module: 'Produits', result: 'SUCCÈS' } });
      return res.status(201).json(product);
    }

    // Product by id
    if (path.startsWith('/products/') && method === 'GET') {
      const productId = path.split('/').pop();
      const product = await prisma.product.findUnique({ where: { id: productId }, include: { category: true } });
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
      return res.status(200).json(product);
    }

    // Categories
    if (path === '/categories' && method === 'GET') {
      const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
      return res.status(200).json(categories);
    }

    // Orders
    if (path === '/orders' && method === 'GET') {
      const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } });
      return res.status(200).json(orders);
    }

    if (path === '/orders' && method === 'POST') {
      const { clientName, totalAmount, paymentMethod, items } = req.body;
      const order = await prisma.order.create({
        data: { reference: 'CMD-' + Math.floor(1000 + Math.random() * 9000), clientName, totalAmount, paymentMethod, status: 'PENDING', items: { create: items || [] } },
        include: { items: true }
      });
      await prisma.paymentTransaction.create({ data: { reference: 'TX-' + Math.floor(1000 + Math.random() * 9000), clientName, amount: totalAmount, method: paymentMethod, status: 'Réussi' } });
      await prisma.activityLog.create({ data: { action: `Nouvelle commande ${order.reference}`, user: clientName, module: 'Commandes', result: 'SUCCÈS' } });
      return res.status(201).json(order);
    }

    // Customers
    if (path === '/customers' && method === 'GET') {
      const customers = await prisma.user.findMany({ where: { role: 'CLIENT' }, include: { orders: true } });
      const result = customers.map(c => ({ id: c.id, name: c.name, phone: c.phone, ordersCount: c.orders.length, totalSpent: c.orders.reduce((s, o) => s + o.totalAmount, 0) }));
      return res.status(200).json(result);
    }

    // Managers
    if (path === '/managers' && method === 'GET') {
      const managers = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'MANAGER'] } } });
      const result = managers.map(m => ({ id: m.id, name: m.name, email: m.email, role: m.role === 'ADMIN' ? 'Super Administrateur' : 'Gérant Boutique' }));
      return res.status(200).json(result);
    }

    // Payments
    if (path === '/payments' && method === 'GET') {
      const payments = await prisma.paymentTransaction.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(payments);
    }

    // Promotions
    if (path === '/promotions' && method === 'GET') {
      const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(promotions);
    }

    // Reviews
    if (path === '/reviews' && method === 'GET') {
      const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, include: { product: true } });
      return res.status(200).json(reviews);
    }

    if (path === '/reviews' && method === 'POST') {
      const review = await prisma.review.create({ data: req.body });
      return res.status(201).json(review);
    }

    // Review approve/delete
    if (path.match(/^\/reviews\/[^/]+\/approve$/) && method === 'PATCH') {
      const reviewId = path.split('/')[2];
      const review = await prisma.review.update({ where: { id: reviewId }, data: { status: 'approved' } });
      await prisma.activityLog.create({ data: { action: `Approbation avis (${review.clientName})`, user: 'Admin', module: 'Avis', result: 'SUCCÈS' } });
      return res.status(200).json(review);
    }

    if (path.match(/^\/reviews\/[^/]+$/) && method === 'DELETE') {
      const reviewId = path.split('/')[2];
      const review = await prisma.review.delete({ where: { id: reviewId } });
      await prisma.activityLog.create({ data: { action: `Suppression avis (${review.clientName})`, user: 'Admin', module: 'Avis', result: 'SUCCÈS' } });
      return res.status(200).json({ success: true });
    }

    // Stats
    if (path === '/stats' && method === 'GET') {
      const [rev, orders, customers, products] = await Promise.all([
        prisma.order.aggregate({ _sum: { totalAmount: true } }),
        prisma.order.count(),
        prisma.user.count({ where: { role: 'CLIENT' } }),
        prisma.product.count()
      ]);
      const avg = orders > 0 ? Math.round(rev._sum.totalAmount / orders) : 0;
      return res.status(200).json({ totalRevenue: `${(rev._sum.totalAmount || 0).toLocaleString()} FCFA`, ordersCount: orders, customersCount: customers, productsCount: products, averageBasket: `${avg.toLocaleString()} FCFA` });
    }

    // Activity logs
    if (path === '/activity-logs' && method === 'GET') {
      const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
      return res.status(200).json(logs);
    }

    // Settings
    if (path === '/settings' && method === 'GET') {
      let settings = await prisma.settings.findFirst();
      if (!settings) settings = await prisma.settings.create({ data: { storeName: 'JambarrTech', storeEmail: 'contact@jambarrtech.com', phone: '+221 77 123 45 67', address: 'Dakar, Sénégal', commissionRate: 5.0, minCommission: 500 } });
      return res.status(200).json(settings);
    }

    if (path === '/settings' && method === 'PUT') {
      let settings = await prisma.settings.findFirst();
      if (!settings) settings = await prisma.settings.create({ data: req.body });
      else settings = await prisma.settings.update({ where: { id: settings.id }, data: req.body });
      await prisma.activityLog.create({ data: { action: 'Mise à jour paramètres', user: 'Admin', module: 'Paramètres', result: 'SUCCÈS' } });
      return res.status(200).json(settings);
    }

    return res.status(404).json({ error: 'Route not found' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Erreur serveur', detail: error.message });
  }
};

module.exports = cors(handler);
