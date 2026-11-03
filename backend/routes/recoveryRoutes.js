const express = require('express');
const router = express.Router();
const recoveryController = require('../controllers/recoveryController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', recoveryController.getRecovery);
router.post('/stretching-complete', recoveryController.toggleStretching);

module.exports = router;
