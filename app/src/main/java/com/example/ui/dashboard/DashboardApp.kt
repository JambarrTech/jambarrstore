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
import kotlinx.coroutines.launch

sealed class DashboardScreen {
  object Login : DashboardScreen()
  object Home : DashboardScreen()
  object Products : DashboardScreen()
  object Categories : DashboardScreen()
  object Orders : DashboardScreen()
  object Customers : DashboardScreen()
  object Managers : DashboardScreen()
  object Payments : DashboardScreen()
  object Promotions : DashboardScreen()
  object ActivityLogs : DashboardScreen()
  object Settings : DashboardScreen()
}

@Composable
fun DashboardAppRoot(onSwitchToMobile: () -> Unit) {
  var isLoggedIn by remember { mutableStateOf(false) }
  var authToken by remember { mutableStateOf<String?>(null) }
  var currentScreen by remember { mutableStateOf<DashboardScreen>(DashboardScreen.Login) }
  var selectedNav by remember { mutableStateOf("Dashboard") }
  val scope = rememberCoroutineScope()

  // API state
  var stats by remember { mutableStateOf<StatsResponse?>(null) }
  var products by remember { mutableStateOf<List<ProductResponse>>(emptyList()) }
  var categories by remember { mutableStateOf<List<CategoryResponse>>(emptyList()) }
  var orders by remember { mutableStateOf<List<OrderFullResponse>>(emptyList()) }
  var customers by remember { mutableStateOf<List<CustomerResponse>>(emptyList()) }
  var managers by remember { mutableStateOf<List<ManagerResponse>>(emptyList()) }
  var payments by remember { mutableStateOf<List<PaymentResponse>>(emptyList()) }
  var promotions by remember { mutableStateOf<List<PromotionResponse>>(emptyList()) }
  var activityLogs by remember { mutableStateOf<List<ActivityLogResponse>>(emptyList()) }
  var settings by remember { mutableStateOf<SettingsResponse?>(null) }

  fun loadAllData(token: String) {
    val authHeader = "Bearer $token"
    scope.launch {
      try { stats = ApiClient.instance.getStats(authHeader) } catch (_: Exception) {}
      try { products = ApiClient.instance.getProducts() } catch (_: Exception) {}
      try { categories = ApiClient.instance.getCategories() } catch (_: Exception) {}
      try { orders = ApiClient.instance.getOrders(authHeader) } catch (_: Exception) {}
      try { customers = ApiClient.instance.getCustomers(authHeader) } catch (_: Exception) {}
      try { managers = ApiClient.instance.getManagers(authHeader) } catch (_: Exception) {}
      try { payments = ApiClient.instance.getPayments(authHeader) } catch (_: Exception) {}
      try { promotions = ApiClient.instance.getPromotions() } catch (_: Exception) {}
      try { activityLogs = ApiClient.instance.getActivityLogs(authHeader) } catch (_: Exception) {}
      try { settings = ApiClient.instance.getSettings() } catch (_: Exception) {}
    }
  }

  if (!isLoggedIn) {
    DashboardLoginScreen(onLoginSuccess = { token ->
      isLoggedIn = true; authToken = token; currentScreen = DashboardScreen.Home; loadAllData(token)
    }, onSwitchToMobile = onSwitchToMobile)
  } else {
    Scaffold(
      topBar = {
        TopAppBar(
          title = { Text(text = "JambarrTech Dashboard", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
          navigationIcon = {},
          actions = { TextButton(onClick = onSwitchToMobile) { Text(text = "📱 Mobile", color = JambarrPrimary) } },
          colors = TopAppBarDefaults.topAppBarColors(containerColor = JambarrSurface)
        )
      }
    ) { padding ->
      Row(modifier = Modifier.padding(padding).fillMaxSize().background(JambarrBackground)) {
        DashboardSidebar(selectedNav = selectedNav, onNavSelected = { nav ->
          selectedNav = nav
          currentScreen = when (nav) {
            "Dashboard" -> DashboardScreen.Home; "Produits" -> DashboardScreen.Products; "Catégories" -> DashboardScreen.Categories
            "Commandes" -> DashboardScreen.Orders; "Clients" -> DashboardScreen.Customers; "Gestionnaires" -> DashboardScreen.Managers
            "Paiements" -> DashboardScreen.Payments; "Promotions" -> DashboardScreen.Promotions
            "Journal" -> DashboardScreen.ActivityLogs; "Paramètres" -> DashboardScreen.Settings; else -> DashboardScreen.Home
          }
        })
        Box(modifier = Modifier.weight(1f).fillMaxHeight().padding(16.dp)) {
          when (currentScreen) {
            is DashboardScreen.Home -> DashboardHomeView(stats = stats, orders = orders, products = products, customers = customers, onNavigate = { currentScreen = it })
            is DashboardScreen.Products -> ProductsManagementView(products = products, authToken = authToken, onRefresh = { authToken?.let { loadAllData(it) } })
            is DashboardScreen.Categories -> CategoriesManagementView(categories = categories)
            is DashboardScreen.Orders -> OrdersManagementView(orders = orders)
            is DashboardScreen.Customers -> CustomersManagementView(customers = customers)
            is DashboardScreen.Managers -> ManagersManagementView(managers = managers)
            is DashboardScreen.Payments -> PaymentsManagementView(payments = payments)
            is DashboardScreen.Promotions -> PromotionsManagementView(promotions = promotions)
            is DashboardScreen.ActivityLogs -> ActivityLogsView(logs = activityLogs)
            is DashboardScreen.Settings -> SettingsManagementView(settings = settings)
          }
        }
      }
    }
  }
}

@Composable
fun DashboardLoginScreen(onLoginSuccess: (String) -> Unit, onSwitchToMobile: () -> Unit) {
  var email by remember { mutableStateOf("admin@jambarrtech.com") }
  var password by remember { mutableStateOf("admin123") }
  var error by remember { mutableStateOf("") }
  var loading by remember { mutableStateOf(false) }
  val scope = rememberCoroutineScope()

  Box(modifier = Modifier.fillMaxSize().background(JambarrBackground), contentAlignment = Alignment.Center) {
    Card(modifier = Modifier.width(420.dp).padding(16.dp), shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface), elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)) {
      Column(modifier = Modifier.padding(32.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Box(modifier = Modifier.size(64.dp).clip(RoundedCornerShape(16.dp)).background(JambarrPrimary), contentAlignment = Alignment.Center) {
          Icon(imageVector = Icons.Default.AdminPanelSettings, contentDescription = null, tint = Color.White, modifier = Modifier.size(36.dp))
        }
        Spacer(modifier = Modifier.height(20.dp))
        Text(text = "JambarrTech Dashboard", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        Spacer(modifier = Modifier.height(6.dp))
        Text(text = "Connexion Admin & Gérant", fontSize = 13.sp, color = JambarrTextSecondary)
        Spacer(modifier = Modifier.height(24.dp))
        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))
        Spacer(modifier = Modifier.height(14.dp))
        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Mot de passe") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))
        if (error.isNotEmpty()) { Spacer(modifier = Modifier.height(8.dp)); Text(text = error, color = Color.Red, fontSize = 12.sp) }
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = {
          loading = true; error = ""
          scope.launch {
            try {
              val res = ApiClient.instance.login(LoginRequest(email, password))
              onLoginSuccess(res.token)
            } catch (e: Exception) { error = "Identifiants incorrects" }
            loading = false
          }
        }, modifier = Modifier.fillMaxWidth().height(50.dp), shape = RoundedCornerShape(12.dp), colors = ButtonDefaults.buttonColors(containerColor = JambarrPrimary), enabled = !loading) {
          Text(if (loading) "Connexion..." else "Se connecter", color = Color.White, fontWeight = FontWeight.Bold)
        }
        Spacer(modifier = Modifier.height(16.dp))
        TextButton(onClick = onSwitchToMobile) { Text(text = "← Retour à l'app mobile", color = JambarrPrimary, fontSize = 13.sp) }
      }
    }
  }
}

