import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const active = searchParams.get("active");
    const ids = searchParams.get("ids");

    const where: any = {};
    if (ids) where.id = { in: ids.split(",") };
    if (category && category !== "all") where.categoryId = category;
    if (active !== undefined) where.active = active === "true";
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];

    const products = await prisma.product.findMany({ where, include: { category: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(products);
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const jwt = (await import("jsonwebtoken")).default;
    const JWT_SECRET = process.env.JWT_SECRET || "jambarr-jwt-secret-2024";
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { role: string };
    if (payload.role !== "admin") return NextResponse.json({ error: "Acces interdit" }, { status: 403 });

    const { id, ...data } = await req.json();
    if (!data.name?.trim() || !data.price || data.price <= 0) {
      return NextResponse.json({ error: "Nom et prix requis" }, { status: 400 });
    }
    const product = id
      ? await prisma.product.update({ where: { id }, data, include: { category: true } })
      : await prisma.product.create({ data, include: { category: true } });
    return NextResponse.json(product);
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}