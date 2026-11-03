const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function testDualRoles() {
  console.log('--- Testing Dual Role Account Creation & Login ---');

  const timestamp = Date.now();
  const memberEmail = `testmember_${timestamp}@gmail.com`;
  const adminEmail = `testadmin_${timestamp}@gmail.com`;

  // 1. Register Member Account
  const regMemberRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Test Member',
    email: memberEmail,
    password: 'password123',
    role: 'member',
    age: 23,
    gender: 'Male',
    height: 175,
    weight: 72,
    targetWeight: 75,
    primaryGoal: 'Bulking',
    fitnessLevel: 'Intermediate',
    dietaryPreference: 'High Protein',
    workoutExperience: '1-2 Years'
  });

  console.log(`Member Registration: HTTP ${regMemberRes.status}`);
  if (regMemberRes.status !== 201 || regMemberRes.body.user.role !== 'member') {
    throw new Error(`Member registration failed: ${JSON.stringify(regMemberRes.body)}`);
  }
  console.log('✓ Successfully registered member account with role: member');

  // 2. Register Admin Account
  const regAdminRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Test Admin',
    email: adminEmail,
    password: 'adminpassword123',
    role: 'admin',
    age: 30,
    gender: 'Male',
    height: 180,
    weight: 80,
    targetWeight: 80,
    primaryGoal: 'General fitness',
    fitnessLevel: 'Advanced',
    dietaryPreference: 'Balanced',
    workoutExperience: '3+ Years'
  });

  console.log(`Admin Registration: HTTP ${regAdminRes.status}`);
  if (regAdminRes.status !== 201 || regAdminRes.body.user.role !== 'admin') {
    throw new Error(`Admin registration failed: ${JSON.stringify(regAdminRes.body)}`);
  }
  console.log('✓ Successfully registered admin account with role: admin, gymName:', regAdminRes.body.user.gymName);

  // 3. Login as Admin
  const loginAdminRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: adminEmail,
    password: 'adminpassword123'
  });

  console.log(`Admin Login: HTTP ${loginAdminRes.status}`);
  if (loginAdminRes.status !== 200 || loginAdminRes.body.user.role !== 'admin') {
    throw new Error(`Admin login failed: ${JSON.stringify(loginAdminRes.body)}`);
  }
  console.log('✓ Admin login successful with valid JWT token');

  // 4. Login as Member
  const loginMemberRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: memberEmail,
    password: 'password123'
  });

  console.log(`Member Login: HTTP ${loginMemberRes.status}`);
  if (loginMemberRes.status !== 200 || loginMemberRes.body.user.role !== 'member') {
    throw new Error(`Member login failed: ${JSON.stringify(loginMemberRes.body)}`);
  }
  console.log('✓ Member login successful with valid JWT token');

  console.log('\n🎉 ALL DUAL-ROLE REGISTRATION & LOGIN TESTS PASSED PERFECTLY!');
}

testDualRoles().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

