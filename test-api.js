#!/usr/bin/env node
/**
 * JambarrTech API Test Suite - Simplified Version
 * Tests all endpoints using child_process to run curl commands
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const API_BASE = 'http://localhost:5000/api';
let testToken = null;
const results = [];

async function request(method, path, body = null, token = null) {
  let cmd = `curl -s -X ${method} "${API_BASE}${path}"`;
  
  if (token) {
    cmd += ` -H "Authorization: Bearer ${token}"`;
  }
  
  cmd += ` -H "Content-Type: application/json"`;
  
  if (body) {
    const jsonBody = JSON.stringify(body).replace(/"/g, '\\"');
    cmd += ` -d "${jsonBody}"`;
  }
  
  try {
    const { stdout } = await execAsync(cmd, { shell: 'powershell.exe' });
    return JSON.parse(stdout);
  } catch (err) {
    console.error('Request error:', err.message);
    throw err;
  }
}

async function test(name, fn) {
  try {
    console.log(`\n🧪 ${name}...`);
    const result = await fn();
    results.push({ name, status: '✅ PASS' });
    console.log(`  ✅ PASS`);
    return result;
  } catch (err) {
    results.push({ name, status: '❌ FAIL', error: err.message });
    console.log(`  ❌ FAIL: ${err.message}`);
    return null;
  }
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   🚀 JambarrTech API Test Suite 🚀        ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // ==================== HEALTH CHECK ====================
    await test('Health Check', async () => {
      const res = await request('GET', '/health');
      if (!res.status || !res.database) throw new Error('Invalid response');
      console.log(`    Database: ${res.database}`);
      return res;
    });

    // ==================== CATEGORIES ====================
    await test('Get Categories', async () => {
      const res = await request('GET', '/categories');
      if (!Array.isArray(res)) throw new Error('Not an array');
      if (res.length === 0) throw new Error('No categories found');
      console.log(`    Found ${res.length} categories`);
      return res;
    });

    // ==================== PRODUCTS ====================
    await test('Get All Products', async () => {
      const res = await request('GET', '/products?limit=50');
      if (!res.data) throw new Error('No data field');
      if (res.data.length === 0) throw new Error('No products found');
      console.log(`    Found ${res.total || res.data.length} products`);
      return res;
    });

    await test('Get Featured Products', async () => {
      const res = await request('GET', '/products/featured');
      console.log(`    Found ${res.length || 0} featured products`);
      return res;
    });

    await test('Get Flash Sale Products', async () => {
      const res = await request('GET', '/products/flash');
      console.log(`    Found ${res.length || 0} flash products`);
      return res;
    });

    await test('Get Single Product', async () => {
      const res = await request('GET', '/products/p1');
      if (!res.id) throw new Error('No product ID');
      console.log(`    Product: ${res.name}`);
      return res;
    });

    // ==================== AUTHENTICATION ====================
    const randomEmail = `test${Date.now()}@jambarrtech.com`;
    const randomPhone = `221776${Math.floor(Math.random() * 1000000)}`;

    await test('Register New User', async () => {
      const res = await request('POST', '/auth/register', {
        name: 'Test User',
        email: randomEmail,
        phone: randomPhone,
        password: 'Test@123456'
      });
      if (!res.user) throw new Error('No user in response');
      console.log(`    User: ${res.user.email}`);
      return res;
    });

    await test('Login User', async () => {
      const res = await request('POST', '/auth/login', {
        email: randomEmail,
        password: 'Test@123456'
      });
      if (!res.token) throw new Error('No token in response');
      testToken = res.token;
      console.log(`    Token: ${testToken.substring(0, 20)}...`);
      return res;
    });

    await test('Get Current User', async () => {
      const res = await request('GET', '/auth/me', null, testToken);
      if (!res.id) throw new Error('No user ID');
      console.log(`    User: ${res.name} (${res.role})`);
      return res;
    });

    // ==================== SUMMARY ====================
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          📊 TEST RESULTS SUMMARY           ║');
    console.log('╚════════════════════════════════════════════╝\n');

    const passed = results.filter(r => r.status === '✅ PASS').length;
    const failed = results.filter(r => r.status === '❌ FAIL').length;

    console.log(`Total Tests: ${results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}\n`);

    results.forEach(r => {
      console.log(`  ${r.status} ${r.name}${r.error ? ` - ${r.error}` : ''}`);
    });

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! API is ready for production.');
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed. Please review.`);
    }

  } catch (err) {
    console.error('\n❌ Test suite error:', err.message);
  }
}

runTests();
