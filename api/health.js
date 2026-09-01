const allowCors = require('./lib/cors');
const prisma = require('./lib/prisma');

module.exports = allowCors(async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'OK', 
      service: 'JambarrTech API', 
      timestamp: new Date(), 
      database: 'connected' 
    });
  } catch {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected' 
    });
  }
});
