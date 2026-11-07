const http = require('http');
const app = require('../server');
const db = require('../data/dbStorage');
const jwt = require('jsonwebtoken');

async function testGoalSync() {
  const server = http.createServer(app);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`Testing Goal & Token on port ${port}...`);

  // Create a test user in DB
  const testUser = {
    id: `user_test_${Date.now()}`,
    name: 'Goal Test Athlete',
    email: `athlete_goal_${Date.now()}@fithealth.io`,
    role: 'member',
    primaryGoal: 'Maintenance',
    fitnessGoal: 'Maintenance',
    goal: 'Maintenance',
    membershipId: `FH-MEM-7788`,
    status: 'Active'
  };
  db.create('users', testUser);

  const testMember = {
    id: `mem_test_${Date.now()}`,
    userId: testUser.id,
    name: testUser.name,
    email: testUser.email,
    membershipId: testUser.membershipId,
    status: 'Active',
    fitnessGoal: 'Maintenance',
    assignedTrainer: 'Coach Marcus Vance'
  };
  db.create('gymMembers', testMember);

  const token = jwt.sign(
    { id: testUser.id, email: testUser.email, role: 'member' },
    process.env.JWT_SECRET || 'fit_health_secure_jwt_secret_key_2025_prod_access',
    { expiresIn: '7d' }
  );

  // 1. Test fetching profile (should NOT return "User belonging to this token no longer exists")
  const getRes = await fetch(`${baseUrl}/api/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getData = await getRes.json();
  console.log('1. Profile Fetch Status:', getRes.status, getData.success ? 'SUCCESS' : getData.message);
  if (!getData.success || getData.user.primaryGoal !== 'Maintenance') {
    throw new Error('Initial profile fetch failed');
  }

  // 2. Test updating goal via Profile (/api/users/profile)
  const updateRes = await fetch(`${baseUrl}/api/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      primaryGoal: 'Cutting',
      weight: 76,
      height: 175,
      age: 25
    })
  });
  const updateData = await updateRes.json();
  console.log('2. Profile Update Status:', updateRes.status, updateData.success ? 'SUCCESS' : updateData.message);
  console.log('   User Goal stored:', updateData.user?.primaryGoal, updateData.user?.fitnessGoal, updateData.user?.goal);

  // Check gymMember roster
  const memberAfterProfile = db.findOne('gymMembers', m => m.email === testUser.email);
  console.log('   GymMember roster goal after profile update:', memberAfterProfile?.fitnessGoal);
  if (memberAfterProfile?.fitnessGoal !== 'Cutting') {
    throw new Error('Goal did not sync to gymMember roster from Profile update');
  }

  // 3. Test updating goal via Gym Members section (/api/gyms/members/:id)
  const memberEditRes = await fetch(`${baseUrl}/api/gyms/members/${testMember.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Goal Test Athlete',
      fitnessGoal: 'Bulking',
      notes: 'Focusing on mass gain'
    })
  });
  const memberEditData = await memberEditRes.json();
  console.log('3. Member Edit Status:', memberEditRes.status, memberEditData.success ? 'SUCCESS' : memberEditData.message);
  console.log('   Member Goal stored:', memberEditData.member?.fitnessGoal);

  // Check user profile after member edit
  const userAfterMember = db.findById('users', testUser.id);
  console.log('   User profile goal after member edit:', userAfterMember?.primaryGoal);
  if (userAfterMember?.primaryGoal !== 'Bulking') {
    throw new Error('Goal did not sync to user profile from gym member edit');
  }

  // 4. Test Token auto-healing / cross-container resilience
  // Simulate memory wipe in an ephemeral container (remove user from memory db)
  db.data.users = db.data.users.filter(u => u.id !== testUser.id);
  // Now verify that token verification still succeeds (via email fallback or auto-healing) and does NOT return "User belonging to this token no longer exists"
  const healRes = await fetch(`${baseUrl}/api/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const healData = await healRes.json();
  console.log('4. Auto-healing / Ephemeral Resilience Status:', healRes.status, healData.success ? 'SUCCESS' : healData.message);
  if (!healData.success) {
    throw new Error(`Token failed with ephemeral wipe: ${healData.message}`);
  }

  console.log('\n✅ ALL GOAL SYNC AND RESILIENCE TESTS PASSED PERFECTLY!');
  server.close();
  process.exit(0);
}

testGoalSync().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
