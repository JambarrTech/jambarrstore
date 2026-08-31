const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'c1' },
      update: {},
      create: { id: 'c1', name: 'High-Tech', icon: '📱', productCount: 15 }
    }),
    prisma.category.upsert({
      where: { id: 'c2' },
      update: {},
      create: { id: 'c2', name: 'Mode & Vêtements', icon: '👕', productCount: 24 }
    }),
    prisma.category.upsert({
      where: { id: 'c3' },
      update: {},
      create: { id: 'c3', name: 'Maison & Bureau', icon: '🏠', productCount: 18 }
    }),
    prisma.category.upsert({
      where: { id: 'c4' },
      update: {},
      create: { id: 'c4', name: 'Beauté & Santé', icon: '🧴', productCount: 10 }
    }),
    prisma.category.upsert({
      where: { id: 'c5' },
      update: {},
      create: { id: 'c5', name: 'Sport & Loisirs', icon: '⚽', productCount: 12 }
    })
  ]);

  // Create products
  const products = [
    { id: 'p1', name: 'Apple AirPods Max', reference: 'APT-001', price: 345000, oldPrice: 395000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Casque audio sans fil haute fidélité avec réduction active du bruit.' },
    { id: 'p2', name: 'Apple Watch Ultra 2', reference: 'APT-002', price: 415000, oldPrice: 450000, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Montre connectée robuste pour sport extrême et aventure.' },
    { id: 'p3', name: 'MacBook Pro M3', reference: 'APT-003', price: 1250000, oldPrice: 1350000, stock: 2, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', categoryId: 'c1', isFeatured: true, isFlash: false, description: 'Ordinateur portable surpuissant avec puce Apple M3 Pro.' },
    { id: 'p4', name: 'Sneakers Urban Street', reference: 'MOD-001', price: 45000, oldPrice: 55000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', categoryId: 'c2', isFeatured: false, isFlash: true, description: 'Baskets tendance grand confort.' },
    { id: 'p5', name: 'iPhone 15 Pro Max', reference: 'APT-004', price: 890000, oldPrice: 990000, stock: 4, imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Smartphone haut de gamme titane avec puce A17 Pro.' }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
    });
  }

  // Create settings
  await prisma.settings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      storeName: 'JambarrTech',
      storeEmail: 'contact@jambarrtech.com',
      phone: '+221 77 123 45 67',
      address: 'Dakar, Sénégal',
      commissionRate: 5.0,
      minCommission: 500
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
