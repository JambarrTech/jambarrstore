const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const reviews = await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        include: { product: true }
      });
      return res.status(200).json(reviews);
    }

    if (req.method === 'POST') {
      const review = await prisma.review.create({
        data: req.body
      });
      return res.status(201).json(review);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reviews error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
