const allowCors = require('./lib/cors');
const prisma = require('./lib/prisma');
require('dotenv').config();

module.exports = allowCors(async (req, res) => {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'GET' && req.url.includes('/api/products/')) {
    try {
      const id = req.url.split('/').pop();
      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true, reviews: true }
      });
      if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
      res.json(product);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
});
