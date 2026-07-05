// src/routes/auth.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

// Public
router.post('/register',    ctrl.register);
router.post('/login',       ctrl.login);
router.post('/verify-otp',  ctrl.verifyOtp);
router.post('/resend-otp',  ctrl.resendOtp);

// Protected
router.get('/me',                  requireAuth, ctrl.getMe);
router.put('/profile',             requireAuth, ctrl.updateProfile);
router.put('/change-password',     requireAuth, ctrl.changePassword);

module.exports = router;
