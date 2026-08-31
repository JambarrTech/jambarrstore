package com.example.data

data class Product(
  val id: String,
  val name: String,
  val category: String,
  val price: Double,
  val promoPrice: Double? = null,
  val description: String,
  val stock: Int,
  val reference: String,
  val imageUrl: String,
  val boutiqueName: String,
  val rating: Double = 4.8,
  val reviewCount: Int = 120,
  var isFavorite: Boolean = false,
  var isActive: Boolean = true
)

data class Category(
  val id: String,
  val name: String,
  val icon: String,
  val imageUrl: String,
  val productCount: Int
)

data class CartItem(
  val product: Product,
  var quantity: Int = 1
)

data class Order(
  val id: String,
  val reference: String,
  val clientName: String,
  val clientPhone: String,
  val clientAddress: String,
  val items: List<CartItem>,
  val totalAmount: Double,
  val paymentMethod: String, // "Wave" or "Orange Money"
  var status: String, // "En cours", "Préparation", "Livraison", "Terminée", "Annulée"
  val date: String
)

data class Customer(
  val id: String,
  val name: String,
  val phone: String,
  val ordersCount: Int,
  val totalSpent: Double,
  var status: String // "Actif", "Suspendu"
)

data class Manager(
  val id: String,
  val name: String,
  val email: String,
  val role: String, // "Admin", "Gérant"
  val permissions: List<String>,
  var status: String
)

data class PaymentTx(
  val id: String,
  val reference: String,
  val orderRef: String,
  val clientName: String,
  val method: String, // "Wave", "Orange Money"
  val amount: Double,
  val status: String, // "Réussi", "En attente", "Échoué"
  val date: String
)

data class Promotion(
  val id: String,
  val title: String,
  val discountPercent: Int,
  val targetCategory: String,
  val startDate: String,
  val endDate: String,
  var isActive: Boolean
)

data class ActivityLog(
  val id: String,
  val user: String,
  val action: String,
  val module: String,
  val date: String,
  val ipAddress: String,
  val result: String
)

data class NotificationItem(
  val id: String,
  val title: String,
  val message: String,
  val type: String, // "Commande", "Promotion", "Système"
  val date: String,
  var isRead: Boolean = false
)

