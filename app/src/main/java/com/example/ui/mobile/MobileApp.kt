package com.example.ui.mobile

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.*
import com.example.ui.common.*
import com.example.ui.theme.*

sealed class MobileScreen {
  object Splash : MobileScreen()
  object Onboarding : MobileScreen()
  object Auth : MobileScreen()
  object Otp : MobileScreen()
  object MainTabs : MobileScreen()
  object CategoriesList : MobileScreen()
  object Search : MobileScreen()
  object ProductDetail : MobileScreen()
  object Boutique : MobileScreen()
  object Cart : MobileScreen()
  object Checkout : MobileScreen()
  object Payment : MobileScreen()
  object OrderConfirmation : MobileScreen()
  object OrderDetail : MobileScreen()
  object Settings : MobileScreen()
}

@Composable
fun MobileAppRoot(onSwitchToDashboard: () -> Unit) {
  var currentScreen by remember { mutableStateOf<MobileScreen>(MobileScreen.Splash) }
  var selectedTab by remember { mutableStateOf(0) } // 0: Accueil, 1: Catégories, 2: Panier, 3: Favoris, 4: Profil
  var activeProduct by remember { mutableStateOf<Product?>(JambarrRepository.products.first()) }
  var activeOrder by remember { mutableStateOf<Order?>(JambarrRepository.orders.first()) }
  var userPhone by remember { mutableStateOf("+221 77 123 45 67") }

  // Auto splash timeout simulation or tap
  LaunchedEffect(currentScreen) {
    if (currentScreen is MobileScreen.Splash) {
      kotlinx.coroutines.delay(1800)
      currentScreen = MobileScreen.Onboarding
    }
  }

  Surface(modifier = Modifier.fillMaxSize(), color = JambarrBackground) {
    Box(modifier = Modifier.fillMaxSize()) {
      when (currentScreen) {
        is MobileScreen.Splash -> {
          SplashScreen(onSwitchToDashboard = onSwitchToDashboard)
        }
        is MobileScreen.Onboarding -> {
          OnboardingScreen(
            onFinish = { currentScreen = MobileScreen.Auth },
            onSkip = { currentScreen = MobileScreen.Auth }
          )
        }
        is MobileScreen.Auth -> {
          AuthScreen(
            phone = userPhone,
            onPhoneChange = { userPhone = it },
            onContinue = { currentScreen = MobileScreen.Otp },
            onGoogleLogin = { currentScreen = MobileScreen.MainTabs }
          )
        }
        is MobileScreen.Otp -> {
          OtpScreen(
            phone = userPhone,
            onVerified = { currentScreen = MobileScreen.MainTabs },
            onBack = { currentScreen = MobileScreen.Auth }
          )
        }
        is MobileScreen.MainTabs -> {
          MainTabsContainer(
            selectedTab = selectedTab,
            onTabSelected = { selectedTab = it },
            onProductClick = { p ->
              activeProduct = p
              currentScreen = MobileScreen.ProductDetail
            },
            onCategoryClick = { currentScreen = MobileScreen.CategoriesList },
            onSearchClick = { currentScreen = MobileScreen.Search },
            onCartClick = { currentScreen = MobileScreen.Cart },
            onOrderClick = { o ->
              activeOrder = o
              currentScreen = MobileScreen.OrderDetail
            },
            onSwitchToDashboard = onSwitchToDashboard
          )
        }
        is MobileScreen.CategoriesList -> {
          CategoriesScreen(
            onBack = { currentScreen = MobileScreen.MainTabs },
            onCategorySelected = { currentScreen = MobileScreen.Search }
          )
        }
        is MobileScreen.Search -> {
          SearchScreen(
            onBack = { currentScreen = MobileScreen.MainTabs },
            onProductClick = { p ->
              activeProduct = p
              currentScreen = MobileScreen.ProductDetail
            }
          )
        }
        is MobileScreen.ProductDetail -> {
          ProductDetailScreen(
            product = activeProduct ?: JambarrRepository.products[0],
            onBack = { currentScreen = MobileScreen.MainTabs },
            onAddToCart = { currentScreen = MobileScreen.Cart },
            onBuyNow = { currentScreen = MobileScreen.Checkout }
          )
        }
        is MobileScreen.Boutique -> {
          BoutiqueScreen(
            onBack = { currentScreen = MobileScreen.MainTabs },
            onProductClick = { p ->
              activeProduct = p
              currentScreen = MobileScreen.ProductDetail
            }
          )
        }
        is MobileScreen.Cart -> {
          CartScreen(
            onBack = { currentScreen = MobileScreen.MainTabs },
            onCheckout = { currentScreen = MobileScreen.Checkout }
          )
        }
        is MobileScreen.Checkout -> {
          CheckoutScreen(
            onBack = { currentScreen = MobileScreen.Cart },
            onProceedPayment = { currentScreen = MobileScreen.Payment }
          )
        }
        is MobileScreen.Payment -> {
          PaymentScreen(
            onBack = { currentScreen = MobileScreen.Checkout },
            onPaidSuccess = { currentScreen = MobileScreen.OrderConfirmation }
          )
        }
        is MobileScreen.OrderConfirmation -> {
          OrderConfirmationScreen(
            onViewOrder = {
              activeOrder = JambarrRepository.orders.first()
              currentScreen = MobileScreen.OrderDetail
            },
            onContinueShopping = { currentScreen = MobileScreen.MainTabs }
          )
        }
        is MobileScreen.OrderDetail -> {
          OrderDetailScreen(
            order = activeOrder ?: JambarrRepository.orders[0],
            onBack = { currentScreen = MobileScreen.MainTabs }
          )
        }
        is MobileScreen.Settings -> {
          SettingsScreen(onBack = { currentScreen = MobileScreen.MainTabs })
        }
      }
    }
  }
}

