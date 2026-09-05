import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const sellerName = decodeURIComponent(params.id);
    const product = await prisma.product.findFirst({ where: { seller: sellerName } });
    if (!product) return NextResponse.json({ error: "Vendeur introuvable" }, { status: 404 });
    return NextResponse.json({ id: sellerName, name: sellerName });
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}