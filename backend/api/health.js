const allowCors = require('../lib/cors');

const handler = async (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'JambarrTech API', 
    timestamp: new Date(),
    version: '1.0.0'
  });
};

module.exports = allowCors(handler);
