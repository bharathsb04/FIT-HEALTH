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

async function runTest() {
  console.log('--- Testing Admin Portal Sign Up & Member Code Verification ---');

  const ts = Date.now();
  const adminEmail = `gymowner_${ts}@fithealth.io`;

  // 1. Admin Sign Up with Name, Email, Password
  console.log('[1/4] Signing up new Admin with Name, Email, Password...');
  const adminRegRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Marcus Vance Manager',
    email: adminEmail,
    password: 'secureAdminPass123',
    role: 'admin'
  });

  if (adminRegRes.status !== 201 || adminRegRes.body.user.role !== 'admin') {
    throw new Error(`Admin signup failed: HTTP ${adminRegRes.status} - ${JSON.stringify(adminRegRes.body)}`);
  }
  const adminToken = adminRegRes.body.token;
  console.log(`✓ Admin registered successfully (ID: ${adminRegRes.body.user.id}, Role: ${adminRegRes.body.user.role})`);

  // 2. Member creates membership application producing a verification code pass
  console.log('[2/4] Member creating application to generate verification code pass...');
  const appRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/gyms/apply-membership',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    name: 'Rahul Sharma',
    email: `rahul_${ts}@gmail.com`,
    phone: '+91 98765 43210',
    gymName: 'rsv gym and sports club',
    gymLocation: '442 Fitness Boulevard, Downtown Metro',
    plan: 'Monthly Pro Fitness',
    amount: 1999,
    durationDays: 30
  });

  if (appRes.status !== 201 || !appRes.body.verificationCode) {
    throw new Error(`Failed to create application: ${JSON.stringify(appRes.body)}`);
  }
  const code = appRes.body.verificationCode;
  console.log(`✓ Generated Verification Code Pass: ${code}`);

  // 3. Admin verifies member code within Admin section
  console.log(`[3/4] Admin verifying code "${code}" within Admin section...`);
  const verifyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/verify-member-code',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    verificationCode: code
  });

  if (verifyRes.status !== 200 || !verifyRes.body.success) {
    throw new Error(`Failed to verify member code: ${JSON.stringify(verifyRes.body)}`);
  }
  console.log(`✓ Admin verified code successfully: Member ${verifyRes.body.member.name} enrolled with ID ${verifyRes.body.member.membershipId}`);

  // 4. Retrieve Gym Members roster to verify member is active
  console.log('[4/4] Verifying enrolled member in Gym Members roster...');
  const membersRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/gyms/members',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (membersRes.status !== 200 || !membersRes.body.members) {
    throw new Error(`Failed to retrieve gym members: ${JSON.stringify(membersRes.body)}`);
  }
  const foundMember = membersRes.body.members.find(m => m.name === 'Rahul Sharma');
  if (!foundMember || foundMember.status !== 'Active') {
    throw new Error(`Member Rahul Sharma not found as Active in gym members roster!`);
  }
  console.log(`✓ Confirmed member ${foundMember.name} is Active in gym roster with plan "${foundMember.plan}" and verification code "${foundMember.verificationCode}"`);

  console.log('\n🎉 ALL ADMIN SIGN UP & MEMBER VERIFICATION CODE TESTS PASSED!');
}

runTest().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

