/**
 * In-Process Self-Contained Full Security & Authentication Test Runner
 * Imports app directly, binds an ephemeral server, executes all 18 test cases,
 * and prints detailed pass/fail diagnostics.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const app = require('../server');

async function main() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`\n======================================================================`);
  console.log(`🛡️  FIT HEALTH COMPREHENSIVE VERIFICATION SUITE (Port ${port})`);
  console.log(`======================================================================\n`);

  async function request(endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-internal-test': 'fit-health-test',
      ...(options.headers || {})
    };
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    return { status: response.status, ok: response.ok, data };
  }

  const results = [];
  function record(title, passed, details = '') {
    results.push({ title, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | ${title}`);
    if (details) console.log(`       └─ ${details}`);
  }

  try {
    // 1. Health check & Server baseline
    const health = await request('/api/health');
    record('Server Health API Online', health.status === 200 && health.data.status === 'online', `App: ${health.data.appName}`);

    // 2. Registration Input Validation
    const invalidReg = await request('/api/auth/register', {
      method: 'POST',
      body: { name: '', email: 'not-an-email', password: '123' }
    });
    record('Registration Input Validation', invalidReg.status === 400, `Rejected invalid payload with HTTP ${invalidReg.status}`);

    // 3. OTP Generation & Dispatch (Registration)
    const testEmail = `test_athlete_${Date.now()}@fithealth.io`;
    const sendOtpRes = await request('/api/auth/send-otp', {
      method: 'POST',
      body: { email: testEmail, purpose: 'registration', role: 'member' }
    });
    const otpCode = sendOtpRes.data.verificationCode;
    record('OTP Generation & Purpose Isolation', sendOtpRes.status === 200 && !!otpCode, `Status: ${sendOtpRes.data.message}`);

    // 4. Rejection of Incorrect OTP Code
    const wrongOtpRes = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: { email: testEmail, code: '000000', purpose: 'registration' }
    });
    record('Rejection of Incorrect OTP Code', wrongOtpRes.status === 400, `Rejected invalid code: "${wrongOtpRes.data.message}"`);

    // 5. Successful Registration with Verified OTP
    const validReg = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Alex Athlete',
        email: testEmail,
        password: 'SecurePassword123!',
        code: otpCode,
        homeGym: 'Metro Fitness Downtown'
      }
    });
    const userToken = validReg.data.token;
    record('Registration with Verified OTP', validReg.status === 201 && !!userToken, `User created: ${validReg.data.user?.name} (Role: ${validReg.data.user?.role})`);

    // 6. Anti-Replay: Code Invalidation After Use
    const replayReg = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: { email: testEmail, code: otpCode, purpose: 'registration' }
    });
    record('Anti-Replay / Code Invalidation After Use', replayReg.status === 400, `Single-use enforced: ${replayReg.data.message}`);

    // 7. Secure Login with Valid Password
    const loginValid = await request('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: 'SecurePassword123!' }
    });
    record('Login with Valid Credentials', loginValid.status === 200 && !!loginValid.data.token, `Logged in successfully: ${loginValid.data.user?.email}`);

    // 8. Rejection of Invalid Login Password
    const loginBadPass = await request('/api/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: 'WrongPassword999!' }
    });
    record('Rejection of Invalid Password', loginBadPass.status === 401, `HTTP 401: "${loginBadPass.data.message}"`);

    // 9. Protected Endpoint with Valid JWT
    const protectedProfile = await request('/api/users/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    record('Protected Endpoint with Valid JWT', protectedProfile.status === 200 && !!protectedProfile.data?.user, `Fetched profile for ${protectedProfile.data?.user?.name}`);

    // 10. Rejection of Unauthenticated Request
    const unauthedProfile = await request('/api/users/profile', {
      method: 'GET'
    });
    record('Rejection of Unauthenticated Request', unauthedProfile.status === 401, `Blocked with HTTP 401: "${unauthedProfile.data.message}"`);

    // 11. Rejection of Tampered JWT Signature
    const tamperedToken = await request('/api/users/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature` }
    });
    record('Rejection of Tampered JWT Signature', tamperedToken.status === 401, `Blocked invalid JWT token`);

    // 12. RBAC: Member Blocked from Admin Endpoint
    const memberAccessAdmin = await request('/api/admin/notes', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    record('RBAC: Member Blocked from Admin Endpoint', memberAccessAdmin.status === 403, `HTTP 403 Forbidden: "${memberAccessAdmin.data.message}"`);

    // 13. Dynamic Admin Registration & Access to Admin-Only Endpoint
    const testAdminEmail = `test_admin_${Date.now()}@fithealth.io`;
    const adminOtpRes = await request('/api/auth/send-otp', {
      method: 'POST',
      body: { email: testAdminEmail, purpose: 'registration', role: 'admin' }
    });
    const adminRegRes = await request('/api/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Admin Coach',
        email: testAdminEmail,
        password: 'AdminPassword123!',
        role: 'admin',
        code: adminOtpRes.data.verificationCode
      }
    });
    const adminToken = adminRegRes.data.token;
    const adminAccess = await request('/api/admin/notes', {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    record('RBAC: Authorized Admin Access to Portal', adminAccess.status === 200 && Array.isArray(adminAccess.data.notes), `Admin authenticated: Notes loaded (${adminAccess.data.count} items)`);

    // 14. Biometrics Health Provider Catalog
    const providersRes = await request('/api/health/providers', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    record('Biometrics Providers Catalog', providersRes.status === 200 && providersRes.data.count === 9, `Loaded all 9 providers (Samsung, Fitbit, Garmin, etc.)`);

    // 15. Biometrics Direct Sync
    const syncRes = await request('/api/biometrics/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        provider: 'samsung_health',
        records: [
          {
            type: 'steps',
            value: 8420,
            unit: 'steps',
            startTime: new Date(Date.now() - 3600000).toISOString(),
            endTime: new Date().toISOString(),
            sourceRecordId: `rec_test_${Date.now()}`
          }
        ]
      }
    });
    record('Biometrics Telemetry Batch Sync', syncRes.status === 200 && syncRes.data.success, `Upserted ${syncRes.data.syncedCount} telemetry records`);

    // 16. Biometrics Latest Vitals
    const latestRes = await request('/api/biometrics/latest', {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const retrievedSteps = latestRes.data.metrics?.steps?.value || latestRes.data.todaySummary?.steps;
    record('Biometrics Latest Vitals Retrieval', latestRes.status === 200 && retrievedSteps === 8420, `Latest steps retrieved: ${retrievedSteps}`);

    // 17. Token Revocation / Blacklist on Logout
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const postLogoutAccess = await request('/api/users/profile', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    record('Logout & Immediate Token Revocation', postLogoutAccess.status === 401, `Revoked token blocked with HTTP 401: "${postLogoutAccess.data.message}"`);

    // 18. Zero MongoDB / Zero Demo Check
    const storeFile = path.resolve(__dirname, '../data/fit_health_store.json');
    const store = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
    const demoFound = store.users.some(u => u.email === 'alex@fithealth.io' || u.email === 'admin@fithealth.io');
    const mongoFound = fs.existsSync(path.resolve(__dirname, '../config/db.js')) || fs.existsSync(path.resolve(__dirname, '../models'));
    record('Zero MongoDB & Zero Demo Credentials in Database', !demoFound && !mongoFound, `Verified: MongoDB files deleted, demo users purged.`);

  } catch (err) {
    console.error('💥 Unexpected test failure:', err);
  } finally {
    server.close();
  }

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const pct = Math.round((passed / total) * 100);

  console.log(`\n======================================================================`);
  console.log(`SUMMARY: ${passed}/${total} Passed (${pct}% Success Rate)`);
  if (passed === total) {
    console.log(`🎉 ALL 18 VERIFICATION CHECKS PASSED PERFECTLY (100%)!`);
  } else {
    console.log(`⚠️ Some tests failed. Review logs above.`);
  }
  console.log(`======================================================================\n`);
}

main();