@Composable
fun SplashScreen(onSwitchToDashboard: () -> Unit) {
  Box(
    modifier = Modifier.fillMaxSize().background(JambarrPrimary),
    contentAlignment = Alignment.Center
  ) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
      Box(
        modifier = Modifier
          .size(90.dp)
          .clip(RoundedCornerShape(24.dp))
          .background(Color.White),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = Icons.Default.ShoppingBag,
          contentDescription = null,
          tint = JambarrPrimary,
          modifier = Modifier.size(50.dp)
        )
      }
      Spacer(modifier = Modifier.height(24.dp))
      Text(
        text = "JambarrTech",
        fontSize = 32.sp,
        fontWeight = FontWeight.Bold,
        color = Color.White
      )
      Spacer(modifier = Modifier.height(8.dp))
      Text(
        text = "Marketplace Premium Sénégal",
        fontSize = 14.sp,
        color = Color.White.copy(alpha = 0.8f)
      )
      Spacer(modifier = Modifier.height(48.dp))
      CircularProgressIndicator(color = Color.White, modifier = Modifier.size(32.dp))

      Spacer(modifier = Modifier.height(32.dp))
      TextButton(onClick = onSwitchToDashboard) {
        Text(text = "Basculer vers le Dashboard Admin ➔", color = Color.White, fontSize = 13.sp)
      }
    }
  }
}

@Composable
fun OnboardingScreen(onFinish: () -> Unit, onSkip: () -> Unit) {
  var page by remember { mutableStateOf(0) }
  val titles = listOf(
    "Découvrez l'Excellence",
    "Produits & Boutiques Certifiés",
    "Paiement Wave & Orange Money"
  )
  val descriptions = listOf(
    "La marketplace premium au Sénégal regroupant les meilleures enseignes et créateurs.",
    "Parcourez des milliers d'articles de mode, tech, maison et beauté avec livraison rapide.",
    "Payez en un clic via Wave ou Orange Money en toute sécurité et simplicité."
  )

  Column(
    modifier = Modifier.fillMaxSize().background(JambarrSurface).padding(24.dp),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Row(
      modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
      horizontalArrangement = Arrangement.End
    ) {
      TextButton(onClick = onSkip) {
        Text(text = "Passer", color = JambarrTextSecondary, fontWeight = FontWeight.SemiBold)
      }
    }

    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
      Box(
        modifier = Modifier
          .size(260.dp)
          .clip(RoundedCornerShape(20.dp))
          .background(JambarrBackground),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = when(page) {
            0 -> Icons.Default.Storefront
            1 -> Icons.Default.LocalMall
            else -> Icons.Default.Payment
          },
          contentDescription = null,
          tint = JambarrPrimary,
          modifier = Modifier.size(90.dp)
        )
      }

      Spacer(modifier = Modifier.height(36.dp))
      Text(
        text = titles[page],
        fontSize = 24.sp,
        fontWeight = FontWeight.Bold,
        color = JambarrTextPrimary,
        textAlign = TextAlign.Center
      )
      Spacer(modifier = Modifier.height(12.dp))
      Text(
        text = descriptions[page],
        fontSize = 15.sp,
        color = JambarrTextSecondary,
        textAlign = TextAlign.Center,
        modifier = Modifier.padding(horizontal = 16.dp)
      )

      Spacer(modifier = Modifier.height(24.dp))
      Row(horizontalArrangement = Arrangement.Center) {
        repeat(3) { i ->
          Box(
            modifier = Modifier
              .padding(4.dp)
              .height(8.dp)
              .width(if (page == i) 24.dp else 8.dp)
              .clip(RoundedCornerShape(4.dp))
              .background(if (page == i) JambarrPrimary else JambarrBorder)
          )
        }
      }
    }

    JambarrButton(
      text = if (page < 2) "Continuer" else "Commencer",
      onClick = {
        if (page < 2) page++ else onFinish()
      },
      modifier = Modifier.padding(bottom = 24.dp)
    )
  }
}

