const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Important: Parse raw body for webhook signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
