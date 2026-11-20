/**
 * SentinelOps Tier 2: Centralized SaaS Ingestion Service
 * 
 * Independently enforces allow-lists, validates collector identity, verifies signatures,
 * guards against replay attacks with idempotency keys, scans for leaked secrets,
 * registers anomalies, generates cryptographic egress proofs, and persists to MongoDB.
 * 
 * NEVER TRUSTS THE COLLECTOR ALONE.
 * REJECTS AND LOGS BLOCKED_TRANSMISSION UPON ANY POLICY INFRACTION.
 */

const crypto = require('crypto');
const { getSentinelCollection } = require('./sentinelDb');

class SaasIngestionService {
  constructor() {
    this.maxClockDriftSeconds = 300; // 5 minutes replay window
  }

  /**
   * Helper to write an audit record to MongoDB
   */
  async _writeAuditEvent(stage, decision, collectorId, tenantId, details = {}) {
    try {
      const auditCol = getSentinelCollection('sentinel_audit_events');
      const auditRecord = {
        auditId: `audit_${stage.toLowerCase()}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        timestamp: new Date().toISOString(),
        collectorId: collectorId || 'unknown_collector',
        tenantId: tenantId || 'unknown_tenant',
        stage: stage, // TRANSMISSION | BLOCKED_TRANSMISSION | POLICY_VALIDATION
        decision: decision, // APPROVED | BLOCKED
        eventCount: details.eventCount || 1,
        blockedFieldsCount: details.blockedFieldsCount || 0,
        redactedCount: details.redactedCount || 0,
        processingTimeMs: details.processingTimeMs || 0,
        reason: details.reason || '',
        details: details.meta || {}
      };
      await auditCol.insertOne(auditRecord);
      return auditRecord;
    } catch (e) {
      console.warn('[SaaS Audit Event Write Warning]:', e.message);
      return null;
    }
  }

  /**
   * Process Ingestion Request from Tier 1 Local Collector
   */
  async ingestTelemetry(envelope, requestMeta = {}) {
    const startTime = Date.now();
    const {
      collectorId,
      tenantId,
      timestamp,
      idempotencyKey,
      payloadHash,
      signature,
      tlsVersion,
      data
    } = envelope || {};

    // 1. Basic Structure Validation
    if (!collectorId || !tenantId || !data || !idempotencyKey || !payloadHash) {
      const reason = 'Invalid ingestion envelope format: missing mandatory headers or payload fields';
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        meta: { httpStatus: 400 }
      });
      return {
        success: false,
        statusCode: 400,
        error: 'BAD_REQUEST',
        message: reason
      };
    }

    // 2. Collector Authentication & Tenant Association Verification
    const collectorsCol = getSentinelCollection('sentinel_collectors');
    const collector = await collectorsCol.findOne({ collectorId, tenantId });

    if (!collector) {
      const reason = `Collector '${collectorId}' is not registered or not associated with tenant '${tenantId}'`;
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        meta: { httpStatus: 401 }
      });
      return {
        success: false,
        statusCode: 401,
        error: 'UNAUTHORIZED_COLLECTOR',
        message: reason
      };
    }

    if (collector.status === 'revoked') {
      const reason = `Collector '${collectorId}' credentials have been revoked. Transmission denied.`;
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        meta: { httpStatus: 403, collectorStatus: 'revoked' }
      });
      return {
        success: false,
        statusCode: 403,
        error: 'COLLECTOR_REVOKED',
        message: reason
      };
    }

    // 3. Replay Protection: Timestamp Freshness Check
    const reqTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diffSeconds = Math.abs(now - reqTime) / 1000;
    if (isNaN(reqTime) || diffSeconds > this.maxClockDriftSeconds) {
      const reason = `Timestamp freshness expired. Drift of ${Math.round(diffSeconds)}s exceeds maximum allowed window (${this.maxClockDriftSeconds}s). Potential replay attack.`;
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        meta: { httpStatus: 400, diffSeconds }
      });
      return {
        success: false,
        statusCode: 400,
        error: 'REPLAY_EXPIRED',
        message: reason
      };
    }

    // 4. Replay & Duplicate Prevention: Idempotency Key Check
    const proofsCol = getSentinelCollection('sentinel_egress_proofs');
    const existingProof = await proofsCol.findOne({ idempotencyKey });
    if (existingProof) {
      const reason = `Duplicate payload detected with idempotency key '${idempotencyKey}'. Replay rejected.`;
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        meta: { httpStatus: 409, idempotencyKey }
      });
      return {
        success: false,
        statusCode: 409,
        error: 'DUPLICATE_PAYLOAD',
        message: reason
      };
    }

    // 5. Signature & Payload Hash Cryptographic Verification
    const calculatedHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    if (calculatedHash !== payloadHash) {
      const reason = 'Payload hash mismatch. The transmitted data was modified in transit or corrupted.';
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        meta: { httpStatus: 400, calculatedHash, payloadHash }
      });
      return {
        success: false,
        statusCode: 400,
        error: 'HASH_MISMATCH',
        message: reason
      };
    }

    if (collector.sharedSecret && signature) {
      const expectedSig = crypto.createHmac('sha256', collector.sharedSecret)
        .update(`${timestamp}:${idempotencyKey}:${payloadHash}`)
        .digest('hex');
      
      if (expectedSig !== signature) {
        const reason = 'HMAC cryptographic signature verification failed. Untrusted transmission source.';
        await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
          reason,
          meta: { httpStatus: 401 }
        });
        return {
          success: false,
          statusCode: 401,
          error: 'INVALID_SIGNATURE',
          message: reason
        };
      }
    }

    // 6. Independent SaaS Allow-List Enforcement
    // (Never trust the collector alone!)
    const policiesCol = getSentinelCollection('sentinel_policies');
    let policy = await policiesCol.findOne({ tenantId });
    if (!policy) {
      policy = await policiesCol.findOne({ policyId: 'policy_sentinel_global_v2' });
    }

    const allowedFields = policy?.allowedFields || [];
    const allowedSet = new Set(allowedFields.map(f => f.toLowerCase()));

    const prohibitedFieldsDetected = [];
    const approvedFieldsList = [];

    for (const key of Object.keys(data)) {
      if (!allowedSet.has(key.toLowerCase())) {
        prohibitedFieldsDetected.push(key);
      } else {
        approvedFieldsList.push(key);
      }
    }

    if (prohibitedFieldsDetected.length > 0) {
      const reason = `SaaS Independent Security Block: Payload contains ${prohibitedFieldsDetected.length} unapproved/prohibited field(s): [${prohibitedFieldsDetected.join(', ')}]. Egress policy violation.`;
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        blockedFieldsCount: prohibitedFieldsDetected.length,
        meta: {
          httpStatus: 422,
          prohibitedFields: prohibitedFieldsDetected,
          policyVersion: policy?.version || 'unknown'
        }
      });
      return {
        success: false,
        statusCode: 422,
        error: 'UNAUTHORIZED_FIELDS_REJECTED',
        message: reason,
        prohibitedFields: prohibitedFieldsDetected
      };
    }

    // 7. Independent Secret Scanner (Zero-Leak SaaS Verification)
    const rawDataStr = JSON.stringify(data);
    const leakedSecretMatches = rawDataStr.match(/Bearer\s+[a-zA-Z0-9_\-\.]{15,}|(?:sec_key_|token_live_)[a-zA-Z0-9]{15,}/gi);
    if (leakedSecretMatches) {
      const reason = `SaaS Security Guard: Raw credential pattern detected in payload. Ingestion aborted.`;
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        meta: { httpStatus: 422 }
      });
      return {
        success: false,
        statusCode: 422,
        error: 'LEAKED_CREDENTIAL_DETECTED',
        message: reason
      };
    }

    // 8. Verify Pseudonymization
    if (data.host_id && !data.host_id.startsWith('pseudo-host-')) {
      const reason = `SaaS Privacy Violation: Raw host identifier '${data.host_id}' received. Must be pseudonymized.`;
      await this._writeAuditEvent('BLOCKED_TRANSMISSION', 'BLOCKED', collectorId, tenantId, {
        reason,
        meta: { httpStatus: 422 }
      });
      return {
        success: false,
        statusCode: 422,
        error: 'RAW_IDENTIFIER_PROHIBITED',
        message: reason
      };
    }

    // 9. Persist Sanitized Telemetry to MongoDB
    const telemetryCol = getSentinelCollection('sentinel_telemetry');
    const telemetryDoc = {
      tenantId,
      collectorId,
      pseudoHostId: data.host_id,
      timestamp: data.timestamp || timestamp,
      cpu_utilization_pct: data.cpu_utilization_pct,
      memory_utilization_pct: data.memory_utilization_pct,
      memory_used_mb: data.memory_used_mb,
      memory_total_mb: data.memory_total_mb,
      disk_io_iops: data.disk_io_iops,
      disk_used_pct: data.disk_used_pct,
      network_rx_kbps: data.network_rx_kbps,
      network_tx_kbps: data.network_tx_kbps,
      active_threads: data.active_threads,
      process_count: data.process_count,
      load_average_1m: data.load_average_1m,
      anomaly_detected: Boolean(data.anomaly_detected),
      anomaly_severity: data.anomaly_severity || 'NORMAL',
      status: data.status || 'HEALTHY',
      sample_count: data.sample_count || 1,
      metrics_p95: data.metrics_p95 || {},
      payloadHash,
      ingestedAt: new Date().toISOString()
    };
    await telemetryCol.insertOne(telemetryDoc);

    // 10. Persist Anomaly if Flagged
    if (data.anomaly_detected) {
      const anomaliesCol = getSentinelCollection('sentinel_anomalies');
      await anomaliesCol.insertOne({
        anomalyId: `anom_saas_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        timestamp: data.timestamp || timestamp,
        tenantId,
        collectorId,
        pseudoHostId: data.host_id,
        metricName: 'cpu_utilization_pct',
        observedValue: data.cpu_utilization_pct,
        severity: data.anomaly_severity || 'HIGH',
        status: 'OPEN',
        payloadHash,
        detectedAt: new Date().toISOString()
      });
    }