@Composable
fun AuthScreen(phone: String, onPhoneChange: (String) -> Unit, onContinue: () -> Unit, onGoogleLogin: () -> Unit) {
  Column(
    modifier = Modifier.fillMaxSize().background(JambarrSurface).padding(24.dp),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Column {
      Spacer(modifier = Modifier.height(32.dp))
      Text(text = "Bienvenue 👋", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(8.dp))
      Text(text = "Connectez-vous à votre compte JambarrTech", fontSize = 15.sp, color = JambarrTextSecondary)

      Spacer(modifier = Modifier.height(40.dp))
      Text(text = "Numéro de téléphone", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(8.dp))
      OutlinedTextField(
        value = phone,
        onValueChange = onPhoneChange,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = JambarrPrimary) },
        placeholder = { Text("+221 77 000 00 00") },
        singleLine = true
      )

      Spacer(modifier = Modifier.height(24.dp))
      JambarrButton(text = "Continuer", onClick = onContinue)

      Spacer(modifier = Modifier.height(24.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
      ) {
        Divider(modifier = Modifier.weight(1f), color = JambarrBorder)
        Text(text = "  OU  ", fontSize = 13.sp, color = JambarrTextSecondary)
        Divider(modifier = Modifier.weight(1f), color = JambarrBorder)
      }

      Spacer(modifier = Modifier.height(24.dp))
      OutlinedButton(
        onClick = onGoogleLogin,
        modifier = Modifier.fillMaxWidth().height(50.dp),
        shape = RoundedCornerShape(12.dp)
      ) {
        Icon(imageVector = Icons.Default.GMobiledata, contentDescription = null, tint = JambarrPrimary, modifier = Modifier.size(28.dp))
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = "Continuer avec Google", color = JambarrTextPrimary, fontWeight = FontWeight.SemiBold)
      }
    }

    Row(
      modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
      horizontalArrangement = Arrangement.Center
    ) {
      Text(text = "Pas encore de compte ? ", color = JambarrTextSecondary, fontSize = 14.sp)
      Text(text = "S'inscrire", color = JambarrPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    }
  }
}

@Composable
fun OtpScreen(phone: String, onVerified: () -> Unit, onBack: () -> Unit) {
  var code by remember { mutableStateOf("4829") }

  Column(
    modifier = Modifier.fillMaxSize().background(JambarrSurface).padding(24.dp),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Column {
      JambarrTopBar(title = "", onBackClick = onBack)
      Spacer(modifier = Modifier.height(16.dp))
      Text(text = "Vérification OTP", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(8.dp))
      Text(text = "Code envoyé par SMS au numéro\n$phone", fontSize = 15.sp, color = JambarrTextSecondary)

      Spacer(modifier = Modifier.height(40.dp))
      OutlinedTextField(
        value = code,
        onValueChange = { if (it.length <= 4) code = it },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        singleLine = true,
        label = { Text("Code à 4 chiffres") }
      )

      Spacer(modifier = Modifier.height(16.dp))
      TextButton(onClick = {}) {
        Text(text = "Renvoyer le code", color = JambarrPrimary, fontWeight = FontWeight.SemiBold)
      }
    }

    JambarrButton(text = "Vérifier & Connecter", onClick = onVerified, modifier = Modifier.padding(bottom = 24.dp))
  }
}

@Composable
fun MainTabsContainer(
  selectedTab: Int,
  onTabSelected: (Int) -> Unit,
  onProductClick: (Product) -> Unit,
  onCategoryClick: () -> Unit,
  onSearchClick: () -> Unit,
  onCartClick: () -> Unit,
  onOrderClick: (Order) -> Unit,
  onSwitchToDashboard: () -> Unit
) {
  Scaffold(
    topBar = {
      if (selectedTab == 0) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .background(JambarrSurface)
            .padding(horizontal = 20.dp, vertical = 12.dp),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          Column {
            Text(text = "Bonjour 👋", fontSize = 13.sp, color = JambarrTextSecondary)
            Text(text = "Mamadou Diallo", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
          }
          Row {
            IconButton(onClick = onSwitchToDashboard) {
              Icon(imageVector = Icons.Default.AdminPanelSettings, contentDescription = "Dashboard", tint = JambarrPrimary)
            }
            IconButton(onClick = onCartClick) {
              val cartSize = JambarrRepository.cartItems.size
              val badgeScale = remember { Animatable(1f) }
              LaunchedEffect(cartSize) {
                badgeScale.animateTo(1.3f, animationSpec = tween(150))
                badgeScale.animateTo(1.0f, animationSpec = tween(150))
              }
              BadgedBox(badge = {
                Badge(modifier = Modifier.graphicsLayer(scaleX = badgeScale.value, scaleY = badgeScale.value)) {
                  Text("$cartSize")
                }
              }) {
                Icon(imageVector = Icons.Default.ShoppingBag, contentDescription = "Panier", tint = JambarrTextPrimary)
              }
            }
          }
        }
      }
    },
    bottomBar = {
      NavigationBar(containerColor = JambarrSurface, tonalElevation = 8.dp) {
        NavigationBarItem(
          selected = selectedTab == 0,
          onClick = { onTabSelected(0) },
          icon = { Icon(Icons.Default.Home, contentDescription = null) },
          label = { Text("Accueil") }
        )
        NavigationBarItem(
          selected = selectedTab == 1,
          onClick = { onTabSelected(1) },
          icon = { Icon(Icons.Default.Category, contentDescription = null) },
          label = { Text("Catégories") }
        )
        NavigationBarItem(
          selected = selectedTab == 2,
          onClick = { onTabSelected(2) },
          icon = { Icon(Icons.Default.ShoppingBag, contentDescription = null) },
          label = { Text("Panier") }
        )
        NavigationBarItem(
          selected = selectedTab == 3,
          onClick = { onTabSelected(3) },
          icon = { Icon(Icons.Default.Favorite, contentDescription = null) },
          label = { Text("Favoris") }
        )
        NavigationBarItem(
          selected = selectedTab == 4,
          onClick = { onTabSelected(4) },
          icon = { Icon(Icons.Default.Person, contentDescription = null) },
          label = { Text("Profil") }
        )
      }
    }
  ) { padding ->
    Box(modifier = Modifier.padding(padding).fillMaxSize()) {
      when (selectedTab) {
        0 -> HomeScreen(onProductClick = onProductClick, onCategoryClick = onCategoryClick, onSearchClick = onSearchClick)
        1 -> CategoriesContent(onCategoryClick = onCategoryClick)
        2 -> CartScreenStandalone(onCheckout = {})
        3 -> FavoritesScreen(onProductClick = onProductClick)
        4 -> ProfileScreen(onOrderClick = onOrderClick, onSwitchToDashboard = onSwitchToDashboard)
      }
    }
  }
}

