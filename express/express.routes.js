const express = require('express');
const router = express.Router();

const controller = require('./express.controller');

// Base URL: https://api.fondationbackupspirituel.com/api/express

router.post('/create', controller.createTransfer);
router.post('/verify-otp', controller.verifyOTP);
router.post('/pay', controller.markAsPaid);

module.exports = router;
