const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: { orders: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const result = customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      ordersCount: c.orders.length,
      totalSpent: c.orders.reduce((sum, o) => sum + o.totalAmount, 0)
    }));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Customers error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