@Composable
fun HomeScreen(onProductClick: (Product) -> Unit, onCategoryClick: () -> Unit, onSearchClick: () -> Unit) {
  LazyColumn(
    modifier = Modifier.fillMaxSize().background(JambarrBackground),
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(20.dp)
  ) {
    item {
      // Search bar clickable
      OutlinedCard(
        onClick = onSearchClick,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.outlinedCardColors(containerColor = JambarrSurface),
        border = BorderStroke(1.dp, JambarrBorder)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(14.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(imageVector = Icons.Default.Search, contentDescription = null, tint = JambarrTextSecondary)
          Spacer(modifier = Modifier.width(12.dp))
          Text(text = "Rechercher un produit, une marque...", color = JambarrTextSecondary, fontSize = 14.sp)
        }
      }
    }

    item {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(text = "Catégories", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        TextButton(onClick = onCategoryClick) {
          Text(text = "Voir tout", color = JambarrPrimary, fontWeight = FontWeight.SemiBold)
        }
      }
      Spacer(modifier = Modifier.height(8.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        items(JambarrRepository.categories) { cat ->
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.clickable { onCategoryClick() }
          ) {
            Box(
              modifier = Modifier
                .size(68.dp)
                .clip(CircleShape)
                .background(JambarrPrimary.copy(alpha = 0.1f)),
              contentAlignment = Alignment.Center
            ) {
              AsyncImage(
                model = cat.imageUrl,
                contentDescription = cat.name,
                modifier = Modifier.size(68.dp).clip(CircleShape),
                contentScale = ContentScale.Crop
              )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = cat.name, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = JambarrTextPrimary)
          }
        }
      }
    }

    item {
      // Promo Banner
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(150.dp)
          .clip(RoundedCornerShape(16.dp))
          .background(JambarrPrimary)
          .padding(20.dp),
        contentAlignment = Alignment.CenterStart
      ) {
        Column {
          Surface(
            color = Color.White.copy(alpha = 0.2f),
            shape = RoundedCornerShape(6.dp)
          ) {
            Text(
              text = "OFFRE SPÉCIALE -20%",
              color = Color.White,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
          }
          Spacer(modifier = Modifier.height(8.dp))
          Text(text = "Soldes Tech & Mode", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color.White)
          Spacer(modifier = Modifier.height(4.dp))
          Text(text = "Profitez de la livraison gratuite dès 50 000 FCFA", fontSize = 13.sp, color = Color.White.copy(alpha = 0.9f))
        }
      }
    }

    item {
      Text(text = "Produits Populaires", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(12.dp))
      LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
        items(JambarrRepository.products) { product ->
          ProductCardItem(product = product, onClick = { onProductClick(product) })
        }
      }
    }
  }
}

@Composable
fun ProductCardItem(product: Product, onClick: () -> Unit) {
  Card(
    onClick = onClick,
    modifier = Modifier.width(165.dp),
    shape = RoundedCornerShape(14.dp),
    colors = CardDefaults.cardColors(containerColor = JambarrSurface),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
  ) {
    Column {
      Box(modifier = Modifier.fillMaxWidth().height(140.dp)) {
        AsyncImage(
          model = product.imageUrl,
          contentDescription = product.name,
          modifier = Modifier.fillMaxSize(),
          contentScale = ContentScale.Crop
        )
        IconButton(
          onClick = { product.isFavorite = !product.isFavorite },
          modifier = Modifier.align(Alignment.TopEnd).padding(4.dp)
        ) {
          Icon(
            imageVector = if (product.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
            contentDescription = null,
            tint = if (product.isFavorite) Color.Red else Color.Gray
          )
        }
      }
      Column(modifier = Modifier.padding(12.dp)) {
        Text(text = product.name, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary, maxLines = 1)
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = "${product.price.toInt()} FCFA", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = JambarrPrimary)
        if (product.promoPrice != null) {
          Text(
            text = "${product.promoPrice.toInt()} FCFA",
            fontSize = 11.sp,
            color = JambarrTextSecondary,
            textDecoration = TextDecoration.LineThrough
          )
        }
      }
    }
  }
}

