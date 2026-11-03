const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', vitalsController.getVitals);
router.post('/', vitalsController.logVitals);
router.post('/sync-wearable', vitalsController.syncWearable);

module.exports = router;
