const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    const payments = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Payments error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