@Composable
fun CategoriesContent(onCategoryClick: () -> Unit) {
  LazyColumn(
    modifier = Modifier.fillMaxSize().background(JambarrBackground),
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    item {
      Text(text = "Toutes les Catégories", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(8.dp))
    }
    items(JambarrRepository.categories) { cat ->
      Card(
        onClick = onCategoryClick,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = JambarrSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          AsyncImage(
            model = cat.imageUrl,
            contentDescription = cat.name,
            modifier = Modifier.size(56.dp).clip(RoundedCornerShape(10.dp)),
            contentScale = ContentScale.Crop
          )
          Spacer(modifier = Modifier.width(16.dp))
          Column(modifier = Modifier.weight(1f)) {
            Text(text = cat.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "${cat.productCount} produits disponibles", fontSize = 13.sp, color = JambarrTextSecondary)
          }
          Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = JambarrTextSecondary)
        }
      }
    }
  }
}

@Composable
fun CategoriesScreen(onBack: () -> Unit, onCategorySelected: () -> Unit) {
  Column(modifier = Modifier.fillMaxSize().background(JambarrBackground)) {
    JambarrTopBar(title = "Catégories", onBackClick = onBack)
    CategoriesContent(onCategoryClick = onCategorySelected)
  }
}

@Composable
fun SearchScreen(onBack: () -> Unit, onProductClick: (Product) -> Unit) {
  var query by remember { mutableStateOf("") }
  val results = JambarrRepository.products.filter { it.name.contains(query, ignoreCase = true) || it.category.contains(query, ignoreCase = true) }

  Column(modifier = Modifier.fillMaxSize().background(JambarrBackground)) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .background(JambarrSurface)
        .padding(16.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      IconButton(onClick = onBack) {
        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Retour", tint = JambarrTextPrimary)
      }
      Spacer(modifier = Modifier.width(8.dp))
      OutlinedTextField(
        value = query,
        onValueChange = { query = it },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        placeholder = { Text("Rechercher un produit...") },
        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
        singleLine = true
      )
    }

    LazyVerticalGrid(
      columns = GridCells.Fixed(2),
      modifier = Modifier.fillMaxSize().padding(16.dp),
      horizontalArrangement = Arrangement.spacedBy(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      items(results) { product ->
        ProductCardItem(product = product, onClick = { onProductClick(product) })
      }
    }
  }
}

@Composable
fun ProductDetailScreen(product: Product, onBack: () -> Unit, onAddToCart: () -> Unit, onBuyNow: () -> Unit) {
  Column(
    modifier = Modifier.fillMaxSize().background(JambarrBackground),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Column(modifier = Modifier.weight(1f).verticalScroll(rememberScrollState())) {
      Box(modifier = Modifier.fillMaxWidth().height(300.dp)) {
        AsyncImage(
          model = product.imageUrl,
          contentDescription = product.name,
          modifier = Modifier.fillMaxSize(),
          contentScale = ContentScale.Crop
        )
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween
        ) {
          IconButton(
            onClick = onBack,
            modifier = Modifier.background(Color.White.copy(alpha = 0.8f), CircleShape)
          ) {
            Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Retour")
          }
          IconButton(
            onClick = { product.isFavorite = !product.isFavorite },
            modifier = Modifier.background(Color.White.copy(alpha = 0.8f), CircleShape)
          ) {
            Icon(
              imageVector = if (product.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
              contentDescription = null,
              tint = if (product.isFavorite) Color.Red else Color.Gray
            )
          }
        }
      }

      Column(modifier = Modifier.padding(20.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
          Text(text = product.category, fontSize = 13.sp, color = JambarrPrimary, fontWeight = FontWeight.Bold)
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(imageVector = Icons.Default.Star, contentDescription = null, tint = Color(0xFFF59E0B), modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text(text = "${product.rating} (${product.reviewCount} avis)", fontSize = 13.sp, color = JambarrTextSecondary)
          }
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = product.name, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = "${product.price.toInt()} FCFA", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = JambarrPrimary)

        Spacer(modifier = Modifier.height(16.dp))
        Divider(color = JambarrBorder)
        Spacer(modifier = Modifier.height(16.dp))

        Text(text = "Description", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        Spacer(modifier = Modifier.height(6.dp))
        Text(text = product.description, fontSize = 14.sp, color = JambarrTextSecondary, lineHeight = 20.sp)

        Spacer(modifier = Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = JambarrSuccess, modifier = Modifier.size(18.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text(text = "Stock disponible (${product.stock} unités)", fontSize = 13.sp, color = JambarrSuccess, fontWeight = FontWeight.SemiBold)
        }
      }
    }

    Surface(
      modifier = Modifier.fillMaxWidth(),
      color = JambarrSurface,
      shadowElevation = 8.dp
    ) {
      Row(
        modifier = Modifier.padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
      ) {
        val interactionSource = remember { MutableInteractionSource() }
        val isPressed by interactionSource.collectIsPressedAsState()
        val scale by animateFloatAsState(targetValue = if (isPressed) 0.95f else 1f, label = "button_scale")

        OutlinedButton(
          onClick = {
            if (!JambarrRepository.cartItems.any { it.product.id == product.id }) {
              JambarrRepository.cartItems.add(CartItem(product, 1))
            }
            onAddToCart()
          },
          modifier = Modifier
            .weight(1f)
            .height(50.dp)
            .graphicsLayer(scaleX = scale, scaleY = scale),
          shape = RoundedCornerShape(12.dp),
          interactionSource = interactionSource
        ) {
          Text("Ajouter au panier", color = JambarrPrimary, fontWeight = FontWeight.SemiBold)
        }
        Button(
          onClick = onBuyNow,
          modifier = Modifier.weight(1f).height(50.dp),
          shape = RoundedCornerShape(12.dp),
          colors = ButtonDefaults.buttonColors(containerColor = JambarrPrimary)
        ) {
          Text("Acheter maintenant", color = Color.White, fontWeight = FontWeight.SemiBold)
        }
      }
    }
  }
}

@Composable
fun BoutiqueScreen(onBack: () -> Unit, onProductClick: (Product) -> Unit) {
  Column(modifier = Modifier.fillMaxSize().background(JambarrBackground)) {
    JambarrTopBar(title = "Boutique", onBackClick = onBack)
    LazyColumn(
      modifier = Modifier.fillMaxSize().padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = JambarrSurface)
        ) {
          Column(modifier = Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
              modifier = Modifier.size(70.dp).clip(CircleShape).background(JambarrPrimary.copy(alpha = 0.1f)),
              contentAlignment = Alignment.Center
            ) {
              Icon(imageVector = Icons.Default.Storefront, contentDescription = null, tint = JambarrPrimary, modifier = Modifier.size(36.dp))
            }
            Spacer(modifier = Modifier.height(12.dp))
            Text(text = "Dakar Tech Store", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "★ 4.8 • 1.2k abonnés • Vérifié", fontSize = 13.sp, color = JambarrTextSecondary)
          }
        }
      }
      item {
        Text(text = "Produits de la boutique", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      }
      items(JambarrRepository.products) { product ->
        ProductCardItem(product = product, onClick = { onProductClick(product) })
      }
    }
  }
}

