const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    const [totalRevenue, ordersCount, customersCount, productsCount] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.product.count()
    ]);

    const averageBasket = ordersCount > 0 
      ? Math.round(totalRevenue._sum.totalAmount / ordersCount) 
      : 0;

    res.status(200).json({
      totalRevenue: `${(totalRevenue._sum.totalAmount || 0).toLocaleString()} FCFA`,
      ordersCount,
      customersCount,
      productsCount,
      averageBasket: `${averageBasket.toLocaleString()} FCFA`
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
