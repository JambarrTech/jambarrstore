# Backend Local Development

This directory contains the Express.js backup API for local development.

## Configuration

1. Copy `.env.example` to `.env`
2. Set your `DATABASE_URL` (Neon PostgreSQL) and `JWT_SECRET`
3. Run `npm install`
4. Run seed: `npx prisma db push && npx prisma db seed` (from root)

## Running

```bash
npm start
# or for development
npm run dev
```

The API will be available at `http://localhost:3000/api/`.

## Note

For production, use the root `api/index.js` deployed on Vercel.
