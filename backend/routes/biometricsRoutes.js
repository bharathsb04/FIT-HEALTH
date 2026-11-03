const express = require('express');
const router = express.Router();
const biometricsController = require('../controllers/biometricsController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');
const { createRateLimiter } = require('../middleware/rateLimitMiddleware');

// Rate limiter for companion app sync requests (max 60 per minute per client)
const syncRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Companion sync rate limit reached. Please space out sync batches.'
});

// All biometrics endpoints strictly require a valid JWT token
router.use(authMiddleware);

// --- Member Endpoints ---
router.post('/sync', syncRateLimiter, biometricsController.syncBiometrics);
router.get('/latest', biometricsController.getLatestBiometrics);
router.get('/history', biometricsController.getBiometricsHistory);
router.get('/summary', biometricsController.getBiometricsSummary);
router.get('/consent', biometricsController.getConsent);
router.post('/consent', biometricsController.updateConsent);
router.delete('/', biometricsController.deleteBiometrics);

// --- Admin Endpoint (Requires admin privileges AND explicit member consent) ---
router.get('/member/:memberId/latest', adminOnly, biometricsController.getMemberBiometricsForAdmin);

module.exports = router;