@Composable
fun FavoritesScreen(onProductClick: (Product) -> Unit) {
  val favorites = JambarrRepository.products.filter { it.isFavorite }
  Column(modifier = Modifier.fillMaxSize().background(JambarrBackground)) {
    JambarrTopBar(title = "Mes Favoris")
    if (favorites.isEmpty()) {
      EmptyStateView(
        title = "Aucun favori",
        subtitle = "Vous n'avez pas encore ajouté de produits à vos favoris.",
        actionText = "Découvrir les produits",
        onAction = {}
      )
    } else {
      LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
      ) {
        items(favorites) { product ->
          ProductCardItem(product = product, onClick = { onProductClick(product) })
        }
      }
    }
  }
}

@Composable
fun CartScreenStandalone(onCheckout: () -> Unit) {
  val cart = JambarrRepository.cartItems
  val subtotal = cart.sumOf { it.product.price * it.quantity }
  val delivery = if (subtotal > 0) 2000.0 else 0.0
  val total = subtotal + delivery

  Column(
    modifier = Modifier.fillMaxSize().background(JambarrBackground),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Column(modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(16.dp)) {
      Text(text = "Mon Panier", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(16.dp))

      if (cart.isEmpty()) {
        Box(modifier = Modifier.fillMaxWidth().height(300.dp), contentAlignment = Alignment.Center) {
          Text(text = "Votre panier est vide", color = JambarrTextSecondary)
        }
      } else {
        cart.forEach { item ->
          Card(
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = JambarrSurface)
          ) {
            Row(
              modifier = Modifier.padding(12.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              AsyncImage(
                model = item.product.imageUrl,
                contentDescription = null,
                modifier = Modifier.size(70.dp).clip(RoundedCornerShape(8.dp)),
                contentScale = ContentScale.Crop
              )
              Spacer(modifier = Modifier.width(12.dp))
              Column(modifier = Modifier.weight(1f)) {
                Text(text = item.product.name, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "${item.product.price.toInt()} FCFA", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = JambarrPrimary)
                Spacer(modifier = Modifier.height(6.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                  IconButton(onClick = { if (item.quantity > 1) item.quantity-- }, modifier = Modifier.size(28.dp)) {
                    Icon(imageVector = Icons.Default.Remove, contentDescription = null, modifier = Modifier.size(14.dp))
                  }
                  Text(text = "${item.quantity}", modifier = Modifier.padding(horizontal = 8.dp), fontWeight = FontWeight.Bold)
                  IconButton(onClick = { item.quantity++ }, modifier = Modifier.size(28.dp)) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp))
                  }
                }
              }
            }
          }
        }
      }
    }

    if (cart.isNotEmpty()) {
      Surface(
        modifier = Modifier.fillMaxWidth(),
        color = JambarrSurface,
        shadowElevation = 8.dp
      ) {
        Column(modifier = Modifier.padding(20.dp)) {
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = "Sous-total", color = JambarrTextSecondary)
            Text(text = "${subtotal.toInt()} FCFA", fontWeight = FontWeight.SemiBold)
          }
          Spacer(modifier = Modifier.height(6.dp))
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = "Livraison", color = JambarrTextSecondary)
            Text(text = "${delivery.toInt()} FCFA", fontWeight = FontWeight.SemiBold)
          }
          Divider(modifier = Modifier.padding(vertical = 12.dp), color = JambarrBorder)
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = "Total", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
            Text(text = "${total.toInt()} FCFA", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = JambarrPrimary)
          }
          Spacer(modifier = Modifier.height(16.dp))
          JambarrButton(text = "Passer la commande", onClick = onCheckout)
        }
      }
    }
  }
}

