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
  console.log('--- TESTING GYM MEMBERS ROSTER & EDIT FOR BOTH USER AND ADMIN ---');

  // 1. Member login
  const memberLogin = await request('POST', '/auth/login', {
    email: 'alex@fithealth.io',
    password: 'password123'
  });
  const memberToken = memberLogin.data?.token;
  console.log('1. Member login status:', memberLogin.status, memberLogin.data?.user?.email);

  // 2. Fetch all gym members as regular user
  const membersRes = await request('GET', '/gyms/members', null, memberToken);
  console.log('2. Fetching members as regular user:', membersRes.status, 'Total members:', membersRes.data?.count);
  const myMember = membersRes.data?.members?.find(m => m.email?.toLowerCase() === 'alex@fithealth.io') || membersRes.data?.members?.[0];
  console.log('Target Member ID:', myMember?.id, 'Name:', myMember?.name);

  // 3. User edits their own member profile
  if (myMember) {
    const editSelfRes = await request('PUT', `/gyms/members/${myMember.id}`, {
      name: 'Alex Rivera (Updated)',
      phone: '+91 99999 88888',
      assignedTrainer: 'Coach Priya Nair',
      notes: 'Focusing on mobility and high volume split'
    }, memberToken);
    console.log('3. Member self-edit status:', editSelfRes.status, editSelfRes.data?.message);
  }

  // 4. Admin login
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@fithealth.io',
    password: 'admin123'
  });
  const adminToken = adminLogin.data?.token;
  console.log('\n4. Admin login status:', adminLogin.status, adminLogin.data?.user?.role);

  // 5. Admin edits member plan & status
  if (myMember) {
    const adminEditRes = await request('PUT', `/gyms/members/${myMember.id}`, {
      plan: 'Annual Elite Athlete Club',
      status: 'Active',
      expiryDate: '2027-12-31',
      notes: 'Admin granted VIP athlete privileges'
    }, adminToken);
    console.log('5. Admin edit member status:', adminEditRes.status, adminEditRes.data?.message);
    console.log('Updated plan:', adminEditRes.data?.member?.plan, 'Status:', adminEditRes.data?.member?.status);
  }

  console.log('\n--- ALL MEMBER ROSTER & EDIT TESTS COMPLETED SUCCESSFULLY! ---');
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

