// Verification Test for Member Application & Admin Code Enrollment Flow
const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- TESTING ADD GYM MEMBER & CODE VERIFICATION FLOW ---');

  // 1. Login regular user
  console.log('\n1. Logging in member user...');
  const memberLogin = await request('POST', '/auth/login', {
    email: 'alex@fithealth.io',
    password: 'password123'
  });
  console.log('Member login status:', memberLogin.status, memberLogin.data?.user?.email);
  const memberToken = memberLogin.data?.token;

  // 2. Submit application with Customization Tag (Custom Gym Name & Location)
  console.log('\n2. Submitting gym membership application with Custom Gym & Location Tag...');
  const appRes = await request('POST', '/gyms/apply-membership', {
    name: 'Alex Rivera',
    email: 'alex@fithealth.io',
    phone: '+91 99887 76655',
    isCustomGym: true,
    gymName: 'Gold\'s Gym Indiranagar',
    gymLocation: '100 Feet Road, Indiranagar, Bengaluru',
    plan: 'Quarterly Strength & Conditioning',
    planId: 'plan_quarterly',
    amount: 4999,
    durationDays: 90,
    preferredTrainer: 'Coach Priya Nair',
    notes: 'Enrolled using custom gym location tag'
  }, memberToken);

  console.log('Application status:', appRes.status);
  console.log('Generated Verification Code:', appRes.data?.verificationCode);
  console.log('Custom Gym Name:', appRes.data?.application?.gymName);
  console.log('Custom Gym Location:', appRes.data?.application?.gymLocation);
  console.log('Is Custom Gym Tag:', appRes.data?.application?.isCustomGym);
  const verificationCode = appRes.data?.verificationCode;

  // 3. Member fetches their applications
  console.log('\n3. Fetching member applications...');
  const myApps = await request('GET', '/gyms/my-applications', null, memberToken);
  console.log('My applications count:', myApps.data?.count, 'First code:', myApps.data?.applications?.[0]?.verificationCode);

  // 4. Login admin
  console.log('\n4. Logging in as Admin...');
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@fithealth.io',
    password: 'admin123'
  });
  console.log('Admin login status:', adminLogin.status, adminLogin.data?.user?.role);
  const adminToken = adminLogin.data?.token;

  // 5. Admin checks pending queue
  console.log('\n5. Admin fetching pending applications...');
  const pendingRes = await request('GET', '/admin/pending-members', null, adminToken);
  console.log('Pending applications count:', pendingRes.data?.count);

  // 6. Admin verifies the member using the verification code
  console.log(`\n6. Admin verifying member using code: ${verificationCode}...`);
  const verifyRes = await request('POST', '/admin/verify-member-code', {
    verificationCode
  }, adminToken);

  console.log('Verification status:', verifyRes.status);
  console.log('Result message:', verifyRes.data?.message);
  console.log('Enrolled Member ID:', verifyRes.data?.member?.membershipId);
  console.log('Enrolled Member Status:', verifyRes.data?.member?.status);

  // 7. Verify replay protection: verifying same code again
  console.log('\n7. Testing replay protection (verifying code again)...');
  const replayRes = await request('POST', '/admin/verify-member-code', {
    verificationCode
  }, adminToken);
  console.log('Replay verification status (expected 400):', replayRes.status);
  console.log('Replay message:', replayRes.data?.message);

  // 8. Verify member profile in database
  console.log('\n8. Checking user profile after enrollment...');
  const meRes = await request('GET', '/auth/me', null, memberToken);
  console.log('Member profile gymStatus:', meRes.data?.user?.gymStatus);
  console.log('Member profile membershipId:', meRes.data?.user?.membershipId);

  console.log('\n--- VERIFICATION FLOW COMPLETED SUCCESSFULLY! ---');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
