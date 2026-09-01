# 🎨 Guide d'Intégration Frontend

> Pour les développeurs frontend : guide complet pour intégrer l'API au dashboard et mobile

---

## 📌 Configuration Basique

### 1. API Base URL

**Pour le développement (local):**
```javascript
const API_BASE = 'http://localhost:5000/api';
```

**Pour la production (Vercel):**
```javascript
const API_BASE = 'https://jambarrtech.vercel.app/api';
// Ou
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';
```

### 2. Helper Function pour les Requêtes

```javascript
// Utiliser ce pattern dans tous les frontends
const api = {
  async request(method, path, body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_BASE}${path}`, options);
    
    if (res.status === 401) {
      // Token expiré - rediriger vers login
      localStorage.removeItem('jt_token');
      window.location.href = '/login';
    }
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
      throw new Error(err.error || `Erreur ${res.status}`);
    }
    
    return res.json();
  },
  
  // Convenience methods
  get(path, token) { return this.request('GET', path, null, token); },
  post(path, body, token) { return this.request('POST', path, body, token); },
  put(path, body, token) { return this.request('PUT', path, body, token); },
  delete(path, token) { return this.request('DELETE', path, null, token); }
};
```

---

## 🔐 Authentification

### 1. Enregistrement

```javascript
async function register(name, email, phone, password) {
  try {
    const res = await api.post('/auth/register', {
      name, email, phone, password
    });
    
    // Stocker le token
    localStorage.setItem('jt_token', res.token);
    
    // Stocker l'utilisateur
    localStorage.setItem('jt_user', JSON.stringify(res.user));
    
    return res.user;
  } catch (err) {
    console.error('Erreur inscription:', err.message);
    throw err;
  }
}
```

### 2. Connexion

```javascript
async function login(email, password) {
  try {
    const res = await api.post('/auth/login', { email, password });
    
    localStorage.setItem('jt_token', res.token);
    localStorage.setItem('jt_user', JSON.stringify(res.user));
    
    return res.user;
  } catch (err) {
    console.error('Erreur connexion:', err.message);
    throw err;
  }
}
```

### 3. Récupérer l'Utilisateur Connecté

```javascript
async function getCurrentUser() {
  try {
    const token = localStorage.getItem('jt_token');
    if (!token) return null;
    
    const user = await api.get('/auth/me', token);
    localStorage.setItem('jt_user', JSON.stringify(user));
    return user;
  } catch (err) {
    // Token expiré
    localStorage.removeItem('jt_token');
    localStorage.removeItem('jt_user');
    return null;
  }
}
```

### 4. Déconnexion

```javascript
function logout() {
  localStorage.removeItem('jt_token');
  localStorage.removeItem('jt_user');
  window.location.href = '/login';
}
```

---

## 📦 Récupérer les Données

### 1. Catégories

```javascript
async function getCategories() {
  try {
    return await api.get('/categories');
    // Retourne: [
    //   { id: 'c1', name: 'High-Tech', icon: '📱', _count: { products: 9 } },
    //   ...
    // ]
  } catch (err) {
    console.error('Erreur catégories:', err.message);
  }
}
```

### 2. Tous les Produits

```javascript
async function getProducts(options = {}) {
  const params = new URLSearchParams();
  
  if (options.limit) params.append('limit', options.limit);
  if (options.skip) params.append('skip', options.skip);
  if (options.search) params.append('search', options.search);
  if (options.category) params.append('category', options.category);
  if (options.sort) params.append('sort', options.sort);
  
  try {
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/products${query}`);
    // Retourne: { total: 42, data: [...] }
    return res.data;
  } catch (err) {
    console.error('Erreur produits:', err.message);
  }
}
```

### 3. Produits Vedettes

```javascript
async function getFeaturedProducts() {
  try {
    return await api.get('/products/featured');
    // Retourne array de produits
  } catch (err) {
    console.error('Erreur produits vedettes:', err.message);
  }
}
```

### 4. Produits en Flash (Promo)

```javascript
async function getFlashProducts() {
  try {
    return await api.get('/products/flash');
    // Retourne array de 17 produits en promotion
  } catch (err) {
    console.error('Erreur flash products:', err.message);
  }
}
```

### 5. Détails d'un Produit

```javascript
async function getProduct(id) {
  try {
    return await api.get(`/products/${id}`);
    // Retourne un produit avec tous les détails
  } catch (err) {
    console.error('Erreur produit:', err.message);
  }
}
```

---

## 🛒 Gestion des Commandes

### 1. Créer une Commande

```javascript
async function createOrder(items, total, notes = '') {
  try {
    const token = localStorage.getItem('jt_token');
    
    const res = await api.post('/orders', {
      items, // [{ productId: 'p1', quantity: 2 }, ...]
      total, // Total en FCFA
      notes,
      status: 'PENDING'
    }, token);
    
    return res;
  } catch (err) {
    console.error('Erreur création commande:', err.message);
    throw err;
  }
}
```

### 2. Récupérer Mes Commandes

```javascript
async function getMyOrders() {
  try {
    const token = localStorage.getItem('jt_token');
    return await api.get('/orders', token);
    // Retourne array de commandes de l'utilisateur
  } catch (err) {
    console.error('Erreur récupération commandes:', err.message);
  }
}
```

### 3. Détails d'une Commande

```javascript
async function getOrder(id) {
  try {
    const token = localStorage.getItem('jt_token');
    return await api.get(`/orders/${id}`, token);
  } catch (err) {
    console.error('Erreur détails commande:', err.message);
  }
}
```

### 4. Mettre à Jour une Commande

```javascript
async function updateOrder(id, updates) {
  try {
    const token = localStorage.getItem('jt_token');
    return await api.put(`/orders/${id}`, updates, token);
  } catch (err) {
    console.error('Erreur mise à jour commande:', err.message);
    throw err;
  }
}
```

---

## ⭐ Avis et Notes

### 1. Laisser un Avis

```javascript
async function submitReview(productId, rating, comment) {
  try {
    const token = localStorage.getItem('jt_token');
    
    return await api.post('/reviews', {
      productId,
      rating, // 1-5
      comment
    }, token);
  } catch (err) {
    console.error('Erreur avis:', err.message);
    throw err;
  }
}
```

### 2. Récupérer les Avis d'un Produit

```javascript
async function getProductReviews(productId) {
  try {
    return await api.get(`/reviews?productId=${productId}`);
  } catch (err) {
    console.error('Erreur avis produit:', err.message);
  }
}
```

---

## 📱 Composants Prêts à Utiliser

### 1. Barre de Recherche

```html
<input 
  type="text" 
  placeholder="Rechercher un produit..." 
  id="searchInput"
  onchange="handleSearch(this.value)"
/>

<script>
async function handleSearch(query) {
  if (query.length < 2) {
    showAllProducts();
    return;
  }
  
  const results = await getProducts({ search: query });
  displayProducts(results);
}
</script>
```

### 2. Filtrage par Catégorie

```html
<select id="categoryFilter" onchange="handleCategoryFilter(this.value)">
  <option value="">Toutes les catégories</option>
  <!-- Alimenté dynamiquement -->
</select>

<script>
async function handleCategoryFilter(categoryId) {
  if (!categoryId) {
    showAllProducts();
    return;
  }
  
  const products = await getProducts({ category: categoryId });
  displayProducts(products);
}
</script>
```

### 3. Panier d'Achat (localStorage)

```javascript
const cart = {
  items: [], // [{ id, name, price, quantity, imageUrl }]
  
  add(product, quantity = 1) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ ...product, quantity });
    }
    this.save();
  },
  
  remove(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.save();
  },
  
  update(productId, quantity) {
    const item = this.items.find(i => i.id === productId);
    if (item) item.quantity = quantity;
    this.save();
  },
  
  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },
  
  save() {
    localStorage.setItem('jt_cart', JSON.stringify(this.items));
  },
  
  load() {
    const saved = localStorage.getItem('jt_cart');
    this.items = saved ? JSON.parse(saved) : [];
  },
  
  clear() {
    this.items = [];
    this.save();
  }
};
```

### 4. Liste de Produits

```javascript
async function displayProducts(products) {
  const container = document.getElementById('productsContainer');
  
  container.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.imageUrl}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p class="price">${p.price.toLocaleString()} FCFA</p>
      ${p.oldPrice ? `<p class="old-price">${p.oldPrice.toLocaleString()} FCFA</p>` : ''}
      ${p.isFlash ? '<span class="badge-flash">⚡ Flash</span>' : ''}
      ${p.isFeatured ? '<span class="badge-featured">⭐ Vedette</span>' : ''}
      <button onclick="addToCart('${p.id}', '${p.name}', ${p.price}, '${p.imageUrl}')">
        Ajouter au panier
      </button>
    </div>
  `).join('');
}
```

---

## 🔒 Gestion des Erreurs

### Pattern Recommandé

```javascript
async function safeApiCall(fn, errorMsg = 'Une erreur est survenue') {
  try {
    return await fn();
  } catch (err) {
    console.error(errorMsg, err);
    showNotification(errorMsg, 'error');
    return null;
  }
}

// Utilisation
const products = await safeApiCall(
  () => getProducts({ limit: 50 }),
  'Impossible de charger les produits'
);
```

---

## 🧪 Tester Localement

```bash
# 1. Démarrer le backend
cd backend && npm run dev

# 2. Ouvrir le dashboard
# Visitez: http://localhost:5000/web-dashboard

# 3. Ouvrir le mobile
# Visitez: http://localhost:5000/web-mobile

# 4. Tester dans la console browser
const products = await api.get('/products?limit=10');
console.log(products);

const token = localStorage.getItem('jt_token');
const user = await api.get('/auth/me', token);
console.log(user);
```

---

## ✨ Conseils d'Implémentation

1. **Toujours utiliser le helper `api`** pour la cohérence
2. **Gérer les tokens correctement** - stocker et vérifier l'expiration
3. **Afficher les erreurs à l'utilisateur** - ne pas laisser les erreurs silencieuses
4. **Implémenter un loading state** pendant les requêtes
5. **Valider les données côté client** avant envoi
6. **Utiliser un système de cache** pour les données fréquemment accédées
7. **Paginer les listes** pour éviter les surcharges (limit/skip)

---

**Besoin d'aide ?** Consultez l'API complète dans [api/README.md](/api/README.md)
