const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    const { id } = req.query;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: true }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
