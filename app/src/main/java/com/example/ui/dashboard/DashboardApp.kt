package com.example.ui.dashboard

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import com.example.data.*
import com.example.ui.common.*
import com.example.ui.theme.*

sealed class DashboardScreen {
  object Login : DashboardScreen()
  object Home : DashboardScreen()
  object Products : DashboardScreen()
  object AddEditProduct : DashboardScreen()
  object Categories : DashboardScreen()
  object Orders : DashboardScreen()
  object Customers : DashboardScreen()
  object Managers : DashboardScreen()
  object Payments : DashboardScreen()
  object Promotions : DashboardScreen()
  object Notifications : DashboardScreen()
  object Statistics : DashboardScreen()
  object Settings : DashboardScreen()
  object ActivityLogs : DashboardScreen()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardAppRoot(onSwitchToMobile: () -> Unit) {
  var isLoggedIn by remember { mutableStateOf(false) }
  var currentScreen by remember { mutableStateOf<DashboardScreen>(DashboardScreen.Login) }
  var selectedNav by remember { mutableStateOf("Dashboard") }
  var drawerOpen by remember { mutableStateOf(false) }

  if (!isLoggedIn) {
    DashboardLoginScreen(onLoginSuccess = {
      isLoggedIn = true
      currentScreen = DashboardScreen.Home
    }, onSwitchToMobile = onSwitchToMobile)
  } else {
    Scaffold(
      topBar = {
        TopAppBar(
          title = { Text(text = "JambarrTech • Dashboard Admin & Gérant", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
          navigationIcon = {
            IconButton(onClick = { drawerOpen = !drawerOpen }) {
              Icon(imageVector = Icons.Default.Menu, contentDescription = "Menu")
            }
          },
          actions = {
            TextButton(onClick = onSwitchToMobile) {
              Text(text = "📱 Mode Mobile", color = JambarrPrimary)
            }
          },
          colors = TopAppBarDefaults.topAppBarColors(containerColor = JambarrSurface)
        )
      }
    ) { padding ->
      Row(modifier = Modifier.padding(padding).fillMaxSize().background(JambarrBackground)) {
        // Sidebar for desktop/tablet or expandable drawer
        DashboardSidebar(
          selectedNav = selectedNav,
          onNavSelected = { nav ->
            selectedNav = nav
            currentScreen = when (nav) {
              "Dashboard" -> DashboardScreen.Home
              "Produits" -> DashboardScreen.Products
              "Catégories" -> DashboardScreen.Categories
              "Commandes" -> DashboardScreen.Orders
              "Clients" -> DashboardScreen.Customers
              "Gestionnaires" -> DashboardScreen.Managers
              "Paiements" -> DashboardScreen.Payments
              "Promotions" -> DashboardScreen.Promotions
              "Notifications" -> DashboardScreen.Notifications
              "Statistiques" -> DashboardScreen.Statistics
              "Paramètres" -> DashboardScreen.Settings
              "Journal d'activité" -> DashboardScreen.ActivityLogs
              else -> DashboardScreen.Home
            }
          }
        )

        Box(modifier = Modifier.weight(1f).fillMaxHeight().padding(16.dp)) {
          when (currentScreen) {
            is DashboardScreen.Home -> DashboardHomeView(onNavigate = { currentScreen = it })
            is DashboardScreen.Products -> ProductsManagementView(onAddProduct = { currentScreen = DashboardScreen.AddEditProduct })
            is DashboardScreen.AddEditProduct -> AddEditProductView(onBack = { currentScreen = DashboardScreen.Products })
            is DashboardScreen.Categories -> CategoriesManagementView()
            is DashboardScreen.Orders -> OrdersManagementView()
            is DashboardScreen.Customers -> CustomersManagementView()
            is DashboardScreen.Managers -> ManagersManagementView()
            is DashboardScreen.Payments -> PaymentsManagementView()
            is DashboardScreen.Promotions -> PromotionsManagementView()
            is DashboardScreen.Notifications -> NotificationsManagementView()
            is DashboardScreen.Statistics -> StatisticsManagementView()
            is DashboardScreen.Settings -> SettingsManagementView()
            is DashboardScreen.ActivityLogs -> ActivityLogsView()
            else -> DashboardHomeView(onNavigate = { currentScreen = it })
          }
        }
      }
    }
  }
}

@Composable
fun DashboardLoginScreen(onLoginSuccess: () -> Unit, onSwitchToMobile: () -> Unit) {
  var email by remember { mutableStateOf("admin@jambarrtech.com") }
  var password by remember { mutableStateOf("********") }

  Box(
    modifier = Modifier.fillMaxSize().background(JambarrBackground),
    contentAlignment = Alignment.Center
  ) {
    Card(
      modifier = Modifier.width(420.dp).padding(16.dp),
      shape = RoundedCornerShape(16.dp),
      colors = CardDefaults.cardColors(containerColor = JambarrSurface),
      elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
      Column(modifier = Modifier.padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
          modifier = Modifier.size(64.dp).clip(RoundedCornerShape(16.dp)).background(JambarrPrimary),
          contentAlignment = Alignment.Center
        ) {
          Icon(imageVector = Icons.Default.AdminPanelSettings, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp))
        }
        Spacer(modifier = Modifier.height(20.dp))
        Text(text = "JambarrTech Dashboard", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        Spacer(modifier = Modifier.height(6.dp))
        Text(text = "Connexion Administrateur & Gérant", fontSize = 13.sp, color = JambarrTextSecondary)

        Spacer(modifier = Modifier.height(24.dp))
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email ou téléphone") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))
        Spacer(modifier = Modifier.height(14.dp))
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Mot de passe") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))

        Spacer(modifier = Modifier.height(24.dp))
        JambarrButton(text = "Se connecter", onClick = onLoginSuccess)

        Spacer(modifier = Modifier.height(16.dp))
        TextButton(onClick = onSwitchToMobile) {
          Text(text = "← Retour à l'application mobile client", color = JambarrPrimary, fontSize = 13.sp)
        }
      }
    }
  }
}

@Composable
fun DashboardSidebar(selectedNav: String, onNavSelected: (String) -> Unit) {
  val items = listOf(
    "Dashboard", "Produits", "Catégories", "Commandes", "Clients",
    "Gestionnaires", "Paiements", "Promotions", "Notifications",
    "Statistiques", "Paramètres", "Journal d'activité"
  )

  Column(
    modifier = Modifier
      .width(240.dp)
      .fillMaxHeight()
      .background(JambarrSurface)
      .verticalScroll(rememberScrollState())
      .padding(vertical = 12.dp)
  ) {
    items.forEach { item ->
      val selected = selectedNav == item
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .clickable { onNavSelected(item) }
          .background(if (selected) JambarrPrimary.copy(alpha = 0.1f) else Color.Transparent)
          .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        Icon(
          imageVector = when(item) {
            "Dashboard" -> Icons.Default.Dashboard
            "Produits" -> Icons.Default.Inventory
            "Catégories" -> Icons.Default.Category
            "Commandes" -> Icons.Default.ShoppingBag
            "Clients" -> Icons.Default.People
            "Gestionnaires" -> Icons.Default.SupervisorAccount
            "Paiements" -> Icons.Default.Payment
            "Promotions" -> Icons.Default.LocalOffer
            "Notifications" -> Icons.Default.Notifications
            "Statistiques" -> Icons.Default.BarChart
            "Paramètres" -> Icons.Default.Settings
            else -> Icons.Default.History
          },
          contentDescription = null,
          tint = if (selected) JambarrPrimary else JambarrTextSecondary,
          modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Text(
          text = item,
          fontSize = 14.sp,
          fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
          color = if (selected) JambarrPrimary else JambarrTextPrimary
        )
      }
    }
  }
}

@Composable
fun DashboardHomeView(onNavigate: (DashboardScreen) -> Unit) {
  LazyColumn(
    modifier = Modifier.fillMaxSize(),
    verticalArrangement = Arrangement.spacedBy(20.dp)
  ) {
    item {
      Text(text = "Tableau de Bord Général", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(12.dp))
      Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        StatCard(title = "Chiffre d'affaires", value = "2 450 000 FCFA", change = "+12.5%", modifier = Modifier.weight(1f))
        StatCard(title = "Commandes", value = "${JambarrRepository.orders.size + 142}", change = "+8.1%", modifier = Modifier.weight(1f))
        StatCard(title = "Clients", value = "${JambarrRepository.customers.size + 1280}", change = "+15.3%", modifier = Modifier.weight(1f))
        StatCard(title = "Produits", value = "${JambarrRepository.products.size}", change = "+4", modifier = Modifier.weight(1f))
      }
    }

    item {
      Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(text = "Commandes Récentes", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        TextButton(onClick = { onNavigate(DashboardScreen.Orders) }) {
          Text("Voir tout")
        }
      }
      Spacer(modifier = Modifier.height(8.dp))
      Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
        Column(modifier = Modifier.padding(16.dp)) {
          JambarrRepository.orders.forEach { order ->
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
              Column {
                Text(text = "Commande #${order.reference}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = order.clientName, fontSize = 12.sp, color = JambarrTextSecondary)
              }
              Column(horizontalAlignment = Alignment.End) {
                Text(text = "${order.totalAmount.toInt()} FCFA", fontWeight = FontWeight.Bold, color = JambarrPrimary)
                Text(text = order.status, fontSize = 12.sp, color = JambarrSuccess)
              }
            }
            Divider(color = JambarrBorder)
          }
        }
      }
    }
  }
}

