/**
 * Comprehensive Verification: Mobile & Email Authentication & Security Policy
 */
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const makeRequest = (path, method = 'GET', data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (data) {
      reqHeaders['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const runTests = async () => {
  console.log('--- 🧪 STARTING COMPLETE MOBILE & EMAIL AUTHENTICATION SUITE ---');
  let passed = 0;
  let total = 0;

  const assert = (condition, msg) => {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
    }
  };

  const testMobile = `+91 99887 76655`;
  const testMobilePassword = 'MemberSecurePass#123';
  const testEmail = `athlete_${Date.now()}@testfithealth.io`;
  const testEmailPassword = 'AthletePass#456';
  const testAdminMobile = `+91 99112 23344`;
  const testAdminPassword = 'AdminSecurePass#789';

  // 1. Send OTP to mobile phone for registration
  console.log('\n[1] Testing Mobile Phone Registration Flow...');
  const sendMobileOtpRes = await makeRequest('/auth/send-otp', 'POST', {
    phone: testMobile,
    purpose: 'registration',
    role: 'member'
  }, { 'x-internal-test': 'fit-health-test' });

  assert(sendMobileOtpRes.status === 200, `Mobile OTP dispatch status 200 (got ${sendMobileOtpRes.status})`);
  assert(sendMobileOtpRes.data.isMobile === true, 'Response marks isMobile = true');
  assert(Boolean(sendMobileOtpRes.data.verificationCode), `Verification code returned: ${sendMobileOtpRes.data.verificationCode}`);

  const mobileCode = sendMobileOtpRes.data.verificationCode;

  // 2. Verify Mobile OTP in Authentication Section
  const verifyMobileRes = await makeRequest('/auth/verify-otp', 'POST', {
    phone: testMobile,
    otp: mobileCode,
    purpose: 'registration'
  });
  assert(verifyMobileRes.status === 200, `Mobile OTP verified successfully (status 200)`);
  assert(verifyMobileRes.data.verified === true, 'Verification returns verified = true');

  // 3. Register member with Mobile Phone
  const registerMobileRes = await makeRequest('/auth/register', 'POST', {
    name: 'Mobile Athlete Bharath',
    phone: testMobile,
    password: testMobilePassword,
    role: 'member',
    code: mobileCode,
    age: 24,
    gender: 'Male',
    height: 175,
    weight: 75,
    primaryGoal: 'General fitness',
    fitnessLevel: 'Intermediate'
  });
  assert(registerMobileRes.status === 200 || registerMobileRes.status === 201, `Member registered with mobile phone (status ${registerMobileRes.status})`);
  assert(Boolean(registerMobileRes.data.token), 'Registration returns valid JWT session token');
  assert(registerMobileRes.data.user.role === 'member', 'Registered user has role = member');

  const memberToken = registerMobileRes.data.token;

  // 4. Test Token Auth Middleware with the Mobile User
  const meRes = await makeRequest('/auth/me', 'GET', null, {
    'Authorization': `Bearer ${memberToken}`
  });
  assert(meRes.status === 200, `Profile fetched via session token (status 200)`);
  assert(meRes.data.user.name === 'Mobile Athlete Bharath', `Profile name matches: ${meRes.data.user.name}`);
  assert(meRes.data.user.primaryGoal === 'General fitness', 'Goal retained properly');

  // 5. Test Password Login with Mobile Phone
  console.log('\n[2] Testing Mobile Phone Password Login...');
  const loginMobilePassRes = await makeRequest('/auth/login', 'POST', {
    identifier: testMobile,
    password: testMobilePassword,
    role: 'member'
  });
  assert(loginMobilePassRes.status === 200, `Mobile phone password login succeeds (status 200)`);
  assert(Boolean(loginMobilePassRes.data.token), 'Mobile login returns session token');

  // 6. Test OTP Login with Mobile Phone
  console.log('\n[3] Testing Mobile Phone OTP Login Flow...');
  const sendLoginOtpRes = await makeRequest('/auth/send-otp', 'POST', {
    phone: testMobile,
    purpose: 'login',
    role: 'member'
  }, { 'x-internal-test': 'fit-health-test' });
  assert(sendLoginOtpRes.status === 200, 'Login OTP dispatched to mobile');
  const loginOtpCode = sendLoginOtpRes.data.verificationCode;

  const loginWithOtpRes = await makeRequest('/auth/login-otp', 'POST', {
    phone: testMobile,
    otp: loginOtpCode,
    role: 'member'
  });
  assert(loginWithOtpRes.status === 200, 'Mobile phone OTP login succeeds (status 200)');
  assert(Boolean(loginWithOtpRes.data.token), 'Returns session token for OTP login');

  // 7. Test Admin Registration & Login with Mobile Phone
  console.log('\n[4] Testing Admin Mobile Registration & Security Policy...');
  const sendAdminOtpRes = await makeRequest('/auth/send-otp', 'POST', {
    phone: testAdminMobile,
    purpose: 'registration',
    role: 'admin'
  }, { 'x-internal-test': 'fit-health-test' });
  const adminCode = sendAdminOtpRes.data.verificationCode;

  const registerAdminRes = await makeRequest('/auth/register', 'POST', {
    name: 'Admin Coach Marcus',
    phone: testAdminMobile,
    password: testAdminPassword,
    role: 'admin',
    code: adminCode
  });
  assert(registerAdminRes.status === 200 || registerAdminRes.status === 201, `Admin registered with mobile phone (status ${registerAdminRes.status})`);
  assert(registerAdminRes.data.user.role === 'admin', 'Registered admin has role = admin');

  // 8. Admin Login with Admin Mobile
  const loginAdminRes = await makeRequest('/auth/login', 'POST', {
    identifier: testAdminMobile,
    password: testAdminPassword,
    role: 'admin'
  });
  assert(loginAdminRes.status === 200, 'Admin login with mobile succeeds');

  // 9. STRICT SECURITY POLICY: Attempt to login as Admin using Member Credentials
  console.log('\n[5] Testing Strict Role Separation Policy...');
  const maliciousAdminLogin = await makeRequest('/auth/login', 'POST', {
    identifier: testMobile,
    password: testMobilePassword,
    role: 'admin'
  });
  assert(maliciousAdminLogin.status === 403, `Admin portal blocks member credentials with HTTP 403 (got ${maliciousAdminLogin.status})`);
  assert(maliciousAdminLogin.data.securityAlert === true, 'Returns securityAlert: true');
  assert(maliciousAdminLogin.data.message.includes('Security Alert'), 'Clear security warning message returned');

  // 10. Test Email Registration & Login
  console.log('\n[6] Testing Email Registration & Authentication Section...');
  const sendEmailOtpRes = await makeRequest('/auth/send-otp', 'POST', {
    email: testEmail,
    purpose: 'registration',
    role: 'member'
  }, { 'x-internal-test': 'fit-health-test' });
  assert(sendEmailOtpRes.status === 200, 'Email OTP dispatched');
  const emailCode = sendEmailOtpRes.data.verificationCode;

  const registerEmailRes = await makeRequest('/auth/register', 'POST', {
    name: 'Email Athlete',
    email: testEmail,
    password: testEmailPassword,
    role: 'member',
    code: emailCode
  });
  assert(registerEmailRes.status === 200 || registerEmailRes.status === 201, 'Email member registered');

  const loginEmailRes = await makeRequest('/auth/login', 'POST', {
    identifier: testEmail,
    password: testEmailPassword,
    role: 'member'
  });
  assert(loginEmailRes.status === 200, 'Email password login succeeds');

  console.log(`\n======================================================`);
  console.log(`RESULTS: ${passed} / ${total} CHECKS PASSED`);
  console.log(`======================================================`);
  process.exit(passed === total ? 0 : 1);
};

// Check if server is running, if not start it temporarily
const req = http.get(`${BASE_URL}/health`, async (res) => {
  runTests();
}).on('error', () => {
  console.log('Starting internal backend server on port 5000...');
  const app = require('../server');
  const server = app.listen(PORT, async () => {
    try {
      await runTests();
    } finally {
      server.close();
    }
  });
});

