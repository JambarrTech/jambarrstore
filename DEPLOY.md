# Déploiement Vercel — 3 projets séparés

## Étape 1 : Créer les 3 projets Vercel

Aller sur https://vercel.com et créer **3 nouveaux projets** :

### Projet 1 : `jambarrstore` (Client)

| Champ | Valeur |
|-------|--------|
| Name | `jambarrstore` |
| Git Repo | `JambarrTech/jambarrstore` |
| Framework | Vite |
| Root Directory | `services/client` |
| Build Command | `cd ../.. && npm install && cd services/client && npm run build` |
| Output Directory | `dist` |

**Variables d'environnement :**
```
VITE_API_URL = https://jambarrstore-api.vercel.app
```

### Projet 2 : `jambarrstore-admin` (Admin)

| Champ | Valeur |
|-------|--------|
| Name | `jambarrstore-admin` |
| Git Repo | `JambarrTech/jambarrstore` |
| Framework | Vite |
| Root Directory | `services/admin` |
| Build Command | `cd ../.. && npm install && cd services/admin && npm run build` |
| Output Directory | `dist` |

**Variables d'environnement :**
```
VITE_API_URL = https://jambarrstore-api.vercel.app
```

### Projet 3 : `jambarrstore-api` (Backend)

| Champ | Valeur |
|-------|--------|
| Name | `jambarrstore-api` |
| Git Repo | `JambarrTech/jambarrstore` |
| Framework | Other |
| Root Directory | `.` (racine) |
| Build Command | `npm install && npx prisma generate` |
| Output Directory | `api` |

**Variables d'environnement :**
```
DATABASE_URL = postgresql://neondb_owner:npg_xxx@ep-xxx.neon.tech/neondb?sslmode=require
JWT_SECRET = un-secret-aleatoire-ici
```

## Étape 2 : Configurer les rewrites

Pour chaque projet, ajouter dans **Settings → Domains** ou **vercel.json** :

### Client (`jambarrstore`)
- Fichier `services/client/vercel.json` (déjà créé)
- Redirige `/api/*` vers l'API
- Redirige tout le reste vers `index.html` (SPA)

### Admin (`jambarrstore-admin`)
- Fichier `services/admin/vercel.json` (déjà créé)
- Redirige tout vers `index.html` (SPA)

### API (`jambarrstore-api`)
- Fichier `vercel.json` à la racine du repo
- Configure les Serverless Functions

## Étape 3 : Seed la base

```bash
DATABASE_URL="votre-url-neon" npx prisma db seed
```

## URLs finales

| Service | URL |
|---------|-----|
| Client | `https://jambarrstore.vercel.app` |
| Admin | `https://jambarrstore-admin.vercel.app` |
| API | `https://jambarrstore-api.vercel.app/api/*` |

## Comptes par défaut

| Rôle | Email | Password |
|------|-------|----------|
| Admin | `admin@jambarrstore.com` | `admin123` |
| Client | `client@jambarrstore.com` | `client123` |
