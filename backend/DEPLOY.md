# Guide de Déploiement - Vercel + Neon

## 1. Configurer Neon (PostgreSQL)

1. Crée un compte sur [neon.tech](https://neon.tech)
2. Crée un nouveau projet
3. Copie la **Connection string** (format: `postgresql://...@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require`)

## 2. Configurer Vercel

1. Installe Vercel CLI : `npm i -g vercel`
2. Connecte-toi : `vercel login`
3. Va dans le dossier `backend/`
4. Lance : `vercel`
5. Configure le projet Vercel

## 3. Variables d'Environnement

Dans le dashboard Vercel, ajoute :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | Ta connexion Neon |
| `JWT_SECRET` | Un secret aléatoire |

## 4. Installer les dépendances et migrer

```bash
cd backend
npm install
npx prisma db push
npm run seed
```

## 5. Déployer

```bash
vercel --prod
```

## 6. Mettre à jour l'app Android

Dans `ApiService.kt`, remplace `BASE_URL` par ton URL Vercel :

```kotlin
const val BASE_URL = "https://ton-projet.vercel.app"
```

## 7. Tester l'API

- Health: `https://ton-projet.vercel.app/api/health`
- Produits: `https://ton-projet.vercel.app/api/products`
- Catégories: `https://ton-projet.vercel.app/api/categories`
