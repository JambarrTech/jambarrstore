const allowCors = require('./lib/cors');
const prisma = require('./lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = allowCors(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/auth/register') {
    try {
      const { name, email, phone, password, role } = req.body;
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'Champs requis: name, email, phone, password' });
      }
      
      const existing = await prisma.user.findFirst({ 
        where: { OR: [{ email }, { phone }] } 
      });
      if (existing) return res.status(409).json({ error: 'Email ou téléphone déjà utilisé' });
      
      const hash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, phone, password: hash, role: role || 'CLIENT' },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
      });
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      res.status(201).json({ user, token });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'POST' && req.url === '/api/auth/login') {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email et password requis' });
      }
      
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' });
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '7d' }
      );
      
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  } else {
    res.status(404).json({ error: 'Endpoint non trouvé' });
  }
});
