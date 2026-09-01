const allowCors = require('./lib/cors');
const prisma = require('./lib/prisma');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const token = header.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = allowCors(async (req, res) => {
  if (req.method === 'GET') {
    try {
      const user = verifyToken(req);
      if (!user) return res.status(401).json({ error: 'Token manquant ou invalide' });

      const orders = await prisma.order.findMany({
        where: { clientPhone: user.phone || undefined },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      });
      res.json(orders);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { clientName, clientPhone, clientAddress, items, paymentMethod } = req.body;
      if (!clientName || !items || items.length === 0) {
        return res.status(400).json({ error: 'Données de commande incomplètes' });
      }

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const order = await prisma.order.create({
        data: {
          reference: `ORD-${Date.now()}`,
          clientName,
          clientPhone,
          clientAddress,
          totalAmount,
          paymentMethod: paymentMethod || 'Wave',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        },
        include: { items: { include: { product: true } } }
      });

      res.status(201).json(order);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
});
