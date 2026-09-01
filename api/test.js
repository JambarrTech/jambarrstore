#!/usr/bin/env node

/**
 * Script de test pour les API serverless JambarrTech
 * À utiliser avec le backend local ou un déploiement Vercel
 */

const API_BASE = process.env.API_URL || 'http://localhost:5000';

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log(`🧪 Tests API Serverless - Base: ${API_BASE}\n`);

  try {
    // Health Check
    console.log('✓ Health Check');
    const health = await request('GET', '/api/health');
    console.log(`  ${health.status}: ${JSON.stringify(health.data)}\n`);

    // Register
    console.log('✓ Authentification - Register');
    const email = `test-${Date.now()}@example.com`;
    const register = await request('POST', '/api/auth/register', {
      name: 'Test User',
      email,
      phone: '+221771234567',
      password: 'password123',
      role: 'CLIENT'
    });
    console.log(`  ${register.status}: ${register.data.user ? 'Utilisateur créé' : register.data.error}\n`);
    const token = register.data.token;

    // Login
    if (register.status === 201) {
      console.log('✓ Authentification - Login');
      const login = await request('POST', '/api/auth/login', {
        email,
        password: 'password123'
      });
      console.log(`  ${login.status}: ${login.data.user ? 'Connexion réussie' : login.data.error}\n`);
    }

    // Get Current User
    if (token) {
      console.log('✓ Authentification - Get Current User');
      const options = {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      const res = await fetch(`${API_BASE}/api/auth/me`, options);
      const data = await res.json();
      console.log(`  ${res.status}: ${data.id ? 'Utilisateur trouvé' : data.error}\n`);
    }

    // Products
    console.log('✓ Produits - List');
    const products = await request('GET', '/api/products');
    console.log(`  ${products.status}: ${products.data.length || 0} produits trouvés\n`);

    // Categories
    console.log('✓ Catégories - List');
    const categories = await request('GET', '/api/categories');
    console.log(`  ${categories.status}: ${categories.data.length || 0} catégories trouvées\n`);

    console.log('✅ Tests complétés');
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
  }
}

runTests();
