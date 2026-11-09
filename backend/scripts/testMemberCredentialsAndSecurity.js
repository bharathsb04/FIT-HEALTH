/**
 * Verification Test: Member Credentials Display and Admin Login Security Enforcement
 */

const path = require('path');
const db = require('../data/dbStorage');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

// Mock Express req & res
function createMockReqRes(body = {}, params = {}, headers = {}) {
  const req = {
    body,
    params,
    headers,
    userId: 'usr_admin_test',
    user: { id: 'usr_admin_test', role: 'admin', email: 'admin@fithealth.io' }
  };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData
  };

  return { req, res };
}

async function runTests() {
  console.log('=== RUNNING MEMBER CREDENTIALS & ADMIN LOGIN SECURITY TESTS ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Admin Adds Member with specific Password & details
  console.log('--- TEST 1: Admin Adds Member to Gym with Assigned Password ---');
  const testMemberEmail = `athlete_${Date.now()}@testgym.io`;
  const testPassword = 'Fit@Secure9988!';

  const { req: addReq, res: addRes } = createMockReqRes({
    name: 'Rohit Sharma',
    email: testMemberEmail,
    phone: '+91 98765 12345',
    password: testPassword,
    plan: 'Monthly Pro Fitness',
    amountPaid: 1999,
    assignedTrainer: 'Coach Marcus Vance'
  });

  await adminController.addMember(addReq, addRes);
  const addStatus = addRes.getStatusCode();
  const addData = addRes.getData();

  assert(addStatus === 201, 'addMember returns HTTP 201 Created');
  assert(addData && addData.success === true, 'addMember response indicates success');
  assert(addData.credentials && addData.credentials.password === testPassword, 'Response displays member user password to admin');
  assert(addData.credentials.email === testMemberEmail.toLowerCase(), 'Response displays member email to admin');
  assert(addData.member && addData.member.temporaryPassword === testPassword, 'gymMembers record stores temporary password for admin lookup');

  // Verify user record in database
  const createdUser = db.findOne('users', u => u.email === testMemberEmail.toLowerCase());
  assert(createdUser !== null, 'Member account is created in users collection');
  assert(createdUser && createdUser.role === 'member', 'Created user strictly has role "member"');
  assert(createdUser && createdUser.gymStatus === 'Active', 'Created user has Active gymStatus');

  // TEST 2: Security Concern Check - Admin CANNOT log in to Admin Portal using Member credentials!
  console.log('\n--- TEST 2: Security Check - Attempt to login to Admin Portal using Member credentials ---');
  const { req: adminLoginReq, res: adminLoginRes } = createMockReqRes({
    email: testMemberEmail,
    password: testPassword,
    role: 'admin' // Attempting to breach Admin Portal with member's password
  });

  await authController.login(adminLoginReq, adminLoginRes);
  const adminLoginStatus = adminLoginRes.getStatusCode();
  const adminLoginData = adminLoginRes.getData();

  assert(adminLoginStatus === 403, 'Login to Admin Portal with member credentials is strictly rejected with HTTP 403 Forbidden');
  assert(adminLoginData && adminLoginData.success === false, 'Admin login response indicates failure');
  assert(adminLoginData && adminLoginData.message.includes('Security Alert'), 'Response contains explicit Security Alert message');

  // TEST 3: Member CAN log in to their account using Member Login with that email and password
  console.log('\n--- TEST 3: Member Logs in to their Account via Member Login ---');
  const { req: memberLoginReq, res: memberLoginRes } = createMockReqRes({
    email: testMemberEmail,
    password: testPassword,
    role: 'member' // Member using standard Member Login
  });

  await authController.login(memberLoginReq, memberLoginRes);
  const memberLoginStatus = memberLoginRes.getStatusCode();
  const memberLoginData = memberLoginRes.getData();

  assert(memberLoginStatus === 200, 'Member login returns HTTP 200 OK');
  assert(memberLoginData && memberLoginData.success === true, 'Member login succeeds');
  assert(memberLoginData.token && typeof memberLoginData.token === 'string', 'Member receives valid session token');
  assert(memberLoginData.user && memberLoginData.user.role === 'member', 'Logged-in user is authenticated as member');
  assert(memberLoginData.user.email === testMemberEmail.toLowerCase(), 'Logged-in user email matches member email');

  // TEST 4: Auto-generation of password when none provided by admin
  console.log('\n--- TEST 4: Auto-generating Password on Member Enrollment ---');
  const autoEmail = `autouser_${Date.now()}@testgym.io`;
  const { req: autoReq, res: autoRes } = createMockReqRes({
    name: 'Kavya Nair',
    email: autoEmail,
    phone: '+91 91234 56789',
    plan: 'Quarterly Strength'
  });

  await adminController.addMember(autoReq, autoRes);
  const autoData = autoRes.getData();

  assert(autoRes.getStatusCode() === 201, 'addMember with auto-generated password returns 201');
  assert(autoData.credentials && autoData.credentials.password.startsWith('Fit@'), 'Auto-generated secure password matches Fit@XXXX format');
  
  // Verify member can log in with auto-generated password
  const { req: autoLoginReq, res: autoLoginRes } = createMockReqRes({
    email: autoEmail,
    password: autoData.credentials.password,
    role: 'member'
  });
  await authController.login(autoLoginReq, autoLoginRes);
  assert(autoLoginRes.getStatusCode() === 200, 'Member can log in with the auto-generated password');

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