@Composable
fun StatCard(title: String, value: String, change: String, modifier: Modifier = Modifier) {
  Card(
    modifier = modifier,
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(containerColor = JambarrSurface),
    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
  ) {
    Column(modifier = Modifier.padding(16.dp)) {
      Text(text = title, fontSize = 13.sp, color = JambarrTextSecondary)
      Spacer(modifier = Modifier.height(8.dp))
      Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(4.dp))
      Text(text = change, fontSize = 12.sp, color = JambarrSuccess, fontWeight = FontWeight.SemiBold)
    }
  }
}

@Composable
fun ProductsManagementView(onAddProduct: () -> Unit) {
  Column(modifier = Modifier.fillMaxSize()) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
      Text(text = "Gestion des Produits", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Button(onClick = onAddProduct, colors = ButtonDefaults.buttonColors(containerColor = JambarrPrimary)) {
        Icon(imageVector = Icons.Default.Add, contentDescription = null)
        Spacer(modifier = Modifier.width(6.dp))
        Text("Ajouter un produit")
      }
    }

    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(JambarrRepository.products) { product ->
          Row(
            modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
              AsyncImage(model = product.imageUrl, contentDescription = null, modifier = Modifier.size(45.dp).clip(RoundedCornerShape(8.dp)), contentScale = ContentScale.Crop)
              Spacer(modifier = Modifier.width(12.dp))
              Column {
                Text(text = product.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(text = "Réf: ${product.reference} • Stock: ${product.stock}", fontSize = 12.sp, color = JambarrTextSecondary)
              }
            }
            Text(text = "${product.price.toInt()} FCFA", fontWeight = FontWeight.Bold, color = JambarrPrimary)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun AddEditProductView(onBack: () -> Unit) {
  var name by remember { mutableStateOf("") }
  var price by remember { mutableStateOf("") }
  var stock by remember { mutableStateOf("") }
  var description by remember { mutableStateOf("") }

  Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
    JambarrTopBar(title = "Ajouter / Modifier un produit", onBackClick = onBack)
    Spacer(modifier = Modifier.height(16.dp))

    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      Column(modifier = Modifier.padding(20.dp)) {
        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nom du produit") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = price, onValueChange = { price = it }, label = { Text("Prix (FCFA)") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = stock, onValueChange = { stock = it }, label = { Text("Stock initial") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Description") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(24.dp))
        JambarrButton(text = "Enregistrer le produit", onClick = onBack)
      }
    }
  }
}

