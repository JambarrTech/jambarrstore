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

    const [totalOrders, totalCustomers, totalProducts, revenueResult, pendingOrders, lowStock] = await Promise.all([
      prisma.order.count(),
      prisma.customer.count(),
      prisma.product.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "annulee" } } }),
      prisma.order.count({ where: { status: "en_attente" } }),
      prisma.product.findMany({ where: { stock: { lte: 5 } }, select: { id: true, name: true, stock: true } }),
    ]);
    return NextResponse.json({ totalOrders, totalCustomers, totalProducts, revenue: revenueResult._sum.total || 0, pendingOrders, lowStock });
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}