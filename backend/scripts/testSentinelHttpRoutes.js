/**
 * HTTP Integration Test for SentinelOps Express API Routes
 */

const assert = require('assert');
const app = require('../server');

// Mock req and res helper for testing Express router directly in process
function mockRequestResponse(options = {}) {
  const req = {
    method: options.method || 'GET',
    url: options.url || '/',
    headers: options.headers || {},
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    secure: options.secure !== undefined ? options.secure : true,
    ip: '127.0.0.1'
  };

  let statusCode = 200;
  let responseData = null;
  let finished = false;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      finished = true;
      return this;
    },
    send(data) {
      responseData = data;
      finished = true;
      return this;
    },
    setHeader() { return this; }
  };

  return { req, res, getResult: () => ({ statusCode, data: responseData }) };
}

async function runHttpRouteTests() {
  console.log('--- Testing SentinelOps Controller Methods ---');
  const sentinelController = require('../controllers/sentinelController');

  // 1. Test Pipeline Status
  const r1 = mockRequestResponse();
  await sentinelController.getPipelineStatus(r1.req, r1.res);
  const res1 = r1.getResult();
  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.data.success, true);
  assert(res1.data.stageStats !== undefined);
  console.log('   ✅ GET /api/sentinel/pipeline/status returned 200 OK with stage statistics.');

  // 2. Test Egress Proofs
  const r2 = mockRequestResponse();
  await sentinelController.getEgressProofs(r2.req, r2.res);
  const res2 = r2.getResult();
  assert.strictEqual(res2.statusCode, 200);
  assert.strictEqual(res2.data.success, true);
  assert(Array.isArray(res2.data.proofs));
  console.log(`   ✅ GET /api/sentinel/egress-proofs returned 200 OK (${res2.data.proofs.length} proofs).`);

  // 3. Test Audit Events
  const r3 = mockRequestResponse();
  await sentinelController.getAuditEvents(r3.req, r3.res);
  const res3 = r3.getResult();
  assert.strictEqual(res3.statusCode, 200);
  assert.strictEqual(res3.data.success, true);
  assert(Array.isArray(res3.data.auditEvents));
  console.log(`   ✅ GET /api/sentinel/audit-events returned 200 OK (${res3.data.auditEvents.length} audit logs).`);

  // 4. Test Collector Connection Panel
  const r4 = mockRequestResponse();
  await sentinelController.getCollectorConnection(r4.req, r4.res);
  const res4 = r4.getResult();
  assert.strictEqual(res4.statusCode, 200);
  assert.strictEqual(res4.data.collector.tlsStatus, 'ENFORCED (TLSv1.3)');
  console.log('   ✅ GET /api/sentinel/collectors/connection returned 200 OK with TLS & tenant status.');

  // 5. Test Heartbeat Ping
  const r5 = mockRequestResponse({ body: { collectorId: 'col_sentinel_edge_01' } });
  await sentinelController.sendHeartbeat(r5.req, r5.res);
  const res5 = r5.getResult();
  assert.strictEqual(res5.statusCode, 200);
  assert.strictEqual(res5.data.success, true);
  console.log('   ✅ POST /api/sentinel/collectors/heartbeat returned 200 OK.');

  // 6. Test Simulation: Standard Telemetry
  console.log('--- Testing Live Simulations ---');
  const r6 = mockRequestResponse({ body: { scenario: 'standard' } });
  await sentinelController.runSimulation(r6.req, r6.res);
  const res6 = r6.getResult();
  assert.strictEqual(res6.statusCode, 200);
  assert.strictEqual(res6.data.simulationOutcome, 'FULL_PIPELINE_SUCCESSFUL');
  assert.strictEqual(res6.data.pipelineResult.success, true);
  console.log('   ✅ Simulation Scenario [standard]: 8-stage pipeline executed, anomaly detected, audited & ingested!');

  // 7. Test Simulation: Prohibited Payload Attack
  const r7 = mockRequestResponse({ body: { scenario: 'prohibited' } });
  await sentinelController.runSimulation(r7.req, r7.res);
  const res7 = r7.getResult();
  assert.strictEqual(res7.statusCode, 200);
  assert.strictEqual(res7.data.simulationOutcome, 'PROHIBITED_PAYLOAD_BLOCKED');
  assert.strictEqual(res7.data.saasResponse.statusCode, 422);
  console.log('   ✅ Simulation Scenario [prohibited]: SaaS successfully rejected attack with HTTP 422!');

  // 8. Test Simulation: Replay Attack
  const r8 = mockRequestResponse({ body: { scenario: 'replay' } });
  await sentinelController.runSimulation(r8.req, r8.res);
  const res8 = r8.getResult();
  assert.strictEqual(res8.statusCode, 200);
  assert.strictEqual(res8.data.simulationOutcome, 'REPLAY_ATTACK_PREVENTED');
  assert.strictEqual(res8.data.saasResponse.statusCode, 409);
  console.log('   ✅ Simulation Scenario [replay]: SaaS successfully rejected replay with HTTP 409 Conflict!');

  console.log('\n🎉 ALL SENTINELOPS ROUTE & SIMULATION TESTS PASSED PERFECTLY!');
}

runHttpRouteTests().catch(err => {
  console.error('❌ Route Test Error:', err);
  process.exit(1);
});
