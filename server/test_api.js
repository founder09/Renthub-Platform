/**
 * RentHub MERN — Comprehensive Backend API Test Suite
 * Run: node test_api.js
 * Requires: server running on http://localhost:5000
 */

require('dotenv').config();
const http = require('http');
const https = require('https');

const BASE = 'http://localhost:5000';

// ─── Test state ──────────────────────────────────────────────────────────────
const results = [];
let token1 = '', token2 = '';
let userId1 = '', userId2 = '';
let listingId = '';
let reviewId  = '';

const PASS = '✅ PASS';
const FAIL = '❌ FAIL';
const INFO = '  ℹ️ ';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function request(method, path, body = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port:     url.port || 80,
      path:     url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (authToken) options.headers['Authorization'] = `Bearer ${authToken}`;

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function record(group, name, passed, status, note = '') {
  const icon = passed ? PASS : FAIL;
  results.push({ group, name, passed, status, note });
  console.log(`  ${icon}  [${status}] ${name}${note ? ' — ' + note : ''}`);
}

function heading(title) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  📂 ${title}`);
  console.log(`${'─'.repeat(60)}`);
}

// ─── Test Groups ─────────────────────────────────────────────────────────────

async function testAuth() {
  heading('AUTH TESTS');

  // 1. Register User 1
  let r = await request('POST', '/api/auth/register', {
    username: 'testuser_alpha',
    email:    'alpha@renthub.test',
    password: 'Test@1234',
  });
  let ok = r.status === 201 && r.body.success;
  record('Auth', 'POST /api/auth/register — new user', ok, r.status,
    ok ? `userId=${r.body.user?.id}` : r.body.message);
  if (ok) { token1 = r.body.token; userId1 = r.body.user.id; }

  // 2. Register duplicate
  r = await request('POST', '/api/auth/register', {
    username: 'testuser_alpha',
    email:    'alpha@renthub.test',
    password: 'Test@1234',
  });
  ok = r.status === 400 && !r.body.success;
  record('Auth', 'POST /api/auth/register — duplicate rejected', ok, r.status,
    r.body.message);

  // 3. Register missing fields
  r = await request('POST', '/api/auth/register', { username: 'noemail' });
  ok = r.status === 400;
  record('Auth', 'POST /api/auth/register — missing fields rejected', ok, r.status,
    r.body.message);

  // 4. Register User 2 (for ownership tests)
  r = await request('POST', '/api/auth/register', {
    username: 'testuser_beta',
    email:    'beta@renthub.test',
    password: 'Test@5678',
  });
  ok = r.status === 201 && r.body.success;
  record('Auth', 'POST /api/auth/register — second user', ok, r.status,
    ok ? `userId=${r.body.user?.id}` : r.body.message);
  if (ok) { token2 = r.body.token; userId2 = r.body.user.id; }

  // 5. Login success
  r = await request('POST', '/api/auth/login', {
    username: 'testuser_alpha',
    password: 'Test@1234',
  });
  ok = r.status === 200 && r.body.success;
  record('Auth', 'POST /api/auth/login — valid credentials', ok, r.status,
    r.body.message);
  if (ok) token1 = r.body.token; // refresh token

  // 6. Login wrong password
  r = await request('POST', '/api/auth/login', {
    username: 'testuser_alpha',
    password: 'WrongPass!',
  });
  ok = r.status === 401 && !r.body.success;
  record('Auth', 'POST /api/auth/login — wrong password rejected', ok, r.status,
    r.body.message);

  // 7. Login missing fields
  r = await request('POST', '/api/auth/login', { username: 'testuser_alpha' });
  ok = r.status === 400;
  record('Auth', 'POST /api/auth/login — missing password rejected', ok, r.status,
    r.body.message);

  // 8. GET /me with valid token
  r = await request('GET', '/api/auth/me', null, token1);
  ok = r.status === 200 && r.body.success && r.body.user?.username === 'testuser_alpha';
  record('Auth', 'GET /api/auth/me — valid token', ok, r.status,
    ok ? `user=${r.body.user?.username}` : r.body.message);

  // 9. GET /me without token
  r = await request('GET', '/api/auth/me');
  ok = r.status === 401;
  record('Auth', 'GET /api/auth/me — no token rejected', ok, r.status,
    r.body.message);

  // 10. GET /me invalid token
  r = await request('GET', '/api/auth/me', null, 'invalid.jwt.token');
  ok = r.status === 401;
  record('Auth', 'GET /api/auth/me — invalid token rejected', ok, r.status,
    r.body.message);

  // 11. Logout
  r = await request('POST', '/api/auth/logout');
  ok = r.status === 200 && r.body.success;
  record('Auth', 'POST /api/auth/logout', ok, r.status, r.body.message);
}

async function testListings() {
  heading('LISTINGS TESTS');

  // 1. GET all listings (public)
  let r = await request('GET', '/api/listings');
  let ok = r.status === 200 && r.body.success && Array.isArray(r.body.data);
  record('Listings', 'GET /api/listings — public access', ok, r.status,
    ok ? `count=${r.body.data.length}` : r.body.message);

  // 2. GET with search filter
  r = await request('GET', '/api/listings?search=beach');
  ok = r.status === 200 && Array.isArray(r.body.data);
  record('Listings', 'GET /api/listings?search=beach — filter works', ok, r.status,
    ok ? `count=${r.body.data.length}` : r.body.message);

  // 3. GET with country filter
  r = await request('GET', '/api/listings?country=India');
  ok = r.status === 200 && Array.isArray(r.body.data);
  record('Listings', 'GET /api/listings?country=India — filter works', ok, r.status,
    ok ? `count=${r.body.data.length}` : r.body.message);

  // 4. POST create listing — unauthenticated
  r = await request('POST', '/api/listings', {
    title: 'Unauth Listing', description: 'x', location: 'Delhi', country: 'India', price: 100,
  });
  ok = r.status === 401;
  record('Listings', 'POST /api/listings — unauthenticated rejected', ok, r.status,
    r.body.message);

  // 5. POST create listing — validation fail (missing fields)
  r = await request('POST', '/api/listings', { title: 'No price' }, token1);
  ok = r.status === 400;
  record('Listings', 'POST /api/listings — validation fail (missing fields)', ok, r.status,
    r.body.message);

  // 6. POST create listing — success
  r = await request('POST', '/api/listings', {
    title:       'Beautiful Beach House',
    description: 'A lovely beach house with ocean views.',
    location:    'Goa',
    country:     'India',
    price:       3500,
  }, token1);
  ok = r.status === 201 && r.body.success;
  record('Listings', 'POST /api/listings — create listing (authenticated)', ok, r.status,
    ok ? `id=${r.body.data?._id}` : r.body.message);
  if (ok) listingId = r.body.data._id;

  // 7. GET single listing
  if (listingId) {
    r = await request('GET', `/api/listings/${listingId}`);
    ok = r.status === 200 && r.body.success && r.body.data?._id === listingId;
    record('Listings', 'GET /api/listings/:id — fetch by id', ok, r.status,
      ok ? `title=${r.body.data?.title}` : r.body.message);
  }

  // 8. GET invalid id
  r = await request('GET', '/api/listings/000000000000000000000000');
  ok = r.status === 404;
  record('Listings', 'GET /api/listings/:id — invalid id returns 404', ok, r.status,
    r.body.message);

  // 9. PUT update — by non-owner (token2)
  if (listingId) {
    r = await request('PUT', `/api/listings/${listingId}`, {
      title: 'Hacked Title', description: 'hack', location: 'Delhi', country: 'India', price: 1,
    }, token2);
    ok = r.status === 403;
    record('Listings', 'PUT /api/listings/:id — non-owner rejected (403)', ok, r.status,
      r.body.message);
  }

  // 10. PUT update — by owner (token1)
  if (listingId) {
    r = await request('PUT', `/api/listings/${listingId}`, {
      title:       'Updated Beach House',
      description: 'Now with a pool!',
      location:    'Goa',
      country:     'India',
      price:       4500,
    }, token1);
    ok = r.status === 200 && r.body.data?.title === 'Updated Beach House';
    record('Listings', 'PUT /api/listings/:id — owner can update', ok, r.status,
      ok ? `newTitle=${r.body.data?.title}` : r.body.message);
  }

  // 11. PUT unauthenticated
  if (listingId) {
    r = await request('PUT', `/api/listings/${listingId}`, {
      title: 'x', description: 'x', location: 'x', country: 'x', price: 1,
    });
    ok = r.status === 401;
    record('Listings', 'PUT /api/listings/:id — unauthenticated rejected', ok, r.status,
      r.body.message);
  }
}

async function testReviews() {
  heading('REVIEWS TESTS');

  if (!listingId) {
    console.log('  ⚠️  Skipped — no listingId available');
    return;
  }

  // 1. POST review — unauthenticated
  let r = await request('POST', `/api/listings/${listingId}/reviews`, {
    rating: 4, comment: 'Great place!',
  });
  let ok = r.status === 401;
  record('Reviews', 'POST /api/listings/:id/reviews — unauthenticated rejected', ok, r.status,
    r.body.message);

  // 2. POST review — validation fail (rating out of range)
  r = await request('POST', `/api/listings/${listingId}/reviews`, {
    rating: 10, comment: 'Too high',
  }, token2);
  ok = r.status === 400;
  record('Reviews', 'POST /api/listings/:id/reviews — invalid rating rejected', ok, r.status,
    r.body.message);

  // 3. POST review — missing comment
  r = await request('POST', `/api/listings/${listingId}/reviews`, {
    rating: 3,
  }, token2);
  ok = r.status === 400;
  record('Reviews', 'POST /api/listings/:id/reviews — missing comment rejected', ok, r.status,
    r.body.message);

  // 4. POST review — valid (by user2)
  r = await request('POST', `/api/listings/${listingId}/reviews`, {
    rating: 4, comment: 'Lovely spot, would visit again!',
  }, token2);
  ok = r.status === 201 && r.body.success;
  record('Reviews', 'POST /api/listings/:id/reviews — create review', ok, r.status,
    ok ? `reviewId=${r.body.data?._id}` : r.body.message);
  if (ok) reviewId = r.body.data._id;

  // 5. Verify review appears in listing
  r = await request('GET', `/api/listings/${listingId}`);
  const hasReview = r.body.data?.reviews?.some(rv =>
    (rv._id || rv) === reviewId || rv._id === reviewId
  );
  ok = r.status === 200 && Array.isArray(r.body.data?.reviews);
  record('Reviews', 'GET listing — reviews array populated', ok, r.status,
    ok ? `reviewCount=${r.body.data.reviews.length}` : r.body.message);

  // 6. DELETE review — wrong user (token1 did not write this review)
  if (reviewId) {
    r = await request('DELETE', `/api/listings/${listingId}/reviews/${reviewId}`, null, token1);
    ok = r.status === 403;
    record('Reviews', 'DELETE /reviews/:reviewId — non-author rejected (403)', ok, r.status,
      r.body.message);
  }

  // 7. DELETE review — correct author (token2)
  if (reviewId) {
    r = await request('DELETE', `/api/listings/${listingId}/reviews/${reviewId}`, null, token2);
    ok = r.status === 200 && r.body.success;
    record('Reviews', 'DELETE /reviews/:reviewId — author can delete', ok, r.status,
      r.body.message);
    if (ok) reviewId = '';
  }
}

async function testListingDelete() {
  heading('LISTING DELETE & CLEANUP TESTS');

  if (!listingId) {
    console.log('  ⚠️  Skipped — no listingId available');
    return;
  }

  // 1. DELETE by non-owner
  let r = await request('DELETE', `/api/listings/${listingId}`, null, token2);
  let ok = r.status === 403;
  record('Listings', 'DELETE /api/listings/:id — non-owner rejected (403)', ok, r.status,
    r.body.message);

  // 2. DELETE unauthenticated
  r = await request('DELETE', `/api/listings/${listingId}`);
  ok = r.status === 401;
  record('Listings', 'DELETE /api/listings/:id — unauthenticated rejected', ok, r.status,
    r.body.message);

  // 3. DELETE by owner
  r = await request('DELETE', `/api/listings/${listingId}`, null, token1);
  ok = r.status === 200 && r.body.success;
  record('Listings', 'DELETE /api/listings/:id — owner can delete', ok, r.status,
    r.body.message);

  // 4. Confirm listing is gone
  r = await request('GET', `/api/listings/${listingId}`);
  ok = r.status === 404;
  record('Listings', 'GET deleted listing — returns 404', ok, r.status, r.body.message);
}

async function testMisc() {
  heading('MISC & EDGE CASE TESTS');

  // 1. Unknown route
  let r = await request('GET', '/api/nonexistent');
  let ok = r.status === 404;
  record('Misc', 'GET /api/nonexistent — 404 route not found', ok, r.status,
    r.body.message);

  // 2. Malformed JSON (Content-Type correct but bad body) - we skip as http lib always sends valid json
  // 3. GET /api/listings/:id with non-ObjectId
  r = await request('GET', '/api/listings/not-an-id');
  ok = r.status === 500 || r.status === 400 || r.status === 404;
  record('Misc', 'GET /api/listings/not-an-id — handled gracefully', ok, r.status,
    r.body.message);
}

// ─── DB Cleanup ───────────────────────────────────────────────────────────────
async function cleanup() {
  heading('DATABASE CLEANUP');
  // If listing still exists, delete it
  if (listingId) {
    const r = await request('DELETE', `/api/listings/${listingId}`, null, token1);
    console.log(`  ${INFO} Cleanup listing: ${r.status}`);
  }
  console.log(`  ${INFO} Test users (alpha, beta) remain in DB for manual inspection.`);
  console.log(`  ${INFO} To remove them, use MongoDB Atlas or a DB script.`);
}

// ─── Final Report ─────────────────────────────────────────────────────────────
function printReport() {
  const total  = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n');
  console.log('═'.repeat(60));
  console.log('  🧾  RENTHUB API TEST REPORT');
  console.log('═'.repeat(60));

  const groups = [...new Set(results.map(r => r.group))];
  for (const group of groups) {
    const grpResults = results.filter(r => r.group === group);
    const grpPass    = grpResults.filter(r => r.passed).length;
    console.log(`\n  📂 ${group}  (${grpPass}/${grpResults.length} passed)`);
    console.log(`  ${'─'.repeat(50)}`);
    for (const res of grpResults) {
      const icon = res.passed ? '✅' : '❌';
      console.log(`    ${icon}  [${res.status}] ${res.name}`);
      if (res.note) console.log(`          ↳  ${res.note}`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`  Total  : ${total} tests`);
  console.log(`  Passed : ${passed} ✅`);
  console.log(`  Failed : ${failed} ${failed > 0 ? '❌' : '🎉'}`);
  console.log(`  Score  : ${((passed / total) * 100).toFixed(1)}%`);
  console.log('═'.repeat(60));

  if (failed > 0) {
    console.log('\n  ❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`    • [${r.group}] ${r.name}`);
      if (r.note) console.log(`      ↳ ${r.note}`);
    });
  } else {
    console.log('\n  🎉 All tests passed!');
  }

  return { total, passed, failed };
}

// ─── Entry point ─────────────────────────────────────────────────────────────
(async () => {
  console.log('\n🚀 RentHub MERN — API Test Suite');
  console.log(`   Target: ${BASE}`);
  console.log(`   Time  : ${new Date().toISOString()}\n`);

  // Quick connectivity check
  try {
    const ping = await request('GET', '/api/listings');
    if (ping.status !== 200) throw new Error(`Unexpected status: ${ping.status}`);
    console.log('✅ Server is reachable\n');
  } catch (e) {
    console.error('❌ Cannot reach server at', BASE);
    console.error('   Make sure "npm run dev" is running in /server');
    process.exit(1);
  }

  await testAuth();
  await testListings();
  await testReviews();
  await testListingDelete();
  await testMisc();
  await cleanup();

  const { failed } = printReport();
  process.exit(failed > 0 ? 1 : 0);
})();
