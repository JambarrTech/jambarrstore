const jwt = require('jsonwebtoken');
const prisma = require('./prisma');

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const token = header.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req) {
  const user = authMiddleware(req);
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

function requireAdmin(req) {
  const user = requireAuth(req);
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return user;
}

function requireManagerOrAdmin(req) {
  const user = requireAuth(req);
  if (!['ADMIN', 'MANAGER'].includes(user.role)) throw new Error('FORBIDDEN');
  return user;
}

async function logActivity(action, user, module) {
  try {
    await prisma.activityLog.create({
      data: { action, user, module, result: 'SUCCÈS' }
    });
  } catch (e) {
    console.error('Activity log error:', e.message);
  }
}

module.exports = {
  authMiddleware,
  requireAuth,
  requireAdmin,
  requireManagerOrAdmin,
  logActivity,
};
