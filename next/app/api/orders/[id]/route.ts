import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "jambarr-jwt-secret-2024";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({ where: { id: params.id }, include: { lines: true } });
    if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { role: string };
    if (payload.role !== "admin") return NextResponse.json({ error: "Acces interdit" }, { status: 403 });

    const { status } = await req.json();
    if (!status) return NextResponse.json({ error: "Statut requis" }, { status: 400 });
    const order = await prisma.order.update({ where: { id: params.id }, data: { status }, include: { lines: true } });
    return NextResponse.json(order);
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}