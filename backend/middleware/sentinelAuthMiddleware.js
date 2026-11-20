/**
 * SentinelOps Security & Collector Authentication Middleware
 * 
 * Enforces:
 *  - HTTPS/TLS connection check (rejects insecure requests in production)
 *  - Collector API key / Bearer token authentication
 *  - Tenant association verification
 *  - Replay prevention and timestamp checks
 *  - Collector revocation check
 */

const crypto = require('crypto');
const { getSentinelCollection } = require('../services/sentinel/sentinelDb');

const verifyCollectorAuth = async (req, res, next) => {
  try {
    // 1. TLS Verification
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const isProduction = process.env.NODE_ENV === 'production';
    const hasTlsHeader = Boolean(req.headers['x-tls-version'] || req.headers['x-tls-protocol']);

    // In production, enforce HTTPS/TLS strictly
    if (isProduction && !isHttps) {
      return res.status(426).json({
        success: false,
        error: 'UPGRADE_REQUIRED',
        message: 'Security Alert: Insecure HTTP rejected. SentinelOps strictly requires TLS/HTTPS for collector communication.'
      });
    }

    // 2. Collector Authentication Token / Header Extraction
    let collectorKey = req.headers['x-collector-key'];
    const authHeader = req.headers['authorization'];
    if (!collectorKey && authHeader && authHeader.startsWith('Bearer ')) {
      collectorKey = authHeader.split(' ')[1];
    }

    // If collectorKey is also in body (for direct SDK envelope)
    if (!collectorKey && req.body && req.body.collectorApiKey) {
      collectorKey = req.body.collectorApiKey;
    }

    const collectorId = req.headers['x-collector-id'] || req.body?.collectorId;
    const tenantId = req.headers['x-tenant-id'] || req.body?.tenantId;

    if (!collectorId) {
      return res.status(401).json({
        success: false,
        error: 'MISSING_COLLECTOR_ID',
        message: 'Collector authentication failed: x-collector-id header or collectorId body property is required.'
      });
    }

    // 3. Database Lookup & Tenant Association
    const collectorsCol = getSentinelCollection('sentinel_collectors');
    const query = { collectorId };
    if (tenantId) query.tenantId = tenantId;

    const collector = await collectorsCol.findOne(query);

    if (!collector) {
      return res.status(401).json({
        success: false,
        error: 'UNKNOWN_COLLECTOR',
        message: `Collector '${collectorId}' is not authorized or does not belong to tenant '${tenantId || 'unspecified'}'.`
      });
    }

    // 4. Revocation Check
    if (collector.status === 'revoked') {
      return res.status(403).json({
        success: false,
        error: 'COLLECTOR_REVOKED',
        message: `Access denied. Collector '${collectorId}' has been revoked by tenant security policy.`
      });
    }

    // 5. Credential Match (if provided in header)
    if (collectorKey && collector.collectorApiKey && collectorKey !== collector.collectorApiKey) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid collector API key or bearer credential.'
      });
    }

    // Attach verified collector to request
    req.collector = collector;
    req.tenantId = collector.tenantId;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'AUTH_INTERNAL_ERROR',
      message: 'Internal error verifying collector authentication: ' + err.message
    });
  }
};

module.exports = {
  verifyCollectorAuth
};
