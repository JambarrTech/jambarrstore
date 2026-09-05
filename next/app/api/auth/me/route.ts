import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "jambarr-jwt-secret-2024";

export async function GET(req: Request) {
  try {
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    return NextResponse.json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }
}