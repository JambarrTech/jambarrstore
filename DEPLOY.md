# 🚀 Guide de déploiement — JambarrStore

## Architecture de production

```
┌─────────────────────┐     ┌─────────────────────┐
│   Client (Vercel)   │     │   Admin (Vercel)    │
│  jambarrstore.app   │     │ admin-jambarr.app   │
└─────────┬───────────┘     └─────────┬───────────┘
          │                           │
          └───────────┬───────────────┘
                      │
              ┌───────▼───────┐
              │  API (Railway) │
              │  api-jambarr  │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  Neon Postgres │
              └───────────────┘
```

## Étape 1 : Déployer l'API sur Railway

1. Créer un compte sur [railway.app](https://railway.app)
2. Créer un nouveau projet → "Deploy from GitHub repo"
3. Sélectionner le repo `JambarrTech/jambarrstore`
4. Configurer le **Root Directory** : `services/api`
5. Ajouter les variables d'environnement :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_xxx@ep-xxx.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | `un-secret-aleatoire-long` |
| `PORT` | `3001` |

6. Railway va automatiquement détecter et déployer
7. Noter l'URL de l'API (ex: `https://api-jambarrstore.up.railway.app`)

## Étape 2 : Déployer le Client sur Vercel

1. Créer un compte sur [vercel.com](https://vercel.com)
2. Importer le repo `JambarrTech/jambarrstore`
3. Configurer :

| Paramètre | Valeur |
|-----------|--------|
| **Framework** | Vite |
| **Root Directory** | `services/client` |
| **Build Command** | `cd ../.. && npm install && cd services/client && npm run build` |
| **Output Directory** | `dist` |

4. Ajouter la variable d'environnement :

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | `https://api-jambarrstore.up.railway.app` |

5. Déployer

## Étape 3 : Déployer l'Admin sur Vercel

1. Créer un **nouveau projet** Vercel (séparé)
2. Importer le même repo `JambarrTech/jambarrstore`
3. Configurer :

| Paramètre | Valeur |
|-----------|--------|
| **Framework** | Vite |
| **Root Directory** | `services/admin` |
| **Build Command** | `cd ../.. && npm install && cd services/admin && npm run build` |
| **Output Directory** | `dist` |

4. Ajouter la variable d'environnement :

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | `https://api-jambarrstore.up.railway.app` |

5. Déployer

## Étape 4 : Seed la base de données

Après le déploiement de l'API, exécuter le seed une seule fois :

```bash
# En local avec la DB de production
DATABASE_URL="votre-url-neon" npx prisma db seed
```

Ou via Railway :
```bash
railway run npx prisma db seed
```

## Comptes par défaut

| Rôle | Email | Password |
|------|-------|----------|
| Admin | `admin@jambarrstore.com` | `admin123` |
| Client | `client@jambarrstore.com` | `client123` |

## URLs finales

| Service | URL |
|---------|-----|
| Client | `https://jambarrstore.vercel.app` |
| Admin | `https://admin-jambarrstore.vercel.app` |
| API | `https://api-jambarrstore.up.railway.app` |

## Variables d'environnement Vercel

Dans le dashboard Vercel → Settings → Environment Variables :

### Client
```
VITE_API_URL = https://api-jambarrstore.up.railway.app
```

### Admin
```
VITE_API_URL = https://api-jambarrstore.up.railway.app
```

### API (Railway)
```
DATABASE_URL = postgresql://neondb_owner:npg_xxx@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET = un-secret-aleatoire-ici
PORT = 3001
```
