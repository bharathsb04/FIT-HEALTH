const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');
const feeController = require('../controllers/feeController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', gymController.getGyms);
router.get('/nearby', gymController.getNearby);
router.get('/membership-status', authMiddleware, gymController.getMembershipStatus);
router.get('/redemption-details', authMiddleware, gymController.getRedemptionDetails);
router.get('/redemption-history', authMiddleware, gymController.getRedemptionHistory);
router.post('/redeem-code', authMiddleware, gymController.redeemGymCode);
router.post('/pay-membership', authMiddleware, gymController.payMembership);
router.post('/apply-membership', authMiddleware, gymController.applyMembership);
router.get('/my-applications', authMiddleware, gymController.getMyApplications);
router.get('/members', authMiddleware, gymController.getAllMembers);
router.put('/members/:id', authMiddleware, gymController.updateMemberDetails);
router.get('/:id/fees', feeController.getGymFees);
router.get('/:id/fees/pdf', feeController.getGymFeesPdf);
router.get('/receipt/:id/pdf', feeController.getMemberReceiptPdf);
router.get('/:id', gymController.getGymById);
router.post('/:id/book-pass', authMiddleware, gymController.bookDayPass);

module.exports = router;

