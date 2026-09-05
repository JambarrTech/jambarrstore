import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "jambarr-jwt-secret-2024";

export async function GET(req: Request) {
  try {
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { role: string };
    if (payload.role !== "admin") return NextResponse.json({ error: "Acces interdit" }, { status: 403 });

    const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: weekAgo }, status: { not: "annulee" } },
      select: { createdAt: true, total: true },
    });
    const salesByDay = days.map(day => ({ day, value: 0 }));
    orders.forEach(order => { salesByDay[new Date(order.createdAt).getDay()].value += order.total; });
    return NextResponse.json([...salesByDay.slice(1), salesByDay[0]]);
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}