@Composable
fun CartScreen(onBack: () -> Unit, onCheckout: () -> Unit) {
  Column(modifier = Modifier.fillMaxSize().background(JambarrBackground)) {
    JambarrTopBar(title = "Panier", onBackClick = onBack)
    CartScreenStandalone(onCheckout = onCheckout)
  }
}

@Composable
fun CheckoutScreen(onBack: () -> Unit, onProceedPayment: () -> Unit) {
  var name by remember { mutableStateOf("Mamadou Diallo") }
  var phone by remember { mutableStateOf("+221 77 888 99 00") }
  var address by remember { mutableStateOf("Almadies Route de Ngor") }
  var city by remember { mutableStateOf("Dakar") }

  Column(
    modifier = Modifier.fillMaxSize().background(JambarrBackground),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Column(modifier = Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(16.dp)) {
      JambarrTopBar(title = "Validation de commande", onBackClick = onBack)
      Spacer(modifier = Modifier.height(16.dp))

      Text(text = "Adresse de livraison", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(12.dp))

      OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nom complet") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))
      Spacer(modifier = Modifier.height(12.dp))
      OutlinedTextField(value = phone, onValueChange = { phone = it }, label = { Text("Téléphone") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))
      Spacer(modifier = Modifier.height(12.dp))
      OutlinedTextField(value = address, onValueChange = { address = it }, label = { Text("Adresse") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))
      Spacer(modifier = Modifier.height(12.dp))
      OutlinedTextField(value = city, onValueChange = { city = it }, label = { Text("Ville") }, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(10.dp))
    }

    Surface(modifier = Modifier.fillMaxWidth(), color = JambarrSurface, shadowElevation = 8.dp) {
      Column(modifier = Modifier.padding(20.dp)) {
        JambarrButton(text = "Procéder au paiement", onClick = onProceedPayment)
      }
    }
  }
}

@Composable
fun PaymentScreen(onBack: () -> Unit, onPaidSuccess: () -> Unit) {
  var selectedMethod by remember { mutableStateOf("Wave") }

  Column(
    modifier = Modifier.fillMaxSize().background(JambarrBackground),
    verticalArrangement = Arrangement.SpaceBetween
  ) {
    Column(modifier = Modifier.weight(1f).padding(16.dp)) {
      JambarrTopBar(title = "Paiement", onBackClick = onBack)
      Spacer(modifier = Modifier.height(20.dp))

      Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = JambarrSurface)
      ) {
        Column(modifier = Modifier.padding(20.dp)) {
          Text(text = "Montant total à payer", fontSize = 13.sp, color = JambarrTextSecondary)
          Spacer(modifier = Modifier.height(4.dp))
          Text(text = "57 000 FCFA", fontSize = 28.sp, fontWeight = FontWeight.ExtraBold, color = JambarrPrimary)
        }
      }

      Spacer(modifier = Modifier.height(24.dp))
      Text(text = "Choisissez votre mode de paiement", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(12.dp))

      Card(
        onClick = { selectedMethod = "Wave" },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = if (selectedMethod == "Wave") JambarrWave.copy(alpha = 0.1f) else JambarrSurface),
        border = BorderStroke(if (selectedMethod == "Wave") 2.dp else 1.dp, if (selectedMethod == "Wave") JambarrWave else JambarrBorder)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          RadioButton(selected = selectedMethod == "Wave", onClick = { selectedMethod = "Wave" })
          Spacer(modifier = Modifier.width(12.dp))
          Text(text = "Wave", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        }
      }

      Spacer(modifier = Modifier.height(12.dp))
      Card(
        onClick = { selectedMethod = "Orange Money" },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = if (selectedMethod == "Orange Money") JambarrOrangeMoney.copy(alpha = 0.1f) else JambarrSurface),
        border = BorderStroke(if (selectedMethod == "Orange Money") 2.dp else 1.dp, if (selectedMethod == "Orange Money") JambarrOrangeMoney else JambarrBorder)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          RadioButton(selected = selectedMethod == "Orange Money", onClick = { selectedMethod = "Orange Money" })
          Spacer(modifier = Modifier.width(12.dp))
          Text(text = "Orange Money", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
        }
      }
    }

    Surface(modifier = Modifier.fillMaxWidth(), color = JambarrSurface, shadowElevation = 8.dp) {
      Column(modifier = Modifier.padding(20.dp)) {
        JambarrButton(text = "Payer maintenant", onClick = onPaidSuccess)
      }
    }
  }
}