@Composable
fun DashboardSidebar(selectedNav: String, onNavSelected: (String) -> Unit) {
  val items = listOf("Dashboard", "Produits", "Catégories", "Commandes", "Clients", "Gestionnaires", "Paiements", "Promotions", "Journal", "Paramètres")
  Column(modifier = Modifier.width(220.dp).fillMaxHeight().background(JambarrSurface).verticalScroll(rememberScrollState()).padding(vertical = 12.dp)) {
    items.forEach { item ->
      val selected = selectedNav == item
      Row(modifier = Modifier.fillMaxWidth().clickable { onNavSelected(item) }.background(if (selected) JambarrPrimary.copy(alpha = 0.1f) else Color.Transparent).padding(horizontal = 16.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(imageVector = when(item) { "Dashboard" -> Icons.Default.Dashboard; "Produits" -> Icons.Default.Inventory; "Catégories" -> Icons.Default.Category; "Commandes" -> Icons.Default.ShoppingBag; "Clients" -> Icons.Default.People; "Gestionnaires" -> Icons.Default.SupervisorAccount; "Paiements" -> Icons.Default.Payment; "Promotions" -> Icons.Default.LocalOffer; "Journal" -> Icons.Default.History; else -> Icons.Default.Settings }, contentDescription = null, tint = if (selected) JambarrPrimary else JambarrTextSecondary, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Text(text = item, fontSize = 14.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium, color = if (selected) JambarrPrimary else JambarrTextPrimary)
      }
    }
  }
}

@Composable
fun DashboardHomeView(stats: StatsResponse?, orders: List<OrderFullResponse>, products: List<ProductResponse>, customers: List<CustomerResponse>, onNavigate: (DashboardScreen) -> Unit) {
  LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(20.dp)) {
    item {
      Text(text = "Tableau de Bord", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(12.dp))
      Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        StatCard(title = "Chiffre d'affaires", value = "${(stats?.totalRevenue ?: 0.0).toInt().toLocaleString()} FCFA", change = "+12.5%", modifier = Modifier.weight(1f))
        StatCard(title = "Commandes", value = "${stats?.ordersCount ?: 0}", change = "+8.1%", modifier = Modifier.weight(1f))
        StatCard(title = "Clients", value = "${stats?.customersCount ?: 0}", change = "+15.3%", modifier = Modifier.weight(1f))
        StatCard(title = "Produits", value = "${stats?.productsCount ?: 0}", change = "+4", modifier = Modifier.weight(1f))
      }
    }
    item {
      Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(text = "Commandes Récentes", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        TextButton(onClick = { onNavigate(DashboardScreen.Orders) }) { Text("Voir tout") }
      }
      Spacer(modifier = Modifier.height(8.dp))
      Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
        Column(modifier = Modifier.padding(16.dp)) {
          orders.take(5).forEach { order ->
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
              Column { Text(text = "#${order.reference}", fontWeight = FontWeight.Bold, fontSize = 14.sp); Text(text = order.clientName, fontSize = 12.sp, color = JambarrTextSecondary) }
              Column(horizontalAlignment = Alignment.End) { Text(text = "${order.totalAmount.toInt()} FCFA", fontWeight = FontWeight.Bold, color = JambarrPrimary); Text(text = order.status, fontSize = 12.sp, color = JambarrSuccess) }
            }
            Divider(color = JambarrBorder)
          }
          if (orders.isEmpty()) Text(text = "Aucune commande", color = JambarrTextSecondary, fontSize = 13.sp)
        }
      }
    }
  }
}

