import { PrismaClient, CategoryId, OrderStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = [
    { id: 'electronique' as CategoryId, label: 'Électronique' },
    { id: 'mode' as CategoryId, label: 'Mode' },
    { id: 'maison' as CategoryId, label: 'Maison' },
    { id: 'beaute' as CategoryId, label: 'Beauté' },
    { id: 'epicerie' as CategoryId, label: 'Épicerie' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }

  // Create products
  const products = [
    {
      id: 'p-001',
      name: 'Smartphone Tecno Spark 20 — 128 Go',
      categoryId: 'electronique' as CategoryId,
      price: 89900,
      oldPrice: 109900,
      image: '/cdc1b42b-fe11-4af7-9909-9f60cad5abbd.jpg',
      stock: 24,
      rating: 4.6,
      reviews: 214,
      sold: 412,
      seller: 'Jambarr Officiel',
      description: 'Écran 6.6" 90 Hz, 8 Go de RAM, batterie 5000 mAh et charge rapide 18W. Livré avec chargeur, coque et écouteurs.',
      active: true,
    },
    {
      id: 'p-002',
      name: 'Casque Bluetooth sans fil Pulse',
      categoryId: 'electronique' as CategoryId,
      price: 24500,
      oldPrice: 32000,
      image: '/642e8a25-bfa7-4405-8cfa-bb95f9ad6652.jpg',
      stock: 12,
      rating: 4.3,
      reviews: 88,
      sold: 176,
      seller: 'Dakar Tech',
      description: 'Réduction de bruit active, 40 heures d\'autonomie, coussinets mémoire de forme. Pliable et livré avec housse.',
      active: true,
    },
    {
      id: 'p-003',
      name: 'Robe wax Téranga — coupe longue',
      categoryId: 'mode' as CategoryId,
      price: 18000,
      image: '/f6a12614-b3a9-44b0-86d8-78a4be3e47b2.jpg',
      stock: 7,
      rating: 4.8,
      reviews: 63,
      sold: 141,
      seller: 'Atelier Ndeye Couture',
      description: 'Wax authentique cousu à Dakar. Tailles 36 à 46, retouches offertes en boutique.',
      active: true,
    },
    {
      id: 'p-004',
      name: 'Baskets running AirFlex',
      categoryId: 'mode' as CategoryId,
      price: 32500,
      oldPrice: 39900,
      image: '/928f4cb7-0dc0-48f6-96c0-0604ddda338f.jpg',
      stock: 3,
      rating: 4.4,
      reviews: 51,
      sold: 97,
      seller: 'Sport Plus',
      description: 'Semelle amortissante, mesh respirant, pointures 39 à 45. Idéales pour la course et le quotidien.',
      active: true,
    },
    {
      id: 'p-005',
      name: 'Sac à main cuir tressé',
      categoryId: 'mode' as CategoryId,
      price: 27900,
      image: '/7e8e84b4-8f4e-4eb1-9194-fa3b9d6f3905.jpg',
      stock: 15,
      rating: 4.7,
      reviews: 39,
      sold: 74,
      seller: 'Maroquinerie Sandaga',
      description: 'Cuir véritable tressé main, doublure intérieure, poche zippée et bandoulière amovible.',
      active: true,
    },
    {
      id: 'p-006',
      name: 'Ventilateur sur pied 3 vitesses',
      categoryId: 'maison' as CategoryId,
      price: 34900,
      image: '/1e189e35-1467-4ec2-ba92-fcc938481270.jpg',
      stock: 0,
      rating: 4.1,
      reviews: 27,
      sold: 58,
      seller: 'Jambarr Officiel',
      description: 'Hauteur réglable, oscillation 90°, moteur silencieux. Garantie 12 mois.',
      active: true,
    },
    {
      id: 'p-007',
      name: 'Blender inox 1.5 L — 800W',
      categoryId: 'maison' as CategoryId,
      price: 41000,
      oldPrice: 47500,
      image: '/cddbec2d-2ce9-4c59-92df-6aa0be9f0d56.jpg',
      stock: 9,
      rating: 4.5,
      reviews: 42,
      sold: 83,
      seller: 'Maison Confort',
      description: 'Bol en verre résistant, 4 lames inox, 2 vitesses + pulse. Parfait pour bissap et smoothies.',
      active: true,
    },
    {
      id: 'p-008',
      name: 'Coffret beauté au karité',
      categoryId: 'beaute' as CategoryId,
      price: 12500,
      image: '/86379392-37ca-4320-b41c-0846edc21dcf.jpg',
      stock: 33,
      rating: 4.9,
      reviews: 118,
      sold: 260,
      seller: 'Karité Naturel',
      description: 'Beurre de karité brut, huile de baobab et savon noir. Fabriqué au Sénégal, sans parabènes.',
      active: true,
    },
    {
      id: 'p-009',
      name: 'Riz parfumé 25 kg',
      categoryId: 'epicerie' as CategoryId,
      price: 21500,
      image: '/c045b055-a461-466e-9a0d-855c06b4cdd8.jpg',
      stock: 60,
      rating: 4.2,
      reviews: 305,
      sold: 612,
      seller: 'Grossiste Thiaroye',
      description: 'Sac de 25 kg, riz long grain parfumé. Livraison gratuite à Dakar dès 2 sacs.',
      active: true,
    },
    {
      id: 'p-010',
      name: 'Chargeur rapide 65W USB-C',
      categoryId: 'electronique' as CategoryId,
      price: 9900,
      oldPrice: 14000,
      image: '/cdc1b42b-fe11-4af7-9909-9f60cad5abbd.jpg',
      stock: 45,
      rating: 4.0,
      reviews: 74,
      sold: 190,
      seller: 'Dakar Tech',
      description: 'Deux ports USB-C + un USB-A, protection contre la surchauffe, câble tressé inclus.',
      active: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
  }

  // Create customers
  const customers = [
    {
      id: 'c-01',
      name: 'Aminata Diallo',
      phone: '+221 77 412 08 55',
      city: 'Dakar',
      orders: 9,
      spent: 412500,
      since: new Date('2025-03-11'),
    },
    {
      id: 'c-02',
      name: 'Moussa Ndiaye',
      phone: '+221 78 220 74 10',
      city: 'Thiès',
      orders: 4,
      spent: 128000,
      since: new Date('2025-08-02'),
    },
    {
      id: 'c-03',
      name: 'Fatou Sarr',
      phone: '+221 76 909 31 44',
      city: 'Dakar',
      orders: 12,
      spent: 587900,
      since: new Date('2024-11-19'),
    },
    {
      id: 'c-04',
      name: 'Ibrahima Fall',
      phone: '+221 70 118 62 03',
      city: 'Saint-Louis',
      orders: 2,
      spent: 74500,
      since: new Date('2026-02-06'),
    },
    {
      id: 'c-05',
      name: 'Awa Mbaye',
      phone: '+221 77 654 12 87',
      city: 'Dakar',
      orders: 7,
      spent: 305400,
      since: new Date('2025-06-24'),
    },
    {
      id: 'c-06',
      name: 'Cheikh Gueye',
      phone: '+221 78 001 55 29',
      city: 'Mbour',
      orders: 1,
      spent: 34900,
      since: new Date('2026-07-15'),
    },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: customer,
    });
  }

  // Create orders
  const orders = [
    {
      id: 'JB-2418',
      customerId: 'c-01',
      customerName: 'Aminata Diallo',
      city: 'Dakar — Sacré-Cœur',
      createdAt: new Date('2026-09-04T09:12:00.000Z'),
      status: 'en_attente' as OrderStatus,
      payment: 'Wave' as PaymentMethod,
      lines: [
        { productId: 'p-001', quantity: 1 },
        { productId: 'p-010', quantity: 2 },
      ],
    },
    {
      id: 'JB-2417',
      customerId: 'c-02',
      customerName: 'Moussa Ndiaye',
      city: 'Thiès — Centre',
      createdAt: new Date('2026-09-04T07:40:00.000Z'),
      status: 'confirmee' as OrderStatus,
      payment: 'Orange_Money' as PaymentMethod,
      lines: [
        { productId: 'p-009', quantity: 2 },
      ],
    },
    {
      id: 'JB-2416',
      customerId: 'c-03',
      customerName: 'Fatou Sarr',
      city: 'Dakar — Ouakam',
      createdAt: new Date('2026-09-03T16:05:00.000Z'),
      status: 'expediee' as OrderStatus,
      payment: 'Paiement_a_la_livraison' as PaymentMethod,
      lines: [
        { productId: 'p-003', quantity: 1 },
        { productId: 'p-008', quantity: 2 },
      ],
    },
    {
      id: 'JB-2415',
      customerId: 'c-04',
      customerName: 'Ibrahima Fall',
      city: 'Saint-Louis',
      createdAt: new Date('2026-09-02T11:22:00.000Z'),
      status: 'livree' as OrderStatus,
      payment: 'Wave' as PaymentMethod,
      lines: [
        { productId: 'p-007', quantity: 1 },
      ],
    },
    {
      id: 'JB-2414',
      customerId: 'c-05',
      customerName: 'Awa Mbaye',
      city: 'Dakar — Plateau',
      createdAt: new Date('2026-09-01T14:48:00.000Z'),
      status: 'livree' as OrderStatus,
      payment: 'Orange_Money' as PaymentMethod,
      lines: [
        { productId: 'p-005', quantity: 1 },
        { productId: 'p-004', quantity: 1 },
      ],
    },
    {
      id: 'JB-2413',
      customerId: 'c-06',
      customerName: 'Cheikh Gueye',
      city: 'Mbour',
      createdAt: new Date('2026-08-31T10:02:00.000Z'),
      status: 'annulee' as OrderStatus,
      payment: 'Paiement_a_la_livraison' as PaymentMethod,
      lines: [
        { productId: 'p-006', quantity: 1 },
      ],
    },
  ];

  for (const order of orders) {
    const { lines, ...orderData } = order;
    
    // Calculate total
    let total = 0;
    const orderLines = [];
    
    for (const line of lines) {
      const product = await prisma.product.findUnique({
        where: { id: line.productId },
      });
      
      if (product) {
        const lineTotal = product.price * line.quantity;
        total += lineTotal;
        
        orderLines.push({
          productId: line.productId,
          name: product.name,
          price: product.price,
          quantity: line.quantity,
          image: product.image,
        });
      }
    }

    await prisma.order.upsert({
      where: { id: order.id },
      update: {},
      create: {
        ...orderData,
        total,
        lines: {
          create: orderLines,
        },
      },
    });
  }

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@jambarrstore.com' },
    update: {},
    create: {
      email: 'admin@jambarrstore.com',
      name: 'Jambarr Admin',
      password: adminPassword,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'client@jambarrstore.com' },
    update: {},
    create: {
      email: 'client@jambarrstore.com',
      name: 'Aminata Diallo',
      password: clientPassword,
      role: 'client',
      phone: '+221 77 412 08 55',
    },
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
