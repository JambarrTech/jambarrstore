import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.count();
  const orders = await prisma.order.count();
  const customers = await prisma.customer.count();
  const orderLines = await prisma.orderLine.count();
  const categories = await prisma.category.count();

  console.log(`Categories: ${categories}`);
  console.log(`Products: ${products}`);
  console.log(`Orders: ${orders}`);
  console.log(`OrderLines: ${orderLines}`);
  console.log(`Customers: ${customers}`);

  const sampleProducts = await prisma.product.findMany({
    take: 3,
    select: { id: true, name: true, price: true, stock: true },
  });
  console.log('\nSample products:');
  sampleProducts.forEach(p => console.log(`  ${p.id}: ${p.name} - ${p.price} FCFA (stock: ${p.stock})`));

  const sampleOrders = await prisma.order.findMany({
    take: 3,
    select: { id: true, customerName: true, total: true, status: true },
  });
  console.log('\nSample orders:');
  sampleOrders.forEach(o => console.log(`  ${o.id}: ${o.customerName} - ${o.total} FCFA (${o.status})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