@Composable
fun StatCard(title: String, value: String, change: String, modifier: Modifier = Modifier) {
  Card(modifier = modifier, shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface), elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)) {
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
fun ProductsManagementView(products: List<ProductResponse>, authToken: String?, onRefresh: () -> Unit) {
  Column(modifier = Modifier.fillMaxSize()) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
      Text(text = "Produits (${products.size})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      OutlinedButton(onClick = onRefresh) { Text("🔄 Rafraîchir") }
    }
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(products) { product ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
              AsyncImage(model = product.imageUrl, contentDescription = null, modifier = Modifier.size(45.dp).clip(RoundedCornerShape(8.dp)), contentScale = ContentScale.Crop)
              Spacer(modifier = Modifier.width(12.dp))
              Column { Text(text = product.name, fontWeight = FontWeight.Bold, fontSize = 14.sp); Text(text = "Réf: ${product.reference} • Stock: ${product.stock}", fontSize = 12.sp, color = JambarrTextSecondary) }
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
fun CategoriesManagementView(categories: List<CategoryResponse>) {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Catégories (${categories.size})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(categories) { cat ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(text = cat.icon ?: "📦", fontSize = 20.sp)
              Spacer(modifier = Modifier.width(12.dp))
              Text(text = cat.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
            Text(text = "${cat._count?.products ?: 0} produits", color = JambarrTextSecondary)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun OrdersManagementView(orders: List<OrderFullResponse>) {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Commandes (${orders.size})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(orders) { order ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column { Text(text = "#${order.reference}", fontWeight = FontWeight.Bold); Text(text = "${order.clientName} • ${order.paymentMethod}", fontSize = 12.sp, color = JambarrTextSecondary) }
            Column(horizontalAlignment = Alignment.End) { Text(text = "${order.totalAmount.toInt()} FCFA", fontWeight = FontWeight.Bold, color = JambarrPrimary); Text(text = order.status, fontSize = 12.sp, color = JambarrSuccess) }
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun CustomersManagementView(customers: List<CustomerResponse>) {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Clients (${customers.size})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(customers) { cust ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column { Text(text = cust.name, fontWeight = FontWeight.Bold); Text(text = cust.phone ?: "", fontSize = 12.sp, color = JambarrTextSecondary) }
            Column(horizontalAlignment = Alignment.End) { Text(text = "${cust.ordersCount} commandes", fontWeight = FontWeight.SemiBold, color = JambarrPrimary); Text(text = "${cust.totalSpent.toInt()} FCFA", fontSize = 12.sp, color = JambarrTextSecondary) }
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun ManagersManagementView(managers: List<ManagerResponse>) {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Gestionnaires (${managers.size})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(managers) { mgr ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column { Text(text = mgr.name, fontWeight = FontWeight.Bold); Text(text = mgr.email, fontSize = 12.sp, color = JambarrTextSecondary) }
            Surface(color = JambarrPrimary.copy(alpha = 0.1f), shape = RoundedCornerShape(6.dp)) { Text(text = mgr.role, color = JambarrPrimary, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)) }
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun PaymentsManagementView(payments: List<PaymentResponse>) {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Transactions (${payments.size})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(payments) { tx ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column { Text(text = tx.reference, fontWeight = FontWeight.Bold); Text(text = "${tx.clientName} • ${tx.method}", fontSize = 12.sp, color = JambarrTextSecondary) }
            Text(text = "${tx.amount.toInt()} FCFA", fontWeight = FontWeight.Bold, color = JambarrSuccess)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun PromotionsManagementView(promotions: List<PromotionResponse>) {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Promotions (${promotions.size})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(promotions) { promo ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column { Text(text = promo.title, fontWeight = FontWeight.Bold); Text(text = "-${promo.discountPercent}% • ${promo.targetCategory}", fontSize = 12.sp, color = JambarrTextSecondary) }
            Surface(color = if (promo.isActive) JambarrSuccess.copy(alpha = 0.1f) else Color.Gray.copy(alpha = 0.1f), shape = RoundedCornerShape(6.dp)) {
              Text(text = if (promo.isActive) "Actif" else "Inactif", color = if (promo.isActive) JambarrSuccess else Color.Gray, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
            }
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun ActivityLogsView(logs: List<ActivityLogResponse>) {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Journal d'Activité (${logs.size})", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      LazyColumn(modifier = Modifier.padding(16.dp)) {
        items(logs) { log ->
          Row(modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column(modifier = Modifier.weight(1f)) { Text(text = log.action, fontWeight = FontWeight.Bold, fontSize = 14.sp); Text(text = "${log.user} • ${log.module}", fontSize = 12.sp, color = JambarrTextSecondary) }
            Text(text = log.result, color = JambarrSuccess, fontWeight = FontWeight.Bold)
          }
          Divider(color = JambarrBorder)
        }
      }
    }
  }
}

@Composable
fun SettingsManagementView(settings: SettingsResponse?) {
  Column(modifier = Modifier.fillMaxSize()) {
    Text(text = "Paramètres", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(16.dp))
    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = JambarrSurface)) {
      Column(modifier = Modifier.padding(20.dp)) {
        OutlinedTextField(value = settings?.storeName ?: "", onValueChange = {}, label = { Text("Nom de la boutique") }, modifier = Modifier.fillMaxWidth(), readOnly = true)
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = settings?.storeEmail ?: "", onValueChange = {}, label = { Text("Email") }, modifier = Modifier.fillMaxWidth(), readOnly = true)
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = settings?.phone ?: "", onValueChange = {}, label = { Text("Téléphone") }, modifier = Modifier.fillMaxWidth(), readOnly = true)
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(value = settings?.address ?: "", onValueChange = {}, label = { Text("Adresse") }, modifier = Modifier.fillMaxWidth(), readOnly = true)
      }
    }
  }
}
