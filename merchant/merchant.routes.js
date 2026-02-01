const express = require('express');
const router = express.Router();
const controller = require('./merchant.controller');

router.post('/register', controller.registerMerchant);

module.exports = router;