@Composable
fun OrderConfirmationScreen(onViewOrder: () -> Unit, onContinueShopping: () -> Unit) {
  Column(
    modifier = Modifier.fillMaxSize().background(JambarrSurface).padding(24.dp),
    verticalArrangement = Arrangement.Center,
    horizontalAlignment = Alignment.CenterHorizontally
  ) {
    Box(
      modifier = Modifier
        .size(90.dp)
        .clip(CircleShape)
        .background(JambarrSuccess.copy(alpha = 0.1f)),
      contentAlignment = Alignment.Center
    ) {
      Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = JambarrSuccess, modifier = Modifier.size(48.dp))
    }
    Spacer(modifier = Modifier.height(24.dp))
    Text(text = "Commande confirmée !", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    Spacer(modifier = Modifier.height(8.dp))
    Text(text = "Référence : #JBT-9821", fontSize = 15.sp, color = JambarrTextSecondary)
    Spacer(modifier = Modifier.height(36.dp))

    JambarrButton(text = "Voir ma commande", onClick = onViewOrder)
    Spacer(modifier = Modifier.height(12.dp))
    OutlinedButton(
      onClick = onContinueShopping,
      modifier = Modifier.fillMaxWidth().height(50.dp),
      shape = RoundedCornerShape(12.dp)
    ) {
      Text(text = "Continuer mes achats", color = JambarrPrimary, fontWeight = FontWeight.SemiBold)
    }
  }
}

@Composable
fun OrderDetailScreen(order: Order, onBack: () -> Unit) {
  Column(modifier = Modifier.fillMaxSize().background(JambarrBackground)) {
    JambarrTopBar(title = "Commande #${order.reference}", onBackClick = onBack)
    Column(modifier = Modifier.fillMaxSize().padding(16.dp).verticalScroll(rememberScrollState())) {
      Card(
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = JambarrSurface)
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = "Statut", color = JambarrTextSecondary)
            Text(text = order.status, fontWeight = FontWeight.Bold, color = JambarrPrimary)
          }
          Spacer(modifier = Modifier.height(8.dp))
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = "Date", color = JambarrTextSecondary)
            Text(text = order.date, fontWeight = FontWeight.SemiBold)
          }
          Spacer(modifier = Modifier.height(8.dp))
          Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text = "Paiement", color = JambarrTextSecondary)
            Text(text = order.paymentMethod, fontWeight = FontWeight.SemiBold)
          }
        }
      }

      Spacer(modifier = Modifier.height(16.dp))
      Text(text = "Produits commandés", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
      Spacer(modifier = Modifier.height(8.dp))

      order.items.forEach { item ->
        Card(
          modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
          shape = RoundedCornerShape(10.dp),
          colors = CardDefaults.cardColors(containerColor = JambarrSurface)
        ) {
          Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(model = item.product.imageUrl, contentDescription = null, modifier = Modifier.size(50.dp).clip(RoundedCornerShape(6.dp)), contentScale = ContentScale.Crop)
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
              Text(text = item.product.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
              Text(text = "Qté: ${item.quantity} x ${item.product.price.toInt()} FCFA", fontSize = 12.sp, color = JambarrTextSecondary)
            }
          }
        }
      }
    }
  }
}

@Composable
fun ProfileScreen(onOrderClick: (Order) -> Unit, onSwitchToDashboard: () -> Unit) {
  LazyColumn(
    modifier = Modifier.fillMaxSize().background(JambarrBackground),
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    item {
      Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = JambarrSurface)
      ) {
        Row(
          modifier = Modifier.padding(20.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Box(
            modifier = Modifier.size(60.dp).clip(CircleShape).background(JambarrPrimary.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
          ) {
            Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = JambarrPrimary, modifier = Modifier.size(32.dp))
          }
          Spacer(modifier = Modifier.width(16.dp))
          Column {
            Text(text = "Mamadou Diallo", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = "+221 77 888 99 00", fontSize = 13.sp, color = JambarrTextSecondary)
          }
        }
      }
    }

    item {
      Text(text = "Commandes récentes", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = JambarrTextPrimary)
    }

    items(JambarrRepository.orders) { order ->
      Card(
        onClick = { onOrderClick(order) },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = JambarrSurface)
      ) {
        Row(
          modifier = Modifier.fillMaxWidth().padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column {
            Text(text = "Commande #${order.reference}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = "${order.totalAmount.toInt()} FCFA • ${order.date}", fontSize = 12.sp, color = JambarrTextSecondary)
          }
          Surface(
            color = JambarrPrimary.copy(alpha = 0.1f),
            shape = RoundedCornerShape(6.dp)
          ) {
            Text(text = order.status, color = JambarrPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
          }
        }
      }
    }

    item {
      Spacer(modifier = Modifier.height(8.dp))
      Button(
        onClick = onSwitchToDashboard,
        modifier = Modifier.fillMaxWidth().height(50.dp),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = JambarrSecondary)
      ) {
        Icon(imageVector = Icons.Default.AdminPanelSettings, contentDescription = null)
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = "Basculer vers le Dashboard Admin / Gérant")
      }
    }
  }
}

@Composable
fun SettingsScreen(onBack: () -> Unit) {
  Column(modifier = Modifier.fillMaxSize().background(JambarrBackground)) {
    JambarrTopBar(title = "Paramètres", onBackClick = onBack)
    Text(text = "Paramètres de l'application mobile", modifier = Modifier.padding(16.dp))
  }
}
