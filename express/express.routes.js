// /express/express.routes.js

const express = require('express');
const router = express.Router();

const controller = require('./express.controller');
const authMiddleware = require('./express.auth.js');

// Base URL: https://api.fondationbackupspirituel.com/api/express

router.post('/create', authMiddleware, controller.createTransfer);
router.post('/verify-otp', authMiddleware, controller.verifyOTP);
router.post('/pay', authMiddleware, controller.markAsPaid);

module.exports = router;
