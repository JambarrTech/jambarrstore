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
  await prisma.settings.deleteMany();

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
      // ===== HIGH-TECH (c1) =====
      { id: 'p1', name: 'Apple AirPods Max', reference: 'APT-001', price: 345000, oldPrice: 395000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Casque audio sans fil haute fidélité avec réduction active du bruit.' },
      { id: 'p2', name: 'Apple Watch Ultra 2', reference: 'APT-002', price: 415000, oldPrice: 450000, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Montre connectée robuste pour sport extrême et aventure.' },
      { id: 'p5', name: 'iPhone 15 Pro Max', reference: 'APT-004', price: 890000, oldPrice: 990000, stock: 4, imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569', categoryId: 'c1', isFeatured: true, isFlash: true, description: 'Smartphone haut de gamme titane avec puce A17 Pro.' },
      { id: 'p9', name: 'Samsung Galaxy S24 Ultra', reference: 'APT-005', price: 750000, oldPrice: 850000, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c', categoryId: 'c1', isFeatured: true, isFlash: false, description: 'Smartphone Samsung avec IA intégrée et stylo S Pen.' },
      { id: 'p10', name: 'Sony WH-1000XM5', reference: 'APT-006', price: 185000, oldPrice: 220000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb', categoryId: 'c1', isFeatured: false, isFlash: true, description: 'Casque sans fil premium réduction de bruit leaders.' },
      { id: 'p11', name: 'iPad Pro M4 11"', reference: 'APT-007', price: 650000, oldPrice: 720000, stock: 6, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0', categoryId: 'c1', isFeatured: true, isFlash: false, description: 'Tablette Apple performante pour créatifs et pros.' },
      { id: 'p12', name: 'AirPods Pro 2', reference: 'APT-008', price: 125000, oldPrice: 145000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1', categoryId: 'c1', isFeatured: false, isFlash: true, description: 'Écouteurs sans fil avec réduction adaptive du bruit.' },
      { id: 'p13', name: 'Samsung Galaxy Watch 6', reference: 'APT-009', price: 145000, oldPrice: 170000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a', categoryId: 'c1', isFeatured: false, isFlash: false, description: 'Montre connectée avec suivi santé avancé.' },
      { id: 'p14', name: 'Google Pixel 8 Pro', reference: 'APT-010', price: 520000, oldPrice: 580000, stock: 7, imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97', categoryId: 'c1', isFeatured: false, isFlash: false, description: 'Smartphone Android avec meilleure caméra IA.' },

      // ===== MODE & VÊTEMENTS (c2) =====
      { id: 'p4', name: 'Sneakers Urban Street', reference: 'MOD-001', price: 45000, oldPrice: 55000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', categoryId: 'c2', isFeatured: false, isFlash: true, description: 'Baskets tendance grand confort.' },
      { id: 'p15', name: 'Veste en Cuir Premium', reference: 'MOD-002', price: 85000, oldPrice: 110000, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5', categoryId: 'c2', isFeatured: true, isFlash: false, description: 'Veste en cuir véritable coupée classique, doublure soie.' },
      { id: 'p16', name: 'Robe Wax Africaine', reference: 'MOD-003', price: 35000, oldPrice: 42000, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2', categoryId: 'c2', isFeatured: true, isFlash: true, description: 'Robe traditionnelle en tissu wax design moderne.' },
      { id: 'p17', name: 'Baboune Sénégalaise', reference: 'MOD-004', price: 28000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b', categoryId: 'c2', isFeatured: false, isFlash: false, description: 'Baboune brodéemain sénégalaise, coton 100%.' },
      { id: 'p18', name: 'Pantalon Chinoise Homme', reference: 'MOD-005', price: 22000, oldPrice: 28000, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a', categoryId: 'c2', isFeatured: false, isFlash: false, description: 'Pantalon chino stretch confort, coupe slim.' },
      { id: 'p19', name: ' Sac à Main Cuir', reference: 'MOD-006', price: 45000, oldPrice: 55000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', categoryId: 'c2', isFeatured: false, isFlash: true, description: 'Sac à main en cuir synthétique haute qualité.' },
      { id: 'p20', name: 'T-Shirt Polo Lacoste', reference: 'MOD-007', price: 32000, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1625910513413-5fc42fda0be2', categoryId: 'c2', isFeatured: false, isFlash: false, description: 'Polo classique coton piqué, logo brodé.' },
      { id: 'p21', name: 'Ensemble Sport Nike', reference: 'MOD-008', price: 55000, oldPrice: 68000, stock: 14, imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c', categoryId: 'c2', isFeatured: true, isFlash: false, description: 'Set sport complet haut + bas, tissu Dri-FIT.' },

      // ===== MAISON & BUREAU (c3) =====
      { id: 'p6', name: 'Lampe Bureau LED', reference: 'MS-001', price: 18500, oldPrice: 22000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', categoryId: 'c3', isFeatured: false, isFlash: false, description: 'Lampe tactile avec chargeur sans fil intégré.' },
      { id: 'p22', name: 'Ventilateur sur Pied', reference: 'MS-002', price: 25000, oldPrice: 32000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e', categoryId: 'c3', isFeatured: false, isFlash: false, description: 'Ventilateur 3 vitesses, oscillation 90°, silencieux.' },
      { id: 'p23', name: 'Aspirateur Robot', reference: 'MS-003', price: 120000, oldPrice: 150000, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001', categoryId: 'c3', isFeatured: true, isFlash: true, description: 'Aspirateur robot connecté avec cartographie laser.' },
      { id: 'p24', name: 'Table Basse Minimaliste', reference: 'MS-004', price: 65000, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', categoryId: 'c3', isFeatured: false, isFlash: false, description: 'Table basse en bois massif et métal noir.' },
      { id: 'p25', name: 'Cafétière Nespresso', reference: 'MS-005', price: 85000, oldPrice: 95000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6', categoryId: 'c3', isFeatured: true, isFlash: false, description: 'Machine à café capsules, 19 bars de pression.' },
      { id: 'p26', name: 'Climatiseur Mobile', reference: 'MS-006', price: 185000, oldPrice: 210000, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1631545806609-9ba2141f1e4a', categoryId: 'c3', isFeatured: false, isFlash: true, description: 'Climatiseur portable 3-en-1 : refroidissement, déshumidification, ventilation.' },

      // ===== BEAUTÉ & SANTÉ (c4) =====
      { id: 'p7', name: 'Kit Sérum Visage Bio', reference: 'BT-001', price: 15000, stock: 55, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', categoryId: 'c4', isFeatured: false, isFlash: false, description: 'Sérum vitamine C et acide hyaluronique.' },
      { id: 'p27', name: 'Parfum Homme Noir', reference: 'BT-002', price: 45000, oldPrice: 55000, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f', categoryId: 'c4', isFeatured: true, isFlash: false, description: 'Eau de parfum masculin notes boisées et épicées.' },
      { id: 'p28', name: 'Crème Hydratante Karité', reference: 'BT-003', price: 12000, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd', categoryId: 'c4', isFeatured: false, isFlash: false, description: 'Crème corporelle au beurre de karité pur du Sénégal.' },
      { id: 'p29', name: 'Pack Soins Cheveux', reference: 'BT-004', price: 25000, oldPrice: 30000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f', categoryId: 'c4', isFeatured: false, isFlash: true, description: 'Shampoing + après-shampoing + huile d\'argan.' },
      { id: 'p30', name: 'Miroir LED Smart', reference: 'BT-005', price: 38000, oldPrice: 45000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348', categoryId: 'c4', isFeatured: true, isFlash: false, description: 'Miroir avec éclairage LED 3 niveaux et zoom x10.' },
      { id: 'p31', name: 'Diffuseur Huiles Essentielles', reference: 'BT-006', price: 22000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1602928321679-560bb453f190', categoryId: 'c4', isFeatured: false, isFlash: false, description: 'Diffuseur aromathérapie ultrasonique avec LED ambiances.' },

      // ===== SPORT & LOISIRS (c5) =====
      { id: 'p8', name: 'Ballon Football Pro', reference: 'SP-001', price: 12000, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab', categoryId: 'c5', isFeatured: false, isFlash: true, description: 'Ballon officiel certification FIFA, taille 5.' },
      { id: 'p32', name: 'Tapis de Yoga Premium', reference: 'SP-002', price: 18000, oldPrice: 24000, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f', categoryId: 'c5', isFeatured: false, isFlash: false, description: 'Tapis anti-dérapant 6mm, eco-friendly, sac de transport inclus.' },
      { id: 'p33', name: 'Haltères Adjustable', reference: 'SP-003', price: 55000, oldPrice: 65000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', categoryId: 'c5', isFeatured: true, isFlash: true, description: 'Set haltères 2-20kg ajustables en acier chromé.' },
      { id: 'p34', name: 'Vélo Électrique VTC', reference: 'SP-004', price: 350000, oldPrice: 420000, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e', categoryId: 'c5', isFeatured: true, isFlash: false, description: 'Vélo à assistance électrique, autonomie 60km, 25km/h.' },
      { id: 'p35', name: 'RAQUETTE Tennis Pro', reference: 'SP-005', price: 42000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6', categoryId: 'c5', isFeatured: false, isFlash: false, description: 'Raquette graphite légère, head 100, grip inclus.' },
      { id: 'p36', name: 'Trousse de Sport Adidas', reference: 'SP-006', price: 15000, oldPrice: 20000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', categoryId: 'c5', isFeatured: false, isFlash: true, description: 'Grande capacité, imperméable, compartiments multiples.' },

      // ===== INFORMATIQUE (c6) =====
      { id: 'p3', name: 'MacBook Pro M3', reference: 'APT-003', price: 1250000, oldPrice: 1350000, stock: 2, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', categoryId: 'c6', isFeatured: true, isFlash: false, description: 'Ordinateur portable surpuissant avec puce Apple M3 Pro.' },
      { id: 'p37', name: 'PC Portable Dell XPS', reference: 'INF-001', price: 680000, oldPrice: 780000, stock: 4, imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89', categoryId: 'c6', isFeatured: true, isFlash: false, description: 'PC 15" OLED, i7, 16GB RAM, 512GB SSD.' },
      { id: 'p38', name: 'Clavier Mécanique RGB', reference: 'INF-002', price: 35000, oldPrice: 42000, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef', categoryId: 'c6', isFeatured: false, isFlash: true, description: 'Clavier gaming switches Cherry MX, rétroéclairage RGB.' },
      { id: 'p39', name: 'Souris Logitech MX Master', reference: 'INF-003', price: 45000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', categoryId: 'c6', isFeatured: false, isFlash: false, description: 'Souris sans fil ergonomique, précision 4000 DPI.' },
      { id: 'p40', name: 'Écran 27" 4K LG', reference: 'INF-004', price: 285000, oldPrice: 330000, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', categoryId: 'c6', isFeatured: true, isFlash: true, description: 'Moniteur IPS 27 pouces, résolution 4K, HDR10.' },
      { id: 'p41', name: 'Disque Dur SSD 1To', reference: 'INF-005', price: 65000, oldPrice: 78000, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b', categoryId: 'c6', isFeatured: false, isFlash: false, description: 'SSD NVMe 1To, vitesse lecture 3500 Mo/s.' },
      { id: 'p42', name: 'Webcam 4K Logitech', reference: 'INF-006', price: 75000, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da', categoryId: 'c6', isFeatured: false, isFlash: true, description: 'Caméra 4K autofocus, micro stéréo intégré.' },
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
  const order4 = await prisma.order.create({
    data: {
      id: 'o4', reference: 'CMD-8824', clientName: 'Aissatou Fall', clientPhone: '+221774567890',
      clientAddress: 'Plateau Rue Amadou Assane Ndoye, Dakar', totalAmount: 197000, status: 'DELIVERED',
      paymentMethod: 'Wave', paymentStatus: 'PAID',
      items: { create: [{ productId: 'p10', quantity: 1, price: 185000 }, { productId: 'p32', quantity: 1, price: 12000 }] }
    }
  });
  const order5 = await prisma.order.create({
    data: {
      id: 'o5', reference: 'CMD-8825', clientName: 'Ibrahima Sy', clientPhone: '+221783216549',
      clientAddress: 'Medina Rue 10, Dakar', totalAmount: 85000, status: 'PROCESSING',
      paymentMethod: 'Orange Money', paymentStatus: 'PAID',
      items: { create: [{ productId: 'p27', quantity: 1, price: 45000 }, { productId: 'p30', quantity: 1, price: 38000 }] }
    }
  });
  const order6 = await prisma.order.create({
    data: {
      id: 'o6', reference: 'CMD-8826', clientName: 'Mariama Ba', clientPhone: '+221761234567',
      clientAddress: 'Grand Yoff Cité Keur Damel, Dakar', totalAmount: 700000, status: 'PENDING',
      paymentMethod: 'Wave', paymentStatus: 'PAID',
      items: { create: [{ productId: 'p37', quantity: 1, price: 680000 }, { productId: 'p38', quantity: 1, price: 35000 }] }
    }
  });
  const order7 = await prisma.order.create({
    data: {
      id: 'o7', reference: 'CMD-8827', clientName: 'Ousmane Ndiaye', clientPhone: '+221709876543',
      clientAddress: 'Parcelles Assises Unité 15, Dakar', totalAmount: 465000, status: 'DELIVERED',
      paymentMethod: 'Orange Money', paymentStatus: 'PAID',
      items: { create: [{ productId: 'p9', quantity: 1, price: 750000 }, { productId: 'p29', quantity: 2, price: 25000 }] }
    }
  });
  const order8 = await prisma.order.create({
    data: {
      id: 'o8', reference: 'CMD-8828', clientName: 'Khady Diop', clientPhone: '+221778901234',
      clientAddress: 'Ouakam Cité Lamy, Dakar', totalAmount: 162000, status: 'PROCESSING',
      paymentMethod: 'Wave', paymentStatus: 'PAID',
      items: { create: [{ productId: 'p16', quantity: 1, price: 35000 }, { productId: 'p28', quantity: 3, price: 12000 }, { productId: 'p31', quantity: 1, price: 22000 }] }
    }
  });

  // Payments
  await prisma.paymentTransaction.createMany({
    data: [
      { id: 'tx1', reference: 'TX-WV-9912', orderId: 'o1', clientName: 'Mamadou Diallo', amount: 390000, method: 'Wave', status: 'Réussi' },
      { id: 'tx2', reference: 'TX-OM-4410', orderId: 'o2', clientName: 'Fatou Ndiaye', amount: 45000, method: 'Orange Money', status: 'Réussi' },
      { id: 'tx3', reference: 'TX-WV-9913', orderId: 'o3', clientName: 'Cheikh Sarr', amount: 1305000, method: 'Wave', status: 'Réussi' },
      { id: 'tx4', reference: 'TX-WV-9914', orderId: 'o4', clientName: 'Aissatou Fall', amount: 197000, method: 'Wave', status: 'Réussi' },
      { id: 'tx5', reference: 'TX-OM-4411', orderId: 'o5', clientName: 'Ibrahima Sy', amount: 85000, method: 'Orange Money', status: 'Réussi' },
      { id: 'tx6', reference: 'TX-WV-9915', orderId: 'o6', clientName: 'Mariama Ba', amount: 700000, method: 'Wave', status: 'Réussi' },
      { id: 'tx7', reference: 'TX-OM-4412', orderId: 'o7', clientName: 'Ousmane Ndiaye', amount: 465000, method: 'Orange Money', status: 'Réussi' },
      { id: 'tx8', reference: 'TX-WV-9916', orderId: 'o8', clientName: 'Khady Diop', amount: 162000, method: 'Wave', status: 'Réussi' },
    ]
  });

  // Reviews
  await prisma.review.createMany({
    data: [
      { id: 'r1', productId: 'p1', clientName: 'Mamadou Diallo', rating: 5, comment: 'Super service ! AirPods Max reçus en moins de 24h à Dakar.', status: 'approved' },
      { id: 'r2', productId: 'p4', clientName: 'Fatou Ndiaye', rating: 5, comment: 'Paiement super simple avec Wave, livraison express irréprochable.', status: 'approved' },
      { id: 'r3', productId: 'p2', clientName: 'Cheikh Sarr', rating: 4, comment: 'Très bon produit mais livraison avec 2h de retard.', status: 'pending' },
      { id: 'r4', productId: 'p9', clientName: 'Ousmane Ndiaye', rating: 5, comment: 'Le Galaxy S24 Ultra est incroyable. La qualité de la caméra est bluffante !', status: 'approved' },
      { id: 'r5', productId: 'p10', clientName: 'Aissatou Fall', rating: 5, comment: 'Meilleur casque que j\'ai possédé. Le silence est total.', status: 'approved' },
      { id: 'r6', productId: 'p23', clientName: 'Ibrahima Sy', rating: 4, comment: 'L\'aspirateur robot est pratique, dommage qu\'il se coince parfois sous les chaises.', status: 'approved' },
      { id: 'r7', productId: 'p16', clientName: 'Khady Diop', rating: 5, comment: 'La robe wax est magnifique, le tissu est de très bonne qualité.', status: 'approved' },
      { id: 'r8', productId: 'p33', clientName: 'Mamadou Diallo', rating: 5, comment: 'Les haltères sont solides, parfait pour mon home gym.', status: 'approved' },
      { id: 'r9', productId: 'p37', clientName: 'Mariama Ba', rating: 5, comment: 'Le Dell XPS est une merveille, écran magnifique pour le design.', status: 'pending' },
      { id: 'r10', productId: 'p27', clientName: 'Fatou Ndiaye', rating: 4, comment: 'Parfum très agréable, les notes boisées sont bien équilibrées.', status: 'approved' },
      { id: 'r11', productId: 'p40', clientName: 'Ibrahima Sy', rating: 5, comment: 'L\'écran 4K est parfait pour le montage vidéo, les couleurs sont fidèles.', status: 'approved' },
      { id: 'r12', productId: 'p34', clientName: 'Cheikh Sarr', rating: 5, comment: 'Le vélo électrique est top pour se déplacer à Dakar, autonomie au top !', status: 'pending' },
    ]
  });

  // Promotions
  await prisma.promotion.createMany({
    data: [
      { id: 'pr1', title: 'Méga Soldes Tech', discountPercent: 20, targetCategory: 'High-Tech', startDate: '01/09/2026', endDate: '15/09/2026', isActive: true },
      { id: 'pr2', title: 'Rentrée Mode', discountPercent: 15, targetCategory: 'Mode & Vêtements', startDate: '31/08/2026', endDate: '05/09/2026', isActive: true },
      { id: 'pr3', title: 'Beauté & Soins -25%', discountPercent: 25, targetCategory: 'Beauté & Santé', startDate: '01/09/2026', endDate: '10/09/2026', isActive: true },
      { id: 'pr4', title: 'Sport Weekend', discountPercent: 10, targetCategory: 'Sport & Loisirs', startDate: '05/09/2026', endDate: '07/09/2026', isActive: false },
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
  await prisma.settings.create({
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
