/**
 * SentinelOps Phase 2 API Routes
 */

const express = require('express');
const router = express.Router();
const sentinelController = require('../controllers/sentinelController');
const { verifyCollectorAuth } = require('../middleware/sentinelAuthMiddleware');

// Ingestion endpoint (protected with collector auth and TLS checks)
router.post('/ingest', verifyCollectorAuth, sentinelController.ingestTelemetry);

// Privacy Pipeline Live Status & Overview
router.get('/pipeline/status', sentinelController.getPipelineStatus);

// Cryptographic Egress Proofs
router.get('/egress-proofs', sentinelController.getEgressProofs);

// Stage-by-Stage Audit Events
router.get('/audit-events', sentinelController.getAuditEvents);

// Collector Connection & Lifecycle Management
router.get('/collectors/connection', sentinelController.getCollectorConnection);
router.post('/collectors/heartbeat', sentinelController.sendHeartbeat);
router.post('/collectors/rotate', sentinelController.rotateCollectorCredentials);
router.post('/collectors/revoke', sentinelController.revokeCollector);
router.post('/collectors/reactivate', sentinelController.reactivateCollector);

// Privacy Policies & Allow-Lists
router.get('/policies', sentinelController.getPolicies);
router.put('/policies/:policyId', sentinelController.updatePolicy);

// Working Demonstration Simulations (Safe Telemetry, Prohibited Attack, Replay)
router.post('/simulation/run', sentinelController.runSimulation);

module.exports = router;
