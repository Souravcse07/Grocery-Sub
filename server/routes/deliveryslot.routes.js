const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const deliverySlotController = require('../controllers/deliveryslot.controller');

const router = express.Router();

router.get('/available', verifyToken, deliverySlotController.getAvailableSlots);
router.post('/book', verifyToken, deliverySlotController.bookSlot);
router.delete('/cancel/:id', verifyToken, deliverySlotController.cancelSlot);

module.exports = router;
