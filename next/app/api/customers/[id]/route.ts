import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!customer) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    return NextResponse.json(customer);
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}