object JambarrRepository {
  val categories = mutableListOf(
    Category("1", "Mode", "checkroom", "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80", 45),
    Category("2", "Tech & Électronique", "devices", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80", 82),
    Category("3", "Maison & Déco", "home", "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80", 34),
    Category("4", "Beauté & Soins", "face", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80", 29),
    Category("5", "Sport & Fitness", "fitness_center", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80", 51),
    Category("6", "Informatique", "laptop", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80", 67)
  )

  val products = mutableListOf(
    Product("p1", "Casque Sans Fil ANC Pro", "Tech & Électronique", 45000.0, 55000.0, "Casque audio haut de gamme à réduction active de bruit, autonomie 40h, son spatial haute fidélité.", 18, "JBT-TECH-01", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", "Dakar Tech Store", 4.9, 214, false),
    Product("p2", "Sneakers Urbaines Premium", "Mode", 32000.0, 40000.0, "Chaussures de ville élégantes en cuir véritable, confort exceptionnel et design minimaliste.", 25, "JBT-MODE-02", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", "Dakar Fashion", 4.7, 98, true),
    Product("p3", "Montre Connectée Sport Smart", "Tech & Électronique", 65000.0, 75000.0, "Suivi santé complet, GPS intégré, étanche 5ATM, écran AMOLED ultra lumineux.", 12, "JBT-TECH-03", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", "Dakar Tech Store", 4.8, 156, false),
    Product("p4", "Sac à Dos Cuir Minimaliste", "Mode", 28000.0, null, "Sac à dos professionnel pour ordinateur portable 15 pouces, imperméable et design épuré.", 30, "JBT-MODE-04", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", "Maison Dakar", 4.6, 82, false),
    Product("p5", "Lampe de Bureau LED Design", "Maison & Déco", 18500.0, 22000.0, "Lampe tactile avec chargeur sans fil intégré, température de couleur réglable.", 40, "JBT-HOME-05", "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80", "Design Deco SN", 4.9, 64, false),
    Product("p6", "Kit Sérum Visage Éclat Bio", "Beauté & Soins", 15000.0, null, "Sérum à la vitamine C naturelle et acide hyaluronique pour un teint lumineux et hydraté.", 55, "JBT-BEAUTY-06", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80", "Cosmetics Dakar", 4.9, 142, false)
  )

  val orders = mutableListOf(
    Order("o1", "JBT-9821", "Mamadou Diallo", "+221 77 888 99 00", "Almadies Route de Ngor, Dakar", listOf(CartItem(products[0], 1), CartItem(products[1], 1)), 79000.0, "Wave", "En cours", "31/08/2026"),
    Order("o2", "JBT-9820", "Aissatou Ndiaye", "+221 76 555 44 33", "Point E Rue A x B, Dakar", listOf(CartItem(products[2], 1)), 65000.0, "Orange Money", "Préparation", "31/08/2026"),
    Order("o3", "JBT-9819", "Cheikh Fall", "+221 70 123 45 67", "Mermoz Pyrotechnie, Dakar", listOf(CartItem(products[4], 2)), 37000.0, "Wave", "Terminée", "30/08/2026")
  )

  val customers = mutableListOf(
    Customer("c1", "Mamadou Diallo", "+221 77 888 99 00", 5, 245000.0, "Actif"),
    Customer("c2", "Aissatou Ndiaye", "+221 76 555 44 33", 3, 132000.0, "Actif"),
    Customer("c3", "Cheikh Fall", "+221 70 123 45 67", 8, 510000.0, "Actif"),
    Customer("c4", "Fatou Sow", "+221 78 222 33 44", 1, 15000.0, "Suspendu")
  )

  val managers = mutableListOf(
    Manager("m1", "Admin Principal", "admin@jambarrtech.com", "Admin", listOf("Tous les modules", "Gestion gérants", "Paramètres"), "Actif"),
    Manager("m2", "Ousmane Gérant", "gerant@jambarrtech.com", "Gérant", listOf("Produits", "Commandes", "Paiements"), "Actif")
  )

  val payments = mutableListOf(
    PaymentTx("tx1", "WAVE-SN-49281", "JBT-9821", "Mamadou Diallo", "Wave", 79000.0, "Réussi", "31/08/2026 10:15"),
    PaymentTx("tx2", "OM-SN-88392", "JBT-9820", "Aissatou Ndiaye", "Orange Money", 65000.0, "Réussi", "31/08/2026 09:40"),
    PaymentTx("tx3", "WAVE-SN-49210", "JBT-9819", "Cheikh Fall", "Wave", 37000.0, "Réussi", "30/08/2026 18:22")
  )

  val promotions = mutableListOf(
    Promotion("pr1", "Soldes Tech Rentrée", 15, "Tech & Électronique", "01/09/2026", "15/09/2026", true),
    Promotion("pr2", "Promo Flash Mode", 20, "Mode", "31/08/2026", "05/09/2026", true)
  )

  val activityLogs = mutableListOf(
    ActivityLog("l1", "Admin Principal", "Modification produit", "Produits", "31/08/2026 10:20", "197.234.12.5", "Succès"),
    ActivityLog("l2", "Ousmane Gérant", "Validation commande JBT-9820", "Commandes", "31/08/2026 09:45", "197.234.12.8", "Succès"),
    ActivityLog("l3", "Admin Principal", "Création promotion", "Promotions", "30/08/2026 14:10", "197.234.12.5", "Succès")
  )

  val notifications = mutableListOf(
    NotificationItem("n1", "Commande confirmée", "Votre commande #JBT-9821 est en cours de traitement.", "Commande", "Il y a 10 min", false),
    NotificationItem("n2", "Promotion -20% Mode", "Profitez de remises exceptionnelles sur toute la collection mode.", "Promotion", "Il y a 2h", false),
    NotificationItem("n3", "Colis livré", "Votre commande #JBT-9819 a été livrée avec succès.", "Commande", "Hier", true)
  )

  // Cart state
  val cartItems = mutableListOf<CartItem>(CartItem(products[0], 1))
}
