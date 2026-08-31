const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean
  await prisma.activityLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSettings.deleteMany();

  // Categories
  await prisma.category.createMany({
    data: [
      { id: 'c1', name: 'High-Tech', icon: '📱', productCount: 15 },
      { id: 'c2', name: 'Mode & Vêtements', icon: '👕', productCount: 24 },
      { id: 'c3', name: 'Maison & Bureau', icon: '🏠', productCount: 18 },
      { id: 'c4', name: 'Beauté & Santé', icon: '🧴', productCount: 10 },
      { id: 'c5', name: 'Sport & Loisirs', icon: '⚽', productCount: 12 },
      { id: 'c6', name: 'Informatique', icon: '💻', productCount: 67 },
    ]
  });

  // Users
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.createMany({
    data: [
      { id: 'u1', name: 'Amadou Ba', email: 'admin@jambarrtech.com', phone: '+221771002003', password: hash, role: 'ADMIN' },
      { id: 'u2', name: 'Seynabou Fall', email: 'seynabou@jambarrtech.com', phone: '+221762003004', password: hash, role: 'MANAGER' },
      { id: 'u3', name: 'Mamadou Diallo', email: 'mamadou@gmail.com', phone: '+221771234567', password: hash, role: 'CLIENT' },
      { id: 'u4', name: 'Fatou Ndiaye', email: 'fatou@gmail.com', phone: '+221769876543', password: hash, role: 'CLIENT' },
      { id: 'u5', name: 'Cheikh Sarr', email: 'cheikh@gmail.com', phone: '+221701112233', password: hash, role: 'CLIENT' },
    ]
  });

  // Products
  await prisma.product.createMany({
    data: [
      { id: 'p1', name: 'Apple AirPods Max', reference: 'APT-001', price: 345000, oldPrice: 395000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Casque audio sans fil haute fidélité avec réduction active du bruit.' },
      { id: 'p2', name: 'Apple Watch Ultra 2', reference: 'APT-002', price: 415000, oldPrice: 450000, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Montre connectée robuste pour sport extrême et aventure.' },
      { id: 'p3', name: 'MacBook Pro M3', reference: 'APT-003', price: 1250000, oldPrice: 1350000, stock: 2, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', categoryId: 'c6', isFeatured: true, isFlash: false, description: 'Ordinateur portable surpuissant avec puce Apple M3 Pro.' },
      { id: 'p4', name: 'Sneakers Urban Street', reference: 'MOD-001', price: 45000, oldPrice: 55000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', categoryId: 'c2', isFeatured: false, isFlash: true, description: 'Baskets tendance grand confort.' },
      { id: 'p5', name: 'iPhone 15 Pro Max', reference: 'APT-004', price: 890000, oldPrice: 990000, stock: 4, imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Smartphone haut de gamme titane avec puce A17 Pro.' },
      { id: 'p6', name: 'Lampe Bureau LED', reference: 'MS-001', price: 18500, oldPrice: 22000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', categoryId: 'c3', isFeatured: false, isFlash: false, description: 'Lampe tactile avec chargeur sans fil intégré.' },
      { id: 'p7', name: 'Kit Sérum Visage Bio', reference: 'BT-001', price: 15000, stock: 55, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', categoryId: 'c4', isFeatured: false, isFlash: false, description: 'Sérum vitamine C et acide hyaluronique.' },
      { id: 'p8', name: 'Ballon Football Pro', reference: 'SP-001', price: 12000, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab', categoryId: 'c5', isFeatured: false, isFlash: true, description: 'Ballon officiel certification FIFA, taille 5.' },
    ]
  });

  // Orders
  const order1 = await prisma.order.create({
    data: {
      id: 'o1', reference: 'CMD-8821', clientName: 'Mamadou Diallo', clientPhone: '+221771234567',
      clientAddress: 'Almadies Route de Ngor, Dakar', totalAmount: 390000, status: 'PROCESSING',
      paymentMethod: 'Wave', paymentStatus: 'PAID',
      items: { create: [{ productId: 'p1', quantity: 1, price: 345000 }, { productId: 'p4', quantity: 1, price: 45000 }] }
    }
  });
  const order2 = await prisma.order.create({
    data: {
      id: 'o2', reference: 'CMD-8822', clientName: 'Fatou Ndiaye', clientPhone: '+221769876543',
      clientAddress: 'Point E Rue A x B, Dakar', totalAmount: 45000, status: 'DELIVERED',
      paymentMethod: 'Orange Money', paymentStatus: 'PAID',
      items: { create: [{ productId: 'p4', quantity: 1, price: 45000 }] }
    }
  });
  const order3 = await prisma.order.create({
    data: {
      id: 'o3', reference: 'CMD-8823', clientName: 'Cheikh Sarr', clientPhone: '+221701112233',
      clientAddress: 'Mermoz Pyrotechnie, Dakar', totalAmount: 1305000, status: 'PENDING',
      paymentMethod: 'Wave', paymentStatus: 'PAID',
      items: { create: [{ productId: 'p2', quantity: 1, price: 415000 }, { productId: 'p5', quantity: 1, price: 890000 }] }
    }
  });

  // Payments
  await prisma.paymentTransaction.createMany({
    data: [
      { id: 'tx1', reference: 'TX-WV-9912', orderId: 'o1', clientName: 'Mamadou Diallo', amount: 390000, method: 'Wave', status: 'Réussi' },
      { id: 'tx2', reference: 'TX-OM-4410', orderId: 'o2', clientName: 'Fatou Ndiaye', amount: 45000, method: 'Orange Money', status: 'Réussi' },
      { id: 'tx3', reference: 'TX-WV-9913', orderId: 'o3', clientName: 'Cheikh Sarr', amount: 1305000, method: 'Wave', status: 'Réussi' },
    ]
  });

  // Reviews
  await prisma.review.createMany({
    data: [
      { id: 'r1', productId: 'p1', userId: 'u3', clientName: 'Mamadou Diallo', rating: 5, comment: 'Super service ! AirPods Max reçus en moins de 24h à Dakar.', status: 'approved' },
      { id: 'r2', productId: 'p4', userId: 'u4', clientName: 'Fatou Ndiaye', rating: 5, comment: 'Paiement super simple avec Wave, livraison express irréprochable.', status: 'approved' },
      { id: 'r3', productId: 'p2', userId: 'u5', clientName: 'Cheikh Sarr', rating: 4, comment: 'Très bon produit mais livraison avec 2h de retard.', status: 'pending' },
    ]
  });

  // Promotions
  await prisma.promotion.createMany({
    data: [
      { id: 'pr1', title: 'Méga Soldes Tech', discountPercent: 20, targetCategory: 'High-Tech', startDate: '01/09/2026', endDate: '15/09/2026', isActive: true },
      { id: 'pr2', title: 'Rentrée Mode', discountPercent: 15, targetCategory: 'Mode & Vêtements', startDate: '31/08/2026', endDate: '05/09/2026', isActive: true },
    ]
  });

  // Activity logs
  await prisma.activityLog.createMany({
    data: [
      { id: 'l1', action: 'Mise à jour stock AirPods Max', user: 'Amadou Ba', module: 'Produits', ipAddress: '197.234.12.5', result: 'SUCCÈS' },
      { id: 'l2', action: 'Validation commande CMD-8821', user: 'Seynabou Fall', module: 'Commandes', ipAddress: '197.234.12.8', result: 'SUCCÈS' },
      { id: 'l3', action: 'Création promotion Méga Soldes Tech', user: 'Amadou Ba', module: 'Promotions', ipAddress: '197.234.12.5', result: 'SUCCÈS' },
    ]
  });

  // Store settings
  await prisma.storeSettings.create({
    data: {
      storeName: 'JambarrTech', storeEmail: 'contact@jambarrtech.com',
      phone: '+221 77 123 45 67', address: 'Dakar, Sénégal',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      commissionRate: 5.0, minCommission: 500,
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
