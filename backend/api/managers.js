const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'MANAGER'] } },
      orderBy: { createdAt: 'desc' }
    });
    
    const result = managers.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role === 'ADMIN' ? 'Super Administrateur' : 'Gérant Boutique'
    }));
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Managers error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
