const allowCors = require('../lib/cors');
const prisma = require('../lib/prisma');

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      let settings = await prisma.settings.findFirst();
      if (!settings) {
        settings = await prisma.settings.create({
          data: {
            storeName: 'JambarrTech',
            storeEmail: 'contact@jambarrtech.com',
            phone: '+221 77 123 45 67',
            address: 'Dakar, Sénégal',
            commissionRate: 5.0,
            minCommission: 500
          }
        });
      }
      return res.status(200).json(settings);
    }

    if (req.method === 'PUT') {
      let settings = await prisma.settings.findFirst();
      if (!settings) {
        settings = await prisma.settings.create({ data: req.body });
      } else {
        settings = await prisma.settings.update({
          where: { id: settings.id },
          data: req.body
        });
      }

      await prisma.activityLog.create({
        data: {
          action: 'Mise à jour des paramètres système',
          user: 'Admin',
          module: 'Paramètres',
          result: 'SUCCÈS'
        }
      });

      return res.status(200).json(settings);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = allowCors(handler);
