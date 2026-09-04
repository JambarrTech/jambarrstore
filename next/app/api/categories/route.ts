import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { json, error } from '@/lib/api'

export async function OPTIONS() {
  return json(null)
}

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany()
    return json(categories)
  } catch (e: any) {
    return error(e.message || 'Erreur serveur', 500)
  }
}
