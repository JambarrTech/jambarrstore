import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'jambarr-jwt-secret-2024'

export function signToken(payload: { userId: string; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function getUserFromRequest(req: Request) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    return verifyToken(auth.slice(7))
  } catch {
    return null
  }
}

export function requireAuth(req: Request) {
  const user = getUserFromRequest(req)
  if (!user) throw new Error('Unauthorized')
  return user
}

export function requireAdmin(req: Request) {
  const user = requireAuth(req)
  if (user.role !== 'admin') throw new Error('Forbidden')
  return user
}
