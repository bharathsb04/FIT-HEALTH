const express = require('express');
const router = express.Router();
const hydrationController = require('../controllers/hydrationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', hydrationController.getHydration);
router.post('/', hydrationController.logHydration);

module.exports = router;
