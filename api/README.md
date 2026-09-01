# JambarrTech API Serverless (Vercel)

Les fonctions serverless de JambarrTech sont déployées sur Vercel et utilisent Prisma ORM pour accéder à la base de données PostgreSQL.

## 📂 Structure

```
api/
├── index.js           # Routeur principal (Point d'entrée)
├── health.js          # Vérification de santé de l'API
├── auth.js            # Authentification (register, login)
├── products.js        # Gestion des produits
├── categories.js      # Gestion des catégories
├── orders.js          # Gestion des commandes
└── lib/
    ├── prisma.js      # Client Prisma (singleton)
    └── cors.js        # Middleware CORS pour Vercel
```

## 🔌 Endpoints Serverless

### Health Check
```
GET /api/health
```
Vérifie la connexion à la base de données.

### Authentification

#### Register
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+221771234567",
  "password": "secure_password",
  "role": "CLIENT" // Optional: CLIENT (default), ADMIN, MANAGER
}
```

#### Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Produits

#### Lister tous les produits
```
GET /api/products
```

#### Récupérer un produit
```
GET /api/products/{id}
```

### Catégories

#### Lister toutes les catégories
```
GET /api/categories
```

#### Récupérer une catégorie
```
GET /api/categories/{id}
```

### Commandes

#### Lister les commandes (authentifié)
```
GET /api/orders
Authorization: Bearer <token>
```

#### Créer une commande
```
POST /api/orders
{
  "clientName": "John Doe",
  "clientPhone": "+221771234567",
  "clientAddress": "Dakar, Sénégal",
  "paymentMethod": "Wave", // ou "Orange Money"
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 15000
    }
  ]
}
```

## 🚀 Déploiement

Les fonctions serverless sont automatiquement déployées avec Vercel lors d'un push vers la branche principale.

### Configuration Vercel

```json
// vercel.json
{
  "buildCommand": "npx prisma generate",
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### Variables d'environnement requises

- `DATABASE_URL` - URL de connexion PostgreSQL
- `JWT_SECRET` - Clé secrète pour les JWT

## 🔐 Authentification

Les tokens JWT sont valides pendant **7 jours**.

Include the token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## 📊 Rate Limiting

- **Lecture (GET)** : 60 requêtes par minute
- **Écriture (POST, PUT, PATCH, DELETE)** : 30 requêtes par minute

## 🔗 Lien avec le Backend

Les fonctions serverless utilisent la même base de données et les mêmes modèles Prisma que le backend Express. Elles peuvent être utilisées comme :

- API alternative sans déployer le backend
- Complément pour des fonctions spécifiques
- Distribution de contenu en edge (Vercel Edge Functions)

## Notes

- Toutes les réponses utilisent le format JSON
- Les erreurs incluent un message `error`
- Les statuts HTTP standard sont utilisés (200, 201, 400, 401, 404, 500, etc.)
