const express = require('express');
const router = express.Router();
const supplementController = require('../controllers/supplementController');

// Supplement guide is accessible to authenticated users & public
router.get('/', supplementController.getSupplements);

module.exports = router;
