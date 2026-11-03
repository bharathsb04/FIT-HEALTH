const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const feeController = require('../controllers/feeController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// General Admin Routes
router.get('/dashboard', adminController.getDashboard);
router.post('/checkin', adminController.checkInMember);
router.put('/members/:id', adminController.updateMember);
router.delete('/members/:id', adminController.deleteMember);
router.put('/members/:id/status', adminController.updateMemberStatus);
router.post('/members', adminController.addMember);
router.put('/fee-structure', adminController.updateFeeStructure);
router.post('/link-gym', adminController.switchLinkedGym);
router.post('/confirm-cash-token', adminController.confirmCashToken);
router.put('/customize-gym', adminController.customizeGymDetails);
router.post('/verify-redemption-code', adminController.verifyRedemptionCode);
router.post('/verify-member-code', adminController.verifyMemberCode);
router.get('/pending-members', adminController.getPendingMembers);
router.get('/collaboration-code', adminController.getAdminCollaborationCode);
router.delete('/users/all-members', authMiddleware, adminOnly, adminController.removeAllLoginUsers);

// Gym Machines & Equipment Maintenance Section
router.get('/equipment', adminController.getEquipment);
router.post('/equipment', authMiddleware, adminOnly, adminController.addEquipment);
router.put('/equipment/:id', authMiddleware, adminOnly, adminController.updateEquipment);
router.delete('/equipment/:id', authMiddleware, adminOnly, adminController.deleteEquipment);
router.post('/equipment/:id/service-log', authMiddleware, adminOnly, adminController.logEquipmentService);

// Maintenance Directory (Technicians, AMC, Vendors, Emergency - Admin Only)
router.get('/directory/export-csv', authMiddleware, adminOnly, adminController.exportDirectoryCsv);
router.get('/directory/:id', authMiddleware, adminOnly, adminController.getDirectoryEntryById);
router.get('/directory', authMiddleware, adminOnly, adminController.getDirectory);
router.post('/directory', authMiddleware, adminOnly, adminController.createDirectoryEntry);
router.put('/directory/:id', authMiddleware, adminOnly, adminController.updateDirectoryEntry);
router.delete('/directory/:id', authMiddleware, adminOnly, adminController.deleteDirectoryEntry);

// Admin-Only Confidential Notes & Sentences System
router.get('/notes/:id', authMiddleware, adminOnly, adminController.getAdminNoteById);
router.get('/notes', authMiddleware, adminOnly, adminController.getAdminNotes);
router.post('/notes', authMiddleware, adminOnly, adminController.createAdminNote);
router.put('/notes/:id', authMiddleware, adminOnly, adminController.updateAdminNote);
router.delete('/notes/:id', authMiddleware, adminOnly, adminController.deleteAdminNote);

// Granular Fee Structure & Desk Payments Management (Admin Only)
router.post('/fees', authMiddleware, adminOnly, feeController.createFeePlan);
router.put('/fees/reorder', authMiddleware, adminOnly, feeController.reorderFeePlans);
router.put('/fees/:id', authMiddleware, adminOnly, feeController.updateFeePlan);
router.delete('/fees/:id', authMiddleware, adminOnly, feeController.deleteFeePlan);
router.put('/gyms/:id/terms', authMiddleware, adminOnly, feeController.updateGymTerms);
router.post('/fees/publish', authMiddleware, adminOnly, feeController.publishFeeStructure);

module.exports = router;


