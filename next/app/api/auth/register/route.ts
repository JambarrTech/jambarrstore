import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, signToken } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json()

    if (!name || !email || !password) {
      return error('Nom, email et mot de passe requis')
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return error('Cet email est déjà utilisé', 409)
    }

    const hashed = await hashPassword(password)

    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone: phone || null },
    })

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    })
  } catch (e: any) {
    return error(e.message || 'Erreur serveur', 500)
  }
}
