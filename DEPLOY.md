# 🚀 Guide de déploiement — JambarrStore (100% Vercel)

## Architecture

```
┌─────────────────────────────────────────┐
│              Vercel                      │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │ Client (SPA) │  │ Admin (SPA)      │ │
│  │ /            │  │ /admin           │ │
│  └──────────────┘  └──────────────────┘ │
│  ┌──────────────────────────────────────┐│
│  │ API (Serverless Functions)           ││
│  │ /api/auth/login                      ││
│  │ /api/products                        ││
│  │ /api/orders                          ││
│  └──────────────────────────────────────┘│
└─────────────────┬───────────────────────┘
                  │
          ┌───────▼───────┐
          │ Neon Postgres  │
          └───────────────┘
```

## Étape 1 : Créer le projet Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Importer le repo `JambarrTech/jambarrstore`
3. Vercel détectera automatiquement le monorepo

## Étape 2 : Configurer le projet

Dans le dashboard Vercel → **Settings** → **General** :

| Paramètre | Valeur |
|-----------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `services/client` |
| **Build Command** | `cd ../.. && npm install && cd services/client && npm run build` |
| **Output Directory** | `dist` |

## Étape 3 : Variables d'environnement

Dans **Settings** → **Environment Variables** :

| Variable | Valeur | Environments |
|----------|--------|--------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_xxx@ep-xxx.neon.tech/neondb?sslmode=require` | Production, Preview |
| `JWT_SECRET` | `un-secret-aleatoire-long-ici` | Production, Preview |
| `VITE_API_URL` | (vide — même domaine) | Production, Preview |

## Étape 4 : Route rewriting

Le `vercel.json` à la racine configure :
- `/api/*` → Serverless Functions
- `/admin/*` → Admin SPA
- `/*` → Client SPA

## Étape 5 : Seed la base

```bash
# En local avec la DB Neon
DATABASE_URL="votre-url-neon" npx prisma db seed
```

## Comptes par défaut

| Rôle | Email | Password |
|------|-------|----------|
| Admin | `admin@jambarrstore.com` | `admin123` |
| Client | `client@jambarrstore.com` | `client123` |

## Structure des Serverless Functions

```
api/
├── lib/prisma.ts          # Singleton Prisma
├── auth/
│   ├── login.ts           # POST /api/auth/login
│   ├── register.ts        # POST /api/auth/register
│   └── me.ts              # GET /api/auth/me
├── categories/
│   └── index.ts           # GET /api/categories
├── products/
│   ├── index.ts           # GET/POST /api/products
│   └── [id].ts            # PUT/DELETE/PATCH /api/products/:id
├── orders/
│   ├── index.ts           # GET/POST /api/orders
│   └── [id].ts            # GET/PATCH /api/orders/:id
├── customers/
│   └── index.ts           # GET /api/customers
└── dashboard/
    ├── stats.ts           # GET /api/dashboard/stats
    └── sales.ts           # GET /api/dashboard/sales
```

## URLs finales

| Service | URL |
|---------|-----|
| Client | `https://votre-projet.vercel.app` |
| Admin | `https://votre-projet.vercel.app/admin` |
| API | `https://votre-projet.vercel.app/api/*` |

## Déploiement

```bash
# Pousser sur GitHub
git push origin main

# Vercel déploie automatiquement
# Pas de Railway, pas de Render — tout est sur Vercel
```
