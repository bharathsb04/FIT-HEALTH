const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Member & Admin Registration
router.post('/register', authController.register);
router.post('/register-admin', authController.registerAdmin);
router.post('/admin/register', authController.registerAdmin); // Alias
router.post('/check-availability', authController.checkAvailability);

// Authentication (Password & OTP)
router.post('/login', authController.login);
router.post('/login-otp', authController.loginWithOTP);
router.post('/logout', authController.logout);

// Universal and Dedicated OTP Endpoints (Email & Mobile SMS)
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);

router.post('/send-email-otp', authController.sendEmailOTP);
router.post('/verify-email-otp', authController.verifyEmailOTP);

router.post('/send-mobile-otp', authController.sendMobileOTP);
router.post('/verify-mobile-otp', authController.verifyMobileOTP);

// Password recovery
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected authenticated profile
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
