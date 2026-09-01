require('dotenv').config({ path: './backend/.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const users = await prisma.user.count();
    const categories = await prisma.category.count();
    const products = await prisma.product.count();
    const orders = await prisma.order.count();
    const reviews = await prisma.review.count();
    const promotions = await prisma.promotion.count();
    const payments = await prisma.paymentTransaction.count();
    const logs = await prisma.activityLog.count();

    console.log('\n📊 === STATISTIQUES BASE DE DONNÉES ===\n');
    console.log(`👥 Utilisateurs       : ${users}`);
    console.log(`📂 Catégories         : ${categories}`);
    console.log(`📦 Produits           : ${products}`);
    console.log(`🛒 Commandes          : ${orders}`);
    console.log(`⭐ Avis clients       : ${reviews}`);
    console.log(`🎉 Promotions         : ${promotions}`);
    console.log(`💳 Paiements          : ${payments}`);
    console.log(`📋 Logs activités     : ${logs}`);

    console.log('\n📋 === PRODUITS VEDETTES ===\n');
    const featured = await prisma.product.findMany({
      where: { isFeatured: true },
      include: { category: true },
      take: 5
    });

    featured.forEach((p) => {
      console.log(`✓ ${p.name} - ${p.price} XOF (${p.category.name})`);
    });

    console.log('\n⚡ === PRODUITS EN PROMOTION FLASH ===\n');
    const flash = await prisma.product.findMany({
      where: { isFlash: true },
      include: { category: true },
      take: 5
    });

    flash.forEach((p) => {
      const reduction = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
      console.log(`⚡ ${p.name} - ${p.price} XOF (-${reduction}%)`);
    });

    console.log('\n✅ Base de données prête à l\'utilisation!\n');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
