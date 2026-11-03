const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Optional auth helper: if bearer token is present in header, authenticate; otherwise proceed with query state
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
};

// Public / Redirect Callback endpoint (authenticates via state or optional Bearer header)
router.get('/callback/:provider', optionalAuth, healthController.handleOAuthCallback);

// All other provider management routes require user JWT authentication
router.use(authMiddleware);

router.get('/providers', healthController.getProviders);
router.post('/connect/:provider', healthController.connectProvider);
router.post('/sync/:provider', healthController.syncProvider);
router.post('/set-primary/:provider', healthController.setPrimaryProvider);
router.delete('/disconnect/:provider', healthController.disconnectProvider);

module.exports = router;