@Composable
fun CategoriesManagementView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Gestion des Catégories", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(JambarrRepository.categories) { cat ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = cat.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text(text = "${cat.productCount} produits", color = JambarrTextSecondary)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun OrdersManagementView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Gestion des Commandes", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(JambarrRepository.orders) { order ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
              Text(text = "Commande #${order.reference}", fontWeight = FontWeight.Bold)
              Text(text = "${order.clientName} • ${order.paymentMethod}", fontSize = 12.sp, color = JambarrTextSecondary)
            }
            Text(text = "${order.totalAmount.toInt()} FCFA", fontWeight = FontWeight.Bold, color = JambarrPrimary)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun CustomersManagementView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Gestion des Clients", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(JambarrRepository.customers) { cust ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
              Text(text = cust.name, fontWeight = FontWeight.Bold)
              Text(text = cust.phone, fontSize = 12.sp, color = JambarrTextSecondary)
            }
            Text(text = "${cust.ordersCount} commandes", fontWeight = FontWeight.SemiBold, color = JambarrPrimary)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun ManagersManagementView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Gestionnaires (Admin & Gérants)", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(JambarrRepository.managers) { mgr ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
              Text(text = mgr.name, fontWeight = FontWeight.Bold)
              Text(text = mgr.email, fontSize = 12.sp, color = JambarrTextSecondary)
            }
            Surface(color = JambarrPrimary.copy(alpha = 0.1f), shape = RoundedCornerShape(6.dp)) {
              Text(text = mgr.role, color = JambarrPrimary, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
            }
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun PaymentsManagementView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Transactions (Wave & Orange Money)", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(JambarrRepository.payments) { tx ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
              Text(text = tx.reference, fontWeight = FontWeight.Bold)
              Text(text = "${tx.clientName} • ${tx.method}", fontSize = 12.sp, color = JambarrTextSecondary)
            }
            Text(text = "${tx.amount.toInt()} FCFA", fontWeight = FontWeight.Bold, color = JambarrSuccess)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun PromotionsManagementView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Gestion des Promotions", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(JambarrRepository.promotions) { promo ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
              Text(text = promo.title, fontWeight = FontWeight.Bold)
              Text(text = "Réduction: -${promo.discountPercent}% • Catégorie: ${promo.targetCategory}", fontSize = 12.sp, color = JambarrTextSecondary)
            }
            Text(text = if (promo.isActive) "Actif" else "Inactif", color = if (promo.isActive) JambarrSuccess else Color.Gray, fontWeight = FontWeight.Bold)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun NotificationsManagementView() {
  var title by remember { mutableStateOf("") }
  var message by remember { mutableStateOf("") }

  Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
    Text(text = "Diffusion de Notifications Push", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      Column(modifier = Modifier.padding(20.dp)) {
        OutlinedTextField(value = title, onValueChange = { title = it }, label = { Text("Titre de la notification") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = message, onValueChange = { message = it }, label = { Text("Message de la notification") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
        Spacer(modifier = Modifier.height(20.dp))
        JambarrButton(text = "Envoyer à tous les clients", onClick = {})
      }
    }
  }
}

@Composable
fun StatisticsManagementView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Statistiques & Analyses E-commerce", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
      StatCard(title = "Chiffre d'Affaires Global", value = "12 450 000 FCFA", change = "+18.4%", modifier = Modifier.weight(1f))
      StatCard(title = "Panier Moyen", value = "45 000 FCFA", change = "+3.2%", modifier = Modifier.weight(1f))
    }
  }
}

@Composable
fun SettingsManagementView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Paramètres de la Plateforme", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      Column(modifier = Modifier.padding(20.dp)) {
        OutlinedTextField(value = "JambarrTech", onValueChange = {}, label = { Text("Nom de la plateforme") }, modifier = Modifier.fillMaxWidth())
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = "contact@jambarrtech.com", onValueChange = {}, label = { Text("Email support") }, modifier = Modifier.fillMaxWidth())
      }
    }
  }
}

@Composable
fun ActivityLogsView() {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Journal d'Activité", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(JambarrRepository.activityLogs) { log ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
              Text(text = log.action, fontWeight = FontWeight.Bold, fontSize = 14.sp)
              Text(text = "${log.user} • Module: ${log.module} • ${log.date}", fontSize = 12.sp, color = JambarrTextSecondary)
            }
            Text(text = log.result, color = JambarrSuccess, fontWeight = FontWeight.Bold)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}
