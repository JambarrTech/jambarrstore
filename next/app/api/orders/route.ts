import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "jambarr-jwt-secret-2024";

const paymentMap: Record<string, string> = {
  wave: "Wave", orange: "Orange_Money", orange_money: "Orange_Money",
  cash: "Paiement_a_la_livraison", "Paiement a la livraison": "Paiement_a_la_livraison",
  "Paiement_a_la_livraison": "Paiement_a_la_livraison",
  Wave: "Wave", Orange_Money: "Orange_Money", "Orange Money": "Orange_Money",
};

export async function GET(req: Request) {
  try {
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string; role: string };

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const where: Prisma.OrderWhereInput = {};
    if (status && status !== "all") where.status = status as any;
    if (payload.role === "client") where.customerId = payload.userId;

    const orders = await prisma.order.findMany({ where, include: { lines: true, customer: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { customerName, phone, city, payment, items, userId } = await req.json();
    if (!city) return NextResponse.json({ error: "Ville requise" }, { status: 400 });
    if (!items || items.length === 0) return NextResponse.json({ error: "Panier vide" }, { status: 400 });

    const paymentKey = paymentMap[payment];
    if (!paymentKey) return NextResponse.json({ error: "Methode de paiement invalide" }, { status: 400 });

    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) return NextResponse.json({ error: `Produit ${item.productId} introuvable` }, { status: 400 });
      if (product.stock < item.quantity) return NextResponse.json({ error: `Stock insuffisant pour ${product.name}` }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let customer = phone ? await tx.customer.findFirst({ where: { phone } }) : null;
      if (!customer) {
        customer = await tx.customer.create({ data: { name: customerName || "Client", phone: phone || "N/A", city } });
      }

      let total = 0;
      const orderLines: any[] = [];
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        total += product.price * item.quantity;
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } } });
        orderLines.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity, image: product.image });
      }

      const count = await tx.order.count();
      const orderId = `JB-${String(2420 + count).padStart(4, "0")}`;
      const order = await tx.order.create({
        data: { id: orderId, customerId: userId || customer.id, customerName: customer.name, city, payment: paymentKey as any, total, lines: { create: orderLines } },
        include: { lines: true },
      });
      await tx.customer.update({ where: { id: customer.id }, data: { orders: { increment: 1 }, spent: { increment: total } } });
      return order;
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API Error]", err.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}