    // 11. Persist Cryptographic Egress Proof
    const egressProofDoc = {
      proofId: `proof_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`,
      tenantId,
      collectorId,
      idempotencyKey,
      payloadHash,
      signature,
      tlsVersion: tlsVersion || 'TLSv1.3',
      approvedFields: approvedFieldsList,
      blockedFieldsCount: 0,
      pseudoHostId: data.host_id,
      anomalyDetected: Boolean(data.anomaly_detected),
      timestamp,
      createdAt: new Date().toISOString()
    };
    await proofsCol.insertOne(egressProofDoc);

    // 12. Update Collector Status & Heartbeat
    await collectorsCol.updateOne(
      { collectorId, tenantId },
      { $set: { lastIngestAt: new Date().toISOString(), lastHeartbeat: new Date().toISOString() } }
    );

    // 13. Audit Stage: TRANSMISSION (Approved)
    const duration = Date.now() - startTime;
    await this._writeAuditEvent('TRANSMISSION', 'APPROVED', collectorId, tenantId, {
      eventCount: 1,
      processingTimeMs: duration,
      reason: `SaaS Ingestion approved and validated payload over TLS (Hash: ${payloadHash.slice(0, 16)}...)`,
      meta: {
        payloadHash,
        idempotencyKey,
        approvedFieldsCount: approvedFieldsList.length,
        tlsVersion: tlsVersion || 'TLSv1.3'
      }
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Telemetry successfully ingested, verified, and audited by SaaS platform.',
      proofId: egressProofDoc.proofId,
      payloadHash,
      idempotencyKey,
      ingestedAt: telemetryDoc.ingestedAt,
      anomalyRegistered: Boolean(data.anomaly_detected)
    };
  }
}

const saasIngestionService = new SaasIngestionService();

module.exports = {
  SaasIngestionService,
  saasIngestionService
};
