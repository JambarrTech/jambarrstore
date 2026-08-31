const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } }
      });
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const { clientName, totalAmount, paymentMethod, items } = req.body;
      
      const order = await prisma.order.create({
        data: {
          reference: 'CMD-' + Math.floor(1000 + Math.random() * 9000),
          clientName,
          totalAmount,
          paymentMethod,
          status: 'PENDING',
          items: {
            create: items || []
          }
        },
        include: { items: true }
      });

      await prisma.paymentTransaction.create({
        data: {
          reference: 'TX-' + Math.floor(1000 + Math.random() * 9000),
          clientName,
          amount: totalAmount,
          method: paymentMethod,
          status: 'Réussi'
        }
      });

      await prisma.activityLog.create({
        data: {
          action: `Nouvelle commande ${order.reference}`,
          user: clientName,
          module: 'Commandes',
          result: 'SUCCÈS'
        }
      });

      return res.status(201).json(order);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
