const allowCors = require('./lib/cors');
const prisma = require('./lib/prisma');
require('dotenv').config();

module.exports = allowCors(async (req, res) => {
  if (req.method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        include: { 
          _count: { select: { products: true } }
        },
        orderBy: { name: 'asc' }
      });
      res.json(categories);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'GET' && req.url.includes('/api/categories/')) {
    try {
      const id = req.url.split('/').pop();
      const category = await prisma.category.findUnique({
        where: { id },
        include: { 
          products: true,
          _count: { select: { products: true } }
        }
      });
      if (!category) return res.status(404).json({ error: 'Catégorie non trouvée' });
      res.json(category);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
});
