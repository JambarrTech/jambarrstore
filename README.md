<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# JambarrTech - E-commerce Sénégal

**JambarrTech** est une plateforme e-commerce complète pour le Sénégal, incluant un backend API, un dashboard administrateur et une interface mobile web.

## Architecture

- **Backend** : Node.js + Express + Prisma ORM + PostgreSQL
- **Dashboard** : Interface web d'administration
- **Mobile Web** : Application responsif pour clients
- **API** : Fonctions serverless Vercel

## Démarrage local

### Prérequis
- Node.js >= 18
- PostgreSQL
- Variable d'environnement `DATABASE_URL` configurée

### Installation

```bash
# Installer les dépendances du backend
cd backend
npm install

# Configurer la base de données
npm run db:push

# Démarrer le serveur
npm run dev
```

L'API sera disponible à `http://localhost:5000`
