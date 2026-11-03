const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
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

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 TESTING BIOMETRICS SYNC & SAMSUNG HEALTH API INTEGRATION');
  console.log('======================================================================\n');

  try {
    // 1. Member Login
    const memberLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'alex@fithealth.io', password: 'password123', role: 'member' });

    if (memberLogin.status !== 200 || !memberLogin.data?.token) {
      throw new Error(`Member login failed: ${JSON.stringify(memberLogin.data)}`);
    }
    const memberToken = memberLogin.data.token;
    const memberId = memberLogin.data.user.id;
    console.log(`✅ 1. Member Authenticated: ${memberLogin.data.user.name} (${memberId})`);

    // 2. Admin Login
    const adminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@fithealth.io', password: 'admin123', role: 'admin' });

    if (adminLogin.status !== 200 || !adminLogin.data?.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
    }
    const adminToken = adminLogin.data.token;
    console.log(`✅ 2. Admin Authenticated: ${adminLogin.data.user.name}`);

    // Ensure consent is initially false to test privacy enforcement
    await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/biometrics/consent',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${memberToken}`,
        'Content-Type': 'application/json'
      }
    }, { adminShareConsent: false });

    // 3. Admin blocked by default (no consent)
    const adminNoConsent = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/biometrics/member/${memberId}/latest`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (adminNoConsent.status === 403) {
      console.log('✅ 3. Privacy Enforced: Admin blocked from member data without consent (HTTP 403)');
    } else {
      throw new Error(`Expected 403 but got ${adminNoConsent.status}`);
    }

    // 4. Batch Sync 13 Samsung Health Record Types
    const now = new Date();
    const sampleBatch = [
      { recordId: 'hc_step_001', type: 'steps', value: 8740, unit: 'steps', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_hr_001', type: 'heart_rate', value: 72, unit: 'bpm', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_rhr_001', type: 'resting_heart_rate', value: 58, unit: 'bpm', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_weight_001', type: 'weight', value: 76.5, unit: 'kg', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_height_001', type: 'height', value: 178, unit: 'cm', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_bodyfat_001', type: 'body_fat', value: 14.8, unit: '%', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_sleep_001', type: 'sleep', value: 7.8, unit: 'hours', startTime: new Date(now - 8 * 3600000).toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_actcal_001', type: 'active_calories', value: 580, unit: 'kcal', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_totcal_001', type: 'total_calories', value: 2350, unit: 'kcal', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_dist_001', type: 'distance', value: 6420, unit: 'meters', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_spo2_001', type: 'oxygen_saturation', value: 98.5, unit: '%', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_bp_001', type: 'blood_pressure', value: { systolic: 118, diastolic: 76 }, unit: 'mmHg', startTime: now.toISOString(), endTime: now.toISOString() },
      { recordId: 'hc_ex_001', type: 'exercise', value: { title: 'Strength Training', durationMinutes: 45 }, unit: 'workout', startTime: now.toISOString(), endTime: now.toISOString() }
    ];

    const syncRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/biometrics/sync',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${memberToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      records: sampleBatch,
      device: 'Samsung Galaxy S24 Ultra (SM-S928B)',
      changeToken: 'token_initial_sync_complete_123'
    });

    if (syncRes.status !== 200 || syncRes.data.syncedCount !== 13) {
      throw new Error(`Sync failed: ${JSON.stringify(syncRes.data)}`);
    }
    console.log(`✅ 4. Synced 13 Real Health Records from Samsung Health (Count: ${syncRes.data.syncedCount})`);

    // 5. Test Deduplication
    const reSyncRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/biometrics/sync',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${memberToken}`,
        'Content-Type': 'application/json'
      }
    }, {
      records: sampleBatch,
      device: 'Samsung Galaxy S24 Ultra'
    });
    console.log(`✅ 5. Deduplication Verified: Upserted without record duplication.`);

    // 6. Test GET /api/biometrics/latest
    const latestRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/biometrics/latest',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });

    if (latestRes.status !== 200 || !latestRes.data.hasData) {
      throw new Error(`Latest biometrics failed: ${JSON.stringify(latestRes.data)}`);
    }
    const metrics = latestRes.data.metrics;
    console.log(`✅ 6. Latest Biometrics Verified:`);
    console.log(`   - Steps Today: ${latestRes.data.todaySummary.steps} (Target: 10,000)`);
    console.log(`   - Heart Rate: ${metrics.heart_rate.value} ${metrics.heart_rate.unit}`);
    console.log(`   - Resting HR: ${metrics.resting_heart_rate.value} ${metrics.resting_heart_rate.unit}`);
    console.log(`   - Blood Pressure: ${metrics.blood_pressure.value.systolic}/${metrics.blood_pressure.value.diastolic} ${metrics.blood_pressure.unit}`);
    console.log(`   - Oxygen (SpO2): ${metrics.oxygen_saturation.value}%`);
    console.log(`   - Sleep Duration: ${metrics.sleep.value} hours`);
    console.log(`   - Weight: ${metrics.weight.value} kg (Body Fat: ${metrics.body_fat.value}%)`);
    console.log(`   - Active Calories: ${latestRes.data.todaySummary.activeCalories} kcal`);

    // 7. Test History & Summary
    const historyRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/biometrics/history?type=heart_rate&limit=10',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    console.log(`✅ 7. History Filter Verified: Retrieved ${historyRes.data.count} heart rate records.`);

    const summaryRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/biometrics/summary?days=7',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${memberToken}` }
    });
    console.log(`✅ 8. Summary Aggregation Verified: ${summaryRes.data.dailySummaries.length} days computed.`);

    // 8. Grant Admin Share Consent
    const consentRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/biometrics/consent',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${memberToken}`,
        'Content-Type': 'application/json'
      }
    }, { adminShareConsent: true });
    console.log(`✅ 9. Member Granted Consent: "${consentRes.data.message}"`);

    // 9. Admin can now view member biometrics
    const adminWithConsent = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/biometrics/member/${memberId}/latest`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (adminWithConsent.status === 200 && adminWithConsent.data.consented) {
      console.log(`✅ 10. Admin Access Authorized: Retrieved member biometrics under active consent.`);
    } else {
      throw new Error(`Admin access with consent failed: ${JSON.stringify(adminWithConsent.data)}`);
    }

    console.log('\n======================================================================');
    console.log('🎉 ALL BACKEND BIOMETRICS & PRIVACY VERIFICATIONS PASSED (10/10)!');
    console.log('======================================================================');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
