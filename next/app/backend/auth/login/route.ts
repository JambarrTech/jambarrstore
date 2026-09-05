import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return error('Email et mot de passe requis')
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return error('Identifiants incorrects', 401)
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return error('Identifiants incorrects', 401)
    }

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
