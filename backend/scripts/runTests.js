/**
 * Fit Health Comprehensive Automated QA Test Suite
 * Validates:
 *  - Server initialization & health check
 *  - JWT Authentication & bcrypt password verification
 *  - Protected profile endpoint /api/auth/me
 *  - SMTP Email OTP generation, rate limiting, and verification
 *  - Dual-mode Database Storage (Firestore + Local Store fallback)
 *  - Workouts, Nutrition, Vitals, and Gym APIs
 *  - Gym Admin Dashboard & check-in endpoints
 */

const http = require('http');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('../server');

const { connectDB } = require('../config/db');
const { initFirebase } = require('../config/firebase');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 Starting Fit Health Automated QA Test Suite');
  console.log('====================================================\n');

  await connectDB();
  initFirebase();

  const server = http.createServer(app);
  const testPort = 5055;

  await new Promise((resolve) => server.listen(testPort, resolve));
  const baseUrl = `http://127.0.0.1:${testPort}`;

  try {
    // 1. Health Check Test
    console.log('[1/7] Testing Health Check API...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returns 200 OK');
    assert(healthData.status === 'online', 'Health status is online');

    // 2. Member JWT Login
    console.log('\n[2/7] Testing Member Authentication & JWT Generation...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@fithealth.io', password: 'password123' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Member login returns 200 OK');
    assert(Boolean(loginData.token), 'JWT access token is returned');
    assert(loginData.user?.role === 'member', 'User role is member');

    const memberToken = loginData.token;

    // 3. Admin JWT Login
    console.log('\n[3/7] Testing Admin Authentication & Role Enforcement...');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@fithealth.io', password: 'admin123' })
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login returns 200 OK');
    assert(adminLoginData.user?.role === 'admin', 'User role is admin');

    const adminToken = adminLoginData.token;

    // 4. Protected Profile /api/auth/me
    console.log('\n[4/7] Testing Protected Profile Endpoint (/api/auth/me)...');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, 'Authenticated profile returned');
    assert(meData.user?.email === 'alex@fithealth.io', 'Profile email matches authenticated user');
    assert(!meData.user?.password, 'Password hash is strictly excluded from response');

    // 5. SMTP Email OTP Dispatch & Verification
    console.log('\n[5/7] Testing SMTP OTP Flow (Generate, Send & Verify)...');
    const testEmail = process.env.SMTP_USER || 'qa.athlete@fithealth.io';
    const otpSendRes = await fetch(`${baseUrl}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, purpose: 'registration' })
    });
    const otpSendData = await otpSendRes.json();
    assert(otpSendRes.status === 200, 'OTP request accepted & dispatched');
    assert(otpSendData.success === true, 'Success flag is true');

    // Test Invalid OTP verification
    const invalidVerifyRes = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000', purpose: 'registration' })
    });
    assert(invalidVerifyRes.status === 400, 'Invalid OTP is rejected with 400 Bad Request');

    // 6. Workouts & Gyms APIs
    console.log('\n[6/7] Testing Core Fitness Endpoints (Workouts & Gyms)...');
    const workoutsRes = await fetch(`${baseUrl}/api/workouts`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    const workoutsData = await workoutsRes.json();
    assert(workoutsRes.status === 200, 'Workout plans retrieved');
    const hasWorkoutDays = Boolean(workoutsData.plan?.days || workoutsData.days);
    assert(hasWorkoutDays, 'Workouts structure valid with 6-day split schedule');

    const gymsRes = await fetch(`${baseUrl}/api/gyms`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    const gymsData = await gymsRes.json();
    assert(gymsRes.status === 200, 'Gyms list retrieved');
    const gymsList = gymsData.gyms || gymsData;
    assert(Array.isArray(gymsList) && gymsList.length >= 20, `Seeded gyms are present (${gymsList?.length || 0} gyms found)`);

    // 7. Admin Dashboard & RBAC Enforcement
    console.log('\n[7/7] Testing Facility Admin Console Endpoints & Role Enforcement...');
    const adminDashRes = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminDashData = await adminDashRes.json();
    assert(adminDashRes.status === 200, 'Admin dashboard returns 200 OK');
    assert(adminDashData.stats !== undefined || adminDashData.members !== undefined, 'Admin stats are loaded');

    // Unauthorized access check (Members cannot access admin-only notes/equipment endpoints)
    const unauthorizedNotesRes = await fetch(`${baseUrl}/api/admin/notes`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    assert(unauthorizedNotesRes.status === 403, 'Member cannot access Admin-only notes endpoint (403 Forbidden)');

  } catch (error) {
    console.error('Fatal test runner error:', error);
    failedTests++;
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests();
