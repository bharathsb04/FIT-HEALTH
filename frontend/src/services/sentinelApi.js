/**
 * SentinelOps Phase 2 Frontend API Client
 */

const API_BASE = '/api/sentinel';

export const sentinelApi = {
  // 1. Get Live Pipeline Status & Summary
  getPipelineStatus: async (tenantId = 'tenant_enterprise_sentinel') => {
    const res = await fetch(`${API_BASE}/pipeline/status?tenantId=${encodeURIComponent(tenantId)}`);
    if (!res.ok) throw new Error(`Failed to load pipeline status: ${res.statusText}`);
    return res.json();
  },

  // 2. Get Cryptographic Egress Proofs
  getEgressProofs: async (tenantId = 'tenant_enterprise_sentinel') => {
    const res = await fetch(`${API_BASE}/egress-proofs?tenantId=${encodeURIComponent(tenantId)}`);
    if (!res.ok) throw new Error(`Failed to load egress proofs: ${res.statusText}`);
    return res.json();
  },

  // 3. Get Stage-by-Stage Audit Events
  getAuditEvents: async (tenantId = 'tenant_enterprise_sentinel', stage = '') => {
    let url = `${API_BASE}/audit-events?tenantId=${encodeURIComponent(tenantId)}`;
    if (stage) url += `&stage=${encodeURIComponent(stage)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load audit events: ${res.statusText}`);
    return res.json();
  },

  // 4. Get Collector Connection Details
  getCollectorConnection: async (collectorId = 'col_sentinel_edge_01') => {
    const res = await fetch(`${API_BASE}/collectors/connection?collectorId=${encodeURIComponent(collectorId)}`);
    if (!res.ok) throw new Error(`Failed to load collector connection: ${res.statusText}`);
    return res.json();
  },

  // 5. Send Collector Heartbeat
  sendHeartbeat: async (collectorId = 'col_sentinel_edge_01') => {
    const res = await fetch(`${API_BASE}/collectors/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectorId })
    });
    if (!res.ok) throw new Error(`Failed to send heartbeat: ${res.statusText}`);
    return res.json();
  },

  // 6. Rotate Collector Credentials
  rotateCredentials: async (collectorId = 'col_sentinel_edge_01') => {
    const res = await fetch(`${API_BASE}/collectors/rotate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectorId })
    });
    if (!res.ok) throw new Error(`Failed to rotate credentials: ${res.statusText}`);
    return res.json();
  },

  // 7. Revoke Collector Access
  revokeCollector: async (collectorId = 'col_sentinel_edge_01') => {
    const res = await fetch(`${API_BASE}/collectors/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectorId })
    });
    if (!res.ok) throw new Error(`Failed to revoke collector: ${res.statusText}`);
    return res.json();
  },

  // 8. Reactivate Collector Access
  reactivateCollector: async (collectorId = 'col_sentinel_edge_01') => {
    const res = await fetch(`${API_BASE}/collectors/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectorId })
    });
    if (!res.ok) throw new Error(`Failed to reactivate collector: ${res.statusText}`);
    return res.json();
  },

  // 9. Get Privacy Policies
  getPolicies: async (tenantId = 'tenant_enterprise_sentinel') => {
    const res = await fetch(`${API_BASE}/policies?tenantId=${encodeURIComponent(tenantId)}`);
    if (!res.ok) throw new Error(`Failed to load policies: ${res.statusText}`);
    return res.json();
  },

  // 10. Update Privacy Policy
  updatePolicy: async (policyId, policyData) => {
    const res = await fetch(`${API_BASE}/policies/${encodeURIComponent(policyId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData)
    });
    if (!res.ok) throw new Error(`Failed to update policy: ${res.statusText}`);
    return res.json();
  },

  // 11. Run Simulation (Standard, Prohibited, Replay)
  runSimulation: async (scenario = 'standard', tenantId = 'tenant_enterprise_sentinel') => {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, tenantId })
    });
    if (!res.ok) throw new Error(`Failed to run simulation: ${res.statusText}`);
    return res.json();
  }
};
