const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { search, category, sort } = req.query;
      
      let where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }
      if (category) {
        where.categoryId = category;
      }

      let orderBy = {};
      if (sort === 'price_asc') orderBy = { price: 'asc' };
      else if (sort === 'price_desc') orderBy = { price: 'desc' };

      const products = await prisma.product.findMany({
        where,
        orderBy,
        include: { category: true }
      });
      
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const product = await prisma.product.create({
        data: req.body,
        include: { category: true }
      });

      await prisma.activityLog.create({
        data: {
          action: `Ajout produit: ${product.name}`,
          user: 'Admin',
          module: 'Produits',
          result: 'SUCCÈS'
        }
      });

      return res.status(201).json(product);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
