const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    const { id } = req.query;
    
    if (req.method === 'PATCH') {
      const review = await prisma.review.update({
        where: { id },
        data: { status: 'approved' }
      });

      await prisma.activityLog.create({
        data: {
          action: `Approbation avis client (${review.clientName})`,
          user: 'Admin',
          module: 'Avis',
          result: 'SUCCÈS'
        }
      });

      return res.status(200).json(review);
    }

    if (req.method === 'DELETE') {
      const review = await prisma.review.delete({
        where: { id }
      });

      await prisma.activityLog.create({
        data: {
          action: `Suppression avis client (${review.clientName})`,
          user: 'Admin',
          module: 'Avis',
          result: 'SUCCÈS'
        }
      });

      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Review action error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
